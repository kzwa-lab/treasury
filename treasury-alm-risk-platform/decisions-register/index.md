---
kind: spec
title: "Decisions Register — by owner and deadline"
---

# Decisions Register

Every outstanding bank decision across Phases 0–7, cut by **who decides** and **when it is needed**.

Parent: `treasury-alm-risk-platform`. **Decision numbers are inherited unchanged from
`phase-breakdown-readiness` §3**, which organises the same inventory by the phase it gates. That
artifact answers *"what is blocking Phase N"*; this one answers *"what am I being asked to decide, and
by when"* — the form you can hand to an owner.

**This artifact amends nothing.** It is a re-cut of existing content plus owner and deadline
assignments, which did not previously exist.

---

## 1. The four that go first

These four lead not because they are the hardest but because each is **factual or near-factual, has the
longest lead time, and fans out across multiple phases.** None needs engineering input. All four can be
put to their owner this week.

### 25 — Group structure · **Board**

**The question:** does the bank have subsidiaries, securitisation vehicles or foreign operations that
consolidate? Four independent signals in the bank's own taxonomy say yes; the scope decision says single
entity. Both cannot be right.

| | |
|---|---|
| **Signals** | A.9 investments in associates and subsidiaries · C.6 non-controlling interests · B.6 own securitisation notes on balance sheet · C.4 foreign currency translation reserve |
| **Fans out to** | D2's entity model · D7's net investment hedging and the FX translation reserve · D13's entire consolidation and reporting scope · D6's collateral scope |
| **Deadline** | **Now.** It is the largest scope variable in Phase 6 and it changes the Phase 0 data model if answered late |
| **Cost of deferral** | Retrofitting a legal entity dimension means backfilling every historic contract — often unknowably — and putting a permanent hole in the reproducibility guarantee |

**Note the asymmetry that makes this urgent rather than merely important:** carrying the entity field
costs one column now. Adding it later is a restatement, not a migration.

### 21 — Trading book size · **Treasury**

**The question:** how large is the trading book, in positions and in risk?

| | |
|---|---|
| **Fans out to** | Phase 5's entire sizing · the risk analytics procurement · whether a full market risk build is warranted at all |
| **Deadline** | **Now.** Phase 5 cannot be sized without it, and the Phase 5 procurement ticket says it should be settled *before* that ticket runs |
| **Cost of deferral** | A risk analytics procurement scoped against an unknown book, which is how banks buy capability they never use |

Factual and answerable today. If the trading book turns out to be small and simple, the Phase 5 build
shrinks materially — which is worth knowing before the procurement, not after.

### 12 — Is CSRBB in scope? · **Risk, with ALCO**

**The question:** does the bank measure credit spread risk in the banking book as a distinct risk?

| | |
|---|---|
| **Fans out to** | **One answer, three artifacts** — D9 q4 (the measure), D3 q4 (whether spread curve infrastructure is needed), D14 q6 (whether spread scenarios exist). Plus D13, since CSRBB is a *capital* measure: spread moves on the FVOCI portfolio flow through OCI into CET1 without ever appearing in P&L |
| **Deadline** | **Before the Phase 3 breakdown**, but the D3 consequence lands earlier — spread curve infrastructure is a Phase 0/1 scoping question |
| **Cost of deferral** | Three artifacts stay conditional, and the Phase 3 ticket set cannot be written |

The highest-leverage of the eight remaining open amendment refs (`D3-3`). One answer discharges three.

### 32 — Independent model validation: does the function exist, and how is it sourced? · **Executive, with Risk**

**The question:** is there an independent model validation function, and if not, how is validation
sourced — an internal function, an external firm, or rotating peer review?

| | |
|---|---|
| **Fans out to** | Every phase from 0 onward |
| **Deadline** | **Now — and this is the item most likely to be misfiled as "Phase 7"** |
| **Cost of deferral** | A validation function arriving in Phase 7 validates nothing for six years and then inherits a portfolio of unapproved production models |

**Why the deadline is Phase 0 despite the ticket sitting in Phase 7.** `d15-model-governance` J1/J2
established that model governance **accretes from Phase 0** — models arrive from the first phase, and
validation-before-first-use is only achievable if a validator exists when the first model does. The
Phase 7 label is a residue of the original phasing and the phase table has not caught up.

**It is a budget and hiring decision, not a build decision** (`D15-13`), which is precisely why it has a
long lead time and why it belongs in this group. The scarcity problem is real at this bank's size: genuine
independence is hard when the modeller and the validator are the same two people in rotation.

---

## 2. Register by owner

Status: **Open** unless marked. Deadline classes are defined in §3.

### Board

