# P0-14 — Balance Sheet Reporting Projection

**Wave 5. Depends on P0-06, P0-07. This is the phase acceptance test.**

Governing artifacts: `part2-taxonomy-mapping`; `d2-instrument-position-core` §8.

## In scope

Generate **all 40 line items** of the source document's Part 2 — A.1–A.16, B.1–B.14, C.1–C.6, D.1–D.4 —
as queries over Positions and Balances, with no bespoke rule per line.

**Handle the four object classes the mapping identified:**

| Class | Count | Treatment |
|---|---|---|
| Pure Contract | 12 | Direct aggregation |
| Pure Balance | 16 | Direct aggregation over Balance objects |
| Mixed | 8 | Union across both primitives |
| **Derived** | 4 | **Computed at reporting time, never stored and never ingested** |

**The derived four need specific handling:** accrued interest (A.15, B.13) computed by the accrual
engine — **core banking's figure is a reconciliation control, not an input**; and three of C.4's four
reserve sub-lines (FVOCI revaluation, cash flow hedge, FX translation) as accumulations. In Phase 0 the
reserve lines are structurally present but only partly populated, since D7 and D8 arrive later.

**The routing rules** from P0-15 applied and tested: NCD between B.3 and B.6, promissory notes,
syndicated participation borrowings, AT1 between B.7 and C.5, **and A.2 versus A.5** (same class of
overlap, no boundary currently stated).

### A line is a measure *and* a predicate, not a predicate alone

**The original criterion checked which objects a line selects and never which quantity it takes from
them.** Six lines need a **sub-contract split**, where one contract contributes different amounts to
two different lines:

| Split | Lines |
|---|---|
| Revolver drawn vs undrawn | A.6 and D.1 |
| Overdraft balance vs limit | A.6 and D.1 |
| Card balance vs limit | A.6 and D.1 |
| Partially-designated hedges | A.3 and A.8 |
| Deposit operational vs non-operational portion | B.3 (LCR sub-portions) |
| Deposit insured vs uninsured portion | B.3 (LCR sub-portions) |

**No dimension set closes this**, including the fifteen-dimension set — the problem is not which slice
you filter on, it is that a single contract yields different *measures* to different lines. A declared
measure set (drawn amount, undrawn amount, limit, gross carrying amount, fair value, notional,
designated portion) is required alongside the predicate.

The last two rows are computed by the customer-aggregation pass in P0-06, not by this ticket.

**The suspense and unclassified lines** presented, per P0-08.

## Out of scope

- Regulatory returns (Phase 6) — this is the accounting balance sheet projection
- Valuation-dependent line content (Phase 2)
- Taxonomy extensions for the nine orphan instrument classes — an accounting policy decision, not a
  build task

## Acceptance criteria

**The three tests, which are the Phase 0 exit criteria:**

1. **Every Part 1 instrument class books, projects and prices** — validated against D2 §2.2's worked
   decompositions
2. **Every Part 2 line generates as a *(measure, predicate)* pair over Positions and Balances** with no
   bespoke rule, against a declared measure set
3. **Every Part 1 class maps to a named Part 2 line, or is explicitly recorded as an intentional
   non-appearance with a reason**

Plus:

4. Derived lines are computed, never stored or ingested — no double-count with core banking accruals
5. Routing rules produce the correct line for each known-hard case
6. The suspense and unclassified lines appear and reconcile

## Notes

**Test 3 is the one that was missing.** The original acceptance criteria tested Part 1 and Part 2
independently and never the mapping between them, which is how bankers' acceptances, equity holdings,
collateral swaps and physical commodities went unnoticed.

**Nine Part 1 classes currently have no Part 2 home** — bankers' acceptances, collateral swaps,
securities lending, physical commodities, futures margin, committed facilities received, unsettled FX
spot, promissory notes, syndicated participation borrowings. This ticket surfaces them as explicit
non-appearances; **extending the taxonomy is the bank's accounting policy call**, not a design decision,
and should be resolved before this ticket closes.
