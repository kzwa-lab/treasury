# D10 — Liquidity & Funding

Regulatory and internal liquidity measurement, the funding profile, and the counterbalancing capacity
that stands behind both. Parent: `treasury-alm-risk-platform`. Phase 1 of the build sequence.

**Revision 2.** LCR mechanism corrected — it is a rules engine over classified balances, not a
cashflow aggregation (§2, §3.1); four concealed Phase 1 dependencies surfaced, one of them
time-critical (§3.5); survival horizon confirmed as Phase 3; contingent-inflow register added (§2.2).

**Why this is Phase 1.** It runs directly off D2's contractual cashflow engine, needs no valuation
model, and produces the metrics a regulator asks for first. It is also the shortest path from "we
have a data platform" to "we have a tool that changes decisions" — LCR, NSFR and a survival horizon
are what a treasurer acts on daily.

## 1. Responsibilities

**D10 owns:**

- The liquidity cashflow ladder — contractual and behavioural, by currency and by entity
- Counterbalancing capacity: HQLA buffer composition, eligibility, haircuts and monetisation capacity
- LCR and NSFR computation, including the configurable factor rule sets
- Internal liquidity metrics: survival horizon, funding concentration, encumbrance ratio, loan-to-deposit, funding gap
- Early warning indicators and the liquidity risk appetite framework
- The funding plan and its monitoring
- Liquidity stress testing execution (against scenarios owned by D14)

**D10 does not own:**

- Cashflow projection — D2 projects; D10 buckets and applies factors
- Behavioural model definition or calibration — D9 owns the models, D2 executes them, D10 consumes the output
- Encumbrance state — D6 owns which securities are pledged; D10 consumes it
- Scenario definitions — D14 owns them
- Market prices and haircut inputs — D3
- Intraday liquidity monitoring — deferred, see §8

**The critical boundary:** D10 applies *regulatory* factors, which are prescribed constants. D9
supplies *behavioural* assumptions, which are modelled. Conflating the two is the most common design
error in this module, and §3.1 explains why it matters more than it sounds.

## 2. The cashflow ladder

**Revision 2 correction.** Revision 1 said "everything in this module is a view over one object: the
maturity ladder." That is true of the internal metrics and the stress framework. **It is not true of**
**LCR and NSFR**, which are rules engines over *classified balances* — see §3.1. This module has two
computational objects, not one:

| Object | Used by | Nature |
| --- | --- | --- |
| **The maturity ladder** | Survival horizon, funding gap, funding profile, stress testing, contingency planning | Aggregation of D2 cashflows |
| **Classified balances × prescribed factors** | LCR, NSFR | Rules engine over D2 Positions and Balances |

Conflating them makes the regulatory ratios look like free by-products of the cashflow engine when
they are a separate build with separate dependencies.

### 2.1 Construction

D2 supplies dated cashflows for every Contract on both bases (contractual and behavioural), already
carrying the eight classification dimensions. D10 buckets them.

**Dimensions the ladder must slice by, simultaneously:**

- Time bucket — overnight, 2–7d, 8–14d, 15–30d, 1–2m, 2–3m, 3–6m, 6–12m, 1–2y, 2–5y, 5y+
- Currency — **mandatory, not optional.** A ladder that nets USD inflows against ZAR outflows is
arithmetically valid and operationally meaningless. Liquidity does not fungibly cross currencies
under stress, and the LCR must be reportable by significant currency
- Counterparty type — retail, SME, corporate operational, corporate non-operational, bank, sovereign,
public sector
- Product and funding type
- Secured versus unsecured
- Certainty — contractual, contingent, behavioural

The buckets are configuration, not code. LCR needs a 30-day cumulative view, NSFR a one-year
weighted view, internal metrics a granular short-end ladder, and the regulator may prescribe its own
bucketing for local returns. One ladder, many bucket definitions.

### 2.2 Contingent flows are first-class

