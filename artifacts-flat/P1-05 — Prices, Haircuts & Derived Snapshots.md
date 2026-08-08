# P1-05 — Prices, Haircuts & Derived Snapshots

**Wave 2. Depends on P0-04.**

Governing artifacts: `d3-market-data-and-curves` §3, §5, §10; parent Appendix `E4`.

## Why D3 returns in Phase 1

Parent `E4` narrowed D3's Phase 0 scope to **snapshot infrastructure, fixings, FX and projection
curves** — everything the projection engine needs and nothing else. **Security prices land in Phase 1
with D10**, because that is the first consumer that needs them: counterbalancing capacity is market value
less haircut, and neither exists in Phase 0.

The snapshot, versioning, provenance and governance infrastructure is already built. This ticket
populates it with a new observable class rather than extending it.

## In scope

- **Security prices** for the marketable book — the HQLA candidates, the wider liquid portfolio, and the
  non-HQLA marketable securities P1-04 needs for its second capacity tier
- **Haircut inputs** — market-observed haircuts, and the reference data behind central bank haircut
  schedules
- **Provenance on every price** — observed, interpolated, stale, proxied, model-implied or marked, and
  **provenance survives aggregation** (`E5`). A buffer number must be able to answer *"how much of this
  rests on a marked price"*
- **The fallback hierarchy applied to prices** — per-instrument staleness tolerance and the substitution
  order (D3 §1.5, §5), which is D3's and not D16's
- **Derived snapshots** — the shock-applied snapshot object P1-11's scenarios and P1-09's proxy both
  consume, generated once per scenario and shared rather than rebuilt per consumer
- **Independent price verification** structurally enabled: the multi-mark data structure and retained
  differences

## Out of scope

- Curve construction in-house — **Phase 2**. Phase 0's decision to consume vendor-published curves stands
- Volatility surfaces — Phase 2, with the library
- Credit spread curves — Phase 3 or 5, and gated on the CSRBB decision (`D3-3`)
- The valuation that consumes these prices — D8, Phase 2

## Acceptance criteria

1. Every security in the marketable book has a price with a provenance tag, on every snapshot date
2. Provenance survives aggregation to buffer and ratio level — the question *"what share of HQLA rests on
   a marked or proxied price"* is a query, not an investigation
3. The fallback hierarchy is configuration, versioned, and its application is recorded per instrument per
   date rather than inferred
4. A derived snapshot is a versioned object with an identity, materialised rather than recomputed
5. Historic snapshots reproduce under P0-13's guarantees, prices included

## Notes

**The fallback hierarchy is a model and belongs in D15's inventory — `D15-3`.** It *chooses a number*
when the observed one is missing, by a documented rule with judgement in it, and a rule that substitutes
one price for another is a model whatever file it lives in. It needs an owner, a documented methodology
and **validation before first use**, which for this hierarchy means Phase 1 rather than Phase 7. It is
one of the fourteen platform models that were named nowhere.

**Materialise derived snapshots, do not perturb on demand — `D11-9`.** The tempting answer at volume is
to compute perturbations transiently. An unmaterialised perturbation is **not reproducible**, and every
reproducibility guarantee rests on the derived snapshot being an object with a version. Bounded retention
— full for reporting dates, short for the daily cycle — keeps both properties. The volume argument gets
much sharper in Phase 5 at ~250 snapshots a day, which is why the pattern is set now.
