import { describe, expect, it } from "vitest";
import { InMemoryBitemporalStore, type BitemporalRecord } from "../store/bitemporal.js";

interface Counterparty {
  rating: string;
  country: string;
}

function record(
  entityId: string,
  version: number,
  effectiveFrom: string,
  effectiveTo: string | null,
  knownDate: string,
  rating: string,
  country: string,
): BitemporalRecord<Counterparty> {
  return { entityId, version, effectiveFrom, effectiveTo, knownDate, data: { rating, country } };
}

describe("InMemoryBitemporalStore", () => {
  it("answers on the effective axis", async () => {
    const store = new InMemoryBitemporalStore();
    await store.put(record("CP-1", 1, "2024-01-01", null, "2024-01-02", "A", "ZW"));
    await store.put(record("CP-1", 2, "2024-06-01", null, "2024-06-05", "BBB", "ZW"));

    expect((await store.at<Counterparty>("CP-1", "2024-03-01", "2024-07-01"))?.data.rating).toBe("A");
    expect((await store.at<Counterparty>("CP-1", "2024-07-01", "2024-07-01"))?.data.rating).toBe("BBB");
  });

  it("separates as-reported from as-now-understood on a backdated correction", async () => {
    const store = new InMemoryBitemporalStore();
    await store.put(record("CP-1", 1, "2024-01-01", null, "2024-01-02", "A", "ZW"));
    await store.put(record("CP-1", 2, "2024-01-01", null, "2024-01-15", "BBB", "ZW"));

    expect((await store.at<Counterparty>("CP-1", "2024-01-10", "2024-01-10"))?.data.rating).toBe("A");
    expect((await store.at<Counterparty>("CP-1", "2024-01-10", "2024-01-20"))?.data.rating).toBe("BBB");
  });

  it("honours a closing effective range", async () => {
    const store = new InMemoryBitemporalStore();
    await store.put(record("B-1", 1, "2024-01-01", "2025-01-01", "2024-01-02", "AAA", "ZW"));

    expect((await store.at<Counterparty>("B-1", "2024-06-01", "2024-06-01"))?.data.rating).toBe("AAA");
    expect(await store.at<Counterparty>("B-1", "2025-06-01", "2025-06-01")).toBeUndefined();
  });

  it("refuses an inverted effective range", async () => {
    const store = new InMemoryBitemporalStore();
    await expect(store.put(record("X", 1, "2024-06-01", "2024-01-01", "2024-06-02", "A", "ZW"))).rejects.toThrow();
  });
});