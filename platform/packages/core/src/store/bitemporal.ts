export interface BitemporalRecord<T> {
  readonly entityId: string;
  readonly version: number;
  readonly effectiveFrom: string;
  readonly effectiveTo: string | null;
  readonly knownDate: string;
  readonly data: T;
}

export interface BitemporalStore {
  readonly put: <T>(record: BitemporalRecord<T>) => void;
  readonly at: <T>(entityId: string, effectiveDate: string, knownAsOf: string) => BitemporalRecord<T> | undefined;
  readonly history: <T>(entityId: string) => BitemporalRecord<T>[];
  readonly all: <T>() => BitemporalRecord<T>[];
}

export class InMemoryBitemporalStore implements BitemporalStore {
  private readonly rows: Array<BitemporalRecord<unknown>> = [];

  put<T>(record: BitemporalRecord<T>): void {
    if (record.effectiveTo !== null && record.effectiveTo <= record.effectiveFrom) {
      throw new Error(
        `Invalid effective range for ${record.entityId} v${record.version}: ${record.effectiveFrom} to ${record.effectiveTo}`,
      );
    }
    this.rows.push({ ...record, data: record.data });
  }

  at<T>(entityId: string, effectiveDate: string, knownAsOf: string): BitemporalRecord<T> | undefined {
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

  history<T>(entityId: string): BitemporalRecord<T>[] {
    return this.rows
      .filter((r) => r.entityId === entityId)
      .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom) || a.version - b.version) as BitemporalRecord<T>[];
  }

  all<T>(): BitemporalRecord<T>[] {
    return [...this.rows] as BitemporalRecord<T>[];
  }
}