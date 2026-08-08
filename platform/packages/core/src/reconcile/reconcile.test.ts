import { describe, expect, it } from "vitest";
import { Decimal } from "../decimal.js";
import { InMemoryBitemporalStore } from "../store/bitemporal.js";
import { BreakRegister, breakAgeDays } from "./break.js";
import { PositionReconciliation } from "./engine.js";
import { summariseReconciliationState } from "./state.js";
import { EncumbranceRegister } from "../register/encumbrance.js";

const usd = (s: string) => ({ value: Decimal.fromString(s), currency: "USD" });

describe("breakAgeDays", () => {
  it("counts calendar days between detection and as-of", () => {
    expect(breakAgeDays("2024-01-01", "2024-01-06")).toBe(5);
    expect(breakAgeDays("2024-01-06", "2024-01-01")).toBe(0);
    expect(breakAgeDays("2024-01-01", "2024-01-01")).toBe(0);
  });
});

describe("BreakRegister", () => {
  it("a break repeated across days is one break that ages, not five", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);

    for (const day of ["2024-01-01", "2024-01-02", "2024-01-03", "2024-01-04", "2024-01-05"]) {
      await register.continueDetected(
        "2a-population",
        {
          key: "BOND-1",
          classification: "VALUATION_DIFFERENCE",
          direction: "PLATFORM_OVER",
          materiality: usd("1000"),
          owner: "Ops",
          businessDate: day,
        },
        day,
      );
    }

    const open = await register.open("2a-population", "2024-01-05");
    expect(open).toHaveLength(1);
    expect(open[0]!.detectionCount).toBe(5);
    expect(open[0]!.ageDays).toBe(4);
    expect(open[0]!.lastSeenOn).toBe("2024-01-05");
  });

  it("a vanished difference is still a break to explain", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);

    await register.continueDetected(
      "2a-population",
      {
        key: "BOND-1",
        classification: "VALUATION_DIFFERENCE",
        direction: "PLATFORM_OVER",
        materiality: usd("1000"),
        owner: "Ops",
        businessDate: "2024-01-01",
      },
      "2024-01-01",
    );

    // The difference disappears on day 2 (no re-detection), but the break
    // stays open — nothing auto-closes it.
    const open = await register.open("2a-population", "2024-03-01");
    expect(open).toHaveLength(1);
    expect(open[0]!.detectionCount).toBe(1);
    expect(open[0]!.state).toBe("DETECTED");
  });

  it("resolve requires a stated cause; resolve/accept close the break", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);

    await register.continueDetected(
      "2a-population",
      {
        key: "BOND-1",
        classification: "MISSING",
        direction: "MISSING_ON_COUNTERPARTY",
        materiality: usd("1000"),
        owner: "Ops",
        businessDate: "2024-01-01",
      },
      "2024-01-01",
    );

    await expect(
      register.resolve("2a-population", "BOND-1", "", "bob", "2024-01-02"),
    ).rejects.toThrow(/stated cause/);

    await register.classify("2a-population", "BOND-1", "MISSING", "ops", "2024-01-02");
    await register.investigate("2a-population", "BOND-1", "2024-01-03");
    const resolved = await register.resolve(
      "2a-population",
      "BOND-1",
      "Custodian failed to post the position we delivered",
      "bob",
      "2024-01-04",
    );
    expect(resolved.state).toBe("RESOLVED");
    expect(resolved.resolution?.cause).toContain("Custodian");

    const open = await register.open("2a-population", "2024-01-10");
    expect(open).toHaveLength(0);
  });

  it("acceptance requires a cause and records tolerance", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);

    await register.continueDetected(
      "2b-valuation",
      {
        key: "FWD-1",
        classification: "VALUATION_DIFFERENCE",
        direction: "PLATFORM_UNDER",
        owner: "Ops",
        materiality: usd("42"),
        businessDate: "2024-02-01",
      },
      "2024-02-01",
    );

    await expect(
      register.accept("2b-valuation", "FWD-1", "  ", "ops", "2024-02-02"),
    ).rejects.toThrow(/stated cause/);

    await register.accept(
      "2b-valuation",
      "FWD-1",
      "Counterparty marks stale",
      "ops",
      "2024-02-02",
    );
    const open = await register.open("2b-valuation", "2024-02-09");
    expect(open).toHaveLength(0);
  });

  it("escalation fires automatically past age threshold", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);

    await register.continueDetected(
      "2a-population",
      {
        key: "BOND-1",
        classification: "MISSING",
        direction: "MISSING_ON_COUNTERPARTY",
        owner: "Ops",
        businessDate: "2024-01-01",
        note: "initial",
      },
      "2024-01-01",
    );

    await register.escalateOverdue("2a-population", "2024-01-10", "2024-01-10", 5);
    const open = await register.open("2a-population", "2024-01-10");
    expect(open[0]!.state).toBe("ESCALATED");
    expect(open[0]!.notes.join(" ")).toContain("ESCALATED");
  });

  it("classify/investigate/escalate on a missing break throws", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);
    await expect(register.classify("2a-population", "NOPE", "MISSING", "ops", "2024-01-02")).rejects.toThrow(
      /No break/,
    );
  });
});

