---
kind: ticket
title: "P3-16 — Operational Readiness"
status: 0
---

# P3-16 — Operational Readiness

**Wave 6. Depends on P3-14, P3-15.**

**The phase whose operational change is mostly about how a committee reads a document.**

## What goes live

**An ALCO pack produced from source data**, replacing one assembled today — and **an internal liquidity
view the bank has never had.**

The technical change is large; **the behavioural change is larger.** The new pack carries things the old
one did not:

| New in the pack | What it demands of the reader |
|---|---|
| **Assumption attribution** — movement split into position, curve and assumption change | ALCO must learn to ask *which* changed, not just *what* |
| **EVE and NII shown together, with conflicts stated** | The committee can no longer optimise one without seeing the other |
| **Sensitivity to every key assumption**, as standard output | The assumptions become challengeable, which is the point — and uncomfortable |
| **Treasury's residual, split into risk decision and parameter vintage drift** | Two numbers where there was one, requiring opposite responses |
| **Models marked judgement-led** where history was insufficient | Some numbers now carry a visible caveat |

**A committee handed all of this without preparation will read it like the old pack and miss what is
new.**

## In scope

- **Parallel running of the ALCO pack** for a stated number of cycles — the old pack and the new one
  presented together, with differences explained
- **ALCO orientation**: what the new pack shows, what assumption attribution means, and **how to
  challenge an assumption** now that sensitivity analysis is standard output
- **The behavioural model approval cycle as an operating process** — who signs off a recalibrated deposit
  beta, on what cycle, with the impact statement in front of them
- **Training** for the ALM team on the model inventory, recalibration triggers and overlay authoring
- **Rollback**: the existing pack process remains runnable, with a retirement date
- **Operational acceptance of the recalibration workload** — the impact statement for a recalibrated model
  is a full EVE and NII re-run, and it needs a scheduled slot rather than borrowed headroom

## Out of scope

- The measures — P3-08 to P3-11
- Model validation — P3-02
- Scenario approval machinery — P3-13

## Acceptance criteria

1. The pack has run in parallel for a stated number of ALCO cycles, with differences explained
2. **ALCO has been oriented on assumption attribution and has used it at least once** — demonstrated by a
   challenge to an assumption, not by attendance at a briefing
3. The recalibration approval cycle is operating, with a named approver and an impact statement in the
   pack
4. **The recalibration compute slot is scheduled and its contention with other off-window workloads is
   resolved**
5. Judgement-led models are visibly marked in the pack, and ALCO understands what the marking means
6. The prior pack process remains runnable with a stated retirement date

## Notes

**Criterion 2 is deliberately behavioural and deliberately hard to fake.** The entire argument for making
assumptions explicit, versioned and challengeable fails at the last step if the committee receiving them
does not challenge. **The evidence is a minuted challenge to a specific assumption**, not a training
attendance record.

**Criterion 4 is the operational consequence of a finding made in Phase 0.** The impact-statement
capability was costed as a Phase 0 build with no running cost. From this phase it acquires a **recurring,
scheduled workload** — a full EVE/NII re-run under both parameter sets, every recalibration. It competes
with the exposure simulation and reverse stress for the same off-window compute, and **the contention is
invisible until two run on the same night.**
