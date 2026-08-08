# P5-16 — Operational Readiness

**Wave 6. Depends on P5-13, P5-14, P5-15.**

## What goes live

**Risk measures that limits are set against**, and — for the counterparty book — **a measure that
replaces one already in production.**

Two distinct operational changes, and the second is the riskier:

| Change | Nature |
|---|---|
| VaR, ES, stressed VaR, P&L attribution | **New.** No incumbent to parallel against for most banks of this size |
| **PFE replacing Phase 4's current exposure** in the counterparty limit feed | **A live control changing its input.** Limits that have been operating for a phase now measure something different |

**The second is where a limit framework silently starts breaching, or silently stops.** A counterparty
that was inside its limit on current exposure may be outside it on simulated PFE, and the transition must
be managed rather than deployed.

## In scope

- **Limit recalibration before the measure changes.** PFE is a different number from current exposure;
  the limits set against the old measure need re-setting, **with the front office told before it happens,
  not after a trade is blocked**
- **Parallel running of the counterparty measure** — current exposure and PFE side by side for a stated
  period, with the population that changes limit status identified in advance
- **XVA go-live communication.** Full XVA replaces Phase 4's simplified CVA, moving reported fair values.
  **It is a methodology change, not a market move**, and finance, audit and ALCO need it framed that way
  in advance — otherwise the first month-end produces a variance investigation of something already
  explained
- **Backtest series start**, from first production rather than when the model is considered final — the
  record only becomes diagnostic with length
- **Training** for the risk team on the uncovered-position rule: **a position with no risk factor history
  contributes zero VaR unless it is reported uncovered**, and that is a number they must know how to read
- **Operational acceptance of the exposure simulation schedule** — weekly full with daily roll-forward, or
  whatever was approved, running on its own budget
- **Rollback**: Phase 4's current exposure remains computable

## Out of scope

- The measures — P5-07 to P5-12
- Backtest grading — D15
- The limit framework itself — Phase 4

## Acceptance criteria

1. **Limits are recalibrated for PFE before the feed switches**, and the population changing limit status
   is identified and communicated in advance
2. Current exposure and PFE have run in parallel for a stated period
3. **The XVA transition is quantified and communicated** to finance, audit and ALCO **before** the first
   reporting period that carries it
4. The backtest series starts at first production and is continuous
5. Risk staff can read and act on the **uncovered proportion** of the book
6. The exposure simulation runs on its approved schedule and budget, with contention resolved
7. Phase 4's current exposure remains computable for a stated period

## Notes

**Criterion 1 is the one that will cause an incident if skipped.** Switching a live limit's input measure
without recalibrating is how a bank discovers on a Tuesday morning that a third of its counterparties are
in breach — none of them because anything changed in the book. **The breaches are real in the sense that
the new measure is better, and they are not events.** Managing that transition is the ticket.

**Criterion 3 repeats a lesson from P5-11 because it is the recurring shape of this phase.** Two of
Phase 5's deliverables *replace measured numbers rather than filling absences*, and in both cases the
step change is a methodology change dressed as a movement. **Both need explaining before they happen.**
