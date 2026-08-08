# P7-07 — Board & Regulator Reporting

**Wave 3. Depends on P7-03, P7-04, P7-06.**

**The last ticket in the programme.** Governing artifacts: `d15-model-governance` §6;
`executive-summary` §8.

## In scope

- **The board model risk report** — P7-03's aggregate against P7-04's appetite, trended, with breaches
  and their responses
- **The regulator-facing pack** — inventory, validation coverage by technique, independence
  arrangements (P7-05), and the historic reproducibility demonstration (P7-06)
- **The standing review forum** — who reads this, on what cycle, with authority to act

## The three tests the Board can apply without technical knowledge

The executive summary set these out at the beginning of the programme as what "good" looks like.
**This ticket is where they are demonstrated rather than promised:**

| # | Test | Answered by |
|---|---|---|
| 1 | **Point at any figure in any report and ask why.** The answer should be a rule, a version, the inputs that satisfied it, and who approved it — **retrievable in one query, not a research exercise** | `p0-06` explainability, `p1-12`, `p2-06`, **P7-02** for the model half |
| 2 | **Ask for a report as it stood three years ago.** It should reproduce exactly, under the rules, assumptions and data that applied then — **not under today's** | `p0-13`, `p1-12`, **P7-06** for the control environment |
| 3 | **Ask why a ratio moved.** The answer should decompose into balance sheet change, market change and assumption change, **separately** | `p3-15` assumption attribution, `p5-09` P&L attribution |

> **A platform that cannot do these three is a reporting tool. One that can is a control environment.**

**Running all three end to end, in front of the people who set them, is the programme's closing act** —
and any that fails is a finding worth having while a team still exists to act on it.

## The standing forum matters more than the report

`d15-control-core` §6.2 asked **who owns the standing outstanding-items report**, and noted that **it
needs a forum that reviews it and acts, or it becomes a page nobody opens.** The same applies here, with
more force: aggregate model risk reporting exists to make accumulated tolerance visible, and **visibility
without a forum is just a longer document.**

## Out of scope

- The underlying measures — P7-03, P7-04
- Pillar 3 — `p6-15`, though the qualitative model governance disclosure references this
- Validation — Phases 2 onward

## Acceptance criteria

1. The board report presents **the aggregate against appetite, trended**, with breaches and responses
2. The regulator pack covers inventory, **validation coverage by technique**, independence arrangements
   and historic reproducibility
3. **All three Board tests are demonstrated end to end**, and any failure is recorded as a finding
4. A **standing forum** exists with a named owner, a cycle, and authority to act
5. Reporting reproduces historically (P7-06)
6. The qualitative model governance content **references the governed artefacts** rather than restating
   them in prose that then drifts (`p6-15` criterion 4)

## Notes

**Criterion 3 should be run as a genuine exercise, not a documentation task.** Pick a figure nobody
prepared for, from a date three years back, and ask the three questions. **The programme has been
designed around them since the executive summary**, and this is the only point at which the whole chain —
classification rules, versioned reference data, snapshots, model approvals, provenance — is exercised
together.

**Criterion 4 is what determines whether any of this survives the programme.** The report is a deliverable;
the forum is the thing that makes it a control. An inventory nobody maintains reports coverage that has
decayed, and an aggregate report nobody reads makes tolerance visible to no one.

**A closing observation on the phase.** Phase 7 delivers seven tickets because six phases of work
happened when it was supposed to. **If this phase turned out large, the sequence in `D15-1` was not
followed — and the report this ticket produces is the evidence either way.**