The most common cause of an understated liquidity gap is off-balance-sheet exposure treated as an
afterthought. From the source taxonomy (Part 2 §D) and instrument universe (Part 1 §8, §11):

| Exposure | Flow type | Driver |
| --- | --- | --- |
| Undrawn loan commitments, retail and corporate | Contingent outflow | Drawdown rate — prescribed for LCR, modelled for internal |
| Revolving credit facilities and overdrafts | Contingent outflow | Utilisation model |
| Guarantees issued | Contingent outflow | Call probability |
| Letters of credit (import/export) | Contingent outflow | Expected utilisation and tenor |
| Forfaiting and factoring facilities | Contingent, both directions | Facility terms |
| Derivative collateral outflows | Contingent outflow | Market moves and downgrade triggers — see §3.3 |
| Committed liquidity facilities received | Contingent inflow | **Only if genuinely committed and irrevocable** |
| Contingent funding lines received | Contingent inflow | Same test |

The asymmetry is deliberate and must be enforced in the design: **contingent outflows are recognised**
**generously, contingent inflows only when contractually irrevocable.** Uncommitted interbank credit
lines (Part 1 §8) are not liquidity. They are available exactly until the moment you need them.

**Contingent inflows have no balance sheet anchor and need their own register.** The source taxonomy's
off-balance-sheet section (Part 2 §D) covers commitments and guarantees *issued* but has no line for
facilities *received* — which is correct accounting, since a facility granted to you is not your asset.
The consequence is that committed liquidity facilities and contingent funding lines (Part 1 §9) cannot
be derived from any Part 2 line and must be maintained as a **standalone contingent-inflow register**
in D2, reconciled to the underlying legal agreements (D2 §2.8) rather than to the balance sheet.
Revision 1 assumed these would fall out of the taxonomy; they do not.

**Contingent outflows consume ratio capacity and must be priced for it — `D12-6`.** Every exposure in
the outflow half of the table above generates an **LCR outflow and an NSFR RSF requirement while
generating no funding need at all** — an undrawn commitment costs nothing to carry and consumes ratio
headroom the moment it is written. **A contingent liquidity charge is therefore a required FTP
component rather than a refinement** (`d12-funds-transfer-pricing` §1.2): charging nothing for undrawn
commitments is the most reliable way to damage a ratio through internal pricing, and it is the hardest
such damage to see, because the cost never appears in the facility's margin — it sits in a ratio that
belongs to treasury while the fee belongs to the originating unit. The register and drivers this
section specifies are the measurement basis for that charge, which is the whole reason the two
artifacts need to agree on the driver.

### 2.3 Counterbalancing capacity

The other half of the ladder: what can be turned into cash, how fast, and at what cost.

| Source | Capacity | Constraint |
| --- | --- | --- |
| HQLA buffer | Market value less haircut | Must be unencumbered and monetisable |
| Non-HQLA marketable securities | Market value less larger haircut | Market depth under stress |
| Central bank eligible collateral | Pledged value less central bank haircut | Requires pre-positioning |
| Committed liquidity facilities | Facility size | Contractual availability |
| Unencumbered loan collateral | Pledgeable value | Operational readiness to mobilise |

**Operational capability is part of eligibility, not a footnote.** An asset that is eligible on paper
but cannot be mobilised within the stress horizon — not pre-positioned with the central bank, held in
a custody chain that takes days to unwind, or sitting in a subsidiary that cannot upstream it — is
not counterbalancing capacity. The model must carry a time-to-monetise attribute per source, and
capacity must be reported net of it.

## 3. Liquidity Coverage Ratio

```
LCR = Stock of HQLA / Total net cash outflows over 30 calendar days  ≥  100%
```

### 3.1 LCR is balance × prescribed factor — not a cashflow aggregation

**This is the single most important design point in the module, and revision 1 got the mechanism**
**wrong while reaching the right conclusion.**

