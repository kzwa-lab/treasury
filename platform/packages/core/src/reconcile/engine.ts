import type { Amount } from "../model/types.js";
import { Decimal } from "../decimal.js";
import type { EncumbranceRegister } from "../register/encumbrance.js";
import { BreakRegister, type BreakClassification, type BreakDirection } from "./break.js";

/** One position the platform believes it holds, keyed for matching. */
export interface PlatformPosition {
  readonly reference: string;
  readonly assetContractId: string;
  readonly amount: Amount;
  readonly account: string;
}

/** One line of an external (custodian / nostro / tri-party) statement. */
export interface ExternalRecord {
  readonly reference: string;
  readonly balance: Amount;
  readonly account: string;
}

/** A difference produced by matching platform positions to external records. */
export interface MatchDifference {
  readonly platform: PlatformPosition | undefined;
  readonly external: ExternalRecord | undefined;
  readonly magnitude: Amount;
  readonly direction: BreakDirection;
  readonly expected: boolean;
  readonly classification: BreakClassification;
}

/**
 * Reconciliation 2a — population, three-way, as D16 §5.4 requires.
 *
 * Platform positions are reconciled against custodian holdings **plus** the
 * encumbrance register, never like-for-like: a security repo'd out is still a
 * platform Position (encumbered), while the custodian delivered it away. The
 * difference between `holding` and `platform position +/- encumbrance` is the
 * *expected* leg that must never raise a break.
 */
export class PositionReconciliation {
  private readonly register: BreakRegister;
  private readonly encumbrances: EncumbranceRegister;

  constructor(register: BreakRegister, encumbrances: EncumbranceRegister) {
    this.register = register;
    this.encumbrances = encumbrances;
  }

  /**
   * Match platform positions against an external record, producing
   * differences. Only differences where the platform position, corrected for
   * active encumbrances, disagrees with the external record raise breaks;
   * expected repo/loan differences are reported but never escalated.
   */
  async match(
    platform: readonly PlatformPosition[],
    external: readonly ExternalRecord[],
    asOf: string,
    knownAsOf: string,
  ): Promise<MatchDifference[]> {
    const byReference = new Map(external.map((e) => [e.reference, e] as const));
    const differences: MatchDifference[] = [];

    for (const pos of platform) {
      const ext = byReference.get(pos.reference);
      const encumbered = await this.encumbrances.activeAsOf(asOf, knownAsOf);
      const active = encumbered
        .filter((e) => e.encumbrance.assetContractId === pos.assetContractId)
        .reduce((sum, e) => sum.add(e.encumbrance.amount?.value ?? Decimal.zero()), Decimal.zero());

      const holding = pos.amount.value.sub(active);

      if (ext === undefined) {
        differences.push({
          platform: pos,
          external: undefined,
          magnitude: pos.amount,
          direction: "MISSING_ON_COUNTERPARTY",
          expected: false,
          classification: "MISSING",
        });
        continue;
      }

      const extValue = ext.balance.value;
      if (holding.eq(extValue)) {
        continue;
      }
      const magnitudeValue = holding.sub(extValue).abs();
      const direction =
        holding.gt(extValue) ? "PLATFORM_OVER" : "PLATFORM_UNDER";
      differences.push({
        platform: pos,
        external: ext,
        magnitude: { value: magnitudeValue, currency: pos.amount.currency },
        direction,
        expected: false,
        classification: "VALUATION_DIFFERENCE",
      });
    }

    for (const ext of external) {
      const pos = platform.find((p) => p.reference === ext.reference);
      if (pos === undefined) {
        differences.push({
          platform: undefined,
          external: ext,
          magnitude: ext.balance,
          direction: "MISSING_ON_PLATFORM",
          expected: false,
          classification: "MISSING",
        });
      }
    }
    return differences;
  }

  /**
   * Raise breaks on any material differences. Expected differences are
   * classified but never blocked; material unexpected differences create or
   * continue a break.
   */
  async reconcile(
    platform: readonly PlatformPosition[],
    external: readonly ExternalRecord[],
    asOf: string,
    knownAsOf: string,
    materialityFloor: Amount,
  ): Promise<void> {
    const differences = await this.match(platform, external, asOf, knownAsOf);
    for (const diff of differences) {
      if (diff.expected) {
        continue;
      }
      if (diff.magnitude.value.lte(materialityFloor.value)) {
        continue;
      }
      const key = diff.platform?.reference ?? diff.external!.reference;
      await this.register.continueDetected(
        "2a-population",
        {
          key,
          classification: diff.classification,
          direction: diff.direction,
          materiality: diff.magnitude,
          owner: "ReconciliationOps",
          businessDate: asOf,
          note: diff.classification === "MISSING"
            ? `Not present on ${diff.platform === undefined ? "the platform" : "the external record"}`
            : `${diff.direction}`,
        },
        knownAsOf,
      );
    }
  }
}