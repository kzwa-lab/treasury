# P7-03 — Aggregate Model Risk Reporting

**Wave 2. Depends on P7-01, P7-02.**

**The phase's headline deliverable, and the reason Phase 7 exists at all.**

Governing artifacts: `d15-model-governance` §6.

## The question

> **How much of the bank's reported position rests on models that are unvalidated, overdue for
> revalidation, used outside approved usage, or proxied?**

Answerable only now, because it needs **a populated inventory** (P7-01) **and a provenance tag that
survives aggregation** (P7-02).

## Why aggregation changes the nature of the finding

**Models whose failure carries no automatic consequence get quietly tolerated.** That is a structural
observation, not a criticism of anyone: a validation finding arrives one model at a time, each with a
plausible individual explanation and a reasonable remediation date.

**Aggregate reporting is the mechanism that makes tolerance visible, because it shows the
accumulation.**

> **A single overdue tier-3 model is nothing. Forty percent of EVE resting on models past their
> revalidation date is a board matter, and no other artefact would surface it.**

**The point is not that anyone is hiding anything. It is that the accumulation is invisible from every
other vantage point in the platform.**

## In scope

**Inventory-wide reporting, cut in the ways that make the aggregate meaningful:**

- **By status** — unvalidated, overdue, within approved usage, out of approved usage, proxied
- **By tier** — a tier-1 concentration means something a tier-3 one does not
- **By reported output** — how much of EVE, LCR, CET1, RWA, fair value rests on each status
- **By owner and by module**, so remediation has an addressee
- **Trended**, because the direction matters more than the level: a stable 15% is a different management
  problem from a 15% that was 5% a year ago

**Plus the validation-technique view** (`D15-4`): about two-thirds of the inventory cannot be
backtested, so a report showing "validated" without distinguishing technique overstates assurance.

## Out of scope

- Thresholds and escalation — P7-04
- The provenance mechanism — P7-02
- Board presentation — P7-07

## Acceptance criteria

1. The headline question is answerable **as a query, not a project**
2. Reporting cuts by **status, tier, reported output, owner and module**
3. **The series is trended**, not a point-in-time snapshot
4. Validation technique is visible, so **"validated by benchmarking" and "validated by backtest" are
   distinguishable** rather than both reading as "validated"
5. The report is reproducible as at a historic date, using status-at-time-of-computation (P7-02)
6. **Out-of-approved-usage consumption is detectable by the platform**, not by declaration — including
   the three known extensions: D12's two parameter consumptions and D14's overlay

## Notes

**Criterion 3 is the one that gives the report teeth.** A level invites debate about tolerance; a trend
invites a decision. And the trend is the thing that would have caught six years of accreting unvalidated
models had it existed earlier — which is the argument `D15-1` made in the first place.

**Criterion 6 closes the loop on approved usage.** `D15-5` established that approved usage is **a list of
named consumers and purposes, not free text**, precisely so that an unlisted consumption is detectable
rather than a matter of interpretation. Three extensions were treated as free before anyone wrote them
down; this report is where a fourth would surface.

**Criterion 4 prevents the report flattering itself.** Roughly two-thirds of the inventory — EVE, curve
construction, PFE, XVA, the proxy models — has no realised outcome to backtest against. Reporting them
alongside backtested models under a single "validated" heading **overstates assurance in exactly the
direction a board would not question.**
