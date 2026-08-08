# P3-12 — Basis Risk & CSRBB (conditional)

**Wave 4. Depends on P3-07. The CSRBB half is gated on a bank decision (`D3-3`).**

Governing artifacts: `d9-alm-and-irrbb` §7; `d3-market-data-and-curves` §12 q4.

## Two halves with different certainty

**Basis risk is unconditional.** CSRBB's scope is a live open question, and this ticket is either a real
build or a documented non-appearance depending on the answer. **It should be answered before wave 4
starts**, since it also determines D3's Phase 3 content.

## In scope — basis risk

Assets and liabilities repricing off **different indices, or the same index at different tenors**, do not
move together: prime-linked assets against term-deposit-linked funding, 3m against 6m reference rates,
policy rate against interbank rate.

**A gap report showing a matched position can conceal material basis risk.** Two requirements follow:

- **Index-level granularity in the repricing profile**, not merely fixed-versus-floating — a D2
  requirement this ticket consumes rather than creates
- **Basis scenarios where indices move by different amounts**, from P3-03's internal family

## In scope — CSRBB, if in scope

The risk that the **credit spread component** of banking book instrument values moves independently of
the risk-free rate. Applies principally to the **FVOCI investment portfolio** (Part 2 A.4), where spread
moves flow through OCI and **affect capital without touching P&L**.

Supervisors expect CSRBB to be identified, monitored and reported. **It belongs in D9 rather than in
trading book market risk because the instruments are in the banking book.**

### CSRBB and the FVOCI reserve are two views of one thing

The link must be explicit in both directions. The FVOCI revaluation reserve (Part 2 C.4) is the
**accounting expression** of the spread moves CSRBB measures:

- The reserve is a **derived value with no primitive of its own** (D2 §2.7) — computed from D8 valuations
  via D7, never posted independently. **D9's CSRBB measure and D7's reserve movement must reconcile to
  the same underlying revaluations**, and a reconciliation between them is the natural control
- **CSRBB is therefore a capital measure, not only a risk measure.** Its output belongs in D13's capital
  projection alongside the ALCO pack, because an unhedged spread move on a large FVOCI portfolio
  **reduces CET1 without ever appearing in profit or loss**

## The dependency the decision carries

**If CSRBB is in scope, D3 needs spread curve infrastructure beyond what valuation alone requires, and it
lands in Phase 3 rather than Phase 5** (`D3-3`). That is a D3 build item created by this decision, and it
is why the question gates more than this ticket.

## Out of scope

- Spread curve construction — D3, and conditional on the same decision
- Trading book credit spread risk — D11, Phase 5
- The FVOCI reserve computation — D7, Phase 4

## Acceptance criteria

1. Basis risk is **measurable at index level**, and a matched gap position with material basis exposure
   is visibly distinguished from a genuinely matched one
2. Basis scenarios move indices by different amounts, sourced from P3-03
3. **If CSRBB is in scope:** it is reported for the FVOCI portfolio, and **reconciles to D7's reserve
   movement** over the same revaluations
4. **If CSRBB is in scope:** its output reaches D13's capital projection, not only the ALCO pack
5. **If out of scope:** the decision is recorded as an explicit, dated, approved non-appearance with its
   rationale — not left as silence

## Notes

**Criterion 5 matters as much as the others.** A supervisor expecting CSRBB to be identified and
monitored will ask, and *"we considered it and concluded X, here is the approval"* is a different
conversation from *"nobody raised it"*. The same principle as P0-14's acceptance test 3: every class maps
to a named line **or an explicit intentional non-appearance**.

**One answer, three artifacts.** This decision discharges `D3-3`, D9 §11 q4 and D14 §12 q6 together. It
is the highest-leverage open question in the phase and among the cheapest to answer.
