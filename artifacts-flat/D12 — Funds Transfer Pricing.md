# D12 — Funds Transfer Pricing

Internal pricing curves and transfer contracts: the mechanism that moves interest rate and liquidity
risk from business units to treasury and prices what it costs. Parent: `treasury-alm-risk-platform`.
Phase 6 — **with obligations that start in Phase 3 and a decision that cannot wait for Phase 6 (§5).**

**D12 is the smallest module in the blueprint and the one with the most political weight.** It computes
a rate. That rate decides which business unit is profitable, and it is the only number in the platform
whose primary consumer is a performance review. Everything below follows from that: the methodology
needs model-grade governance, the parameters cannot be D12's own, and the module that sets the rate
must not be the module whose P&L is the residual (§4).

**The reconciliation this deep-dive was commissioned for.** `d9-alm-and-irrbb` §8.2 states that FTP and
IRRBB *"must use the same behavioural assumptions"* and that *"the fix is architectural: one behavioural
model set, consumed by both."* `d10-liquidity-and-funding` §5.1 states that the deposit book is split
three ways and that the splits *"must not be forced to share a parameter."*

**Read carelessly these conflict. Read carefully they are the same requirement, and D12 is the single
place in the platform where getting it wrong is most likely** — because an FTP rate is one number, and
one number is exactly what invites a single "deposit tenor" assumption that collapses the two orthogonal
properties D10 §5.1 exists to keep apart (§1.2).

## 1. Responsibilities and boundaries

### 1.1 What FTP is for

A business unit that originates a 5-year fixed rate loan funded by overnight deposits is running
interest rate and liquidity risk it did not choose, cannot measure and is not accountable for. FTP
charges it a rate matched to the loan's repricing and funding profile, credits the deposit-gathering
unit at a rate matched to the deposit's, and leaves both with **credit and operational risk only**. The
rate and liquidity risk lands with treasury, which is where the hedging decision is made.

**The failure FTP prevents, stated concretely because it is the argument for building it:** without
FTP, every business unit's margin is a function of the yield curve rather than of its own pricing
discipline, and the unit that grows fastest is whichever one happens to be positioned for the current
rate environment. **The failure a *bad* FTP causes is worse** — a mispriced internal rate is a
persistent, invisible subsidy that reshapes the balance sheet in the direction of the mispricing, and it
does so faster than any risk limit reacts. `d10-liquidity-and-funding` §9 names the specific case: FTP
liquidity premiums set independently of measured funding cost are *"how business units are incentivised
to originate exactly the assets that damage the ratios."*

### 1.2 The D12 / D9 boundary — reconciling §8 with D10 §5.1

#### 1.2.1 The apparent conflict

| Source | Claim |
| --- | --- |
| `d9-alm-and-irrbb` §8.2 | FTP and IRRBB must use the same behavioural assumptions — *"one behavioural model set, consumed by both"* |
| `d10-liquidity-and-funding` §5.1 | Three splits of the deposit book, *"related, not interchangeable, and they must not be forced to share a parameter"* — only the customer/product segmentation is shared |
| `d9-alm-and-irrbb` §6.1 | *"Stability is a liquidity property; beta is a rate-risk property. Conflating them is the most common modelling error in this area"* |

**Both are right, and the resolution is that D9 §8.2's "one model set" means one *inventory*, not one
*parameter*.** D12 must not calibrate its own behavioural view — that is the real content of §8.2, and
the failure it names is real: *"If FTP prices a non-maturity deposit as 3-year money while IRRBB models
it as 5-year, the bank has transferred a different risk from the one it measures, and the residual sits
with treasury unmeasured and unattributed."*

But D12 does not consume *one* parameter set. **It consumes three, from two owners**, because an FTP
rate has components that price different risks:

| FTP component | Prices | Consumes | Owner |
| --- | --- | --- | --- |
| **Base / repricing rate** | When the rate resets | Split 3 — maturity profile and repricing beta | **D9** (§6.1) |
| **Liquidity / term premium** | How long the money actually stays | Split 2 — core/volatile balance stability | **D10** (§5.1) |
| **Option cost** | Optionality the bank has sold | Prepayment, early redemption, drawdown models | **D9** (§6.2, §6.3) |

