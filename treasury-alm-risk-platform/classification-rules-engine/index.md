---
kind: spec
title: "Classification Rules Engine"
---

# Classification Rules Engine

The mechanism that assigns the fourteen dimensions to every Contract and Balance. Parent:
`treasury-alm-risk-platform`. Phase 0.

**It has no D-number, and that is the first risk.** Every other Phase 0 deliverable is a domain with a
boundary and an owner. This one is a capability spanning D1 (stores the rule sets), D2 (executes them)
and D7/D13/D11 (author them), which means the default outcome is that nobody builds it as a thing —
it gets built as "a bit of D2", which is to say a switch statement over product codes that a developer
extends whenever a new case appears. At that point the phase re-cut that justifies the whole programme
plan has quietly failed.

**Why the programme depends on it.** Parent §6's central move is separating **rule authoring** from
**module completion**: Phase 0 classifies the balance sheet correctly even though D7 (accounting rules)
arrives in Phase 4 and D13 (regulatory rules) in Phase 6. That separation is only real if a rule is a
piece of versioned data that a later module can author into an engine that already exists. **If rules
are code, a D13 factor change is a D2 release, and the phase plan collapses back into revision 1's
contradiction** — which the critique identified as C3.

**The one-line test:** point at any position on any historic report and ask why it carries the
classification it does. A correct build answers with a rule identifier, a rule version, the input
values that satisfied it, and the person who approved that version — in one query, without a developer.

## 1. Scope and ownership

**The engine owns:** rule evaluation; the input vector contract (§3); precedence and conflict
resolution (§4); the recompute trigger set (§5); overrides (§6); explainability records (§7); and the
regression corpus that gates rule changes (§8).

**The engine does not own:** the rule *content* — authored by D7 (accounting), D13 (regulatory and
factor sets), D11 (primary risk type), D9 (behavioural maturity, via model output), D1 (product and
counterparty derivations); the *storage* of rule sets, which is D1 §3.9; the objects being classified,
which are D2's.

**Physically it lives inside D2** and is invoked wherever classification is needed. Logically it is a
distinct component with its own tests, its own versioning and its own acceptance criteria, and it
should be planned, staffed and signed off as one.

### 1.1 The fourteen dimensions and who authors each

Restated from D2 §2.4 with the authoring timeline made explicit, because the timeline is the problem
(§9):

| Dimension | Derived from | Rule author | Author module arrives |
| --- | --- | --- | --- |
| Contractual maturity bucket | Maturity vs reporting date | D2 | Phase 0 |
| Behavioural maturity | Behavioural model output | D9 model, D2 executes | Phase 3 |
| Repricing basis + index | Leg rate treatment, next reset | D2 | Phase 0 |
| Currency | Per leg and per cashflow | D2 | Phase 0 |
| Product / GL mapping | Product code → GL map | D1 | Phase 0 |
| Counterparty type | Counterparty static | D1 | Phase 0 |
| Accounting classification | Business model + SPPI | **D7** | **Phase 4** |
| Regulatory classification | Issuer, instrument, rating, counterparty, encumbrance | **D13** | **Phase 6** |
| Book intent | Trading vs banking assignment | D7 / governed policy | Phase 4 |
| Hedge designation | Designation event | **D7** | **Phase 4** |
| Primary risk type | Explicit designation rule | **D11** | **Phase 5** |
| ECL stage | External ECL engine | External | Phase 0 interface |
| Held for sale | Management decision | D7 | Phase 4 |
| Capital instrument classification | Accounting + regulatory capital treatment | **D13** | **Phase 6** |

**Six of fourteen dimensions have an author that does not exist until Phase 4 or later**, and two of
those — accounting and regulatory classification — are load-bearing from Phase 0. §9 is about what
follows from that.

## 2. Rules are data

**The single design decision this component turns on.** The critique asked the same question of
behavioural models (§3.4, "data or code?") and the answer here must be the same and firmer, because
classification changes far more often than a behavioural model does.

