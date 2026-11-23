---
status: accepted
date: 2026-11-23
sources:
  - owner after the first live course day, 2026-11-23 ("Die Übungstexte waren nicht immer klar … dadurch, dass die Informationen komprimiert in den Markdown-Files waren, waren die Übungen auch viel zu einfach … man kann einfach nur sagen, öffne Datei so und so und arbeite es dann ab … an Tag 1 fast eine Stunde zu früh fertig")
  - plan/adr/0193-task-cards-not-prompts-and-a-handoff-that-dissolves.md (points 1 and 3)
---

# ADR-0199: Exercise instructions live on the slides, not on the seat

## Status

Accepted. Corrects ADR-0193 points 1 and 3.

## Context

ADR-0193 replaced ready-made prompts with task cards on the seat (`course/day2-karten.md` and
siblings). In the room the cards became the prompt: participants told the agent to open the
file and work through card X. The agent did, nothing went wrong, nothing had to be corrected,
there was little to learn, and Day 1 ended more than an hour early. The owner also found the
exercise texts not always clear about what to do.

## Decision

1. The seat carries no exercise instructions. The generator emits only `course/rescue.md`, the
   four briefs (the "tickets" a team would have) and, on Angular, the reference Toast. Removed:
   the course README, the briefs README, the Day 1 cards, `day2-karten.md`,
   `entscheidungen-beispiel.md`, `figma-pruefen.md`, `parity.md`, `prompt-rubrik.md`,
   `readiness-checkliste.md`. Seats already provisioned drop them with one `git rm` command.
2. Every exercise slide carries the task itself: a goal line, four or five steps, the rule that
   matters, "Fertig, wenn", and "Weiter, wenn Du fertig bist" with the extensions the cards used
   to hold. The participant writes the prompt from the slide.
3. The removed sources stay in the repo for now, unread by the generator, until the docs that
   still cite them are rewritten.

Rejected: keeping the cards and asking participants not to paste them (the agent reads the
workspace anyway); shortening slots instead (the exercise stays executing someone else's
instructions, only faster).

## Consequences

- The briefs lost the shared rules of their README; the essentials now sit on the Day 2 slides.
- `docs/src/pages/schulung.astro`, `workshop/handouts/rescue-sheet.md` and older ADRs still name
  the removed files; to be rewritten.
- Unmeasured: whether the slide-only tasks fill the slots on Day 2.
