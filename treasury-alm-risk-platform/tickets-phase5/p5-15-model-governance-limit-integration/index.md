---
kind: ticket
title: "P5-15 — Risk Model Governance & Limit Integration"
status: 0
---

# P5-15 — Risk Model Governance & Limit Integration

**Wave 5. Depends on P5-07, P5-10, P5-11.**

Governing artifacts: `d11-market-and-counterparty-risk` §1.4, §9; `d15-model-governance` §3, §4.

## Part 1 — the models enter the inventory

Phase 5 introduces the platform's most mathematically complex models, and **most of them cannot be
backtested.**

| Model | Backtestable? | Primary validation evidence |
|---|---|---|
| VaR / ES | **Yes** — P5-13's series | Backtest exceptions, graded by D15 |
| Stressed VaR | No realised outcome | Sensitivity analysis, benchmark comparison |
| **PFE / EPE simulation** | No | **Sensitivity analysis** and the full-revaluation benchmark |
| **XVA** | No | Sensitivity analysis; proxy proportion disclosure |
| **Proxy spread model** | No | Sensitivity analysis (P5-02) |

**`D15-11` applies squarely here: sensitivity analysis is the primary validation evidence for every model
that cannot be backtested**, and about two-thirds of this phase's inventory is in that category. It is
standard output, not an on-request extra.

- **Validation before first use** for each
- **Approved usage as named consumers**, not free text — XVA reaching D8's adjustment stack and D7's
  accounting value is a named consumption with an accounting consequence
- **The D9/D11 book intent completeness check belongs in D15's inventory**, not in either module's
  self-assessment (P5-07 criterion 3)

## Part 2 — limit framework integration

**D11 does not own limit values.** Three artifacts disagreed about this and two were stale.

| D11 supplies | The Phase 4 limit framework owns |
|---|---|
| **Measure definitions** — what a counterparty exposure is, how PFE is computed | The limit values themselves |
| **Utilisation** against those measures | Thresholds, escalation, breach workflow |

**This is a hand-off, not a build.** The framework arrived in Phase 4; this ticket connects Phase 5's
measures to it — including the **counterparty limit** whose feed the Phase 4 carve-out established and
which now upgrades from current exposure to simulated PFE.

**Large exposures needs three owners named, not designed — `D11-6`.** The aggregation is D11's, the
return is D13's, and the hard 25%-of-Tier-1 limit is a limit type in the Phase 4 framework. **The data is
already assembled** — D1's group hierarchy, the issuer/obligor split, and D6's collateral inventory,
since a bond held as received collateral is issuer exposure too.

## In scope

- Inventory entry, owner, methodology and validation for every Phase 5 model
- Sensitivity analysis as standard output across the non-backtestable set
- Measure definitions and utilisation feeds to the Phase 4 limit framework
- Issuer exposure aggregation reaching D13 for the large exposures return

## Out of scope

- Limit values, thresholds and breach workflow — the Phase 4 framework
- The large exposures return — D13, Phase 6
- Backtest grading — D15

## Acceptance criteria

1. Every Phase 5 model is inventoried with an owner and **validated before first use**
2. **Sensitivity analysis is standard output for every model that cannot be backtested**
3. **D11 supplies measure definitions and utilisation, never limit values**
4. The counterparty limit feed upgrades from Phase 4's current exposure to simulated PFE **without a
   change to the limit framework's interface**
5. **Issuer exposure aggregates across trading book, banking book and collateral received**, using the
   transaction-counterparty / issuer split
6. The D9/D11 book intent completeness check runs from D15's inventory as a control

## Notes

**Criterion 4 is a test of whether the Phase 4 carve-out was designed properly.** The carve-out delivered
current exposure into the limit framework precisely so that Phase 5's arrival would be **an upgrade of a
feed rather than the creation of one.** If the interface has to change, the carve-out was built as a
stopgap rather than as a first version — worth knowing, because the same pattern recurs with the D6
encumbrance register in Phase 4.

**Criterion 5 closes a gap the critique raised four revisions before anyone owned it.** Without the
issuer/obligor split, the bank cannot answer **how much exposure it has to a single issuer across trading
book, banking book and collateral holdings** — which is a large exposures question as much as a risk one.
The split was justified for HQLA and risk weight; **issuer risk is the third consumer and the one it was
actually named for.**
