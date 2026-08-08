# P6-06 — Leverage Ratio

**Wave 2. Depends on P6-03, and on D6 from Phase 4.**

Governing artifacts: `d13-regulatory-reporting-and-capital` §4.

```
Leverage ratio = Tier 1 capital / Exposure measure
```

## The exposure measure is not the balance sheet

**That is what makes it easy to get wrong.** Four components, and three of them diverge from the
accounting view:

| Component | Note |
|---|---|
| On-balance-sheet exposures | **Including Balance objects** — cash, reserves, PP&E, all of it |
| Derivative exposures | SA-CCR replacement cost **plus** potential future exposure |
| **Securities financing add-on** | **Prescribed limited netting** — repo and reverse repo **gross up the measure in ways the balance sheet does not** |
| Off-balance-sheet items | At prescribed credit conversion factors (Part 2 D.1–D.3) |

## The SFT treatment is where D6's data earns its place

**The leverage measure needs transaction-level repo detail, not net positions.**

This is a concrete pay-off from a decision taken much earlier: P0-10 built the encumbrance register to
the **full-D6 grain** — *(holding, quantity, beneficiary, agreement, purpose, valid from, valid until)*
— rather than as a position-level flag, precisely so that Phase 4's D6 would inherit rather than rebuild.
**A netted repo position cannot produce this number.**

## In scope

- The full exposure measure across all four components
- **Balance objects included** — the leverage measure is one of the places where the Balance primitive's
  existence is load-bearing, alongside P6-03's four deduction lines
- Prescribed limited netting for SFTs, applied per the regulation rather than per the balance sheet
- Off-balance-sheet CCFs over P1-03's contingent register
- The ratio, its buffer requirement and its trend

## Out of scope

- SA-CCR computation — D11
- The encumbrance register — P0-10 and D6
- Capital numerator — P6-03

## Acceptance criteria

1. The exposure measure computes from **transaction-level SFT detail**, never from net positions
2. **Balance objects are included** — a reconciliation against total assets shows the divergences and
   explains each
3. Prescribed limited netting is applied per regulation, and **the difference against accounting
   offsetting is reportable**
4. Off-balance-sheet items apply prescribed CCFs over P1-03's register
5. The ratio reproduces historically
6. The divergence between the exposure measure and total assets is **explainable line by line** — the
   check that catches a balance-sheet-shaped implementation

## Notes

**Criterion 6 is the one that catches the classic error.** The natural implementation starts from total
assets and adjusts, which produces a number that is approximately right and wrong in the SFT and
derivative components. Building it bottom-up and *then* reconciling to total assets makes every
divergence deliberate, and the reconciliation is the artefact a supervisor asks for.

**This ticket is small and depends on two things being right elsewhere.** If P0-10's register was built
as a flag, or if D6 arrived in Phase 4 and replaced the register rather than growing around it, the SFT
add-on has no source and this ticket becomes a data-sourcing exercise instead of a calculation.
