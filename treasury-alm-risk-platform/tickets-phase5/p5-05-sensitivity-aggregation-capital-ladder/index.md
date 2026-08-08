---
kind: ticket
title: "P5-05 — Sensitivity Aggregation & the Capital Ladder"
status: 0
---

# P5-05 — Sensitivity Aggregation & the Capital Ladder

**Wave 2. Depends on `tickets-phase2/p2-10`.**

Governing artifacts: `d11-market-and-counterparty-risk` §1.2, §2.2.1.

## The boundary, which the parent originally got wrong

Parent §1.5 once described D11 as computing *"sensitivities"*. **It does not.**

| Module | Owns |
|---|---|
| **D8** | Computes sensitivities **per subject**, under the grammar's conventions |
| **D11** | **Aggregates, buckets, limits and explains** them |

**This distinction decides whether the bought library's greeks are the bank's greeks. They are.** The
correction is recorded as `H1` and is applied in the parent body.

**The practical consequence: D11 must contain no second perturbation implementation.** Acceptance
criterion 1 is demonstrated by its *absence*, not by assurance — and the temptation to add one is real,
because a risk engine that bumps its own curves is simpler to wire than one that consumes someone else's
sensitivities.

## The ladder is the capital number

**Under Basel III/IV the standardised approach for market risk is the sensitivities-based method** —
delta, vega and curvature against prescribed risk weights and correlations — and D13 puts the bank on it.

**So the sensitivities *are* the capital number**, and two things follow:

1. **The node set must contain the prescribed regulatory tenor vertices exactly.** `p1-10` bound this in
   Phase 1: the platform vertex set is the **union of the 19 IRRBB band midpoints and the 10 prescribed
   capital vertices — 29 nodes** — so both regulatory views are exact subsets and **no interpolation sits
   between the ladder and the capital number**
2. **The ladder inherits a reporting-date tier — `D11-7`.** Risk measures sit in tier B, but regulatory
   output rises to tier A on submission dates. **The sensitivity ladder rises with them; VaR, being
   management-only, correctly stays tier B.** The two split, and **the tier belongs on the measure rather
   than on "risk measures" as a class**

## In scope

- Aggregation and bucketing of D8's per-subject sensitivities across desk, book, risk type and currency
- The **capital ladder** in the prescribed vertex set, feeding D13
- The diversification decomposition
- Tier assignment per measure, feeding P5-14 and `eod-window-and-degradation`

## Out of scope

- Sensitivity **computation** — D8
- Market risk RWA itself — D13, Phase 6
- P&L attribution — P5-09, though it consumes this

## Acceptance criteria

1. **D11 consumes D8's sensitivities and computes none of its own** — demonstrated by the **absence of a
   second perturbation implementation**
2. The node set contains the prescribed capital vertices **exactly**; nearest-neighbour mapping is not
   permitted
3. Aggregation is exact summation over D1's boundary sets, never a re-bucketing judgement
4. The ladder carries its **grammar version**, so a convention re-binding is visible as a version change
5. **The ladder's tier rises to A on regulatory reporting dates while VaR stays at B**, and this is
   configuration rather than a manual step
6. The ladder reconciles to D13's market risk capital input without an interpolation step

## Notes

**Re-binding a convention moves RWA while every version line a reviewer would check stays identical** —
the scenario version, the snapshot version, the position set. That is why criterion 4 exists and why the
grammar version is a reproducibility line in its own right (`G17`).

**Gating decision 5 is the one open question here, and it is answerable in an hour.** If "standardised"
in D13 §3 means the pre-FRTB standardised measurement method rather than the sensitivities-based one, the
capital number is a maturity-ladder computation and **criterion 2 weakens to the reconciliation argument
alone** — nothing else in this ticket moves (`D11-11`).
