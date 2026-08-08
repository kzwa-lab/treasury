import type { Amount, Currency, FixingState, IsoDate } from "./types.js";

export type DayCountBasis = "30/360" | "ACT/365" | "ACT/360";

export type BusinessDayConvention = "FOLLOWING" | "PRECEDING" | "MODIFIED_FOLLOWING" | "NONE";

export type LegDirection = "RECEIVE" | "PAY" | "LONG" | "SHORT";

export type NotionalKind = "BULLET" | "LINEAR" | "ANNUITY" | "CUSTOM_SCHEDULE" | "INDEX_LINKED";

export type CompoundBasis = "NONE" | "COMPOUNDED_IN_ARREARS" | "AVERAGED";

export type ResetFrequency = "OVERNIGHT" | "1M" | "3M" | "6M" | "12M";

export type PaymentFrequency = ResetFrequency | "MATURITY";

export type RateTreatmentFrequency = PaymentFrequency;

export interface RateTreatment {
  kind: "FIXED" | "FLOATING" | "RETURN" | "QUANTITY" | "EXTERNAL";
  fixedRate?: string;
  indexId?: string;
  spread?: string;
  multiplier?: string;
  resetFrequency?: ResetFrequency;
  compounding?: CompoundBasis;
  fixingState?: FixingState;
  referenceQuantity?: string;
  externalProjectionId?: string;
}

export interface AmortizationSchedule {
  kind: "NONE" | "LINEAR";
  frequency?: ResetFrequency;
}

export interface LegConventions {
  dayCount: DayCountBasis;
  businessDay: BusinessDayConvention;
  frequency: RateTreatmentFrequency;
  calendarId: string;
  paymentLag?: "0D" | "1D" | "2D";
  stubHandling?: "SHORT_FIRST" | "SHORT_LAST" | "LONG_FIRST" | "LONG_LAST";
}

export interface Leg {
  readonly id: string;
  readonly role: string;
  readonly currency: Currency;
  readonly direction: LegDirection;
  readonly notional: Amount;
  readonly rate: RateTreatment;
  readonly conventions: LegConventions;
  readonly amortization: AmortizationSchedule;
  readonly principalExchange?: boolean;
  readonly nextResetDate?: IsoDate;
}