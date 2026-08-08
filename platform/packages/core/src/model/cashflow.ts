import type { Amount, CashflowBasis, CashflowCertainty, CashflowType } from "./types.js";

export interface Cashflow {
  readonly contractId: string;
  readonly legId: string;
  readonly periodRef?: string;
  readonly paymentDate: string;
  readonly accrualStart: string;
  readonly accrualEnd: string;
  readonly amount: Amount;
  readonly type: CashflowType;
  readonly basis: CashflowBasis;
  readonly certainty: CashflowCertainty;
  readonly rateTreatment?: string;
  readonly assumptionReference?: string;
  readonly isDiscretionary?: boolean;
}