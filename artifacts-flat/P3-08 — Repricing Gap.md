# P3-08 — Repricing Gap

**Wave 3. Depends on P3-07, and on Phase 2's D8.**

Governing artifacts: `d9-alm-and-irrbb` §3.

## In scope

Assets and liabilities slotted into time buckets by **next repricing date** — maturity for fixed rate,
next reset for floating, behavioural profile for non-maturity — with the net position per bucket showing
where the balance sheet reprices.

### Its relationship to P1-02's ladder, stated precisely

Both are bucketed views of **the same D2 cashflows**, and the difference is the bucketing attribute:

| View | Buckets by |
|---|---|
| P1-02 liquidity ladder | **When cash moves** |
| This gap | **When the rate resets** |

A 5-year floating rate loan resetting quarterly sits in the **5-year liquidity bucket and the 3-month
repricing bucket**. Same object, different attribute — which is why D2's Cashflow record carries both
payment date and next reset date (D2 §4.2). **This ticket does not build a second ladder.**

### The gap is not a pure cashflow aggregation

Three classes of position break the cashflow framing, and the blueprint's original claim that gap was a
cashflow aggregation was withdrawn for them:

| Position | Problem | Treatment |
|---|---|---|
| **Options** — swaptions, caps, floors, embedded | A cashflow's rate treatment produces a meaningless bucket for a swaption | **Delta-equivalent `exposure_by_bucket` from D8** |
| **Futures** — STIR, bond | No contractual cashflows at all, only variation margin | Notional exposure via `exposure_by_bucket` |
| **Equity, commodity, Balance-held** | Neither cashflow nor repricing basis | Contribute to EVE and NSFR; **excluded from the gap, with the exclusion stated** |

**The gap consumes cashflows for linear instruments and `exposure_by_bucket` for non-linear ones.**

## The bucket boundary requirement

**Both halves must use D1's one boundary set** (§3.10). The gap is assembled from cashflows *plus*
`exposure_by_bucket`; if the two halves are bucketed independently **they do not add up, and the failure
is silent because each half looks reasonable on its own** (D8 §3.4).

## Out of scope

- EVE and NII — P3-09, P3-10
- Sensitivity computation — D8
- The liquidity ladder — P1-02

## Acceptance criteria

1. Buckets are D1's shared boundary set, identical to those used by `exposure_by_bucket` and P1-02
2. Options and futures enter via `exposure_by_bucket`, not via a cashflow rate treatment
3. Excluded positions are **reported as excluded with the reason**, never silently omitted
4. **The output carries its own limitations** — parallel-shift assumption, basis risk ignored,
   simultaneous repricing within a bucket — in the output, not in a footnote elsewhere
5. FTP transfer contracts are **in scope** and internal trading/banking hedges are tested for external
   lay-off (`D12-7`)
6. The gap reproduces historically

## Notes

**Criterion 4 is unusual and deliberate.** Gap analysis is the oldest measure here and the one with the
most known limitations. It remains genuinely useful as a **structural description of the balance sheet**
and it is **never the risk measure** — EVE and NII are. A gap report presented without its limitations
attached gets read as a risk number by exactly the audience least equipped to discount it.

**Criterion 5 catches the conflation `D12-7` warns about.** An FTP transfer contract allocates rate risk
*within* the banking book and is always in scope, because the risk never left. An internal hedge *crosses*
the trading/banking boundary and carries the recognition test. Applying that test to FTP mirrors would
**strip the banking book of transfers that never left it, understating IRRBB by the full internally
allocated position** — and the two objects look similar enough that a single implementer will treat them
as one.