describe("PositionReconciliation (three-way, D16 §5.4)", () => {
  it("does not raise a break for a repo'd-out security", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);
    const encumbrances = new EncumbranceRegister(store);
    const reconciliation = new PositionReconciliation(register, encumbrances);

    await encumbrances.pledge(
      {
        id: "ENC-1",
        assetContractId: "BOND-1",
        type: "PLEDGED",
        holder: "REPO-COUNTERPARTY",
        startedOn: "2024-01-01",
        untilOn: null,
        status: "ACTIVE",
        source: "EXTERNAL",
        amount: usd("1000000"),
      },
      "2024-01-02",
    );

    // Platform holds 1m (encumbered); custodian delivered it away (0 in account).
    const diffs = await reconciliation.match(
      [
        { reference: "BOND-1", assetContractId: "BOND-1", amount: usd("1000000"), account: "cust-1" },
      ],
      [
        { reference: "BOND-1", balance: usd("0"), account: "cust-1" },
      ],
      "2024-03-01",
      "2024-03-01",
    );

    expect(diffs).toHaveLength(0);
  });

  it("raises a break for a real population difference", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);
    const encumbrances = new EncumbranceRegister(store);
    const reconciliation = new PositionReconciliation(register, encumbrances);

    await reconciliation.reconcile(
      [{ reference: "BOND-1", assetContractId: "BOND-1", amount: usd("1000000"), account: "cust-1" }],
      [{ reference: "BOND-1", balance: usd("900000"), account: "cust-1" }],
      "2024-03-01",
      "2024-03-01",
      usd("100"),
    );

    const open = await register.open("2a-population", "2024-03-01");
    expect(open).toHaveLength(1);
    expect(open[0]!.direction).toBe("PLATFORM_OVER");
    expect(open[0]!.classification).toBe("VALUATION_DIFFERENCE");
  });

  it("respects the materiality floor", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);
    const reconciliation = new PositionReconciliation(register, new EncumbranceRegister(store));

    await reconciliation.reconcile(
      [{ reference: "BOND-1", assetContractId: "BOND-1", amount: usd("1000000"), account: "cust-1" }],
      [{ reference: "BOND-1", balance: usd("999999.9"), account: "cust-1" }],
      "2024-03-01",
      "2024-03-01",
      usd("10"),
    );

    const open = await register.open("2a-population", "2024-03-01");
    expect(open).toHaveLength(0);
  });
});

describe("summariseReconciliationState (D16 §6)", () => {
  const floor = usd("100");
  const warning = usd("1000");
  const block = usd("100000");

  it("clean when no material breaks", async () => {
    expect(
      summariseReconciliationState("2a-population", "2024-03-01", [], { materialityFloor: floor, warningAbove: warning, blockAbove: block }).state,
    ).toBe("CLEAN");
  });

  it("provisional inside the warning band", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);
    await register.continueDetected(
      "2a-population",
      { key: "BOND-1", classification: "MISSING", direction: "MISSING_ON_COUNTERPARTY", materiality: usd("5000"), owner: "Ops", businessDate: "2024-03-01" },
      "2024-03-01",
    );
    const open = await register.open("2a-population", "2024-03-01");
    expect(
      summariseReconciliationState("2a-population", "2024-03-01", open, { materialityFloor: floor, warningAbove: warning, blockAbove: block }).state,
    ).toBe("PROVISIONAL");
  });

  it("blocks when threshold exceeded or a break is escalated", async () => {
    const store = new InMemoryBitemporalStore();
    const register = new BreakRegister(store);
    await register.continueDetected(
      "2a-population",
      { key: "BOND-1", classification: "MISSING", direction: "MISSING_ON_COUNTERPARTY", owner: "Ops", businessDate: "2024-01-01", materiality: usd("200000") },
      "2024-01-01",
    );
    const open = await register.open("2a-population", "2024-01-01");
    expect(
      summariseReconciliationState("2a-population", "2024-01-01", open, { materialityFloor: floor, warningAbove: warning, blockAbove: block }).state,
    ).toBe("BLOCKED");
  });
});