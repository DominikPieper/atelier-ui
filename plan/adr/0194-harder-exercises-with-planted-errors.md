---
status: accepted
date: 2026-11-22
sources:
  - owner, 2026-11-22 ("lasst uns jetzt eben die komplexeren Beispiele das Paket erst fertig bauen"; "Ob das jetzt eine Settings Card oder eine Settings Seite ist, ist am Ende wahrscheinlich irrelevant"; "Ja gebe ich frei" for the list of planted errors)
  - owner, 2026-11-22, on slide 30: the readiness exercise targets the new page; handouts as a printable PDF
  - measured 2026-11-22: owner's Settings Card run (~6 of 55 minutes); the agent runs of 2026-11-20 and 2026-11-22 (linter on AtlButton and on the own set: 0 findings; readiness checklist: nearly every row passes)
  - /private scratchpad figma-build-2026-11-22 report (node ids, fingerprint: only Workshop-Templates changed, 69 → 279 nodes)
  - plan/adr/0188-the-exercises-prove-that-green-is-right.md (point 1, "re-aim, do not plant")
  - plan/adr/0193-task-cards-not-prompts-and-a-handoff-that-dissolves.md
---

# Harder exercises, with planted errors

## Status

Accepted. Corrects ADR-0188 point 1 (in place, same commit).

## Context

ADR-0193 took the ready-made prompts off the seat, but left the subjects as they were: a card of
four components, a team table, starters with every value bound. With nothing wrong in the
material, the checks the course teaches had nothing to find. Both runs showed it: the Figma linter
on the AtlButton master and on the participant's own set returned 0 findings, and the readiness
checklist passed nearly every row. ADR-0188 had rejected planting errors because the exercises
should prove that green is right; the owner now wants material that gives the checks something
real to find, on top of the "green is not right" exercises.

## Decision

1. **Day 1 Block 02 builds a settings page,** not a card: frame „Settings / Seite“ (and a Dark
   twin) on Workshop-Templates, three groups, about eight library components, four behaviour lines
   (save disabled until a change, invalid e-mail error, cancel resets, success alert). The customer
   agenda's "Einstellungs-Karte" is read loosely (owner).
2. **Six planted errors in that frame,** found by the pink test, the linter or comparison: a raw
   14 px gap, a raw near-primary hex, a detached "Abbrechen", a text without a text style, a Dark
   surface left light, a label named differently from the brief. Day 1 Block 03 (pink test,
   linter, readiness checklist, micro-exercise) now runs on this frame.
3. **The four Day 2 starters carry two planted errors each** (a raw near-token colour, an off-grid
   padding or gap), in place: the repo snapshot records only id, name and section for these frames.
   The linter on the participant's own set now has findings.

   **Corrected 2026-11-22** by [ADR-0196](0196-day-2-builds-an-own-idea-with-re-entry-points.md): the
   own idea is now the main path on Day 2 and the briefs are the fallback, so only participants who
   take a brief build from a starter and meet these errors.

4. **The Team directory brief is harder:** sorting, a row menu, a detail drawer with focus return,
   multi-select with a disabled "Entfernen", an empty state with an action. Two real traps stay
   unannounced: no story pairs table and pagination (5 rows per page must be computed), and table
   rows are not focusable, so the drawer's focus return lands on `body` unless asked for.
5. **Every brief names one open question** only the handoff document can settle.
6. **The planted errors are listed only in the trainer file** (git-excluded) and in speaker notes;
   participant text, visible slides and Figma descriptions never name them.
7. **Course files renamed** to match their content: `day2-karten.md`, `parity.md`,
   `figma-pruefen.md`; the readiness checklist is on the seat (`course/readiness-checkliste.md`);
   the printed handouts are German and built to PDF.

Rejected: a whole new Figma file for the course (the master stays the single source participants'
copies come from); describing the planted errors in the Figma file (it would hand over the answer);
keeping the four-component card and only adding Kür items (the checks would still find nothing).

## Consequences

- The master Figma file now contains deliberate defects on Workshop-Templates. Copies for
  participants must be made after this change; the trainer file is the key.
- The docs line that every starter value is bound was corrected; the Figma instruction text on
  Workshop-Templates was rewritten neutrally.
- Slot lengths are still unmeasured for the harder material; the owner's timings decide them.
- Old example prompts and run findings in the trainer file refer to the card and the Button
  master; they are marked as such until a run on the new material exists.
