---
title: "D15 — Model Governance, Audit & Control (full)"
kind: spec
---

# D15 — Model Governance, Audit & Control

Model inventory, validation, backtesting, change control and aggregate model risk. Parent:
`treasury-alm-risk-platform`. **`d15-control-core` is this module's Phase 0 subset** — audit trail,
four-eyes, override register, impact statement, authority matrix — and is not restated here.

**The control core governs human decisions. This artifact governs the models**, and the two halves fail
differently. A missing four-eyes is a control gap someone can point at. **An unvalidated model produces
a number that looks exactly like a validated one**, is used to set limits and file returns, and is
discovered when a regulator asks who validated it.

**The finding this deep-dive exists to surface: the corpus names about eight things as models and
contains at least twenty-six.** Each artifact governed the models it happened to notice; nobody has held
the list. §3 assembles it. The models *not* named as models are, predictably, the ones that will reach
production unvalidated — a fallback proxy, a time-to-monetise assumption, a collateral outflow estimate
disclosed to a regulator as an interim method.

**Parent §6 places D15 (full) in Phase 7. That is not survivable and §7 replaces it.** The critique
already caught this once — D15 held the four-eyes machinery Phase 0 mandated — and the control core
fixed the human half. **The model half has the identical defect and it has not been fixed:** D3's curve
construction is a model in Phase 0/2, D8's pricing models in Phase 2, D9's behavioural models in Phase
3, D11's VaR in Phase 5. A validation function arriving in Phase 7 validates nothing for six years and
then inherits a portfolio of models in production that nobody ever approved.

## 1. Responsibilities

### 1.1 The module and the function are different things

**D15-as-module is infrastructure**: the inventory, the validation record, the change control, the
evidence store, the reporting. **D15-as-function is people**: the validators who form an independent
opinion on whether a model is fit for its use.

The platform builds the first and enables the second. This is the same split `d3-market-data-and-curves`
§7 makes for independent price verification — *"the architectural obligation is the multi-mark data
structure and the retained differences; the operating model is finance's"* — and stating it here prevents
the two most common confusions: that buying a model risk management tool constitutes model governance,
and that having a validation team means the platform needs nothing.

**Everything below specifies the module. Where a requirement is really about the function, it says so**,
because those are the ones that need a budget line and a hiring decision rather than a build ticket
(§4.2 in particular).

### 1.2 What D15 owns

- **The model inventory** — every model in the platform, in one place, with owner, tier, approved usage, validation status and expiry (§3)
- **The definition of what counts as a model** (§2) — without which the inventory is arbitrary
- **Model tiering**, and the review of tiers as usage changes (§3.2)
- **Validation standards** per tier and per technique, and the record of validation performed (§4)
- **Approved usage**, and the control that catches a model being used outside it (§3.3)
- **Model change control** — what constitutes a model change, and what must happen before it lands (§5)
- **Backtesting execution and grading** — the modules supply the series; D15 grades (§4.1)
- **The regeneration test** (parent §2.5, Phase 1) — an implementation control, distinct from validation (§4.4)
- **Aggregate model risk reporting** — how much of the bank's reported position rests on models that are unvalidated, overdue, used outside approval, or proxied (§6)
- Everything in `d15-control-core` — audit, four-eyes, override, impact statement, authority matrix

**D15 does not own:**

| Not D15 | Owner | Note |
| --- | --- | --- |
| Model *development* and calibration | The risk owner — D9, D10, D11, D3, D12 | The separation is the point: *"no one marks their own homework"* (D9 §51) |
| Model *execution* | D2, D8, D10, D11 | D2 executes behavioural models it does not own (D9 §43) |
| Scenario definitions and their coherence review | D14 | A scenario is not a model (§2.2), though its calibration rests on one |
| Which model prices which instrument | D8 §4 | D8 authors the mapping; changing it is a model change *governed* here |
| Rule *authorship* — accounting, regulatory, classification | D7, D13 | Rules are not models (§2.2); they have their own governance in `classification-rules-engine` |
| The ECL model itself | External to the platform (parent §2.6) | **But it enters this inventory as a third-party model** (§3.1, §4.3) |
| Limit values and breach escalation | Limit framework, Phase 4 | |
| Identity, authentication, access certification | Bank identity infrastructure | `d15-control-core` §7 |

