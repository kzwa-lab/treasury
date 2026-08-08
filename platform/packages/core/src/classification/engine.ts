import type { IsoDate } from "../model/types.js";
import {
  DIMENSIONS,
  EMPTY_CLASSIFICATION,
  type Classification,
  type ClassificationDimension,
  type InputVector,
} from "./dimensions.js";
import type { ClassificationOverride, ClassificationResult, RuleEvaluation, RuleVersion } from "./rules.js";

export class RuleConflictError extends Error {
  readonly dimension: ClassificationDimension;
  readonly ruleIds: string[];

  constructor(dimension: ClassificationDimension, ruleIds: string[]) {
    super(
      `Conflicting rules at equal precedence blocked activation for dimension '${dimension}': ${ruleIds.join(", ")}`,
    );
    this.name = "RuleConflictError";
    this.dimension = dimension;
    this.ruleIds = ruleIds;
  }
}

export class MissingInputError extends Error {
  readonly ruleId: string;
  readonly inputKey: string;

  constructor(ruleId: string, inputKey: string) {
    super(`Rule '${ruleId}' declared input '${inputKey}' outside the declared input vector`);
    this.name = "MissingInputError";
    this.ruleId = ruleId;
    this.inputKey = inputKey;
  }
}

function rulesEffectiveOn(rules: readonly RuleVersion[], asOfDate: IsoDate): RuleVersion[] {
  return rules.filter((r) => {
    if (!r.active) {
      return false;
    }
    if (asOfDate < r.effectiveFrom) {
      return false;
    }
    if (r.effectiveTo !== undefined && asOfDate > r.effectiveTo) {
      return false;
    }
    return true;
  });
}

function assertDeclaredInputsPresent(rule: RuleVersion, input: InputVector): void {
  if (rule.declaredInputs.length === 0) {
    return;
  }
  for (const key of rule.declaredInputs) {
    if (!(key in input)) {
      throw new MissingInputError(rule.ruleId, key);
    }
  }
}

export class ClassificationEngine {
  private readonly rules: readonly RuleVersion[];
  private readonly overrides: readonly ClassificationOverride[];
  private readonly validateInput: boolean;

  constructor(options: {
    rules: readonly RuleVersion[];
    overrides?: readonly ClassificationOverride[];
    validateInput?: boolean;
  }) {
    this.rules = [...options.rules];
    this.overrides = options.overrides ? [...options.overrides] : [];
    this.validateInput = options.validateInput ?? true;
  }

  classify(input: InputVector, asOfDate: IsoDate, contractId?: string): ClassificationResult {
    const active = rulesEffectiveOn(this.rules, asOfDate);
    const classification: Record<ClassificationDimension, string> = { ...EMPTY_CLASSIFICATION };
    const explanations: RuleEvaluation[] = [];
    const unclassified: ClassificationDimension[] = [];

    for (const dimension of DIMENSIONS) {
      const candidates = active
        .filter((r) => r.dimension === dimension)
        .sort((a, b) => b.precedence - a.precedence);

      const matching: RuleVersion[] = [];
      for (const rule of candidates) {
        if (this.validateInput) {
          assertDeclaredInputsPresent(rule, input);
        }
        if (rule.match(input)) {
          matching.push(rule);
        }
      }

      if (matching.length === 0) {
        unclassified.push(dimension);
        continue;
      }

      const top = matching[0]!;
      const tied = matching.filter((r) => r.precedence === top.precedence);
      if (tied.length > 1) {
        throw new RuleConflictError(dimension, tied.map((r) => r.ruleId));
      }

      const value = top.output(input);

      if (contractId !== undefined) {
        const override = this.overrides.find(
          (o) =>
            o.contractId === contractId &&
            o.dimension === dimension &&
            asOfDate >= o.authorizedAt &&
            asOfDate <= o.expiresOn,
        );
        if (override !== undefined) {
          classification[dimension] = override.value;
          explanations.push({
            dimension,
            value: override.value,
            ruleId: top.ruleId,
            ruleVersion: top.version,
            overridden: true,
          });
          continue;
        }
      }

      classification[dimension] = value;
      explanations.push({ dimension, value, ruleId: top.ruleId, ruleVersion: top.version });
    }

    return {
      classification: classification as Classification,
      explanations,
      unclassified,
    };
  }
}