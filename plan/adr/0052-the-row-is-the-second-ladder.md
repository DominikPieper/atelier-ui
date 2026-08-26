---
status: accepted
date: 2026-08-27
sources:
  - tasks/rhythm-options-2026-08-26.md (the three measured options and the decision for B)
  - plan/adr/0041-control-height-is-the-primitive.md (the ladder this one is derived from)
  - plan/adr/0048-a-stated-height-cannot-be-content-driven.md (the property this generalises)
  - plan/adr/0051-a-reset-undoes-the-contract.md (the shorthand trap, third occurrence)
---

# ADR-0052: The row is the second ladder, and it centres rather than pads

## Status

Accepted. Applies to every row-shaped box in the library. Breadcrumbs and the four
headers are deliberately excluded — see Decision.

## Context

ADR-0041 made the control height the primitive and derived the block padding from
it. That fixed controls. It did nothing for the boxes controls sit *in*, and a
census of all 29 components measured what was left:

| box | measured |
|---|---|
| checkbox row | 26px |
| toggle row | 27px |
| radio row | 32px |
| menu item | 36px |
| combobox option | 36px |
| table cell, md | 42px |
| table sortable header | 43px |
| accordion trigger | 52px |

Three sibling rows, three heights. Worse, **32 of the 70 boxes measured moved under
an inherited line-height**: their height was decided by text metrics, so it was
decided by whichever typeface happened to be installed. That is the ADR-0048 defect,
which had already shipped a CI failure once — AtlSelect measured 40.4px locally and
40.7px on the runner.

Two things were entangled here and had to be separated. A box can be *deterministic*
(same height everywhere) and still be *arbitrary* (36px because that is what the
content came to). Fixing determinism alone leaves the rows reading 26 / 27 / 32 / 36
/ 42 / 52. Fixing rhythm alone leaves each row a different height on a different
machine.

## Decision

**A second ladder, derived from the first, and a recipe that centres.**

```css
--ui-row-inset: 0.25rem;
--ui-row-height-sm: calc(var(--ui-control-height-sm) + 2 * var(--ui-row-inset)); /* 40 */
--ui-row-height-md: calc(var(--ui-control-height-md) + 2 * var(--ui-row-inset)); /* 48 */
--ui-row-height-lg: calc(var(--ui-control-height-lg) + 2 * var(--ui-row-inset)); /* 56 */
```

The relation "a row is taller than the control it holds" lives in the token, not in
a convention thirty stylesheets have to honour. Measured: a size-md cell at 48px
renders exactly 48.00px holding plain text, a badge, an sm button, an md button *or*
an md avatar. The same cell at 40 renders 41.0px with the md button — the extra
pixel being two collapsed cell borders. Under the derived ladder, any control fits
any row of the same step; that is the property `--ui-row-inset` buys.

**A row centres; a control pads.** This is the part that is not a restatement of
ADR-0041, and it deliberately does *not* use its formula:

```css
min-height: var(--ui-row-height-md);
padding-block: 0;
padding-inline: <the inset the box already had>;
line-height: var(--ui-line-height-tight);
```

ADR-0041's derived block padding is correct for a control, whose content is one line
of its own text. Applied to a row it is wrong by construction: a size-md table cell
with 11px of derived padding renders **62.5px** when it holds an md button, because
the padding is added to a child that is already a full control tall. A row states
its height, zeroes the block padding, and lets `align-items: center` (or, in a table
cell, `vertical-align: middle`) place the content.

**Every root states its own leading.** A stated line-height on the row itself is not
enough on its own — measured: `.atl-table { line-height: tight }` still leaves the
row at 67px under the probe, while stating it on the `td` holds. So the rule runs
both ways: each measured box states its line-height, *and* each component root
states the leading its descendants inherit — `--ui-line-height-normal` where the
component carries prose, `--ui-line-height-tight` for single-line chrome. Twenty
components stated a typeface and no leading, which is half a metric.

