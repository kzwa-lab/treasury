# GL Interface — Authority, Granularity and Cadence

The boundary between the treasury sub-ledger (D7) and the authoritative general ledger. Parent:
`treasury-alm-risk-platform`. Closes D7 open question 7 and Stage 0 gate item 1 in
`phase4-procurement-workplan` §4.

**Why this was the gate item that blocked Lot 2 entirely.** A bought sub-ledger is bought against its
posting interface. Until the target ledger, the granularity and the cadence were fixed, the Lot 2 RFP
could not state what the package must emit, and the reconciliation in blueprint §4 could not be designed.

## 1. The decisions

| # | Question | Decision |
|---|---|---|
| 1 | **Authoritative ledger** | **A separate finance/ERP GL.** Not the core banking GL. Core banking posts into the same ERP |
| 2 | **Posting granularity** | **Contract-level detail posted to the GL.** Not summarised |
| 3 | **Cadence** | **Intraday / continuous** — qualified by §3, which is the one part of this that cannot be taken literally |
| 4 | **Inbound** | **Yes — a daily trial balance extract** is available from the ERP to the platform |

**Decisions 2 and 4 are the strong outcomes here.** Contract-level posting means a GL break decomposes
natively, with no platform involvement and no summarisation key to maintain — the cleanest reconciliation
topology available. The inbound extract closes a hole the blueprint had recorded and not solved (§4).

## 2. What decision 1 changes

**D1's GL chart and mapping now target the ERP's chart of accounts**, not core banking's. That is a
Phase 0 change: the mapping is reference data, versioned and effective-dated like the rest, and it is
sourced from a system the platform does not otherwise touch.

**Core banking posting into the same ERP creates a boundary that must be stated explicitly.** Two
sub-ledgers now post into one authoritative ledger, and nothing in the architecture prevents them
posting the same economics twice.

**This is the accrued-interest double-count (blueprint §2.1) reappearing one layer up.** That finding
established that D2 computes accrued interest and core banking's figure is a reconciliation control
rather than an input. The GL-level twin is: if core banking also *posts* treasury-related accruals into
the ERP, the balance sheet double-counts and the break is architectural rather than operational.

**Required before the interface is built: an account-level origination map** — for every ERP account the
treasury sub-ledger touches, which system is the sole originator. Owned by finance, and it is a
half-day exercise now that becomes a reconciliation investigation later.

## 3. Decision 3 cannot be applied to every posting, and the reason is structural

**Intraday posting is right for postings that derive from facts, and impossible for postings that derive
from computations that have not happened yet.**

Blueprint §3 places accounting postings late in the EOD sequence — after the market snapshot and
reference data version are approved, after valuation, after the ECL interface. That ordering is not
stylistic. A fair value movement cannot post before the snapshot it is measured against is approved; a
Stage 3 interest accrual cannot post before the ECL allowance arrives, because interest is calculated on
the net carrying amount (D7 §3).

**So the posting stream splits, on a rule that is checkable rather than a matter of judgement:**

> **A posting may be emitted intraday if and only if every input it depends on is already gated.**

| Class | Postings | Depends on | Cadence |
|---|---|---|---|
| **A — event-derived** | Trade booking, settlement, cash and nostro movement, fees, coupon and principal receipts and payments, margin movement | D16-ingested facts, already gated on arrival | **Intraday, continuous** |
| **B — computation-derived** | Fair value movements, EIR and amortisation, ECL allowance, hedge reserve movements, FX revaluation | Approved market snapshot, reference data version, ECL interface, D8 valuation | **EOD, after the gates that produce their inputs** |

**This preserves the intent of decision 3 rather than diluting it.** The postings a treasurer wants to
see intraday — cash, settlement, booking — are exactly the class A ones. The class B postings are the
ones nobody expects to be final before the overnight run completes, and posting them intraday would
produce journals that reverse every evening.

**The alternative was considered and rejected:** posting class B intraday against provisional inputs and
correcting overnight. That means a GL carrying provisional entries, which collides with parent F8 — no
override may permit a submission from provisional data — and it makes every reporting date a question of
which version of the ledger was read.

### 3.1 Two consequences

**Amendments and cancellations post as reversals, never as deletions.** A class A posting is in the
authoritative ledger within seconds of the event, so a later amendment cannot retract it. This matches
the append-only audit requirement (blueprint §5) and D7 §7.1's traceability, and it must be explicit in
the Lot 2 requirement set — a package that adjusts by amending its own prior journal cannot be used
against an external authoritative GL.

