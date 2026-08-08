---
kind: ticket
title: "P0-08 — Ingestion, Staging, Data Quality & Suspense"
status: 0
---

# P0-08 — Ingestion, Staging, Data Quality & Suspense

**Wave 2. Depends on P0-01, P0-03.**

Governing artifacts: `d16-ingestion-reconciliation-dq` §3, §4.

## In scope

**Adapter pattern** — one adapter per source, each handling protocol, format and mapping into a
**canonical staging model**. Beyond the staging boundary no downstream module contains source-specific
logic.

**Feed inventory for Phase 0:**

| Source | Note |
|---|---|
| Core banking | Loans, deposits, overdrafts, cards, commitments; customer master |
| **Incumbent TMS** | **Treasury contract population and lifecycle events. Throwaway by design** — replaced by D4 in Phase 4. Without it, Phases 0–3 have an empty treasury book |
| Custodian / CSD | Holdings, settlement status, movements |
| Tri-party collateral agent | **Basket composition, reallocated daily by the agent** |
| Correspondent banks | Nostro statements — **event granularity with timestamps, not EOD balances** |
| Reference and market data vendors | Feeding P0-01 and P0-04 |
| Corporate action announcements | Announcement, ex/record/pay dates, terms, entitlement |
| External ECL engine | Allowance and stage, **with measurement category** |
| **GL balances** | **Inbound, as a source — see below.** 18 of 40 taxonomy lines are GL-sourced |
| **Leasing system** | Right-of-use assets (A.12) and lease liabilities (B.12) |
| **Branch cash system** | Vault and till cash (A.1) |
| **Legal / litigation system** | Legal and restructuring provisions (B.9), contingent liabilities (D.4) |
| **Consolidation process** | Equity lines and, if the group-structure signals resolve, NCI (C.6) |

### The GL is both a source and a control — and the rule separating them

**The architecture was one-way and could not produce a balance sheet.** D7 posts *to* the GL, which is
the control account, and nothing read GL balances back. **C.3 retained earnings is the proof case: it
is the balancing figure and has no other source.** Without a GL balance inbound interface the balance
sheet cannot be produced and, because C.3 balances it, cannot balance.

This appears to contradict the accrual rule — that core banking's accrued interest is a reconciliation
control, not an input — but does not. **The separating rule is the same asserted-versus-derived test
that defines a Balance** (P0-03), applied to feeds instead of objects:

> **The GL is a *source* where the amount is asserted, and a *control* where it is derived.**

| Treatment | Examples |
|---|---|
| **Sourced from GL** — asserted | Retained earnings, share capital, legal and tax provisions, PP&E, goodwill, DTA |
| **Controlled against GL** — derived | Accrued interest, treasury positions, anything D2 can compute from terms it holds |

**One test governs both the object model and the feed inventory**, rather than two rules that have to
be kept consistent with each other. It also turns the five previously missing source systems above into
a defined interface set rather than an open list.

**The test extends to measures within a Contract, not just to whole objects.** A Contract may carry
asserted measures — the ECL allowance, an external pricer's fair value, externally-projected ABS/MBS
cashflows — alongside derived ones. Those asserted measures are inbound feeds subject to the same
arrival, validation and reconciliation treatment as any other, which is why the ECL and pool-model rows
sit in the inventory above rather than being treated as a special case.

**Three failure classes, three responses** — acquisition failure (retry then escalate, downstream
blocked), validation failure (quarantine, rest proceeds), reconciliation break (P0-09).

**Data quality:** completeness with **mandatory record counts and control totals on every feed**;
staleness; plausibility; referential integrity resolved **at the D1 version in force for the business
date**.

**Idempotency and replay** — re-delivery supersedes, never appends.

**Late and back-dated arrivals** — normal, not errors. Landed with today's knowledge date and the
correct effective date, and **separately reported and counted**.

**Suspense presentation** — quarantined and unclassified records appear on the balance sheet as a
reported suspense position with a mandatory unclassified line. **Exclusion breaks the balance sheet.**

## Out of scope

- Reconciliation and the break register — P0-09
- The market data fallback hierarchy — P0-04 owns it
- Gate decisions — P0-12 decides what a detection blocks

## Acceptance criteria

1. A partial arrival is detected, not absorbed — record counts and control totals on every feed
2. Re-delivery is idempotent
3. Back-dated arrivals land correctly on both temporal axes and are counted and reported
4. Referential integrity resolves against the business-date D1 version
5. Quarantined records are visible on the balance sheet in suspense, aged, never silently dropped
6. Adding a source is a new adapter with no downstream change

## Notes

**The incumbent TMS adapter is the one whose absence would be discovered late.** It is throwaway code by
design — scope it as such and resist making it good. Whether the incumbent can produce a contract-level
extract at all is an open question that gates Phases 0–3 having a treasury book.
