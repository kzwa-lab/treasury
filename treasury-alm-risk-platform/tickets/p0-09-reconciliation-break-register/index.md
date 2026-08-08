---
kind: ticket
title: "P0-09 — Reconciliation Engine & Break Register"
status: 0
---

# P0-09 — Reconciliation Engine & Break Register

**Wave 3. Depends on P0-02, P0-08.**

Governing artifacts: `d16-ingestion-reconciliation-dq` §5; parent §4.

## In scope

**The principle:** the platform is the sub-ledger and the GL is the control account. Differences are
exceptions to be explained, never adjustments to be plugged.

**Reconciliations buildable in Phase 0:**

| # | Reconciliation | Status in Phase 0 |
|---|---|---|
| 2a | Position to **custodian / CSD** — **three-way**, including tri-party basket | **Buildable** |
| 2b | Position to **nostro** statements | **Buildable — and it gates the tier A path** |
| 2c | Position to counterparty / CCP statements | Buildable where statements are machine-readable |
| 4 | Dual-mastered attributes, D1 versus upstream | Buildable |
| 1 | Sub-ledger to GL | **Not buildable until Phase 4** — D7 supplies the sub-ledger side |
| 3 | Trade population to confirmation status | **Not buildable until Phase 4** — D5 supplies confirmations |

**A break is an object with a lifecycle, not a daily difference** — detected → classified →
investigating → resolved / accepted / escalated. Stable identity across days: the same break on five
consecutive days is **one five-day-old break**, not five breaks.

Each break carries detection date, reconciliation, classification (timing / error / missing / valuation
difference), materiality, owner, age, notes and resolution. **Resolution requires a stated cause** — a
difference that vanishes because the data changed is still a break to explain.

**Materiality and tolerance per reconciliation**, and the **data-good state per domain per business
date** — clean, provisional or blocked — which P0-12 gates on.

**Break classification distinguishes population differences from valuation differences.** A small MTM
difference is a model disagreement to log and trend; a missing trade is an incident.

**Reconciliations are tiered** — nostro gates tier A because a wrong cash position is a wrong funding
decision; custodian, counterparty and dual-mastered gate tier B.

## Out of scope

- Break *resolution*, which belongs to the business owner of the break
- GL and confirmation reconciliations — Phase 4
- Gate enforcement — P0-12

## Acceptance criteria

1. Breaks persist with stable identity across days; ageing is correct and escalation automatic
2. Resolution requires a stated cause; a disappearing difference does not auto-close
3. The three-way custodian reconciliation handles tri-party baskets, where the agent's record is
   definitionally correct and the platform's is the copy
4. Data-good state is published per domain per business date
5. Reconciliation tiering is explicit — nostro on the tier A path, the rest after
6. Reconciliation results are retained as auditable evidence

## Notes

**Phase 0 cannot run the GL reconciliation**, which parent §4 treats as the primary control. Three of
the four reconciliations need Phase 2 or Phase 4 modules. This is a known Phase 0–3 gap and should be
stated to auditors rather than discovered — an interim account-level GL comparison is an open question.
