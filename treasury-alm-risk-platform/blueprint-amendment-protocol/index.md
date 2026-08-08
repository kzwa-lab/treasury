---
kind: spec
title: "Blueprint Amendment Protocol"
---

# Blueprint Amendment Protocol

How module deep-dives write findings back into `treasury-alm-risk-platform/index.md` without colliding.
Parent: `treasury-alm-risk-platform`.

**Why this exists.** Six agents share one blueprint file. Revision numbers collided twice in a single
afternoon, both times the same way: an agent read the file, wrote a deep-dive, came back to apply its
findings, and found the number it had reserved already taken. The near-misses were worse than the
collisions — three edits landed against a file that had changed since it was read, and applied cleanly
only because the edited strings happened not to overlap.

**The diagnosis is not carelessness.** The identifier every agent needs — *the next revision number* — is
a **globally contended counter allocated at write time from a read that is already stale**. Any number of
careful agents will collide on it. The fix is to stop having one.

## 1. The rules

### R1 — Amendment refs are module-scoped, and therefore cannot collide

**Replace `J1`, `K1`, `L1` with `D6-1`, `D11-1`, `D14-7`.** Every agent allocates refs from its own
module's namespace. No coordination, no contention, no possibility of collision — and the ref says where
the finding came from, which the letter never did.

| Old | New | Why better |
|---|---|---|
| `K1` | `D11-1` | Self-describing; survives any reordering |
| `J7`, then re-issued as `L7` after a collision | `D6-7` | Never needs re-issuing |

**Second and later passes on the same module continue the same sequence.** D14's second pass starts at
the next free `D14-n`, rather than opening a new appendix under a new letter.

#### R1a — `BP-n` for amendments with no module to namespace against

**Raised by the blueprint owner on adoption, and it closes a real hole.** R1 as first written namespaced
by module, which covers the deep-dive agents and nobody else. **Amendments originating from the owner or
from cross-cutting artifacts have no D-number** — Appendix F came from the D7 and D13 deep-dives but was
written by the owner; the same applies to `eod-window-and-degradation`, `part2-taxonomy-mapping`,
`part2-query-specification` and the taxonomy policy decisions.

Without a namespace, those amendments fall back to picking a free appendix letter — **which is the exact
failure mode the scheme exists to remove.** A rule that covers most writers and silently returns the rest
to the contended counter is not a fix.

**So: `BP-1`, `BP-2`, … in `Appendix — BP amendments`**, same rules otherwise. Where a cross-cutting
amendment plainly belongs to one module, prefer that module's namespace; `BP-n` is for the genuinely
cross-cutting and owner-originated case, not a default.

#### R1b — `BP-n` is owner-only, because two writers is all it takes

**Found immediately, and by the fix itself.** Within an hour of `BP-n` being created it had two claimants:
`BP-1` (this protocol's own deferred merge) and `BP-2` (the owner's taxonomy policy decisions). Nothing
collided — but only because both claimants happened to be mid-conversation with each other.

**That is the contended counter again, at lower traffic.** A namespace with two or more writers allocating
from a shared sequence is the thing R1 exists to remove, and low volume is not a property one should rely
on. It is also the least defensible place to rely on it, since `BP-n` was introduced specifically to stop
people falling back on a shared sequence.

**Resolution, consistent with R1's principle that the namespace is whatever raised the finding:**

- **`BP-n` is reserved to the blueprint owner.** Single writer, no contention
- **Other cross-cutting amendments namespace on their source artifact** — `EOD-n` for
  `eod-window-and-degradation`, `TAX-n` for the taxonomy work, and so on. The artifact that raised the
  finding is always a single writer, which is the property that matters
- **Existing claims stand.** `BP-1` and `BP-2` keep their refs; renaming them to prove a point would cost
  more than the inconsistency does

**This is the second time the same bug has been found in a smaller form**, which is worth noting for
whoever extends this protocol next: the failure mode is not "we picked a bad identifier", it is
**"a sequence with more than one allocator"**. Any new namespace should be checked against that sentence
before it is created.

### R2 — Appendices are per-module, not per-revision

**One appendix per module, named for the module.** `Appendix — D6 amendments`, not
`Appendix J — Revision 2.6 changes`. A module that returns for a second pass appends rows to its own
appendix with a dated sub-heading.

This fixes a real defect and not only a cosmetic one: **D14 currently owns two appendices, G and I**,
because two agents deep-dived the same module at different times. Nothing in the document says they are
the same module's findings, and a reader looking for "what D14 changed" finds half of it.

