---
status: accepted
date: 2026-11-19
sources:
  - owner decisions, 2026-11-19 (schedule pass over both course days, this session; fifteen points decided one by one, then two follow-ups on the Day 1 lunch boundary and the Design tab)
  - tasks/todo.md, "Package E" (the fifteen decisions, the block clocks, steps E0 to E10)
  - plan/adr/0180-the-course-proves-with-standard-tools-and-the-contract-leaves-the-participant-path.md (this ADR corrects its point 6 for demo D-8 and for the Day 1 comparison, and narrows point 8)
  - plan/adr/0179-a-course-block-is-done-by-its-outcome-and-a-gate-is-the-closing-proof.md (its 2026-11-17 correction still names demo D-8)
  - plan/adr/0178-the-course-runs-on-provisioned-machines-with-a-subscription-login-in-the-room.md (Conciso machines, Conciso accounts; nobody has their own repository or Figma file in the room)
  - tasks/schulung-run-of-show.md (the block lengths before the pass)
---

# ADR-0186: Room time goes to what a participant can take to their own system

## Status

Accepted. Owner go 2026-11-19, before the rehearsal of 2026-11-23. The rehearsal measures the clocks
below; they are derived from the old run-of-show, not timed.

## Context

Four days before the rehearsal the owner asked for a rough pass over both days with two questions:
which exercises have no real value or only make sense inside the Atelier repo, and is "prepare your
own design system and Figma workspace for AI" actually covered.

The pass found three things.

- **Minutes spent on watching.** Demos D-2 (change a token by prompt), D-6 (Claude Design, trainer
  only, optional) and D-8 (parity with a section left out on purpose, trainer machine only) are
  things the trainer does while participants look on. D-2 repeats what D-1 already shows, D-6 was
  optional and tied to a tool no seat has, and D-8 ran in parallel to the participants' own parity
  run, so nobody could watch both.
- **Minutes spent on the lab instead of the transfer.** The setup block took 45 minutes on machines
  that arrive provisioned (ADR-0178). The Day 1 lint exercise broke and repaired twice. Day 1 ran
  the parity tool before anyone had learned what a design file has to carry for it to mean
  something. The workspace anatomy listed seven steps, the last of which pointed at files that only
  exist in the lab.
- **The transfer was the thinnest block.** Day 2 Block 05 gave 12 minutes to the question the
  customer pays for: what do I do on Monday with my own system. Its self-check asked participants to
  run a check prompt against their own Storybook or Figma file, and in the room nobody has either:
  every seat is a Conciso machine with a Conciso account.

## Decision

Room time goes to what a participant can take to their own design system. A demo or exercise stays
if a participant does it themselves, or if it shows something they will meet at home; it leaves if
it only works in the lab or only the trainer acts. The freed minutes go to the Figma readiness
block, the screen built from Storybook, and the transfer.

**Removed**

1. Exercise "Who do you trust?" (D1-00-09). Five minutes, nothing collected, nothing built on it.
2. Demo D-2 (D1-00-06). D-1 already makes the point that context is the variable.
3. Demo D-6. D1-BR-03 is a plain buffer.
4. Demo D-8 (D2-04-05). One sentence stays on the parity slide: a section that was not passed was
   not compared.
5. Step 7 of the workspace anatomy (D2-05-04) and the `verify.md` / review-agent line. Six steps
   remain, plus the sentence that at home the Storybook MCP on the participant's own Storybook takes
   the place of the `atelier` package.

**Shortened**

6. Day 1 Block 01 (setup) 45 to 25 minutes. "Three independent things", the preflight content and
   the recap question leave; the Claude Code basics stay.
7. The lint break-and-repair in Day 1 Block 02, 20 to 10 minutes, one pass. The `alt=""` question
   stays, because it is the one moment the exercise asks for judgement.
8. Day 2 Block 03 (iterate) 75 to 60 minutes.

**Changed**

9. Day 1 compares by eye. The card sits next to the Figma frame, participants list the differences
   and sort each into "code" or "Figma". The parity tool runs on Day 2 only, after Day 1 Block 03
   has shown what a file needs for the tool to have something to compare.
10. The rules-file exercise (Day 2 Block 00) asks for the one line the participant's own team would
    add: a command and what it proves. The delete-a-line trick is shown once by the trainer.
11. The self-check is a self-assessment. In the room each participant marks the seven scorecard rows
    from memory, picks the weakest and writes down the next step. Both checklists and the check
    prompt are explicit homework, because they need the participant's own file and Storybook. The
    customer agenda says "Selbsteinschätzung".
