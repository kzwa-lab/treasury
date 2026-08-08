---
kind: ticket
title: "P1-14 — Risk Appetite & Early Warning"
status: 0
---

# P1-14 — Risk Appetite & Early Warning

**Wave 5. Depends on P1-08, P1-12.**

Governing artifacts: `d10-liquidity-and-funding` §7, §9.

## The dependency that arrives two phases late

**This ticket has a gap in it, and the gap is architectural rather than an oversight.**

D10 §7 and §9 route threshold breaches to "the limit framework". **The limit framework is a Phase 4
component** — parent §1.5 moved it out of D11 precisely because D4's pre-deal checks and D9's, D10's and
D11's outputs all consume it, and leaving it inside a Phase 5 module recreated the Phase 4→5 dependency
inversion the architecture critique found. Until the amendment `D11-H2` landed, both D10 references still
read *"the same limit framework D11 operates"*, which was true of blueprint revision 1 and is not true
now.

**So Phase 1 produces breaches two phases before the thing meant to receive them exists.** That is a
decision to take, not a detail to discover:

| Option | Consequence |
|---|---|
| **Phase 1 carries its own threshold and escalation mechanism** | Small, and it will be replaced in Phase 4. The replacement is a migration with a live control in it |
| **Breach routing is manual until Phase 4** | Cheaper, honest, and it means a liquidity breach depends on somebody reading a report |
| Pull the limit framework forward | Rejected — it is scoped against D4's pre-deal checks, which do not exist |

**Recommended: the first.** A liquidity early-warning breach that depends on a human noticing is not a
control, and Phase 1 runs for the length of a phase before Phase 4 arrives. The mechanism should be
deliberately minimal so that replacing it is cheap.

## In scope

- **Risk appetite thresholds** on Phase 1's metrics — both ratios, concentration, encumbrance ratio,
  loan-to-deposit, funding gap — expressed as versioned, approved, effective-dated data
- **Early warning indicators** — threshold breaches on internal and market signals: spread widening,
  deposit outflow rates, ratings actions
- **A defined escalation path** per threshold, with the interim mechanism above
- **Breach recording** — what breached, when, by how much, who was notified, what was done
- **The handover contract to Phase 4's limit framework**, written now so the migration is a re-pointing
  rather than a re-derivation

## Out of scope

- The limit framework itself — **Phase 4**
- Pre-deal limit checking — Phase 4, with D4
- Market signal *sourcing* where it needs feeds the platform does not have — flag rather than build

## Acceptance criteria

1. Thresholds are versioned, approved through P0-11's control core, and effective-dated
2. A breach is **detected and escalated without a human reading a report**
3. Every breach is recorded with its notification and response, queryable as a population
4. The escalation path is defined per threshold and per severity, not globally
5. **The Phase 4 handover contract exists** — the interface the limit framework will consume, agreed
   before it is built rather than after
6. Historic breach state reproduces

## Notes

**Criterion 5 is what stops this being rebuilt.** The same discipline parent §6.2 applies to P0-10's
encumbrance register — build the Phase 0 subset to the full-D6 grain so Phase 4 inherits rather than
rebuilds — applies here. Phase 4's limit framework should find a breach interface it can adopt.

**On the deleted assumption.** Anyone reading D10 before the `D11-H2` correction would have planned this
ticket as "integrate with D11's limit framework", discovered in Phase 5 that D11 does not have one, and
rebuilt. The correction is recorded because the stale reference survived four blueprint revisions.
