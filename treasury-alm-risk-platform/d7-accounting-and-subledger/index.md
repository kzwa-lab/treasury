---
kind: spec
title: "D7 — Accounting & Sub-ledger"
---

# D7 — Accounting & Sub-ledger

IFRS 9 classification and measurement, effective interest, hedge accounting, derecognition, and the
double-entry sub-ledger that feeds the GL. Parent: `treasury-alm-risk-platform`. Phase 4.

**Why this module is unlike the others.** Elsewhere, being wrong produces a bad decision. Here it
produces a **restatement**. D7 is also the module the external auditor examines directly, so its
outputs must be explainable to someone who did not build it and does not accept "the system calculates
it."

**Why it carried the most unremediated detail.** Revision 1 of the blueprint described D7 in three
lines and got four things materially wrong — macro hedge accounting was absent, hedged items were
assumed to be Contracts, cost of hedging was omitted, and the effectiveness language was IAS 39. The
critique corrected the framing; this spec works it through.

## 1. Responsibilities

**D7 owns:** the business model assessment and SPPI test; **authorship of the accounting classification
rules** D2 executes; effective interest and amortisation; modification accounting; hedge accounting
including designation, effectiveness and rebalancing; derecognition assessment; IAS 32 presentation and
offsetting; the double-entry sub-ledger and posting rules; and the derived equity reserves.

**D7 does not own:** ECL computation (external engine, via D2 §6.3); valuation (D8); the contract store
(D2); the GL itself (core banking); the GL reconciliation *execution* (D16 — D7 supplies the sub-ledger
side); collateral state (D6).

**The rule-authoring boundary.** D7 authors accounting classification rules; D2 stores and executes
them. This works, with one asymmetry that must be designed for: **business model is assessed at
portfolio level, SPPI at instrument level.** The rules engine needs both scopes — a portfolio-scoped
rule that assigns business model, and an instrument-scoped rule that evaluates SPPI over the
accounting-characteristics view (D2 §6.2).

## 2. Classification and measurement

### 2.1 The two tests

**Business model** — how a portfolio of assets is managed: hold to collect, hold to collect and sell,
or other. Assessed at portfolio level, evidenced by how performance is evaluated and how sales history
actually looks, not by intent stated at inception. Changes are **rare, prospective, and require a
change in how the business is run** — not a change of mind.

**SPPI** — whether contractual cashflows are solely payments of principal and interest on the principal
outstanding. Instrument-level, and a legal-terms analysis: it requires leverage assessment, contingency
features, prepayment and extension terms, and any modified time value of money. **This is precisely why
D2 publishes the accounting-characteristics view** — D7 cannot perform SPPI on common attributes alone,
and the terms payload is otherwise closed to it.

### 2.2 Resulting categories

| Category | Condition | Measurement | Notes |
|---|---|---|---|
| Amortised cost | HTC + SPPI passes | Cost less allowance | **Carrying amount = gross − ECL allowance** |
| FVOCI — debt | HTC&S + SPPI passes | Fair value | **ECL in P&L with the entry in OCI; carrying amount stays fair value.** Recycles to P&L on disposal |
| FVOCI — equity | Irrevocable election at initial recognition | Fair value | **No impairment, and never recycles.** Dividends to P&L |
| FVTPL | Default — fails SPPI, or held for trading, or FVO designated | Fair value | Includes held CLNs (D2 §2.6) |

**A correction to D2 §6.3.** That section states amortised cost carrying amount = gross − allowance,
which is right, but it must not be generalised. **For FVOCI debt, the ECL allowance does not reduce the
carrying amount** — carrying amount remains fair value, and the allowance is recognised in profit or
loss with the corresponding entry in the FVOCI reserve. The ECL interface must therefore carry the
measurement category so the presentation is correct per instrument, and D2's balance derivation must
branch on it.

**FVOCI debt and FVOCI equity behave oppositely on the two things that matter** — impairment and
recycling — and are routinely implemented as one category. They are not one category.

### 2.3 Fair value option and own credit

FVO designation avoids bifurcation for hybrid liabilities (D2 §2.6), but **own-credit fair value change
is presented in OCI** (IFRS 9 5.7.7). Consequences: a separate own-credit reserve line; a **CET1
prudential filter** that D13 must apply; and the OCI amount **never recycles to P&L**, even on
derecognition. Not a simplification — a different set of moving parts.

### 2.4 Reclassification

Permitted only on a change in business model, applied **prospectively** from the reclassification date,
never restated. Rare enough that it should be a controlled, four-eyes, disclosed event rather than a
routine capability — but it must exist, because when it happens it is material and heavily disclosed.

