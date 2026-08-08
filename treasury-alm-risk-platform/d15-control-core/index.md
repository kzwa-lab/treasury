---
kind: spec
title: "D15 Control Core — Audit, Four-Eyes & Override"
---

# D15 Control Core — Audit, Four-Eyes & Override

The Phase 0 subset of D15, pulled forward because Phase 0 mandates controls that Phase 7 was to own.
Parent: `treasury-alm-risk-platform`. Phase 0.

**Why it is pulled forward.** The critique found the circularity directly: D15 sits in Phase 7 and owns
the four-eyes and audit machinery that D2 §2.4 rule 2 mandates from Phase 0. Every Phase 0 artifact
since has added to the pile — D1 §4 requires four-eyes with callback verification on settlement
instructions and impact statements on retroactive-effect changes, D3 §7 requires expiring four-eyes on
manual marks, D16 requires an authority to accept a break within tolerance, D17 §3.1 requires
four-eyes on gate overrides with provisional propagation, and the classification rules engine requires
four-eyes on every override. **Phase 0 does not work without this, and Phase 7 is four years too late.**

**The organising idea: four-eyes is a platform service, not a feature each module implements.** If
every module builds its own, the programme gets eight approval implementations with eight override
semantics, eight audit formats and no consolidated answer to "what was overridden yesterday, by whom,
and what is still outstanding". That answer is the first thing an auditor asks for, and assembling it
from eight sources is precisely the work nobody has time to do at audit.

**The one-line test:** take any number on any report and walk back to every human decision that shaped
it — the marks, the overrides, the accepted breaks, the rule approvals, the gate overrides — as one
query across one trail. If that requires visiting several modules and correlating by timestamp, the
control core was not built.

## 1. Scope — what is Phase 0 and what stays in Phase 7

| Capability | Phase | Reason |
| --- | --- | --- |
| **Audit trail** — append-only, correlated, permanent | **0** | Parent §5; nothing else can be retrofitted onto history that was not captured |
| **Four-eyes / maker-checker framework** | **0** | Mandated by D1, D2, D3, D16, D17 from day one |
| **Override register and reason code taxonomy** | **0** | An override with no register is not a control |
| **Impact statement / dry-run capability** | **0** | §4 — assumed by D1 §4 and the rules engine, specified nowhere |
| **Authority matrix** (who may approve what) | **0** | Meaningless to defer; it is the definition of the control |
| Model inventory and validation | 2 | First real model is D3's curve construction (D3 §7) |
| Behavioural model governance, backtesting | 3 | With D9 |
| **Regeneration test** | 1 | Already pulled forward by parent §2.5 |
| Full model risk framework, periodic validation cycle, model risk reporting | 7 | The rest of D15 |

**What is deliberately *not* in the core:** anything requiring a model to govern, a limit to breach or
a trade to authorise. Those arrive with their subjects. The core is the machinery those capabilities
plug into.

## 2. The catalogue of controlled actions

**Assembled here for the first time.** Each artifact specified its own controls in isolation; nobody has
had the list in one place, and the list is what determines whether the framework is adequate.

| Action | Module | Tier | Additional requirement |
| --- | --- | --- | --- |
| Standing settlement instruction change | D1 | Elevated | **Callback verification** against an independently sourced contact; relationship owner notified |
| Counterparty bank account / payment routing change | D1 | Elevated | As above — fraud vector |
| Calendar, convention or index definition change | D1 | Retroactive | Impact statement |
| Classification rule set change or activation | Rules engine | Retroactive | Impact statement + regression corpus pass |
| LCR / NSFR factor set change | D1 / D13 | Retroactive | Impact statement |
| Book intent transfer (trading ↔ banking) | D1 / D2 | Elevated | Documented rationale; reported; regulators treat unexplained transfers as arbitrage |
| Classification override on an object | Rules engine | Standard | Reason code; **expires**; reviewed on rule change |
| Manual market data mark | D3 | Elevated | Reason code; **expires**; standing report by age and value impact |
| Curve definition or interpolation change | D3 | Model | Validation before use; impact statement |
| Market snapshot restatement | D3 | Retroactive | Impact statement; re-run-or-carry decision |
| Composition rule change | D3 | Retroactive | Impact statement |
| Break acceptance within tolerance | D16 | Standard | Stated cause; a disappearing difference does not auto-close |
| Suspense write-off | D16 | Elevated | Reason code; materiality-scaled authority |
| Gate override | D17 | Elevated | Reason code + justification; **propagates provisional to all descendants** |
| Cut-off movement | D17 | Standard | Audited event |
| Manual journal to a treasury GL account | D7 | Elevated | Phase 4 |
| Trade amendment or cancellation | D4 | Standard | Phase 4 |
| Limit change | Limit framework | Elevated | Phase 4 |
| Behavioural model parameter change | D9 / D15 | Model | Phase 3 |

