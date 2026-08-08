---
kind: ticket
title: "P0-06 — Classification Rules Engine"
status: 0
---

# P0-06 — Classification Rules Engine

**Wave 3. Depends on P0-01, P0-03, P0-10, P0-11, P0-15.**

**The highest-uncertainty ticket in Phase 0, and the one the phase plan depends on.**

Governing artifacts: `classification-rules-engine` (whole document).

## Why it carries the programme

Parent §6's central move is separating **rule authoring** from **module completion** — Phase 0
classifies the balance sheet correctly even though D7 arrives in Phase 4 and D13 in Phase 6. That
separation is only real if a rule is versioned data that a later module authors into an engine that
already exists. **If rules are code, a D13 factor change is a D2 release and the phase plan collapses.**

## In scope

- **Rules as data** — versioned, effective-dated, **bitemporal** rule sets stored in D1, with scope,
  conditions, outcome, explicit precedence and provenance
- **The declared input vector** — object attributes, the **declared classifiable subset** of the terms
  payload, D1 static, **D6 encumbrance**, ECL stage, management decisions, and `reporting_date` as an
  explicit input rather than an environment
- **Precedence and conflict resolution** — explicit rank, first match wins; overlapping rules with
  different outcomes at equal precedence **fail rule set validation and cannot be activated**
- **No default outcome.** An unmatched object is **unclassified** and routes to P0-08's suspense
  presentation. `not_applicable` is only ever an explicit rule outcome, never a fallback
- **Seven recompute triggers**, including **passage of time** (a 13-month deposit enters the ≤12-month
  bucket tomorrow with no event) and **encumbrance change** (intraday)
- **Stored versus computed split** — pure functions of object plus reporting date are computed at query
  time; rule outcomes over independently-changing inputs are stored with the rule version that produced
  them
- **Overrides** — per object and dimension never per rule, four-eyes, expiring, reported as a
  population, flagged for review when the underlying rule changes
- **Explainability, stored not reconstructed** — rule version, matched rule, input values, outcome,
  override and approver, for any object, dimension and date. Plus **population-level** explainability
- **Regression corpus and impact simulation** before any rule activation

### The customer-aggregation pass — a second phase, not an option

**Part of regulatory classification is irreducibly customer-level and cannot be computed
contract-by-contract.** The engine as originally specified is per-Contract, and that is not sufficient
for the largest liability line on the balance sheet.

| Classification | Why it is not per-contract |
|---|---|
| **Deposit insurance coverage** | A per-**depositor** threshold, aggregating balances across accounts and products |
| **Operational deposit status** | A relationship property, **capped at the amount required for the service** — the excess is non-operational |
| **Connected-counterparty grouping** | Spans accounts and legal entities |

**So B.3 — customer deposits, the largest liability line — cannot be classified in a single per-object
pass.** Classification runs in two phases:

```
Phase 1  per-Contract rule evaluation
Phase 2  customer aggregation → threshold and cap computation → allocation back to Contracts
```

**Three decisions must be stated, versioned and deterministic — not two:**

1. **The threshold** — the insurance coverage limit and the operational-service cap
2. **The allocation rule** — when a depositor's insured threshold covers part of their total balance,
   *which contracts receive the insured portion*: pro rata across accounts, by product order, by
   account age. If implicit or non-deterministic, **the insured/uninsured split moves between runs and
   the LCR moves with it, with no cause anyone can identify**
3. **The sequencing** — where a deposit is subject to **both** an insurance threshold and an operational
   cap (a small corporate with insured balances and a cash-management relationship),
   **insurance-first gives a different split from operational-cap-first.** Order of application changes
   the answer, and an unstated order produces an LCR move nobody can decompose

All three live in the rule set alongside each other and carry the same regression corpus and impact
simulation treatment.

**This does not undercut contract-level storage** (D2 §4.4) — contract-level storage remains necessary,
it is simply not sufficient. The gap is in the engine, not the store.

### Fifteen dimensions, not fourteen

`counterparty_type` splits into **transaction counterparty** and **issuer / obligor**. A bond bought
from Bank X but issued by a sovereign: HQLA level, risk weight, large exposures and concentration all
key off the **issuer**; settlement, confirmation and settlement risk key off the **trade counterparty**.

**One dimension mis-classifies the entire securities book, and the error direction depends on which
field survives** — so a one-way check is insufficient:

- **Trade-capture-derived data** usually keeps the transaction counterparty → a sovereign bond bought
  from a bank dealer looks like a bank exposure → **understates HQLA**, overstates bank concentration
- **Custody-derived data** usually keeps the issuer → the settlement path loses its counterparty →
  **understates settlement risk**

**Guarantor stays a Contract attribute rather than becoming a sixteenth dimension.** The distinction
that decides it: **dimensions are derived by the rules engine and mandatory-complete; guarantor is
captured.** It is already query surface as a Contract attribute (D2 §2.1), and large exposures grouping
by guarantor reads the attribute rather than filtering a Position on a classification value.

#### CRM substitution — the same failure one level down

Under Basel credit risk mitigation, an eligible guarantee lets the **guarantor's** risk weight replace
the obligor's. But:

- **HQLA level** keys off the issuer with **no substitution**
- **Risk weight** keys off the **post-substitution** obligor

**If both read the issuer/obligor dimension they fight over one field** — which is exactly the failure
mode that split `counterparty_type` in the first place, repeated one level down.

**Resolution: the issuer/obligor dimension is always the *contractual* obligor.** CRM substitution
produces a separate **derived `crm_effective_obligor`**, consumed only by the risk-weight rule and by
nothing else.

This also confirms guarantor as an attribute rather than a dimension: substitution is **conditional on
eligibility** — unconditional, irrevocable, explicit, direct, legally enforceable — and is a bank
election, so the effective obligor is a **derived outcome, not a captured fact**. It must be derived
and auditable, because *"why is this exposure at 0%"* is a question that gets asked.

## Out of scope

- Rule *content* — P0-15
- Rule set *storage schema* — P0-01
- Dimensions whose authors arrive later and are not needed in Phase 0: behavioural maturity, hedge
  designation, primary risk type

## Acceptance criteria

1. A rule change is a data change with no code release; the release boundary is crossed only when a
   rule needs a predicate outside the declared input vector
2. Bitemporal — a 2026 correction with a 2024 effective date restates 2024 while leaving the 2024
   report reproducible as published
3. Conflicting rules at equal precedence block activation
4. An unmatched object is unclassified and appears in suspense; there is no default
5. All seven recompute triggers fire, including passage of time and intraday encumbrance change
6. Explanation is a stored lookup, not a reconstruction, at both object and population level
7. Impact simulation runs before activation: what reclassifies, how much balance moves, which taxonomy
   lines and ratio buckets change
8. Intraday encumbrance change reflects in HQLA composition within the treasury book's freshness
   expectation, not at next EOD

## Notes

**The absence of a default outcome is what gets designed away under delivery pressure.** A default of
"banking book" or "amortised cost" makes the batch run clean and produces a balance sheet that is
confidently wrong. An unclassified line is ugly, and being ugly is its function.

**Physically this lives inside D2**, but it is a distinct component with its own tests, versioning and
acceptance, and must be planned, staffed and signed off as one. Built as "a bit of D2" it becomes a
switch statement over product codes.
