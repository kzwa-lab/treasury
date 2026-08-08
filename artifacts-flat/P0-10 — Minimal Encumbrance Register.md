# P0-10 — Minimal Encumbrance Register

**Wave 3. Depends on P0-03, P0-08, P0-11.**

Governing artifacts: `d6-collateral-and-securities-financing` §2 and §4;
`d10-liquidity-and-funding` §3.5; D2 §2.9; parent §1.3, §1.7, §2.1, §5, §6.2. Amendment refs `J2`–`J7`.

**Revised against parent revisions 2.6 and 2.8.** The D6 deep-dive widened what this register must hold
and hardened how it must hold it. Nothing here is new *function* — it is still a register, not collateral
management — but the **data model is now specified at full fidelity**, and §"Why the schema is not
minimal" explains why that is the cheap option rather than gold-plating.

## Why a D6 subset is in Phase 0

**Three independent reasons now, and the third is new.**

1. **Classification depends on it.** Regulatory classification is not a function of a security's own
   attributes — a bond pledged under repo leaves the HQLA buffer at the moment of pledging. P0-06
   recomputes on encumbrance change, intraday
2. **Phase 1's LCR and NSFR depend on it.** Unencumbered status drives HQLA eligibility; encumbrance
   duration drives NSFR RSF weighting; the Level 2/2B cap calculation needs the adjusted-HQLA unwind of
   short-term secured funding, which needs repo detail
3. **The custodian reconciliation is three-way and cannot be built without it** (parent §4.1, D16 §5.4).
   Platform positions against custodian holdings alone breaks on every repo, reverse repo and stock loan
   in the book; the register is the third leg that explains the expected difference. **This reason stands
   independently of the HQLA one** — if the LCR argument were ever relaxed, reconciliation would still
   require it

**This is a register, not collateral management.** Full D6 — margining, optimisation, substitution,
central bank pool management — remains Phase 4.

## Why the schema is not minimal, even though the function is

**Parent §6.2 (`J7`): this is the one Phase 0 component Phase 4 inherits rather than replaces.** The
posture is that the platform's register stays the register of record and a bought collateral package
publishes into it. So the fields below are the ones full D6 will need.

**They are close to free now and expensive later, because retrofitting them means rewriting history that
has already been reported.** By the time Phase 4 arrives, classification, LCR, NSFR and the custodian
reconciliation will have depended on this register for two or three years. Adding bitemporality or
allocation grain to a register in that state is not a migration; it is a restatement.

## In scope

### The register

**Encumbrance is an allocation, not a flag** (`J2`). The grain is:

| Field | Note |
|---|---|
| `object_ref` | **Contract *or* Balance** — see below |
| `quantity` / `amount` | Partial encumbrance is the normal case, not an edge case |
| `beneficiary` | Resolvable to a D1 counterparty |
| `agreement_ref` | The D1 legal agreement or netting set (P0-02) under which the pledge sits |
| `purpose` | Repo, stock loan, CSA margin, central bank pool, CCP default fund, regulatory reserve, other |
| `valid_from` / `valid_until` | Valid time. `valid_until` open-ended for standing encumbrance |
| `system_from` / `system_until` | System time — when the platform learned it |
| `authority` | Provenance class, below |
| `haircut_applied` | Stored, not calculated (calculation is Phase 4) |
| `basket_ref` | For tri-party, in place of an ISIN list |

**One invariant, enforced at write time:** the sum of allocations against a holding may never exceed the
holding. Over-allocation is **rejected, not raised as a break** — it is a direct misstatement of the
unencumbered buffer.

### Encumbrance attaches to Balances as well as Contracts (`J3`)

Cash margin posted and **mandatory central bank reserves** are Balance objects that are encumbered — the
reserves by definition, and generally HQLA-ineligible as a result (`part2-taxonomy-mapping` A.1). A
register keyed to security positions cannot express either.

### Sources with no transaction feed

Several encumbrance sources are **standing state maintained by an operations process**, not events
arriving from a counterparty: pre-positioned central bank collateral, restricted or escrowed cash, and
the assets behind a failed securitisation derecognition. These need a **maintenance path with four-eyes
(P0-11) and a review cycle**, or they go stale in the direction that overstates HQLA.

**Two sources are out of scope on settled answers** (D6 §12 decisions 9 and 11): the bank runs **no
covered bond programme**, so there is no cover pool, and it is a **client clearer rather than a direct
CCP member**, so there are no default fund contributions. Both would otherwise be standing encumbrance
with no feed. **Neither should be designed out of the model** — each returns with a change of funding or
clearing strategy, not with a system change, and the allocation grain accommodates them at no cost.

### Bitemporality (`J4`)

The register answers **"what was encumbered as of date D, as known on date K"**. Reuses P0-01's and
P0-03's bitemporal machinery rather than introducing a second pattern.

Forced independently by three things: P0-13's regeneration test must reproduce a historic classification,
which recomputes on encumbrance; **retroactive assertions are routine** — a tri-party report arrives next
morning effective yesterday, a margin dispute resolves three days later backdated; and P0-09's
reconciliation compares *as of* a date, so a current-state register manufactures breaks that are
artefacts of its own design.