## 2. What is a model

**The inventory is only as good as the definition, and no artifact in the corpus has given one.** The
result is visible in §3: things called models where the word appeared, and things not called models
where it did not, with no principle separating them.

### 2.1 The test

**A model is a quantitative method that transforms inputs into an estimate, where the transformation
embeds judgement and the output is uncertain.** Three parts, and all three must hold:

1. **Quantitative transformation** — it computes, rather than looks up or classifies
2. **Embedded judgement** — a competent alternative choice would give a different answer
3. **Uncertain output** — there is no observable right answer at the time of use

**The second part is what does the work.** A prescribed LCR run-off factor computes, and its output is
uncertain in the sense that nobody knows what deposits will really do — but there is no judgement in
applying it, because the regulator chose the number and the bank may not substitute its own
(`d10-liquidity-and-funding` §3.1). It is a constant, not a model.

### 2.2 The hard cases, decided

| Thing | Model? | Reasoning |
| --- | --- | --- |
| **Prescribed regulatory factors** — LCR/NSFR run-off, SA-CCR add-ons, NMD caps | **No** | No judgement. D13 authors, D1 stores, D10/D11 execute (D14 §1.2) |
| **Classification rules** | **No** — but separately governed | A deterministic interpretation of regulation or accounting standard. `classification-rules-engine` governs them, at `d15-control-core` §3's retroactive tier |
| ...**except customer-level judgement rules** — operational deposit status, connected-client grouping | **Borderline; treat as rules with model-grade review** | Judgement is present but the output is a classification, not an estimate. Retroactive tier plus documented interpretation |
| **The transformation grammar** (D14 §2.5) | **No** — it is a convention | It fixes how a move is expressed, not what the move is. But a change moves every number in the platform, so it is **retroactive tier with an impact statement** |
| **Scenario definitions** (D14) | **No** | A scenario is an approved judgement about the future, governed by ALCO or the board (D14 §6), not validated against an outcome. **Its calibration may rest on a model, and that model is in scope** |
| **Curve construction** — interpolation, bootstrap, extrapolation | **Yes** | D3 §7 already says so. A competent alternative gives a different curve |
| **Fallback and proxy hierarchies** (D3 §1.5) | **Yes — and this is not currently recognised** | A proxy *is* an estimate under uncertainty. §3.1 |
| **Pricing models**, including bought ones | **Yes** | D8 §9 — *"a black box cannot be validated, and 'the vendor validated it' is not an answer a regulator accepts"* |
| **Behavioural models** — NMD, prepayment, drawdown | **Yes** | D9 §6, uncontroversially |
| **Time-to-monetise per counterbalancing source** (D10 §2.3) | **Yes — and not currently recognised** | An estimate of how fast an asset can be sold under stress. Pure judgement, and it directly scales counterbalancing capacity |
| **The collateral outflow proxy** (D10 §3.6 Track 3) | **Yes, emphatically** | It is *"a scenario-derived estimate... disclosed to the regulator as an interim method"*. A model with a regulatory disclosure attached and an expiry |
| **Risk factor decomposition** (D11 §1.3.1) | **Yes** | D11 already says so — *"a model, validated by D15"* |
| **Transmission models** (D14 §1.5) | **Yes** | D14 already says so |
| **The regeneration test** | **No** | It is a control on implementation, not a model (§4.4) |

## 3. The model inventory

### 3.1 Assembled for the first time

Every artifact specified the governance of the models it noticed. **Here is the union.** The right-hand
column is the finding: **fourteen of twenty-six are not named as models anywhere in the corpus.**

