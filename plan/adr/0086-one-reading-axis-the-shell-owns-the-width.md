---
status: accepted
date: 2026-09-02
sources:
  - docs/src/styles/global.css (`.docs-main` grid, `.docs-inline-page`, the 1384px rail breakpoint)
  - docs/src/layouts/BaseLayout.astro (the `width` prop this introduces)
  - tasks/todo.md (the measurements this decision rests on)
---

# ADR-0086: One reading axis — the shell owns the page width

## Status

Accepted. `.docs-main` is a two-track grid — reading column plus a TOC rail
reserved on every page — and the column width is a `width` prop on
`BaseLayout`, never a page-level wrapper. Recorded at decision time.

## Context

The docs site had two different horizontal anchors and nobody had named either
of them, so pages drifted apart page by page:

- **Pages with a table of contents** rendered inside `.docs-main--with-toc`, a
  flex row with the default `justify-content: flex-start`. Content (800px) plus
  gap (48px) plus rail (200px) hugged the left edge and left the remainder
  empty.
- **Pages without one** had no cap on `.docs-main-content` at all, so the inner
  `.docs-inline-page` centred itself with `max-width: 800px; margin: 0 auto`.

Same 800px column, two anchors. Measured inside `.docs-main` at a 1600px
viewport: TOC pages sat at L=32 / R=497, TOC-less pages at L=265 / R=265 — a
**233px jump** whenever a reader moved between the two kinds of page. Seven
pages were on the first anchor, twenty on the second.

Two further symptoms shared the same root cause — nothing owned page width:

- The rail only collapsed at the 768px mobile breakpoint, so between there and
  ~1370px it ate the reading column instead of the gutter: 617px of column at a
  1200px viewport, **441px at 1024px** (~45 characters).
- `/mcp` (1000px) and `/components` (1280px) opted out with inline styles on
  their own wrapper `<div>`, which also skipped `.docs-inline-page`'s padding —
  their `h1` sat at 73px and 89px from the top of `.docs-main` where every
  other page put it at 113px. `/mcp` went further and nested a *second*
  `.docs-inline-page` (800px, from the `McpExplorer` island) inside its own
  1000px wrapper, so one page carried two widths.

## Decision

**The shell owns the width; the page declares intent, not geometry.**

1. `.docs-main` is a grid, `[reading column][TOC rail]`, with
   `justify-content: center`. **The rail is reserved on every page**, whether
   or not that page has a TOC. A page with a TOC and a page without now place
   their column at the same x.
2. Width is a `width` prop on `BaseLayout` — `default` (800px), `wide`
   (1000px), `full` (uncapped, rail-less). `.docs-inline-page` keeps only its
   padding; its `max-width` and auto margins are gone, so a page *cannot*
   silently cap itself any more.
3. The rail collapses at **1384px**, derived from the geometry rather than
   picked: 256 (sidebar) + 64 (`.docs-main` padding) + 800 (column) + 48 (gap)
   + 200 (rail) = 1368, plus 16px for a classic scrollbar. Below it the rail
   becomes a zero-width track and the existing in-flow `.docs-toc-mobile`
   disclosure takes over. The collapse zeroes `--docs-toc-rail` and
   `--docs-toc-gap` rather than restating `grid-template-columns`, so it cannot
   clobber the `--wide` / `--full` variants regardless of rule order.
4. `wide` and `full` carry no rail and therefore no desktop TOC.

### Alternatives rejected

- **Centre only the TOC row** (`max-width: 1048px; margin-inline: auto` on
  `.docs-main--with-toc`). One line, no other page touched — but the reading
  column still lands 124px off the axis of every TOC-less page. It halves the
  jump instead of removing it, and leaves the width question unowned.
- **Keep the column fixed and float the rail into the right gutter.** Zero
  movement on wide screens, but the gutter is narrower than 200px below a
  ~1330px viewport, so the rail would have to overlay the text or disappear —
  a second special case to maintain for the same outcome.
- **Force every page to 800px.** Maximally uniform and genuinely simpler, but
  the component gallery grid, the component detail page and the three-server
  MCP diagram are laid out for width; squeezing them would trade a real
  content problem for a cosmetic win.
- **A container query instead of a px breakpoint**, so the rail collapses when
  it actually stops fitting rather than at a number that encodes the sidebar
  width. Not possible here: the tracks are declared on `.docs-main` itself, and
  an element cannot query its own size. Revisit if a wrapper ever appears
  between the shell and main.

## Consequences

- Every `default` page — TOC or not — measures identically: column 800px,
  L=141, `h1` at x=173 (1600px viewport). Verified across 22 pages and at
  viewport widths 420 / 768 / 900 / 1024 / 1200 / 1380 / 1384 / 1440 / 1600 /
  1920.
- The twenty previously centred pages shift ~124px left, because the reserved
  rail is part of the centred track set. That is the price of a single axis and
  it is paid once, consistently.
- Crossing the 1384px breakpoint on resize still moves the column (the rail
  appears and the track set re-centres). That is inherent to a hard breakpoint
  and applies identically to every page — a resize artefact, not a
  page-to-page inconsistency.
- `wide` (`/mcp`) centres a 1000px column with no rail, so its `h1` sits 24px
  right of a `default` page's. Any width variant costs some of this; 24px was
  judged below the perceptual floor, and the alternative (giving `wide` a rail)
  pushed it to 100px.
- `full` pages (`/`, `/components`, `/components/[name]`) own their own frame
  and keep their own vertical rhythm; their `h1` top offsets still differ from
  the prose pages by design.
- New pages get the reading axis for free. Opting out now requires naming the
  intent in the `width` prop, which is reviewable, instead of an inline
  `max-width` that nobody sees.
