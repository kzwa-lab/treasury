# D1 — Reference & Static Data

The definitional substrate every other module reads. Parent: `treasury-alm-risk-platform`. Phase 0.

**Why this module is chronically under-built, and why it grew in revision 2.** Reference data has no
visible output — no ratio, no report, no screen a treasurer looks at — so it loses every prioritisation
argument to modules that produce numbers. But it is the only module where **a change retroactively**
**alters history**: correct a holiday calendar and yesterday's payment dates move. Revision 2 added legal
agreements and netting sets (critique C9) and made versioning mandatory across everything (C5), which
together roughly double its scope.

**The one-line test for whether D1 is built correctly:** can you reproduce a report from three years
ago, using the calendars, conventions, counterparty hierarchy and product definitions that were in
force on that date? If not, the platform's reproducibility guarantee (parent §5) is decorative.

## 1. Responsibilities

**D1 owns** nine data domains (§3), their versioning and effective dating, the governance around
changing them, and the golden-source designation for each.

**D1 does not own:** market data and curves (D3 — the distinction is §2); the classification rules
*engine* (D2 executes; D1 holds the versioned rule sets); rule *authorship* (D7 for accounting, D13 for
regulatory); contracts and balances (D2); collateral state (D6 — D1 holds the agreement, D6 holds what
is pledged under it).

### 1.1 The D1 / D3 boundary

Both are "data the platform reads rather than transacts." The distinction:

|  | D1 Reference & Static | D3 Market Data |
| --- | --- | --- |
| Changes | Rarely, by decision, with approval | Continuously, by observation |
| Correction semantics | A correction is **retroactive** and needs a new version | A correction is a new observation |
| Example | The definition of what SOFR compounding means | Today's SOFR fixing |

**Index definitions live in D1; index values live in D3.** The compounding convention, fixing source,
publication lag and fallback waterfall are definitional; the number published each morning is
observational. Systems that put both in the market data store cannot version the convention, which is
exactly what benchmark transition made necessary.

## 2. Versioning and effective dating — the hard requirement

**Every entity in D1 is bitemporal.** Effective date (when the fact became true) and knowledge date
(when the platform learned it) are independent, matching D2 §3.

This is the requirement that makes D1 difficult, and revision 1 omitted it entirely — it versioned
market data, models and scenarios but not reference data.

**Three rules:**

1. **A correction creates a new version; it never edits an existing one.** If a holiday was missing from
 the 2024 calendar and is discovered in 2026, the 2024 calendar gets a new version with a 2026
 knowledge date. The original version remains, because reports produced in 2024 used it and must
 still reproduce.
2. **Every consumer query carries a reference data version**, exactly as it carries a market snapshot
 version (D2 §4). A projection run without one is not reproducible.
3. **Version transitions are explicit events**, not implicit consequences of an edit — so "why did this
 number change" resolves to a dated, attributed, reason-coded reference data change.

**The failure this prevents.** A calendar correction silently shifts historic payment dates, which
shifts the historic liquidity ladder, which means last quarter's LCR no longer reproduces — and nobody
knows why, because nothing in the audit trail records a calendar edit. This is subtle, common, and
corrosive to trust in the platform.

## 3. The ten data domains

**Ten, not nine.** §3.10 was added after the fact — see its opening note. The section number is
appended rather than inserted, so every existing citation of `D1 §3.1`–`§3.9` still resolves.

### 3.1 Legal entity and organisational structure

Legal entities; books and portfolios; desks and trading units; the hierarchy connecting them; and the
mapping from book to legal entity, to regulatory book intent (trading vs banking — D2 dimension 9), and
to reporting lines.

**Book assignment is a regulatory boundary, not an organisational convenience** (`d9-alm-and-irrbb`
§2). Movement between trading and banking book must be controlled, documented, four-eyes approved and
rare — regulators treat unexplained reclassification as arbitrage.

Legal entity is carried as a mandatory attribute with a single value today, pending the four
unresolved group-structure signals in parent Appendix D.

### 3.2 Counterparty and customer master

The largest and most consequential domain. **Three distinct groupings, routinely and damagingly**
**conflated:**

| Grouping | Definition | Used for |
| --- | --- | --- |
| **Legal entity** | The specific entity you contracted with | Netting enforceability, settlement, confirmation matching |
| **Economic group** | Parent and subsidiaries under common control | Concentration risk, funding concentration (D10 §5), single-counterparty limits |
| **Connected clients** | Entities linked by control *or* economic interdependence, per the regulatory definition | Large exposures regime (D13) |

