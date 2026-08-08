---
kind: ticket
title: "P1-09 — Collateral Look-back: Tracks 2 and 3"
status: 0
---

# P1-09 — Collateral Look-back: Tracks 2 and 3

**Wave 3. Depends on P1-11. Track 1 runs outside the build and should already be logging.**

Governing artifacts: `d10-liquidity-and-funding` §3.6.

## The dependency that cannot be satisfied from the platform

The LCR's derivative collateral outflow uses a **24-month historical look-back** — the largest 30-day net
collateral flow over the preceding two years. **The platform does not have it and cannot create it.**

**But the bank does have it.** The movements physically occurred and left traces in records outside any
treasury system: the bank margins actively today, with records across spreadsheets, email and
counterparty statements. **Reconstruction is a collation exercise, not a forensic one.**

**The metric is forgiving of gaps.** It is an **extremum** — the largest absolute net 30-day flow — not a
continuous series. Quiet periods can be sparse; fidelity is only needed around stress episodes, which
are exactly the periods most visible in bank statements.

## In scope

### Track 2 — reconstruct backward

A one-off exercise with **its own clock, independent of Track 1**: statement retrieval moves from
self-service to archive request as records age, so it gets slower and more expensive the longer it waits.

| Source | Recovers | Strength |
|---|---|---|
| **Nostro and bank statements** | Cash collateral by date and counterparty | **Strongest** — complete record of cash movements; correspondents routinely re-supply 24 months |
| Counterparty and CCP margin statements | Margin balances and calls per relationship | Complete per counterparty; needs a request to each |
| Custodian statements | Securities collateral in and out | Good for non-cash |
| Margin correspondence and operations spreadsheets | Call amounts, disputes, timing | Messy, but validates the statement-derived series |

**Reconcile the reconstructed series against Track 1** once both run, to confirm the method produces
figures consistent with directly logged movements.

### Track 3 — proxy the residual, and retire it

For any genuinely unreconstructable period: a **scenario-derived estimate**, computed by stressing the
current derivative portfolio through P1-11's market scenarios and deriving the implied collateral call,
**floored at the largest net 30-day flow observed in the reconstructed data.**

- **Conservative by construction** — where reconstruction is uncertain, the estimate resolves **upward**.
  An understated collateral outflow overstates the LCR, which is the wrong direction to be wrong in
- **Disclosed to the regulator as an interim method**, reviewed each reporting cycle
- **Retired automatically** as real coverage fills the window

## Out of scope

- **Track 1**, the forward log — pre-Phase-0 operational work, seven fields and a named daily owner
- Collateral management — D6, Phase 4
- The encumbrance register — P0-10

## Acceptance criteria

1. 24 months of statements have been requested from correspondents, counterparties and custodians, and
   the coverage achieved is recorded per source and per period
2. The reconstructed series reconciles to Track 1 over the overlap window
3. The proxy is floored at the reconstructed maximum and is demonstrably conservative
4. Coverage is a **reported figure**: what share of the 24-month window is logged, reconstructed and
   proxied, visible alongside the ratio
5. The proxy retires automatically as coverage fills — no manual decommissioning step
6. The proxy is in D15's model inventory with an owner, a methodology and validation before first use

## Notes

**The proxy is a model, and it is the most unusual entry in the inventory — `D15-3`.** It is tier 1, it
feeds a reported regulatory ratio, it is **currently owned by an operational workstream rather than by a
model owner**, and it is **the one model in the platform with a planned end date**. That combination
makes an owner and a documented methodology a *condition of using it*, not an improvement on it.

**The clock is the whole point of the ticket's placement.** Track 2 gets more expensive every month and
Track 1's absence is unrecoverable. If Track 1 is not already running when this ticket starts, the
correct response is to escalate rather than to absorb it into the build.
