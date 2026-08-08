# P2-01 — Pricing Library RFP & Evaluation

**Wave 1. Depends on `tickets-phase1/p1-10`, `tickets-phase1/p1-15`.**

**The phase's long pole and the programme's largest vendor decision.** Should start before the phase does.

Governing artifacts: `d8-valuation-and-analytics` §9; `rate-transformation-grammar` §7.

## The criteria, and why they are not the obvious ones

| Criterion | Why it is not obvious |
|---|---|
| **Instrument coverage against *this* universe** | Part 1's eleven classes, including MTM-resetting CCS, index CDS, commodity legs, and **barriers and digitals — confirmed in scope.** A vanilla-only library is **disqualifying, not a trade-off** |
| **Model transparency** | D15 must validate the model. **A black box cannot be validated, and "the vendor validated it" is not an answer a regulator accepts** |
| Calibration control | Whether the bank chooses calibration instruments and methods, or must accept the vendor's |
| **Sensitivity and perturbation conventions** | Whether they are configurable to match D14's shocks — **disqualifying if fixed incompatibly.** See below |
| Native `exposure_by_bucket` | Whether the library produces it or the wrapper must derive it — a material scope difference |
| Determinism across versions | Whether an upgrade changes numbers, **and whether the vendor will say so** |
| **Approximate revaluation support** | Whether the library exposes **payoff evaluation at a state**, not only a full price call. A library that only prices end-to-end forces the wrapper to reimplement pricing |
| Long-term version retention | P2-02 |
| **Grid licensing at the Phase 5 multiplier** | **Not a criterion to weigh — a quantity to state in the RFP.** P2-02 |

## Three criteria are disqualifying rather than weighted

This is the part a generic RFP scoring process will get wrong, because it converts everything into
weighted points and lets a strong overall score carry a fatal gap.

1. **Vanilla-only instrument coverage.** Barriers and digitals are in the universe. **A vanilla-only
   library cannot be extended to barriers without changing vendor**
2. **Fixed perturbation conventions incompatible with the grammar.** Under Basel III/IV the standardised
   market risk approach is **sensitivities-based**, so the sensitivities *are* the capital number
   (`D11-1`). A library with fixed conventions does not merely break P&L attribution — **it produces the
   capital number under a convention the bank did not choose**
3. **A black box.** Unvalidatable is unusable, regardless of price or coverage

## The demonstration script

**`rate-transformation-grammar` §7 exists to make criterion 2 testable rather than assertable.** Eight
demonstrations, executed by the candidate against the bank's grammar, producing pass/fail rather than
discussion.

**Claims are converted into evidence, never accepted as claims** — the same posture
`phase4-front-to-back-buy-evaluation` takes for its lots. A vendor will say conventions are
configurable; the script establishes whether they are configurable *to this*.

## In scope

- The RFP document, with the coverage universe and the grid quantity stated
- Execution of the demonstration script against each candidate
- Scoring that keeps the three disqualifying criteria as gates, not weights
- A recommendation with the losing candidates' failures recorded, not merely their scores

## Out of scope

- Contract terms — P2-02, and they must not be left to a separate later negotiation that the evaluation
  never sees
- The wrapper — P2-04
- Curve construction — P2-09

## Acceptance criteria

1. The demonstration script is **executed**, not described, and every candidate's results are recorded
2. The three disqualifying criteria are applied as gates before any weighted scoring
3. Instrument coverage is evidenced against the bank's actual universe, class by class, including
   exotics
4. Model transparency is evidenced by documentation a validator can work from — assessed **by whoever
   will validate**, not by the project
5. The RFP states the **Phase 5 grid quantity** (P2-14's `T` estimate feeds it) rather than the Phase 2
   single-pass workload
6. The recommendation records why each losing candidate lost, in enough detail that the decision can be
   reconstructed later

## Notes

**The grammar must exist before this ticket runs.** If `p1-10` has slipped, criterion 2 cannot be
evaluated and **the correct response is to stop rather than to evaluate around it** — evaluating around
it is precisely how a bank ends up with a library whose conventions it discovers in Phase 5.

**Criterion 4's "assessed by whoever will validate" is deliberate.** Model transparency looks adequate to
a project team under delivery pressure and inadequate to a validator with a mandate. If no independent
validation function exists yet (`D15-13`), that gap surfaces here, at the moment it is cheapest to act on.

**The volatility representation must be bound before this closes** (gating decision 5). Vega conventions
are a purchase decision, and `p1-15` exists to own them.
