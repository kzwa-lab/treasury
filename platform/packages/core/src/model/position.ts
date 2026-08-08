import type { Amount } from "./types.js";

export interface PositionSlice {
  readonly dimensions: Record<string, string>;
  readonly contracts: number;
  readonly balances: number;
  readonly carryingAmount: Amount;
  readonly notional: Amount;
  readonly fairValue?: Amount;
}

export interface Position {
  readonly asOfDate: string;
  readonly basis: string;
  readonly slices: PositionSlice[];
  readonly totalContracts: number;
  readonly totalBalances: number;
}