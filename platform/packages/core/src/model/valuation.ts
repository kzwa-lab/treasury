import type { Amount } from "./types.js";

export interface Valuation {
  readonly id: string;
  readonly contractId: string;
  readonly valuationDate: string;
  readonly marketSnapshotVersion: string;
  readonly referenceDataVersion: string;
  readonly value: Amount;
  readonly sensitivities: Record<string, string>;
  readonly exposureByBucket: Record<string, string>;
  readonly modelIds: string[];
  readonly provenance: string[];
}