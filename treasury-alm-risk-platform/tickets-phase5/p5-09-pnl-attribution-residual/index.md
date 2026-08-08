---
kind: ticket
title: "P5-09 — P&L Attribution & the Residual"
status: 0
---

# P5-09 — P&L Attribution & the Residual

**Wave 3. Depends on P5-05, P5-07.**

**This module's most valuable output, and the single reconciliation that tests whether the rest of the
platform is internally consistent.** Build, not buy.

Governing artifacts: `d11-market-and-counterparty-risk` §2.3.

## Why it is more than a report

Parent §1.5 lists P&L attribution in passing. **It should be built as a control, not as a reporting
by-product** — it is the only thing in the platform that checks the modules against each other end to
end.

**The decomposition:** actual P&L, against risk-predicted P&L (sensitivities × observed factor moves),
against full-revaluation P&L (D8 against yesterday's and today's snapshots) — explained into rate move,
spread move, FX, vol, time decay, new trades, amendments, fees and **the residual**.

## Every module in the platform is on trial in that residual

| Residual source | The module it indicts |
|---|---|
| Sensitivities perturbed under a different convention than moves are expressed in | **D14's grammar** — the failure D8 describes as attributed to "higher-order effects" for as long as anyone will keep saying it |
| Snapshot changed between the valuation and the attribution | **D3** versioning |
| A trade booked late, amended without an event, or missing | **D2, D4, D16** |
| Model-implied cashflows changed because yesterday's exercise assumption was used | **D8's prior-day convention** — a deliberate, documented staleness that lands here as residual |
| Genuine higher-order effect | **Nobody.** This is the only legitimate residual |

**Note the fourth row: `p2-12`'s cycle-breaking decision and `p5-06`'s fan-out convention both surface
here**, which is the reason both were required to be stated rather than implicit. A documented staleness
is an explainable residual; an undocumented one is an unexplainable one.

## The design requirement

**The residual is decomposed and trended, never netted.**

**A platform that reports a small residual because two large errors offset is worse than one reporting a
large residual**, and the only defence is decomposition **by desk, risk type and instrument class.**

## In scope

- The three P&L series and the explain categories
- Residual decomposition by desk, risk type and instrument class, **trended over time**
- The reconciliation of sensitivity-predicted to full-revaluation P&L **within a stated tolerance**
  (D8 acceptance criterion 9's other half)

## Out of scope

- Backtesting — P5-13, a different comparison with a different P&L
- Sensitivity computation — D8
- Grading — D15

## Acceptance criteria

1. All three P&L series produce daily, from the same position set and version triple
2. **The residual decomposes by desk, risk type and instrument class and is never netted**
3. The residual is **trended**, so a widening one is visible before it is large
4. Sensitivity-predicted P&L reconciles to full-revaluation P&L within a **stated** tolerance
5. Each explain category traces to its driver — a rate-move contribution resolves to the factor moves
   that produced it
6. **The attribution is built to FRTB desk-level structure or explicitly not**, as a recorded decision
   (gating decision 4)

## Notes

**Criterion 6 is cheap now and impossible to retrofit cheaply.** The bank is on standardised capital, so
FRTB's desk-level P&L attribution test does not bind. **But building attribution to that structure costs
little now and is the precondition for any future internal-model application.** It deserves a deliberate
decision rather than a default.

**A large residual on day one is normal and is the point.** This ticket's value is that it converts
diffuse "the numbers don't quite tie" into a decomposition that names the module. Expect the first runs
to indict something real — most often a convention mismatch, which is what `p1-10`'s grammar and
`p2-10`'s conventions exist to prevent and what this measurement finally tests.