**The mechanism.** LCR is not an aggregation of the maturity ladder. It is a **rules engine over**
**classified balances**: a retail current account contributes 5% or 10% of its *balance* to outflows
regardless of its contractual overnight cashflow. Revision 1's framing — "LCR comes off contractual
cashflows" — made the ratio look like a free by-product of D2's projection engine. It is a separate
computation with its own dependencies, and those dependencies were hidden by the wrong framing (see
§3.5).

**The conclusion still holds, on the correct reasoning.** LCR is not a forecast. It is a stress
scenario with *regulator-prescribed* run-off and drawdown factors: stable retail deposits run off at a
prescribed rate, non-operational wholesale deposits at a higher prescribed rate, committed retail
facilities draw at a prescribed rate. **These factors are constants handed down by the regulator — the**
**bank does not model them and is not permitted to substitute its own view.** That, not the cashflow
engine, is why Phase 1 needs no behavioural models.

What LCR *does* require is **correct classification** — the same eight dimensions D2 already
enforces, plus the depositor-level attributes noted in D2 §4.4:

| Classification needed | Source | Why it is not a behavioural model |
| --- | --- | --- |
| Stable vs less-stable retail deposit | Deposit insurance coverage, relationship, account type | A rules-based test on customer and product static data |
| Operational vs non-operational wholesale deposit | Cash management, clearing, custody relationship | A relationship classification, evidenced and documented |
| Insured vs uninsured balance | Per-depositor aggregation against the coverage threshold | Arithmetic on customer-linked balances |
| Committed vs uncommitted facility | Contract terms | A contractual fact |
| HQLA level and eligibility | Issuer, rating, market depth, encumbrance | A rules test over D2 classification and D6 encumbrance |

Every one of these is a **rule over static and contractual data** — available from D1, D2 and D6 in
Phase 0. None requires a calibrated behavioural model.

**Therefore Phase 1 delivers the LCR without D9's behavioural models existing.** The behavioural models
are needed for internal metrics (§5) and for the behavioural ladder — not for the regulatory ratio.
This is the load-bearing assumption behind the build sequence, and it holds because of what the LCR
actually is.

**Two honest caveats.**

*The internal stress view is Phase 3, not Phase 1.* The view that tells the treasurer what would really
happen, rather than what the regulator prescribes, does need behavioural assumptions. Phase 1 gives the
regulatory ratio and the contractual ladder; it does not give a defensible internal stress view, and
**survival horizon belongs in Phase 3** for the same reason. The phasing must say so rather than
implying liquidity is finished after Phase 1.

*"Complete" overstated it.* Revision 1 claimed a complete and correct LCR in Phase 1. Behavioural
independence is real, but §3.5 sets out four non-behavioural dependencies that must be satisfied before
the ratio is complete — and one of them cannot be satisfied at all for two years.

### 3.2 Structure

**Numerator — HQLA stock.** Level 1 (no haircut, no cap), Level 2A (haircut, subject to the 40% cap
with 2B), Level 2B (larger haircut, subject to its own 15% cap). The caps are applied via the
prescribed adjustment calculation, not by naive truncation — an implementation detail that is
routinely got wrong and produces a ratio that fails reconciliation against the regulator's own
worked examples.

Eligibility requires the asset to be unencumbered, under treasury's control, and operationally
monetisable. **Encumbrance is a live feed from D6, not a static flag** — a bond pledged intraday
under repo leaves the buffer at the moment of pledging.

**Denominator — net outflows.** Gross outflows by category and prescribed factor, less inflows,
where **inflows are capped at 75% of gross outflows**. The cap matters: it means a bank cannot rely
on incoming repayments to offset an outflow shock, and it must be implemented as a constraint, not
assumed non-binding.

### 3.3 The outflow categories that get forgotten

Three derivative-related outflows are consistently under-built and each can be material:

1. **Collateral outflow from market moves.** The prescribed treatment uses a historical look-back —
 the largest 30-day net collateral flow over the preceding 24 months. This needs a **stored history**
** of collateral movements**, which is a data retention requirement on D6 that must exist before the
 ratio can be computed. If it is not captured from day one, the metric cannot be back-filled.