A rule set is a **versioned, effective-dated, bitemporal artefact** held in D1 §3.9, containing:

| Element | Content |
| --- | --- |
| Scope | Which dimension, which object types, which entity |
| Conditions | Predicates over the declared input vector (§3) |
| Outcome | The dimension value assigned, or `not_applicable` |
| Precedence | Explicit rank within the rule set (§4) |
| Provenance | Author, approver, approval date, source (regulation, policy, standard) |
| Validity | Effective date range and knowledge date |

**Distinguish two change classes, exactly as the critique required for behavioural models:**

- **Rule change** — new conditions, new outcomes, new precedence. **Data. No release.** This is the
  common case: a factor changes, a threshold moves, a new product needs mapping.
- **Predicate vocabulary change** — a rule needs to test something the input vector does not carry.
  **That is a release**, because it extends the engine's contract with the rest of the platform.

If most changes fall into the second class, the input vector was specified too narrowly and the
separation is fictional. This is a design smell to watch for in build, not just at design time.

**Bitemporality is not optional here.** A rule corrected in 2026 with a 2024 effective date must
reclassify 2024 *for restatement purposes* while leaving the 2024 report reproducible as published.
This is the same requirement D1 §2 imposes on reference data, and classification rules are reference
data.

## 3. The input vector

**Classification is not a function of the object alone** (D2 §2.4). Specifying the input vector
explicitly is what makes rules portable, testable and independently authorable.

| Source | Inputs |
| --- | --- |
| The object | Contract or Balance attributes, terms payload fields declared as classifiable, leg structure, maturity, currency |
| D1 | Counterparty type and sector, ratings, product catalogue attributes, GL map, index definitions, currency restriction status |
| **D6** | **Encumbrance state and collateral allocation** |
| D9 / D15 | Behavioural model output for behavioural maturity |
| External ECL | Stage assignment |
| Management | Book intent, held-for-sale, hedge designation events |
| Context | **Reporting date**, legal entity, rule set version |

Two consequences that shape the build:

- **The terms payload is otherwise private to D2 and D8** (D2 §2.1). Classification needs to read parts
  of it, so the classifiable subset must be **declared per product family in D1's product catalogue**
  rather than reached into ad hoc. Otherwise the engine becomes the second module with an opinion about
  every product's internals, and the payload boundary erodes.
- **`reporting_date` is an input, not an environment.** It is what makes the maturity bucket dimension
  time-varying (§5), and passing it explicitly is what keeps evaluation reproducible.

## 4. Precedence, conflict and the absence of a default

Multiple rules will match one object. Three requirements:

1. **Deterministic precedence.** Explicit rank within a rule set, evaluated in order, first match wins.
   Never source order, never insertion order, never whichever the engine happened to index first.
2. **Conflicts are detectable before deployment, not at runtime.** Two rules with overlapping
   conditions and different outcomes at the same precedence is a **rule set validation failure** that
   blocks activation. Discovering it at runtime means a population silently splits by evaluation order.
3. **There is no default outcome.** An object matching no rule is **unclassified**, and unclassified
   routes to D16's suspense presentation (`d16-ingestion-reconciliation-dq` §4.3) — visible on the
   balance sheet as an unclassified line, aged, and escalated.

**The third is the one that gets designed away under delivery pressure.** A default of "banking book"
or "amortised cost" or "corporate" makes the daily batch run clean and produces a balance sheet that is
confidently wrong. An unclassified line is ugly, and being ugly is its function. D2 §2.4's hard rule 1
— no object stored without a complete classification, with `not_applicable` permitted where a dimension
is genuinely meaningless — is enforced here, and `not_applicable` must be a **rule outcome**, never a
fallback for "no rule matched".

## 5. Recompute — the part that is usually got wrong

**Classification changes without anything happening to the contract.** A design that recomputes only on
contract events is wrong, and it is the natural design.

