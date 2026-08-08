# D6 — Collateral & Securities Financing

Repo and reverse repo, securities lending and borrowing, tri-party, haircuts, margining and margin
calls, collateral optimisation and substitution, central bank collateral pool management, and **the
encumbrance register**. Parent: `treasury-alm-risk-platform`. Phase 4, **except the encumbrance
register, which is Phase 0** (ticket `P0-10`).

**Why this module is unlike the others in Phase 4.** D4, D5 and D7 are bought, integrated and switched
on. D6 is bought, integrated and switched on **around a component that has already been running in
production for two or three years** — the minimal encumbrance register pulled into Phase 0 for two
independent reasons (parent §7 for HQLA, §4.1 for the three-way custodian reconciliation). Nothing else
in Phase 4 has that shape.

**Why that matters more than it sounds.** Encumbrance is not a D6 output that D6 consumes. It is an
input to **regulatory classification** (D2 §2.3, `classification-rules-engine` §5), which means it is an
input to HQLA, to LCR, to NSFR's RSF weighting, and to the balance sheet's liquidity presentation. By
the time full D6 arrives, four modules and two years of reported ratios depend on the register's
contents and on its history being replayable. **The migration is therefore not a data migration. It is
a change of control over a number the bank has already reported to a regulator.** §4 is written around
that.

## 1. Responsibilities

**D6 owns:** the encumbrance register and its history; securities financing lifecycles — repo, reverse
repo, securities lending and borrowing, collateral swaps, tri-party; haircut application; margining and
the margin call workflow; collateral eligibility evaluation against agreement schedules; collateral
optimisation and substitution; central bank collateral pool management; **origination of Contracts for
central bank facility drawings** (parent §1.7); and the collateral movement history that feeds the LCR
look-back.

**D6 does not own:** the Contract and Balance store (D2); the recognition rules themselves (D2 §2.9 — D6
applies them, D7 owns the derecognition assessment behind them, §5.1); legal agreement terms (D1 §3.8 —
D6 consumes threshold, MTA, eligible collateral schedule, haircuts and rehypothecation rights);
valuation of collateral (D8); HQLA classification (D10 and the classification rules engine — D6 supplies
encumbrance as an input and does not decide eligibility); custodian and tri-party feed adaptation and
reconciliation (D16); payment execution for cash margin (D5).

**The boundary that is easiest to get wrong:** D6 states *what is encumbered, by whom, under what, and
until when*. It never states *what is HQLA*. A D6 implementation that carries an `is_hqla` flag has
absorbed a rule that belongs to a versioned, effective-dated rule set owned elsewhere, and the two will
diverge.

## 2. The encumbrance register

### 2.1 Encumbrance is an allocation, not a flag

**The single most common modelling error in this module is `encumbered: boolean` on a position.** It is
wrong in four ways at once, and each one shows up as a wrong ratio rather than as an error:

- **Partial encumbrance is the normal case.** A 100m holding with 30m pledged is 70m unencumbered and
  HQLA-eligible. A boolean forces the whole line in or out of the buffer
- **One holding can be encumbered to several beneficiaries** under different agreements with different
  end dates — and NSFR weights by **residual encumbrance duration** (D10 §319), so the durations cannot
  be collapsed
- **A beneficiary and an agreement are required to answer anything**, including whether the encumbrance
  survives a counterparty default and whether the central bank would accept the residual
- **It has no time dimension**, so last Tuesday's HQLA cannot be reproduced (§2.4)

**The grain is therefore the allocation:** *(holding, quantity, beneficiary, agreement, purpose, valid
from, valid until)*. Encumbrance of a position is the sum of its allocations; unencumbered quantity is
the holding less that sum.

**One hard invariant, enforced at write time:** the sum of allocations against a holding may never
exceed the holding. Over-allocation is not a data quality warning to be aged in a break register — it
is a direct overstatement of pledged assets or, read the other way, a silent understatement of the HQLA
buffer. It is rejected, not reported.

### 2.2 Encumbrance is not only securities financing

A register scoped to repo and stock lending will be materially incomplete on day one. The full source
list, with the ones most often missed marked:

| Source | Object encumbered | Note |
|---|---|---|
| Repo, securities lent | Security position | The obvious cases |
| Tri-party basket allocation | Security position | Agent-determined, not platform-determined (§2.5) |
| Variation and initial margin posted | Security position or cash Balance | CSA-driven. **Cash margin posted encumbers a Balance, not a security** |
| Central bank pool pre-positioning | Security position | **Encumbered when pre-positioned, before any drawing** — capacity is not free collateral |
| CCP default fund contribution and initial margin | Cash Balance or security | Easily missed; it is not a trade |
| **Mandatory central bank reserves** | Cash Balance | **`part2-taxonomy-mapping` A.1: encumbered by definition and generally HQLA-ineligible.** A Balance needing an encumbrance attribute — the design originally gave encumbrance only to securities |
| **Covered bond cover pool** | Loan or security positions | If the bank issues covered bonds. Encumbers assets that never move and never appear in any SFT feed |
| **Failed derecognition — own securitisation** | Loan positions | Parent Appendix D signal 3. The assets are on balance sheet and encumbered to the noteholders |
| Restricted cash, escrow, legal attachment | Cash Balance | Low volume, high embarrassment |

**Two structural consequences.** First, **encumbrance applies to Balance objects as well as Contracts**
(D2 §253) — cash margin, mandatory reserves and CCP contributions are all Balances. Second, several
sources have **no transaction feed at all**: a cover pool and a pre-positioned central bank portfolio
are standing states maintained by an operations process, not events arriving from a counterparty. The
register needs a way to record an encumbrance that no feed will ever assert or retract, and a review
cycle for it, or it will quietly go stale in the direction that overstates HQLA.

### 2.3 Collateral received, rehypothecation, and chains

Received collateral is where registers designed around ownership break.

| State | On balance sheet? | In the register? |
|---|---|---|
| Security received under reverse repo, not re-pledged | **No** — not recognised (D2 §2.9) | Yes — as an available, non-owned collateral resource, HQLA-eligible **if eligible and rehypothecable** |
| Security received and re-pledged onward | No | Yes — **as an encumbrance against an asset the bank does not own** |
| Security lent out against non-cash collateral | Yes, encumbered | Both sides: own position encumbered, received collateral available |

**So the register holds encumbrances against non-owned assets, and it holds chains.** A security
received under a reverse repo and re-pledged to a central bank is simultaneously not on the balance
sheet, not HQLA (it is now encumbered), and a real obligation to return. `part2-query-specification` §5
records the balance sheet expression of this — **securities borrowed against non-cash collateral show
nil carrying amount on A.7 with a real encumbrance and a real HQLA consequence: an orphan that looks
like a correctly-empty line.**

**Rehypothecation right is an agreement term, not a position attribute** (D1 §3.8). The register stores
the right's *application* — this specific collateral was re-pledged — and reads the right itself from
the CSA or GMRA. Storing the right on the position duplicates D1 and will drift from it.

### 2.4 The register is bitemporal, and this is not optional

**Requirement: every encumbrance allocation carries valid time (when the pledge was effective) and
system time (when the platform learned of it), and the register answers "what was encumbered as of date
D, as known on date K".**

Three separate obligations force it, and no cheaper design satisfies any of them:

1. **Reproducibility (parent §2.5, §5).** Classification is recomputed on encumbrance change. The
   regeneration test — pulled forward to Phase 1 — must reproduce a historic classification, which is
   impossible if the register only holds current state
2. **Late and retroactive assertions are routine, not exceptional.** A tri-party agent's report arrives
   the following morning and is effective yesterday. A margin dispute resolves three days later with a
   backdated adjustment. If the register overwrites, yesterday's HQLA silently changes and no report
   agrees with itself
3. **The three-way custodian reconciliation (D16 §5.4) compares as-of a date.** Reconciling today's
   register against a statement dated yesterday manufactures breaks that are artefacts of the register's
   design

**A current-state-only register is the design that must be actively resisted**, because it is what every
implementer will build first, it works fine in testing, and the failure only appears when someone asks
why last quarter's LCR cannot be reproduced.

### 2.5 Provenance and authority

Parent §5 (E5) makes provenance a platform NFR for market data. **The same requirement applies to
encumbrance, for the same reason**, and one row of it is already established:

| Authority | Meaning | Example |
|---|---|---|
| **Externally asserted, authoritative** | The external record is definitionally correct; the platform holds a copy | **Tri-party basket allocation** (D16 §114 — the only feed where this is true) |
| Externally asserted, reconcilable | External record, but the platform can disagree and raise a break | Custodian pledge status, CCP margin statement |
| Platform asserted | Created by a platform decision or booking | Repo booked in D4, pool drawing originated in D6 |
| **Operationally maintained** | Standing state with no feed, held under a review cycle (§2.2) | Cover pool, pre-positioned central bank portfolio |

Encumbrance provenance must survive into the HQLA number the same way market data provenance survives
aggregation: **how much of the unencumbered buffer rests on operationally-maintained or stale
externally-asserted state should be a query, not an investigation.**

## 3. What P0-10 delivers, and the gap to full D6

`P0-10` is deliberately minimal — a register, not collateral management. Stating the delta precisely is
what makes §4's migration tractable.

| Capability | Phase 0 (P0-10) | Full D6 (Phase 4) |
|---|---|---|
| Encumbrance allocations, queryable per position | **Yes** | Unchanged |
| Beneficiary, agreement reference, duration | **Yes** | Unchanged |
| Recognition rules applied (repo/reverse repo/lending) | **Yes** | Unchanged |
| Collateral leg flags — `creates_position`, `encumbers`, `rehypothecable` | **Yes** | Unchanged |
| Tri-party baskets as baskets, not ISIN lists | **Yes** — ingested | Plus substitution and agent instruction |
| Event publication triggering intraday classification recompute | **Yes** | Unchanged — **and this is the constraint on the vendor** (§4.3) |
| Central bank pool contents at register level | **Yes** | Plus pool management, pre-positioning workflow, capacity monitoring |
| Contract origination for facility drawings | Sufficient for it | Full |
| Haircuts | **Stored as applied** | **Calculated** from agreement schedules and market data |
| Margining, margin calls, disputes | **No** | Yes |
| Collateral eligibility evaluation | **No** — eligibility is read from the arriving record | Yes, against D1 schedules |
| Optimisation and substitution | **No** | Yes (§7) |
| Collateral movement history | **No** — the pre-Phase-0 workstream owns it | **Takes ownership** (§4.5) |
| Corporate actions on collateral, elections | **No** (D16 §125 — ops election belongs to D4/D6, not Phase 0) | Yes |
| Manufactured payments on lent securities | **No** | Yes (§5.3) |

## 4. The Phase 0 → Phase 4 migration

**The least-specified part of Lot 1, and the part where a bought package does most damage.**

### 4.1 The decision

**The platform's encumbrance register remains the register of record through and after Phase 4. A
bought collateral package is the operational engine and publishes allocations into it.**

This is the same shape as non-negotiable N1 in `phase4-front-to-back-buy-evaluation` (D2 remains system
of record), and it is justified independently rather than by analogy:

- **Encumbrance is a classification input.** HQLA eligibility, LCR, NSFR RSF weighting and the balance
  sheet's liquidity presentation all key off it. Letting a vendor system be authoritative puts a
  reported regulatory ratio's primary input outside the platform's versioning, provenance and
  regeneration guarantees
- **The register is bitemporal and replayable (§2.4); collateral packages are current-state operational
  tools.** Vendor products are built to answer "what must I call for this morning", not "what was
  encumbered on 30 June as known on 3 July"
- **Three Phase 0–3 consumers already depend on it** — the classification engine, D10's ratios, and the
  three-way custodian reconciliation. Repointing all three at a vendor store in Phase 4 re-tests two
  years of production behaviour for no gain
- **§2.2's sources are wider than any collateral package's scope.** Mandatory reserves, cover pools and
  failed-derecognition securitisations are not SFTs and will never appear in a collateral system

**The cost, stated as §3.1 of the buy-evaluation artifact states its equivalent:** a permanent
package-to-register reconciliation, and a vendor operating against a register it does not own. This is
the second such reconciliation Phase 4 introduces and it should be budgeted alongside the first.

### 4.2 The alternative, and why it is rejected

