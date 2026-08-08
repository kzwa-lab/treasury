---
kind: ticket
title: "P1-15 — Interim Non-Rate Representation Owner"
status: 0
---

# P1-15 — Interim Non-Rate Representation Owner

**Wave 1. No build dependencies.**

**Non-engineering.** A staffing line of the same class as P0-15, and it discharges `D11-10`.

Governing artifacts: `d11-market-and-counterparty-risk` §6.3; `d14-scenario-and-stress-framework` §12 q8.

## The gap

P1-10 binds the **rate** factor class, which is the settled half — the representation question has a
known answer set and Phase 1 can decide it. **The other factor classes have no owner in Phase 1:**

| Factor class | The open representation question |
|---|---|
| **Volatility** | Absolute point or relative shift |
| **Credit spread** | Par spread or hazard rate — **and whether recovery moves with it** |
| **FX** | Spot only, or spot plus forward points |

**D11 has the strongest opinion on all three and arrives in Phase 5** (D14 q8). Four phases is too long
to leave the question unassigned, because the grammar's *structure* is fixed in Phase 1 and the
volatility class binds with the Phase 2 library.

**And P0-15 explicitly scopes primary risk type out**, so the dimension `D11-8` splits in two — primary
risk type versus the SA-CCR hedging set — currently has no author in either Phase 0 or Phase 1 either.
The same person should hold both.

## In scope

- **Name an interim owner** for non-rate risk factor representation, on the same pattern as P0-15's
  interim rule authorship — a named individual or function, not a module
- **Bind the volatility class before the Phase 2 library RFP closes.** This is the one with a real
  deadline; the library's vega conventions are a purchase decision
- **Record credit spread and FX as deliberately deferred to Phase 3**, with the deferral written down
  rather than left as silence, and credit spread noted as gated on the CSRBB scope decision (`D3-3`)
- **Take custody of the primary risk type rule** and its separation from the SA-CCR hedging set
  (`D11-8`), authored into P0-06's engine when the derivative book requires it
- **Hand over to D11 in Phase 5** with the bindings already in production, exactly as P0-15 hands the
  accounting rules to D7

## Out of scope

- The rate class — P1-10, decided in Phase 1
- Building any of the non-rate grammars — Phase 2 and Phase 3
- SA-CCR itself — the Phase 4 counterparty carve-out (D11 §6.3)

## Acceptance criteria

1. A named owner exists, with the role recorded in the same place P0-15's interim owners are recorded
2. The volatility representation is bound **before** the Phase 2 library RFP closes, and appears in the
   evaluation criteria alongside P1-10's rate demonstrations
3. Credit spread and FX deferrals are recorded with a trigger, not merely omitted
4. The grammar's structure is **per factor class** from the start, so a later binding is an addition
   rather than a redesign
5. Primary risk type and the SA-CCR hedging set are recorded as two dimensions with one author

## Notes

**This ticket produces no software and its absence is invisible until Phase 2**, which makes it the kind
of item that gets dropped from a plan under pressure. The cost of dropping it is a library bought
against an unstated vega convention.

**It is small.** The work is a handful of decisions and a name, not a workstream. It is listed as a
ticket so that it has an owner and a wave rather than being assumed.
