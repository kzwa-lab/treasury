# P0-01 — Bitemporal Reference Data Core

**Wave 1. Depends on P0-11.**

Governing artifacts: `d1-reference-and-static-data` §2, §3.1–3.7, §4.

## In scope

**The bitemporal framework first** — every D1 entity carries effective date and knowledge date
independently, a correction creates a new version and never edits one, and every consumer read is
version-addressable. This is the module's hardest requirement and the reason it is a ticket rather than
a data-loading exercise.

Seven data domains:

| Domain | Content |
|---|---|
| Legal entity & organisation | Entities, books, portfolios, desks; book → entity and book → regulatory book intent mapping |
| **Counterparty & customer master** | **Three separate groupings — legal entity, economic group, connected clients.** Plus identifiers, sector, ratings, counterparty type, **deposit insurance status per depositor**, operational relationship designation |
| Product catalogue | Terms payload schema per family, permitted leg structures, structured product tier, default classification rules, **GL mapping including the Part 2 routing rules**, product-approval flag |
| Calendars & conventions | Holiday and settlement calendars, business day conventions, day counts, roll conventions, settlement cycles, cut-offs |
| Index & benchmark definitions | Source, publication lag, tenor, day count, **compounding/averaging convention, observation shift**, fallback waterfall |
| Currency | Codes, precision, rounding, **restriction status** (non-deliverable, capital-controlled, pegged) |
| GL chart & mapping | Chart of accounts; product/event → GL account; GL account → Part 2 line |

Plus **golden source designation** per attribute, and the §4 governance controls via P0-11.

## Out of scope

- Legal agreements and netting sets — P0-02
- Classification rule set *storage schema* is here; rule *content* is P0-15, engine is P0-06
- Market data values — P0-04. **Index definitions are here; index values are not**

## Acceptance criteria

1. A correction creates a version; the original remains and historic reads reproduce
2. Every read is version-addressable by effective and knowledge date
3. The three counterparty groupings are separately modelled and independently queryable
4. Deposit insurance coverage is computable per depositor across accounts and products
5. Every attribute has a declared golden source
6. SSI changes require the higher control tier; retroactive-effect changes require an impact statement
7. A product can be added — schema, GL mapping, default classification — without code change

## Notes

**The three counterparty groupings are the highest-risk simplification.** A single "parent counterparty"
field reports concentration correctly and large exposures incorrectly, or the reverse. They are three
trees over one population and must be built as three.

**Index definitions must be precise enough that P0-05 can handle partial observation** of a
compounded-in-arrears period. Two banks using "SOFR compounded" with different observation shifts
produce different cashflows on identical trades.
