import type { Amount } from "../model/types.js";
import { Decimal } from "../decimal.js";
import type { OpenBreak } from "./break.js";

export type DataGoodState = "CLEAN" | "PROVISIONAL" | "BLOCKED";

export interface ReconciliationState {
  readonly state: DataGoodState;
  readonly reconciliation: string;
  readonly businessDate: string;
  readonly openBreaks: number;
  readonly unresolvedMateriality: Amount;
  readonly escalated: number;
  readonly reason: string;
}

export interface MaterialityPolicy {
  readonly materialityFloor: Amount;
  readonly warningAbove: Amount;
  readonly blockAbove: Amount;
}

/** D16 §6 publishes a data-good state per domain and date; D17 gates on it. */
export function summariseReconciliationState(
  reconciliation: string,
  businessDate: string,
  openBreaks: readonly OpenBreak[],
  policy: MaterialityPolicy,
): ReconciliationState {
  const open = openBreaks.filter((b) => b.detectedOn <= businessDate);
  const escalated = open.filter((b) => b.state === "ESCALATED").length;
  const currency = open[0]?.materiality.currency ?? policy.materialityFloor.currency;

  const total = open.reduce((sum, b) => sum.add(b.materiality.value), Decimal.zero());

  let state: DataGoodState;
  let reason: string;
  if (escalated > 0) {
    state = "BLOCKED";
    reason = `${escalated} escalated break(s)`;
  } else if (total.gt(policy.blockAbove.value)) {
    state = "BLOCKED";
    reason = `Open break materiality ${total.toString()} > block threshold ${policy.blockAbove.value.toString()}`;
  } else if (total.gt(policy.warningAbove.value)) {
    state = "PROVISIONAL";
    reason = `Open break materiality ${total.toString()} within warning band`;
  } else {
    state = "CLEAN";
    reason = "No material unresolved breaks";
  }

  return {
    state,
    reconciliation,
    businessDate,
    openBreaks: open.length,
    unresolvedMateriality: { value: total, currency },
    escalated,
    reason,
  };
}