Letting the package's register become authoritative and retiring P0-10 is the option a vendor will
propose, and it is cheaper on the day. It is rejected because it makes the HQLA number a function of a
system outside the regeneration test, and because the cutover then has to move history (§4.4) rather
than just responsibility. **If it is chosen anyway** — a legitimate commercial outcome — then three
things become mandatory rather than desirable: the package satisfies §2.4's bitemporality, it accepts
§2.2's non-SFT encumbrance sources, and it meets §4.3's freshness contract. A candidate meeting all
three is rare enough that the evaluation should treat the claim with §7.1's evidence rule.

### 4.3 The freshness contract — the constraint that eliminates candidates

**`P0-06` acceptance criterion 8: an intraday encumbrance change reflects in HQLA composition within
the treasury book's freshness expectation.** Classification recompute is triggered by an encumbrance
event, intraday — one of the seven recompute triggers.

**A collateral package that publishes its state as an end-of-day file breaks this.** Not degrades it —
breaks it, because the trigger stops firing and HQLA becomes a batch number that happens to be labelled
intraday. This is a concrete, testable RFI question and it belongs in the Lot 1 screen:

> Does the package publish each collateral allocation change as a discrete event, at the time of the
> change, with effective and system timestamps — or does it produce a periodic position file?

Two qualifications keep the requirement honest. **Tri-party is exempt by nature**: the agent's daily
report is authoritative and arrives when it arrives, so basket encumbrance is a daily fact and is
stamped as such (§2.5). And **the freshness expectation is the treasury book's, not a general one** —
parent §3 already fixes the banking book as as-of last night, and a per-source freshness stamp on every
position response is an existing platform requirement, not a new one.

### 4.4 Cutover — state, not events

**Encumbrance is a standing state, so cutover cannot be done by replaying events from a date.** At the
moment of cutover there is an open population — every live repo, every pledged basket, every
pre-positioned security, every posted margin balance — and each open allocation must land in the new
operational engine with its agreement, beneficiary and end date intact.

**The error direction is asymmetric and should drive the plan.** A missed encumbrance makes an asset
look free: the HQLA buffer is overstated and the LCR reads high. An invented encumbrance understates
the buffer, which is embarrassing but conservative. **Design the cutover to fail conservatively** —
where an open allocation cannot be confidently matched, it stays encumbered until proven otherwise, and
the residue is worked off as a break rather than assumed away.

**Sequence:**

1. **Parallel run before cutover.** Package and register both maintained, with a daily three-way
   comparison — package allocations, register allocations, custodian and tri-party statements. This is
   D16 work using the existing break register, not a new tool
2. **A stated convergence bar**, agreed before cutover begins: zero unexplained allocation differences
   on a rolling five business days, and the HQLA buffer derived from each source agreeing within a
   threshold set by treasury. Not "the team is comfortable"
3. **Cutover is a change of writer, not a change of store.** The register keeps receiving; the source of
   its writes changes from the Phase 0 adapters to the package. Because the register is bitemporal, the
   changeover is itself a recorded fact and pre-cutover history remains queryable on its original terms
4. **The Phase 0 ingestion adapters stay alive through parallel run and are retired explicitly**, with
   a named date, not left running until someone notices

**One deliberate non-goal: no back-loading of history into the package.** The package needs the open
population, not two years of closed allocations. History lives in the register, which is where every
consumer already reads it.

### 4.5 Two things that must be carried forward, and are easy to strand

**The collateral movement history from the pre-Phase-0 workstream.** `d10-liquidity-and-funding` §3.6
starts a seven-field movement log *now*, outside the platform, with a named daily owner, plus a
backward reconstruction from nostro, counterparty and custodian statements. That series exists to feed
the LCR's 24-month collateral outflow look-back. **When full D6 arrives it becomes the owner of that
series** — the log stops being a spreadsheet and becomes a D6 feed, and the reconstructed history must
migrate with it. Nobody's Phase 4 plan will contain this unless it is written down, and the failure mode
is a look-back window that restarts at Phase 4 with two years of usable history discarded.

**The three-way reconciliation's dependency on register semantics.** D16 §5.4 reconciles platform
positions, custodian holdings and *the encumbrance and financing register that explains the difference*.
If the package changes what an allocation means — grain, timing, how a substitution is represented — the
reconciliation's explanatory leg changes underneath it and the break register fills with artefacts.
**Any change to allocation semantics is a change to D16 and must be regression-tested against it.**