| # | Model | Owner | Tier (§3.2) | Named as a model in the corpus? |
| --- | --- | --- | --- | --- |
| 1 | Curve construction and interpolation | D3 | **1** | Yes — D3 §7 |
| 2 | Volatility surface fitting | D3 | 2 | No |
| 3 | **Fallback / proxy hierarchy for market observables** | D3 | **1** | **No** — D3 §1.5 treats it as a hierarchy |
| 4 | Discount curve selection from CSA terms | D3 / D1 | 3 | No — treated as configuration |
| 5 | Corporate action adjustment and gap-filling rules for history | D3 | 2 | **No** — and D11 §4 notes a wrong decision surfaces five years later |
| 6 | **Proxy spread model** for unrated counterparties | D3 / D11 | **1** | Partially — D11 §4 |
| 7 | Pricing models (bought library, per instrument class) | D8 | **1** | Yes — D8 §4, §9 |
| 8 | Instrument-to-model mapping | D8 | 2 | Yes — D8 §4 |
| 9 | Exercise assumption derivation (two-pass protocol) | D8 | 2 | Yes — D8 §5 |
| 10 | Monte Carlo configuration — seed, path count, convergence | D8 | 3 | Partially — D8 §2.1 as model config |
| 11 | **AVA / prudent valuation methodology** | D8 / D13 | 2 | **No** — and it is a direct CET1 deduction |
| 12 | Non-maturity deposit — volume, maturity profile, beta | D9 | **1** | Yes — D9 §6.1 |
| 13 | Prepayment / CPR | D9 | **1** | Yes — D9 §6.2 |
| 14 | Early redemption, rollover, drawdown, pipeline | D9 | 2 | Yes — D9 §6.3 |
| 15 | **Core/volatile liquidity split** | **D10** | **1** | Partially — D10 §5.1. **Distinct owner from 12, and easily lost** |
| 16 | **Time-to-monetise per counterbalancing source** | D10 | 2 | **No** — D10 §2.3 |
| 17 | **Collateral outflow proxy (Track 3)** | D10 | **1** | **No** — D10 §3.6, and it carries a regulatory disclosure |
| 18 | VaR / ES method | D11 | **1** | Yes — D11 §2.2 |
| 19 | **Risk factor decomposition** | D11 | 2 | Yes — D11 §1.3.1 |
| 20 | PFE / exposure simulation | D11 | **1** | No |
| 21 | CVA / DVA / FVA models | D11 | **1** | No |
| 22 | **Wrong-way risk detection** | D11 | 3 | **No** — D11 §3.5 |
| 23 | Transmission models (macro → risk factor) | D9 / D11 / external | **1** | Yes — D14 §1.5 |
| 24 | **Scenario magnitude calibration** | D14 | 2 | **No** — D14 §4 treats vintage as a field, not a model |
| 25 | **FTP methodology and replicating portfolio** | D12 | 2 | Yes — D12 §4, §1.2.4 |
| 26 | **External ECL model and staging** | **External** | **1** | **No** — parent §2.6 specifies the interface and not the reliance (§4.3) |

**Three observations the list makes that no single artifact could.**

**The tier-1 population is fifteen, not five.** A validation plan sized for "the behavioural models and
the curves" is sized for a third of the real load.

**Six tier-1 models are unnamed** — the proxy hierarchy, the proxy spread model, the core/volatile
split, the collateral outflow proxy, PFE and XVA, and the external ECL model. **Every one of them is an
estimate under uncertainty feeding a regulatory number**, and none has an owner recorded anywhere.

**The proxies cluster.** Items 3, 6, 16, 17 and 22 are all "what do we do when we do not have the
data" — and that is exactly the class the corpus consistently treats as an operational fallback rather
than as a model. `d3-market-data-and-curves` §5's provenance NFR exists because the bank must know how
much of a number rests on non-observed inputs. **The same question about models has no mechanism**, and
§6 proposes one.

### 3.2 Tiering

Not every model deserves the same treatment, and a framework that pretends otherwise is either
unaffordable or performative.

**Tier = materiality × uncertainty × usage breadth.**

| Tier | Meaning | Validation |
| --- | --- | --- |
| **1** | Materially drives a regulatory number, a capital measure or a limit; or a competent alternative choice moves the result by a wide margin | Full independent validation before first use; annual revalidation; **external validation on a cycle for the hardest** (§4.2) |
| **2** | Material but bounded, or well-understood with narrow reasonable alternatives | Independent validation before first use; revalidation on a longer cycle or on trigger |
| **3** | Low materiality, or a documented convention with limited discretion | Documented review and sign-off; revalidation on trigger only |

