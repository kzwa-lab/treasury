# Taxonomy & Accounting Policy Decisions

The outstanding presentation questions blocking Stage 0 acceptance (`tickets/p0-14`, acceptance test 3:
*every Part 1 class maps to a named Part 2 line or is an explicit intentional non-appearance*).

Parent: `treasury-alm-risk-platform`. Sources: `part2-taxonomy-mapping` §9, `part2-query-specification`,
`tickets` amendments A6 and A7.

**Status: recommendations below. Three items in §3 are genuine bank elections and are open.**

## 1. Resolved by role-splitting — no new lines needed

Four of the nine "orphans" are not orphans at all. They have no single home because **they are more
than one thing**, and splitting by role resolves them into existing lines.

### 1.1 Bankers' acceptances

| Role | Presentation |
|---|---|
| BA **held** as an investment (discounted, held to collect) | **A.4** investment securities — it is a money market debt security. **A.3** if held for trading |
| BA **accepted** for a customer, unfunded | **Off-balance-sheet**, alongside guarantees. ECL provision in **B.9** |
| BA accepted **and discounted by the bank** | **A.6** — trade finance loans. The bank has funded it |

The apparent gap came from treating "bankers' acceptance" as one balance sheet item. It is an
instrument the bank may hold, a contingent obligation it may issue, or a funded advance — three
different presentations of the same instrument name.

*One addition needed:* an off-balance-sheet line for **acceptances and endorsements** (§2.1).

### 1.2 Securities lending

| Component | Presentation |
|---|---|
| Securities **lent** | **Remain in A.3 / A.4, flagged encumbered.** Not derecognised — substantially all risks and rewards retained |
| Securities **received** as collateral | **Not recognised.** Memorandum only (§2.1) |
| **Cash** collateral received | Cash asset in A.1/A.2, and a **liability to return it** — see §2.2 |

### 1.3 Collateral swaps

Securities out, securities in, no cash. Applying the same recognition rules: securities delivered stay
on balance sheet encumbered; securities received are not recognised.

**Net balance sheet impact is nil.** This is correct, not a gap — the entire economic substance is
encumbrance, which is why the memorandum block in §2.1 is required rather than a balance sheet line.

### 1.4 Committed liquidity facilities received

**Not recognised, correctly.** A facility granted *to* the bank is not an asset. It is a memorandum item
and a liquidity input, held in the contingent-inflow register already specified
(`d10-liquidity-and-funding` §2.2) and disclosed under §2.1.

## 2. Resolved by adding lines — recommended additions

Five additions. Each is standard practice and four of the five are required by IFRS 7 or the liquidity
regime rather than being discretionary.

### 2.1 Off-balance-sheet memorandum block (extends section D)

The taxonomy's section D covers exposures the bank has *issued* and has no block for collateral or for
facilities received. **Both LCR and NSFR require it**, and IFRS 7 requires transferred-asset disclosure.

| New line | Content |
|---|---|
| **D.5** Assets pledged as collateral | Securities and other assets encumbered under repo, securities lending, collateral swaps, derivative CSAs and central bank pledging |
| **D.6** Collateral received that may be repledged or sold | Securities received under reverse repo, securities borrowing and CSAs, split by whether repledged |
| **D.7** Acceptances and endorsements | §1.1 |
| **D.8** Facilities received (memorandum) | Committed liquidity facilities and contingent funding lines — explicitly *not recognised*, disclosed for liquidity |

### 2.2 Cash collateral received on securities lending

Cash received against securities lent creates an obligation to return it. It is **funding**, and it
carries an NSFR consequence, so burying it in "other liabilities" understates the funding profile.

**Recommendation:** extend **B.5** to *"Repurchase agreements and cash collateral received on securities
lending"*, rather than creating a new line — the economics are identical to a repo.

### 2.3 Non-trading assets mandatorily at FVTPL

