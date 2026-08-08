# P0-07 — Position & Balance Derivation

**Wave 4. Depends on P0-05, P0-06.**

Governing artifacts: `d2-instrument-position-core` §5, §5.1.

## In scope

- **Derivation over Contracts *and* Balances**, sliced by any combination of the fourteen dimensions
  plus book, portfolio, counterparty and legal entity. **Always derived, never entered**
- **EOD materialised snapshots** for reporting stability and reconciliation, and **on-demand
  computation** for intraday and ad-hoc use — **both from the same derivation logic**. If they can
  disagree, the design is wrong
- **Near-real-time freshness with an EOD authoritative cut.** Treasury events stream in within seconds;
  the banking book is batch-fed and always as-of last night
- **Per-source freshness stamping.** Every position response declares "treasury book as of 14:32:07,
  banking book as of last night's 23:00 cut" — never a single undifferentiated as-of
- **ECL presentation branching by measurement category** (D2 §6.3.1): the allowance reduces carrying
  amount for amortised cost only; FVOCI debt stays at fair value with the allowance held separately;
  off-balance-sheet routes to a B.9 provision

## Out of scope

- The Part 2 balance sheet queries themselves — P0-14
- Intraday liquidity monitoring (Phase 4) — this is intraday *position keeping*, a different capability
- Valuation-dependent positions (Phase 2)

## Acceptance criteria

1. Snapshot and on-demand views cannot disagree on the same data
2. Every position response carries a per-source freshness stamp
3. Treasury book positions reflect a booked event within seconds
4. Balance objects aggregate alongside Contracts in the same query surface
5. ECL branches correctly by measurement category, verified by reconciling the FVOCI reserve
6. The tier A subset — positions, classification, short-end cash ladder — completes inside the
   **90-minute critical path**

## Notes

**The tier A budget is the binding constraint**, not the full-run budget, and it should drive whether
derivation is incremental or full-rebuild. That decision is best made here rather than inherited.

**The pre-deal limit checks that partly justify near-real-time freshness live in D4 and the limit
framework, both Phase 4.** The capability is built here and fully exploited later — deliberate, not an
oversight.