## 3. Effective interest and amortisation

**EIR** discounts estimated future cashflows through expected life to the gross carrying amount,
incorporating transaction costs, fees integral to the yield, discounts and premiums — which is why
D2's accounting-characteristics view must expose fee, discount and premium components separately.

**Three cases that are routinely missed:**

**Stage 3 assets — interest on the net carrying amount.** Once credit-impaired, interest revenue is
calculated on the amortised cost *net of allowance*, not gross. This makes **D2's accrual output a
function of the ECL allowance**, which is why the ECL interface runs inbound as well as outbound
(D2 §6.3) and why EOD sequencing must place the ECL interface before accrual.

**POCI assets — credit-adjusted EIR.** Assets purchased or originated credit-impaired use an EIR that
incorporates expected credit losses at initial recognition, and never move between stages in the normal
way. Small population, entirely different mechanics, and consistently forgotten in system design.

**Modification accounting.** When contractual terms change, the assessment is whether the modification
is **substantial**:

| | Treatment |
|---|---|
| **Substantial** | Derecognise the original, recognise a new instrument at fair value. Often a P&L event |
| **Non-substantial** | Recalculate gross carrying amount as the PV of modified cashflows **at the original EIR**, with the difference to P&L immediately |

Non-substantial modification producing an **immediate P&L catch-up** is the piece most often missing
from systems, and it is material wherever restructuring occurs. It requires D2's `AMENDED` and
`RESTRUCTURED` events to carry enough before/after detail for the test and the recalculation.

## 4. Hedge accounting

The largest and most under-specified area in revision 1.

### 4.1 Framework — decided

**Decision: IFRS 9 only. No macro hedge accounting. One rule set.**

IFRS 9 does not address macro hedging, and the IASB's Dynamic Risk Management project is not yet a
standard. Two accommodations exist — applying IAS 39 for portfolio fair value hedges of interest rate
risk (IFRS 9 6.1.3), or applying IAS 39 hedge accounting in its entirety (7.2.21). **Neither is taken.**

The bank will micro-hedge specific issuances and exposures under IFRS 9, and hedge the banking book's
structural interest rate position **economically, without hedge accounting.**

#### What this buys

- **One rule set.** No IAS 39 portfolio machinery, no dual regime, no 80–125% bright line anywhere.
  D7 is materially smaller than under either alternative
- **Cost of hedging remains available** (§4.6) — the decisive advantage over applying IAS 39, since
  under IAS 39 the FX basis spread on cross-currency funding has nowhere to go but P&L
- **Aggregated exposures** (a bond and its swap designated as one hedged item) remain available
- Rebalancing rather than hedge failure, so far less de-designation churn

#### What this costs, stated plainly

**Derivatives hedging the structural banking book carry their fair value movements through P&L with no
offsetting remeasurement of the hedged item.** That is earnings volatility which is economically
meaningless and must be explained every period.

**The risk is still hedged.** Only the earnings presentation differs. D9's EVE and NII measures are
unaffected by this decision — an economic hedge reduces measured interest rate risk whether or not
hedge accounting applies. Nobody should read this decision as a reduction in hedging.

**But it creates a divergence between the economic position and the accounting result**, and that
divergence has to be explainable. This makes D9's requirement to report **both the gross banking book
position and treasury's residual after hedging** (`d9-alm-and-irrbb` §8) more important, not less — it
becomes the bridge between the risk report and the P&L.

#### Mitigations available within IFRS 9

Three routes recover much of the benefit without macro hedge accounting:

1. **Micro fair value hedges of specific fixed-rate issuances** — covered bonds, senior unsecured, Tier
   2. These are the highest-value relationships and are fully available under IFRS 9
2. **Cash flow hedges of forecast interest cashflows**, including groups of forecast transactions on a
   rolling basis. Where the exposure is cashflow variability rather than fair value, CFH under IFRS 9
   covers a meaningful part of structural hedging without portfolio fair value machinery
3. **Measurement category alignment** — where a hedged exposure can sit at FVTPL, the natural offset
   removes the need for designation entirely

#### The capital cost, added after D13 was specified

**Surfaced by `d13-regulatory-reporting-and-capital` §2.2, and it runs opposite to intuition.**

| Approach | Where volatility lands | CET1 impact |
|---|---|---|
| Cash flow hedge accounting | Cash flow hedge reserve (OCI) | **None — filtered out of CET1** |
| **No hedge accounting** | P&L → retained earnings | **Direct — retained earnings *is* CET1** |
| Micro fair value hedge | P&L both sides, net ineffectiveness only | Minimal |

