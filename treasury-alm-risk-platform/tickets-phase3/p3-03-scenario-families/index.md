---
kind: ticket
title: "P3-03 — Scenario Families (D14 Phase 3)"
status: 0
---

# P3-03 — Scenario Families (D14 Phase 3)

**Wave 1. Depends on `tickets-phase1/p1-11`, `tickets-phase1/p1-10`.**

Governing artifacts: `d14-scenario-and-stress-framework` §1.2, §9; `d10-liquidity-and-funding` §6.

## What is inherited and what is added

**P1-11 built the envelope** — the scenario object, versioning, effective dating, calibration vintage,
the D3-applied shock path and the approval route — for one family, because P1-09's collateral proxy
needed it.

**This ticket populates the rest.** It adds families to a governed object that already exists; it does
not build a framework.

## In scope

### The prescribed rate shock family

Six standardised shocks — parallel up, parallel down, steepener, flattener, short-rate up, short-rate
down — each a curve transformation with **per-currency calibrated magnitudes**, expressed in P1-10's
grammar.

**Owned here, never hardcoded in D9.** The same definitions must be consumable by D10's stress framework
and D11's market risk, or the numbers will not reconcile across the ALCO pack. This is the whole reason
scenarios are a module rather than a configuration file.

### The internal rate shock family

Larger parallel shocks, historical rate paths, and basis-widening scenarios.

### The liquidity stress family

The minimum set from D10 §6: **idiosyncratic** (deposit run, ratings downgrade, loss of wholesale
access), **market-wide** (HQLA haircut widening, market closure), and the **combined** scenario — whose
composition is P3-13's, because combination is not addition.

Each parameterises deposit run-off, drawdown, haircut widening, market closure, rollover and collateral
outflows. **These are internal assumptions, distinct from LCR's prescribed factors** — the same engine,
a different factor set, which is exactly why D14 owns them and P1-01 does not.

## Out of scope

| Deferred | Phase |
|---|---|
| Composition and ordering, overlays, coherence review | **P3-13**, this phase |
| Stress period identification for stressed VaR | 5 |
| Macro paths, transmission registry, reverse stress | 6 |

## Acceptance criteria

1. The six prescribed shocks are D14 definitions consumed identically by D9, D10 and (later) D11 — not
   reimplemented per consumer
2. Every shock is expressed in P1-10's grammar, with the grammar version in its reproducibility record
3. Per-currency magnitudes are calibrated and versioned, and the **post-shock floor** is part of the
   definition rather than applied downstream
4. The liquidity family parameterises every driver D10 §6 lists, with each parameter's provenance
   recorded as prescribed or internal
5. Scenarios carry a calibration vintage and run **flagged** rather than suppressed when stale
6. A historic scenario run reproduces exactly

## Notes

**The reconciliation argument is the reason for criterion 1**, and it is easy to lose. If D9 hardcodes
the +200bp shock and D10 defines its own, both are defensible in isolation and the ALCO pack presents
two numbers that cannot be reconciled — with no error anywhere. The same failure at convention level is
what P1-10's grammar prevents; this is the same failure at definition level.

**Floors belong in the definition, not the consumer.** A floored shock is not a scaled perturbation
(`G16`): if the floor is applied downstream, attribution can no longer separate convention mismatch
(which must be zero) from floor binding (a real effect) from higher-order terms.
