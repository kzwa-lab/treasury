import type { IsoDate } from "../model/types.js";
import type { Classification, ClassificationDimension, InputVector } from "./dimensions.js";

export interface RuleVersion {
  readonly ruleId: string;
  readonly version: number;
  readonly dimension: ClassificationDimension;
  readonly precedence: number;
  readonly declaredInputs: readonly string[];
  readonly effectiveFrom: IsoDate;
  readonly effectiveTo?: IsoDate;
  readonly active: boolean;
  readonly author: string;
  readonly approvedBy: string;
  readonly match: (input: InputVector) => boolean;
  readonly output: (input: InputVector) => string;
}

export interface ClassificationOverride {
  readonly contractId: string;
  readonly dimension: ClassificationDimension;
  readonly value: string;
  readonly reasonCode: string;
  readonly authorizedBy: string;
  readonly authorizedAt: IsoDate;
  readonly expiresOn: IsoDate;
  readonly fourEyesSignoff: string;
}

export interface RuleEvaluation {
  readonly dimension: ClassificationDimension;
  readonly value: string;
  readonly ruleId?: string;
  readonly ruleVersion?: number;
  readonly overridden?: boolean;
}

export interface ClassificationResult {
  readonly classification: Classification;
  readonly explanations: readonly RuleEvaluation[];
  readonly unclassified: readonly ClassificationDimension[];
}