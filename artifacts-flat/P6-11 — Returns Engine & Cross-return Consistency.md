# P6-11 — Returns Engine & Cross-return Consistency

**Wave 4. Depends on P6-02, P6-04, P6-05, P6-06, P6-10.**

**The phase's largest ticket, and its size is set entirely by P6-02's list.**

Governing artifacts: `d13-regulatory-reporting-and-capital` §6.

## Local returns are definitions plus templates, not code

**This is what makes the "configurable regulatory layer" scope decision real** — and it is the claim the
whole module's design rests on.

**Three separated concerns:**

| Concern | Content |
|---|---|
| **Data definitions** | What populates a cell, expressed as **a query over Positions, Balances and computed measures** |
| **Templates** | The return's structure, validation rules and cross-checks |
| **Submission** | Format, channel, and the submission calendar |

**A new return is a definition plus a template, not a release.** If adding a return requires code, the
separation has failed and every future regulatory change becomes a project.

## Historic reproducibility is a hard requirement

**A return must reproduce under the rules, factors and templates in force at the time.**

**Regulators ask about prior submissions, and "we can't reproduce it under the old rules" is a finding.**

This is the payoff from a discipline running since Phase 0 — rules as versioned effective-dated data,
`p0-13`'s retention and digests, `p1-12`'s ratio reproducibility. **This ticket inherits it rather than
building it**, provided nothing in the returns layer introduces an unversioned transformation.

## Cross-return consistency is a first-class check

**The same figure appearing in two returns must agree**, and **inconsistency between submissions is one
of the most common regulatory challenges.**

**The engine enforces this before submission, not after.** P6-02 enumerated which figures must agree
across which returns; this ticket makes the check a gate rather than a review step.

## In scope

- The definition, template and submission layers
- Cell-level queries over existing measures
- **Cross-return consistency validation, blocking before submission**
- Historic reproducibility of any prior return
- The as-reported record, immutable and distinguishable from a reproduction (`p0-13`)

## Out of scope

- The computations behind the cells — P6-03 to P6-06, P6-10
- The return list — P6-02
- Pillar 3 — P6-15, which consumes this engine
- The gate policy — P6-12

## Acceptance criteria

1. **A new return is added as a definition plus a template, with no code release** — demonstrated by
   adding one
2. Every cell resolves to a **query over existing measures**; a cell requiring a new computation is
   escalated as a gap in P6-03 to P6-10, not solved inside the engine
3. **Cross-return consistency is validated and blocks submission** where figures disagree
4. **Any prior return reproduces under the rules, factors and templates in force at the time**
5. As-reported returns are immutable and distinguishable from reproduced ones
6. Submission format and channel are configuration

## Notes

**Criterion 1 should be tested with a real return, not a contrived one.** The engine will handle the
returns it was built against; the question is whether it handles the next one, which arrives after the
project has disbanded. Adding a genuine second return late in the ticket is the only honest test.

**Criterion 2 is a boundary that will be under pressure.** When a cell does not quite match an existing
measure, the fastest fix is a small computation inside the return definition. Do that a dozen times and
the returns layer contains an unversioned, ungoverned parallel calculation set — and **historic
reproducibility quietly stops holding**, because those computations were never versioned.

**Gating decision 1 could double this ticket.** If the group structure investigation finds real
subsidiaries or foreign operations, **solo and consolidated returns are both required.**
