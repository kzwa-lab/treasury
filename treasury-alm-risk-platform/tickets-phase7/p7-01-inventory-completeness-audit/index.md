---
kind: ticket
title: "P7-01 — Inventory Completeness & Accretion Audit"
status: 0
---

# P7-01 — Inventory Completeness & Accretion Audit

**Wave 1. No build dependencies.**

**A diagnostic before it is a build, and the phase's main sizing risk.**

Governing artifacts: `d15-model-governance` §3.1, §3.2, §4.1.

## What this ticket is actually testing

`D15-1`'s argument was that validation must accrete from Phase 0, because *"a validation function
arriving in Phase 7 validates nothing for six years and then inherits a portfolio of models in production
that nobody ever approved."*

**This is the first moment anyone can check whether that actually happened.**

| Outcome | What this phase becomes |
|---|---|
| Validation accreted as designed | A **reconciliation**. Confirm entries, statuses and due dates; move to P7-03 |
| It did not | **A remediation phase** — models in production, unvalidated, exactly as `D15-1` predicted |

## The inventory is twenty-six items, and fourteen were named nowhere

The union was assembled for the first time in the D15 deep-dive. **Fourteen of twenty-six are not named
as models anywhere in the corpus, and six of those are tier 1.** They **cluster around proxies and
fallbacks**, because each looks like configuration at the point it is written.

**The ones most likely still missing**, since they had no obvious owner:

| Model | Owner | Tier |
|---|---|---|
| **Fallback / proxy hierarchy for market observables** | D3 | **1** |
| **Proxy spread model** for unrated counterparties | D3 / D11 | **1** |
| **Core/volatile liquidity split** | **D10** — a distinct owner from D9's NMD model, and easily lost | **1** |
| **Collateral outflow proxy** | Operational workstream | **1** |
| **AVA / prudent valuation methodology** | D8 / D13 | 2 — and **a direct CET1 deduction** |
| Volatility surface fitting; corporate action and gap-filling rules; time-to-monetise | D3, D10 | 2 |

**The organising principle: a proxy is a model.**

## In scope

- **Reconcile the live inventory against the twenty-six**, and against anything the six phases added
- **Verify per entry**: owner, tier, approved usage as named consumers, validation technique, validation
  status, next-due date
- **Audit the accretion** — was each model validated *before first use*, or retrospectively?
- **Verify the revalidation cycle ran** from Phase 3 rather than starting here
- **Tier review** — tier is reviewed on a cycle and on usage change, not assigned once
- **Model retirement** — the collateral outflow proxy is **the one model with a planned end date**;
  confirm it retired as coverage filled, or record why not

## Validation technique is a recorded field

**Backtesting covers about a third of the inventory.** EVE, curve construction, PFE, XVA and the proxy
models have **no realised outcome to backtest against** — they are validated by benchmarking and by
sensitivity analysis (`D15-11`).

**So "no backtest" must be either a recorded category or a finding, never ambiguous** (`D15-4`). An
inventory that leaves the field blank cannot distinguish *"this model cannot be backtested"* from
*"nobody has backtested this model."*

## Out of scope

- Performing validation — it should have happened in Phases 2–6
- Aggregate reporting — P7-03
- The provenance tag — P7-02

## Acceptance criteria

1. Every model in §3.1 is in the inventory with **owner, tier, approved usage, validation technique,
   validation status and next-due date** — no blank fields
2. **"No backtest" is a recorded category or a finding, never ambiguous**
3. **No tier-1 model is in production use without independent validation** — and where one is, it is
   escalated rather than back-dated
4. **The accretion is evidenced**: each model's validation date precedes its first production use, or
   the exception is recorded
5. The revalidation cycle has been running since Phase 3, with its history intact
6. Tier assignments have been reviewed on a cycle and on usage change
7. The collateral outflow proxy's retirement status is recorded

## Notes

**Criterion 4 is the audit, and it is uncomfortable by design.** Comparing validation dates against first
production dates is a simple query with an unwelcome possible answer. **Doing it here, once, is far
better than a regulator doing it** — and the corrective action is available while the programme still has
a team.

**Criterion 3's "escalated rather than back-dated" matters.** The instinct on finding an unvalidated
tier-1 model in production is to validate it now and record today's date, which produces an inventory
that looks clean and a history that is false. The honest record shows the gap and when it was closed.

**Gating decision 2 determines whether any of this survives.** **An inventory nobody maintains is worse
than none, because it reports coverage that has decayed.** If no second-line function owns it
operationally, this ticket produces an artefact with a shelf life measured in months.
