import type { Amount, Currency, IsoDate } from "./types.js";
import type { Classification } from "../classification/dimensions.js";

export type BalanceSource = "EXTERNAL" | "DERIVED";

export interface Balance {
  readonly id: string;
  readonly accountRef?: string;
  readonly currency: Currency;
  readonly carryingAmount: Amount;
  readonly source: BalanceSource;
  readonly eodDate: IsoDate;
  readonly taxonomyLine?: string;
  readonly classification?: Classification;
  readonly encumbered?: boolean;
  readonly derivedFrom?: string;
}