**Nine of these are live in Phase 0.** That is the framework's actual Phase 0 load, and it is enough to
justify building it properly rather than adding an approval flag to each module.

## 3. Three tiers, harmonised

D1 §4 and D3 §7 each invented a tier structure independently, and they nearly agree. Harmonised:

| Tier | Requirement | Applies to |
| --- | --- | --- |
| **Standard** | Maker ≠ checker; reason code; audit record | Routine controlled actions |
| **Elevated** | Standard, plus one of: independent verification (callback), an expiry date, or notification to a named third party | Fraud-sensitive, or where a stale approval is itself the risk |
| **Retroactive** | Standard, plus a mandatory **impact statement** (§4) | Anything that changes numbers already published |
| **Model** | Retroactive, plus validation before first use and on a cycle | Curve definitions, behavioural models — arrives Phase 2/3 |

**The tier is a property of the action, not of the actor or the amount.** Materiality may scale *who*
may approve (§5), but it does not downgrade a retroactive change into a standard one — a tiny
correction to a calendar still changes history.

## 4. The impact statement is a capability, not a document

**The finding this deep-dive exists to surface.** D1 §4 requires retroactive-effect changes to carry an
impact statement — "what reproduces differently, and over what period". D3 §7 requires the same for
snapshot restatements and curve changes. The classification rules engine requires it before activating
a rule set. **All three assume the platform can answer that question, and no artifact specifies the
capability that answers it.**

Producing an impact statement means: take the proposed change, **apply it against the current or a
historic population without committing it**, re-run the affected computation, and diff. That is a
dry-run facility with three requirements:

1. **Candidate versions.** A rule set, calendar, curve definition or composition rule can exist in an
   approved-but-not-active state that engines can be pointed at explicitly.
2. **Re-run against a frozen population.** Reusing D17's re-run machinery (D17 §5) and D2's determinism
   work (D2 §7.4) — without determinism, the diff contains engine noise and means nothing.
3. **A diff that speaks in business terms.** Not "4,102 rows changed" but *which taxonomy lines move,
   by how much, which ratio buckets shift, and which LCR/NSFR factors now apply to what balance*.

**This is a real Phase 0 build item with a real cost**, and it is currently invisible in the plan
because each artifact stated the requirement and assumed the capability. It is also the single highest-
leverage control in the platform: it is what converts "we think this rule change is fine" into a
number, before the change reaches production rather than after.

**The cost is not one cost — it varies by two orders of magnitude with what is being changed —
`D15-9`.** Requirement 2 says "re-run the affected computation", which reads as one operation and is
not. The three consumers named above are rule changes; **models are the expensive case, and they arrive
from Phase 2 onward:**

| Change | Dry-run means | Rough cost |
|---|---|---|
| A classification rule set | Re-classify the population and diff the dimensions | A classification pass — minutes |
| A calendar or curve definition | Re-project or re-build, then diff | Bounded by one projection or curve pass |
| **A recalibrated NMD behavioural model** | **A full EVE and NII re-run under both parameter sets** | **A complete D9 cycle, twice** |

**Why this matters here rather than in D15's model half.** Recalibration is *periodic and scheduled* —
it is not an exceptional event that can be run at the weekend — so from Phase 3 the impact-statement
capability needs a compute allocation of its own inside or beside the EOD window, and that allocation
belongs in `eod-window-and-degradation` §5's budget rather than being discovered when the first
recalibration is due. Phase 0's version of this capability is genuinely cheap; **the requirement it
creates for Phase 3 is not, and the two should not be costed as one line**
(`d15-model-governance` §5).