| Trigger | Example | Frequency |
| --- | --- | --- |
| **Passage of time** | A 13-month deposit enters the ≤12-month bucket tomorrow with no event at all | **Daily, every object** |
| Encumbrance change | A bond is pledged and leaves the HQLA buffer that moment (parent §1.7) | Event-driven, intraday |
| Counterparty static change | A rating downgrade changes regulatory classification and HQLA level | Event-driven |
| ECL stage migration | Stage 2 → 3, which also changes D2's accrual basis (parent §2.6) | Periodic |
| Management decision | Held-for-sale designation, book intent transfer | Event-driven, controlled |
| **Rule version activation** | A factor set change reclassifies a population overnight | Rare, high impact |
| Behavioural recalibration | New model parameters change behavioural maturity | Periodic |

**Which leads to a real design decision: what is stored and what is computed.**

- **Computed at query time:** dimensions that are pure functions of the object plus the reporting date —
  contractual maturity bucket, repricing basis, currency. Storing these means a daily rewrite of the
  entire population to no benefit, and a stored maturity bucket is stale the moment the date rolls.
- **Stored, with the rule version that produced it:** dimensions that are rule outcomes over inputs that
  change independently — accounting and regulatory classification, book intent, capital instrument
  classification, hedge designation, primary risk type. These are decisions, they need an audit trail,
  and recomputing them silently at query time would make a historic report change under a reader.

**One of those dimensions has a second consumer that must not share it — `D11-8`.** The **SA-CCR
hedging set is not the primary risk type dimension**, and the two are close enough to be conflated by
anyone implementing them from this list. They have different cardinality and different purposes:

| | Primary risk type | SA-CCR hedging set |
|---|---|---|
| Purpose | Presentation and risk reporting — *what kind of risk is this?* | A prescribed regulatory partition within which exposures may offset |
| Cardinality | **One per contract.** A cross-currency swap gets a single designation | **A contract may belong to more than one**, and a cross-currency swap belongs to both an FX and an interest rate hedging set |
| Author | The bank, by rule | Prescribed by the Basel framework |

**Sharing the field understates cross-currency exposure**, and it does so silently: a cross-currency
swap assigned primary risk type `FX` disappears from the interest rate hedging set, so its rate exposure
never enters the SA-CCR add-on. The error direction is always understatement, because a single
designation can only ever drop memberships. **They are two dimensions, and the hedging set is
prescribed rather than authored** — closer in kind to the regulatory classification D13 owns than to the
bank's own primary-risk rule (`d11-market-and-counterparty-risk` §3.2). This is cheap to separate now
and expensive once the primary-risk rule has been authored and run across the derivative book.

**The rule-version-activation trigger deserves its own handling.** A rule change can reclassify a large
population at once, moving material balance between taxonomy lines and between LCR/NSFR factor buckets.
It must run as a controlled event with an impact statement produced *before* activation (`d15-control-core`
§4), not discovered in the next morning's ratio movement.

## 6. Overrides

Manual override of a rule outcome is legitimate and must be rare, visible and bounded. Per D2 §2.4 rule
2 and parent §2.3: **four-eyes, reason-coded, audited and reported**, executed through the platform
control service (`d15-control-core` §3).

Four requirements beyond the approval itself:

1. **An override is attached to the object and dimension, never to the rule.** Editing a rule to
   accommodate one contract silently reclassifies every similar contract.
2. **Overrides are reported as a population, not as individual exceptions.** "How much balance is
   classified by override rather than by rule" is a control metric, and a rising number means the rule
   set is wrong rather than that the exceptions are justified.
3. **An override does not silently survive a rule change.** When the rule that was overridden changes,
   the override is flagged for review — it may have been the reason the rule was fixed.
4. **Overrides expire.** A date after which the override must be re-approved or lapse, matching the
   treatment of manual market data marks (`d3-market-data-and-curves` §5). Permanent overrides are how
   a rule set rots without anyone deciding to let it.

## 7. Explainability

