---
kind: spec
title: "Programme Delivery Summary — Board"
---

# Programme Delivery Summary

**For the Board and ALCO.** Companion to the **Executive Summary**, which sets out *what* is proposed and
*why*. This document covers *how it will be delivered*: the work now planned in detail, the sequence, and
**the decisions the Board and its committees must take to keep each stage moving.**

Stages here are the same seven stages the Executive Summary describes.

---

## 1. What has changed since the Executive Summary

The design is complete and has been broken down into deliverable work.

| Then | Now |
|---|---|
| An architecture blueprint and eleven module specifications | **Specifications for fifteen of the platform's seventeen components**, plus an independent adversarial review. **The two exceptions are deal capture and settlement**, which are specified as *what a purchased system must satisfy* rather than as a build — deliberately, and for the reason in §3 |
| No delivery plan | **104 discrete pieces of work**, sequenced into stages and waves, each with acceptance criteria |
| Stage 0 acceptance blocked on unresolved presentation questions | **Unblocked.** Every instrument class now maps to a named balance sheet line or a stated, deliberate non-appearance |

**On costing: the position has improved but has not changed.** The Executive Summary declined to
estimate until the three largest uncertainties were resolved. **None of the three is resolved** — the
build-or-buy decision on Stage 4 is open (§3), upstream data quality is still unestablished (§6, decision
3), and subject-matter capacity is now *quantified* rather than *secured* (§4). **What has changed is
that all three now have named owners and a decision point**, which is the precondition for costing rather
than a substitute for it.

---

## 2. The shape of the work

**104 pieces of work across seven stages.** Each stage is cut into waves, and **each wave leaves the
platform in a working state** — not a partially-built one.

**Every stage ends with an operational readiness item** — parallel running, cutover, rollback, training
and operational acceptance. These were added after an internal critique found the plan covered *building*
the platform and not *putting it into service*; the omission is worth recording because it is the normal
way a technically successful programme disappoints its users.

| Stage | What the bank can do at the end | Pieces of work |
|---|---|---|
| **0. Foundation** | A complete, classified balance sheet with projected cashflows for every position — reconciled daily, reproducible for any past date | 16 |
| **1. Liquidity** | Daily liquidity coverage and net stable funding ratios from the bank's own records; pre-deal "what if" | 16 |
| **2. Valuation** | Independent valuation of the treasury book and daily profit and loss | 16 |
| **3. ALM & interest rate risk** | Economic value and earnings sensitivity; the ALCO pack from source data; the bank's own liquidity stress view | 16 |
| **4. Front-to-back** | Treasury deals booked, confirmed and settled in one system | **Not broken down — see §3** |
| **5. Risk** | Full market and counterparty credit risk measurement | 16 |
| **6. Pricing & regulatory** | Internal funds transfer pricing; regulatory returns produced as configuration | 16 |
| **7. Governance** | Complete model governance and audit readiness | **8** |

### Two things the table shows that are worth explaining

**Stage 7 is deliberately the smallest, and that is a design achievement rather than an omission.** The
independent review found that model governance had been scheduled at the end — meaning that for six
years, models would have been producing numbers the bank relied on with **nobody having approved them**,
and the governance function would then have inherited a portfolio it had never seen. That has been
corrected: **approval and validation now happen in every stage, as each model is built.** What remains at
Stage 7 is the portfolio view — *how much of what we report rests on models we have not validated* — which
genuinely cannot be built until there is a portfolio to look at.

**A small Stage 7 is therefore the evidence the correction held.** Two of its eight items are checks on
exactly that.

**Stage 1 does not finish liquidity.** It delivers the *regulator's* ratios, which are computable from
prescribed rules. The bank's *own* view of what would really happen under stress needs behavioural
models and arrives at Stage 3. This is stated plainly because the alternative reading — "liquidity is
done" — would be wrong for two years.

---

## 3. Stage 4 is deliberately not broken down

**This is the stage the Executive Summary named as where programmes of this kind fail**, and the
recommendation was genuine openness to buying rather than building.

**Breaking it into build tasks would pre-empt that decision.** Writing several thousand build
requirements for software the bank would prefer to purchase is both wasted effort and a strong
institutional bias towards building it anyway.

