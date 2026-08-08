---
kind: ticket
title: "P5-14 — Exposure Simulation Tier, Budget & Frequency"
status: 0
---

# P5-14 — Exposure Simulation Tier, Budget & Frequency

**Wave 5. Depends on P5-10.**

**The largest workload in the platform, and it currently has no tier, no budget and no frequency.**

Governing artifacts: `d11-market-and-counterparty-risk` §5.5; `eod-window-and-degradation` §5.4, §6.

## Risk measures are five workloads, not one tier row — `D11-7`

`eod-window-and-degradation` §5 puts risk measures in **tier B, same business day.** That is **one tier
for four workloads with different urgencies** — plus a fifth that belongs in none of them.

| Measure | Tier | Note |
|---|---|---|
| VaR / ES, stressed VaR | **B** | Management measure. Back-fillable |
| **Sensitivity ladder** | **B, rising to A on reporting dates** | It **is** the capital number (P5-05), so the regulatory inversion catches it |
| Current exposure, SA-CCR | **B** | Formula over existing data, cheap. Phase 4 |
| P&L attribution | **B** | Its output is tomorrow's backtest input — **skipping breaks a control, not a report** |
| **PFE / EPE simulation and full XVA** | **Unassigned — and it is the largest compute in the platform** | This ticket |
| Settlement exposure | **Intraday** | Outside the EOD contract entirely. Phase 4 |

**The tier belongs on the measure, not on "risk measures" as a class.**

## The workload that fits no tier

`eod-window-and-degradation` §5 **has no row for the exposure simulation**, and it is none of the four
tiers:

- **Larger than everything else combined**
- **Not same-day-critical**
- **Not skippable either** — XVA feeds D7's accounting values and D13's capital

**Recommendation: a scheduled workload with its own budget and its own frequency** — most plausibly
**weekly full with a daily approximate roll-forward.**

This is the same recommendation D14 makes for reverse stress testing, for the same reason: **a workload
that does not fit the nightly window should be planned as one that does not, rather than found not to.**

## In scope

- **Assigning a tier, budget and frequency** to the exposure simulation, distinct from "risk measures"
- **The roll-forward method** between full runs, and its staleness characteristics
- Writing the row into `eod-window-and-degradation` §5, which has no place for it today
- Per-measure tier assignment for the other four workloads

## Out of scope

- The simulation itself — P5-10
- The EOD window and degradation order — D17, though this ticket feeds them

## Acceptance criteria

1. **The exposure simulation has a declared tier, budget and frequency**, distinct from "risk measures"
2. `eod-window-and-degradation` §5 carries the row, and §6's sizing reflects it
3. The roll-forward method is documented, and **its staleness is stated** — which is the thing being
   approved (gating decision 3)
4. The sensitivity ladder's reporting-date promotion is configuration, and **VaR does not rise with it**
5. Contention with other off-window workloads — reverse stress, model impact statements (`D15-9`) — is
   resolved explicitly rather than by whichever runs first
6. The frequency has **two approvers**, because it has two consumers with different tolerances

## Notes

**Criterion 6 reflects a real split.** The exposure simulation's frequency is **an accounting input via
XVA and a limit input via PFE**, and those two consumers tolerate staleness differently. Finance approves
the XVA input; risk approves the limit input. **The staleness is the thing being approved**, not the
schedule — a weekly-full/daily-roll-forward design means the accounting value rests on a week-old full
simulation, which is a decision someone must actually take.

**Criterion 5 is where three off-window workloads finally meet.** The exposure simulation, reverse stress
testing and the model impact statement (`D15-9`) all sit outside the nightly window with their own
budgets. Left unresolved, they contend for the same grid and **the contention is invisible until two run
on the same night.**
