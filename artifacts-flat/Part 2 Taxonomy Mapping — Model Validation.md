# Part 2 Taxonomy Mapping — Model Validation

A hand-run of all 40 balance sheet line items in Part 2 of the source document against the canonical
data model, plus the reverse test (Part 1 instruments → Part 2 landing) that the acceptance criteria
never performed. Parent: `treasury-alm-risk-platform`. Prompted by `architecture-critique` findings
C1, C2 and the process point on independent testing.

<user_quoted_section>Status: remediation applied. The consequences in §10 were implemented in revision 2 of theparent blueprint and of d2-instrument-position-core. This artifact is retained as the validationrecord and the source of the line-by-line mapping; it is not itself revised.</user_quoted_section>

**Result: the critique is confirmed and understated.** 20 of 40 lines cannot be represented as
Contracts. Six classification dimensions are missing, not four. Nine Part 1 instrument classes have
no clean Part 2 home. Four further modelling problems surfaced that neither the blueprint nor the
critique had identified.

## 1. Method

Each line item is classified by the primitive that must hold it:

| Primitive | Meaning |
| --- | --- |
| **Contract** | Has legs, generates cashflows, projectable |
| **Balance** | Carrying amount plus dimensions. No legs, no cashflows, no projection. **Proposed sixth primitive** (critique C1) |
| **Derived** | Not stored at all — computed from other objects. Storing it creates a double-count |
| **Mixed** | The line contains sub-components of different primitives |

## 2. Assets — A.1 to A.16

| Line | Primitive | Notes |
| --- | --- | --- |
| **A.1** Cash and balances with central banks | **Balance** | Vault cash, mandatory reserves, excess reserves. **Mandatory reserves are encumbered by definition and generally HQLA-ineligible** — a Balance needing an encumbrance attribute, which the design only gave to Contracts and securities |
| **A.2** Due from banks / interbank placements | **Mixed** | Nostro balances = Balance with a synthetic overnight flow for the ladder. Term placements = Contract, one fixed bullet leg |
| **A.3** Trading book financial assets (FVTPL) | **Mixed** | Debt securities = Contract. **Equity securities = Balance** (no maturity, no repricing basis — blocked by classification rule 1). Derivatives = Contract, but the FX/IR/credit/equity/commodity breakout is a **missing dimension**. Reverse repos = Contract (cash + collateral leg) |
| **A.4** Investment securities (banking book) | **Mixed** | FVOCI and amortised-cost debt = Contract. **FVOCI / strategic equity = Balance.** Distinguished from A.3 only by a **missing book-intent dimension** |
| **A.5** Loans and advances to banks | **Contract** | Clean |
| **A.6** Loans and advances to customers | **Mixed** | All retail and corporate sub-lines = Contract. **The "less: ECL allowance" line is neither Contract nor Balance** — it is a contra-asset from an external engine with no interface specified (critique C8) |
| **A.7** Reverse repos and securities borrowed (banking book) | **Contract** | Needs explicit recognition rules — securities received are **not** recognised as holdings but **do** count toward HQLA if eligible and rehypothecable |
| **A.8** Derivative assets — hedge designated | **Contract** | Identical to A.3 derivatives except for designation. Designation is modelled as a CONTRACT_LINK, which **cannot serve as a query filter** — so this line is not generable. Missing dimension |
| **A.9** Investments in associates, JVs, subsidiaries | **Balance** | Equity-accounted. Group-structure signal |
| **A.10** Property, plant & equipment | **Balance** | NSFR RSF and leverage only |
| **A.11** Investment property | **Balance** |  |
| **A.12** Right-of-use assets (IFRS 16) | **Balance** | **Linked across the primitive divide** to B.12, which is a Contract |
| **A.13** Goodwill and intangibles | **Balance** | CET1 deduction — matters to D13 |
| **A.14** Deferred tax assets | **Balance** | CET1 threshold deduction |
| **A.15** Other assets | **Mixed / Derived** | **Interest receivable is Derived** from D2 accrual — ingesting it from core banking GL as well creates a double-count. Prepayments, repossessed collateral = Balance. Clearing/settlement in-transit = Balance from D5 |
| **A.16** Non-current assets held for sale | **Balance** | Requires a **missing held-for-sale dimension** |