**`height`, not `min-height`, on a table cell.** The decision record said
`min-height` and that is right everywhere except one display type: `min-height` is
not honoured on `display: table-cell`, where `height` is defined to act as a
minimum instead. Measured both — `min-height: 48` on a cell renders 18.5px;
`height: 48` renders 48px for one line and grows to 88.5px when the value wraps.
Same semantics, the property that has them on that display type.

**Excluded, on purpose:**

- **A breadcrumb is not a row.** 17px of inline text holding no control, so the
  premise — a row is taller than the control inside it — does not apply. The ladder
  would add 23px for nothing.
- **Headers are not rows.** Card 70, dialog 72.87, drawer 73, chat 57 are one-off
  bands with their own padding, not one line among many. `row-lg` would take 16.87px
  off the dialog header.
- **The pagination button and stepper circle** are square boxes on the control
  ladder, not rows.

Each exclusion is one line of scope if it turns out wrong.

Alternatives considered:

- **One ladder — a row is a control-shaped box** (Option A). Introduces no token and
  retires `2.25rem` instead of blessing it, and its worst movement is smaller. Rejected
  because "any control fits any row" then holds only by a written convention with a
  measured counter-example: a 40px row holding a 40px control renders 41.0px. B makes
  it true by construction, and `--ui-row-inset: 0` collapses B onto A in one edit —
  the reverse would be thirty stylesheets.
- **State the metrics, leave the heights emergent** (Option C). Fixes determinism and
  nothing else; afterwards the rows still read 17.5 / 26 / 28 / 32 / 36 / 42.5 / 52.
  Not rejected so much as absorbed: A and B both contain it, so it shipped as the
  same change.
- **Name 36px as a step.** Rejected: it breaks the sm/md/lg ladder that 26
  declarations per framework already reference, to keep five boxes where they are.
- **Reuse ADR-0041's derived padding for rows.** Rejected by measurement: 62.5px
  against a 48px token.

## Consequences

- **Rows on the ladder, in all three frameworks, measured:** table cells 32/42/51 →
  40/48/56, the sortable header 43 → 48, checkbox 26 → 40, toggle 27 → 40, radio
  32 → 40, accordion trigger 52 → 56, menu item and combobox option 36 → 40.
- **Density is the price.** The table row — the most repeated box in an application —
  grows 6px at md. That was the explicit trade in choosing B.
- **`check:geometry` grew from 42 to 72 measurements**, 12 components to 18, and its
  perturbation is now chosen per ladder. A control owns every element inside it and
  still faces `* { line-height: 3 }`. A row may host content the app supplies —
  AtlCheckbox and AtlToggle render their children with no wrapper of their own — so
  overriding that content's metrics would be worse than the defect. Rows face
  inherited leading instead, which is the hazard that is actually real. Content that
  is genuinely taller, a label wrapping to two lines, still grows the row and should.
- **That row probe is an absolute 100px, not a multiplier.** A factor of 3 against
  12–16px text stays inside the headroom of a 40–56px row: verified by stripping the
  line-height off a table cell, which the multiplier passed and the absolute leading
  catches.
- **`check:typeface` gained `[NO-LEADING]`**, the sibling of `[NO-TYPEFACE]`: a root
  that states a family and no leading is half a metric.
- **The shorthand trap, third occurrence.** `font: inherit` resets line-height, so a
  row that states its leading above the shorthand states nothing —
  `.atl-th-sort-btn` and the menu item both hit it. ADR-0049 found it with
  `all: unset` eating font-family, ADR-0051 gated that case. Three occurrences is a
  pattern, not a coincidence: **any longhand a shorthand can reset belongs below
  it.** `[RESET-WIPED]` covers the typeface; the equivalent for line-height is not
  gated yet.
- **Every row-owning component's parity record goes stale**, by design — 20+ boxes
  move by 4px or more. The redesign-mode banner (ADR-0044) keeps that non-blocking.
- **Open: the row ladder has no Figma Variables yet.** `--ui-row-inset` and the three
  `--ui-row-height-*` are `calc()` over the control scale, which Figma cannot express
  as a derived Variable — they will land as four resolved numbers, and the derivation
  will live only here.
