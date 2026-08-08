---
kind: spec
title: "D13 — Regulatory Reporting & Capital"
---

# D13 — Regulatory Reporting & Capital

Regulatory capital, risk-weighted assets, leverage, large exposures, and the configurable returns
engine. Parent: `treasury-alm-risk-platform`. Phase 6 — **but see §1.1, because a substantial part of
it must land in Phase 0.**

**Why several modules push requirements here.** D13 is where the platform meets the regulator, so every
module that produces a regulated number terminates in it: D2's regulatory classification, D9's IRRBB
outlier tests and CSRBB, D10's LCR and NSFR, D11's counterparty and market risk capital, D7's
derecognition conclusions and prudential filters, D1's netting enforceability. It is the collection
point, and it is where inconsistencies between modules become visible as a failed return.

## 1. Responsibilities

**D13 owns:** regulatory capital composition and the accounting-equity-to-CET1 bridge; RWA across all
risk types; the leverage ratio; large exposures; **authorship of the regulatory classification rules and
prescribed factor sets** that D2 and D10 execute; the returns engine; Pillar 3 disclosure; and capital
planning and projection.

**D13 does not own:** the numbers it aggregates (D2, D8, D9, D10, D11); accounting classification (D7);
scenario definitions (D14); the rule *store* (D1 §3.9 holds the versioned rule sets D13 authors); the
reporting calendar's *execution* (D17 acts on it, D1 holds it, D13 defines which dates matter).

### 1.1 The rule-authoring inversion — D13 splits across phases

**This is the defining structural feature of the module and the thing most likely to be planned wrong.**

D13 completes in Phase 6. But D2 requires regulatory classification rules in **Phase 0** (HQLA level,
risk weight bucket, LCR run-off, NSFR ASF/RSF — D2 §2.4), and D10 requires the prescribed factor sets
in **Phase 1**. A module that arrives in Phase 6 cannot be the sole source of rules needed in Phase 0.

**Resolution: D13 is built as two components with different delivery dates.**

| Component | Delivers | Phase |
|---|---|---|
| **D13-A — Rule authoring** | Regulatory classification rules, LCR/NSFR factor sets, HQLA eligibility rules, prescribed NMD maturity caps. Authored by D13's owners, stored versioned and effective-dated in D1 §3.9, executed by D2 and D10 | **Phase 0–1** |
| **D13-B — Computation and reporting** | Capital, RWA, leverage, large exposures, returns engine, Pillar 3, capital planning | **Phase 6** |

D13-A is a **specification and configuration activity, not a software build** — its output is versioned
rule content, and the engine that executes it belongs to D2 and D10. Planning D13 as a single Phase 6
deliverable strands Phases 0 and 1.

## 2. Capital

### 2.1 Accounting equity is not regulatory capital

The bridge from one to the other is an explicit, auditable computation — never a spreadsheet — and it
draws on more modules than any other calculation in the platform.

```
Accounting equity (Part 2 C.1–C.6)
  − / +  prudential filters
  −      regulatory deductions
  =      CET1
  +      AT1 (eligible instruments)
  =      Tier 1
  +      Tier 2 (eligible instruments)
  =      Total capital
```

**Prudential filters — each sourced from a different module:**

| Filter | Source | Effect |
|---|---|---|
| **Cash flow hedge reserve** relating to items not fair-valued | D7 §4.5 | **Derecognised from CET1** — see §2.2, which matters more than it looks |
| **Own credit** fair value change on FVO liabilities | D7 §2.3 | Derecognised from CET1; never recycles |
| **Prudent valuation / additional valuation adjustments** | D8, informed by D3 provenance | Deducted from CET1 where fair value is uncertain |
| IFRS 9 ECL transitional arrangements, where elected | D7 / external ECL | Phased add-back |

**Deductions:** goodwill and intangibles (Part 2 A.13), deferred tax assets relying on future
profitability above threshold (A.14), significant investments in financial sector entities (A.9),
defined benefit pension surpluses, and holdings of own instruments.

**Note that four of these deduction lines are Balance objects, not Contracts** (D2 §2.7) — which is a
concrete reason the Balance primitive had to exist. Capital cannot be computed from Contracts alone.

**Capital instrument eligibility** is the other half: AT1 and Tier 2 instruments must meet criteria on
subordination, permanence, loss absorption and absence of incentives to redeem. This is what the
**capital instrument classification dimension** (D2 §2.4) carries, and it also routes the instrument to
taxonomy line B.7 or C.5. Grandfathering of legacy instruments is a dated, per-instrument attribute.

### 2.2 A capital consequence of the hedge accounting decision

