import { describe, expect, it } from "vitest";
import { Decimal } from "../decimal.js";
import { InMemoryBitemporalStore } from "../store/bitemporal.js";
import { FixingStore } from "./fixings.js";

const store = () => new InMemoryBitemporalStore();

describe("FixingStore (D3 §3.1)", () => {
  it("stores the daily series and reads it back as-at", async () => {
    const fs = new FixingStore(store());
    await fs.publish({ indexId: "SOFR", observationDate: "2024-01-02", value: Decimal.fromString("5.30"), source: "NYFED" }, "2024-01-02");
    await fs.publish({ indexId: "SOFR", observationDate: "2024-01-03", value: Decimal.fromString("5.31"), source: "NYFED" }, "2024-01-03");

    const series = await fs.series("SOFR", "2024-01-01", "2024-01-31", "2024-01-31");
    expect(series).toHaveLength(2);
    expect(series[0]!.observationDate).toBe("2024-01-02");
    expect(series[1]!.revision).toBe(1);
  });

  it("a restatement creates a new version — the original reproduces", async () => {
    const fs = new FixingStore(store());
    await fs.publish({ indexId: "SOFR", observationDate: "2024-01-02", value: Decimal.fromString("5.30"), source: "NYFED" }, "2024-01-02");
    await fs.restate("SOFR", "2024-01-02", Decimal.fromString("5.32"), "2024-01-09", "NYFED");

    const original = await fs.at("SOFR", "2024-01-02", "2024-01-05");
    expect(original?.value.toString()).toBe("5.3");

    const restated = await fs.at("SOFR", "2024-01-02", "2024-01-10");
    expect(restated?.value.toString()).toBe("5.32");
    expect(restated?.revision).toBe(2);

    const history = await fs.observationHistory("SOFR", "2024-01-02");
    expect(history).toHaveLength(2);
    expect(history[0]!.revision).toBe(1);
    expect(history[1]!.revision).toBe(2);
  });

  it("surfaces PARTIAL observation for a partially-observed compounded period", async () => {
    const fs = new FixingStore(store());
    await fs.publish({ indexId: "SOFR", observationDate: "2024-01-02", value: Decimal.fromString("5.30"), source: "NYFED" }, "2024-01-02");
    // 01-03 is missing.

    const expected = ["2024-01-02", "2024-01-03", "2024-01-04"];
    const coverage = await fs.coverage("SOFR", "2024-01-01", "2024-01-05", "2024-01-06", expected);
    expect(coverage.state).toBe("PARTIAL");
    expect(coverage.missing).toEqual(["2024-01-03", "2024-01-04"]);

    const full = await fs.coverage("SOFR", "2024-01-01", "2024-01-05", "2024-01-06", ["2024-01-02"]);
    expect(full.state).toBe("STORED");
  });
});