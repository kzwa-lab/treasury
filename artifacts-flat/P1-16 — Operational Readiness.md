# P1-16 — Operational Readiness

**Wave 6. Depends on P1-06, P1-07, P1-12, P1-14.**

**The first phase whose output goes to a regulator**, which changes the nature of the parallel run.

## What goes live

**A ratio the regulator has been receiving for years, computed a different way.**

The bank already reports LCR and NSFR — assembled manually, from several systems and spreadsheets.
Phase 1 does not create the number; **it replaces how it is produced.** So:

> **The new ratio will differ from the old one, and explaining the difference is the deliverable — not a
> complication of it.**

Differences are expected and many will be **corrections**: encumbrance read from a register rather than
a flag, per-depositor insurance aggregation done properly, contingent inflows recognised only where
irrevocable, collateral outflow from a 24-month look-back rather than an estimate.

**A parallel run that produces a matching number has probably reproduced the old method's errors.**

## In scope

- **Parallel run of LCR and NSFR against the current process**, over a stated number of reporting cycles,
  with **every material difference resolved to a cause** — a correction, a methodology change, or a defect
- **A regulator conversation**, prepared: which differences are corrections, what the restated basis is,
  and from which date the new basis applies. **Better raised by the bank than discovered by the supervisor**
- **Rollback**: the manual process stays runnable until parallel running is signed off, with a stated
  maximum period
- **Training** for treasury and regulatory reporting on the new ratio's decomposition — a ratio that can
  be decomposed to contracts is only useful if people know how
- **Operational acceptance of P1-14's breach mechanism** — thresholds, escalation and the interim routing
  that exists because the limit framework is Phase 4
- **Look-back coverage reporting** in the operational pack, since the collateral proxy is disclosed to the
  regulator as an interim method and its retirement must be tracked

## Out of scope

- The ratios themselves — P1-06, P1-07
- The regulatory *return* — Phase 6. Phase 1 produces the ratio, not the submission
- Internal stress views — Phase 3

## Acceptance criteria

1. Both ratios have run in parallel for a stated number of cycles, and **every material difference
   resolves to a correction, a methodology change or a defect** — none unexplained
2. **The differences that are corrections are identified as such**, with their direction and size
3. A regulator communication position exists and has been reviewed by whoever owns that relationship
4. The manual process remains runnable throughout, with a stated retirement date
5. Treasury and regulatory reporting staff can decompose a ratio movement unaided
6. P1-14's breach detection and escalation has been exercised, not just configured
7. Look-back coverage appears in the operational pack alongside the ratio

## Notes

**Criterion 2 is where this gets uncomfortable and valuable.** If the new LCR is materially lower than
the old one because encumbrance was previously understated, **the bank has been reporting a ratio that
was too high**, and that is a disclosure question rather than an implementation detail. It is far better
discovered in a parallel run the bank controls than in a supervisory review.

**Criterion 4's "stated retirement date" prevents the common failure.** A manual process retained
indefinitely as a safety net becomes the number people actually trust, and the platform's ratio becomes
a shadow report nobody acts on.
