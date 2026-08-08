import type { Decimal } from "../decimal.js";

export type IsoDate = string;

export type Currency = string;

export interface Amount {
  value: Decimal;
  currency: Currency;
}

export type ContractStatus =
  | "BOOKED"
  | "AMENDED"
  | "DRAWN"
  | "REPAID"
  | "PARTIAL_PREPAYMENT"
  | "ROLLED"
  | "EXERCISED"
  | "CALLED"
  | "NOVATED"
  | "RESTRUCTURED"
  | "TERMINATED"
  | "MATURED"
  | "DEFAULTED"
  | "CANCELLED"
  | "RECLASSIFIED"
  | "COLLATERAL_SUBSTITUTED";

export type CashflowType = "PRINCIPAL" | "INTEREST" | "FEE" | "PREMIUM" | "EXCHANGE" | "DRAWDOWN" | "REPAYMENT";

export type CashflowBasis = "contractual" | "behavioural";

export type CashflowCertainty = "certain" | "contingent";

export type RateTreatmentKind = "FIXED" | "FLOATING" | "RETURN" | "QUANTITY" | "EXTERNAL";

export type FixingState = "STORED" | "MARKET_QUERY" | "PARTIAL";

export interface RateTreatmentDetails {
  kind: RateTreatmentKind;
  fixedRate?: Decimal;
  indexId?: string;
  spread?: Decimal;
  multiplier?: Decimal;
  resetFrequency?: "OVERNIGHT" | "1M" | "3M" | "6M" | "12M";
  compounding?: "NONE" | "COMPOUNDED_IN_ARREARS" | "AVERAGED";
  fixingState?: FixingState;
  referenceQuantity?: string;
  externalProjectionId?: string;
}