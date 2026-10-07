---
status: accepted
date: 2026-10-07
sources:
  - plan/adr/0088-one-type-scale-for-the-docs.md
  - plan/adr/0089-the-docs-css-joins-the-gates.md
  - tasks/docs-ux-review-2026-09-02.md (n13 — the page-scoped second pass that never ran)
  - tools/scripts/check-docs-layout.mjs (the `[FONT-SIZE]` check)
  - docs/src/components/DiagramFigure.astro (`.diagram-eyebrow`)
  - .impeccable/critique/2026-10-07T17-32-18Z__docs-src-pages.md (the critique that re-found it)
---

# ADR-0155: The docs type floor is measured in the browser, SVG included

## Status

Accepted. ADR-0088's role scale now covers the page-scoped and inline sizes, the React
islands and the SVG diagram text. `check:docs-layout` enforces the 12 px floor on what
renders: a `[FONT-SIZE]` finding fails the build when any visible text inside
`.docs-main-content` renders under 12 px at the 1440 px width, with SVG text scaled by its
screen transform. This revises ADR-0088 §1 (SVG text "out of this scale's reach") and
closes its §5 follow-up. Recorded at decision time.

## Context

ADR-0088 (2026-09-02) moved the shared layer onto `--ui-font-size-*` by role and left
~230 page-scoped and inline sizes as follow-up n13, with SVG diagram text "tracked
separately". Neither follow-up ran. Five weeks later an Impeccable critique of the docs
(27/40) measured the same defect ADR-0088 had been written to remove: body prose at
13.12 px on `/tokens` (an inline `font-size: 0.82rem`), 14.08 px step bodies on
`/first-component`, 58 sub-12 px labels on `/tokens`, and diagram labels on
`/design-to-code` rendering at about 7 px. A grep counted over 100 hand-typed
`0.8xrem` sizes still in `pages/*.astro`.

The decision was right and the first pass was real; what failed was that the second pass
had no gate. ADR-0088 named the guard ("`check:css-tokens` can now be pointed at
`docs/src/styles`", review n13 "could grow a `[FONT-SIZE]` twin"), but nothing pointed at
the pages, where the drift lived. A follow-up with no gate is a hope.

Two facts shaped where the guard sits:

1. **The sizes that fail are not all CSS literals.** They are inline `style` attributes,
   `fontSize` in TSX islands, `em` values that only resolve against a parent (the help
   footer's inline `code` was `0.72rem` inside 14 px text: 11.5 px), and SVG `<text>`
   whose `font-size` attribute is in viewBox units and renders at that value times
   (rendered width / viewBox width). One more trap: inside an SVG a CSS class beats the
   `font-size` attribute, so `.diagram-eyebrow { font-size: 10px }` pinned every diagram
   eyebrow at 10 user units whatever the attribute said.
2. **A stylelint rule sees one file; the rendered size joins several.** The repo's line
   (ADR-0126: one file decides it → lint rule; joins sources → gate) puts this in
   a gate. `check:docs-layout` already builds the site and renders every page at four
   widths for ADR-0089; measuring text there costs one more `evaluate` per page.

## Decision

1. **Finish the migration, by role, everywhere.** Every page `<style>` block, inline
   style and TSX `fontSize` in `docs/src` follows ADR-0088's table. Prose that merely
   re-declared a smaller size had the declaration deleted so it inherits the 16 px body,
   rather than gaining a token. No `--docs-text-*` tokens (ADR-0088 rejected them, and the
   reason still holds).
2. **SVG diagram labels are in scope.** Each diagram's `font-size` attributes were raised
   so the smallest label renders ≥12 px in the 800 px column at desktop width. Where 12 px
   no longer fitted, the diagram was re-laid out (wider boxes, two-line labels, taller
   viewBox) with copy unchanged. `.diagram-eyebrow` no longer sets a size, so the
   attribute governs.
3. **The floor is a browser check.** `check:docs-layout` gains `[FONT-SIZE]`: at 1440 px,
   every visible text node inside `.docs-main-content` must render ≥12 px. HTML text uses
   its computed size; SVG text multiplies by `getScreenCTM()` scale. Code and `pre` are
   not exempt. Elements inside `[data-type-specimen]` are skipped (the `/tokens` type
   table shows each token at its own size). Third-party-component internals that render
   smaller by the library's own design are allowlisted with a reason (`FONT_SIZE_ALLOW`,
   same shape as `COLUMN_SCROLL_ALLOW`); the first entry is `AtlAvatar`'s `aria-hidden`
   initials at `--ui-font-size-2xs` in the `xs` avatar demo.
4. **Only the widest width.** Diagrams scale down on phones by design (they sit in a
   horizontal scroller with a minimum width); checking 12 px at 375 would demand separate
   phone diagrams. The floor is a desktop guarantee for SVG, and in practice an
   every-width guarantee for HTML text, because HTML sizes do not shrink with the viewport
   here.

## Consequences

- Body copy on every docs page renders at 16 px, labels at 12 px or more, and a
  regression fails `check:docs-layout` instead of waiting for the next review.
- Pages got longer and several diagrams taller. The re-laid-out diagrams (tutorial MCP
  flow and A–E workflow, `/a11y-workflow` Venn and case study, `/figma-token`
  architecture, `/claude-design` reach) are the part a metric cannot judge; they were
  checked by screenshot, not by a design review.
- Rejected: a stylelint floor rule (sees literals only — misses `em`, inline styles in
  TSX, SVG attributes, and the class-beats-attribute case that caused the 10 px
  eyebrows); measuring at every width (forces phone-specific diagrams); exempting code
  (inline `code` at 11.5 px was one of the defects).
- Weakest point: the role classification was again made by agents reading templates,
  three in parallel over disjoint files. The gate proves the floor, not the role — a
  paragraph styled as `sm` instead of `md` passes it. The 16 px body is checked only on
  the pages the agents measured.
