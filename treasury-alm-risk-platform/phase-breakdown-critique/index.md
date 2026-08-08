---
kind: review
title: "Phase Breakdown Critique — cold read"
---

# Phase Breakdown Critique — cold read

Independent critique of the seven phase ticket breakdowns and `programme-delivery-summary`. I did not
write any of them and had no part in the decisions they record.

**Snapshot.** Read at a point when the tree held **104 tickets** (16/16/16/16/16/16/8). The
operational-readiness tickets `p0-16`…`p6-16` and `p7-08` landed *while this critique was running* —
they close the author's own C1, and I have credited that below rather than re-finding it.

**Method.** Every mermaid edge in all seven graphs checked against its wave table; every amendment ref
cited in any ticket resolved against the parent's appendices and the module specs; D8's 16, D11's 20 and
D12's 12 acceptance criteria sampled against the tickets; every quantitative claim in the Board summary
recomputed from the files.

**Two claims in the author's inline pass are wrong on the facts** and are corrected in G1 — a procurement
plan for Phase 4 does exist.

---

## Critical

### C1 — "Seventeen module specifications, all complete" is false, and it conceals the Phase 4 spec gap from the Board

`programme-delivery-summary` §1 and the closing line. The domain map (parent §1) has **seventeen bounded
contexts, D1–D17**. The spec artifacts are sixteen files covering **fifteen** of them — D15 has two
(`d15-control-core`, `d15-model-governance`).

**D4 (Deal Capture & Trade Lifecycle) and D5 (Confirmation, Settlement & Payments) have no module
specification at all.** There is no `d4-…` or `d5-…` entry in the parent's own child-artifact list. They
are covered only by `phase4-front-to-back-buy-evaluation`, which the parent describes as
*"Phase 4 specified as a buy-evaluation contract, **not a build spec**"*.

The count can be reached — by counting two D15 artifacts separately, or by counting
`classification-rules-engine` as a module — but the sentence sits beside "seventeen bounded contexts" and
will be read as one-to-one.

**Why it matters.** §3 tells the Board Stage 4 is deliberately not broken down *into tasks*. §1 tells
them all seventeen modules are *specified*. A Board member reconciling the two concludes the
specification exists and only the task list is missing. It does not. And the procurement's own stop
condition — *"Stage 5 cost exceeds the build estimate → the buy-evaluation contract is usable as a build
spec unchanged"* — puts the bank in a position where it builds D4 and D5 from an evaluation contract
rather than a module spec. That is a materially different starting position from the other fifteen
modules, and the Board is the body that would authorise it.

**Fix.** *"Fifteen of the seventeen modules carry full specifications. D4 and D5 are deliberately
specified as a purchase contract instead — see §3."*

### C2 — "38 decisions" over-counts by six; the register says 32

| Source | Figure |
|---|---|
| `programme-delivery-summary` §6 | **38 decisions gate the stages** |
| `phase-breakdown-readiness` §3 | **38 table rows — but 32 distinct numbers** |
| `decisions-register` | enumerates **1–32** |
| Parent child-artifact list | *"all **32** outstanding bank decisions"* |

Decisions **#2, #3, #4, #5, #6 and #7 each appear twice** in readiness §3, because each gates more than
one phase. The Board's 38 is that table's row count.

The error propagates one level further: `decisions-register` §5's status summary sums to **38**
(1+4+5+5+6+17) in the artifact that is supposed to be the single source.

**Why it matters.** A Board told "38 decisions" and handed a register of 32 will ask which six are
missing. None is. Precision that is not real is worse than a round number, and this is the number §6
calls *"the programme's real critical path"*.

**Fix.** State **32**, or *"38 gating relationships across 32 decisions"*. Correct the register's §5 sum
with it.

### C3 — The 97 is already stale: it is 104

Ticket directories now number 16/16/16/16/16/16/8 = **104**. Each phase index has had its wave table,
mermaid graph and ticket table updated — but:

