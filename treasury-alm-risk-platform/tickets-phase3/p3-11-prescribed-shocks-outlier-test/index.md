---
kind: ticket
title: "P3-11 — Prescribed Shocks & Supervisory Outlier Test"
status: 0
---

# P3-11 — Prescribed Shocks & Supervisory Outlier Test

**Wave 4. Depends on P3-03, P3-09, P3-10.**

Governing artifacts: `d9-alm-and-irrbb` §4.2.

## In scope

**Apply P3-03's six prescribed shocks** — parallel up, parallel down, steepener, flattener, short-rate
up, short-rate down — to EVE and NII, and compute the supervisory outlier test.

**The test:** the bank is flagged where the **worst-case ΔEVE across the six shocks exceeds a prescribed
share of Tier 1 capital**, with a secondary test on ΔNII. Tier 1 capital comes from D13, which in Phase 3
means the interim figure rather than D13-B's computation — a dependency worth naming rather than
assuming.

**Two design requirements the calculation itself imposes:**

1. **The post-shock interest rate floor** — typically graduated by tenor and **permitting negative
   rates**. It is part of P3-03's shock definition rather than applied here, and this ticket consumes it
2. **Breaching is a supervisory trigger for dialogue, not an automatic failure** — so **the output must
   explain the driver, not merely report the breach**

## Why criterion "explain the driver" is the ticket

A boolean breach flag is the easy deliverable and the useless one. The bank is going to have a
conversation with its supervisor, and the question in that conversation is *why*. The output must
decompose the worst-case ΔEVE into what drove it — which shock, which portfolio, which behavioural
assumption, which currency — because the alternative is assembling that answer manually under time
pressure while the supervisor waits.

## Out of scope

- Shock definitions — P3-03
- EVE and NII computation — P3-09, P3-10
- Internal scenarios beyond the prescribed six — P3-03's internal family
- Reverse stress asking what shock consumes a stated share of capital — **Phase 6**
- The regulatory return carrying the result — **D13-B, Phase 6**

## Acceptance criteria

1. All six shocks compute, with **correct per-currency calibration** and post-shock floors applied
2. **Outlier test results reconcile to the supervisory definition**, including the capital denominator
   and the worst-case selection across shocks
3. The margin-excluded EVE view feeds the test, and the margin-included view is available alongside it
   (P3-09)
4. **A breach output explains its driver**, decomposed by shock, portfolio, assumption and currency
5. The secondary ΔNII test computes on the constant balance sheet basis
6. Negative rates are permitted where the floor allows, and this is tested rather than assumed
7. Results reproduce historically under the shock definitions and parameters in force at the time

## Notes

**Criterion 1's per-currency calibration is a common failure.** The prescribed shock magnitudes differ by
currency, and applying a single magnitude across a multi-currency book produces a defensible-looking
number that will not reconcile to the supervisor's. It is also invisible in a single-currency test.

**The Tier 1 denominator is a soft dependency worth hardening early.** D13-B arrives in Phase 6, so the
capital figure used here in Phase 3 comes from wherever the bank currently computes it. Naming that
source, and its refresh cadence, is part of this ticket — an outlier test whose denominator is a
spreadsheet value of uncertain vintage is a test in name only.
