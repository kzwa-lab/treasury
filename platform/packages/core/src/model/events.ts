import type { IsoDate } from "./types.js";

export type ContractEventType =
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

export type BalanceEventType = "POSTED" | "AMENDED" | "ADJUSTED" | "CANCELLED";

export interface ContractEvent {
  readonly kind: "CONTRACT";
  readonly type: ContractEventType;
  readonly contractId: string;
  readonly effectiveDate: IsoDate;
  readonly knownDate: IsoDate;
  readonly sequence: number;
  readonly payload: Record<string, unknown>;
}

export interface BalanceEvent {
  readonly kind: "BALANCE";
  readonly type: BalanceEventType;
  readonly balanceId: string;
  readonly effectiveDate: IsoDate;
  readonly knownDate: IsoDate;
  readonly sequence: number;
  readonly deltaAmount?: string;
  readonly payload: Record<string, unknown>;
}

export type DomainEvent = ContractEvent | BalanceEvent;