### Provenance and authority (`J5`)

Every allocation carries how it is known:

| Authority | Meaning |
|---|---|
| **Externally asserted, authoritative** | **Tri-party basket allocation** — the agent's record is definitionally correct and the platform holds the copy. The only feed of which this is true |
| Externally asserted, reconcilable | Custodian pledge status, CCP margin statement. The platform may disagree and raise a break |
| Platform asserted | Booked repo, pool drawing |
| **Operationally maintained** | Standing state with no feed, under a review cycle (above) |

The proportion of the unencumbered buffer resting on operationally-maintained or stale
externally-asserted state must be **queryable**, the same requirement provenance carries for market data.

### Event publication (`J6`)

**Every allocation change publishes an event carrying both effective and system timestamps**, so P0-06
recomputes classification intraday. A periodic state file does not satisfy this — it stops the trigger
firing, and HQLA silently becomes a batch number labelled intraday.

**Tri-party is the one exception by nature:** the agent's daily report is authoritative, so basket
encumbrance is a daily fact and is stamped as one rather than pretending to intraday freshness.

### Carried forward unchanged

- **Securities financing recognition rules** applied to positions: repo'd-out securities remain a
  Position flagged encumbered and are **not derecognised**; reverse repo securities are **not
  recognised** but **do count toward HQLA if eligible and rehypothecable**
- **Collateral leg flags** honoured: `creates_position`, `encumbers`, `rehypothecable`
- **Tri-party baskets** as baskets referencing an eligibility schedule, not ISIN lists
- Central bank collateral pool contents at register level — sufficient for **D6 to originate Contracts**
  for facility drawings (parent §1.7)
- **Received collateral and re-pledging chains** — a security received under reverse repo is registered
  without being recognised, and if re-pledged becomes an encumbrance **against an asset the bank does not
  own**. Rehypothecation *right* is read from D1, never stored on the position

## Out of scope

- Margining, margin calls, disputes, optimisation, substitution workflow (Phase 4)
- **The collateral optimiser and its D10 liquidity-consequence input** (Phase 4, parent §1.3)
- Haircut *calculation* beyond storing applied haircuts
- Collateral eligibility *evaluation* against agreement schedules (Phase 4) — Phase 0 reads eligibility
  from the arriving record
- Collateral movement *history capture* for the LCR look-back — that is the pre-Phase-0 workstream, which
  **hands over to D6 in Phase 4** (`J8`), not to this ticket

## Acceptance criteria

1. Encumbrance is stored as an **allocation** with quantity, beneficiary, agreement, purpose and
   duration — **not a position-level boolean** — and allocations against a holding can never exceed it
2. **Balance objects can be encumbered**, and mandatory reserves, posted cash margin and CCP default fund
   contributions are all representable
3. Encumbrance sources with **no transaction feed** can be maintained under four-eyes with a review cycle
4. The register is **bitemporal** and answers "encumbered as of date D, as known on date K"; a historic
   classification recomputed from it reproduces, under P0-13's regeneration test
5. Every allocation carries an **authority class**, and the proportion of the unencumbered buffer resting
   on operationally-maintained or stale external state is a query
6. **Every allocation change publishes an event** with effective and system timestamps, and P0-06
   recomputes intraday on it. Tri-party basket changes are stamped as daily facts
7. Repo and reverse repo recognition follow D2 §2.9 — no double-counted or lost HQLA
8. Tri-party baskets are represented as baskets referencing an eligibility schedule, not as ISIN lists
9. Received collateral is registered without being recognised, and re-pledged received collateral is
   representable as an encumbrance against a non-owned asset
10. Sufficient repo detail exists for Phase 1's Level 2/2B cap unwind
11. **P0-09's three-way reconciliation resolves repo, reverse repo and stock lending differences to
    *expected*** using this register as its third leg

## Notes

**The most common error here is treating derecognition as symmetric.** Getting repo out or reverse repo
in wrong either double-counts HQLA or loses it, and both are material to the ratio.

**The second most common is `encumbered: boolean`.** It is what every implementation reaches for first,
it passes testing, and it is wrong in four ways at once — it cannot express partial encumbrance, several
beneficiaries against one holding, NSFR's residual-duration weighting, or any historic state. Criterion 1
exists to prevent it specifically.

**Errors here are asymmetric, and the design should lean accordingly.** A missed or lapsed encumbrance
makes an asset look free and **overstates** the HQLA buffer; an over-recorded one understates it.
Understating is embarrassing; overstating is a misreported regulatory ratio. Where the register is
uncertain, it holds the asset encumbered.

**Three new dependencies come with the widened scope**, all satisfied by the existing wave order:
**P0-08** for the tri-party, custodian and CCP feeds that assert encumbrance; **P0-11** for four-eyes on
operationally-maintained state; and the existing **P0-03** for the Contract, Balance and event store the
allocations attach to.
