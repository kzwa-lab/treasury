# P2-05 — Model Selection Registry

**Wave 2. Depends on P2-04, P0-06, P0-11.**

Governing artifacts: `d8-valuation-and-analytics` §4.

## Why model selection is governed data, not a code path

**A bought library ships dozens of models. Which one prices a given instrument is a bank decision with a
P&L.** It must be governed exactly as the classification rule sets are: **versioned, effective-dated,
approved, and changeable without a release.**

The same argument as `classification-rules-engine` §2, applied to a different rule class — and the same
failure if ignored: a switch statement over product codes, editable only by a developer, with no record
of who chose the model that produced last quarter's fair value.

## In scope

**The instrument-to-model mapping**, as versioned rule data:

| Instrument class | Model tier |
|---|---|
| Money market, FRNs, fixed bonds, FX forwards, IRS, basis swaps | Discounting on the CSA-selected curve (P2-03) |
| Caps, floors, European swaptions, vanilla FX options | Analytic or near-analytic, **smile-aware** |
| Bermudan callables, puttables, CoCos, capped/floored FRNs | Term-structure model with calibration |
| **Barriers, digitals** — in scope, Part 1 §4 | **Smile-consistent model** — the reason P2-09's surface must be fitted rather than interpolated |
| CDS, index CDS | Credit model with recovery assumption; index CDS prices off externally-supplied cashflows |
| ABS/MBS | Priced **off D2's externally-projected cashflows** — D8 discounts, it does not model the waterfall |
| **D2 Tier 3 structured products** | **Replicating portfolio, with product-approval sign-off** |

**Plus the numerical settings per mapping** — which form part of `model_config_version`.

## Two rules that follow

1. **A mapping change is a model change under D15** — the tier requiring validation before first use
2. **An instrument with no mapped model fails loudly.** Same principle as the rules engine's no-default
   rule: a position that cannot be priced is **reported as unpriced — not valued at zero, not valued at
   cost, and not quietly excluded.** The suspense argument from P0-08 applies to valuation too

## Out of scope

- The models themselves — the library
- Model validation — P2-15
- Classification of the instrument — P0-06

## Acceptance criteria

1. The mapping is versioned, effective-dated, approved data; **a mapping change requires no code release**
2. A mapping change routes through P0-11's control core and requires validation before first use
3. **An unmapped instrument is reported unpriced** — never zero, never cost, never excluded — and appears
   in a population report
4. Numerical settings are part of `model_config_version`, so a settings change is a version change
5. The Tier 3 path is either **built or explicitly documented as absent with a stated consequence**
   (gating decision 4)
6. Model selection for any historic valuation resolves to the mapping version in force at the time

## Notes

**Criterion 3 is the one that gets designed away under delivery pressure**, exactly as the rules engine's
no-default rule is. Valuing an unpriceable position at zero makes the batch complete and the P&L clean,
and it removes the position from every risk measure simultaneously. **An unpriced line is ugly, and being
ugly is its function.**

**Criterion 5 exists because "specify only" has a shelf life.** D2 §2.6 says the Tier 3 replicating-portfolio
path is specified rather than built, which is fine **until the first Tier 3 product is approved and there
is no valuation path** — at which point the pressure is to improvise one against a live trade. Deciding
now, either way, is cheap.
