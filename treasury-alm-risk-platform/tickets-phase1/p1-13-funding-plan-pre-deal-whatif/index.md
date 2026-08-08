---
kind: ticket
title: "P1-13 — Funding Plan & Pre-deal What-if"
status: 0
---

# P1-13 — Funding Plan & Pre-deal What-if

**Wave 5. Depends on P1-06, P1-07.**

Governing artifacts: `d10-liquidity-and-funding` §7.

## Why this is the ticket that changes what the platform is for

Everything else in Phase 1 reports what already happened. **This one answers a question before the deal
is done**, and the executive summary singles it out for the Board:

> *"What does a three-year senior unsecured issue of 500m do to my NSFR, my LCR and my concentration?"*
> — answered in seconds, before the deal is done.

**It is what turns the platform from a reporting tool into a decision tool**, and it is available from
Phase 1 rather than at the end.

## In scope

- **The projected balance sheet** and the funding required to support it
- **Planned issuance** (Part 1 §8) as forward contracts in the projection
- **Projected LCR, NSFR and concentration** over the funding plan horizon — which for NSFR is P1-07's
  forward projection rather than a separate mechanism
- **Pre-deal what-if** — the EOD engines re-run with a hypothetical contract added, returning the ratio
  impact interactively
- **Plan versus actual monitoring** of the funding plan

## The architectural point this rests on

**What-if is only possible because the engines are stateless and re-runnable** (parent §3). It is not a
separate calculation path, and building it as one is the failure mode: a second implementation of the
LCR that approximates the first will diverge from it, and the divergence will be discovered when
somebody acts on the approximation.

**One engine, invoked with a hypothetical population.** That constraint belongs in P1-06's and P1-07's
design rather than being discovered here, which is why this ticket sits downstream of both.

## Out of scope

- Behavioural or dynamic balance sheet projection — **Phase 3**. Phase 1 projects contractual run-off
  plus planned issuance
- Deal booking — **Phase 4**. What-if takes a hypothetical, it does not create a Contract
- Pre-deal *limit* checking — **Phase 4** with the limit framework (P1-14 note)
- FTP pricing of the hypothetical — Phase 6

## Acceptance criteria

1. Pre-deal what-if returns projected LCR, NSFR and concentration impact **within an interactive response
   time**
2. What-if invokes **the same engines** as the EOD run — demonstrated by a hypothetical that reproduces
   the actual ratio when the hypothetical is empty
3. The funding plan projects both ratios forward over its horizon on a stated basis
4. A what-if run is **not persisted as a position** and cannot contaminate the reported ratio
5. Plan versus actual is reportable per funding line

## Notes

**Criterion 4 sounds procedural and is a real risk.** A what-if that writes a hypothetical contract into
the store and relies on a flag to exclude it is one missed filter away from an inflated balance sheet —
the same failure mode `D12-3` identified for internal contracts, where exclusion by report-level filter
is the weaker control. Hypotheticals should not be able to reach the store at all.

**The horizon is contractual, and saying so protects the number.** Phase 1's projection rolls contracts
down and adds planned issuance. It does **not** model new business, deposit growth or behavioural
run-off, all of which arrive in Phase 3. A projected NSFR presented without that qualification will be
read as a forecast.
