# P1-07 — NSFR Computation

**Wave 4. Depends on P1-01, P1-03, P1-04.**

Governing artifacts: `d10-liquidity-and-funding` §4.

```
NSFR = Available Stable Funding / Required Stable Funding  ≥  100%
```

A one-year structural measure. ASF factors weight liabilities and capital by tenor and stickiness; RSF
factors weight assets by liquidity and residual maturity. **Both are prescribed, so the same Phase 1
argument applies: NSFR needs classification, not behavioural models.**

## In scope

**Four design points where NSFR differs from LCR**, and each is a build item rather than a variation:

1. **Residual maturity drives the weighting**, so **the ratio changes as contracts age with no new
   business at all**. It must be **projectable forward, not only computed spot** — a treasurer needs to
   see the NSFR cliff before walking off it. This is the single largest functional difference from LCR
   and the one most often missed
2. **Encumbrance affects RSF**, scaled by the **encumbrance period** — not by an encumbered flag. P0-10's
   register carries `valid until` for exactly this reason, and a boolean cannot express it
3. **Interdependent asset/liability pairs** may receive symmetrical treatment where the regulator
   permits it — **a configurable rule, not a hardcoded exception**
4. **Off-balance-sheet exposures carry RSF**, so P1-03's contingent inventory feeds this ratio too

Plus the shared machinery: ASF and RSF factor application from P1-01, per-currency reporting, and
decomposition to source contracts.

## Out of scope

- The regulatory return — D13-B, Phase 6
- Behavioural maturity for NSFR purposes — prescribed treatment only
- The FTP consequence of RSF consumption — D12, Phase 6 (`D12-6`)

## Acceptance criteria

1. NSFR reconciles to the regulator's worked examples, ASF and RSF factor sets complete
2. **The ratio projects forward** over at least a one-year horizon on a static balance sheet, showing the
   cliff — not only a spot figure
3. RSF weighting reads the **encumbrance period** from P0-10's register, and a change in residual
   encumbrance duration moves the ratio correctly
4. Interdependent pair treatment is a rule that can be switched by configuration and is off by default
5. Contingent exposures from P1-03 carry RSF
6. The ratio decomposes to contracts and reproduces historically

## Notes

**The forward projection is what makes NSFR useful rather than merely compliant.** A spot NSFR tells the
treasurer nothing they can act on: the ratio degrades on its own as term funding rolls down into the
under-one-year bucket, and the moment to act is months before the number crosses. A Phase 1 NSFR that
computes only spot will be re-built in Phase 3 when someone asks for the projection.

**Encumbrance period, not encumbrance flag, is the recurring trap.** It is the fourth of the four ways a
position-level boolean misstates the buffer (parent §1.3), and it is the one that shows up in NSFR rather
than LCR. P0-10 was built to the full-D6 grain precisely so this ratio does not need re-plumbing when D6
arrives in Phase 4.
