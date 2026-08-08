# P0-16 — Operational Readiness

**Wave 6. Depends on P0-12, P0-13, P0-14.**

**Added after the fact.** This breakdown originally stated that deployment and monitoring tickets were
deliberately absent. That was defensible for a single foundation phase and was then inherited unexamined
across six further phases — until a critique found **97 build tickets with no cutover, parallel run,
rollback, training or operational acceptance anywhere in the programme.**

## What actually goes live in Phase 0

**A daily batch that people depend on before breakfast.** Phase 0 has no dealers and no external
submissions, so its operational change is narrower than later phases — but it is the phase that
establishes **every operational habit the rest of the programme inherits.**

| Change | Who is affected |
|---|---|
| A nightly pipeline with gates that can **block** | Operations — the on-call rota and escalation |
| A **break register** with ageing and escalation | Operations, finance |
| A **suspense presentation** — unclassified balances that stay on the balance sheet | Finance, and whoever signs the balance sheet |
| Four-eyes on static data from the first record | Everyone who maintains reference data |
| A balance sheet generated from the platform rather than assembled | Finance |

## In scope

- **Parallel run** of the generated balance sheet against the current assembly process, for a stated
  number of cycles, **with the differences explained rather than merely reconciled**
- **Operational acceptance**: the batch runs, gates behave, breaks age and escalate, and the on-call rota
  is staffed and exercised — not designed
- **Training** for operations on break workflow, gate overrides and the suspense review; for finance on
  reading a balance sheet that carries an unclassified line
- **The standing forums** the design assumes exist: break review, suspense review, and the outstanding
  items report `d15-control-core` §6.2 warns *"becomes a page nobody opens"* without one
- **Rollback**: what happens if the platform's balance sheet cannot be produced — revert to the current
  process, with a stated maximum period before that becomes untenable
- **Monitoring and alerting** on the pipeline: stage durations, critical path, gate outcomes, retry
  counts, time-to-acknowledge (the telemetry `eod-window-and-degradation` assumes from day one)

## Out of scope

- The gate machinery — P0-12
- The EOD window and degradation order — approved separately by ALCO
- Anything involving dealers or external submission — Phases 4 and 6

## Acceptance criteria

1. The generated balance sheet has run **in parallel with the current process** for a stated number of
   cycles, and **every material difference is explained**, not just reconciled
2. The on-call rota exists, is staffed, and **has been exercised** — a failed gate at 2am has been
   handled once before go-live
3. Break and suspense review forums exist with named owners and a cycle
4. Operations and finance staff have been trained on the workflows that are new to them
5. **A rollback position is defined and tested**, with a stated maximum period it can hold
6. Pipeline telemetry is live from the first production run, not added later

## Notes

**Criterion 1's "explained, not just reconciled" is the substantive one.** A parallel run that produces
a reconciliation with a large unexplained residual has proved nothing — and the differences here are
expected and often *correct*, because the platform computes accrued interest that core banking also
supplies, and treats quarantined records as suspense rather than excluding them. **Each difference should
resolve to a design decision or a defect, and the count of unresolved ones is the acceptance number.**

**Criterion 2 sounds like process and is the one that fails in production.** `eod-window-and-degradation`
assumes a detect-and-fix time of one hour, achievable only with paging. **That assumption is load-bearing
for the whole degradation model** and it is untested until someone is actually paged.
