---
kind: ticket
title: "P6-01 — FTP Methodology, Components & Governance"
status: 0
---

# P6-01 — FTP Methodology, Components & Governance

**Wave 1. Depends on the Phase 4 methodology clock (`D12-5`).**

**Largely non-engineering.** A ratification if Phase 4 delivered; a reconstruction if it did not.

Governing artifacts: `d12-funds-transfer-pricing` §2, §4, §5.

## The load-bearing design decision

**An FTP transfer price is a vector of named components, never a single assigned tenor.**

If a non-maturity deposit is assigned *"an FTP tenor of 3 years"* and the rate read off a curve at that
point, **beta and stability have been forced into one parameter by the shape of the output.** The
conflation D9 calls *"the most common modelling error in this area"* then enters **through the pricing
convention rather than through the model** — and every reconciliation upstream still passes.

**The rate-risk component and the liquidity component may imply different terms, and that is correct.**
A large corporate operational balance *"never leaves but is priced off the policy rate"* — stable for
liquidity, effectively overnight for rate risk. **An FTP framework that cannot express that will misprice
the bank's most valuable deposits.**

## The component set

| Component | Prices | Source |
|---|---|---|
| **Base rate** | When the rate resets | D3 base curve; **D9 split 3** |
| **Liquidity / term premium** | How long the money actually stays | **D10 split 2**; D10 measured marginal funding cost |
| **Contingent liquidity charge** | Ratio consumption of undrawn commitments (`D12-6`) | D10 contingent register and drawdown factors |
| **Basis** | Index and tenor mismatch | D9's index-level granularity |
| **Option cost** | Optionality sold to the customer (`D12-8`) | D9 prepayment and early redemption models |
| **Capital charge** | Regulatory capital consumed | D13 RWA per exposure — gating decision 6 |
| **Equity funding benefit** | Assets funded by equity rather than liabilities | Must cohere with D9's own-equity EVE choice |

## Governance — the module that marks its own homework

**FTP rates allocate P&L between business units, and treasury's own P&L is the residual. Treasury sets
the rates; treasury keeps what is left over.** That is the standard arrangement and it is a segregation
problem to name rather than inherit silently.

1. **The methodology is a governed model under D15**, not a treasury configuration — versioned,
   effective-dated, approved, with documented rationale per component
2. **Approval sits with ALCO; finance owns the methodology's integrity and treasury operates it.** The
   same maker-checker principle D1 applies to counterparty limits
3. **Rate changes are prospective by default.** Retrospective application **restates business unit P&L**
   and is an explicit, approved exception

## In scope

- Ratify or reconstruct the methodology, per component
- The **matched-maturity versus pooled** decision, stated rather than inherited (`D12-9`)
- The **equity funding / own-equity coherence check** against D9 §4.1
- The D15 governance wrapper and the ALCO approval route
- The backfill plan for contracts booked between Phase 4 and Phase 6

## Out of scope

- The pricing engine — P6-07
- Transfer contract generation — P6-08
- Behavioural parameter calibration — D9 and D10. **D12 calibrates nothing**

## Acceptance criteria

1. The methodology is a **versioned, effective-dated, D15-governed model** with per-component rationale
2. **Matched-maturity or pooled is a stated decision** with its accuracy consequence recorded
3. Rate changes are prospective unless retrospective application is explicitly approved
4. **D12's equity funding treatment and D9's own-equity EVE choice are coherent, and the pair is stated**
5. Finance owns integrity, treasury operates, ALCO approves — recorded in the authority matrix
6. The Phase 4–6 backfill approach is decided: **backfilled at a stated methodology, or excluded from
   FTP for those contracts' life**

## Notes

**Criterion 6 has no good answer, only a chosen one.** Excluding the gap-period contracts is simpler and
**permanently distorts the reporting of whichever units originated most heavily in that window.**
Backfilling is more work and more defensible. Either is survivable; discovering the choice by default is
not.

**Gating decision 5 deserves asking out loud.** Phase 6 is late, and **a bank without business unit P&L
accountability may not need FTP at all.** The question is worth putting explicitly because the answer
changes whether the Phase 4 clock mattered — and nobody asks it once a module is on a roadmap.
