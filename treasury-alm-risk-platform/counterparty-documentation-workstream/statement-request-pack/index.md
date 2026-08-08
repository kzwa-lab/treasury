---
kind: ticket
title: "Day-One Statement Request Pack"
status: 0
---

# Day-One Statement Request Pack

Ready-to-send templates for the 24-month collateral history reconstruction. Parent:
`counterparty-documentation-workstream` §5, step B — **issue across all of tiers 1, 2 and 4 on day one,
before any extraction work begins.**

## 1. Before you send — five things that decide whether this works

**1. Ask for machine-readable formats. This is the single highest-value instruction in the pack.**
Twenty-four months of PDF statements is weeks of manual transcription and a permanent source of
transcription error. CSV, Excel, MT940/MT950 or a SWIFT file is a data-loading exercise. Always state
the preferred format, always offer a fallback, and always say *why* — recipients who understand you are
loading it into a system will pick the right option.

**2. Frame it as a systems implementation, not a dispute, audit or investigation.** A request that
sounds like it questions the counterparty's records gets routed to their legal or compliance function
and slows to a crawl. A request framed as *"we are implementing a new treasury system and rebuilding
our historic data"* goes to operations and gets answered. The framing is not cosmetic; it changes who
handles it.

**3. Ask for one bulk delivery, not a month-by-month series.** Recipients will otherwise send 24
separate files, sometimes over weeks.

**4. State the exact date range with actual dates.** "The last 24 months" is ambiguous at both ends and
invites a partial response.

**5. One reply-to contact and one reference per request.** Responses arrive over weeks from multiple
institutions; without a reference the tracking log (§7) becomes guesswork.

**Send from a treasury operations mailbox, not an individual.** People move, and this correspondence
will run for months.

---

## 2. Template A — Correspondent banks (nostro statements)

**The strongest source.** Cash collateral moved through these accounts, and correspondents routinely
retain and re-supply 24 months.

> **Subject:** Historic account statement request — [YOUR BANK NAME] — ref [REF]
>
> Dear [CONTACT / Client Services],
>
> [YOUR BANK NAME] is implementing a new treasury management system and is rebuilding its historic
> transaction records as part of that work. To complete the data migration we need historic statements
> for our accounts held with you.
>
> **Accounts:** [ACCOUNT NUMBER / IBAN], [CURRENCY] — and any other accounts held in our name
> **Period:** [START DATE, e.g. 1 September 2024] to [END DATE, e.g. 31 August 2026] inclusive
>
> **Format — please note.** We are loading this into a system rather than reviewing it manually, so a
> machine-readable format saves considerable effort on both sides. In order of preference:
>
> 1. MT940 or MT950 files
> 2. CSV or Excel with one row per transaction
> 3. PDF statements (please only if 1 and 2 are unavailable)
>
> **Please send the full period in a single delivery** rather than as monthly files.
>
> Each transaction should show value date, amount, currency, counterparty or narrative reference, and
> running balance.
>
> If any part of the period is only available through an archive request or attracts a fee, please let
> us know before proceeding and we will confirm.
>
> Please reply to this address quoting reference [REF]. Any questions, contact [NAME] on [PHONE].
>
> With thanks,
> [NAME], [TITLE]
> Treasury Operations, [YOUR BANK NAME]

---

## 3. Template B — Derivative counterparties (margin and collateral statements)

> **Subject:** Historic collateral statement request — [YOUR BANK NAME] / [COUNTERPARTY] — ref [REF]
>
> Dear [CONTACT / Collateral Management],
>
> [YOUR BANK NAME] is implementing a new treasury and risk management system. As part of the data
> migration we are rebuilding our historic collateral records and would appreciate your help with
> statements for our collateralised relationship under the [ISDA Master Agreement / CSA] dated
> [AGREEMENT DATE].
>
> **Period:** [START DATE] to [END DATE] inclusive
>
> **What we need — historic collateral movements and balances:**
>
> - Collateral **movements**: value date, direction (posted by us / received by us), amount, currency,
>   collateral type (cash or securities, with ISIN for securities)
> - Collateral **balances** as at each margin call date
> - Margin call history including any disputed or partially settled calls
> - Where applicable, initial margin separately from variation margin
>
> **Format.** We are loading this into a system, so CSV or Excel with one row per movement is ideal.
> PDF statements are workable if that is all that is available. **Please send the full period in a
> single delivery.**
>
> This is a records-rebuilding exercise on our side and is not connected to any dispute or query about
> amounts previously exchanged.
>
> Please reply to this address quoting reference [REF]. Any questions, contact [NAME] on [PHONE].
>
> With thanks,
> [NAME], [TITLE]
> Treasury Operations, [YOUR BANK NAME]

**Note the third-from-last paragraph.** It exists to keep the request out of the counterparty's dispute
process, and it is worth keeping verbatim.

---

## 4. Template C — CCPs and clearing brokers

Usually the easiest and fastest responses — the data is already systematised, and often
self-serviceable from a portal before you even send this.

