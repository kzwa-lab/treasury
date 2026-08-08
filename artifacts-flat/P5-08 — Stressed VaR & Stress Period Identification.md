# P5-08 — Stressed VaR & Stress Period Identification

**Wave 3. Depends on P5-01, P5-04.**

Governing artifacts: `d11-market-and-counterparty-risk` §1.3.2, §2.2.

## The division of labour with D14

Stress period identification is a **search D11 runs and a decision D14 approves.** Neither module owns
both halves:

| Half | Owner |
|---|---|
| **Compute candidate stress windows** with implied losses, against a declared search bound | **D11** |
| **Approve the window** as the governed stress period | **D14**, through its scenario approval route |

**The search bound is declared rather than implicit.** A search over "all available history" is a
different exercise from a search over a stated window, and the two produce different answers as history
accumulates.

## In scope

- **The candidate search** — over the risk factor history, producing windows ranked by implied loss for
  the current portfolio
- **Submission of candidates to D14** for approval as a governed scenario object
- **Stressed VaR** computed over the approved window
- **Scheduled re-identification.** The stress period is not a one-off determination: as the portfolio
  changes, the window that stresses it most changes too

## The precondition that may not hold

**A 10+ year window containing a genuine stress period is required.** P5-01 criterion 6 establishes
whether the history actually contains one.

**If it does not, stressed VaR calibrated on a calm decade is worse than no measure at all** — it reports
a stress number that is lower than reality and carries the authority of a computed figure. The correct
response in that case is to state the limitation and consider a hypothetical stress scenario from D14
instead, **not to compute the measure anyway.**

## Out of scope

- VaR — P5-07
- Scenario approval machinery — D14, Phase 1 and 3
- Reverse stress testing — Phase 6

## Acceptance criteria

1. Candidate windows are computed **against a declared search bound**, and the bound is recorded with
   the result
2. The window is **approved by D14** as a governed scenario, not selected by D11
3. **Re-identification is scheduled, not one-off**, and its cadence is stated
4. Stressed VaR resolves to the approved window version, the method version and the grammar version
5. **If the history contains no genuine stress period, this is reported as a finding** and the measure is
   not presented as though it were calibrated on one
6. The uncovered-position rule applies here as it does to VaR (`D11-3`)

## Notes

**Criterion 5 is the honest failure mode**, and it will be unpopular. A stressed VaR is an expected
deliverable; declining to produce a meaningful one because the history does not support it looks like
under-delivery. But a stressed measure calibrated on a calm window **understates in exactly the
circumstances the measure exists for**, and it does so while looking entirely well-formed.

**Criterion 3 catches a common decay.** A stress period identified once, at build time, drifts out of
relevance as the portfolio changes — the window that stressed the 2027 book most is not necessarily the
one that stresses the 2031 book. Without a schedule, the identification is done once and inherited
indefinitely.
