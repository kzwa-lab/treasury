---
title: "D9 — ALM & IRRBB"
kind: spec
---

# D9 — ALM & IRRBB

Interest rate risk in the banking book: repricing gap, economic value of equity, net interest income
sensitivity, and the behavioural models all three depend on. Parent: `treasury-alm-risk-platform`.
Phase 3 of the build sequence.

**Revision 2.** Repricing gap corrected to consume `exposure_by_bucket` for non-linear positions (§3);
book intent recorded as classification dimension 9 (§2); CSRBB linked to the FVOCI revaluation reserve
and to capital (§7); three-way deposit-split reconciliation with D10 (§6.1).

**Why Phase 3, after valuation.** EVE is a present-value measure and needs D8's discounting
infrastructure. NII needs forward curves. Neither is computable on contractual cashflows alone, which
is what separates this module from D10 (see `d10-liquidity-and-funding` §3.1).

**What makes this module different from the rest of the platform.** Everywhere else, a number is
right or wrong. Here, the number is *an opinion expressed through assumptions* — and the assumptions
dominate the result. A retail bank's EVE sensitivity is driven more by its non-maturity deposit
profile than by anything on its balance sheet. That is not a defect to engineer away; it is the
nature of the measurement, and the design must make the assumptions visible, governed and
attributable rather than buried.

## 1. Responsibilities

**D9 owns:**

- Repricing gap analysis
- Economic Value of Equity (EVE) and its sensitivity to rate shocks
- Net Interest Income (NII) projection and sensitivity
- Supervisory outlier test computation
- **Definition and calibration of behavioural models** — non-maturity deposits, prepayment, early
redemption, rollover, pipeline
- Basis risk and optionality measurement
- Credit spread risk in the banking book (CSRBB)
- IRRBB limits, risk appetite and the ALCO analytical pack

**D9 does not own:**

- Cashflow projection or behavioural model *execution* — D2 executes the models D9 defines (D2 §4.3)
- Valuation and discounting — D8
- Curve construction — D3
- Scenario and shock definitions — D14
- Model approval, validation and backtesting governance — D15 governs; D9 supplies and operates
- Hedge accounting designation — D7, though D9 measures the risk that hedging addresses
- Which business unit *bears* the risk internally — D12; D9 measures the risk, FTP allocates it

**The boundary that matters most:** D9 defines behavioural models, D2 executes them, D15 governs
them. Three separations that exist so the system of record contains no opinions, the opinions are
owned by the people accountable for them, and no one marks their own homework.

## 2. Scope — what is in the banking book

IRRBB is measured on the **banking book only**. The trading book is covered by D11's market risk
framework. **Book intent is dimension 9 in D2's classification set** (added in revision 2 — it was
missing, and taxonomy lines A.3, A.4 and A.7 cannot be distinguished without it). That makes the book
classification a regulatory boundary carried as a queryable dimension, not an organisational
convenience, with three consequences:

- Book assignment must be governed, with movement between banking and trading book controlled,
documented and rare — regulators treat unexplained reclassification as arbitrage
- **Internal hedges between trading and banking book** (Part 1 §10) transfer risk across this
boundary. They are only recognised for IRRBB where the trading book has laid the risk off
externally; an internal hedge that merely relocates risk within the bank is not risk reduction
- **An internal hedge is not an FTP transfer contract — `D12-7`.** Both are Part 1 §10 internal ALM
instruments, both are internal, and the names invite conflation. They are different objects with
different tests: an **FTP transfer contract allocates rate risk within the banking book** and is
always in IRRBB scope because the risk never leaves the book, whereas an **internal hedge crosses the
trading/banking boundary** and carries the external-lay-off recognition test in the bullet above.
Applying the recognition test to FTP mirrors would strip the banking book of transfers that never
left it, understating IRRBB by the full internally-allocated position
(`d12-funds-transfer-pricing` §1.2)
- Banking book derivatives held for hedging (Part 2 A.8, B.8) are in scope regardless of hedge
accounting designation — economic hedging and accounting hedging are different questions

## 3. Repricing gap

The oldest measure and the one with the most known limitations, still required and still useful as a
descriptive tool.

