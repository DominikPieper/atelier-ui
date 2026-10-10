---
status: accepted
date: 2026-10-10
sources:
  - tasks/content-review-2026-10-10.md §4 (what belongs where), §9 decision 4
  - owner decision, 2026-10-10 (this session): 'Maintainer-Inhalte erstmal nur bei lokalem Start, nicht beim Deployment'
  - docs/src/components/MaintainerOnly.astro, docs/integrations/maintainer-pages.mjs
---

# ADR-0166: Maintainer content renders only in local dev

## Status

Accepted. Recorded at decision time.

## Context

The content review of 2026-10-10 found that most docs pages mix participant material with
maintainer material: tool gating details, ADR evidence, audit history, pipeline internals. A
participant reading `/mcp` or `/a11y-workflow` had to read past Worker deployments and a
2026-04-26 audit before reaching what they need. §9 asked where the maintainer material should
go: a `/maintainers` area on the site, or `plan/`.

The owner chose neither: the material stays on its page, next to the participant text it
explains, but it is not deployed. It shows when the docs run locally (`nx serve docs`), which is
how maintainers read them anyway.

## Decision

Two mechanisms, one per granularity:

1. **Sections**: `<MaintainerOnly>` (`docs/src/components/MaintainerOnly.astro`) renders its slot
   only when `import.meta.env.DEV` is true. In dev it draws a labelled frame ("Maintainer · local
   only") so an author sees what the deployed site will not contain.
2. **Whole pages**: the page file lives in `docs/src/pages/_maintainer/`, which Astro does not
   route (underscore prefix). The integration `docs/integrations/maintainer-pages.mjs` injects
   its route with `injectRoute` only when the command is `dev`. In `astro build` the route never
   exists: no HTML, no sitemap entry, no search index entry, no per-page `.md` for llms. Links to
   such a page (nav included) are guarded with `import.meta.env.DEV`.

The first applications: the maintainer halves of `/mcp` and `/a11y-workflow`, and `/runbook` as
a whole page.

Rejected:

- **A `/maintainers` area on the deployed site**: keeps the material public and findable by
  participants, which the owner did not want, and separates it from the text it explains.
- **Moving it to `plan/`**: loses the rendered diagrams and components, and separates it too.
- **Deleting `dist/runbook` in an `astro:build:done` hook**: by then the sitemap, the search
  index and the llms output have already picked it up.
- **A dynamic `[...slug].astro` that returns no paths in production**: works, but routes page
  content through a props indirection for no gain.
- **Moving the file outside `src/pages`**: same effect, but the gates that read
  `docs/src/pages` (`check:docs`, `check:component-count`) would stop seeing the text.

## Consequences

- The gates that read sources keep checking maintainer text. The gates that test the build
  (`check:docs-layout`, axe) no longer see it. A maintainer block is reviewed in the dev server
  or not at all.
- Every visible link into maintainer content must be guarded by hand. Nothing checks in-page
  anchors today; a gate that rejects `#for-maintainers` or `/runbook` links outside a
  `MaintainerOnly` block is a candidate follow-up.
- Participant-facing output outside the docs app can still point at a hidden page: the preflight
  script printed `/runbook#plugin-update` to participants. Such content belongs on a deployed
  page (`/troubleshooting`), not behind the guard.
- "Local only" is not access control. The text is in the public repo; the guard decides what
  the deployed site shows, nothing more.
