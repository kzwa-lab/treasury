---
kind: ticket
title: "P6-13 — Capital Planning & Projection"
status: 0
---

# P6-13 — Capital Planning & Projection

**Wave 5. Depends on P6-03, P6-04, P6-05, P6-14.**

Governing artifacts: `d13-regulatory-reporting-and-capital` §7.

## In scope

**Forward-looking capital adequacy under base and stress conditions, feeding ICAAP.**

It consumes D14 scenarios (P6-14) and **projects the same bridge as P6-03 forward** — which is why the
bridge had to be a computation rather than a spreadsheet. A projection of a spreadsheet is a second
spreadsheet.

## Three paths into projected capital that are easy to miss

**All three come from other modules' work, and none is visible from a capital-planning perspective
alone:**

### 1. CSRBB — a capital measure, not only a risk measure

**Spread moves on the FVOCI portfolio flow through OCI into CET1 *without ever appearing in P&L*.**

D9 §7 establishes that CSRBB and the FVOCI revaluation reserve are **two views of one thing**, and that
D9's CSRBB measure and D7's reserve movement **must reconcile to the same underlying revaluations.**

**If CSRBB was scoped out in Phase 3** (`p3-12`, gating decision 2 there), **this path into capital is
unmeasured** — which is a finding to record here rather than a gap to fill silently.

### 2. P&L volatility from unhedged structural positions

**Now a direct CET1 path following the hedge accounting decision.** Declining hedge accounting moved
volatility from a filtered reserve into unfiltered CET1 (P6-03), so structural hedging decisions are
capital decisions.

### 3. ECL migration under stress

**Stage 1 to stage 2 transitions multiply lifetime loss recognition**, which hits retained earnings and
therefore CET1 **sharply and non-linearly.**

The ECL model is external — a **third-party model in D15's inventory** (`D15-6`) — and its stress
behaviour is the bank's dependency on someone else's model at the point where it matters most.

## Out of scope

- The scenarios — P6-14
- The bridge itself — P6-03
- Reverse stress — P6-14
- ICAAP the document; this ticket supplies its quantitative core

## Acceptance criteria

1. The **full P6-03 bridge projects forward**, not just a capital ratio — every filter and deduction
   projects
2. Projection runs under **D14-approved scenarios**, with the scenario version recorded
3. **All three capital paths are represented**: CSRBB, unhedged structural P&L volatility, and ECL
   migration — or their absence is **explicitly recorded with its reason**
4. **The ECL stress response is sourced from the external model's owner**, with the reliance documented
   (`D15-6`)
5. Non-linearity is visible — ECL migration and CET1 response are not presented as linear in scenario
   severity
6. Projections reproduce under the scenarios, parameters and rules in force at the time

## Notes

**Criterion 3's "or their absence explicitly recorded" is the honest path.** CSRBB may have been scoped
out; the ECL model's stress behaviour may not be obtainable. Both are survivable. **What is not
survivable is a capital projection that appears complete while omitting a path that moves CET1** — and
the CSRBB path in particular is invisible precisely because it never touches P&L.

**Criterion 5 is where capital planning most often misleads.** ECL migration is non-linear in stress
severity: a moderate scenario may move CET1 modestly and a severe one disproportionately, because stage
transitions cluster. **A projection presented as a smooth line across scenario severities understates the
tail**, which is the part ICAAP exists to examine.

**Criterion 4 is a governance conversation with another function, not a build item.** If the answer is
"no evidence available", **the reliance must be disclosed rather than assumed.**