## 5. Securities financing lifecycles

### 5.1 Recognition — applied here, owned elsewhere

D2 §2.9 states the rules and D7 §5 owns the derecognition assessment behind them. D6 applies them:

| Transaction | Own position | Received asset | Encumbrance |
|---|---|---|---|
| Repo (securities out) | **Not derecognised**, remains a Position | Cash is a Balance; the repayment obligation is a Contract | Allocation against the security |
| Reverse repo (securities in) | — | **Not recognised**, but **HQLA-eligible if eligible and rehypothecable** | None unless re-pledged (§2.3) |
| Securities lent | Remains a Position, encumbered | Cash or non-cash collateral | Allocation. **No explicit Part 2 line** (D2 §10) |
| Securities borrowed vs non-cash | — | Not recognised | Own collateral posted is encumbered — **nil carrying amount, real encumbrance** |
| Collateral swap | Both legs remain | **No cash leg** | Two allocations plus a fee leg. Off balance sheet with an encumbrance memo |
| Tri-party repo | Remains a Position | — | **Basket allocation, agent-determined and authoritative** |

**The asymmetry is the trap** (P0-10 notes): getting repo-out or reverse-repo-in wrong either
double-counts HQLA or loses it, and both are material to the ratio.

### 5.2 Terms the lifecycle must carry

Open repo (no fixed maturity, callable by either side) versus term; fixed, floating and open rate
treatments; initial margin and haircut, distinguished — a haircut reduces the collateral's counted
value, an independent amount is a separate posting; substitution rights and their exercise; partial
returns and re-rates; and **fails**, including buy-in and the fail's effect on both the position and the
encumbrance.

**Term repo maturing inside the LCR window is an outflow; open repo is not, but is callable.** The
distinction is a lifecycle attribute D10 reads directly, and it is also what the Level 2/2B cap unwind
needs (D10 §3.5).

### 5.3 Manufactured payments and corporate actions

**Absent from every upstream artifact and material.** A coupon or dividend on a security that has been
repo'd out or lent is received by the holder-in-name and passed back as a **manufactured payment**. The
bank retains the economics — the security was never derecognised — so:

- The **contractual cashflow still projects from D2**, but the cash arrives by a different route and from
  a different party, which is a settlement and reconciliation difference, not an economic one
- Manufactured payments can have **different tax treatment** from the underlying coupon, including
  withholding. This is a genuine tax question, not a systems question, and it needs an answer before D6
  is configured
- **Corporate actions on collateral** — voluntary elections in particular — are an operations process
  split between D4 and D6 (D16 §125). Who elects on a security that is lent out is an agreement term,
  and the election window is a hard deadline that no batch process will meet on its own

### 5.4 CCP and cleared securities financing

Cleared repo and CCP-cleared SFTs change the counterparty to the CCP, replace bilateral margin with CCP
margin and default fund contributions, and change the netting set (D1 §3.8). **Default fund
contributions are encumbered cash or securities that are not associated with any trade** (§2.2) and are
routinely missed by registers built around trade-level thinking.

## 6. Margining and margin calls

Phase 4. Driven entirely by D1 §3.8's agreement terms — threshold, minimum transfer amount, independent
amount, eligible collateral schedule with haircuts, call frequency, valuation agent, dispute resolution
— which is why `counterparty-documentation-workstream` is a hard dependency and why it already moved
forward to a Phase 2 deadline for a different reason (parent E1).

**Requirements the platform's own architecture imposes on this workflow:**

- **Exposure comes from D8, not from the package.** Margin calls are computed against platform
  valuations, or the bank has two views of its own derivative exposure. The vendor's pricing may drive
  the vendor's screens; it does not drive the call
- **A call generates a D5 payment or a D6 securities movement**, and both produce encumbrance
  allocations. The call, the movement and the allocation are one chain and must be traceable end to end
- **Disputes are first-class and are the normal case, not the exception.** A disputed call has a
  contested amount, an agreed undisputed portion that still moves, and an ageing clock
- **Every margin movement writes to the collateral movement history** (§4.5), because that series is the
  LCR look-back's input from Phase 4 onward

