# P1-12 — Ratio Explainability & Reproducibility

**Wave 5. Depends on P1-06, P1-07.**

Governing artifacts: `d10-liquidity-and-funding` §10; `d2-instrument-position-core` §7.

## What this ticket is, and what it is not

**It is not a new capability.** P0-13 delivered retention, per-contract digests, retained engine builds
and the regeneration test in Phase 0 wave 5. Parent §6 lists *"D15 regeneration test"* against Phase 1;
that item is **already discharged**, and re-planning it is the mistake this ticket exists to prevent.

**What Phase 1 owes is coverage.** The ratios are a new class of output with new inputs — prescribed
factor versions, scenario versions, the grammar version, look-back coverage — and none of them was in
scope when the digest and regeneration machinery was specified.

## In scope

**Extend the reproducibility record to the ratios.** A stored LCR or NSFR resolves to:

| Line | From |
|---|---|
| Position and Balance set | P0-07 |
| Classification rule version | P0-06 |
| **Prescribed factor set version** | **P1-01** |
| Market snapshot version | P0-04, P1-05 |
| Reference data version | P0-01 |
| Encumbrance state, bitemporally | P0-10 |
| **Scenario and grammar version**, where the proxy contributes | **P1-11, P1-10** |
| **Look-back coverage** at the time of computation | **P1-09** |

**Ratio decomposition** — any ratio decomposes to the contracts driving it, so a movement is
**explainable line by line rather than merely observed** (D10 AC4). This is the acceptance criterion that
most often gets deferred and is hardest to retrofit, because it constrains how the computation stores
intermediate results rather than what it returns.

**Movement attribution** — a ratio move decomposes into **balance sheet change, market change and
factor/assumption change, separately.** This is test 3 of the executive summary's three tests the Board
can apply without technical knowledge.

**As-reported versus reproduced** — the two are distinguishable, per P0-13. A submitted LCR is an
immutable record; a regenerated one is a computation. Comparing them is frequently the point.

## Out of scope

- The retention, digest and regeneration machinery itself — **P0-13, already delivered**
- Model provenance across the inventory — Phase 7 (`D15-8`), though the tag should be designed in now
- The regulatory return — Phase 6

## Acceptance criteria

1. Any historic LCR or NSFR reproduces exactly under the factors, rules, classifications, prices and
   encumbrance in force at the time
2. **Point at any figure and ask why**: the answer is a rule, a version, the inputs that satisfied it and
   who approved it — retrievable in one query, not a research exercise
3. A ratio movement decomposes into balance sheet, market and factor change **separately**
4. The regeneration test's scope includes the ratios, and it fails loudly
5. As-reported ratios are immutable and distinguishable from reproduced ones
6. Look-back coverage is stored with the ratio, so a historic LCR shows how much of its collateral
   outflow rested on the proxy at the time

## Notes

**Criterion 6 is the one that will not be thought of.** The proxy retires as coverage fills, so a ratio
computed today and reproduced in three years will silently reproduce against *better* data unless the
coverage at computation time is stored. That turns a reproducible number into an irreproducible one in
the one case a supervisor is most likely to examine.

**This ticket is where Phase 1 earns the phrase "control environment" rather than "reporting tool".** The
executive summary's three tests are all answerable here, and all three fail quietly if decomposition is
deferred to a later phase.
