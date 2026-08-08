# P2-09 — Curve Construction & Volatility Surfaces

**Wave 3. Depends on P2-02, P0-04.**

D3's Phase 2 content. Governing artifacts: `d3-market-data-and-curves` §4, §3.5, §10.

## Why this is Phase 2 and not Phase 0

**Calibrating a curve means repricing its calibration instruments** — analytics that belong to the
library this phase buys (D3 §1.2). That circularity is why Phase 0 **consumes vendor-published curves**
and defers construction to here (`E3`).

The snapshot, versioning, provenance and governance infrastructure was built in Phase 0 and **is
indifferent to who calibrated the curve.** This ticket replaces the source, not the plumbing.

## In scope

- **Multi-curve construction in-house** — OIS discounting, index forecast curves, and the CSA-selected
  collateral discount curves P2-03's rule chooses between
- **Calibration instrument selection and method** — the bank's choice, which is why P2-01 makes
  calibration control an evaluation criterion
- **The extrapolation rule** beyond the last liquid point (see below)
- **Volatility surfaces — fitted, arbitrage-free and smile-consistent**, not interpolated. P2-08's
  barriers and digitals are the reason; a surface adequate for vanillas is not adequate for them
- **Credit spread curves** where valuation requires them — noting that CSRBB's wider requirement is
  gated separately (`D3-3`, Phase 3)
- **Migration from vendor curves**, with the changeover reproducible: historic dates continue to
  reproduce on the vendor curve that produced them

## The extrapolation rule needs ALCO, not a config default

**Gating decision 2, and it is easy to under-weight.** How far out is the swap curve genuinely liquid,
and how far does the banking book run past that point?

**If the gap is large, §4.1's extrapolation rule is one of the most consequential assumptions in the
whole platform** — it sets the discount factors for the longest-dated, most rate-sensitive part of the
book, and therefore a material share of EVE. It must not be a default buried in curve configuration
(`D3-4`).

## Out of scope

- Risk factor history and the proxy spread model — **Phase 5**
- Shocked and scenario derived snapshots — **Phase 3**
- The internal FTP curve class — Phase 6; the class exists from Phase 0, D12 fills it
- Security prices and haircuts — Phase 1, already delivered

## Acceptance criteria

1. Curves are constructed in-house from chosen calibration instruments, and the choice is versioned data
2. **The extrapolation rule is explicit, approved and visible to ALCO** — not a configuration default
3. Volatility surfaces are **fitted, arbitrage-free and smile-consistent**, demonstrated by pricing a
   barrier consistently with the vanillas that calibrate the surface
4. Curve definitions are **models in D15's inventory** — validated before first use, with change control
5. **The vendor-to-in-house changeover is reproducible**: a historic valuation reproduces on the curve
   that produced it, not on today's methodology
6. Provenance flows through construction into P2-06's propagation

## Notes

**Criterion 5 is the migration risk in one line.** Switching curve source silently re-bases every
historic valuation unless the old curves remain resolvable by version. Phase 0 built the versioning that
makes this possible; this ticket has to actually use it rather than treat the changeover as a cutover.

**D3 owns three model inventory entries, not one — `D15-3`.** Curve construction was never at risk of
being missed. **The fallback hierarchy and the proxy spread methodology were**, and both are tier 1:
the fallback *chooses a number* when the observed one is missing, and for a book dominated by names with
no traded CDS the proxy spread **drives CVA more than any observed spread does.** A proxy is a model.
