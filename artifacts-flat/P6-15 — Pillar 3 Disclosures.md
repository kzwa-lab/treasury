# P6-15 — Pillar 3 Disclosures

**Wave 5. Depends on P6-09, P6-11.**

**A disclosure, not a second calculation** — and that framing is the ticket's main design constraint.

Governing artifacts: `d13-regulatory-reporting-and-capital` §6.

## The constraint

**Every number in Pillar 3 comes from the returns engine.**

> **If Pillar 3 requires its own computation, the returns engine has been built too narrowly.**

That is the test. A Pillar 3 template needing a figure the returns engine cannot produce is **a finding
about P6-11 or about the RWA and capital tickets**, not a feature to build here.

## In scope

- **Quantitative templates**, populated from P6-11's engine
- **Qualitative disclosures** — risk management objectives, governance, methodologies
- **Consistency with the regulatory returns**, which is the same cross-return consistency requirement
  P6-11 enforces, extended to public disclosure
- The disclosure calendar, which is distinct from the submission calendar and generally less frequent
- **The assertion that no internal contract or internal curve entered any disclosure** — `D12-3` for
  contracts, D3's `curve_class` for curves

## Why the internal assertion belongs here specifically

Pillar 3 is **public**. An internal FTP transfer contract reaching a public disclosure would inflate both
sides of the disclosed balance sheet by the full internal book — and unlike a regulatory return, **a
public disclosure cannot be quietly resubmitted.**

`D12-3` established exclusion **by construction rather than by filter** for exactly this class of risk,
and D3 gave curves the same property in Phase 0. **This is where both assertions get exercised in their
highest-stakes setting.**

## Consistency is the most common challenge

**Inconsistency between what a bank discloses publicly and what it submits privately is one of the most
common regulatory challenges** — and it arises not from dishonesty but from the two being produced by
different teams from different extracts at different times.

**One engine, one set of definitions, both outputs.**

## Out of scope

- The computations — P6-03 to P6-06, P6-10
- The returns engine — P6-11
- Business unit reporting — P6-09, which is internal and stays internal

## Acceptance criteria

1. **Every quantitative figure traces to the returns engine** — no Pillar 3-specific computation exists
2. **Pillar 3 and the corresponding regulatory return agree**, checked before publication rather than
   after
3. **The disclosure asserts that no internal contract and no internal curve entered it**, by construction
4. Qualitative disclosures reference the governed artefacts — model inventory, methodologies, approval
   routes — rather than restating them in prose that then drifts
5. Historic disclosures reproduce under the rules and templates in force at the time
6. The disclosure calendar is held with the submission calendar in D1

## Notes

**Criterion 4 prevents a slow, common decay.** Qualitative Pillar 3 text is typically written once and
edited annually, while the methodologies it describes are versioned and change under governance. Within a
few years the disclosure describes a framework the bank no longer operates — **which is a disclosure
failure produced entirely by copy-paste.** Referencing the governed artefact keeps the two attached.

**Criterion 1 is the cleanest possible test of whether the modular design held.** Pillar 3 is the last
consumer in the programme and it consumes almost everything: capital, RWA by type, leverage, large
exposures, liquidity ratios, governance. **If it can be assembled entirely from existing measures, the
"configuration not code" claim made in Phase 0 was true.** If it needs its own computations, that claim
failed somewhere earlier and this is where it becomes visible.
