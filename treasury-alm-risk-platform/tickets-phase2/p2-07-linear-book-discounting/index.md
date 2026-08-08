---
kind: ticket
title: "P2-07 — Linear Book Pricing & Discounting"
status: 0
---

# P2-07 — Linear Book Pricing & Discounting

**Wave 3. Depends on P2-03, P2-05.**

**The Phase 2 deliverable proper.** Everything else in the phase attaches to this.

Governing artifacts: `d8-valuation-and-analytics` §4, §8.

## In scope

**The linear book**, which is most of the treasury balance sheet by count:

- Money market instruments, FRNs, fixed bonds
- FX spot, forwards and swaps
- Interest rate swaps, basis swaps
- **MTM-resetting cross-currency swaps**, which are in the universe and are where a library's coverage
  claim is often thinner than it sounds

**Priced by discounting on the CSA-selected curve** — P2-03's rule, applied by P2-04's wrapper, never a
per-trade choice.

**Plus the externally-projected classes**, which are linear in D8's terms even though their cashflows are
not schedule-derived:

- **ABS/MBS** — priced off **D2's externally-projected cashflows**. D8 discounts; **it does not model the
  waterfall**
- **Index CDS** — prices off externally-supplied cashflows, a stepping factor over a reference pool

## Why the externally-projected classes sit here rather than with options

They carry the same D8 treatment as a bond: take the cashflows, discount them. **The complexity is in
D2's stored cashflows, not in D8's model** — which is the whole point of parent §2.2's "externally
projected" rate treatment, the one documented exception to the regenerate-don't-store rule.

Putting them with the option models invites someone to build a waterfall model in D8, which is the
boundary leak this phase is most vulnerable to.

## Out of scope

- Options of any kind — P2-08
- Sensitivities — P2-10
- Callable exercise resolution — P2-12
- Curve construction — P2-09; this ticket consumes whatever curves exist, Phase 0's vendor curves
  included

## Acceptance criteria

1. The full linear universe from Part 1 prices, class by class, with coverage evidenced rather than
   assumed
2. Discounting uses the **CSA-selected** curve via P2-03's rule; no trade carries its own curve choice
3. MTM-resetting CCS price correctly, including the reset mechanics
4. ABS/MBS and index CDS price **off D2's stored cashflows**, and D8 contains no pool or waterfall model
5. Values reconcile to counterparty statements where available, feeding P2-15's reconciliation
6. Every value is reproducible from its version triple

## Notes

**Criterion 4 is a boundary test, not a functional one.** If D8 acquires a prepayment or waterfall model
for ABS, it has taken on a class of work that belongs to the external pool model, and the "replace the
library without changing other modules" property quietly dies — because the replacement library will not
have the bank's waterfall.

**This ticket is where the phase's value first becomes visible.** Independent valuation of the linear
book is most of the daily P&L for a treasury operation, and it is available before the option work
completes. Sequencing it first gives the phase an early usable output rather than a single delivery at
the end.
