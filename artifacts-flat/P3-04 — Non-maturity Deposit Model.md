# P3-04 — Non-maturity Deposit Model

**Wave 2. Depends on P3-01, P3-02.**

**The largest uncertainty in the phase, and probably in the programme.** For most retail banks this
single model drives the IRRBB result more than any other input.

Governing artifacts: `d9-alm-and-irrbb` §6.1.

## Three questions, routinely collapsed into one

Retail and corporate current, savings, call and notice accounts (Part 2 B.3) have **no contractual
maturity and a rate the bank sets at its discretion.** Modelling them means answering three separate
questions, and collapsing them is the most common error in this area.

### (a) Volume stability — how much stays?

Split the balance into a **core** portion (stable through rate and stress cycles) and a **volatile**
portion (short-tenor, immediately repricing). Calibrated from historical balance behaviour over
P3-01's segmentation, ideally through at least one full rate cycle.

### (b) Maturity profile — how long does the core last?

The core is spread across a maturity profile — a decay function or a slotting profile. **Supervisory
approaches cap the average maturity by category**, and retail transactional accounts attract the
tightest cap.

**The cap is the binding constraint in practice**, so the model must produce **both the internal view
and the capped supervisory view, and show the difference.** The caps themselves are prescribed and are
authored by D13-A (`tickets-phase1/p1-01`), not chosen here.

### (c) Repricing beta — how much of a rate move is passed on?

Pass-through from market rate to deposit rate. Typically well below 1, and three properties that a
single constant cannot express:

- **Asymmetric** — banks pass on rises more slowly than falls
- **Lagged**
- **Floored** — a deposit rate cannot go below zero in most markets, so **beta collapses toward zero as
  rates approach the floor**

**This asymmetry is the mechanism behind P3-10's margin compression.** Modelling beta as a single
symmetric constant systematically understates down-shock damage — and it does so invisibly, because the
number produced is entirely plausible.

## The interaction that must be preserved

**Beta and maturity profile are calibrated together.** A high-beta deposit reprices quickly and behaves
short *regardless of how stable its balance is*.

**Stability is a liquidity property; beta is a rate-risk property.** This model owns split 3. D10's
core/volatile split 2 is a different parameter over the same segmentation, and the platform must not
implement a single "deposit stickiness" figure serving both (D10 §5.1).

## Out of scope

- Split 2, D10's core/volatile liquidity behaviour — P3-14, and a separate parameter
- Split 1, LCR's prescribed classification — Phase 1, not a model
- Execution — P3-07. D9 defines, D2 executes
- The FTP repricing component that consumes this — Phase 6

## Acceptance criteria

1. The three sub-models are separately parameterised, versioned and separately reportable
2. **Both the internal and the capped supervisory maturity view are produced, with the difference shown**
3. Beta is modelled **asymmetrically with a floor**, and the down-shock asymmetry is visible in the
   output rather than buried in it
4. Beta and maturity profile are calibrated jointly, and the model documentation states the interaction
5. Parameters are versioned and effective-dated; a historic IRRBB metric reproduces under the parameters
   in force at the time
6. The model is in D15's inventory, validated before first use, with sensitivity analysis as standard
   output (P3-02)
7. Where calibration history is insufficient, the model is marked **judgement-led** and the marking
   reaches the ALCO pack

## Notes

**Gating decision 3 may change the approach entirely.** Beta calibration assumes an observable
relationship between market and deposit rates. **In administered, floored or volatile rate regimes that
relationship may be weak or absent**, in which case a calibrated beta is a fitted curve through noise.
That is a modelling-approach question to settle before calibration starts, not a result to explain
afterwards.

**This is the model a supervisor will interrogate hardest**, and criterion 2 is why: the gap between the
bank's internal view and the capped view *is* the conversation. A model that produces only the capped
view has nothing to say in it.
