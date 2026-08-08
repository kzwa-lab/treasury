# P2-06 — Provenance Propagation & Adjustment Stack

**Wave 2. Depends on P2-04, `tickets-phase1/p1-05`.**

Governing artifacts: `d8-valuation-and-analytics` §2.2, §3.1, §7.

## Part 1 — `purpose`, and why one position has several correct values

**The same position, on the same date, under the same market, has different correct values depending on
who is asking.** Accounting wants an IFRS 13 exit price including CVA. Risk wants mid. Regulatory capital
wants a prudent value net of AVA. FTP wants a value on internal curves.

Two ways to handle it, and the second is right:

| Approach | Consequence |
|---|---|
| D8 returns mid; each consumer applies its own adjustments | **Four modules independently implement adjustment logic, and the accounting value and the risk value stop reconciling** |
| **D8 returns a base value plus an itemised adjustment stack; `purpose` selects which apply** | One implementation, always decomposable, and **the difference between any two purposes is a query rather than an investigation** |

**The rule: every value D8 returns decomposes into base plus named adjustments, and no consumer adjusts a
D8 value further.** A consumer needing an adjustment D8 does not compute has found **a gap in D8's
adjustment set, not a licence to post-process.**

## The stack

| Adjustment | Applies to | Computed by |
|---|---|---|
| Collateral / discounting basis | All collateralised derivatives | **D8**, from the CSA-selected curve (P2-03) |
| **CVA / DVA** | Uncollateralised and partly-collateralised | **D11, per netting set — Phase 5.** D8 supplies exposure profiles |
| FVA / ColVA | Uncollateralised derivatives | D11, same basis |
| Bid-offer / close-out | Fair value where exit differs from mid | **D8** |
| **AVA / prudent valuation** | Anything fair-valued with uncertain inputs | **D8**, informed by provenance; consumed by D13 as a CET1 deduction |

**Phase 2 builds the framework with the XVA slots empty.** They are filled in Phase 5, and the gap
between D7's arrival in Phase 4 and D11's in Phase 5 is the documented fair value incompleteness in
parent §2.9 — **a finance decision due before Phase 4 is planned**, not this ticket's to resolve.

## Part 2 — provenance propagation

**D3 tags every market value with its provenance** — observed, interpolated, stale, proxied,
model-implied, marked. **D8 must propagate that into the valuation, because a value built on marked
inputs is itself a marked value.**

Two consumers depend on it and **neither can be served retrospectively:**

- **D13 — prudent valuation.** AVAs are computed against valuation uncertainty, which is a function of
  input provenance and the spread of available marks
- **D7 — IFRS 13 fair value hierarchy.** Level 1/2/3 is driven by whether inputs are quoted, observable
  or unobservable — **very close to what D3's provenance tag already records.** D8 supplies the input
  provenance; **D7 assigns the level.** Without this line the hierarchy disclosure gets assembled
  manually every quarter, forever

## Out of scope

- CVA/DVA/FVA computation — D11, Phase 5
- IFRS 13 level *assignment* — D7, Phase 4
- The provenance tags themselves — D3

## Acceptance criteria

1. Every value decomposes into base plus **named** adjustments, and `purpose` selects the applicable set
2. **No consumer post-adjusts a D8 value** — verified by inspection of D9's, D10's and D13's consumption
3. The XVA slots exist, are empty, and their emptiness is **visible on the valuation** rather than
   implicit
4. Input provenance propagates from D3 through D8 to the valuation, **sufficient for D13's AVA and D7's
   level assignment**
5. Provenance survives into aggregate values: *"what share of this portfolio's value rests on marked or
   proxied inputs"* is a query
6. The difference between two purposes on the same subject resolves to a list of adjustments, not to a
   reconciliation exercise

## Notes

**Criterion 3 matters more than it reads.** An empty CVA slot that is *visibly* empty is a documented
incompleteness that finance can decide about. An empty slot that looks like a computed zero is a
misstatement waiting for an auditor — and between Phase 4 and Phase 5 that is exactly the situation for
the uncollateralised book.

**Criterion 4 cannot be retrofitted**, which is why it is in wave 2 rather than deferred to the phase
that needs it. AVA arrives in Phase 6 and the IFRS 13 hierarchy in Phase 4; both need provenance that had
to be carried from the first valuation onward. Adding it later means every historic valuation lacks it.
