export const DECIMAL_SCALE = 12;

export class Decimal {
  readonly value: bigint;
  readonly scale: number;

  constructor(value: bigint, scale: number) {
    this.value = value;
    this.scale = scale;
  }

  static fromString(input: string): Decimal {
    const trimmed = input.trim();
    if (!/^[+-]?(\d+)(\.\d+)?$/.test(trimmed)) {
      throw new Error(`Invalid decimal literal: ${input}`);
    }
    const negative = trimmed.startsWith("-");
    const unsigned = negative || trimmed.startsWith("+") ? trimmed.slice(1) : trimmed;
    const [intPart, fracPart = ""] = unsigned.split(".");
    const intVal = BigInt(intPart === undefined || intPart === "" ? "0" : intPart);
    const fracPadded = fracPart.padEnd(DECIMAL_SCALE, "0").slice(0, DECIMAL_SCALE);
    const raw = intVal * pow10(DECIMAL_SCALE) + BigInt(fracPadded === "" ? "0" : fracPadded);
    return new Decimal(negative ? -raw : raw, DECIMAL_SCALE);
  }

  static zero(): Decimal {
    return new Decimal(0n, DECIMAL_SCALE);
  }

  static fromBigInt(value: bigint): Decimal {
    return new Decimal(value * pow10(DECIMAL_SCALE), DECIMAL_SCALE);
  }

  add(other: Decimal): Decimal {
    const { left, right, scale } = align(this, other);
    return new Decimal(left + right, scale);
  }

  sub(other: Decimal): Decimal {
    const { left, right, scale } = align(this, other);
    return new Decimal(left - right, scale);
  }

  mul(other: Decimal): Decimal {
    const left = this.value;
    const right = other.value;
    const scale = this.scale + other.scale;
    const raw = left * right;
    return normalize(raw, scale);
  }

  div(other: Decimal): Decimal {
    if (other.value === 0n) {
      throw new Error("Division by zero");
    }
    const numerator = this.value * pow10(DECIMAL_SCALE);
    const quotient = numerator / other.value;
    const remainder = numerator % other.value;
    const absRemainder = remainder < 0n ? -remainder : remainder;
    const absDenominator = other.value < 0n ? -other.value : other.value;
    const roundsUp = absRemainder * 2n >= absDenominator;
    const sameSign = (numerator < 0n) === (other.value < 0n);
    const adjusted = roundsUp ? (sameSign ? quotient + 1n : quotient - 1n) : quotient;
    return normalize(adjusted, DECIMAL_SCALE);
  }

  neg(): Decimal {
    return new Decimal(-this.value, this.scale);
  }

  abs(): Decimal {
    return this.value < 0n ? new Decimal(-this.value, this.scale) : this;
  }

  isZero(): boolean {
    return this.value === 0n;
  }

  lt(other: Decimal): boolean {
    const { left, right } = align(this, other);
    return left < right;
  }

  lte(other: Decimal): boolean {
    const { left, right } = align(this, other);
    return left <= right;
  }

  gt(other: Decimal): boolean {
    const { left, right } = align(this, other);
    return left > right;
  }

  gte(other: Decimal): boolean {
    const { left, right } = align(this, other);
    return left >= right;
  }

  eq(other: Decimal): boolean {
    const { left, right } = align(this, other);
    return left === right;
  }

  roundScale(targetScale: number): Decimal {
    if (this.scale <= targetScale) {
      return new Decimal(this.value, this.scale);
    }
    const diff = this.scale - targetScale;
    const divisor = pow10(diff);
    const absValue = this.value < 0n ? -this.value : this.value;
    const floored = absValue / divisor;
    const remainderSign = absValue % divisor;
    const half = divisor / 2n;
    const roundedAbs = remainderSign >= half ? floored + 1n : floored;
    const rounded = this.value < 0n ? -roundedAbs : roundedAbs;
    return new Decimal(rounded, targetScale);
  }

  isIntegral(): boolean {
    return this.value % pow10(this.scale) === 0n;
  }

  toString(): string {
    const negative = this.value < 0n;
    const abs = negative ? -this.value : this.value;
    const scale = this.scale;
    const unscaled = abs.toString();
    if (scale === 0) {
      return (negative ? "-" : "") + unscaled;
    }
    const padded = unscaled.padStart(scale + 1, "0");
    const intPart = padded.slice(0, -scale);
    const fracPart = padded.slice(-scale).replace(/0+$/, "");
    return (negative ? "-" : "") + intPart + (fracPart === "" ? "" : "." + fracPart);
  }

  toJSON(): string {
    return this.toString();
  }
}

function pow10(exp: number): bigint {
  return 10n ** BigInt(exp);
}

function align(a: Decimal, b: Decimal): { left: bigint; right: bigint; scale: number } {
  if (a.scale === b.scale) {
    return { left: a.value, right: b.value, scale: a.scale };
  }
  const scale = Math.max(a.scale, b.scale);
  const left = a.value * pow10(scale - a.scale);
  const right = b.value * pow10(scale - b.scale);
  return { left, right, scale };
}

function normalize(value: bigint, scale: number): Decimal {
  if (scale === DECIMAL_SCALE) {
    return new Decimal(value, scale);
  }
  if (scale > DECIMAL_SCALE) {
    const diff = scale - DECIMAL_SCALE;
    const divisor = pow10(diff);
    const absValue = value < 0n ? -value : value;
    const floored = absValue / divisor;
    const remainder = absValue % divisor;
    const rounded = remainder >= divisor / 2n ? floored + 1n : floored;
    return new Decimal((value < 0n ? -rounded : rounded), DECIMAL_SCALE);
  }
  const diff = DECIMAL_SCALE - scale;
  return new Decimal(value * pow10(diff), DECIMAL_SCALE);
}