Assets and liabilities are slotted into time buckets by **next repricing date** — maturity for fixed
rate, next reset for floating, behavioural profile for non-maturity — and the net position per bucket
shows where the balance sheet reprices.

**The relationship to D10's ladder is worth being precise about.** Both are bucketed views of the
same D2 cashflows. The liquidity ladder buckets by *when cash moves*; the repricing gap buckets by
*when the rate resets*. A 5-year floating rate loan resetting quarterly sits in the 5-year liquidity
bucket and the 3-month repricing bucket. Same object, different bucketing attribute — which is why
D2's Cashflow record carries both payment date and next reset date (D2 §4.2).

**Revision 2 correction: the gap is not a pure cashflow aggregation.** The parent blueprint originally
claimed repricing gap was an aggregation of cashflows like the liquidity ladder. It is not, for three
classes of position:

| Position | Problem | Treatment |
| --- | --- | --- |
| Options — swaptions, caps, floors, embedded optionality | A cashflow's rate treatment produces a meaningless bucket for a swaption | **Delta-equivalent exposure**, consumed as `exposure_by_bucket` from D8 |
| Futures — STIR, bond | No contractual cashflows at all, only variation margin | Notional exposure via `exposure_by_bucket` |
| Equity, commodity, and Balance-held items | Neither cashflow nor repricing basis | Contribute to EVE and NSFR, **excluded from the gap** with the exclusion stated |

The gap therefore consumes **cashflows for linear instruments and `exposure_by_bucket` from D8 for**
**non-linear ones**. This is one added field on D8's published contract (parent §1.4), not a structural
change — but a gap built on cashflows alone silently omits the optionality it most needs to show.

**State the limitations in the output, not just in a footnote.** Even corrected, gap analysis assumes
parallel shifts, ignores basis risk between indices, and treats all positions in a bucket as repricing
simultaneously. It should be presented as a structural description of the balance sheet, never as the
risk measure. EVE and NII are the risk measures.

## 4. Economic Value of Equity

```
EVE = PV(banking book assets) − PV(banking book liabilities)
ΔEVE = EVE(shocked curve) − EVE(base curve)
```

A long-run, present-value measure: what happens to the economic value of the bank if rates move and
the balance sheet runs off. Complements NII, which is short-run and earnings-based.

### 4.1 The four modelling choices that determine the answer

Each of these changes the result materially, each is a policy decision rather than a calculation, and
each must be **configurable, documented and consistently applied** — with the configuration versioned
alongside the result.

| Choice | Options | Effect |
| --- | --- | --- |
| **Commercial margins** | Include margins in cashflows and discount at a margin-inclusive rate, or strip margins and discount at risk-free | Materially changes ΔEVE. Regulators typically prescribe the margin-excluded view for the outlier test while banks manage on the margin-included view. **Both must be producible** |
| **Own equity** | Include equity as a zero-cost funding source with an assumed investment profile, or exclude it | Including it imports an assumption about equity's investment term that can dominate the result. The standard supervisory approach excludes it |
| **Run-off vs constant balance sheet** | EVE is a run-off measure — no new business | This is what distinguishes it from NII and must not be silently violated |
| **Discount curve** | Risk-free, or the bank's own funding curve | Interacts with the margin choice; the pair must be coherent, and an incoherent pair produces a plausible-looking number that means nothing |

### 4.2 Prescribed shocks and the outlier test

Six standardised shocks: parallel up, parallel down, steepener, flattener, short-rate up, short-rate
down. Each is a curve transformation with per-currency calibrated magnitudes, applied to the base
curve and revalued. **Owned by D14, not hardcoded here** — the same shock definitions must be
consumable by D10's stress framework and D11's market risk, or the numbers will not reconcile across
the ALCO pack.

The supervisory outlier test flags the bank where the worst-case ΔEVE across the six shocks exceeds a
prescribed share of Tier 1 capital, with a secondary test on ΔNII. Two design requirements: a post-
shock **interest rate floor** applies, typically graduated by tenor and permitting negative rates, and
breaching is a supervisory *trigger for dialogue*, not an automatic failure — so the output must
explain the driver, not merely report the breach.

