---
kind: ticket
title: "P0-02 — Legal Agreements & Netting Sets"
status: 0
---

# P0-02 — Legal Agreements & Netting Sets

**Wave 2. Depends on P0-01.**

Governing artifacts: `d1-reference-and-static-data` §3.8; D2 §2.8; `counterparty-documentation-workstream`.

## In scope

A three-level structured model — **master agreement → annex/schedule → netting set** — held as
structured data, never as attached documents.

**Master agreement:** type (ISDA, GMRA, GMSLA, clearing), counterparty legal entity, our legal entity,
governing law, execution date, amendments, termination events including bespoke ATEs, cross-default
provisions, and the **netting enforceability opinion with its review/expiry date**.

**Credit support annex:** threshold (possibly rating-dependent), minimum transfer amount, independent
amount, eligible collateral schedule with haircuts, **rating downgrade triggers**, rehypothecation
rights, valuation agent, call frequency, notification times, dispute mechanics, cash collateral
remuneration.

**Netting set:** derived from the agreement hierarchy, explicit and queryable, referenced by Contracts.

## Out of scope

- **Extracting the terms from executed documents** — that is
  `counterparty-documentation-workstream`, which runs in parallel and supplies this ticket's content
- Margining and collateral operations (D6 full, Phase 4). The **encumbrance register** is P0-10
- SA-CCR and CVA computation (Phase 5) — they consume netting sets from here

## Acceptance criteria

1. Master, annex and netting set are separate structured entities with the hierarchy enforced
2. Every CSA field is captured or explicitly marked not-applicable; **downgrade triggers and
   rehypothecation rights carry no blanks**, since both drive regulatory numbers
3. Enforceability opinions are dated with review dates; **gaps are reported, not treated as
   enforceable**
4. Netting sets are queryable and referenceable from Contracts
5. Bitemporal, per P0-01 — an amended CSA creates a version

## Notes

**Enforceability is a legal opinion that expires**, not a boolean. Modelling it as a flag loses the
review cycle and produces silently stale netting assumptions.

**A netting opinion gap is a capital cost, not a data gap** (D13 §3) — unenforceable netting means gross
exposure. Surfacing gaps early may trigger a legal remediation programme with its own timeline, which is
why this ticket reports them rather than defaulting them.

Downstream, this is a **Phase 2 blocker, not Phase 4**: discounting depends on the CSA, not the currency
(parent Appendix E, E1).