Basel's cash flow hedge reserve filter exists precisely to keep economically meaningless hedge
volatility out of capital. **Declining hedge accounting declines that protection**, moving volatility
from a filtered reserve into unfiltered CET1.

This does not overturn the decision, but it changes two things:

- **The §4.1 mitigations are CET1 protection, not accounting cosmetics.** Micro fair value hedges of
  specific issuances and cash flow hedges of forecast cashflows should be prioritised on that basis
- **The revisit threshold is CET1 volatility, not earnings volatility** — and the former binds first

#### Revisit trigger, and its cost

Reconsider if structural hedging volume grows materially, or when **CET1** volatility becomes
unacceptable to the board — which will arrive before earnings volatility does, per the above.

**Note the asymmetry: hedge designation cannot be applied retrospectively.** Adopting macro hedge
accounting later works prospectively only — the volatility already taken is not recoverable, and the
hedged item's carrying amount is not restated. Deferring the capability is cheap; the accounting
consequence of having deferred it is permanent for the intervening period.

### 4.2 Hedged items are frequently not Contracts

Revision 1 modelled hedge relationships as CONTRACT_LINKs. That fails for most of what a bank actually
hedges:

| Hedged item | Is it a Contract? |
|---|---|
| A specific issued bond | Yes |
| A **layer** of a portfolio (bottom layer of core deposits, a percentage of a loan book) | **No** |
| A **forecast transaction** (planned issuance, expected FX revenue) | **No — it does not exist yet** |
| A **risk component** (the benchmark rate component of a fixed-rate loan) | **No — it is part of an instrument** |
| A **net position** | **No** |

**Therefore hedge designation needs its own object in D7**, capable of referencing a Contract, a
portfolio layer with its own definition, a forecast transaction with expected timing and amount, or a
risk component. D2 carries the queryable **hedge designation dimension** (D2 §2.4) so taxonomy lines A.8
and B.8 can be generated; D7 owns the relationship itself.

### 4.3 Designation and documentation

**Documentation must exist at inception. It cannot be retrofitted** — a relationship undocumented on
day one is not a hedge, and no amount of later paperwork makes it one.

**This is a cross-module requirement, not an accounting-period task.** Designation intent, hedged item
identification, hedging instrument, risk being hedged, hedge ratio, and the effectiveness assessment
method must be captured **at booking, in D4**, and rejected at booking if incomplete. A system that
allows the trade in and the designation later will produce hedges that fail on audit.

### 4.4 Effectiveness — IFRS 9 language, not IAS 39

Revision 1 said "effectiveness testing," which is IAS 39. Under IFRS 9 the qualifying criteria are:

1. An **economic relationship** exists between hedged item and hedging instrument
2. **Credit risk does not dominate** the value changes
3. The **hedge ratio** reflects the actual quantities used

**No 80–125% bright line.** Assessment is prospective and qualitative where the relationship is clear.

**Rebalancing is mandatory, not optional**, when the hedge ratio ceases to be appropriate but the risk
management objective is unchanged — and **voluntary discontinuation is prohibited**. Both are behaviours
the system must implement, not merely permit: it must detect when rebalancing is required and prevent
de-designation that is not supported by a change in objective or the relationship ceasing to qualify.

Ineffectiveness is measured and recognised in P&L in all cases.

**Per the §4.1 decision, these criteria apply throughout.** There is no second regime and no bright
line anywhere in the module.

### 4.5 The three hedge types and their mechanics

| Type | Mechanism | Reserve |
|---|---|---|
| **Fair value hedge** | Hedged item remeasured for the hedged risk through P&L, offsetting the instrument | None — P&L both sides. **Micro relationships only**, per §4.1 |
| **Cash flow hedge** | Effective portion to the **cash flow hedge reserve** in OCI, recycled to P&L when the hedged cashflow affects earnings | Cash flow hedge reserve (Part 2 C.4). **Including groups of forecast transactions** — §4.1 mitigation 2 |
| **Net investment hedge** | Effective portion to the **FX translation reserve**, recycled on disposal of the foreign operation | FCTR (Part 2 C.4). **Not built — see below** |

**Net investment hedging: excluded from scope, blocked rather than decided.**

NIH requires a foreign operation to hedge, and whether one exists is **the same unresolved question as
the four group-structure signals** in parent Appendix D — A.9 associates and subsidiaries, C.6
non-controlling interests, B.6 own securitisation notes on balance sheet, and the FX translation reserve
itself.

