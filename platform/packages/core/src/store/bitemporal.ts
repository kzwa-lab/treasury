export interface BitemporalRecord<T> {
  readonly entityId: string;
  readonly version: number;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly knownDate: string;
  readonly data: T;
}

export interface BitemporalStore {
  readonly put: <T>(record: BitemporalRecord<T>) => Promise<void>;
  readonly at: <T>(entityId: string, effectiveDate: string, knownAsOf: string) => Promise<BitemporalRecord<T> | undefined>;
  readonly history: <T>(entityId: string) => Promise<BitemporalRecord<T>[]>;
  readonly all: <T>() => Promise<BitemporalRecord<T>[]>;
}

export class InMemoryBitemporalStore implements BitemporalStore {
  private readonly rows: Array<BitemporalRecord<unknown>> = [];

  async put<T>(record: BitemporalRecord<T>): Promise<void> {
    if (record.effectiveTo !== null && record.effectiveTo <= record.effectiveFrom) {
      throw new Error(
        `Invalid effective range for ${record.entityId} v${record.version}: ${record.effectiveFrom} to ${record.effectiveTo}`,
      );
    }
    this.rows.push({ ...record, data: record.data });
  }

  async at<T>(entityId: string, effectiveDate: string, knownAsOf: string): Promise<BitemporalRecord<T> | undefined> {
    const candidates = this.rows.filter(
      (r) =>
        r.entityId === entityId &&
        r.effectiveFrom <= effectiveDate &&
        (r.effectiveTo === null || effectiveDate < r.effectiveTo) &&
        r.knownDate <= knownAsOf,
    );
    if (candidates.length === 0) {
      return undefined;
    }
    candidates.sort((a, b) => {
      const byKnown = a.knownDate.localeCompare(b.knownDate);
      if (byKnown !== 0) {
        return byKnown;
      }
      return a.version - b.version;
    });
    const latest = candidates[candidates.length - 1]!;
    return latest as BitemporalRecord<T>;
  }

  async history<T>(entityId: string): Promise<BitemporalRecord<T>[]> {
    return this.rows
      .filter((r) => r.entityId === entityId)
      .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom) || a.version - b.version) as BitemporalRecord<T>[];
  }

  async all<T>(): Promise<BitemporalRecord<T>[]> {
    return [...this.rows] as BitemporalRecord<T>[];
  }
}