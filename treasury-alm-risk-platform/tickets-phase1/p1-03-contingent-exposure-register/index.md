---
kind: ticket
title: "P1-03 — Contingent Exposure Register & Drivers"
status: 0
---

# P1-03 — Contingent Exposure Register & Drivers

**Wave 2. Depends on P0-02, P0-03, P0-06.**

Governing artifacts: `d10-liquidity-and-funding` §2.2.

## Why this is its own ticket

**The most common cause of an understated liquidity gap is off-balance-sheet exposure treated as an
afterthought.** Folded into the ladder ticket it becomes a column; it needs to be a build item with its
own acceptance, because half of it has **no balance sheet anchor at all**.

## In scope

### Outflow inventory — derived from Part 2 §D and Part 1 §8, §11

| Exposure | Driver |
|---|---|
| Undrawn loan commitments, retail and corporate | Drawdown rate — prescribed for LCR (P1-01), modelled for internal (Phase 3) |
| Revolving credit facilities and overdrafts | Utilisation |
| Guarantees issued | Call probability |
| Letters of credit | Expected utilisation and tenor |
| Forfaiting and factoring facilities | Facility terms, both directions |
| Derivative collateral outflows | Market moves and downgrade triggers — P1-09 |

### The contingent-inflow register — a standalone object

**Committed liquidity facilities and contingent funding lines received cannot be derived from any Part 2
line**, because a facility granted to the bank is correctly not its asset. They must be maintained as a
**standalone register in D2, reconciled to the underlying legal agreements** (D2 §2.8) rather than to the
balance sheet. Revision 1 assumed these fall out of the taxonomy; they do not.

### The asymmetry, enforced in the design

**Contingent outflows are recognised generously; contingent inflows only when contractually
irrevocable.** Uncommitted interbank credit lines are **not liquidity** — they are available exactly
until the moment you need them. This is a design rule, not a reporting convention, and the register must
make an uncommitted line unrepresentable as an inflow.

## Out of scope

- Behavioural utilisation and drawdown models — **Phase 3**. Phase 1 uses P1-01's prescribed factors
- The FTP charge itself — **D12, Phase 6**
- Legal agreement extraction — P0-02 and `counterparty-documentation-workstream`

## Acceptance criteria

1. Every contingent exposure in the source taxonomy (Part 2 §D, Part 1 §8 and §11) appears with a
   documented factor and a named driver
2. The contingent-inflow register reconciles to executed legal agreements, not to the balance sheet
3. An uncommitted facility cannot be recorded as a contingent inflow — enforced, not documented
4. Both directions feed P1-06's LCR and P1-07's NSFR RSF from the same register
5. Facility terms driving irrevocability are structured data, not attached documents

## Notes

**The FTP consequence, recorded now because the driver must be agreed once — `D12-6`.** Every outflow in
the table above generates an **LCR outflow and an NSFR RSF requirement while generating no funding need
at all**. An undrawn commitment costs nothing to carry and consumes ratio headroom the moment it is
written, so a **contingent liquidity charge is a required FTP component rather than a refinement**.

Phase 1 does not build FTP. **It owns the measurement basis**, and the reason to note it here is that
D12 in Phase 6 must charge off *this* register and *these* drivers rather than re-deriving its own. The
damage from charging nothing is the hardest kind to see: the cost never appears in the facility's margin
because it sits in a ratio belonging to treasury while the fee belongs to the originating unit.
