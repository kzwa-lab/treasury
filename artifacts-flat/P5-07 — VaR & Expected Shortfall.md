# P5-07 — VaR & Expected Shortfall

**Wave 3. Depends on P5-01, P5-03, P5-04, P5-06.**

Governing artifacts: `d11-market-and-counterparty-risk` §2.1, §2.2.

## In scope

VaR and expected shortfall at defined confidence and holding period, **by risk type** (rates, FX, credit
spread, equity, commodity), **by book and desk**, with a **diversification decomposition**.

## The method choice, and what it commits to

| Method | Needs | Cost | Weakness |
|---|---|---|---|
| **Historical simulation** | 1–2y clean daily history | **250×+ full revaluation daily** | Assumes the past window represents the future; **a quiet window understates** |
| Parametric | Covariance matrix, sensitivities | Cheap — no revaluation | Assumes normality and linearity — **wrong exactly where the book has optionality** |
| Monte Carlo | Calibrated factor models | Highest | Model risk moves into the factor dynamics |

**Historical simulation is the honest default for a book with optionality, and it is also the one that
sizes the hardware.** Gating decision 2, and it should be made with the fan-out arithmetic on the table
rather than on methodological preference alone.

## Scope is book intent, and the boundary is shared with D9

**Market risk is trading-book-scoped**, by D2's book intent dimension — **the same dimension that scopes
IRRBB to the banking book.** That makes it **the only classification dimension in the platform where a
misassignment moves risk from one module to another** rather than merely mislabelling it.

- **A position must be in exactly one of the two.** A gap is a position measured by nobody; an overlap is
  double-counted capital. **The completeness check across D9 and D11 scope is a real control and belongs
  in D15's inventory**, not in either module's self-assessment
- **Internal hedges cross the boundary.** Where the trading book takes on banking book risk and lays it
  off externally, D11's trading book contains a position whose economic origin is the banking book, and
  it must be identifiable as such

## Out of scope

- Stressed VaR — P5-08
- Backtest grading — P5-13, and D15's
- Counterparty measures — P5-10, P5-11

## Acceptance criteria

1. Every VaR number resolves to a **method version, a history window version and a grammar version**
2. **An uncovered position is reported uncovered, never as zero-risk** (`D11-3`, P5-01), and the
   uncovered proportion is published alongside the measure
3. **The D9/D11 book intent scope test shows no gap and no overlap**, run as a control rather than
   asserted
4. Internal-hedge positions of banking book origin are identifiable within the trading book
5. Diversification decomposition is produced, and sub-portfolio VaRs reconcile to the total under the
   stated method
6. VaR is reproducible for any historic date under the method, window and grammar versions in force
7. VaR sits at **tier B** and is back-fillable — it does not gate the EOD

## Notes

**Criterion 2 is the one that makes the number honest.** A position whose risk factors have no history
contributes **zero VaR, silently** — an absent factor is a flat series, which reads as a position with no
risk. The exposure is worst for proxied names, which is where CVA also depends on the same coverage
(`D11-3`).

**A consequence of the standardised capital regime worth carrying into P5-13.** Regulatory market risk
capital is standardised, so **VaR here is an internal management measure, not a capital model.** That
lowers the regulatory validation burden and does not remove it — the measure drives limits, ALCO
reporting and risk appetite, so D15 validates it regardless. **What changes is that a backtest exception
is a management signal rather than a capital multiplier, which makes it *more* likely to be quietly
tolerated, not less** — and is the argument for D15 grading it rather than D11.
