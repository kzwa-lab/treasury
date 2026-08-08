import type { Decimal } from "../decimal.js";

export type RegulatoryBookIntent = "TRADING" | "BANKING";

/** D1 §3.1 — legal entity and organisational structure, with book assignment. */
export interface LegalEntity {
  readonly legalEntityId: string;
  readonly name: string;
  readonly jurisdiction: string;
  readonly parentEntityId?: string;
}

/** A book/portfolio under an entity, with regulatory book intent (D2 dim 9). */
export interface Book {
  readonly bookId: string;
  readonly legalEntityId: string;
  readonly name: string;
  readonly regulatoryIntent: RegulatoryBookIntent;
  readonly portfolioIds: readonly string[];
}

export interface RatingHistoryEntry {
  readonly agency: string;
  readonly rating: string;
  readonly asOf: string;
}

/** D1 §3.2 — the three trees that must stay separate (never one "parent" field). */
export interface CounterpartyMaster extends LegalEntity {
  readonly lei?: string;
  readonly legalEntityType: string;
  readonly industrySector?: string;
  readonly ratings: readonly RatingHistoryEntry[];
  readonly counterpartyType: string;
  readonly economicGroupId?: string;
  readonly depositInsuranceStatus?: "INSURED" | "UNINSURED" | "UNKNOWN";
}

/** Economic group tree (parent + subsidiaries, for concentration risk). */
export interface EconomicGroup {
  readonly groupId: string;
  readonly name: string;
  readonly memberEntityIds: readonly string[];
}

/** Connected clients per the regulatory definition (large exposures, D13). */
export interface ConnectedClient {
  readonly linkedEntityIds: readonly string[];
  readonly basis: string;
}

/** D1 §3.4 — calendars and conventions. */
export interface CalendarDef {
  readonly calendarId: string;
  readonly holidays: readonly string[];
  readonly businessDayConvention: "FOLLOWING" | "PRECEDING" | "MODIFIED_FOLLOWING" | "NONE";
  readonly settlementCycleDays: number;
}

export type FallbackId = string;

/** D1 §3.5 — a benchmark/index DEFINITION (values live in D3). */
export interface IndexDefinition {
  readonly indexId: string;
  readonly tenorId: string;
  readonly source: string;
  readonly publicationLagDays: number;
  readonly dayCount: string;
  readonly compounding?: "NONE" | "COMPOUNDED_IN_ARREARS" | "AVERAGED";
  readonly observationShiftDays: number;
  readonly fallbackWaterfall: readonly FallbackId[];
}

export interface FallbackDefinition {
  readonly fallbackId: string;
  readonly indexId: string;
  readonly adjustmentSpread?: Decimal;
  readonly termDayCount?: string;
  readonly notes?: string;
}

/** D1 §3.6 — currency restrictions. */
export interface CurrencyDef {
  readonly isoCode: string;
  readonly precision: number;
  readonly roundingRule: "HALF_UP" | "HALF_EVEN" | "UP";
  readonly restriction: "CONVERTIBLE" | "NON_DELIVERABLE" | "CAPITAL_CONTROLLED" | "PEGGED";
}

/** D1 §3.7 — GL chart + mapping incl. Part 2 routing rules. */
export interface GlLine {
  readonly accountId: string;
  readonly description: string;
  readonly part2Line?: string;
}

export interface ProductDefinition {
  readonly productCode: string;
  readonly family: string;
  readonly glAccountId: string;
  readonly routingRule?: string;
  readonly defaultClassification?: string;
  readonly approved: boolean;
  readonly structuredTier?: "STD" | "STRUCTURED";
}