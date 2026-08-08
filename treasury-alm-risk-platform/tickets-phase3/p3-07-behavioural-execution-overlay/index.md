---
kind: ticket
title: "P3-07 — Behavioural Execution & Overlay Application"
status: 0
---

# P3-07 — Behavioural Execution & Overlay Application

**Wave 2. Depends on P3-04, P3-05, P3-06.**

Governing artifacts: `d2-instrument-position-core` §4.3; `d14-scenario-and-stress-framework` §3.2.

## The separation this ticket implements

**D9 defines the models. D2 executes them. D15 governs them.** Three separations that exist so the system
of record contains no opinions, the opinions are owned by the people accountable for them, and no one
marks their own homework.

This ticket is the middle one: **D2 gains the ability to project on a behavioural basis**, executing
parameter sets it does not own.

## In scope

- **Behavioural cashflow projection in D2** — the second basis alongside contractual, using P3-04's,
  P3-05's and P3-06's parameter sets resolved by version
- **The parameter set is an input, not embedded.** D2 stores and executes; it does not hold an opinion
  about deposit decay any more than it holds one about accounting classification
- **Overlay application on the same code path — `D14-3.2`.** Under a scenario, D2 executes base
  parameters **with the D14 overlay applied**, through the same execution path as an unstressed run.
  A separate stressed code path is how a stressed number and a base number stop being comparable
- **Both versions recorded per run** — the base parameter set version *and* the overlay version, or a
  metric movement cannot be decomposed into recalibration versus scenario change, and P3-15's assumption
  attribution becomes unsatisfiable
- **Projection performance on the behavioural basis**, given that the behavioural book reprojects
  whenever parameters change as well as whenever curves move

## The interaction rule

**An overlay is a deviation, not a replacement.** It references a base parameter set version and
expresses a **delta or an override per parameter** — and which one is an explicit choice per parameter,
not a house convention applied silently (gating decision 7).

*"Beta falls to 0.1 under stress"* and *"beta is multiplied by 0.3 under stress"* **diverge the moment
the base beta moves.** Overlays express the intended one explicitly; the framework does not guess.

**An overlay whose base has been recalibrated must be re-reviewed**, for the same reason.

## Out of scope

- Model definition and calibration — P3-04, P3-05, P3-06
- Scenario and overlay *authoring* — P3-13
- Contractual projection — P0-05, already delivered

## Acceptance criteria

1. D2 projects on a behavioural basis using versioned parameter sets it does not own
2. **A stressed run and a base run use the same code path**, differing only in the overlay applied
3. Every run records both the base parameter version and the overlay version
4. Delta-versus-override is explicit per parameter and validated at overlay activation, not at run time
5. A recalibration of the base invalidates dependent overlays for re-review rather than silently
   re-basing them
6. Historic behavioural projections reproduce under the parameters and overlays in force at the time
7. The behavioural projection fits the EOD window alongside the contractual one, or its budget is stated

## Notes

**Criterion 2 is the one that preserves comparability.** The moment a stressed run takes a different path
through the engine, any difference between base and stressed contains an unknown mix of scenario effect
and implementation difference — and the attribution in P3-15 silently absorbs it as "assumption change".

**Criterion 7 is a sizing flag rather than a design point.** The contractual book already reprojects daily
because the floating book invalidates its cache; the behavioural book adds a second full projection with
its own invalidation trigger — parameter changes, which are scheduled rather than daily. This is a
smaller increment than it first appears, and it should be measured rather than assumed in either
direction.
