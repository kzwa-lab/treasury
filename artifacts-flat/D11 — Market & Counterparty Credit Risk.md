# D11 — Market & Counterparty Credit Risk

VaR and expected shortfall, sensitivity aggregation and P&L attribution, SA-CCR per netting set, PFE,
CVA/DVA, settlement and issuer risk. Parent: `treasury-alm-risk-platform`. Phase 5 — **with a Phase 4
counterparty carve-out this deep-dive establishes (§6).**

**D11 is the last analytics module and it inherits everything.** D3's history, D8's revaluations, D1's
netting sets, D2's book intent, D14's grammar. It computes almost nothing from primary data, and that
is the shape of its risk: **every upstream inconsistency in the platform converges here and shows up as
an unexplained P&L residual.** §2.3 argues that residual is the best single health metric the platform
has, and that D11 should be built to expose it rather than to make it small.

**Two reconciliations drive this deep-dive.** The D14 boundary (§1.3), which is the reason this artifact
was commissioned and which turns out to have a missing object on both sides of it. And the parent's own
description of D11, which contradicts D8 on sensitivities (§1.2) and contradicts itself on the limit
framework (§1.4).

**And one open item is closed.** Parent Appendix I leaves the platform's last unowned decision here —
whether the VaR fan-out uses full revaluation or sensitivity approximation, and therefore whether D14's
transformation grammar is load-bearing for a capital number. **Both halves resolve, and neither the way
the parent's conditional expects.** The grammar is load-bearing for market risk RWA regardless, because
the bank is on the standardised approach and the standardised approach *is* the sensitivities (§2.2.1).
And the fan-out question is two questions, one of which PFE arithmetic has already answered (§5.1).

## 1. Responsibilities and boundaries

### 1.1 Two modules under one name

**D11 is a naming decision, not a bounded context**, and it is worth saying so before specifying it.

| | Market risk | Counterparty credit risk |
| --- | --- | --- |
| The question | My positions move against me | Someone else fails to pay me |
| Scope | **Trading book only** (D2 book intent, D13 §3) | **Both books** — any derivative or SFT counterparty (§3.1) |
| Primary data | Risk factor history, positions | Netting sets, CSAs, exposure profiles, ratings |
| Regulatory frame | Market risk RWA, standardised | SA-CCR, CVA capital, large exposures |
| Compute shape | Wide fan-out over one date (§5) | Deep simulation over time steps per netting set |
| Owner in most banks | Market risk | Credit risk |

They share **one** genuine component — the revaluation grid — and **one** genuine analytical link,
wrong-way risk (§3.5). Everything else is adjacency.

**Two consequences, and the first has already happened.** Revision 1 buried the limit framework inside
D11 because "risk limits" sounded like one thing; the critique pulled it out and the parent moved it to
Phase 4 (§1.4). And **the two halves have different natural phases** — market risk genuinely waits for
history and a trading book, counterparty risk is needed the moment the bank books its first
uncollateralised derivative under a Phase 4 front-to-back system (§6).

**This artifact keeps them in one module** — splitting them into D11a and D11b would add a domain to a
seventeen-domain map for a boundary that is organisational rather than architectural — **but specifies
them separately throughout and phases them separately.** Anywhere the two are treated as one thing is a
place to look for a defect.

### 1.2 The D11 / D8 boundary — the parent's wording is wrong on sensitivities

Parent §1.5 gives D11 *"sensitivities and P&L attribution"*. `d8-valuation-and-analytics` §1.1 makes
sensitivities the third of D8's four outputs, computed under a versioned perturbation convention.

**Both cannot be right, and D8 is.** Its §1.2 states the governing rule — *"D8 computes per subject, and
everything that spans subjects belongs to someone else"* — and a sensitivity is a per-subject quantity.
A DV01 is computed by repricing one trade; there is no aggregation in it.

**Correction: D8 computes sensitivities per subject; D11 aggregates, buckets, limits and explains
them.** That is not a trivial relabel — it decides whether the bought pricing library's greeks are the
bank's greeks (they are) or whether D11 recomputes its own (it must not, because then P&L attribution
reconciles against numbers nobody else uses). Parent §1.5 should read *"sensitivity aggregation and P&L
attribution"*.

**D11 owns one thing about sensitivities that D8 does not:** which sensitivities the bank needs, in what
bucketing, for which limit and report. That is a demand on D8's output set, not a second implementation.

### 1.3 The D11 / D14 boundary — reconciled

`d14-scenario-and-stress-framework` makes three statements about this boundary. **All three are
accepted**, and each has a reciprocal obligation on D11 that D14 could not state from its own side.

| D14 says | D11 accepts | The reciprocal obligation |
| --- | --- | --- |
| §1.4 — statistical scenario sets (HS VaR draws, Monte Carlo paths) are D11's, not D14's; governance granularity is the distinction | Yes. The *method* is a D15-governed model; the draws are data | D11 must be able to state, for any VaR number, which **method version** and which **history window version** produced it — the governance D14 declines is not thereby absent, it moves to D15 (§2.2) |
| §1.4 — **stress period identification** for stressed VaR is D14's: a named, approved, capital-relevant judgement | Yes | But the *identification* is a search over D11's history and D11's portfolio. **D11 computes the candidates; D14 governs and approves the choice** (§1.3.2) |
| §1.6, §2.5 — D14 owns the **transformation grammar**; D11 is named as its third consumer, for "the representation its historical risk factor moves are captured in" | Yes, and it is the most consequential of the three | **The binding starts in Phase 0, not Phase 5** (§1.3.3) |

#### 1.3.1 The missing object — "risk factor" is used by three modules and defined by none

D14 §1.5's transmission registry maps *(macro variable → transmission model → **target risk factor** or
parameter)*. D14 §2.5's grammar binds per *(risk factor class, curve or surface id)*. D3 §6 organises
its history dataset *"by risk factor rather than by instrument"*. **Three modules depend on a risk
factor having a stable identity, and no artifact says what one is or who names it.**

This matters because the term is genuinely ambiguous between two different things:

| | **Market object** | **Risk factor** |
| --- | --- | --- |
| Example | The ZAR 3m-JIBAR swap curve, as a curve | Its 5y node; or the first principal component of its moves |
| Owned by | **D3** — the bounded curve inventory (D3 §4.3) | **D11** — a modelling decomposition |
| Stable? | Yes. It is reference data | **No.** Changing from 12 nodes to 3 PCA factors is a model change |
| Governed as | Reference data, versioned | A model, validated by D15 |

**Decision: D14 shocks market objects, never D11 risk factors.** A shock definition and a transmission
registry entry both target D3's inventory — a named curve, surface, spread or price — because that
inventory is stable reference data that a scenario definition can outlive. D11's decomposition of those
objects into factors is a model choice private to its VaR method, revisable without touching a single
approved scenario.