**Tier is reviewed, not assigned once.** A model's tier follows its usage, and usage changes without
anyone deciding to change it: D8's exercise assumption (item 9) is tier 2 while the callable book is
small and tier 1 when it is not; D12's arrival in Phase 6 raises the NMD model's usage breadth (§3.3).
**Tier review belongs on the same cycle as validation**, and a usage change is a tier review trigger.

**The two dominant models deserve naming.** D9 §6.1 says the NMD model *"drives the IRRBB result more
than any other input"*, and D3's curve construction moves *"every EVE and every valuation the day it
lands"* (D3 §7). If validation capacity is scarce — and §4.2 argues it will be — those two are where it
goes first.

### 3.3 Approved usage — and three extensions the design already assumes are free

Parent §5 lists *"approved usage"* as an inventory field. **The control it implies is that using a model
outside its approved use is a change requiring approval**, and the corpus contains three such
extensions, none of which is currently treated as one.

| Extension | Established by | Why it is a new use |
| --- | --- | --- |
| **D9's NMD rate-risk parameters consumed by D12 for FTP** | D9 §8.2, D12 §1.2 | The model was calibrated and approved to measure rate risk. Using it to *price internal transfers* makes it a pricing model, whose errors become permanent P&L allocations between business units rather than a measurement to be revised |
| **D10's core/volatile split consumed by D12 for the liquidity premium** | D12 §1.2 | Same shape. A stability estimate approved for measurement becomes an input to a price |
| **Behavioural models run under D14's stress overlay** | D14 §3.2 | **The sharpest of the three.** An overlay pushes a parameter to a value outside the range the model was calibrated on. A beta calibrated on normal-market pass-through has no empirical support at the stressed value, and the model's approval says nothing about behaviour there |

**None of these is wrong.** D9 §8.2 is right that FTP and IRRBB must share assumptions, and D14 §3.2 is
right that stress overlays belong in one governed place. **The point is that each is an approved-usage
extension that should be recorded and validated as one** — with, in the third case, an explicit statement
of the range over which the model is considered reliable and what happens outside it.

**Design requirement: approved usage is a list of named consumers and purposes, not a free-text field**,
and a consumer not on the list is a control failure the platform can detect rather than a documentation
gap someone notices at validation.

## 4. Validation

### 4.1 Three techniques, and backtesting covers less than half the inventory

Parent §5 lists backtesting among the model governance elements, and D9 §6.4 and D11 §2.4 both specify
backtests. **Read across the inventory, backtesting applies to roughly a third of it**, and a framework
that assumes it universally will record "no backtest" against fifteen models and treat as a gap what is
a category error.

| Technique | Applies when | Inventory items |
| --- | --- | --- |
| **Backtesting** — predicted versus realised | There is an observable outcome within a usable horizon | VaR (18), behavioural models (12–15), prepayment (13), drawdown (14) |
| **Benchmarking** — against an independent implementation, a vendor, or an alternative method | There is no realised outcome but there is a comparable | Curve construction (1), pricing models (7), surface fitting (2), PFE (20), XVA (21), FTP (25) |
| **Outcome-free validation** — conceptual soundness, sensitivity analysis, implementation testing, expert challenge | Neither of the above | Proxy hierarchies (3, 6), time-to-monetise (16), collateral proxy (17), transmission models (23), scenario calibration (24), wrong-way detection (22) |

**Three things this makes explicit that the corpus currently blurs.**

**EVE cannot be backtested and neither can the curve.** There is no realised EVE to compare against.
D9 §6.4's backtesting requirement is correctly scoped to *"predicted versus actual balance behaviour,
prepayment rates and deposit betas"* — the inputs, not the output — and that scoping should be stated as
a principle rather than left as a coincidence of wording.

**The technique is an inventory field.** Each model records which applies and why, so "no backtest" is
either a recorded category or a finding, and never ambiguous.

**Sensitivity analysis is a validation technique the platform already produces.** D9 §6.4 calls
sensitivity analysis *"the most valuable single output of the whole module"* and requires it as standard
output. **It is also the primary validation evidence for every outcome-free model in the table**, which
means D9's requirement generalises: tier-1 models should produce sensitivity analysis as standard
output regardless of module, because it is what a validator reads first.