**Surfaced by writing this module, and it should feed back into `d7-accounting-and-subledger` §4.1.**

The decision was IFRS 9 only, with no macro hedge accounting — structural banking book hedges run
economically, with fair value movements through P&L. The accounting cost was stated as earnings
volatility. **There is a capital cost that was not stated, and it runs in the opposite direction to
intuition:**

| Approach | Where the volatility lands | CET1 impact |
|---|---|---|
| **Cash flow hedge accounting** | Cash flow hedge reserve (OCI) | **None — the reserve is filtered out of CET1** |
| **No hedge accounting** | P&L → retained earnings | **Direct — retained earnings *is* CET1** |
| **Micro fair value hedge** | P&L both sides, net ineffectiveness only | Minimal |

**So not applying hedge accounting moves volatility from a filtered reserve into unfiltered CET1.** The
prudential filter exists precisely to keep economically meaningless hedge volatility out of capital, and
declining hedge accounting declines that protection.

**This strengthens the §4.1 mitigations rather than overturning the decision.** Micro fair value hedges
of specific issuances and cash flow hedges of forecast cashflows are not accounting cosmetics — **they
are CET1 protection**, and they should be prioritised on that basis. It also sharpens the revisit
trigger: the threshold for reconsidering is not "when earnings volatility becomes uncomfortable" but
"when CET1 volatility becomes uncomfortable", and the latter binds first.

## 3. Risk-weighted assets

| Risk type | Approach | Principal dependencies |
|---|---|---|
| **Credit risk** | Standardised assumed — exposure class, external rating, CRM | D2 classification; D1 counterparty type, ratings, guarantees |
| **Counterparty credit risk** | **SA-CCR, computed per netting set** | D11; **D1 §3.8 netting sets and enforceability opinions** |
| **CVA capital** | Standardised CVA | D11; same netting sets |
| **Market risk** | Standardised — trading book only | **D2's book intent dimension** (§2.4) is the scope boundary |
| **Securitisation** | SEC-SA / SEC-ERBA as applicable | **D7's derecognition conclusion and significant risk transfer** |
| **Operational risk** | Standardised — business indicator based | Financial statement inputs |

**Credit risk mitigation is where D1 pays for itself.** Collateral, netting and guarantees reduce RWA
only where legally enforceable. **A netting opinion gap is a capital cost, not a data gap** (D1 §7) — an
unenforceable netting set means gross exposure, and the difference is often material.

**Regulatory netting and accounting offsetting give different answers for the same netting set**
(D7 §6). Both derive from the same D1 agreement data and both must be produced; treating them as one is
a common and material error.

**Significant risk transfer** for own securitisations is assessed here, and it interacts with — but is
not identical to — D7's accounting derecognition conclusion. The two can legitimately diverge, and both
must be recorded with their reasoning.

## 4. Leverage ratio

Tier 1 capital over the exposure measure. The exposure measure is not the balance sheet, which is what
makes it easy to get wrong:

- On-balance-sheet exposures, **including Balance objects** — cash, reserves, PP&E, all of it
- Derivative exposures via SA-CCR replacement cost plus potential future exposure
- **Securities financing add-on**, with prescribed limited netting — repo and reverse repo gross up the
  measure in ways the balance sheet does not
- Off-balance-sheet items at prescribed credit conversion factors (Part 2 D.1–D.3)

**The SFT treatment is where D6's data earns its place** — the leverage measure needs transaction-level
repo detail, not net positions.

## 5. Large exposures

Uses the **third counterparty grouping — connected clients** (D1 §3.2), which is neither the legal
entity used for netting nor the economic group used for concentration. The regulatory connectedness
test can capture parties with no ownership link, through economic interdependence.

Requires: exposure aggregation across all instrument types to the connected group; the limit as a
percentage of Tier 1; exemptions and their conditions; and breach reporting. **This is the specific
requirement that makes a single "parent counterparty" field insufficient** — a platform with one
hierarchy will report concentration correctly and large exposures incorrectly, or the reverse.

## 6. The returns engine

**Local returns are definitions plus templates, not code.** This is what makes the "configurable
regulatory layer" scope decision real.

Three separated concerns:

1. **Data definitions** — what populates a cell, expressed as a query over Positions, Balances and
   computed measures
2. **Templates** — the return's structure, validation rules and cross-checks
3. **Submission** — format, channel, and the submission calendar

**Historic reproducibility is a hard requirement.** A return must reproduce under the rules, factors and
templates in force at the time (D1 §3.9). Regulators ask about prior submissions, and "we can't
reproduce it under the old rules" is a finding.