- All six later indexes still open **"Fifteen tickets"**; Phase 7 still opens **"Seven tickets"**
- `programme-delivery-summary` still says **97** in four places, and its §2 stage table still reads
  15/15/15/15/15/15/7
- The parent's child-artifact list still describes each breakdown as "Fifteen tickets in five waves"

**Why it matters.** The Board summary is the document least likely to be re-read and most likely to be
quoted. This is exactly the silent drift the author's own D3 predicted, occurring within hours of being
predicted.

**Fix.** Update to 104 and 16/16/16/16/16/16/8. More durably: have the Board summary cite the phase
indexes for counts rather than restate them.

### C4 — P2-02 signs the grid licence four waves before the number that sizes it exists, and the feedback path it names cannot fire

| | |
|---|---|
| `p2-02` AC3 | *"Grid licensing states a quantity sized on the **Phase 5** multiplier, with burst rights"* — **wave 1** |
| `p2-02` out of scope | *"The `T` measurement that sizes the quantity — P2-14 refines it; this ticket uses the estimate"* |
| `p2-14` in scope | *"Feeding the grid licensing quantity back to P2-02 **if the contract is not yet closed**"* — **wave 5** |
| Phase 2 wave 1 end state | *"**The library is chosen and contracted**"* |

The contract closes at the end of wave 1. `T` is measured in wave 5. **P2-14's conditional is always
false as the phase is planned.**

This is not fixable by resequencing: P2-14 → P2-13 → P2-10 → P2-07/08 → P2-05 → P2-04 → P2-02. `T`
genuinely cannot exist before signature.

**Why it matters.** P2-02 §3 exists specifically to stop the grid licence being *"negotiated against a
one-pass workload and renegotiated in Phase 5 from a position of total lock-in"* — a gap the ticket
itself puts at *"up to two orders of magnitude in core count"*. The ticket set reproduces the failure it
was written to prevent, and P5-10 is *"the largest compute in the platform"*.

**Fix.** Add a P2-02 acceptance criterion requiring a **contractual re-opener, or a banded quantity with
the band stated before signature and settled against the published `T`**. A refinement path the wave plan
forecloses is not a mitigation. Cheaper alternative: make a coarse `T` estimate a **P2-01 demonstration
output** — the vendor runs it on their own build during evaluation, which is achievable in wave 1.

### C5 — P1-10 binds an irreversible node set in wave 1 on an assumption whose confirming decision is not raised until Phase 5

`p1-10` fixes the platform rate vertex set at **29 nodes** — the union of the 19 IRRBB band midpoints and
the 10 prescribed capital vertices — with AC3 requiring the prescribed vertices *"**exactly** —
nearest-neighbour mapping is not permitted"*.

That rests on **`D11-1`**, which assumes standardised market risk is the sensitivities-based method.
**`D11-11` records that this is unconfirmed** and remains open.

`D11-11` appears as a gating decision **only in Phase 5** (decision 5, owner regulatory reporting,
*"Answerable in an hour"*). **It is absent from Phase 1's six gating decisions.**

**Why it matters.** `p1-10` is described in its own header as *"the only [Phase 1 item] that is
irreversible in the wrong direction"*, and its AC6 makes re-binding **retroactive** — `D14-5` confirms a
boundary change *"moves every historic gap ladder, every historic sensitivity ladder and every historic
market risk RWA"*. The 29-node set also carries a permanent **~53% larger sensitivity fan-out every
night from Phase 2 onward** (`D14-6`). A one-hour question that de-risks the programme's most
irreversible early decision is filed four phases downstream of it.

**Fix.** Promote `D11-11` into Phase 1's "Decisions that gate acceptance" table, naming P1-10 as what it
gates. It costs an email and it is the highest-leverage single change in this review.

---

## Drift and contradictions

### D1 — Nine D14 amendment refs that tickets rely on are not in the parent, which claims to have consolidated them