Internal scenarios sit alongside the prescribed set: larger parallel shocks, historical rate paths,
basis-widening scenarios, and reverse stress tests asking what shock would consume a stated share of
capital.

## 5. Net Interest Income sensitivity

Projected interest income less interest expense over a defined horizon — typically 1 to 3 years —
under base and shocked curves. Where EVE is long-run and value-based, NII is short-run and
earnings-based, and **the two frequently disagree in direction**.

That disagreement is a feature. Lengthening liability duration protects NII and can worsen EVE.
Presenting one without the other lets a bank optimise a metric while damaging its actual position.
The ALCO pack must show both, and where they conflict, say so explicitly rather than leaving a reader
to notice.

**The balance sheet assumption is the central choice:**

| Assumption | Meaning | Use |
| --- | --- | --- |
| Static / run-off | No new business; existing book runs off | Comparable to EVE, isolates the existing position |
| Constant balance sheet | Maturing volumes replaced like-for-like | The standard supervisory basis for the NII outlier test |
| Dynamic | Business plan volumes and margins, including new business pipeline | Management view; embeds the business plan's assumptions, so it measures plan-plus-rates rather than rates alone |

All three must be producible, and every NII output must state which basis produced it. A dynamic NII
number quoted without its basis is uninterpretable.

**Margin compression under falling rates** is the mechanism that most commonly makes NII projections
wrong, and it must be modelled explicitly: deposit rates cannot fall below zero (or below the bank's
own floor policy), while asset yields can. This creates an asymmetry that a symmetric shock model
misses entirely — the bank loses more from a down-shock than it gains from an equivalent up-shock,
and the loss is structural rather than a modelling artefact. It is driven by the deposit beta floor
described in §6.2.

## 6. Behavioural models

The heart of the module, and the part a supervisor will interrogate hardest. D9 defines and
calibrates; D2 executes (§4.3 of that spec); D15 governs.

### 6.1 Non-maturity deposits — the dominant assumption

Retail and corporate current, savings, call and notice accounts (Part 2 B.3) have no contractual
maturity and a rate the bank sets at its discretion. For most retail banks **this single model drives**
**the IRRBB result more than any other input.**

Three separate modelling questions, often wrongly collapsed into one:

**(a) Volume stability — how much stays?** Split the balance into a *core* portion (stable through
rate and stress cycles) and a *volatile* portion (short-tenor, immediately repricing). Calibrated
from historical balance behaviour, ideally through at least one full rate cycle. Segmented by product,
customer type and — where the data supports it — customer tenure and balance band, because a
long-standing small retail balance behaves nothing like a large corporate operational balance.

**(b) Maturity profile — how long does the core last?** The core portion is spread across a maturity
profile, either a decay function or a slotting profile. Supervisory approaches cap the average
maturity by category — retail transactional accounts attract the tightest cap, non-financial wholesale
a shorter one still. **The cap is the binding constraint in practice**, so the model must produce both
the internal view and the capped supervisory view, and show the difference.

**(c) Repricing beta — how much of a rate move is passed on?** The pass-through rate from market rate
to deposit rate. Typically well below 1, **asymmetric** (banks pass on rate rises more slowly than
falls), **lagged**, and **floored** — a deposit rate cannot go below zero in most markets, so beta
collapses toward zero as rates approach the floor. This asymmetry is what drives the margin
compression in §5, and modelling beta as a single symmetric constant will systematically understate
down-shock damage.

Beta and maturity profile interact and must be calibrated together: a high-beta deposit reprices
quickly and behaves short regardless of how stable its balance is. Stability is a liquidity property;
beta is a rate-risk property. **Conflating them is the most common modelling error in this area.**

The deposit book is split three separate ways for three separate purposes — LCR's prescribed
stable/less-stable classification (not a model at all), D10's internal core/volatile balance split
(liquidity behaviour), and D9's core/non-core plus maturity profile plus beta (rate-risk behaviour).
They share a customer and product segmentation and nothing else. The three-way reconciliation is set
out in `d10-liquidity-and-funding` §5.1 and is binding on both modules: **D9 and D10 draw different**
**parameters from a shared model inventory, and the platform must not implement a single "deposit**
**stickiness" figure serving both.**

### 6.2 Prepayment

