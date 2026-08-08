# P6-14 — Macro Paths, Transmission Registry & Reverse Stress

**Wave 5. Depends on D14 from Phases 1 and 3.**

**The last of D14, five phases after its first carve-out.**

Governing artifacts: `d14-scenario-and-stress-framework` §1.5, §5, §9.

## What arrives now, and why it waited

| Capability | Why Phase 6 |
|---|---|
| **Macro stress paths** | Their consumer is D13's capital projection and ICAAP — which is this phase |
| **The transmission registry** | Only meaningful once there are macro paths to transmit |
| **Reverse stress testing** | A different computational shape with its own budget (below) |

D14's earlier phases delivered the envelope and market family (Phase 1), then the prescribed shocks,
overlays, liquidity family and coherence review (Phase 3). **This is the macro half.**

## The transmission registry — and the failure it prevents

> **A macro path with no registered transmission is a press release**, and this is where scenario
> frameworks most commonly fail in practice: the scenario is beautifully documented, the narrative is
> board-approved, and **the number that comes out was produced by an analyst choosing a deposit outflow
> rate that felt consistent with it.**

**The registry: for each scenario, a table of *(macro variable → transmission model version → target D3
market object or parameter)*.**

**Its acceptance test is coverage** — every variable in an approved scenario narrative resolves to either
a registered transmission **or an explicit "narrative only, not transmitted" designation.** The second is
permitted and sometimes correct; **being silent is not.**

**The target is a D3 market object, not a risk factor — `D11-H3`.** A risk factor is a construct of
whichever risk methodology is current; a market object outlives methodology changes. Anchoring to risk
factors means **a VaR methodology change silently invalidates the transmission mapping of every
board-approved macro scenario** — nothing fails, the mapping is simply wrong, and wrong in the direction
of a stress result that still computes.

## Reverse stress testing is a different computational shape

It asks the **inverse** question: *what combination breaks us, and how plausible is it?*

**An offline exercise with its own budget**, contending for off-window compute with two other workloads
that also do not fit the nightly window:

- The **exposure simulation** (`p5-14`)
- **Model impact statements** for recalibrated behavioural models (`D15-9`)

**All three should be planned as workloads that do not fit, rather than found not to.** The contention
between them is invisible until two run on the same night.

## In scope

- Macro variable paths, quarterly over 3–5 years, board-risk-committee approved
- **The transmission registry**, with coverage as its acceptance test
- Market transmission models supplied by D11 (`p5-12`)
- **Reverse stress testing**, with a declared compute allocation
- The ICAAP scenario set — noting gating decision below

## Out of scope

- Scenario envelope, families, overlays, composition, coherence — Phases 1 and 3
- Capital projection — P6-13, which consumes this
- The off-window budget itself — `p5-14` and `eod-window-and-degradation`

## Acceptance criteria

1. **Every macro variable in an approved narrative resolves to a registered transmission or an explicit
   non-transmission** — coverage, not best effort
2. **Transmissions target D3 market objects, not risk factors**; a VaR methodology change invalidates no
   approved scenario
3. Macro paths carry calibration vintage and expire, running **flagged** rather than suppressed
4. Reverse stress has a **declared compute allocation**, and its contention with the exposure simulation
   and model impact statements is resolved explicitly
5. Scenarios route through the board risk committee approval path
6. Scenario runs reproduce under the definitions, transmissions and parameters in force at the time

## Notes

**One gating question changes this ticket materially.** **Does the regulator prescribe ICAAP scenarios,
or are they bank-authored?** If prescribed, they route like the prescribed class rather than through the
board approval route, and **the Phase 6 content changes materially** (D14 §12 q4).

**A second, worth confirming early: does the bank have an economics function producing macro paths, or
are they bought?** This determines whether the transmission registry has a counterparty to negotiate the
variable set with — and it is the kind of dependency that is discovered late because it sits outside the
platform entirely.
