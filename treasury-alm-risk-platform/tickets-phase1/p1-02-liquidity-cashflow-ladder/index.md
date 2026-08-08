---
kind: ticket
title: "P1-02 — Liquidity Cashflow Ladder"
status: 0
---

# P1-02 — Liquidity Cashflow Ladder

**Wave 2. Depends on P0-05, P0-06, P0-07.**

Governing artifacts: `d10-liquidity-and-funding` §2, §2.1.

## The boundary this ticket must not blur

**D10 has two computational objects, not one**, and revision 1 of the blueprint conflated them:

| Object | Used by | Nature | Ticket |
|---|---|---|---|
| **The maturity ladder** | Survival horizon, funding gap, funding profile, stress testing | Aggregation of D2 cashflows | **This one** |
| **Classified balances × prescribed factors** | LCR, NSFR | Rules engine over Positions and Balances | P1-06, P1-07 |

Conflating them makes the regulatory ratios look like free by-products of the cashflow engine when they
are a separate build with separate dependencies. **This ticket does not deliver LCR.**

## In scope

**Bucket D2's dated cashflows — supplied on both bases, already carrying classification — into a ladder
sliced simultaneously by:**

- **Time bucket** — overnight, 2–7d, 8–14d, 15–30d, 1–2m, 2–3m, 3–6m, 6–12m, 1–2y, 2–5y, 5y+
- **Currency — mandatory, never optional.** A ladder that nets USD inflows against ZAR outflows is
  arithmetically valid and operationally meaningless: liquidity does not fungibly cross currencies under
  stress
- **Counterparty type** — retail, SME, corporate operational, corporate non-operational, bank, sovereign,
  public sector
- **Product and funding type**
- **Secured versus unsecured**
- **Certainty** — contractual, contingent, behavioural

**Bucket boundaries are configuration, not code**, and they come from D1's boundary sets (§3.10). LCR
needs a 30-day cumulative view, NSFR a one-year weighted view, internal metrics a granular short end, and
the local regulator may prescribe its own. **One ladder, many bucket definitions.**

**Refinement, never re-partition** (`G20`): where an internal band set is finer than a prescribed one,
every prescribed boundary must also be an internal boundary, so the prescribed view is an exact
summation rather than a re-bucketing judgement.

## Out of scope

- Behavioural bucketing beyond what D2 supplies — the **behavioural ladder is Phase 3**, since it needs
  D9's models
- Survival horizon and any internal stress view — **Phase 3** (D10 §5)
- LCR and NSFR — P1-06, P1-07
- Intraday — Phase 4

## Acceptance criteria

1. The full ladder rebuilds from D2 cashflows with **no manual adjustment**
2. Every slice dimension is available simultaneously, not as alternative reports
3. No cross-currency netting occurs anywhere, at any aggregation level
4. Bucket definitions are versioned D1 reference data; a boundary change is a rule edit and its impact
   statement covers the full retained history (`D14-5`)
5. Prescribed bucket views are exact summations of internal bands, never re-bucketings
6. The contractual ladder reproduces for any past date under P0-13's guarantees

## Notes

**What Phase 1 must not foreclose.** Intraday monitoring arrives in Phase 4 and will need the *same*
nostro feed this ladder consumes. Built once with **event-level granularity and timestamps** rather than
end-of-day balances only, intraday is later an addition rather than a re-plumbing (D10 §8). The cost of
carrying timestamps now is near zero; the cost of adding them later is a re-integration with every
correspondent.

**The certainty dimension earns its place in Phase 1** even though behavioural flows arrive in Phase 3 —
contingent flows are Phase 1 (P1-03), and a ladder that cannot distinguish contractual from contingent
cannot show the asymmetry §2.2 requires.
