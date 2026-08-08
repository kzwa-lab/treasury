---
kind: ticket
title: "P6-05 — CCR, CVA, Market & Operational Risk RWA"
status: 0
---

# P6-05 — CCR, CVA, Market & Operational Risk RWA

**Wave 2. Depends on P6-03, and on D11 from Phases 4 and 5.**

Governing artifacts: `d13-regulatory-reporting-and-capital` §3; `d11-market-and-counterparty-risk`.

## Four risk types, and D11 has already computed most of the inputs

| Risk type | Approach | Comes from |
|---|---|---|
| **Counterparty credit risk** | **SA-CCR, per netting set** | D11 — delivered in the **Phase 4** carve-out |
| **CVA capital** | Standardised CVA | D11, same netting sets |
| **Market risk** | Standardised — **trading book only** | D11's sensitivity aggregation; scoped by D2's book intent |
| **Operational risk** | Standardised — business indicator based | Financial statement inputs |

**This ticket is mostly assembly.** SA-CCR EAD and CVA arrive per netting set from D11; the market risk
capital number is computed from the sensitivity ladder D11 aggregates. **What D13 adds is the regulatory
weighting, the aggregation into RWA, and the return-ready presentation.**

## The market risk number is the sensitivity ladder

**Under Basel III/IV the standardised approach for market risk is the sensitivities-based method** —
delta, vega and curvature against prescribed risk weights and correlations.

**So the sensitivities *are* the capital number**, and two things that were decided phases ago land here:

- **The node set contains the prescribed regulatory tenor vertices exactly** — bound in Phase 1 by
  `p1-10`'s grammar as the 29-node union, so **no interpolation sits between the risk ladder and the
  capital number**
- **Re-binding a perturbation convention moves RWA** while the scenario version, the snapshot version and
  every other version line a reviewer checks stay identical (`G17`). The grammar version is therefore a
  required input to this calculation

**Gating decision 5 from Phase 5 resolves here** (`D11-11`): if "standardised" means the pre-FRTB
standardised measurement method rather than the sensitivities-based one, this becomes a maturity-ladder
computation over positions and the prescribed-vertex constraint weakens to a reconciliation argument.
**Answerable in an hour, and it should have been answered long before this phase.**

## Operational risk is the one input from outside the platform

Business-indicator-based operational risk RWA consumes **financial statement inputs** — not positions,
not market data. It is the only RWA component whose primary source is the general ledger rather than this
platform, and it should be scoped as an interface rather than a computation.

## Out of scope

- SA-CCR and CVA computation — **D11**, Phases 4 and 5
- Sensitivity computation and aggregation — D8 and D11
- Credit risk RWA — P6-04

## Acceptance criteria

1. SA-CCR EAD and CVA are **consumed per netting set from D11**, never recomputed here
2. Market risk RWA is computed from **D11's aggregated sensitivity ladder**, with the **grammar version
   recorded as an input**
3. **Market risk scope is trading-book-only, by D2's book intent dimension** — and the D9/D11 completeness
   check is evidenced, since a scope gap here is a capital gap
4. Operational risk inputs are sourced from the GL through a defined interface
5. All four components aggregate into total RWA with the composition reportable
6. RWA reproduces historically under the rules, factors and **grammar version** in force at the time

## Notes

**Criterion 2's grammar version is the subtle one.** Every other input to a capital number has an obvious
version — the rule set, the snapshot, the position set. **The perturbation convention does not look like
an input at all**, and it moves the number. It has been a reproducibility line since `G17` precisely
because a convention re-binding is otherwise invisible in the audit trail.

**Criterion 3 is where two modules' scope boundaries become a capital control.** Book intent is **the
only classification dimension where a misassignment moves risk from one module to another** rather than
mislabelling it — a gap is a position measured by nobody, an overlap is double-counted capital. The
completeness check belongs in D15's inventory, and this ticket consumes its result.