### 4.2 Independence, and the validator scarcity problem

Validation must be performed by someone independent of the developer with equivalent technical depth.
**Those two requirements are in tension in a bank of this size**, and the tension is structural rather
than a staffing accident.

`d15-control-core` §5 already names the analogous problem for approvals — *"there may be only two or
three people qualified to approve a curve methodology change"* — and designs an escalation path. **For
validation the problem is worse**, because approval can escalate to a senior generalist and validation
cannot: an escalated approver who cannot evaluate the mathematics is a signature, not a control.

**Three sourcing options, and the realistic answer is a mix:**

| Option | Works for | Fails on |
| --- | --- | --- |
| Internal validation function | Tiers 2 and 3, and tier 1 where the bank has depth | Genuine independence when the modeller and validator are the same two people in rotation |
| **External validation** | The hardest tier-1 models — pricing, XVA, VaR method, NMD | Cost, and it is periodic rather than continuous |
| Vendor validation | Nothing | **Explicitly rejected** — D8 §9: *"'the vendor validated it' is not an answer a regulator accepts"* |

**Recommendation: internal for tiers 2–3, internal-plus-periodic-external for tier 1, with the external
cycle set by tier and materiality.** This is a **budget line and a hiring decision, not a build item** —
and it is the single most likely part of D15 to be quietly dropped, because it produces no deliverable
and its absence is invisible until examination.

**One structural protection worth building.** D11 §2.2 observes that because market risk capital is
standardised, a VaR backtest exception is a management signal rather than a capital multiplier — *"which
makes it more likely to be quietly tolerated, not less"*. **That generalises: models whose failure has no
automatic consequence need the strongest reporting**, because nothing else forces attention. §6's
aggregate reporting is where that lands.

### 4.3 Bought models, and the change calendar the bank does not control

The pricing library (item 7) and the external ECL model (item 26) are third-party models in production
carrying tier-1 weight.

**D8 §9 and §9.1 already set the evaluation criteria** — model transparency sufficient for validation,
determinism across versions, long-term version retention rights. Three additions from the model
governance side:

1. **A vendor library upgrade is a model change** (§5). D8 §9 asks whether *"a library upgrade changes
   numbers, and whether the vendor will say so"*. If it does, the upgrade requires validation before use
   — and **the vendor sets the release calendar, and eventually the support calendar too.** A version
   the bank has validated will go end-of-life, and the choice becomes revalidate on the vendor's timeline
   or run unsupported. This should be in the contract discussion alongside D8 §9.1's escrow requirement,
   because procurement will not think to ask
2. **The external ECL model belongs in the inventory even though the platform does not compute it.**
   Parent §2.6 specifies the interface in both directions and says nothing about reliance. But ECL
   allowance changes carrying amounts (parent §2.6, D7 §2.2) and ECL migration is one of three named
   paths into projected capital (D13 §7). **Model risk does not stop at the module boundary.** D15
   records it as a third-party model with the reliance documented and the validation evidence obtained
   from its owner — which is a governance conversation with another function, not a build
3. **Bought does not mean unvalidated, and it also does not mean revalidated from scratch.** The
   proportionate answer is validation of *use* — is this model appropriate for this book, calibrated on
   relevant data, behaving sensibly on the bank's instruments — plus reliance on the developer's own
   validation where it is documented and reviewable

### 4.4 The regeneration test is a control, not a validation

Parent §2.5 pulls the regeneration test forward to Phase 1 and `d15-control-core` §1 lists it as D15's.
**It is worth stating what it does and does not establish**, because the name invites over-reading.

The regeneration test asks: *does the platform reproduce the same number from the same inputs?* It tests
determinism, version resolution and retained engine builds. **It says nothing about whether the number
is right.** A consistently wrong model passes the regeneration test every day.

**Both are needed and they are different controls.** Reproducibility is the precondition for validation —
a model whose output is not reproducible cannot be validated, because the validator and the developer
would not be looking at the same number — but it is not evidence of correctness. Keeping the distinction
explicit prevents a Phase 1 regeneration test being cited as model governance for six years.

## 5. Model change control

A model change is: a methodology change, a recalibration, a parameter change, a version upgrade of
bought code, a change in approved usage, or a change in the data the model is calibrated on.