## 3. Liabilities — B.1 to B.14

| Line | Primitive | Notes |
| --- | --- | --- |
| **B.1** Due to central banks | **Contract** | **Originated from collateral pool state — D6 creates the Contract, inverting the D4 → D2 flow** (critique confirmed) |
| **B.2** Deposits from banks | **Mixed** | Term borrowings = Contract. Vostro balances = Balance |
| **B.3** Customer deposits | **Mixed** | All sub-lines = Contract, including non-maturity deposits (requires "no maturity" as a permitted value for dimension 1). **NCDs issued to customers overlap B.6 — see §6.1** |
| **B.4** Trading book financial liabilities | **Mixed** | **Short securities positions need a quantity concept** the Leg model lacks (critique C4). Derivatives = Contract + missing risk-type dimension. Repos = Contract |
| **B.5** Repos (banking book) | **Contract** | Securities repo'd out are **not derecognised** — they remain your Position, encumbered |
| **B.6** Debt securities issued | **Contract** | Own securitisation notes carry an SPV consolidation flag — group-structure signal |
| **B.7** Subordinated liabilities | **Contract** | **Whether AT1 lands here or in C.5 is driven by accounting classification** — a dimension value that routes the line item |
| **B.8** Derivative liabilities — hedge designated | **Contract** | Same designation-dimension gap as A.8 |
| **B.9** Provisions | **Mixed** | **Off-balance-sheet ECL is the ECL interface again** (from D.1/D.2 exposures). Legal, restructuring, employee benefit = Balance |
| **B.10** Current tax liabilities | **Balance** |  |
| **B.11** Deferred tax liabilities | **Balance** |  |
| **B.12** Lease liabilities | **Contract** | **Genuine contractual cashflows, amortising — hits the liquidity ladder and NSFR.** Routinely omitted from ALM platforms |
| **B.13** Other liabilities | **Mixed / Derived** | **Interest payable is Derived** from D2 accrual — same double-count risk as A.15. Payables, deferred income, settlement in-transit = Balance |
| **B.14** Liabilities in disposal groups held for sale | **Balance** | Held-for-sale dimension |

## 4. Equity — C.1 to C.6

| Line | Primitive | Notes |
| --- | --- | --- |
| **C.1** Ordinary share capital | **Balance** | CET1 |
| **C.2** Share premium | **Balance** | CET1 |
| **C.3** Retained earnings | **Balance** | CET1 |
| **C.4** Other reserves | **Derived** | **Three of the four sub-lines have no primitive at all.** FVOCI revaluation reserve accumulates from D8 valuations via D7; cash flow hedge reserve from D7 hedge accounting; **FX translation reserve implies a foreign operation — a third group-structure signal**. Only general/statutory reserves are a Balance |
| **C.5** AT1 / perpetual, equity-classified | **Mixed — genuinely hybrid** | Needs a **Contract** for discretionary coupon cashflows *and* a **Balance** for equity presentation. Coupons are discretionary, so not a contractual liability, but they are real cashflows for the ladder. See §6.4 |
| **C.6** Non-controlling interests | **Balance** | Group-structure signal |

## 5. Off-balance sheet — D.1 to D.4

| Line | Primitive | Notes |
| --- | --- | --- |
| **D.1** Undrawn loan commitments | **Contract** | Contingent leg + drawdown model |
| **D.2** Guarantees issued | **Contract** | Contingent leg + fee leg |
| **D.3** Letters of credit issued | **Contract** | Contingent leg + fee leg |
| **D.4** Contingent liabilities (litigation, other) | **Balance / disclosure only** | No cashflow model. **Overlaps B.9 legal provisions** — recognised vs unrecognised aspects of the same event. Needs a rule to prevent double-counting |

