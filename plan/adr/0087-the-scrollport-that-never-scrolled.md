---
status: accepted
date: 2026-09-02
sources:
  - docs/src/styles/global.css (`.docs-main` loses `overflow-y`, `.docs-main-content` gains `overflow-x`)
  - docs/src/layouts/BaseLayout.astro (the scroll handler, and the breadcrumb landing map)
  - plan/adr/0086-one-reading-axis-the-shell-owns-the-width.md (found while measuring for that one)
---

# ADR-0087: The scrollport that never scrolled

## Status

Accepted. `.docs-main` is not a scroll container; overflow containment moves
down to `.docs-main-content`, and the scroll handler binds the window.
Recorded at decision time.

## Context

`.docs-main` carried `overflow-y: auto`. It never scrolled: `.docs-shell` is
`min-height: 100vh` with a `1fr` content row, so the row grows to the height of
its content and the **window** is the scroll container. Measured on `/tokens` at
1600×1000: `mainScrollHeight === mainClientHeight === 3083`, while
`documentElement.scrollHeight` was 3292 against an `innerHeight` of 823.

A scrollport that never scrolls is not harmless. It broke three things, none of
which announced itself:

1. **`.docs-toc`'s `position: sticky` did nothing.** Sticky resolves against the
   nearest scrollport ancestor, which was `.docs-main` — and main never moves.
   Scrolling `/tokens` to y=1200 moved the TOC's viewport top from 227 to
   **−973**: it scrolled straight off the screen. `.docs-sidebar` is a sibling of
   main, outside that scrollport, and stuck correctly the whole time — which is
   why the defect read as "the TOC is just like that" rather than as a bug.
2. **The scroll-progress bar sat at 0%** at any scroll position.
3. **The scroll-to-top button never appeared**, its 400px threshold never met.

(2) and (3) share a cause: `BaseLayout` bound `handleScroll` to `.docs-main`'s
`scroll` event, which never fires. The code had a `window` fallback —
`else if (!window.__atelierScrollBound)` — that was unreachable, because its
condition was `mainEl` being absent and `.docs-main` is on every page. A
fallback guarding against the wrong thing.

Found while measuring for ADR-0086, not by anyone noticing.

## Decision

**Remove `overflow-y: auto` from `.docs-main` and move the containment one level
down, to `.docs-main-content`.**

`overflow-y: auto` also made `overflow-x` compute to `auto` (a `visible` value
computes to `auto` when its partner is not `visible`), and that is what had been
absorbing content wider than the reading column. Removing it surfaced 16
page/width combinations with real horizontal overflow, up to +236px, mostly at a
420px viewport — a `.docs-props-table` whose min-content width is 849px is the
representative case.

`overflow-x: auto` on `.docs-main-content` restores exactly that containment.
It works because **`.docs-toc` is main's grid sibling, not a descendant of the
content box**: the reading column can be a scrollport without the rail being
inside it. Nothing in the reading column is `position: sticky` today, so nothing
else changes.

The scroll handler now binds `window` unconditionally and resolves
`#scroll-progress` and `#scroll-top` by id **on every call** rather than closing
over them. `ClientRouter` swaps `<body>`, and the one-time `__atelierScrollBound`
guard means a single closure lives for the life of the document — a captured node
would keep being updated after the navigation that detached it. The
`bindOnce`-per-element pattern used elsewhere in that script cannot dedupe a
`window` listener, so resolving late is what makes one listener correct across
swaps.

### Alternatives rejected

- **Make `.docs-main` actually scroll** (`height: 100vh` on the shell,
  `overflow: hidden`, main as the scrollport). It would have vindicated the
  original code, but `Footer` sits in an implicit shell row *below* main, so
  constraining the shell to the viewport puts the footer permanently
  off-screen.
- **Detect the scroller at runtime** (`mainEl.scrollHeight > mainEl.clientHeight
  ? mainEl : window`). Honest about both cases, but there is no viewport where
  main scrolls — no rule gives it a definite height — so the branch would be
  dead code with a maintenance cost and a false implication.
- **Fix the 16 overflowing pages instead of re-containing them.** They are real
  responsive defects and they deserve fixing, but they are pre-existing, were
  contained before this change, and they are a separate piece of work. Turning a
  sticky-positioning fix into a twelve-page responsive audit would have buried
  it. They are recorded in `tasks/todo.md` with their measurements.
- **`overflow-x: clip` on `.docs-main-content`.** `clip` does not create a
  scroll container, so it would leave sticky alone *and* need no sibling
  argument — but it also cuts the wide content off with no way to reach it.

## Consequences

- The TOC now sticks at exactly 92px (`68px` topbar + `1.5rem`), verified by
  measurement; the progress bar tracks (20.49% at y=1000 of a 4880px range) and
  the button appears past 400px. All three verified with a real wheel scroll —
  `window.scrollTo()` driven over CDP does not dispatch a scroll event, so an
  earlier "still 0%" reading was a measurement artefact, not a defect.
- Horizontal overflow is contained in the reading column rather than in all of
  main, so the rail no longer slides with it. Verified: 0 of 116 page/width
  combinations produce a document-level horizontal scrollbar.
- The horizontal scrollbar for a wide table still appears at the bottom of the
  whole column, far from the table. That was true before at the main level and
  is not made worse here; the real fix is per-element scroll containers on the
  wide content, which is the follow-up work above.
- Anything added inside the reading column that wants `position: sticky` will
  stick to `.docs-main-content` rather than the viewport. Noted in the CSS.

## Also fixed here

The breadcrumb linked `/skills` on the two skill pages — a 404, verified by
fetch. The trail is derived from URL segments, and `pages/skills/` has no
`index`. Their real landing page is `/agent-skills`, which is where the pages'
own back-link pointed, so a `SEGMENT_LANDING` map now rewrites that crumb's name
and URL for both the visible trail and the JSON-LD `item`. The site's own
link checker never reported it: it validated 60 built pages and listed only the
18 `/storybook-*` worker routes that are absent from the static output.

With the breadcrumb correct, each skill page's hand-rolled "← Agent Skills /
`<name>`" row was duplicating it, and was also the reason those two pages were
the only prose pages without a `PageEyebrow`. Replacing the row with
`<PageEyebrow kind="reference" />` puts their `h1` at 150px from the top of
`.docs-main`, the same as every other breadcrumbed prose page. The vertical
offsets now split cleanly on one fact — 113px without a breadcrumb, 150px with
one — instead of on per-page header conventions.
