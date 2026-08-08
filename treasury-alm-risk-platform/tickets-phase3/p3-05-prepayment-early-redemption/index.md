---
kind: ticket
title: "P3-05 — Prepayment & Early Redemption"
status: 0
---

# P3-05 — Prepayment & Early Redemption

**Wave 2. Depends on P3-01, P3-02.**

Governing artifacts: `d9-alm-and-irrbb` §6.2, §6.3.

## In scope

### Prepayment

Residential mortgages, personal loans and other prepayable assets. A **conditional prepayment rate**
driven by rate incentive (the gap between contract rate and prevailing rate — the dominant driver),
seasoning, seasonality, burnout, and borrower characteristics where available.

**Prepayment is rate-dependent, which makes it an option the bank has sold.** Borrowers prepay when it
suits them, so **the model must be rate-path-sensitive, not a static constant.** A fixed CPR applied
across all shock scenarios removes precisely the optionality the measure exists to capture — and it does
so silently, producing a well-behaved EVE profile with the convexity engineered out.

### Early redemption

Retail term deposits. Break penalty against rate incentive, and **asymmetric: depositors break when
rates rise.** The mirror image of prepayment on the liability side, and it compounds rather than offsets
— the bank loses on both sides of an up-shock.

## Out of scope

- Automatic optionality — embedded caps, floors and collars exercise mechanically and are **valued by D8**
  rather than modelled here (P3-06 draws the boundary)
- Execution — P3-07
- The FTP option cost component — Phase 6

## Acceptance criteria

1. Prepayment is rate-path-sensitive: the same book under two shocks produces different CPRs, and the
   difference is attributable to rate incentive
2. Early redemption is asymmetric, with the up-shock behaviour visible
3. Both are backtested against realised prepayment and break rates — this is one of the few parts of the
   inventory where a realised outcome exists, and it should be used
4. Parameters are versioned; historic metrics reproduce
5. Models are inventoried and validated before first use (P3-02)
6. **Convexity is visible in the EVE profile** — a shock-ladder run shows the optionality rather than a
   near-linear response

## Notes

**The FTP consequence, recorded because the models are built here and consumed three phases later —
`D12-8`.** This section identifies prepayment as an option the bank has sold and measures it. **Nothing
in the platform makes the originating business unit pay for it** unless FTP carries an **option cost
component** built on these same models.

Without that component the bank **underprices its prepayable book with no decision having been taken** —
the omission appears nowhere, because the loan shows a healthy margin and the cost surfaces only as an
IRRBB number treasury cannot attribute to anyone. Phase 3 does not build the charge; it owes models whose
parameters are versioned and attributable so that Phase 6 can charge off them rather than re-deriving.

**Criterion 6 is the test that catches a static CPR.** A fixed prepayment rate produces an EVE profile
that is close to linear in the shock size. Real prepayable books are not, and the curvature is the point
of measuring them.
