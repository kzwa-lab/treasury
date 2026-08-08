# P2-02 — Contract Terms: Retention, Escrow & Grid Licensing

**Wave 1. Depends on P2-01.**

**Non-engineering.** Procurement and legal, with an architecture input that procurement will not think
to ask for.

Governing artifacts: `d8-valuation-and-analytics` §9.1, §9.2.

## Two lock-ins, and the bank pays for both later

### 1. Version retention — the lock-in nobody costs

Parent §2.5's third determinism mitigation is *"the engine build retained as a versioned artefact, so
historic regeneration can run on the code that produced the original."*

**For bought code that is a licensing and escrow requirement, not an engineering one.** The bank must be
able to run a **decade-old version of the vendor's library**, on hardware and an operating system that
will also have moved, **for as long as the reproducibility guarantee stands.**

**Standard licence terms do not contemplate this**, and it cannot be added at renewal from a position of
lock-in.

### 2. The model governance half — `D15-7`

Retention says the bank *can* run the old version. It does not say which version it *should* run, and
**the bought library is not one model but a set of them**, every one in D15's inventory and validated at
a point in time.

- **A vendor upgrade is a model change on the vendor's calendar, not the bank's.** The bank chooses only
  whether to take the release; every upgrade triggers revalidation of whatever it touches, **on a
  schedule set outside the bank.** A vendor release note is not a validation report
- **A validated version eventually goes end-of-life**, forcing a choice between running unsupported code
  and revalidating on the vendor's timeline

**The contract is where the notice period, the parallel-run window and the support terms for a superseded
version get set.** Left out, this surfaces in Phase 3 or 5 as the first upgrade the bank does not want
but cannot refuse.

### 3. Grid licensing at the Phase 5 multiplier

**Not a criterion to weigh — a quantity to state.**

| Workload | Scale |
|---|---|
| Phase 2 | **One full revaluation pass a night** |
| Phase 5 | **~500 `T` for VaR and stressed VaR**, plus an exposure simulation larger than everything else in the platform combined |

**Between them sits a factor of up to two orders of magnitude in core count, and it arrives three phases
after the licence is signed.** A per-core licence negotiated against a one-pass workload is renegotiated
in Phase 5 from a position of total lock-in, against a vendor who by then knows the model set, the
calibration configuration and the wrapper.

**The number lives in a module that does not exist when the contract is signed**, which is exactly why
it goes unasked.

## In scope

- Long-term version retention rights and source escrow
- Upgrade, notice, parallel-run and superseded-version support terms (`D15-7`)
- Grid licensing stated as a **quantity with burst rights** for the exposure simulation, on a
  non-linear model rather than per-core at the Phase 2 volume
- Determinism-across-versions warranty, or a disclosed position where the vendor will not give one

## Out of scope

- Evaluation and selection — P2-01
- The `T` measurement that sizes the quantity — P2-14 refines it; this ticket uses the estimate

## Acceptance criteria

1. Version retention and escrow are **in the executed contract**, with a term at least as long as the
   reproducibility guarantee
2. Upgrade terms name a notice period and a parallel-run window sufficient for revalidation
3. Grid licensing states a quantity sized on the **Phase 5** multiplier, with burst rights
4. The vendor's position on determinism across versions is documented, whichever way it falls
5. Where the vendor declines a term, the **declined term and its consequence are recorded** rather than
   dropped

## Notes

**Criterion 5 is the one that pays off years later.** Some vendors will not grant decade-long retention
on any terms. That is a survivable answer; an *undocumented* one is not, because the reproducibility
guarantee in parent §2.5 then rests on something the bank does not have and nobody remembers deciding.

**This ticket is where three phases of cost get set by people who will never see the consequence.** The
architecture input — what retention means, what a model change is, what the Phase 5 multiplier is —
must come from the D8 owner into the negotiation, not be inferred by procurement from a requirements
list.