## 5. The authority matrix, and how four-eyes actually fails

**Who may approve what is itself governed data** — versioned, effective-dated, auditable, and subject
to its own four-eyes. An approval framework whose permission table can be edited by one person is not a
control.

**Three failure modes to design against explicitly:**

**Self-approval by proxy.** In a treasury function there may be only two or three people qualified to
approve a curve methodology change or a regulatory classification rule. The framework must handle
genuine scarcity — a named escalation to a senior role outside the immediate team, with the exception
itself recorded and reported — rather than leaving people to swap credentials, which is what happens
when the system says no and the work must ship.

**Rubber-stamping.** An approval that is always granted within seconds is not a second pair of eyes. The
countermeasure is not technical: approval rates, time-to-approve and override volumes by approver go to
the same forum that sees the break register, and a checker who never rejects is a finding.

**Break-glass.** There must be a documented emergency path — time-boxed, automatically escalating,
reported the next business day, and never the quiet default. A framework with no emergency path grows
an undocumented one.

**Segregation of duties in Phases 0–3 is not the one parent §5 describes.** Parent §5's model — front
office books, middle office validates, back office settles, finance posts — presumes D4 and D5, which
arrive in Phase 4. Until then there are no dealers in the platform, and the meaningful segregation is
between **the people who author reference data and rules** and **the people who consume the outputs**:
the maintainer of a counterparty rating must not be the person whose ratio improves when it changes.
Stating this prevents a Phase 0 control design that models a trading floor which is not there yet.

## 6. The audit trail

**Append-only, never physically deleted** (parent §5), permanent retention, and online for the period
the reproducibility guarantee covers.

Every record carries:

| Field | Why |
| --- | --- |
| Actor, and approver where applicable | The two halves of four-eyes |
| Action type and target object | What was done to what |
| **Effective date and knowledge date** | The change may be retroactive; both axes are needed to reconstruct (D1 §2, D2 §3) |
| Before and after values | A record of the fact of a change is not a record of the change |
| Reason code and free-text justification | Codes aggregate, text explains |
| **Correlation ID** | §6.1 |
| Resulting provisional status, if any | Links to D17's propagation |

### 6.1 Correlation is the requirement that forces a shared service

**One business action spans several modules.** A back-dated trade correction touches D2's bitemporal
store, triggers a classification recompute, changes a reconciliation outcome in D16, flags a re-run in
D17 and later produces a D7 posting adjustment. Six audit records in five modules, describing one
decision.

**Without a shared correlation ID, reconstructing that decision means joining on timestamp and
guessing.** With one, it is a single query. A correlation ID cannot be retrofitted, cannot be
coordinated across independently-built module audit logs, and is the strongest technical argument for
the control core being one service rather than a shared convention.

**The audit trail also has two authors that are not human.** D17's run history — every stage outcome,
gate evaluation, override and re-run cause (D17 §5) — and D16's reconciliation evidence are both audit
records generated by the platform about itself. The core stores them on the same trail, under the same
retention, addressable by the same correlation ID.

### 6.2 What the trail is used for

Design for the four real queries, because they differ from what "audit trail" usually implies:

1. **Why did this number change?** — the movement question, and by far the most frequent. Answered by
   correlating audit records against a reporting period.
2. **What did a named person do?** — access review and incident investigation.
3. **What is currently outstanding?** — live overrides, unexpired marks, accepted breaks, provisional
   outputs. **A standing operational report, not an investigation**, and the one most platforms lack.
4. **Reproduce the control environment as at a date** — which rules, which approvals, which authority
   matrix were in force. This is the control half of the reproducibility guarantee, alongside D2's data
   half.

## 7. Interfaces

**Inbound.** Every module that performs a controlled action (§2), through a common approval and audit
API rather than a local implementation. D17 — run history, gate evaluations and overrides. D16 —
reconciliation evidence and break acceptances. D1 — the authority matrix and role definitions, held as
versioned reference data like everything else in D1.

**Outbound.** Approval decisions back to the requesting module. The standing outstanding-items report
(§6.2) to operations and to the forum that reviews the break register. Audit evidence to internal
audit, external audit and regulators. **Provisional status linkage to D17**, so that an override
recorded here and a provisional flag propagated there are demonstrably the same event.

