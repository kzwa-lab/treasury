# P5-03 — Risk Analytics Procurement

**Wave 1. Depends on `tickets-phase2/p2-02` (the grid licence) and gating decision 1.**

Governing artifacts: `d11-market-and-counterparty-risk` §7.

## "Buy the analytics" needs the same split D8 applied to the library

Parent §6 says *buy the analytics*. Correct — **and "the analytics" is four different things:**

| Layer | Posture | Why |
|---|---|---|
| VaR / ES / PFE / XVA engine | **Buy** | Mature vendor market; the mathematics is standard and the implementations are better than a bank's |
| SA-CCR | **Buy or build — genuinely either** | A prescribed formula. Cheap to build correctly, cheaper still if the vendor has it. **Already delivered in Phase 4** |
| **Risk factor history dataset and taxonomy** | **Build / purchase data** | **Not a product.** The convention decisions are the bank's and started in Phase 0 |
| **P&L attribution** | **Build** | Depends on the bank's book, its explain categories and *this platform's* module boundaries. §2.3's residual table is not something a vendor can supply |

## Two evaluation criteria specific to D11

These are **beyond** D8 §9's list, and both are ways a purchase decision silently undoes an architectural
one:

1. **Does the engine accept the bank's perturbation and shock conventions, or impose its own?**
   `p2-01` already asked this of the pricing library. **If the risk engine imposes a different
   convention, D14's grammar is broken by a purchase decision** — and it will be discovered at the first
   P&L attribution, as an unexplainable residual

2. **Does it consume the bank's exposure profiles, or insist on revaluing internally with its own
   models?** The second means **two valuation engines**, and the accounting value and the risk value
   **diverge permanently** — the exact failure D8's adjustment stack exists to prevent, reintroduced
   through procurement

## In scope

- The RFP and evaluation for the VaR/ES/PFE/XVA engine
- The two criteria above, applied as **gates rather than weights**, on the same reasoning as `p2-01`'s
  three disqualifying criteria
- Confirming the **grid licence quantity** negotiated in `p2-02` still matches the workload, and
  escalating early if it does not
- The build/buy line for P&L attribution, stated rather than assumed

## Out of scope

- The pricing library — bought in Phase 2, and this engine must consume its values rather than replace
  them
- SA-CCR — Phase 4
- History purchase — P5-01

## Acceptance criteria

1. The engine **consumes D8's values, sensitivities and exposure profiles** rather than revaluing
   internally — demonstrated, not asserted
2. The engine accepts the platform's perturbation conventions and node set, demonstrated against
   `rate-transformation-grammar` §7's script
3. P&L attribution is scoped as **build**, with the explain categories drawn from D11 §2.3's residual
   table
4. The grid licence covers the measured workload from `p2-14`'s `T`; any shortfall is escalated before
   contract rather than after
5. Where a candidate fails a gate, the failure is recorded rather than scored around

## Notes

**Criterion 1 is the one a vendor will resist**, because an engine that revalues internally is a more
complete product and an easier sale. It is also the one that matters most: **the moment risk revalues
with its own models, the bank has two valuation engines and no way to reconcile the accounting value to
the risk value.** Every subsequent attribution residual becomes unattributable, and the P&L attribution
built in P5-09 loses its entire diagnostic purpose.

**Gating decision 1 should be settled before this ticket runs.** If the trading book is small and
counterparty risk is the larger half, the evaluation weights change materially — a strong VaR engine with
weak PFE is the wrong purchase for this bank, and that is not visible from a feature list.