12. Day 2 Block 01 is split 20 / 15 / 22: draw from the starter frame, API rules with a short
    exercise on the participant's own component, handoff document.
13. Demo D-3 (Design tab) moves from Day 1 Block 04 to Day 2 Block 02, where the generated component
    first meets its design. The scaffold change that makes it possible is its own record
    (ADR-0187).

**Grown**

14. Day 1 Block 03 (is the Figma file ready?) 75 to 95 minutes. The added time shows each checklist
    row as "missing, so this is what the agent guesses".
15. Day 1 Block 05 (screen from Storybook) 80 to 95 minutes; the scorecard in the kickoff gets 5.
16. The transfer in Day 2 Block 05 goes from 12 to 27 minutes, the block from 65 to 80. It gains one
    slide without an exercise: the Storybook MCP on the own Storybook is the route that brings the
    design system's documentation to the agents of consuming teams, and the Figma linter, the
    accessibility audit and the parity check depend on the third-party figma-console-mcp.

**Clocks.** Both days still run 09:00 to 17:30 with the same lunch.

- Day 1: Block 00 25 · 01 25 · 02 80 · 03 95 · 04 75 · 05 95 · 06 15.
- Day 2: Block 03 60 · 05 80; Blocks 01 and 04 are reweighted inside their old length.
- Day 1 Block 03 is split around lunch: a 35-minute tour before (11:25 to 12:00), 60 minutes
  hands-on after (13:00 to 14:00).

## Why

- **The customer's question is the transfer.** A participant who leaves with a finished lab
  component and no idea what to change at home has been entertained. The agenda the customer
  received promises a setup that can be carried into the own repository and a concrete next step;
  12 minutes did not carry that sentence.
- **A demo costs the same minutes as an exercise and leaves less.** Each of the three removed demos
  was defensible alone. Together they were 15 minutes of watching, on two days whose common
  complaint in every review so far was that the hands-on blocks run tight.
- **A check prompt without a target teaches nothing.** The self-check as written needed a file the
  room does not have. Marking a scorecard from memory is weaker evidence, and it is evidence about
  the right system.
- **Seeing a difference comes before a tool reporting it.** On Day 1 the parity report is a wall of
  rows to people who have not yet opened a variable collection. Listing three differences by eye and
  deciding which side is wrong is the same judgement Day 2 Block 04 asks for, without the tool
  between the participant and the design.

## Rejected

- **Take the Day 1 minutes out of the day total only.** The first version of the plan balanced to
  zero over the day and broke at lunch: the morning ended at 11:25 and the afternoon ran to 18:05.
  Two other repairs were put to the owner. Lunch at 11:30 to 12:30 keeps every block whole, eats
  half the buffer and puts lunch at a different time than on Day 2. Giving the 20 setup minutes to
  Block 02 instead keeps Block 03 at 75, undoes half of point 14 and still leaves the afternoon 15
  minutes long. The split costs Block 03 one restart after lunch and keeps lunch at 12:00.
- **Keep the checklists in the room on the Atelier file.** That is the Day 1 Block 03 exercise
  already; a second pass on the lab file is the repetition this ADR removes.
- **Drop D-3 with the other demos.** It is the only one of the four that shows something a
  participant sets up at home in one line per story, so it was worth a spike (ADR-0187).
- **Keep D-8 as a slide with two screenshots.** The sentence carries the point; the pair of reports
  has never been run live and the demo script marks its output as unverified.

## Consequences

- The customer agenda changes in one sentence (Day 2, "Vorstellung und Transfer"). The tables the
  customer received are a commitment, so the owner sends the new wording. Day 1's "mit dem Design
  vergleichen" stays true: the comparison is by eye.
- Nothing in the customer agenda promised D-2, D-6 or D-8. The two demos it names (same prompt
  with and without the design system; with and without MCP) are D-1 and D-4 and stay.
- Outline, both decks, `/schulung`, run-of-show, trainer notes, demo scripts, golden prompts, the
  dry-run kit, the handouts and the seat's `course/` folder all carry block times or exercise
  texts and change with this record. The seat files need a `create-workspace` release and
  reprovisioning before 2026-11-23.
- Day 1 Block 03 now has a seam. The tour before lunch must end on a question the hands-on part
  answers, or the afternoon starts cold.
- The self-assessment produces no artefact the trainer can check. Whether participants do the
  homework is outside the course; the follow-up mail is the only lever.
- With D-8 gone, nobody in the room sees a parity report that is wrong on purpose. If the rehearsal
  shows that participants trust a clean report too easily, the sentence becomes a slide again.
- None of the clocks is measured. The rehearsal of 2026-11-23 is the first run.