2. **Downgrade triggers.** Contractual clauses requiring additional collateral on a ratings
 downgrade. These live in CSA and issuance documentation, not in trade economics, and must be
 captured as structured Contract attributes at booking or they are invisible.
3. **Excess collateral and substitution rights** — collateral held that the counterparty may recall,
 and contractual substitution obligations.

All three are consequences of the CSA and legal documentation. **The design implication for D2 and**
**D6: legal agreement terms must be modelled as structured data, not held as attached PDFs.** This is
a requirement Phase 1 places on Phase 0 and Phase 4, and it should be visible in their scope.

### 3.4 Currency

The LCR must be computed in aggregate and **by significant currency**, with no netting across
currencies. Where a currency mismatch exists, the ability to raise the deficient currency via FX swap
is a *management* consideration, not a regulatory offset — and under stress the swap market for a
thin currency is precisely what closes. The model must show the per-currency position plainly rather
than hiding it in a consolidated ratio.

### 3.5 What the wrong framing hid — four Phase 1 dependencies

Treating LCR as a cashflow aggregation concealed four dependencies that have nothing to do with
behavioural models. All four are now reflected in the parent build sequence.

| Dependency | Needs | Resolution |
| --- | --- | --- |
| **Unencumbered status** for HQLA eligibility, and **encumbrance duration** for NSFR RSF weighting | D6, otherwise a Phase 4 module | **A minimal encumbrance register is pulled forward into Phase 0.** Not full collateral management — just the register recording what is pledged, to whom, and until when |
| **Level 2 / 2B cap calculation** requires the adjusted-HQLA unwind of short-term secured funding | Repo and reverse repo detail from D6 | Same minimal register, extended to securities financing positions |
| **Downgrade-trigger outflows** (§3.3) | CSA rating triggers as structured data | D2 §2.8 legal agreements and netting sets, added to Phase 0 |
| **Derivative collateral outflow look-back** — largest 30-day net collateral flow over the preceding **24 months** | Two years of collateral movement history | **Not satisfiable from the platform in Phase 1, but partly recoverable from records held outside it.** Resolved by the three-track approach in §3.6 |

### 3.6 Collateral movement history — decided, and actionable now

**Decision: log forward, reconstruct backward, and proxy the remaining gap. This is a pre-Phase-0**
**operational task, not part of the build.**

**Correction to an earlier framing.** The look-back was described as impossible to back-fill. That is
true of the *platform* but not of the *bank*: the movements physically occurred and left traces in
records held outside any treasury system. The bank margins actively today with records scattered
across spreadsheets, email and counterparty statements, so reconstruction is a collation exercise
rather than a forensic one.

The metric is forgiving of gaps. It is the **largest absolute net 30-day collateral flow** over the
period — an extremum, not a continuous series — so quiet periods can be sparse. Fidelity is only
needed around stress episodes, which are the periods most visible in bank statements.

#### Track 1 — Log forward, starting immediately

A movement log, not a collateral management system. **Seven fields**, capturable in a database table or
a disciplined spreadsheet with a named daily owner:

| Field | Note |
| --- | --- |
| Movement date | Value date, not instruction date |
| Counterparty | Resolvable to D1 counterparty and, later, netting set |
| Netting set / agreement reference | May be blank initially; backfilled when D2 §2.8 lands |
| Direction | Posted or received |
| Amount and currency |  |
| Collateral type | Cash or securities (with ISIN where securities) |
| Transaction type | Derivative variation margin, initial margin, or repo/SFT margin |

This starts **now**, ahead of Phase 0. Every month of delay is a permanently missing month.

#### Track 2 — Reconstruct backward from existing records

A one-off exercise with its **own clock, independent of Track 1**: statement retrieval moves from
self-service to archive request as records age, so it gets slower and more expensive the longer it
waits. Request 24 months now.