**Initial margin under the uncleared margin rules is out of scope — variation margin only** (§12
decision 8). This is the largest single reduction in the module: no IM calculation model, no segregated
custody, no IM-specific eligibility schedule or dispute process. **And margining still re-points rather
than disappearing** — under client clearing (§12 decision 9), cleared exposure margins through the
clearing broker, whose agreement terms and eligibility schedule apply like any other counterparty's.

## 7. Optimisation and substitution

The most valuable Phase 4 capability and the one most likely to be misconfigured.

**Collateral optimisation chooses what to deliver against an obligation.** The naive objective is
funding cost: deliver the cheapest eligible asset. **That objective is wrong here, and the reason is
structural** — delivering an HQLA-eligible security encumbers it and removes it from the buffer, moving
the LCR. An optimiser blind to that will systematically pledge the bank's best liquid assets because
they are the most widely eligible and therefore the cheapest to deliver.

**Requirement: the optimiser's objective function includes the liquidity consequence** — the LCR and
NSFR impact of each candidate allocation alongside its funding cost, with the relative weighting a
**versioned treasury policy parameter held in D1**, because where cost and liquidity conflict the
resolution is governance rather than engineering.

**Now drawn in the parent map — parent revision 2.8, Appendix L.** It resolves into two edges rather
than one, and the decomposition matters here because it decides what this module executes versus what it
asks for:

- **`D13 → D6` is a rule edge.** HQLA eligibility, level assignment and the LCR/NSFR factor sets are the
  versioned rule sets D2 and D10 already execute, and **D6 becomes a third executor of them**. The
  optimiser therefore cannot work from a different definition of HQLA than the ratio it is protecting —
  which is the failure this requirement exists to prevent
- **`D10 → D6` is a read-only query edge**, carrying only what no rule can supply: **current buffer
  composition and whether the Level 2 and 2B caps are binding.** The optimiser **may not store the
  score**; each allocation decision instead records the policy version, market snapshot and ratio state
  it was taken against, so the decision is reproducible after the fact even though its input was not

