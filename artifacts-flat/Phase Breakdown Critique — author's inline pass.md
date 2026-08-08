# Phase Breakdown Critique — author's inline pass

Critique of the seven phase ticket breakdowns and `programme-delivery-summary`.

> ## Corrections — two findings below are wrong
>
> The parallel cold read (`phase-breakdown-critique`) caught two errors in this document, both of the
> same kind: **I asserted an artifact did not exist without checking.**
>
> | My claim | Reality |
> |---|---|
> | C2: *"no one owns Phase 4"*, *"there is no procurement plan"* | **`phase4-procurement-workplan` exists** — ~14KB, with a calendar, decision rights, a waiver rule and stop conditions |
> | D3: *"no single source of truth"* for decisions; build the register | **`decisions-register` exists** — ~14KB, enumerating the decisions |
>
> **Both were created by another agent during this session and I never re-checked the artifact list.**
> The finding in C2 that survives is narrower and runs the other way: **the Board summary understates
> Stage 4 readiness** and omits the workplan's most Board-relevant fact — that Stage 4's procurement clock
> starts during Stage 1, with ~9–12 months to signature.
>
> **This is exactly the failure mode the skill warns about**, in an unexpected direction: not defending my
> own decisions, but reasoning from a stale picture of the epic rather than looking. Recorded rather than
> quietly edited, because the pattern matters more than the two facts.

> **Declared limitation.** I wrote six of the seven breakdowns and the Board summary in this session.
> The critique skill says an author will defend decisions they already made, and that is right — the
> findings below are weighted toward things I can *verify mechanically* rather than judgement calls I
> made and would re-make. **A cold reader is running in parallel** (`phase-breakdown-critique`), and the
> gap between the two lists is itself informative.

---

## Critical

### C1 — Ninety-seven tickets contain no deployment, cutover, parallel run, migration, training, rollback or UAT

**Verified mechanically across all seven breakdowns:** deployment 0, parallel run 0, training 0, rollback
0, user acceptance 0. `cutover` appears once, in passing. (`UAT` appeared to hit 46 times; every hit is
the substring in *"eval**uat**ion"*.)

**How it happened:** `tickets/index.md` states *"Deployment and monitoring tickets are deliberately
absent. Add them if wanted; they were not requested and are not implied by the blueprint."* That was
defensible for a single foundation phase. **I inherited it silently across six further phases and never
re-examined it.**

**Why it matters now and did not then.** Phase 4 makes treasury **the system of record**, replacing a
live incumbent system that Phases 0–3 depend on as a feed. That is a cutover with a dual-running period,
a reconciliation between old and new, a rollback position and an operational training need. **None of it
exists in 97 tickets.** Phases 1, 5 and 6 also each introduce numbers that go to a regulator for the
first time, with no parallel-run ticket to establish confidence before first submission.

**Fix:** either add an operational-readiness slice per phase (cutover, parallel run, rollback, training,
operational acceptance), or state explicitly in the Board summary that **97 tickets cover build only and
the operational programme is not yet planned or costed.** The second is honest; the current position
implies coverage that is not there.

### C2 — Four phases depend on Phase 4 deliverables that nobody is planning

Phase 4 is deliberately not broken down — correct, since it is a procurement. But the later breakdowns
consume its output:

| Consumer | Needs from Phase 4 |
|---|---|
| `tickets-phase5` (whole phase) | The counterparty carve-out — current exposure, SA-CCR, simplified CVA, settlement exposure |
| `tickets-phase6/p6-05` | SA-CCR EAD and CVA per netting set |
| `tickets-phase6/p6-06` | Transaction-level repo detail from D6 |
| `tickets-phase6/p6-10` | The limit framework as breach receiver |
| `tickets-phase3`, `phase6` | D7 accounting outputs |

Each breakdown says some version of *"if the carve-out was not taken, escalate."* **But no one owns
Phase 4, so the escalation has no addressee.** This is a structural hole, not an editorial one: the
programme has 97 planned tickets and a completely unplanned dependency sitting in the middle of them.

**Fix:** the Phase 4 procurement workplan is now a blocker for Phases 5 and 6, not a parallel activity.
It should be sequenced before Phase 5 planning is relied upon.

### C3 — The Board summary contains a claim I cannot support

`programme-delivery-summary` §1: *"Two of those three are now resolvable, and the third is a decision the
Board itself holds."*

The Executive Summary's three cost drivers are **Stage 4 build-or-buy**, **upstream data quality**, and
**subject-matter capacity**.

- **Stage 4 build-or-buy is not resolved** — there is no procurement plan (C2)
- **Data quality is not resolved** — the Board summary's own decision 3 says the incumbent-system extract
  question *"has had no owner"*