**Cross-return consistency is a first-class check.** The same figure appearing in two returns must
agree, and inconsistency between submissions is one of the most common regulatory challenges. The
engine should enforce this before submission, not discover it afterwards.

### 6.1 Reporting dates need a stricter gate

**A submitted return cannot be provisional.** D17's normal gate policy allows an override that marks
outputs provisional and lets the run proceed. **On regulatory reporting dates that policy must tighten:
no override may permit a submission to be produced from provisional data.**

This is the operational counterpart to the priority inversion already specified — on reporting dates
regulatory output rises to tier A (`eod-window-and-degradation` §5.1), and the gate policy tightens at
the same time. Both are driven from the same submission calendar: **D13 defines the dates, D1 holds
them, D17 enforces them.**

## 7. Capital planning and projection

Forward-looking capital adequacy under base and stress conditions, feeding ICAAP. Consumes D14
scenarios and projects the same bridge as §2.1 forward.

**Three paths into projected capital that are easy to miss**, and all three come from other modules'
work in this blueprint:

1. **CSRBB** (`d9-alm-and-irrbb` §7) — spread moves on the FVOCI portfolio flow through OCI into CET1
   **without ever appearing in P&L**. A capital measure, not only a risk measure
2. **P&L volatility from unhedged structural positions** (§2.2) — now a direct CET1 path following the
   hedge accounting decision
3. **ECL migration under stress** — stage 1 to stage 2 transitions multiply lifetime loss recognition,
   which hits retained earnings and therefore CET1 sharply and non-linearly

## 8. Interfaces

**Inbound — D13 is the platform's collection point:**

| Source | Content |
|---|---|
| D2 | Positions and Balances with regulatory classification; capital instrument classification; book intent |
| D7 | Accounting equity, prudential filter inputs, derecognition and SRT conclusions, derived reserve movements |
| D8 | Valuations and prudent valuation / AVA inputs |
| D9 | ΔEVE and ΔNII for outlier tests and disclosure; **CSRBB for capital projection** |
| D10 | LCR, NSFR, and their component detail |
| D11 | SA-CCR exposures, CVA, market risk measures — all per netting set |
| D1 | Counterparty hierarchies (all three groupings), ratings, netting sets and enforceability opinions |
| D14 | Scenarios for capital projection |
| External ECL | Allowance and staging for transitional arrangements |

**Outbound:** regulatory classification rules and prescribed factor sets to D1 §3.9 for D2 and D10 to
execute (§1.1); **Tier 1 capital to D9 and D10** as the denominator for outlier tests and internal
ratios; submission calendar to D1 for D17; Pillar 3 disclosures; capital adequacy to ALCO and the
board.

**Note the circularity, which is legitimate and bounded:** D13 supplies Tier 1 to D9 for the IRRBB
outlier test, and consumes D9's ΔEVE result. This is not a loop because they are different quantities
at different times — the outlier test uses the *prior* period's capital as its denominator. It must be
implemented that way explicitly, or it becomes a genuine circular dependency.

## 9. Acceptance criteria

1. **D13-A rule authoring delivers in Phase 0–1**, independently of D13-B (§1.1)
2. The accounting-equity-to-CET1 bridge is a traceable computation, with every filter and deduction
   attributable to its source module
3. Balance objects are included in capital deductions and the leverage exposure measure
4. SA-CCR, CVA and large exposures all compute per the correct counterparty grouping without manual
   mapping
5. Netting enforceability gaps produce gross exposure and are **reported as a capital cost**, not
   silently netted
6. Regulatory netting and accounting offsetting are computed separately from the same agreement data
7. Any historic return reproduces under the rules, factors and templates in force at the time
8. Cross-return consistency is validated before submission
9. **No submission is produced from provisional data**, and the reporting-date gate policy is enforced
   automatically from the submission calendar
10. Capital projection includes the CSRBB, unhedged-volatility and ECL-migration paths (§7)

## 10. Open questions

1. **Standardised or IRB for credit risk?** Assumed standardised throughout. IRB changes the data
   requirements materially and brings the output floor into scope.
2. **Which local returns, in what templates, on what calendar?** The configurable design holds
   regardless, but the Phase 6 build cannot be sized without the list.
3. **Are IFRS 9 transitional arrangements elected?** Affects the CET1 bridge and its phasing.
4. **Is the fair value option used anywhere?** Determines whether the own-credit filter is live
   (D7 §2.3).
5. **What is the deposit insurance scheme's coverage threshold and aggregation rule?** Needed by D1 and
   D10, and D13 owns the interpretation.
6. **Group structure** — the four unresolved signals in parent Appendix D determine whether solo and
   consolidated reporting are both required, which is the single largest scope variable in this module.
