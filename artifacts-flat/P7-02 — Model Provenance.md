# P7-02 — Model Provenance

**Wave 1. No build dependencies, but its size depends on Phase 2 onward.**

**The one part of full D15 that genuinely could not have been built earlier** — it needs a populated
inventory to aggregate over.

Governing artifacts: `d15-model-governance` §6; `d3-market-data-and-curves` §5.

## The asymmetry this closes

**The platform already answers the equivalent question for market data and cannot answer it for models.**

| | Market data | Models |
|---|---|---|
| Provenance tag | Observed, interpolated, stale, proxied, model-implied, marked (D3 §5) | **None** |
| Survives aggregation | **Yes** — parent §5 requires it as a platform NFR | — |
| The question it answers | *"How much of this ratio rests on non-observed inputs?"* — **a query** | *"How much of our EVE rests on an overdue model?"* — **an investigation** |

**Proposal, on the same pattern: every computed output carries which models contributed and their
validation status, and the tag survives aggregation.**

## The retrofit warning, and whether it was heeded

`D15-8` recorded this as **"cheap to design in, expensive to retrofit"**, exactly as D3's market data
provenance was — and the same note appears in `p2-06`, which propagated D3's provenance through D8 into
every valuation.

**So this ticket has two possible shapes:**

| If earlier phases designed the tag in | If they did not |
|---|---|
| **Wiring an aggregation** over tags that already exist on computed outputs | **A retrofit across every computed output in the platform** — and historic outputs cannot be tagged at all |

**Establish which before committing to a plan.** Where historic outputs lack the tag, the honest position
is that model provenance is available **from the date the tag was introduced**, stated rather than
implied — the same discipline `p1-12` applied to look-back coverage.

## In scope

- **The model provenance tag** on computed outputs — which models contributed, and each one's validation
  status at the time of computation
- **Aggregation survival** — the tag composes upward through valuations, ratios, EVE, capital and P&L
  lines exactly as D3's does
- **Status at time of computation, not current status.** A number computed while a model was validated
  does not become untrustworthy when that model later goes overdue; the record is of what was true then
- The coverage statement where historic outputs predate the tag

## Out of scope

- Aggregate reporting over the tag — P7-03
- The inventory — P7-01
- Market data provenance — D3, since Phase 0

## Acceptance criteria

1. **Every computed output carries a model provenance tag** — contributing models and their validation
   status
2. **The tag survives aggregation** through valuation, ratio, EVE, capital and P&L lines
3. Status recorded is **status at time of computation**, not current status
4. *"What share of this output rests on unvalidated, overdue, out-of-approved-usage or proxied models"*
   is **a query**
5. Where historic outputs predate the tag, **coverage is stated** rather than the gap being implied away
6. The tag composes with D3's market data provenance rather than replacing it — a number can rest on both
   a proxied input and an overdue model

## Notes

**Criterion 3 is the one that will be got wrong on first attempt.** The natural implementation joins the
output to the model's *current* status, which means a historic report changes its provenance as models
fall overdue — and a report reproduced from three years ago would show today's validation state. The
record has to be of what was true at computation, which is the same bitemporal discipline every other
version in the platform carries.

**Criterion 6 matters because the two provenances answer different halves of one question.** An EVE
number can rest on interpolated market data *and* on a behavioural model past revalidation. Reported
separately they look like two small issues; the pair is what a reviewer actually needs.
