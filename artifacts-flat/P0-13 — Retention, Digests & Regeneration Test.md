# P0-13 — Retention, Digests & Regeneration Test

**Wave 5. Depends on P0-07.**

Governing artifacts: `d2-instrument-position-core` §7.

## In scope

**Store inputs and as-reported outputs permanently; regenerate projections on demand.** Retention =
contract lifetime + 7 years after closure, configurable.

**Stored permanently:** Contract and Balance events (unscheduled only); versioned market snapshots;
**versioned reference data**; model parameter sets, scenario definitions and classification rule
versions; **externally-projected cashflows** (cannot be regenerated); **per-contract digests**;
**retained engine builds**; and **as-reported figures**, immutable.

**Regenerated:** cashflow projections and contract-level position detail — current EOD plus a 30–90 day
hot window. **Exception: regulatory reporting dates are frozen in full detail**, roughly 4–20 dates a
year at ~100m rows, removing regeneration from the critical path where it matters most.

**Lifetime-based retention** with the consequence handled: shared inputs cannot be purged per-contract,
so `shared input retention = max(contract lifetime) + N`, which for a book holding 30-year mortgages is
effectively permanent. Perpetual instruments start their clock at actual termination.

**The four determinism measures:**

1. **Per-contract digest stored every EOD** — converts a silently undetectable failure into one detected
   next day at contract granularity
2. Full-detail freeze on reporting dates
3. Engine builds retained as versioned artefacts
4. **The regeneration test** — select historic dates, regenerate, assert against stored digests and
   as-reported figures. Divergence is an incident

## Out of scope

- Archival storage tiering and infrastructure choices
- The full D15 model governance framework (Phase 7)

## Acceptance criteria

1. Any historic position, balance or cashflow set reproduces exactly on both temporal axes, under the
   models, rules, reference data and classifications in force at the time
2. Per-contract digests are written every EOD and are cheap enough to be unremarkable
3. Regulatory reporting dates freeze in full detail, driven by P0-12's calendar
4. The regeneration test runs on a schedule and fails loudly
5. As-reported figures are immutable and distinguishable from reproduced figures

## Notes

**"As-reported" and "reproducible" are different things.** Reproduction proves the number can be reached
again; the as-reported record proves what was submitted or stated on a date. Investigations need both,
and comparing them is often the point.

**This ticket exists because the retention strategy assumes determinism**, and bit-exact floating-point
equality across a decade of platform migrations is not a safe assumption. The digest is what makes the
assumption testable rather than hoped for. **It is in Phase 0–1, not Phase 7** — a safety net that
arrives after years of projections have been discarded is not a safety net.