These are three different trees over the same population. Netting applies at the legal entity level;
concentration at the economic group; the large exposure regime uses its own connectedness test which
may capture parties with no ownership link at all. **A single "parent counterparty" field cannot serve**
**all three**, and building one is how banks end up reporting concentration correctly and large exposures
incorrectly, or vice versa.

Per counterparty: identity and identifiers (LEI where available), legal entity type, jurisdiction of
incorporation, industry and sector classification, credit ratings by agency with history, internal
rating, and the counterparty type dimension D2 requires (retail, SME, corporate, bank, sovereign,
public sector).

**Two attributes that exist purely to serve liquidity and must not be forgotten:**

- **Deposit insurance status and coverage**, determined **per depositor** against the scheme threshold
by aggregating balances across accounts and products. This is what makes the LCR's stable versus
less-stable retail split computable (`d10-liquidity-and-funding` §3.1) and it is a customer-level
computation, not an account attribute.
- **Operational relationship designation** for corporate deposits — whether the deposit arises from
cash management, clearing or custody services. This is a documented relationship classification with
evidence, not a product code, and it carries a large LCR run-off differential.

### 3.3 Product catalogue

**The configuration surface that makes "adding an instrument is configuration, not a project" true or**
**false.** Per product family:

- The **terms payload schema** D2 validates against on write (D2 §2.1)
- Permitted **leg structures and rate treatments** (D2 §2.2)
- **Structured product tier** assignment (D2 §2.6)
- **Default classification rules** across the fourteen dimensions, and which are derivable versus
requiring input
- **GL mapping** — to the balance sheet line in the source taxonomy Part 2
- Booking, lifecycle and settlement conventions
- Whether the product requires **product-approval sign-off** before first use

**The GL mapping is where the Part 2 routing rules live** (`part2-taxonomy-mapping` §7.1): the rule
distinguishing NCDs issued to customers (B.3) from certificates of deposit issued (B.6) is a product
catalogue rule, testable and versioned, not a booking convention left to whoever enters the trade. The
two lines carry different NSFR ASF factors, so the rule has a regulatory consequence.

### 3.4 Calendars and conventions

Holiday calendars per financial centre; settlement calendars; business day conventions; day count
conventions; roll conventions including IMM and end-of-month; settlement cycles per instrument and
market; cut-off times.

Small, dull, and the source of a disproportionate share of defects. **Calendars are the canonical**
**example of retroactive correction** (§2) and are the reason versioning is non-negotiable.

Calendars are typically sourced externally. The golden-source designation and the process for
incorporating updates — including late-announced public holidays, which are common in some
jurisdictions — need an owner and a control.

### 3.5 Index and benchmark definitions

Per index: publication source and time, publication lag, tenor, day count, **compounding or averaging**
**convention**, observation shift or lookback method, and the **fallback waterfall** if the index ceases
or is non-representative.

**Post-benchmark-transition, this is definitional data with real complexity.** A compounded-in-arrears
RFR needs its observation method specified precisely enough that D2's projection engine can handle
partial observation of the current period (D2 §4.1) — which fixings count, over which observation
window, with what shift. Two banks using "SOFR compounded" with different observation shifts produce
different cashflows on identical trades.

Fallback provisions are contractual and definitional at once: the fallback waterfall in the index
definition must reconcile with the fallback language in the legal agreements (§3.8).

### 3.6 Currency and rounding

Currency codes, decimal precision, rounding conventions per currency and per calculation type,
settlement conventions, and any restriction status — non-deliverable, capital-controlled, or subject
to a pegged or managed rate. The restriction attribute is what tells D2 that a forward against this
currency is an NDF (D2 §2.2) and tells D10 that currency's liquidity cannot be assumed fungible
(`d10-liquidity-and-funding` §3.4).

### 3.7 General ledger chart and mapping

The GL chart of accounts, the mapping from product and event type to GL account, and the mapping from
GL account to the source taxonomy's Part 2 line items. This is the join that makes parent §4's
sub-ledger-to-GL reconciliation decomposable to individual contracts.

### 3.8 Legal agreements and netting sets

**Added in revision 2 (critique C9). Absent from revision 1 entirely, and blocking for Phases 4–6.**

A three-level hierarchy:

```
Master agreement (ISDA, GMRA, GMSLA)
  └── Annex / schedule (CSA, GMRA annex)
        └── Netting set
```

