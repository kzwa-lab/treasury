---
kind: ticket
title: "P6-09 — Business Unit Reporting & Residual Decomposition"
status: 0
---

# P6-09 — Business Unit Reporting & Residual Decomposition

**Wave 3. Depends on P6-08.**

**The output FTP exists for**, and the ticket that closes a finding open since the D12 deep-dive.

Governing artifacts: `d12-funds-transfer-pricing` §1.2.5, §4; `d9-alm-and-irrbb` §8.

## In scope

- **The transfer component of margin, decomposed by component** — base rate, liquidity premium,
  contingent charge, basis, option cost, capital charge, equity funding benefit
- Business unit P&L allocation, with the transfer price traceable to its inputs
- **Treasury's residual, decomposed** — below
- The coherence check between D12's equity funding benefit and D9's own-equity EVE choice

## Treasury's residual has two causes — `D12-4`

D9 requires reporting **both the gross banking book position and treasury's residual.** That residual has
two causes, and **they call for opposite responses:**

| Cause | What it is | Response |
|---|---|---|
| **Unhedged position** | Treasury took a rate view, or has not yet executed | **A risk decision.** Hedge it, or accept it against limit |
| **Parameter vintage drift** | The book was priced on parameters since recalibrated | **An allocation artefact.** Hedging it would be hedging an accounting difference |

**Why the drift is structural and not an error.** FTP rates are struck **at inception and fixed for the
life of the contract**; behavioural parameters are **recalibrated**. Both are correct. Together they
guarantee that **risk transferred and risk measured diverge by an amount that grows with every
recalibration, on the existing book, with no error anywhere and nobody having made a decision.**

**Reported as one number, a growing residual reads as accumulating unhedged risk and invites a hedge that
corrects nothing.**

**D12 owns the decomposition** because it is the only module holding the inception parameter version per
contract — which is why P6-08 stores it on the transfer contract.

## The governance property this reporting must respect

**Treasury sets the rates and keeps the residual.** So business unit reporting is the output of a process
where one party sets the allocation and retains what is left.

- **Retrospective FTP changes restate business unit P&L**, which makes effective dating the difference
  between a rate change and a rewrite of last year's performance
- **Rate changes are prospective by default**; retrospective application is an explicit, approved
  exception (P6-01)

## Out of scope

- The transfer price — P6-07
- Contract generation — P6-08
- IRRBB measurement — D9

## Acceptance criteria

1. Business unit margin decomposes into **named FTP components**, queryable rather than reconstructed
2. **Treasury's residual decomposes into unhedged position and parameter vintage drift**, reported
   separately with the drift's driver identifiable
3. A retrospective methodology change is **visible as a restatement**, not silently applied
4. **D12's equity funding treatment and D9's own-equity EVE choice are coherent**, and the pair is
   reported together
5. *"Why is this deposit's credit 40bp lower than last year"* resolves to a component and a version, in
   one query
6. Reporting reproduces for any historic period under the methodology and parameters in force then

## Notes

**Criterion 2 prevents a specific bad decision.** A treasurer looking at a residual that has grown over
two years will reasonably conclude the book has drifted unhedged and will hedge it. If most of the growth
is parameter vintage drift, that hedge **creates** a real position to offset an accounting artefact —
which is worse than the artefact.

**Criterion 5 is the query that makes FTP defensible to the business.** Business units dispute transfer
prices; that is normal and healthy. A framework that can answer the dispute with a component, a version
and a source turns an argument into a check. One that returns a single rate makes every dispute an
investigation, and the unit that shouts loudest wins.
