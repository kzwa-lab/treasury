# P6-07 — Internal Curves & the FTP Component Engine

**Wave 3. Depends on P6-01, and on D9 and D10 parameters from Phase 3.**

Governing artifacts: `d12-funds-transfer-pricing` §1.2, §1.3, §2.

## The curve service already exists

**D3 established the `internal` curve class in Phase 0**, precisely so that *"a regulatory return can
assert that no internal curve entered it."*

**D12's arrival adds curve content, not a second curve service.** The storage, versioning, provenance and
approval machinery is D3's and has been running since Phase 0.

## D12 calibrates nothing — it consumes three parameter sets from two owners

| Component | Consumes | Owner |
|---|---|---|
| **Base / repricing rate** | Split 3 — maturity profile and repricing beta | **D9** |
| **Liquidity / term premium** | Split 2 — core/volatile stability | **D10** |
| **Option cost** | Prepayment, early redemption, drawdown models | **D9** |

**D9's "one behavioural model set consumed by both" means one *inventory*, not one *parameter*** — and
reading it literally would source the liquidity premium from rate-risk parameters, satisfying D9's
acceptance criterion while violating D10 §5.1 (`D12-1`). The reconciliation report shows **all three
parameter sets against the common segmentation**, with a column for which set each component consumed.

## A maturity profile is not a point

**The natural implementation takes a weighted-average life from D9's profile and prices at one curve
point. That reintroduces the divergence while appearing to satisfy every criterion.**

A deposit priced at the weighted-average life of its profile receives **a different credit** from the same
deposit priced as a portfolio of tranches across the profile — and **the difference is the curvature of
the curve**, material in a steep or inverted market, which is precisely when ALCO is looking.

**Requirement: profiled balances are priced over the profile, tranche by tranche** — the replicating
portfolio technique. And **the replicating portfolio and D9's slotting profile must be the same object**,
not two representations of one intent maintained separately. If treasury's replicating portfolio drifts
from D9's profile, **the bank hedges one profile and measures another.**

## Two components that get omitted

- **Contingent liquidity charge — `D12-6`.** Undrawn commitments consume LCR outflow and NSFR RSF while
  generating no funding need. **Charging nothing is the most reliable way to damage a ratio through
  internal pricing**, and it is invisible in margin because the cost sits in a ratio
- **Option cost — `D12-8`.** A prepayable fixed rate loan contains an option D9 identifies as *"sold by
  the bank."* Without the charge, the unit books the full spread and treasury absorbs the option at zero
  internal price — **underpricing the prepayable book with no decision having been taken**

## Out of scope

- Methodology — P6-01
- Transfer contract generation — P6-08
- Behavioural calibration — D9, D10

## Acceptance criteria

1. **D12 calibrates no behavioural parameter of its own** — demonstrated by **the absence of a fourth
   deposit split**, not by assurance
2. The repricing component consumes **D9's split 3** and the liquidity component **D10's split 2**, each
   at a named version; **the three-column reconciliation passes** (`D12-1`)
3. **A transfer price is stored as named components, never a single rate or assigned tenor**; any rate
   decomposes on query
4. **Profiled balances price over the profile, tranche by tranche**, and the replicating portfolio *is*
   D9's slotting profile — one object
5. Contingent liquidity charge and option cost are **both charged**, from D10's factors and D9's models
6. Internal curve content is served through **D3's existing `internal` curve class**
7. Every rate reproduces from curve version, parameter versions and methodology version

## Notes

**Criterion 1's "absence of a fourth split" is the test that matters.** The pressure to calibrate a
D12-specific deposit view will be real — the FTP team will want a parameter that suits pricing. The moment
it exists, the bank transfers a different risk from the one it measures, **and the residual sits with
treasury unmeasured and unattributed.**

**Criterion 3 is D8's adjustment stack applied to internal pricing.** A transfer rate arriving as one
number cannot be decomposed later, and *"why is this deposit's credit 40bp lower than last year"* becomes
an investigation rather than a query.
