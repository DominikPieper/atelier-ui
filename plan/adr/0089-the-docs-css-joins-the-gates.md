---
status: accepted
date: 2026-09-02
sources:
  - tasks/docs-ux-review-2026-09-02.md (B1 — 401 px shell at 375; n1 z-index; n2 breakpoints; n3 raw colours)
  - tools/scripts/check-docs-layout.mjs (the browser gate over the built docs)
  - tools/scripts/check-css-tokens.js (Pass A roster extended to `docs/src/styles`)
  - docs/src/styles/global.css (z-index bound to `--ui-z-*`; four breakpoints)
  - plan/adr/0042-*.md, 0043-*.md (`check:geometry` — the browser-gate precedent)
  - plan/adr/0086-one-reading-axis-the-shell-owns-the-width.md, 0087-the-scrollport-that-never-scrolled.md
---

# ADR-0089: The docs CSS joins the gates

## Status

Accepted. The docs site is measured by `check:all` like the library is:
`check:docs-layout` renders every built page at four widths and fails on
document overflow, column scroll, covered anchors, a fixed axe rule set and
off-scale breakpoints; `check:css-tokens` Pass A scans `docs/src/styles` for
raw colour literals; docs z-index values are the library's `--ui-z-*` tokens;
`@media` widths come from one set of four. Recorded at decision time.

## Context

The 2026-09-02 review found the docs site failing in exactly the ways the
component library is gated against — and only there. Every page was 401 px
wide at 375 (B1); the library's controls have their heights measured in a real
browser by `check:geometry` since ADR-0042, the docs' shell had never been
rendered narrower than 420. `global.css` carried ~40 raw colour literals (n3):
status badges hardcoding the dark primary, a purple for prop types, a second
cyan for framework tags, a third teal for `.docs-rule`, `#f59e0b` where
`--ui-color-warning` exists — the defect class `check:css-tokens` Pass A has
refused in `libs/` for months, with its roster stopping at `libs/*/src/lib`.
Ten hand-picked z-index values (`50/60/90/100/200/300/1000/1000`) sat next to
an unused `--ui-z-base/dropdown/overlay/modal/toast` scale (n1); the skip link
and the search dropdown both claimed 1000, and the jargon popup at 50 rendered
under the topbar at 100. Eleven distinct `@media` widths (n2) — `1383, 860,
768, 720, 719, 640, 540, 520, 480, 420` and one `min-width: 720` — of which
`640` and `768` did the work and `719/720/768` were three thresholds for one
idea; `768` was also hardcoded in JavaScript.

None of these were hard to fix. All of them were easy to reintroduce, because
nothing looked. The library's answer to that has been a gate per defect class;
the docs had none.

Two constraints shaped the gate:

- **It must not need a dev server.** `check:all` runs in CI's "Sync checks"
  job after `npm ci` with Chromium installed; it does not start Astro. The
  built `dist/docs` is a complete static site whose only obstacle is absolute
  `/_astro/` asset paths — a twenty-line `node:http` static server, not a
  build step, closes that.
- **Breakpoints cannot be tokens in CSS.** `@media (max-width: var(--bp))` is
  invalid, and `@custom-media` needs a PostCSS plugin the docs build does not
  have. So the breakpoint rule is a *set*, enforced by a static scan, not a
  variable.

## Decision

1. **`check:docs-layout`** (`tools/scripts/check-docs-layout.mjs`, in
   `check:all` after `check:docs`): serves `dist/docs` locally, opens every
   `index.html` at 1440 / 1024 / 768 / 375 in dark mode, and fails on
   `[OVERFLOW]` (document wider than the viewport), `[COLUMN-SCROLL]`
   (`.docs-main-content` scrolling at 375, with an allowlist naming the one
   library component the docs cannot fix), `[ANCHOR-COVERED]` (first TOC target
   under the sticky topbar), `[AXE:<rule>]` for a fixed rule set at 1440 and
   375 (`scrollable-region-focusable`, `target-size`, `heading-order`,
   `landmark-unique`, `color-contrast`, `page-has-heading-one`, `region`) with
   every allow entry carrying a reason, and `[BREAKPOINT]` — any `@media`
   width in `docs/src` outside `{480, 640, 768, 1383}`. It refuses to run
   without a build (`[NO-BUILD]`) rather than building silently.
2. **`check:css-tokens` Pass A** scans `docs/src/styles/global.css` and
   `docs/src/components/*.astro` alongside the library libs, with the same two
   allowances (fallbacks inside `var()`, shadows). The docs theme file
   (`docs-theme.css`) is a token source and stays out of Pass A like
   `tokens.css` does. The mac-window dots in the terminal mockup and the three
   framework brand colours are the only literals that survive, each behind an
   explicit allow with a reason.
3. **z-index** in the docs binds to the library scale: topbar and search
   dropdown → `--ui-z-dropdown` / `--ui-z-overlay`, drawer, backdrop and
   bottom nav → the overlay tier with the sidebar above the backdrop, skip link
   and scroll-progress → `--ui-z-toast`, the jargon popup → `--ui-z-overlay`
   so it clears the topbar. No literal `z-index` remains in `docs/src/styles`.
4. **Breakpoints** are four: `480` (small phones — the B1 topbar squeeze),
   `640` (single-column content), `768` (the mobile shell: drawer, bottom nav,
   also the value `BaseLayout.astro` reads via `matchMedia`), `1383` (TOC rail
   collapse, rationale already in the file). `860` and `720/719` fold into
   `768`; `540/520/420` into `480`. A comment block at the top of `global.css`
   names the set and what each threshold means; the gate keeps it true.

## Consequences

- A shell regression that widens any page at 375 — or hides a heading under
  the header, or ships a `#hex` in the docs CSS, or adds a fifth breakpoint —
  fails CI. That is the whole point; the review's three blockers were all in
  that class.
- `check:all` gains roughly two to three minutes (240 page loads, 118 axe
  runs). Accepted: the library's `check:geometry` already made the browser a
  non-optional part of the gate, and the docs are what participants read.
- Component-library defects that surface through the docs demos (review
  L1–L4: `AtlSelect` accessible name, `AtlProgress` label, checkbox hit area,
  `AtlTabs` pills at 375) are *allowlisted with a pointer*, not fixed here:
  the docs gate reports docs defects; the library has its own gates and
  backlog.
- Layout collapses that used to happen at 860 now happen at 768; three-column
  grids therefore hold 92 px longer. Checked by screenshot on the affected
  pages before the change was kept.
- Rejected: a PostCSS `@custom-media` setup (new build dependency for a
  four-value set); running the gate against a dev server (CI does not have
  one); folding the layout probes into `check:geometry` (different subject —
  controls vs pages — and a different input, fixtures vs a built site).
- Weakest point: the gate looks at one theme. Contrast is axe's `color-contrast`
  at dark only; the light theme is covered by the manual review and by the
  fact that the tokens are shared. If light-only regressions appear, the fix is
  a second theme pass, not a second gate.