> **Subject:** Historic margin data request — [YOUR BANK NAME], member/account [ID] — ref [REF]
>
> Dear [CONTACT / Client Services],
>
> [YOUR BANK NAME] is implementing a new treasury and risk system and is rebuilding historic margin
> records for the migration.
>
> **Account / member ID:** [ID]
> **Period:** [START DATE] to [END DATE] inclusive
>
> **What we need, by business day where available:**
>
> - Initial margin requirement and posted initial margin
> - Variation margin flows, with direction and currency
> - Collateral composition — cash and securities, with ISIN and haircut applied
> - Any intraday or ad-hoc margin calls
> - Default fund contributions and any changes to them
>
> **Format:** CSV or Excel preferred, one row per day or per movement. If this data is available through
> a member portal or reporting service, please point us to it and we will extract it ourselves.
>
> Please reply to this address quoting reference [REF].
>
> With thanks,
> [NAME], [TITLE]
> Treasury Operations, [YOUR BANK NAME]

**Always ask whether it is self-serviceable.** For CCPs, the answer is frequently yes, and that removes
the request from your critical path entirely.

---

## 5. Template D — Custodians (securities collateral)

> **Subject:** Historic securities movement request — [YOUR BANK NAME], account [ID] — ref [REF]
>
> Dear [CONTACT / Client Services],
>
> [YOUR BANK NAME] is implementing a new treasury system and is rebuilding historic securities records
> for the migration.
>
> **Account(s):** [ACCOUNT ID]
> **Period:** [START DATE] to [END DATE] inclusive
>
> **What we need:**
>
> - All securities movements: settlement date, ISIN, nominal, direction, and movement type
>   (delivery/receipt free of payment, versus payment, **collateral pledge, collateral release,
>   substitution**)
> - Month-end holdings statements across the period
> - Where held, the encumbrance or pledge status of positions and the beneficiary of any pledge
>
> **Format:** CSV or Excel preferred; MT535/MT536/MT537 files are equally welcome if you produce them.
> **Please send the full period in a single delivery.**
>
> Please reply to this address quoting reference [REF].
>
> With thanks,
> [NAME], [TITLE]
> Treasury Operations, [YOUR BANK NAME]

**Collateral pledge and release movement types are the point of this request** — ordinary settlement
activity is not what the look-back needs. Make sure they are named explicitly, since some custodians
report them under generic movement codes unless asked.

---

## 6. Chaser template

Send at **10 business days** with no substantive response, then escalate to the relationship manager at
20.

> **Subject:** RE: [ORIGINAL SUBJECT] — ref [REF] — follow-up
>
> Dear [CONTACT],
>
> Following up on the request below, sent on [DATE]. We have a system implementation timeline that
> depends on this data, so an indication of expected turnaround would be very helpful even if the
> statements themselves will take longer.
>
> If this has reached the wrong team, please let me know who to redirect it to.
>
> [NAME]

---

## 7. Tracking log

One row per request. Maintain from the moment the first request goes out — responses arrive over weeks
from many institutions, and the coverage statement (`counterparty-documentation-workstream` §8,
deliverable 6) is built from this log.

| Field | Notes |
|---|---|
| Reference | Unique per request; quoted in every message |
| Institution and tier | Tier per parent §2 |
| Request type | A / B / C / D |
| Sent date | |
| Contact and channel | Name, email, and whether sent by portal or secure channel |
| Chaser dates | |
| Response date | |
| Format received | Machine-readable or PDF — drives downstream effort |
| **Period actually covered** | Frequently narrower than requested. **This is the field that builds the coverage statement** |
| Completeness assessment | Complete / partial / absent, with notes on gaps |
| Fee or archive request required | |
| Status | Open / partial / complete / declined |

## 8. Practical notes

**Confidentiality and channel.** Some institutions will not send historic data by ordinary email. Ask
about a secure channel in the first message where you expect this, rather than discovering it after a
refusal.

**Fees and archive requests.** Older periods may sit in archive and attract a charge. The templates ask
for notification before proceeding — decide in advance what you will approve, so a small fee does not
sit awaiting authorisation for a fortnight.

**Authority to request.** Some counterparties will only release historic data to an authorised signatory
or a named account contact. Check who that is per relationship before sending, and copy them where
needed.

**Do not narrow the period to save effort.** A shorter window seems cheaper but the look-back needs the
full 24 months, and re-requesting later means re-entering the archive queue on worse terms.

**Coverage over completeness at the peaks.** If a response is partial, prioritise chasing the periods
containing market stress or large portfolio moves. The LCR look-back is an extremum — the largest
absolute net 30-day flow — so quiet months matter far less than volatile ones
(`d10-liquidity-and-funding` §3.6).

## 9. Acceptance criteria

1. Requests issued to every tier 1, 2 and 4 institution within the first week
2. Every request carries a unique reference, a stated date range with actual dates, and a format
   preference
3. Tracking log live from the first send, recording period actually covered rather than period requested
4. Chasers at 10 business days, relationship escalation at 20
5. Fee and archive approvals pre-authorised to a stated limit
6. Coverage statement produced from the log, identifying gaps by institution and month, with stress
   periods separately assessed