**Master agreement** — type, counterparty legal entity, governing law, execution date, termination
events, cross-default provisions, and the **jurisdictional netting enforceability opinion** with its
review date. Enforceability is a legal opinion that expires and must be refreshed; it is a dated
attribute with a review cycle, not a boolean.

**Credit support annex** — threshold, minimum transfer amount, independent amount, eligible collateral
schedule with haircuts, **rating downgrade triggers**, rehypothecation rights, valuation agent,
dispute resolution, and call frequency.

**Netting set** — the set of Contracts covered by one enforceable netting arrangement. First-class
because:

| Consumer | Why it needs the netting set |
| --- | --- |
| D11 | **SA-CCR computes exposure at default per netting set.** So does CVA. Neither is computable without it |
| D7 | Gross-versus-net presentation for taxonomy lines A.3 and B.4 depends on IAS 32 offsetting enforceability |
| D10 | LCR downgrade-trigger outflows are CSA rating triggers (`d10-liquidity-and-funding` §3.3) |
| D6 | Threshold, MTA, eligible collateral and rehypothecation drive margining and collateral optimisation |

**Terms are structured data, not attached PDFs.** A scanned CSA in a document store cannot drive a
margin call, an SA-CCR calculation or an LCR outflow.

**This is the long pole in Phase 0, and it is not a software problem.** Extracting structured terms
from executed agreements is a legal document review exercise across the full counterparty population.
It needs a named owner, a defined extraction template matching the fields above, and a timeline that
starts before the build does — the same argument as the collateral history reconstruction
(`d10-liquidity-and-funding` §3.6), and the two exercises should be scoped together since they cover
overlapping counterparties.

### 3.9 Classification rule sets

D1 holds the **versioned, effective-dated rule sets**; D2 executes them; **D7 authors the accounting**
**rules and D13 the regulatory rules** (parent §6). Holding them here is what lets the classification
rules engine live in Phase 0 while its authoring modules complete in Phases 4 and 6.

Also held here: LCR and NSFR factor sets, HQLA eligibility rules, and the prescribed non-maturity
deposit maturity caps — all regulator-given constants that must be configuration rather than code, so a
factor change is a rule edit and historic ratios reproduce under the factors then in force.

### 3.10 Bucket, band and vertex definitions

**Added because three modules consume this data and none owns it.** Parent Appendix H3 made repricing
bucket definitions shared D1 reference data; it was applied to the blueprint and never here, leaving
D2's maturity dimension, D8's `exposure_by_bucket`, D9's gap ladder and D14's transformation grammar
consuming a reference set with no home (parent `I6`).

**It matters more than a tenth domain usually would.** `d11-market-and-counterparty-risk` §2.2.1
establishes that under the standardised approach *the sensitivities are the market risk capital number*.
The tenors a sensitivity is computed at are therefore an input to RWA, and they are held here.

#### 3.10.1 Two object kinds, and the difference is not cosmetic

| Kind | Shape | Authored or derived | Example |
| --- | --- | --- | --- |
| **Boundary set** | *n+1* ordered boundaries defining *n* intervals | Authored | The 19 repricing bands; D10's liquidity ladder |
| **Vertex set** | *m* ordered points | **Either** — derived from a boundary set, or prescribed outright | D14's grammar node set (derived: band midpoints); the standardised-approach tenor vertices (prescribed) |

**A bucket is an interval and a vertex is a point** — they cannot be one list, and the platform needs
both. Where a vertex set is derived, **the derivation rule is stored here and the result is cached, not
independently maintained**: two lists that happen to agree are one edit away from disagreeing, and the
disagreement breaks only the aggregation of one view into the other, which is the half nobody tests.

**Not every vertex set is derived, and this is the correction to make now rather than later.** The
standardised-approach vertices are prescribed points with no underlying band structure. A domain that
models only "boundary sets, from which points are derived" cannot hold them, and they are the set with a
capital number attached.

#### 3.10.2 The four families

| Family | Partitions by | Authored by | Consumers |
| --- | --- | --- | --- |
| **Repricing bands** | When the rate resets | D9, adopting the prescribed IRRBB time bands | D8 `exposure_by_bucket`, D9 gap ladder, D14 node derivation |
| **Liquidity ladder** | When cash moves | D10 (§2.1), plus any locally prescribed return bucketing | D10 survival horizon, funding gap, stress |
| **Presentation maturity** | Contractual maturity as a disclosure dimension | The Part 2 taxonomy | D2 dimension 1, balance sheet reporting |
| **Regulatory tenor vertices** | Not a partition — prescribed points | **D13**, as with every other prescribed constant (D14 §1.2) | D8 sensitivity production, D11 aggregation and market risk RWA |

