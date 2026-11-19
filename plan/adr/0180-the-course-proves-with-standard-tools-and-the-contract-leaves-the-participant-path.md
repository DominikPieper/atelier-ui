---
status: accepted
date: 2026-11-17
sources:
  - owner decisions, 2026-11-17 (content review of the two course days, this session)
  - plan/adr/0179-a-course-block-is-done-by-its-outcome-and-a-gate-is-the-closing-proof.md (this ADR revises its points 2, 3 and 6 and two of its rejected options)
  - plan/adr/0175-day-1-block-05-screen-from-storybook.md (the block's closing step stays; the agent runs it)
  - plan/adr/0178-the-course-runs-on-provisioned-machines-with-a-subscription-login-in-the-room.md (subscription logins, no API keys: the constraint on the Figma plugin)
  - tasks/todo.md, "Content review 2026-11-17" (the placement table and the three spikes)
  - tasks/reviews.md R-236 to R-248
  - tasks/schulung-kundenagenda.md (the commitment every change has to fit under)
---

# ADR-0180: The course proves its work with standard tools, and the contract leaves the participant path

## Status

Accepted. Recorded at decision time. The measured facts below come from three spikes run on
2026-11-17; every minute figure is still an estimate from the run-of-show rows until the R-040
rehearsal.

## Context

ADR-0179, written the same morning, took the gates out of the course's definitions of done and
kept two of them as content: one pass of `figma:snapshot` and `check:contracts` in Day 2
Block 02, and the contract as the place a deliberate difference is written down. It rejected
dropping either.

The owner then asked for a review of the whole course under one instruction: ignore the gates,
they carry badly into other repos. Read that way, the two things ADR-0179 kept are the two
things a participant cannot repeat on Monday. `check:contracts` and the contract file exist in
Atelier and in workspaces Atelier scaffolds, nowhere else. The review put numbers on it: about
85 of the 820 net minutes run on checks only Atelier has, about 37 on the participant's own
design system.

The review also found the reverse gap. Every workspace already carries a set of checks that
exist in any frontend repo: a strict compiler, ESLint with template accessibility rules,
stylelint, story tests with axe. The course used them and never named them as a set, and it
never let the agent run them. Hooks had no mention in the course material, and in Day 1
Block 05 the participant typed lint and build by hand and read the output themselves. "How does
an agent check its own work" was the owner's second question, and the material had the parts of
an answer without the answer.

Two constraints frame everything. The customer agenda is a commitment and is not edited, so
every change has to sit under a sentence it already has. And the course has never run: adding
subject matter two weeks before the first cohort is the risk, so nothing may arrive as a new
block.

Three spikes were run before deciding, because the plan rested on three sentences nobody had
tested:

- **Does the compiler catch an invented input?** Half of the time. In a fresh
  `create-atelier-ui-workspace@0.4.10` Angular workspace, an invalid value on a real input
  (`variant="ghost"`) fails the build with `TS2322` and a message that lists the allowed values,
  whether static or bound. A bound unknown input (`[shadow]`) fails with `NG8002`. A static
  attribute for an input that does not exist (`shadow="lg"`) builds clean, and so does an output
  that does not exist (`(pressed)`). Lint adds the template accessibility cases. A raw
  `<button>`, an inline `style=`, a named colour, `oklch()` and a hex inside a component's
  `styles:` string pass build, lint and stylelint alike.
- **Does the agent repair from the output on its own?** In one headless run with three planted
  mistakes: yes, in 78 seconds and 10 turns, with no permission denial, touching one file and
  inventing nothing. Two things qualified it. The failing commands print no error text in the
  agent's shell, only a path to the full log (R-248). And the agent satisfied the `alt-text`
  rule with `alt=""` on an image that carried meaning.
- **Is the Figma linter usable in the room?** `figma_lint_design` with its default rules
  reports 59 findings on the reference master `Inputs/AtlButton`. Eighteen are "critical"
  contrast failures on a label inside a hidden overlay frame, 40 object to the absence of text
  styles in a file that binds type to variables instead, and none of the ones examined is a
  defect. A filter by rule id works.

## Decision

1. **The course's proof thread is the set of standard tools a participant's own repo already
   has.** Compiler, ESLint, stylelint and story tests with axe are taught as one ladder, with a
   Figma linter in front of them as the design-side stage. Atelier's own gates leave the
   participant path except as the single `/verify` proof line ADR-0179 kept.
2. **The ladder arrives without a new block.** One slide in Day 1 Block 00 shows it; after that
   each stage enters in the block whose agenda row already names its subject, always as the
   same three beats: break it on purpose, the tool says so, the agent gets the output and
   repairs. The placement and the minutes are the table in `tasks/todo.md`, "Content review
   2026-11-17"; the deck outline is the source once it is written.
3. **The agent runs the checks, not the participant.** Where a block ends on build, lint or
   stylelint, the prompt tells the agent to run the command, report each exit code and repair
   from the output. The wiring is taught on what the workspace already ships: Day 2 Block 00
   opens the generated `CLAUDE.md` "Definition of Done" and changes one line of it, in place of
   listing the skills directory. No scaffold change is needed for cohort 1.
4. **Every stage is taught with what it does not see.** The compiler stage is demonstrated on
   an invented value, which fails, followed by an invented static attribute, which does not.
   The take-home ladder card has three columns: the command, what it catches, what it does not
   see. The evidence table of Day 1 Block 05 (a source for every property used) stays the
   check for invented names and hand-built elements, because the spikes showed no tool in the
   workspace catches those.
5. **The contract becomes a trainer mention.** Participants do not open, write or check a
   contract file. Agenda step 2, recording deliberate differences between design and code, is
   kept by a section of the handoff document written in Day 2 Block 01. When differences are
   sorted in Day 2 Block 04, the three labels are code, Figma, and kept on purpose; "kept on
   purpose" points at that section.
6. **The comparison with Figma is a look at both, not a gate run.** Day 2 Block 02 loses the
   `figma:snapshot` and `check:contracts` pass. Its 15 minutes go to `docs-show` on the
   participant's own component through the local Storybook MCP, closing the JSDoc gaps it
   shows, and a visual comparison of the running story with the Figma component. Day 2
   Block 04 keeps the parity report, which is a tool of figma-console-mcp and travels; the
   demo of what the report compares (D-8) runs on the trainer machine only, and the freed time
   goes to keyboard, states and sorting. Day 1 Block 02's comparison shrinks from 30 minutes
   to about 10, and the difference pays for the ESLint stage.
7. **The Figma linter is taught with named rules and as a list to sort.** The exercise prompt
   names `hardcoded-color`, `default-name` and `detached-component`; it does not run the
   default set. The 18 false criticals on the reference master are the trainer's example for
   "a finding is something to sort, not a verdict", the same judgement Day 2 Block 04 asks
   for. FigmaLint, the community plugin by the author of figma-console-mcp, is named on the
   transfer slide as the route for a designer without an agent, once a run without an API key
   has shown what it does on a course machine.
8. **One handout answers "what does a design system have to bring".** A one-page scorecard
   (describe, constrain, tokens, prove, enforce, instruct, measure) that links the existing
   readiness pages. It is the map in Day 1 Block 00 and the frame of the self-check in Day 2
   Block 05. A docs page follows after the first cohort.
9. **Scope is cut in three waves.** Wording and order before the first cohort; the new content
   above with the rehearsal; scaffold changes only with a release and the rehearsal, and the
   rest after the first cohort: a hook that reports to the agent, an ESLint rule against
   hand-built elements, a browser stage, an eval exercise.

Rejected:

- **Keep ADR-0179's one `check:contracts` pass in Day 2 Block 02.** It teaches a participant to
  read the output of a tool they will not have. The first contact between component and design
  that ADR-0179 wanted from it is kept by looking at both.
- **Keep the contract file and call it optional.** An optional file on the projector still
  costs the minutes and still leaves three meanings of "contract" in the material (R-242). The
  thing worth keeping is the habit of writing a deliberate difference down, and the handoff
  document already exists for that.
- **A block of its own for tooling.** It would need an agenda change, and a lecture on linters
  is the part participants already know. The stages are short because each is attached to a
  mistake the participant has just watched happen.
- **Teach the compiler as the tool that catches invented properties.** That was the plan before
  the spike and it is false for the most common form, a static attribute. Said on a slide, it
  would have been disproved by the first participant who tried it.
- **Run the Figma linter with its defaults and let the room read the result.** 59 findings on a
  file the course calls its reference would teach that the linter is noise, or that the
  reference is bad. Neither is the lesson.
- **Ship a reporting hook and a rule against raw elements for the first cohort.** Both change
  the scaffold, which needs a release and a rehearsal that has not happened. The course can
  teach the ladder on what is installed today.
- **Add a browser stage (Playwright or Chrome DevTools MCP) now.** It is the stage that would
  see what the others cannot, and it is new infrastructure on provisioned machines two weeks
  before the room. Cohort 2.

**Corrected 2026-11-19** (ADR-0186): two parts of point 6 and one of point 8 did not survive the
schedule pass of that day. Demo D-8 is removed, not moved to the trainer machine; one sentence on
the parity slide carries its point. Day 1 Block 02's comparison is by eye (card next to the Figma
frame, differences listed and sorted into code or Figma), so the parity tool first runs on Day 2.
The scorecard still frames the close of Day 2 Block 05, but as a self-assessment from memory; the
check prompt and both checklists are homework, because no seat has the participant's own file.

