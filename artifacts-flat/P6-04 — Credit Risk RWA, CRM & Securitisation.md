# P6-04 — Credit Risk RWA, CRM & Securitisation

**Wave 2. Depends on P6-03, P0-06, and on D7 from Phase 4.**

One of the phase's three largest tickets — the biggest exposure population in the bank.

Governing artifacts: `d13-regulatory-reporting-and-capital` §3.

## In scope

**Credit risk RWA on the standardised approach** — exposure class, external rating, credit risk
mitigation — computed over D2's classification and D1's counterparty type, ratings and guarantees.

**Plus securitisation RWA** (SEC-SA / SEC-ERBA as applicable), which sits here because it is
credit-flavoured and because it shares a dependency with CRM: **D7's derecognition conclusion.**

## Credit risk mitigation is where D1 pays for itself

**Collateral, netting and guarantees reduce RWA only where legally enforceable.**

> **A netting opinion gap is a capital cost, not a data gap.**

An unenforceable netting set means **gross exposure**, and the difference is often material. This is the
same fact P5-10 encountered from the exposure side; here it becomes a capital number.

**Regulatory netting and accounting offsetting give different answers for the same netting set.** Both
derive from **the same D1 agreement data**, and **both must be produced** — treating them as one is a
common and material error. D11 already carries the rule that netting must never be inferred from D7's
accounting presentation; the same discipline applies here in the opposite direction.

## CRM substitution reads a derived field, not the dimension

`p0-06` established this and it becomes live here: **HQLA level keys off the issuer with no substitution;
risk weight keys off the post-substitution obligor.** If both read one field they fight.

**The issuer/obligor dimension is always the *contractual* obligor.** CRM substitution produces a
separate derived **`crm_effective_obligor`, consumed only by the risk-weight rule** — which is this one.

**Substitution is conditional on eligibility** — unconditional, irrevocable, explicit, direct, legally
enforceable — and is a bank election, so the effective obligor is a **derived outcome, not a captured
fact.** It must be auditable, because *"why is this exposure at 0%"* is a question that gets asked.

## Significant risk transfer

**Assessed here, and it interacts with — but is not identical to — D7's accounting derecognition
conclusion.** The two can **legitimately diverge**, and **both must be recorded with their reasoning.**

## Out of scope

- Counterparty credit risk RWA — P6-05
- The IRB approach — **assumed out** (gating decision 2). IRB changes the data requirements materially
  and brings the output floor into scope
- Accounting derecognition — D7

## Acceptance criteria

1. Credit RWA computes over D2 classification and D1 static, with **no manual exposure classification**
2. **CRM reduces RWA only where enforceability is opined**; an unopined netting set computes gross, and
   the capital cost of the gap is **reportable as a figure**
3. Regulatory netting and accounting offsetting are **both produced and are distinguishable**
4. The risk-weight rule reads **`crm_effective_obligor`**; no other consumer does
5. Substitution eligibility is derived, auditable, and answers *"why is this exposure at 0%"* in one query
6. **Significant risk transfer and accounting derecognition are recorded separately, each with its
   reasoning**, including where they diverge
7. RWA reproduces historically under the rules in force at the time

## Notes

**Criterion 2's "reportable as a figure" converts a legal backlog into a managed number.** The netting
opinion coverage question has been open since D1 §7 and is easy to leave as an operational to-do. Once
the capital cost of the gap is a reported figure, it competes for attention against other capital uses —
which is the only mechanism that reliably gets legal opinions funded.

**Criterion 6 exists because divergence looks like an error.** SRT failing while accounting derecognition
succeeds (or the reverse) is a legitimate outcome, and an auditor or supervisor encountering it without
recorded reasoning will treat it as an inconsistency to be explained under time pressure.
