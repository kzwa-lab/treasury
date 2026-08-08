---
kind: ticket
title: "P0-04 — Market Data Snapshot, Fixings, FX & Projection Curves"
status: 0
---

# P0-04 — Market Data Snapshot, Fixings, FX & Projection Curves

**Wave 2. Depends on P0-01.**

Governing artifacts: `d3-market-data-and-curves`; parent §2.5, Appendix E (E2–E6).

## In scope

**Phase 0 scope is deliberately narrow** — snapshot infrastructure, fixings, FX and projection curves.
Prices land in Phase 1 with liquidity; volatility surfaces and credit spreads follow their consumers.

- **Snapshot infrastructure** — versioned, approved EOD snapshots plus intraday ticks. Snapshot version
  is a parameter of every projection call (D2 §4)
- **Fixings** — applied fixings stored against Legs, with the **three fixing states** including partial
  observation of a compounded-in-arrears period
- **FX rates** — spot and forward points, per-currency, with restriction status from D1
- **Projection curves** — **consume vendor-published curves in Phase 0**; build in-house from Phase 2
  when the pricing library is selected
- **Provenance tagging** — observed / interpolated / stale / proxied / model-implied / marked, surviving
  aggregation
- **The market-data fallback hierarchy** — owned here, not by D16. Instrument-specific, producing a
  value with a provenance tag
- Per-instrument staleness tolerance

## Out of scope

- Curve construction and bootstrapping in-house (Phase 2)
- Valuation (D8, Phase 2)
- Prices for HQLA valuation (Phase 1)

## Decision gate inside this ticket

**Whether to purchase a vendor market data history set now.** Historical-simulation VaR needs 1–2 years
of clean risk factor history; stressed VaR needs a 10-year window containing a genuine stress period.
Starting capture at go-live and reaching Phase 5 in year three yields two years with no stress period.

**Unlike the other pre-Phase-0 clocks, money can fix this one.** The risk factor history is a *distinct
dataset* from the EOD snapshot series — corporate-action-adjusted, gap-filled under a stated rule,
organised by risk factor. Deriving it from snapshots later is possible; deriving it *well* requires
adjustment decisions far cheaper made once, at capture.

The build proceeds either way, which is why this is a gate inside the ticket rather than a ticket.

## Acceptance criteria

1. Snapshots are versioned and approved; every projection call references one
2. Partial-observation compounded RFR periods resolve correctly
3. Provenance survives aggregation — a curve built partly from proxied inputs is identifiable as such
4. The fallback hierarchy is documented per data type, applied in order, and every application logged
   and counted
5. Vendor curve consumption works without presupposing the Phase 2 library
6. The history purchase decision is made and recorded

## Notes

**In Phase 0 because projection needs forward curves**, not because of valuation. A Phase 0 plan that
says "D3" without saying which curves produces a projection engine with nothing to project against.
