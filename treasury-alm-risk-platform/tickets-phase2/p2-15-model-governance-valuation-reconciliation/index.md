---
kind: ticket
title: "P2-15 — Pricing Model Governance & Valuation Reconciliation"
status: 0
---

# P2-15 — Pricing Model Governance & Valuation Reconciliation

**Wave 5. Depends on P2-05, P2-06, P2-07.**

Governing artifacts: `d8-valuation-and-analytics` §10; `d15-model-governance` §3, §4;
`d16-ingestion-reconciliation-dq` §5.

## Part 1 — the pricing models enter the inventory

**A bought library is not one model but a set of them**, and every one is in D15's inventory. Phase 2 is
where the largest single tranche of models arrives.

- **Onboard each model tier** with owner, documented methodology, approved usage as named consumers, and
  **validation before first use**
- **Curve construction and the volatility surface fit are models too** (P2-09), as are the **fallback
  hierarchy** and the **proxy spread methodology** — the entries that were named nowhere (`D15-3`)
- **The instrument-to-model mapping is itself a governed change** (P2-05)
- **Sensitivity analysis as standard output**, since most of these cannot be backtested (`D15-11`)

**The transparency constraint bites here rather than at RFP.** P2-01 assessed whether the library *can*
be validated; this ticket is where it actually is. **"The vendor validated it" is not an answer a
regulator accepts**, and if the documentation turns out to be insufficient, the discovery is expensive
but recoverable — whereas discovering it in Phase 5 is neither.

**A vendor upgrade is a model change on the vendor's calendar — `D15-7`.** The revalidation trigger and
the parallel-run window come from P2-02's contract. This ticket operationalises them.

## Part 2 — valuation reconciliation (D16 reconciliation 2b)

**Phase 2 enables a control that could not exist before: position valuation against external record.**

D16's reconciliation 2 was split into **population** and **valuation** halves precisely because they land
in different phases and demand different responses. The population half runs from Phase 0; **the
valuation half needs D8 and arrives here.**

- **Valuation against counterparty and CCP statements**, where available
- **Break classification distinguishes a valuation difference from a population difference** — the same
  break register, a different cause and a different owner
- **Materiality thresholds for valuation breaks**, which are proportional rather than absolute for the
  same reason prices are

## Out of scope

- Independent price verification — **D3's structure and finance's process**, not D8's. D3 holds multiple
  marks; D8 consumes the official one
- The break register itself — P0-09
- Sub-ledger to GL reconciliation — Phase 4

## Acceptance criteria

1. Every pricing model, curve model and surface fit is inventoried with an owner and **validated before
   first use**
2. Validation evidence is sufficient for a validator working from vendor documentation — assessed by the
   validator, not the project
3. Sensitivity analysis is standard output for every tier-1 model
4. The vendor upgrade path has a **defined revalidation trigger and parallel-run window**, per contract
5. Valuation reconciliation against counterparty statements runs, with breaks classified as valuation or
   population
6. A valuation break resolves to an input difference — market data, terms, or model — rather than to an
   unexplained delta

## Notes

**Criterion 6 is what makes the reconciliation worth running.** A valuation break that says only "we
disagree by 40,000" generates an investigation each time. One that decomposes into *which input differs*
is a control, and the decomposition is available because P2-06 made every value base-plus-named-adjustments
over versioned inputs. **The reconciliation is cheap here only because the adjustment stack was built
properly in wave 2.**

**This ticket closes the phase honestly.** Phase 2's headline is "independent valuations and daily P&L".
**Independent of what?** — of the counterparty's number, which is what part 2 establishes, and of the
vendor's judgement, which is what part 1 establishes. Without both, the valuations are merely *internal*.
