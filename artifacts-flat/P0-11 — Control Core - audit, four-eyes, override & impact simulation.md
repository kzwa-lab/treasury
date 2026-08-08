# P0-11 — Control Core

**Wave 1. No dependencies. Every other ticket depends on this.**

Governing artifacts: `d15-control-core`; parent §5.

## Why first

Four-eyes on static data is required from the **first record**, not retrofitted once there is data
worth protecting. Reference data (P0-01) cannot be built correctly without the approval and audit
primitives, and the classification engine (P0-06) cannot implement overrides or impact simulation
without them. Treating control as a later governance layer means every earlier module invents its own.

## In scope

- **Append-only audit trail** — every change to every governed object: actor, timestamp, before/after,
  reason code. Never physically deleted, only logically superseded
- **Four-eyes approval service** — a reusable maker-checker primitive with role-based authority,
  consumable by any module. Roles and authority levels are configuration
- **Override framework** — reason-coded, four-eyes, **expiring**, reported as a population rather than
  as individual exceptions
- **Impact simulation harness** — run a candidate change against the live population and diff: what
  changes, how much balance moves, which lines and buckets are affected. Required by D1 §4's impact
  statement for retroactive-effect changes and by P0-06's rule activation
- **Control tiers** — at minimum a higher tier for fraud-sensitive attributes (SSI, payment routing)
  requiring callback verification, distinct from ordinary four-eyes

## Out of scope

- Model governance, validation and backtesting (full D15, Phase 7)
- The regeneration test (P0-13, though it uses this harness)
- Authentication and identity — assumed provided by the platform

## Acceptance criteria

1. Any governed change is refused without an approver distinct from the maker
2. The audit trail answers "who changed this, when, from what, to what and why" for any object and date
3. Overrides carry an expiry; expired overrides lapse or require re-approval, and a population report
   exists
4. Impact simulation runs against the live population and produces a diff before activation, not after
5. The higher control tier is enforceable independently of ordinary four-eyes

## Notes

The impact simulation harness is the piece most likely to be deferred and most expensive to add later —
D1 §4 and `classification-rules-engine` §8 both assume it exists, and neither specified who builds it.
It is a Phase 0 build item.
