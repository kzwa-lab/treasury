# D3 — Market Data & Curves

Observed market state, and the curves derived from it. Parent: `treasury-alm-risk-platform`. Phase 0.

**Why this module is mis-scoped more often than it is under-built.** Unlike D1, D3 has visible output
and never loses a prioritisation argument — every valuation, every ratio and every risk number carries
its fingerprints. It fails a different way: it gets scoped as **plumbing** (a feed handler and a time
series store) when half of it is **a model** (curve construction) and the other half is **a control**
(what the official mark is, who set it, and how much of today's P&L came from a number nobody observed).
A feed-handler-shaped D3 delivers a database that cannot answer why last quarter's EVE moved.

**The second mis-scope is temporal.** D3 reads like a Phase 2 concern, because its headline consumer is
D8 and D8 is Phase 2. It is Phase 0 because **cashflow projection needs forward curves** — parent §2.5
and D2 §4.1 step 3 source every future floating reset from a curve, so a Phase 0 D2 without a Phase 0
D3 projects nothing beyond the fixed-rate book. This is the single reason D3 sits in the foundation
layer, and it determines which parts of D3 are Phase 0 and which are not (§10).

**The one-line test for whether D3 is built correctly:** take a valuation or a ratio from three years
ago, and decompose it into the observed inputs, the derived inputs, and the marked inputs that produced
it — naming the source and the person for each of the last two. If a number cannot be traced back to
either an observation or an accountable human, D3 is a database, not a market data module.

## 1. Responsibilities and boundaries

**D3 owns** the observed market state (§3), the snapshot that makes it reproducible (§2), curve
construction (§4), the provenance and fallback hierarchy for market inputs (§5), and the historic
series depth the platform's later phases depend on (§6).

**D3 does not own:** the *definition* of an index, convention or fallback waterfall (D1 §3.5 — the
distinction is §1.1); valuation (D8 — §1.2); shock and scenario definitions (D14 — §1.3); the internal
pricing curve's *content* (D12 — §1.4); feed transport, completeness checking and reconciliation
(D16 — §1.5); model approval and validation (D15, which governs curve construction as a model, §7).

### 1.1 The D1 / D3 boundary, refined

D1 §1.1 draws it as definitional versus observational, and that framing is right. One line in it is
wrong and needs correcting, because the design consequence is large:

> "A correction is a new observation."

**A correction is not a new observation.** When a benchmark administrator restates a published fixing —
the Federal Reserve Bank of New York republishes SOFR if a revision exceeds its threshold, and every
major administrator has an equivalent policy — the fixing for *last Tuesday* changes. It is not a new
observation for today; it is a different value for a date the platform has already used, in exactly the
retroactive sense D1 §2 reserves for reference data.

**So D3 is bitemporal too**, on the same pattern as D1 and D2 §3:

| Axis | Meaning in D3 |
| --- | --- |
| **Observation date** | The date the market state refers to |
| **Knowledge date** | The date the platform learned this value for that observation date |

A restated fixing creates a new record at the same observation date with a later knowledge date. The
original is retained, because a report produced under it must still reproduce, and because the
difference is exactly what explains a restatement-driven P&L move. Overwriting is prohibited for the
same reason it is prohibited in D1 and D2.

**What stays as D1 stated it:** the boundary itself. The compounding convention, observation shift,
publication lag and fallback waterfall are D1. The daily published number, and its restatements, are
D3. A platform that puts both in the market data store cannot version the convention.

### 1.2 The D3 / D8 boundary

D8's contract is narrow by design (parent §1.4), and the parent calls it the best boundary in the
document. The rule that keeps it narrow:

**D3 produces market state; D8 consumes it and produces instrument values. D3 never values a
position, and D8 never sources a rate outside the snapshot it was given.**

There is one deliberate seam, and it must be named rather than discovered during build. **Curve
bootstrapping is a pricing exercise** — calibrating a swap curve means repricing the calibration
instruments to par under a candidate curve and iterating. So D3's curve builder needs analytics that
are nominally D8's. Three ways to resolve it, and the recommendation is the third:

| Option | Consequence |
| --- | --- |
| D3 embeds its own pricing code | Two pricing implementations that must agree, and eventually will not |
| D3 calls D8 | Inverts the layering, and D8 is Phase 2 while D3 is Phase 0 |
| **Both use the same analytics library** | The library is a shared Phase 0/2 dependency; D3 uses its calibration routines, D8 its pricing routines. **The parent's "buy the pricing library" decision (Phase 2) therefore has a Phase 0 trigger** |

This changes the parent's build sequence in a small but real way — see §10.

### 1.3 The D3 / D14 boundary — and where the shocked curve is built

D14 owns shock and scenario *definitions* (parent §1.6; `d9-alm-and-irrbb` §3 makes the six prescribed
IRRBB shocks D14's, "not hardcoded here"). D3 owns the base curve. The unowned question is **who
applies the shock**, and it matters more than it looks:

- Applying a parallel shock to **zero rates**, to **par rates**, or to **instantaneous forwards** gives
  three different curves and three different EVE numbers.
- If each consumer applies shocks itself, D9's +200bp curve, D10's stress curve and D11's scenario
  curve diverge — silently, and only under stress, which is when the numbers matter most.

**Decision: a shocked curve is a derived D3 snapshot.** D14 supplies the shock definition, D3 applies
it and publishes the result as a snapshot with its own version, derived from a named base snapshot and
a named shock version. D9, D10, D11 and D14's own stress runs all consume the same object. Shock
application mechanics — the representation shocked, the interpolation applied afterwards, and the
floor treatment for negative rates — are curve configuration (§4), versioned and approved like any
other model parameter.

This also gives the movement decomposition `d9-alm-and-irrbb` §325 requires ("position, curve and
assumption change") a real basis: curve change is a diff between two identified snapshot versions, not
a reconstruction.

### 1.4 The D3 / D12 boundary — internal curves

FTP curves are not market data. They are authored by D12 (Phase 6) from market inputs plus a funding
and liquidity premium the bank decides. But they are curves: they are interpolated, they are shocked,
they are used to discount, and every consumer wants to fetch them the same way it fetches a market
curve.

**Apply the parent §6 pattern — separate authoring from storage.** D12 authors; D3 stores and serves
the result as a curve of class `internal`, version-addressable and effective-dated like any other.
This is the same move that lets the classification rules engine sit in Phase 0 while D7 and D13 author
its rules later, and it means D12's arrival in Phase 6 adds curve *content*, not a second curve service.

Curve class is a first-class attribute — `market`, `derived` (shocked/scenario), `internal` — because
a regulatory return must be able to assert that no internal curve entered it.

### 1.5 The D3 / D16 boundary

D16 owns feed adapters, transport, arrival monitoring and completeness (parent §1.1). The split:

| D16 | D3 |
| --- | --- |
| Did the file arrive, on time, parseable, with the expected record count? | Is this a plausible value for *this* instrument, given yesterday's? |
| Cross-source reconciliation and the break register | The market-data fallback hierarchy and the provenance tag (§5) |
| Escalation and ageing of breaks | Which of several available sources is the **official** mark |

The rule: **D16 decides whether the data arrived; D3 decides what the platform believes.** Parent §5
assigns the "documented fallback hierarchy" to D16 generically — for market data that hierarchy is
instrument-specific and belongs here. D16's version of it applies to positions and balances feeds.

## 2. The snapshot

The snapshot is D3's central object and the thing that makes parent §5's reproducibility guarantee
real. Every consumer signature in the platform carries a `market_snapshot_version` — D2's projection
(D2 §4), D8's valuation (parent §1.4), and every engine in parent §3's "stateless and re-runnable"
claim.

### 2.1 What a snapshot is

**A snapshot is a complete, internally consistent, immutable set of market state as at one observation
moment, under one named composition rule.**

Four words in that sentence carry weight:

- **Complete** — it contains every observable the platform's current position set requires, or it
  explicitly records the gap and how it was filled (§5). A snapshot with holes is the failure mode
  where two runs of the same engine differ because one found a cached value and one did not.
- **Consistent** — all values are drawn from the same market moment. A snapshot mixing a 16:00 London
  fix with a 17:15 New York close produces cross-currency basis that no market participant could have
  traded. Where a single moment is impossible across time zones, the composition rule states the
  per-region convention and the FX rate used to bridge them, and the resulting inconsistency is a
  documented property rather than an accident.
- **Immutable** — a snapshot is never edited. A restatement, a late arrival or a corrected mark creates
  a **new version** of the snapshot at the same observation date with a later knowledge date (§1.1).
- **Named composition rule** — versioned configuration stating, per data domain, the source, the
  capture time, the fallback order and the tolerance. Two snapshots are comparable only if built under
  the same composition version, and the composition version is part of the snapshot's identity.

### 2.2 Snapshot classes

| Class | Purpose | Approval |
| --- | --- | --- |
| **Official EOD** | The authoritative daily snapshot every report, posting and ratio consumes | Four-eyes, gated (§2.3) |
| **Intraday** | Indicative valuation, pre-deal what-if, limit checking | Automatic, never used for accounting or reporting |
| **Derived** | Shocked and scenario snapshots (§1.3) | Inherits base approval; shock version recorded |
| **Restated** | A new version of a prior official snapshot after a correction | Four-eyes plus an impact statement (§7) |

Restated snapshots are the ones that need an explicit policy rather than an implicit behaviour: **a
restatement does not automatically re-run the day it corrects.** It creates a new version and raises a
decision — re-run and re-report, or carry the difference forward with a documented rationale. Making
that automatic either destabilises published numbers or buries a material correction, depending on
which default is chosen.

### 2.3 The approval gate

Parent §3's EOD sequence makes "market snapshot + reference data version approval" a gated stage, and
D17 orchestrates it. What the gate actually tests:

1. **Completeness** against the current position set — every required observable present or explicitly
   filled, with fills within policy.
2. **Plausibility** — day-on-day movement within tolerance per domain, and no arbitrage violation the
   curve builder had to smooth away silently (§4).
3. **Provenance budget** — the proportion of value derived from non-observed inputs is within a stated
   threshold. This is the check most platforms lack, and it is the one that catches a slow drift into
   marking.
4. **Source concordance** — where two sources exist for the same observable, the difference is within
   tolerance (§3.3).

A failure blocks downstream, or the snapshot is approved with exceptions and D17 propagates the
*provisional* flag (parent §3). **Approval-with-exceptions must be a first-class state**, not an
override, because a hard-fail-only gate trains people to approve things they should not.

## 3. The data domains

### 3.1 Fixings — store the daily series, not the period rate

The requirement that constrains this domain is D2's **third fixing state** (D2 §4.1 step 3, parent
§2.5): the current period of a compounded-in-arrears RFR is *partly observed*.

**Consequence: D3 stores the daily fixing series, not derived term rates.** A system that stores
"3M SOFR" as an observable cannot compute a partially-observed period, cannot apply a two-day
observation shift, and cannot reproduce a compounded rate under a lockout convention. The compounded
figure is a *derivation* over the daily series under the convention D1 §3.5 holds — computed on
demand, never stored as the primitive.

Per fixing: index, observation date, value, publication timestamp, source, and **revision indicator**.

Three things to specify that ordinary IBOR-era systems did not need:

- **Publication timing and lag**, because an in-arrears fixing publishes after the period it applies
  to, and the EOD cut may fall between accrual and publication.
- **Revision handling** (§1.1) — administrators republish, and the platform must distinguish "not yet
  published" from "published and later corrected".
- **Fallback activation.** D1 holds the waterfall; D3 records the observed fact that a trigger occurred
  and which level of the waterfall is live, as a dated state. This is the join where a benchmark
  cessation stops being a policy document and starts being a number.

Also in scope: the legacy term-rate indices still present in the back book, and inflation index prints
(D2 §4.1 step 2 allows index-linked notionals), which carry their own publication lag and are subject
to revision more often than rates are.

### 3.2 FX rates

Spot, forward points and outrights, per pair with an explicit quotation convention and a named fixing
time. Three specifics the instrument universe forces:

- **The revaluation rate versus the fixing rate are different objects.** Accounting revaluation uses a
  closing rate; an FX option or an NDF settles against a named fixing at a named time. Storing one and
  approximating the other is a defect that surfaces as unexplained settlement breaks.
- **Non-deliverable pairs.** D1 §3.6 carries the restriction status that tells D2 a forward is an NDF;
  D3 must carry the corresponding **settlement fixing source** for those pairs, which is frequently a
  different publication from the spot rate.
- **MTM-resetting cross-currency swaps** (critique §3.1) reset a notional against a *future* FX fixing.
  The projection engine therefore queries forward FX from the snapshot to resolve a notional — a market
  data dependency in D2's pipeline step 2, not just step 3. Forward FX must be curve-derivable, not
  merely a quoted set of tenors.

### 3.3 Security prices, and the independent verification problem

Prices for the fixed income book (Part 1 §3), equity holdings (Part 2 A.3, A.4), and commodity and
bullion positions (Part 1 §7, held as Balances per parent §2.1).

**The structural requirement: multiple concurrent marks per instrument per date, with one designated
official.** Not one value that later sources overwrite. This is what makes independent price
verification possible, and IPV is a regulatory expectation for anything fair-valued, not an internal
nicety. The record set per instrument-date is: each source's value, the designated official value, the
designation rule or the person who designated it, and the retained differences.

Two derived requirements follow:

- **Prudent valuation.** Where a mark is uncertain, the additional valuation adjustment is computed
  against the *distribution* of available marks. Discarding non-official marks discards the input.
- **Price provenance drives capital.** A position valued from a model or a proxy is a different
  regulatory animal from one valued at an observable trade. The provenance tag (§5) must reach D13.

**Corporate actions split the price series in two.** A split, a consolidation or a spin-off means the
raw series is not comparable across the event. Risk history (§6) needs an **adjusted** series; the
accounting revaluation of the position actually held on each date needs the **unadjusted** series. Both
must exist. The critique flagged corporate actions as having no owner anywhere in the architecture —
the *ops process* on held securities belongs with D2/D4 lifecycle, but the **price series adjustment
factors are D3's**, and they are the half that is silently wrong if unowned.

### 3.4 Credit spreads and recovery assumptions

CDS spreads by reference entity, tenor and seniority; bond asset swap spreads; index spreads; and the
recovery assumptions used alongside them. Consumed by D8 for credit derivative pricing, by D11 for CVA
and default risk, and by D9 if CSRBB is scoped in (`d9-alm-and-irrbb` §347 leaves that open — the
answer determines whether D3 needs a spread curve infrastructure beyond what valuation requires).

**The population problem, which is architectural rather than technical.** A bank's counterparty set is
overwhelmingly names with no traded CDS. CVA on those names is computed from a **proxy spread** built
by rating, sector and region. That proxy construction is a *model*, it needs D15 governance, and it is
the single largest driver of CVA for a mid-tier bank's book. Treating it as a data-sourcing detail is
how a platform ends up with a CVA number no one can defend.

### 3.5 Volatility surfaces

Interest rate volatility (cap/floor and swaption, as a cube across expiry, tenor and strike), FX
volatility (by expiry and delta, with the smile), and equity volatility where the book requires it.

**Volatility is where the "market data is a feed" assumption breaks most visibly.** A surface is not
observed; it is *fitted* from a sparse set of quotes under a chosen parameterisation and a chosen
smile model, with arbitrage constraints in both the strike and time directions. The fit is a model, the
parameterisation is a versioned configuration, and the same quotes under two parameterisations price
the same barrier option differently.

**Scope resolved: a smile-consistent surface is required.** The source document lists *"FX options —*
*vanilla (calls/puts) and exotic (barriers, digitals)"* in Part 1 §4 of the instrument universe, and the
parent's scope decision binds the platform to that universe. Barriers and digitals are therefore in
scope, and a vanilla surface — interpolated across expiry and delta — does not serve them. **This
domain is sized for a fitted, arbitrage-free, smile-consistent surface**, not an interpolated grid.

**The question that remains is sequencing, not scope.** Whether the bank holds open barrier or digital
positions *today* is a position-report question and is not answered by the source document. It affects
when the capability is switched on, and it does not affect whether the surface must support it — see
§12 q2.

### 3.6 Curves

The derived domain, and the one §4 is about.

## 4. Curve construction is a model

**Everything in §3.1–3.5 is observed or marked. A curve is computed**, and two banks with identical
inputs produce different curves. That makes curve construction a model under D15 governance — with an
owner, a documented methodology, a validation date and an approved usage — not a configuration file in
a data loader.

### 4.1 What a curve definition contains

A curve's identity is the tuple, and reproducibility requires all of it:

```
curve_id = (currency, index, collateral basis, curve class)
curve_version = (definition version, input snapshot version, engine build)
```

The definition holds: the **calibration instrument set** and its priority order (deposits, futures or
FRAs, swaps, basis swaps, cross-currency basis), the **bootstrapping or global-fit method**, the
**interpolation scheme and the space it operates in** (log-discount factor, zero rate, instantaneous
forward — these are not equivalent, and the choice is visible in the forward curve every consumer
reads), the **extrapolation rule beyond the last liquid point**, the **turn-of-year and central-bank
meeting-date treatment** if applied, and the **negative rate and floor policy**.

Two consequences worth stating flatly:

1. **The instrument selection is a judgement with a P&L.** Choosing to calibrate the short end to
   futures rather than to OIS swaps changes every forward reset D2 projects.
2. **Extrapolation is a material EVE driver**, not a technicality. If the last liquid point is well
   inside the banking book's horizon — which is normal outside the deepest markets — the extrapolation
   assumption determines the long-end discount factors that dominate EVE. It must be an approved,
   documented model choice with a stated sensitivity, and it should be one of the assumptions
   `d9-alm-and-irrbb` §3 puts in front of ALCO.

### 4.2 Discounting is a function of the CSA, not the currency

This is the multi-curve requirement the parent names in one line ("multi-curve OIS discounting") and
it has a dependency nobody has drawn.

**The discount curve for a derivative is determined by its collateral agreement.** A trade under a
CSA paying interest on cash collateral in EUR discounts on the EUR collateral rate curve. The same
trade uncollateralised discounts on the bank's funding curve, with the difference showing up as a
valuation adjustment. Cleared trades discount at the CCP's rate. Multi-currency CSAs with a delivery
option give the poster a cheapest-to-deliver optionality that is itself a valuation input.

**So the curve selection rule reads D1 §3.8's structured CSA terms.** That is a D1 → D3 dependency that
appears in neither artifact's interface table, and it is load-bearing: without structured eligible-
collateral and interest-rate terms, the platform cannot choose a discount curve, which means it cannot
value a collateralised derivative correctly, which means D8's Phase 2 output is wrong in a way that
looks like a small basis.

It also raises D1 §3.8's legal agreement extraction — already called the Phase 0 long pole — from a
Phase 4–6 blocker to a **Phase 2 blocker**, since Phase 2 is where valuation lands.

### 4.3 The curve inventory is combinatorial — bound it deliberately

`(currency × index × collateral basis)` grows fast. A book in six currencies with two live indices each
and three collateral bases is thirty-six curves before scenario derivations, each with a definition to
govern, a calibration set to source and a validation to maintain.

**Publish a bounded, approved curve inventory as a governed artefact.** Each entry names its purpose,
its consumers and its owner; anything not on the list does not exist. The failure mode without this is
not a missing curve — it is forty curves, of which six are actually maintained and the rest quietly
stale, with no way to tell which is which.

### 4.4 Cross-currency basis

Cross-currency basis swaps are in the instrument universe (Part 1 §5) and the bank funds through them
(Part 1 §8, and parent §2.8's cost-of-hedging correction). Basis is therefore both **an input** to the
foreign currency discount curves and **a risk factor** with its own P&L and its own OCI consequence
under the cost-of-hedging treatment. It needs an explicit curve rather than being absorbed silently
into an FX forward interpolation, or the deferred basis component D7 must report cannot be isolated.

## 5. Provenance, fallback and the marking problem

**Every value D3 serves carries a provenance tag.** This is the smallest structural change with the
largest control payoff in the module:

| Tag | Meaning |
| --- | --- |
| `observed` | Sourced directly from the designated golden source |
| `interpolated` | Derived between observed points under the curve's own scheme |
| `stale` | Last good value, carried forward, with the age |
| `proxied` | Another instrument's or entity's value, under a named proxy rule |
| `model_implied` | Produced by a model rather than observed |
| `marked` | Set by a person, with identity, reason code and approval |

**The fallback hierarchy is per data domain, not global**, and is part of the composition rule (§2.1).
Carrying a stale equity price for a day is ordinarily benign; carrying a stale FX rate for the same day
misstates every foreign currency balance on the sheet. A single global staleness tolerance is therefore
wrong in one direction or the other for most domains.

**Provenance must survive aggregation.** A valuation, a ratio and a P&L line should each be
decomposable into the provenance of their inputs, so that "how much of today's revaluation came from
marked data" is a query rather than an investigation. This is what §2.3's provenance budget gate
measures, what prudent valuation adjustments are computed against, and what turns the stale-data policy
parent §5 requires from a statement into a control.

**Manual marks are four-eyes, reason-coded and reported** — parent §5 already puts market data
overrides in the four-eyes set. Two additions: a mark carries an **expiry**, after which it must be
re-approved rather than silently persisting, and a standing report of live marks by age and value
impact goes to the same forum that sees the break register.

## 6. Historic depth — the third clock

Parent §6 identifies two workstreams whose clocks run independently of the build: LCR collateral
history and legal agreement extraction. **There is a third, and it lives here.**

Later phases need market history the platform will not have:

| Consumer | Requirement | Phase |
| --- | --- | --- |
| D11 historical-simulation VaR | 1–2 years of clean, consistent daily risk factor history | 5 |
| D11 stressed VaR / stress period identification | A 10+ year window containing a genuine stress period | 5 |
| D9 / D14 behavioural model calibration and backtesting | Rate history spanning at least one full cycle | 3 |
| D15 backtesting | Continuous history from go-live, no gaps | 7 |

**History cannot be created retroactively, but unlike the other two clocks it can be bought.** The
decision to make now is not whether to start capturing — capture starts with Phase 0 — but whether to
**purchase a vendor history set at Phase 0** so that Phase 3 and Phase 5 are not gated on elapsed
calendar time. A platform that starts capturing at go-live and reaches Phase 5 in year three has two
years of history and no stress period in it.

**The risk factor history is a distinct dataset from the EOD snapshot series.** It is
corporate-action-adjusted (§3.3), gap-filled under a stated rule, and organised by risk factor rather
than by instrument. Deriving it from snapshots later is possible; deriving it *well* requires decisions
about adjustment and gap-filling that are much cheaper to make once, at the point of capture.

**The purchase is a specification decision before it is a budget one — `D11-4`.** Two requirements
follow, and both are nearly free now and unrecoverable later.

- **Buy raw quotes and instrument definitions, not pre-derived risk factors.** A vendor's derived series
  is bound to that vendor's conventions — which is to say, to *someone else's transformation grammar*
  (`d14-scenario-and-stress-framework` §2.5). A representation the bank later chooses cannot be
  reconstructed from a series already collapsed into a different one, whereas quotes plus definitions
  re-derive into any representation once §1.2's Phase 2 bootstrapping exists, at the cost of storage and
  a re-derivation run. **The cheaper purchase is the one that cannot be undone**
- **The grammar version travels with the series from first capture**, for captured history as much as
  purchased. A history series whose convention is implicit is a series that silently changes meaning
  when the grammar is next bound, and the change is invisible: the dates, the tickers and the magnitudes
  all still look right. This is a **Phase 0 data design decision created by a Phase 5 consumer**
  (`d11-market-and-counterparty-risk` §1.3.3, §4)

## 7. Governance and control

**Curve definitions are models.** Inventory entry, named owner, documented methodology, validation
before first use and on a cycle, approved usage, and change control through D15. A change to an
interpolation scheme is a model change, not a configuration tweak, and it moves every EVE and every
valuation the day it lands.

**So are the fallbacks, and they are the ones that get missed — `D15-3`.** D3 owns **three** model
inventory entries, not one, and the two beyond curve construction have no owner named anywhere today:

| Model | Where | Why it is a model |
|---|---|---|
| **Curve construction** | §4 | Already stated above |
| **The proxy / fallback hierarchy** | §1.5, §5 | It *chooses a number* when the observed one is missing, by a documented rule with judgement in it. A rule that substitutes one price for another is a model whatever the file it lives in |
| **The proxy spread methodology** | §3.4 | For a book dominated by names with no traded CDS, this drives CVA **more than any observed spread does** — and it is currently a §12 open question with no owner |

**The organising point: a proxy is a model.** D15's inventory has fourteen entries that are not named as
models anywhere in the platform, six of them tier 1, and they **cluster around proxies and fallbacks**
precisely because each one looks like configuration at the point it is written
(`d15-model-governance` §3.1). Curve construction was never at risk of being missed; these two were.
Validation before first use applies to all three, which for the fallback hierarchy means Phase 0.

**Three control tiers**, mirroring D1 §4's structure:

| Tier | Applies to | Control |
| --- | --- | --- |
| Standard | Routine snapshot approval | Four-eyes at the EOD gate (§2.3) |
| Elevated | Manual marks, proxy rule changes, source designation changes | Four-eyes, reason code, expiry, standing report |
| Retroactive | Snapshot restatements, curve definition changes, composition rule changes | Four-eyes plus an **impact statement**: what reproduces differently, over what period, and to what magnitude |

**Independent price verification is a control D3 must structurally enable** (§3.3), performed by a
function independent of the risk-takers. The architectural obligation is the multi-mark data structure
and the retained differences; the operating model is finance's.

**Golden source designation** per observable, exactly as D1 §4 requires per attribute. Where two
sources exist, one is authoritative and the difference is a monitored control, not an ambiguity.

## 8. Sizing and performance

**Storage is not the constraint.** Daily fixings, FX, curve points and a few hundred thousand security
prices are gigabytes per year, not terabytes. Volatility cubes and full snapshot versioning multiply
that by a small constant. Ten years of retained history is comfortably affordable, and the retention
horizon should be set by the reproducibility requirement rather than by cost.

**Two things are constraints:**

1. **Curve rebuild latency inside the EOD window.** Every floating contract in the book depends on the
   forward curve, and D2 §4.4 establishes that **caching does not help the floating book** — every
   floating instrument reprojects daily because the curve moves daily. The curve set must therefore be
   built, validated and approved *early* in the EOD sequence, since the entire projection stage queues
   behind it. Curves are a critical-path dependency in a way their data volume badly understates.
2. **Scenario fan-out.** A stress run across the six prescribed IRRBB shocks plus internal scenarios
   multiplies the curve set by the scenario count. Derived snapshots (§1.3) should be generated once
   per scenario and shared across D9, D10 and D11 rather than rebuilt per consumer — the correctness
   argument for centralising shock application (§1.3) is also the performance argument.

**The fan-out this section sized for is an order of magnitude too small — `D11-9`, `D14-3`.** Two
independent findings landed after it was written and both push the same way:

- **Sensitivity fan-out.** The platform rate vertex set is the **union** of the 19 IRRBB band midpoints
  and the 10 prescribed capital vertices — **29 nodes, not 19**, so that both regulatory views are exact
  subsets and no number is interpolated between the risk report and the RWA calculation
  (`d1-reference-and-static-data` §3.10). That is roughly **53% more perturbations** than the grammar
  assumed
- **Risk fan-out.** D11's daily sensitivity and exposure work implies on the order of **250 derived
  snapshots a day**, against the handful-per-scenario this section pictured
  (`d11-market-and-counterparty-risk` §5)

**The design consequence is not "buy a bigger machine" — it is a retention decision.** At that volume
the tempting answer is to stop materialising derived snapshots and perturb on demand, which is wrong
for the reason §1.3 already gives: an unmaterialised perturbation is not reproducible, and every
reproducibility guarantee in §2 and parent §2.5 rests on the derived snapshot being an object with a
version. **Materialise, under a bounded retention policy** — full retention for regulatory reporting
dates, short retention for the daily cycle — which keeps reproducibility where it is asked for and
caps the storage where it is not. Storage remains cheap; *unbounded* storage at 250/day is not.

## 9. Interfaces

### 9.1 Inbound

| Source | Content | Mode |
| --- | --- | --- |
| Market data vendors (via D16) | Fixings, FX, prices, spreads, volatility quotes | Batch + streaming |
| Benchmark administrators (via D16) | Daily RFR fixings and revisions | Daily, revisable |
| D1 | Index definitions, conventions, calendars, currency restrictions, **CSA terms for discount curve selection** (§4.2) | Version-addressable |
| D14 | Shock and scenario definitions | Versioned, approved |
| D12 | Internal FTP curve content (Phase 6) | Versioned, approved |
| D15 | Curve model approvals and validation status | Governance |
| Manual marking (under §7) | Marks, overrides, proxy designations | Four-eyes, expiring |

### 9.2 Outbound — the published contract

| Consumer | What D3 provides |
| --- | --- |
| D2 | Fixings for application (daily series, not term rates); forward curves for projection; **forward FX for market-resetting notionals** (§3.2) |
| D8 | The full snapshot — curves, surfaces, spreads, prices — plus the discount curve selected per CSA |
| D9 | Base and shocked curves per currency and index (§1.3) |
| D10 | Market values and haircut inputs for counterbalancing capacity |
| D11 | Risk factor history (§6), spreads, proxy spreads, volatility |
| D13 | **Provenance of valuation inputs** for prudent valuation and capital treatment |
| D14 | Base snapshots against which scenarios are defined |
| D6 | Prices for collateral valuation and margin calls |
| D7 | Closing FX rates and prices for revaluation and FVOCI reserve computation |

**The interface obligation, matching D1 §5:** every read is snapshot-addressable. A consumer asks for a
value *as at* an observation date and knowledge date under a named snapshot version — never for "the
current rate". A call without a snapshot version is not reproducible, and should be rejected rather
than defaulted.

## 10. Phase split

D3 sits in Phase 0, but not all of it does. The parent's phase table lists "D3" undifferentiated; this
is the decomposition, and it contains one change to the parent's build sequence.

| Capability | Phase | Why |
| --- | --- | --- |
| Snapshot model, versioning, bitemporality, provenance tagging, approval gate | **0** | Every later capability is unreproducible without it, and retrofitting versioning is a rewrite |
| Fixings (daily series, revisions, fallback state) | **0** | D2 §4.1 step 3 |
| FX spot and forwards | **0** | Balance sheet revaluation and multi-currency projection |
| Interest rate curves for **projection** | **0** | The reason D3 is in the foundation layer at all |
| Historic capture begins; vendor history purchase decision | **0** | §6 — the clock starts and cannot be rewound |
| Security prices and haircut inputs | **1** | `d10-liquidity-and-funding` needs market values for counterbalancing capacity, ahead of D8 |
| Full curve construction in-house, credit spreads, volatility surfaces | **2** | With D8 and the analytics library (§1.2) |
| Shocked and scenario derived snapshots | **3** | With D9 and D14 |
| Risk factor history dataset, proxy spread model | **5** | With D11 — but the history behind it accumulates from Phase 0 |
| Internal curve class populated by D12 | **6** | The class exists from Phase 0; D12 fills it |

**The change to the parent's build sequence.** Parent §6 places "buy the pricing library" in Phase 2.
Phase 0 needs forward curves, and building them needs calibration analytics from that same library
(§1.2). Two ways to close it:

- **Recommended: consume vendor-published curves in Phase 0**, and build in-house from Phase 2. The
  snapshot, versioning, provenance and governance infrastructure is built in Phase 0 either way and is
  indifferent to whether the curve was calibrated internally. This defers the library decision without
  deferring the capability, and it means the Phase 0 curve is somebody else's documented methodology
  rather than an undocumented internal one.
- **Alternative: pull the library evaluation into Phase 0.** Defensible, but it front-loads the largest
  vendor decision in the programme onto the phase with the least information about what the book needs.

Either way, **the Phase 0 curve capability must be stated explicitly**, because a Phase 0 plan that
says "D3" without saying which of these it means will produce a projection engine with no forward
curve to project against.

## 11. Acceptance criteria

1. Every consumer read is snapshot-addressable; a read without a snapshot version is rejected, not
   defaulted
2. D3 is bitemporal: a restated fixing or mark creates a new version at the same observation date and
   never edits the original, and both are queryable
3. Fixings are stored as daily series; a compounded-in-arrears rate for a partially-observed period is
   computable under the D1 convention, including observation shift and lockout
4. Every served value carries a provenance tag, and provenance survives aggregation — the marked-data
   contribution to any valuation, ratio or P&L line is a query
5. The EOD snapshot gate tests completeness, plausibility, provenance budget and source concordance,
   and approval-with-exceptions is a distinct state that propagates *provisional* through D17
6. Curve definitions are governed models with owners, methodologies and validation dates; a curve
   version resolves to a definition version, an input snapshot version and an engine build
7. The discount curve for a collateralised derivative is selected from D1's structured CSA terms, not
   from the trade's currency
8. Shocked curves are derived D3 snapshots — D9, D10, D11 and D14 consuming the same shock get
   bit-identical curves
9. Prices support multiple concurrent sources with one designated official mark and retained
   differences, sufficient for IPV and prudent valuation
10. A valuation from three years ago reproduces under the snapshot version in force, demonstrated by
    the Phase 1 regeneration test (D2 §7.4) varying market snapshot version alongside reference data
11. The approved curve inventory is a published artefact; no curve exists outside it
12. Corporate-action-adjusted and unadjusted price series both exist and are separately addressable

## 12. Open questions

1. **Vendor history — buy or accumulate?** §6. This is a Phase 0 procurement decision with a Phase 3
   and Phase 5 consequence, and it is the only one of the three independent clocks that money can fix.
   It should be decided alongside the collateral history reconstruction and the legal agreement
   extraction, not after them.
2. **Are exotic FX options actually held today?** **Scope resolved — sequencing open.** They are in the
   instrument universe (source Part 1 §4), so §3.5 is sized for a smile-consistent surface regardless.
   What current holdings determine is only *when* that capability is switched on within Phase 2. The
   irreversible decision — the library — must be made for the universe, not for today's book.
3. **Curve depth in the bank's home market.** How far out is the swap curve genuinely liquid, and how
   far does the banking book run past that point? If the gap is large, §4.1's extrapolation rule is one
   of the most consequential assumptions in the whole platform and needs ALCO visibility from Phase 0,
   not a default buried in curve configuration.
4. **Is CSRBB in scope?** `d9-alm-and-irrbb` §347 leaves it open. If yes, D3 needs spread curve
   infrastructure beyond what valuation alone requires, and that lands in Phase 3 rather than Phase 5.
5. **Snapshot timing convention across time zones.** What is the official EOD moment, per region, and
   what bridging convention applies (§2.1)? This is a small decision that becomes very expensive to
   change once a year of history exists under the wrong one.
6. **Restatement policy.** When a corrected fixing or mark restates a prior snapshot, does the platform
   re-run and re-report, or carry the difference forward? Neither default is safe as an implicit
   behaviour (§2.2), and the answer differs for accounting, regulatory and management reporting.
7. **Curve build or buy in Phase 0** — §10. Recommended answer given; it needs confirming, because the
   Phase 0 projection engine is blocked without one.
8. **Proxy spread methodology owner.** §3.4. For a book dominated by names with no traded CDS, this
   model drives CVA more than any observed spread does. Who owns it, and does it exist today?
   **Sharpened by `D15-3`:** this is not only an ownership gap but a missing model inventory entry, and
   the same applies to the fallback hierarchy (§7).

## Appendix — amendments applied from sibling modules

Findings raised by `d11-market-and-counterparty-risk`, `d14-scenario-and-stress-framework` and
`d15-model-governance` against this artifact, applied under the trigger *"D3 is next amended"*. Refs
keep their originating module's namespace (`blueprint-amendment-protocol` R1); this is not a D3 pass and
allocates no new `D3-n`.

| Ref | Applied | Section |
|---|---|---|
| `D11-4` | The history purchase specified, not just budgeted — buy raw quotes and definitions, and the grammar version travels with every series from first capture | §6 |
| `D11-9`, `D14-3` | §8's scenario fan-out re-sized: 29 vertices rather than 19, ~250 derived snapshots daily. Resolved by **materialising under bounded retention**, not by perturbing unmaterialised | §8 |
| `D15-3` | D3's model inventory is three entries, not one — curve construction, the fallback hierarchy, and the proxy spread methodology | §7, §12 q8 |

**The two with Phase 0 consequences are `D11-4` and `D15-3`.** Both are nearly free at capture and
unrecoverable afterwards: a history series without its grammar version cannot be re-derived into a
representation chosen later, and a fallback hierarchy that reaches production unvalidated has already
been substituting prices into reported numbers by the time anyone asks who approved it.

**Still open and not closed by any of the above:** `D3-2` (current exotic holdings), `D3-3` (CSRBB
scope), `D3-4` (home-market curve depth). All three need a bank answer rather than a document change,
and `D3-3` additionally gates `d9-alm-and-irrbb` q4 and `d14-scenario-and-stress-framework` q6 — one
answer, three artifacts.