**The families are not reconcilable to one another and must not be forced to be.**
`d9-alm-and-irrbb` §3 gives the canonical example: a 5-year floating loan resetting quarterly sits in the
5-year *liquidity* bucket and the 3-month *repricing* bucket. One list across families puts it in one
place and is wrong in at least one report.

#### 3.10.3 The rate vertex set — one list, prescribed vertices as a subset

**Decision, resolving `d11-market-and-counterparty-risk` §2.2.1's recommendation and D14 open question
9: the platform holds one rate vertex set, defined as the union of the derived band midpoints and the
prescribed capital vertices.** Both regulatory views are then exact subsets of it, and no number is
interpolated between the risk report and the capital calculation.

| Source | Vertices |
| --- | --- |
| Derived — IRRBB band midpoints (19) | 0.0028, 0.0417, 0.1667, 0.375, 0.625, 0.875, 1.25, 1.75, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 12.5, 17.5, 25 |
| Prescribed — standardised-approach GIRR delta (10) | 0.25, 0.5, 1, 2, 3, 5, 10, 15, 20, 30 |
| Prescribed — standardised-approach credit spread delta (5) | 0.5, 1, 3, 5, 10 — a subset of GIRR, adding nothing |
| **Union — the platform rate vertex set (29)** | 0.0028, 0.0417, 0.1667, **0.25**, 0.375, **0.5**, 0.625, 0.875, **1**, 1.25, 1.75, **2**, 2.5, **3**, 3.5, 4.5, **5**, 5.5, 6.5, 7.5, 8.5, 9.5, **10**, 12.5, **15**, 17.5, **20**, 25, **30** |

Three consequences, and the second is a decision nobody has costed:

1. **The two prescribed sets barely overlap.** Of the ten capital vertices, only 25 is close to a band
   midpoint and none coincides exactly. A node set built from either alone forces interpolation into the
   other's number — unattributable in exactly the way the grammar's residual discipline exists to prevent.
2. **The sensitivity fan-out grows from 19 to 29 nodes — roughly 53%** — against `d8-valuation-and-analytics`
   §6's compute envelope and `eod-window-and-degradation` §5's window. **This is the real price of one
   list, and it is worth paying**, because the alternative is two ladders whose difference has to be
   explained every reporting date. It should be sized deliberately rather than discovered.
3. **30 years enters the vertex set by prescription**, independent of the banking book's duration. The
   rate grammar's open question — whether to extend past the 25-year terminal node if the book has
   material long-dated exposure — is **resolved in the affirmative for a reason unrelated to the book**:
   the capital calculation requires a 30-year vertex whatever the banking book holds. The materiality
   test still decides whether the *band* structure extends; the vertex set no longer waits on it.

#### 3.10.4 Rules

| Rule | Statement |
| --- | --- |
| **Refinement, never re-partition** | Where an internal boundary set is finer than a prescribed one, every prescribed boundary must also be an internal boundary. The prescribed view is then an exact summation, not a re-bucketing judgement |
| **Prescribed subset** | A platform vertex set contains every prescribed vertex exactly. Nearest-neighbour mapping is not permitted |
| **Derivation is stored, not re-implemented** | A derived vertex set names its boundary set and its rule; changing a boundary changes the vertices as a consequence, not as a second task |
| **No cross-family substitution** | A consumer names the family it wants. There is no default bucket set and no implicit fallback between families |
| **Prescribed sets are D13-authored** | Same rule class and same authorship as every other regulator-given constant (D14 §1.2). The internal band structure is changeable by the bank; the capital vertices are not |

#### 3.10.5 Versioning

Boundary and vertex sets are **retroactive-effect attributes under §4** and among the most retroactive in
D1: a boundary change moves every historic gap ladder, every historic sensitivity ladder, and — since
`d11-market-and-counterparty-risk` §2.2.1 — every historic market risk RWA. **A change requires four-eyes
plus an impact statement**, and the impact statement's period is the full retained history, not the
current reporting period.

Bitemporal like everything else here (§2), and every consuming query carries the reference data version —
which is what makes D14's grammar version resolvable at all, since the grammar references this domain
rather than copying from it.

## 4. Governance and control

