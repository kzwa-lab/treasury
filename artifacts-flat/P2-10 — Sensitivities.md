# P2-10 — Sensitivities

**Wave 4. Depends on P2-07, P2-08, and inherits `tickets-phase1/p1-10`.**

Governing artifacts: `d8-valuation-and-analytics` §3.3.

## The set

Delta, gamma, vega, theta; **curve-bucketed PV01/DV01 and key rate durations**; FX delta; credit spread
sensitivity; and the duration measures D9 consumes for the banking book.

## The convention problem, which is the whole ticket

**A 1bp bump applied to zero rates, to par rates, or to instantaneous forwards produces three different
DV01s on the same trade.**

This is exactly the problem D3 solved for shocks by making shocked curves **derived snapshots** rather
than per-consumer transformations, and the same answer applies here: **the perturbation convention is
versioned configuration, shared with D14's shocks** — which is `p1-10`'s transformation grammar,
delivered in Phase 1 precisely so this ticket has something to bind to.

**If D8 bumps zero rates and D14 shocks par rates**, the sensitivity-predicted P&L will not reconcile to
the full-revaluation P&L, and **the difference will be attributed to "higher-order effects" for as long
as anyone is willing to keep saying that.**

## What rests on it — more than reconciliation

**Market risk capital is standardised, and under Basel III/IV the standardised approach is itself
sensitivities-based** (`D11-1`). So:

- **These sensitivities are an input to market risk RWA**, not merely to a P&L attribution
- **The node set must contain the prescribed regulatory tenor vertices exactly**, or an interpolation
  sits between the ladder D8 produces and the capital number computed from it. `p1-10` bound this: the
  platform vertex set is the **union of the 19 IRRBB band midpoints and the 10 prescribed capital
  vertices — 29 nodes**, so both regulatory views are exact subsets

## In scope

- The full sensitivity set, computed under the grammar's conventions
- **The 29-node ladder**, with the grammar version recorded on every result
- Bucketing consistent with D1's boundary sets
- The reconciliation harness proving sensitivity-predicted P&L against full revaluation

## Out of scope

- **Sensitivity aggregation, bucketing across subjects, limits and explanation — D11.** D8 computes them
  per subject; D11 aggregates. **This distinction decides whether the bought library's greeks are the
  bank's greeks. They are** (parent §1.5)
- P&L attribution — D11
- The grammar itself — `p1-10`

## Acceptance criteria

1. Perturbation conventions are **shared configuration with D14's shocks**, resolved by grammar version
2. **The one-line test passes:** `DV01 × 200` and the +200bp parallel ΔEVE are produced by the same
   transformation at different magnitudes, so the difference is attributable to the floor and to
   higher-order terms **and to nothing else**
3. Sensitivity-predicted P&L reconciles to full-revaluation P&L **within a stated tolerance**, and the
   tolerance is stated rather than discovered
4. The node set contains the prescribed capital vertices **exactly** — no nearest-neighbour mapping
5. The grammar version is on every sensitivity result, as a reproducibility line
6. No consumer re-perturbs: a consumer needing a different convention has found a grammar question, not
   a licence to bump its own

## Notes

**Criterion 3's "stated tolerance" is doing real work.** Without a stated tolerance, any residual is
acceptable by default and the reconciliation stops being a control. With one, a widening residual is a
signal — and it is the earliest available signal that a convention has drifted or a model has changed.

**The 29-node ladder is ~53% more perturbations than the grammar originally assumed — `D14-6`.** That
lands in this phase, not Phase 5, and it compounds with the ladder's promotion to tier A on regulatory
reporting dates. P2-14 carries the sizing consequence; it is noted here because this is where the volume
is generated.
