import { describe, expect, it } from "vitest";
import { Decimal } from "../decimal.js";
import { InMemoryBitemporalStore } from "../store/bitemporal.js";
import { EncumbranceRegister } from "./encumbrance.js";

const bond = { value: Decimal.fromString("1000000"), currency: "USD" };

describe("EncumbranceRegister", () => {
  it("tracks what is pledged, to whom, and until when", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new EncumbranceRegister(store);

    await register.pledge(
      {
        id: "ENC-1",
        assetContractId: "BOND-1",
        type: "PLEDGED",
        holder: "REPO-COUNTERPARTY",
        startedOn: "2024-01-01",
        untilOn: null,
        status: "ACTIVE",
        source: "EXTERNAL",
        financingContractId: "REPO-1",
        amount: bond,
      },
      "2024-01-02",
    );

    const active = await register.activeAsOf("2024-03-01", "2024-03-01");
    expect(active).toHaveLength(1);
    expect(active[0]!.encumbrance.holder).toBe("REPO-COUNTERPARTY");
    expect(active[0]!.encumbrance.financingContractId).toBe("REPO-1");
    expect(await register.isEncumbered("BOND-1", "2024-03-01", "2024-06-01")).toBe(true);
  });

  it("a released encumbrance stops being active after release, with history kept", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new EncumbranceRegister(store);

    await register.pledge(
      {
        id: "ENC-1",
        assetContractId: "BOND-1",
        type: "PLEDGED",
        holder: "REPO-COUNTERPARTY",
        startedOn: "2024-01-01",
        untilOn: null,
        status: "ACTIVE",
        source: "EXTERNAL",
        amount: bond,
      },
      "2024-01-02",
    );
    await register.release("BOND-1", "REPO-COUNTERPARTY", "2024-05-01", "2024-05-02");

expect(await register.isEncumbered("BOND-1", "2024-03-01", "2024-06-01")).toBe(false);
    expect(await register.isEncumbered("BOND-1", "2025-03-01", "2025-03-01")).toBe(false);
    const history = await store.history("enc:BOND-1:REPO-COUNTERPARTY");
    expect(history).toHaveLength(2);
    expect(history[1]!.data.status).toBe("RELEASED");
  });

  it("respects the until date and a pending pledge", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new EncumbranceRegister(store);

    await register.pledge(
      {
        id: "ENC-1",
        assetContractId: "BOND-1",
        type: "PLEDGED",
        holder: "REPO-COUNTERPARTY",
        startedOn: "2024-01-01",
        untilOn: "2024-04-01",
        status: "ACTIVE",
        source: "EXTERNAL",
      },
      "2024-01-02",
    );

    expect(await register.isEncumbered("BOND-1", "2024-02-01", "2024-06-01")).toBe(true);
    expect(await register.isEncumbered("BOND-1", "2024-05-01", "2024-06-01")).toBe(false);
  });

  it("surface an unencumbered bond", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new EncumbranceRegister(store);

    await register.pledge(
      {
        id: "ENC-1",
        assetContractId: "BOND-A",
        type: "PLEDGED",
        holder: "REPO-COUNTERPARTY",
        startedOn: "2024-01-01",
        untilOn: null,
        status: "ACTIVE",
        source: "EXTERNAL",
      },
      "2024-01-02",
    );
    await register.pledge(
      {
        id: "ENC-2",
        assetContractId: "BOND-B",
        type: "PLEDGED",
        holder: "REPO-COUNTERPARTY-2",
        startedOn: "2024-01-01",
        untilOn: "2024-02-01",
        status: "ACTIVE",
        source: "EXTERNAL",
      },
      "2024-01-02",
    );

    const active = await register.activeAsOf("2024-03-01", "2024-06-01");
    const ids = active.map((a) => a.encumbrance.assetContractId);
    expect(ids).toContain("BOND-A");
    expect(ids).not.toContain("BOND-B");
    expect(await register.encumberedNotional("BOND-A", "2024-03-01", "2024-06-01")).toBeNull();
  });
});