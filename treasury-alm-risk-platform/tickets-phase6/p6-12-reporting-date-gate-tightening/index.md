---
kind: ticket
title: "P6-12 — Reporting-date Gate Tightening"
status: 0
---

# P6-12 — Reporting-date Gate Tightening

**Wave 4. Depends on P6-02, and on P0-12's gate machinery.**

**A small ticket closing a policy hole that has been open since Phase 0.**

Governing artifacts: `d13-regulatory-reporting-and-capital` §6.1; `d17-batch-orchestration` §3.1.

## The hole

**A submitted return cannot be provisional.**

D17's normal gate policy allows an override that marks outputs provisional and lets the run proceed —
which is correct for a Tuesday and wrong for a submission date. **On regulatory reporting dates the
policy must tighten: no override may permit a submission to be produced from provisional data.**

## Three things move together on the same calendar

**Driven from one source: D13 defines the dates, D1 holds them, D17 enforces them.**

| On a reporting date | Change |
|---|---|
| **Gate policy** | **Tightens** — no override permits a submission from provisional data. **This ticket** |
| **Priority** | Regulatory output rises to **tier A**, and **the sensitivity ladder rises with it** because the sensitivities are the market risk capital number (`D11-7`) |
| **Retention** | `p0-13`'s **full-detail freeze** — 4–20 dates a year at ~100m rows |

**All three have been driven from a Phase 0 guess at the calendar.** P6-02 makes it authoritative; this
ticket makes the gate consume it.

## In scope

- The tightened gate policy on submission dates, as configuration driven by D1's calendar
- **The distinction between blocking the submission and blocking the run** — the run may still complete
  and produce provisional management output; **only the submission is blocked**
- The escalation path when a reporting-date gate fails, which is a business continuity question rather
  than a technical one
- Verification that all three calendar consumers read the same source

## Out of scope

- The gate machinery — P0-12, already built
- The calendar's content — P6-02
- The returns engine — P6-11

## Acceptance criteria

1. **No override permits a submission to be produced from provisional data** — enforced, not procedural
2. The tightening is **configuration driven by D1's calendar**, not a hardcoded date list
3. A reporting-date gate failure **blocks the submission without blocking the run** — management output
   still produces, flagged
4. **All three consumers — gate policy, tier promotion and full-detail freeze — read the same calendar**
5. The escalation path is defined and has a named owner
6. A blocked submission and its resolution are recorded in the audit trail

## Notes

**Criterion 3 is the design point.** The instinct is to fail the whole run on a reporting date, which
converts a data-quality problem into an operational outage and creates enormous pressure to override —
the exact pressure the tightening exists to resist. **Blocking only the submission keeps the pressure
proportionate**: the bank still gets its numbers, it simply cannot file them until the break is resolved.

**Criterion 5 matters more than it reads.** A gate that blocks a regulatory submission with no defined
escalation will be overridden by whoever is available at 3am on a filing deadline, and the policy will
have achieved nothing. The path needs to be decided when nobody is under pressure.
