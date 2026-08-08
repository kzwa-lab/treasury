# Treasury, ALM & Risk Platform — Product Requirements Document & Implementation Plan

**Product:** A digital platform that is the bank's system of record for treasury and the single source
of its ALM, liquidity, market and counterparty credit risk, funds transfer pricing and regulatory
numbers.

**Basis:** The bank's own instrument universe and 40-line balance sheet taxonomy, consolidated in
`Treasury-ALM-Risk-Platform-Implementation-Whitepaper.md` and the 30-artifact design corpus
(`artifacts-flat/`, `treasury-alm-risk-platform/`).

**Status:** Design is ready for implementation. This document converts that design into (A) a product
requirements specification and (B) an executable implementation plan with stage gates.

---

# PART A — PRODUCT REQUIREMENTS DOCUMENT

## A1. Product vision

Treasury deals are booked, confirmed, settled and accounted for **here**. Every figure the platform
produces — the liquidity coverage ratio, the interest-rate risk position, the balance sheet itself —
is **traceable to the individual transactions that produced it** and **reproducible exactly as it
stood on any past date**.

## A.2 Problem statement

Today the bank's ALM, liquidity, risk and regulatory numbers are assembled manually from several
systems and spreadsheets. That means:

1. **No single version of the truth** — the ALCO pack, the LCR, IRRBB and the balance sheet are built
   by different teams from different extracts, and reconcile only with effort.
2. **No reproducibility** — a report as it stood on a past date cannot be regenerated under the rules
   and assumptions that applied then.
3. **No traceability** — a regulator or auditor cannot obtain *"why did this ratio move?"* as a single
   answer; it is a research exercise.
4. **No pre-deal decision support** — the treasury cannot ask "what does a 3-year issue do to LCR and
   funding concentration?" before committing.

## A.3. Goals

| # | Goal | Measurable outcome |
|---|---|---|
| G1 | Become system of record for the full treasury instrument universe | All treasury deals booked/confirmed/settled/accounted in one governed system (Phase 4+) |
| G2 | One authoritative balance sheet, generated not assembled | All 40 taxonomy lines generable by query over the canonical model; every material difference vs the current process explained |
| G3 | Daily regulatory liquidity ratios from own records | LCR and NSFR produced daily from Phase 1 with provenance |
| G4 | Independent daily valuation and P&L | D8 valuation for the full instrument range, sensitivities, `exposure_by_bucket` |
| G5 | ALM & IRRBB measured and attributable | EVE, NII sensitivity, repricing gap, supervisory outlier test; assumptions explicit/versioned/challengeable |
| G6 | Full market and counterparty credit risk | VaR/ES, stressed VaR, attribution, backtesting, SA-CCR, PFE/EPE, XVA |
| G7 | Regulatory returns as configuration | Returns engine configurable to the local regulator; capital, RWA, leverage, large exposures |
| G8 | Control environment at platform level | Four-eyes, audit trail with correlation IDs, impact simulation, provenance, reproducibility across both temporal axes |

**Non-goals (explicitly out of scope):** loan origination and servicing, customer channels, the core
banking GL system itself, IFRS 9 ECL model computation (consumed via an interface only),
client-facing treasury sales, multi-GAAP, macro hedge accounting.

## A.4 Users and personas

| Persona | Primary need | Modules used |
|---|---|---|
| **Treasury desk / dealers** (Phase 4+) | Book, amend, limit-check, confirm, settle straight-through | D4, D5, D6 |
| **Treasury operations** | Nostro/cash position, funding, breaks | D5, D10, D16 |
| **ALM / ALCO** | EVE, NII, gap, behavioural assumptions, pre-deal what-ifs, ALCO pack | D9, D10, D14, D12 |
| **Risk management** | Limits, VaR, ES, SA-CCR, PFE/XVA, stress, model governance | D11, D14, D15 |
| **Finance / accounting** | IFRS 9 classification, sub-ledger, GL, hedge accounting, FTP | D7, D12 |
| **Regulatory reporting** | Returns engine, capital, RWA, leverage, disclosures | D13 |
| **Audit / model risk** | Reproducibility, traceability, break register, override register | D15, D16, D17 |
| **Board** | Executive packs, risk appetite, degradation decisions | D13, D14, D3–D11 outputs |

## A.5 Functional requirements

Priorities: **P0** = mandatory for the effective phase · **P1** = required, may be deferred within
scope · **P2** = conditional / stretch.

### FR-1 Foundation — reference data, instruments, positions, projection

