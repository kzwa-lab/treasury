# Treasury, ALM & Risk Management Platform

**A comprehensive digital platform to run a bank's balance sheet.**

A single system of record for treasury, with integrated asset–liability management (ALM), liquidity,
market and counterparty risk, funds transfer pricing (FTP), and regulatory reporting. Every figure the
platform produces — the liquidity coverage ratio, the interest-rate risk position, the balance sheet
itself — is traceable to the individual transactions that produced it and reproducible exactly as it
stood on any past date.

Core banking remains the system of record for retail and corporate loans and deposits, which feed the
platform daily. The platform becomes the source of truth for everything the bank holds in its treasury
book and for all balance-sheet analytics and returns.

---

## 1. What the platform covers — the full product universe

The platform models the **complete instrument universe** of a Tier 1 bank treasury, plus the granular
40-line balance sheet taxonomy those instruments land in. Nothing is "cohort-based": every contract is
stored and projected at contract level.

### 1.1 Instrument classes (Part 1 of the source taxonomy)

| # | Class | Instruments modelled |
|---|---|---|
| 1 | **Money market** | Interbank placements, deposits, central bank facilities, NCDs, promissory notes, bankers' acceptances |
| 2 | **Repo & securities financing** | Repos, reverse repos, tri-party repos (agent-allocated baskets), securities lending, collateral swaps/upgrades |
| 3 | **Fixed income** | Government/corporate bonds, **ABS/MBS**, covered bonds, CoCos, callables/puttables, structured and inflation-linked notes |
| 4 | **FX** | Spot, forwards, FX swaps (as two linked contracts), NDFs, cross-currency swaps, options **including barriers and digitals** |
| 5 | **Interest rate derivatives** | Swaps, basis swaps, OIS, swaptions, caps, floors, futures (STIR and bond) |
| 6 | **Credit derivatives** | Single-name and index CDS, credit-linked notes, synthetic securitisation |
| 7 | **Equity & commodity** | Equity holdings, equity swaps, TRS, commodity swaps and futures (quantity × price) |
| 8 | **Wholesale funding & issuance** | Bonds, MTNs, AT1/perpetuals, subordinated debt, syndicated participation borrowings |
| 9 | **Liquidity & collateral tools** | Committed liquidity facilities, contingent funding lines, collateral eligibility schedules |
| 10 | **Internal ALM instruments** | FTP transfer contracts and internal hedges — designed to eliminate on consolidation |
| 11 | **Trade & structured finance** | Forfaiting, factoring (funded purchases of receivables), LCs, guarantees |

### 1.2 Balance sheet taxonomy (Part 2) — 40 lines, all generable

Every balance sheet line is produced by query over the canonical data model — never bespoke code:

- **Assets A.1–A.16** — cash and central bank balances, interbank placements, trading and investment
  securities, loans to banks and customers, reverse repos, hedge-designated derivatives, associates and
  subsidiaries, PP&E, right-of-use assets, goodwill, deferred tax, other assets, held-for-sale.
- **Liabilities B.1–B.14** — central bank borrowings, deposits from banks, customer deposits, trading
  liabilities, repos, debt securities issued, subordinated liabilities, hedge-designated derivatives,
  provisions, tax, lease liabilities, other liabilities, disposal groups.
- **Equity C.1–C.6** — share capital, premium, retained earnings, other reserves (FVOCI, hedge, FX
  translation — derived), AT1/equity-classified perpetuals, non-controlling interests.
- **Off-balance-sheet D.1–D.4** — undrawn commitments, guarantees, letters of credit, contingent
  liabilities — each with its own contingent-flow model.

---

## 2. How it is built — 17 bounded contexts in six layers

| Layer | Domains |
|---|---|
| **L1 · Platform services** | D16 Ingestion, Reconciliation & Data Quality · D17 Batch Orchestration & Operational Control |
| **L2 · Foundation** | D1 Reference & Static Data · D2 Instrument & Position Core · D3 Market Data & Curves |
| **L3 · Execution & operations** | D4 Deal Capture · D5 Confirmation, Settlement & Payments · D6 Collateral & Securities Financing · D7 Accounting & Sub-ledger |
| **L4 · Valuation** | D8 Valuation & Analytics Engine |
| **L5 · Analytics** | D9 ALM & IRRBB · D10 Liquidity & Funding · D11 Market & Counterparty Credit Risk · D12 Funds Transfer Pricing |
| **L6 · Output & governance** | D13 Regulatory Reporting & Capital · D14 Scenario & Stress Framework · D15 Model Governance, Audit & Control |

