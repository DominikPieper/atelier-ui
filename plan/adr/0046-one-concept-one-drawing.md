---
status: accepted
date: 2026-08-26
sources:
  - tasks/design-findings-2026-08-26.md (Decision C, the `✕` glyph)
  - libs/spec/src/icons.ts (the geometry this ADR introduces)
  - plan/adr/0009-drift-gate-system.md (the gate idiom)
---

# ADR-0046: One concept, one drawing

## Status

Accepted. `libs/spec/src/icons.ts` holds the geometry for all 23 icons, AtlIcon
renders it in each framework, every component uses AtlIcon, and
`check:iconography` (gate 24) keeps it that way.

## Context

The finding was small: **AtlInput's invalid indicator was a literal `✕` in a CSS
`content:`**, not an icon, so it could never follow the icon set and Figma cannot
put an icon instance behind a pseudo-element.

Looking at it turned the finding inside out. `AtlIcon` was a **Unicode glyph map**
— `danger: '✕'`, `close: '×'`, `delete: '🗑'` — so the CSS `content: '✕'` rendered
the very same character the icon component would have. And **no component in the
library used AtlIcon at all.** Instead:

| | |
|---|---|
| AtlIcon | 21 names, Unicode glyphs, **zero internal consumers** |
| 11 components | 14 hand-written inline `<svg>`s |
| 2 stylesheets | a literal `✕` in `content:` |

Counting the shapes rather than the call sites is what makes the problem clear:

- **`close` existed four ways**: one two-line X shared by alert, chat, dialog,
  drawer and toast; a *differently drawn* X in AtlStepper (`M3 3L11 11M11 3L3 11`);
  `'×'` in AtlIcon; `'✕'` in CSS.
- **`check` existed three ways** — AtlCodeBlock's `polyline 20 6 9 17 4 12`,
  AtlCombobox's `M2 7l4 4 6-7`, AtlStepper's `M2 7L5.5 10.5L12 3.5`.
- **`chevron-down` existed two ways**, in AtlAccordion and AtlCombobox.

A design system with three checkmarks. Every gate was green, because no gate had
any notion of iconography.

Four options were considered: consolidate onto AtlIcon (chosen); deduplicate the
drawings but keep them inline (fixes the visible drift, leaves 14 inline svgs and
an unused public component, and gives Figma nothing to instance); replace only the
`✕` (closes the original finding and nothing else); or write the split down as
deliberate (names the drift and legalises it).

## Decision

**The geometry is data, in one file.** `libs/spec/src/icons.ts` maps each name to
`{ kind: 'stroke' | 'fill', paths: string[] }`. It sits beside the type contract
rather than inside it, so `index.ts` stays types-only, and `sync-spec.mjs` now
copies both files into each framework lib — the same mechanism that already kept
the spec self-contained.

Conventions, so a consumer can scale and colour any icon without knowing which one
they got: **one `0 0 24 24` viewBox** (size comes from the `size` prop, so `sm`/`md`
/`lg` are one shape at three scales), **stroke icons** at `stroke-width: 2` with
round caps and no fill, **fill icons** solid, never mixed inside one icon, and
**paths only** so each framework's renderer is a single `<path>` loop.

The seven icons the library actually uses keep the geometry the components already
shipped, normalised to 24 units. The other sixteen are authored in the same idiom —
they are public API (`AtlIconName` is exported), so leaving them as Unicode while
the rest became vectors would have made the component inconsistent with itself.

**`success` and `check` are deliberately two icons.** `success` is a status icon
and sits beside the circled danger/error/info, so it is a circled check; `check` is
the bare mark used inside controls. The first draft gave them the same path — caught
by rendering a contact sheet of all 23 and looking at it, which is also how the set
was checked at 16, 24 and 32px.

**`check:iconography` closes each door that let this happen**: `[INLINE-SVG]` — no
component source may draw an `<svg>` (only the icon component may); `[CSS-GLYPH]` —
no stylesheet may put a literal glyph in `content:`; `[NO-GEOMETRY]` /`[ORPHAN]` —
`AtlIconName` and the geometry must agree in both directions, so a name can never
render an empty svg again. All four are negative-tested. Story files are exempt:
handing arbitrary markup to a slot to show the slot takes arbitrary markup is
documentation, not the library drawing an icon.

## Consequences

- **One definition per shape.** 14 inline svgs and 2 CSS glyphs became AtlIcon
  usages across 3 frameworks; `AtlIcon` went from zero internal consumers to
  every icon in the library.
- **Icon sizes now come from the scale.** Components drew at 12, 14 and 16px ad
  hoc; they now pass `size="sm"`. Checked in context — alert close, accordion
  chevron, combobox check, code-block copy, avatar fallback, table sort, stepper —
  and the invalid indicator is now a circled `danger` icon in the danger colour,
  with the input still exactly 40px tall in both themes.
- **AtlTable's sort indicator changed shape.** It was two `<path>`s in one svg,
  styled individually; it is now two stacked AtlIcons carrying the same classes.
- **Angular needed different selectors, and that is not incidental.** Angular's
  AtlIcon styles itself through `:host` and carries no `atl-icon` class, so
  `atl-icon.icon` is the Angular form of React's `.atl-icon.icon`. Two CSS rules
  that relied on source order to win a specificity tie were also raised
  deliberately rather than left to bundle order.
- **The behaviour id `renders-glyph` became `renders-geometry`.** The manifest
  described what the component no longer does.
- **A story still draws its own svg** (AtlTable's `emptyContent` demo) and one
  hardcodes hex colours. Exempt by design for the first, worth a look for the
  second.
