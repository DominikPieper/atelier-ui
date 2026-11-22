---
status: accepted
date: 2026-11-22
sources:
  - owner, 2026-11-22 ("alle Übungen sind viel zu schnell, gerade auch wenn man die Prompts einfach kopieren kann. Das mit dem kopierenden Prompt sollten wir vielleicht weglassen"; "gleichzeitig brauche ich dann für mich aber irgendwie die Beispielprompts")
  - owner, 2026-11-22, choices: prompts off the seat entirely; trainer file plus a sentence in the speaker note; today prompts out and cards, planted error sources as a later package
  - owner, 2026-11-22, on the handoff document: "Wie sieht der Nutzer das überhaupt real? … Das klingt erstmal wie ein unnötiger Zwischenschritt … eine weitere Stelle wo etwas drin steht was auseinander laufen könnte" — then "1" (the agent drafts, the human decides) and "Ja" to the four-section, dissolving shape
  - owner, 2026-11-22: the Figma-writing exercises stay, to show that figma-console-mcp can steer and change Figma through the agent
  - measured 2026-11-22: owner's own run of the Settings Card, about 3 minutes to build and 2–3 to check, against a 55-minute exercise slot; the agent runs of 2026-11-20 (3–7 % of every slot) and 2026-11-22
  - plan/adr/0096-the-handoff-a-picture-cannot-carry.md, plan/adr/0188-the-exercises-prove-that-green-is-right.md
  - libs/create-workspace/src/generators/preset/files/course/, files/claude/skills/atelier-component/SKILL.md
---

# Task cards instead of prompts, and a handoff that dissolves

## Status

Accepted. Corrects ADR-0188 point 9 and ADR-0096's Decision (in place, same commit).

## Context

Every exercise sheet in `course/` carried the prompts a participant pastes. The owner ran the
Settings Card himself: about three minutes to build and two to three to check, in a 55-minute
slot. The agent runs agree: 3–7 % of every slot on 2026-11-20, the same on 2026-11-22 with the
German sheets. A participant who copies a prompt practises copying; the slot is empty and the
one skill the course could hand over, writing a prompt that carries source, scope, goal and
rules, is never exercised.

The handoff document had a second problem the owner named: nobody who prompts freely ever sees
one, it read like an extra step, and it held things (variants, token bindings, target files)
that also live in Figma and code, so it could drift from both.

## Decision

1. **No ready-made prompts on the seat.** Every exercise is a task card: Ziel, Material, Rahmen,
   Fertig wenn, Kür, Hängst Du fest. Rahmen keeps only what a participant cannot work out
   (safety rules, course conventions); how to tell the agent is theirs to write and is measured
   by `course/prompt-rubrik.md`, the six checks, now available from Day 1. A spec test fails if
   any generated course file contains a ```text block. A hidden folder was rejected: the
   participant's own agent reads hidden folders too.
2. **The example prompts are a trainer document,** `tasks/schulung-beispielprompts.md`, kept out
   of git (`.git/info/exclude`) because the repo is public; each exercise slide's speaker note
   names the core of a good prompt in one sentence.
3. **Kür on every card:** two or three extensions with the same material, for those who finish
   early.
4. **The handoff document is a short-lived order with four sections:** Quelle (file, node id),
   Umfang (in / bewusst draußen), Verhalten (one line, one `play`), Bewusste Abweichungen. Nothing
   Figma or code already holds. The seat's `atelier-component` skill drafts it when a build
   starts without one, fills Quelle, leaves the decisions blank and stops; the human fills them.
   At the end of Day 2 it is dissolved: Verhalten lives on as `play` tests, „Bewusst draußen“ in
   the master description and the component's JSDoc, Bewusste Abweichungen in story parameters
   or the PR description; then the file goes. No second truth is left to age.
5. **Figma stays writable in the course** (through the agent only, own duplicate or a copy;
   ADR-0189 stands): the pink test, the micro-exercise and Day 2's set-building show that the
   figma-console route can steer Figma, not only read it.

Rejected: keeping the prompts and only shortening the slots (the exercise stays copying, just
faster); a hidden solutions folder on the seat; dropping the handoff for plan mode alone (the
plan is gone after `/clear`, and Block 03 and parity lose their fixed reference); keeping the
full handoff template (variant lists and bindings duplicate Figma and drift).

Not decided here: planted design error sources in the Figma file and the new slot lengths. Both
wait for the owner's timings and a list to approve; ADR-0188 point 1 ("do not plant") stands
until then.

## Consequences

- Exercises take longer for real reasons: writing and revising a prompt, filling the handoff's
  decisions. Whether the slots now fit is unmeasured.
- The slides and notes that said „Prompt einfügen“ or „Vorlage in course/…“ change with this
  record.
- The old prompts remain in public git history, in the 0.4.23 tarball and in the English
  `tasks/schulung-golden-prompts.md`; a participant who searches finds them. The seat no longer
  hands them over.
- The repo's own `design-to-code` skill keeps its longer handoff template for repo work; this
  record covers the course seat.
- Seats must be provisioned again from the release that carries this change.