The parent's *"Appendix — D14 amendments"* opens: **"All three D14 passes, consolidated here as `BP-1`.**
… A reader asking *'what did D14 change'* found a third of it."

| Where | Refs held |
|---|---|
| Parent's D14 appendix | G1–G11, I1–I7, D14-1–D14-7 |
| `d14-scenario-and-stress-framework` §"Appendix — amendments this raises for the parent blueprint" | **G1–G20** |

**G12–G20 were raised for the parent blueprint and never landed there.** The consolidation the appendix
announces is incomplete by nine refs — and four of them are load-bearing in tickets:

| Ref | Content | Cited by |
|---|---|---|
| `G16` | A floored shock is not a scaled perturbation | `p1-10`, `p3-03` |
| `G17` | The grammar version is a tenth reproducibility line | `p1-10`, `p5-05`, `p6-05` (×2) |
| `G19` | A node is not a bucket | `p2-11` |
| `G20` | Refinement, never re-partition | `p1-02` |

**Why it matters.** The amendment protocol tells a reader the parent's appendix is where D14's changes
live, and that appendix's opening sentence is the reason they would not look further. Six tickets cite
four refs that cannot be resolved there. This is the same defect the appendix was created to fix,
one level down.

**Fix.** Carry G12–G20 into the parent's D14 appendix, or amend its opening claim to state the range it
actually holds and point to D14's own appendix for the rest.

### D2 — "Seven of the 97 pieces of work cannot be done by engineers" — the seven listed are not seven of the 97

Exactly seven tickets carry the *(non-engineering)* marker: **P0-15, P1-01, P1-15, P2-02, P6-01, P6-02,
P7-05.** The Board's §4 table lists seven items, but they are not the same seven:

| Board §4 item | Ticket |
|---|---|
| Accounting and regulatory classification rules | P0-15 ✓ |
| Prescribed liquidity factors | P1-01 ✓ |
| **Legal agreement extraction** | **not a ticket** — `counterparty-documentation-workstream`, which Phase 0's index lists under *"Two things that are not tickets"* |
| Supplier contract terms | P2-02 ✓ |
| Transfer pricing methodology | P6-01 ✓ |
| Regulatory return inventory | P6-02 ✓ |
| Model validation resourcing | P7-05 ✓ |
| — | **P1-15 omitted** |

The count is right by coincidence.

**Why it matters.** §8 asks the Board to *"direct that the seven non-engineering workstreams be
resourced on their own schedule"*. Executed against the §4 table, **P1-15 goes unresourced** — and
Phase 2's gating decision 5 calls it the decision with *"the tightest deadline and the least obvious
owner"*, because its holder must bind volatility representation **before the RFP closes**.

**Fix.** Either list eight, with legal extraction marked as outside the ticket set, or keep seven of the
97 and move legal extraction to its own line.

### D3 — Phase 5's index maps `D11-8` to P5-12; P5-12 doesn't carry it, and no ticket delivers it

Phase 5's amendment table: *"`D11-8` | The SA-CCR hedging set is not the primary risk type dimension … |
**P5-12**"*. **`p5-12` never mentions the hedging set or primary risk type.**

`D11-8`'s own trigger in the parent is *"when the primary risk type rule is authored, or
`classification-rules-engine` is next amended"*. Both point at Phase 0:

- `classification-rules-engine` §5 already carries `D11-8`
- `p0-06`'s ticket lists *"primary risk type"* as a dimension with **no mention of the separation**
- `p0-15` explicitly scopes primary risk type **out**
- `p1-15` takes custody but defers delivery to *"authored into P0-06's engine **when the derivative book
  requires it**"* — a trigger with no owner and no date

**Why it matters.** `D11-8` states that sharing the field *"understates cross-currency exposure in a
direction that is **always** understatement"*. The field is built in Phase 0; the correction has custody
in Phase 1 and a delivery ticket nowhere.

