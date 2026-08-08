# P3-14 — Internal Liquidity Metrics & Survival Horizon

**Wave 5. Depends on P3-04, P3-06, P3-13, and inherits `tickets-phase1/p1-02` and `p1-11`.**

**This is the ticket that completes what Phase 1 deliberately left undone**, and the phase table's
promise that liquidity is "delivered" in Phase 1 rests on it existing here.

Governing artifacts: `d10-liquidity-and-funding` §5, §6.

## What Phase 1 delivered and what was held back

Phase 1 gave the **regulator's** number and the **contractual** view, on the argument that LCR is a rules
engine over classified balances and needs no behavioural models. **That argument holds only for the
regulatory ratio.** The bank's own view — what would really happen, rather than what the regulator
prescribes — needs behavioural assumptions, and it is here.

| Metric | Phase 1 | Added here |
|---|---|---|
| Funding concentration, encumbrance ratio, LTD, funding profile, funding gap | ✓ contractual | — |
| **Rollover risk** | Maturing profile only | **The rollover assumption** (P3-06) |
| **The behavioural ladder** | — | **This ticket** |
| **Survival horizon** | — | **This ticket** |
| **Internal stress testing** | — | **This ticket** |

## In scope

- **The behavioural ladder** — P1-02's ladder on the behavioural basis, using P3-07's execution. **Not a
  second ladder**: the same bucketing, currency slicing and refinement rules, a different cashflow basis
- **Split 2 — core vs volatile balance** (D10's behavioural parameter, distinct from P3-04's split 3 and
  calibrated over the same P3-01 segmentation)
- **Survival horizon** — days until counterbalancing capacity is exhausted under a stress scenario,
  consuming P1-04's capacity and P3-13's scenarios
- **Liquidity stress testing execution** — P3-03's idiosyncratic, market-wide and combined scenarios run
  against the ladder and capacity, with each scenario parameterising deposit run-off, drawdown, haircut
  widening, market closure, rollover and collateral outflows
- **Rollover risk** — the near-term maturing profile with P3-06's assumption applied

## The boundary that must not blur

**These are internal assumptions, distinct from LCR's prescribed factors — the same engine, a different
factor set.** That is exactly why D14 owns the scenarios and P1-01 owns the prescribed factors, and why
neither may overwrite the other.

**A stressed internal number and the LCR are not comparable and must not be presented as though they
were.** One is the bank's view of what happens; the other is a prescribed calculation.

## Out of scope

- LCR and NSFR — Phase 1, and unaffected by anything here
- Reverse stress testing — **Phase 6**
- Intraday liquidity — Phase 4
- Counterbalancing capacity itself — P1-04

## Acceptance criteria

1. The behavioural ladder **reuses P1-02's engine** — demonstrated by the contractual basis reproducing
   P1-02's output exactly when run through the same path
2. Survival horizon computes per scenario and per currency, and states which scenario produced it
3. Split 2 is a **distinct parameter from P3-04's split 3**, over the shared segmentation, and the
   three-way reconciliation from P3-01 passes
4. Internal stress results are **labelled as internal** and cannot be confused with the regulatory ratios
   in any output
5. Every internal metric records the scenario version, overlay version and parameter versions behind it
6. Results reproduce historically

## Notes

**Criterion 1 is the ticket's main risk control.** Survival horizon is a *parameterisation* of machinery
that already exists, not a new engine. Built as a new engine, the bank ends up with two ladders that
disagree — and the disagreement will surface in a stress, which is the worst moment to discover it. The
test is deliberately constructed so that divergence is impossible to miss.

**Criterion 4 exists because the confusion is attractive.** An internal stressed survival horizon of, say,
45 days is a more intuitive number than a 118% LCR, and it will get quoted. It is not a regulatory
measure, it rests on the bank's own assumptions, and the label has to travel with it into every
downstream report — the same discipline D17 applies to the provisional flag.
