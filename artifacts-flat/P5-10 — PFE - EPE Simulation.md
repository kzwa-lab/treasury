# P5-10 — PFE / EPE Simulation

**Wave 4. Depends on P5-03, P5-04, P5-06.**

**The largest compute in the platform**, and the ticket that consumes `p2-13` most directly.

Governing artifacts: `d11-market-and-counterparty-risk` §3.2, §5.

## Scope spans both books, and this is the most common scoping error

**Market risk is trading-book-scoped. Counterparty credit risk is not.**

An uncollateralised cross-currency swap hedging banking book funding carries **exactly the same
counterparty exposure** as an identical trading book swap. **Scoping all of D11 to the trading book — the
natural reading of a module named for market risk first — silently omits the derivative book this
platform exists to manage.**

**Scope: every derivative, repo, reverse repo, securities lending transaction and unsettled trade, in
either book.**

## In scope

| Measure | Purpose | Nature |
|---|---|---|
| **PFE profile** | Internal limit measurement and XVA input | Simulated exposure distribution over time steps |
| **Effective EPE** | XVA and internal capital | Derived from the PFE simulation |

**Everything computes per netting set** — which is why netting sets are first-class objects in D1 rather
than a derived grouping.

## Why the approximate revaluation path is not optional here

**Exposure profiles are netting sets × paths × time steps — 10⁴–10⁵ `T`.**

**No grid revalues that in full**, by any margin. This is not a performance trade-off; it is the reason
`p2-13` had to build an approximate revaluation path in Phase 2 **regardless of anything anyone decided
about VaR.** If that path was not built, this ticket cannot proceed and the wrapper needs changing —
after three phases of consumers have attached to it.

**The governing rule D8 executes: an approximation is permitted only where a scheduled full-revaluation
benchmark demonstrates it inside a stated tolerance.**

## Out of scope

- **SA-CCR and current exposure — Phase 4.** Prescribed formula over data that exists, already delivered
- XVA — P5-11, which consumes these profiles
- The simulation's schedule and budget — P5-14
- Settlement exposure — Phase 4, and a different exposure shape entirely

## Acceptance criteria

1. **Every derivative and SFT position in both books carries a counterparty exposure** — the trading-book
   scoping error is tested for, not assumed absent
2. Profiles compute **per netting set**, from D1's netting set definitions
3. **An unopined netting set computes gross** — the netting opinion gap is a capital cost, not a data gap
4. Netting is taken from **D1's regulatory determination, never inferred from D7's accounting
   presentation** — the shortcut that produces a capital number contradicting the return that discloses it
5. **The approximation is benchmarked**: a scheduled full-revaluation run over a sampled population, its
   difference published, and a **drift threshold escalates**
6. The exercise-assumption convention from P5-06 applies and is recorded
7. Profiles are reproducible from their version set

## Notes

**Criterion 3 is a legal fact expressing itself as a number.** Where enforceability is unopined, exposure
computes gross — that is the correct treatment, and it makes
`counterparty-documentation-workstream` a D11 dependency as much as a D6 and D7 one. A netting opinion
gap discovered here is a **capital cost**, not a data cleanup.

**Criterion 5's drift threshold is what keeps the approximation honest over time.** An approximation
validated once at build time drifts as the portfolio changes — new instrument types, more optionality,
different netting set composition. Without a scheduled benchmark and an escalation threshold, the
approximation's quality is assumed rather than known, and PFE feeds both limits and XVA.
