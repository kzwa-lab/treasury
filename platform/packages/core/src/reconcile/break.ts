import type { Amount } from "../model/types.js";
import type { BitemporalStore } from "../store/bitemporal.js";

export type ReconciliationId = "2a-population" | "2b-valuation" | "4-dual-mastered";

export type BreakClassification = "TIMING" | "ERROR" | "MISSING" | "VALUATION_DIFFERENCE";

export type BreakDirection =
  | "PLATFORM_OVER"
  | "PLATFORM_UNDER"
  | "MISSING_ON_COUNTERPARTY"
  | "MISSING_ON_PLATFORM";

export type BreakState =
  | "DETECTED"
  | "CLASSIFIED"
  | "INVESTIGATING"
  | "ESCALATED"
  | "RESOLVED"
  | "ACCEPTED";

export type BreakResolutionOutcome = "RESOLVED" | "ACCEPTED";

export interface BreakResolution {
  readonly outcome: BreakResolutionOutcome;
  readonly cause: string;
  readonly resolvedOn: string;
  readonly resolvedBy: string;
  readonly justification?: string;
}

export interface BreakData {
  readonly id: string;
  readonly reconciliation: ReconciliationId;
  readonly key: string;
  readonly classification: BreakClassification;
  readonly state: BreakState;
  readonly detectedOn: string;
  readonly lastSeenOn: string;
  readonly materiality: Amount;
  readonly direction: BreakDirection;
  readonly owner: string;
  readonly notes: readonly string[];
  readonly detectionCount: number;
  readonly resolution: BreakResolution | undefined;
}

export interface OpenBreak extends BreakData {
  readonly ageDays: number;
}

const TERMINAL: readonly BreakState[] = ["RESOLVED", "ACCEPTED"];

