---
kind: ticket
title: "P5-02 — Proxy Spread Model"
status: 0
---

# P5-02 — Proxy Spread Model

**Wave 1. Depends on P5-01.**

**A Phase 5 model with a Phase 0 data dependency**, and one of the fourteen models that were named
nowhere until `D15-3`.

Governing artifacts: `d11-market-and-counterparty-risk` §4; `d3-market-data-and-curves` §3.4.

## Why this is not a minor input

**Most counterparties in a treasury book have no traded credit spread.** So for the majority of the
uncollateralised book, **CVA rests on a proxy** — which means:

> **For a book dominated by names with no traded CDS, this model drives CVA more than any observed
> spread does.**

It is a tier-1 model by any reading of D15's criteria, and until recently it had **no owner and no
inventory entry** — it was a §12 open question in D3 and nothing more.

## In scope

- **The proxy methodology** — mapping an unrated or untraded counterparty to a spread from sector,
  rating and region history
- **The data it needs**, which is **a different purchase from rates and FX** (`D11-4`): sector/rating
  credit spread history, which a rates-and-FX history purchase does not include
- **Fallback ordering** where even sector/rating data is thin, and the point at which the model declines
  to produce a spread rather than extrapolating
- **Inventory entry, owner, documented methodology and validation before first use**

## Out of scope

- Observed credit spread curves — D3
- CVA computation itself — P5-11
- The fallback hierarchy for market data generally — D3, and a separate model (`D15-3`)

## Acceptance criteria

1. The model is in D15's inventory with a named owner and is **validated before first use**
2. The methodology is documented well enough for a validator to reproduce a spread from inputs
3. **Sensitivity analysis is standard output** — this model cannot be backtested against a realised
   outcome, so sensitivity is its primary validation evidence (`D15-11`)
4. Where data is too thin to support a proxy, the model **declines rather than extrapolating**, and the
   affected exposures are reported as lacking a spread input
5. Proxied spreads are **tagged as proxied** and the tag propagates into CVA, so *"what share of our CVA
   rests on proxied spreads"* is a query
6. The spread history purchase is confirmed as covering sector, rating and region — or its absence is
   stated as a limitation

## Notes

**Criterion 6 is a purchasing question that should have been asked in Phase 0** and frequently is not,
because the history conversation is usually framed as rates and FX. **A vendor history set bought for
VaR will not necessarily carry credit spreads by sector and rating** (D11 §10 q5), and that gap is
invisible until CVA is built.

**Criterion 4 will feel wrong to whoever implements it.** A model that declines to produce an answer is
operationally awkward, and the pressure will be to extrapolate to *something*. But an extrapolated
spread on a thin sector is a number with no information in it, feeding a CVA that reaches D8's adjustment
stack and D7's accounting value. **Declining is the honest failure mode**, and criterion 5 makes the
alternative visible where declining is not acceptable.
