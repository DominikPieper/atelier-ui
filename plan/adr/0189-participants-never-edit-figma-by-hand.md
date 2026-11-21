---
status: accepted
date: 2026-11-21
sources:
  - owner, 2026-11-21 ("Wieso in Figma? Von Hand sollte eigentlich in Figma gar nichts gemacht werden."; asked how far the rule reaches, "Alles über den Agenten")
  - tasks/todo.md, "Follow-up package H" (the rule, the edge cases, the steps, the review)
  - tasks/lessons.md, 2026-11-21 (by-hand Figma steps written into a sheet nobody asked for)
  - tasks/reviews.md, R-277 and R-279 (the two findings whose fix carried the by-hand steps)
  - plan/adr/0188-the-exercises-prove-that-green-is-right.md (point 9, corrected by this record)
  - plan/adr/0186-room-time-goes-to-what-a-participant-can-take-to-their-own-system.md (the schedule this record leaves untouched)
---

# ADR-0189: Participants never edit Figma by hand; every write goes through the agent

## Status

Accepted. The three new participant prompts were each run headless once with Sonnet 5.5 on
the prepared duplicate before release (the Day 1 prompt twice, in two wordings). The rename
prompt gained a clause after its run (the description follows the rename) and was not run
again. No prompt has been run by a participant, and no run measured how long a person looks,
compares and steers.

## Context

The course teaches design-to-code with an agent. Until 2026-11-21 two places on the
participant path still asked for edits in the Figma UI:

- **Day 1 Block 03, micro-exercise.** One of three tasks had a prompt (bind a fill). Review
  R-279 found the other two had no instruction at all. The fix released that morning wrote
  them as UI steps: a variant value through the Design panel, Auto Layout with a keyboard
  shortcut. The steps were written from the Figma UI and never clicked through.
- **Day 2 Block 01, 09:35–09:55.** Twenty minutes of adapting a starter frame by hand,
  followed by a prompt that made the hand-drawn set machine-readable (R-277). A prompt that
  builds the set from the starter existed, as the path for a seat that fell behind.

The owner read the release report and asked why anything happens in Figma by hand. That is
the rule the course had been built on without it being written down: participants are not
there to learn the Figma UI, and several of them do not know it. The by-hand steps were a
gap filled in the wrong direction. An exercise that lacked a prompt got UI steps instead of
a prompt.

Asked how far the rule reaches, the owner chose the widest of the options: everything
through the agent, including the Day 2 design row and renames.

## Decision

1. **On the participant path, every write to Figma goes through the agent.** A participant
   never draws, edits, renames or binds in the Figma UI. What stays with the participant is
   everything that is not a write: selecting a node, looking at the canvas and the
   screenshots, reading values in the Design panel, comparing with the brief, deciding.
2. **Day 1 micro-exercise.** One prompt under the repair prompt does the variant value (a
   second variant in a component set of its own) and the Auto Layout frame (two instances,
   the gap bound to a spacing variable and then moved one step). The sheet's questions are
   about what the screenshots show.
3. **Day 2 Block 01.** The build-from-starter prompt becomes the main path of the 09:35 row.
   The rest of the row is steering: one change per prompt, a screenshot after each. The
   "make your component set machine-readable" pass at 09:55 stays, as a check after the
   steering. A rename the API rules exercise suggests is a prompt too.
4. **An exercise step without a prompt gets a prompt, or it goes.** It does not get UI
   steps. This narrows point 9 of ADR-0188, which allowed by-hand Figma steps to have no
   prompt.
5. **Trainer preparation is outside the rule.** The trainer may still do something in the
   Figma UI before the course. The rule is about what a participant is asked to do.

Rejected:

- **Keep the by-hand design row and call it "design work".** It is the one row a
  participant without Figma practice cannot do in twenty minutes, and it teaches a tool the
  course is not about.
- **Drop the two micro-exercise tasks.** Variant axis and Auto Layout are the two structures
  the Day 2 set is made of. Seeing an agent build them once, small, is the preparation.
- **By hand as the fallback when the bridge drops.** A seat without the bridge cannot run
  any later Figma step either. The fallback is to fix the bridge.

## Consequences

- The block depends on the Desktop Bridge more than before. A seat whose bridge is down
  cannot change its set at all. The trainer notes move that fix to the front.
- The 09:55 pass is thin on a set the agent built itself. In the run of 2026-11-21 it
  changed nothing and listed three things it could not bind. The sheet and the trainer
  notes say that a short "changed" list is a result. Whether twenty minutes are still the
  right size for that row is a rehearsal question; the schedule is unchanged.
- Twenty minutes of drawing became one build run and steering rounds. The agent's part of a
  steering round took under a minute in the runs. How long a person looks and decides was
  not measured, so the row may run short. The sheet opens the steering with questions that
  hold the set against the brief; a seat with nothing to change spends its time there.
- An agent does what the prompt says and no more. In the Day 1 run the new variant lost its
  fill and kept a white label, which left it unreadable on a white section. A rename on Day
  2 left the old word in a text layer and in token names. Both are written into the sheets
  as things to look for, and both are the lesson of the exercise: the participant's job is
  to look and decide. Neither will show in every run.
- Seats provisioned before this record's release carry the by-hand steps. They have to be
  provisioned again from the release that follows it.
- The briefs still say what a set "draws". That word describes the set, not who draws it,
  and stays.