The architecture is a DAG, not a strict hierarchy: *data* flows upward, while *versioned rules* and
*observed state* flow downward. Downward edges may carry only versioned, effective-dated definitions —
never computed results.

### What each domain does

- **D16 Ingestion, Reconciliation & DQ** — feed adapters, canonical staging, acquisition monitoring,
  validation, the reconciliation engine and break register, quarantine and suspense. Owns the data-good
  state the nightly pipeline gates on.
- **D17 Batch Orchestration** — the pipeline DAG, scheduling, cut-offs, gate evaluation, the provisional
  flag and its transitive propagation, re-run semantics, calendar awareness, run telemetry.
- **D1 Reference & Static Data** — ten bitemporal data domains: legal entities, counterparties,
  product catalogue, calendars and conventions, indices, currency, GL chart, **legal agreements and
  netting sets (ISDA/CSA/GMRA/GMSLA)**, classification rule sets, bucket and vertex definitions.
- **D2 Instrument & Position Core** — the system of record. Contract, Leg, Balance and event store;
  the deterministic cashflow projection engine; fifteen classification dimensions; position derivation;
  bitemporal query surface. **The single most important module — a defect here is a defect in every
  report.**
- **D3 Market Data & Curves** — fixings, FX, prices, credit spreads, volatility surfaces, multi-curve
  construction, snapshot versioning, provenance tagging, fallback hierarchies.
- **D4 Deal Capture & Lifecycle** — booking, amendments, novations, terminations, exercises, rollovers,
  pre-deal limit checks, four-eyes authorisation.
- **D5 Confirmation, Settlement & Payments** — confirmations, settlement instructions, nostro
  management, payments, failed-trade handling.
- **D6 Collateral & Securities Financing** — repo/securities-financing lifecycles, tri-party,
  haircuts, margining, optimisation, central-bank pool management. **Owns the encumbrance register.**
- **D7 Accounting & Sub-ledger** — IFRS 9 classification and measurement, effective interest,
  modification accounting, hedge accounting, derecognition, IAS 32 presentation, the double-entry
  sub-ledger.
- **D8 Valuation & Analytics** — narrow contract: given a position, a market snapshot and a date,
  return value, cashflows, sensitivities and `exposure_by_bucket`.
- **D9 ALM & IRRBB** — repricing gap, EVE, NII sensitivity, supervisory outlier tests, **behavioural
  models** (non-maturity deposits, prepayment, early redemption, rollover, pipeline), basis risk, CSRBB,
  IRRBB limits.
- **D10 Liquidity & Funding** — cashflow ladder, counterbalancing capacity, LCR, NSFR, survival horizon,
  funding concentration, encumbrance ratio, early-warning indicators, funding plan, liquidity stress.
- **D11 Market & Counterparty Credit Risk** — VaR and expected shortfall, sensitivity aggregation and
  P&L attribution, SA-CCR per netting set, PFE/EPE, CVA/DVA, settlement and issuer risk, large
  exposures.
- **D12 Funds Transfer Pricing** — internal pricing curves, transfer contracts, FTP components
  (including the contingent liquidity charge).
- **D13 Regulatory Reporting & Capital** — the accounting-equity-to-CET1 bridge, RWA, leverage, large
  exposures, configurable returns engine, Pillar 3, capital planning. Authors the regulatory
  classification rules and factor sets D2 and D10 execute.
- **D14 Scenario & Stress** — all shocks, scenarios and stress paths, versioned and approved, plus the
  transformation grammar that makes scenarios consumed identically across the platform.
- **D15 Model Governance, Audit & Control** — model inventory, validation, change control, four-eyes,
  audit trail, reproducibility. The control core (audit, four-eyes, override, impact simulation) is live
  from Phase 0.

---

## 3. The data model that makes it all consistent

**Six core objects.** Contract (legal/economic terms), Leg (one currency, one payment convention, one
rate treatment), Cashflow (dated, tagged contractual/behavioural), Balance (an asserted carrying amount
— vault cash, nostro, equity lines, PP&E — with no cashflows), Position (always derived, never
entered), Valuation (immutable D8 output).

**The Contract/Balance test:** *can you compute this from what D2 holds, or must someone tell you the
number?* Derivables are Contracts; externally-asserted amounts are Balances. This single rule governs
both the object model and the feed inventory, and it keeps the model stable as integration scope grows.

