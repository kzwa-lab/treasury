---
kind: ticket
title: "P0-03 — Contract, Leg, Balance & Event Store"
status: 0
---

# P0-03 — Contract, Leg, Balance & Event Store

**Wave 2. Depends on P0-01.**

Governing artifacts: `d2-instrument-position-core` §2, §3.

## In scope

**Six core objects**, of which this ticket builds five (Valuation is Phase 2):

- **Contract** — common attributes as the query surface; typed terms payload schema-validated on write
  against the D1 product family definition
- **Leg** — one currency, one payment convention, one rate treatment. **Five rate treatments**: fixed,
  floating-index, **return**, **quantity**, **externally projected**
- **Optionality** — type, style, exercise schedule, strike/trigger, exercise party, settlement type
- **Balance** — carrying amount, currency, dimensions. **A position with no originating transaction the
  platform records** (see below)
- **Contract links** — package, hedge relationship, internal pair, novation chain, participation

### The Contract / Balance line — corrected

The original test was "no legs, no cashflows, no projection". **That put equity holdings on the wrong
side.** An equity purchase has a trade date, counterparty, settlement date, quantity and price — as a
Balance it has no settlement instruction for D5 and no way to represent a B.4 short. The
`not_applicable` classification values remove the only reason it was ever a Balance.

An intermediate test — "no originating transaction the platform records" — was tried and rejected: it
keys object type off **integration scope**, so the same item is a Contract at one bank and a Balance at
another, and can change type as feeds are added in later phases. It also mis-sorts nostro balances
(D5 records every settlement that moves them), ROU assets (the lease is a recorded transaction, but the
asset amortises on an accounting schedule) and A.9 (a Contract if treasury happened to book the stake).

**The test:**

> **A Balance is a position whose amount is *asserted* by an external system rather than *derived* from
> terms the platform holds.**

Directly testable: *can you compute this from what D2 holds, or must someone tell you the number?*

| | Objects |
|---|---|
| **Contract** — amount derived | Anything D2 can compute from terms it holds, including **equity holdings (A.3 and A.4) and short positions (B.4) as quantity legs** — quantity is held, price comes from D3, so the amount is derived |
| **Balance** — amount asserted | Vault cash (branch system), central bank reserves and nostro (statements), ROU assets (leasing system schedule), A.9 (consolidation), PP&E, goodwill, tax, provisions (legal system / GL), all equity lines (GL) |

**Two properties beyond tidiness, both of which simplify other tickets:**

1. **It subsumes the GL source/control rule in P0-08.** The GL is a *source* where the amount is
   asserted and a *control* where it is derived — one test governs both the object model and the feed
   inventory, rather than two rules that must be kept consistent
2. **It applies at measure level as well as object level.** A Contract may carry *asserted* measures —
   the ECL allowance, an external pricer's fair value, externally-projected cashflows — alongside
   derived ones. That is exactly what the ECL interface is, which makes P0-14's measure set and this
   definition the same idea at two granularities rather than two concepts

**It also gives the core-banking fallback a principled representation.** If core banking cannot produce
contract-level extracts with terms (an open question that gates Phases 0–3), those positions are
honestly **Balances** — asserted, unprojectable — rather than Contracts with missing terms pretending
otherwise. The degradation is defined rather than broken.

**Event model:** append-only `CONTRACT_EVENT` and `BALANCE_EVENT`; cancel-and-correct, never overwrite;
**bitemporal** on effective and knowledge date. **Scheduled fixings and payments are not events** — they
are regenerated from the schedule.

**Structured product tiering** (Tiers 1 and 2) and the **AT1 presentation override** — a Contract may
route its carrying amount to an equity line while its cashflows remain in projection.

**Securities financing recognition flags** on the collateral leg: `creates_position`, `encumbers`,
`rehypothecable`.

## Out of scope

- Projection (P0-05), classification (P0-06), position derivation (P0-07)
- Valuation and the accounting-characteristics view — Phase 2 and Phase 4 respectively
- Deal capture UI (Phase 4). Objects arrive via P0-08 ingestion in Phase 0

## Acceptance criteria

1. Every worked decomposition in D2 §2.2 stores correctly, including **FX swap as two linked
   Contracts**, NDF net settlement, collateral swap with no cash leg, tri-party basket reference,
   commodity quantity legs, futures with no cashflows, and externally-projected ABS/MBS
2. Balance objects store for all 16 pure-Balance taxonomy lines
3. Bitemporal queries answer "as we reported it" and "as we now understand it" independently
4. A booking error is corrected by cancel-and-correct; nothing is overwritten
5. Terms payloads validate on write; free-form payloads are rejected
6. Internal pairs are linked such that elimination is a property of the link, not a report-time filter

## Notes

**Event volume depends on the scheduled-events exclusion holding.** If scheduled fixings and payments
become events, a 30-year monthly mortgage generates 720 of them and the volume estimate moves from
millions to billions.

**Contract count includes internal contracts** — FTP mirrors and internal hedges are real Contracts with
real cashflows, roughly one mirror pair per banking-book contract.
