import { describe, expect, it } from "vitest";
import { ClassificationEngine, RuleConflictError } from "../classification/engine.js";
import type { RuleVersion } from "../classification/rules.js";
import type { InputVector } from "../classification/dimensions.js";

function rule(
  id: string,
  dimension: RuleVersion["dimension"],
  precedence: number,
  effectiveFrom: string,
  declared: string[],
  match: (i: InputVector) => boolean,
  output: (i: InputVector) => string,
): RuleVersion {
  return {
    ruleId: id,
    version: 1,
    dimension,
    precedence,
    declaredInputs: declared,
    effectiveFrom,
    active: true,
    author: "reg",
    approvedBy: "risk",
    match,
    output,
  };
}

const fixedIncomeInput: InputVector = {
  productCode: "BOND",
  currency: "USD",
  maturity: "2027-01-01",
  issuerrating: "BBB",
  bookIntent: "BANKING",
};

describe("ClassificationEngine", () => {
  it("classifies every dimension and records explanation", () => {
    const engine = new ClassificationEngine({
      rules: [
        rule("R1", "bookIntent", 10, "2024-01-01", ["bookIntent"], (i) => i.bookIntent === "BANKING", () => "BANKING"),
        rule("R2", "accountingClassification", 10, "2024-01-01", ["productCode"], (i) => i.productCode === "BOND", () => "AC"),
        rule("R3", "contractualMaturityBucket", 10, "2024-01-01", ["maturity"], () => true, () => ">2Y"),
      ],
    });

    const result = engine.classify(fixedIncomeInput, "2024-06-01", "C-1");
    expect(result.classification.bookIntent).toBe("BANKING");
    expect(result.classification.accountingClassification).toBe("AC");
    expect(result.classification.contractualMaturityBucket).toBe(">2Y");
    expect(result.explanations.some((e) => e.ruleId === "R1")).toBe(true);
    expect(result.unclassified).toContain("primaryRiskType");
  });

  it("honours rule effective dating", () => {
    const engine = new ClassificationEngine({
      rules: [
        rule("R1", "bookIntent", 10, "2025-01-01", ["bookIntent"], () => true, () => "TRADING"),
      ],
    });
    expect(engine.classify(fixedIncomeInput, "2024-06-01", "C-1").unclassified).toContain("bookIntent");
    expect(engine.classify(fixedIncomeInput, "2025-06-01", "C-1").classification.bookIntent).toBe("TRADING");
  });

  it("higher precedence wins over a match at lower precedence", () => {
    const engine = new ClassificationEngine({
      rules: [
        rule("LOW", "glLine", 5, "2024-01-01", ["productCode"], () => true, () => "GL_BOND"),
        rule("HIGH", "glLine", 10, "2024-01-01", ["productCode"], () => true, () => "GL_FI"),
      ],
    });
    expect(engine.classify(fixedIncomeInput, "2024-06-01", "C-1").classification.glLine).toBe("GL_FI");
  });

  it("blocks activation when rules conflict at equal precedence", () => {
    const engine = new ClassificationEngine({
      rules: [
        rule("A", "currency", 10, "2024-01-01", ["currency"], () => true, () => "USD"),
        rule("B", "currency", 10, "2024-01-01", ["currency"], () => true, () => "ZAR"),
      ],
    });
    expect(() => engine.classify(fixedIncomeInput, "2024-06-01", "C-1")).toThrow(RuleConflictError);
  });

  it("rejects a rule that references an undeclared input", () => {
    const engine = new ClassificationEngine({
      rules: [
        rule("R1", "counterpartyType", 10, "2024-01-01", ["missingKey"], () => true, () => "BANK"),
      ],
    });
    expect(() => engine.classify(fixedIncomeInput, "2024-06-01", "C-1")).toThrow(/outside the declared input vector/);
  });

  it("applies an expiring four-eyes override and records it", () => {
    const engine = new ClassificationEngine({
      rules: [
        rule("R1", "bookIntent", 10, "2024-01-01", ["bookIntent"], () => true, () => "TRADING"),
      ],
      overrides: [
        {
          contractId: "C-1",
          dimension: "bookIntent",
          value: "BANKING",
          reasonCode: "BOOK_RECLASS",
          authorizedBy: "alco",
          authorizedAt: "2024-03-01",
          expiresOn: "2024-12-31",
          fourEyesSignoff: "fm",
        },
      ],
    });

    const result = engine.classify(fixedIncomeInput, "2024-06-01", "C-1");
    expect(result.classification.bookIntent).toBe("BANKING");
    expect(result.explanations.find((e) => e.dimension === "bookIntent")?.overridden).toBe(true);
  });
});