**Five rate treatments, not two.** Fixed · Floating/index (with three fixing states: stored past reset,
market future reset, partly-observed compounded-in-arrears current period) · Return (TRS, equity swaps)
· Quantity (commodities, short securities — relaxes one-currency-per-leg) · Externally projected
(ABS/MBS, index CDS — stored, never regenerated).

**Fifteen classification dimensions** in two groups — risk/behaviour (maturity buckets, repricing,
currency, GL mapping, counterparty, accounting and regulatory class) and presentation/accounting (book
intent, hedge designation, primary risk type, ECL stage, held-for-sale, capital-instrument class).
Classification is rules-derived, versioned and effective-dated; override is four-eyes and reported.
No object exists without complete classification — an unclassified line is presented on the balance
sheet, never quietly dropped.

**Bitemporality everywhere.** Every query is answerable on effective date *and* knowledge date
independently — "yesterday as we reported it" versus "yesterday as we now understand it", with the
difference explainable.

---

## 4. Deterministic, reproducible, auditable

```
project(Contract, as_of_date, basis, assumption_set, horizon,
        market_snapshot_version, reference_data_version) → Cashflow[]
```

Same inputs, same outputs, always — no ambient configuration, no hidden state. Reproduction is
*asserted*, not assumed, through four mechanisms:

1. **Per-contract digests** stored every end-of-day — a silently undetectable failure becomes one
   detected next day at contract granularity.
2. **Full detail frozen for regulatory reporting dates** (4–20 dates a year) — regeneration removed
   from the critical path where a regulator will ask.
3. **Engine builds retained as versioned artefacts** (a procurement requirement for the bought pricing
   library — long-term version retention and escrow).
4. **A regeneration test running from Phase 1**, comparing regenerated output against stored digests.

**Provenance of three kinds** survives aggregation: market-data provenance (observed, interpolated,
stale, proxied, model-implied, manually marked), encumbrance provenance (externally asserted,
platform-asserted, operationally maintained), and model provenance (which models contributed, and their
validation status). *"How much of this ratio rests on non-observed prices?"* is a query, not an
investigation.

---

## 5. Running the bank — the daily cycle

The nightly pipeline is a **DAG, not a sequence**: a stage blocks only its descendants, never the whole
run. A 7-hour unattended window (last input ~00:00, first hard deadline 07:00) is met by a Tier-A
critical path of **≤ 90 minutes** that delivers cash and nostro position, funding requirement, limits
and ratio status — **avoiding the entire valuation subtree**, because LCR falls out as balance ×
prescribed factor, not valuation.

**Degradation order** (approved by ALCO): A — cash, nostro, funding, limits, ratios by 07:00 · B —
full LCR/NSFR, P&L, ALM and risk measures same day · C — accounting postings, GL reconciliation, FTP,
management reporting (may run late) · D — scenario/stress runs, non-regulatory analytics (skippable,
back-filled). Off-window: counterparty exposure simulation (PFE/EPE/XVA).

**Gates** — arrival, validation, reconciliation, approval, completion, plausibility and model-validity
checks, each Pass / Warn / Fail. **Warn** proceeds with the provisional flag; **Fail** blocks
descendants. The provisional flag is **transitive through the DAG, rendered on the artifact itself**
(report, export, API, file name), and clears only by resolving the gate and re-running — producing a
new version, never an overwrite.

---

## 6. The control environment

- **The platform is the sub-ledger; the GL is the control account.** Differences are exceptions to be
  explained, never adjustments to be plugged. Seven reconciliations, from custodian (three-way, adding
  the encumbrance register as the third leg) through nostro, dual-mastered attributes, GL, valuation,
  sub-ledger-to-GL and confirmation status.
- **A break is an object with a lifecycle** — one five-day-old break, not five — requiring a stated
  cause. Record counts and control totals are mandatory on every feed; a partial acquisition that looks
  successful is treated as the danger it is.
- **Quarantine presents, never excludes.** Suspense positions appear on the balance sheet and every
  ratio report, even when zero.
- **Four-eyes is a platform service, not a per-module feature** — nine controlled actions live in Phase
  0 alone. Every audit record carries a correlation ID spanning modules.
- **The impact statement is a capability, not a document** — apply a rule change without committing it,
  re-run against a frozen population, diff taxonomy lines and ratio buckets, *then* activate.
