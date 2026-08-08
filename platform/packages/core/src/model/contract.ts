import type { IsoDate } from "./types.js";
import type { Leg } from "./leg.js";
import type { Classification } from "../classification/dimensions.js";

export type OptionStyle = "EUROPEAN" | "AMERICAN" | "BERMUDAN";

export type ExerciseParty = "HOLDER" | "ISSUER" | "AUTOMATIC" | "TRIGGER";

export interface Optionality {
  readonly style: OptionStyle;
  readonly exerciseDates?: IsoDate[];
  readonly strike?: string;
  readonly trigger?: string;
  readonly triggerReference?: string;
  readonly barrierLevel?: string;
  readonly barrierDirection?: "UP" | "DOWN";
  readonly barrierKnock?: "IN" | "OUT";
  readonly exerciseParty: ExerciseParty;
  readonly settlementType: "PHYSICAL" | "CASH";
  readonly assumptionReference?: string;
}

export type ContractLinkType =
  | "PACKAGE"
  | "HEDGE_RELATIONSHIP"
  | "INTERNAL_PAIR"
  | "NOVATION_CHAIN"
  | "RESTRUCTURE_CHAIN"
  | "PARTICIPATION"
  | "DERIVED_FROM";

export interface ContractLink {
  readonly type: ContractLinkType;
  readonly otherId: string;
}

export interface Contract {
  readonly id: string;
  readonly externalIds: {
    readonly isin?: string;
    readonly uti?: string;
    readonly coreBankingAccount?: string;
  };
  readonly productCode: string;
  readonly tradeDate?: string;
  readonly effectiveDate?: string;
  readonly maturityDate?: string;
  readonly legalEntity?: string;
  readonly book?: string;
  readonly portfolio?: string;
  readonly trader?: string;
  readonly counterparty?: string;
  readonly issuer?: string;
  readonly guarantor?: string;
  readonly legs: Leg[];
  readonly links?: ContractLink[];
  readonly optionality?: Optionality;
  readonly classification?: Classification;
  readonly status?: string;
  readonly internal?: boolean;
}