Applies to residential mortgages, personal loans and other prepayable assets. Modelled as a
conditional prepayment rate, driven by rate incentive (the gap between contract rate and prevailing
rate — the dominant driver), seasoning, seasonality, burnout, and borrower characteristics where
available.

Prepayment is **rate-dependent, which makes it an option the bank has sold**. Borrowers prepay when
it suits them, so the model must be rate-path-sensitive, not a static constant. A fixed CPR applied
across all shock scenarios removes precisely the optionality the measure exists to capture.

**The sold option has a price, and D12 is where it gets charged — `D12-8`.** This section identifies
the optionality and measures it; nothing in the platform makes the originating business unit *pay* for
it unless FTP carries an **option cost component** built on these same prepayment models. Without that
component the bank underprices its prepayable book — and does so with no decision having been taken,
because the omission appears nowhere: the loan shows a healthy margin and the cost surfaces only as an
IRRBB number treasury cannot attribute to anyone. The models this section specifies are therefore an
input to `d12-funds-transfer-pricing` §1.2's component set, not only to §4's EVE
(`d12-funds-transfer-pricing` §1.2).

### 6.3 Other behavioural models

| Model | Applies to | Driver |
| --- | --- | --- |
| Early redemption | Retail term deposits | Break penalty vs rate incentive; asymmetric — depositors break when rates rise |
| Rollover / stickiness | Wholesale and corporate term deposits | Relationship, rate competitiveness, market conditions |
| Drawdown | Undrawn commitments, revolvers, overdrafts | Utilisation, rate-dependent for priced facilities |
| Pipeline | Committed but undrawn new business | Pull-through rate; dynamic NII only |
| Automatic optionality | Caps, floors, collars embedded in loans and deposits | Rate-path-dependent, valued by D8 rather than modelled here |

**Automatic and behavioural optionality are different things and must be measured separately.** An
embedded rate cap on a mortgage exercises mechanically when rates cross a level; a borrower prepaying
exercises imperfectly and slowly. Both are optionality; only one is rational.

### 6.4 Model governance requirements

D15 owns the framework; D9 must supply:

- Documented methodology, data sources and calibration window per model
- Calibration frequency and trigger conditions for out-of-cycle recalibration
- Backtesting: predicted versus actual balance behaviour, prepayment rates and deposit betas
- Sensitivity analysis showing how the IRRBB result moves with each key assumption — **the most**
**valuable single output of the whole module**, because it tells ALCO which assumptions actually
matter
- Version control and effective dating, so a metric movement decomposes into balance sheet change
versus recalibration (D2 §4.3)

**Sensitivity analysis is not a D9 speciality — `D15-11`.** The bullet above is written as a D9
requirement because this is where its value is most obvious. **It generalises to every tier-1 model in
the platform**, and for a structural reason: it is the *primary validation evidence for every model
that cannot be backtested*. About two-thirds of the inventory has no realised outcome to compare
against — EVE, curve construction, the proxy hierarchy, PFE — and for those, showing how the output
moves with each input is the strongest available evidence that the model behaves as claimed
(`d15-model-governance` §4.1). D15's validation standards should therefore require it as standard
output regardless of owning module, and D9's version of it is the worked example rather than the
exception.

**Design requirement: assumption attribution.** Every EVE and NII output must decompose its movement
between position change, curve change and assumption change. Without it, "why did EVE move" cannot be
answered, and it is the first question at every ALCO.

## 7. Basis risk and CSRBB

**Basis risk.** Assets and liabilities repricing off different indices — or the same index at
different tenors — do not move together. Prime-linked assets against term-deposit-linked funding, 3m
against 6m reference rates, policy rate against interbank rate. A gap report showing a matched
position can conceal material basis risk. This requires **index-level granularity in the repricing**
**profile**, not just fixed-versus-floating, and basis scenarios where indices move by different
amounts.

**Credit spread risk in the banking book.** Distinct from IRRBB and frequently omitted: the risk that
the credit spread component of banking book instrument values moves independently of the risk-free
rate. Applies principally to the FVOCI investment portfolio (Part 2 A.4), where spread moves flow
through OCI and affect capital without touching P&L. Supervisors now expect CSRBB to be identified,
monitored and reported — so it needs an owner, and it belongs here rather than in trading book market
risk because the instruments are in the banking book.

