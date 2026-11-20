---
status: accepted
date: 2026-11-20
sources:
  - owner, 2026-11-20 ("Was sollten wir daraus ableiten? Was ändern?", "Du kannst auch releasen", "Und Go")
  - tasks/exercise-test-run-2026-11-20.md (the headless run of every exercise; Sonnet 5.5, seat from create-atelier-ui-workspace 0.4.17)
  - tasks/reviews.md, R-264 to R-275 (the findings of that run)
  - tasks/todo.md, "Follow-up package F" (decisions D1 to D6, the spikes, the steps)
  - plan/adr/0184-course-material-is-complete-without-the-docs-site.md (the `course/` folder the new prompts live in)
  - plan/adr/0186-room-time-goes-to-what-a-participant-can-take-to-their-own-system.md (the schedule this record leaves untouched)
---

# ADR-0188: The exercises prove that green is right; they do not wait for red

## Status

Accepted. The participant prompts named here were run once headless on a seat before they went
onto a sheet (the second pink test prompt in a slightly narrower wording). The prose around them
was changed once more after a review on the same day and not run again: the commit points and
the undo text of Day 2 Block 03, the order of the Block 02 sections. No prompt has been run by a
person in a room; that is the rehearsal (R-040).

## Context

Three days before the first run of the course, every participant exercise of both days was run
for real: a fresh seat from the published scaffold, the prompts pasted verbatim from the seat's
`course/` folder, Sonnet 5.5 as the participant's agent, a duplicate of the Figma file for every
write. The report is `tasks/exercise-test-run-2026-11-20.md`.

The course had been written around an agent that fails loudly. Day 1 Block 05 (Team directory)
told the participant to notice where the agent invents a prop or builds its own badge and to
steer it; its recap asked which rule the agent broke first. Day 2 Block 03 was a self-healing
loop: a red story, the error handed back, a repair. Both wait for a mistake.

The mistake did not come. The Team directory was correct on the first pass in two of two runs: no
invented prop, no hand-built twin, only `var(--ui-*)`, the checks green. Day 2 Block 02 ended
green on four of four briefs, so Block 03 had nothing red to heal. Agent time was 3 to 7 percent
of every slot.

What the runs did produce was quieter. The agent was red several times while it generated and
repaired each one unseen; some repairs were not repairs. The seat's ESLint config wants the
selector prefix `app`, the course convention is `atl-`: in four of four Day 2 runs the agent
either renamed the selector to `app-…` or wrote an `eslint-disable-next-line`. One run deleted a
hover-colour assertion to get a story green. The handoff document went stale while the component
was generated (a token name that does not exist, a claim about a library component that was
wrong) and was corrected only if the agent chose to. The accessibility audit returned 100 out of
100 on four of four briefs, each time with the set classed "presentational" and the
focus-indicator and target-size checks skipped. The parity call on a TagChip returned 48 out of
100 with eleven discrepancies, seven of them artefacts of the comparison itself. Plan mode proposed
additions the handoff document does not contain, and a plain "build it" approved all of them. The
`docs-show` exercise asked for three kinds of gap (no component description, a property without
one, a bare alias) and found none, because the agent writes the JSDoc while it generates; asked
openly it found eight to ten other gaps each time.

None of this is in an exit code. A course that teaches "the checks are green, so it is done"
would have taught the wrong thing with a current model, and a course that waits for red would
have left the room idle.

## Decision

1. **Re-aim, do not plant.** The two exercises that waited for a mistake now ask the participant
   to prove that a green result is right.
   - Day 1 Block 05 gains "What nobody looked at": the agent lists every claim it made without
     running or seeing the result, with a one-minute check for each; the participant checks three
     lines by hand and labels each "holds", "does not hold" or "the brief does not say". The
     stretch task moves onto the sheet.
   - Day 2 Block 03 gains three prompts on a green seat: "What was red on the way" (every check
     that was red during generation, each repair marked "fixed" or "went around"), "Is the
     handoff document still true?", and "Make it red on purpose" (one variant or state out of the
     handoff document's "Explicitly out" line, story first, red, then one repair).
   - Rejected: planting a defect in the scaffold or the brief. A planted defect teaches finding
     the plant; the quiet repairs are real and repeat without help. Rejected: shortening the
     slots, see point 5.
2. **The seat keeps the ESLint selector prefix `app`.** It is the ready-made "went around" case
   of point 1 in four of four runs. The trainer line: the right place for the fix is the prefix
   list in the ESLint config, and changing a rule is a person's decision. Rejected: setting the
   prefix to `atl` in the scaffold, which removes the friction and the discovery with it.
3. **Read-only MCP tools go on the seat's allow-list.** The docs server at server level (the
   `atelier` package server has only read tools; on a React or Vue seat the rule names the hosted
   Storybook docs endpoint, which only reads as well), four named `storybook-local` tools (`docs-list`, `docs-show`,
   `docs-show-story`, `get-storybook-story-instructions`) and, with `--figma`, four named
   `figma-console` tools (`figma_get_status`, `figma_get_selection`,
   `figma_get_component_for_development`, `figma_lint_design`). `test-run`, `stories-preview`,
   `review-create`, `figma_execute` and every writing tool keep their approval. The allow-list
   was Bash-only; a generation run asked for an approval on every distinct MCP tool, and the
   approvals worth reading drowned in the ones that are not. Rejected: allow-listing
   `storybook-local` or `figma-console` at server level, which would let the agent write to the
   Figma file and run tests unasked.