| # | Decision | Deadline |
|---|---|---|
| **25** | **Group structure — the four Appendix D signals** | **Now** |
| 26 | Standardised or IRB for credit risk *(with Regulatory Reporting)* | Before Phase 6 sizing |
| — | Endorse staged funding with a decision point per phase | Before Phase 1 execution |

### ALCO

| # | Decision | Deadline |
|---|---|---|
| 6 | **EOD window and degradation order — sign-off** | Before Phase 1 execution |
| 4 | Who approves internal stress scenarios, and the approval workflow | Before Phase 1 execution |
| 12 | **CSRBB scope** *(with Risk)* | Before Phase 3 breakdown |
| 28 | Does the bank want FTP at all — matched-maturity or pooled? | Before Phase 6 |
| 18 | FTP methodology settled | Phase 4 clock |
| — | Ratify the hedge accounting approach and its CET1 consequence | Before Phase 4 |

### Finance

| # | Decision | Deadline |
|---|---|---|
| 20 | **Which GL is authoritative, and its posting interface** — contract-level or summary | **Before Phase 0 wave 2** — see §4 |
| 29 | IFRS 9 transitional arrangements; is the fair value option used? | **Split** — FVO before Phase 0 rule authoring; transitionals before Phase 6 |
| 11 | Snapshot timing convention and restatement policy *(with Risk)* | Before Phase 1 execution |
| 16 | CVA-free fair value policy between Phases 4 and 5 *(with Risk)* | Before Phase 4 |
| 1 | Three taxonomy policy elections | **Settled** |
| — | Confirm the trade-date election against existing accounting policy | **Now** — five minutes, and it may override a settled decision |
| — | Author the interim accounting classification rule set *(P0-15)* | **Now** |

### Treasury

| # | Decision | Deadline |
|---|---|---|
| **21** | **Trading book size** | **Now** |
| 5 | **Collateral log ownership and statement-request authority** | **Now — bleeding** |
| 17 | Uncleared margin rules — is the bank in scope for initial margin? | Before Phase 4 procurement |
| 19 | Rehypothecation, CCP membership, covered bonds, central bank facilities | Before Phase 4 |
| 3 | Significant currency threshold — per-currency ratios from day one? | Before Phase 1 execution |
| 13 | NMD history depth and segmentation; deposit beta observability | Before Phase 3 |
| 9 | Exotic FX sequencing within Phase 2 | Before Phase 2 breakdown |

### Risk

| # | Decision | Deadline |
|---|---|---|
| **12** | **CSRBB scope** *(with ALCO)* | Before Phase 3 breakdown |
| **32** | **Validation function and validator sourcing** *(with Executive)* | **Now** |
| 15 | Non-rate factor grammar bindings — **name an interim owner as a Phase 1 role** | Before Phase 1 execution |
| 14 | Overlay semantics — delta or override | Before Phase 3. **Cheap now, awkward once overlays exist** |
| 22 | Which VaR method | Before Phase 5 |
| 24 | Exposure simulation cadence and compute budget | Before Phase 5 sizing |
| 10 | Tier 3 replicating portfolio — built or documented only? | Before Phase 2 breakdown |
| 23 | Vendor history purchase — **buy raw quotes, not derived factors** *(with IT)* | **Now — bleeding** |

### Regulatory Reporting

| # | Decision | Deadline |
|---|---|---|
| 2 | **Deposit insurance coverage threshold and aggregation rule** — owns the interpretation | Before Phase 1 execution |
| 27 | Which local returns, templates and calendar | Before Phase 6 sizing |
| 26 | Standardised or IRB *(with Board)* | Before Phase 6 sizing |
| — | Confirm "standardised" market risk means the sensitivities-based method (`D11-11`) | Before Phase 5 |
| — | Author the interim regulatory classification and factor rule sets *(P0-15)* | **Now** |

### IT and Vendor Management

| # | Decision | Deadline |
|---|---|---|
| **30** | **Can the incumbent TMS produce a contract-level extract?** | **Now — gates Phases 0–3 having a treasury book at all** |
| 31 | Can core banking produce a complete daily contract-level extract? | **Now** |
| 7 | Curve build-or-buy in Phase 0 — recommendation given, needs confirming | Before Phase 0 wave 2 |
| 8 | Library version retention and escrow in the RFP | Before the Phase 2 RFP issues |
| 23 | Vendor history purchase *(with Risk)* | **Now — bleeding** |

### Operations

| # | Decision | Deadline |
|---|---|---|
| — | On-call rota and paging | Before Phase 0 go-live. **The F = 1h compute-budget assumption does not hold without it** |
| — | Auto-retry policy per feed | Before Phase 0 go-live |
| — | Own the daily collateral movement log *(with Treasury)* | **Now — bleeding** |

