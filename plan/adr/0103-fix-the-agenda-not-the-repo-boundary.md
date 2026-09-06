---
status: accepted
date: 2026-09-06
sources:
  - tasks/schulung-review-2026-09-02.md (§6.3 "Where it lives — recommendation":
    the private `atelier-trainer` repo recommendation this ADR overturns; §7's
    public/private boundary table, row `agenda:81,208` `solved-*`; I1, the
    colleagues'-names/mailbox finding this ADR reconfirms as already closed)
  - schulung-2tage-agenda.md:81 (gap-table row, reworded 2026-09-06) and the
    Folie-7 "Gefahren-Hinweise" bullet (reworded the same day) — the two places
    the agenda promised `solved-*` backup branches that do not exist
  - "git branch -a (run 2026-09-06): conciso-ds-migration, fleet-local-history,
    main, storybook-vue-parity, remotes/origin/{HEAD,main,storybook-vue-parity}
    — zero solved-* branches, confirming tasks/schulung-review-2026-09-02.md's
    same finding still holds"
  - "git grep -nIE '@(conciso|gmail|outlook)\.[a-z]+' -- . ':!node_modules' (run
    2026-09-06): zero hits" and direct reads of
    tasks/review-state-2026-08-26.md:168 and
    tasks/schulung-review-2026-08-28.md:64 (the two lines I1 flagged) — both
    already use role-only phrasing ("internal data-protection officer (DSB)",
    "internal information-security officer (ISB)"), no names, no mailbox
  - plan/ai-readiness.md (ADR-0083 → ADR-0097 supersession within five months;
    the still-open snapshot-freshness gap ADR-0019 deferred and ADR-0034
    promoted around) — cited as the same-repo evidence that gated material
    still drifts and needs a dated correction, not silent editing
  - tasks/todo.md ("Decide trainer-kit repo location", the item this ADR closes,
    and the new M11 follow-up item this ADR's Consequences section restores)
  - docs/src/pages/schulung.astro:96 and schulung-2tage-agenda.md Block 4's
    "kein Dry-Run" line (read 2026-09-06, both still exactly as
    tasks/schulung-review-2026-09-02.md's M11 finding described them) — the
    tone-not-data content this ADR explicitly does NOT close, distinguished
    from the I1 personal-data finding it does
---

# ADR-0103: Fix the agenda, not the repo boundary

## Status

Accepted.

## Context

`tasks/schulung-review-2026-09-02.md` §6.3 recommended splitting trainer-only
material (run-sheets, demo scripts, cheat sheets, `solved-*` backup branches,
the two personal-data lines) into a private `atelier-trainer` repo pinned to an
Atelier SHA, reasoning that ~20% of the kit "must not be public." That
recommendation stood as an open decision in `tasks/todo.md`
("Decide trainer-kit repo location (Schulung M11/§6.3)").

Re-checked today, prompted by a concrete symptom of the boundary question:
`schulung-2tage-agenda.md` claimed, in two places (the gap table at line 81 and
a Folie-7 "Gefahren-Hinweise" bullet), that Git branches `solved-toast`,
`solved-tagchip`, `solved-statcard`, `solved-avatar` exist as a trainer
safety net ("Teilnehmer können per `git checkout solved-<name>` springen"). They
do not — `git branch -a` lists none. That symptom raises the actual question
this ADR settles: is the fix to *move* the sensitive 20% to a second repo, or
to *correct the false claim in place*?

Re-verifying the two premises behind the original recommendation — scoped
specifically to *sensitive* (personal-data / credential-shaped) content, the
kind a private repo would actually protect, not the separate editorial
question of tone:

1. **Is anything currently in the tree actually sensitive?** The one prior,
   concrete finding in that sense (I1: two `tasks/` lines carrying colleagues'
   full names and the internal DSB/ISB mailbox) is **already closed** — both
   lines (`tasks/review-state-2026-08-26.md:168`,
   `tasks/schulung-review-2026-08-28.md:64`) now use role-only phrasing ("the
   internal data-protection officer (DSB)", "the internal information-security
   officer (ISB)"), matching ADR-0032's convention. A repo-wide grep for
   `@(conciso|gmail|outlook)\.[a-z]+`-shaped addresses returns zero hits. Nothing
   *currently* in the tree needs hiding for personal-data or credential reasons.
   **Named separately, not resolved by this check:** `tasks/schulung-review-
   2026-09-02.md`'s broader M11 finding — trainer-internal *tone*, not personal
   data, on the public page (`docs/src/pages/schulung.astro:96`'s credential-
   class remark and the fence-script/"Gegenmittel" lines around it;
   `schulung-2tage-agenda.md`'s own "kein Dry-Run" minute-arithmetic admission,
   Block 4) — is still there, verified today, still unfixed. It doesn't move
   the premise this ADR turns on (none of it is personal data or a secret), so
   it's named here rather than silently treated as closed, and left as a
   separate, still-open backlog item — see Consequences.
2. **Would a second repo actually behave better?** `plan/ai-readiness.md` —
   itself a gated, actively-drift-checked planning doc in *this* repo — has
   needed a dated correction and a full ADR supersession (ADR-0083 → ADR-0097)
   within five months of being written, and still carries an openly-admitted
   gap (the snapshot-freshness policy ADR-0019 deferred and ADR-0034 promoted
   around, still unbuilt). If material inside the 37-gate `check:all` chain
   drifts and needs correcting at this rate, a second repo with **no gates at
   all** pinned only to a SHA that nothing re-checks would drift faster, not
   slower — and the `solved-*` claim itself is the demonstration: a promise
   written once and never re-verified, sitting unnoticed for at least two
   review cycles (`tasks/schulung-review-2026-09-02.md` already named it as
   M12 and it was still wrong today).

Both premises the original recommendation rested on have weakened: the
sensitive content that motivated it is gone, and the option it recommended
trades a checked-but-imperfect single repo for an unchecked pair of them.

## Decision

**Trainer material stays in this repo. Fix false claims where they stand;
do not create a second repo to hold them.**

Concretely, applied today:

- `schulung-2tage-agenda.md:81` (gap table) and the Folie-7 bullet reworded to
  say what is true: the four `solved-*` branches do not exist yet and are
  trainer prep work, not an existing asset participants can already rely on.
- `tasks/todo.md`'s "Decide trainer-kit repo location" item closed with this
  ADR as the decision (no private repo, not now).
- `tasks/todo.md`'s M12 item (`solved-*` branches) left open for what it always
  was underneath the wording — the branches themselves still need building —
  now with the false claim no longer in the way of noticing that.

This does not reopen I1 or re-litigate whether *some future* piece of trainer
content could be sensitive enough to warrant a split; it settles only the
recommendation as it stood, against the tree as it is today.

**Alternatives considered:**

- **Private `atelier-trainer` repo pinned to an Atelier SHA** (the original
  §6.3 recommendation). Rejected now: no live content requires it, and a
  second, ungated repo is a worse home for exactly the kind of stale claim this
  ADR is fixing — nothing would have caught the `solved-*` promise there
  either, and there would be no `check:all` and no dated ADR trail pointing at
  it when someone finally noticed.
- **Gitignored folder in the clone** (§6.3's option 2). Already rejected in the
  original review for having no history and vanishing on every fresh clone the
  drift reviews run against — still true, not revisited here.
- **Do nothing / leave the recommendation open.** Rejected — an open
  recommendation with a stale, false claim sitting in the public file it was
  supposed to protect is worse than either deciding or fixing; deciding costs
  one ADR.

## Consequences

- The public agenda no longer promises a safety net that does not exist;
  anyone reading `schulung-2tage-agenda.md` today sees the branches as trainer
  prep, correctly.
- `tasks/todo.md`'s open "Decide trainer-kit repo location" item is closed;
  future reviews of this repo should stop recommending a split on the basis of
  the now-resolved I1 finding.
- The actual backlog item is smaller than the original recommendation implied:
  building four `solved-*` branches (an M-effort task, unchanged) — not
  standing up and maintaining a second repository.
- **Not closed by this ADR, named so it doesn't get lost:** M11's tone-not-data
  finding is still real — `docs/src/pages/schulung.astro:96`'s credential-class
  remark and its neighboring fence-script/"Gegenmittel" lines, and
  `schulung-2tage-agenda.md` Block 4's "kein Dry-Run" minute-arithmetic
  admission, are unchanged and still on the public page. It is not personal
  data or a secret (this ADR's premise stands), so it is not a reason to stand
  up a second repo — it is a trim-the-page editorial task, independent of the
  repo-location question. It had silently dropped out of `tasks/todo.md` during
  today's restructuring (untracked as an open item, though the content itself
  was never fixed); re-added there rather than fixed here (out of scope for
  this decision) or left untracked.
- If a genuinely sensitive piece of trainer content shows up later (a real
  budget number, a real seat count, a real credential), this ADR does not
  forbid reopening the repo-split question; it just means that question should
  be asked again from a fresh, concrete finding, not carried forward on a stale
  20%-estimate that no longer matches the tree.
