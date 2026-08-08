# P5-11 — Full XVA

**Wave 4. Depends on P5-02, P5-10.**

**Closes the fair value gap that has been open since Phase 4.**

Governing artifacts: `d11-market-and-counterparty-risk` §3.3; `d8-valuation-and-analytics` §3.1.

## What this replaces

**IFRS 13 fair value for an uncollateralised derivative includes CVA.** CVA is a netting-set calculation
owned by D11; D7's accounting fair value arrived in **Phase 4**. So **derivative fair value was
structurally incomplete for one full phase.**

The Phase 4 carve-out delivered a **simplified netting-set CVA** to close that window. **This ticket
replaces a measured number with a better one** rather than filling an absence — which is precisely the
argument that made the carve-out worth taking (D11 §6).

**If the carve-out was not taken**, this ticket instead ends a period in which the uncollateralised book
carried a documented CVA-free fair value, and the transition will be a visible step change in reported
values that finance and audit need warning of.

## In scope

- **CVA, DVA, FVA and ColVA**, per netting set, over P5-10's simulated exposure profiles
- **Feeding D8's adjustment stack** — the one place D11 feeds back into valuation. XVA fills the slots
  `p2-06` built empty
- Proxied spreads from P5-02 where no traded spread exists, **with the proxy tag propagating into CVA**

## DVA is where risk and accounting diverge legitimately

**Accounting fair value includes DVA; regulatory capital filters it out of CET1** (a prudential filter).

**The same number is required in one output and excluded from another** — which makes it an
**adjustment-stack item selected by `purpose`**, not a policy question to be resolved. `p2-06` built
exactly this mechanism; this ticket is its first real use.

## Out of scope

- Exposure profile simulation — P5-10
- The prudential filter itself — D13, Phase 6
- Accounting treatment — D7

## Acceptance criteria

1. XVA computes **per netting set** over P5-10's profiles
2. **XVA reaches D8's adjustment stack** as named adjustments, and `purpose` selects them — no consumer
   post-adjusts a D8 value
3. **DVA is included for accounting purposes and excluded for capital**, by purpose selection rather
   than by a second calculation
4. **Proxied spreads are tagged, and the tag propagates**: *"what share of our CVA rests on proxied
   spreads"* is a query (P5-02)
5. The transition from the Phase 4 simplified CVA is **quantified and communicated** — the step change
   in reported fair value is expected, not discovered
6. XVA is reproducible from the exposure profile version, spread version and model version

## Notes

**Criterion 5 is a delivery-management requirement more than a technical one.** Replacing a simplified
CVA with a simulated one moves reported fair values, and the movement is a *methodology* change rather
than a market move. Finance, audit and ALCO all need it framed that way in advance, or the first
month-end after go-live produces a variance investigation that has already been explained.

**Criterion 4 matters because of what CVA rests on.** For a treasury book dominated by names with no
traded CDS, **the proxy spread model drives CVA more than any observed spread does** (P5-02). A CVA
number without a visible proxy proportion presents modelled judgement as market observation.
