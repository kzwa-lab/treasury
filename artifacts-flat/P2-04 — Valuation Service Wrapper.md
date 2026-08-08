# P2-04 — Valuation Service Wrapper

**Wave 2. Depends on P2-02, P0-04, P0-13.**

**The module itself. Its defining property is thinness.**

Governing artifacts: `d8-valuation-and-analytics` §1.1, §1.3, §2.

## The contract

```
value(subject, valuation_date,
      market_snapshot_version, reference_data_version, model_config_version,
      purpose)  →  Valuation
```

`subject` is a Contract, a Balance carrying a market-priced asset, or a Position. The `Valuation` carries
**value, model-implied cashflows, sensitivities and `exposure_by_bucket`**, plus its own provenance.

**A Valuation is immutable and versioned.** It is never updated; a re-run produces a new version and both
persist — the same discipline D17 applies to run outputs.

## In scope

- **Request routing** and subject translation from D2's contract model into the library's payoff
  representation
- **Snapshot binding** — resolving the version triple to concrete market and reference data
- **Result versioning and storage**
- **Grid distribution**, and caching of the market-independent part
- **The version triple as explicit parameters**, because the same call on different days must return the
  same answer:

| Version | Why it moves the number |
|---|---|
| `market_snapshot_version` | A valuation without one is not reproducible |
| `reference_data_version` | Conventions, calendars and CSA terms all move the value |
| `model_config_version` | Which model prices this, with which numerical settings |

- **Monte Carlo determinism** — seed and path count **in the model config**, or two runs of the same
  request differ by simulation noise and no reconciliation is possible

## What the wrapper must never absorb

The list matters more than the inclusions, because **each line is something a valuation engine is
routinely allowed to swallow:**

| Not D8 | Owner |
|---|---|
| Market state, curves, surfaces | D3 — **D8 never sources a rate outside the snapshot it was given** |
| Positions and projection | D2 |
| Aggregation of values into metrics | D9, D10, D11, D13 |
| P&L attribution | D11 |
| Independent price verification | D3 structure, finance process |
| IFRS 13 fair value hierarchy assignment | D7 |
| XVA at netting-set level | D11 |
| Scenario and shock definitions | D14 |
| Model approval and validation | D15 |

**The pattern in one sentence: D8 computes per subject, and everything that spans subjects belongs to
someone else.** Worth writing on the wall of the project room.

## Out of scope

- Model selection — P2-05
- The adjustment stack — P2-06
- Pricing itself — the library

## Acceptance criteria

1. **The pricing library can be replaced without changes to any module other than this wrapper** — the
   one-line test, and it should be rehearsed rather than asserted
2. Every valuation is reproducible from its version triple, **including Monte Carlo**, via seed and path
   count
3. Valuations are immutable and versioned; a re-run creates a version and never overwrites
4. **D8 sources no market data outside the snapshot it was given** — enforced, not conventional
5. The wrapper carries no business logic: no classification, no aggregation, no adjustment beyond
   P2-06's stack
6. Historic valuations reproduce under P0-13's guarantees

## Notes

**Criterion 1 is testable and should actually be tested**, even crudely — a second candidate library
wired to price one linear instrument through the same wrapper. The test is cheap in wave 2 and
impossible by wave 5, and it is the only thing that keeps the boundary honest once delivery pressure
starts.

**Thinness is a property that decays silently.** Every absorption is locally reasonable: caching a
classification here, aggregating two legs there. The module does not announce when it stops being
replaceable — which is why the test in criterion 1 is worth more than the principle in prose.