The distinction between *blocked* and *decided out* matters and is deliberate. **If a foreign operation
exists, NIH is not the only thing that changes:** the single-entity decision in `d2-instrument-position-core`
§10 is also wrong, elimination and consolidation rules come into scope, D13 gains solo-versus-
consolidated reporting, and the FCTR becomes a real derived reserve rather than a taxonomy artefact.
These move together and must be resolved together — resolving NIH alone would be resolving the smallest
piece of the question.

**Until then:** NIH is not built, the FCTR is not populated, and the four signals remain open.

**Cash flow hedge specifics** that need explicit implementation: the lower-of test on the reserve;
recycling timing tied to when the hedged cashflow affects P&L; **basis adjustment** where the hedged
forecast transaction results in a non-financial asset; and the treatment when a forecast transaction is
no longer expected to occur — immediate recycling to P&L.

### 4.6 Cost of hedging

Omitted from revision 1 and **material for a bank funding through cross-currency swaps.**

IFRS 9 permits excluding certain elements from the hedge designation and deferring them in a separate
**cost of hedging reserve** in OCI rather than taking the volatility to P&L:

- **Time value of options** (6.5.15)
- **Forward element of forward contracts** and the **foreign currency basis spread** of financial
  instruments (6.5.16)

For a bank issuing in one currency and swapping to another, the FX basis spread is a real and volatile
number. Without cost-of-hedging treatment it lands in P&L; with it, it is deferred and amortised. The
election is per relationship and must be captured at designation.

## 5. Derecognition

Where the balance sheet is decided, and where getting it wrong is most visible.

**Securities financing.** Repo'd-out securities are **not derecognised** — substantially all risks and
rewards are retained. Reverse repo securities are **not recognised**. Full rules in D2 §2.9; D7 owns the
assessment behind them.

**Securitisation.** The risks-and-rewards and control assessment determines whether own-originated
assets leave the balance sheet. **Failed derecognition puts the notes on your balance sheet — which is
exactly what taxonomy line B.6 shows**, making it the third group-structure signal. This assessment also
drives D13's significant-risk-transfer conclusion for capital, so accounting and capital derecognition
must be reasoned about together even though they can diverge.

**Modification.** Substantial modification is a derecognition event (§3).

**Write-off.** When there is no reasonable expectation of recovery — a derecognition event distinct from
ECL provisioning, and frequently conflated with it.

## 6. Presentation and offsetting

**IAS 32 offsetting** requires a legally enforceable right of set-off *and* intention to settle net or
simultaneously. A master netting agreement alone is usually insufficient for balance sheet offsetting,
even where it supports credit risk netting — so **the accounting and regulatory netting answers differ
for the same netting set**, and both must be derivable from D1 §3.8's agreement data.

This determines gross-versus-net presentation for taxonomy lines A.3 and B.4, and the disclosure of
amounts subject to enforceable netting arrangements but not offset.

## 7. The sub-ledger

### 7.1 Posting generation

Postings derive from **Contract and Balance events plus valuations**, via versioned posting rules keyed
on product, event type and measurement category. **Every posting carries the object ID, event ID and
valuation reference that produced it** (parent §4) — this is what makes a GL break decompose to an
individual contract rather than to a lump.

### 7.2 Multi-currency

Transaction-currency accounting with revaluation to functional currency; monetary versus non-monetary
distinction; FX differences to P&L for monetary items and to OCI where they form part of a designated
relationship. Revaluation timing differences are a known GL break cause and need explicit cut-off
alignment with D16's reconciliation.

### 7.3 Derived equity reserves

Three of the four Part 2 C.4 reserve sub-lines are **derived accumulations with no primitive of their
own** (D2 §2.7) — computed at reporting time, never posted independently:

| Reserve | Source | Cross-module link |
|---|---|---|
| FVOCI revaluation reserve | D8 valuations of FVOCI positions | **The accounting expression of CSRBB** — must reconcile to D9 §7 |
| Cash flow hedge reserve | §4.5 effective portions | Carries more weight under the §4.1 decision |
| FX translation reserve | Consolidation of foreign operations | **Not populated — blocked on the group-structure investigation** (§4.5) |

Plus the own-credit reserve (§2.3) and, where cost of hedging is elected, the cost of hedging reserve
(§4.6). Both are additional derived reserve lines the source taxonomy does not enumerate — **the
taxonomy's C.4 is incomplete** and needs extending for either election.

### 7.4 The reconstitution obligation