**CSRBB and the FVOCI revaluation reserve are two views of one thing, and the link must be explicit in**
**both directions.** The FVOCI revaluation reserve (Part 2 C.4) is the *accounting expression* of the
spread moves CSRBB measures: what D9 reports as spread risk is what accumulates in that reserve and
flows into CET1. Two design consequences:

- The reserve is a **derived value with no primitive of its own** (D2 §2.7) — computed from D8
valuations via D7, never posted independently. D9's CSRBB measure and D7's reserve movement must
reconcile to the same underlying revaluations, and a reconciliation between them is the natural
control
- **CSRBB is therefore a capital measure, not only a risk measure.** Its output belongs in D13's
capital projection alongside D9's ALCO reporting, because an unhedged spread move on a large FVOCI
portfolio reduces CET1 without ever appearing in profit or loss

## 8. Relationship to FTP

D12 transfers interest rate risk from business units to treasury: a business unit is charged or
credited at an FTP rate matched to the contract's repricing profile, leaving it with credit and
operational risk while treasury holds the rate risk.

**Three consequences for D9:**

1. IRRBB is measured on the **whole banking book** regardless of internal allocation. FTP determines
 who *bears* the risk internally, not whether it exists.
2. FTP and IRRBB **must use the same behavioural assumptions.** If FTP prices a non-maturity deposit
 as 3-year money while IRRBB models it as 5-year, the bank has transferred a different risk from the
 one it measures, and the residual sits with treasury unmeasured and unattributed. This is a real
 and common failure, and the fix is architectural: one behavioural model set, consumed by both.
3. Treasury's residual position after FTP transfer is where hedging decisions get made, so D9 must
 report both the gross banking book position and treasury's residual.

**Consequence 2 states the requirement correctly and the phrase has a dangerous reading — `D12-1`.**
*"One behavioural model set, consumed by both"* means **one governed inventory**, not one parameter.
`d10-liquidity-and-funding` §5.1 requires the deposit book's three splits *not* to share a parameter —
a deposit that is rate-insensitive is not thereby a deposit that stays in a crisis. Read literally,
this consequence would source FTP's liquidity premium from D9's rate-risk parameters, **satisfying
acceptance criterion 9 while violating D10 §5.1**. D12 calibrates nothing and draws from two owners:
**D9's split 3 for the repricing component, D10's split 2 for the liquidity component**, and D9's
prepayment models for option cost — each at a named version over the common segmentation
(`d12-funds-transfer-pricing` §1.2).

**Treasury's residual has two causes and consequence 3 reports it as one — `D12-4`.** FTP rates are
struck **at inception** and held for the contract's life; behavioural parameters are **recalibrated**
periodically. So risk transferred and risk measured diverge structurally, with no error anywhere and
nobody having made a decision. The two causes call for opposite responses and must be reported
separately:

| Cause | What it is | Response |
|---|---|---|
| **Unhedged position** | Treasury has taken a deliberate rate view, or has not yet executed | A risk decision. Hedge it, or accept it against limit |
| **Parameter vintage drift** | The book was priced on parameters that have since been recalibrated | An allocation artefact. Hedging it would be hedging an accounting difference |

Reported as one number, a growing residual reads as accumulating unhedged risk and invites a hedge
that corrects nothing. The split is a decomposition of an existing report rather than a new one.

## 9. Interfaces

**Inbound.** D2 — cashflows on both bases, repricing attributes, index granularity, positions and
Balances, book intent. D8 — present values, sensitivities **and `exposure_by_bucket`** under base and
shocked curves (§3). D3 — curves per currency and index. D14 — the six prescribed shocks plus internal scenarios. D13 — Tier 1 capital for outlier test
denominators, and the prescribed NMD maturity caps. D12 — FTP rates and internal transfer positions.
D7 — hedge designations, for reporting the hedged versus unhedged position.

**Outbound.** ΔEVE and ΔNII to D13 for regulatory disclosure and to the ALCO pack. Behavioural model
definitions and parameter sets to D2 for execution and to D12 for FTP consistency. IRRBB limit
utilisation to the limit framework. Hedging requirements to treasury via the ALCO process.

