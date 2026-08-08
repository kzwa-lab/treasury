---
kind: ticket
title: "P1-10 — Rate Transformation Grammar v1"
status: 0
---

# P1-10 — Rate Transformation Grammar v1

**Wave 1. Depends on P0-01 (D1 §3.10 vertex sets), P0-04, P1-15.**

**The one Phase 1 item whose deadline is set outside Phase 1**, and the only one that is irreversible in
the wrong direction.

Governing artifacts: `rate-transformation-grammar` (whole document);
`d14-scenario-and-stress-framework` §2.5, §9.

## Why it is in Phase 1 rather than Phase 3

`d8-valuation-and-analytics` §9 makes *"whether perturbation conventions are configurable to match D14's
shocks"* an **evaluation criterion for the Phase 2 pricing library**, and §9.1 costs the lock-in when the
answer turns out to be no.

**A criterion cannot be evaluated against a convention that does not exist.** The grammar has to be
written before the library is chosen, not after it is installed — and the remedy for choosing a library
with fixed, incompatible conventions is **a different library**. Most phase-ordering arguments in this
programme are about efficiency; this one is about reversibility.

## In scope

The single answer to *"what does it mean to move a rate curve"*, used identically by **D3** applying a
shock, **D8** perturbing for a sensitivity, and **D11** capturing a risk factor move into history. Five
things fixed, and deliberately nothing else:

1. **Representation** — zero, par or forward, per curve, in a binding table covering every currency in
   the approved curve inventory
2. **Node set** — the platform rate vertex set: **the union of the 19 IRRBB band midpoints and the 10
   prescribed capital vertices, 29 nodes**, so that both regulatory views are exact subsets and nothing
   is interpolated between the risk number and the capital number (`D14-3`, D1 §3.10)
3. **Application order** — where a shock, a floor and an interpolation compose, the order is stated
4. **Magnitude basis** — absolute or relative, and against which underlying level
5. **Floor treatment** — the post-shock floor rule, and the fact that **a floored shock is not a scaled
   perturbation** (`G16`)

**Plus the convention registry** — the grammar version is a first-class reproducibility field that
travels with every derived snapshot, sensitivity and captured history series (`D11-4`, `G17`).

**Plus the eight-demonstration script** (`rate-transformation-grammar` §7) that converts D8's evaluation
criterion into something a vendor can be made to demonstrate rather than assert.

## Out of scope

- **Volatility, credit spread, FX and basis grammars.** Each needs its own factor-class treatment; none
  is needed in Phase 1. Volatility lands with the Phase 2 library, the rest in Phase 3 — and credit
  spread is gated on the CSRBB scope decision (`D3-3`)
- Scenario *content* — P1-11
- The sensitivity computation itself — D8, Phase 2

**But the structure must be per-factor-class from the start**, not one rate-shaped record later
generalised (D14 q8). That is this ticket's one forward-looking obligation.

## Acceptance criteria

1. **The one-line test:** `DV01 × 200` and the +200bp parallel ΔEVE are produced by the same
   transformation at different magnitudes, so the difference between them is attributable to the floor
   and to higher-order terms **and to nothing else**
2. Every curve in the approved inventory has an explicit representation binding; no curve defaults
3. The node set contains the prescribed capital vertices **exactly** — nearest-neighbour mapping is not
   permitted (`D14-2`)
4. The grammar version appears in the reproducibility field set and travels with derived snapshots
5. The eight demonstrations are executable against a candidate library and produce pass/fail, not
   discussion
6. The grammar is versioned and approved through P0-11's control core, with re-binding treated as
   retroactive — it moves every historic sensitivity ladder

## Notes

**Re-binding a convention moves the number while every line a reviewer checks stays identical** — the
scenario version, the snapshot version, the position set. That is why the grammar version is a
reproducibility line in its own right (`G17`), and it is the strongest argument for writing this down
before anything consumes it.

**The 29-node set costs roughly 53% more perturbations than the grammar originally assumed**, which is a
Phase 2 sizing consequence rather than a Phase 1 one — carried into `d8-valuation-and-analytics` §6 and
`eod-window-and-degradation` §6 as `D14-6`. Flagged here because this ticket is where the number is set.