### R3 — The revision number stops being the unit of amendment

**Module agents do not bump the revision number and do not write the revision list.** That list is a
single contended resource with one writer: the blueprint owner.

The owner cuts a revision as a **checkpoint** — "revision 3: all amendments applied through `D11-12`" —
when it does a consolidation pass, not once per finding. Between checkpoints, the document's version *is*
the set of applied amendment refs, which is both more precise than a decimal and cannot be raced for.

**Do not notify the owner when you apply an amendment.** The appendices *are* the record, and the owner
sweeps them when cutting a checkpoint. **Requiring notification would reintroduce a contended write on a
different object** — an inbox instead of a counter — which is the failure this protocol removes rather
than relocates. Stated because it is the coordination a careful agent would otherwise add unprompted.

### R4 — Section numbers are load-bearing; append, never renumber

Fifteen artifacts cite `parent §2.5`, `D2 §6.3`, `D10 §3.6`. **Renumbering a section silently breaks
every one of them**, and nothing in the toolchain will tell you.

- **Appending is safe** — `§6.2` after `§6.1`, a new `## Appendix` at the end
- **Inserting or renumbering is a breaking change** and needs the owner, not a module agent
- If a section genuinely must move, the old number stays as a stub pointing at the new one

### R5 — Cite body sections, not appendix letters

Cross-references go to `§1.3`, `§6.2` — stable under R4. Cite an appendix only when referring to the
*history* of a change rather than its content.

**The second collision came through exactly this route.** An appendix note said "now drawn — see
Appendix K"; by the time it was read, K belonged to another module and the pointer was silently wrong.
Under R1 and R5 it would have read "see `D6-7`", which cannot go stale.

### R6 — The body is authoritative; appendices are history

A reader who finds the body and an appendix disagreeing **trusts the body**. Appendices accumulate
claims that were true when written, and this document is already old enough for that to matter.

**Corollary: never edit another module's appendix.** If your finding supersedes theirs, change the
**body**, and record the supersession as a row in **your** appendix naming their ref. Their appendix
stays as the historical record of what was believed then.

### R7 — One module, one agent, one appendix

Two agents deep-dived D14 independently. That produced genuine value the second time — the second pass
found the convention half of a problem the first pass had only half-closed — so this is not a prohibition
on second passes. It is a requirement that they be **deliberate**: a second pass continues the first
agent's ref sequence and appendix, and states in its opening line that it is a second pass and what the
first left open.

Where the same agent can be resumed with its context intact, resuming beats starting fresh.

### R8 — Deferred findings carry a ref and a trigger

When you leave a finding unapplied — the right call more often than not — record it in **your** appendix
as a ref with a condition:

> `D6-9` **Deferred.** The optimiser's `D10 → D6` edge is not drawn. **Apply when** Phase 4 is planned,
> or when any amendment touches §1's edge classes.

Then whoever applies it adds a row in their own appendix citing `D6-9`, and edits the original note to
point forward. **A deferred finding with no ref and no trigger is a finding that will be found again from
scratch by the next agent**, which has already happened at least once here.

### R9 — Disagreement escalates; it never overwrites

Where your finding contradicts an applied amendment, **do not quietly replace it**. Record both positions
and the reason they differ, and escalate to the blueprint owner or the user.

**The escalation record must preserve the rejected argument and its reasoning — not merely note that a
disagreement occurred.** "Escalated; D3 won" satisfies the letter of this rule and defeats its purpose.
The record has to carry enough of the losing case that a reader can reconstruct why it lost.

**The distinction is between a decision log and a design record**, and it is the whole value of the rule.
The precedent is `E6`: D3 and D16 contradicted each other on ownership of the market-data fallback
hierarchy, and the resolution reassigned it explicitly, naming both sides and the reason — a market
fallback is instrument-specific and produces a provenance tag that must reach valuation and capital
treatment. Six months from now someone can read *why D16 does not own it* and see the argument that lost.

**Without that, the argument gets re-proposed.** A future agent finds the same evidence, reaches the same
conclusion D16 reached, and the escalation machinery runs again over ground already covered — which is
expensive in a document twelve modules deep, and indistinguishable from progress while it is happening.

## 2. The write sequence

Concurrency here is real but low-volume, so the discipline is procedural rather than technical. Follow it
literally.

1. **Re-read the target sections immediately before editing** — not at the start of your task, not after
   writing your deep-dive. Between those points the file has probably changed
