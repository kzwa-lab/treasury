import type { BitemporalRecord, BitemporalStore } from "../store/bitemporal.js";

/**
 * A reference-data version: a typed entity value carrying its own effective /
 * known bitemporality plus attribution. A correction is a NEW version (dated,
 * actor, reason) — the original survives so historic reads reproduce exactly.
 */
export interface RefDataVersion<T> {
  readonly entityId: string;
  readonly key: string;
  readonly version: number;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly knownDate: string;
  readonly actor: string;
  readonly reason: string;
  readonly data: T;
}

/**
 * Typed, domain-scoped, append-only reference data store built on the shared
 * bitemporal spine (D1 §2). Every entity is version-addressable by
 * (effective, known); a correction creates a new version, never edits one.
 */
export class VersionedReference<T> {
  private readonly store: BitemporalStore;
  private readonly namespace: string;
  private readonly actor: string;

  constructor(store: BitemporalStore, namespace: string, actor = "system") {
    this.store = store;
    this.namespace = namespace;
    this.actor = actor;
  }

  entityId(key: string): string {
    return `ref:${this.namespace}:${key}`;
  }

  /** Write a version. `version` must be strictly sequential for the entity. */
  async write(
    key: string,
    data: T,
    opts: {
      readonly version: number;
      readonly effectiveFrom: string;
      readonly effectiveTo?: string;
      readonly knownDate: string;
      readonly actor?: string;
      readonly reason: string;
    },
  ): Promise<RefDataVersion<T>> {
    const entityId = this.entityId(key);
    const current = await this.latest(key);
    if (current !== undefined && opts.version !== current.version + 1) {
      throw new Error(`${entityId}: expected version ${current.version + 1}, got ${opts.version}`);
    }
    const effectiveTo = opts.effectiveTo ?? null;
    const record: BitemporalRecord<T> = {
      entityId,
      version: opts.version,
      effectiveFrom: opts.effectiveFrom,
      effectiveTo,
      knownDate: opts.knownDate,
      data,
    };
    await this.store.put<T>(record);
    return {
      entityId,
      key,
      version: opts.version,
      effectiveFrom: opts.effectiveFrom,
      effectiveTo,
      knownDate: opts.knownDate,
      actor: opts.actor ?? this.actor,
      reason: opts.reason,
      data,
    };
  }

  /** Version in force on `effectiveDate` as known at `knownAsOf` (D1 §2 rule 2). */
  async read(key: string, effectiveDate: string, knownAsOf: string): Promise<RefDataVersion<T> | undefined> {
    const record = await this.store.at<T>(this.entityId(key), effectiveDate, knownAsOf);
    return record === undefined ? undefined : this.versionOf(record);
  }

  async latest(key: string): Promise<RefDataVersion<T> | undefined> {
    const records = await this.store.history<T>(this.entityId(key));
    if (records.length === 0) {
      return undefined;
    }
    const last = [...records].sort((a, b) => a.version - b.version);
    return this.versionOf(last[last.length - 1]!);
  }

  async history(key: string): Promise<RefDataVersion<T>[]> {
    const records = await this.store.history<T>(this.entityId(key));
    return records.map((r) => this.versionOf(r));
  }

  async all(): Promise<RefDataVersion<T>[]> {
    const records = await this.store.all<T>();
    const prefix = `ref:${this.namespace}:`;
    return records.filter((r) => r.entityId.startsWith(prefix)).map((r) => this.versionOf(r));
  }

  private versionOf(record: BitemporalRecord<T>): RefDataVersion<T> {
    return {
      entityId: record.entityId,
      key: record.entityId.slice(`ref:${this.namespace}:`.length),
      version: record.version,
      effectiveFrom: record.effectiveFrom,
      effectiveTo: record.effectiveTo,
      knownDate: record.knownDate,
      actor: "system",
      reason: "ingest",
      data: record.data,
    };
  }
}