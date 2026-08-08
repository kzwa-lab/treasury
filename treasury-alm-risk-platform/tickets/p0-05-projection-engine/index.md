---
kind: ticket
title: "P0-05 — Schedule Generation & Cashflow Projection"
status: 0
---

# P0-05 — Schedule Generation & Cashflow Projection

**Wave 3. Depends on P0-03, P0-04.**

Governing artifacts: `d2-instrument-position-core` §2.2, §4.

## In scope

**The pure function:**

```
project(Contract, as_of_date, basis, assumption_set, horizon,
        market_snapshot_version, reference_data_version) → Cashflow[]
```

Same inputs, same outputs, always. No ambient configuration, no hidden state.

**Seven-stage pipeline:** schedule generation → notional resolution → rate resolution → cashflow
assembly → contingency and optionality → behavioural overlay (interface only in Phase 0; models arrive
Phase 3) → classification tagging.

**Schedule generation** is where most defects live and needs an **exhaustive convention test suite** —
every day count, business day convention, stub type, roll convention and calendar combination in use.

**Rate resolution with three fixing states** — a past reset is a stored fact, a future reset is a market
query, and **a compounded-in-arrears current period is partly observed**. The third is now standard
across the interest rate complex and is not an edge case.

**Five rate treatments** projecting correctly, including **externally-projected cashflows stored rather
than regenerated** — the one documented exception to the regeneration strategy.

**Cashflow record** carrying payment date, accrual period, amount, currency, type, certainty, basis,
rate treatment **with next reset date**, assumption reference and inherited classification.

**Parallelisation by Contract**, and cache invalidation that correctly recognises **the floating-rate
book invalidates daily** because forward curves move.

## Out of scope

- Behavioural models themselves (Phase 3) — the overlay interface is built, the models are not
- `exposure_by_bucket` for non-linear positions — that is D8, Phase 2
- Valuation of any kind

## Acceptance criteria

1. The convention test suite passes exhaustively, including partial-observation RFR periods
2. Every Part 1 instrument class projects, including the five rate treatments
3. Contractual and behavioural bases both produce output; the behavioural path is wired even though
   models arrive later
4. Identical inputs produce byte-identical output across runs
5. Projection over the full population completes within the **90-minute tier A critical path** for the
   short-end subset and the **3-hour full-run budget** overall
6. Externally-projected cashflows are stored, versioned and retained

## Notes

**Sizing must assume the floating book invalidates its cache every day.** Caching helps fixed-rate and
matured-schedule contracts only, and the compute budget must be set on that basis rather than on an
optimistic reuse assumption.
