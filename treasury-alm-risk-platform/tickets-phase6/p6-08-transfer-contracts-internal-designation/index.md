---
kind: ticket
title: "P6-08 — Transfer Contracts & the `internal` Designation"
status: 0
---

# P6-08 — Transfer Contracts & the `internal` Designation

**Wave 3. Depends on P6-07.**

**Check before starting: the `internal` designation should already exist from Phase 0.**

Governing artifacts: `d12-funds-transfer-pricing` §3; parent §2.3 rule 3 (`D12-3`).

## The objects

Part 1 §10 internal ALM instruments are **real Contracts in D2**. **Two exist per transfer** — a business
unit leg and a treasury leg — and **they net to zero at bank level.**

**So the platform holds Contracts that must appear in internal management reporting and must never appear
in a balance sheet, a regulatory return, or an external disclosure.**

## The designation, and why a filter is not enough

**D3 established `curve_class` in Phase 0 precisely so that *"a regulatory return can assert that no
internal curve entered it."*** Contracts needed the same thing, and `D12-3` added it:

> **An `internal` designation on Contract, excluded from external-facing aggregation by construction,
> with the same assertability D3 gives curves.**

**Exclusion by report-level filter is the weaker control, and the direction of failure is the dangerous
one: a missed filter inflates both sides of the balance sheet by the full internal book.** Every external
report would need to remember the filter; assertion by construction means none of them has to.

## If it was not built in Phase 0

`D12-3` recorded it as **"a Phase 6 need created by a Phase 0 object"** — one attribute, ideally added
when the Contract store was built.

**If it was not, this ticket must re-derive which historic contracts were internal**, which is data
archaeology rather than a build: internal contracts are identifiable by counterparty and product pattern,
but the identification is inferential and needs review. **Establish this before wave 3 starts**, because
it changes the ticket's size by an order of magnitude.

## The boundary clarification that prevents a scope corruption

**FTP transfer contracts are *not* D9's internal hedges.** Similar names, different objects:

| | FTP transfer contract | Internal hedge |
|---|---|---|
| Moves risk | **Within** the banking book, between units and treasury | **Across** the trading/banking boundary |
| IRRBB scope | **Always in scope** — the risk never left | Recognised only where the trading book lays it off externally |

**Applying the external-lay-off recognition test to FTP mirrors would strip the banking book of transfers
that never left it, understating IRRBB by the full internally-allocated position** (`D12-7`, applied to
D9 §2 in the amendment pass).

## In scope

- Transfer contract generation — two legs per transfer, from P6-07's prices
- **The `internal` designation applied and enforced**, or re-derived if absent
- **The assertion mechanism**: a return can state that no internal contract entered it
- The netting-to-zero check at bank level
- Storage of the **parameter version used to strike each rate, on the transfer contract** — one field,
  and P6-09 depends on it

## Out of scope

- Pricing — P6-07
- Business unit reporting — P6-09
- IRRBB measurement — D9

## Acceptance criteria

1. Transfer contracts are marked `internal` and **excluded from external-facing aggregation by
   construction**, not by report-level filter
2. **A regulatory return asserts that no internal contract entered it**, as D3 permits for curves
3. Internal contracts net to zero at bank level, and the check runs as a control
4. **The parameter version used to strike each rate is stored on the transfer contract**, not merely
   referenced by date
5. Transfer contracts are **in IRRBB scope** and are not treated as internal hedges
6. Internal contracts appear in management reporting and in the contract count

## Notes

**Criterion 2 is the whole point of the designation.** An assertion is a positive statement a return can
make; a filter is an omission that has to be remembered. The difference shows up on the day someone adds
a new external report and does not know the filter exists.

**Criterion 4 costs one field and enables P6-09's most valuable output.** D12 is the only module holding
the inception parameter version per contract, which makes it the only module that can decompose treasury's
residual into a risk decision and an allocation artefact.