| # | Requirement | Priority |
|---|---|---|
| 1.1 | Book every Contract, Leg, Balance and event; append-only bitemporal event model; cancel-and-correct never overwrites | P0 |
| 1.2 | Six primitives: Contract, Leg, Cashflow, Balance, Position (derived), Valuation (immutable) | P0 |
| 1.3 | Five rate treatments: fixed, floating/index (incl. partial-observation RFR periods), return, quantity, externally projected | P0 |
| 1.4 | Worked decompositions supported: FX swap = 2 linked Contracts; NDF net settlement; collateral swap with no cash leg; futures with no cashflows; ABS/MBS externally projected | P0 |
| 1.5 | Deterministic projection signature: same inputs → same outputs (snapshot, reference-data version, assumption set, horizon) | P0 |
| 1.6 | Fifteen classification dimensions; rules-derived, versioned, effective-dated; no object without complete classification; overrides four-eyes + reported | P0 |
| 1.7 | Contract/Balance test governing object model and feed inventory (derivable = Contract, asserted = Balance) | P0 |

### FR-2 Reference & static data

| # | Requirement | Priority |
|---|---|---|
| 2.1 | Ten bitemporal domains: entity, counterparties, product catalogue, calendars/conventions, indices, currency, GL chart/mapping, legal agreements & netting sets, classification rule sets, bucket & vertex definitions | P0 |
| 2.2 | Structured legal agreement terms (ISDA/CSA/GMRA/GMSLA) — eligible collateral, thresholds, MTA, rehypothecation | P0 (Phase 2 blocker) |
| 2.3 | Shared bucket/vertex definitions; platform rate vertex set = 19 IRRBB band midpoints ∪ 10 prescribed vertices (29 nodes) | P0 |
| 2.4 | Impact simulation (dry-run) before any rule activation | P0 |

### FR-3 Market data & curves

| # | Requirement | Priority |
|---|---|---|
| 3.1 | Fixings, FX, prices, credit spreads, volatility surfaces; snapshot versioning; provenance | P0 |
| 3.2 | Multi-curve discounting; curve construction consumable by D8 | P0 Phase 2 |
| 3.3 | Market-observable fallback hierarchy accepted under D15 | P0 |
| 3.4 | Historical dataset with a genuine stress period (purchase decision "now") | P0 (procurement, "now") |

### FR-4 Front-to-back execution

| # | Requirement | Priority |
|---|---|---|
| 4.1 | Deal capture, amendments, novations, terminations, exercises, fixings, rollovers | P0 Phase 4 |
| 4.2 | Pre-deal limit checks from the limit framework | P0 Phase 4 |
| 4.3 | Confirmation matching, settlement instructions, nostro mgmt, payments, failed trades | P0 Phase 4 |
| 4.4 | Four-eyes on controlled actions as a platform service | P0 |

### FR-5 Collateral & securities financing

| # | Requirement | Priority |
|---|---|---|
| 5.1 | End-to-end repo, reverse repo, tri-party, collateral, securities lending | P0/P1 |
| 5.2 | Encumbrance register (minimal register from Phase 0 at full-P0 grain) | P0 |
| 5.3 | Encumbrance changes propagate to HQLA and classification without batch delay | P0 |
| 5.4 | Central bank facility contract origination from collateral state (inverts D4→D2) | P0 |
| 5.5 | Recognition rules: repo out stays on balance sheet encumbered; reverse-repo in not recognized but HQLA-eligible if rehypothecable | P0 |

### FR-6 Valuation

| # | Requirement | Priority |
|---|---|---|
| 6.1 | Pricing for every Part 1 class incl. barriers and digitals; unvalidated = not fit for purpose | P0 |
| 6.2 | Value, cashflows, sensitivities, `exposure_by_bucket` per subject | P0 |
| 6.3 | Versioned perturbation convention; option exercise two-pass protocol | P0 |
| 6.4 | Provenance propagated output stack | P0 |

### FR-7 ALM & IRRBB (D9)

| # | Requirement | Priority |
|---|---|---|
| 7.1 | Balancing gap, EVE, NII sensitivity, supervisory outlier tests | P0 |
| 7.2 | Behavioural models: NMD core/volatile + maturity profile, prepayment, early redemption, rollover/stickiness, drawdown, pipeline | P0 |
| 7.3 | Contractual and behavioral cashflow sets coexist; per-contract diff explainable | P0 |
| 7.4 | Basis risk and CSRBB (both libraries + both buffers, per regulatory DG) | P1–P2 (conditional) |
| 7.5 | IRRBB limits & risk appetite | P0 |