## 10. Acceptance criteria

1. All six prescribed shocks compute, with correct per-currency calibration and post-shock floors;
 outlier test results reconcile to the supervisory definition
2. EVE produces margin-included and margin-excluded views, with and without equity, each labelled
3. NII produces static, constant and dynamic balance sheet views, each labelled with its basis
4. Every metric decomposes movement into position, curve and assumption change
5. Behavioural models are versioned and effective-dated; historic metrics reproduce under the
 parameters in force at the time (D2 §7)
6. Sensitivity analysis is produced for every key assumption as standard output, not on request
7. Deposit beta is modelled asymmetrically with a floor, and the down-shock asymmetry is visible in
 the output
8. Basis risk is measurable at index level; CSRBB is reported for the FVOCI portfolio
9. **D9, D10 and D12 consume the correct parameter set for each component — a reconciliation report
 proving it, not an assurance.** Amended per `D12-1`; the original wording ("D9 and D12 consume the
 same behavioural parameter set") was satisfiable in a way that violates D10 §5.1. The report shows,
 per deposit segment over the **common segmentation**: D9's split 3 and its version, D10's split 2 and
 its version, and which of the two D12 consumed **for each FTP component** — repricing from D9,
 liquidity premium from D10, option cost from D9's prepayment models (§8). A shared segmentation with
 divergent parameters is the passing state; a shared *parameter* across the repricing and liquidity
 components is the failure the criterion exists to catch

## 11. Open questions

1. **Historical data depth for calibration.** Non-maturity deposit models need balance and rate
 history through at least one full rate cycle. Does that history exist and is it retrievable from
 core banking? If not, the first-generation models are judgement-led, and that must be disclosed
 rather than implied away.
2. **Deposit beta in the local rate environment.** Beta calibration assumes an observable
 relationship between market and deposit rates. In administered, floored or volatile rate regimes
 that relationship may be weak or absent, which changes the modelling approach materially.
3. **NMD segmentation granularity.** How finely can deposits be segmented given available customer
 data — product only, or product plus customer type plus tenure plus balance band? This sets the
 ceiling on model quality.
4. **CSRBB scope.** Which instruments are in scope, and is a separate spread curve infrastructure
 needed in D3 beyond what valuation already requires?
5. **Internal hedge recognition.** What is the policy for recognising internal trading/banking book
 hedges, and is there an operational control ensuring the trading book actually lays them off
 externally?
6. **ALCO reporting cadence and approval.** Monthly IRRBB pack presumably, but assumption changes
 need an approval path — who signs off a recalibrated deposit beta, and on what cycle?

## Appendix — amendments applied from sibling modules

Findings raised by `d12-funds-transfer-pricing` and `d15-model-governance` against this artifact,
recorded as deferred-with-trigger in the parent's D12 and D15 appendices and applied here under the
trigger *"D9 is next amended"*. Refs keep their originating module's namespace
(`blueprint-amendment-protocol` R1); this is not a D9 pass and allocates no `D9-n`.

| Ref | Applied | Section |
|---|---|---|
| `D12-1` | Acceptance criterion 9 rewritten. The original was satisfiable in a way that violates D10 §5.1 — it is the amendment that changes a test rather than adding prose | §8, AC9 |
| `D12-4` | Treasury's residual decomposed into unhedged position and parameter vintage drift | §8 |
| `D12-7` | FTP transfer contracts distinguished from internal trading/banking hedges; the external-lay-off recognition test does not apply to FTP mirrors | §2 |
| `D12-8` | Prepayment models named as an input to FTP's option cost component | §6.2 |
| `D15-11` | Sensitivity analysis generalised from D9 to every tier-1 model, as the primary validation evidence where backtesting is impossible | §6.4 |

**`D12-1` is the one to re-read if only one is read.** The others add a distinction or a consumer; this
one corrects an acceptance criterion that a build could have passed while producing the wrong number.

**Not applied, and why.** Open questions 4 (CSRBB scope) and 5 (internal hedge recognition) are bank
decisions rather than document gaps — `D12-7` sharpens what question 5 is asking without answering it,
and `D3-3` tracks the CSRBB dependency from D3's side.