**The clearest gap, and the taxonomy simply predates IFRS 9.** A credit-linked note held in the banking
book fails the SPPI test and goes to fair value through profit or loss in its entirety — but A.3 is the
*trading book* line. Filtering A.3 on "FVTPL" silently sweeps a banking book instrument into the trading
book, which is wrong for IRRBB scope, market risk capital and disclosure.

**IFRS 7 separately requires** disclosure of financial assets mandatorily at FVTPL that are not held for
trading.

**Recommendation: new line A.3b — *Non-trading financial assets mandatorily at fair value through
profit or loss.*** Holds banking-book CLNs, structured notes failing SPPI, and non-trading equity not
FVOCI-elected.

### 2.4 Precious metals and commodities

Physical gold and commodity inventories. Not HQLA under Basel III, whatever local treatment applies.

**Recommendation:** a named sub-component of **A.15 Other assets** — *Precious metals and commodity
inventories* — unless holdings become material, in which case a separate line. Sub-component is
proportionate; the taxonomy should not carry a line for a position the bank may not hold.

### 2.5 Margin placed with exchanges and clearing houses

**Recommendation:** named sub-component of **A.15**. Note that under settled-to-market conventions
variation margin extinguishes the exposure daily and creates no balance — **only initial margin and
excess collateral produce an asset.** Systems that treat VM as a receivable overstate both the balance
sheet and the leverage exposure measure.

## 3. Bank elections — settled

Three items where more than one answer was defensible. All three decided as recommended.

### 3.1 Negotiable certificates of deposit — B.3 or B.6

The taxonomy lists NCDs in **both** B.3 (customer deposits) and B.6 (debt securities issued), with no
rule distinguishing them. **The two lines attract different NSFR available stable funding factors**, so
a booking convention currently moves a regulatory ratio.

| Option | Rule | Assessment |
|---|---|---|
| **A — Negotiability** | All negotiable CDs to **B.6**; delete B.3's NCD sub-line | **Cleaner and testable** — negotiability is a contractual fact, not a channel judgement. Risk: NCDs genuinely placed with retail or SME customers may attract lower ASF than the deposit treatment they economically warrant |
| **B — Counterparty and channel** | Placed under a deposit relationship → B.3; issued into the market via dealers or listed → B.6 | Economically truer, but "issued into the market" is a judgement that must be made consistently at booking |

**DECIDED: Option A — negotiability.** All negotiable certificates of deposit present in **B.6**, and
**B.3's NCD sub-line is deleted**.

**Consequences to implement:**

- The routing rule tests a **contractual fact** — is the instrument negotiable — so it is verifiable
  from terms rather than from a booking judgement, and cannot drift with whoever enters the deal
- **B.3's NCD sub-component is removed from the taxonomy**, which is the point: two homes become one,
  and the ratio can no longer move on convention
- **Accepted consequence:** any NCD placed with a retail or SME customer receives debt-security ASF
  treatment rather than deposit treatment. If NCD issuance to that customer segment grows materially,
  revisit — the rule is right, but its cost scales with a population that is currently immaterial
- The rule belongs in the D1 product catalogue and carries a regression corpus case
  (`classification-rules-engine` §8)

### 3.2 Trade date versus settlement date accounting

Determines where **unsettled FX spot** and unsettled securities purchases sit between trade and
settlement. IFRS permits either, applied consistently by asset category.

| Option | Effect |
|---|---|
| **Trade date** | Asset and the corresponding payable recognised at trade date. Unsettled FX spot sits as a receivable/payable pair, or is carried as a very short forward in the derivative lines |
| **Settlement date** | Nothing recognised until settlement; the value change between trade and settlement is recognised as a derivative |

**DECIDED: trade date, with unsettled FX spot carried in the derivative lines (A.3 / B.4) until
settlement.**

**Consequences to implement:**

- **Consistent with the Contract model.** An unsettled spot is economically a two-day forward, so it
  needs no special representation — it is a Contract with two currency legs, exactly as a forward is
