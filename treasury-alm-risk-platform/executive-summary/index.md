---
kind: spec
title: "Executive Summary — Treasury, ALM & Risk Platform"
---

# Treasury, ALM & Risk Platform

**Executive summary for the Board and ALCO**

---

## 1. What is proposed

A single platform that becomes the bank's **system of record for treasury** and the source of its
asset-liability, liquidity, risk and regulatory numbers.

Today those numbers are assembled from several systems and spreadsheets. The proposal replaces that
with one governed source in which every figure — the liquidity coverage ratio, the interest rate risk
position, the balance sheet itself — can be traced back to the individual transactions that produced
it, and reproduced exactly as it stood on any past date.

**Scope is the full treasury instrument universe** set out in the bank's own instrument and balance
sheet taxonomy: money market, repo and securities financing, fixed income, foreign exchange, interest
rate and credit derivatives, wholesale funding and issuance, and the off-balance-sheet exposures that
drive liquidity.

**Core banking is unchanged.** It remains the system of record for retail and corporate loans and
deposits, which feed the platform daily.

---

## 2. What the bank gets, and when

The programme is sequenced so **each stage delivers something usable on its own.** No stage is
scaffolding for the next.

| Stage | What the bank can do that it cannot do today |
|---|---|
| **0. Foundation** | A complete, classified balance sheet with projected cashflows for every position — reconciled daily, and reproducible for any past date |
| **1. Liquidity** | Daily liquidity coverage and net stable funding ratios, produced from the bank's own records rather than assembled manually |
| **2. Valuation** | Independent valuation of the treasury book and daily profit and loss |
| **3. ALM & interest rate risk** | Economic value and earnings sensitivity to rate shocks; the ALCO pack produced from source data; an internal liquidity stress view |
| **4. Front-to-back** | Treasury deals booked, confirmed and settled in one system with straight-through processing |
| **5. Risk** | Full market and counterparty credit risk measurement |
| **6. Pricing & regulatory** | Internal funds transfer pricing, and regulatory returns produced as configuration rather than code |
| **7. Governance** | Complete model governance and audit readiness |

**Liquidity comes before interest rate risk deliberately.** Liquidity ratios are what a regulator asks
for first and are computable from prescribed rules; interest rate risk requires valuation and
behavioural models and is genuinely harder.

**One capability deserves specific attention: pre-deal analysis.** From Stage 1 the bank can ask
*"what does a three-year 500 million issue do to our liquidity ratios and funding concentration?"* and
get an answer in seconds, before the deal is done. That is what turns the platform from a reporting
tool into a decision tool.

---

## 3. What it costs

**No cost or duration estimate has been produced, and that is deliberate.** The blueprint is a design,
not a plan, and estimating before the three largest uncertainties are resolved would produce a number
with false authority.

**What drives the cost:**

| Driver | Status |
|---|---|
| **Whether Stage 4 is built or bought** | The largest single variable. See §4 |
| **The quality of data available from core banking and the incumbent treasury system** | Unknown. Being established now |
| **Subject-matter capacity, not engineering capacity** | The binding constraint. See §6 |

**What the Board should expect to be asked for**, once those three are known: a staged budget with a
decision point at the end of each stage, rather than a single approval for the whole programme. The
sequencing supports this — the programme can be stopped after any stage with the value delivered to
that point intact.

---

## 4. Build or buy

The blueprint takes a position on each part rather than treating this as one decision.

| Component | Recommendation | Reasoning |
|---|---|---|
| The data core, classification and liquidity | **Build** | This is where the bank's specific structure lives and where an off-the-shelf fit is poorest |
| **Pricing and valuation models** | **Buy** | Building and validating pricing models across the full instrument range is a multi-year specialist commitment with no competitive return |
| **Deal capture, confirmation and settlement (Stage 4)** | **Evaluate seriously for purchase** | Commodity capability, high volume, unforgiving of error, and it delivers operational efficiency rather than new insight |
| Risk analytics | **Buy the analytics, build the limit framework** | Same reasoning as valuation |
| Regulatory reporting | **Build** | Must be configurable to the local regulator |

**Stage 4 is where programmes of this kind fail.** It is more work than everything else combined. The
blueprint states this plainly rather than discovering it in year two, and recommends genuine openness
to buying rather than a nominal evaluation.

---

## 5. Three things that must start now, independently of any funding decision

Each of these loses value permanently for every month it is deferred, and none depends on the platform
existing.

**1. Collateral movement logging.** The liquidity coverage ratio requires a 24-month history of
collateral flows that the bank does not currently hold in usable form. It cannot be recreated after the
fact. Two tracks: begin logging daily now (seven data fields, a named owner — not a system), and request
24 months of statements from correspondents, counterparties and custodians before those records age into
archive retrieval.