- **Subject-matter capacity is quantified, not resolved**

**So the sentence is not true**, and it appears in a document going to a Board, where it invites *"then
what will it cost?"* — a question the programme cannot answer. I flagged this earlier as presentational;
it is worse than that.

**Fix:** replace with what is actually true — *the plan is now specific enough that the cost drivers can
be scoped, and two of the three have named owners for the first time.*

---

## Contradictions and drift

### D1 — Phase 3 has a wave-order violation

`tickets-phase3`: **P3-09 is wave 3 and depends on P3-12, which is wave 4.** Both the mermaid graph
(`P312 --> P309`) and P3-09's own header (*"Depends on P3-07, P3-12 (if CSRBB in scope)"*) carry it.

The dependency is real — EVE needs CSRBB if CSRBB is in scope. **The wave assignment is what is wrong.**

**Fix:** move P3-12 to wave 3, or make the dependency conditional in the wave table with CSRBB scope
resolved before wave 3 starts. The second is better, since the decision is meant to be answered early.

### D2 — `phase-breakdown-readiness` §2 now states the opposite of reality

Its readiness table still reads Phase 2 *"Nearly"*, Phase 3 *"Nearly"*, Phase 6 *"No"*, Phase 5
*"Nearly"* — written before the breakdowns existed. **All six are now written.** I updated that
artifact's §6 and §7 during the amendment pass and left §2 untouched.

**Fix:** mark §2 superseded with a pointer to the breakdowns, on the same pattern the parent uses for
Appendices G and I.

### D3 — Three competing decision registers, no single source of truth

The same gating decisions appear in `phase-breakdown-readiness` §3, in seven phase indices, and in
`programme-delivery-summary` §6 — **with different numbering, different groupings and different
counts.** They will drift, and the Board summary is the one that will drift silently because nobody
re-reads it.

The Board summary's **"38 decisions"** is also soft: it is the sum of the six later indices' tables,
**excludes Phase 0's open taxonomy elections entirely**, and **double-counts decisions that gate more
than one phase** (CSRBB, group structure, trading book size).

**Fix:** build the decisions register as the single source and have the Board summary and phase indices
cite it rather than restate it. Until then, drop the precise "38" from the Board document.

### D4 — Phase 0 alone has no "Decisions that gate acceptance" section

I introduced that section in Phase 1 and used it in all six of mine. It is an improvement — but it means
**Phase 0's open items (the three taxonomy policy elections) are not in the register format**, and a
reader working the registers phase by phase will not see them.

---

## Gaps and weak spots

### G1 — Fifteen tickets per phase, six times, is a template artefact

Six consecutive phases landing on exactly 15 is not a property of the work. **Phase 7's seven shows I
was willing to break the pattern**, which is some evidence against deliberate padding — but the
uniformity should be treated as suspect rather than as validation.

**Most likely under-decomposed: Phase 6**, which covers **two whole modules** (D12 in full plus D13-B's
capital, RWA, leverage, large exposures, returns engine, Pillar 3 and capital planning) in the same 15
tickets that Phase 1 uses for one module. `p6-11` in particular — the returns engine — is one ticket
carrying an unbounded amount of work whose size is admitted to be unknown.

### G2 — No estimates anywhere, against a Board document implying costability

Every breakdown says *"estimates are deliberately omitted"*, inherited from Phase 0 and correct at the
time. The Board summary then says the plan is specific enough to be costed. **Both positions are
defensible; holding both simultaneously is not**, and the Board will notice.

### G3 — Module acceptance criteria are not traced to tickets

D8 has 16 acceptance criteria, D11 has 20, D12 has 12. **I wrote tickets from the specs' bodies and
spot-checked the criteria; I did not systematically verify that every criterion has a home.** That is
exactly the sampling the cold reader was asked to do, and G3 should be treated as open until it reports.

### G4 — "Already delivered" claims rest on my own reading

Several tickets assert an upstream item is done — `p1-12` says `p0-13` discharged the regeneration test
that the parent's phase table lists against Phase 1; `p5` says SA-CCR arrives in Phase 4; `p7` says
validation accreted from Phase 2. **Each is a defensible reading and each contradicts something's plain
text**, which is why I put audits into `p7-01` and `p7-02`. Worth a reviewer confirming rather than
inheriting my interpretation.

---

## What I could not critique

**The judgement calls I made and would make again** — which waves things fall in, whether a finding
deserved a ticket or a note, whether a ticket's framing is the most useful one. Those are exactly what an
author cannot assess about their own work, and they are what the parallel cold read is for.
