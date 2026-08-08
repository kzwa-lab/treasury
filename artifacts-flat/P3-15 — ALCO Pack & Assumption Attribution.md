# P3-15 — ALCO Pack & Assumption Attribution

**Wave 5. Depends on P3-09, P3-10, P3-11.**

Governing artifacts: `d9-alm-and-irrbb` §6.4, §8, §10.

## In scope

**The ALCO pack produced from source data** — the phase's user-facing deliverable, and the thing the
executive summary promises ALCO by this stage.

### Assumption attribution — the design requirement, not a report feature

**Every EVE and NII output must decompose its movement between position change, curve change and
assumption change.** Without it, *"why did EVE move"* cannot be answered — **and it is the first question
at every ALCO.**

This constrains how P3-07, P3-09 and P3-10 store intermediate results, which is why it is stated as a
design requirement in those tickets and delivered as an output here.

### The EVE / NII conflict, presented as a conflict

Both measures, on all their bases, **with conflicts called out explicitly** rather than left for a reader
to notice. Lengthening liability duration protects NII and can worsen EVE; a pack showing one prominently
and the other in an appendix invites exactly that trade.

### Sensitivity analysis as standard output

How the IRRBB result moves with each key assumption — **the most valuable single output of the module**,
because it tells ALCO which assumptions actually matter. Produced as standard, **not on request**
(P3-02, `D15-11`).

### Treasury's residual — two causes, reported separately

**`D12-4`.** D9 must report both the gross banking book position and treasury's residual after FTP
transfer. **That residual has two causes and reporting it as one number invites the wrong response:**

| Cause | What it is | Response |
|---|---|---|
| **Unhedged position** | Treasury has taken a deliberate rate view, or has not yet executed | A **risk decision**. Hedge it, or accept it against limit |
| **Parameter vintage drift** | The book was priced on parameters since recalibrated | An **allocation artefact**. Hedging it would be hedging an accounting difference |

FTP rates are struck **at inception** and held for the contract's life; behavioural parameters are
**recalibrated** periodically. So risk transferred and risk measured **diverge structurally, with no
error anywhere and nobody having made a decision.** Reported as one number, a growing residual reads as
accumulating unhedged risk and invites a hedge that corrects nothing.

**This matters in Phase 3 even though FTP arrives in Phase 6** — the decomposition must exist before the
residual is first reported, or the first year of ALCO packs teaches the committee to read it wrongly.

### IRRBB limits and risk appetite

Thresholds on EVE and NII sensitivity with defined escalation. **The same Phase 4 gap P1-14 documents
applies here** — the limit framework is Phase 4, so Phase 3's IRRBB limit utilisation either uses P1-14's
interim mechanism or routes manually. It should reuse P1-14's, not build a third.

## Out of scope

- The limit framework — Phase 4
- FTP itself — Phase 6
- Regulatory disclosure of ΔEVE and ΔNII — D13-B, Phase 6

## Acceptance criteria

1. **Every metric decomposes movement into position, curve and assumption change** — separately, not as a
   residual
2. EVE and NII appear together on every basis, with directional conflicts stated
3. Sensitivity analysis is produced for every key assumption as standard output
4. **Treasury's residual is decomposed into unhedged position and parameter vintage drift**
5. Every number carries its basis, parameter versions, overlay version and scenario version
6. The pack reproduces for any historic ALCO date under the assumptions in force at the time
7. IRRBB limit utilisation reuses P1-14's escalation mechanism rather than introducing a third

## Notes

**Criterion 1 is the phase's real acceptance test**, and it is the executive summary's third Board test —
*ask why a ratio moved, and the answer should decompose into balance sheet change, market change and
assumption change, separately.* A pack that reports levels without attribution is a reporting tool; one
that attributes is a control environment. The distinction is decided in P3-07's storage design, months
before this ticket starts.

**The pack is where this phase's principal risk becomes visible or stays hidden.** The assumptions drive
the result more than the balance sheet does. A pack that presents EVE as a number, rather than as a
number plus the three assumptions that determined it, hands ALCO a figure it cannot challenge — and the
whole point of making assumptions explicit, versioned and challengeable is lost at the last step.