**Static data is a control surface, not just a data set.** Two categories deserve specific treatment:

**Fraud-sensitive attributes.** Standing settlement instructions, counterparty bank account details and
payment routing are classic fraud vectors — a changed SSI redirects real money. These require
**four-eyes approval, callback verification against an independently sourced contact, and a mandatory**
**notification to the relationship owner on change.** Treat SSI modification as a higher control tier
than other static changes.

**Retroactive-effect attributes.** Calendars, conventions, index definitions and classification rules
change historic numbers. These require four-eyes plus an **impact statement**: what reproduces
differently, and over what period.

**Golden source designation.** Every attribute has one authoritative source — external vendor, core
banking, legal documentation, or manual maintenance — recorded explicitly. Where two systems hold the
same attribute, one is authoritative and the other reconciles to it (D16). Undeclared dual mastery is
the root of most static data disputes.

**Maker-checker with segregation from users.** The person who maintains a counterparty limit must not
be the person who trades against it.

## 5. Interfaces

**Inbound.** External vendors (calendars, ratings, sector classifications, LEI reference); core banking
(customer master, account-to-customer linkage for deposit insurance aggregation); legal and
documentation function (executed agreements, extracted terms, netting opinions); D7 and D13 (rule set
authorship, **including the prescribed capital tenor vertices — §3.10.2**); D9 and D10 (the repricing
band and liquidity ladder boundary sets they author — §3.10.2); manual maintenance under §4 controls.

**Outbound.** Everything. D1 is read by every other domain. The interface obligation is that **every**
**read is version-addressable** — a consumer asks for the counterparty hierarchy *as at* a date and
knowledge date, not simply the current one.

## 6. Acceptance criteria

1. Every D1 entity is bitemporal; a correction creates a version and never edits one
2. Any historic report reproduces using the reference data in force at the time — demonstrated by the
 Phase 1 regeneration test (D2 §7.4), which must vary reference data version as well as market data
3. The three counterparty groupings are separately modelled and independently queryable
4. Deposit insurance coverage is computable per depositor by aggregating across accounts and products
5. Netting sets are structured, queryable, and carry enforceability opinions with review dates; SA-CCR
 and CVA can compute per netting set without manual mapping
6. CSA terms — threshold, MTA, eligible collateral, downgrade triggers, rehypothecation — are
 structured fields, not documents
7. Product catalogue changes add an instrument without code change, including its terms schema, GL
 mapping and default classification
8. Every Part 2 line has an unambiguous GL mapping rule, including the NCD B.3/B.6 routing rule
9. SSI changes require four-eyes plus callback verification; retroactive-effect changes require an
 impact statement
10. Every attribute has a declared golden source; dual-mastered attributes reconcile through D16
11. The platform rate vertex set contains every prescribed capital vertex **exactly**; no sensitivity
 reaches the RWA calculation through a nearest-neighbour mapping (§3.10.3, §3.10.4)
12. A derived vertex set is reproducible from its boundary set and derivation rule; changing a boundary
 changes the vertices without a second edit (§3.10.1)
13. Every prescribed boundary is also a boundary of any finer internal set, and the prescribed view
 reproduces as an exact summation of internal bands (§3.10.4)
14. A boundary or vertex change carries an impact statement covering the full retained history,
 including historic market risk RWA (§3.10.5)
15. No consumer resolves a bucket set by default; the family is named in the request (§3.10.4)

## 7. Open questions

1. **Legal agreement extraction — who and by when?** The full counterparty population needs structured
 terms extracted from executed documents. This is a legal review project, it is the Phase 0 long
 pole, and it should be scoped alongside the collateral history reconstruction since the counterparty
 populations overlap.
2. **Netting opinion coverage.** Does the bank hold current enforceability opinions for every relevant
 jurisdiction? Gaps mean exposures cannot be netted for capital purposes, which is a real capital
 cost, not a data gap.
3. **Customer master ownership.** Core banking presumably masters customers, but D1 needs the three
 groupings and the insurance aggregation. Is the hierarchy maintained anywhere today, or does it need
 building?
4. **Ratings sourcing.** Which agencies, what internal rating scale, and how are the two mapped for
 HQLA eligibility and risk weighting?
5. **Calendar golden source**, and the process for late-announced public holidays.
6. **Historic reference data.** Bitemporality is only useful from the point history exists. Is there any
 prior-state reference data to load, or does the platform's reference history start at go-live —
 which would cap how far back reproducibility can reach?
