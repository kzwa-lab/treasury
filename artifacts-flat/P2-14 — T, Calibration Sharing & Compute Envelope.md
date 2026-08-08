# P2-14 — `T`, Calibration Sharing & Compute Envelope

**Wave 5. Depends on P2-13.**

Governing artifacts: `d8-valuation-and-analytics` §6, §6.1; `eod-window-and-degradation` §6.

## `T` is a Phase 2 deliverable, not a Phase 5 discovery

**`T` — one full revaluation pass of the fair-valued book — is the number none of the platform's compute
planning can be done without**, and it is **measurable as soon as the wrapper runs.**

Everything downstream is a multiple of it: ~250 `T` for VaR, ~250 `T` for stressed VaR, 10⁴–10⁵ `T` for
exposure profiles, ~10 `T` for attribution. **Make it a Phase 2 deliverable, published, rather than a
Phase 5 discovery** — by Phase 5 the grid licence is signed.

## Calibration sharing stops being an optimisation and becomes the design

**Across 250 historical scenarios the calibration work repeats 250 times unless the wrapper shares it per
derived snapshot.**

It is a **wrapper property**, so it is buildable — **but only if designed in before the wrapper exists.**
Retrofitting calibration sharing into a wrapper whose call pattern assumes one snapshot per request is a
rewrite of the thing every consumer depends on.

**Caching is otherwise weak here**, for the same reason as D2's projection: the snapshot moves daily, so
everything market-dependent invalidates daily. **What caches well is the market-independent part** —
schedule resolution, subject translation, and calibration results shared across instruments priced off
the same curve.

## The envelope, re-sized

| Driver | Phase | Scale |
|---|---|---|
| Daily full-book revaluation | 2 | One pass — **this is `T`** |
| **Sensitivity ladder across the platform vertex set** | **2** | **29 nodes, not ~19 — `D14-6`** |
| D9's IRRBB shocks | 3 | ~10× |
| Historical simulation VaR | 5 | 250×+ daily |
| PFE / exposure profiles | 5 | Monte Carlo per netting set across time steps |

**Two things land in Phase 2 that the original envelope did not carry:**

- **~53% more perturbations per sensitivity pass** than the grammar assumed, every night, from this
  phase (`D14-6`)
- **The ladder rises to tier A on regulatory reporting dates** (`D11-1`), so it competes with the
  submission path on exactly the nights the window is tightest

**Monte Carlo does not parallelise like the rest.** Valuation parallelises cleanly by subject; a single
Monte Carlo valuation parallelises **by path**, with a different granularity and memory profile. The grid
must handle both.

## In scope

- **Measure and publish `T`**, with the population and versions it was measured against
- Calibration sharing per derived snapshot, demonstrated at fan-out
- The Phase 2 compute envelope, and the numbers `eod-window-and-degradation` §6 needs
- Feeding the grid licensing quantity back to P2-02 if the contract is not yet closed

## Out of scope

- Phase 5 sizing decisions — but `T` is what enables them
- The EOD window itself — D17

## Acceptance criteria

1. **`T` is measured and published**, with its population, versions and hardware basis stated
2. **Calibration results are shared across subjects priced off the same derived snapshot, demonstrated at
   the 250-snapshot fan-out and not only at one**
3. The sensitivity ladder's 29-node cost is measured and reported into `eod-window-and-degradation` §6
4. Monte Carlo path-parallel and subject-parallel workloads both run on the grid design
5. The envelope states what fits in the window and what does not, rather than asserting it fits

## Notes

**Criterion 2's "at the 250-snapshot fan-out" is deliberate.** Calibration sharing demonstrated on one
snapshot proves nothing — the whole benefit appears only at fan-out, and a wrapper that shares
correctly at n=1 can still recalibrate per request at n=250 without anyone noticing until Phase 5.

**`T` is a number that will be quoted for a decade.** It should be published with its basis attached —
population, versions, hardware — because a `T` measured on a partial book or a since-upgraded grid is
worse than no `T` at all, and it will be used to size a licence.