**All six route through `d15-control-core`'s model tier** — the fourth tier in its §3, *"retroactive,
plus validation before first use and on a cycle"*. The control core built the machinery; this section
adds what is specific to models.

**Recalibration is a model change and is routinely treated as routine.** It is the highest-frequency
model change in the platform — D9 §6.4 requires a calibration frequency and out-of-cycle triggers per
model — and it moves numbers as surely as a methodology change does. Two consequences already
established elsewhere and worth collecting: D2 §4.3 requires a metric movement to decompose into
balance-sheet change versus recalibration, and **D12 §1.2.5 shows recalibration silently widening the
gap between risk transferred and risk measured**, on a book nobody touched.

**The impact statement applies, and it costs more here than for rules.** `d15-control-core` §4
specifies dry-run — apply the change against a population without committing, re-run, diff in business
terms. For a rule set that is a classification recompute. **For a recalibrated NMD model it is a full
EVE and NII re-run**, which is a scenario-sized compute rather than a query. The capability is the same
one; the budget is not, and `eod-window-and-degradation` should carry it.

**Model changes and scenario overlays interact, and D14 §3.2 already flagged it.** An overlay expressed
as *"beta multiplied by 0.3 under stress"* and one expressed as *"beta floors at 0.1 under stress"*
diverge the moment the base beta is recalibrated. **D14 requires overlays to state which they are;
D15 adds the control — a base recalibration triggers re-review of every overlay referencing it**, which
requires the inventory to record the dependency in both directions.

## 6. Aggregate model risk — the missing provenance

**This is the Phase 7 content, and it is the one part of full D15 that genuinely could not have been
built earlier** — it needs a populated inventory to aggregate.

The question: *how much of the bank's reported position rests on models that are unvalidated, overdue
for revalidation, used outside approved usage, or proxied?*

**The platform already answers the equivalent question for market data and cannot answer it for models.**
`d3-market-data-and-curves` §5 established provenance as a platform NFR — observed, interpolated, stale,
proxied, model-implied, marked — and parent §5 requires that *"provenance survives aggregation: how much
of a valuation, ratio or P&L line rests on non-observed inputs is a query, not an investigation."*

**Proposal: model provenance, on the same pattern.** Every computed output carries which models
contributed and their validation status, and the tag survives aggregation. Then *"what share of our EVE
rests on a model that is overdue for revalidation"* is a query rather than a project.

**Why this is worth the effort rather than a nice-to-have.** §4.2 established that models whose failure
carries no automatic consequence get quietly tolerated. Aggregate reporting is the mechanism that makes
tolerance visible — and unlike a validation finding, which is one model at a time, it shows the
accumulation. A single overdue tier-3 model is nothing; forty percent of EVE resting on models past
their revalidation date is a board matter, and no other artefact would surface it.

**Model risk appetite follows from it.** Thresholds on the aggregate — how much unvalidated exposure the
bank will carry, for how long — with escalation, on the same pattern as D10 §7's liquidity risk appetite.
Without the aggregate measure, model risk appetite can only be expressed as "validate everything", which
is not a policy anyone can hold.

## 7. Phasing — D15 has no single phase, and Phase 7 is the wrong answer

**Parent §6's Phase 7 entry — "D15 (full)" — is the last surviving instance of the defect the critique
found.** The control core fixed the human-control half by carving Phase 0 out. **The model half needs
the same treatment and has not had it.**

The argument is arithmetic. Models arrive from Phase 0 onward. Validation before first use means the
validation capability must exist when each model does — not when the module named after it is scheduled.

| D15 capability | Phase | Driver |
| --- | --- | --- |
| Control core — audit, four-eyes, override, impact statement, authority matrix | **0** | `d15-control-core` |
| **The model definition (§2) and the inventory (§3.1)** | **0** | Nearly free, and the thing that prevents unnamed models. The inventory can exist with three entries |
| Regeneration test | **1** | Parent §2.5 |
| Validation standards, validation record, model change control | **2** | D3's curve models and D8's pricing models are the first real entries |
| Backtesting execution and grading | **3** | D9's behavioural models |
| Approved-usage control (§3.3) | **3** | The D14 overlay extension arrives with D14 |
| ...and again at **6** | **6** | D12's FTP consumption is the second extension |
| **Periodic revalidation cycle** | **3, not 7** | §7.1 |
| **Aggregate model risk reporting and model risk appetite** (§6) | **7** | Needs a populated inventory. **This is what Phase 7 actually is** |

