---
kind: ticket
title: "P0-15 — Interim Rule Authorship (non-engineering)"
status: 0
---

# P0-15 — Interim Rule Authorship

**Wave 1. Not a software ticket. Blocks P0-06 and all of Phase 1.**

Governing artifacts: `classification-rules-engine` §9; parent §6, §7.

## The problem this exists to solve

Six of the fourteen classification dimensions are authored by modules that arrive in Phase 4 or later.
**Two of them are load-bearing from Phase 0:**

- **Accounting classification** — D2's hard rule requires it on every object from Phase 0. D7 arrives
  in Phase 4
- **Regulatory classification** — Phase 1's LCR is balance × prescribed factor over *classified*
  balances. D13 arrives in Phase 6

"The rule author is D7" is a statement about custody, not about who does the work now. **The engine
ships empty unless someone authors into it, and no module owns that today.**

## In scope

- **Name interim rule owners as Phase 0 roles, not modules.** Finance authors the accounting rule set;
  regulatory reporting authors the regulatory classification and prescribed factor sets
- Author the initial rule sets as versioned, effective-dated artefacts in the format P0-06 consumes —
  the same format D7 and D13 will later take custody of
- Author the **known-hard routing rules** explicitly: NCD between taxonomy lines B.3 and B.6 (different
  NSFR ASF factors), promissory notes, syndicated participation borrowings, AT1 between B.7 and C.5
- Declare, per product family, **which parts of the terms payload are classifiable** (D1 product
  catalogue task, `classification-rules-engine` §3)
- Build the initial **reference population with expected classifications** for the regression corpus

## Out of scope

- The engine itself (P0-06)
- Behavioural, hedge designation and primary risk type rules — their authors arrive later and those
  dimensions are not needed in Phase 0

## Acceptance criteria

1. Named individuals own accounting and regulatory rule authorship, with time allocated
2. Initial rule sets exist in the engine's format, versioned, effective-dated and approved
3. Every product family has its classifiable terms subset declared
4. The four known routing rules are authored and testable
5. A reference population with expected classifications exists and is owned

## Notes

This is the same class of work as the legal agreement extraction — subject-matter effort the build
depends on that no engineer can do. It has a long lead time and no natural owner, which is exactly the
combination that causes it to be discovered late. **When D7 and D13 are eventually built they take
custody of rule sets already in production**, which is a considerably better position than authoring
from scratch against a live balance sheet.