**2. Legal agreement extraction.** Master agreements and credit support annexes must be converted from
documents into structured data. This drives collateral management, counterparty exposure and part of the
liquidity ratio. It is a legal review exercise, not a technology one, and it has a long lead time.

**3. Regulatory and accounting rule authorship.** The platform classifies every position by rules that
finance and regulatory reporting must write. Those rules are needed from Stage 0, but the modules that
will eventually own them arrive in Stages 4 and 6. **Interim owners must be named now**, or the platform
is built with nothing to classify against.

A fourth is a purchasing decision rather than an activity: **whether to buy a historical market data
set.** Risk measurement in Stages 3 and 5 needs years of history including a genuine stress period.
History cannot be created retrospectively, but unlike the other three it can be bought — and buying it
removes a dependency on elapsed calendar time.

---

## 6. Principal risks

| Risk | Assessment |
|---|---|
| **Subject-matter capacity, not engineering capacity, is the binding constraint** | Rule authorship, legal agreement extraction and the accounting policy decisions in §7 cannot be done by engineers. They have long lead times and no natural owner. **This is the most likely cause of delay** |
| **Stage 4 scope** | The largest and least differentiating part of the programme. Mitigated by placing it late and by genuine openness to purchase |
| **Upstream data quality** | Unknown until established. If core banking cannot supply transaction-level detail, the design degrades in a defined way rather than breaking — but with reduced capability |
| **Model assumptions become the answer** | For interest rate risk, the assumptions about customer deposit behaviour drive the result more than the balance sheet does. The design makes those assumptions explicit, versioned and challengeable rather than embedded |
| **Programme fatigue** | Mitigated by the staged sequence — value is delivered from Stage 1, not at the end |

**On assurance:** the design has been independently and adversarially reviewed, and the review changed
it materially — the data model, the delivery sequence and two missing components were all corrected as a
result. That review is documented and available.

---

## 7. Decisions required

**From the Board:**

| # | Decision | Consequence of deferral |
|---|---|---|
| 1 | **Authorise the three activities in §5 to begin now** | Permanent, irrecoverable loss of data each month |
| 2 | **Confirm the legal entity and group structure** — whether the bank has subsidiaries, securitisation vehicles or foreign operations that consolidate | Determines the scope of regulatory reporting and the design of the data model. It is currently the largest open question |
| 3 | **Endorse the staged funding approach**, with a decision point at each stage | — |

**From ALCO and Finance:**

| # | Decision | Note |
|---|---|---|
| 4 | **Ratify the hedge accounting approach and its capital consequence** | See below — this has already been provisionally decided and should be formally confirmed |
| 5 | **Approve the degradation order** — which outputs are essential each morning if overnight processing runs late | A business judgement, currently proposed rather than approved |
| 6 | **Resolve outstanding accounting policy questions** on balance sheet presentation of several instrument types | Blocks the final acceptance of Stage 0 |

### The hedge accounting decision, and why the Board should see it

The bank will apply **IFRS 9 only, without macro hedge accounting.** Structural interest rate hedging
will be economically real but not reflected through hedge accounting. This is simpler, avoids a second
accounting rule set, and is common at this size.

**It has a capital consequence that runs against intuition and should be explicit.** Where hedge
accounting applies, the resulting volatility sits in a reserve that is *filtered out* of Common Equity
Tier 1. Where it does not, the volatility passes through profit and loss into retained earnings —
**which is CET1**. The decision therefore moves volatility from a filtered reserve into regulatory
capital.

**The risk itself is unchanged; only its presentation and its capital treatment differ.** Two
mitigations remain available within the chosen approach — hedging specific issuances, and hedging
forecast cashflows — and both should be prioritised on capital grounds rather than accounting ones.
**The threshold for revisiting this decision is capital volatility, not earnings volatility**, and the
former will bind first.

---

## 8. What "good" looks like

Three tests the Board can apply to the finished platform without technical knowledge:

1. **Point at any figure in any report and ask why.** The answer should be a rule, a version, the inputs
   that satisfied it, and who approved it — retrievable in one query, not a research exercise.
2. **Ask for a report as it stood three years ago.** It should reproduce exactly, under the rules,
   assumptions and data that applied then — not under today's.
3. **Ask why a ratio moved.** The answer should decompose into balance sheet change, market change and
   assumption change, separately.

A platform that cannot do these three is a reporting tool. One that can is a control environment.

---

*Supporting detail: the full architecture blueprint, eleven module specifications, the independent
design review, and the Stage 0 delivery plan are available on request.*