### 7.1 The revalidation cycle cannot be Phase 7 either

**A model validated in Phase 2 needs revalidating before Phase 7 arrives.** If the phases run roughly a
year apart and tier-1 revalidation is annual, D3's curve construction — validated in Phase 2 — is due
again in Phase 3, and again in Phase 4, and three more times before the module that owns the cycle
exists.

**So the periodic cycle starts with the second model, not with Phase 7.** What remains genuinely
Phase 7 is the *portfolio* view: aggregation, model risk appetite, and reporting across an inventory
large enough for the aggregate to mean something.

**Parent §6 should read: Phase 7 delivers aggregate model risk management, with inventory, validation
and change control accreting from Phase 0.** Stated as "D15 (full)" it reads as a module to be built at
the end, which is the reading that produces six years of unvalidated models.

## 8. Interfaces

**Inbound.**

| Source | Content |
| --- | --- |
| Every model owner — D3, D8, D9, D10, D11, D12, D14 | Model documentation, methodology, calibration data and window, proposed tier, sensitivity analysis (§4.1) |
| D9 | Predicted-versus-actual balance, prepayment and beta series (D9 §6.4) |
| D11 | **Hypothetical and actual P&L series** for VaR backtesting (D11 §2.4) — hypothetical is the comparator |
| D8 | Model selection registry; exercise assumption artefacts; library version and determinism statements (D8 §9) |
| D3 | Curve definitions, proxy and fallback applications, provenance statistics |
| D14 | Scenario definitions, transmission registry, overlay definitions and their base parameter references (§5) |
| External ECL function | Model documentation and validation evidence for the third-party model (§4.3) |
| `d15-control-core` | The audit trail, on which all of the above is recorded |

**Outbound.**

| Target | Content |
| --- | --- |
| Model owners | Validation findings, conditions of use, remediation deadlines |
| Every executing module | **Approved-usage list**, so an unapproved consumption is detectable (§3.3) |
| D17 | Model validity as a potential gate input (§9 criterion 8) |
| Board risk committee | Aggregate model risk, appetite utilisation, overdue population (§6) |
| Regulators and internal audit | The inventory, validation evidence, and the control environment as at a date (`d15-control-core` §6.2) |

## 9. Acceptance criteria

1. A stated definition of what constitutes a model exists (§2), and every candidate in §3.1 is
   classified against it — including the ones the corpus does not call models
2. The inventory holds all twenty-six items in §3.1 with owner, tier, approved usage, validation
   technique, validation status and next-due date
3. **Validation technique is a recorded field**; "no backtest" is either a recorded category or a
   finding, never ambiguous (§4.1)
4. Tier is reviewed on a cycle and on usage change, not assigned once (§3.2)
5. **Approved usage is a list of named consumers and purposes**, and a consumption by an unlisted
   consumer is detectable by the platform (§3.3)
6. The three approved-usage extensions in §3.3 — D12's two and D14's overlay — are recorded and
   validated as extensions, with the overlay carrying an explicit reliable-range statement
7. No tier-1 model reaches production use without independent validation; validation is performed by
   someone other than the developer, and vendor validation alone is never sufficient (§4.2)
8. A model past its revalidation date is visible on a standing report, and the escalation path is
   defined; whether it gates an EOD output is an explicit decision rather than an omission
9. Every model change — including **recalibration** and **bought-library upgrade** — routes through the
   control core's model tier with an impact statement (§5)
10. A base parameter recalibration triggers re-review of every D14 overlay referencing it (§5)
11. **Model provenance survives aggregation**: what share of a stated output rests on unvalidated,
    overdue or proxied models is a query (§6)
12. The regeneration test is recorded as an implementation control and is never cited as model
    validation (§4.4)
13. The control environment reproduces as at a historic date, including which model versions were
    approved for which use (`d15-control-core` §6.2 criterion 4, extended to models)

## 10. Open questions

