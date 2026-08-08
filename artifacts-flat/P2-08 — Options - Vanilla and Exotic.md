# P2-08 — Options: Vanilla and Exotic

**Wave 3. Depends on P2-05, P2-09.**

One of the phase's three highest-uncertainty tickets. Governing artifacts:
`d8-valuation-and-analytics` §4; `d3-market-data-and-curves` §3.5.

## In scope

| Class | Model tier |
|---|---|
| Caps, floors, European swaptions, vanilla FX options | Analytic or near-analytic, **smile-aware** |
| Bermudan callables, puttables, CoCos, capped/floored FRNs | **Term-structure model with calibration** |
| **Barriers and digitals** | **Smile-consistent model** |
| Embedded optionality in loans and deposits | Same models; the **automatic** half of P3-06's boundary |

**Embedded caps and floors are valued here, not modelled by D9.** They exercise mechanically when rates
cross a level, which makes them D8's; behavioural optionality — a borrower prepaying imperfectly and
slowly — is D9's. **Both are optionality; only one is rational**, and folding the mechanical one into a
behavioural model produces a fitted approximation of something with an exact answer.

## Exotic FX is in scope, and this is settled

**Source Part 1 §4 reads:** *"FX options — vanilla (calls/puts) and exotic (barriers, digitals)"*, and
the scope decision binds the platform to that universe.

**The question the artifacts kept asking — *are they held?* — was the wrong gate**, because the two
decisions have different lifetimes:

| Question | Answer | Governs |
|---|---|---|
| In the **universe**? | **Yes** | The library, the surface, the contract model. **Irreversible** |
| **Held today**? | Not answerable from the source | Only *where within Phase 2* this lands. **Reversible** |

**A vanilla-only library cannot be extended to barriers without changing vendor**, which is why P2-01
treats coverage as disqualifying. The contradiction originated in an artifact assertion that exotics were
"not currently held", which had **no basis in the source document** and survived five artifacts and a
critique finding before anyone checked (`D3-1`). It is not to be re-opened.

## The surface dependency

**Barriers and digitals are the reason P2-09's volatility surface must be fitted, arbitrage-free and
smile-consistent rather than interpolated.** A surface adequate for vanillas is not adequate here, and
the requirement flows from this ticket into that one rather than the reverse.

## Out of scope

- The surface itself — P2-09
- Behavioural optionality — D9, Phase 3
- Exercise assumption resolution for callables — P2-12
- Vega and other sensitivities — P2-10

## Acceptance criteria

1. Every option class in Part 1 prices, **including barriers and digitals**, with coverage evidenced
2. Pricing is **smile-consistent** where the class requires it, demonstrated against the fitted surface
   rather than a flat vol
3. Term-structure models calibrate against instruments the bank chooses (P2-01's calibration control
   criterion), not only the vendor's defaults
4. Embedded optionality routes to D8 for the option and to D9 only for the behavioural component
5. Monte Carlo valuations carry seed and path count and reproduce exactly
6. Model choice per class resolves through P2-05's registry, not through library defaults

## Notes

**Criterion 6 is easy to lose.** A library will happily pick its own default model for a barrier. If it
does, the bank's fair value depends on a vendor default that is not recorded anywhere, changes on
upgrade, and cannot be explained to a validator. **The registry must be the authority even where the
library has an opinion.**

**Where this ticket lands within the phase is the one genuinely open sequencing question** (gating
decision 3). If exotics are not currently held, the capability can follow the vanilla work; if they are,
it cannot. **Neither answer changes the library requirement** — which is the distinction that took five
artifacts to draw and is worth preserving.