function parseIso(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

/** Whole calendar days from `start` (inclusive) to `end` (exclusive), floor 0. */
export function breakAgeDays(start: string, end: string): number {
  const ms = parseIso(end) - parseIso(start);
  return Math.max(0, Math.round(ms / 86_400_000));
}

function entityId(reconciliation: ReconciliationId, key: string): string {
  return `brk:${reconciliation}:${key}`;
}

/**
 * A break is an object with a lifecycle, not a daily difference. The same
 * break detected on five consecutive days is one five-day-old break, not five:
 * repeat `continue`-detections update the same entity. A difference that
 * vanishes is still a break to explain — nothing auto-closes a break except
 * an explicit `resolve`/`accept` with a stated cause.
 */
export class BreakRegister {
  private readonly store: BitemporalStore;

  constructor(store: BitemporalStore) {
    this.store = store;
  }

  /**
   * Record that a difference exists on `businessDate`, or continue the break
   * already open on `key`. Returns the resulting (updated) break.
   */
  async continueDetected(
    reconciliation: ReconciliationId,
    input: {
      readonly key: string;
      readonly classification: BreakClassification;
      readonly direction: BreakDirection;
      readonly materiality: Amount;
      readonly owner: string;
      readonly businessDate: string;
      readonly note?: string;
    },
    knownDate: string,
  ): Promise<BreakData> {
    const id = entityId(reconciliation, input.key);
    const latest = await this.latest(id);
    const version = (latest?.version ?? 0) + 1;

    const notes = input.note === undefined ? [] : [input.note];
    let data: BreakData;
    if (latest === undefined) {
      data = {
        id,
        reconciliation,
        key: input.key,
        classification: input.classification,
        state: "DETECTED",
        detectedOn: input.businessDate,
        lastSeenOn: input.businessDate,
        materiality: input.materiality,
        direction: input.direction,
        owner: input.owner,
        notes,
        detectionCount: 1,
        resolution: undefined,
      };
    } else {
      data = {
        ...latest.data,
        id,
        lastSeenOn: input.businessDate,
        materiality: input.materiality,
        owner: input.owner,
        notes: input.note === undefined ? latest.data.notes : [...latest.data.notes, input.note],
        detectionCount: latest.data.detectionCount + 1,
        resolution: latest.data.resolution,
      };
    }

    await this.store.put({
      entityId: id,
      version,
      effectiveFrom: input.businessDate,
      effectiveTo: null,
      knownDate,
      data,
    });
    return data;
  }

  async classify(
    reconciliation: ReconciliationId,
    key: string,
    classification: BreakClassification,
    owner: string,
    knownDate: string,
  ): Promise<BreakData> {
    return this.patch(reconciliation, key, knownDate, (data) => ({
      ...data,
      state: "CLASSIFIED" as const,
      classification,
      owner,
    }));
  }

  async investigate(reconciliation: ReconciliationId, key: string, knownDate: string): Promise<BreakData> {
    return this.patch(reconciliation, key, knownDate, (data) => ({
      ...data,
      state: "INVESTIGATING" as const,
    }));
  }

  async escalate(reconciliation: ReconciliationId, key: string, knownDate: string, reason: string): Promise<BreakData> {
    return this.patch(reconciliation, key, knownDate, (data) => ({
      ...data,
      state: "ESCALATED" as const,
      notes: [...data.notes, `ESCALATED: ${reason}`],
    }));
  }

  /** Resolved — requires a stated cause. A vanished difference is not a cause. */
  async resolve(
    reconciliation: ReconciliationId,
    key: string,
    cause: string,
    resolvedBy: string,
    knownDate: string,
  ): Promise<BreakData> {
    return this.close(reconciliation, key, "RESOLVED", cause, resolvedBy, knownDate);
  }

  /** Accepted within tolerance, with a stated cause. */
  async accept(
    reconciliation: ReconciliationId,
    key: string,
    cause: string,
    acceptedBy: string,
    knownDate: string,
  ): Promise<BreakData> {
    return this.close(reconciliation, key, "ACCEPTED", cause, acceptedBy, knownDate);
  }

  /** Breaks still open as of `asOf`: not terminal, detected on or before `asOf`. */
  async open(reconciliation: ReconciliationId, asOf: string): Promise<OpenBreak[]> {
    const rows = await this.store.all<BreakData>();
    const byKey = new Map<string, { data: BreakData; knownDate: string }>();
    for (const row of rows) {
      if (row.data.reconciliation !== reconciliation) {
        continue;
      }
      if (row.knownDate > asOf) {
        continue;
      }
      const existing = byKey.get(row.data.key);
      if (existing === undefined || row.knownDate > existing.knownDate) {
        byKey.set(row.data.key, { data: row.data, knownDate: row.knownDate });
      }
    }
    const open: OpenBreak[] = [];
    for (const { data } of byKey.values()) {
      if (TERMINAL.includes(data.state) || data.detectedOn > asOf) {
        continue;
      }
      open.push({ ...data, ageDays: breakAgeDays(data.detectedOn, asOf) });
    }
    return open.sort((a, b) => b.ageDays - a.ageDays);
  }

  async byKey(reconciliation: ReconciliationId, key: string): Promise<BreakData | undefined> {
    return (await this.latest(entityId(reconciliation, key)))?.data;
  }

  /** Open breaks whose age exceeds `maxAgeDays` are auto-escalated. */
  async escalateOverdue(
    reconciliation: ReconciliationId,
    asOf: string,
    knownDate: string,
    maxAgeDays: number,
  ): Promise<BreakData[]> {
    const open = await this.open(reconciliation, asOf);
    const escalated: BreakData[] = [];
    for (const b of open) {
      if (b.state !== "ESCALATED" && b.ageDays > maxAgeDays) {
        escalated.push(
          await this.escalate(reconciliation, b.key, knownDate, `Age ${b.ageDays} > ${maxAgeDays}d`),
        );
      }
    }
    return escalated;
  }

  private async close(
    reconciliation: ReconciliationId,
    key: string,
    outcome: BreakResolutionOutcome,
    cause: string,
    by: string,
    knownDate: string,
  ): Promise<BreakData> {
    const trimmed = cause.trim();
    if (trimmed === "") {
      throw new Error(`${reconciliation}/${key} cannot be ${outcome} without a stated cause`);
    }
    const resolution: BreakResolution = { outcome, cause: trimmed, resolvedOn: knownDate, resolvedBy: by };
    return this.patch(reconciliation, key, knownDate, (data) => ({ ...data, state: outcome, resolution }));
  }

  private async patch(
    reconciliation: ReconciliationId,
    key: string,
    knownDate: string,
    apply: (data: BreakData) => BreakData,
  ): Promise<BreakData> {
    const id = entityId(reconciliation, key);
    const latest = await this.latest(id);
    if (latest === undefined) {
      throw new Error(`No break ${reconciliation}/${key} to transition`);
    }
    const data = apply(latest.data);
    await this.store.put({
      entityId: id,
      version: latest.version + 1,
      effectiveFrom: data.detectedOn,
      effectiveTo: null,
      knownDate,
      data,
    });
    return data;
  }

  private async latest(id: string): Promise<{ data: BreakData; version: number } | undefined> {
    const records = await this.store.history<BreakData>(id);
    if (records.length === 0) {
      return undefined;
    }
    const sorted = [...records].sort((a, b) => a.version - b.version);
    const last = sorted[sorted.length - 1]!;
    return { data: last.data, version: last.version };
  }
}