### FR-8 Liquidity & funding (D10)

| LR | Requirement | Priority |
|---|---|---|
| LU1 | Cashflow ladder (contractual/behavioural; by bucket, currency, counterparty type) | P0 |
| LU2 | Counterbalancing capacity / HQLA buffer incl. haircuts and monetisation | P0 |
| LU3 | LCR and NSFR as rules engines over classified balances × prescribed factors | P0 |
| LU4 | Contingent flows first-class (outflows generous, inflows only irrevocable) | P0 |
| LU5 | Survival horizon (Phase 3), funding concentration, encumbrance ratio, early warnings | P0/P1 |
| LU6 | Funding plan, pre-deal liquidity what-if | P1 |
| LU7 | Liquidity stress execution | P0 |

### FR-9 Market & counterparty credit risk (D11)

| # | Requirement | Priority |
|---|---|---|
| 9.1 | VaR and expected shortfall (trading book) with sensitivity aggregation | P0 |
| 9.2 | SA-CCR per netting set, PFE/EPE, CVA/DVA, settlement & issuer risk, large exposures | P0 (Phase 5/6) |
| 9.3 | P&L attribution with residual exposed as a platform health metric | P0 |
| 9.4 | Backtesting vs D15 grading | P0 |
| 9.5 | Market-risk and counterparty-risk sub-modules specified and phased separately (D11a/D11b) | P0 |

### FR-10 Funds transfer pricing (D12)

| # | Requirement | Priority |
|---|---|---|
| 10.1 | Internal pricing curves and transfer contracts; per-contract FTP locked at origination | P0 |
| 10.2 | FTP components incl. contingent liquidity charge (undrawn/unconditional lines) | P0 |
| 10.3 | Internal designation object; eliminated on consolidation | P0 |

### FR-11 Regulatory reporting & capital (D13)

| # | Requirement | Priority |
|---|---|---|
| 11.1 | Accounting-to-accounting-capital bridge to CET1 | P0 |
| 11.2 | RWA (standardised), leverage, large exposures | P0 |
| 11.3 | Configurable returns engine; reporting calendar; Pillar 3 | P0 |
| 11.4 | D13-A rule authorship lands in Phase 0; D13-B computation and reporting in Phase 6 | P0 |

### FR-12 Scenario & stress (D14)

| # | Requirement | Priority |
|---|---|---|
| 12.1 | Versioned scenario definitions (macro, market, house), approved workflow | P0 |
| 12.2 | House-wide transformation grammar (node set, magnitude unit, floor rule) reused by D8 sensitivities | P0 |
| 12.3 | Reverse stress and boundary-condition scenarios | P1 |

### FR-13 Model governance & control (D15 + control core)

| # | Requirement | Priority |
|---|---|---|
| 13.1 | Model inventory (26+ models; proxies are models), validation before first use | P0 |
| 13.2 | Correlation IDs on all audit records spanning modules | P0 |
| 13.3 | Four-eyes authorisation as platform service; override register | P0 |
| 13.4 | Impact simulation capability | P0 |
| 13.5 | Regeneration test (Phase 1); engine builds retained as versioned artefacts | P0 |
| 13.6 | Aggregate model-risk reporting + model risk appetite | P0 (Phase 7) |

### FR-14 Platform services (D16/D17)

| # | Requirement | Priority |
|---|---|---|
| 14.1 | Feed adapters, staging, DQ validation, quarantine, break register | P0 |
| 14.2 | Reconciliation engine seven reconciliations, three-way custodian | P0 |
| 14.3 | Orchestration DAG, cut-offs, gates (arrival/validation/reconciliation/approval/completion/plausibility/model-validity) | P0 |
| 14.4 | Provisional flag, transitive & rendered on the artifact (incl. file name) | P0 |
| 14.5 | Re-run semantics, calendar-aware, telemetry | P0 |
| 14.6 | Per-source freshness stamping | P0 |

### FR-15 Data access & integration

| # | Requirement | Priority |
|---|---|---|
| 15.1 | Inbound interfaces: D4 real-time, core banking batch extracts, custodian, nostro, ECL engine | P0 |
| 15.2 | Outbound: published contract / valuation service across modules | P0 |

## A.7 Non-functional requirements

