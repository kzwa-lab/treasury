---
kind: ticket
title: "P3-13 — Composition, Overlays & Coherence Review"
status: 0
---

# P3-13 — Composition, Overlays & Coherence Review

**Wave 4. Depends on P3-03, P3-07.**

Governing artifacts: `d14-scenario-and-stress-framework` §2.4, §3.2, §4.

## Three pieces of scenario machinery that P1-11 deliberately deferred

## 1. Composition — because combination is not addition

D10 §6's minimum set includes a **combined** scenario, and combining is not summing:

- A ratings downgrade (idiosyncratic) triggers CSA collateral calls; a market-wide spread widening
  changes the size of those calls. **Apply them in either order and the collateral outflow differs**
- Two scenarios may both cap a parameter — one flooring deposit beta at zero, another at the bank's
  policy floor. **The result depends on which applies last**
- A shocked curve derived from an already-shocked curve **is not the same object** as a curve shocked
  once by the sum

**Decision, already taken: composition is explicit, ordered, and stored as its own scenario** — a
first-class definition naming its components and their application order, approved as a unit, with its
own version. **It is not a runtime instruction to apply A and B together**, which would put the ordering
decision inside the consuming engine — precisely the divergence D14 exists to prevent.

## 2. Behavioural overlays

The scenario's **non-market** assumptions, published as a versioned effective-dated **overlay rule set**
held in D1 and executed by P3-07 on the same code path as the base parameters.

**Without this, the failure is deterministic:** D10 holds a scenario deposit run-off rate in its own
stress configuration, D9 holds a scenario deposit beta in its own, both edited by different people on
different cycles. Under a named "severe idiosyncratic stress" the bank assumes deposits run off 25%
while the retained deposits reprice with a beta calibrated on normal conditions. **Both defensible in
isolation; together they describe two different worlds, and the ALCO pack presents them on facing pages.**

**Delta or override is explicit per parameter** (gating decision 7), for the reason in P3-07.

## 3. Coherence review

**Nobody currently owns whether a scenario is internally sensible.** Each consuming module validates its
own inputs are well-formed; none validates that rates +300bp, deposits running off 25% and haircuts
widening 500bp describe a world that could exist.

**A review process with a checklist, not a validation rule** — making it algorithmic produces a
constraint engine that rejects the genuinely novel scenarios that matter most:

| Check | Failure it catches |
|---|---|
| Direction consistency | Rates up with deposit outflow *and* cheaper wholesale funding |
| Transmission coverage | A narrative variable that reaches no risk factor |
| Cross-family consistency | Liquidity stress and macro path disagreeing on the same policy rate |
| Severity proportionality | A "moderate" scenario more severe on one axis than the "severe" one |
| Historical plausibility anchor | Magnitudes with no reference to an observed episode and no stated reason for exceeding all of them |
| **Correlation realism** | Independently calibrated single-factor moves stacked as if jointly observed — **the most common way a "severe" scenario is quietly implausible** |

## Out of scope

- Scenario families — P3-03
- Overlay *execution* — P3-07
- Transmission registry and macro paths — **Phase 6**

## Acceptance criteria

1. A combined scenario is a **stored, versioned, approved object naming its components and their order**
2. No consuming engine can compose scenarios at runtime
3. Overlays are versioned D1 rule sets; delta-versus-override is explicit per parameter
4. **A scenario run records both base parameter and overlay versions**, so movement decomposes into
   recalibration versus scenario change
5. Coherence review is a recorded step with a completed checklist per approved scenario — evidence, not
   an assertion
6. Calibration vintage is required; stale scenarios run **flagged**, never suppressed

## Notes

**An overlay is an extension of a model's approved usage and is not free — `D15-5`.** The point of an
overlay is to push a parameter **outside the range it was calibrated on** — that is the exercise, not a
defect. But a model validated for a stated purpose over a stated range, run beyond it, is a **usage
extension requiring the model owner's agreement**, recorded in D15's inventory as a named consumer
(P3-02).

Two practical consequences: the extension is reviewed **once, when the overlay is approved**, rather than
argued about after a stress result looks implausible; and where a model genuinely cannot be extended — a
beta calibrated on one benign cycle, asked to behave under a 400bp shock — **that is a finding about the
scenario's reliability**, which the coherence review needs and which is invisible if the extension is
never recorded as one.

**Scenarios expire, and staleness is the failure nobody plans for.** A deposit run calibrated before 2023
on pre-digital-banking outflow speeds is not severe by current standards, and **it will keep reporting
"survived" until the day it does not.**
