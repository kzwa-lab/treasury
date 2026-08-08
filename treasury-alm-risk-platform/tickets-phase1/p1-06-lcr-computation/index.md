---
kind: ticket
title: "P1-06 — LCR Computation"
status: 0
---

# P1-06 — LCR Computation

**Wave 4. Depends on P1-01, P1-03, P1-04, P1-09.**

**The phase's headline deliverable, and one of its three highest-uncertainty tickets.**

Governing artifacts: `d10-liquidity-and-funding` §3.

```
LCR = Stock of HQLA / Total net cash outflows over 30 calendar days  ≥  100%
```

## In scope

**A rules engine over classified balances — not an aggregation of P1-02's ladder.** A retail current
account contributes 5% or 10% of its **balance** regardless of its contractual overnight cashflow.

**Numerator** — P1-04's buffer, with Level 2 and 2B caps applied by the **prescribed adjustment
calculation including the unwind of short-term secured funding**, not by naive truncation.

**Denominator** — gross outflows by category and prescribed factor, less inflows, with **inflows capped
at 75% of gross outflows**. The cap must be implemented as a constraint, not assumed non-binding: it
means the bank cannot rely on incoming repayments to offset an outflow shock.

**The three outflow categories that get forgotten**, each material and each consistently under-built:

1. **Collateral outflow from market moves** — the 24-month look-back, from P1-09
2. **Downgrade triggers** — CSA and issuance clauses requiring additional collateral on a ratings
   downgrade. They live in legal documentation, not trade economics, and are invisible unless captured as
   structured Contract attributes (P0-02)
3. **Excess collateral and substitution rights** — collateral held that the counterparty may recall

**Currency.** Computed in aggregate **and by significant currency, with no netting across currencies.**
Where a mismatch exists, the ability to raise the deficient currency by FX swap is a *management*
consideration and **not a regulatory offset** — under stress, the swap market for a thin currency is
precisely what closes. The per-currency position is shown plainly rather than hidden in a consolidated
ratio.

## Out of scope

- The regulatory **return** — D13-B, Phase 6. This ticket produces the ratio, not the submission
- Internal stress views and survival horizon — **Phase 3**
- Behavioural run-off of any kind. Prescribed factors only

## Acceptance criteria

1. **LCR reconciles to the regulator's own worked examples, including cap and haircut edge cases** — the
   HQLA composition caps, the 75% inflow cap, and the adjusted-stock calculation. This is the acceptance
   test; "the ratio computes" is not
2. Produced in aggregate and by significant currency, with **no cross-currency netting** at any level
3. The ratio **decomposes to the contracts driving it** — a movement is explainable line by line, not
   merely observed (P1-12)
4. Prescribed factors are configuration; a factor change is a rule edit and historic ratios reproduce
   under the factors in force at the time
5. Encumbrance changes propagate to HQLA without a batch delay
6. All three §3.3 outflow categories compute, with look-back coverage reported alongside the ratio
7. The 75% inflow cap binds correctly when tested with an inflow-heavy population

## Notes

**Criterion 1 is the ticket.** Everything else follows from it. The regulator publishes worked examples
precisely because the cap interactions are where implementations diverge, and an LCR that is wrong in
the adjusted-stock calculation is wrong by a plausible-looking amount that survives review.

**Why no behavioural models are needed, restated because it is load-bearing.** Every classification the
LCR requires — stable versus less-stable retail, operational versus non-operational wholesale, insured
versus uninsured, committed versus uncommitted, HQLA level — is a **rule over static and contractual
data** available from D1, D2 and D6 in Phase 0. None is a calibrated model. That is why Phase 1 works,
and it is the reason liquidity comes before ALM.

**One honest caveat to carry into any status report.** *"Complete LCR in Phase 1"* overstates it while
the look-back window is filling. The ratio computes; its collateral-outflow component rests partly on
P1-09's disclosed proxy for up to two years. Criterion 6 makes that visible rather than letting it read
as a finished number.