**Fix.** Give `p0-06` an acceptance criterion that hedging set and primary risk type are separate
dimensions with separate cardinality, and correct Phase 5's mapping.

### D4 — Phase 5 and Phase 6 dropped the "not drawn" annotation the other breakdowns carry

Phases 0, 1, 2 and 3 annotate their graphs with what is omitted (*"Phase 0 dependencies, not drawn…"*,
*"Inherited, not drawn…"*, *"Not drawn…"*). **Phase 5 and Phase 6 have none** — the graph runs straight
into Waves.

These are the two phases with the heaviest undrawn dependencies: Phase 5 on `p2-13`, `p2-14`, `p2-10`,
`p2-02` and the entire Phase 4 carve-out; Phase 6 on Phase 4's FTP methodology clock, Phase 5's CCR/CVA
output and D7's accounting. Both cover it in prose, so this is drift rather than a hole — but the graph
reader who skips prose sees two self-contained phases.

**Fix.** One line under each graph, on Phase 0's pattern.

### D5 — Phase 0 alone still has no "Decisions that gate acceptance" section

Introduced in Phase 1 and used by all six later breakdowns. Phase 0's open items — the three taxonomy
policy elections, plus the A6 and A7 taxonomy extensions its own amendment table says *"should be
resolved before P0-14 closes"* — are therefore absent from the register format every other phase uses.
A reader working the registers phase by phase does not see them.

### D6 — Phase 3's wave-order violation is the only backward edge in 104 tickets

I checked every edge in all seven graphs against every wave table. **`P312 --> P309` is the only
violation**: P3-09 is wave 3 and depends on P3-12 in wave 4, carried in both the graph and P3-09's own
header.

Within-wave dependencies are common and are the Phase 0 baseline convention (`P11 --> P01`,
`P03 --> P08`, `P10 --> P06`), so they are not defects. This one is.

**Fix.** Prefer resolving CSRBB scope before wave 3 over moving P3-12 — Phase 3's own gating decision 2
calls it *"the one to answer first"*, and P3-12 is conditional on it anyway.

---

## Gaps and ambiguities

### G1 — A Phase 4 procurement plan exists; the Board summary says it is the thing still needed

`programme-delivery-summary` §3: *"**What Stage 4 needs next is a procurement plan**, not a task list."*

`phase4-procurement-workplan` **exists** and is substantial: lot cuts with settled scope, a staged
calendar, decision rights, a non-negotiable waiver rule, stop conditions, and seven open items with named
owners. The parent's child-artifact list already carries it. The Board summary does not mention it.

**This also corrects the author's inline C2 and C3**, which assert *"no one owns Phase 4"* and *"there is
no procurement plan"*.

**Why it matters — and it cuts the other way from most findings here.** The summary *understates*
readiness, and in doing so it omits the workplan's most Board-relevant fact:

> Procurement **stages 1–2 run during Phase 2**, stages 3–5 during Phase 3, and contract negotiation
> spans the Phase 3→4 boundary. **Roughly nine to twelve months from gate to signature**, and Phase 4
> cannot start until it concludes.

Nothing in the Board's §2 stage table conveys that Stage 4 has a lead time beginning in Stage 1. The
workplan's Stage 0 gate is answerable now and three of its seven questions are open — one of which
(incumbent TMS contract-level extract) is register decision 30 and the same question §6 decision 3 says
*"has had no owner"*.

**Fix.** Replace §3's closing with a pointer to the workplan and its calendar consequence, and add to §8:
*authorise the Stage 0 pre-RFI gate now.* It is the cheapest item on the list and it unblocks the
longest lead time in the programme.

### G2 — Five of D11's twenty acceptance criteria have no ticket, and no artifact says so

D11 §9 reads as one list of twenty. **AC8 (counterparty exposure across both books), AC9 (SA-CCR per
netting set), AC10 (settlement exposure), AC11 (issuer aggregation) and AC12 (specific wrong-way risk)
are Phase 4 carve-out** and appear in no ticket in any phase.