1. **Does an independent validation function exist, and how deep is it?** (§4.2) The single most
   consequential question here, it is a hiring and budget question rather than an architectural one, and
   the answer determines whether tier-1 external validation is a supplement or the primary mechanism.
2. **Who owns the model inventory operationally** — a second-line risk function, or is it created by this
   programme with no permanent home? An inventory nobody maintains is worse than none, because it reports
   coverage that has decayed.
3. **Does a model validity failure gate the EOD?** (§9 criterion 8) D17 can gate on it. Gating on an
   overdue revalidation would stop the bank reporting; not gating means the control has no teeth. The
   likely answer is neither — a provisional flag, as D17 already propagates — and it should be decided
   rather than defaulted.
4. **Is the collateral outflow proxy (item 17) formally in the inventory?** It is disclosed to a regulator
   as an interim method (D10 §3.6) and it is currently owned by an operational workstream rather than by
   a model owner. It also has a defined retirement path, which makes it the one model in the inventory
   with a planned end date.
5. **What validation evidence can be obtained for the external ECL model?** (§4.3) It depends on a
   conversation with another function, and if the answer is "none", the reliance must be disclosed rather
   than assumed.
6. **Does the bank have an existing model risk policy** predating this programme? If so, its tier
   definitions and validation standards take precedence over §3.2 and §4, and this artifact's job is to
   map the platform's twenty-six models onto them rather than to invent a parallel framework.
7. **Model provenance (§6) — is it built, and when?** It is the most valuable and least urgent thing in
   this artifact. Building it in Phase 7 is fine; designing the tag into computed outputs earlier is much
   cheaper than retrofitting, exactly as D3 §5's market data provenance was.

## Appendix — implications for other artifacts

| Ref | Change | Target |
| --- | --- | --- |
| J1 | **Parent §6's "Phase 7: D15 (full)" is the last surviving instance of the defect the critique found.** Validation must accrete from Phase 0; Phase 7 delivers *aggregate* model risk management, not the module (§7) | Parent §6 |
| J2 | **The revalidation cycle starts with the second model, not with Phase 7.** A Phase 2 curve model is due for revalidation four times before the owning module exists (§7.1) | Parent §6 |
| J3 | **Fourteen models in the platform are not named as models anywhere**, six of them tier 1 — the proxy hierarchy, proxy spread model, core/volatile split, collateral outflow proxy, PFE/XVA, and the external ECL model (§3.1) | D3, D10, D11, parent §2.6 |
| J4 | **Backtesting covers about a third of the inventory.** Parent §5 lists it as a governance element without qualification; EVE and curve construction have no realised outcome to backtest against (§4.1) | Parent §5 |
| J5 | **Three approved-usage extensions are treated as free** — D12's consumption of D9's and D10's parameters, and D14's stress overlay pushing parameters outside their calibration range (§3.3) | D9 §8.2, D12 §1.2, D14 §3.2 |
| J6 | **The external ECL model enters the inventory as a third-party model.** Parent §2.6 specifies the interface in both directions and is silent on reliance; model risk does not stop at the module boundary (§4.3) | Parent §2.6 |
| J7 | **A bought-library upgrade is a model change on the vendor's calendar, not the bank's** — and a validated version will eventually go end-of-life. Belongs with D8 §9.1's escrow requirement in the procurement conversation (§4.3) | D8 §9.1 |
| J8 | **Model provenance, on D3 §5's pattern.** Market data provenance survives aggregation; there is no equivalent for models, so "how much of this rests on an unvalidated model" is an investigation (§6) | Parent §5 |
| J9 | **The impact statement costs more for models than for rules.** `d15-control-core` §4's dry-run is a classification recompute for a rule set and a full EVE/NII re-run for a recalibrated NMD model (§5) | `d15-control-core` §4, `eod-window-and-degradation` |
| J10 | **The regeneration test is an implementation control, not a validation**, and should not be cited as model governance (§4.4) | Parent §2.5 |
| J11 | **Sensitivity analysis generalises from D9 to every tier-1 model.** D9 §6.4 calls it the module's most valuable output; it is also the primary validation evidence for every model that cannot be backtested (§4.1) | D9 §6.4 |
