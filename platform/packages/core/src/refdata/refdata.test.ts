import { describe, expect, it } from "vitest";
import { InMemoryBitemporalStore } from "../store/bitemporal.js";
import { VersionedReference } from "./versioned.js";
import { ReferenceData } from "./registry.js";
import type { CounterpartyMaster } from "./domains.js";

const store = () => new InMemoryBitemporalStore();

describe("VersionedReference (D1 §2)", () => {
  it("a correction creates a version; the original survives and historic reads reproduce", async () => {
    const ref = new VersionedReference<{ holiday: boolean }>(store(), "calendar");

    await ref.write("GB", { holiday: false }, { version: 1, effectiveFrom: "2024-01-01", knownDate: "2024-01-05", reason: "initial" });
    // 2026 discovery: 2024-12-25 was a missing holiday — a NEW version.
    await ref.write("GB", { holiday: true }, { version: 2, effectiveFrom: "2024-12-25", knownDate: "2026-03-01", reason: "calendar correction" });

    // Reports produced in 2024 still reproduce under their knowledge date.
    const original = await ref.read("GB", "2024-12-25", "2024-12-31");
    expect(original?.data.holiday).toBe(false);
    expect(original?.version).toBe(1);

    // Current reads see the correction.
    const corrected = await ref.read("GB", "2024-12-25", "2026-04-01");
    expect(corrected?.data.holiday).toBe(true);
    expect(corrected?.version).toBe(2);

    const history = await ref.history("GB");
    expect(history).toHaveLength(2);
  });

  it("reads are version-addressable by effective and knowledge date independently", async () => {
    const ref = new VersionedReference<{ rate: number }>(store(), "policy");
    await ref.write("r1", { rate: 0.05 }, { version: 1, effectiveFrom: "2024-01-01", knownDate: "2024-01-10", reason: "initial" });
    await ref.write("r1", { rate: 0.06 }, { version: 2, effectiveFrom: "2024-06-01", knownDate: "2024-06-05", reason: "new"} );

    // Before the effective date → v1.
    expect((await ref.read("r1", "2024-03-01", "2024-07-01"))?.data.rate).toBe(0.05);
    // After the effective date → v2.
    expect((await ref.read("r1", "2024-07-01", "2024-07-01"))?.data.rate).toBe(0.06);
  });

  it("refuses out-of-sequence versions", async () => {
    const ref = new VersionedReference<{ v: number }>(store(), "seq");
    await ref.write("k", { v: 1 }, { version: 1, effectiveFrom: "2024-01-01", knownDate: "2024-01-02", reason: "one" });
    await expect(
      ref.write("k", { v: 3 }, { version: 3, effectiveFrom: "2024-02-01", knownDate: "2024-02-02", reason: "skip" }),
    ).rejects.toThrow(/expected version 2/);
  });
});

describe("ReferenceData registry (D1 §3)", () => {
  it("models the three counterparty trees as three independent stores", async () => {
    const rd = new ReferenceData(store());

    await rd.legalEntities.write(
      "LE-1",
      { legalEntityId: "LE-1", name: "Bank Plc", jurisdiction: "UK" },
      { version: 1, effectiveFrom: "2024-01-01", knownDate: "2024-01-02", reason: "onboard" },
    );
    await rd.counterparts.write(
      "CP-1",
      {
        legalEntityId: "CP-1",
        name: "Corp A",
        jurisdiction: "US",
        legalEntityType: "corp",
        counterpartyType: "corporate",
        ratings: [{ agency: "S&P", rating: "A-", asOf: "2024-01-01" }],
        economicGroupId: "GROUP-1",
      } satisfies CounterpartyMaster,
      { version: 1, effectiveFrom: "2024-01-01", knownDate: "2024-01-02", reason: "onboard" },
    );
    await rd.economicGroups.write(
      "GROUP-1",
      { groupId: "GROUP-1", name: "Corp Group", memberEntityIds: ["CP-1"] },
      { version: 1, effectiveFrom: "2024-01-01", knownDate: "2024-01-02", reason: "onboard" },
    );

    const cp = await rd.counterparts.read("CP-1", "2024-06-01", "2024-06-01");
    expect(cp?.data.counterpartyType).toBe("corporate");
    expect(await rd.economicGroups.read("GROUP-1", "2024-06-01", "2024-06-01")).toBeDefined();
  });
});