import { Decimal } from "../decimal.js";
import type { BusinessDayConvention, DayCountBasis } from "../model/leg.js";

export type { BusinessDayConvention, DayCountBasis };

export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

export function shiftBusinessDays(date: Date, convention: BusinessDayConvention): Date {
  if (convention === "NONE") {
    return new Date(date);
  }
  if (convention === "FOLLOWING") {
    const result = new Date(date);
    while (isWeekend(result)) {
      result.setUTCDate(result.getUTCDate() + 1);
    }
    return result;
  }
  if (convention === "PRECEDING") {
    const result = new Date(date);
    while (isWeekend(result)) {
      result.setUTCDate(result.getUTCDate() - 1);
    }
    return result;
  }
  const result = new Date(date);
  while (isWeekend(result)) {
    result.setUTCDate(result.getUTCDate() + 1);
  }
  if (result.getUTCMonth() !== date.getUTCMonth()) {
    const prev = new Date(date);
    while (isWeekend(prev)) {
      prev.setUTCDate(prev.getUTCDate() - 1);
    }
    return prev;
  }
  return result;
}

export function dayCountFraction(start: string, end: string, basis: DayCountBasis): Decimal {
  const [sy = 0, sm = 0, sd = 0] = start.split("-").map(Number);
  const [ey = 0, em = 0, ed = 0] = end.split("-").map(Number);
  if (basis === "ACT/365") {
    return Decimal.fromString(String(daysBetween(start, end) / 365));
  }
  if (basis === "ACT/360") {
    return Decimal.fromString(String(daysBetween(start, end) / 360));
  }
  const d1 = Math.min(sd, 30);
  const d2 = d1 === 30 ? Math.min(30, ed) : ed;
  const days = 360 * (ey - sy) + 30 * (em - sm) + (d2 - d1);
  return Decimal.fromString(String(days / 360));
}

export function daysBetween(start: string, end: string): number {
  const [s, e] = [new Date(start + "T00:00:00Z"), new Date(end + "T00:00:00Z")];
  return Math.round((e.getTime() - s.getTime()) / 86_400_000);
}

export function addMonths(date: string, months: number): string {
  const [y = 0, m = 0, d = 1] = date.split("-").map(Number);
  const totalMonths = m - 1 + months;
  const year = y + Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  const day = Math.min(d, daysInMonth(year, month));
  return toIso(year, month, day);
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function toIso(year: number, month: number, day: number): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}`;
}