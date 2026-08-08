---
kind: ticket
title: "P3-02 — Behavioural Model Governance Onboarding"
status: 0
---

# P3-02 — Behavioural Model Governance Onboarding

**Wave 1. Depends on P0-11.**

**The wave-1 item most likely to be argued into a later wave, and the one that must not move.**

Governing artifacts: `d15-model-governance` §3, §4, §5; `d9-alm-and-irrbb` §6.4.

## Why governance precedes the models

**Validation before first use means the validation capability must exist when the model does.** Phase 3
introduces the largest cluster of models in the programme. A model built in wave 2 and validated in wave
5 has been setting limits and feeding the ALCO pack for three waves.

**And an unvalidated model is invisible.** A missing four-eyes is a gap someone can point at; an
unvalidated model **produces a number that looks exactly like a validated one**, is used to set limits
and file returns, and is discovered when a regulator asks who validated it.

## In scope

- **Onboard every Phase 3 model into D15's inventory** with owner, tier, documented methodology, data
  sources, calibration window and **approved usage as a list of named consumers and purposes, not free
  text** (`D15-5`)
- **Validation before first use**, per model, with the evidence recorded
- **Start the periodic revalidation cycle** — it begins with the second model, not with Phase 7
  (`D15-2`), and by Phase 3 the Phase 2 curve models are already due
- **Calibration frequency and out-of-cycle trigger conditions** per model
- **Backtesting where a realised outcome exists** — predicted versus actual balance behaviour,
  prepayment rates and deposit betas
- **Sensitivity analysis as standard output for every tier-1 model — `D15-11`.** D9 §6.4 states this as
  a D9 requirement; it generalises, because it is the **primary validation evidence for every model that
  cannot be backtested**. About two-thirds of the inventory has no realised outcome — EVE, curve
  construction, the proxy hierarchy — and for those, showing how the output moves with each input is the
  strongest evidence available
- **Version control and effective dating**, so a metric movement decomposes into balance sheet change
  versus recalibration

## Out of scope

- Building or calibrating the models — P3-04, P3-05, P3-06
- The aggregate model risk view — **Phase 7**, correctly. What accretes here is inventory, validation
  and change control
- Whether an independent validation function exists — a hiring decision (`D15-13`), not a build item

## Acceptance criteria

1. No Phase 3 model reaches production without a recorded validation, and this is **enforced by D17's
   model validity gate** rather than by process discipline (`D15-12`, `p1`-era D17 §3)
2. Approved usage is a list of named consumers and purposes; an unlisted consumer is a change requiring
   the model owner's agreement
3. Sensitivity analysis is produced for every key assumption **as standard output, not on request**
4. The revalidation calendar exists and its first entries are already-due Phase 2 models
5. A recalibration produces an impact statement before activation
6. Backtesting coverage is a **recorded inventory field** — "no backtest" is a category or a finding,
   never ambiguous (`D15-4`)

## Notes

**The impact statement acquires a running cost here, and it should be budgeted rather than absorbed —
`D15-9`.** `d15-control-core` §4's dry-run was specified against rule sets, where it is a classification
pass measured in minutes. **A recalibrated NMD model's impact statement is a full EVE and NII re-run
under both parameter sets** — a complete D9 cycle, twice. Recalibration is *scheduled*, so this is a
periodic workload needing an allocation, most naturally alongside `eod-window-and-degradation` §5.4's
off-window workloads. Phase 0 costed the capability; nobody costed its Phase 3 operation.

**Criterion 1 is the one with teeth.** Gating on an overdue revalidation would stop the bank reporting,
which is why D17's gate is a `Warn` producing a provisional flag rather than a `Fail`. That is the
decision already taken; this ticket consumes it rather than re-opening it.