| Source | Recovers | Strength |
| --- | --- | --- |
| **Nostro and bank statements** | Cash collateral by date and counterparty | Strongest — a complete record of cash movements; correspondents routinely re-supply 24 months |
| **Counterparty and CCP margin statements** | Margin balances and calls per relationship | Complete per counterparty; requires a request to each |
| **Custodian statements** | Securities collateral in and out | Good for non-cash collateral |
| **Margin call correspondence and operations spreadsheets** | Call amounts, disputes, timing | Messy, but useful to validate the statement-derived series |

Reconcile the reconstructed series against Track 1 once both are running, to confirm the
reconstruction method produces figures consistent with directly logged movements.

#### Track 3 — Proxy the residual, and retire it

For any period that remains genuinely unreconstructable, disclose a documented proxy: a
**scenario-derived estimate**, computed by stressing the current derivative portfolio through D14's
market scenarios and deriving the implied collateral call, **floored at the largest net 30-day flow**
**observed in the reconstructed data**. Disclosed to the regulator as an interim method, reviewed each
reporting cycle, and retired automatically as real coverage fills the window.

The proxy must be **conservative by construction** — where reconstruction is uncertain, the estimate
resolves upward. An understated collateral outflow overstates the LCR, which is the wrong direction to
be wrong in.

#### Ownership

Track 1 needs a named daily owner in treasury operations from day one. Track 2 needs a one-off owner
with authority to request statements from correspondents, counterparties and custodians. Neither
depends on the platform build, and both should start before Phase 0 does.

## 4. Net Stable Funding Ratio

```
NSFR = Available Stable Funding / Required Stable Funding  ≥  100%
```

A one-year structural measure. ASF factors weight liabilities and capital by tenor and stickiness;
RSF factors weight assets by liquidity and residual maturity. Both are prescribed, so the same
Phase 1 argument applies: NSFR needs classification, not behavioural models.

Design points that differ from LCR:

- **Residual maturity drives the weighting**, so the ratio changes as contracts age even with no new
business. It must be projectable forward, not only computed spot — a treasurer needs to see the
NSFR cliff before walking off it
- **Encumbrance affects RSF**: encumbered assets attract higher RSF factors scaled by the encumbrance
period. Another live D6 dependency
- **Interdependent asset/liability pairs** may receive symmetrical treatment where the regulator
permits it; this is a configurable rule, not a hardcoded exception
- Off-balance-sheet exposures carry RSF, so §2.2's contingent inventory feeds this ratio too

## 5. Internal liquidity metrics

Where the bank's own view lives, as distinct from the regulator's. **These do require behavioural**
**models and are therefore Phase 3, not Phase 1.**

| Metric | Definition | Dependency |
| --- | --- | --- |
| Survival horizon | Days until counterbalancing capacity is exhausted under a stress scenario | D9 behavioural models, D14 scenarios |
| Funding concentration | Largest depositors, largest counterparties, largest funding sources as a share of total | Customer linkage from D2 |
| Funding profile | Weighted average maturity of liabilities; secured vs unsecured; wholesale vs retail mix | Contractual, available Phase 1 |
| Encumbrance ratio | Encumbered assets as a share of total assets | D6 |
| Loan-to-deposit ratio | Structural funding dependence | Contractual, available Phase 1 |
| Rollover risk | Wholesale funding maturing in each near-term window and the rollover assumption applied | D9 for the assumption |
| Early warning indicators | Threshold breaches on internal and market signals — spread widening, deposit outflow rates, ratings actions | Mixed |

**Funding concentration deserves emphasis** because it is the metric the LCR does not capture. A bank
can hold a compliant LCR and still fail because three depositors hold a quarter of its funding. This
requires customer-level aggregation across accounts and across the group — the specific capability
D2 §4.4 preserved by rejecting pooled ingestion.

### 5.1 Three different splits of the same deposit book

Reconciled against `d9-alm-and-irrbb` §6.1. The non-maturity deposit book (Part 2 B.3) is split three
separate ways for three separate purposes. **They are related, they are not interchangeable, and they**
**must not be forced to share a parameter.** Collapsing them is the most common modelling error in this
area, and it produces numbers that are individually plausible and jointly wrong.

