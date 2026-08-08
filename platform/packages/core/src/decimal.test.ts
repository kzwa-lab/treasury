import { describe, expect, it } from "vitest";
import { Decimal } from "./decimal.js";

describe("Decimal", () => {
  it("parses and formats", () => {
    expect(Decimal.fromString("10").toString()).toBe("10");
    expect(Decimal.fromString("12.345").toString()).toBe("12.345");
    expect(Decimal.fromString("-0.5").toString()).toBe("-0.5");
  });

  it("adds and subtracts", () => {
    expect(Decimal.fromString("0.1").add(Decimal.fromString("0.2")).toString()).toBe("0.3");
    expect(Decimal.fromString("5").sub(Decimal.fromString("3.5")).toString()).toBe("1.5");
  });

  it("multiplies exactly", () => {
    expect(Decimal.fromString("0.1").mul(Decimal.fromString("0.3")).toString()).toBe("0.03");
  });

  it("divides", () => {
    expect(Decimal.fromString("1").div(Decimal.fromString("4")).toString()).toBe("0.25");
  });

  it("rounds half up", () => {
    expect(Decimal.fromString("2.675").roundScale(2).toString()).toBe("2.68");

    expect(Decimal.fromString("1.004").roundScale(2).toString()).toBe("1");
  });

  it("compares", () => {
    expect(Decimal.fromString("2").gt(Decimal.fromString("1.9999"))).toBe(true);
    expect(Decimal.fromString("2").lte(Decimal.fromString("2"))).toBe(true);
  });
});