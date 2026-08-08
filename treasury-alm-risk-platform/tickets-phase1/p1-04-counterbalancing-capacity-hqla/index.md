---
kind: ticket
title: "P1-04 — Counterbalancing Capacity & HQLA Buffer"
status: 0
---

# P1-04 — Counterbalancing Capacity & HQLA Buffer

**Wave 3. Depends on P0-10, P1-01, P1-05.**

Governing artifacts: `d10-liquidity-and-funding` §2.3, §3.2.

## In scope

**What can be turned into cash, how fast, and at what cost.**

| Source | Capacity | Constraint |
|---|---|---|
| HQLA buffer | Market value less haircut | Unencumbered and monetisable |
| Non-HQLA marketable securities | Market value less larger haircut | Market depth under stress |
| Central bank eligible collateral | Pledged value less central bank haircut | Requires pre-positioning |
| Committed liquidity facilities | Facility size | Contractual availability — P1-03's register |
| Unencumbered loan collateral | Pledgeable value | Operational readiness to mobilise |

**The HQLA buffer specifically:** Level 1 (no haircut, no cap), Level 2A (haircut, subject to the 40%
cap with 2B), Level 2B (larger haircut, subject to its own 15% cap), with levels and haircuts assigned by
P1-01's rules over P0-06's classification.

**Encumbrance is a live feed, not a static flag.** A bond pledged intraday under repo leaves the buffer
**at the moment of pledging** — P0-10's register publishes an event and classification recomputes
intraday (`classification-rules-engine` §5). A collateral system that publishes state as an end-of-day
file does not degrade this; it stops the trigger firing, and HQLA becomes a batch number labelled
intraday.

**Time-to-monetise is an attribute per source, and capacity is reported net of it.** Operational
capability is part of eligibility rather than a footnote: an asset eligible on paper that cannot be
mobilised within the stress horizon — not pre-positioned, held in a custody chain that takes days to
unwind, or sitting where it cannot be upstreamed — **is not counterbalancing capacity.**

## Out of scope

- The cap *calculation* against outflows — P1-06, since the adjusted-HQLA unwind depends on the
  denominator
- Collateral optimisation and substitution — **D6, Phase 4**
- Monetisation execution — Phase 4

## Acceptance criteria

1. Buffer composition is derived from classification and encumbrance, never from a maintained list
2. An encumbrance change propagates to HQLA eligibility **without a batch delay**, and this is tested
   with an intraday pledge
3. Every capacity source carries a time-to-monetise attribute, and headline capacity is net of it
4. Level 2 and 2B caps are computed by the **prescribed adjustment calculation, not naive truncation**
5. Buffer composition reconciles to the encumbrance register three ways — position, custodian and
   register (D16 §5.4)
6. Provenance survives into the buffer number: the share resting on marked or proxied prices is a query

## Notes

**Naive cap truncation is the classic implementation error** and it produces a ratio that fails
reconciliation against the regulator's worked examples while looking entirely reasonable. Criterion 4 is
the reason P1-06 carries reconciliation as its acceptance test rather than "the ratio computes".

**Partial encumbrance is the normal case.** P0-10's register is an *allocation* — (holding, quantity,
beneficiary, agreement, purpose, valid from, valid until) — not a position-level boolean, because one
holding can be pledged to several beneficiaries. A boolean misstates the buffer in four independent ways
and always in the direction that overstates it (parent §1.3). This ticket consumes the allocation grain
and must not flatten it.

**Encumbrance is wider than securities financing.** Cash margin posted, mandatory central bank reserves,
CCP default fund contributions and any cover pool are all encumbrance, several with **no transaction feed
at all** — standing states maintained by an operations process. Buffer composition that reads only the
repo book overstates capacity.
