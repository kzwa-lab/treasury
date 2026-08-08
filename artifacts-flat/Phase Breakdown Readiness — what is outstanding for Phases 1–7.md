# Phase Breakdown Readiness

Consolidation of every artifact and agent output in this epic, assessed against one question:
**what is outstanding before a ticket breakdown can be written for each of Phases 1–7?**

Parent: `treasury-alm-risk-platform`. Phase 0 is broken down in `tickets` (15 tickets, 5 waves).

**Headline:** the design corpus is materially complete — sixteen of seventeen domains have a deep-dive
artifact and every phase has at least one governing spec. **Phase 1 is the only phase ready to break
down today.** The rest are blocked not by missing design but by three classes of thing: two absent
module artifacts (D4, D5), thirty-one unapplied cross-artifact amendments, and a set of bank decisions
that are not engineering work and have long lead times.

---

## 1. What exists — artifact inventory

Seven agents have contributed. Every artifact below is landed; none is in progress.

| Layer | Artifact | Governs phase |
|---|---|---|
| Parent | `treasury-alm-risk-platform` (rev 3 checkpoint) | All |
| Parent | `executive-summary`, `architecture-critique`, `blueprint-amendment-protocol` | All |
| L1 | `d16-ingestion-reconciliation-dq`, `d17-batch-orchestration` | 0 |
| L2 | `d1-reference-and-static-data`, `d2-instrument-position-core`, `d3-market-data-and-curves` | 0, 2 |
| L3 | `d6-collateral-and-securities-financing`, `d7-accounting-and-subledger` | 0 (subset), 4 |
| L4 | `d8-valuation-and-analytics` | 2 |
| L5 | `d9-alm-and-irrbb`, `d10-liquidity-and-funding`, `d11-market-and-counterparty-risk`, `d12-funds-transfer-pricing` | 1, 3, 4, 5, 6 |
| L6 | `d13-regulatory-reporting-and-capital`, `d14-scenario-and-stress-framework` (+ `rate-transformation-grammar`), `d15-control-core`, `d15-model-governance` | 0, 1, 3, 6, 7 |
| Cross | `classification-rules-engine`, `part2-taxonomy-mapping`, `part2-query-specification`, `taxonomy-policy-decisions`, `eod-window-and-degradation`, `counterparty-documentation-workstream` (+ `statement-request-pack`) | 0, 1 |
| Phase 4 | `phase4-front-to-back-buy-evaluation` | 4 |

**The two gaps in coverage are D4 (Deal Capture & Trade Lifecycle) and D5 (Confirmation, Settlement
& Payments).** Neither has a deep-dive. They are covered only by `phase4-front-to-back-buy-evaluation`,
which is deliberately an evaluation contract rather than a build spec — a legitimate choice, but it
means **Phase 4 cannot produce a ticket breakdown of the same shape as Phase 0.** See §4.

---

## 2. Readiness by phase

| Phase | Governing artifacts | Ready? | What is missing |
|---|---|---|---|
| **1. Liquidity** | D10, D13 §1.1 (factor rules), D14 §Phase-1 carve-out, `rate-transformation-grammar`, D15 regeneration test | **Yes — break down now** | Four bank answers (§3), one unapplied amendment (H2). None blocks writing tickets |
| **2. Valuation** | D8, D3 §Phase 2, `counterparty-documentation-workstream` | **Nearly** | The library RFP scope is the ticket set's spine and is a procurement artifact that does not exist |
| **3. ALM & IRRBB** | D9, D14, `rate-transformation-grammar` | **Nearly** | CSRBB scope is one unanswered question with three dependent artifacts (§3) |
| **4. Front-to-back** | `phase4-front-to-back-buy-evaluation`, D6, D7, D11 §6 carve-out | **No — wrong shape** | No D4/D5 specs; and the build/buy decision must precede, not follow, the breakdown (§4) |
| **5. Risk** | D11 | **Nearly** | Sized by two numbers that do not exist yet: `T` (Phase 2 deliverable) and trading book size |
| **6. FTP & Regulatory** | D12, D13 | **No** | Group structure (Appendix D) is the largest scope variable in D13 and is unresolved; the returns list does not exist |
| **7. Governance** | `d15-model-governance` | **Not as a phase** | J1/J2 dissolve most of Phase 7 into earlier phases. What remains is small and cross-cutting (§5) |