## 6. Counts

| Primitive | Lines | Share |
| --- | --- | --- |
| Pure Contract | 12 | 30% |
| Pure Balance | 16 | 40% |
| Mixed Contract + Balance | 8 | 20% |
| Derived-dominant | 4 | 10% |

**Contract appears in 20 of 40 lines. Balance appears in 24. Neither primitive alone covers half the**
**balance sheet.**

The blueprint's acceptance criterion — *"every line in Part 2 must be generable as a query over*
*Positions with no bespoke rule"* — **fails on 20 of 40 lines** as the model stands. The critique's
estimate of ~19 was accurate.

## 7. New findings from the exercise

Four problems that neither the blueprint nor the critique had identified.

### 7.1 B.3 and B.6 are the same instrument in two homes

NCDs issued to customers sit in B.3 (customer deposits); certificates of deposit issued sit in B.6
(debt securities issued). These are the same instrument, and the taxonomy provides no routing rule.
The distinction is presumably counterparty-based — issued to a customer relationship versus placed
into the market — but that is an inference, not a rule. **Without an explicit routing rule the same**
**NCD lands in either line depending on who books it**, which breaks both the balance sheet and the
NSFR (customer deposits and debt securities issued attract different ASF factors).

**Fix:** an explicit, documented routing rule on counterparty type and issuance channel, owned by D1's
GL mapping and testable.

### 7.2 Accrued interest is derived, and core banking will also send it

A.15 interest receivable and B.13 interest payable are **computed by D2's accrual engine**. Core
banking systems also carry accrued interest and will supply it in the daily feed. If both are
recognised the balance sheet double-counts, and the GL reconciliation (parent §4) will show a break
whose cause is architectural rather than operational.

**Fix:** declare accrual ownership explicitly at the D2 ingestion boundary — D2 computes it, the core
banking accrual figure is a **reconciliation control, not an input.** This needs stating in D2 §6's
inbound interface, which currently does not mention it.

### 7.3 Three of four reserve lines have no primitive

C.4's FVOCI revaluation reserve, cash flow hedge reserve and FX translation reserve are all
**accumulations derived from other modules' outputs** — they are never posted as independent
balances. The blueprint has no concept for a derived equity accumulation, and D7's interface does not
publish one.

This matters beyond presentation: **the FVOCI reserve is the accounting expression of CSRBB** (D9
§7), so the link between spread risk measurement and the capital line it moves is currently
unspecified in both directions.

### 7.4 Equity-classified AT1 needs both primitives simultaneously

C.5 is the only line requiring one instrument to be a Contract and a Balance at the same time. The
coupons are discretionary — so not a contractual liability, and correctly presented in equity — but
they are real, expected cashflows that belong in the liquidity ladder and the funding plan. Modelling
it purely as a Balance loses the cashflows; modelling it purely as a Contract mis-presents the
balance sheet and mis-states CET1/AT1 capital.

**Fix:** permit a Contract to carry a presentation override routing its carrying amount to an equity
line while its cashflows remain in the projection, tagged discretionary. This is narrow and specific;
it should not be generalised.

## 8. Missing dimensions — six, not four

The critique identified four. The full run found six.

| # | Dimension | Lines requiring it | Currently |
| --- | --- | --- | --- |
| 9 | **Book intent** — trading vs banking | A.3 vs A.4 vs A.7, B.4 vs B.5 | Absent. Also the IRRBB scope boundary (D9 §2) |
| 10 | **Hedge designation** | A.8, B.8 | Modelled as CONTRACT_LINK — cannot filter a query |
| 11 | **Primary risk type** — FX/IR/credit/equity/commodity | A.3, B.4 | Absent. **Not derivable from product code — a cross-currency swap is both FX and IR**, so an explicit primary-risk designation rule is required |
| 12 | **ECL stage** — 1/2/3 | A.6, B.9 | Absent, and depends on the unspecified ECL interface |
| 13 | **Held for sale** | A.16, B.14 | Absent |
| 14 | **Capital instrument classification** | B.7 vs C.5 | Absent. **Routes the line item itself**, not just its presentation |

