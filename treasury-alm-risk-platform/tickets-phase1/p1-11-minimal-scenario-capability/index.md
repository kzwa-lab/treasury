---
kind: ticket
title: "P1-11 — Minimal Scenario Definition Capability"
status: 0
---

# P1-11 — Minimal Scenario Definition Capability

**Wave 3. Depends on P0-11, P1-05, P1-10.**

The D14 Phase 1 carve-out. Governing artifacts: `d14-scenario-and-stress-framework` §2.1, §9.

## Why a carve-out rather than all of D14 or none

D14 is a Phase 3 and Phase 6 module. But **P1-09's collateral outflow proxy is disclosed to a regulator
as an interim method**, and it is computed by stressing the derivative portfolio through market
scenarios. Without this carve-out that proxy rests on a spreadsheet whose provenance gets asked about in
year three.

The carve-out is small because it reuses what already exists: **P1-05's derived snapshots and P0-11's
control core.** It adds a scenario object and an approval route, not a framework.

## In scope

- **The scenario envelope** (§2.1) — the object, its identity, versioning, effective dating and
  calibration vintage
- **The market scenario family** — the shocks P1-09's proxy needs, expressed in P1-10's grammar
- **D3-applied shocks** — a scenario resolves to a derived snapshot via P1-05, so every consumer sees the
  same shocked market rather than applying its own interpretation
- **The D15 approval route** — scenarios approved through P0-11's control core, four-eyes, with the
  approver and date recorded
- **Scenario expiry** — calibration vintage is required, and a stale scenario **runs flagged rather than
  suppressed**, consistent with D17's provisional propagation (`G8`)

## Out of scope — deliberately, and this is most of D14

| Deferred | Phase |
|---|---|
| Behavioural overlays (§3.2) | 3 — needs D9's parameters to overlay |
| Prescribed rate shocks, internal shocks, liquidity stress family | 3 |
| Composition and ordering of scenarios (§2.4) | 3 |
| Coherence review (§4) | 3 |
| Stress period identification for stressed VaR | 5 |
| **Macro paths, transmission registry (§1.5), reverse stress** | 6 |

**No overlays, no macro paths, no transmission registry, no reverse stress.** The carve-out is the
envelope and one family.

## Acceptance criteria

1. A scenario is a versioned, approved, effective-dated object — not a configuration file or a spreadsheet
2. Applying a scenario produces a **derived snapshot with an identity**, consumed identically by every
   downstream user
3. Shocks are expressed in P1-10's grammar, and the grammar version is part of the scenario's
   reproducibility record
4. A historic scenario run reproduces exactly under the definitions in force at the time
5. Scenario approval routes through the control core with the same evidence as any other governed change
6. A scenario past its calibration vintage runs **flagged**, never silently

## Notes

**The carve-out's second member has the harder deadline.** P1-10's grammar is also a Phase 1 D14
deliverable, and its driver is not this ticket — it is the **Phase 2 library evaluation**. The two are
separated into two tickets because their deadlines come from different places, and treating them as one
item risks the grammar slipping to this ticket's schedule when it answers to the RFP's.

**Why the approval route matters more than it looks.** The proxy in P1-09 is the one model in the
inventory with a **planned retirement date**, and it is disclosed as interim. Everything about it — the
scenario it rests on, the version, the approver — is the sort of thing a supervisor asks about precisely
because the bank volunteered that it is temporary.