| Category | Requirement |
|---|---|
| **Performance** | EOD: full pipeline ≤ 3 h; Tier-A critical ≤ 90 min; 7 h unattended window gate; sizing assumes floating-rate book invalidates cache daily and internal contracts multiply count |
| **Availability** | Automated retry first, then paging; instrumented F=1h assumption from day 1 |
| **Reproducibility** | Bit-exact regeneration; per-`contract` digests; frozen detail on regulatory dates; retention = lifetime + N (default 7, configurable) |
| **Auditability** | Bitemporal query surface; correlation IDs; provenance |
| **Security** | RBAC, four-eyes, no secrets in code, key vault |
| **Observability** | Run telemetry, incident correlation, break ageing |
| **Scalability** | ~500k accounts; projection parallelisable by contract |

## A.8 Data & retention requirements

- Store inputs and as-reported outputs permanently; regenerate projections; shared inputs permanent.
- Regenerate projections for the EOD and a rolling hot window (30–90 days).
- Regulatory reporting dates frozen in full detail.
- Derived values never stored or ingested (accrual, FVOCI reserve, cash-flow-hedge reserve, FX translation).

## A.9 Build vs buy decisions (product posture)

| Capability | Posture |
|---|---|
| Reference/static data, instrument core, projection, classification, liquidity engine | **Build** |
| D16 matching engine, D17 orchestrator | Buy/re-use; build adapters |
| Pricing library (all exotic) | **Buy** (RFP; barriers/digitals mandatory) |
| Phase 0 curves | Buy vendor-published; build in-house Phase 2 |
| D4 front-to-back | Evaluate purchase seriously |
| Risk analytics (D11) | Buy analytics; build limit framework |
| Regulatory returns engine | **Build** |

## Acceptance criteria (product definition of done)

1. Every Part 1 instrument class books/projects/prices — against worked decompositions (NDF net settlement, FX swap two contracts, repo recognition, tri-party baskets, callable CoCos, inflation-linked notionals, TRS return legs, commodity quantity legs, futures no cashflows, external-projected ABS/MBS).
2. Every Part 2 line generates as a (measure, predicate) pair over positions & balances — with declared measures (drawn/undrawn, carrying amount, fair value, notional, designated portion) for the six sub-lines requiring a split.
3. Every Part 1 class maps to a named Part 2 line, or an intentional non-appearance is recorded with a reason.
4. Three user-level tests: point at a figure and ask why (rule/model version + inputs + approver in one query); get a 3-year-old report reproduced exactly; decompose a ratio movement into balance, market, assumption — separately.

---

# PART B — IMPLEMENTATION PLAN

## B.1 Delivery strategy

- **Staged, each stage ends with a usable deliverable and a decision gate.** The programme can stop after any stage with the value intact to date.
- **Rules precede the modules that own them** — the classification rules engine executes versioned rules authored by D7 (Phase 4), D13-A (Phase 0–1), D9 (Phase 3).
- **Rule authoring and control accretion from Phase 0** — model inventory, validation-before-first-use, four-eyes and impact simulation are platform services from day one.
- **Reproducibility is an implementation control, not a model validation** — regen test in Phase 1.
- **Parallel run and operational acceptance are in Phase 0's scope** (this is a deliberate correction to an archive of tickets that omitted them).

## B.2 Critical path of decisions (unblocking gates)

The four decisions that go first (none is engineering work; all have lead time):

| # | Decision | Owner | Needed by | Blocks |
|---|---|---|---|---|
| 1 | Group structure (consolidation?) | Board | Now | D2 entity model, D7 net-investment hedge, D13 scope, D6 |
| 2 | Trading book size | Treasury | Now | Scope/price Phase 5, risk analytics procurement |
| 3 | CSRBB scope | Risk + ALCO | Before Phase 3 | D9 measure, D3, D14 scenario library, D13 |
| 4 | Validator sourcing | Executive + Risk | Now | D15 from Phase 0 |

Plus the "four clocks" that run independent of the build:

- **Collateral movement history** 24-month LCR look-back — begin logging today (7 fields; named owner); request historic statements day one; reconstruct backwards; proxy residual.
- **Legal agreement extraction** — structured terms from ISDA/CSA/GMRA etc. by tier — a Phase 2 blocker, not 4.
- **Market data history** — buy a vendor history with raw quotes (not derived factors).
- **Interim rule authorship** — Phase 0 staffing line (accounting + regulatory rule authors) with the classification rules engine.

## B.3 team / resource plan

