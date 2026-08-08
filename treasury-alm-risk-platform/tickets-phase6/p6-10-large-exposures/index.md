---
kind: ticket
title: "P6-10 — Large Exposures"
status: 0
---

# P6-10 — Large Exposures

**Wave 4. Depends on P6-03, P6-05, and on D11's issuer aggregation from Phase 4.**

**Nothing needs designing here. Three owners needed naming, and they now have** — `D11-6`.

Governing artifacts: `d13-regulatory-reporting-and-capital` §5; `d11-market-and-counterparty-risk` §3.4.

## A separate Basel framework, unmentioned in the blueprint for four revisions

Large exposures is **not RWA.** It is a distinct regime with a **hard 25%-of-Tier-1 limit**, its own
connected-counterparty grouping, and its own return. The architecture critique raised it and it went
unmentioned in the parent body through four revisions.

**The three owners:**

| Part | Owner | Status |
|---|---|---|
| Exposure aggregation | **D11** | Delivered — Phase 4's issuer exposure aggregation |
| **The return** | **D13** | **This ticket** |
| The hard limit | The **Phase 4** limit framework | A limit type, delivered |

## The third counterparty grouping

Large exposures uses **connected clients** — which is **neither** the legal entity used for netting
**nor** the economic group used for concentration. **The regulatory connectedness test can capture parties
with no ownership link, through economic interdependence.**

> **This is the specific requirement that makes a single "parent counterparty" field insufficient.** A
> platform with one hierarchy will report concentration correctly and large exposures incorrectly, or the
> reverse.

D1 has carried three groupings since Phase 0 for exactly this reason.

## Aggregation crosses the collateral pool

**Issuer exposure aggregates across trading book, banking book *and collateral received*** — because a
bond held as received collateral is issuer exposure too.

This is the third consumer of the transaction-counterparty / issuer split established in `p0-06`. **The
split was justified for HQLA and risk weight; issuer risk is the one it was actually named for.**

## In scope

- Exposure aggregation to the **connected client group**, consuming D11's issuer aggregation
- The limit as a **percentage of Tier 1**, from P6-03
- **Exemptions and their conditions**, which are prescribed and per-exposure-class
- Breach reporting, and the feed to the Phase 4 limit framework
- The large exposures return itself

## Out of scope

- Exposure aggregation mechanics — D11
- The hard limit's enforcement — the Phase 4 limit framework
- Concentration for internal purposes — D10, and a **different grouping**

## Acceptance criteria

1. Aggregation uses the **connected clients grouping**, demonstrably distinct from the netting entity and
   the economic group
2. Exposure aggregates across **trading book, banking book and collateral received**
3. The limit is computed against **Tier 1 from P6-03**, not against an approximation
4. Exemptions are applied per prescribed conditions and are **individually justified**
5. Breaches feed the Phase 4 limit framework through its existing interface
6. **Concentration (D10) and large exposures (here) are reported from different groupings and both are
   correct** — the test that proves the three-hierarchy design was necessary

## Notes

**Criterion 6 is worth running deliberately once.** The three groupings look redundant in a data model and
the temptation to collapse them is strong — they are all "which counterparties are related". Showing that
concentration and large exposures give *different, individually correct* answers from *different*
groupings is the demonstration that justifies D1 carrying all three, and it is the check that catches a
well-meaning simplification.

**This ticket is cheap because the expensive parts were done elsewhere.** The data was assembled by D1's
group hierarchy, `p0-06`'s issuer split and D6's collateral inventory. **That was the point of naming
three owners rather than designing a module** — and it is a reasonable model for how a late-arriving
regulatory requirement should be absorbed.
