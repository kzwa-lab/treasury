---
kind: ticket
title: "P2-16 — Operational Readiness"
status: 0
---

# P2-16 — Operational Readiness

**Wave 6. Depends on P2-07, P2-08, P2-15.**

## What goes live

**An independent valuation of the treasury book, and daily P&L.** "Independent" is the operative word,
and it has two meanings that need establishing operationally:

| Independent of | Established by |
|---|---|
| **The counterparty's number** | P2-15's valuation reconciliation against counterparty statements |
| **The incumbent system's number** | **This ticket's parallel run** |

**A third party now has an opinion on what the book is worth**, and where it disagrees with the front
office, somebody has to arbitrate. **That process does not exist today** and is not a build item.

## In scope

- **Parallel run against incumbent valuations**, by instrument class, over a stated period — with
  differences resolved to **model, market data, or terms**, which P2-06's adjustment stack makes possible
- **The valuation dispute process**: who arbitrates when the platform and the front office disagree,
  and what happens to the P&L while it is open
- **Independent price verification as an operating process.** D3 holds multiple marks and retains the
  differences; **the architecture enables IPV, finance performs it** — and the operating model is a
  Phase 2 organisational deliverable, not a Phase 7 one
- **Training** for product control and finance on the adjustment stack: why one position has several
  correct values and what `purpose` selects
- **Rollback**: incumbent valuations remain available for a stated period
- **Grid and licence operational acceptance** — the compute the phase bought is actually available and
  monitored, ahead of Phase 5 multiplying it

## Out of scope

- Valuation itself — P2-07, P2-08
- Model validation — P2-15
- Accounting use of these valuations — Phase 4, with D7

## Acceptance criteria

1. Parallel running has completed by instrument class, and **differences resolve to model, market data or
   terms** — the decomposition P2-06 exists to provide
2. **Exotic and structured positions are included in the parallel run**, not deferred as edge cases —
   they are where a library's coverage claim meets reality
3. A valuation dispute process exists with a named arbiter and a stated treatment of open disputes
4. **IPV is running as a process**, with the multi-mark structure populated and differences reviewed
5. Product control can explain why the accounting value and the risk value differ, from the adjustment
   stack
6. Incumbent valuations remain available for a stated period, with a retirement date
7. Grid capacity and licence terms are operationally confirmed against the measured `T`

## Notes

**Criterion 2 targets the predictable shortcut.** Parallel running the linear book is easy and proves
little; **the positions where a bought library diverges from an incumbent are the exotics, the callables
and anything with a smile.** Those are also the positions most likely to be deferred out of a parallel
run for being few in number — and they are precisely why the library's coverage was a disqualifying
evaluation criterion.

**Criterion 4 is the one that will slip, because IPV has no build deliverable.** The architecture makes
IPV possible; it does not make it happen. Left unstaffed, the platform holds multiple marks that nobody
compares, which is strictly worse than not holding them — it implies a control that is not operating.