| Role | Phase 0 | Phase 1–3 | Phase 4–6 |
|---|---|---|---|
| Programme director / product owner | 1 | 1 | 1 |
| Solution architect | 1 | 1 | 0.5 |
| Data model / D2 engineers | 3–4 | 3 | 2 |
| Integration/D16 engineers | 2–3 | 2 | 3 |
| Orchestration/Ops (D17) | 1–2 | 1 | 2 |
| QT/QA | 2 | 2–3 | 3–4 |
| Finance rule authors (interim) | 2 | 2 | — |
| Risk rule authors (interim) | 1–2 | 2 | — |
| Legal extraction | 2 | 2 | — |
| Vendor/procurement | 0.5 | 1 | 2 |
| Model validators | 1–2 | 2 | 3 |

Note the constraint stated in the design: **subject-matter capacity, not engineering capacity, is the
binding bottleneck.** Rule authorship, agreement extraction and policy decisions outrank code.

## Phase 0 — Foundation (Foundation, tickets P0-01..P0-16)

| Wave | Tickets | State at end of wave |
|---|---|---|
| 1 | P0-11 control core · P0-15 rule authorship (non-engineering) · P0-01 reference data | Static data versioned + governed; rule authoring staffed |
| 2 | P0-02 agreements & netting · P0-03 object store · P0-04 market data · P0-08 ingestion | Objects store + ingest; snapshots exist |
| 3 | P0-05 projection · P0-06 classification engine · P0-09 reconciliation · P0-10 encumbrance register | Cashflows project; objects classify; feeds reconcile |
| 4 | P0-07 position derivation · P0-12 orchestration | Positions at both freshness levels; pipeline gated |
| 5 | P0-13 retention & regeneration · P0-14 balance sheet projection | Reproducibility proven; Phase 0 technically able |
| 6 | P0-16 operational readiness | Phase is operationally live — parallel run exercised, on-call exercised |

**Phase 0 exit criteria:** the three coverage tests (FR acceptance 1–3); generated balance sheet runs in
parallel with the current process with every material Δ explained; on-call rota exercised.

## Phase 1 — Liquidity (P1-01..P1-16)

D10 ladder, LCR, NSFR, HQLA, concentrations; D13-A factor rules; D15 regen test.
Build customer-level two-pass classification (insurance threshold + operational cap, deterministic
allocation + sequencing).
**Exit:** daily LCR/NSFR from own records; regeneration test passing; pre-deal what-if available.

## Phase 2 — Valuation (P2-01..P2-16)

Buy pricing library (RFP: barriers/digitals mandatory; version retention + escrow contractual);
valuation service wrapper, curves/vol surfaces, exotic & linear pricing, sensitivities,
`exposure_by_bucket`, two-pass exercise protocol, governance & valuation reconciliation.
**Exit:** independent daily P&L on full range; pricing model inventory governed.

## Phase 3 — ALM & IRRBB (P3-01..P3-16)

Behavioural models (NMD, prepayment/early redemption, rollover, drawdown, pipeline) with governance
onboarding; D14 scenario families; gap/EVE/NII; outlier test; internal liquidity &
survival; ALCO pack with assumption attribution; CSRBB (conditional).
**Exit:** ALCO pack from source; IRRBB returns; assumption changes decomposed (balance/market/model).

## Phase 4 — Front-to-back (D4, D5, D6 full, D7, limits)

Buy-evaluate front-to-back; limit framework from Phase 0; full accounting sub-ledger + GL posting;
D11 counterparty carve-out. **This is the highest-risk phase** (largest + least differentiating).
**Exit:** treasury as system of record; STP; posting-level GL reconciliation.

## Phase 5 — Risk (P5-01..P5-16)

Risk factor history, proxy/spread model, procurement of analytics, revaluation workers,
sensitivity aggregation / capital ladder, VaR/ES, stressed VaR, attribution, backtesting, PFE/EPE,
full XVA, wrong-way risk.
**Exit:** full market + counterparty credit risk measurement; VaR backtests graded by D15.

## Phase 6 — FTP & Regulatory (P6-01..P6-16)

FTP methodology/components, internal curves engine, transfer contracts `internal` designation,
business-unit residual reporting, returns inventory/calendar, returns engine consistency, leverage,
large exposures, CCR/PRA market/operational RWA, capital bridge, Pillar 3, capital planning,
macro paths/reverse stress, reporting-date gate tightening.
**Exit:** regulatory submission from configuration through the returns engine.

## Phase 7 — Governance (P7-01..P7-08)

Inventory completeness & accretion, model provenance, aggregate model risk reporting, model risk
appetite & escalation, validator sourcing model, control environment reproducibility, board &
regulator reporting, BAU transition.
**Exit:** audit & regulator ready; BAU transition complete.