## Consequences

- What a participant takes home changes kind: a ladder card and a scorecard that hold in a repo
  with none of Atelier's checks, instead of proficiency with two of Atelier's commands.
- The course now says out loud where its own workspace is blind: static attributes, outputs,
  hand-built elements, inline styles, named colours. That is honest and it is also an admission
  about the scaffold; R-241 tracks closing the holes that can be closed.
- "Lint is green" is not "right". The `alt=""` repair is the example, and the trainer needs it
  ready, because a room that watches the agent turn three checks green will otherwise conclude
  the opposite.
- The contract's shrinking has a cost in Day 2 Block 04: the third label no longer points at a
  file a check reads, so nothing verifies that a difference marked "kept on purpose" was
  written down. It is a line in a document, checked by eye.
- The repo's own workflow is untouched. `check:contracts`, the contract files and the parity
  gate stay how work in Atelier is proven, and the reference pages keep describing them. Only
  the course stops being scripted from them.
- Material to change, in this order: deck outline, participant pages, deck, run-of-show, demo
  scripts, golden prompts, trainer notes. The outline is first because ADR-0179's rewrite of
  the same morning is not yet in the deck either, and two passes over the same slides would be
  waste.
- The failing-check output (R-248) is a live risk for the three-beat form: its third beat is
  "the agent gets the output". One run coped. Until the scaffold's scripts are decided, the
  exercise prompts tell the agent to read the full log when the summary has no error text.
- Weakest point: this revises a decision made hours earlier, on the strength of a review and
  three spikes of one run each, for a course that has never been in front of a room. The
  repair run was headless, in an untrusted workspace, on the maintainer's machine; a
  participant's seat is interactive, trusted and on a provisioned machine, and none of that was
  measured. If the rehearsal shows the agent-runs-it beats stall, the fallback is the one
  ADR-0179 already had: the participant types the command.
