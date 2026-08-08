# P5-01 — Risk Factor History Dataset & Coverage

**Wave 1. Depends on P0-04, `tickets-phase2/p2-09`, and on a Phase 0 purchase decision.**

**The ticket that can fail the phase**, and the one where a decision taken five years earlier comes due.

Governing artifacts: `d11-market-and-counterparty-risk` §4; `d3-market-data-and-curves` §6.

## The constraint

| Need | Depth | If absent |
|---|---|---|
| Historical simulation VaR | 1–2 years clean daily | **No VaR at all** |
| Stressed VaR, stress period identification | **10+ years containing a genuine stress period** | A "stressed" measure calibrated on a calm decade — **worse than none** |
| Proxy spreads | Sector / rating / region history | Uncollateralised CVA on unrated names has no spread input |
| Backtesting | Continuous from go-live | D15 cannot grade the model |

**History cannot be created retroactively.** Parent §6.1 calls this the one clock money can fix, and the
purchase decision belonged in Phase 0.

## In scope

- **Assemble the risk factor history dataset** — a **distinct dataset from the EOD snapshot series**:
  corporate-action-adjusted, gap-filled under a stated rule, organised by risk factor rather than by
  instrument
- **Integrate any purchased series** with the captured one, reconciling the overlap
- **Re-derive risk factors from raw quotes and instrument definitions** where the purchase was made
  correctly (`D11-4`) — a purchased *derived* series is bound to the vendor's conventions and cannot be
  re-expressed in the bank's representation
- **The grammar version travels with every series**, purchased or captured, and **the underlying level
  per observation**
- **Coverage measurement and publication** — see below

## Coverage is a published figure, not an internal note — `D11-3`

**A position whose risk factors have no history contributes zero VaR, silently.** It raises no error in a
historical simulation: **an absent factor is a flat series, which reads as a position with no risk.**

**The exposure is worst for proxied names, which is exactly where CVA also depends on the same
coverage** — so the same gap understates two measures at once, in the same direction.

**The rule, following D8's no-default principle: a position whose risk factors are not fully covered is
reported uncovered, never as zero-risk**, and **the uncovered proportion of the book is a published
figure.** This is the suspense argument from P0-08 and the unpriced-instrument rule from `p2-05`,
applied to risk.

## Out of scope

- The proxy spread model — P5-02
- Stress period identification — P5-08
- Market data capture — Phase 0, ongoing since

## Acceptance criteria

1. **Coverage is measured and published**: which risk factors have history, over what depth, and what
   proportion of the book is uncovered
2. **An uncovered position is reported uncovered, never as zero-risk**, and this is tested with a
   deliberately uncovered position
3. Every series carries its **grammar version and underlying level from first capture**, including
   purchased series
4. Corporate action adjustment and gap-filling rules are documented and applied consistently across
   captured and purchased data
5. The purchased and captured series reconcile over their overlap window
6. **The 10-year stressed-VaR window is assessed for whether it contains a genuine stress period** — and
   if it does not, that is stated as a finding rather than absorbed

## Notes

**Criterion 6 is the one that determines whether P5-08 is possible.** A ten-year window that happens to
contain no genuine stress period produces a stressed VaR that is *lower* than it should be while looking
entirely well-formed. Establishing this at the start of the phase is far better than discovering it when
the number is first challenged.

**If the purchase was never made, this ticket is where the programme finds out**, and the finding is
not recoverable by engineering. The honest response is to state the resulting limitation — which measures
are unavailable and which are calibrated on a short window — rather than to produce measures that look
complete. Parent §6.1 warned about this four phases earlier; this is the phase that pays for it.

**Corporate action and gap-filling decisions were made at capture, in Phase 0** (D3 §6). **D11 is the
consumer that discovers a wrong decision, five years after it was made** — which is worth knowing when
assessing the dataset rather than assuming it is fit for purpose.