**This is a correction to D14 §1.5's wording**, and it is not pedantry. If the transmission registry
targets D11's factors, then a change in VaR methodology — which happens, and is a D15 model change with
its own approval — silently invalidates every board-approved macro scenario's transmission mapping. The
scenarios would still run. They would simply be pointing at factors that no longer mean what they meant
when the board approved them.

#### 1.3.2 Stress period identification is a search, and it recurs

D14 §1.4 places the window definition with D14, correctly — it is a named, approved choice with material
capital consequence. But *which* window is most stressful is **portfolio-dependent**: a 2008 window is
severe for a credit book and unremarkable for a ZAR rates book. It cannot be chosen by inspection.

**The division, matching D14's own reverse-stress pattern (§5 there):** D11 runs the search over its
history and current portfolio and returns ranked candidate windows with the loss each implies; D14
governs the bounds of that search, approves the selection, and holds the result as a named artefact.
Neither module can do the other's half.

**Two properties nobody has stated.** The identification **recurs** — the portfolio changes, so a window
approved two years ago may no longer be the stressed one, and re-identification is a scheduled
governance event rather than a one-off. And **the search itself needs bounding** for exactly D14 §5's
reason: an unbounded search over a ten-year history returns the window containing the single worst day,
which may be a data error rather than a stress.

#### 1.3.3 The grammar binds in Phase 0, and this is the finding with a clock on it

D14 §2.5's grammar fixes representation, node set, magnitude unit and basis, floor application point.
D14 §1.6 names D11 as a consumer because a sensitivity-based VaR *"applies moves expressed one way to
greeks computed another"* if it diverges.

**The obligation runs earlier than either artifact implies.** D3 §6 and parent §6.1 establish that risk
factor history accumulates **from Phase 0** and is the one pre-build clock money can fix. D11 consumes
that history in **Phase 5**. So the convention under which a move is captured is fixed five phases
before the module that consumes it exists.

**A daily move captured as a zero-rate difference cannot be re-expressed as a par-rate difference
later without the original curve.** If the history stores differences and the curves behind them are not
retained, the conversion is not merely expensive — it is impossible, and the platform arrives at Phase 5
with a decade of history in a convention it can no longer change and did not choose deliberately.

**Requirement: the risk factor history carries a grammar version per observation from first capture.**
Concretely — capture the *level* alongside the difference, and stamp the grammar version on the series.
That is a Phase 0 data design decision, it is nearly free at capture, and it is the difference between a
convention change in Phase 5 being a re-derivation and being a rebuild. It also applies to a **purchased**
vendor history set (parent §6.1): the purchase decision must ask what convention the vendor's series is
in, and the answer belongs in the evaluation criteria rather than discovered on load.

### 1.4 The limit framework — three artifacts disagree, and two are stale

Parent §1.5 is explicit: *"The limit framework is not part of D11. It is a separate concern consumed by
D4's pre-deal checks and by D9, D10 and D11's outputs. Revision 1 buried it in D11 (Phase 5) while
relying on it in Phase 4; it now lands with Phase 4."*

**`d10-liquidity-and-funding` §7 and §9 were not updated.** Both still route breaches to *"the limit
framework D11 operates"* / *"the limit framework in D11"*. These are revision-1 references that survived
the re-cut, and left alone they will put the limit engine back into Phase 5 — recreating the exact
dependency inversion the critique found, in which Phase 4's pre-deal checks consume a Phase 5 module.

**D11's actual position at that boundary**, stated so the stale references can be corrected against
something:

- D11 **produces measures** limits are set on — VaR, ES, sensitivity aggregates, PFE, current exposure,
  settlement exposure, issuer exposure
- D11 **defines what those measures mean** as limit types: what a "VaR limit" is measured against, at
  what confidence and horizon, and how utilisation is computed
- D11 **does not** hold limit values, hierarchies, approval workflow, breach escalation, or the pre-deal
  check itself. Those are the Phase 4 limit framework, shared with D9's IRRBB limits and D10's risk
  appetite thresholds

The distinction is the same one running through this whole corpus: **D11 authors the definition, the
limit framework executes it.** Same shape as D13's factor sets and D14's overlays.

### 1.5 What D11 does not own

| Not D11 | Owner | Note |
| --- | --- | --- |
| Per-subject valuation and sensitivity computation | D8 | §1.2 |
| Curve and surface construction; risk factor *history capture* | D3 | D11 consumes the dataset D3 §6 builds |
| Scenario, shock and stress path definitions; the transformation grammar | D14 | §1.3 |
| Netting set definition and enforceability opinions | D1 §3.8 | D11 computes per netting set; it does not decide what one is |
| Collateral state, margin calls, haircuts | D6 | Consumed for exposure, not managed |
| Limit values, hierarchy, workflow, pre-deal checks | Limit framework, Phase 4 | §1.4 |
| Model approval, validation, backtesting *governance* | D15 | D11 supplies backtest results; it does not grade itself |
| Capital computation from its exposures | D13 | D11 supplies SA-CCR EAD and CVA; D13 applies risk weights (D13 §3) |
| IRRBB, CSRBB and banking book rate risk | D9 | The book intent boundary, §2.1 |
| ECL and lending credit risk | External ECL function | D11 is derivative and securities counterparty risk, not the loan book |

**The last line is the one most often lost.** D11 is not the bank's credit risk function. It covers
counterparty credit risk on treasury instruments; obligor credit risk on the lending book is an ECL and
credit-department concern the platform consumes (parent §2.6).

## 2. Market risk

### 2.1 Scope is book intent, and the boundary is shared with D9

Market risk RWA is trading-book-only (D13 §3), scoped by **D2's book intent dimension** — the same
dimension that scopes IRRBB to the banking book (`d9-alm-and-irrbb` §2). **One dimension, two modules,
complementary scopes**, which makes it the only classification dimension in the platform where a
misassignment moves risk from one module to another rather than merely mislabelling it.

Three consequences follow from D9 §2 and apply symmetrically here:

- **A position must be in exactly one of the two.** A gap is a position measured by nobody; an overlap
  is double-counted capital. The completeness check across D9 and D11 scope is a real control and it
  belongs in D15's inventory, not in either module's self-assessment
- **Internal hedges cross the boundary** (D9 §2). Where the trading book takes on banking book risk and
  lays it off externally, D9 recognises the transfer — which means D11's trading book contains a position
  whose economic origin is the banking book, and it must be identifiable as such
- **Reclassification between books is governed and rare.** D11 inherits D9's statement of this; a
  position moving into the trading book after a loss is the classic arbitrage a regulator looks for

**For this bank the trading book may be small.** The scope decision is a treasury platform, and if
treasury runs a modest trading book with most derivative activity being banking book hedging, then
**§3's counterparty risk is materially the larger half of this module** and should be resourced that
way. Worth confirming early (§10 q1), because it changes both the build and the buy evaluation.

### 2.2 VaR, expected shortfall, and what the method choice actually commits to

The measure set: VaR and expected shortfall at defined confidence and holding period, by risk type
(rates, FX, credit spread, equity, commodity), by book and desk, with a diversification decomposition.

