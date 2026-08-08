---
kind: ticket
title: "P5-06 — Exercise Assumptions under Fan-out"
status: 0
---

# P5-06 — Exercise Assumptions under Fan-out

**Wave 2. Depends on `tickets-phase2/p2-12`.**

**A small ticket about a decision that must not be made by whichever implementation is convenient.**

Governing artifacts: `d11-market-and-counterparty-risk` §5.4; `d8-valuation-and-analytics` §5.1.

## The problem returns in a worse form

`p2-12` resolved the D2↔D8 circularity for callables through a stored exercise assumption set, using the
**prior day's set** to keep the EOD DAG acyclic. **Under 250 scenarios the question returns**, and both
answers cost something:

| Option | Cost |
|---|---|
| **Re-derive exercise assumptions per scenario** | Multiplies an already expensive protocol **by 250** |
| **Hold them fixed across scenarios** | The callable book **does not exercise differently under a +300bp scenario than under base** — which **systematically understates exactly the convexity the measure exists to capture** |

**Neither is free**, and the understatement in the second is **invisible in the output**: the VaR number
is well-formed, the book prices, nothing fails.

## The recommendation

**Hold exercise assumptions fixed within a scenario run**, and **re-derive them for the small set of
governed shocks D9 and D14 use for EVE** — where the convexity is the point and the scenario count is
**six rather than 250**.

**With the approximation stated in the VaR methodology rather than left implicit.**

## In scope

- Implementing the split: fixed within the VaR fan-out, re-derived for the governed shock set
- **Recording the convention in the VaR methodology document**, as a stated approximation with its
  direction of error
- Measuring the understatement against the governed shocks, so its size is known rather than assumed

## Out of scope

- The two-pass protocol itself — `p2-12`
- EVE — Phase 3

## Acceptance criteria

1. The convention is **stated in the VaR methodology**, not left to the implementation
2. Exercise assumptions are fixed within a scenario run and **re-derived for the governed shock set**
3. **The direction and approximate size of the understatement are measured and documented** — by
   comparing a fixed-assumption run against a re-derived run over the governed shocks
4. The convention is versioned, so a change is visible in the reproducibility record
5. The callable population subject to the approximation is identifiable

## Notes

**Criterion 3 turns an unquantified approximation into a quantified one**, and it is cheap because the
governed shock set already re-derives. Without it, the methodology says "we hold exercise assumptions
fixed" and nobody can say whether that matters — which is the state in which an approximation survives
indefinitely.

**This ticket exists because the alternative is an implicit choice.** Whichever engineer wires the fan-out
first will decide this, probably in favour of holding assumptions fixed because it is faster, and the
decision will never be recorded. **The resulting understatement is invisible in the output**, which is
precisely why it needs a ticket rather than a code comment.
