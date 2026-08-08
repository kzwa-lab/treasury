import { describe, expect, it } from "vitest";
import { artifactName, evaluateGateRun, provisionalLabel, validateOverride } from "./gates.js";

describe("GateRun evaluation", () => {
  it("passes a clean run and is not provisional", () => {
    const run = evaluateGateRun([
      { gate: "ARRIVAL", stageId: "ingest", outcome: "PASS" },
      { gate: "RECONCILIATION", stageId: "ingest", outcome: "PASS" },
      { gate: "COMPLETION", stageId: "ingest", outcome: "PASS" },
    ]);
    expect(run.blocked).toBe(false);
    expect(run.provisional).toBe(false);
    expect(run.provisionalReasons).toEqual([]);
  });

  it("blocks on a fail and reports the reason", () => {
    const run = evaluateGateRun([
      { gate: "ARRIVAL", stageId: "ingest", outcome: "PASS" },
      { gate: "RECONCILIATION", stageId: "ingest", outcome: "FAIL", message: "break materiality 0.5%" },
    ]);
    expect(run.blocked).toBe(true);
    expect(run.provisional).toBe(true);
    expect(run.provisionalReasons).toContain("ingest/RECONCILIATION: FAIL");
  });

  it("warn proceeds flagged provisional (model validity gate)", () => {
    const run = evaluateGateRun([
      { gate: "MODEL_VALIDITY", stageId: "valuation", outcome: "WARN" },
      { gate: "COMPLETION", stageId: "valuation", outcome: "PASS" },
    ]);
    expect(run.blocked).toBe(false);
    expect(run.provisional).toBe(true);
  });

  it("an override unblocks a fail but stays provisional", () => {
    const run = evaluateGateRun(
      [
        { gate: "RECONCILIATION", stageId: "ingest", outcome: "FAIL", message: "break materiality 0.5%" },
        { gate: "COMPLETION", stageId: "ingest", outcome: "PASS" },
      ],
      {
        overrides: [
          {
            stageId: "ingest",
            gate: "RECONCILIATION",
            reasonCode: "BREAK_ACCEPTED",
            justification: "reported difference is a known timing gap",
            approvedBy: ["fm-1", "risk-1"],
            approvedAt: "2024-01-01T09:00:00Z",
          },
        ],
      },
    );
    expect(run.blocked).toBe(false);
    expect(run.provisional).toBe(true);
    expect(run.gates.find((g) => g.check.gate === "RECONCILIATION")?.verdict).toBe("WARNED");
    expect(run.gates.find((g) => g.check.gate === "RECONCILIATION")?.overridden).toBe(true);
  });

  it("a fail that is not overridden stays blocked", () => {
    const run = evaluateGateRun(
      [
        { gate: "ARRIVAL", stageId: "ingest", outcome: "FAIL" },
        { gate: "RECONCILIATION", stageId: "ingest", outcome: "PASS" },
      ],
      {
        overrides: [
          {
            stageId: "ingest",
            gate: "RECONCILIATION",
            reasonCode: "NONE",
            justification: "unrelated override",
            approvedBy: ["fm-ops", "risk-1"],
            approvedAt: "2024-01-01T09:00:00Z",
          },
        ],
      },
    );
    expect(run.blocked).toBe(true);
  });

  it("rejects an override without four-eyes", () => {
    expect(() =>
      validateOverride({
        stageId: "ingest",
        gate: "RECONCILIATION",
        reasonCode: "BREAK_ACCEPTED",
        justification: "timing gap",
        approvedBy: ["fm-ops"],
        approvedAt: "2024-01-01T09:00:00Z",
      }),
    ).toThrow(/four-eyes/);
  });

  it("rejects an override without justification", () => {
    expect(() =>
      validateOverride({
        stageId: "ingest",
        gate: "RECONCILIATION",
        reasonCode: "BREAK_ACCEPTED",
        justification: "",
        approvedBy: ["fm-ops", "risk-1"],
        approvedAt: "2024-01-01T09:00:00Z",
      }),
    ).toThrow(/justification/);
  });
});

describe("Provisional artifact naming", () => {
  it("renders provisional in the artifact name and label", () => {
    expect(provisionalLabel(true)).toBe("PROVISIONAL");
    expect(provisionalLabel(false)).toBe("FINAL");
    expect(artifactName("alcom_pack", "2024-01-01_v3", true)).toBe("alcom_pack_2024-01-01_v3_provisional");
  });
});