### Legal

| # | Decision | Deadline |
|---|---|---|
| — | Own legal agreement extraction across the counterparty population | **Now — bleeding**. Also a **Phase 2** blocker, since discounting depends on the CSA |
| — | Commission netting enforceability opinions where gaps are found | On discovery. **A gap is a capital cost, not a data gap** |

---

## 3. Register by deadline

### Class 1 — Running now, losing value every month

**These have no deadline because they are already bleeding.** None depends on the platform, on funding,
or on any other decision.

| # | Decision | What is lost per month of delay |
|---|---|---|
| 5 | Collateral log ownership and statement authority | One month of the 24-month LCR look-back, permanently. Statement retrieval also ages from self-service into archive request |
| 23 | Vendor market data history purchase | Nothing — **but this is the only one money can fix**, and every month without it is a month closer to Phase 5 with no stress period in the window |
| — | Legal agreement extraction | Lead time against a **Phase 2** need |
| — | Interim rule authorship *(P0-15)* | Lead time against a **Phase 0** need. The classification engine ships empty without it |

### Class 2 — Factual, answerable this week, long fan-out

| # | Decision | Owner |
|---|---|---|
| **25** | Group structure | Board |
| **21** | Trading book size | Treasury |
| **30** | Incumbent TMS extract capability | IT |
| 31 | Core banking extract capability | IT |
| **32** | Validation function and sourcing | Executive |

### Class 3 — Before Phase 0 completes

| # | Decision | Note |
|---|---|---|
| 20 | GL authoritative source and posting interface | §4 — this moved earlier |
| 29 (part) | Is the fair value option used? | Feeds the Phase 0 accounting rule set |
| 7 | Curve build-or-buy | Gates P0-04 |
| — | On-call rota; auto-retry policy | Gates the compute budget's central assumption |
| — | Trade-date election confirmation | May override a settled decision |

### Class 4 — Before Phase 1 execution

2 (deposit insurance) · 3 (significant currency) · 4 (stress approval) · 6 (EOD window sign-off) ·
11 (snapshot timing) · 15 (interim non-rate owner)

### Class 5 — Before a later phase

| Phase | Decisions |
|---|---|
| **2** | 8 (escrow) · 9 (exotic FX sequencing) · 10 (Tier 3 path) |
| **3** | **12 (CSRBB)** · 13 (NMD history) · 14 (overlay semantics) |
| **4** | 16 (CVA-free policy) · 17 (IM scope) · 18 (FTP methodology) · 19 (collateral scope) · hedge accounting ratification |
| **5** | 22 (VaR method) · 24 (exposure simulation) · `D11-11` |
| **6** | 26 (SA/IRB) · 27 (returns list) · 28 (FTP at all) · 29 (transitionals) |

---

## 4. Three decisions whose deadline moved earlier than their phase

Worth calling out, because each is filed under a later phase in the by-phase view and is genuinely
needed sooner.

| # | Filed under | Actually needed | Why |
|---|---|---|---|
| **20** GL authoritative source and posting interface | Phase 4 (D7) | **Phase 0 wave 2** | The GL is a *source* for 18 of 40 balance sheet lines, not only a control. C.3 retained earnings is the balancing figure and has no other source, so P0-08's feed inventory needs the answer |
| **32** Validation function and sourcing | Phase 7 (D15) | **Now** | Model governance accretes from Phase 0. A validator arriving in Phase 7 inherits six years of unapproved production models |
| **29 (part)** Fair value option usage | Phase 6 (D13) | **Phase 0 rule authoring** | FVO designation changes the accounting classification rule set the interim authors are writing now, and brings the own-credit OCI reserve and its CET1 filter into scope |

The pattern is the same in all three: **a decision was filed under the phase that consumes it most
visibly, rather than the phase that first depends on it.** Worth a check against the remaining
twenty-nine when each phase is broken down.

---

## 5. Status summary

| | Count |
|---|---|
| Settled | 1 (decision 1, the taxonomy elections) plus the hedge accounting framework and NIH scope, both provisional pending 25 |
| Open, running clock | 4 |
| Open, factual and answerable now | 5 |
| Open, gates Phase 0 | 5 |
| Open, gates Phase 1 | 6 |
| Open, gates Phases 2–6 | 17 |

**Nine decisions can be put to their owners this week** — the four in §1 plus 30, 31, 5, 23 and the
trade-date confirmation. None requires engineering input and none depends on another decision.

**The register's own health check:** if a decision has sat open for two months without an owner
disputing it, the owner assignment is probably wrong. Unowned decisions do not age into being decided.