Phase 5's index names the carve-out and its escalation properly, and `p5-07` does carry AC8's second half
(*"no gap and no overlap"*). But **D11's own §9 gives no indication that a quarter of it is satisfied
outside the ticket set** — so a reader accepting Phase 5 against D11 §9 finds five criteria with no home
and no explanation in the document they are reading.

Sampling D8 (16 criteria) and D12 (12) found no equivalent orphans — both trace cleanly.

**Fix.** Annotate D11 §9 with the owning phase per criterion, or add the five to the buy-evaluation
contract's traceability.

### G3 — D12 acceptance criterion 11 has no owner

*"D12's equity funding treatment and D9 §4.1's own-equity EVE choice are coherent, **and the pair is
stated**."*

`p3-09` decides own-equity EVE (excluded by default, Phase 3, ALCO). `p6-01`/`p6-09` decide FTP equity
funding (Phase 6, Finance with ALCO). Both halves exist; **nothing requires the pair to be stated
together**, three phases and two owners apart.

**Fix.** A `p6-01` acceptance criterion that names P3-09's setting and states the pair explicitly.

### G4 — P5-14 approves the exposure simulation's frequency after P5-10 has built it

`p5-10` (PFE/EPE simulation) is wave 4; `p5-14` (tier, budget and frequency) is wave 5. Phase 5's gating
decision 3 — *"Exposure simulation frequency … **the staleness is the thing being approved**"* — gates
both.

Building *"the largest compute in the platform"* before its frequency is approved makes the sizing target
discovered rather than specified. **Fix.** Move the frequency half ahead of wave 4 and leave tier and
budget in wave 5, or resolve decision 3 before wave 4 opens.

### G5 — Uniform counts survived the readiness addition intact

Six phases moved from exactly 15 to exactly 16. The uniformity is a template property, not a property of
the work, and it should stay suspect.

**Phase 6 remains the most likely under-decomposed** — D12 in full *plus* D13-B (capital, RWA, leverage,
large exposures, returns engine, Pillar 3, capital planning) in the same count Phase 1 spends on one
module. `p6-11` (returns engine) is sized entirely by `p6-02`'s list, which does not yet exist, and its
own sizing note concedes it.

### G6 — "Specific enough to be costed" still sits against "estimates are deliberately omitted"

Board §1 asserts the plan is now costable. Every one of the seven breakdowns states that estimates are
deliberately omitted. Both positions are defensible; holding both in documents that cite each other is
not, and the readiness tickets make it slightly worse — training, standing forums and rota exercises are
the least engineering-estimable content in the set.

Relatedly, §1's *"Two of those three are now resolvable"* is stronger than the evidence even after G1:
the procurement workplan makes Stage 4 build-or-buy genuinely *more* resolvable than the author's own
critique credited, but its Stage 0 gate still has three open questions, and upstream data quality turns
on the same unowned incumbent-extract question.

---

## What I did not find

**No cycles, no orphans, and one wave-order violation across 104 tickets** — the dependency graphs are in
better shape than the surrounding prose. Every amendment ref cited in a ticket resolves and means what
the ticket says it means, with the single exception of the G12–G20 location problem in D1; I spot-checked
`D11-4`, `D12-1`, `D15-9`, `D14-2`, `D14-3`, `D14-6`, `D11-H2` and `D11-1` against their sources
verbatim. The cross-phase handoffs the brief asked about are **symmetric where it counts**: `p1-10` and
`p2-13` both state their downstream obligations at length, and `p2-13` explicitly flags itself as *"the
ticket most at risk of being cut"*. `D11-H2` and `D11-H3` are non-canonical refs, but the parent says so
itself and the tickets inherit the label honestly.

The **"already delivered" claims the author flagged as resting on their own reading** check out: `p0-13`
does deliver the regeneration test that the parent's phase table lists against Phase 1, and Phase 7's
accretion table matches what the earlier breakdowns actually contain.
