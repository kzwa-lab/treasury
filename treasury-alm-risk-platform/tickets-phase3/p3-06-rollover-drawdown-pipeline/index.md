---
kind: ticket
title: "P3-06 — Rollover, Drawdown & Pipeline"
status: 0
---

# P3-06 — Rollover, Drawdown & Pipeline

**Wave 2. Depends on P3-01, P3-02.**

Governing artifacts: `d9-alm-and-irrbb` §6.3.

## In scope

The remaining behavioural models, each smaller than P3-04 but none optional:

| Model | Applies to | Driver |
|---|---|---|
| **Rollover / stickiness** | Wholesale and corporate term deposits | Relationship, rate competitiveness, market conditions |
| **Drawdown** | Undrawn commitments, revolvers, overdrafts | Utilisation; **rate-dependent for priced facilities** |
| **Pipeline** | Committed but undrawn new business | Pull-through rate. **Dynamic NII only** |

**Rollover has a second consumer:** D10's rollover risk metric needs the assumption, and P3-14 consumes
it. The maturing profile is contractual and already available from Phase 1; the assumption applied to it
is this ticket's.

**Drawdown has a Phase 1 counterpart that must not be confused with it.** P1-01 authored *prescribed*
drawdown factors for the LCR. These are the bank's *modelled* rates for internal metrics. **Same
exposure, two numbers, and both are correct** — the prescribed one is a regulatory constant the bank may
not substitute its own view for, and the modelled one is its actual view.

## The boundary this ticket draws

**Automatic optionality is not a behavioural model.** Embedded caps, floors and collars in loans and
deposits are **rate-path-dependent and valued by D8**, not modelled here.

| | Automatic optionality | Behavioural optionality |
|---|---|---|
| Exercise | Mechanical, when rates cross a level | Imperfect and slow |
| Rationality | Rational | Not |
| Owner | **D8 values it** | **D9 models it** |

**Both are optionality; only one is rational**, and they must be measured separately. Folding an embedded
cap into a behavioural model produces a fitted approximation of something that has an exact answer.

## Out of scope

- Automatic optionality valuation — D8, Phase 2
- Prescribed LCR drawdown factors — Phase 1
- Execution — P3-07

## Acceptance criteria

1. Each model is separately parameterised, versioned and inventoried
2. Drawdown is rate-dependent for priced facilities, and the prescribed and modelled rates are
   **separately stored and separately labelled** — neither overwrites the other
3. Pipeline is **available only to the dynamic NII basis** and cannot leak into static or constant runs
4. Rollover assumptions are exposed to P3-14's rollover risk metric as a named, versioned parameter
5. The automatic/behavioural boundary is enforced: an instrument with an embedded cap routes to D8 for
   the option and to D9 only for the behavioural component

## Notes

**Criterion 3 is a real containment problem.** Pipeline volumes are new business, and new business has no
place in a run-off or constant balance sheet. A pipeline model that is available by default will find its
way into a static NII run, and the resulting number measures plan-plus-rates while being labelled
rates-alone.

**Criterion 2 protects the Phase 1 ratios.** If the modelled drawdown rate overwrites the prescribed one
anywhere in the store, the LCR silently stops being the regulator's number — which is the one property
Phase 1 was built to guarantee.
