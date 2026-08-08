# P0-12 — Orchestration, Gates & Provisional Flag

**Wave 4. Depends on P0-07, P0-09.**

Governing artifacts: `d17-batch-orchestration`; `eod-window-and-degradation`.

## In scope

- **The pipeline as a DAG, not a sequence.** A stage blocks only its **descendants**, never the whole
  run. Liquidity depends on projection and reconciliation, not valuation; accounting depends on P&L.
  Independent branches run in parallel and fail independently
- **Gates** — arrival, validation, reconciliation, approval, completion, **plausibility**. Three
  outcomes: pass, warn (proceed, flagged provisional), fail (descendants blocked)
- **Overrides** — four-eyes via P0-11, reason-coded, propagating provisional status, reported daily. **A
  gate that can be overridden without trace is not a gate**
- **The provisional flag** — transitive propagation through the DAG, and **rendered on the report, the
  export, the API response and the file name**, not on a dashboard. Cleared only by resolving the gate
  and re-running; never by hand
- **Re-run semantics** — full, partial (stage plus descendants), and targeted reprocessing. **Idempotent**,
  and **versioned rather than overwriting**: the provisional figure and its replacement both persist
- **Calendar awareness** — business days per centre, month-end and quarter-end variants, periodic stages,
  and **the regulatory reporting date calendar** which triggers P0-13's full-detail freeze
- **Cut-off management** as a controlled, audited parameter
- **Automated retry before escalation**, then **paging** — the window is 00:00–07:00 and entirely
  unattended
- **Run telemetry from day one** — stage durations, critical path, gate outcomes, retry counts,
  time-to-acknowledge

## Out of scope

- What any stage computes
- Business approval of results
- The stricter reporting-date gate policy (D13 §6.1) — noted here, enforced when returns exist in Phase 6

## Acceptance criteria

1. A failed stage blocks only descendants; a valuation failure does not block liquidity reporting
2. Every gate has a defined type, threshold and pass/warn/fail semantics
3. A plausibility gate catches a completed-but-wrong stage that completion checks structurally cannot
4. Overrides are four-eyes, reason-coded, propagate provisional and are reported daily
5. **The provisional flag renders on the artifact**, surviving export outside the platform
6. Re-runs are idempotent and versioned; nothing is overwritten
7. Transient failures auto-retry before paging; non-transient failures page
8. The **tier A path completes within 90 minutes** and the **full run within 3 hours**

## Notes

**The unattended window is the design driver, not the duration.** The F = 1 hour assumption in the
compute budget only holds with paging; without it a 02:00 failure is discovered at 07:00 and the window
is gone. Instrument F from day one — it is the assumption most likely to be wrong.

**A documented degradation order is required and is a business decision**, approved by ALCO and finance,
not improvised at 3am.
