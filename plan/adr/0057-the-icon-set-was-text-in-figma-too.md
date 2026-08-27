---
status: accepted
date: 2026-08-27
sources:
  - plan/adr/0046-one-concept-one-drawing.md (the geometry source this generates from)
  - plan/adr/0050-a-glyph-in-a-string-map-is-still-an-icon.md (the same defect, in TypeScript)
  - plan/adr/0055-invalid-is-not-a-colour.md (the same defect, in templates — the sixth mechanism)
  - tasks/design-findings-2026-08-26.md (J1 — "there is no Figma master for AtlIcon")
---

# ADR-0057: The icon set was text in Figma too

## Status

Accepted. The Figma icon library is generated from `libs/spec/src/icons.ts`.

## Context

The census recorded J1 as "there is no Figma master for AtlIcon, and everything now
depends on it". Looking found something else. **Twenty-one `Icon/*` components
already existed**, on their own page — and each one contained a single TEXT node
holding a Unicode character: `✓`, `⚠`, `✕`, `ℹ`, `▲`, `‹`, `⎘`, `💬`. Their frames
were 32×19 and 32×16, not square. The page's own header said it: "Pictogram glyphs
used across Atelier UI components. All bound to text/icon-sm (12 px)."

So the glyph-as-icon defect had a fourth home. ADR-0046 took it out of the CSS,
ADR-0050 out of the TypeScript, ADR-0055 out of the templates — and it was sitting
in the design source the whole time, which is the file everything is supposed to be
transferred *to*.

Four names were missing against the code's `AtlIconName`: `check`, `person`, and the
two `chevron-double-*` that ADR-0055 had just added.

## Decision

**Generate the library from the spec, and let the code's geometry be the drawing.**
Twenty-five components, one per `AtlIconName`, each a vector built from
`ATL_ICON_GEOMETRY` at `ATL_ICON_VIEWBOX` `0 0 24 24` with
`ATL_ICON_STROKE_WIDTH` 2, on a 24×24 frame. Verified: none contains a TEXT node,
every frame is square, and the set of names is **identical** to the union — checked
in both directions rather than by counting.

**Size is a frame dimension, not a variant axis.** AtlIcon renders 16 / 20 / 24, and
an instance is resized. A `name` × `size` component set would have been 75 variants
and would have fought Figma's Instance Swap, which is what the other masters' `hasIcon`
Boolean already expects — so the separate-component-per-icon shape the file already
used was right, and only its content was wrong.

**The paint stands for `currentColor`.** Each component ships the text colour and
says in its description that the instance overrides it, which is what the code does
by inheriting.

Rejected: one `AtlIcon` component set with `name` and `size` axes. It is what
`check:figma`'s naming rule would expect if AtlIcon were a snapshot master, and it
is the wrong shape for an icon library.

## Consequences

- **The four missing names exist**, so `check`, `person` and both double chevrons are
  drawable — the last of which the code had gained hours earlier.
- **The 21 glyph components were removed**, after confirming twice that nothing in
  the file referenced them: zero instances, checked once during the survey and again
  immediately before the removal. Figma's version history holds the old state.
- **The old documentation frame is marked superseded rather than deleted.** Its
  specimens are now false in every particular — the components are gone, the glyphs
  are not what renders, 12px is not the size — so its header says so and points at
  the new section. A sheet that quietly describes a superseded decision is worse than
  one that announces it.
- **J1's premise was wrong, and that is the useful part.** "There is no master" would
  have been answered by building one. What was actually there was worse than nothing:
  a complete-looking icon library made of text, which is exactly the thing three
  earlier ADRs had each removed from one layer of the code. A finding recorded from
  the code side said the design had a hole; the design had a wrong answer.
- **Open: nothing gates the Figma icon set against `AtlIconName`.** The comparison in
  this ADR was made by hand. `check:figma` reads the snapshot, and the snapshot
  captures masters from the Components page, not the Icons page — so adding an icon
  to the spec and forgetting Figma is currently invisible. Tracked in
  `tasks/todo.md`.
