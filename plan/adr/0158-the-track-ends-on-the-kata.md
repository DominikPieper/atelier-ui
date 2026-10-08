---
status: accepted
date: 2026-10-08
sources:
  - docs/src/data/workshop-track.ts
  - docs/src/pages/first-component.astro (the finish block)
  - docs/src/layouts/BaseLayout.astro (sidebar groups, bottom nav)
  - plan/adr/0157-the-track-is-the-navigation.md
---

# ADR-0158: The workshop track ends on the kata (revises ADR-0157 §Status and §4)

## Status

Accepted. The numbered track is six steps and ends on `/first-component`. `/patterns` is a
reference page, reached from the kata's finish block and from the sidebar's reference
group. Recorded at decision time.

## Context

ADR-0157 made the track the primary navigation with seven steps, the last one
`/patterns`. The second critique of 2026-10-07 named the consequence as a P1: the track's
last step was a reference catalogue that ended on a "Previous" card, while the moment that
actually closes the workshop (the kata's recap and its one action) sat on step 6. A learner
following "Next" walked past the finish and arrived at a list.

Two ways out were on the table: end the track on the kata, or give `/patterns` a closing
block of its own. The owner chose the first on 2026-10-08.

## Decision

1. `TRACK_ORDER` in `workshop-track.ts` drops `/patterns`. Step numbers, "Step N of M",
   the sidebar track group, the pager and the bottom nav all derive from that array, so the
   change is one line plus whatever hard-coded the number 7.
2. The kata's finish block is the end of the track. Its single action points to
   `/patterns`, which now reads as what it is: a reference to come back to, not a lesson.
3. `/patterns` keeps its place in the sidebar under a reference group, so it stays one
   click away.

## Consequences

- The track ends on an accomplishment instead of a catalogue; "Next" on the last step no
  longer exists, and the kata's recap is the last thing a learner sees on the path.
- Rejected: a closing block on `/patterns`. It would have put the workshop's finish on a
  page whose job is lookup, and a reader arriving there from search would meet a farewell
  to a workshop they never took.
- The topbar "Workshop" link and the bottom nav mark every track page active, derived from
  the same array, so `/patterns` drops out of that state on its own.
- Weakest point: an instructor who taught "seven steps" from slides or handouts now has a
  mismatch; nothing in the repo can catch that.
