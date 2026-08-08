# P3-09 — Economic Value of Equity

**Wave 3. Depends on P3-07, P3-12 (if CSRBB in scope), and on Phase 2's D8.**

Governing artifacts: `d9-alm-and-irrbb` §4, §4.1.

```
EVE  = PV(banking book assets) − PV(banking book liabilities)
ΔEVE = EVE(shocked curve) − EVE(base curve)
```

A long-run, present-value measure: what happens to the bank's economic value if rates move and the
balance sheet runs off.

## The four modelling choices, which are the ticket

**Each changes the result materially, each is a policy decision rather than a calculation, and each must
be configurable, documented and consistently applied — with the configuration versioned alongside the
result.**

| Choice | Options | Effect |
|---|---|---|
| **Commercial margins** | Include margins and discount at a margin-inclusive rate, or strip margins and discount at risk-free | Materially changes ΔEVE. **Regulators typically prescribe margin-excluded for the outlier test while banks manage on margin-included. Both must be producible** |
| **Own equity** | Include as zero-cost funding with an assumed investment profile, or exclude | Including it **imports an assumption about equity's investment term that can dominate the result.** The standard supervisory approach excludes it |
| **Run-off vs constant** | EVE is a **run-off** measure — no new business | This is what distinguishes it from NII and **must not be silently violated** |
| **Discount curve** | Risk-free, or the bank's own funding curve | Interacts with the margin choice. **An incoherent pair produces a plausible-looking number that means nothing** |

**The margin and discount choices are one decision, not two.** Margin-inclusive cashflows discounted at
risk-free double-counts the margin; margin-excluded cashflows at a funding curve strips it twice. The
platform must enforce the coherent pairings rather than offering four independent switches.

## In scope

- EVE on both base and shocked curves, using P3-03's definitions
- **Both the margin-included and margin-excluded views**, each labelled
- With and without own equity, each labelled
- Run-off enforcement — new business cannot enter an EVE run
- ΔEVE per shock, feeding P3-11's outlier test
- Per-currency EVE, since shocks are per-currency calibrated

## Out of scope

- The outlier test itself — P3-11
- NII — P3-10
- Valuation and discounting mechanics — D8, Phase 2
- Reverse stress asking what shock consumes a stated share of capital — **Phase 6**

## Acceptance criteria

1. All four choices are **configuration, versioned alongside every result**, and no result exists without
   its configuration recorded
2. Margin-included and margin-excluded are both produced, and the pairing with the discount curve is
   **enforced rather than offered**
3. Own equity is excluded by default, and its inclusion is a labelled, approved variant
4. **A run-off violation is impossible, not merely discouraged** — no pipeline, no new business
5. EVE decomposes: movement attributable to position, curve and assumption change separately
6. **Convexity is visible** — the shock ladder shows the optionality P3-05's models carry
7. Historic EVE reproduces under the parameters, overlays and configuration in force at the time

## Notes

**Criterion 1 is what makes the number defensible.** Four binary-ish choices produce a family of
defensible EVE numbers that differ materially. Absent the configuration travelling with the result, two
correct EVE figures from different runs are indistinguishable from an error — and a reviewer's first
question is which basis produced this.

**The equity choice deserves specific attention at ALCO.** Including own equity as zero-cost funding
requires assuming an investment term for it, and that assumption **can dominate the entire result**. It
is the single easiest way to produce an EVE profile that reflects a modelling choice rather than the
balance sheet. The supervisory default excludes it, and any internal view that includes it should be
presented alongside the excluded view rather than instead of it.
