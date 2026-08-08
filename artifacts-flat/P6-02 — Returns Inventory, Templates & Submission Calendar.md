# P6-02 — Returns Inventory, Templates & Submission Calendar

**Wave 1. No build dependencies.**

**Non-engineering, and it is a list nobody currently has.**

Governing artifacts: `d13-regulatory-reporting-and-capital` §6, §10 q2.

## Why this is wave 1

D13's open question 2 is *"which local returns, in what templates, on what calendar?"* — and the answer
determines the size of P6-11.

**The configurable design holds regardless of the answer.** That is the point of the "regulatory
reporting is configuration, not code" scope decision. **But the build cannot be sized without the list**,
and the list is a regulatory-reporting exercise with a lead time, not something an engineer can derive.

## In scope

- **The return inventory** — every local return the bank must submit, with its regulatory basis
- **Templates** — structure, validation rules and cross-checks per return
- **The submission calendar**, which is more load-bearing than it appears (below)
- **Cell-level data definitions** — what populates each cell, expressed as a query over Positions,
  Balances and computed measures
- **Cross-return consistency requirements** — which figures appear in more than one return and must agree

## The submission calendar has three consumers, not one

**D13 defines the dates, D1 holds them, D17 enforces them.** The calendar drives:

1. **P6-12's gate tightening** — no override may permit a submission from provisional data
2. **The tier A priority inversion** — regulatory output rises to tier A on submission dates
   (`eod-window-and-degradation` §5.1), **and the sensitivity ladder rises with it** because the
   sensitivities are the market risk capital number
3. **P0-13's full-detail freeze** — roughly 4–20 dates a year at ~100m rows, which removes regeneration
   from the critical path for precisely the dates a regulator asks about

**That third consumer has been live since Phase 0**, driven by whatever calendar was configured then.
This ticket is where it becomes authoritative.

## Out of scope

- The engine that generates returns — P6-11
- Pillar 3 — P6-15, though its consistency requirement traces here
- The computations themselves — P6-03 to P6-06, P6-10

## Acceptance criteria

1. Every required return is inventoried with its regulatory basis, template and frequency
2. **The submission calendar is held in D1** as versioned reference data, and D17 consumes it
3. Cell-level definitions are expressed as **queries over existing measures**, not as new computations —
   a cell requiring a new computation is a finding about P6-03 to P6-10, not a return-engine feature
4. Cross-return consistency requirements are **enumerated** — which figures must agree across which
   returns
5. **The Phase 0 freeze calendar is reconciled against this one**, and any divergence is corrected
6. Where the bank's obligations are unclear, the ambiguity is recorded rather than resolved by assumption

## Notes

**Criterion 3 is a design test disguised as a documentation task.** If a large number of cells need
computations that do not exist, the RWA and capital tickets have been scoped too narrowly — and finding
that in wave 1 is far better than finding it in wave 4 when the engine is being wired.

**Criterion 5 catches a quiet drift.** P0-13's full-detail freeze has been running against a Phase 0
guess at the reporting calendar for several years by now. If the real calendar differs, some historic
reporting dates were never frozen in full detail — which is recoverable only if it is noticed.

**Gating decision 1 changes this list materially.** If the group structure investigation finds real
subsidiaries or foreign operations, **solo and consolidated returns are both required** and the inventory
roughly doubles.
