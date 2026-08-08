---
kind: ticket
title: "P1-01 — Regulatory Factor Rule Sets (D13-A)"
status: 0
---

# P1-01 — Regulatory Factor Rule Sets (D13-A)

**Wave 1. Depends on P0-01, P0-06, P0-11, P0-15.**

**Non-engineering.** The Phase 1 analogue of P0-15, and the phase's critical path.

Governing artifacts: `d13-regulatory-reporting-and-capital` §1.1; `d10-liquidity-and-funding` §3.1, §4.

## Why this is a ticket at all

D13 completes in **Phase 6**. D10 needs its prescribed factor sets in **Phase 1**. A module arriving in
Phase 6 cannot be the sole source of rules needed five phases earlier, and parent §6's whole resolution
— separate rule *authoring* from module *completion* — is only real if someone authors.

**D13-A is a specification and configuration activity, not a software build.** Its output is versioned
rule content; the engine that executes it is P0-06's and already exists. When D13-B is built in Phase 6
it takes **custody of rule sets already in production**, which is a considerably better position than
authoring from scratch against a live balance sheet.

## In scope

**Author, into P0-06's engine, as versioned effective-dated rule sets in D1:**

- **LCR outflow factors** — run-off rates by deposit category: stable retail, less-stable retail,
  operational wholesale, non-operational wholesale, secured funding by collateral type and counterparty
- **LCR inflow factors**, and the **75% inflow cap** as a constraint rather than an assumption
- **Drawdown factors** for committed facilities by counterparty type and facility class
- **HQLA eligibility and level assignment** — Level 1, 2A, 2B, with the issuer, rating, market-depth and
  encumbrance predicates
- **HQLA haircuts** per level, and the **Level 2 40% and Level 2B 15% cap** definitions
- **NSFR ASF factors** by liability tenor and stickiness; **RSF factors** by asset class and residual
  maturity, **including the encumbrance-period scaling**
- **Interdependent asset/liability pair** treatment where the regulator permits it — a configurable rule,
  never a hardcoded exception
- **Prescribed NMD maturity caps** (consumed by D9 in Phase 3, authored here because the author is the
  same)

**Each rule set carries** the regulatory citation it derives from, an effective date, and the
regression corpus and impact-simulation treatment P0-06 requires before activation.

## Out of scope

- The engine that executes these — P0-06
- Capital, RWA, leverage, large exposures, the returns engine — **D13-B, Phase 6**
- Accounting classification rules — P0-15, already authored
- Behavioural parameters of any kind — D9, Phase 3. **A prescribed factor is not a model** and must
  never be recorded as one

## Acceptance criteria

1. Every factor is data in D1, versioned and effective-dated — a factor change is a rule edit with no
   code release, and historic ratios reproduce under the factors in force at the time
2. Each rule set cites the regulatory provision it implements, so a supervisor's question resolves to a
   citation rather than to an author's memory
3. The full factor set is complete enough that **P1-06 and P1-07 reconcile to the regulator's own worked
   examples**, including the cap and haircut edge cases — this is the real test, and it is not passed by
   authoring plausible numbers
4. Deposit insurance threshold, allocation rule and sequencing are stated, versioned and deterministic
   (gating decision 1; P0-06's customer-aggregation pass)
5. Impact simulation runs before any activation: what reclassifies, how much balance moves, which ratio
   buckets change

## Notes

**This is a Phase 1 staffing line, not a software task**, and it is the phase's most likely cause of
delay. The engine is built and waiting; it ships computing nothing until this lands.

**The failure mode is a plausible number with no provenance.** A factor typed in from a summary
presentation is indistinguishable in the database from one traced to the regulation — until a supervisor
asks, or until the ratio fails reconciliation and nobody can tell which of four hundred factors is
wrong. Criterion 2 exists for that reason and is cheap only if done at authoring time.

**Interim custody, stated explicitly.** Regulatory reporting authors these under the same arrangement
P0-15 established for the accounting rules. Naming the interim owner is part of this ticket.
