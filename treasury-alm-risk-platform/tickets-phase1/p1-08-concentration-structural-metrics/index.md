---
kind: ticket
title: "P1-08 — Concentration & Structural Metrics"
status: 0
---

# P1-08 — Concentration & Structural Metrics

**Wave 5. Depends on P1-02, P1-04.**

Governing artifacts: `d10-liquidity-and-funding` §5.

## The Phase 1 / Phase 3 split inside this section

D10 §5's internal metrics table is **mostly Phase 3**, because most of it needs behavioural models. Only
the contractual metrics land here, and the split must be explicit or the phase will be read as
delivering an internal liquidity view it does not deliver.

| Metric | Phase | Why |
|---|---|---|
| **Funding concentration** | **1** | Customer-level aggregation over contractual balances |
| **Encumbrance ratio** | **1** | P0-10's register |
| **Loan-to-deposit ratio** | **1** | Contractual |
| **Funding profile** — WAM of liabilities, secured/unsecured, wholesale/retail | **1** | Contractual |
| **Funding gap** | **1** | P1-02's contractual ladder |
| **Rollover risk** | **1** for the maturing profile; **3** for the rollover assumption | The window is contractual; the assumption is D9's |
| Survival horizon | **3** | D9 behavioural models, D14 scenarios |

## In scope

- **Funding concentration** — by depositor, by counterparty, by product, by tenor, **and across the
  group hierarchy**. This requires customer-level aggregation across accounts and legal entities, which
  is the specific capability D2 §4.4 preserved by rejecting pooled ingestion
- **Encumbrance ratio** — encumbered assets as a share of total assets, off the register's allocation
  grain
- **Loan-to-deposit**, **funding profile** and **contractual funding gap**
- **Maturing wholesale funding by near-term window** — the profile, without the rollover assumption

## Out of scope

- Survival horizon and everything else needing behavioural models — **Phase 3**
- Early warning thresholds and escalation — P1-14
- Market-signal indicators — P1-14

## Acceptance criteria

1. Concentration aggregates **across accounts and across the group hierarchy**, not per account
2. Every metric decomposes to the contracts driving it
3. The encumbrance ratio reads the allocation grain, not a position-level flag
4. Metrics reproduce historically under P0-13's guarantees
5. Each metric is labelled with its basis — contractual, and where an assumption enters, which one

## Notes

**Funding concentration deserves the emphasis it gets, because it is the metric the LCR does not
capture.** A bank can hold a compliant LCR and still fail because three depositors hold a quarter of its
funding. The ratio is a stress test with prescribed factors; concentration is a structural fact about who
the bank owes money to, and the two fail independently.

**The group hierarchy requirement is a D1 dependency worth confirming early.** Concentration across
connected counterparties needs the hierarchy maintained somewhere, and D1 §7 q3 records that it may not
exist today — in which case building it is work this ticket depends on rather than work it contains.
