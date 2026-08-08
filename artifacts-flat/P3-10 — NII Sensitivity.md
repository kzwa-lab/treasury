# P3-10 — NII Sensitivity

**Wave 3. Depends on P3-07, and on Phase 2's D8.**

One of the phase's three highest-uncertainty tickets. Governing artifacts: `d9-alm-and-irrbb` §5.

Projected interest income less interest expense over a defined horizon — typically 1 to 3 years — under
base and shocked curves. Where EVE is long-run and value-based, **NII is short-run and earnings-based.**

## Why both measures exist, and why the ALCO pack must show both

**EVE and NII frequently disagree in direction, and that disagreement is a feature.**

Lengthening liability duration protects NII and can worsen EVE. **Presenting one without the other lets
a bank optimise a metric while damaging its actual position** — which is not a hypothetical failure but
the standard one. The pack must show both, and **where they conflict, say so explicitly rather than
leaving a reader to notice.**

## The three balance sheet bases

**All three must be producible, and every NII output must state which basis produced it.**

| Basis | Meaning | Use |
|---|---|---|
| **Static / run-off** | No new business; the existing book runs off | Comparable to EVE; isolates the existing position |
| **Constant** | Maturing volumes replaced like-for-like | **The standard supervisory basis** for the NII outlier test |
| **Dynamic** | Business plan volumes and margins, including pipeline | Management view. **Embeds the business plan's assumptions, so it measures plan-plus-rates rather than rates alone** |

**A dynamic NII number quoted without its basis is uninterpretable**, and it is the number most likely to
be quoted without it, because it is the one the business recognises.

## Margin compression — the mechanism that most commonly makes NII wrong

**It must be modelled explicitly, not left to emerge.** Deposit rates cannot fall below zero (or below
the bank's own floor policy) while asset yields can. This creates an asymmetry that **a symmetric shock
model misses entirely**: the bank loses more from a down-shock than it gains from an equivalent
up-shock, and **the loss is structural rather than a modelling artefact.**

It is driven by the deposit beta floor in P3-04. If beta was modelled as a symmetric constant there, this
effect will not appear here — and its absence looks like good news.

## Out of scope

- The NII outlier test — P3-11
- EVE — P3-09
- The business plan itself, which is an input to the dynamic basis and not built here
- FTP's effect on business unit NII — Phase 6

## Acceptance criteria

1. All three bases are producible and **every output states its basis**, in the data rather than in a
   report header
2. **Margin compression is visible**: a symmetric shock pair produces an asymmetric NII response, and the
   asymmetry traces to P3-04's beta floor
3. The pipeline model reaches **only** the dynamic basis (P3-06 criterion 3)
4. NII and EVE are produced from the same position set and the same parameter versions, so a conflict
   between them is a real conflict
5. NII decomposes into position, curve and assumption change
6. Horizon is configurable across at least 1–3 years, and results reproduce historically

## Notes

**Criterion 2 is the acceptance test that catches a whole class of modelling shortcut.** If down-shock
NII damage is roughly symmetric with up-shock gain, either the book is unusually structured or the beta
floor is not being modelled — and the second is far more likely. This criterion makes P3-04's most
consequential design decision testable from the output side.

**The dynamic basis is an organisational negotiation as much as a build.** It embeds the business plan,
which means agreeing whose plan, at what vintage, and what happens when the plan is revised mid-year.
Worth settling before the ticket starts rather than during it.
