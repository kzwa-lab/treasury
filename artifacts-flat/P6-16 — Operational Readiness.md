# P6-16 — Operational Readiness

**Wave 6. Depends on P6-09, P6-11, P6-12, P6-15.**

**Two go-lives in one phase, and one of them changes how the bank pays people.**

## Change 1 — regulatory returns replace a live submission process

**A return cannot be parallel-run casually: whichever number is submitted is the bank's number.**

**Parallel running is mandatory here, not advisable.** The engine must produce each return alongside the
current process, over at least one full submission cycle, with **differences resolved before the new
engine's output is ever submitted.**

**And the tightened gate goes live with it** — no override may permit a submission from provisional data
(P6-12). That policy will meet its first real test at 3am on a filing deadline, and **the escalation path
needs to be defined and rehearsed while nobody is under pressure.**

## Change 2 — FTP changes business unit profitability

**This is an organisational change, not a system deployment.**

Transfer pricing reallocates margin between business units and treasury. On go-live, **units discover
their profitability has changed for reasons unrelated to anything they did.** Some will be worse off.

| Needs | Because |
|---|---|
| **Communication before go-live**, with impact per unit | A unit finding out through its P&L will dispute the methodology, not the number |
| **A dispute process** with a named arbiter | Disputes are normal and healthy; without a process the loudest unit wins |
| **The decomposition in the hands of unit finance teams** | A rate that arrives as one number makes every dispute an investigation |
| **The gap-period position communicated** | Contracts booked between Phase 4 and Phase 6 were either backfilled at a stated methodology or excluded — **either way somebody's reported history is affected** |

## In scope

- **Parallel running of every return** over at least one full submission cycle, differences resolved
  before first submission
- **Rehearsal of the reporting-date gate escalation**, including a deliberate failure
- **FTP impact communication per business unit**, before go-live, with the methodology and the
  decomposition
- **The FTP dispute process** — arbiter, timescale, treatment of open disputes
- **Training**: regulatory reporting on the returns engine; unit finance teams on reading a decomposed
  transfer price; treasury on the residual split
- **Rollback**: the prior return process remains runnable with a retirement date; FTP has no rollback
  once P&L is allocated, which is why the communication matters more than the switch
- Pillar 3 sign-off route, since it is public and cannot be quietly resubmitted

## Out of scope

- The engine and the computations — P6-03 to P6-11
- The methodology — P6-01, settled at Phase 4

## Acceptance criteria

1. **Every return has been produced in parallel for at least one full cycle**, and differences are
   resolved before the engine's output is submitted
2. **The reporting-date gate escalation has been rehearsed**, including a deliberate provisional-data
   block
3. **Business units have been shown their FTP impact before go-live**, with the methodology and
   component decomposition
4. An FTP dispute process exists with a named arbiter and a stated treatment of open disputes
5. Unit finance teams can decompose a transfer price unaided
6. **The Phase 4–6 gap-period treatment has been communicated** to the units it affects
7. The prior return process remains runnable, with a retirement date

## Notes

**Criterion 3 is the one with the largest downside if skipped and the smallest cost if done.** FTP is
where a well-built platform generates the most organisational resistance, and the resistance is almost
never about the mathematics — it is about a unit's margin moving without warning. **A methodology
explained in advance is negotiated; the same methodology discovered in a P&L is litigated.**

**Criterion 1's "before the engine's output is submitted" is the hard boundary.** The temptation on a
filing deadline is to submit the new engine's number because it is ready and the parallel run is
"substantially complete". A return is not a report — **whichever number goes is the bank's official
position**, and correcting it later is a supervisory conversation.
