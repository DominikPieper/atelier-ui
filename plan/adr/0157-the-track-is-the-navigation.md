---
status: accepted
date: 2026-10-07
sources:
  - docs/src/layouts/BaseLayout.astro (sidebar groups, bottom nav)
  - docs/src/components/PageMeta.astro (was PageEyebrow.astro)
  - docs/src/data/workshop-track.ts
  - plan/adr/0156-the-home-shows-the-loop-not-decoration.md
---

# ADR-0157: The workshop track is the navigation; the rest is a disclosure

## Status

Accepted. The sidebar shows the seven workshop steps expanded. The other groups (For
instructors, How-To, Reference, Explanation) are native `<details>` that open only when
they hold the current page. Pages no longer open with an eyebrow row. A quiet meta line
below the H1 carries the reading time and, on track pages, "Step N of 7 · Next: … →". On
track pages the mobile bottom nav is Previous / Step / Next. Recorded at decision time.

## Context

The 2026-10-07 critique counted 25 sidebar links in five equal-weight groups, with the
seven steps an attendee is there for carrying the same weight as 18 reference links. Every
page opened with a row above its H1: a Diátaxis kind pill ("HOW-TO" in an orange used
nowhere else, "EXPLANATION"), the time, and "Step N of 7". ADR-0156 adopted the craft
floor's rule against kicker labels above headings, and the kind words are a documentation
theory's vocabulary that the reader does not need. The product name also drifted ("Technical
Atelier" in the sidebar, "Atelier Workshop" in the logo), as did the label for `/figma`, and
the components sidebar offered two different "back" links. On phones, the bottom nav
repeated the topbar instead of moving the learner on, and it shared the label "Primary"
with the topbar.

## Decision

1. **The track is primary.** `workshop-track.ts` stays the single source. Its group is
   always expanded and visually first. Every other group is a `<details>` whose `open`
   state comes from the current path, through one `GROUP_HREFS` map shared by markup and
   the client-side `aria-current` sync, so a client navigation into a closed group opens it.
2. **Meta, not eyebrow.** `PageEyebrow` became `PageMeta`, rendered by `PageHero` after the
   H1 and lede: a muted line with no uppercase and no pill. The Diátaxis kind stays as
   sidebar grouping only.
3. **One name per thing.** "Atelier Workshop" everywhere, "Figma workflow" for `/figma`
   on every nav surface, and one "Return to workshop" in the components sidebar.
4. **The phone moves you on.** On track pages the bottom nav is Previous / Step N of 7 /
   Next with the label "Workshop steps". Elsewhere it keeps four quick links labelled
   "Quick links".

## Consequences

- On `/design-to-code` the visible sidebar links drop from 24 to 7. Reference pages remain
  one click away, and the group holding the current page is always open.
- A group a reader opens by hand closes again on the next client-side navigation, because
  the sidebar is server-rendered per page. Accepted. Persisting it would add client state
  for a convenience.
- `PageHero` no longer takes `kind`. A page that wants its Diátaxis type visible has no
  place for it now. That is deliberate.
- Rejected: hiding non-track groups entirely on track pages (strands a learner who needs
  troubleshooting mid-step); keeping the eyebrow without the pill (still a label above the
  heading).
- Weakest point: keyboard and screen-reader operation of the `<summary>` toggles rests on
  native `<details>` behaviour; it was exercised by script, not with a real screen reader.