**Two consequences of the cap structure.** Scoring is **joint over the candidate set, not per-asset** —
the caps constrain buffer composition, so pledging one asset changes the next one's marginal cost, and
score-once-then-sort is wrong exactly when a cap binds. And if optimisation runs as an **overnight
batch stage** it closes a cycle in D17's DAG (`liquidity metrics → optimisation → encumbrance →
classification → liquidity metrics`); the remedy is the prior-day ratio state, matching the callable-book
convention in parent §3.

**Substitution must preserve history.** Replacing collateral A with collateral B closes one allocation
and opens another; it does not edit an allocation in place. In a bitemporal register this is automatic
if the model is right and impossible to reconstruct if it is not — and the LCR look-back reads the
resulting movements as two flows, which is what they are.

## 8. Central bank pool and Contract origination

**The D6 → D2 boundary inversion** (parent §1.7). A marginal lending facility drawing or a refinancing
operation (Part 2 B.1) is created from collateral pool state, not booked by a dealer, so the normal
D4 → D2 flow inverts.

Three requirements follow:

1. **Pre-positioned collateral is encumbered before any drawing exists** (§2.2). Pool capacity is the
   post-haircut value of pre-positioned assets, and reporting it as available liquidity while also
   counting those assets in the HQLA buffer double-counts
2. **Origination must satisfy the same controls as a booking** — four-eyes through the D15 control core,
   full audit, and complete classification on the originated Contract. An origination path that bypasses
   the controls a booking passes is a control gap with an operational excuse
3. **Central bank eligibility is a distinct schedule** from CSA eligibility, with its own haircuts and
   its own update cycle, and it is set by the central bank rather than negotiated. It is D1 reference
   data, versioned and effective-dated like the rest

**Committed liquidity facilities received have no balance sheet anchor** (parent Appendix A.9, B) and
need a separate register — related to the pool but not the same thing, and one of the twelve taxonomy
extension items in §9.

## 9. The taxonomy gap D6 is expected to fill

`part2-query-specification` §5: **Part 2 section D covers commitments, guarantees, LCs and contingent
liabilities only. There is no encumbrance or collateral memorandum block at all**, and both encumbrance
and collateral received are required inputs to LCR and NSFR.

**D6 supplies the content; the taxonomy needs the block.** This is one item within the twelve-item
taxonomy extension that artifact recommends handling as a single accounting-policy conversation rather
than twelve separate questions. The block needs, at minimum: assets pledged by type and beneficiary
class, encumbrance residual duration bands (for NSFR), collateral received split by whether it may be
re-pledged and whether it has been, and the unencumbered HQLA-eligible balance the LCR actually uses.

## 10. Interfaces

**Inbound.** D1 — legal agreements, CSA/GMRA/GMSLA terms, netting sets, eligible collateral schedules,
haircuts, rehypothecation rights, central bank eligibility schedules. D2 — positions, Contract and
Balance events. D8 — valuations for margin computation and collateral valuation. D16 — custodian,
tri-party agent, CCP and counterparty statement feeds. D10 — **liquidity consequence inputs to the
optimiser** (§7). D3 — prices and FX via D8.

**Outbound.** **Encumbrance allocations and events to D2 and the classification rules engine**, intraday
(§4.3). Originated Contracts to D2 (§8). Collateral positions to D7 for derecognition assessment (D7
§8). Encumbrance and financing state to D16 as the third leg of the custodian reconciliation. Margin
movements to D5 for payment. Collateral movement history to D10's LCR look-back. Pool capacity and
encumbrance ratio to D10's internal metrics.

### 10.1 A correction to the parent's edge model

**Parent §1 draws two edge classes — data flow upward, rule and definition flow downward — with the
design rule that a downward edge may carry only versioned, effective-dated definitions, never live
computed values, and that "if a downward edge ever needs to carry a computed result, the boundary is
wrong."**

`D6 -. encumbrance .-> D2` is drawn as a downward rule edge. **It is not a rule.** Encumbrance is an
observed state — sometimes asserted by an external agent whose record is definitionally correct (§2.5) —
flowing from an L3 module into an L2 one. It is neither a versioned definition nor a computed result,
so it satisfies neither the permission nor the prohibition, and the stated safety rule does not
constrain it.

**Proposed: a third edge class — state flow — with its own safety rule.** A state edge may carry
observed facts, and is safe when the state is (a) event-published with effective and system timestamps,
(b) bitemporally queryable so any historic recompute is reproducible, and (c) provenance-tagged with its
authority. That is precisely §2.4 and §2.5, which means the requirement already exists in this spec and
what is missing is the parent's acknowledgement that this edge is a different kind of thing.

Only one other edge in the parent map is of this class — nothing else carries observed state downward —
so this is a small correction, but it removes a case where the blueprint's own design rule appears to be
violated by a dependency the blueprint itself requires.

## 11. Acceptance criteria

1. Encumbrance is an allocation with quantity, beneficiary, agreement, purpose and duration — **not a
   boolean** — and the sum of allocations against a holding can never exceed it
2. All of §2.2's sources **that apply to this bank** are representable — cash-Balance encumbrance,
   mandatory reserves, pre-positioned central bank collateral, restricted and escrowed cash, and any
   assets behind a failed securitisation derecognition. **CCP default fund contributions and cover pool
   encumbrance are out of scope per §12 decisions 9 and 11**; the model should still accommodate them,
   since both arrive with a change of clearing or funding strategy rather than with a system change
3. The register is **bitemporal** and answers "encumbered as of date D, as known on date K", so a
   historic classification and a historic HQLA buffer are reproducible under the Phase 1 regeneration
   test
4. Encumbrance carries provenance and authority, and the proportion of the unencumbered buffer resting
   on operationally-maintained or stale external state is queryable
5. Collateral received is registered without being recognised, re-pledging is representable as an
   encumbrance against a non-owned asset, and rehypothecation right is read from D1 rather than stored
6. Every encumbrance change publishes an event that triggers intraday classification recompute within
   the treasury book's freshness expectation — **preserved across the Phase 4 migration** (§4.3)
7. Recognition follows D2 §2.9 in both directions, with no double-counted or lost HQLA
8. Tri-party baskets are baskets referencing an eligibility schedule, the agent's record is
   authoritative, and the platform's copy is reconciled rather than asserted
9. The three-way custodian reconciliation resolves repo, reverse repo and stock lending differences to
   *expected*, and allocation semantics are regression-tested against D16 whenever they change
10. Facility drawings originate Contracts in D2 under the same four-eyes, audit and classification
    controls as a booking, and pre-positioned collateral is encumbered before any drawing exists
11. Margin calls compute against D8 valuations; disputes carry a contested amount, an undisputed portion
    that still moves, and an ageing clock; every movement writes to the collateral movement history
12. The optimiser's objective includes the LCR and NSFR consequence of each candidate allocation, with
    the weighting a versioned treasury policy parameter
13. Substitution closes and opens allocations rather than editing in place, and reads through the look-back
    as two movements
14. Cutover meets a stated convergence bar, fails conservatively on unmatched allocations, and the
    pre-Phase-0 collateral movement series migrates into D6 rather than restarting

## 12. Resolved decisions

| # | Question | Decision |
|---|---|---|
| 1 | Encumbrance grain | **Quantity allocation keyed on beneficiary, agreement and duration.** Never a position-level boolean. §2.1 |
| 2 | Register of record after Phase 4 | **The platform's register remains authoritative; a bought package is the operational engine and publishes into it.** Justified by classification dependency, bitemporality and scope breadth, at the cost of a permanent package-to-register reconciliation. §4.1, §4.2 |
| 3 | Temporality | **Bitemporal.** Forced independently by reproducibility, retroactive assertions, and as-of reconciliation. §2.4 |
| 4 | Tri-party authority | **The agent's report is authoritative; the platform holds the copy.** The one feed where this is definitionally true. §2.5 |
| 5 | Cutover error direction | **Fail conservatively** — unmatched open allocations stay encumbered. Overstating the buffer is the wrong way to be wrong. §4.4 |
| 6 | Optimiser objective | **Includes the liquidity consequence**, not funding cost alone, with a versioned weighting. §7 |
| 7 | Parent edge model | **A third edge class — state flow — is proposed**, with encumbrance as its only instance. §10.1 |
| 8 | **UMR initial margin** | **Out of scope — variation margin only.** No IM calculation model, no segregated IM custody, no IM eligibility schedule or dispute process. **The largest scope reduction available in Phase 4**, and it lands entirely on this module |
| 9 | **CCP membership** | **Client clearing only, via a broker.** No default fund contributions, no direct CCP margin, no distinct CCP netting-set population. Margining still exists — it re-points to the clearing broker, whose agreement terms and eligibility schedule apply |
| 10 | **Rehypothecation** | **Received collateral is held, not re-used.** §2.3's chains are latent rather than day-one. **But see question 3a** — practice is settled and the underlying *right* is not, and the right is what decides HQLA |
| 11 | **Covered bond cover pool** | **No programme.** Removes the largest standing encumbrance source with no transaction feed, and the pool monitoring obligation |

## 13. Open questions

**Four of the original seven are now answered**, and all four narrowed scope. They are recorded as
decisions 8–11 in §12 rather than deleted, since each removes capability that would otherwise be
specified and paid for. One raised a new sub-question, which is question 3a below.

3a. **Does the bank hold the *right* to re-use received collateral, even though it does not exercise it?**
   **Raised by the answer to question 3, and it is the more important half.** *"We do not re-use"* and
   *"we have no right to re-use"* have **opposite** HQLA consequences: securities received under reverse
   repo count toward the buffer only where the right exists and has not been exercised, and not at all
   where the agreement withholds it. Question 3 answered practice; this asks about the term. Answerable
   from `counterparty-documentation-workstream`, which already extracts rehypothecation rights as
   structured data. **Until it is answered the platform excludes**, because the error being avoided is
   over-counting HQLA. **This is a Phase 1 question, not a Phase 4 one** — it changes the LCR.
5. **Manufactured payment tax treatment**, including withholding on manufactured dividends (§5.3). A tax
   question that must be answered before D6 is configured, not after.
6. **Which central bank facilities are used, and is collateral pre-positioned as standing practice?**
   Determines whether §8's pool is a live daily process or an emergency capability, and how much
   standing encumbrance exists outside any trade.
7. **Own securitisation derecognition** — the same question as parent Appendix D signal 3 and D7 §11.6.
   If derecognition fails, the underlying assets are on balance sheet and encumbered to the noteholders,
   which is an encumbrance source with no feed and material size.