## Build/Buy procurement tracks (run in parallel)

| Track | Phase | Outcome by |
|---|---|---|
| Reconciliation engine + orchestrator | 0 | Vendor selected; adapters built in-house |
| Institutional market data history | Now | Vendor contract; raw quotes |
| Pricing library | 2 | RFP evaluated; retention + escrow clauses |
| Front-to-back (D4 etc.) | 4 | Buy evaluation contract decision |
| Risk analytics | 5 | Analytics sourced; limit framework built |

## Rollout & operationalisation

- **Phase 0:** parallel run with current balance sheet process; on-call and paging exercised.
- **Phase 1+:** progressive deployment of daily ratios; early warning dashboards.
- **Phase 4:** STP cutover to treasury booking — warrant-managed, rollback defined.
- **Phase 7:** transition to documented BAU runbook (P7-08).

## Test & quality strategy

1. **Three coverage tests (acceptance 1–3)** as a gate at each phase entry.
2. **Regeneration test** from Phase 1 against per-contract digests; divergence = incident.
3. **Convention test suite** for schedule generation incl. partial-comparisons.
4. **Scenario/re-run semantics tests** incl. provisional flag propagation.
5. **Vendor dependency tests** — discrimination cases (repo recognition, FX swap as linked contracts, CSA-driven discount curve selection) exercised through the service wrapper.
6. **Parallel reports** with the existing process: every nontrivial difference explained, not just reconciled, for a stated cycle count.
7. **Load test** the month-end + regulatory-date combination (highest-weight), explicitly.

## Risk register (top items)

| Risk | Mitigation |
|---|---|
| Subject-matter capacity binding | Start rule-authoring and legal workstreams in Phase 0; named owners |
| Stage 4 size | Place late, evaluate seriously to purchase |
| Upstream data quality unknown | Establish extract capability now; staged degradation (Balances for non-transactional, reduced capability) well-defined |
| Model assumptions becoming the answer | Versioned, challengeable assumptions; assumption attribution in every pack |
| Repro-first-use failures | D15 accretes from Phase 0; validator sourcing decided now |
| Programme fatigue | Stage every phase; value intact after any stop |

## Indicative programme timeline (assumption-bound)

The design corpus deliberately withholds schedule numbers until three variables are settled: build-vs
-buy at Stage 4, upstream data quality, and how decisively subject-matter capacity. The indicative
league lines:

| Phase | Indicative duration | Depends on |
|---|---|---|
| 0 Foundation | 6–9 months | Data extract capability, staffing rule-authoring and control core |
| 1 Liquidity | 3–4 months | Phase 0 exit; institutional history |
| 2 Valuation | 4–6 months | Library procurement elapsed |
| 3 ALM & IRRBB | 4–6 months | CSRBB decision; calibration history |
| 4 Front-to-back | 12–18 months | Buy/eval outcome; core-banking interface |
| 5 Risk | 9–12 months | Trading book size; history |
| 6 FTP & Regulatory | 6–9 months | Returns templates; confirmed submission calendar |
| 7 Governance | 3–4 months | Runs in parallel; wraps the programme |

**Sequential chain: Phases 0 → 1 → 2 → 3.** Phase 4 runs after Phase 2 exit (needs valuation for robust
pre-deal checks); Phase 5 runs after Phase 2 exit and in parallel with Phase 4; Phase 6 starts after
Phase 1 exit for the returns engine with rule authorship from Phase 0. **Hard milestones:** Phase 0
exit (classified, reconciled balance sheet), Phase 1 exit (daily liquidity), Phase 4 exit (STP),
Phase 7 exit (regulator-ready).

---

## Appendix — Traceability map

| Concern | Where specified |
|---|---|
| Instrument universe & worked decompositions | `Treasury-ALM-Risk-Platform-Implementation-Whitepaper.md` Part I, Appendices A and B |
| 40-line taxonomy | `part2-taxonomy-mapping` · `part2-query-specification` |
| Module contracts | `d1..d17` deep-dives in `artifacts-flat/` |
| Classification engine | `Classification Rules Engine.md`, P0-06 |
| EOD window/degradation | `EOD Window...` artifact |
| Decisions | `Decisions Register` whitepaper Part VII |
| Contracts/procurement | `Phase 4 Front-to-Back — Buy Evaluation` `P2-01..03` |
| Model governance | D15 deep-dives, P7 tickets |