---

## 3. Outstanding bank decisions, by the phase they gate

None of these is engineering work. They are the actual critical path, and the executive summary already
names subject-matter capacity as the programme's most likely cause of delay.

### Gating Phase 1

| # | Decision | Source | Note |
|---|---|---|---|
| 1 | **Three taxonomy policy elections** in `taxonomy-policy-decisions` §3 | Tickets A6, A7 | Blocks `p0-14` acceptance, and Phase 1's LCR runs off the same classification |
| 2 | **Deposit insurance coverage threshold and aggregation rule** | D10 q3, D13 q5, D1 q3 | One question, three artifacts. D13 owns the interpretation, D1 holds the data, D10 consumes it |
| 3 | **Significant currency threshold** — per-currency ratios from day one? | D10 q4 | Changes the ratio engine's grain |
| 4 | **Who approves internal stress scenarios** (ALCO presumed) | D10 q5, D14 q1 | The approval workflow has no home |
| 5 | **Collateral log ownership and statement-request authority** | D10 q1–q2, `statement-request-pack` | The 24-month clock is running; each deferred month is permanently lost |
| 6 | **EOD window and degradation order** — ALCO sign-off | D17 q1–q2, `eod-window-and-degradation` | Proposed, not approved. Sizes everything in Phase 1 onward |

### Gating Phase 2

| # | Decision | Source |
|---|---|---|
| 7 | **Curve build-or-buy in Phase 0** — recommended answer given, needs confirming | D3 q7, parent §6 |
| 8 | **Library version retention and escrow in the RFP** | D8 q6/§9.1, D15 J7 |
| 9 | **Exotic FX sequencing within Phase 2** (scope is closed; timing is not) | D3 q2, D8 q1 |
| 10 | **Tier 3 replicating-portfolio path — built or documented only?** | D8 q5 |
| 11 | **Snapshot timing convention and restatement policy** | D3 q5–q6 |

### Gating Phase 3

| # | Decision | Source |
|---|---|---|
| 12 | **Is CSRBB in scope?** | D9 q4 → D3 q4 → D14 q6. **One answer, three artifacts change** |
| 13 | **NMD history depth and segmentation granularity; deposit beta observability** | D9 q1–q3 |
| 14 | **Overlay semantics — delta or override** | D14 q7. Cheap now, awkward after overlays exist |
| 15 | **Non-rate factor grammar bindings** (vol, credit spread, FX) | D14 q8, D11 §6.3. Needs an interim owner named as a **Phase 1** role |

### Gating Phase 4

| # | Decision | Source |
|---|---|---|
| 16 | **CVA-free fair value policy between Phase 4 and Phase 5** | Parent §2.9, D8 q2, D11 q3. **Three artifacts, one answer**; D11's carve-out is the recommended resolution |
| 17 | **Uncleared margin rules — is the bank in scope for IM?** | D6 q1. Largest single scope swing in Phase 4 |
| 18 | **FTP methodology settled in Phase 4** (clock 4) | D12 §5, parent §6.1 |
| 19 | **Rehypothecation, CCP membership, covered bonds, central bank facilities** | D6 q2–q4, q6 |
| 20 | **Which GL is authoritative, and its posting interface** | D7 q7 |

### Gating Phase 5

| # | Decision | Source |
|---|---|---|
| 21 | **How large is the trading book?** | D11 q1. Factual, answerable now, everything downstream depends on it |
| 22 | **Which VaR method** | D11 q4 |
| 23 | **Vendor history purchase — and buy raw quotes, not derived factors** | D3 q1, D11 q5, `D11-4` |
| 24 | **Exposure simulation cadence and compute budget** | D11 q9. Largest compute in the platform, currently unbudgeted |

### Gating Phase 6