4. **The AtlToast and AtlAvatar name collision stays.** Two briefs build a component whose name
   the library already exports with a different API. One sentence on the sheets says so and what
   to do. Rejected: renaming the briefs three days before the run.
5. **Slot lengths stay.** The customer agenda's tables are a commitment, and the run measured
   agent time only. Which human-side tasks fill a slot is decided after the rehearsal (R-266).
6. **No "with and without the MCP" comparison on a seat.** The spike: asked to build the Team
   directory without the docs server, the agent invented nothing; it read the installed package's
   manifest and type exports with 14 shell commands. On a seat the MCP buys cost and
   reviewability, not correctness, and the trainer says so in Day 1 Block 04. The hallucination
   demo in a browser chat (D-4) is unaffected: there the agent has no package to read.
7. **Three tools are read for what they checked, not for their score.**
   - `docs-show` on the own component (Day 2 Block 02) is read "as an agent that has only this
     text"; the participant sorts each gap as documentation or component.
   - The accessibility audit (Day 2 Block 04) is read for how it classified the component; the
     keyboard walk is the participant's, by hand.
   - The parity sort gains a fourth label, **tool artefact**: the tool compared two things that
     are not the same thing. The participant says what was compared with what and checks two such
     lines by hand, because the label is also a way to make a real difference disappear.
8. **Plan mode: answer the plan's questions before approving.** One line on the sheet and in the
   trainer notes.
9. **Every exercise step a participant hands to the agent has a prompt in `course/`.** New sheet
   `day1-stories.md` (Day 1 Block 04); the pink test, the dark check and the Team directory
   stretch move onto their sheets. Steps done by hand in Figma (a variant value and Auto Layout
   in the Day 1 micro-exercise) have none. The dark check drops its third confirmation ("disabled unchanged"): the button uses
   dedicated disabled tokens (ADR-0159) and three of the four briefs have no disabled state, so
   the check did no work in any run.

## Consequences

- The re-aimed exercises depend on the agent's account of itself. Three test runs returned usable
  lists (16 unverified lines on a Team directory; a disable comment, a deleted assertion and a
  renamed selector on Day 2). A model that under-reports would leave the lists short. The
  participant's three checks by hand and "red on purpose" do not depend on that account.
- Only Sonnet 5.5 was tested. A weaker agent may still fail loudly; the old steering prompts stay
  on the sheets for that case. Participants use Copilot at work, so the transfer line is about
  the method (ask what was not verified, ask what was red), not about one model's behaviour.
- A known friction stays in the scaffold on purpose (point 2). Someone who generates a seat for
  other work meets a lint rule that disagrees with the examples.
- The allow-list rules were proven through `--allowedTools` and a settings source on a seat. That
  a trusted seat's `.claude/settings.json` loads them the way it loads the Bash rules is assumed,
  not measured interactively. Side finding: in a workspace whose trust dialog was never accepted,
  project `permissions.allow` is ignored in `-p` mode.
- The numbers in the trainer material (19 lint findings, 48 out of 100, seven of eleven) are
  measurements of 2026-11-20 on one file and one run each. They are dated where they are written
  and move with the Figma file and the tool version.
- The measured basis for "the handoff goes stale" is one TagChip run (four passages corrected),
  for "the open docs question finds gaps" four generation runs plus one dedicated run.
- "Red on purpose" ends in the course's undo rule (`git reset --hard HEAD`), and a reset takes
  everything younger than the last commit. As first written, the sheet had one commit before all
  three Block 03 prompts, so the undo would have discarded the corrected handoff document and the
  revision of the first two prompts. A review by a fresh agent that was given the diff and four
  questions, not the reasoning, found it; the sheet now has a second commit before "red on
  purpose" and says what the undo takes (the new story and the handoff line, which are pasted
  again). The second-model check through Codex was not available that day (`model_not_found` on
  the account), so the reviewer shares the model family of the author.
- The seat's `.gitignore` gains `check.out`, the scratch file of a redirected gate run, because
  the sheets commit with `git add -A`.
- Seats provisioned from 0.4.17 do not have the new sheets or the allow-list. They are
  reprovisioned from the release that carries this change.
- The docs site mirrors the Day 2 changes on `/schulung` and `/build-your-own`. `/tutorial`,
  `/first-component` and `/design-to-code` keep their two- and three-label wording; they describe
  the general workflow, not the course. One exception: the generation prompt on `/tutorial` is
  the one the trainer projects in Day 1 Block 02, so its token sentence follows the sheet's
  ("resolve each variable to its name", no longer "no conversion needed"). The same "1-to-1"
  claim on `/design-to-code` and `/claude-md` is left for R-276.
