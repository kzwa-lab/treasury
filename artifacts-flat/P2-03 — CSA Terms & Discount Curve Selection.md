# P2-03 — CSA Terms & Discount Curve Selection

**Wave 1. Depends on P0-02, and on `counterparty-documentation-workstream` track 2.**

**This is the ticket where a pre-Phase-0 clock comes due.**

Governing artifacts: `d3-market-data-and-curves` §4.2; parent §2.7, `E1`.

## The dependency that moved forward by two phases

**The discount curve for a collateralised derivative is selected from the CSA, not from the trade's
currency.**

| Situation | Discount curve |
|---|---|
| Under a CSA paying interest on EUR cash | The **EUR collateral rate** curve |
| Uncollateralised | The bank's **funding** curve |
| Cleared | The **CCP** rate |

**Revision 2 dated this dependency from D6, D7 and D11's arrival in Phases 4–6. That was wrong.**
Without structured eligible-collateral and collateral-interest terms the platform **cannot select a
discount curve, and therefore cannot value a collateralised derivative correctly** — it produces a
plausible number wrong by a basis.

**Valuation lands in Phase 2, so the deadline for `counterparty-documentation-workstream` is Phase 2,
not Phase 4** (`E1`). That is a two-phase acceleration of a **legal document review exercise with a long
lead time**, and it is the reason this ticket sits in wave 1 rather than alongside the pricing work it
serves.

## In scope

- **Structured CSA terms** across the counterparty population, sufficient for curve selection:
  eligible collateral schedule, collateral currency, collateral interest rate, and the cleared/uncleared
  and CSA/no-CSA determination
- **The discount curve selection rule** — versioned, effective-dated data resolving *(netting set,
  collateral terms) → curve*, executed by P2-04's wrapper and never hardcoded per trade
- **Coverage reporting**: which netting sets have structured terms, which do not, and what the fallback
  is for the remainder
- **The SA-CCR fields, captured now — `D11-2`.** MPOR, threshold, minimum transfer amount and the
  independent amount are **SA-CCR formula inputs, not only collateral parameters.** Adding them to the
  extraction template now is free; re-opening a completed legal review across the whole counterparty
  population in Phase 4 is not

## Out of scope

- Collateral management — D6, Phase 4
- Netting set definition — P0-02, already delivered
- The curves themselves — P2-09
- SA-CCR computation — the Phase 4 counterparty carve-out

## Acceptance criteria

1. Legal agreement terms are **structured data, not attached PDFs**
2. Discount curve selection is a versioned rule over CSA terms, applied by the wrapper — no trade carries
   its own curve choice
3. **Coverage is reported**: a valuation whose netting set has no structured terms is flagged, and the
   fallback used is recorded on the valuation rather than assumed
4. The four SA-CCR fields are in the extraction template and populated for every reviewed agreement
   (`D11-2`)
5. A change in collateral terms re-selects the curve and the change is reproducible bitemporally

## Notes

**Criterion 3 is what prevents a silent wrong basis.** A derivative discounted on its trade currency
rather than its collateral currency does not fail — it returns a number that looks entirely normal and is
wrong by the cross-currency basis. Without coverage reporting, the population still on the fallback is
invisible, and the error is discovered by a counterparty dispute rather than by a control.

**Criterion 4 is nearly free now and expensive later**, which is the whole argument for doing it in the
same pass. The legal review touches each agreement once; a second pass in Phase 4 to collect four fields
means re-opening a completed exercise across the full counterparty population.

**If the workstream is behind, this is an escalation rather than a ticket to absorb.** Its lead time is
legal review capacity, which no amount of engineering effort compresses.
