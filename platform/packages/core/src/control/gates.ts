export type GateType =
  | "ARRIVAL"
  | "VALIDATION"
  | "RECONCILIATION"
  | "APPROVAL"
  | "COMPLETION"
  | "PLAUSIBILITY"
  | "MODEL_VALIDITY";

export type GateOutcome = "PASS" | "WARN" | "FAIL";

export type GateVerdict = "PASSED" | "WARNED" | "FAILED";

export interface GateCheck {
  readonly gate: GateType;
  readonly stageId: string;
  readonly outcome: GateOutcome;
  readonly message?: string;
}

export interface GateOverride {
  readonly stageId: string;
  readonly gate: GateType;
  readonly reasonCode: string;
  readonly justification: string;
  readonly approvedBy: string[];
  readonly approvedAt: string;
}

export interface EvaluatedGate {
  readonly check: GateCheck;
  readonly verdict: GateVerdict;
  readonly overridden: boolean;
}

export interface GateRun {
  readonly gates: EvaluatedGate[];
  readonly blocked: boolean;
  readonly provisional: boolean;
  readonly provisionalReasons: string[];
}

export interface OrchestrationOptions {
  overrides?: readonly GateOverride[];
}

export function evaluateGateRun(
  checks: readonly GateCheck[],
  options: OrchestrationOptions = {},
): GateRun {
  const overrides = options.overrides ?? [];
  const gates: EvaluatedGate[] = [];
  const provisionalReasons: string[] = [];

  for (const check of checks) {
    const override = overrides.find((o) => o.stageId === check.stageId && o.gate === check.gate);

    if (check.outcome === "FAIL") {
      const overridden = override !== undefined;
      gates.push({ check, verdict: overridden ? "WARNED" : "FAILED", overridden });
      if (!overridden) {
        provisionalReasons.push(`${check.stageId}/${check.gate}: FAIL`);
      } else {
        provisionalReasons.push(`${check.stageId}/${check.gate}: FAIL overridden by ${override.approvedBy.join("+")}`);
      }
      continue;
    }

    if (check.outcome === "WARN") {
      const overridden = override !== undefined;
      gates.push({ check, verdict: "WARNED", overridden });
      provisionalReasons.push(`${check.stageId}/${check.gate}: WARN`);
      continue;
    }

    gates.push({ check, verdict: "PASSED", overridden: false });
  }

  const blocked = gates.some((g) => g.verdict === "FAILED");
  const provisional = provisionalReasons.length > 0;

  const unique = [...new Set(provisionalReasons)];
  return { gates, blocked, provisional, provisionalReasons: unique };
}

export function validateOverride(override: GateOverride): void {
  const labels = override.approvedBy;
  const distinct = new Set(labels);
  if (distinct.size < 2) {
    throw new Error(`Override on ${override.stageId}/${override.gate} needs four-eyes (two distinct approvers)`);
  }
  if (override.reasonCode.trim() === "") {
    throw new Error(`Override on ${override.stageId}/${override.gate} requires a reason code`);
  }
  if (override.justification.trim() === "") {
    throw new Error(`Override on ${override.stageId}/${override.gate} requires a justification`);
  }
}

export const provisionalLabel = (provisional: boolean): string => (provisional ? "PROVISIONAL" : "FINAL");

export function artifactName(prefix: string, dataVersion: string, provisional: boolean): string {
  return `${prefix}_${dataVersion}_${provisionalLabel(provisional).toLowerCase()}`;
}