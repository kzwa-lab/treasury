import { Decimal } from "../decimal.js";
import type { Contract } from "../model/contract.js";
import type { Cashflow } from "../model/cashflow.js";
import type { Leg } from "../model/leg.js";
import type { IsoDate } from "../model/types.js";
import { addMonths, dayCountFraction, shiftBusinessDays } from "./conventions.js";
import { createHash } from "node:crypto";

export interface MarketSnapshotView {
  readonly forwardRate: (indexId: string, asOf: IsoDate) => Decimal;
  readonly storedFixing: (indexId: string, date: IsoDate) => Decimal | undefined;
}

export interface ProjectionRequest {
  readonly contract: Contract;
  readonly asOfDate: IsoDate;
  readonly basis: "contractual" | "behavioural";
  readonly assumptionSetId: string;
  readonly horizonDate: IsoDate;
  readonly marketSnapshotVersion: string;
  readonly referenceDataVersion: string;
  readonly market: MarketSnapshotView;
}

export function projection(request: ProjectionRequest): Cashflow[] {
  const flows: Cashflow[] = [];

  for (const leg of request.contract.legs) {
    for (const flow of projectLeg(request, leg)) {
      if (flow.accrualEnd <= request.asOfDate) {
        continue;
      }
      if (flow.paymentDate <= request.asOfDate || flow.paymentDate > request.horizonDate) {
        continue;
      }
      flows.push(flow);
    }
  }

  flows.sort(compareFlows);
  return flows;
}

export function projectionDigest(flows: readonly Cashflow[]): string {
  const payload = flows.map((f) => ({
    contractId: f.contractId,
    legId: f.legId,
    paymentDate: f.paymentDate,
    type: f.type,
    basis: f.basis,
    certainty: f.certainty,
    amount: f.amount.value.toString(),
    currency: f.amount.currency,
    periodRef: f.periodRef ?? null,
  }));
  return createHash("sha256").update(JSON.stringify(sortKeys(payload))).digest("hex");
}

function compareFlows(a: Cashflow, b: Cashflow): number {
  const byDate = a.paymentDate.localeCompare(b.paymentDate);
  if (byDate !== 0) {
    return byDate;
  }
  const byLeg = a.legId.localeCompare(b.legId);
  if (byLeg !== 0) {
    return byLeg;
  }
  const byType = a.type.localeCompare(b.type);
  if (byType !== 0) {
    return byType;
  }
  return a.accrualStart.localeCompare(b.accrualStart);
}

function projectLeg(request: ProjectionRequest, leg: Leg): Cashflow[] {
  switch (leg.rate.kind) {
    case "FIXED":
    case "FLOATING":
      return projectRateLeg(request, leg);
    case "RETURN":
      throw new Error(`Rate treatment RETURN not yet implemented for leg ${leg.id}`);
    case "QUANTITY":
      throw new Error(`Rate treatment QUANTITY not yet implemented for leg ${leg.id}`);
    case "EXTERNAL":
      throw new Error(
        `Rate treatment EXTERNAL requires a supplied projection (${leg.rate.externalProjectionId ?? "none"}) for leg ${leg.id}`,
      );
  }
}

function projectRateLeg(request: ProjectionRequest, leg: Leg): Cashflow[] {
  const flows: Cashflow[] = [];
  const contract = request.contract;
  const startDate = contract.effectiveDate ?? request.asOfDate;
  const maturityDate = contract.maturityDate ?? startDate;
  const frequency = leg.conventions.frequency;

  const periodEnds = frequency === "MATURITY" ? [maturityDate] : couponDates(startDate, maturityDate, frequency);

  let accStart = startDate;
  for (const accEnd of periodEnds) {
    flows.push(buildCoupon(leg, contract, request, accStart, accEnd));
    accStart = accEnd;
  }

  const principal = embeddedPrincipalFlow(leg, contract, request);
  if (principal !== null) {
    flows.push(principal);
  }

  return flows;
}

function couponDates(start: string, maturity: string, frequency: "OVERNIGHT" | "1M" | "3M" | "6M" | "12M"): string[] {
  const months = frequencyToMonths(frequency);
  const result: string[] = [];
  let cursor = start;
  while (true) {
    const next = addMonths(cursor, months);
    if (next < maturity) {
      result.push(next);
      cursor = next;
    } else {
      if (cursor < maturity) {
        result.push(maturity);
      }
      break;
    }
  }
  return result;
}

function frequencyToMonths(frequency: "OVERNIGHT" | "1M" | "3M" | "6M" | "12M"): number {
  switch (frequency) {
    case "OVERNIGHT":
      return 0;
    case "1M":
      return 1;
    case "3M":
      return 3;
    case "6M":
      return 6;
    case "12M":
      return 12;
  }
}

function buildCoupon(
  leg: Leg,
  contract: Contract,
  request: ProjectionRequest,
  accStart: string,
  accEnd: string,
): Cashflow {
  const rate = resolveRate(leg, request, accStart);
  const notional = leg.notional.value;
  const fraction = dayCountFraction(accStart, accEnd, leg.conventions.dayCount);
  const interest = notional.mul(rate).mul(fraction).roundScale(2);
  return {
    contractId: contract.id,
    legId: leg.id,
    periodRef: `${accStart}_${accEnd}`,
    paymentDate: paymentDate(accEnd, leg.conventions.businessDay),
    accrualStart: accStart,
    accrualEnd: accEnd,
    amount: { value: signed(leg, interest), currency: leg.currency },
    type: "INTEREST",
    basis: request.basis,
    certainty: "certain",
    rateTreatment: leg.rate.kind,
  };
}

function embeddedPrincipalFlow(leg: Leg, contract: Contract, request: ProjectionRequest): Cashflow | null {
  const maturityDate = contract.maturityDate;
  if (maturityDate === undefined) {
    return null;
  }
  if (leg.amortization.kind !== "NONE") {
    return null;
  }
  return {
    contractId: contract.id,
    legId: leg.id,
    paymentDate: paymentDate(maturityDate, leg.conventions.businessDay),
    accrualStart: maturityDate,
    accrualEnd: maturityDate,
    amount: { value: signed(leg, leg.notional.value), currency: leg.currency },
    type: "PRINCIPAL",
    basis: request.basis,
    certainty: "certain",
  };
}

function resolveRate(leg: Leg, request: ProjectionRequest, resetDate: IsoDate): Decimal {
  const treatment = leg.rate;
  if (treatment.kind === "FIXED") {
    return Decimal.fromString(treatment.fixedRate ?? "0");
  }
  const indexId = treatment.indexId ?? "MISSING_INDEX";
  const spread = Decimal.fromString(treatment.spread ?? "0");
  const multiplier = Decimal.fromString(treatment.multiplier ?? "1");
  const stored = request.market.storedFixing(indexId, resetDate);
  const indexRate = stored ?? request.market.forwardRate(indexId, resetDate);
  return indexRate.mul(multiplier).add(spread);
}

function signed(leg: Leg, amount: Decimal): Decimal {
  if (leg.direction === "PAY" || leg.direction === "SHORT") {
    return amount.neg();
  }
  return amount;
}

function paymentDate(date: string, convention: Leg["conventions"]["businessDay"]): string {
  return shiftBusinessDays(new Date(date + "T00:00:00Z"), convention).toISOString().slice(0, 10);
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value !== null && typeof value === "object") {
    const record: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      record[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return record;
  }
  return value;
}