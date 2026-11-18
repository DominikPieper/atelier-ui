---
status: accepted
date: 2026-11-17
sources:
  - owner decisions, 2026-11-12 and 2026-11-17 (course walkthrough, this session)
  - plan/adr/0178-the-course-runs-on-provisioned-machines-with-a-subscription-login-in-the-room.md (this ADR corrects its open take-home question and reconciles the Day 2 leftovers it lists)
  - plan/adr/0175-day-1-block-05-screen-from-storybook.md (the block's gates stay; they leave its definition of done)
  - tasks/todo.md, "Gate weight in the course" (the audit this decision rests on)
  - tasks/lessons.md, 2026-11-12, "I let the repo's gates become the course's subject"
  - tasks/reviews.md R-235
---

# ADR-0179: A course block is done by its outcome, and a gate is the closing proof

## Status

Accepted. Recorded at decision time. The two new timings (15 minutes for one comparison with
Figma, 8 minutes for a codeSpec assembled by prompt) are estimates the R-040 rehearsal measures;
see R-235.

## Context

The repo proves its own work with gates, and its rules say so in every file an agent reads: a
gate's result is its exit code, nothing is done until a gate says so. The course material was
written inside that discipline, and the discipline leaked into the curriculum. On 2026-11-12 the
owner said it plainly: the gates are accompaniment in the course, not its goal.

An audit of the material (recorded in `tasks/todo.md`) measured how deep they sat:

- Gates were the subject of about 70 of the 820 net minutes. More than half of that was Day 2:
  30 of Block 02's 75 minutes went to a Figma snapshot and a loop on `check:contracts`, 15 of
  Block 04's 75 to assembling a `codeSpec` by hand.
- They held the definition of done in four places: Day 1 Block 05 (three or four commands with
  exit code 0), Day 2 Block 02 ("`check:contracts` is green offline"), Day 2 Block 04
  ("`storybook-test` with axe is green, and …"), and the end-of-Day-2 checklist, where five of
  eight items were commands.
- They headlined three slides, one of which taught two finding codes by name.

The cost shows in what a participant can say at the end of a block. "My check is green" is a
statement about our tooling. "My component runs in Storybook with a story per variant" is a
statement about their work, and it is the one they can repeat in their own design system, where
our gates do not exist. Day 2 Block 02 made the point sharpest: a participant could spend half
the block reading finding codes without having looked at the component they had just generated.

The same walkthrough answered the question ADR-0178 left open, how participants take the
workspace home, and went through the Day 2 sentences ADR-0178 listed as written for the old
premises.

## Decision

1. **A block's done-when names what the participant built or can now do.** A check command
   appears at most once, as the closing proof line. No slide is headlined by a gate, no slide
   lists gate names, and finding codes are not taught on slides; they stay in speaker notes,
   trainer checkpoints, fallbacks and decision rules. Slides and done-whens say "check"; "gate"
   stays a trainer-side word. The repo's own verification is untouched: this is a rule for
   course material, not for how work in this repo is proven.
2. **Day 2 Block 02 is rebuilt around the running component.** It is now "Component and stories
   from the handoff": 10 minutes for the local Storybook MCP, 40 for generating from the handoff
   document and looking at every story (three of them on the projector for the contract file
   Claude writes along), 15 for one comparison with Figma, 8 catch-up, 2 recap. The comparison
   is one pass (`figma:snapshot`, `check:contracts`, output handed back to Claude), not a loop
   until green; what is left goes into Block 03. Rule R9 moves from "30 % red on
   `check:contracts`" to "30 % without a rendering story".
3. **Day 2 Block 04 is reweighted towards the judgement.** The `codeSpec` is assembled by a
   ready prompt in 8 minutes instead of by hand in 15, and sorting the differences the parity
   report shows (code, Figma, or kept on purpose in the contract) gets 10 minutes instead of 3.
   The done-when is in outcome terms: keyboard, accessibility findings, dark mode, every
   difference sorted.
4. **The end-of-Day-2 checklist is five outcomes plus one proof line** (`/verify`), down from
   eight items. It stays one data file rendered on two pages and one slide.
5. **Day 1 changes wording only.** Block 05's done-when is the running screen and the sourced
   props; its checks stay where the participant runs them, as the closing step. Two slide titles
   and one recap question lose the gate.
6. **The sorting step is called sorting.** English material says "sort every difference", German
   slides "Abweichung einordnen"; neither says "triage", which the owner had to ask the meaning
   of. The third label stays `contract`.
7. **Participants take the workspace home as it stands on the course machine.** How it leaves
   the machine is organisational and the owner's; the material says the trainer tells them.
8. **The Day 2 leftovers of ADR-0178 are reconciled**: the prepared duplicate instead of "the
   duplicate you made", no fallback for missing draft rights, no `/figma-token` link in Day 2
   Block 01, no homework check.

Rejected:

- **Reword the done-whens and leave the minutes alone.** That fixes four sentences and leaves
  Day 2 Block 02 a block about a check with a new label on it. The minutes are what participants
  experience.
- **Drop the Figma comparison from Day 2 Block 02.** It is the first moment the generated
  component meets the design it came from, and 15 minutes buys that. Without it Block 04's parity
  report is the first contact, late in the day and with less room to react.
- **Drop the contract from the course.** It is still the only place a deliberate difference is
  written down, and Block 04's third label depends on it. It shrinks from a five-minute topic
  with its own done-when to a three-minute look at a file Claude writes.
- **Keep assembling the `codeSpec` by hand because it teaches what the report compares.** Demo
  D-8 teaches that better, in the same block, by leaving a section out on purpose.
- **Remove `/verify` from the checklist too.** One proof line costs nothing and is the honest
  bridge to how the repo works; five were the problem.

**Corrected 2026-11-17** (ADR-0180): three points above and two of the rejected options did not
survive the content review of the same day. Point 2: Day 2 Block 02 has no `figma:snapshot` and
`check:contracts` pass and no contract file on the projector; its 15 minutes go to `docs-show` on
the participant's own component and a visual comparison with the Figma component. Point 3: the
parity report and the sorting stay, demo D-8 runs on the trainer machine only. Point 6: the third
label is "kept on purpose" and points at a section of the handoff document, not at a contract.
"Drop the Figma comparison from Day 2 Block 02" and "Drop the contract from the course" were
rejected here and are, in the form ADR-0180 gives them, what the course now does: the comparison
is a look at both, and the contract is a trainer mention. The reason is the one this record was
written for, taken one step further: a check a participant does not have at home is not theirs
to learn.

## Consequences

- A participant can finish Day 2 Block 02 with a component whose comparison with Figma still
  reports differences. That is intended, and it moves load into Block 03, which was already the
  iteration block. If the rehearsal shows Block 03 cannot absorb it, the catch-up row of Block 02
  is the first place to look.
- The trainer loses a crisp, machine-readable checkpoint. "Renders in Storybook with one story
  per variant value" needs a look at each seat's screen; "exit 0" needed a glance at a terminal.
  With eight seats that is affordable, and the checks still exist for the trainer.
- The `codeSpec` prompt is new and has not been run live. If it fails in the room, the block
  falls back to the manual assembly it replaced, and the ten sorting minutes shrink again
  (R-235).
- The checklist no longer proves by itself that every check ran; `/verify` as the last line
  does, for the seats that run it. A seat that skips the proof line leaves with an outcome list
  it ticked by eye.
- The take-home answer leaves one thing open on purpose: the channel. Until the owner names it,
  the trainer-facing documents carry a `TODO(owner)`.
- Reference pages (`/design-to-code`, `/first-component`, `/a11y-workflow`) keep their gate
  content. They document the workflow; the course is no longer scripted from their emphasis.
- Weakest point: the reweighting moves 22 minutes on Day 2 on the strength of an argument, not a
  measurement. Both new timings are guesses until the rehearsal.
