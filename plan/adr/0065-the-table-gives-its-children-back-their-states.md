---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0056-a-master-models-one-thing.md (the rule this finally satisfies for AtlTable)
  - plan/adr/0061-what-a-property-turns-on-must-be-checked-while-it-is-off.md (the allowlist this removes)
  - plan/adr/0062-a-part-promoted-to-a-master-becomes-checkable.md (the pattern these four follow)
---

# ADR-0065: The table gives its children back their states

## Status

Accepted. Adds AtlTh, AtlTd, AtlTr and AtlTbody, removes the three allowlist entries
ADR-0061 granted on credit, and refines `[LAYER-PAINT]` three times.

## Context

ADR-0056 established that a container must not declare its children's states, and
ADR-0061's `[BOOL-UNSPECED]` proved AtlTable was doing exactly that: `sortable`,
`selectable` and `empty` are fields of `AtlThSpec`, `AtlTrSpec` and `AtlTbodySpec`, none
of which `AtlTableSpec` resolves to. A `maps to` claim would have failed `[BOOL-CLAIM]`
for the right reason, so the three were allowlisted with a stated debt: *"they stay
declared only until the AtlTh / AtlTr / AtlTbody child masters exist to carry them —
building them removes the allowlist entries, not just the warning."*

Reading the specs to build them turned up a fourth: `AtlTdSpec` exists too, with `align`.

## Decision

**1. Four masters, one complete axis each.** AtlTh could have carried both of its unions
— `sortDirection` and `align` — as a 3×3 matrix for nine drawings, eight of which differ
in one text property. Instead each master is complete on the axis that is its own:

| Master | Axis | Booleans | Not modelled |
|---|---|---|---|
| AtlTh | `sortDirection` none \| asc \| desc | `sortable` | `align` — see below |
| AtlTd | `align` start \| center \| end | — | — |
| AtlTr | `selected` false \| true | `selectable` | — |
| AtlTbody | — | `empty` | — |

- **`align` lives on AtlTd**, where it is the cell's only state, and is a stated
  non-modelling on AtlTh with that reason. `AtlTableAlign` is a per-cell union with a
  container's name, which is the underlying awkwardness; the existing
  `AtlTable:name:align` allowlist entry already says so.
- **`sortDirection`'s `none` is the union's `null`.** `AtlSortDirection` is
  `'asc' | 'desc' | null`; a Figma variant value cannot be null, and "unsorted" is what
  null means. Stated in the description rather than left to be inferred.
- **`selected` is an axis, not a Boolean**, because `.is-selected td` recolours the
  **cells** and the row itself paints nothing.

**2. The table's parts are COMPOSED.** AtlTr's cells are instances of AtlTd; AtlTbody's
rows are instances of AtlTr. This is the pattern `tasks/todo.md` records as wanting and
mostly cannot have — an instance cannot gain children, so a part taking free content needs
a slot first. A table cell carries only text, so nothing blocks it here. The payoff is
that AtlTd's height, padding and rule cannot drift from AtlTr's cells: they are the same
node.

**3. AtlTable gave up the three Booleans**, and the allowlist entries are deleted rather
than merely satisfied. What remains on it: `stickyHeader`, which `AtlTableSpec` has, and
`error`, which no spec has — a known finding still recorded.

**4. Three refinements the build forced out of `[LAYER-PAINT]`:**

- **A `LAYER_ALIASES` value may be a cascade.** `.atl-tr-select-cell` declares only
  `width` and `text-align`; it inherits its background and bottom rule as a `<td>`
  through `.atl-table tbody td`. Reading the class alone reported the cell's legitimate
  fill and border as invented. A layer can be subject to more than one rule, and the
  alias now says which.
- **A layer inside an instance belongs to the child master and is skipped.** Without
  this, AtlTbody re-reported AtlTr's select cell, twice. This is composition's payoff
  inside the gate as well as in the file: a part is checked once, where it is defined.
- **The probe's category filter did not know the new prefix.** These were first named
  `Data/*`, and a plain `COMPONENT` under an unrecognised category was silently absent
  from the snapshot — the check said "carries no root paint facts" rather than reporting
  a gap. Fixed twice over: the four were renamed `Display/*` to match their parent
  (`Display/AtlTable`, and every other child master already takes its parent's category),
  and the filter gained `Data` so the class of silence is closed either way.

## Consequences

- 43 masters, `check:figma` zero errors, `check:all` exit 0. 37 carry a parity record;
  the six without one are the masters whose specs have no metadata module.
- ADR-0056's rule now holds for AtlTable with nothing on credit.
- **A gate's blind spot can look like a passing check.** A master absent from the snapshot
  produced a "no facts, re-run the snapshot" warning — advisory, easy to skim past, and
  indistinguishable from a stale snapshot. Whenever a check says data is missing rather
  than wrong, ask whether the collection step could have skipped it silently.
- A code finding, recorded rather than fixed here: `.atl-tr-select-cell` is `2.75rem`
  (44px) wide and inherits `padding-inline: var(--ui-spacing-4)` as a `<td>`, leaving a
  12px content box for an 18px checkbox. The master draws what the CSS computes, so the
  squeeze is visible in Figma — which is the transfer doing its job. Either the cell
  resets its padding or it gets wider.
