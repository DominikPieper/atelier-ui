# Vertical rhythm — three measured options (2026-08-26)

Produced by a five-agent census: row heights across all 29 components, line-height
census with the `* { line-height: 3 }` probe, the 2.25rem and off-scale-type
inventory, and a blast-radius measurement of the content floor per row. All pixel
figures are React-measured in headless chromium against the shipped CSS with **no
reset supplied** — the `check:geometry` fixture conditions.

**The problem.** Controls state their height (ADR-0041: `--ui-control-height-sm/md/lg`
= 32/40/48, derived padding, stated line-height). Every other text-bearing box is
content-driven, so a checkbox row is 26px, a radio row 32, a toggle row 27, a table
cell 42, an accordion trigger 52, a badge 29.5. Separately `2.25rem` is written out
ten times per framework and four type values sit off the scale.

---

## Option A — one ladder: a row is a control-shaped box

**Shape.** No new height token. `--ui-control-height-*` becomes the library's only
vertical step and its manifest intent widens from "a control" to "a control or a
row". Rows get a recipe *different* from ADR-0041's: `min-height: var(--ui-control-
height-*); padding-block: 0; line-height: var(--ui-line-height-tight)` — the height
is stated and the content is centred, not padded.

> Measured, and it corrects ADR-0041's formula for rows: a size-md table cell with
> *derived* padding (11px) renders **62.5px** when it holds an md button, versus
> **41.0px** with the block padding zeroed.

`2.25rem` is deleted rather than named: the five box-size uses per framework
(pagination button and ellipsis, menu item, combobox option, stepper circle) snap
onto 40 or 32. The two `padding-right: 2.25rem` uses in input/textarea are icon
clearance and unrelated.

**Consequences** (adopting min-height 40, block padding zeroed):

| box | now | after |
|---|---|---|
| accordion trigger | 52 | 40 (−12) |
| menu item | 36 | 40 (+4) |
| combobox option | 36 | 40 (+4) |
| table row, md | 42 | 40 (−2) |
| table sortable header | 43 | 40 (−3) |
| table row, lg | 51 | 48 (−3) |
| table row, sm | 32 | 32 (0) |
| radio row | 32 | 32 (0) |
| toggle row | 27 | 32 (+5) |
| checkbox row | 26 | 32 (+6) |
| breadcrumb item | 17 | 32 (+15) |
| pagination button, stepper circle | 36 | 32 (−4) or 40 (+4) |

**The one real gap.** A 40px control does *not* fit a 40px table row: measured
**41.0px** for a size-md cell holding an md button or an md avatar, the extra pixel
being the two collapsed cell borders. Non-table rows are exact — a menu item at
min-height 40 holding a 40px avatar measures 40.00px. So A ships a stated rule ("a
table row of step N takes controls of step N−1") plus story edits where AtlTable
currently places md controls (those rows measure 65 today).

**Determinism is not free at the root.** Measured: `.atl-table { line-height: tight }`
still leaves `tbody tr` at **67px** under the probe; stating it on `td` holds at
42.5px. Every measured box must state its own line-height — which is why Option C
below is contained in A, not an alternative to it.

**Cost.** ~118 line-height declarations across three frameworks in 26 of 29
stylesheets each, plus ~30 row-shaped boxes × 3 declarations × 3 frameworks, plus 15
literal 36px sites retired. Two new type tokens. **Zero new height tokens.**

---

## Option B — two ladders: the row is derived from the control it holds

**Shape.** Four new tokens: `--ui-row-inset: 0.25rem` and
`--ui-row-height-sm/md/lg: calc(var(--ui-control-height-*) + 2 * var(--ui-row-inset))`
= 40/48/56, plus the same two type tokens. Same recipe as A, one step up, so a
control nests inside its row with 4px of visible inset. The relation "a row is taller
than the control it holds" lives in the token instead of in a convention 30
stylesheets must honour.

**What it buys, measured.** This is the only option under which "any control goes in
any row" is true: a size-md table cell at height 48 renders **48.00px** holding plain
text, a badge, an sm button, an md button *or* an md avatar. The same cell at 40
renders 41.0px with the md button or avatar.

**What it costs.** Density on the most repeated box in an application — table rows
sm 32→40 (+8), md 42→48 (+6), lg 51→56 (+5), sortable header 43→48 (+5). Growth
elsewhere is larger than A's: checkbox 26→40 (+14), toggle 27→40 (+13), radio
32→40 (+8), breadcrumb 17→40 (+23). Shrinkage where boxes are oversized today:
accordion trigger 52→48 (−4), chat header 57→48 (−9), dialog header 72.87→56
(−16.87), drawer header 73→56 (−17).

**Escape hatch.** `--ui-row-inset: 0` collapses B onto A in one edit. Under A the
same reversal is 30 stylesheets.

**Cost.** Everything A costs, plus four tokens through five tokens.css copies, four
manifest entries, four Figma Variables — and it re-stales the parity record of every
row-owning component, because 20+ boxes move by 4px or more.

---

## Option C — state the metric, leave the height emergent

**Shape.** No height token introduced, reused or renamed. Two new type tokens so
nothing sits off the scale (`--ui-line-height-code: 1.65` for AtlCodeBlock's pre;
`--ui-line-height-none: 1` for nine literal uses per framework — though the census
measured those as **inert**, since the boxes carry explicit dimensions). One rule:
every element whose height is measured states its own line-height. Plus one reset per
framework for the native checkbox's UA `margin: 3px 3px 3px 4px` — measured, *that
margin*, not any line-height, is why the checkbox row is 26px against its own stated
`min-height: 1.5rem`.

**What it buys.** The ADR-0048 property library-wide: the **32 of 70** boxes the
census found moving under an inherited line-height stop moving, so no box's height
depends on which typeface is installed. Measured examples that stop: table md row
42→67 becomes 42.5→42.5; menu item 36→64 becomes 36→36; accordion trigger 52→80
becomes 52→52.

**What it does not buy.** Rhythm. Afterwards the rows still read 17.5 / 26 / 28 / 28
/ 32 / 36 / 36 / 40 / 42.5 / 48 / 52 / 53. "Three sibling rows, three heights" is
still three heights.

**Cost.** ~118 line-height declarations, 3 checkbox margin resets, 2 tokens. No
height token touched, no public API changed, no 36px literal retired. **It is the
strict subset that A and B both contain.**

---

## Recommendation

**Ship C first, as its own ADR. Then A.**

C is not an alternative: A and B both require every measured box to state its own
line-height, and a root-level declaration does not survive the probe. So C is the
shared prerequisite, it moves nothing by more than 4px, and it is the half of the
problem that is purely a determinism defect.

Then A, because it introduces no token at all, retires the four 2.25rem duplicates
instead of blessing them, and its worst movement is −12px on the accordion trigger
and −2 to −3px on the table. Choose **B** only if "any control fits any row" has to
hold without a convention — the price is +6px on the size-md table row.

## What only a human can decide

1. **Which step does each row family take?** A checkbox row is 26px today: 32 makes
   it +6, 40 makes it +14. Same question for radio (32→32 or 40) and toggle (27→32
   or 40). The measurements give two plausible answers and no technical argument
   between them.
2. **Must any control fit any row**, or is "a row of step N takes controls of step
   N−1" acceptable? That is the entire A-vs-B difference, and it is a product call.
3. **Is a breadcrumb a row?** It measures 17px, so a row token more than doubles it.
   It may belong to a text-baseline rhythm instead.
4. **Do headers belong to the row ladder?** Card 70, dialog 72.87, drawer 73, chat 57
   — all bands with their own padding. 48 would move the dialog header −24.87px.
5. **Does 36px die or get named?** Naming it breaks the sm/md/lg ladder that 26
   declarations per framework reference; deleting it moves five element kinds by ±4px.
6. **`height` or `min-height` for a row?** Measured: `height: 40` on a table cell
   with two wrapped lines still grows to 53.5px, and a flex menu item at `height: 40`
   holding a 40px avatar reports 40.00px while its child overflows. `min-height`
   degrades sanely, but then the row is not literally the token when content exceeds
   it.
7. **Should `--ui-line-height-none: 1` exist?** Nine of its uses were measured inert.
   Tokenising an inert value adds a manifest entry and a Figma Variable that no
   layout reads.

## A caveat the census flagged about itself

The Angular numbers in the census are **fixture artifacts** and must be ignored: its
stylesheets use `:host(...)` selectors that match nothing in a plain document. Vue
rendered identically to React on the five boxes checked in both. Angular needs
re-measuring with the `hostify` technique from `tools/scripts/check-geometry.mjs`
before any delta is committed.

---

## DECIDED 2026-08-26: Option B

The user chose **B — two ladders**. `--ui-row-inset: 0.25rem` and
`--ui-row-height-sm/md/lg` as a `calc()` over the control scale (40/48/56) are in the
token source, annotated in the manifest, and synced. `--ui-line-height-code: 1.65` is
in too, and the gate caught AtlCodeBlock's literal 1.65 the moment the token existed.

Four of the seven open questions are settled by B's shape or by measurement:

- **Which step per row family** — every row family takes the row token of its step, so
  a checkbox / radio / toggle row is `row-sm` (40), a table md row is `row-md` (48).
- **36px dies.** The five box-size uses per framework snap onto the row ladder. The two
  `padding-right: 2.25rem` uses in input/textarea are icon clearance, not heights, and
  stay.
- **`min-height`, not `height`** — measured: `height: 40` on a table cell with two
  wrapped lines still grows to 53.5px, and a flex menu item at `height: 40` reports
  40.00px while its child overflows. `min-height` degrades sanely.
- **`--ui-line-height-none: 1` is not introduced.** The census measured all nine uses
  per framework as inert (the boxes carry explicit dimensions), and tokenising an
  inert value buys a manifest entry and a Figma Variable that no layout reads.

Two were mine to decide, and both exclude a box family from the ladder:

- **A breadcrumb is not a row.** It measures 17px of inline text and holds no control,
  so B's premise — a row is taller than the control inside it — does not apply. On the
  ladder it would be +23px for nothing.
- **Headers are not rows.** Card 70, dialog 72.87, drawer 73, chat 57 are one-off bands
  with their own padding, not one line among many. `row-lg` would move the dialog
  header −16.87px. They keep their own treatment; the 20/600 type question from
  Decision G2 is still open and separate.

Both exclusions are one line in the row-recipe scope, if either turns out wrong.

