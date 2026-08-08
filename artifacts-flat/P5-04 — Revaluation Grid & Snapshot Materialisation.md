# P5-04 — Revaluation Grid & Snapshot Materialisation

**Wave 2. Depends on P5-03, `tickets-phase2/p2-13`, `p2-14`.**

Governing artifacts: `d11-market-and-counterparty-risk` §5.3; `d3-market-data-and-curves` §8.

## What Phase 2 must have delivered

This ticket **assembles** rather than invents. If any of the following is missing, the correct response
is to stop and escalate, because none can be built here:

| Needed | From |
|---|---|
| The approximate revaluation path — payoff evaluation at a state | `p2-13` |
| The full-revaluation benchmark harness, runnable on demand | `p2-13` |
| Calibration sharing per derived snapshot, demonstrated at fan-out | `p2-14` |
| `T`, measured and published | `p2-14` |
| A grid licence sized on the Phase 5 multiplier | `p2-02` |

## In scope

- **The revaluation grid at fan-out** — ~250 derived snapshots daily for historical simulation, plus the
  Monte Carlo workload for P5-10
- **Materialised derived snapshots under bounded retention — `D11-9`.** At this volume the tempting
  answer is to perturb on demand and store nothing. **That is wrong**: an unmaterialised perturbation is
  a transformation applied inside a consumer, which is the divergence D3 exists to prevent, and an
  unmaterialised snapshot is **not reproducible**. Retention here is **shorter than the valuation
  retention** — the snapshots are a means, not a record
- **One grid shared between VaR fan-out and scenario fan-out** — D3 centralised shock application
  precisely so consumers do not each rebuild it, and the correctness argument is also the performance
  argument
- **Both parallelisation shapes.** Valuation parallelises cleanly **by subject**; a single Monte Carlo
  valuation parallelises **by path**, with a different granularity and memory profile. The grid design
  must handle both

## Out of scope

- The approximate revaluation path itself — `p2-13`
- The exposure simulation's schedule and budget — P5-14
- Scenario definitions — D14

## Acceptance criteria

1. Derived snapshots are **materialised and version-addressable**, under a stated retention **shorter
   than the valuation retention**
2. **D8 values against materialised snapshots and holds no perturbation path of its own**
3. VaR fan-out and scenario fan-out **share one grid**
4. Calibration is shared per derived snapshot, verified at the 250-snapshot fan-out rather than at one
5. Both subject-parallel and path-parallel workloads run
6. The measured throughput is reconciled against `p2-14`'s `T` — and a material divergence is
   investigated rather than absorbed

## Notes

**Criterion 6 is a check on Phase 2's homework.** If actual throughput diverges materially from `T ×
multiplier`, either `T` was measured on an unrepresentative population or the wrapper's fan-out behaviour
differs from its single-pass behaviour — and calibration sharing is the usual culprit. Finding this at
the start of wave 2 leaves time; finding it in wave 4 does not.

**Retention being *shorter* than valuation retention is deliberate and worth defending.** A derived
snapshot for a VaR run is an intermediate: what must reproduce is the VaR number and the inputs that
produced it, which the scenario definition and the base snapshot already pin down. Retaining 250 derived
snapshots a day at valuation-grade retention would dominate the platform's storage for no reproducibility
gain.