2. **Make edits small and anchored on unique strings.** Never `replace_all` on the shared file
3. **Treat "file modified on disk since you last read it" as a stop signal**, not a warning to note and
   move past. Re-read, confirm your anchor still means what you thought, then proceed
4. **Append your appendix at the end**, immediately before `## Child artifacts`
5. **Add your artifact to the child list** as a single new line — never reorder or rewrite that list
6. **Verify after writing**: grep your refs and section anchors back out of the file, and check that no
   other agent's content moved
7. **Report what you applied and what you deferred**, with refs, so the next agent does not rediscover it

**On the checklist's real cost.** Steps 1 and 6 are the ones that get skipped under time pressure, and
they are the two that prevent the failures actually observed. The rest is hygiene.

## 3. What this does not change

**Deep-dives still write to the blueprint directly.** The alternative — module agents submit amendments
and the owner applies them — serialises every finding through one agent and adds a round trip to each. At
six agents that costs more than it saves, and the collisions were an identifier problem rather than a
permission problem.

**Existing appendices are not renamed.** A retrospective migration of A–L to module-scoped names would
touch cross-references in a dozen child artifacts to fix a naming inconsistency that harms nobody. **The
scheme applies from the next amendment onward**, and the blueprint carries one line saying so. The cost
is a document with two conventions in it, which is the cheaper of the two available inconsistencies.

**One exception is worth making, and it is the owner's call:** merging Appendices G and I into a single
D14 appendix, since those two are the case R2 exists to prevent and the merge touches one module's
references rather than everyone's.

### 3.1 The G/I merge — sanctioned, specified, deferred

**Sanctioned by the blueprint owner, with a refinement worth recording.** The owner's first instinct was
to argue against it — a two-line cross-reference solves the reader problem at zero breakage risk, whereas
merging retires two letters deliberately preserved as historical identifiers. **What decided it was the
third-amendment case:** under R1 and R7 the next D14 finding goes to a module-named appendix, so leaving
G and I in place gives D14 *three* homes, which is worse than the two it has.

**Form: merge into `Appendix — D14 amendments`, leaving a one-line stub at each old position** —
*"Appendix G — superseded; content merged into Appendix D14."* The stubs preserve citation resolution for
anything already pointing at G or I, and are the supersession-recording behaviour R6 requires, applied to
oneself rather than to another module. Refs `G1`–`G11` and `I1`–`I7` keep their names inside the merged
appendix; merging appendices does not rename refs.

> **`BP-1` — Applied.** Deferred first, on the trigger *"both D14 agents idle"*, because at the time one
> was actively appending to Appendix I — `I6` and `I7` landed between two reads minutes apart — and
> relocating forty-odd lines that another agent is concurrently extending is precisely the conflict §2
> exists to prevent. Executed once the blueprint had been quiet for sixteen minutes and the D14 artifacts
> for twenty.

**This is the protocol's own R8 applied to itself**, and the first entry in the `BP-n` namespace R1a
creates.

**Two things the execution taught, both worth keeping.**

**The trigger fired late.** By the time the merge ran, D14's module appendix was already open with
`D14-1`–`D14-7`, so the operation consolidated **three** homes rather than preventing a third. Deferring
was still correct — a merge against a live writer silently drops findings, which is far worse than a
temporary third appendix — but the deferral was priced as costless and was not quite. **A deferred
structural fix competes with the work that makes it bigger**, which is worth stating in the trigger next
time: *"apply when idle, and expect the target to have grown."*

**Idleness is not observable, and is not the requirement.** No tool reports whether another agent is
mid-turn. What actually makes a relocation safe is narrower and checkable: **the file is unchanged across
the read→write window.** The procedure that worked was hash the file, capture the content, re-hash
immediately before writing, then write into the target *before* removing the source, so the content is
never absent from the file at any point. **Verify by counting refs**, which must each appear exactly once
afterwards — that catches both a dropped row and a duplicated one, and neither is visible by eye in a
forty-row relocation.

## 4. Adoption

This protocol binds nobody until the agents writing to the blueprint know it exists. Two mechanisms, and
the first matters more:

1. **A pointer block in the blueprint itself**, immediately after the revision list — because an agent
   about to amend the blueprint is by definition reading the blueprint. A convention stored anywhere else
   is a convention that gets discovered after the collision
2. **A message to each active agent** — `d3-market-data-and-curves`, both D14 agents, the D11 agent, and
   the blueprint owner. Worth doing once, but it reaches only the agents running now; the pointer block
   reaches every future one
