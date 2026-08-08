# Appendix B.1 — Part 2 Query Specification

The executable form of the Appendix B design test: for each of the 40 Part 2 line items, the **object
type**, the **source system**, the **exact query predicate**, and the **measure taken**.

**This is a second, independent hand-run.** `part2-taxonomy-mapping` ran the same test first and its
remediation is already in revision 2 of the blueprint. That artifact classifies each line by
primitive; it carries no source column and no predicate column, so it establishes *what* each line
is but not *how it is produced*. This one supplies both, and — because it was run independently — it
also serves as a cross-check. It agrees on the shape of the answer, disagrees on the counts for five
identifiable reasons (§3), and surfaces **eight findings the first run did not** (§4).

Where the two disagree, `part2-taxonomy-mapping` is the record of what was remediated in revision 2
and this artifact is the challenge to it. Neither supersedes the other until the five open modelling
calls in §3 are settled.

---

## 1. Vocabulary

### 1.1 Object behaviours

Per revision 2: **Contract** (dealt or originated — legs, cashflows, projectable), **Balance**
(GL-sourced carrying amount, no legs, no projection), **Derived** (computed at query time, never
stored — storing it double-counts).

**This was the one disagreement with the first run, and it is now settled in favour of Contract.**
`part2-taxonomy-mapping` classed equity securities and short positions as **Balance**; they are
**Contracts with a quantity leg**. An equity purchase has a trade date, a settlement date, a
counterparty, a quantity and a price, so it is unambiguously a deal; as a Balance it has no
settlement instruction to give D5, no counterparty for settlement risk, and no way to represent
B.4's short positions. Revision 2's `not_applicable` classification values remove the original
objection (no maturity, no repricing basis), and its quantity leg for commodities supplies the
mechanism.

**The revised Balance definition.** Settling the equity case forced a better line than "no legs, no
cashflows". Two formulations were proposed:

| Formulation | Verdict |
|---|---|
| *A Balance is a position with no originating transaction the platform records* | Correct on the case that mattered, but makes object type depend on **integration scope** rather than on the nature of the position — the same item is a Contract at one bank and a Balance at another, and could change type as feeds are added in later phases. It also mis-sorts three lines: nostro balances (D5 records every settlement that moves them), ROU assets (the lease *is* recorded, but the asset amortises on an accounting schedule with no projectable cashflow), and A.9 |
| **A Balance is a position whose amount is *asserted* by an external system rather than *derived* from terms the platform holds** | **Recommended.** Resolves equity for the same reason, and additionally sorts nostro (asserted by the correspondent's statement), ROU assets (asserted by the leasing system's schedule), A.9 (asserted by consolidation) and provisions correctly. Stable under changing integration scope, and directly testable: *can you compute this from what D2 holds, or must someone tell you the number?* |