| Method | Needs | Cost | Weakness |
| --- | --- | --- | --- |
| Historical simulation | 1–2y clean daily history (D3 §6) | **250×+ full revaluation daily** (D8 §6) | Assumes the past window represents the future; a quiet window understates |
| Parametric / variance-covariance | Covariance matrix, sensitivities | Cheap — no revaluation | Assumes normality and linearity; wrong exactly where the book has optionality |
| Monte Carlo | Calibrated factor models | Highest | Model risk moves into the factor dynamics |

**The choice is D11's and it should be made with D8's §6 fan-out arithmetic on the table**, because
historical simulation is the honest default for a book with optionality and it is also the one that
sizes the hardware. D8 open question 3 — *"full revaluation or sensitivity approximation for Phase 5's
fan-out?"* — is stated there as a Phase 2 architecture decision that bites in Phase 5. **It is D11's
question and it must be answered in Phase 2**, which means D11 owes Phase 2 an answer three phases
before it is built (§6).

**A consequence of D13 §3 that changes the governance bar.** Regulatory market risk capital is
**standardised**, so VaR here is an *internal management* measure, not a capital model. That lowers the
regulatory validation burden and it does **not** remove it: the measure drives limits, ALCO reporting
and risk appetite, so D15 validates it as a model regardless. What it does change is that a backtest
exception is a management signal rather than a capital multiplier — which makes it *more* likely to be
quietly tolerated, not less, and is an argument for D15 grading it rather than D11.

#### 2.2.1 The same fact resolves the parent's open conditional, in the opposite direction

Parent Appendix I closes on a conditional it assigns to this module:

> *"If Phase 5's VaR fan-out uses sensitivity approximation rather than full revaluation, the grammar
> stops being a reconciliation aid and becomes load-bearing for a capital number… The decision is still
> D11's and still Phase 2-architectural."*

**The conditional is unnecessary and it points at the wrong number.** Under the parent's own scope
decision — Basel III/IV — **the standardised approach for market risk is the sensitivities-based
method**: delta, vega and curvature against prescribed risk weights and correlations. D13 §3 puts the
bank on it.

