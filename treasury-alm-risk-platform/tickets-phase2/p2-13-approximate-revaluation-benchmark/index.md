---
kind: ticket
title: "P2-13 — Approximate Revaluation & Benchmark Harness"
status: 0
---

# P2-13 — Approximate Revaluation & Benchmark Harness

**Wave 5. Depends on P2-10.**

**Built in Phase 2 for a consumer that arrives in Phase 5 — and that is not a deferral, it is the point.**

Governing artifacts: `d8-valuation-and-analytics` §6.1; `d11-market-and-counterparty-risk` §5.1.

## The question that was one question and is two

*"Full revaluation or sensitivity approximation for Phase 5's fan-out?"* was carried as open through
three parent revisions. **It collapses four different fan-outs into one binary, and they do not share an
answer:**

| Fan-out | Multiplier against one full pass `T` | Full revaluation feasible? |
|---|---|---|
| Historical simulation VaR | ~250 `T`, daily | Expensive, arithmetically possible |
| Stressed VaR | ~250 `T`, daily | Same |
| P&L attribution step-through | ~10 `T`, daily | Trivially — **and it must be, the residual is the point** |
| **PFE / EPE exposure profiles** | **10⁴–10⁵ `T`** — netting sets × paths × time steps | **No. Not by any margin** |

## The Phase 2 half is settled by arithmetic, not by preference

**Approximate revaluation — regression-based or grid-interpolated — is the only way exposure profiles
are computed anywhere.** So **the wrapper and the grid must support an approximate revaluation path
regardless of anything anyone decides about VaR.**

That is the decision this module needed in Phase 2, and it is made. **Whether the *VaR* number uses that
path is a later, re-tunable binding** that keys off P2-05's model tiers — which partition the universe by
how non-linear the payoff is, which is exactly what determines whether a second-order approximation
holds.

## In scope

- **The approximate revaluation path** — payoff evaluation at a state, not only a full price call
- **The full-revaluation benchmark harness** — the same `value()` call at the same versions, run
  periodically over the same population, **runnable on demand rather than only inside a risk batch**
- The tolerance framework D11 will bind against per model tier

**D11's governing rule, which D8 executes: an approximation is permitted only where a scheduled
full-revaluation benchmark demonstrates it inside a stated tolerance.**

## Out of scope

- VaR, stressed VaR, PFE, XVA — **Phase 5**
- The per-tier binding decisions — Phase 5, and re-tunable
- Scenario revaluation against derived snapshots — Phase 3

## Acceptance criteria

1. The wrapper supports **payoff evaluation at a state**, not only a full price call
2. The benchmark harness runs **on demand**, over the same population at the same versions
3. Approximation error is measurable per model tier against the benchmark
4. **D8 values against materialised derived snapshots and holds no perturbation path of its own**
   (`D11-9`) — an unmaterialised perturbation is a transformation applied inside a consumer, the exact
   divergence D3 exists to prevent
5. The path is exercised at realistic fan-out in P2-14, not only on a single valuation

## Notes

**This is the ticket most at risk of being cut**, and cutting it is the expensive mistake. It has no
Phase 2 user, no visible output, and a consumer three phases away. **A Phase 2 design that comfortably
revalues the book once and cannot fan out will be rebuilt** — and rebuilt after the wrapper has
accumulated three phases of consumers.

**If the library cannot expose payoff-at-a-state, the wrapper is forced to reimplement pricing**, which
is why P2-01 makes approximate revaluation support an evaluation criterion. Discovering it here means
discovering it after the contract is signed.