| # | Decision | Source |
|---|---|---|
| 25 | **Group structure — the four Appendix D signals** | Parent App. D, D13 q6, D7 q6, D6 q7. **The single largest open question in the programme** |
| 26 | **Standardised or IRB for credit risk** | D13 q1 |
| 27 | **Which local returns, templates and calendar** | D13 q2. Phase 6 cannot be sized without the list |
| 28 | **Does the bank want FTP at all, and matched-maturity or pooled?** | D12 q1–q2 |
| 29 | **IFRS 9 transitional arrangements; fair value option** | D13 q3–q4, D7 q1, q4 |

### Gating everything (Phase 0–3 in particular)

| # | Decision | Source |
|---|---|---|
| 30 | **Can the incumbent TMS produce a contract-level extract?** | D16 q2. **Phases 0–3 have no treasury book without it, and this question has no owner in any artifact** |
| 31 | **Can core banking produce a complete daily contract-level extract?** | D16 q1 |
| 32 | **Does an independent model validation function exist?** | D15-MG q1. Determines whether validation-before-first-use is achievable from Phase 0 |

---

## 4. Phase 4 needs a different object, not a ticket breakdown

Phases 0–3 and 5–7 are builds; a ticket breakdown is the right artifact. **Phase 4 is a procurement**
with three build carve-outs around it, and forcing it into ticket shape would produce exactly the
several-thousand-requirement build spec `phase4-front-to-back-buy-evaluation` was written to avoid.

What Phase 4 needs instead, in order:

1. **A procurement workplan** off the evaluation contract — lot cuts, RFP calendar, evidence
   conversion, decision rights. The contract specifies the *what*; nothing specifies the *when and who*
2. **Then** ticket breakdowns for the three parts that are built regardless of the buy outcome:
   - **The limit framework** (parent §1.5 moved it out of D11 into Phase 4)
   - **D11's counterparty carve-out** — current exposure, SA-CCR, simplified netting-set CVA,
     settlement exposure (D11 §6.3). This is the build that closes decision 16
   - **The D6 handover** — full D6 arriving around a register already in production (parent §6.2).
     If the Phase 4 plan does not carry the handover, the LCR look-back window restarts and two years
     of accumulated history is discarded
3. **D4 and D5 deep-dives are only needed if the buy fails.** Writing them now is speculative work
   against a decision not yet taken

---

## 5. Phase 7 has been dissolved and the phase table has not caught up

`d15-model-governance` J1 and J2 establish that validation, inventory and change control **accrete from
Phase 0 onward** — a validation function arriving in Phase 7 validates nothing for six years and then
inherits a portfolio of unapproved production models. Parent §6 records this in prose; the phase table
row still reads as a module.

**Consequence for breakdowns:** every phase from 1 onward needs a standing model-governance slice in its
ticket set (register the models this phase introduces; validate before first use; schedule revalidation).
What remains genuinely Phase 7 — aggregate model risk reporting, model risk appetite, model provenance —
is a handful of tickets, not a phase.

The same is true of D13: F1 already splits rule *authoring* into Phases 0–1 from the Phase 6 module.

---

## 6. Cross-artifact amendments — now applied

> **Status: closed.** This section is retained as the record of what was outstanding. Every ref below
> that could be discharged by a document change has been applied; see the parent's
> `Appendix — PBR amendments` for the mapping, and §6.1 for what deliberately remains.
>
> **One correction to what this section originally claimed.** It counted thirty-one unapplied
> amendments. That over-stated it: the amendments targeting the **parent blueprint** were already
> applied and recorded as `D11-n`, `D12-n`, `D14-n` and `D15-n` in the parent's module appendices. What
> was genuinely outstanding was the **subset targeting sibling artifacts**, registered as R8
> deferred-with-trigger rows — sixteen refs, of which fourteen were dischargeable. The spot-checks that
> prompted the original count were accurate; the extrapolation from them was not.

### 6.1 What remains, and why

Eight refs are still open. **None is a document gap** — each needs a bank answer or a future event, and
applying them would mean inventing the answer:

| Ref | Needs |
|---|---|
| `D3-3` | **The CSRBB scope decision — the highest-leverage of the eight.** One answer discharges D3 q4, D9 q4 and D14 q6 |
| `D3-2`, `D3-4` | Current exotic FX holdings; home-market curve depth |
| `D11-10` | An interim non-rate representation owner, named as a Phase 1 role |
| `D11-11` | Regulatory reporting confirming that "standardised" market risk means the sensitivities-based method |
| `D12-9` | Matched-maturity or pooled FTP, stated rather than inherited |
| `D14-7` | The incumbent TMS contract-level extract — the same question that gates Phases 0–3 |
| `D15-13` | A validation-resourcing decision. Budget and hiring, not build |

**`BP-1` is closed.** The Appendix G/I merge was executed during this pass by another agent; `G1`–`G11`,
`I1`–`I7` and `D14-1`–`D14-7` now sit in one `Appendix — D14 amendments` with stubs preserving every
citation. **One consequence for §7 below:** the revision 3 checkpoint block still reads *"`BP-1` is
outstanding"*, which is now stale. R3 gives that list a single writer — the blueprint owner — so it is
flagged as `PBR-9` rather than edited.

### 6.2 The original record

Each module deep-dive ends with an appendix of changes it raises for *other* artifacts. **These were
listed rather than applied, and spot-checks confirm they are still outstanding.** They matter here
because a ticket breakdown written from an un-amended artifact carries the superseded requirement — the
exact failure the Phase 0 tickets already had to correct for, via amendments A1–A8.

| Source | Refs | Targets | Verified outstanding |
|---|---|---|---|
| `d11-market-and-counterparty-risk` | H1–H4 | Parent §1.5, D10 §7/§9, D14 §1.5, D3 §6 | **Yes** — D10 still routes breaches to "the limit framework D11 operates"; D14 §1.5 still targets risk factors rather than D3 market objects |
| `d12-funds-transfer-pricing` | I1–I8 | D9 AC9 and §2/§6.2/§8.3, D10 AC9 and §2.2/§9, parent §6.1, D2 | **Yes** — D9 AC9 still reads "D9 and D12 demonstrably consume the same behavioural parameter set", which sources FTP's liquidity premium from rate-risk parameters |
| `d15-model-governance` | J1–J10 | Parent §5/§6/§2.6, D3, D10, D9, D14, D8, `d15-control-core` | **Yes** — J3's fourteen unnamed models, six of them tier 1, are not named as models in D3 or D10 |
| `d8-valuation-and-analytics` | F5–F6 | D8 itself (applied), parent (partially) | Partially |
| Parent | **`BP-1`** — the D14 appendix merge | Parent | **Yes** — named outstanding at the revision 3 checkpoint and still the only known applied-but-unrecorded gap |

**H2 and I1 are the two that would visibly corrupt a ticket set** if a Phase 1, 3 or 5 breakdown were
written today: one rebuilds the Phase 4→5 dependency inversion the critique found, the other specifies a
reconciliation report that reconciles the wrong parameters.

---

## 7. Recommended order

| Order | Action | Why |
|---|---|---|
| ~~1~~ | ~~Apply the cross-artifact amendments and close `BP-1`~~ | **Done** — see §6. Fourteen refs applied across nine artifacts; `BP-1` closed by another agent during the same pass |
| 2 | **Break down Phase 1** | **Now the next action.** The only phase whose artifacts are complete, and they are now also current. Its six bank decisions can run in parallel with the build tickets |
| 3 | **Put decisions 25, 30 and 21 to the bank now** | Group structure, TMS extract capability and trading book size are factual or near-factual, gate three separate phases each, and have no engineering dependency |
| 4 | **Break down Phase 3** — after CSRBB (12) is answered | One answer unblocks three artifacts |
| 5 | **Write the Phase 4 procurement workplan** | It is the programme's principal risk and its lead time is the longest thing here |
| 6 | **Break down Phase 2** once the RFP scope is fixed | The library decision is the spine of the ticket set, not an input to it |
| 7 | **Phases 5 and 6 last** | Both are sized by numbers that do not exist until Phase 2 runs (`T`) or the bank answers 25 and 27 |

**A standing item for every breakdown from Phase 1 onward:** a model-governance slice (§5) and, where the
phase introduces a market data or risk factor series, the grammar-version-travels-with-the-series
obligation from `D11-4` / H4.