**So the sensitivities *are* the capital number, and the VaR fan-out decision has nothing to do with
it.** The grammar is load-bearing for market risk RWA whatever §5 concludes, because the representation,
node set and magnitude unit a sensitivity is computed under are inputs to the capital calculation
directly. **Re-binding a convention moves RWA while the scenario version, the snapshot version and every
other version line a reviewer would check stay identical** (D14 §7, I4's tenth reproducibility line).
Parent Appendix I's conditional should be struck and replaced with that statement.

Two things follow that no artifact currently carries:

**The grammar's node set has a third constraint, and it is prescribed.** D14 open question 9 weighs one
compute decision (D14 §8's node count) against one reporting decision (D8 §3.4's shared bucket
definitions) and recommends a single list. **Under a sensitivities-based capital regime there is a third
list — the regulatory tenor vertices the capital calculation is defined on — and it is not negotiable.**
A node set that does not contain them forces an interpolation between the risk number and the capital
number, which is unattributable in exactly the way §2.3's residual discipline exists to prevent.
**Recommendation: one list, containing the prescribed vertices as a subset**, decided when the grammar
is written in Phase 1 rather than rediscovered in Phase 6.

**The sensitivity ladder inherits a reporting-date tier.** `eod-window-and-degradation` §5 places risk
measures in tier B; §5.1 raises regulatory output to tier A on submission dates. If the sensitivities
feed market risk RWA, **the sensitivity ladder rises with them** and D8's per-subject production is on
the tier A path on those dates. VaR, being management-only, correctly stays tier B — the two split, and
the tier belongs on the measure rather than on "risk measures" as a class (§5).

**The alternative reading, stated so it can be checked in an hour.** If "standardised" in D13 §3 means
the pre-FRTB standardised measurement method rather than the sensitivities-based one, the capital number
is a maturity-ladder computation over positions and the paragraphs above weaken to the reconciliation
argument alone. **The grammar's Phase 1 deadline does not move either way** (D14 §9), so nothing is
blocked on the answer — but the node set decision is, and it is a question for regulatory reporting
rather than for architecture (§10 q8).

### 2.3 P&L attribution is this module's most valuable output

Parent §1.5 lists it in passing. **It is the single reconciliation that tests whether the rest of the
platform is internally consistent**, and it should be built for that purpose rather than as a reporting
by-product.

The decomposition: actual P&L, against risk-predicted P&L (sensitivities × observed factor moves),
against full-revaluation P&L (D8 against yesterday's and today's snapshots), explained into rate move,
spread move, FX, vol, time decay, new trades, amendments, fees and the residual.

**Every module in the platform is on trial in that residual:**

| Residual source | The module it indicts |
| --- | --- |
| Sensitivities perturbed under a different convention than moves are expressed in | **D14's grammar** (§1.3.3, D14 §2.5) — the failure D8 §3.3 describes as attributed to "higher-order effects" for as long as anyone will keep saying it |
| Snapshot changed between the valuation and the attribution | D3 §2 versioning |
| A trade booked late, amended without an event, or missing | D2, D4, D16 |
| Model-implied cashflows changed because yesterday's exercise assumption was used | **D8 §5.1's prior-day convention** — a deliberate, documented staleness that lands here as residual |
| Genuine higher-order effect | Nobody. This is the only legitimate residual |

**Design requirement: the residual is decomposed and trended, never netted.** A platform that reports a
small residual because two large errors offset is worse than one reporting a large residual, and the
only defence is decomposition by desk, risk type and instrument class.

**One regulatory hook worth noting even though it is out of scope.** FRTB's internal model approach
makes P&L attribution a formal pass/fail test at desk level. The bank is on standardised (D13 §3), so
that test does not bind — **but building attribution to that structure costs little now and is the
precondition for any future internal-model application.** Worth a deliberate decision rather than a
default.

### 2.4 Backtesting — hypothetical P&L, not actual

A VaR backtest compares the measure against realised P&L, and **which P&L is the classic error.**

- **Actual P&L** includes intraday trading, new deals, fees and commissions. Backtesting against it
  measures the desk's behaviour as much as the model
- **Hypothetical P&L** holds the position constant at the previous close and revalues under today's
  market. **This is the correct comparator** — it is the only one that answers "did the model predict
  the move on the book it was measured against"
- **Clean vs dirty** — hypothetical P&L excludes fees and reserve movements; carry and time decay are
  a documented choice, and either treatment is defensible provided it is stated and stable

D11 produces both series and supplies them to D15, which owns the exception counting and the grading.
**D11 must not grade its own backtest** — parent §5's segregation principle, and the reason D9 §6.4
sends its own backtesting to D15 too.

## 3. Counterparty credit risk

### 3.1 It spans both books, and this is the most common scoping error

Market risk is trading-book-scoped. **Counterparty credit risk is not.** An uncollateralised
cross-currency swap hedging banking book funding carries exactly the same counterparty exposure as an
identical trading book swap. Scoping all of D11 to the trading book — the natural reading of a module
named for market risk first — silently omits the derivative book that this platform exists to manage.

**Scope: every derivative, repo, reverse repo, securities lending transaction and unsettled trade,
in either book, plus deposits placed and nostro balances for settlement and issuer risk (§3.4).**

### 3.2 SA-CCR, PFE and the netting set

**Everything here computes per netting set** — parent §2.7, D1 §3.8, D13 §3 all say so, and it is the
reason netting sets are first-class objects in D1 rather than a derived grouping.

| Measure | Purpose | Nature |
| --- | --- | --- |
| Current exposure | Today's replacement cost, net of collateral | Deterministic, from D8 values and D6 collateral |
| **SA-CCR EAD** | Regulatory exposure at default → D13 | Prescribed formula: replacement cost + potential future exposure multiplier × add-on |
| **PFE profile** | Internal limit measurement and XVA input | Simulated exposure distribution over time steps |
| Effective EPE | XVA and internal capital | Derived from the PFE simulation |

**Three properties of SA-CCR that are easy to under-build**, each of which the corpus already carries a
dependency for:

1. **It is prescribed, not modelled** — a D13-authored rule set in D1 §3.9, exactly like the LCR factors
   (D13 §1.1). The asset-class add-ons, supervisory factors and correlations are regulator constants.
   **D11 executes; it does not calibrate.** The same architecture as D10's relationship to prescribed
   run-off factors
2. **The margin period of risk drives the answer** and is derived from CSA terms — margin frequency,
   threshold, MTA, dispute history — which is D1 §3.8 structured data. An unextracted CSA does not
   produce a conservative number; it produces no number
3. **Regulatory netting and accounting offsetting differ for the same netting set** (parent F7, D13 §3,
   D7 §6). D11 uses the regulatory determination; D7 uses the accounting one; both read D1. **D11 must
   not infer netting from D7's balance sheet presentation**, which is the shortcut that produces a
   capital number contradicting the return that discloses it

**The netting opinion gap is a capital cost, not a data gap** (parent F7). Where enforceability is
unopined, exposure computes gross. That is the correct treatment and it makes the
`counterparty-documentation-workstream` a D11 dependency as much as a D6 and D7 one.

**Two modelling traps that are silent, and both are cheap to avoid now:**

**The SA-CCR hedging set is not the primary risk type dimension.** D2 §2.4 and
`classification-rules-engine` §1 give D11 authorship of *primary risk type* — one value per Contract,
explicitly designated because a cross-currency swap is both FX and interest rate. **SA-CCR takes the
opposite view of the same trade**, decomposing it into legs across two asset classes and assigning each
to a hedging set. Different classifications, different cardinality. **Reusing the dimension for the
regulatory calculation understates exposure on exactly the cross-currency book a treasury holds most
of**, and the temptation to reuse it will be strong because in a data model they look alike. Primary
risk type is a presentation and reporting dimension; the hedging set assignment is a per-leg calculation
input.

**The extraction workstream has an unlisted consumer.** MPOR, threshold, minimum transfer amount and the
independent amount are **SA-CCR formula inputs**, not only collateral operations parameters.
`counterparty-documentation-workstream` scopes extraction against D6's and D3's needs — eligible
collateral schedules, collateral interest, rating triggers, discount curve selection — and **D11 is a
consumer nobody listed.** Adding fields to the extraction template now is free; re-opening a completed
legal review across the counterparty population in Phase 4 is not.

### 3.3 XVA

D8 §3.1 places CVA, DVA, FVA and ColVA with D11, per netting set, with D8 supplying exposure profiles.
Accepted — they are netting-set calculations and D8 values one subject at a time.

**The Phase 4–5 fair value gap is D11's to close, and D8 has already framed it.** D8 §3.1: IFRS 13 fair
value for an uncollateralised derivative includes CVA; CVA is a D11 (Phase 5) calculation; D7's
accounting fair value arrives in Phase 4. So **derivative fair value is structurally incomplete for one
phase**, and D8 lists three options with the choice belonging to finance.

**§6 recommends the second of them** — a simplified netting-set CVA pulled forward into Phase 4 — and
sets out why it is cheaper than it looks and what else it buys.

**DVA is worth one line because it is where risk and accounting diverge legitimately.** Accounting fair
value includes DVA; regulatory capital filters it out of CET1 (a prudential filter, D13 §2.1). The same
number is required in one output and excluded from another, which makes it an adjustment-stack item
(D8 §2.2's `purpose`) rather than a policy question.

### 3.4 Settlement and issuer risk — the two the parent names and nobody costs

**Settlement risk** is a different exposure shape from everything else in this module: **full principal
at risk for a short window**, not a mark-to-market replacement cost. An FX spot settling across
timezones exposes the full bought amount between paying and receiving — the Herstatt exposure. It
therefore needs its own measure, its own limit type and its own data: **settlement instructions and
actual settlement status from D5**, which is Phase 4. Netting it into counterparty exposure understates
it by orders of magnitude on settlement days.

**Issuer risk** is exposure to the *issuer* of a held security, distinct from the counterparty the
security was bought from. **`part2-query-specification` (parent Appendix B.1) already established the
data requirement**: `counterparty_type` must split into transaction counterparty and issuer/obligor —
the fifteenth dimension — because *"a bond bought from a bank and issued by a sovereign keys HQLA and
risk weight off the issuer"*.

**That split was justified for HQLA and risk weight; issuer risk is its third consumer and the one it
was actually named for.** Without it, the bank cannot answer how much exposure it has to a single issuer
across its trading book, banking book and collateral holdings — which is a large exposures question
(D13 §5) as well as a risk one, and the aggregation crosses D6's collateral pool because a bond held as
received collateral is issuer exposure too.

**The large exposures regime is still unmentioned in the parent, four revisions after
`architecture-critique` raised it.** It is a separate Basel framework from RWA — a hard 25%-of-Tier-1
limit, connected-counterparty grouping, and its own return — and it is the natural home of exactly the
aggregation above. **Nothing needs designing; three owners need naming**: the exposure aggregation is
D11's, the return is D13's, and the hard limit is a limit type in the Phase 4 framework. The data is
already assembled by D1's group hierarchy, the issuer split and D6's collateral inventory.

### 3.5 Wrong-way risk — where the two halves of this module actually connect

**Absent from every artifact in the corpus, and it is the one genuine analytical link between §2 and
§3.**

Wrong-way risk is exposure that rises as the counterparty's credit quality falls — the two risks
correlating rather than diversifying.

- **Specific**: a legal connection. Collateral issued by the counterparty or its group; a CDS bought on
  an entity related to its seller. **Detectable from data the platform already holds** — D1's group
  hierarchy against D6's collateral composition and D2's reference entities — and it should be a
  systematic check, not an analyst's recollection
- **General**: a statistical relationship. Selling USD/EM-currency protection to an EM bank, where the
  currency move that creates the exposure is the one that impairs the counterparty

**SA-CCR carries an explicit treatment** — specific wrong-way risk trades are removed from the netting
set and treated as their own — so this is not optional even under a standardised approach. And the
general case is where D14's scenarios earn their keep in this module: **a stress scenario that moves
market factors and counterparty credit quality together is the only way to see it**, which is precisely
the coherence requirement D14 §4 owns and the transmission problem D14 §1.5 describes.

## 4. Risk factor history — the binding constraint

Parent §6.1's third clock, D3 §6's dataset. **D11 is the module that cannot be built without it**, and
the numbers are unforgiving:

| Need | Depth | If absent |
| --- | --- | --- |
| Historical simulation VaR | 1–2 years clean daily | No VaR at all |
| Stressed VaR / stress period identification (§1.3.2) | **10+ years containing a genuine stress period** | A "stressed" measure calibrated on a calm decade, which is worse than none |
| Proxy spreads for illiquid names | Sector/rating history | Uncollateralised CVA on unrated counterparties has no spread input |
| Backtesting | Continuous from go-live | D15 cannot grade the model |

**Parent §6.1 already says this is the one clock money can fix.** Three additions from D11's side:

1. **The grammar version travels with the series** (§1.3.3), including a purchased one
2. **Proxy spread methodology is a Phase 5 model with a Phase 0 data dependency** (D3 §10). Most
   counterparties in a treasury book have no traded credit spread, so CVA rests on a proxy — and the
   proxy needs sector, rating and region history, which is a different purchase from rates and FX
3. **Corporate action adjustment and gap-filling decisions are made once, at capture** (D3 §6). D11 is
   the consumer that discovers a wrong decision, five years after it was made
4. **The purchase buys raw quotes and instrument definitions, not pre-derived risk factors.** §1.3.3
   requires the grammar version to travel with the series; a *purchased* derived series is bound to the
   vendor's conventions — someone else's grammar — and cannot be re-expressed in a representation the
   bank later chooses. Quotes plus definitions can be re-derived into any representation once D3's
   Phase 2 bootstrapping exists, at the cost of storage and a re-derivation run. **Parent §6.1 frames
   the third clock as a budget decision; it is also a specification decision**, and the specification
   has the earlier deadline
5. **A position whose risk factors have no history contributes zero VaR, silently.** It raises no error
   in a historical simulation — an absent factor is a flat series, which reads as a position with no
   risk. The exposure is worst for proxied names, which is where CVA also depends on the same coverage.
   **Rule, following D8 §4's: a position whose risk factors are not fully covered is reported
   uncovered, never as zero-risk**, and the uncovered proportion of the book is a published figure.
   This is D16 §4.3's suspense argument and D8 acceptance criterion 6, applied to risk

## 5. Compute — D11 is what sizes the platform

`d8-valuation-and-analytics` §6 states it plainly: Phase 5 is **250×+ revaluations of the trading book
daily** for historical simulation, plus Monte Carlo per netting set across time steps for PFE and XVA.
*"The Phase 5 number is what sizes the hardware, and it arrives three phases after the architecture is
fixed."*

**D11 is that number's owner**, and five things follow that neither D8 nor `eod-window-and-degradation`
can settle alone.

### 5.1 The revaluation-versus-approximation decision, answered

D8 open question 3 has been carried as a binary — *"full revaluation or sensitivity approximation for
Phase 5's fan-out?"* — across three parent revisions. **The binary is the wrong shape, because four
distinct fan-outs are collapsed into it and they have different answers:**

| Fan-out | Multiplier against one full pass `T` | Full revaluation feasible? |
| --- | --- | --- |
| Historical simulation VaR | ~250 `T`, daily | Expensive, arithmetically possible |
| Stressed VaR | ~250 `T`, daily | Same |
| P&L attribution step-through (§2.3) | ~10 `T`, daily | Trivially, and it must be — the residual is the point |
| **PFE / EPE exposure profiles** | **10⁴–10⁵ `T`** — netting sets × paths × time steps | **No. Not by any margin** |

**The fourth row settles half the question by arithmetic before anyone expresses a preference.** A few
hundred netting sets, a few thousand paths and a hundred time steps is hundreds of millions of
valuations nightly. No grid the bank will buy does that; every institution computing PFE uses
regression-based (American Monte Carlo) or grid-interpolated approximate revaluation. **D8 §8's own
phase table concedes it**, listing *"exposure profiles for XVA"* and *"full revaluation grid for VaR"*
as two different Phase 5 line items.

**So the platform contains an approximate revaluation path regardless of what is decided about VaR.**
That reframes the Phase 2-architectural question from *"do we build the approximation machinery"* —
settled, yes — to *"does the VaR number come from it"*, which is a later and much cheaper binding.
**D8 open question 3 is two questions and only one of them is Phase 2-blocking.**

**The option the binary hides: hybrid by model tier.** D8 §4 already partitions the universe by *how
non-linear the payoff is*, which is exactly what determines whether a second-order approximation holds:

| D8 model tier | Fan-out treatment | Why |
| --- | --- | --- |
| Linear — MM, FRNs, fixed bonds, FX forwards, IRS, basis swaps | Sensitivity-based, exactly | For a linear payoff, sensitivity-based *is* full revaluation. There is no approximation error to argue about |
| Analytic options — caps, floors, European swaptions, vanilla FX | Full revaluation, or delta-gamma-vega with a monitored residual | Analytic pricing is usually fast enough that full revaluation is the cheaper decision once the argument's cost is counted |
| Term-structure and smile-consistent — Bermudans, CoCos, barriers, digitals | **Full revaluation, or a fitted grid** | Where approximation breaks, and where the book's risk actually lives |
| Externally projected — ABS/MBS, index CDS | Full revaluation off stored cashflows | Cheap. D8 discounts rather than models |

**The rule that makes this a design rather than a preference: an approximation is permitted only where a
scheduled full-revaluation benchmark demonstrates it inside a stated tolerance, and the benchmark is
itself a reported control.** Run the full-revaluation VaR weekly against the daily approximate one,
publish the difference, escalate on drift. This turns the approximation from an assumption into a
measured quantity — the same move parent §5 makes for market data provenance and §2.3 makes for the P&L
residual. **Without it, "sensitivity approximation" is decided once and never revisited, on a book whose
composition changes underneath it.**

**Recommended: hybrid by D8 model tier, full revaluation the default, approximation permitted per tier
against the benchmark.** The per-tier binding can move later; the machinery and the grid cannot.

### 5.2 What is actually irreversible is the licence, not the method

| Question | When it must be decided | Reversible? |
| --- | --- | --- |
| Does the platform build approximate revaluation machinery? | Phase 2 — a wrapper and grid design property | No |
| Does the VaR number use it, and for which tiers? | Phase 5, re-tunable | Yes |
| **What sizes the Phase 2 grid and its licence?** | **Phase 2 RFP** | **No** |

**D8 §9 names the trap and D11 supplies the number that springs it: per-core grid licensing.** Phase 5's
fan-out multiplies core count by up to two orders of magnitude over Phase 2's single pass. A licence
negotiated against a one-pass workload is renegotiated three phases later from total lock-in, against a
vendor who by then knows the bank cannot leave (D8 §9.1). **D11's compute envelope belongs in the Phase 2
RFP**, three phases before the module exists — the same shape as every other row in §6's table.

**Calibration sharing is worth far more here than in Phase 2.** D8 §6 identifies it as the meaningful
optimisation; across 250 historical scenarios the calibration work repeats 250 times unless the service
wrapper is built to share it per derived snapshot. It is a wrapper property, so it is buildable — but
only if designed in before the wrapper exists.

### 5.3 Two hundred and fifty derived snapshots is not the scale D3 sized for

**Scenario fan-out and VaR fan-out share a mechanism and must share a grid.** D3 §8 already establishes
that derived snapshots are generated once per scenario and shared across D9, D10 and D11 — *"the
correctness argument for centralising shock application is also the performance argument."* A VaR run is
the same operation at 250 scenarios instead of six. **Building a second fan-out path for VaR would be
the architectural mistake**, and it is the natural one because VaR arrives two phases after the scenario
grid.

**But D3 §8's economics were sized for a handful of scenarios, and historical simulation asks for 250
derived snapshots daily.** That opens a design fork nothing in the corpus states: **materialise the 250
derived snapshots, or perturb without materialising them.** Materialising is reproducible and
storage-expensive; not materialising is cheap and re-opens exactly the divergence D3 §1.3 exists to
prevent, because an unmaterialised perturbation is a transformation applied inside a consumer.
**Recommended: materialise, with a retention policy shorter than the valuation retention** — the
reproducibility argument wins, and the storage is then bounded by a stated retention rather than by the
reproducibility guarantee. Left unstated, this gets decided by whoever hits the storage bill first.

### 5.4 The two-pass exercise protocol does not survive naive fan-out

**This needs deciding rather than discovering.** D8 §5 resolves the D2↔D8 circularity for callables through a stored exercise assumption
set, with §5.1 recommending the prior day's set to keep the EOD DAG acyclic. **Under 250 scenarios the
question returns in a worse form:** re-deriving exercise assumptions per scenario multiplies an already
expensive protocol by 250; holding them fixed across scenarios means the callable book does not exercise
differently under a +300bp scenario than under base — **which systematically understates exactly the
convexity the measure exists to capture.**

Neither answer is free. **Recommendation: hold exercise assumptions fixed within a scenario run, and
re-derive them for the small set of governed shocks D9 and D14 use for EVE** — where the convexity is
the point and the scenario count is six rather than 250 — **with the approximation stated in the VaR
methodology rather than left implicit.** What must not happen is the choice being made by whichever
implementation is convenient, because the resulting understatement is invisible in the output.

### 5.5 EOD tiering — and the workload with no tier at all

`eod-window-and-degradation` §5 puts risk measures in tier B, same business day. **That is one tier for
four workloads with different urgencies**, and the per-scenario `run_tier` recommendation D14 §8 makes
for scenarios applies here without modification — the tier belongs on the measure, not on "risk
measures" as a class.

| Measure | Tier | Note |
| --- | --- | --- |
| VaR / ES, stressed VaR | **B** | Management measure (§2.2). Back-fillable |
| **Sensitivity ladder** | **B, rising to A on reporting dates** | It is the capital number (§2.2.1), so §5.1's regulatory inversion catches it |
| Current exposure, SA-CCR | **B** | Formula over existing data, cheap |
| P&L attribution | **B** | Its output is tomorrow's backtest input; skipping breaks a control, not a report |
| **PFE / EPE simulation and full XVA** | **Unassigned — and it is the largest compute in the platform** | See below |
| Settlement exposure | **Intraday** (§3.4) | Outside the EOD contract entirely |

**`eod-window-and-degradation` §5's table has no row for the exposure simulation**, and it is none of
the four tiers: larger than everything else combined, not same-day-critical, and not skippable either,
because XVA feeds D7's accounting values and D13's capital.

**Recommendation: the exposure simulation is a scheduled workload with its own budget and its own
frequency** — most plausibly weekly full with a daily approximate roll-forward — and
`eod-window-and-degradation` should carry the row. This is the same recommendation that document's
sibling makes for reverse stress testing (D14 §8) and for the same reason: **a workload that does not
fit the nightly window should be planned as one that does not, rather than found not to.**

## 6. Phasing — Phase 5, with a Phase 4 counterparty carve-out

The parent places all of D11 in Phase 5. **That is right for market risk and wrong for counterparty
risk**, and the argument is the same shape as D14 §9's Phase 1 carve-out: a later module has an earlier
consumer that the phase table does not show.

**Three independent Phase 4 pulls on counterparty risk:**

1. **D8 §3.1's fair value gap.** Derivative fair value is structurally incomplete between Phase 4 and
   Phase 5 because CVA is a D11 calculation. D8 states this as needing a finance decision *"before Phase
   4 is planned"*
2. **Pre-deal limit checking arrives in Phase 4** with D4 and the limit framework (parent §1.5, §6). A
   pre-deal *counterparty* limit check needs a current exposure measure and an incremental exposure
   calculation. Without them, Phase 4's pre-deal check covers market and liquidity limits and silently
   omits counterparty limits — on the phase that introduces derivative dealing
3. **Settlement risk needs D5** (§3.4), which is Phase 4, and settlement exposure is at its most
   material precisely when straight-through processing goes live

**Carve-out: current exposure, SA-CCR, a simplified netting-set CVA, and settlement exposure land in
Phase 4.** All four rest on things Phase 4 already delivers — D1's netting sets (Phase 0), D8's exposure
profiles (Phase 2), D6's collateral (Phase 4), D5's settlement status (Phase 4). **SA-CCR in particular
is a prescribed formula over data that exists, not a model** (§3.2), which makes it much cheaper than
its Phase 5 placement implies. What genuinely waits for Phase 5 is everything needing history or
simulation: VaR, ES, stressed VaR, PFE profiles, full XVA and P&L attribution.

| Capability | Phase | Driver |
| --- | --- | --- |
| Risk factor history capture convention and grammar binding (§1.3.3) | **0** | The clock — history captured in a convention that cannot be changed later |
| Full-revaluation-vs-approximation decision (§2.2, §5) | **2** | D8's architecture is fixed in Phase 2 and must support the Phase 5 fan-out |
| Current exposure, **SA-CCR**, simplified CVA, settlement exposure, issuer exposure aggregation | **4** | D8 §3.1 fair value gap; D4 pre-deal counterparty limits; D5 settlement |
| Sensitivity aggregation, VaR/ES, P&L attribution, backtesting series | **5** | History depth, trading book, D8 grid |
| PFE profiles, full XVA, stressed VaR, stress period search (§1.3.2) | **5** | Simulation infrastructure and 10-year history |
| Wrong-way risk — specific detection | **4**, with SA-CCR | Prescribed treatment inside SA-CCR (§3.5) |
| Wrong-way risk — general, scenario-based | **5** | Needs D14 scenarios and the simulation grid |

## 7. Build/buy

Parent §6 says *"Buy the analytics"*. Correct, and it needs the same split D8 §1.3 applies to the
pricing library, because "the analytics" is three different things:

| Layer | Posture | Why |
| --- | --- | --- |
| VaR / ES / PFE / XVA engine | **Buy** | Mature vendor market; the mathematics is standard and the implementations are better than a bank's |
| SA-CCR | **Buy or build — genuinely either** | A prescribed formula. Cheap to build correctly, and cheaper still if the vendor already has it |
| **Risk factor history dataset and taxonomy** | **Build / purchase data** | §4. Not a product. The convention decisions are the bank's and start in Phase 0 |
| **P&L attribution** | **Build** | Depends on the bank's book, its explain categories and *this platform's* module boundaries. §2.3's residual table is not something a vendor can supply |

**Two evaluation criteria specific to D11**, beyond D8 §9's list:

- **Does the engine accept the bank's perturbation and shock conventions**, or does it impose its own?
  D8 §9 already asks this of the pricing library. If the risk engine imposes a different one, D14's
  grammar (§1.3.3) is broken by a purchase decision, and it will be discovered at the first P&L
  attribution
- **Does it consume the bank's exposure profiles**, or insist on revaluing internally with its own
  models? The second means two valuation engines, and the accounting value and the risk value diverge
  permanently — the failure D8 §2.2 exists to prevent, reintroduced through procurement

## 8. Interfaces

**Inbound.**

| Source | Content |
| --- | --- |
| D8 | Values, **sensitivities per subject** (§1.2), exposure profiles for XVA, model-implied cashflows |
| D3 | **Risk factor history** (§4), spreads, proxy spreads, volatility, market object inventory and identity (§1.3.1), derived shocked snapshots |
| D14 | Market scenarios; the **transformation grammar** (§1.3.3); the approved stress period window (§1.3.2) |
| D1 | **Netting sets and enforceability opinions** (§3.2); all three counterparty groupings; ratings; issuer identity (§3.4) |
| D2 | Positions, **book intent** (§2.1), reference entities, transaction counterparty and issuer split |
| D6 | Collateral held and posted, margin state, haircuts, collateral composition for specific wrong-way detection (§3.5) |
| D5 | **Settlement instructions and status** for settlement risk — Phase 4 (§3.4) |
| D13 | SA-CCR prescribed parameters as a D1-held rule set (§3.2) |
| D15 | Model approvals; backtest grading returned |

**Outbound.**

| Target | Content |
| --- | --- |
| D13 | **SA-CCR EAD and CVA per netting set**; market risk measures; issuer exposure for large exposures (§3.4) |
| Limit framework (Phase 4) | Measure definitions and utilisation — **not limit values** (§1.4) |
| D14 | **Candidate stress windows with implied losses** (§1.3.2); market transmission models for the registry (D14 §1.5) |
| D8 | CVA/DVA/FVA into the adjustment stack (D8 §3.1) — the one place D11 feeds back into valuation |
| D15 | Hypothetical and actual P&L series for backtesting (§2.4); model inventory entries |
| ALCO / risk committee | P&L attribution and its residual (§2.3), exposure concentration |

## 9. Acceptance criteria

1. **D11 consumes D8's sensitivities and computes none of its own** (§1.2) — demonstrated by the absence
   of a second perturbation implementation, not by assurance
2. Every VaR number resolves to a method version, a history window version and a **grammar version**
   (§1.3.3)
3. Risk factor history carries a grammar version and the underlying level per observation, from first
   capture in Phase 0 — including any purchased series (§1.3.3, §4)
4. **D14 shocks and transmission registry entries target D3 market objects, never D11 risk factors**
   (§1.3.1); a VaR methodology change invalidates no approved scenario
5. Stress period candidates are computed by D11 against a declared search bound and approved by D14;
   re-identification is scheduled, not one-off (§1.3.2)
6. Sensitivity-predicted P&L reconciles to full-revaluation P&L within a stated tolerance (D8 acceptance
   criterion 9 — D11's half), and **the residual decomposes by desk, risk type and instrument class and
   is never netted** (§2.3)
7. Backtesting uses **hypothetical** P&L on a constant position, with the carry and time-decay treatment
   documented; D15 grades it, not D11 (§2.4)
8. Every derivative and SFT position in **both books** carries a counterparty exposure (§3.1); the D9/D11
   book intent scope test shows no gap and no overlap (§2.1)
9. SA-CCR computes per netting set from D1's regulatory netting determination — **never inferred from
   D7's accounting presentation** (§3.2); an unopined netting set computes gross
10. Settlement exposure is measured as full principal at risk, separately from replacement cost, and is
    not netted into counterparty exposure (§3.4)
11. Issuer exposure aggregates across trading book, banking book and **collateral received**, using the
    transaction-counterparty / issuer split (§3.4)
12. Specific wrong-way risk is detected systematically from D1 group hierarchy against collateral and
    reference entities, and the SA-CCR treatment applies (§3.5)
13. The exercise-assumption convention under scenario fan-out is stated in the VaR methodology, not
    left to the implementation (§5.4)
14. VaR and scenario fan-out share one revaluation grid (§5.3, D3 §8)
15. **The grammar's node set contains the prescribed capital vertices as a subset**, so no
    interpolation sits between the sensitivity ladder and the market risk capital number (§2.2.1)
16. Where an approximate revaluation path feeds a reported number, a **scheduled full-revaluation
    benchmark** runs, its difference is published, and a drift threshold escalates (§5.1)
17. A position whose risk factors are not covered by the history is **reported uncovered, never as
    zero-risk**, and the uncovered proportion of the book is published (§4)
18. The SA-CCR hedging set is derived per leg and is **not** the primary risk type dimension (§3.2)
19. Derived snapshots for the VaR fan-out are materialised and version-addressable, under a stated
    retention shorter than the valuation retention (§5.3)
20. The exposure simulation has a declared tier, budget and frequency, distinct from "risk measures"
    (§5.5)

## 10. Open questions

1. **How large is the trading book?** (§2.1) It determines whether this module is market-risk-led or
   counterparty-led, which changes the build, the buy evaluation and the phasing emphasis. A factual
   question answerable now, and everything in §7 depends on it.
2. ~~**Full revaluation or sensitivity approximation for the Phase 5 fan-out?**~~ **Answered in §5.1**
   and it should be struck from D8 §11 too. The machinery question is settled by PFE arithmetic — build
   it, in Phase 2. The VaR question is a per-model-tier binding against a full-revaluation benchmark,
   re-tunable later. **What remains open is not the method but the number: `T`, one full revaluation
   pass of the fair-valued book**, which sizes the Phase 2 grid and its licence and is measurable as
   soon as D8's wrapper exists (§5.2). Make it a Phase 2 deliverable, not a Phase 5 discovery.
3. **Is the Phase 4 counterparty carve-out accepted, and does it resolve D8's CVA-free fair value
   question?** (§6, D8 §3.1 / open question 2) The two questions have one answer and are currently held
   in two artifacts.
4. **Which VaR method?** (§2.2) Historical simulation is the honest default and the expensive one.
   Interacts with q1, q2 and the history purchase.
5. **Does the vendor history set carry a stated convention**, and does it cover credit spreads by sector
   and rating for proxy spreads (§4)? A purchasing question with a Phase 5 modelling consequence.
6. **Is P&L attribution built to FRTB's desk-level structure** even though the bank is on standardised
   (§2.3)? Cheap now, precondition for any future internal-model application, and a deliberate decision
   rather than a default.
7. **Who owns counterparty credit risk organisationally** — treasury risk or the credit department
   (§1.1)? It does not change the architecture and it changes who specifies §3.
8. **Does "standardised" market risk in D13 §3 mean the sensitivities-based method?** (§2.2.1) Under
   Basel III/IV it does, and then the sensitivities *are* the capital number and the grammar's node set
   must contain the prescribed vertices. A question for regulatory reporting, answerable in an hour,
   and it binds the Phase 1 grammar rather than the Phase 5 engines.
9. **Is the exposure simulation weekly-full plus daily roll-forward, or something else?** (§5.5) It has
   no tier, no budget and no frequency today, and it is the largest compute in the platform.
10. **Are the extraction template's SA-CCR fields being collected?** (§3.2) MPOR, threshold, MTA and
    independent amount. Free to add now, expensive to retrofit across a completed legal review.

## Appendix — implications for other artifacts

| Ref | Change | Target |
| --- | --- | --- |
| H1 | **Parent §1.5's D11 description says "sensitivities"; D8 owns them.** Should read "sensitivity aggregation and P&L attribution" | Parent §1.5 |
| H2 | **`d10-liquidity-and-funding` §7 and §9 carry stale revision-1 references** routing breaches to "the limit framework D11 operates". Parent §1.5 moved it out of D11 to Phase 4; left uncorrected they will rebuild the Phase 4→5 dependency inversion the critique found | D10 §7, §9 |
| H3 | **D14 §1.5's transmission registry should target D3 market objects, not "risk factors."** A VaR methodology change would otherwise silently invalidate the transmission mapping of every board-approved macro scenario | D14 §1.5 |
| H4 | **The risk factor history must carry a grammar version and the underlying level from first capture** — a Phase 0 obligation created by a Phase 5 module, and it applies to purchased history too | Parent §6.1, D3 §6 |
| H5 | **A Phase 4 counterparty carve-out** — current exposure, SA-CCR, simplified CVA, settlement exposure — resolving D8's Phase 4–5 fair value gap and Phase 4's missing pre-deal counterparty check | Parent §6, D8 §3.1 |
| H6 | **Wrong-way risk is absent from the corpus** and is the one genuine analytical link between market and counterparty risk. SA-CCR's prescribed treatment makes it non-optional even on the standardised approach | Parent §1.5 |
| H7 | **Settlement risk is a distinct exposure shape** — full principal, short window — needing its own measure and limit type, and D5 data from Phase 4. Netting it into counterparty exposure understates it materially | Parent §1.5 |
| H8 | **The issuer/transaction-counterparty split gains its third and defining consumer.** Appendix B.1 justified it for HQLA and risk weight; issuer risk and large exposures need it aggregated across both books and collateral received | Parent Appendix B.1, D13 §5 |
| H9 | **The exercise-assumption convention under scenario fan-out needs deciding** — fixed assumptions across 250 scenarios understate callable convexity; re-deriving multiplies an expensive protocol by 250 | D8 §5.1, `eod-window-and-degradation` |
| H10 | **VaR fan-out and scenario fan-out must share one grid.** D3 §8 established the pattern for scenarios; VaR is the same operation at 250 instead of 6, and arrives two phases later, which is when a second path gets built by accident | D3 §8, D8 §6 |
| H11 | **Parent Appendix I's closing conditional is unnecessary and should be struck.** Market risk capital is standardised (D13 §3), and under Basel III/IV the standardised approach is sensitivities-based — so **the sensitivities are the capital number and the grammar is load-bearing for RWA whatever the fan-out decision concludes.** Re-binding a convention moves RWA while every version line a reviewer checks stays identical | Parent Appendix I, §1.6 |
| H12 | **The grammar's node set has a third, prescribed constraint.** D14 open question 9 weighs compute against reporting; the regulatory capital vertices are a third list and are not negotiable. One list, containing them as a subset | D14 §12 q9, parent §2.3 |
| H13 | **`d8-valuation-and-analytics` open question 3 is two questions and is now answered.** PFE arithmetic settles that approximate revaluation machinery must be built (Phase 2); whether VaR uses it is a per-model-tier binding against a scheduled full-revaluation benchmark, re-tunable later. Only the first is Phase 2-blocking | D8 §11 q3, parent Appendix H |
| H14 | **The Phase 2 pricing library is sized and licensed against D11's Phase 5 multiplier**, not Phase 2's single pass. Per-core grid licensing negotiated against one pass is renegotiated three phases later from total lock-in | D8 §9, §9.1; parent §6 |
| H15 | **Historical simulation asks D3 for 250 derived snapshots daily**, a scale D3 §8's centralisation argument was not sized for. Materialise them under a bounded retention rather than perturbing unmaterialised, which re-opens the divergence D3 §1.3 exists to prevent | D3 §8 |
| H16 | **The risk factor history must be purchased as raw quotes and instrument definitions, not pre-derived factors.** A derived series is bound to the vendor's grammar and cannot be re-expressed. §6.1 frames the third clock as a budget decision; it is also a specification one, with the earlier deadline | Parent §6.1, D3 §6 |
| H17 | **A position whose risk factors have no history contributes zero VaR silently.** D16 §4.3's suspense principle and D8 acceptance criterion 6 extend to risk: report uncovered, never zero | Parent §5 |
| H18 | **The exposure simulation has no tier, no budget and no frequency**, and it is the largest compute in the platform. `eod-window-and-degradation` §5's table needs the row; the sensitivity ladder also splits from VaR on reporting dates, because only one of them is a capital number | `eod-window-and-degradation` §5, §5.1 |
| H19 | **The SA-CCR hedging set is not the primary risk type dimension.** Different cardinality — one primary risk type, legs in two asset classes — and sharing the field understates exposure on the cross-currency book | Parent §2.3, `classification-rules-engine` §1 |
| H20 | **The counterparty documentation extraction has an unlisted consumer.** MPOR, threshold, MTA and independent amount are SA-CCR formula inputs. Free to add now; not free to retrofit | `counterparty-documentation-workstream`, parent §2.7 |
| H21 | **The large exposures regime remains unmentioned in the parent**, four revisions after the critique raised it. Nothing needs designing; three owners need naming — D11 aggregates, D13 returns, the Phase 4 framework holds the hard limit | Parent §1.5, §1.6; `architecture-critique` |