- **The liquidity ladder sees settlement flows from trade date**, not from settlement date. This is the
  correct behaviour and it matters: the bank has committed to the flow, and a ladder that only sees it
  two days later understates near-term outflows for exactly the period a stress would bite
- **No separate in-transit presentation for unsettled FX.** Clearing and settlement accounts in A.15 and
  B.13 carry genuine in-transit items only, which keeps those lines analysable
- Applied **consistently by asset category**, as IFRS requires — the election covers unsettled
  securities purchases on the same basis
- **Confirm against existing accounting policy before implementation.** If the bank already applies
  settlement date for securities, the platform follows the existing policy and this decision is
  overridden

### 3.3 Whether new taxonomy lines are acceptable at all

§2 proposes five new lines and two sub-components. Some institutions prefer to hold the published
taxonomy fixed and carry everything additional in existing "other" lines.

**DECIDED: accept the new lines.** Four of the five are required by IFRS 7 or the liquidity regime, and
forcing them into "other assets" or "other liabilities" makes those lines unanalysable — which surfaces
later as an audit finding rather than a presentation preference.

The taxonomy is therefore extended by: **A.3b**, **D.5**, **D.6**, **D.7**, **D.8**, an extended **B.5**
title, and named sub-components of **A.15** for precious metals and for clearing house margin. **B.3's
NCD sub-line is removed** (§3.1), so the net change is seven additions and one deletion.

## 4. Design fixes, not policy

Two items in the amendment list are not accounting decisions and need no ratification.

**FVOCI splits into two enum values** — FVOCI-debt and FVOCI-equity. They behave oppositely on
impairment and recycling (`d7-accounting-and-subledger` §2.2), so a single classification value gives
the rules engine nothing to key off. A modelling correction.

**A.2 / A.5 boundary.** Both cover amounts due from banks with no stated boundary.
**Recommendation — a principled split that also serves the LCR:**

- **A.2** — balances arising from **settlement and cash management**: nostro accounts, current accounts,
  overnight and call placements
- **A.5** — **term lending to banks** under a credit facility

This aligns with the operational versus non-operational distinction the LCR already requires, so one
rule serves both presentation and the ratio.

## 5. Decision status

| # | Item | Status |
|---|---|---|
| 1 | Role-split treatment for BAs, securities lending, collateral swaps, facilities received (§1) | **Settled** — follows from recognition rules already in the design |
| 2 | Five new lines and two sub-components (§2) | **Settled** by decision 5 |
| 3 | NCD routing (§3.1) | **Settled — negotiability.** All negotiable CDs to B.6; B.3's NCD sub-line deleted |
| 4 | Trade date versus settlement date (§3.2) | **Settled — trade date**, FX spot in the derivative lines. *Confirm against existing accounting policy before implementation* |
| 5 | Whether new lines are acceptable (§3.3) | **Settled — accept.** Net: seven additions, one deletion |
| 6 | A.2/A.5 boundary (§4) | **Settled** — settlement and cash management versus term lending |

**Stage 0 acceptance test 3 is unblocked.** Every Part 1 instrument class now maps to a named Part 2
line, or is an explicit intentional non-appearance with a stated reason: internal ALM contracts
(eliminate on consolidation), collateral swaps (encumbrance only, memorandum in D.5/D.6), and facilities
received (not an asset, memorandum in D.8).

**One implementation caveat carried forward:** decision 4 is subject to confirmation against existing
accounting policy. If the bank already applies settlement date accounting for securities, the platform
follows that and the FX spot treatment is revisited alongside it.

**Application to the blueprint:** these changes land in the parent's Appendix B under the amendment
protocol as `BP-2` (`blueprint-amendment-protocol` R1a), following `BP-1`, the deferred D14 appendix
merge.

## Appendix — superseded framing

**Items 1, 2 and 6 are recommendations that follow from standards or from the liquidity regime and
should not be contentious. Items 3, 4 and 5 are the bank's to decide.**

Once all six are settled, Stage 0 acceptance test 3 can pass and `tickets/p0-14` can close.