**The engine's most-used output is not the classification. It is the explanation.**

For any object, dimension and date, the platform must return: the rule set version in force, the rule
that matched, the input values it matched on, the outcome, whether an override applied and who
approved it. This is what answers a regulator's "why is this Level 1 HQLA", a finance question about a
line movement, and an auditor's sample test — and it is what makes classification defensible rather
than merely present.

**Store the explanation, do not reconstruct it.** Reconstruction requires the exact rule version, the
exact input values and the exact reference data version as at that date, all of which exist but whose
retrieval is a small research project each time. For stored dimensions (§5) the explanation record is
written alongside the outcome; it is small, and it converts a research project into a lookup.

**Population-level explainability matters as much as the single object.** "Which rule classified these
4,000 deposits, and what changed between yesterday and today" is the question that actually gets asked
when a ratio moves, and it should be answerable by grouping stored explanations rather than by
re-running anything.

## 8. Testing and the regression corpus

**The rule set is the highest-consequence configuration in the platform**, and unlike code it has no
compiler. Three mechanisms:

1. **A reference population with expected classifications** — a curated set covering every product
   family, every taxonomy line, the `not_applicable` cases, and the known-hard routing rules (NCD B.3
   vs B.6, promissory notes, syndicated participations, AT1 to B.7 or C.5). Every rule change runs
   against it before activation. This is the classification equivalent of D2's convention test suite.
2. **Rule set validation** — no unreachable rules, no unresolved conflicts (§4), no reference to
   predicates outside the declared input vector, complete coverage assertions per dimension.
3. **Impact simulation before activation** — run the candidate rule set against the current live
   population and diff. What reclassifies, how much balance moves, which taxonomy lines and ratio
   buckets change. This is the same capability `d15-control-core` §4 requires for retroactive-effect
   changes generally, and it is a Phase 0 build item that D1 §4 assumes and nobody has specified.

**The regression corpus is a deliverable with an owner**, not a by-product of testing. It outlives the
build team and is the artefact that makes a rule change in year six as safe as one in year one.

## 9. Who authors the Phase 0 rules?

**The gap this deep-dive exists to surface.** Six of fourteen dimensions are authored by modules
arriving in Phase 4 or later (§1.1), and two of them are needed from Phase 0:

- **Accounting classification** — D2's hard rule 1 requires it on every object from Phase 0, and D7
  arrives in Phase 4.
- **Regulatory classification** — parent §7 makes correct classification the thing Phase 1's LCR
  depends on, since LCR is balance × prescribed factor over classified balances. D13 arrives in
  Phase 6, with its factor rule sets nominally pulled forward to Phase 1.

**"The rule author is D7" is a statement about custody, not about who does the work in Phase 0.** The
engine ships empty unless someone authors into it, and no module owns that in the current plan.

**Resolution: name interim rule owners as Phase 0 roles, not modules.** Finance authors the accounting
rule set; regulatory reporting authors the regulatory and factor rule sets; both work to the same
versioned, effective-dated artefact the engine will consume for the platform's whole life. When D7 and
D13 are built, they take **custody of rule sets that already exist and are already in production** —
which is a considerably better position than authoring from scratch against a live balance sheet, and
is the strongest practical argument for the rules-as-data decision in §2.

This needs to be an explicit Phase 0 staffing line. It is not a software task, it is the same class of
work as the legal agreement extraction (D1 §7) — subject-matter effort that the build depends on and
that no engineer can do.

## 10. Performance

Recompute across the full population — D2 §4.4 puts the effective contract count at a multiple of 500k
once internal mirrors are included — times fourteen dimensions, inside the EOD window, on the critical
path between ingestion and everything else.

Three things keep it bounded:

- **Query-time dimensions are not recomputed at all** (§5), which removes the daily-churn dimensions
  from the batch entirely.
- **Stored dimensions recompute only on trigger**, and most triggers touch a small population. The
  exception is rule version activation, which touches everything and should be schedulable as a
  controlled event rather than arriving inside a normal EOD.