| # | Split | Owner | Nature | Question it answers |
| --- | --- | --- | --- | --- |
| 1 | **Stable vs less-stable retail** (LCR) | D10, prescribed by regulator | **Not a model.** A rules test on deposit insurance coverage, relationship and account type | Which prescribed run-off factor applies? |
| 2 | **Core vs volatile balance** (internal liquidity) | D10, behavioural | Modelled — how much balance survives a stress event | How much cash actually leaves, and how fast? |
| 3 | **Core vs non-core + maturity profile + repricing beta** (IRRBB) | D9, behavioural | Modelled — three distinct parameters, see D9 §6.1 | How does economic value and net interest income respond to rate moves? |

**Why they cannot be one parameter.**

- **Split 1 is not modelled at all.** It is a classification handed down by the regulator, computed
from static data, and available in Phase 0 (§3.1). It has no behavioural content and takes no
calibration.
- **Splits 2 and 3 measure orthogonal properties.** Stability is a *liquidity* property — will the
money leave. Repricing beta is a *rate-risk* property — will the rate we pay move. A deposit can be
perfectly stable and still reprice instantly: a large corporate operational balance that never
leaves but is priced off the policy rate is stable for liquidity and effectively overnight for
IRRBB. The reverse also occurs — a rate-insensitive retail savings balance that is sticky in normal
conditions but flighty under stress.
- **Their stress directions differ.** Liquidity stability is calibrated against outflow events;
rate-risk beta is calibrated against rate cycles. The historical periods that inform them are not
the same periods.

**Design consequence.** D10 and D9 consume from a shared behavioural model *inventory* governed by
D15, but they consume **different parameters** from it. The platform must not implement a single
"deposit stickiness" figure serving both. Where a common input genuinely exists — the customer and
product segmentation that both splits are computed over — it should be shared, and the segmentation
is the right thing to standardise. The parameters computed over that segmentation are not.

**Split 2 is a model and must be in the inventory as one — `D15-3`.** The table above already labels
it *"modelled"* and split 1 *"not a model"*, which is the right distinction and stops short of the
consequence: **D10 owns two entries in D15's model inventory and neither is named as a model
anywhere** — the **core/volatile split** here, and the **collateral outflow proxy** in §3.6. Both are
tier-1 by D15's criteria: the first drives the internal survival horizon and the second feeds a
reported regulatory ratio. The proxy is the more urgent of the two, because it is disclosed to a
regulator as an interim method, is currently owned by an operational workstream rather than by a model
owner, and is **the one model in the inventory with a planned retirement date** — which makes an owner
and a documented methodology a condition of using it, not an improvement on it
(`d15-model-governance` §3.1). The general form of the finding: **a proxy is a model**, and proxies are
where this inventory's unnamed entries cluster.

This also refines D10 §3.1: LCR's independence from behavioural models rests on split 1 being purely
rules-based. Splits 2 and 3 are both behavioural and both Phase 3. The Phase 1 argument holds only
for the regulatory ratio, not for internal liquidity metrics.

## 6. Liquidity stress testing

Executes scenarios owned by D14 against the ladder and counterbalancing capacity. Minimum scenario
set: idiosyncratic stress (bank-specific — deposit run, ratings downgrade, loss of wholesale access),
market-wide stress (systemic — HQLA haircut widening, market closure), and a combined scenario.
Reverse stress testing asks the inverse question: what combination breaks us, and how plausible is it?

Each scenario parameterises deposit run-off rates, drawdown rates, haircut widening, market closure
assumptions, rollover rates and collateral outflows. **These are internal assumptions, distinct from**
**LCR's prescribed factors** — the same engine, a different factor set, which is exactly why D14 owns
the definitions and why the engine takes factors as input rather than embedding them.

Output is a survival horizon per scenario per currency, plus the contingency funding plan trigger
points that follow from it.

## 7. Funding plan and risk appetite