**The EOD window gets slightly easier, not harder.** Moving class A postings out of the batch reduces
tier B load (`eod-window-and-degradation`). Class B remains in the window, sequenced after valuation and
the ECL interface exactly as blueprint §3 draws it.

## 4. What decision 4 closes

**Blueprint Appendix B.1 finding F11 is resolved.** It recorded that eighteen of the forty taxonomy lines
are GL-sourced and that nothing read GL balances back — with C.3 retained earnings as the proof case,
being the balancing figure with no other source. **A daily trial balance extract supplies it**, and the
balance sheet can be produced complete.

**Blueprint §4.1's interim account-level GL comparison is now decided rather than defaulted.** That
section flagged that three of the four reconciliations need Phase 2 or Phase 4 modules, leaving Phases
0–3 with a weaker gate than §4 implies, and said an interim account-level comparison *"should be
explicitly decided rather than defaulted."* **With a daily extract available it is built** — platform
positions against ERP balances at account level, daily, from Phase 0. It cannot decompose a break to a
contract until D7 arrives, and it will still catch most of the population errors a Phase 0 platform
actually makes.

**Both of these are Phase 0 consequences of a Phase 4 gate question**, which is the main argument for
having answered it now rather than at the start of Phase 4.

## 5. What this fixes in the Lot 2 requirement set

The Lot 2 RFP can now state the interface, and it is discriminating:

1. **Emits contract-level journals to an external ERP**, carrying object ID, event ID and valuation
   reference on every line (D7 §7.1). Many vendor sub-ledgers post summarised by design
2. **Splits its own posting stream by input dependency** per §3, or accepts an externally-driven trigger
   for each class
3. **Posts class A continuously**, at event granularity, without a batch cycle
4. **Adjusts by reversal**, never by amending a journal already sent (§3.1)
5. **Consumes a daily trial balance inbound** for reconciliation, rather than assuming it is the only
   writer to its control accounts

**Requirement 1 is the one most likely to eliminate candidates**, and it should be an RFI-stage question
rather than a demonstration-stage discovery.

## 6. The open follow-up: volume

**Contract-level × intraday × ERP is the most demanding of the available combinations, and it has not
been sized.** ERPs ingest journals well in batches; continuous contract-level posting at treasury volumes
is a capacity question with a real answer, and the answer is not knowable from this artifact.

**Required before the interface is committed** — a posting-volume estimate:

```
daily postings ≈ contracts × posting-events per contract per day
              + balances × revaluation postings per day
              + settlement and cash movements per day
```

Owned by IT with finance, tested against the ERP's documented ingestion limits and its licensing basis
where that is per-document. **If the volume exceeds what the ERP will take, the fallback is decision 2's
runner-up** — summary to GL with contract-level detail retained in the sub-ledger and a stable batch key —
which preserves decomposition at the cost of one indirection. That fallback should be priced now rather
than discovered during Lot 2 implementation.

**This does not reopen the decision.** It identifies the single condition under which the decision would
have to be revisited, which is worth knowing before the RFP is written rather than after a contract is
signed.

## 7. Interfaces

**Outbound — postings to the ERP.** Contract-level journals with object ID, event ID, valuation
reference, ERP account, currency, amount, value date and posting class. Class A continuous; class B after
the EOD gates. Reversals for amendments and cancellations.

**Inbound — daily trial balance from the ERP.** Account-level balances, daily. Consumed by D16 for the
account-level comparison (§4), by D2 as the source for the eighteen GL-sourced taxonomy lines, and by
D14's balance sheet projection for C.3 retained earnings.

**Reference — ERP chart of accounts and mapping**, held in D1, versioned and effective-dated (§2).

## 8. Open items

| # | Item | Owner | Needed by |
|---|---|---|---|
| 1 | **Posting volume estimate against ERP ingestion limits and licensing basis** (§6) | IT + Finance | Before the Lot 2 RFP issues |
| 2 | **Account-level origination map** — which system is sole originator for each ERP account the treasury sub-ledger touches (§2) | Finance | Phase 0, before the GL mapping is built |
| 3 | **Trial balance extract format, timing and cut-off** — and whether it is available before or after the ERP's own close steps | Finance + IT | Phase 0, for D16's comparison |
| 4 | **Whether core banking's posting into the ERP is itself contract-level or summarised.** It changes what a break in a shared account can be decomposed to, and the platform does not control it | Finance | Phase 0 |
