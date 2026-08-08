# P5-13 — Backtesting Series & D15 Grading

**Wave 5. Depends on P5-07, P5-09.**

Governing artifacts: `d11-market-and-counterparty-risk` §2.4.

## Which P&L — the classic error

A VaR backtest compares the measure against realised P&L, **and which P&L is where implementations go
wrong:**

| Series | Contains | Verdict |
|---|---|---|
| **Actual P&L** | Intraday trading, new deals, fees, commissions | **Wrong comparator** — backtesting against it measures the desk's behaviour as much as the model |
| **Hypothetical P&L** | Position held constant at the previous close, revalued under today's market | **The correct comparator.** The only one that answers *"did the model predict the move on the book it was measured against"* |

**Clean versus dirty:** hypothetical P&L excludes fees and reserve movements. **Carry and time decay are
a documented choice** — either treatment is defensible **provided it is stated and stable.**

## D11 must not grade its own backtest

**D11 produces both series. D15 owns the exception counting and the grading.**

Parent §5's segregation principle, and the same reason D9 sends its own backtesting to D15. **It matters
more here than elsewhere**, for a reason specific to this bank:

> Regulatory market risk capital is **standardised**, so VaR is an internal management measure. **A
> backtest exception is therefore a management signal rather than a capital multiplier — which makes it
> *more* likely to be quietly tolerated, not less.**

**Where an exception costs capital, it gets attention automatically. Where it costs nothing, only
governance produces attention** — which is the whole argument for D15 grading rather than D11.

## In scope

- **The hypothetical P&L series** — constant position at previous close, revalued under today's market
- The actual P&L series, produced alongside for comparison but **not used as the backtest comparator**
- **The carry and time-decay treatment, documented and stable**
- Delivery of both series to D15, with the model inventory entries

## Out of scope

- **Exception counting and grading — D15**
- P&L attribution — P5-09, a different decomposition for a different purpose
- Backtesting of behavioural models — D9, Phase 3

## Acceptance criteria

1. Backtesting uses **hypothetical P&L on a constant position**
2. The carry and time-decay treatment is **documented and stable** — a change is a versioned model change
3. Both series are supplied to D15; **D11 does not count exceptions and does not grade**
4. The series are continuous from the first VaR production date, so the record accumulates
5. Where history coverage is incomplete (P5-01), the affected period is marked rather than gapped
   silently
6. The VaR model and its backtest are inventoried in D15 with an owner

## Notes

**Criterion 3 will feel like bureaucracy and is the ticket's main control.** It is entirely natural for
the team that built the VaR model to also count its exceptions — they have the data and the context. It
is also how a model with a deteriorating backtest keeps running: **not through dishonesty, but because
the people closest to it have the best explanations for each individual exception.** Separating the
counting from the building is what makes the pattern visible.

**Criterion 4 matters because the record only becomes useful with length.** A backtest series is
diagnostic at a hundred observations and merely suggestive at twenty. Starting it at first production —
even while the model is still being tuned — is much better than starting it when the model is considered
final.