**Identity is bought, not built.** Authentication, role membership and access certification belong to
the bank's existing identity infrastructure. The control core owns the *authority matrix* — which role
may approve which action at which tier — not the user directory.

## 8. Build/buy and sizing

**Build.** The core is coupled to the domain model — the actions, the tiers, the impact statement diff,
the correlation across modules — and no product provides that coupling. Workflow tooling and identity
are bought and integrated.

**Volume is small and retention is long.** Controlled actions number in the thousands per year, not the
millions; the machine-generated run and reconciliation history is larger but still modest against D2.
Retention is permanent, which makes storage design a question of accessibility over a decade rather
than of capacity.

**The cost is not the trail, it is the dry-run** (§4). Budget for it explicitly, because it is the part
that looks optional in a plan and is load-bearing in three separate artifacts.

## 9. Acceptance criteria

1. Four-eyes is a single platform service; no module implements its own approval or override semantics
2. Every action in §2 that is live in the current phase routes through it, at its stated tier
3. The authority matrix is versioned, effective-dated, auditable, and changing it is itself four-eyes
4. Retroactive-tier changes cannot be committed without an impact statement produced by dry-run against
   a live or historic population, expressed in taxonomy lines and ratio buckets
5. Every audit record carries actor, approver, both temporal axes, before/after values, reason code and
   a correlation ID
6. A single business action spanning multiple modules is reconstructable as one correlated sequence
7. The audit trail is append-only and permanent; nothing is physically deleted
8. Outstanding controls — live overrides, unexpired marks, accepted breaks, provisional outputs — are a
   standing report, not a query someone has to think to run
9. Overrides and approvals are reported by approver, with rates and time-to-approve visible
10. A documented break-glass path exists, is time-boxed, auto-escalates and is reported next business day
11. The control environment as at any historic date is reproducible — rules, approvals and authority
    matrix in force

## 10. Open questions

1. **Does the dry-run capability get built in Phase 0?** §4. Three artifacts assume it. If it is
   deferred, every impact statement requirement in D1, D3 and the rules engine becomes a manual estimate,
   and those requirements should be reworded honestly rather than left implying a capability that does
   not exist.
2. **Approver population depth.** How many people can genuinely approve a curve methodology change, a
   regulatory classification rule, or an SSI? If the answer is two, §5's escalation path is not an edge
   case and needs designing now.
3. **Where does the authority matrix live?** Recommended as D1 versioned reference data for consistency,
   but it could reasonably sit with identity infrastructure. The decision affects who can change it.
4. **Retention versus privacy.** A permanent, never-deleted audit trail carrying actor identity meets
   the regulatory requirement and sits awkwardly with data protection erasure rights. This needs a legal
   answer, not an architectural one, and it should be obtained before the trail exists rather than after.
5. **Does the bank have an existing operational-risk or workflow platform** that already carries
   maker-checker for other processes? If so, integrating is likely cheaper than building, provided it
   can carry the correlation ID and the bitemporal fields.
6. **Who owns the standing outstanding-items report?** §6.2. It needs a forum that reviews it and acts,
   or it becomes a page nobody opens.

## Appendix — amendments applied from sibling modules

| Ref | Applied | Section |
|---|---|---|
| `D15-9` | The dry-run's cost varies by two orders of magnitude with the change class. A rule set is a classification pass; a recalibrated NMD model is a full EVE/NII re-run under both parameter sets, on a scheduled cycle from Phase 3 | §4 |

Raised by `d15-model-governance` — the full-D15 artifact for which this is the Phase 0 subset — and
recorded as deferred-with-trigger in the parent's D15 appendix. Applied here under *"that artifact is
next amended"*. The ref keeps its originating namespace (`blueprint-amendment-protocol` R1).

**It does not change the Phase 0 build.** §4's capability is specified correctly and its Phase 0 cost is
unchanged; what the amendment adds is that the same capability acquires a **recurring compute cost from
Phase 3** which belongs in `eod-window-and-degradation` §6's sizing rather than in this artifact's
build estimate. Recorded here because §4 is where a reader forms their view of what the dry-run costs.