**What exists instead** is a specification of the *contract a candidate system is evaluated against* —
what the platform requires, which requirements are pass/fail, and how a supplier's claim is converted
into evidence rather than accepted as a claim.

**What Stage 4 needs next is a procurement plan**, not a task list: how the work is packaged for market,
the timetable, and who decides. **Three pieces are built regardless of the purchase outcome**, and those
can be planned now.

---

## 4. The binding constraint is not engineering capacity

The Executive Summary named this as the most likely cause of delay. **The detailed plan confirms it and
now quantifies it.**

**Seven of the 104 pieces of work cannot be done by engineers at all.** They are policy, legal and
subject-matter exercises that happen to sit on the critical path:

| Work | Who must do it | Blocks |
|---|---|---|
| **Accounting and regulatory classification rules** | Finance and regulatory reporting | **Stage 0.** The platform classifies every position by these rules; without them it computes nothing |
| **Prescribed liquidity factors** | Regulatory reporting | **Stage 1.** The ratio engine ships empty until these are written |
| **Ownership of the market risk conventions** | Risk, as a named interim role | **Stage 1 — but its deadline belongs to Stage 2.** The conventions must be settled *before the valuation system is bought*, because the supplier's conventions are part of what is being purchased. **The tightest deadline in the programme and the least obvious owner** |
| **Supplier contract terms** | Procurement and legal | **Stage 2.** Long-term rights the bank cannot add later, from a position of dependency |
| **Transfer pricing methodology** | Finance with ALCO | **Stage 4**, used at Stage 6 |
| **Regulatory return inventory** | Regulatory reporting | **Stage 6.** The build cannot be sized without the list |
| **Model validation resourcing** | Executive — budget and hiring | **Every stage from 2 onward** |

**None of these can be accelerated by adding engineers, and each has a lead time measured in months.**
They should be resourced and started on their own schedule, ahead of the engineering work that depends
on them.

**An eighth item sits outside the 104 and is at least as urgent — legal agreement extraction.** Converting
master agreements and credit support annexes into structured data is a legal review exercise, not a
platform task, so it is not one of the pieces of work above. **Its deadline moved forward two stages to
Stage 2**: without structured collateral terms the platform values collateralised derivatives on the
wrong basis, producing a plausible number that is wrong. It appears in §5 as the second clock, and **the
Board's authorisation there is what resources it.**

---

## 5. The clocks — four things that lose value every month

The Executive Summary identified three; a fourth has since been found. **Each loses value permanently
with delay, and none depends on the platform existing.**

| Clock | Status | What is lost by waiting |
|---|---|---|
| **1. Collateral movement logging** | **Should already be running** | The liquidity ratio needs 24 months of history. **Every month not logged is permanently missing.** A parallel exercise recovers the past from statements — and statement retrieval moves from self-service to archive request as records age |
| **2. Legal agreement extraction** | Long lead time; **deadline moved forward to Stage 2** | Not recoverable by effort — it is legal review capacity |
| **3. Historical market data** | **A purchase decision, not an activity** | Risk measurement at Stages 3 and 5 needs years of history including a genuine stress period. **History cannot be created retrospectively but it can be bought** — and buying it removes a dependency on elapsed calendar time |
| **4. Transfer pricing methodology** | Due at Stage 4 | **The only recoverable one.** The inputs survive; the decision does not. Deferring it means Stage 6 applies a newly chosen methodology backwards to two years of booked business — restating business unit performance for periods already reported |

**Clock 3 has a specification dimension the Board should know about.** If history is purchased, it should
be bought as **raw market data rather than a supplier's pre-processed risk measures** — the latter is
locked to that supplier's conventions and cannot be converted to the bank's. The cost difference is small;
the difference in what the data can later be used for is not.

---

## 6. Decisions required, by stage

**38 decisions gate the stages, and they are the programme's real critical path.** Most are routine and
belong to management. **The ones below are those the Board or its committees must take, or where deferral
has a consequence the Board should see.**

### Now — before Stage 1 planning completes

