---
status: accepted
date: 2026-10-13
sources:
  - docs/src/data/workshop-track.ts
  - docs/src/layouts/BaseLayout.astro (Course kit, For instructors, GROUP_HREFS)
  - docs/src/pages/build-your-own.astro
  - docs/src/pages/briefs/[...slug].astro
  - docs/src/content.config.ts
  - docs/src/data/day2-done.ts
  - plan/adr/0157-the-track-is-the-navigation.md
  - plan/adr/0158-the-track-ends-on-the-kata.md
---

# ADR-0169: Day 2 joins the track, and the course kit stays open (revises ADR-0157 §1 and ADR-0158 §1)

## Status

Accepted. The numbered track is seven steps and ends on `/build-your-own`, the participant
page for Day 2. One non-track sidebar group, "Course kit", is always expanded. Recorded at
decision time.

## Context

Preparing the first cohort (end of November 2026), the owner asked on 2026-10-13 what was
still hard to find. Two answers came out of the code, not out of opinion:

- **Day 2 had no participant page.** ADR-0158 ended the track on the Day 1 kata. Everything
  a participant does on Day 2 (brief, Figma, handoff, contract and stories, iterate, verify,
  done checklist) was written only on `/schulung`, which is labelled "For instructors" and
  tells participants to skip to Setup. The briefs themselves were GitHub-only.
- **The lookups a participant needs mid-exercise were behind closed disclosures.** ADR-0157
  made every non-track group a `<details>` open only around the current page. Glossary,
  prompt rubric, guardrail demo and the rescue path are anchors inside How-To or setup
  pages, so they were never visible from the page a participant was working on.

## Decision

1. `/build-your-own` becomes step 7 of `TRACK_ORDER`. It walks Day 2 in the order of the
   `/schulung` Day 2 blocks, in the participant's voice, and links to the detail pages
   instead of repeating them. Step numbers, pager, meta line and bottom nav derive from the
   array as before.
2. The briefs render on the site at `/briefs` and `/briefs/<name>` from `workshop/briefs/*.md`
   through an Astro content collection, so the repo files stay the single source. A rehype
   plugin rewrites their relative `*.md` links to the site routes.
3. The end-of-day checklist moves to `docs/src/data/day2-done.ts` and is rendered by both
   `/schulung` and `/build-your-own`.
4. A "Course kit" group sits under the track and is always open: glossary, briefs, prompt
   rubric, guardrail demo, rescue path. Hash entries carry no active state; only the briefs
   entry, a page of its own, highlights.
5. "For instructors" now holds `/schulung`, `/runbook` (operator depth, per ADR-0168 outside
   the participant nav) and `/claude-design` (the optional trainer appendix), which leaves
   Explanation.

## Consequences

- The track ends on the day's real finish, the Day 2 checklist, instead of halfway through
  the course. ADR-0158's argument (end on an accomplishment) still holds; the accomplishment
  moved.
- The sidebar gains five always-visible links. ADR-0157's "the rest is a disclosure" now has
  one deliberate exception; the other groups stay collapsed.
- Rejected: making `/schulung` participant-facing (it carries trainer notes and timing
  rationale); linking the briefs on GitHub only (one more context switch, and GitHub renders
  them outside the docs navigation); opening every group (undoes ADR-0157's reduction).
- Weakest point: the Day 2 block summaries on `/build-your-own` are a condensation of the
  `/schulung` Day 2 data, not shared data. Only the done checklist is single-sourced; block
  times and "done when" lines can drift between the two pages, and no gate compares them.