Where the platform books linked Contracts for **risk visibility** but accounting does not bifurcate — a
held credit-linked note, which fails SPPI and goes to FVTPL in its entirety (D2 §2.6) — **D7 must
reconstitute single-instrument treatment from the linked pair.** Explicit in the interface, not
implicit, and reversed for issued structured deposits where accounting *does* bifurcate and the linked
pair maps directly.

## 8. Interfaces

**Inbound.** D2 — Contract and Balance events, accruals, amortisation schedules, and the
accounting-characteristics view (§2.1). D8 — valuations and, for hedge effectiveness, hedged item and
instrument value changes attributable to the hedged risk. External ECL engine via D2 — allowance and
stage, with measurement category (§2.2). D1 — GL chart, mapping, product catalogue, legal agreements
for §6. D6 — collateral positions affecting derecognition.

**Outbound.** Postings to the GL. Accounting classification rules to D2 (§1). Hedge designations and
the queryable designation dimension to D2. Derived reserve movements to D13 for capital, and the FVOCI
reserve to D9 for CSRBB reconciliation. Sub-ledger trial balance to D16 for reconciliation.

## 9. Acceptance criteria

1. Business model and SPPI operate at their correct scopes — portfolio and instrument respectively —
   and SPPI executes over the accounting-characteristics view without reading the terms payload
2. All four measurement categories are implemented with **FVOCI debt and FVOCI equity behaving
   differently on impairment and recycling**
3. ECL presentation branches on measurement category — reducing carrying amount for amortised cost,
   not for FVOCI debt
4. Stage 3 interest is calculated on net carrying amount, with EOD sequencing placing the ECL interface
   before accrual
5. POCI assets use a credit-adjusted EIR and are excluded from normal staging
6. Modification accounting distinguishes substantial from non-substantial, with the non-substantial
   catch-up to P&L at the original EIR
7. Hedge designation supports non-Contract hedged items — portfolio layers, forecast transactions, risk
   components, net positions
8. Designation documentation is captured **at booking in D4** and rejected if incomplete
9. Effectiveness follows IFRS 9 criteria throughout — no bright line, no second regime; rebalancing is
   detected and required; voluntary de-designation is prevented
9a. Cash flow hedges support **groups of forecast transactions**, since this carries part of the
   structural hedging load under the §4.1 decision
9b. The ALCO pack reconciles the **economic hedged position** (D9) to the **accounting result**, since
   §4.1 creates a permanent divergence between them
10. Cost of hedging election is supported per relationship, with the reserve
11. Derecognition assessments are recorded with their reasoning, and securities financing follows
    D2 §2.9
12. IAS 32 offsetting is assessed separately from regulatory netting over the same netting sets
13. Every posting traces to object, event and valuation; the sub-ledger trial balance reconciles before
    EOD reporting is released

## 10. Resolved decisions

| # | Question | Decision |
|---|---|---|
| 1 | Hedge accounting framework | **IFRS 9 only, no macro hedge accounting.** One rule set; structural banking book hedged economically, with the earnings volatility accepted and explained. Mitigations, costs and revisit trigger in §4.1 |
| 2 | Net investment hedging | **Excluded — blocked on the group-structure investigation, not decided out.** Moves together with the entity decision, elimination rules and D13 consolidation scope. §4.5 |

## 11. Open questions

1. **Is cost of hedging elected?** Material if the bank funds through cross-currency swaps; adds a
   reserve line the taxonomy does not carry.
4. **Does the bank apply the fair value option anywhere?** If so, the own-credit OCI reserve and its
   CET1 filter are in scope for D13.
5. **Are there POCI assets** — purchased loan portfolios, acquired impaired books?
6. **Own securitisation derecognition** — do the vehicles consolidate, and does derecognition fail?
   This is the same question as group-structure signal 3 and drives both accounting and capital.
7. ~~**Which GL is authoritative and what is its posting interface**~~ — **answered. See
   `gl-interface-decision`.** A **separate finance/ERP GL** is authoritative, not core banking; postings
   are **contract-level**, so reconciliation decomposes natively; cadence is **continuous for
   event-derived postings and EOD for computation-derived ones**, on the rule that a posting may be
   emitted intraday only if every input it depends on is already gated. A **daily trial balance extract**
   runs inbound.

   **Three consequences land on this module.** §7.1's traceability requirement is now also the GL's
   record, not only the sub-ledger's, since object, event and valuation references travel with each
   line. **Amendments and cancellations post as reversals, never as adjustments to a journal already
   sent** — a package that corrects by amending its own prior journal cannot be used against an external
   authoritative ledger. And §7.2's FX revaluation, being computation-derived, stays in the EOD
   sequence rather than moving intraday with the rest.