- **Evaluation parallelises by object**, like projection.

**The intraday path is the one to design for, not the batch.** Encumbrance changes trigger
classification recompute (D2 §6.1) and collateral moves during the day; HQLA composition must reflect a
pledge within the treasury book's near-real-time freshness expectation (D2 §5.1), not at the next EOD.

## 11. Acceptance criteria

1. A rule change is a data change with no code release; the release boundary is only crossed when a
   rule needs a predicate outside the declared input vector
2. Rule sets are versioned, effective-dated and bitemporal; a historic report reproduces under the
   rules in force at the time, and a retroactive rule correction can restate without destroying the
   original
3. Precedence is explicit; overlapping rules with different outcomes at equal precedence fail rule set
   validation and cannot be activated
4. There is no default outcome — an unmatched object is unclassified and appears in D16's suspense
   presentation; `not_applicable` is only ever an explicit rule outcome
5. Classification recomputes on all seven triggers in §5, including the passage of time and encumbrance
   change, not only on contract events
6. For any object, dimension and date the platform returns the rule version, matched rule, input values,
   outcome and any override with its approver — as a stored lookup, not a reconstruction
7. Overrides are per object and dimension, four-eyes, reason-coded, expiring, reported as a population,
   and flagged for review when the underlying rule changes
8. The regression corpus covers every product family, every taxonomy line and every known routing rule,
   and runs on every rule change
9. Impact simulation runs before activation of any rule change: what reclassifies, how much balance
   moves, which taxonomy lines and ratio buckets change
10. Interim Phase 0 rule authorship is named and staffed for accounting and regulatory classification

## 12. Open questions

1. **Who authors the Phase 0 accounting and regulatory rule sets?** §9. This is a staffing decision with
   a Phase 1 dependency — Phase 1's LCR is not computable without regulatory classification — and it has
   no owner today.
2. **Rule expression language.** A decision table, a constrained expression grammar, or a full rules
   engine product? A decision table covers most of the fourteen dimensions and is auditable by a
   non-developer, which is the property that matters; a general engine is more expressive and harder to
   govern. Recommend starting from decision tables and escalating only where a dimension genuinely
   needs it.
3. **Build or buy.** Rules engines are a mature market, but the value here is the integration with
   bitemporal reference data, the input vector and the explanation store — none of which a generic
   product provides. Lean build, with the expression evaluator possibly bought.
4. **How much of the terms payload is classifiable?** §3. Declaring it per product family is a D1
   product catalogue task that must complete before the engine can be tested against real instruments.
5. **Reclassification versus correction.** D2's event list carries `RECLASSIFIED`. The policy
   distinguishing a prospective reclassification (a genuine change of intent, which regulators scrutinise
   for arbitrage — D1 §3.1) from a retroactive correction of an error needs stating, since they have
   different disclosure and restatement consequences.

## Appendix — amendments applied from sibling modules

| Ref | Applied | Section |
|---|---|---|
| `D11-8` | **The SA-CCR hedging set is a separate dimension from primary risk type** — different cardinality, prescribed rather than authored, and sharing the field understates cross-currency exposure in a direction that is always understatement | §5 |

Raised by `d11-market-and-counterparty-risk` and recorded as deferred-with-trigger in the parent's D11
appendix; applied here under *"the primary risk type rule is authored, or `classification-rules-engine`
is next amended"*. The ref keeps its originating namespace (`blueprint-amendment-protocol` R1).

**Timing is the point.** The finding costs nothing while the primary-risk rule is unwritten and a great
deal once it has been authored and run across the derivative book — and P0-15's interim rule authorship
is where the primary-risk rule gets written. **`D11-10` is the related open item:** the interim owner for
non-rate risk factor representation is still unnamed, and P0-15 explicitly scopes primary risk type
*out*, so the dimension that this amendment splits in two currently has no author in either Phase 0 or
Phase 1.
