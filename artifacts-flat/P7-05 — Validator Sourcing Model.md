# P7-05 — Validator Sourcing Model

**Wave 2. Depends on P7-01.**

**Non-engineering.** A budget and hiring decision — **and the part of D15 most likely to be quietly
dropped, because it produces no deliverable and its absence is invisible until examination.**

Governing artifacts: `d15-model-governance` §4.2, §4.3, `D15-13`.

## The tension is structural, not a staffing accident

**Validation must be performed by someone independent of the developer *with equivalent technical
depth*. In a bank of this size those two requirements conflict.**

`d15-control-core` §5 named the analogous problem for *approvals* — there may be only two or three people
qualified to approve a curve methodology change — and designed an escalation path.

**For validation the problem is worse, because approval can escalate to a senior generalist and
validation cannot:**

> **An escalated approver who cannot evaluate the mathematics is a signature, not a control.**

## Three sourcing options, and the realistic answer is a mix

| Option | Works for | Fails on |
|---|---|---|
| **Internal validation function** | Tiers 2 and 3, and tier 1 where the bank has depth | **Genuine independence when the modeller and validator are the same two people in rotation** |
| **External validation** | The hardest tier-1 models — pricing, XVA, VaR method, NMD | Cost, and it is **periodic rather than continuous** |
| **Vendor validation** | **Nothing** | **Explicitly rejected** — *"the vendor validated it" is not an answer a regulator accepts* |

## Why this ticket is in Phase 7 when the need started in Phase 2

**It should have been settled at `p2-15`**, when the first bought pricing models needed validating, and
`p2-01` criterion 4 required model transparency to be **assessed by whoever will validate** — which
surfaces the gap if no such person exists.

**This ticket exists to close it formally rather than to raise it for the first time.** If the question
is still genuinely open at Phase 7, that is itself the finding: **six years of models have been validated
by someone, and this phase should establish by whom and with what independence.**

## In scope

- **The sourcing model per tier** — internal, external, or mixed
- **Budget** for periodic external validation of the hardest tier-1 models
- **The independence test**, stated: what makes a validator independent of a developer when the pool is
  small, and what rotation or separation is required
- **Retrospective assessment**: for models validated in Phases 2–6, was the validator independent by this
  standard?

## Out of scope

- Performing validation
- The inventory — P7-01
- Vendor contract terms for upgrade revalidation — `p2-02`

## Acceptance criteria

1. A sourcing model exists **per tier**, with named arrangements rather than intentions
2. **External validation is budgeted** for the hardest tier-1 models, on a stated cycle
3. **The independence test is written down**, including what rotation or separation satisfies it in a
   small pool
4. **Vendor validation is nowhere relied upon as sole evidence**
5. Validations performed in Phases 2–6 are **assessed against the independence standard**, and any that
   fail it are recorded
6. The arrangement has an owner and a review cycle

## Notes

**Criterion 5 is the uncomfortable one and the reason this ticket is worth its size.** If tier-1 models
were validated by a colleague of the developer because no alternative existed, that is a survivable
position **provided it is known and disclosed.** What is not survivable is discovering it during an
examination, when the bank's own records assert independent validation.

**This ticket produces a policy and a budget line, nothing else** — which is exactly why `D15-13` flagged
it as the item most likely to be dropped. **Its absence is invisible until examination**, and by then the
remedy is retrospective and expensive.

**Gating decision 1 is this ticket.** It is the single most consequential open question in D15 and it has
been open since the deep-dive.