The forward-looking half of the module: the projected balance sheet, the funding required to support
it, planned issuance (Part 1 §8), and the resulting projected LCR, NSFR and concentration.

**Pre-deal what-if is the highest-value interactive feature in the platform.** "What does a
three-year senior unsecured issue of 500m do to my NSFR, my LCR and my concentration?" answered in
seconds, before the deal is done, is what turns the platform from a reporting tool into a decision
tool. It reuses the EOD engines with a hypothetical contract added — which is only possible because
the engines are stateless and re-runnable (parent blueprint §3).

Risk appetite is expressed as thresholds on these metrics with defined escalation, and breaches feed
**the limit framework, which arrives with Phase 4 and is not part of D11 — `D11-H2`.** This sentence
read *"the same limit framework D11 operates"*, which was true of blueprint revision 1 and is not true
now: parent §1.5 moved the limit framework out of D11 precisely because D4's pre-deal checks and D9's,
D10's and D11's outputs all consume it, and leaving it inside a Phase 5 module recreated the Phase 4→5
dependency inversion the architecture critique found. **The correction matters for Phase 1 planning:**
D10's early-warning thresholds land two phases before the framework that is meant to receive them, so
Phase 1 either carries its own threshold-and-escalation mechanism or accepts that breach routing is
manual until Phase 4 — a decision, not a detail.

## 8. Intraday liquidity — deferred

Out of scope for Phase 1 per D2 §5.1. BCBS 248-style monitoring — available intraday liquidity, daily
maximum usage, total payments, time-specific obligations, throughput — requires real payment and
nostro event streams that only arrive with Phase 4 (front-to-back). The daily ladder and the intraday
view are different measurement problems, and conflating them delays both.

**What Phase 1 must not foreclose:** the nostro reconciliation feed (parent blueprint §4) is the same
data source intraday monitoring will need. Building it once, with event-level granularity and
timestamps rather than end-of-day balances only, means intraday monitoring is later an addition
rather than a re-plumbing.

## 9. Interfaces

**Inbound.**

| Source | Content |
| --- | --- |
| D2 | Cashflows on both bases with full classification; positions; customer linkage for concentration |
| D6 | Encumbrance state, collateral pool composition, pre-positioned central bank collateral, collateral movement history |
| D3 | Market values and haircut inputs for counterbalancing capacity |
| D1 | Counterparty type, customer hierarchy, deposit insurance status, product static |
| D9 | Behavioural model *inventory and segmentation* — Phase 3 onward. **Liquidity parameters (core/volatile balance) are D10's own and distinct from D9's rate-risk parameters; only the customer/product segmentation is shared.** See §5.1 |
| D14 | Scenario definitions and factor sets |
| D13 | Regulatory factor rule sets — prescribed run-off, drawdown, ASF and RSF factors, versioned and effective-dated |

**Outbound.** LCR and NSFR to D13 for regulatory submission; survival horizon and concentration to
ALCO reporting; funding gap and liquidity cost signals to D12 (FTP's liquidity premium component
derives from this module's funding profile, and the contingent liquidity charge from §2.2's register);
early warning breaches to **the limit framework — a Phase 4 component, not part of D11** (§7,
`D11-H2`).

**Note the D12 dependency direction.** FTP's liquidity charge should be derived from the actual
marginal cost and structural funding profile measured here. If FTP liquidity premiums are set
independently of D10's output, the bank prices internal liquidity at a rate disconnected from what it
actually costs — which is how business units are incentivised to originate exactly the assets that
damage the ratios.

## 10. Acceptance criteria

1. LCR and NSFR reconcile to the regulator's own worked examples, including cap and haircut edge
 cases — HQLA composition caps, the 75% inflow cap, and the adjusted-stock calculation
2. Both ratios are produced in aggregate and by significant currency, with no cross-currency netting
3. Every contingent exposure in the source taxonomy (Part 2 §D, Part 1 §8 and §11) appears in the
 ladder with a documented factor
