---
kind: ticket
title: "P7-04 — Model Risk Appetite & Escalation"
status: 0
---

# P7-04 — Model Risk Appetite & Escalation

**Wave 2. Depends on P7-03.**

Governing artifacts: `d15-model-governance` §6; `d10-liquidity-and-funding` §7 for the pattern.

## Why appetite requires the aggregate measure first

**Without an aggregate measure, model risk appetite can only be expressed as "validate everything" —
which is not a policy anyone can hold.**

It is unachievable in a bank of this size (P7-05), so it is breached permanently from day one, which
means it is ignored. **A policy that is always breached provides less control than no policy**, because
it trains everyone to treat the breach as background noise.

**With P7-03's measure, appetite becomes expressible:** thresholds on the aggregate — *how much
unvalidated exposure the bank will carry, and for how long* — with defined escalation. **The same pattern
D10 §7 applies to liquidity risk appetite**, and it works for the same reason.

## In scope

- **Thresholds on P7-03's aggregate**, by status and tier — not a single number
- **A time dimension.** "How much" and "for how long" are different limits: a tier-1 model two weeks past
  revalidation is not a tier-1 model two years past, and a threshold with no clock cannot say so
- **Defined escalation** per threshold and severity
- **Breach recording** — what breached, when, by how much, who was notified, what was done
- Reuse of the escalation mechanism established in `p1-14` rather than a third mechanism

## The EOD gating question, already decided — confirm it survived

`D15-12` asked whether a model validity failure gates the EOD. **Both extremes are wrong:**

| Outcome | Consequence |
|---|---|
| `Fail` | An overdue revalidation **stops the bank reporting.** A governance lapse becomes an operational outage, and the pressure to override converts the control into a rubber stamp on first use |
| Silent pass | **The control has no teeth** |

**Decided as `Warn`** — outputs compute and carry a provisional flag, and the overdue model appears in
the daily provisional report rather than in an incident (D17 §3, gate type seven).

**This ticket confirms that decision survived contact with operations** (gating decision 4). A `Warn`
that everyone filters out of the provisional report is functionally a silent pass.

## Out of scope

- The aggregate measure — P7-03
- The gate machinery — D17, since Phase 0
- Validation capacity — P7-05, though appetite must be set against what capacity exists

## Acceptance criteria

1. Appetite is expressed as **thresholds on the aggregate, by status and tier** — never as "validate
   everything"
2. **Thresholds carry a time dimension**, not only a quantity
3. Escalation is defined per threshold and severity, **reusing `p1-14`'s mechanism**
4. Breaches are recorded with notification and response, queryable as a population
5. **The `Warn` gate decision is confirmed as still operating as intended** — overdue models are actually
   being seen, not filtered
6. Appetite is approved by the board risk committee and is versioned, effective-dated reference data

## Notes

**Criterion 1 is the substantive one, and it will meet resistance.** "We validate every model" is a
comfortable thing to say and an uncomfortable thing to measure. **Setting a non-zero appetite for
unvalidated exposure looks like lowering the bar; it is the opposite** — it is the first point at which
the bar becomes measurable and therefore enforceable.

**Criterion 2 exists because quantity alone is gameable in the wrong direction.** A bank sitting just
inside a quantity threshold has no incentive to clear the oldest items, and staleness compounds
invisibly. The clock is what forces the queue to drain.

**Criterion 5 is worth a genuine check rather than an assertion.** The `Warn` outcome was the right
decision, and its known failure mode is that provisional flags become background noise. **Ask whoever
reads the daily provisional report whether they have ever acted on a model validity warning.**
