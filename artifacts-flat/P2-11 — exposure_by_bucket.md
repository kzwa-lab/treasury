# P2-11 — `exposure_by_bucket`

**Wave 4. Depends on P2-07, P2-08.**

**One field, carrying a great deal of weight.** The smallest ticket in the phase and one of the most
load-bearing.

Governing artifacts: `d8-valuation-and-analytics` §3.4.

## What it is and why it exists

**The position's exposure to rate movement, expressed per repricing bucket, for the positions that
cashflows cannot represent.**

Revision 2 of the blueprint added this field to repair the repricing gap. The claim it corrected: that
repricing gap, like the liquidity ladder, is a cashflow aggregation. **It is not** — and the critique's
closing note on D8 was *"protect it — the fix adds one field, it does not widen the interface."*

| Position type | Content | Nature |
|---|---|---|
| **Options** — swaptions, caps, floors, callables, CoCos | **Delta-equivalent notional** | Market-dependent; **changes as the option moves in and out of the money** |
| **Futures** — STIR, bond | Notional | Static until the position changes |
| Equity, commodity, Balance-held | Exposure or nil, per D9's scope | Contributes to EVE and NSFR without a repricing basis |

**A swaption's cashflow rate treatment produces a meaningless gap bucket**, and **futures generate no
contractual cashflows at all** — only variation margin. Both contribute exposure without cashflow, which
is precisely what this field carries.

## The requirement that makes it work

**The bucket definitions must be shared reference data.**

`exposure_by_bucket` is *added to* cashflow-derived gap by D9. **If D8's buckets, D2's contractual
maturity bucket dimension and D9's gap ladder are defined independently, the two halves of the gap do not
add up — and the failure is silent, because both halves look reasonable on their own.**

Bucket definitions live in **D1 §3.10**, versioned and effective-dated, consumed identically by D2, D8
and D9. That domain now exists (`D14-1`); this ticket consumes it rather than assuming it.

## Out of scope

- The gap itself — `tickets-phase3/p3-08`
- Sensitivities — P2-10, though delta-equivalent exposure is computed from the same underlying greeks
- D9's scope decisions about which non-rate positions contribute

## Acceptance criteria

1. `exposure_by_bucket` uses **D1's bucket definitions**, identical to D2's maturity dimension and D9's
   gap ladder — verified by comparison, not by intent
2. Delta-equivalent exposure for options **updates with moneyness**, and this is tested across a rate
   move rather than at a single point
3. Futures contribute notional exposure with no cashflow
4. Positions with neither cashflow nor repricing basis return an explicit nil rather than an absent field
5. The two halves of a test gap — cashflows plus `exposure_by_bucket` — **sum to the total exposure of a
   known portfolio**, which is the test that catches independent bucketing

## Notes

**Criterion 5 is the only test that catches the silent failure**, and it needs a purpose-built portfolio
with a known answer. Comparing bucket *definitions* is not sufficient — two boundary sets can agree today
and diverge on the next edit, which is why D1 holds one set rather than two that happen to match
(`G19`).

**This ticket is a strong candidate for being under-planned.** It is one field on an existing contract,
it has no user-facing output, and its consumer arrives a phase later. It is also the difference between a
repricing gap that shows the bank's optionality and one that silently omits it.