4. Any ratio decomposes to the contracts driving it — a movement is explainable line by line, not
 merely observed
5. The full ladder rebuilds from D2 cashflows with no manual adjustment
6. Regulatory factors are configuration, versioned and effective-dated; a factor change is a rule
 edit, and historic ratios reproduce under the factors in force at the time
7. Encumbrance changes in D6 propagate to HQLA eligibility without a batch delay
8. Pre-deal what-if returns a projected ratio impact within an interactive response time
9. Deposit behavioural parameters used for liquidity are held separately from D9's rate-risk
 parameters and computed over the same governed customer/product segmentation — demonstrated by a
 reconciliation showing both parameter sets against a common segmentation, not by assurance (§5.1).
 **The reconciliation carries a third column — `D12-2`:** D9's split 3, D10's split 2, and **which of
 the two D12 consumed for each FTP component**. Two columns prove the parameters differ; the third
 proves the *consumer* picked the right one, which is the failure that actually occurs — D9 and D10
 can hold correctly distinct parameters while D12 sources its liquidity premium from the rate-risk
 set, satisfying this criterion and D9's AC9 simultaneously (D9 §8, `d12-funds-transfer-pricing` §1.2)

## 11. Open questions

1. **Collateral movement history** — *resolved in revision 2.* Three-track approach in §3.6: log
 forward from now, reconstruct backward from statements, proxy the residual. Remaining question is
 ownership — who owns the daily log, and who has authority to request 24 months of statements from
 correspondents, counterparties and custodians.
2. **Legal agreement data capture** — *resolved in revision 2.* Downgrade triggers and substitution
 rights are structured data in D2 §2.8, and legal agreements and netting sets are now in Phase 0.
 Remaining question is operational: who extracts the terms from existing CSA and issuance
 documentation, and over what timeframe?
3. **Deposit insurance data** — per-depositor coverage determination requires customer-level
 aggregation and insurance scheme rules. Is that data reliably available from core banking today?
4. **Significant currency threshold** — which currencies cross the reporting threshold, and does the
 bank's dual or multi-currency situation (if any) require per-currency ratios from day one?
5. **Internal stress scenario ownership** — D14 owns definitions, but who approves them? ALCO
 presumably; needs confirming, and the approval workflow belongs somewhere.

## Appendix — amendments applied from sibling modules

Findings raised by `d12-funds-transfer-pricing`, `d11-market-and-counterparty-risk` and
`d15-model-governance` against this artifact, applied under the trigger *"D10 is next amended"*. Refs
keep their originating module's namespace (`blueprint-amendment-protocol` R1); this is not a D10 pass
and allocates no `D10-n`.

| Ref | Applied | Section |
|---|---|---|
| `D12-2` | Acceptance criterion 9 gains a third column — which parameter set D12 consumed per FTP component | AC9 |
| `D12-6` | Contingent liquidity charge named as a required FTP component, measured off §2.2's register | §2.2, §9 |
| `D11-H2` | **Two stale revision-1 references corrected.** §7 and §9 routed breaches to *"the limit framework D11 operates"*; parent §1.5 moved it out of D11 to Phase 4 | §7, §9 |
| `D15-3` | D10's two model-inventory entries named — the core/volatile split and the collateral outflow proxy | §5.1 |

**`D11-H2` is the one with a planning consequence.** Left uncorrected it would have rebuilt the
Phase 4→5 dependency inversion the architecture critique found, and it surfaces a real Phase 1 gap: this
module's early-warning thresholds arrive before the framework meant to receive them.

**On the ref `D11-H2`.** The D11 deep-dive raised this as `H2` in its own appendix and it was never
allocated a `D11-n` in the parent, so it has no canonical ref to cite. Written as `D11-H2` — the
originating module plus its local ref — rather than allocating a new `D11-n`, since `BP-n` is
owner-only under R1b and D11's sequence has a single writer that is not me. The same applies to
`D11-H3` in `d14-scenario-and-stress-framework`.