The eight cross-cutting dimensions become fourteen. Dimensions 9–14 are **presentation and accounting**
**dimensions** — a coherent group, distinct from the original eight, which are risk and behaviour
dimensions. That grouping is worth preserving in the model rather than flattening all fourteen into
one list.

## 9. The reverse test — Part 1 instruments → Part 2 landing

The test the acceptance criteria never performed. **Nine orphans or ambiguities.**

| Part 1 instrument | Part 2 home | Status |
| --- | --- | --- |
| Bankers' acceptances (§1) | — | **Orphan.** Two-sided gross structure, no line item |
| Collateral swaps / upgrades (§2) | — | **Orphan.** No cash leg, so the "repo = cash + collateral" framing does not apply, and there is no balance sheet line |
| Securities lending (§2) | — | **Orphan.** Securities lent remain on balance sheet (encumbered); collateral received may be off. No explicit line |
| Commodity / physical gold (§7) | — | **Orphan.** In the instrument universe, absent from the taxonomy entirely |
| Futures — STIR, bond, index (§5, §7) | — | **Orphan.** No contractual cashflows, only variation margin; margin balance implicitly in A.2/A.15 |
| Committed liquidity facilities received (§9) | — | **Orphan.** Contingent inflow, no balance sheet or OBS line (D covers liabilities issued, not facilities received) |
| FX spot unsettled (§4) | A.15/B.13 clearing | **Weak.** Implicit in in-transit accounts only |
| Promissory notes (§1) | A.4 or A.6 | **Ambiguous.** No routing rule |
| Syndicated participations, borrowing side (§8) | B.2 or B.6 | **Ambiguous.** No routing rule |
| Internal FTP contracts and internal hedges (§10) | — | **By design** — they eliminate. But this must be *stated*, or it reads as an omission |

**The asymmetry in D is structural:** the off-balance-sheet section covers commitments and guarantees
*issued* but has no home for facilities *received*. That is consistent with accounting presentation
(a facility you have been granted is not your asset), but it means D10's contingent-inflow inventory
(§2.2 of that spec) has **no balance sheet anchor** and must be maintained as a separate register.
Worth stating rather than discovering during a build.

## 10. Consequences for the blueprint

**Model changes** — all additive, none a redesign:

1. Add the **Balance** primitive: carrying amount, currency, dimensions; no legs, no cashflows, no projection
2. Permit **"not applicable"** as a classification value where a dimension is meaningless (maturity and repricing basis for equity holdings, PP&E, goodwill)
3. Add a **Derived** marker for A.15, B.13 and C.4 components, with a hard rule that derived values are never ingested
4. Extend the dimension set to **fourteen**, grouped as eight risk/behaviour plus six presentation/accounting
5. Add the C.5 **presentation override** — narrow, single-purpose
6. Add explicit **routing rules** for B.3/B.6, promissory notes, and syndicated participations

**Acceptance criteria changes:**

- Criterion 2 must be restated: *every line in Part 2 generates as a query over Positions **and***
***Balances***
- **Add the missing third criterion: every Part 1 instrument class maps to a named Part 2 line, or is**
**explicitly recorded as an intentional non-appearance with a reason.** This test alone would have
caught six of the nine orphans

**Open items requiring the bank's answer:**

- Where do bankers' acceptances, commodities, securities lending and collateral swaps present? The
taxonomy needs extending, and that is the bank's accounting policy call, not a design decision
- Confirm the routing rule for NCDs between B.3 and B.6
- Confirm the ECL interface direction and ownership (blocked by critique C8)