The second formulation also **subsumes the GL sourcing rule in §4/F11** — GL is a source where the
amount is asserted and a control where it is derived — so one test governs both the object model and
the feed inventory. It applies at **measure** level as well as object level: a Contract may carry
asserted measures (the ECL allowance, an external pricer's fair value) alongside derived ones, which
is exactly what the ECL interface is.

### 1.2 Dimension set

Revision 2's fourteen — eight risk/behaviour plus six presentation/accounting. This run requires one
further split, giving fifteen:

| | Dimension | Note |
|---|---|---|
| c1–c5 | `maturity_bucket`, `behavioural_maturity`, `repricing_basis`+`reference_index`, `currency`, `product_type`→`gl_map` | As revision 2 |
| **c6a** | `counterparty_type` — **transaction counterparty** | **Split required — see §4/F2** |
| **c6b** | `obligor_type` — **issuer / obligor** | For a security this is the issuer, *not* the seller |
| c7 | `accounting_classification` | **Needs `FVOCI_debt` and `FVOCI_equity` as separate values — see §4/F5** |
| c8 | `regulatory_classification` | **Stated content omits `ccf` and leverage treatment — see §4/F4** |
| p1–p6 | `hedge_designation`, `regulatory_book`, `risk_type`, `ecl_stage`, `held_for_sale`, `capital_instrument_class` | As revision 2 |

### 1.3 Measure set — the part the design test never specified

**A line is a *(measure, predicate)* pair, not a predicate alone.** Six lines require a sub-contract
split that no dimension set can express (§4/F1). The measures:

`gross_carrying_amount` · `drawn_amount` · `undrawn_limit` · `accrued_interest` · `loss_allowance` ·
`fair_value` · `notional` · `designated_proportion` · `quantity` · `insured_portion` ·
`operational_portion`

---

## 2. The map

Every predicate carries an implicit `AND legal_entity = X AND as_of = D AND held_for_sale = false`
(§4/F8) except A.16 and B.14.

### A — Assets

| Line | Object | Source | Predicate | Measure |
|---|---|---|---|---|
| **A.1** Cash and balances with central banks | Balance **+ Contract** | Branch cash system; CB account statement (D5); **D4 for facility placements** | `direction=asset ∧ c6a=central_bank ∧ c5 ∈ {vault_cash, cb_reserve_mandatory, cb_reserve_excess, cb_deposit_facility}` | `gross_carrying_amount`. Vault cash `c6a=none`. Mandatory vs excess carry different `hqla_level`. **Standing-deposit-facility placements are booked deals, so this line is mixed, not pure Balance** |
| **A.2** Due from banks / interbank placements | Balance + Contract | Nostro statements (D5); D4 | `direction=asset ∧ c6a=bank ∧ c5 ∈ {nostro, interbank_placement, call_notice}` sliced by `c1` | `gross_carrying_amount`. Overdrawn nostros flip to B.2 (§4/F7). **A.2/A.5 boundary undefined (§4/F6)** |
| **A.3** Trading book financial assets (FVTPL) | Contract | D4 | `direction=asset ∧ c7=FVTPL ∧ p2=trading ∧ p1=none`; debt `c5=debt_security`; **equity `c5=equity`**; derivatives `c5=derivative ∧ fair_value>0` grouped by `p3`; `c5=reverse_repo` | `fair_value`, `quantity` for equity. **`c7=FVTPL` alone also catches banking-book mandatory-FVTPL assets, which have no home (§4/F3).** FV sign split is per netting set where IAS 32 offsetting is met |
| **A.4** Investment securities (banking book) | Contract | D4, custodian | `direction=asset ∧ p2=banking ∧ c7 ∈ {FVOCI_debt, amortised_cost, FVOCI_equity} ∧ c5 ∈ {debt_security, equity}`; issuer split on **`c6b`** | `gross_carrying_amount` / `fair_value`. **Issuer split needs `c6b` (§4/F2).** FVOCI-debt ECL sits in OCI and does **not** net off this line (blueprint F5) |
| **A.5** Loans and advances to banks | Contract | D4, core banking | `direction=asset ∧ c6a=bank ∧ c5=term_loan` sliced by `c1` | `gross_carrying_amount − loss_allowance` |
| **A.6** Loans and advances to customers | Contract | Core banking (batch) | `direction=asset ∧ c6a ∈ {retail, corporate, public_sector, sovereign} ∧ p2=banking ∧ c5 ∈ {mortgage, personal_loan, credit_card, asset_finance, overdraft, term_loan, revolver, trade_finance, project_finance, abl, syndicated_participation, sovereign_loan}` | **`drawn_amount`, not notional** — the undrawn portion is D.1. One Contract, two lines (§4/F1) |
| **A.6** *Less: ECL allowance* | Contract attribute | External ECL engine (interface per blueprint C8) | same population grouped by `p4` | `loss_allowance`, amortised-cost measurement category only |
| **A.7** Reverse repos and securities borrowed | Contract | D4, D6 | `direction=asset ∧ c5 ∈ {reverse_repo, securities_borrowed} ∧ p2=banking` | Cash leg only. Collateral leg `memo_only` or A.4 double-counts. **Sec-borrowed against non-cash collateral is a nil line with a live encumbrance** |
| **A.8** Derivative assets — hedge designated | Contract | D4; D7 designation | `c5=derivative ∧ p1 ∈ {fair_value, cash_flow} ∧ fair_value>0` | **`fair_value × designated_proportion`** — partial designation splits one contract across A.3 and A.8 (§4/F1). `net_investment` excluded per blueprint F4 |
| **A.9** Investments in associates, JVs, subs | Balance | **Consolidation — not built** | `c5=equity_method_investment` | `gross_carrying_amount`. **No producer in current scope**; group-structure signal |
| **A.10** Property, plant & equipment | Balance | GL | `c5=ppe` | `c1=c2=c3=n/a`, `c6a=none`. NSFR RSF 100% |
| **A.11** Investment property | Balance | GL | `c5=investment_property` | |
| **A.12** Right-of-use assets | Balance | GL / **leasing system** | `c5=rou_asset` | Asymmetric with B.12 (a Contract). **Neither source is in D2 §6's inbound table** |
| **A.13** Goodwill and intangibles | Balance | GL | `c5 ∈ {goodwill, intangible}` | CET1 deduction |
| **A.14** Deferred tax assets | Balance | GL / tax | `c5=dta` | Needs a `c8` sub-value: future-profitability DTAs are deducted, others risk-weighted 250% |
| **A.15** Other assets | **Derived** + Balance | D2 accrual engine; GL; D5 | `c5 ∈ {accrued_income, prepayment, settlement_in_transit, repossessed_collateral}` | Interest receivable is Derived. **Presentation convention — inside the host line or here — must be stated once (§4/F9)** |
| **A.16** Non-current assets held for sale | Balance *(reclassification)* | GL | `p5 = true` across **all** asset lines | **A move, not a filter (§4/F8)** |

### B — Liabilities

| Line | Object | Source | Predicate | Measure |
|---|---|---|---|---|
| **B.1** Due to central banks | Contract | D4; **D6-originated** | `direction=liability ∧ c6a=central_bank ∧ c5 ∈ {cb_repo, cb_refinancing, discount_window}` | Conditional-rate facilities are neither fixed nor floating-index |
| **B.2** Deposits from banks | Contract + Balance | D4; correspondent banking | `direction=liability ∧ c6a=bank ∧ c5 ∈ {interbank_taking, vostro}` sliced by `c1` | Receives overdrawn nostros from A.2 (§4/F7) |
| **B.3** Customer deposits | Contract | Core banking (batch) | `direction=liability ∧ c6a ∈ {retail, corporate, public_sector} ∧ c5 ∈ {current_account, savings, call_notice, term_deposit, ncd_issued}` sliced by `c1`/`c2` | `gross_carrying_amount` **plus `insured_portion` and `operational_portion` sub-splits — neither computable per contract (§4/F10)**. NCD routing rule per `part2-taxonomy-mapping` §7.1 |
| **B.4** Trading book financial liabilities | Contract | D4 | `direction=liability ∧ c7=FVTPL ∧ p2=trading`; shorts `c5=equity ∧ quantity<0`; derivatives `c5=derivative ∧ fair_value<0` by `p3`; `c5=repo` | **Shorts need the quantity leg** — the mechanism revision 2 added for commodities |
| **B.5** Repurchase agreements (banking book) | Contract | D4, D6 | `direction=liability ∧ c5=repo ∧ p2=banking` | Cash leg. Collateral stays on A.4 encumbered, not derecognised |
| **B.6** Debt securities issued | Contract | D4 | `direction=liability ∧ issuer_is_self=true ∧ c5 ∈ {cp, cd, mtn, senior_unsecured, covered_bond, own_securitisation_note}` | **Own debt repurchased must be derecognised and netted — no rule stated anywhere** |
| **B.7** Subordinated liabilities | Contract | D4 | `direction=liability ∧ c5=subordinated ∧ p6 ∈ {T2, AT1_liability}` | `p6` routes the line itself, B.7 vs C.5 |
| **B.8** Derivative liabilities — hedge designated | Contract | D4, D7 | `c5=derivative ∧ p1 ∈ {fair_value, cash_flow} ∧ fair_value<0` | Mirror of A.8 |
| **B.9** Provisions | Contract attribute + Balance | External ECL engine; GL; legal | off-BS ECL: `c5 ∈ {commitment, guarantee, lc} → loss_allowance`. Others `c5 ∈ {legal_provision, restructuring, employee_benefit}` | **A D.1 commitment produces both an off-BS notional and a B.9 liability — one Contract, two lines, opposite sides (§4/F1)** |
| **B.10** Current tax liabilities | Balance | GL / tax | `c5=current_tax` | |
| **B.11** Deferred tax liabilities | Balance | GL / tax | `c5=dtl` | |
| **B.12** Lease liabilities | **Contract** | GL / **leasing system** | `direction=liability ∧ c5=lease_liability` | Real schedule and discount rate; IRRBB-relevant fixed-rate funding. Source absent from D2 §6 |
| **B.13** Other liabilities | **Derived** + Balance | D2 accrual engine; GL; D5 | `c5 ∈ {accrued_expense, payable, settlement_in_transit, deferred_income}` | Same convention question as A.15 (§4/F9) |
| **B.14** Liabilities in disposal groups | Balance *(reclassification)* | GL | `p5 = true` across all liability lines | Mirror of A.16 |

### C — Equity

| Line | Object | Source | Predicate | Measure |
|---|---|---|---|---|
| **C.1** Ordinary share capital | Balance | **GL** | `c5=share_capital` | All dimensions but `c4`, `c5` are `n/a` |
| **C.2** Share premium | Balance | **GL** | `c5=share_premium` | |
| **C.3** Retained earnings | Balance | **GL — and only GL** | `c5=retained_earnings` | **The balancing figure. The platform posts *to* the GL and never reads balances back — so this line, and 17 others, have no source. See §4/F11** |
| **C.4** Other reserves | **Derived** + Balance | D8 (FVOCI); D7 (CFH, cost of hedging); GL | FVOCI reserve derived from `c7 ∈ {FVOCI_debt, FVOCI_equity}`; CFH reserve from D7; FCTR and statutory from GL | Needs a **cost-of-hedging reserve** too. FCTR presence is the fourth group-structure signal |
| **C.5** AT1 / perpetual, equity-classified | Contract *(presentation override)* | D4 | `c5=at1 ∧ p6=AT1_equity` | Carrying amount routes to equity, cashflows stay in the ladder tagged discretionary — the override proposed in `part2-taxonomy-mapping` §7.4 |
| **C.6** Non-controlling interests | Balance | **Consolidation — not built** | `c5=nci` | No producer in current scope |

### D — Off-balance sheet

| Line | Object | Source | Predicate | Measure |
|---|---|---|---|---|
| **D.1** Undrawn loan commitments | Contract (contingent leg) | Core banking, D4 | `c5 ∈ {commitment, revolver, overdraft, credit_card} ∧ direction=granted` | **`undrawn_limit` = `limit − drawn_amount`**. `direction` must separate facilities **granted** from **received** — received attract 0% LCR inflow and have no line |
| **D.2** Guarantees issued | Contract (contingent + fee leg) | D4, core banking | `c5=guarantee` | `notional`. Must separate **financial** guarantees (IFRS 9, ECL) from **performance** guarantees (IAS 37) — different CCF and provisioning |
| **D.3** Letters of credit issued | Contract (contingent + fee leg) | D4, trade finance | `c5 ∈ {import_lc, export_lc, standby_lc}` | `notional`. **`ccf` required and absent from `c8`'s stated content (§4/F4)** |
| **D.4** Contingent liabilities | Balance | Legal / GL | `c5=contingent_liability` | Disclosure only. Overlaps B.9 legal provisions |

---

## 3. Reconciliation with the first run

The two runs give different counts. The difference is **entirely explained by five modelling calls**,
four of which are still open — which is the useful result: *the count is not a fact about the
taxonomy, it is a function of five decisions.*

| | `part2-taxonomy-mapping` | This run |
|---|---|---|
| Pure Contract | 12 | **18** |
| Pure Balance | 16 | **15** |
| Mixed / Derived | 12 | **7** |

| Line(s) | Cause of difference | Status |
|---|---|---|
| A.3, A.4, B.4 | **Equity and short positions: Balance or Contract-with-quantity-leg?** First run said Balance; this run says Contract. Revision 2 has since added the quantity leg for commodities, which supplies the mechanism | **Settled — Contract.** Conceded by the first run: `not_applicable` values remove the original objection, the settlement instruction argument is decisive, and B.4 shorts have no other representation. Moves 3 lines |
| A.6 | **Is the ECL allowance an object or a measure?** First run treated it as a third thing making A.6 mixed; this run treats it as a `loss_allowance` measure on the same Contract population | **Open — recommend measure.** Moves 1 line |
| C.5 | First run called it genuinely dual-primitive; this run applies that artifact's **own §7.4 fix** (presentation override), which resolves it to a Contract | **Effectively settled by their fix.** Moves 1 line |
| B.3 | First run marked it Mixed; its own note says every sub-line is a Contract | **Probable slip in the first run.** Moves 1 line |
| A.1 | First run marked it pure Balance; this run marks it mixed, because standing-deposit-facility placements are booked deals | **Open — recommend mixed.** Moves 1 line back |

**Both runs agree on the conclusion that matters:** the Contract primitive alone cannot produce the
balance sheet, the Balance primitive is required, and criterion 2 as originally written is not
satisfiable. Revision 2's remediation stands. The counts quoted in blueprint Appendix B should be
marked as depending on the open calls above rather than presented as settled.

---

## 4. Findings new to this run

Eight the first run did not surface. **F1, F2, F10 and F11 change the design.**

| # | Finding | Consequence | Fix |
|---|---|---|---|
| **F1** | **The design test checks predicates but never measures.** Six lines need a *sub-contract split*: revolver drawn (A.6) vs undrawn (D.1); overdraft and card balance vs limit; partially-designated hedges across A.3/A.8; operational deposit portion (B.3); insured vs uninsured portion (B.3); off-BS ECL (B.9) arising from a D.1 contract | No dimension set fixes this. A Position defined only by dimensions cannot produce these lines at any level of dimensional detail — the fourteen-dimension remediation does not reach it | Define the **measure set** (§1.3) as part of the Position contract and restate the criterion as *(measure, predicate)* pairs |
| **F2** | **`counterparty_type` must split into transaction counterparty and issuer/obligor.** A bond bought from Bank X issued by a sovereign is `c6a=bank`, `c6b=sovereign` | HQLA level, risk weight, large exposures and concentration key off the **issuer**; settlement, confirmation and settlement risk key off the **transaction counterparty**. A single dimension silently mis-classifies the entire securities book, and **the error runs in both directions depending on which field survives** — trade-capture-derived data usually retains the transaction counterparty, so a sovereign bond bought from a dealer looks like bank paper and **understates** HQLA; custody-derived data retains the issuer and loses the settlement counterparty. Build the check both ways | Split the dimension. Fifteen, not fourteen. **`c6b` is the *contractual* obligor, always.** Basel CRM substitution — where an eligible guarantee lets the guarantor's risk weight replace the obligor's — must produce a **separate derived `crm_effective_obligor`** consumed only by the risk-weight rule. Otherwise HQLA (no substitution) and risk weight (substitution) fight over one field, which is the F2 failure mode one level down. Keep `guarantor` as the captured attribute it already is (D2 §2.1) — substitution is conditional on eligibility and is a bank election, so it is a derived outcome, not a captured fact |
| **F3** | **No line exists for banking-book mandatorily-FVTPL assets.** A.3 is trading-book FVTPL; A.4 is FVOCI and amortised cost only. A held CLN failing SPPI is banking book and mandatorily FVTPL — and D2 §2.6 states this bank holds CLNs | A real, named population has no balance sheet home, and `c7=FVTPL` as an A.3 filter silently sweeps it into the trading book | Source-document gap. Widen A.4 or add a line; raise with the document owner alongside the other taxonomy extensions |
| **F4** | **`regulatory_classification`'s stated content is incomplete.** Defined as HQLA level, risk weight, LCR run-off, NSFR ASF/RSF. The map also needs **`ccf`** (D.1–D.3, where 20/50/100% materially differ) and **leverage exposure treatment** | Three off-balance-sheet lines and the leverage ratio cannot be produced from the dimension as defined | Extend the definition. No structural change. (Capital instrument classification was already promoted to `p6` in revision 2) |
| **F5** | **`FVOCI` is two accounting classifications, not one.** **FVOCI-debt** recycles to P&L, carries ECL, and its allowance sits in OCI without reducing carrying amount. **FVOCI-equity** is the OCI election — never recycles, no ECL | Blueprint F5 already gets the FVOCI-debt ECL mechanics right but the enum was never split, so the rule has no value to key off. A.4, the A.6 allowance line and C.4's reserve derivation are all affected | Five values: FVTPL, FVOCI_debt, FVOCI_equity, amortised_cost, equity |
| **F6** | **A.2 and A.5 overlap with no stated boundary** — "Due from banks / interbank placements" and "Loans and advances to banks" both cover bank lending | Same class as the NCD B.3/B.6 problem the first run found: the two lines double-count or leave a gap depending on how a rule author reads them | Record the convention — conventionally money-market and nostro in A.2, term lending in A.5 |
| **F7** | **Sign-based line assignment is a general pattern with no stated rule.** An overdrawn nostro moves A.2 → B.2; derivative fair value sign splits A.3/B.4 and A.8/B.8 | Netting across accounts or contracts is permitted only where IAS 32 offsetting criteria are met, which depends on the master agreement — so a presentation rule turns out to depend on the legal agreement data | State the rule once and make it depend on the netting set object added in revision 2 |
| **F8** | **Held-for-sale is a reclassification, not a filter.** A.16 and B.14 *move* positions off their home lines | Revision 2 added the dimension but not the exclusion semantics. Without `∧ p5=false` on every other query, A.4 and A.16 both report the same asset | State the exclusion once as a property of the reporting layer |
| **F9** | **Accrued interest presentation is a second, separate decision from ownership.** The first run settled *ownership* (D2 computes it; the core banking figure is a reconciliation control, not an input — its §7.2, correct and sharper than anything here). Still unsettled is *presentation*: inside the instrument's carrying amount, or separately on A.15/B.13 | Both are permissible under IFRS. If not decided once, A.2/A.4/A.6 and A.15 double-count — the same failure the first run identified, arriving by a different route | Record the presentation convention next to the ownership rule |
| **F10** | **Part of regulatory classification is irreducibly customer-level and cannot be a per-contract rule.** Deposit insurance coverage is a **per-depositor threshold**; operational deposit status is a relationship property **capped at the amount required for the service**; connected-counterparty grouping for large exposures spans accounts | B.3 — the largest liability line — cannot be classified contract-by-contract at all. The classification rules engine pulled into Phase 0 is specified as a per-Contract engine. D2 §4.4's contract-level *storage* argument is necessary but does not solve this; the *engine* is the gap | **Two-pass classification**: per-contract, then a **customer-aggregation pass** computing thresholds and caps and allocating back to contracts. This is a Phase 0 change to `classification-rules-engine`, and it is the most consequential finding here. **The allocation rule must itself be deterministic, stated and versioned** — when an insured threshold covers part of a customer's balance, *which accounts receive the insured portion* (pro rata, product order, account age) is a free choice, and if it is implicit the insured/uninsured split moves between runs and the LCR moves with it, with no attributable cause. **Where a deposit is subject to both an insurance threshold and an operational cap, the order of application is a third decision** and changes the result; state all three in the rule set with the same regression-corpus treatment as the thresholds |
| **F11** | **Eighteen of forty lines are GL-sourced, and nothing reads GL balances back.** The architecture is one-way — D7 posts *to* the GL, which is the "control account" (blueprint §4). C.3 retained earnings is the proof case: it is the balancing figure and can come from nowhere else | Without a GL-balance inbound interface the balance sheet cannot be produced, and because C.3 is the balancing figure it **cannot balance**. §4.1's interim account-level GL comparison contemplates reading GL balances for *reconciliation* but not as a *source* | Add a **GL balance inbound interface** to D2 §6 and to D16's feed inventory, distinct from the reconciliation comparison. Five source systems in this map have no inbound interface anywhere: GL balances, the leasing system, the branch cash system, the legal system and the consolidation process |

---

## 5. Additions to the reverse test

`part2-taxonomy-mapping` §9 found nine Part 1 orphans. Three more, all in the collateral space:

| Part 1 instrument | Issue |
|---|---|
| **Securities borrowed against non-cash collateral** (§2) | Nil carrying amount on A.7, but a real encumbrance and a real HQLA consequence. An orphan that looks like a correctly-empty line |
| **Central bank standing deposit facility** (§1) | Presents within A.1 alongside reserve balances, but is a booked deal with different HQLA treatment from mandatory reserves. Ambiguous rather than orphaned |
| **Securities pledged and collateral received** (§9) | Part 2 section D covers commitments, guarantees, LCs and contingent liabilities only. There is **no encumbrance or collateral memorandum block at all**, and both are required inputs to LCR and NSFR |

Combined with the first run's nine, the taxonomy extension the bank needs to approve covers
**twelve items**. That is large enough to be a single accounting-policy conversation rather than
twelve separate questions.

---

## 6. Restated acceptance criterion

Criterion 2 as originally written is not satisfiable, for three independent reasons in descending
order of how much they change the design: six lines need **measures, not predicates** (F1); 22 of 40
lines need the **Balance primitive** (both runs agree) and 18 need a **GL inbound interface** (F11);
and the dimension set needs **one further split** (F2). Restated:

> **Every line in Part 2 is generated as a *(measure, predicate)* pair over Positions, where a
> Position aggregates Contracts, Balances and Derived values, and where the predicate uses only the
> declared dimension set. Any line requiring logic outside a declared measure and a declared
> predicate is a defect in the measure or dimension set — not a licence to write a bespoke rule.**

Every line in §2 satisfies this once F1, F2, F5, F10 and F11 are implemented.

---

## 7. Open calls this artifact does not settle

1. ~~**Equity and short positions — Balance or Contract with a quantity leg?**~~ **Settled: Contract.** See §1.1 for the revised Balance definition this produced.
2. **ECL allowance — object or measure?** (§3). Recommend measure.
3. **A.1 — pure Balance or mixed?** (§3). Recommend mixed.
4. **Accrued interest presentation** — inside the host line or on A.15/B.13 (F9).
5. **A.2 vs A.5 routing** (F6), alongside the NCD B.3/B.6 rule the first run raised.
6. **The taxonomy extension** — twelve orphaned or ambiguous instruments (§5). The bank's accounting policy call, not a design decision.
