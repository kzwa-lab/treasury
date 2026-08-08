---
kind: ticket
title: "P5-12 — General Wrong-way Risk"
status: 0
---

# P5-12 — General Wrong-way Risk

**Wave 4. Depends on P5-10, and on D14's scenario framework from Phase 3.**

**The one genuine analytical link between this module's two halves**, and absent from every artifact in
the corpus until the D11 deep-dive.

Governing artifacts: `d11-market-and-counterparty-risk` §3.5.

## The two kinds, and why only one is here

**Wrong-way risk is exposure that rises as the counterparty's credit quality falls** — the two risks
correlating rather than diversifying.

| Kind | Nature | Phase |
|---|---|---|
| **Specific** | A **legal connection** — collateral issued by the counterparty or its group; a CDS bought on an entity related to its seller | **4**, with SA-CCR, which carries a prescribed treatment |
| **General** | A **statistical relationship** — selling USD/EM-currency protection to an EM bank, where the currency move that creates the exposure is the one that impairs the counterparty | **5 — this ticket** |

**Specific wrong-way risk is detectable from data the platform already holds** — D1's group hierarchy
against D6's collateral composition and D2's reference entities — and should be a **systematic check, not
an analyst's recollection.** It was delivered in Phase 4 because **SA-CCR carries an explicit treatment**:
specific wrong-way trades are removed from the netting set and treated as their own. **This is not
optional even under a standardised approach.**

## Why the general case needs Phase 5

**A stress scenario that moves market factors and counterparty credit quality *together* is the only way
to see it.**

That is precisely the **coherence requirement D14 §4 owns** and the **transmission problem D14 §1.5
describes** — which is why this ticket waits for the scenario framework rather than the simulation grid
alone. **This is where D14's scenarios earn their keep in this module.**

## In scope

- **Scenario-based general wrong-way measurement** — exposure recomputed under scenarios that move market
  factors and credit quality jointly
- **Identification of the exposures most sensitive to it**, by counterparty and product
- **Feeding the transmission registry**: D11 supplies market transmission models to D14 (D11 §8), which
  is the mechanism by which a macro scenario reaches an exposure number

## Out of scope

- Specific wrong-way detection — **Phase 4**, with SA-CCR
- The scenarios themselves — D14
- Coherence review — D14, Phase 3

## Acceptance criteria

1. General wrong-way risk is measured **under scenarios that move market factors and credit quality
   jointly**, not by stressing each independently
2. The scenarios used are **D14-approved objects**, not analyst constructions
3. The measurement identifies the exposures most sensitive to the correlation, by counterparty and
   product
4. Market transmission models supplied to D14's registry target **D3 market objects, not D11 risk
   factors** (`D11-H3`) — otherwise a VaR methodology change silently invalidates the mapping of every
   approved macro scenario
5. Specific wrong-way exposures from Phase 4 remain correctly excluded from the netting set

## Notes

**Criterion 1 is the whole ticket.** Independently calibrated single-factor moves stacked as if jointly
observed is **the most common way a "severe" scenario is quietly implausible** — it is the correlation
realism check in D14's coherence checklist. Applied to wrong-way risk the same error runs the other way:
stressing market factors and credit quality separately makes the risk **disappear**, because the whole
phenomenon is the correlation.

**Criterion 4 is inherited from an amendment applied earlier in this epic.** A risk factor is a construct
of whichever risk methodology is current; a D3 market object outlives methodology changes. Anchoring the
registry to risk factors means a VaR change invalidates approved scenarios **without anything failing** —
the scenarios still exist, still carry approvals, and now point at redefined names.
