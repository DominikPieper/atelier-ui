---
status: accepted
date: 2026-11-22
sources:
  - owner, 2026-11-22 ("dass sie sich selber irgendwas überlegen sollen … worauf sie irgendwie Lust haben"; "im Zweifelsfall auch eine Möglichkeit den Skill explizit zu starten"; "wie wir folgende Übungen … entkoppelt kriegen, dass das auf jeden Fall trägt")
  - owner choices 2026-11-22: own idea as the main path with briefs as fallback; a ready reference Toast on the seat as the re-entry before Block 03/04
  - plan/adr/0194-harder-exercises-with-planted-errors.md (point 3)
  - plan/adr/0195-a-decision-history-next-to-the-component.md
---

# Day 2 builds an own idea, with re-entry points

## Status

Accepted. Corrects ADR-0194 point 3.

## Context

Day 2 runs one component through every block: a Figma set in Block 01, the decisions file, code
in Block 02, checks in Blocks 03 and 04. Until now every participant took one of four briefs
(Toast, Avatar, TagChip, StatCard) with a prepared starter frame. The owner wants participants to
build something they actually care about, and to be able to start the seat skill explicitly when
the prompt does not trigger it. A free choice raises the risk that one participant's component
stalls and drags every later exercise with it, so the later blocks must carry without it.

## Decision

1. **The own idea is the main path.** A participant invents a component that passes a fit check:
   purpose in one sentence; two variants plus one second axis (the brief scope); no data loading,
   drag and drop or stacked overlays; a name the library does not use. No idea after two minutes
   → take a brief. Own ideas are built in an own section on Workshop-Templates from library
   components and `Library Tokens`, without a starter.
2. **Decisions file header for an own idea:** `Ticket: eigene Idee`; the purpose sentence becomes
   the first entry of Art Umfang (one place per fact, ADR-0195). The seat skill asks for it.
3. **Skills can be started explicitly.** The cards say what a prompt must carry for
   `figma-workspace-architect` and `atelier-component` to load, and that `/<skill-name>` followed
   by the request starts it when in doubt.
4. **Re-entry points decouple the blocks.** W1, before the decisions file and Block 02: the Toast
   brief, the `AtlToast` master in the duplicate and `entscheidungen-beispiel.md` as a finished
   decisions file. W2, before Blocks 03 and 04: a ready reference Toast that the seat ships in
   `course/referenz/toast/`, outside the app's build and Storybook, brought in by the agent per
   the folder's README. Each affected card names its re-entry in its material line.
5. **The Block 01 recap becomes open:** how it felt to design through the agent, what went well,
   what went badly.

Rejected: a fifth "free" brief beside the four (keeps the brief as default, the owner wants the
reverse); free choice only on the skill slide (does not change the exercise); regenerating the
Toast from W1 as the Block 03 exit (10–15 minutes and can itself fail); a git branch per block on
the seat (clean, but git handling in the room and more provisioning).

## Consequences

- Participants on the own path meet none of the planted starter errors of ADR-0194; the linter on
  their set finds only what their own build left raw. The planted errors still reach brief takers
  and everyone on Day 1.
- The seat carries a reference component; it can be copied as a model in Block 02. The README
  marks it as an exit, not a template.
- Trainers must judge a fit check quickly in the room; the slide `d2-00-03a` gives the four checks.
- The reference Toast exists for Angular seats with Figma only (the workshop framework, the
  only one verified on a real seat). React and Vue seats get no `course/referenz/` folder; their
  W2 is regenerating from W1 until a verified reference exists for them.
- Unmeasured: how long an own idea takes compared with a brief and a starter.
