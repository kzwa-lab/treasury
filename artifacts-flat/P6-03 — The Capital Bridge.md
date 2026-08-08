# P6-03 — The Capital Bridge

**Wave 1. Depends on P0-07, and on D7 from Phase 4.**

**Draws on more modules than any other calculation in the platform.**

Governing artifacts: `d13-regulatory-reporting-and-capital` §2, §2.1, §2.2.

## Accounting equity is not regulatory capital

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

**The bridge is an explicit, auditable computation — never a spreadsheet.**

## Prudential filters, each from a different module

| Filter | Source | Effect |
|---|---|---|
| **Cash flow hedge reserve** on items not fair-valued | D7 | **Derecognised from CET1** — see below |
| **Own credit** fair value change on FVO liabilities | D7 | Derecognised; **never recycles** |
| **Prudent valuation / AVA** | **D8, informed by D3 provenance** | Deducted where fair value is uncertain |
| IFRS 9 ECL transitional arrangements, where elected | D7 / external ECL | Phased add-back |

**Deductions:** goodwill and intangibles, DTAs relying on future profitability above threshold,
significant investments in financial sector entities, defined benefit pension surpluses, holdings of own
instruments.

**Four of these deduction lines are Balance objects, not Contracts** — a concrete reason the Balance
primitive had to exist. **Capital cannot be computed from Contracts alone.**

## The AVA dependency reaches back to Phase 2

**AVAs are computed against valuation uncertainty, which is a function of input provenance and the spread
of available marks.** `p2-06` propagated D3's provenance through D8 into every valuation **precisely so
this ticket exists** — and it could not have been retrofitted, because every historic valuation would
lack it.

## The hedge accounting decision has a capital cost that runs against intuition

| Approach | Where volatility lands | CET1 impact |
|---|---|---|
| Cash flow hedge accounting | CFH reserve (OCI) | **None — filtered out of CET1** |
| **No hedge accounting** (the bank's decision) | P&L → retained earnings | **Direct — retained earnings *is* CET1** |
| Micro fair value hedge | P&L both sides, net ineffectiveness only | Minimal |

**Declining hedge accounting declines the protection the prudential filter exists to give.** This does
not overturn the decision — it **strengthens the mitigations**: micro fair value hedges of specific
issuances and cash flow hedges of forecast cashflows are **CET1 protection**, not accounting cosmetics,
and should be prioritised on that basis.

**The revisit trigger is CET1 volatility, not earnings volatility, and the former binds first.**

## In scope

- The full bridge, auditable line by line
- Every prudential filter and deduction, sourced from its owning module
- **Capital instrument eligibility** — subordination, permanence, loss absorption, absence of redemption
  incentives — carried by the capital instrument classification dimension, which also **routes the
  instrument to taxonomy line B.7 or C.5**
- **Grandfathering of legacy instruments** as a dated, per-instrument attribute

## Out of scope

- RWA — P6-04, P6-05
- Capital projection — P6-13
- The hedge accounting policy itself — D7

## Acceptance criteria

1. The bridge computes from source, line by line, with **every filter and deduction traceable to its
   owning module** — no manual adjustment anywhere
2. AVA consumes D8's propagated provenance rather than a separate uncertainty assessment
3. Capital instrument eligibility is rules-derived and **routes the line item itself** — B.7 or C.5, not
   merely a label
4. Grandfathering is dated and per-instrument
5. **CET1 volatility is reportable and trended**, since it is the stated revisit trigger for the hedge
   accounting decision
6. The bridge reproduces historically under the rules in force at the time

## Notes

**Criterion 5 turns a stated trigger into a live one.** The hedge accounting decision was ratified with
"revisit when CET1 volatility becomes uncomfortable" as its threshold. **A threshold nobody measures is
not a threshold** — and CET1 volatility is not otherwise a reported series.

**Gating decisions 7 and 8 both land here.** IFRS 9 transitional arrangements change the bridge's phasing;
the fair value option determines whether the own-credit filter is live at all. Both are finance answers
and neither is difficult — they are simply questions nobody has been asked.
