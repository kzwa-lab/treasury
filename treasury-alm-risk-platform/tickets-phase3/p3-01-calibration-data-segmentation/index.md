---
kind: ticket
title: "P3-01 — Calibration Data & Common Segmentation"
status: 0
---

# P3-01 — Calibration Data & Common Segmentation

**Wave 1. Depends on P0-01, P0-07, P0-13.**

Governing artifacts: `d9-alm-and-irrbb` §6.1, §11 q1–q3; `d10-liquidity-and-funding` §5.1.

## Why this precedes every model

Two things must exist before a behavioural model can be calibrated, and neither is a model:

1. **The history** — balance and rate behaviour through at least one full rate cycle
2. **The segmentation** the models are calibrated *over*, which is **shared** and must be governed as
   shared

Building the models first and discovering the segmentation afterwards produces three modules that each
segment the deposit book their own way, which is the failure `d10-liquidity-and-funding` §5.1 exists to
prevent.

## In scope

### The common segmentation

**One governed customer and product segmentation**, versioned in D1, over which D9's, D10's and later
D12's parameters are all computed. Product, customer type, and — where the data supports it — customer
tenure and balance band.

**This is the only thing the three consumers share.** The parameters computed over it are deliberately
different:

| # | Split | Owner | Nature |
|---|---|---|---|
| 1 | Stable vs less-stable retail (LCR) | D10, prescribed | **Not a model** — a rules test. Already live from Phase 1 |
| 2 | Core vs volatile balance | D10, behavioural | **Phase 3** — how much cash leaves under stress |
| 3 | Core/non-core + maturity profile + beta | D9, behavioural | **Phase 3** — how value and earnings respond to rates |

**Splits 2 and 3 must not share a parameter.** A deposit can be perfectly stable and reprice instantly —
a large corporate operational balance that never leaves but is priced off the policy rate is stable for
liquidity and effectively overnight for IRRBB. The reverse also occurs.

### The calibration dataset

- Historical balance behaviour by segment, at the grain the segmentation requires
- Historical deposit rates paid, against market reference rates, for beta calibration
- Prepayment and early redemption history for P3-05
- **A stated data-quality and coverage position per segment** — what exists, over what window, and
  where it is thin

## Out of scope

- The models themselves — P3-04, P3-05, P3-06
- Market risk factor history — D3 §6, and a different dataset with a different clock
- Split 1 — Phase 1, and not a model

## Acceptance criteria

1. The segmentation is versioned D1 reference data with a single owner, not three private copies
2. Coverage is **reported per segment**: history depth, gaps, and whether a full rate cycle is present
3. Where history is insufficient, the affected models are marked **judgement-led**, and that marking
   reaches the ALCO pack — it is not resolved by a footnote
4. The dataset reproduces: a recalibration run against a stated vintage returns the same parameters
5. **The three-way reconciliation is producible** — splits 1, 2 and 3 shown against the common
   segmentation, with a third column for which set each future FTP component will consume (`D12-1`,
   D10 AC9, D9 AC9)

## Notes

**Criterion 3 is the one that protects the bank.** If the history is not there, the first-generation
models are judgement-led — which is a perfectly legitimate position and a disclosure obligation. The
failure is not having weak models; it is having weak models that present identically to strong ones.
This is the same principle as the suspense presentation in P0-08 and the provenance requirement in
P1-05: **make the weakness visible rather than tidy.**

**Segmentation granularity sets the ceiling on model quality** (gating decision 4), and it is bounded by
what customer data the bank actually holds — product only, or product plus customer type plus tenure
plus balance band. That question should be answered before P3-04 starts, because re-segmenting after
calibration means recalibrating.