**This is the reconciliation.** D12 adds no fourth split and calibrates nothing. It draws the rate-risk
parameter from D9, the liquidity parameter from D10, and the optionality parameter from D9 — each at a
named version, over the shared segmentation D10 §5.1 designates as the one thing that genuinely is
common.

#### 1.2.2 The decision that makes it hold: components, not tenors

**An FTP transfer price is a vector of named components, never a single assigned tenor.**

This is the load-bearing design decision of the module, and the reason is D10 §5.1's own argument. If a
non-maturity deposit is assigned "an FTP tenor of 3 years" and the rate is read off a curve at that
point, then **beta and stability have been forced into one parameter by the shape of the output** — the
single tenor cannot simultaneously express a rate-risk maturity of 4 years and a liquidity maturity of 2.
The conflation D9 §6.1 calls *"the most common modelling error in this area"* does not enter through the
model; it enters through the pricing convention.

Two consequences worth stating because they are what implementation gets wrong:

- **The components are stored, not just the total.** A transfer rate that arrives as one number cannot
  be decomposed later, and "why is this deposit's credit 40bp lower than last year" becomes an
  investigation rather than a query. Same principle as D8 §2.2's adjustment stack — *"every value is
  decomposable into base plus named adjustments"* — applied to internal pricing
- **The rate-risk component and the liquidity component may imply different terms, and that is correct,
  not an inconsistency to reconcile away.** D10 §5.1's example is exactly this case: a large corporate
  operational balance *"never leaves but is priced off the policy rate"* — stable for liquidity,
  effectively overnight for rate risk. An FTP framework that cannot express that will misprice the
  bank's most valuable deposits

#### 1.2.3 D9's acceptance criterion 9 is under-specified in the direction of the error

`d9-alm-and-irrbb` acceptance criterion 9 reads: *"D9 and D12 demonstrably consume the same behavioural
parameter set — a reconciliation report proving it, not an assurance."*

**The requirement is right and the wording invites the wrong implementation.** Read literally, D12
consumes D9's parameter set — all of it, for every component. That satisfies the criterion as written
and violates D10 §5.1, because D12's liquidity premium would then derive from D9's rate-risk parameters
rather than D10's stability parameters.

**Proposed correction, for D9's next revision:** D12 consumes **D9's split-3 parameters for the
repricing component and D10's split-2 parameters for the liquidity component**, each at a named version
over the common segmentation; the reconciliation report shows all three parameter sets against that
segmentation. That is D10 acceptance criterion 9's structure with D12 added as a third column, and it
tests the property both artifacts actually want.

#### 1.2.4 A maturity profile is not a point, and collapsing it is the second way this breaks

D9 §6.1(b) gives non-maturity deposits a **maturity profile** — a decay function or slotting profile —
not a single maturity. The natural FTP implementation takes a weighted-average life from that profile
and prices at one curve point.

**That reintroduces the divergence while appearing to satisfy every criterion above.** A deposit priced
at the weighted-average life of its profile receives a different credit from the same deposit priced as
a portfolio of tranches across the profile, and the difference is the curvature of the curve — material
in a steep or inverted market, which is precisely when ALCO is looking.

**Requirement: the FTP rate for a profiled balance is computed over the profile, tranche by tranche.**
This is the **replicating portfolio** technique, and the architectural point is that **the replicating
portfolio and D9's slotting profile must be the same object** — not two representations of one intent
maintained separately. If treasury's replicating portfolio drifts from D9's profile, the bank is hedging
one profile and measuring another, which is D9 §8.2's failure with the labels swapped.

#### 1.2.5 Parameter vintage — the structural residual nobody owns

**FTP rates are struck at inception and fixed for the life of the contract. Behavioural parameters are
recalibrated.** Both are correct, and together they guarantee divergence:

- A 2026-booked contract carries the FTP rate implied by the 2026 parameter vintage, permanently
- D9 measures today's book under today's parameters (§6.4, and D2 §4.3's versioned effective dating)
- **So the risk transferred and the risk measured differ by an amount that grows with every
  recalibration, on the existing book, with no error anywhere**

D9 §8.3 requires D9 to report *"both the gross banking book position and treasury's residual."* **That
residual has two causes and they must be separated**, because they call for opposite responses:

| Residual component | Cause | Response |
| --- | --- | --- |
| Unhedged position | Treasury chose not to hedge | A risk decision — hedge it or accept it |
| **Parameter vintage drift** | Recalibration since the contracts were struck | **Not a risk decision.** Either a policy of periodic FTP re-striking, or an accepted and quantified allocation error |

Reporting them as one number means a treasurer sees a position that appears unhedged and is partly an
artefact of the deposit model being recalibrated two years ago. **D12 owns the vintage decomposition**,
because it is the only module that holds the inception parameter version per contract — and that means
**the parameter version used to strike a rate is stored on the transfer contract**, not merely referenced
by date. This is the same reproducibility discipline D8 §2.1 applies to the version triple, and it costs
one field.

### 1.3 The D12 / D10 boundary — the liquidity premium, and the charge that gets forgotten

`d10-liquidity-and-funding` §9 sets the direction explicitly: FTP's liquidity charge derives from D10's
measured marginal funding cost and structural funding profile, never set independently. Accepted without
qualification.

**One addition D10 could not make from its side: the contingent liquidity charge.**

An undrawn committed facility consumes LCR outflow and NSFR RSF (D10 §2.2, §4) while generating **no
funding need and no interest income** until it draws. If FTP charges nothing for it — the default, because
there is no balance to price — then the business unit originates undrawn commitments at zero internal
cost while the bank carries the ratio consumption.

**This is the single most reliable way to damage an LCR through internal pricing**, and it is invisible
in the loan book's margin because the cost sits in a ratio rather than in P&L. **A contingent liquidity
charge on undrawn commitments, priced off D10's prescribed and modelled drawdown factors, is a required
component (§2), not an enhancement.** The same argument applies to the guarantees and letters of credit
in D10 §2.2's contingent inventory.

### 1.4 The D12 / D3 boundary — inherited and settled

`d3-market-data-and-curves` §1.4 already decided this: **FTP curves are `internal` curve class, stored
and served by D3 exactly as market curves are; D12 authors their content in Phase 6; the curve service
exists from Phase 0.** *"D12's arrival in Phase 6 adds curve content, not a second curve service."*

Accepted, and D8 §8 completes it — valuation on internal FTP curves lands in Phase 6.

**The property that makes this more than a storage convenience:** D3 §1.4 makes curve class first-class
*"because a regulatory return must be able to assert that no internal curve entered it."* §3 argues the
identical assertion is needed for internal *contracts* and currently has no mechanism.

### 1.5 What D12 does not own

| Not D12 | Owner | Note |
| --- | --- | --- |
| Behavioural model definition or calibration | D9 (rate, optionality), D10 (liquidity) | §1.2. D12 calibrates nothing |
| Behavioural model execution | D2 | Transfer contracts project like any other Contract |
| Curve storage, versioning and service | D3 §1.4 | D12 supplies content only |
| IRRBB measurement | D9 | D12 allocates the risk; D9 measures it, on the whole book regardless of allocation (D9 §8.1) |
| Liquidity measurement and funding cost | D10 | §1.3 — D12 consumes the measured cost |
| Valuation of transfer contracts | D8 | On the internal curve, Phase 6 |
| The bank's cost of capital | Finance / capital management | D12 applies a capital charge; it does not set one |
| Business unit P&L reporting | Finance | D12 supplies the transfer component |
| Scenario definitions | D14 | FTP curves are shockable objects like any other (D3 §1.4 — *"they are interpolated, they are shocked"*) |

## 2. The transfer price

**Every component is separately computed, separately stored and separately explainable** (§1.2.2).

| Component | Prices | Source |
| --- | --- | --- |
| **Base rate** | The repricing profile — when the rate resets | D3 base curve at the profile's points; D9 split 3 supplies the profile and beta |
| **Liquidity / term premium** | The bank's marginal cost of term funding for the behavioural life | D10 measured funding profile and marginal cost (§1.3); D10 split 2 supplies the stability |
| **Contingent liquidity charge** | Ratio consumption of undrawn and off-balance-sheet commitments | D10 §2.2 contingent register, drawdown factors (§1.3) |
| **Basis** | Index and tenor mismatch between the asset's index and the funding index | D9 §7's index-level granularity — the same basis risk D9 measures |
| **Option cost** | Optionality sold to the customer — prepayment, early redemption, break rights | **D9 §6.2, §6.3**; valued by D8 where the option is automatic (D9 §6.3's automatic/behavioural distinction applies here unchanged) |
| **Capital charge** | Regulatory capital consumed | D13 RWA per exposure; the cost of capital is set outside D12 |
| **Equity funding benefit** | The portion of assets funded by equity rather than liabilities | Interacts with D9 §4.1's own-equity choice — the two must be coherent (§4) |

**Option cost is the component most often omitted and it is a direct transfer of D9's work.** A
prepayable fixed rate loan contains a customer option that D9 §6.2 explicitly identifies as *"an option
the bank has sold."* If FTP does not charge for it, the business unit books the full spread and treasury
absorbs the sold option at zero internal price — and the bank has systematically underpriced its
prepayable book without any single decision to do so.

## 3. Transfer contracts are internal Contracts, and nothing marks them internal

Part 1 §10 internal ALM instruments are real Contracts in D2 — parent Appendix A row 10 routes them to
D12, D9 and D2 and records that they *"eliminate on consolidation — an intentional non-appearance in
Part 2, stated rather than omitted."*

**So the platform will hold Contracts that must appear in internal management reporting and must never
appear in a balance sheet, a regulatory return, or an external disclosure.** Two of them exist per
transfer — a business unit leg and a treasury leg — and they net to zero at bank level.

**The mechanism for guaranteeing that is missing.** D3 §1.4 established `curve_class` precisely so *"a
regulatory return must be able to assert that no internal curve entered it."* **There is no equivalent
assertion for contracts**, and exclusion by report-level filter is the weaker control — parent §5's
quarantine principle makes the general argument, and here the direction of failure is the dangerous one:
a missed filter inflates both sides of the balance sheet by the full internal book.

**Requirement: an `internal` designation on Contract, excluded from external-facing aggregation by
construction, with the same assertability D3 gives curves.** It is a Phase 6 need created by a Phase 0
object, it is one attribute, and retrofitting it means re-deriving which historic contracts were internal.

**One boundary clarification, because conflating these would corrupt D9's scope.** FTP transfer
contracts are **not** the internal hedges D9 §2 discusses. D9's internal hedges move risk *across the
trading/banking book boundary* and are only recognised for IRRBB where the trading book lays them off
externally. FTP transfer contracts move risk *within the banking book*, between business units and
treasury, and change nothing about IRRBB scope — D9 §8.1 is explicit that IRRBB is measured on the whole
banking book regardless of internal allocation. Different objects, different rules, similar names.

## 4. Governance — the module that marks its own homework

**FTP rates allocate P&L between business units, and treasury's own P&L is the residual.** Treasury
sets the rates; treasury keeps what is left over. That is the standard arrangement and it is a
segregation problem the platform should name rather than inherit silently.

Three requirements follow:

1. **The methodology is a governed model under D15**, not a treasury configuration. Versioned,
   effective-dated, approved, with documented rationale per component — the same bar D8 §4 applies to
   model selection and `classification-rules-engine` §2 applies to rule sets
2. **Approval sits with ALCO, with finance rather than treasury owning the methodology's integrity.**
   Treasury operates it. The maker-checker principle D1 §4 states — *"the person who maintains a
   counterparty limit must not be the person who trades against it"* — applies with equal force here
3. **Retrospective FTP changes restate business unit P&L**, so effective dating is not a reproducibility
   nicety but the difference between a rate change and a rewrite of last year's performance. A rate
   change is prospective by default; retrospective application is an explicit, approved exception

**One coherence check worth naming.** D9 §4.1 makes own-equity treatment in EVE a configurable policy
choice — include equity as a zero-cost funding source with an assumed investment profile, or exclude it.
**D12's equity funding benefit (§2) embeds the same assumption**, and if the two disagree the bank
credits business units for equity funding on a term its own risk measurement does not recognise. Same
class of incoherence as D9 §4.1's margin/discount-curve pairing, and the same fix: state the pair and
check it.

## 5. Phasing — a Phase 6 module with a Phase 4 clock

D12 is correctly placed in Phase 6. **Two obligations start earlier, and the second is a decision that
Phase 6 cannot make retroactively.**

**The dependency chain runs through Phase 3.** D12 consumes versioned behavioural parameters from D9
(Phase 3) and D10's internal liquidity metrics (Phase 3, per D10 §5). Neither exists before then, which
confirms Phase 6 as the earliest sensible build — but it also means **the parameter-versioning
discipline D12 depends on must be built in Phase 3 with a Phase 6 consumer in mind**, specifically the
ability to resolve "the parameter version in force on this date" (§1.2.5).

**The Phase 4 clock: contracts booked before D12 exists have no inception FTP rate.** Phase 4 makes
treasury the system of record and contracts start flowing. D12 arrives two phases later. Every contract
booked in between needs an inception transfer rate that matched-maturity FTP says is struck once and
held.

**Unlike D10 §3.6's collateral history, this one is recoverable — and only because of decisions already
made.** The inputs survive: D3 retains versioned snapshots so the curve as at any inception date is
available, and D2 retains the contract with its terms. What does *not* survive is the **methodology
decision** — which curve, which liquidity premium, which components — because it was never made.

**Recommendation: settle the FTP methodology in Phase 4, populate rates in Phase 6.** The methodology is
a policy exercise, not a build; deciding it early costs a working group rather than a project, and it
converts a two-phase gap from a reconstruction problem into a backfill. The alternative — Phase 6
choosing a methodology and applying it retrospectively to two years of contracts — produces business
unit P&L restatements for periods already reported, which is the one outcome §4 says to avoid.

| Capability | Phase | Driver |
| --- | --- | --- |
| `internal` curve class exists in D3 | **0** | D3 §1.4 — the class exists from Phase 0; D12 fills it |
| **`internal` contract designation** (§3) | **0**, ideally | One attribute; retrofitting means re-deriving which historic contracts were internal |
| Behavioural parameter versioning resolvable by date (§1.2.5) | **3** | With D9 and D10's parameter sets |
| **FTP methodology decided and documented** | **4** | The clock — contracts start booking and inception rates must be strikeable (§5) |
| Curve content, transfer contract generation, component engine, business unit reporting | **6** | D12 proper |
| Valuation on internal curves | **6** | D8 §8 |

## 6. Interfaces

**Inbound.**

| Source | Content |
| --- | --- |
| **D9** | **Split-3 rate-risk parameters** — maturity profile and repricing beta — at a named version (§1.2); prepayment, early redemption and drawdown models for option cost (§2); index-level basis granularity (§7 there) |
| **D10** | **Split-2 liquidity parameters** — core/volatile stability — at a named version (§1.2); measured marginal funding cost and structural funding profile (§1.3); contingent register and drawdown factors for the contingent charge |
| D3 | Base curves for the rate component; storage and service for the internal curve class (§1.4) |
| D1 | The shared customer/product segmentation over which all parameter sets are computed (D10 §5.1); book and portfolio hierarchy for allocation |
| D2 | Contracts and Balances to be priced; repricing attributes |
| D13 | RWA per exposure for the capital charge component |
| D15 | Methodology approval and validation (§4) |

**Outbound.**

| Target | Content |
| --- | --- |
| D3 | **Internal FTP curve content**, versioned and approved (D3 §1.4) |
| D2 | **Transfer Contracts** — internal, two legs per transfer, marked `internal` (§3) |
| D9 | Treasury's residual position after transfer, **decomposed into unhedged position and parameter vintage drift** (§1.2.5, D9 §8.3) |
| Finance / business unit reporting | The transfer component of margin, **decomposed by component** (§1.2.2) |
| D10 | Nothing. The dependency runs one way — D10 §9's direction, deliberately |

## 7. Acceptance criteria

1. **D12 calibrates no behavioural parameter of its own** (§1.2) — demonstrated by the absence of a
   fourth deposit split, not by assurance
2. The repricing component consumes **D9's split-3** parameters and the liquidity component consumes
   **D10's split-2** parameters, each at a named version over the common segmentation; the
   reconciliation report shows all three parameter sets against that segmentation (§1.2.3)
3. **A transfer price is stored as named components, never as a single rate or a single assigned
   tenor** (§1.2.2); any rate decomposes to its components on query
4. Profiled balances are priced **over the profile, tranche by tranche**; the replicating portfolio and
   D9's slotting profile are the same object, not two maintained representations (§1.2.4)
5. The parameter version used to strike each rate is **stored on the transfer contract** (§1.2.5)
6. Treasury's residual decomposes into unhedged position and parameter vintage drift (§1.2.5)
7. Undrawn commitments, guarantees and letters of credit carry a **contingent liquidity charge** derived
   from D10's factors (§1.3)
8. Option cost is charged on prepayable and breakable contracts, using D9's models (§2)
9. Transfer Contracts are marked `internal` and are **excluded from external-facing aggregation by
   construction**; a regulatory return asserts that no internal contract entered it, as D3 §1.4 permits
   for curves (§3)
10. The FTP methodology is a versioned, effective-dated, D15-governed model; rate changes are prospective
    unless a retrospective application is explicitly approved (§4)
11. D12's equity funding treatment and D9 §4.1's own-equity EVE choice are coherent, and the pair is
    stated (§4)
12. Every FTP rate reproduces from its inputs — curve version, parameter versions, methodology version
    (§1.2.5)

## 8. Open questions

1. **Is FTP matched-maturity or pooled?** This artifact assumes matched-maturity throughout, which is the
   only basis on which §1.2's component decomposition is meaningful. A pooled or single-rate FTP is
   simpler, materially less accurate, and would make most of §1.2 moot — it should be a stated decision
   rather than an inherited one.
2. **Does the bank want FTP at all, at this stage?** Phase 6 is late, and a bank without business unit
   P&L accountability may not need it. The question is worth asking explicitly because the answer changes
   whether §5's Phase 4 methodology clock matters.
3. **Who owns the methodology — treasury or finance?** §4 recommends finance owning integrity with
   treasury operating. It is an organisational decision with a real control consequence.
4. **Is the capital charge component in scope?** It requires D13 RWA per exposure (Phase 6) and a cost of
   capital set outside the platform. Some banks exclude it from FTP and handle capital allocation
   separately; either is defensible and the choice changes D12's dependency on D13.
5. **How are internal ALM instruments currently handled?** Part 1 §10 says they exist in the instrument
   universe. If the bank already runs an FTP process — even a spreadsheet one — its methodology is the
   starting point and its parameters are the first thing to reconcile against D9's and D10's.
6. **Does the Phase 4 methodology recommendation (§5) get accepted**, and if not, what is the policy for
   contracts booked between Phase 4 and Phase 6 — backfilled at a stated methodology, or excluded from
   FTP for their life? The second is simpler and permanently distorts the reporting of whichever units
   originated most heavily in that window.

## Appendix — implications for other artifacts

| Ref | Change | Target |
| --- | --- | --- |
| I1 | **D9 acceptance criterion 9 is under-specified in the direction of the error.** "D12 consumes the same behavioural parameter set" read literally sources FTP's liquidity premium from D9's rate-risk parameters, violating D10 §5.1. Should specify D9's split 3 for the repricing component and D10's split 2 for the liquidity component | D9 AC9 |
| I2 | **D10 acceptance criterion 9 gains a third column.** The parameter reconciliation against the common segmentation should show D9's, D10's and D12's consumption together | D10 AC9 |
| I3 | **An `internal` designation on Contract is missing**, and internal ALM instruments (Part 1 §10) need it. D3 §1.4 gave curves exactly this so a return can assert no internal curve entered it; contracts have no equivalent and exclusion by report filter fails in the direction that inflates both sides of the balance sheet | Parent §2.3, D2 |
| I4 | **Treasury's residual has two causes and D9 §8.3 reports it as one.** Unhedged position is a risk decision; parameter vintage drift is an allocation artefact of recalibration. They call for opposite responses | D9 §8.3 |
| I5 | **A fourth clock, and the first that is genuinely recoverable.** Contracts booked from Phase 4 need inception FTP rates; D12 arrives Phase 6. The inputs survive because D3 retains snapshots — the methodology decision does not, unless it is made in Phase 4 | Parent §6.1, §6 |
| I6 | **The contingent liquidity charge is a required FTP component.** Undrawn commitments consume LCR and NSFR while generating no funding need; charging nothing for them is the most reliable way to damage a ratio through internal pricing | D10 §2.2, §9 |
| I7 | **FTP transfer contracts are not D9 §2's internal hedges.** Similar names, different objects: one allocates within the banking book, the other crosses the trading/banking boundary and carries a recognition test | D9 §2 |
| I8 | **Option cost transfers D9's prepayment work into pricing.** D9 §6.2 identifies prepayment as an option the bank has sold; without an FTP charge the bank underprices its prepayable book with no decision having been taken | D9 §6.2 |