| # | Decision | Owner | Consequence of deferral |
|---|---|---|---|
| 1 | **Authorise the four clocks in §5 to run** | Board | Permanent, irrecoverable data loss each month |
| 2 | **Confirm the legal entity and group structure** — subsidiaries, securitisation vehicles, foreign operations | **Board** | **The largest open question in the programme.** It determines whether the bank must report on both a solo and a consolidated basis, which roughly doubles the regulatory reporting build and adds consolidation work that is **currently unscoped anywhere.** Open since the design review |
| 3 | **Can the existing treasury system supply transaction-level data?** | Management — factual | **Stages 0 to 3 have no treasury book without it.** This question has had no owner |
| 4 | **Resolve the outstanding accounting presentation questions** | Finance | Blocks final acceptance of Stage 0 |
| 5 | **Approve the overnight processing window and degradation order** — which outputs are essential each morning if processing runs late | **ALCO and Finance** | A business judgement currently proposed rather than approved. Everything from Stage 1 is sized against it |

### Before Stage 2 — the largest purchase

| # | Decision | Owner |
|---|---|---|
| 6 | **Confirm the valuation library purchase approach**, including long-term rights the bank cannot obtain later | Executive with procurement |
| 7 | **How far out is the market genuinely liquid, and how far does the banking book run past that point?** If the gap is large, the assumption used to bridge it becomes **one of the most consequential judgements in the platform** and should be visible to ALCO rather than set in a configuration file | **ALCO** |

### Before Stage 3

| # | Decision | Owner |
|---|---|---|
| 8 | **Is credit spread risk in the banking book in scope?** One answer resolves three separate dependencies | **ALCO with regulatory reporting** |
| 9 | **Does deposit history exist through a full interest rate cycle?** If not, the first generation of behavioural models is **judgement-led, and must be disclosed as such** rather than presented as calibrated | Management — factual |
| 10 | **Who signs off a recalibrated deposit assumption, and on what cycle?** | ALCO |

### Before Stages 5 and 6

| # | Decision | Owner |
|---|---|---|
| 11 | **How large is the trading book?** Determines whether risk measurement is market-risk-led or counterparty-led — a different build and a different purchase | Management — **answerable now** |
| 12 | **Standardised or internal-ratings approach for credit risk?** | Executive with the regulator |
| 13 | **Does the bank want internal transfer pricing at all at this stage?** Worth asking explicitly — a bank without business unit profit accountability may not need it | **Executive** |
| 14 | **Does an independent model validation function exist, and how deep?** | **Executive — budget and hiring** |

**Decision 14 deserves a specific note.** Validation requires someone independent of the model's builder
*with equivalent technical depth*, and in a bank of this size those two requirements conflict. **A senior
approver who cannot evaluate the mathematics is a signature, not a control.** The realistic answer is
internal validation for most models with periodic external validation for the hardest — **which is a
budget line, produces no visible deliverable, and is therefore the item most likely to be quietly
dropped. Its absence is invisible until an examination.**

---

## 7. How the Board can track progress

**Each stage ends in a state the Board can verify without technical knowledge**, and the Executive
Summary's three tests apply throughout:

1. **Point at any figure and ask why.** The answer should be a rule, a version, the inputs that satisfied
   it, and who approved it — **in one query, not a research exercise**
2. **Ask for a report as it stood three years ago.** It should reproduce exactly, under the rules and
   assumptions that applied then — **not today's**
3. **Ask why a ratio moved.** The answer should separate balance sheet change, market change and
   assumption change

**These are not deferred to the end.** Test 1 is answerable from Stage 0, test 2 from Stage 1, test 3
from Stage 3. **The final piece of work in the programme is to run all three in front of the people who
set them** — and any that fails is a finding worth having while a team still exists to act on it.

**The staged funding approach the Executive Summary proposed remains sound.** The programme can be
stopped after any stage with the value delivered to that point intact, and **the plan now supports a
decision point at each stage boundary** rather than a single approval for the whole.

---

## 8. What the Board is being asked for

1. **Authorise the four clocks (§5) to run now**, independently of any funding decision
2. **Resolve the group structure question (§6, decision 2)** — it has been open since the design review
   and it is the largest single variable in the programme
3. **Direct that the seven non-engineering workstreams (§4) be resourced on their own schedule**, ahead
   of the engineering they block
4. **Endorse the staged funding approach**, with a decision point at each stage boundary
5. **Note that Stage 4 will return as a procurement recommendation**, not as a build plan

---

*Supporting detail: the architecture blueprint, sixteen component specifications, the independent design
review, the seven stage delivery plans and the Stage 4 procurement workplan are available on request.*
