# P7-06 — Control Environment Reproducibility

**Wave 3. Depends on P7-01, P7-02.**

Governing artifacts: `d15-model-governance` §9 criterion 13; `d15-control-core` §6.2.

## Extending a Phase 0 guarantee to models

`d15-control-core` established that **the control environment reproduces as at a historic date** — who
could approve what, which authority matrix was in force, which overrides were live.

**This ticket extends that to models:**

> **Which model versions were approved, for which use, as at any past date.**

The distinction from `p0-13`'s regeneration test is important and already stated: **the regeneration test
is an implementation control, not a model validation** (`D15-10`). It asks whether the platform
reproduces the same number from the same inputs, and says nothing about whether the number was right — **a
consistently wrong model passes it every day.**

**This ticket asks a different question: was the model that produced that number approved, for that
purpose, on that date?**

## In scope

- **Historic resolution of model approval state** — version, approved usage, validation status,
  next-due date, as at any past date
- **The authority dimension**: who approved each model version, under which authority matrix
- **Composition with P7-02's provenance**: a historic output resolves to its contributing models *and*
  their approval state at the time
- Reproduction of a **historic aggregate model risk report** (P7-03), not only historic numbers

## Why the historic aggregate matters

**A regulator asking about a past submission asks two questions**: can you reproduce the number, and what
was the control environment when you produced it.

`p0-13` and `p1-12` answered the first for numbers and ratios. **This answers the second for models** —
and the honest answer may be uncomfortable, which is precisely why it must be reproducible rather than
reconstructed under pressure.

## Out of scope

- The regeneration test — Phase 0, and a different control
- Human approval reproducibility — `d15-control-core`, since Phase 0
- The aggregate report itself — P7-03

## Acceptance criteria

1. **Which model versions were approved, for which use, resolves as at any past date**
2. The **approving authority and the authority matrix in force** resolve with it
3. A historic output resolves to its contributing models **and their approval state at the time**
   (composing with P7-02)
4. **A historic aggregate model risk report reproduces** — not only historic numbers
5. Reproduction is a **query**, not a reconstruction from change logs
6. The regeneration test is **recorded as an implementation control and is never cited as model
   validation** (`D15-10`)

## Notes

**Criterion 6 looks like a documentation nicety and is a real risk control.** A Phase 1 regeneration test
that runs daily and passes is exactly the kind of artefact that gets cited as evidence of model
governance — it is automated, it produces a green result, and its name sounds right. **Reproducibility is
validation's *precondition*, not evidence of correctness**: a validator and a developer must be looking at
the same number before validation is even possible. Six years of that citation would be six years of
apparent assurance.

**Criterion 4 is the one that closes the phase's own loop.** If the aggregate report cannot be
reproduced historically, then the trend in P7-03 is only as good as the current snapshot — and the trend
was the thing that gave the report teeth.
