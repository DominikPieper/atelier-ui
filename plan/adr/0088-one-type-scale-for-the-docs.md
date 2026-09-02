---
status: accepted
date: 2026-09-02
sources:
  - tasks/docs-ux-review-2026-09-02.md (M3, M4 — body copy below 16 px on 30 of 40 prose pages; text below 12 px on 58 of 59 pages)
  - docs/src/styles/global.css (the remapped size declarations; the prose measure rule)
  - docs/src/components/PageHero.astro, Checkpoint.astro, and the other component `<style>` blocks
  - libs/react/src/styles/tokens.css (`--ui-font-size-xs/sm/md/lg`)
  - docs/src/pages/tokens.astro (the typography-scale table that already names the roles)
---

# ADR-0088: One type scale for the docs — the library's

## Status

Accepted. The docs site sets text sizes only through the library's
`--ui-font-size-*` tokens; running prose is `md` (16 px), secondary text `sm`
(14 px), labels `xs` (12 px), and nothing that carries information goes below
`xs`. Running prose is capped at 70ch. Recorded at decision time.

## Context

The docs site was measured, not read, for the first time on 2026-09-02
(`tasks/docs-ux-review-2026-09-02.md`). Of 40 prose pages, the first long
paragraph rendered at 16 px on 9, at 14.4 px on 19, at 13.6 px on 7 and at
13.12 px on 3 — identical at 375 px, because nothing bumps type on phones.
58 of 59 pages carried text under 12 px, most of it uppercase with 0.06–0.12em
tracking. `global.css` alone held ~150 `font-size` declarations below `1rem`,
the components another ~50, the pages' own `<style>` blocks and inline styles
~230, React islands ~55 — roughly 500 places where a size was typed in by hand,
in eleven distinct values between 0.6rem and 0.95rem.

Two things made this a decision rather than a cleanup:

1. **The scale already exists and is already documented for exactly these
   roles.** `libs/react/src/styles/tokens.css:34-45` defines
   `--ui-font-size-2xs … 3xl`; `docs/src/pages/tokens.astro:75-80` documents
   `xs` as "labels, captions, eyebrows", `sm` as "secondary text, table
   cells", `md` as "default body copy", `lg` as "emphasized body, sub-heading".
   The docs preach a scale on one page and hand-type sizes on the other 58.
2. **The reading column is a shell decision, not a type decision.** ADR-0086
   gave every page an 800 px column with a reserved TOC rail. At 16 px that is
   ~100 characters per line (~125 on `--wide`); the guideline range is 60–75.
   Narrowing the column would break the cards, tables and code blocks that use
   its full width; the prose inside it is what needs the cap.

The obvious alternative — a docs-private scale (`--docs-text-*`) — would have
created a second source of truth for a scale the library already owns and
already renders in every component the docs embed.

## Decision

1. **Reuse, don't mint.** Every `font-size` in `docs/src` that is not code,
   an icon glyph, a button, or a card/tile title maps to one of four library
   tokens by *role*, decided by what the class styles (read in the template),
   not by its current value:

   | role | token | px |
   |---|---|---|
   | running prose — paragraphs, list items, step and card body copy, ledes, checkpoint text, fix steps | `--ui-font-size-md` | 16 |
   | secondary — descriptions under a title, captions, meta lines, nav and TOC items, breadcrumbs, table cells | `--ui-font-size-sm` | 14 |
   | labels — eyebrows, chips, badges, code-language tags, bottom-nav labels, uppercase section headings inside nav | `--ui-font-size-xs` | 12 |
   | emphasized body / h3 tier | `--ui-font-size-lg` | 18 |

   Code (`.docs-prop-*`, terminals, `pre`), buttons, icon glyphs and the short
   card/tile titles at 0.86–0.95rem keep their sizes: they are neither prose
   nor labels, and forcing them onto the four steps would move them in the
   wrong direction. SVG `<text>` inside diagrams is sized in viewBox units and
   scales with the figure; it is out of this scale's reach and is tracked
   separately (review M2/M4).

2. **12 px is the floor for anything that carries information.** No declaration
   below `--ui-font-size-xs` survives outside code and decorative glyphs.
   Tracking above 0.06em is dropped on anything that lands at `xs`; uppercase
   plus wide tracking at 10 px was the least legible pattern on the site.

3. **Prose gets a measure; the column keeps its width.** Inside
   `.docs-main-content`, running-prose elements (`p`, `li`, `dd`, `blockquote`
   in prose contexts) are capped at `max-width: 70ch`. Tables, code, cards,
   grids and hero blocks are exempt — they own their own width. The 800 px
   column stays; what changes is the line length of the sentences in it.

4. **Dead rules go, not remap.** Five prose classes with zero template uses
   (`.docs-home-section-sub`, `.docs-feature-card-desc`, `.docs-protocol-step-desc`,
   `.docs-shortcut-desc`, `.docs-orient-card-desc`) are deleted. Two the audit
   had also called dead — `.docs-help-footer-desc`, `.docs-help-footer-link-desc`
   — turned out to be live in `HelpFooter.astro` and were remapped (`md`, `sm`)
   instead; the grep before the delete is what caught it.

5. **Scope of the first pass** is the shared layer: `global.css` and
   `docs/src/components/*.astro`, plus the running-prose hot spots in page
   styles that the review named (`troubleshooting.astro` fix steps,
   `tutorial.astro` and `first-component.astro` run steps). The remaining
   ~230 page-scoped and inline sizes are a follow-up (review n13), because
   each is a one-off edit and the shared layer is where 20-page classes like
   `.docs-page-hero-lede` live.

## Consequences

- Body copy on every prose page is 16 px on every device; the lede on 20
  pages goes from 14.4 to 16 px; step descriptions on 9 pages and the
  component-page prose on all 57 component pages from 13.1–13.6 to 16 px.
  Pages get longer. That is the point.
- Labels that were 9.6–11.5 px become 12 px; the visual rhythm of eyebrows
  and chips tightens slightly because the tracking comes down with the size.
- A future `--ui-font-size-*` change in the library moves the docs with it —
  the docs stop being a second typography system next to the components they
  document (ADR-0035 made the same move for the typeface).
- `check:css-tokens` can now be pointed at `docs/src/styles` for `font-size`
  literals the same way it guards the library (ADR-0089 does that).
- Rejected: a docs-private `--docs-text-*` scale (second source of truth for
  values the library already owns); narrowing `--docs-content-col` to ~600 px
  (breaks the wide artefacts the column exists for); a mobile-only bump via a
  media query (fixes the phone, keeps 13 px prose on the desktop where the
  measurements were taken).
- Weakest point: the role classification was made by reading templates once,
  by an agent, and spot-checked. A class that styles both a caption and a
  paragraph will have landed on one side; the before/after screenshots at
  1440 and 375 on six pages are the check, not a proof.
