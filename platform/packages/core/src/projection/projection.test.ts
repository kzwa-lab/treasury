import { describe, expect, it } from "vitest";
import { Decimal } from "../decimal.js";
import { projection, projectionDigest } from "../projection/engine.js";
import type { ProjectionRequest, MarketSnapshotView } from "../projection/engine.js";
import { dayCountFraction } from "../projection/conventions.js";
import type { Contract } from "../model/contract.js";

function resolutionAsOf(accrualStart: string): Decimal {
  return accrualStart < "2025-01-01" ? Decimal.fromString("0.03") : Decimal.fromString("0.04");
}

function termDeposit(maturity: string): Contract {
  return {
    id: "C-100",
    externalIds: {},
    productCode: "TERM_DEPOSIT",
    effectiveDate: "2024-01-01",
    maturityDate: maturity,
    counterparty: "CP-1",
    legs: [
      {
        id: "L-1",
        role: "cash",
        currency: "USD",
        direction: "RECEIVE",
        notional: { value: Decimal.fromString("1000000"), currency: "USD" },
        rate: { kind: "FIXED", fixedRate: "0.05" },
        conventions: { dayCount: "ACT/365", businessDay: "FOLLOWING", frequency: "MATURITY", calendarId: "WEEKDAYS" },
        amortization: { kind: "NONE" },
      },
    ],
  };
}

function fixedRateRequest(contract: Contract, asOf: string, horizon: string): ProjectionRequest {
  const market: MarketSnapshotView = {
    forwardRate: () => Decimal.fromString("0.04"),
    storedFixing: () => undefined,
  };
  return {
    contract,
    asOfDate: asOf,
    basis: "contractual",
    assumptionSetId: "BASE",
    horizonDate: horizon,
    marketSnapshotVersion: "SNAP-1",
    referenceDataVersion: "REF-1",
    market,
  };
}

describe("projection engine", () => {
  it("returns nothing for a matured contract", () => {
    const request = fixedRateRequest(termDeposit("2024-06-01"), "2024-07-01", "2025-01-01");
    expect(projection(request)).toEqual([]);
  });

  it("projects a bullet fixed interest cashflow plus principal at maturity", () => {
    const request = fixedRateRequest(termDeposit("2025-01-01"), "2024-06-01", "2026-01-01");
    const flows = projection(request);
    expect(flows).toHaveLength(2);
    const interest = flows.find((f) => f.type === "INTEREST");
    expect(interest).toBeDefined();
    // 5% on 1,000,000 for 366 days (2024 is a leap year) on ACT/365.
    expect(interest!.amount.value.toString()).toBe("50136.99");
    expect(interest!.paymentDate).toBe("2025-01-01");
    const principal = flows.find((f) => f.type === "PRINCIPAL");
    expect(principal?.amount.value.toString()).toBe("1000000");
    expect(principal?.paymentDate).toBe("2025-01-01");
  });

  it("is deterministic across calls and digsest stable", () => {
    const request = fixedRateRequest(termDeposit("2025-06-01"), "2024-01-01", "2026-01-01");
    const a = projection(request);
    const b = projection(request);
    expect(a).toEqual(b);
    expect(projectionDigest(a)).toBe(projectionDigest(b));
  });

it("resolves floating coupons from the forward curve", () => {
    const contract: Contract = {
      id: "C-002",
      externalIds: {},
      productCode: "IRS",
      effectiveDate: "2024-01-01",
      maturityDate: "2026-01-01",
      legs: [
        {
          id: "L-1",
          role: "floating",
          currency: "USD",
          direction: "RECEIVE",
          notional: { value: Decimal.fromString("1000"), currency: "USD" },
          rate: { kind: "FLOATING", indexId: "SOFR", spread: "0.001", resetFrequency: "3M" },
          conventions: { dayCount: "ACT/360", frequency: "3M", calendarId: "WEEKDAYS", businessDay: "FOLLOWING" },
          amortization: { kind: "NONE" },
        },
      ],
    };
    const request: ProjectionRequest = {
      contract,
      asOfDate: "2024-01-01",
      basis: "contractual",
      assumptionSetId: "BASE",
      horizonDate: "2026-02-01",
      marketSnapshotVersion: "SNAP-1",
      referenceDataVersion: "REF-1",
      market: {
        forwardRate: (_index, asOf) => (asOf < "2025-01-01" ? Decimal.fromString("0.03") : Decimal.fromString("0.04")),
        storedFixing: () => undefined,
      },
    };

    const coupons = projection(request).filter((f) => f.type === "INTEREST");
    expect(coupons).toHaveLength(8);

    for (const coupon of coupons) {
      const indexRate = resolutionAsOf(coupon.accrualStart);
      const spread = Decimal.fromString("0.001");
      const rate = indexRate.add(spread);
      const expected = Decimal.fromString("1000")
        .mul(rate)
        .mul(dayCountFraction(coupon.accrualStart, coupon.accrualEnd, "ACT/360"))
        .roundScale(2);
      expect(coupon.amount.value.eq(expected)).toBe(true);
    }

    // Later coupons reflect the higher forward index (0.04 vs 0.03).
    const early = coupons.filter((f) => f.accrualStart < "2025-01-01");
    const late = coupons.filter((f) => f.accrualStart >= "2025-01-01");
    expect(early.every((f) => f.amount.value.lt(Decimal.fromString("10")))).toBe(true);
    expect(late.every((f) => f.amount.value.gt(Decimal.fromString("10")))).toBe(true);
  });

  it("emits only within the horizon and after as-of", () => {
    const contract = termDeposit("2025-01-01");
    const flows = projection(fixedRateRequest(contract, "2024-06-01", "2024-12-01"));
    for (const f of flows) {
      expect(f.paymentDate > "2024-06-01").toBe(true);
      expect(f.paymentDate <= "2024-12-01").toBe(true);
    }
    expect(flows.find((f) => f.type === "PRINCIPAL")).toBeUndefined();
  });

  it("throws for unsupported rate treatments", () => {
    const contract: Contract = {
      id: "C-003",
      externalIds: {},
      productCode: "EQUITY_SWAP",
      effectiveDate: "2024-01-01",
      maturityDate: "2025-01-01",
      legs: [
        {
          id: "L-1",
          role: "equity",
          currency: "USD",
          direction: "RECEIVE",
          notional: { value: Decimal.fromString("1000"), currency: "USD" },
          rate: { kind: "RETURN" },
          conventions: { dayCount: "ACT/360", frequency: "3M", calendarId: "WEEKDAYS", businessDay: "FOLLOWING" },
          amortization: { kind: "NONE" },
        },
      ],
    };
    expect(() => projection(fixedRateRequest(contract, "2024-01-01", "2025-06-01"))).toThrow(/RETURN/);
  });
});