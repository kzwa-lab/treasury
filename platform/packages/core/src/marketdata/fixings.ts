import type { Decimal } from "../decimal.js";
import type { BitemporalStore } from "../store/bitemporal.js";

/** D3 §3.1 — a fix is a daily value, part of the daily series. */
export interface FixingRecord {
  readonly indexId: string;
  readonly observationDate: string;
  readonly value: Decimal;
  readonly source: string;
}

/** A persisted fixing, bitemporal on observation date + knowledge date (D3 §1.1). */
export interface StoredFixing extends FixingRecord {
  readonly knownDate: string;
  /** Revision indicator: first publication is 1; restatements increment. */
  readonly revision: number;
}

export type ObservabilityState = "STORED" | "MARKET_QUERY" | "PARTIAL";

/**
 * D3 §3.1 fixings store. Source of the daily RFR series; supports
 * restatements (same observation date, later knowledge date — the original is
 * retained, never overwritten) and as-of reads for historical reproduction.
 */
export class FixingStore {
  private readonly store: BitemporalStore;

  constructor(store: BitemporalStore) {
    this.store = store;
  }

  static entityId(indexId: string, observationDate: string): string {
    return `fix:${indexId}:${observationDate}`;
  }

  /** Write (or restate) a daily fixing. A restatement is a new version, never an edit. */
  async publish(fixing: FixingRecord, knownDate: string): Promise<StoredFixing> {
    const id = FixingStore.entityId(fixing.indexId, fixing.observationDate);
    const current = await this.latest(id);
    const version = (current?.version ?? 0) + 1;
    const revision = current === undefined ? 1 : current.data.revision + 1;
    const stored: StoredFixing = { ...fixing, knownDate, revision };
    await this.store.put<StoredFixing>({
      entityId: id,
      version,
      effectiveFrom: knownDate,
      effectiveTo: null,
      knownDate,
      data: stored,
    });
    return stored;
  }

  /** The fixing for `observationDate` as it stood at `knownAsOf`. */
  async at(indexId: string, observationDate: string, knownAsOf: string): Promise<StoredFixing | undefined> {
    const record = await this.store.at<StoredFixing>(FixingStore.entityId(indexId, observationDate), knownAsOf, knownAsOf);
    return record?.data;
  }

  /** Full restatement history of one observation date, oldest→newest. */
  async observationHistory(indexId: string, observationDate: string): Promise<StoredFixing[]> {
    const records = await this.store.history<StoredFixing>(FixingStore.entityId(indexId, observationDate));
    return records.map((r) => r.data);
  }

  /**
   * The fixings of `indexId` observed between (inclusive) `from` and `to` as
   * known at `knownAsOf`, in observation-date order — the daily series, never
   * derived term rates (D3 §3.1).
   */
  async series(indexId: string, from: string, to: string, knownAsOf: string): Promise<StoredFixing[]> {
    const rows = await this.store.all<StoredFixing>();
    const seen = new Map<string, StoredFixing>();
    for (const row of rows) {
      if (row.data.indexId !== indexId) {
        continue;
      }
      if (row.data.observationDate < from || row.data.observationDate > to) {
        continue;
      }
      if (row.data.knownDate > knownAsOf) {
        continue;
      }
      const existing = seen.get(row.data.observationDate);
      if (existing === undefined || row.data.knownDate > existing.knownDate) {
        seen.set(row.data.observationDate, row.data);
      }
    }
    return [...seen.values()].sort((a, b) => a.observationDate.localeCompare(b.observationDate));
  }

  /**
   * Whether every expected observation date has a fixing as of `knownAsOf` —
   * the third fixing state of D2 (STORED / MARKET_QUERY / PARTIAL).
   */
  async coverage(
    indexId: string,
    from: string,
    to: string,
    knownAsOf: string,
    expectedDates: readonly string[],
  ): Promise<{ state: ObservabilityState; missing: string[] }> {
    const present = new Set((await this.series(indexId, from, to, knownAsOf)).map((f) => f.observationDate));
    const missing = expectedDates.filter((d) => !present.has(d));
    if (missing.length === 0) {
      return { state: "STORED", missing };
    }
    if (present.size > 0) {
      return { state: "PARTIAL", missing };
    }
    return { state: "MARKET_QUERY", missing };
  }

  /** Explicit restatement of a date already observed (correction, never an edit). */
  restate(
    indexId: string,
    observationDate: string,
    value: Decimal,
    knownDate: string,
    source: string,
  ): Promise<StoredFixing> {
    return this.publish({ indexId, observationDate, value, source }, knownDate);
  }

  private async latest(id: string): Promise<{ data: StoredFixing; version: number } | undefined> {
    const records = await this.store.history<StoredFixing>(id);
    if (records.length === 0) {
      return undefined;
    }
    const last = [...records].sort((a, b) => a.version - b.version);
    const end = last[last.length - 1]!;
    return { data: end.data, version: end.version };
  }
}