- **Model governance accretes from Phase 0.** The inventory is ~26 models, not the ~8 it appears to be
  — proxies and fallbacks are models too. Validation technique is an inventory field; approved usage is
  a list of named consumers and purposes.

---

## 7. What the bank can do with it, stage by stage

| Phase | Delivered | What the bank can do that it cannot today |
|---|---|---|
| **0 · Foundation** | Bitemporal reference data, contract/leg/balance store, projection engine, classification rules engine, ingestion and reconciliation, orchestration and gates, control core, encumbrance register | A complete, classified balance sheet with projected cashflows for every position — reconciled daily, reproducible for any past date |
| **1 · Liquidity** | Cashflow ladder, LCR, NSFR, HQLA, concentration, regulatory factor rule sets, regeneration test | Daily regulatory liquidity ratios from the bank's own records |
| **2 · Valuation** | Pricing library (bought), curves, sensitivities, `exposure_by_bucket` | Independent valuation and daily P&L |
| **3 · ALM & IRRBB** | Repricing gap, EVE, NII, behavioural models, scenarios, internal liquidity metrics | ALCO pack, IRRBB returns, internal stress view. Assumptions explicit, versioned and challengeable |
| **4 · Front-to-back** | Deal capture, confirmation, settlement, full collateral, accounting, limit framework | Treasury as system of record with straight-through processing |
| **5 · Risk** | VaR/ES, stressed VaR, attribution, backtesting, PFE/EPE, full XVA | Full market and counterparty credit risk measurement |
| **6 · FTP & Regulatory** | Funds transfer pricing, full returns engine | Business-unit performance; regulatory returns as configuration, not code |
| **7 · Governance** | Aggregate model risk — inventory-wide reporting, risk appetite, model provenance | Audit and regulator ready |

**Liquidity comes before interest-rate risk deliberately** — it is what regulators ask for first and is
computable from prescribed rules; IRRBB needs valuation and behavioural models and is genuinely harder.
Each stage is usable on its own; the programme can stop after any stage with the value intact.

**Pre-deal analysis** is available from Phase 1: *"what does a three-year 500m issue do to our
liquidity ratios and funding concentration?"* — answered in seconds, before the deal is done. That is
what turns the platform from a reporting tool into a decision tool.

---

## 8. Build vs buy

| Component | Posture | Reasoning |
|---|---|---|
| D1, D2, D3 — data core, classification, liquidity | **Build** | The bank's specific structure; poorest off-the-shelf fit |
| D16 matching engine, D17 orchestrator | **Buy**; build the adapters | Mature vendor market; not a differentiator |
| Pricing library (D8) | **Buy** | Validating pricers across the full range is a multi-year specialist commitment. Must price **barriers and digitals** |
| Phase 0 curves | Consume vendor-published; build in-house from Phase 2 | Calibration needs the Phase 2 library |
| Phase 4 front-to-back | **Evaluate seriously for purchase** | Commodity, high volume, unforgiving |
| Risk analytics (D11) | Buy the analytics; build the limit framework | As valuation |
| Regulatory returns (D13) | **Build** | Must be configurable to the local regulator |

Two procurement requirements that are otherwise missed: long-term **version retention and escrow** for
the pricing library, and **raw quotes rather than derived factors** when buying market-data history.

---

## 9. What "good" looks like — three tests anyone can apply

1. **Point at any figure in any report and ask why.** The answer is a rule, a version, the inputs that
   satisfied it, and who approved it — one query, not a research exercise.
2. **Ask for a report as it stood three years ago.** It reproduces exactly, under the rules, assumptions
   and data that applied then.
3. **Ask why a ratio moved.** The answer decomposes into balance-sheet change, market change and
   assumption change, separately.

> A platform that cannot do these three is a reporting tool. One that can is a control environment.

---

## 10. The source design corpus

This overview consolidates the implementation whitepaper and its supporting artefacts:

- **`Treasury-ALM-Risk-Platform-Implementation-Whitepaper.md`** — the single consolidated specification
- **`artifacts-flat/`** — the full design corpus: 17 module deep-dives (D1–D17), Phase 0–7 ticket
  specifications, the classification rules engine, rate transformation grammar, taxonomy mapping and
  query specification, the architecture critique, the decisions register, and the executive summary
- **`treasury-alm-risk-platform/`** — the structured blueprint, module specs and executable tickets
- **`diagrams/`** — domain map, EOD DAG, critical path and dependency graphs
