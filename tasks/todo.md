# Atelier — Status

_Restructured 2026-09-06. Was ~2,580 lines, append-only since 2026-04-21, 130 open
items. Closed and concluded work (twelve fully-checked dated sections, ~ten concluded
narrative retrospectives, and every mixed section's full original text) now lives
verbatim in `tasks/archive/` (five dated files, chronological, nothing deleted — see
each file's own banner). This file carries only what is still open, grouped by what
kind of action it needs next: near-term work first, then decisions the owner and I
need to walk through, then two collectors for related small findings, then blocked
items, then optional/low-priority ones. Open work is a checkbox item; a parent
checkbox that consolidates several original items carries them as nested checkboxes
underneath it._

Review findings are tracked in `tasks/reviews.md` since 2026-10-11; this file holds plans and
non-review work. Items marked `→ R-NNN` keep their reasoning here but are tracked there; items
closed by the review triage carry a `_(closed 2026-10-11 …)_` note.

## Follow-up package H: "nothing in Figma by hand" (owner correction 2026-11-21)

Owner on 2026-11-21, after the package G report named two by-hand Figma steps in the Day 1
micro-exercise: "Wieso in Figma? Von Hand sollte eigentlich in Figma gar nichts gemacht
werden." Asked how far the rule reaches, the owner chose "Alles über den Agenten": Day 1,
the two by-hand steps become one prompt; Day 2, the 20 minutes of drawing by hand go, the
agent builds the set from the starter (the catch-up prompt becomes the main path), the
participant steers, looks and decides; renames in Figma go through a prompt too. 0.4.19
carries the by-hand steps, so this needs a release (0.4.20) the seats are provisioned from.

The rule (ADR-0189): a participant never edits the Figma file by hand. Every write goes
through the agent. Selecting a node, looking at it, reading a value in the Design panel and
deciding stay with the participant.

Done when: no seat sheet, trainer document, course page or deck slide asks a participant to
edit Figma by hand; the new and changed prompts ran once against the duplicate; the block
times still add up (Day 2 Block 01 = 90 minutes); 0.4.20 is on npm and its tarball carries
the new sheets; the owner has the version.

Edge cases stated upfront:

- **Selecting is not editing.** "The node I have selected" stays the way a participant
  points the agent at a node. Reading W and H in the Design panel (target size, Block 04)
  stays too.
- **An agent-built set leaves little for the "machine-readable" pass.** It stays as the
  check after the steering rounds, where a raw value can slip in; a short "changed" list is
  the result, not a wasted run.
- **Figma plans without a spare variable mode**: the fallback said "do the repair by hand
  in the variable picker". It becomes a prompt without the pink mode.
- **The briefs say "draw"** ("the frames you draw") in the sense of "the set carries". Left
  as it is: rewording four tested briefs two days before the run buys nothing.

Steps:

- [x] H-0 Record: this section, the lesson (`tasks/lessons.md`), ADR-0189 + index row.
- [x] H-1 Sheets: `figma-linter-prompt.md` (two by-hand steps → one prompt; plan-limit
      fallback as a prompt), `day2-prompts.md` (Block 01: build through the agent, steer
      with one change per prompt, machine-readable pass, rename through a prompt).
- [x] H-2 Code through a Sonnet agent: `preset.spec.ts` assertions, `preset.ts` index
      lines, `docs/src/pages/schulung.astro` rows.
- [x] H-3 Headless runs of the new prompts on the duplicate (Sonnet 5.5), test section
      removed afterwards.
- [x] H-4 Trainer documents: run-of-show rows (Day 1 13:45, Day 2 09:35, 09:55, 10:20),
      trainer notes (micro-exercise, Day 2 Block 01), anything restating them.
- [x] H-5 Decks: Day 2 Block 01 slides and notes, Day 1 micro-exercise slide if it names
      the by-hand steps; published as drafts, changelog and outline follow (not committed).
- [x] H-6 Gates by exit code, commits per step, one push, 0.4.20 verified on npm
      (registry, drift, tarball sheets).
- [x] H-7 Review of package H below; memory updated.

### Review of package H (2026-11-21)

Released as **0.4.20**. Seats are provisioned from 0.4.20; a 0.4.19 seat still carries the
by-hand steps.

**Verified**

- Gates: `npm run check:all` exit 0 on the full working tree before the commits;
  `check:format` and `check:adr-refs` exit 0 again on the committed state (the only later
  edit was `tasks/reviews.md`). CI and Publish on `ebc1246c`: success.
- Release: `npm view` shows 0.4.20 for `create-atelier-ui-workspace`,
  `@atelier-ui/create-workspace`, `angular`, `react`, `vue` and `mcp`;
  `npm run check:release-drift` exit 0 ("7 of 7 publishable packages in sync") after
  pulling the release commits. Tarball of `@atelier-ui/create-workspace@0.4.20` unpacked:
  `figma-linter-prompt.md` has "one more value on its variant axis" and no "Shift+A";
  `day2-prompts.md` has "build your component set through the agent", "Change only that",
  "Change nothing else" and no "I drew it by hand"; the generated `course/README.md` line
  says "the micro-exercise prompts".
- Prompts, each once, headless on the duplicate, Sonnet 5.5: the Day 1 micro-exercise
  prompt (34 s: `variant` secondary / ghost, gap `spacing/2` to `spacing/3`, the second
  button moved 4 px; the ghost label came out white on white, which is now the look
  question on the sheet), the Day 2 steering prompt (28 s), the machine-readable pass
  after it (23 s, changed nothing, three could-not-bind items), the rename prompt (5 s,
  `success` to `positive`). The build-from-starter prompt is the wording that ran 4 of 4
  briefs on 2026-11-20.
- Decks: Day 1 version 93, Day 2 version 58, nine files, read back from the artifacts and
  byte-identical to the local sources; rendered locally without a reported issue, checker
  output equal to the pre-edit baseline. Outline and changelogs follow, archive
  `schulung-decks-2026-11-21-package-h.tar.gz`. Not committed.
- Duplicate: both H test sections removed, no Pink Test mode left in Library Tokens.

**Assumed**

- Human time. The 09:35 to 09:55 row is 20 minutes for one build run plus two or three
  steering rounds with looking in between. Agent time for the build on a seat and the time
  a person needs to look and decide are not measured. Rehearsal item (R-040 / R-266).
- The rename prompt gained its clause about the set's description after its run and was
  not run again.
- One run per prompt, one model. Nothing says how another model words the ghost variant or
  what it binds.
- The click that makes "the node I have selected" true was never made by a person in these
  runs.
- No seat was scaffolded from 0.4.20; the tarball was read instead.
- No second model read the sheets: Gemini through agy timed out after five minutes, Codex
  has been failing with `model_not_found` since 2026-11-20.

**Weakest point**

Day 2 Block 01 has no path without the bridge any more. ADR-0189 rejects "by hand" as the
fallback on purpose, so a seat whose bridge drops at 09:35 pairs with a neighbour or waits
for the trainer; before, it could keep drawing. The trainer notes say to fix the bridge
first, and nothing else covers it.

**Left as it is**

- The four briefs still say "the frames you draw" in the sense of "what the set shows".
- The duplicate keeps the four agent-built sets of 2026-11-20 and the stray text
  `remove-label` on Workshop-Templates; the owner decides.
- Both decks are still review pairs; d1-03-07 keeps its screenshot placeholder until the
  rehearsal.

## Follow-up package G: "close the exercise gaps" (owner go 2026-11-21)

Owner on 2026-11-21, after the Gemini cross-check of the exercises (R-277 to R-285): "Was
ist in a und in b drin in kurz", then "Beides. Rechner mache ich heute fertig". Part A is
trainer documents and handouts (no release), part B is scaffold sheets (release, seats
provisioned from it the same day). The gaps are of one kind: a row of the run-of-show asks
the participant for something no sheet on the seat instructs, or a checkpoint asks for
something the brief cannot give.

Done when: every row of Day 1 Block 03 and Day 2 Blocks 01 to 04 that a participant works
on has its prompt or its by-hand steps on a seat sheet, the trainer documents and the
handout say the same thing as the sheets, the new prompts ran once against the duplicate,
the release is on npm, and the owner has the version to provision from.

### Decisions (mini-ADR lines; follows ADR-0188, no new ADR)

- **G1 The checklist stays room work (R-278).** Context: handout and trainer notes say
  "homework, nobody starts this in the room", the run-of-show (decision 2026-10-14, R-207)
  has ten minutes of room work on one Atelier master. Options: drop the row, or fix the
  texts. Choice: fix the texts; in the room once on the master just linted, on the own
  file as homework. Tradeoff: the handout now has two uses in one sentence.
- **G2 The checkpoint follows the brief (R-280).** "≥ 2 variants × 2 states" becomes "the
  axes the brief's scope line names". Changing the TagChip brief to carry a second state
  would change a tested exercise two days before the run.
- **G3 Six presenters fit, eight do not (R-284).** Block lengths are a commitment to the
  customer. The row says what fits in 25 minutes and what to do with more than six.
- **G4 The agent's own list gets a mechanical cross-check (R-281).** Two commands the
  participant runs: what the Block 02 commit touched, and a search for disable comments
  and skipped tests. Stated limit on the sheet: a renamed selector and a removed assertion
  are found by neither. The handoff prompt is split: list first, the person decides, then
  the agent corrects the named lines.
- **G5 Block 01 gets its two prompts (R-277).** Structuring a hand-drawn set (do not
  redraw), with the tested build-from-starter wording as the fallback for a seat behind;
  the API-rules pass lists and does not rename, because the test run showed 0 renames in
  4/4 and the discoveries were places where the brief fixes a name.
- **G6 The linter runs twice on Day 1.** The three-rule run returns only real findings on
  the planted duplicate, so "real or false alarm" has no false alarm. The default run has
  18 of them (contrast on a hidden layer). Both prompts go onto the sheet; the trainer's
  projector-only default run becomes everyone's.
- **G7 By-hand steps for the micro-exercise are written from the Figma UI as known, not
  from a run (R-279).** A headless agent cannot click the Design panel. Marked UNVERIFIED
  in the trainer notes, rehearsal item.

### Steps

- [x] G-0 Headless runs of the new prompts on the duplicate (Sonnet 5.5), 2026-11-21:
      structuring on a de-bound copy of the TagChip set, API rules twice, the all-rules
      lint on the planted `Inputs/AtlButton` (23 findings: 18 `wcag-contrast` on the hidden
      `_disabled-overlay`, the 3 planted ones, 1 `no-autolayout` on the set, 1
      `empty-container`), the list-only handoff prompt. **Not run:** the pink test and its
      repair prompt (the Bridge dropped; both are unchanged since package F and ran there),
      the second handoff prompt (correct the named lines), the 24 × 24 px measuring step.
- [x] G-A Trainer documents and handout: readiness checklist line, run-of-show rows (Day 1
      Block 03 linter, checklist, micro-exercise; Day 2 Block 01 checkpoint and the two
      rows; look at both; what was red; show & tell; transfer), trainer notes, golden
      prompts where they restate a changed row.
- [x] G-B Sheets: `day2-prompts.md` (Block 01, look at both, session over lunch,
      cross-check, split handoff prompt, 24 × 24 px), `figma-linter-prompt.md` (default
      run, by-hand steps), `briefs/README.md` (both copies); index descriptions in
      `preset.ts` through a Sonnet agent.
- [x] G-C Gates by exit code, hostile diff read, decks checked for contradictions. Ten deck
      slides followed the sheets (Day 1 version 92, Day 2 version 57, drafts in the review
      pairs form; changelogs beside the deck sources).
- [x] G-D Tracker, commits, one push (2026-11-21, six commits up to `abec0e85`), released as
      **0.4.19**: Publish and CI runs green, all seven packages on npm,
      `check:release-drift` exit 0 after pulling the release commit. The published
      `@atelier-ui/create-workspace@0.4.19` tarball carries the new sheet lines (unpacked and
      read). No seat was scaffolded from it. Seats are provisioned from 0.4.19.
- [x] G-E Duplicate cleaned 2026-11-21: section `XT — struct test` removed; no Pink Test
      mode existed (Library Tokens has Light and Dark only). The original was not written
      to. Left in the duplicate on purpose, the owner decides: the four component sets the
      test run of 2026-11-20 built inside the starter frames (`Overlay/Toast`, `TagChip`,
      `StatCard`, `Display/Avatar`) and one stray text layer `remove-label`.

### Review of package G (2026-11-21)

Verified:

- `npm run check:all` exit 0, run after the last change to `preset.ts`, the spec and the two
  docs pages. After the cross-check fixes (two sheets, markdown only) four gates again by
  exit code, all 0: `nx test create-workspace`, `check:scaffold-snapshot`, `check:format`,
  `check:docs`. The full chain was not run a second time.
- The headless runs listed under G-0, on the duplicate, as worded on the sheets at that time.
- Both decks were read back from their artifacts after publishing: the content equals the
  local edits (Day 1 version 92, Day 2 version 57).
- The `git grep` line of Day 2 Block 03 runs: tested in a throwaway repository with one line
  per pattern. The first wording matched `process.exit(` through `xit\(`; the pattern is now
  `(^|[^e])xit\(`, and `@ts-nocheck` is in the list.
- The cross-check was a second model this time: Gemini through agy, two runs on the sheet
  diff and the question, not the reasoning (the first of three calls timed out). 17 findings,
  each checked against the sheets. Fixed: the catch-up path never said to select the built
  set; both Block 01 prompts left Figma in Dark mode; the catch-up prompt did not bind
  strokes; the regex (above); "Inspect" lands on the icon inside the button, not on the
  button; "the lines <numbers>" could be read as file line numbers; a second commit moves
  `HEAD` off the Block 02 commit; the Day 2 paragraph of the linter sheet was not labelled;
  the Auto Layout step pointed at the component set, which shows no gap. Wrong and left: the
  path filter hides the configs (that is what `git show --stat` is for), the primary prompt
  returns no node id (the linter sheet works on the selection).

Assumed, not verified:

- The two by-hand Figma steps were not clicked through. Figma's help article states that
  "Add property, Variant" on a main component creates the set with two variants; one Gemini
  run claims it creates one. The sheet now says what to do when the copy is an instance. This
  is the first thing to click in the rehearsal (R-279).
- The wording changed after the headless runs was not run again: "switch back to Light" and
  "stroke" in the Block 01 prompts, "the numbers <numbers> of your list" in the second handoff
  prompt. The second handoff prompt has never run at all, nor the 24 × 24 px measuring step,
  nor the pink test and its repair in this package.
- "The node I have selected" was tested by node id, not by a selection in the Figma window.
- That the new sections render in a scaffolded seat rests on the spec and the scaffold
  snapshot until the release is out.
- The deck slides were measured in a local Chromium harness, not in the Slides viewer.

Weakest point: the by-hand steps. They are the only part of the micro-exercise the agent
does not do, they were written from the help article and not from the Figma window, and two
sources disagree about what the button does. Ten minutes in the duplicate settle it; until
then the trainer should have the sentence ready, "duplicate the variant with Cmd+D".

Second weakest: six prompt wordings changed on the day of the release, after their test
runs. Each change is an added clause, none removes one, but none has run.

Left as it is: `docs/src/pages/schulung.astro` still says "the three prompts" for Block 03
(three steps, five prompts); the visible slide d2-05-02 still says three minutes; Shift+A is
tried on "two or three layers on the page" of the duplicate, not on a prepared scratch frame.

## Follow-up package F: "prove green is right" (owner go 2026-11-20)

Owner on 2026-11-20, after the exercise test run below: "Was sollten wir daraus ableiten?
Was ändern?", then "Du kannst auch releasen" and "Und Go". The run's core result: with
Sonnet 5.5 the agent does not fail loudly, it fails quietly. Every gate is green on the
first pass, and what is wrong (a silenced lint rule, a deleted assertion, a screen nobody
opened) is not in any exit code. Two exercises were built on waiting for a loud mistake
(R-264). This package re-aims them and repairs the sheet-level findings R-267 to R-275,
before the first run on 2026-11-23.

Done when: the scaffold's `course/` folder carries a tested participant prompt for every
exercise step a participant hands to the agent, the two re-aimed exercises produce a discovery in a run with a correct
agent, the trainer documents and the course page say the same thing as the sheets, the
release is on npm, and the owner knows the version to reprovision seats from.

### Decisions (mini-ADR lines; full record in ADR-0188)

- **D1 Re-aim, do not plant.** Context: Team directory (2/2) and the Day 2 self-healing
  loop (4/4) never went red. Options: plant a defect, shorten the slots, or re-aim at what
  the runs did produce. Choice: re-aim. Team directory gains "what nobody looked at" (the
  agent lists its own unverified claims, the participant checks three by hand) and the
  stretch moves onto the sheet; Day 2 Block 03 gains "what was red: fixed or went around"
  and "make it red on purpose" (a new variant, story first, red, then one repair).
  Tradeoff: both depend on the agent's honesty about itself; three test runs returned
  usable lists (16 lines; `eslint-disable`, a deleted assertion, a renamed selector).
- **D2 Keep the seat's ESLint prefix `app` (R-265).** It is the ready-made "went around"
  case of D1 in 4/4 runs. The trainer gets the line: "fix in the right place" is the
  prefix list in the ESLint config, and that is a human decision. Tradeoff: a known
  friction stays in the scaffold on purpose.
- **D3 Read-only MCP tools on the seat allow-list (R-275).** `mcp__atelier` (server level,
  four read tools), four named `storybook-local` read tools, four named `figma-console`
  read tools with `--figma`. Writes and `test-run` keep their prompt. Rule syntax verified
  through `--allowedTools` on a seat (server level and tool level); a rule in a trusted
  seat's `settings.json` is assumed to load the way the Bash rules do.
- **D4 The AtlToast / AtlAvatar name collision stays (R-271).** One sentence on the
  sheets says it is known and what to do; renaming four briefs three days before the run
  costs more than it buys.
- **D5 Slot lengths stay (R-266).** The customer agenda's tables are a commitment, and
  human time was not measured. R-266 stays open for the rehearsal.
- **D6 No "with and without MCP" pair comparison in Block 05.** Spike: without the MCP the
  agent invented nothing; it read the installed package's manifest and type exports with
  14 Bash commands. On a seat the difference is cost and reviewability, not correctness.
  The trainer says that line in Day 1 Block 04; the browser-chat hallucination demo (D-4)
  is unaffected.

### Evidence gathered before the edits (2026-11-20, Sonnet 5.5, seat 0.4.17)

- "Not verified" prompt on a finished Team directory: 16 checkable lines (no browser
  opened, mount and tokens import unseen, no `tokens-search` on the token names, page
  reset / combined filters / last page untested, no unit test, `Invite member` has no
  handler, dark / narrow / keyboard unseen).
- "What was red" prompt: Toast — selector renamed `atl-toast` → `app-toast` (self-marked
  "fixed", with "you may rule otherwise") and `!` → `as HTMLElement` ("went around");
  TagChip — `eslint-disable-next-line @angular-eslint/component-selector` and a deleted
  hover-colour assertion (both "went around"), plus `--ui-border-width` in place of the
  handoff's non-existent `--ui-border-width-default`.
- "Red on purpose": step 1 red in 52 s (17/18, "Unable to find an element with the text:
  Warning:"), step 2 green on the first attempt in 60 s; leftovers the agent named itself:
  `argTypes` not updated, lint / build / unit not run, the Figma master has no `warning`.
- Spike "Team directory without MCP": see D6.
- Spike R-275: see D3. Side finding: in a workspace whose trust dialog was never accepted,
  `permissions.allow` from the project settings is ignored in `-p` mode. Second spike with
  a settings source: `mcp__atelier` (server level) and `mcp__figma-console__figma_get_status`
  (tool level) both let their call through without a prompt.
- "Is the handoff document still true?" on one finished TagChip (44 s, 13 turns): four
  passages corrected (a binding still "to be confirmed", a pointer to a section that does
  not exist, an a11y line that no longer covered every variant, `aria-hidden` credited to
  the wrong component), no code changed. One run; the trainer text says so.
- Open `docs-show` reading on the same TagChip (40 s, 3 turns): about ten gaps (story
  snippets that would not compile as shown, a wrong import path, `warning` undocumented).
- Four-label parity prompt on the same TagChip (38 s): 48 out of 100, eleven discrepancies:
  seven tool artefacts (a resolved hex against `var(--ui-*)` twice, the set's bounding box
  359×64 against the 24×24 remove button, the `#id` suffix four times), two kept on
  purpose, two Figma, none code. Counted from the run's table; the agent's own closing
  sentence said six. None of the labels was checked against the Figma file by a person.

### Steps

- [x] F1 Scaffold sheets (`libs/create-workspace/src/generators/preset/files/course/`):
      Settings Card (mount prompt, token wording, selection wording), ladder (`alt`
      question), new `day1-stories.md` (Day 1 Block 04), Team directory ("what nobody
      looked at", stretch), Figma sheet (pink test prompts, selection wording, `Vector`
      note), Day 2 prompts (Block 00 minutes, open `docs-show` question, plan questions,
      new Block 03 section, keyboard by hand, classification, dark check), parity (fourth
      label), stuck (`check.out`), briefs README ×2 (variable count dropped, collision), handoff
      example (collision)
- [x] F2 Scaffold code through a Sonnet agent: `day1-stories.md` written and indexed,
      index descriptions, `preset.spec.ts`, ADR-0121 citation out of the template stories,
      allow-list (D3); `check:scaffold-snapshot` re-run, no snapshot change needed
- [x] F3 Course page `docs/src/pages/schulung.astro` through a Sonnet agent: stale lint
      numbers, re-aimed exercise text
- [x] F4 Trainer documents: run-of-show, trainer notes, golden prompts, dry-run kit; the
      demo scripts were read and needed no change (stale facts R-268, re-aimed rows, trainer lines)
- [x] F5 Handouts: scorecard note, readiness checklist selection wording
- [x] F6 ADR-0188 and the index row; tracker closures; this section's review
- [x] F7 Gates by exit code, hostile diff read, cross-check (2026-11-20; see the review
      below: the cross-check was not a second model)
- [x] F8 Decks: stale facts and affected exercise wording in the deck sources (not
      committed). Published 2026-11-20 as drafts into both deck artifacts, label "Package F
      2026-11-20": Day 1 version 89 (11 files), Day 2 version 55 (23 files); one slide per
      deck read back. Not rendered after the edit; the tight slides are listed in the deck
      change logs. The German label „Werkzeug-Artefakt" is a draft the owner has not judged.
- [x] F9 Commits per step, one push, release verified on npm, version reported; memory.
      Released as **0.4.18** (2026-11-20; Publish and CI runs green, all seven packages on
      npm, `check:release-drift` exit 0, the published `@atelier-ui/create-workspace` tarball
      lists the new course sheets). Reprovision the seats from 0.4.18 before 2026-11-23. Not
      done: no fresh seat was scaffolded from 0.4.18.

### Review of package F (2026-11-20)

Verified:

- `npm run check:all` exit 0, run after the last change to the sheets, `preset.ts`, the spec
  and the two docs pages. Before that, one at a time by exit code: `nx test create-workspace`,
  `nx lint create-workspace`, `nx lint docs`, `check:scaffold-snapshot`, `check:docs`,
  `check:format` (first run 1 on `schulung.astro`, formatted, then 0).
- The participant prompts ran once headless on a 0.4.17 seat as worded on the sheets (the
  second pink test prompt in a slightly narrower wording); the outputs are the evidence
  behind the numbers in ADR-0188.
- A fresh agent got the diff and four questions, not the reasoning, and returned 27 findings.
  Each was checked against the files: most were fixed, four were left on purpose (index-text
  assertions that would only detect change; two prompts that had run as worded; one finding
  that was wrong, the prompts had been run).

Assumed, not verified:

- The prose changed after the headless runs was not run again: the two commit points and the
  undo text of Day 2 Block 03, the order of the Block 02 sections, the clean-up line for the
  pink mode.
- The allow rules in the seat's `.claude/settings.json` are asserted by the unit tests; that an
  interactive session on a seat stops asking for those tools was not watched.
- Every number is from one run (two for the Team directory, four for the Day 2 briefs).

Weakest point: the re-aimed exercises rest on what the agent reports about itself ("what was
red", "not verified"), and no person has done them in a room. If the agent's self-report is
thin on a seat, the exercise has little to sort. The rehearsal (R-040) is the only check for that; the trainer notes say what a typical report holds, not what to do with a thin one.

Second weakest: the cross-check was not a second model. Codex failed with `model_not_found`
on the account, so the reviewer was an agent of the same model family; it found the undo rule
that would have discarded the corrected handoff document, which the author's own read had
missed, but blind spots shared by the family stay unchecked.

Left as it is: the dark-check prompt asks the agent to switch a toolbar control it cannot
reach; it ran four of four as worded (the agent read the stylesheet instead), and replacing a
tested wording three days before the course is the larger risk. The "1-to-1" token claim on
two docs pages is R-276.

## Exercise test run: do the exercises carry? (owner request 2026-11-20, done 2026-11-20)

Owner request 2026-11-20: run every participant exercise of both days for real and judge
each one on four questions — does the idea carry (does the designed effect actually
happen), is the done-when reached, does it fill its slot (neither idle nor overrun), and
is there something to discover. Owner decisions: Figma write exercises run in a duplicate
the owner created ("Atelier UI WS2", key `g7c76htXhtbQlKxBt5IaZU`; the original stays
read-only); the stale Storybook on 6006 was stopped; the participant agent is Sonnet 5.5
headless (`claude -p --model sonnet`, project settings only); Day 2 runs all four briefs
once, Day 1 runs Settings Card and Team directory twice.

Method: a fresh seat from `create-atelier-ui-workspace@0.4.17` in the session scratchpad,
APFS clones per run, the participant prompts pasted verbatim from `course/`. Per exercise:
agent wall time and turns, tool calls outside the seat allow-list (= approval moments for
a human), done-when checked by exit code and screenshot, discoveries. Human time is an
estimate on top of the measured agent time and is reported as an estimate.

- [x] D1 B01 setup: preflight, Storybook on 6006, five servers, first commit
- [x] D1 B02 Settings Card ×2: generation, ladder prompts 1–3 + clean-up, by-eye diff list
- [x] D1 B03 Figma: pink test, default lint, planted findings + 3-rule lint, readiness
      checklist on one master, micro-exercise
- [x] D1 B04: `docs-show` Button + non-existent prop, story + `play` red → green
- [x] D1 B05 Team directory ×2: start, checks, receipts; stretch story
- [x] D2 B00: skills question, Definition-of-Done question
- [x] D2 B01–B04 per brief (Toast, TagChip, StatCard, Avatar): structure in Figma, lint,
      handoff document, plan + generation, `docs-show` + JSDoc, `test-run`, self-healing
      loop (is anything red?), a11y three-step, parity, sorting
- [x] D2 B05: scorecard answerable from the two days?
- [x] Report per exercise (carries / result / time vs. slot / discoveries), verified vs.
      assumed, findings into `tasks/reviews.md`

### Review (2026-11-20)

Report: [tasks/exercise-test-run-2026-11-20.md](exercise-test-run-2026-11-20.md) — one
table row per exercise, verified vs. assumed. Open findings: R-264 to R-275 in
`tasks/reviews.md`; R-261 closed (the planting snippet ran, the three-rule run returns
exactly three).

- Every exercise reaches its result; none overran. Agent time is 3–7 % of every slot.
  Human time was not measured (R-266, to be timed in R-040).
- Carries: the Settings Card by-eye comparison (green gates, visible differences in every
  run, a false "all fixed" claim), plan mode before generation (4/4 briefs surface API the
  handoff lacks), the red → green story, the planted linter findings, the pink test.
- Does not fire: Team directory steering (2/2), the Day 2 self-healing loop (4/4 nothing
  red), the `alt=""` trap (3/3), the three `docs-show` categories (4/4), dark check 3.
  Owner question R-264.
- Unplanned but reliable: the seat's `app` selector rule against the `atl-` convention —
  two renames, two `eslint-disable` in four runs (R-265).
- Weakest point of the run itself: one model (Sonnet 5.5), headless, one run per Day 2
  brief, no human in the loop. It can say "the agent does not fail here"; it cannot say
  how long a participant needs or what a Copilot model does.
- Left behind on purpose: the duplicate "Atelier UI WS2" carries the three planted
  findings and four new sections on Workshop-Templates (Toast `3037:1517`, TagChip
  `3039:1603`, StatCard `3040:1639`, Avatar `3043:1681`). The original was fingerprinted
  before and after: unchanged.

## Course walkthrough (started 2026-11-12)

Owner decision 2026-11-12: no rebuild. Walk the existing course material block by block
(outline, deck, run-of-show, demo scripts, golden prompts must agree), risk blocks first
so every seat can work. Per block the owner says keep / change / cut; a change goes
outline first, then deck, then run-of-show and prompts.

- [ ] Day 1 Block 01 (setup) — package presented 2026-11-12, owner verdict open.
      Findings: (1) trainer machine has no Playwright browsers
      (`~/Library/Caches/ms-playwright` absent, playwright 1.63.0), so `check:stories`,
      D-5 and the deck render scripts fail here until `npx playwright install chromium`;
      (2) slide d1-01-04 offers only `claude auth login --console` / `ANTHROPIC_API_KEY`,
      who provides model access is undecided; (3) no plan B for a seat that stays red on
      a managed laptop beyond pairing; (4) 75 min is long if the preflight mails are all
      green, candidate: move time to Day 1 Block 05 (R-225), decide after R-040.
      **Owner 2026-11-12:** Conciso provides Claude subscriptions for trainings (not
      API keys) and has extra training machines; setup mail and other organisational
      parts stay with the owner, ignore them here; install Chromium on the trainer
      machine. Open follow-up: replace the `--console` / `ANTHROPIC_API_KEY` wording
      (outline D1-01-02..06, deck d1-01-02..06, run-of-show 09:50 row and R12, trainer
      notes, dry-run kit, briefing, `/schulung`, `/workshop`, `/troubleshooting`,
      customer agenda "Mitzubringen"), then `npm run trainer:print`.
      **Owner 2026-11-12 (second answer):** every participant works on a provisioned
      Conciso machine; the Claude login happens in the room on Day 1. Consequences, not
      applied yet (one reconcile after the Day 1 frame is agreed): setup homework and the
      preflight mail drop out; Block 01 becomes login + Figma + `/mcp` + Claude Code
      basics for everyone, proposal 45 min (was 75); 30 min to reassign; Day 1 Block 06
      homework cannot assume a machine at home; participants need a way to take their
      workspace along after Day 2; customer agenda "Mitzubringen" shrinks to a Figma
      account; needs an ADR (provisioned machines instead of homework). Chromium
      installed on the trainer machine 2026-11-12 (`chromium-1243`).
- [ ] Day 1 Block 05 (screen from Storybook, R-225) — package presented 2026-11-12,
      owner verdict open. Measured 2026-11-12: hosted `storybook-angular` endpoint,
      8 parallel clients x 12 `docs-show` calls on AtlTable: 96/96 HTTP 200, avg 0.10 s,
      max 0.16 s (one burst from one IP, not a cohort).
      **Machine-time spike 2026-11-12** (one run, trainer machine, fresh
      `create-atelier-ui-workspace@0.4.10 --framework angular --no-figma`, starter prompt
      verbatim, headless `claude -p`, no permission prompts, Opus main model):
      scaffold + install 142 s; build run 195 s (`docs-list` x1, `docs-show` x6,
      `docs-show-story` x1, no hand-built element); receipts run 39 s (`docs-show` x6,
      nothing removed). Gates from a cold Nx cache, measured separately: lint 9 s,
      stylelint 3 s, format 5 s, build 3 s, `check:unit` 9 s, `check:stories` 15 s, all
      exit 0. So the machine needs about 5 minutes for the whole exercise; the 65 minutes
      are human time (permission prompts, reading, judging), which this spike did not
      measure. Consequence: R-225 is not a machine-time problem; the block needs
      reweighting towards gates, receipts and debrief, not more build time.
      Side findings: (a) the scaffolded workspace pins Playwright 1.65.0, which wants
      Chromium build 1254; the Atelier repo's build 1243 does not serve it and
      `check:stories` fails until `npx playwright install chromium` has run inside the
      workspace (now done on the trainer machine; every provisioned seat needs it).
      (b) Hosted `docs-show` for AtlTable and AtlSelect shows the sub-component selectors
      (`atl-thead`, `atl-option`) in examples but never the class names to import
      (`AtlThead`, `AtlTbody`, `AtlTr`, `AtlTh`, `AtlTd`, `AtlOption`: 0 hits in
      `docs-list` and in both `docs-show` answers); the receipts run flagged exactly
      these six. Either a debrief talking point or a manifest gap to file in
      `tasks/reviews.md`; owner call. (c) Headless, the agent did not stop for approval
      of the component list and delegated the file writing to a subagent; a seat in the
      room will behave differently. Artefacts: session scratchpad `spike-block05/`
      (not kept).
- [ ] Figma access (owner 2026-11-12): the Atelier Figma file is public, participants
      need no own Figma account, and the owner pre-installs the Desktop Bridge on the
      Conciso machines. Conflict to resolve before the reconcile: the course as written
      needs write access, not read access. Day 1 Block 01 makes a duplicate, Day 1
      Block 03 edits a copy of a master in it (bind a fill, add a variant value, Auto
      Layout), Day 1 Block 06 homework sketches in it, Day 2 Block 01 designs a
      component set in it (40 min by hand, 25 min via MCP), and `figma:snapshot` reads
      the duplicate's file key from `package.json`. Unverified: whether the Desktop
      Bridge plugin runs at all in a file opened view-only, and whether Figma Desktop
      starts without a login.
      Resolved by the owner 2026-11-12: every machine gets Figma Desktop logged in with a
      Conciso account, the Atelier file duplicated once and the bridge imported; the owner
      does that setup. Nobody duplicates in the room.
- [ ] Day 1 frame and reconcile (owner 2026-11-12: frame "looks good for now"; the
      import-name gap is taught in cohort 1, not fixed). Frame: 00 09:00–09:30 (30) ·
      01 09:30–10:15 (45, was 75) · coffee 10:15–10:30 · 02 10:30–12:00 (90, was 75) ·
      lunch 12:00–13:00 · 03 13:00–14:15 · coffee 14:15–14:30 · 04 14:30–15:45 ·
      buffer 15:45–15:55 · 05 15:55–17:15 (80, was 65) · 06 17:15–17:30; net 410.
      Decision record: ADR-0178. Reconcile order, outline first:
  - [x] `tasks/schulung-deck-outline.md`, `tasks/schulung-run-of-show.md`, trainer
        notes, dry-run kit, demo scripts, golden prompts _(done 2026-11-12; golden prompts
        needed no change; row sums 30/45/90/75/75/80/15)_
  - [x] `/schulung`, `/workshop`, `/troubleshooting`, `/screen-from-storybook` (fifth
        gap: import names), `og-pages.ts` _(done 2026-11-12; also `first-component.astro`
        and `workshop-track.ts`. `check:docs` reads a clock time like 10:15 as a Figma node
        id and flags port 6006 on `/schulung`, so the Block 01 bullets carry neither)_
  - [x] ADR-0178 + README row + dated correction in ADR-0175; R-234 (manifest lacks
        import names) and R-225 update in `tasks/reviews.md` _(done 2026-11-12)_
  - [x] Day 1 deck slides from the finished outline, render, `check_deck.py`, publish
        _(done 2026-11-12: 26 of 55 slides changed, render exit 0, checker only the known
        d1-00-07 false positive, published as version 23)_
  - [x] `npm run trainer:print`, `npm run check:all` by exit code — 2026-11-12:
        `trainer:print` exit 0. `check:all` exit 1 at its fifth gate,
        `check:scaffold-snapshot`: the scaffold projection still carries the
        committed snapshot (`figmaLastModified` 2026-10-15), the working tree
        carries an uncommitted Figma refresh of 2026-10-22 that was already
        modified when this session started. Not caused by the reconcile and not
        fixed here (owner's call: commit the refresh and regenerate with
        `node tools/scripts/gen-scaffold-snapshot.mjs`, or discard it). The 45
        gates the `&&` chain skipped were run one by one: all exit 0, including
        `check:docs`, `check:adr-refs` and `check:stories`.
  - [ ] Customer agenda: change list to the owner first (outward-facing), then artifact,
        then local copy
  - [ ] Owner verdicts still open: how a seat gets its training account, a reserve
        account for a usage limit, how a participant takes the workspace home after
        Day 2, and the Block 06 homework default (no machine homework)
- [x] Day 2 reconcile (owner decisions 2026-11-17: Block 02 rebuilt around the running
      component, Block 04 reweighted towards sorting the differences, end-of-day checklist
      down to five outcomes plus a proof line, participants take the workspace home as it is
      on the course machine; plus the three Day 1 rewordings and the ADR-0178 leftovers).
      Spec: scratchpad `day2/spec.md`.
  - [x] Task docs: outline, run-of-show, trainer notes, dry-run kit, demo scripts, golden
        prompts (new §3.4)
  - [x] Pages: `/schulung`, `/build-your-own`, `day2-done.ts`, `/screen-from-storybook`,
        `/troubleshooting`, `/workshop`; docs gates by exit code
  - [x] ADR-0179 (outcome first, gates as proof), dated addition in ADR-0178 (take-home),
        R-235 (unmeasured: 15 min comparison, 8 min codeSpec prompt)
  - [x] Decks Day 1 and Day 2 from the finished outline, render, checker, publish
  - [x] `npm run trainer:print`, gate chain by exit code
  - Review (2026-11-17). Verified: decks published, Day 1 version 26 (10 slides changed) and
    Day 2 version 18 (17 slides changed); `check_deck.py` Day 1 exit 1 with the one known
    false positive (d1-00-07 "Sie kommt"), Day 2 exit 0 with 51 slides and 0 problems; a
    visible-text scan of both decks finds no "Gate", no "Triage" and no finding code outside
    the speaker notes; contact sheets of every visibly changed slide read; every gate of
    `check:all` run one by one by exit code, 49 green and `check:scaffold-snapshot` red (the
    drift from the uncommitted Figma refresh of 2026-10-22, owner decision open, not from this
    round); `nx lint docs`, `nx build docs`, `node tools/e2e/schulung-claims.e2e.mjs` and
    `npm run trainer:print` exit 0. Assumed, not measured (R-235): the 15-minute Figma
    comparison in Block 02, the 8-minute codeSpec prompt of golden prompts §3.4 (never run
    live), 40 minutes for generation plus looking at every story, and Block 03 absorbing the
    differences Block 02 leaves open. Weakest point: both shortened steps are the ones nobody
    has timed, and they sit on the critical path of Day 2; the rehearsal (R-040) decides them.
    Left as is on purpose: the reference pages keep their gate content, the English material
    still says "findings" in the Day 1 Block 02 recap where the German slide says
    "Abweichungen". Open with the owner: the scaffold-snapshot drift, the reserve account
    (R12), the take-home channel.
  - Customer agenda (2026-11-17, owner: change it, but the tables the customer already
    received stand). Compared the communicated tables (owner's screenshots) row by row with
    the outline: every row is still delivered, including Day 2 "Vom Design zum Code" (the
    rebuilt Block 02) and the Day 1 lint demo. Three edits in the Claude Docs source
    (revision 33) and in `tasks/schulung-kundenagenda.md`: the Setup row is back at the
    communicated wording, the Day 1 intro says the setup is put into operation instead of
    installed, and "Mitzubringen" is "nichts" (ADR-0178). Two rows in the source are more
    detailed than what the customer received ("Mit der Bibliothek bauen", "Vorstellung und
    Transfer"); they narrow the communicated wording and were left. Deck sources and the
    outline are archived outside the repo at
    `~/Backups/atelier-schulung/schulung-decks-2026-11-17.tar.gz`; both decks are pinned.
- [ ] Gate weight in the course (owner, 2026-11-12: the gates are accompaniment, not the
      primary goal; rule in `tasks/lessons.md`). Audit of 2026-11-12, outline + run-of-show +
      `/schulung` + golden prompts: gates are the _subject_ of about 70 of 820 minutes (Day 1:
      D-1 5, Block 02 verify 5, Block 05 gates 15; Day 2: Block 02 snapshot + `check:contracts`
      30, Block 04 codeSpec assembly 15), so time is not the problem. The problem is that they
      hold the definition of done in four places (Day 1 Block 05, Day 2 Block 02, Day 2
      Block 04, slide D2-CL-01 "Are you done?") and headline three slides (D1-00-05, D1-05-06,
      D2-02-05, the last with `[NO-MASTER]` on it). Golden prompts carry two gate lines (§1b
      only). Not audited: the German deck slides themselves (derived one to one from the
      outline) and the participant pages beyond a line count. Apply per block in the
      walkthrough; Day 2 Block 02 needs a decision, not a rewording (30 of its 75 minutes).
- [ ] Day 2 Block 01 (Figma + handoff, high-risk). Carries the Day 2 sentences the Day 1
      reconcile left alone on purpose: "open the duplicate you made in Day 1 Block 01"
      (`/schulung` Day 2 Block 01, run-of-show, outline D2-01-02, trainer notes, dry-run
      kit), the `L.figmaToken` link and the "set your own file key" text for
      `npm run figma:snapshot` on `/schulung`, the homework-check rows, and the third
      "Format per day" paragraph ("no special path for the training"). Also stale after
      ADR-0178: `/troubleshooting#still-red` bullets "create a fresh workspace" and
      "the kata (Block 05)", and `/workshop` calling the course a self-setup route.
- [ ] Day 1 Blocks 00, 02, 03, 04, 06
- [ ] Day 2 Blocks 00, 02, 03, 04, 05
- [ ] After the walkthrough: R-040 rehearsal, screenshots, `[Datum]` / `[Kanal]` / wordmark

- [ ] Customer agenda, three open suggestions in the doc (2026-11-17, doc revision 39, owner accepts or
      rejects each): Day 1 "Mit der Bibliothek bauen" gets the communicated middle sentence back ("Alles, was der
      Agent ... holt er sich aus Storybook; zu Beginn zeigen wir live, was er dort findet"); Day 2 "Einstieg"
      says what the skills part is (which are set up, when the agent loads them, how to check); Day 2
      "Vorstellung und Transfer" ends on the written next step instead of "Wahl eines ersten Befunds". After the
      decision: mirror into `tasks/schulung-kundenagenda.md`. **2026-11-19:** the third suggestion
      (`sg_s11qxbuoxx`) was reworded for Package E step E8 and the doc is at revision 41; the other two are
      unchanged.

## Storybook explainer slides, Day 1 Block 04 (owner go 2026-11-20, draft — owner review open)

Two new slides, so the room knows what Storybook is and which part of a story file the agent reads:
D1-04-01b "Storybook in one minute" and D1-04-04b "Anatomy of a story, and who reads what". The mapping
on D1-04-04b is measured, not recalled: `tasks/story-fields-spike-2026-11-20.md` (fresh 0.4.17 Angular
scaffold, text mode of `storybook tools`).

- [x] Spike: which story and component fields reach `docs list` / `docs show` / `docs show-story`.
      Read: `meta.component`, JSDoc above `@Component`, JSDoc on inputs, story order (code for the first
      three only), JSDoc above a story, `args`, `meta.title` (ids). Not read: `argTypes`,
      `parameters.docs.description`, `subcomponents`; `play` reaches the test run only.
- [x] Outline: D1-04-01b and D1-04-04b written, D1-04-01/02/06 adjusted (git-excluded file).
- [x] Timing mirrored into run-of-show, trainer notes, demo scripts, dry-run kit and `schulung.astro`:
      B at 14:53–14:56 (was the stretch round), story exercise 14:56–15:28, R5 checkpoints 14:53 / 15:11,
      block still 75. **Provisional** — owner said 2026-11-20 to leave the times aside for now.
- [x] Deck Day 1 locally at 57 slides (`tmp/schulung-decks/`, backup
      `bak-day1/2026-11-20-storybook-slides/`, contact sheet `render/sheet-day1-2026-11-20-storybook.png`).
      Render exit 0; `check_deck.py` exit 1 with the same five known problems as before.
- [x] Published as a draft 2026-11-20 on the owner's word ("put them straight into the file so I can look
      at them, we can still throw them out"): Day 1 deck version 61, 57 slides, index read back, order
      confirmed. Foreign-edit check before it: d1-04-02, d1-04-06 and `deck.json` had the byte sizes of the
      backup. Standing rule from now on: deck drafts go into the artifact right away.
- [x] Syntax highlighting on the code panel of d1-04-01b (owner asked 2026-11-20), published as Day 1
      version 62: keywords bold, property keys teal ink `#007575` (the colour of the labels beside them),
      strings `#A3470A`. That last colour is not in `STYLE2.md`; add it there if the owner keeps it.
- [x] Day 1 slide d1-01-02 (model access: `claude auth login`, PREFLIGHT-OK) removed 2026-11-20 on the owner's
      word: seats are logged in before the course. d1-01-04 no longer asks for the login. Deck version 64,
      56 slides. Open for the times pass: the 6 minutes of model access in Block 01 are still named in the
      outline, run-of-show, dry-run kit, `schulung.astro` and the notes of d1-01-01/04.
- [ ] **Day 1 deck is in REVIEW-PAIRS state since 2026-11-20 (version 65, 112 slides): every slide is followed
      by a grey notes slide `<id>-n` holding its speaker notes as visible text; the `<aside>`s are moved out.
      Do not present from it and do not run the old edit scripts on it. Back to a presentable deck:
      `cd tmp/schulung-decks && python3 -I review-pairs.py merge deck-day1/project`, then render, checker
      against `outline-ids.txt`, publish. Pre-split backup `bak-day1/2026-11-20-review-pairs-pre/`.
      Checker against `outline-ids-review.txt` meanwhile reports "0 asides" on every slide by design.
- [ ] **Last step before merge-back (owner 2026-11-20): AI-tell pass over every visible slide text and
      every notes slide.** The texts are German, so run `ki-spuren-entfernen` (German patterns) first and
      `humanizer` (English Wikipedia list) only as a second read. Commands, tool names and verbatim
      scaffold quotes stay untouched. After the red-thread rework, not before, or it polishes text that
      gets rewritten anyway.
- [ ] **Handover 2026-11-20 evening:** red-thread steps 2–4 done (visual rest, outline sync, times pass with 5-minute
      rounding), official-Anthropic-guidance round (NotebookLM c7eccc4e-…), real agent-run spike (findings
      `tmp/schulung-decks/spike-agent-findings-2026-11-20.md`; d1-02-04 and d1-03-05b/c rebuilt from real output), Figma
      fix on Settings Card save-button label. Decks Day 1 v86 / Day 2 v52, still review pairs. Next: merge back + .pptx
      check, commit (course files + tasks; never decks/outline), rehearsal screenshots. Later the same evening: all times rounded to 5-minute units
      (owner), Copilot line on d2-05-04, process 21191 stopped; decks Day 1 v87 / Day 2 v53. Still open: outline line 11 +
      D2-00-06b source, D1-01-04 wording.
- [ ] **Red thread (owner 2026-11-20):** many slides carry keywords with no clear message, and some results
      make no sense. Owner go 2026-11-20. Storyline for Day 1 as a Claude Doc:
      https://claude.ai/artifact/5L6vsDo1HVhYSFiAozSBgh (day sentence, block sentence, per-slide verdict
      and proposed title sentence; 36 of 56 carry, 12 keywords only, 6 result without conclusion, 2 rethink).
      Waiting on five owner decisions listed at its end; then rebuild block by block, Block 00 first.
      Progress 2026-11-20: owner ticked day sentence, title-as-statement, scorecard (kept on Day 1 with a
      question per row), notes rule. Rebuilt and published: Block 00 (v68), 01 (v69), 02 (v70), 03 (v71), 04 (v72), 05 (v73), 06 (v74, after the owner confirmed a publish the permission classifier had blocked): Day 1 text pass complete. Screenshots 2026-11-20 (Day 1 v75, Day 2 v40): five placeholders replaced with real images in
      `tmp/schulung-decks/shots/` — Settings Card and Starter frames from the Figma file (read only), docs-show
      for AtlTable from the atelier MCP server in a fresh 0.4.17 workspace, Toast brief and Team-directory
      wireframe from the course files. Five stay for the rehearsal (pink test on a copy, receipts list, /mcp,
      docs-show before/after, Design panel). Weak spots: wireframe and starter frames are small on the slide.
      Day 2 storyline 2026-11-20: https://claude.ai/artifact/CfvnUZ3br2i4uxq7Efn12p (38 of 55 carry, 10 keywords
      only, 3 result unclear, 4 duplicates: skill slides d2-00-04/05, transfer slides d2-05-05/06). Six owner
      decisions at its end; then rebuild Day 2 block by block. Done 2026-11-20: owner ticked all six; Day 2 split into review
      pairs (v41) and rebuilt block by block (v42–v44): skill slides and transfer slides merged (d2-00-05,
      d2-05-05 removed), four API-rule cards, "Erzeugen" eyebrow, /verify explained in the rubric, all notes
      in "Sag:" form. Day 2 deck: 108 slides in review-pairs state. Both days' text pass complete. AI-tell pass (ki-spuren-entfernen, then humanizer) done the same day:
      Day 1 v76 (7 note sentences), Day 2 v45 (4 sentences, 1 visible); change tables in
      `tmp/schulung-decks/render/ai-tells-day{1,2}.md`. Visual pass, first six (Day 1 v78, Day 2 v47): d1-04-04b mapping with arrows,
      d1-04-04 compiler flow, d1-05-06 sieve; d2-03-03 loop with two exits, d2-04-05 sorting into three bins,
      d2-00-06 hub. Visual pass 2 (Day 1 v79, owner picked three of four on 2026-11-20): d1-02-04 lint
      loop with the `alt=""` trap as exit, d1-00-07 scorecard as tick sheet, d1-03-05b/c right column as code with the
      guessed part in rust. Handgriffe d1-01-03 dropped by the owner. New Day 2 slide d2-00-06b "CLAUDE.md bittet. Ein Hook erzwingt." after the hub
      (owner picked variant 2 on 2026-11-20, from a post on CLAUDE.md vs hooks); published as Day 2 v48. Outline needs the new slide.
      Outline synced to both decks 2026-11-20 (56/54 ids match deck order; times untouched, list for the times pass in the session report). Open: owner's picks in the "Grafischer Durchgang" section of the storyline doc (visual pass), Day 2
      text pass, the AI-tell pass, merge back, times pass. Check U+2011 hyphens in d1-05-02/04 titles in the
      Slides editor and the .pptx export. Also done the same day: block references and change
      history out of every note in both decks (Day 1 v67, Day 2 v39), docs-site references out of the notes.
- [ ] **Owner review 2026-11-20: the slides are partly not plausible yet; to be worked out together
      later.** Nothing committed.
- [ ] Speaker note of `d1-04-04b.html` lacks the purpose-line nuance the outline and the trainer notes
      carry: through `atelier` the Button description opens with the library's purpose line and the
      JSDoc is the paragraph after it; in the own Storybook it is the JSDoc alone. Fold into the rework.
- [ ] Not measured: that the running MCP prints the same text as the CLI text mode; the exact cut at
      90 characters (89 intact, 91 cut). Rehearsal item (R-040).
- [ ] Side finding: `plan/ai-readiness.md` line 99 recommends documenting props through `argTypes`
      descriptions, which the measurement says the agent never reads.

## Package E: schedule pass — cuts, reweighting, transfer (owner decisions and go 2026-11-19, in progress)

Owner asked for a pass over both days: which exercises give no real value, which only exist inside the
Atelier repo and do not port, and whether "prepare your design system / your Figma workspace for AI" gets
room time. Finding: the preparation content exists (scorecard, two readiness checklists) but had about 12 of
820 minutes in the room. Fifteen decisions taken point by point; nothing is implemented yet. Everything in
the room runs on Conciso machines with Conciso accounts, so no exercise can touch a participant's own system.

Decisions:

1. Exercise "Wem traust du?" (D1-00-09, 5 min): removed.
2. Demo D-2 (D1-00-06, 5 min): removed.
3. Day 1 Block 01 setup 45 → 25 min ("three independent things", preflight content and the recap question
   leave; Claude Code basics stay). The 20 min go to Day 1 Block 03: checklist rows shown as "missing → this
   is what the agent guesses".
4. Lint break-and-repair (Day 1 Block 02) 20 → 10 min, one pass; the `alt=""` question stays.
5. Design tab (D-3): spike first. If the Figma embed loads on a seat for the private duplicate,
   `@storybook/addon-designs` goes into the scaffold, the story takes its Figma link from the handoff
   document, and the demo moves from Day 1 Block 04 to Day 2 Block 02 ("look at both"). If not, D-3 is dropped.
6. Demo D-6 (Claude Design, trainer only): removed; D1-BR-03 becomes a plain buffer slide.
7. Demo D-8 (D2-04-05): removed; "not passed means not compared" stays as one sentence on the parity slide.
8. Day 1 parity: visual comparison (card next to the Figma frame, list differences, sort into code / Figma)
   instead of the tool. The tool runs only on Day 2.
9. Day 2 Block 01 split 20 / 15 / 22: draw from the starter frame, API rules with a short exercise on the
   own component, handoff document.
10. Rules-file exercise (Day 2 Block 00): main task is writing the one line the own team would add (command
    plus what it proves). The delete-a-line trick is shown once by the trainer.
11. Workspace anatomy (D2-05-04): six steps; step 7 and the verify.md / review-agent line leave. One sentence
    added: at home the Storybook MCP on the own Storybook replaces the `atelier` package.
12. Self-check: scorecard in the room from memory (mark seven rows, pick the weakest, write the next step);
    both checklists with the check prompt are explicit homework. Customer agenda sentence changes to
    "Selbsteinschätzung".
13. Transfer: 15 min from Day 2 Block 03 (Iterate 75 → 60), transfer 12 → 27; afternoon shifts by 15 min.
14. Remaining freed Day 1 minutes: 5 to the scorecard in the kickoff, 15 to Block 05 (screen from Storybook).
15. One new slide in Day 2 Block 05, no exercise: (a) Storybook MCP on the own Storybook as the route that
    brings the DS docs to consuming teams' agents; (b) Figma linter, a11y audit and parity depend on the
    third-party figma-console-mcp.

Block times to confirm against the run-of-show before any file changes (derived, not measured):
Day 1 — 00: 30 → 25 · 01: 45 → 25 · 02: 90 → 80 · 03: 75 → 95 · 04: 75 · 05: 80 → 95 (net 0).
Day 2 — 03: 75 → 60 · 05: 65 → 80; Block 01 and Block 04 reweighted inside their boxes.

Steps (outline first, then deck, then run-of-show and prompts — the walkthrough rule above):

- [x] E0 spike, decides item 5. **Closed 2026-11-19:** owner chose embed plus PNG, so the private-file
      question no longer decides anything (ADR-0187); it stays unmeasured until the rehearsal. Before that: Half answered 2026-11-19 on the trainer machine: addon-designs 11.1.4 turns
      a `www.figma.com/design/…` link into an `embed.figma.com` iframe, and the repo's Angular Storybook
      (`AtlTabGroup` Default, Design panel) shows the frame. But the Atelier file is public
      (`link_access: view`, checked logged out with curl), so this says nothing about a participant's
      duplicate in drafts, which is private. Still open: does the embed load for a private file in a browser
      that is logged in to Figma, and is the seat browser logged in at all. No private file was reachable
      from here (only the Atelier file is open in Figma Desktop). Way out that needs neither answer: the
      addon also takes `type: 'image'` and an array, so the story can carry a PNG the agent exports through
      figma-console next to (or instead of) the live embed.
      **Owner decision 2026-11-19: embed plus PNG.** The story carries the Figma link and a PNG of the frame
      exported through figma-console; the PNG shows something even where the embed hits a login wall, so no
      further test gates the release. Scaffold change rides in C5's release, reprovision before 2026-11-23.
      Left unchecked on purpose: the private-file embed is still unmeasured, look at it on a seat in the rehearsal.
- [x] E1 block times confirmed against the run-of-show headings 2026-11-19: Day 1 30/45/90/75/75/80/15,
      Day 2 30/90/75/75/75/65, both 410 min net. Day 2 afternoon after the change: Block 03 13:30–14:30,
      coffee 14:30–14:45, Block 04 14:45–16:00, buffer 16:00–16:10, Block 05 16:10–17:30.
      **Finding the decisions did not see:** Day 1 nets to zero over the day but not around lunch. The
      morning loses 35 min (25 + 25 + 15 coffee + 80 ends 11:25, lunch is 12:00) and the afternoon gains 35
      (95 + 15 + 75 + 10 + 95 + 15 = 305 min from 13:00 ends 18:05). The customer agenda only commits to
      09:00–17:30, not to a lunch time. **Owner decision 2026-11-19: split Block 03 around lunch** — tour
      (tokens, structure) 11:25–12:00, hands-on (pink test, linter, checklist with "missing → the agent
      guesses", micro-exercise) 13:00–14:00. Day 1 clock: 00 09:00–09:25 · 01 09:25–09:50 · coffee
      09:50–10:05 · 02 10:05–11:25 · 03a 11:25–12:00 · lunch · 03b 13:00–14:00 · coffee 14:00–14:15 ·
      04 14:15–15:30 · buffer 15:30–15:40 · 05 15:40–17:15 · 06 17:15–17:30.
- [x] E2 (2026-11-19) `tasks/schulung-deck-outline.md` (local, never committed): all fifteen items, slide ids renumbered,
      plus D2-00-02, which still asks "name the loop and the tool per step" against the 2026-11-19 decision
      that nobody recites the loop. Result: 55 + 55 slides, both days 410 min net, clocks as above. Seven
      slides out (D1-00-06, D1-00-09, D1-01-02, D1-01-03, D1-01-07, D1-04-03, D2-04-05), three in (D1-03-05b,
      D1-03-05c, D2-05-04b). Resolutions the outline pass took on its own, **open for the owner**: Day 2
      Block 01 drawing row 40 → 20 min; Day 2 Block 03 revise row 15 → 10 min and the debugging row folded
      into the self-healing row; Day 1 Block 01 done-when inside 25 min is not measured. Every changed line
      carries the marker `(new 2026-11-19, to mirror into schulung.astro)` (23 lines).
- [x] E3 (2026-11-19, published) both decks from the outline (`tmp/schulung-decks/`, Day 1 artifact F7o6AkbbLLUDfAFtmfrM6t, Day 2
      Y5NWqQn9bPf6cqEiBYPdfp, publish with root = deck folder); changelogs updated. Day 1 version 59, Day 2
      version 37, label "Package E schedule 2026-11-19"; both indexes read back, 55 + 55 slides, equal to the
      local `deck.json`; no owner edits in the editor before the publish (live byte sizes against the backup).
      `check_deck.py`: Day 2 exit 0; Day 1 exit 1 with five problems known before this round (two local
      files outside the order, d1-00-04b and d1-00-10, neither is published; four blob references on the
      trainer slide d1-tt-02). Backups `bak-day{1,2}/2026-11-19-package-e/`, archive
      `~/Backups/atelier-schulung/schulung-decks-2026-11-19-package-e.tar.gz`. **Open for the owner:**
      D1-02-05 has no sketch drawn; D2-02-05 (the Design panel) carries a screenshot placeholder until the
      rehearsal; re-export both decks as .pptx.
- [x] E4 (2026-11-19, uncommitted; Sonnet agent) `docs/src/pages/schulung.astro`: block times, done-when lines, exercise list.
      Also `build-your-own.astro` (Day 2 times; workspace anatomy is six steps, Atelier's own contract check
      and the two file-tour entries for `verify.md` and the component-review agent are out) and one stale
      entry in `tools/scripts/lib/allowlists.js` (keyed to the removed Day 1 D-3 bullet). Agent-reported
      exit codes: `nx lint docs` 0, `nx build docs` 0, `check:docs` 0, prettier 0; my own re-run is E10.
      A clock next to the word "Figma" reads as a node id to `check:docs`, so those bullets carry no clock.
      **Open for the owner:** the trainer appendix (the D-6 Claude Design notes) is gone from the page; the
      stretch tasks of Day 1 Block 00 and Day 2 Block 00 are deleted, Day 1 Block 02's reads "predict which
      difference you will see"; the sub-clocks (Day 1 Block 03 tour, Block 05 silent/hint split, Day 2
      Block 03 revise row) are not on the page. Found on the way, older than this package: R-263.
- [x] E5 (2026-11-19, uncommitted; Sonnet agent, then my review) run-of-show, trainer notes, demo scripts (D-2, D-6, D-8 out; D-3 per E0), golden prompts, dry-run kit.
      Checked by me: `trainer:print` and its test exit 0; every block's rows in the run-of-show add up to
      its heading and follow each other without a gap (13 blocks); no D-2, D-6, D-8, Claude Design appendix
      or Day 1 Design tab left in the five files. The test now pins D-3 and D-7 to Day 2. My review found
      three sentences the pass had left ("Day 2 Block 05 starts it", "a handout, not homework") against the
      decision that both checklists are homework for after the course; fixed. It also found three stale
      clocks in the scaffold's participant files (`day1-settings-card.md` 11:25 to 11:45 → 11:00 to 11:10,
      `day2-prompts.md` Block 00 10 → 6 minutes, `day1-team-directory.md` time box 80 → 95 minutes with the
      silent and the hint row); fixed, `nx test create-workspace` exit 0. `/screen-from-storybook`, the
      trainer copy of that brief, gets the same time box. **Derived by the pass, open for the owner:** the
      late-comer track (09:25 / 09:25–09:40 / after 09:40); checkpoint times in Day 2 Block 01 (C2 09:55,
      C3 10:15, C4 10:35) and rule R7 now firing at C2/C3; `D2B03-C5` and `D2B04-C6` kept; golden prompts
      §3.4 and §3.5 (they existed for D-8) kept as trainer-only reference; three new rehearsal checks in the
      dry-run kit (10 Figma embed on a private duplicate, 11 the Day 1 Block 01 done-when inside 25
      minutes, 12 the 20/15/22 split of Day 2 Block 01).
- [x] E6 (2026-11-19, uncommitted; ADR-0187; Design panel with both entries seen in a browser on a
      generated workspace, `nx test` and `nx lint create-workspace` exit 0) scaffold `course/` files (Sonnet agent, spec updated): `parity-prompt.md` Day 1 section and
      `day1-settings-card.md` become the visual comparison; the rules-file exercise text; addon-designs and
      the story link only if E0 is green. **Owner 2026-11-19: the addon is installed by default** — it stays
      unconditional in the scaffold, not behind `--figma` (as ADR-0187 records it).
- [x] E7 (2026-11-19, uncommitted) handouts: scorecard instruction for the in-room pass plus a line for the
      weakest row and the next step; both checklists marked as homework; the Figma checklist now prints its
      check prompt (the linter prompt, with figma-console-mcp named as a third-party tool), because nobody
      takes the course workspace home. PDFs regenerated into local `Slides/Handouts/`, all five on one page
      (scorecard and Figma checklist looked at). The PDF script now also sits in gitignored
      `tmp/handouts/make.js` (run it from an empty folder; it writes its HTML and PNG there).
- [ ] E8 customer agenda (Claude Docs 5489776f…, then the local copy): Day 2 "Vorstellung und Transfer" says
      "Selbsteinschätzung"; Day 1 "mit dem Design vergleichen" still holds with the visual comparison. Owner
      sends the changed wording, it is a commitment. **2026-11-19:** laid as a change to the open suggestion
      `sg_s11qxbuoxx` (doc revision 41): "Selbsteinschätzung des eigenen Design Systems; daraus hält jede
      Person einen konkreten nächsten Schritt fest". Open: owner accepts, then mirror into the local copy.
      Checked against the agenda: the two demos it names are D-1 and D-4, both stay.
- [x] E9 ADR-0186 written 2026-11-19 (`plan/adr/0186-room-time-goes-to-what-a-participant-can-take-to-their-own-system.md`),
      README row, dated corrections in ADR-0180 and ADR-0179, `check:adr-refs` exit 0. ADR-0187
      (addon-designs in the scaffold) written 2026-11-19 after the browser proof; R-090 closed.
- [ ] E10 gates, commit per step, owner go to push; release and reprovision together with C5.
      **2026-11-19:** `npm run check:all` exit 0 on the full uncommitted tree (30 files changed, two new
      ADRs), run after the last edit. Open: the owner's go for the commits and the push, then the
      create-workspace release (the scaffold's `course/` files and the Design addon changed) and the seat
      reprovisioning before 2026-11-23.
      **2026-11-19, later:** owner go ("Ja Go"). Four commits `fc2e1df7`, `76807148`, `fa25a5dd`,
      `66dde706` pushed to `main`; CI and Publish green for `66dde706`; released as **0.4.17**
      (`npm run check:release-drift` exit 0, 7 of 7 packages in sync with npm). Still open, which keeps
      this box unticked: reprovision the seats from 0.4.17 before the rehearsal on 2026-11-23 (with C5).

## Package D: Figma ↔ Angular parity pass (owner go 2026-11-19)

Owner found Figma/code differences in another session (button padding). Audit 2026-11-19: parity tool only compares the API with the emitted codespecs (no padding/colour/type), so the real gaps came from a binding audit, lint and CSS spot checks.

- [x] D1 code: button inline padding on --ui-spacing-4/5/6 (was literal 14/18/24px; Figma binds spacing/4/5/6); stale exemption removed; Combobox contract axisMap removed (Figma `invalid` is a boolean)
- [x] D2 Figma: Checkbox/Radio/RadioGroup rows 40px (row-height/sm); Combobox states on input variables; Chat 55 literals bound, 8 muted texts rebound from input-border to text-muted (the 4.3:1 contrast finding was this mis-binding, tokens match code); Avatar one style; readonly radius md; button strokes, spinner in flow, overview grid; shadows on effect styles; 194 text nodes on local text styles (276 → 70 left, sizes without a style); checkbox tick centred; focus rings on the control
- [x] D3 demo D-? (Day 1 Block 00) runs on local tag `demo/d1-button-padding` (commit before the fix); scripts updated
- [ ] D4 Figma: AtlCard first-column variants collapsed; RadioGroup selected dot off-centre (in progress)
- [x] D5 snapshot refreshed 2026-11-19 (bridge shared fine), `check:figma` baseline ratcheted (TEXT-UNSTYLED 148 → 30, FIGMA-AUTO-LEADING 116 → 30), Dialog/AccordionGroup sets resized, Button labels on ty/emphasis/action/title, all 37 parity records re-recorded, `check:parity` green. `check:paint` baseline re-recorded: 29 fixed AtlInput entries dropped; new accepted entries are check limits, not drift — AtlToggle height (probe is the 24px `.track`, Figma's number is the 40px row; same shape as AtlCheckbox already in the baseline), AtlAvatar background (two stacked Figma fills vs one `color-mix`, the check reads one fill), AtlTextarea disabled/readonly hover border (code deliberately keeps the border; the check applies the Figma hover row to those stories)
- [ ] D5b paint check limits worth fixing: per-component multiple probes (row + track), stacked fills, exclude disabled/readonly stories from hover rows
- [ ] D5 (was) refresh `figma:snapshot` (needs exclusive bridge) + `parity:record` per component so `check:parity` is green again (37 records dated 2026-08-27)
- [ ] D6 stale prose: `tools/scripts/check-figma.js:167` and R-220 still say AtlButton padding is raw 14/18px; ADR-0107 needs a dated correction note
- [ ] D7 open: 70 text nodes without a matching text style (10/12/20/26 SemiBold, 12/13 Regular, italic, mono bold) — new styles or token-backed variables? Focus variants for TabGroup/Tab/Option/Table; default layer names (Table, Stepper, AvatarGroup, CodeBlock)
- [ ] D8 push the demo tag with the next push (`git push origin demo/d1-button-padding`)

## Package C: course material complete without the docs site (owner go 2026-11-19, ADR-0184)

The docs site is password-protected; participants cannot open it. Audit 2026-11-19 found prompts, briefs,
handoff example, rescue steps and the ladder card only on the site, and 15 site links in seat files.

- [x] C0 handouts carry no site link (scorecard last column reworded), PDFs regenerated in local `Slides/Handouts/`
- [ ] C1 scaffold writes `course/` (team-directory brief + prompts, parity, Day 2 prompts + four things to paste back, four briefs, handoff example, rescue); seat CLAUDE.md, README, preflight without site links; spec updated
- [ ] C2 decks: "im Brief"/"Kursmaterial"/"Tutorial" point at `course/` files; four things to paste back on d2-03-03; notes that assume an open site corrected; kata out of participant material
- [ ] C3 handouts: ladder card and rescue steps as handouts; storybook checklist without "from the page"; PDFs
- [ ] C4 plan docs: /schulung `pages:`, run-of-show, golden prompts name the `course/` file instead of "point participants at the page"
- [ ] C5 gates, commit, owner go to push → create-workspace release → reprovision from that release before 2026-11-23

## Package A: standing rules into the skill, rubric reframed (owner go 2026-11-19, ADR-0183)

Course review 2026-11-19 against Anthropic's prompting guidance and the NotebookLM design-system
notebooks. Package A before the rehearsal on Monday 2026-11-23; package B (Day 2 Block 01
"Figma readable for agents", semantic-token lint, Code Connect demo, structured-metadata slide)
waits for measured timings.

- [x] A1 `atelier-component/SKILL.md` (+ no-Figma variant): composition, icon-only names, status
      without colour, `autodocs`, each with its reason; preset spec pins them
- [x] A2 §2.1 shrunk to the task; `/build-your-own` copy matches
- [x] A3 rubric (`prompts.astro` RUBRIC): Source, Scope, Plan first, Done (this task), One change,
      Fix in the right place; run-of-show, `/schulung`, deck outline, trainer notes follow
- [x] A4 plan mode at the start of Day 2 Block 02 (about 5 of the 48 min)
- [x] A5 golden prompts reframed as the trainer's rescue sheet
- [x] A6 gates green and committed 2026-11-19; pushed, released as 0.4.13 (Publish green). Same day the CI e2e went red: `@angular-devkit/architect@0.2203.0` (Angular 22.3, published 2026-11-19) exports no "./node/index", which nx 23.3's ngcli-adapter imports, so every freshly scaffolded Angular workshop failed `npm run build` — 0.4.12 and 0.4.13 included. Fix `72727ac8` pins it via npm `overrides` to 0.2201.7 in the Angular scaffold; released as 0.4.14, CI and Publish green, release-drift 7/7
- [ ] Reprovision the seats from **0.4.14** before the 2026-11-23 rehearsal (rides on R-252); never from 0.4.12/0.4.13 for Angular
- [ ] The architect pin is hard-coded (`ANGULAR_DEVKIT_ARCHITECT_VERSION` in preset.ts): move it with any Nx/Angular bump, or drop it once nx stops importing `architect/node/index.js`
- [ ] Rehearsal check: does the agent load `atelier-component` during the Day 2 generation?

## Local Storybook and MCP on the seat (owner go 2026-11-18)

Owner 2026-11-18, after the through-line review of both days (findings R-253 to R-260 in
`tasks/reviews.md`): the course must not depend on the hosted Storybook. The library's
component knowledge comes from the `@atelier-ui/mcp` package (stdio, no network, no process),
the participant's own components and stories from the MCP inside their own running Storybook
(`@storybook/addon-mcp` on `:6006`). Owner: "Es sollte definitiv einen lokalen MCP geben" —
read as: the local Storybook MCP is a fixed part of the course from Day 1, not a Day 2 add-on.

Decision in short (full record: ADR-0182):

- Context: Day 1 Block 05 has the hosted `storybook-angular` MCP as its only source for 80
  minutes and no fallback (R-257); Cloudflare throughput has been a recurring problem
  (ADR-0177); a scaffold release and reprovisioning are due anyway (R-252).
- Options: (A) package plus the prebuilt static Storybook on the seat; (B) the library's
  story sources inside the workspace Storybook; (C) an Atelier clone per seat.
- Choice: A. The package exists (`libs/mcp`, private) and scored 94 % against the hosted
  endpoint's 96 % (M1), so the agent's answers do not change and it needs no running server.
- Rejected: B, because the stories are not in the npm package and import monorepo internals
  (`./atl-button`, `@atelier-ui/spec/...`), the MCP dies with the Storybook process and
  `check:stories` would render 32 stories the participant does not own. C, because it puts a
  second repo and a second long-running process on every seat (ADR-0137 left the clone).
- Tradeoff: participants see the library's Storybook, not its story sources. The scaffold's
  one `AtlButton` story stays the pattern to copy.

Two roles, two servers (this is also the teaching frame):

| Role                           | Server                         | Tools                                                           | Needs               |
| ------------------------------ | ------------------------------ | --------------------------------------------------------------- | ------------------- |
| Use the library (Day 1)        | `@atelier-ui/mcp`, stdio       | `docs-list`, `docs-show`, `docs-show-story`                     | nothing             |
| Build a component (Day 1 B04+) | addon MCP in the own Storybook | the same for own components, plus `stories-preview`, `test-run` | a running Storybook |

Done when: on a seat generated from the release, with the network cut after install, `/mcp`
lists five servers (`nx-mcp`, `atelier`, `storybook-local`, `angular-cli`, `figma-console`; the course material says four since ADR-0181 and moves with L4), `docs-show` answers for a library component, the library's Storybook
opens in the browser, `npm run preflight` exits 0, the generated workspace contains no
`atelier.pieper.io/storybook-*` URL, and the Block 05 headless run of 2026-11-12 is repeated
on the package. The hosted endpoints stay up until after cohort 1 (the rest of M4); the
course only stops depending on them.

- [x] **L0 Spike** (2026-11-18, workspace generated from the published 0.4.10 and patched by
      hand; logs in the session scratchpad under `spike/`). All four answered:
      (a) Works. Packed tarball (82 KB) installed; with all network denied to the process,
      `npx atelier-mcp` resolved from `node_modules/.bin`, `initialize` after 0.7 s, `docs-list`
      29 components, `docs-show` answered. Four tools, `tokens-search` included.
      (b) Works. `staticDirs` mount at `/atelier`: manager and a story render in headless
      Chromium, also with outbound network blocked; the workspace's own index keeps its 7
      entries; `check:stories` exits 0. Also works with the build inside
      `node_modules/@atelier-ui/mcp/storybook`, resolved through the template's
      `getAbsolutePath`. Costs: `build:storybook` output 11.7 MB to 27.4 MB; the Design tab is
      empty offline (Figma embed). Static build 3.9 MB gzipped.
      (c) Partly. One headless run asking for "the Storybook MCP": the agent called
      `storybook-local` first (only `AtlButton` there), then `atelier`, and answered correctly.
      Different id formats on the two servers.
      (d) A dead `storybook-local` entry is silent: headless session starts cleanly, server
      `failed` in the init event, its tools absent; with Storybook up, connected with nine tools.
      Not observed: an interactive session, a reconnect when Storybook starts after `claude`, a
      workspace generated from the working tree, the gates with network blocked.
- [x] **L1 Decide and record** (2026-11-18, ADR-0182, with the dated correction in ADR-0175).
      From the spike: the static build ships inside `@atelier-ui/mcp`; a fixed `storybook-local`
      entry in `.mcp.json` replaces the `claude mcp add` step; the library's server is called
      `atelier`. Owner confirmed all three 2026-11-18.
- [x] **L2 Publish `@atelier-ui/mcp`** _(package side done 2026-11-18, commit 6bc980d4: in the `libraries` release group, `private` gone, static Angular Storybook in the tarball under `storybook/`, 4.0 MB packed; `check:mcp-package` and `nx release --dry-run` exit 0. No `publishConfig`: the siblings have none, access and provenance come from `publish.yml`. Not verified: a real publish; the `NPM_TOKEN` must be allowed to create a new package in the scope. No Storybook version gate exists, the pin is by hand.)_ — owner go given 2026-11-18. The seven steps are
      listed under M1 (nx release group, drop `private`, release block, publish target,
      Storybook pin, `publishConfig`, snapshot before pack in CI).
- [x] **L3 Scaffold** _(done 2026-11-18, commits 8c8fdf6a and c048c9d2, not pushed. Run by exit code: `nx test create-workspace`, `nx lint create-workspace`, `nx build create-workspace`, `check:preflight-clone-sync`, the root preflight and the Angular `cli.e2e.mjs` ("All 1 framework(s) green"), all 0. Not verified: React and Vue beyond the spec tests (no e2e run for them); a seat generated from the published release, which does not exist yet; preflight probes the package through `node <bin>`, not through `npx atelier-mcp` as `.mcp.json` starts it. Known side effect: preflight warns "`storybook-local` … not running" on every seat until Storybook is started.)_ (Sonnet agents): both `.mcp.json` entries and the dependency, the `staticDirs` mount in the Storybook template, one routing sentence in the generated `CLAUDE.md` (library → `atelier`, own work → `storybook-local`) in place of the paragraph that argued against a fixed entry, preflight probes the
      package instead of the hosted URL, generated `CLAUDE.md` and README text, spec tests,
      `cli.e2e.mjs`. Same release: `/verify` runs lint and build and drops `check:contracts`
      (R-239, R-254), the `atelier-component` skill loses its contract step (R-256).
- [x] **L4 Course material** _(done 2026-11-18, commits 835dd95a (trainer material) and b50bdd06 (docs pages), not pushed; outline and both decks updated outside the repo. Run by exit code: `nx lint docs`, `check:llms`, `check:docs`, `check:format`, `nx build docs`, `trainer-print.test.mjs`, all 0. One change goes beyond the plan below: Day 2 Block 00's exercise is now remove-and-restore on the `check:stories` line of the generated Definition of Done, because 8c8fdf6a put lint and build into that list and left the old "add the missing check" exercise nothing to add. Decided without the owner; the customer agenda row does not name the exercise. Not verified, all for the R-040 rehearsal: `test-run` through `storybook-local` on a seat in Day 1 Block 04, the reconnect when Storybook starts after `claude`, the Design tab in the mounted library Storybook, that the two Day 2 Block 00 answers differ, and which server the agent picks when a prompt names none. The customer agenda itself was not edited; its communicated rows were compared by reading.)_ Day 1 Block 04: the local Storybook MCP is connected here, so
      the agent runs `test-run` on the red story itself (ladder stage 4; today it cannot before
      Day 2 Block 02). No wiring step is needed there any more (fixed entry, ADR-0182),
      only "start Storybook first"; Day 2 Block 02 gets its ten minutes back. Prompts that say
      "the Storybook MCP" name the server instead (`atelier` or `storybook-local`). One fallback per block instead of two (R-257), rule R8,
      demo D-3's primary URL, a "two roles" slide. Order: `/schulung`, run-of-show, golden
      prompts, demo scripts, trainer notes, dry-run kit, outline, then both decks. Check every
      change against the customer agenda's communicated rows before it lands.
- [ ] **L5 Release, reprovision, rehearse.** Closes R-252; R-040 runs on machines provisioned
      from this release, with the two-server question from L0 (c) as a rehearsal check.
  - [x] **Release gate repaired before the push** _(2026-11-18, commit 10365740)_. The owner's
        push go met a red main: CI and the "Verify (release gate)" job had failed since
        2026-10-22 (c4e8d610), because `mcp:test` read the gitignored `libs/mcp/snapshot/`
        that no task built and `mcp:build` had no edge to `angular:build-storybook`. That
        corrects L2 above: its "`check:mcp-package` exit 0" held only on a machine with a
        leftover snapshot. Fix: explicit `mcp:build` depending on the Storybook build,
        `mcp:test` depending on `mcp:build`, both hashing their dependency's output files.
        Run by exit code in a clean worktree after `npm ci`, cold: `check:all`,
        `run-many -t test`, `run-many -t build,build-storybook`, `run-many -t package`,
        `run-many -t lint`, all 0. Cost: the Test job now builds the Angular Storybook.
        Not verified: that a changed snapshot forces an `mcp:test` cache miss (follows from
        the inputs, not run). Lesson in `tasks/lessons.md` of the same day.
  - [x] **Released as 0.4.12, after a half-published 0.4.11** _(2026-11-18)_. The push of
        L0 to L4 met a red lint in the release gate (`libs/mcp/storybook/**` and
        `snapshot/**` were linted); fixed in 7fe68c0f. That commit touches only
        `eslint.config.mjs`, which is outside `publish.yml`'s `paths`, so the release was
        dispatched by hand (`workflow_dispatch`, `mode=release`, run 44302309365). That run
        published six packages at 0.4.11 and failed on `@atelier-ui/mcp` with a 422: npm
        validates the provenance bundle against `repository.url`, and the new package had
        none. The runner's release commit and tags never reached origin.
        **0.4.11 is an orphan: six packages exist, `@atelier-ui/mcp@0.4.11` never did, and
        `create-atelier-ui-workspace@0.4.11` scaffolds an Angular seat that cannot install.
        Never provision from it.** Recovery per ADR-0150 (a new version, not a retry):
        release commit and tags recreated locally with `nx release --skip-publish`
        (4254809f, `v0.4.11` and four skill tags), llms regen (07a09c7e), the fix (d4843d6d:
        `repository` in `libs/mcp/package.json`, plus an offline `[NO-REPOSITORY]` check in
        `check-release-drift.mjs` that fails before any upload), and a final newline for the
        changelog nx wrote (6b5438ce). The push of 6b5438ce triggered run 44308445343: gate
        green, publish green, release commit 83bed8ee and tag `v0.4.12` pushed by the runner.
        Verified after the run: `latest` is 0.4.12 for all seven packages (queried from
        `registry.npmjs.org` directly), `@atelier-ui/mcp@0.4.12` carries an attestation and
        gitHead 83bed8ee, `npm run check:release-drift` exit 0 (7 of 7 in sync), and the
        package installed from the registry answers `initialize`, `tools/list` (four tools)
        and `docs-list` over stdio. A seat scaffolded from the registry
        (`npx create-atelier-ui-workspace@0.4.12 <name> --framework angular --figma`, no
        TTY) exits 0, pins `@atelier-ui/angular` and `@atelier-ui/mcp` at 0.4.12, writes the
        five-server `.mcp.json` of ADR-0182, and its `npx atelier-mcp` starts. Not run on
        that seat: `npm start`, Storybook, `storybook-local`. Not done: `npm deprecate` on the six orphaned 0.4.11
        versions (needs the owner's npm login). No ADR for the `[NO-REPOSITORY]` check; it
        extends ADR-0150's guard and decides nothing new. Lessons in `tasks/lessons.md`.
  - [ ] **Reprovision the course machines from 0.4.12** (owner).
  - [ ] **R-040 rehearsal on a reprovisioned machine** (owner; closes R-252). Checks carried
        from L4: `test-run` through `storybook-local` in Day 1 Block 04, the reconnect when
        Storybook starts after `claude`, the Design tab in the mounted library Storybook,
        that the two Day 2 Block 00 answers differ, which server the agent picks when a
        prompt names none.
  - [x] **Owner verdict on the Day 2 Block 00 exercise** _(confirmed by the owner 2026-11-18:
        keep the delete-and-restore version; whether the two answers differ stays a rehearsal check)_. L4 replaced "find the check the
        Definition of Done is missing and add it" with "remove the `check:stories` line,
        ask the agent what done means, restore it, ask again", because 8c8fdf6a made the
        generated list complete. Decided without the owner, explained 2026-11-18, not
        confirmed. It is in the run-of-show, golden prompts, `/schulung`,
        `/build-your-own`, the outline and the Day 2 deck; a "no" means reverting all six.
  - [x] **Triage before cohort 1: R-253, R-255, R-258, R-259, R-260** (`tasks/reviews.md`) _(all five fixed 2026-11-18 on the owner's "make it fit"; R-255 option (a), customer agenda untouched; the two `TODO(owner)` in `/schulung` Block 06 stay open)_.
        Asked 2026-11-18, unanswered. R-255 is owner wording; the others are course text
        that contradicts itself or the workspace.
  - [ ] **Deprecate the orphaned 0.4.11 on npm** (owner's npm login, optional):
        `npm deprecate <pkg>@0.4.11 "incomplete release, use 0.4.12"` for
        `@atelier-ui/styles`, `angular`, `react`, `vue`, `create-workspace` and
        `create-atelier-ui-workspace`. `latest` is 0.4.12, so only an explicit pin hits it.
  - [ ] **`@atelier-ui/mcp` description names three tools, the server has four**
        (`libs/mcp/package.json:4` omits `tokens-search`). A one-line fix under `libs/**`
        cuts a release by itself; take it along with the next real change.

## Content review 2026-11-17: standard tools as the proof thread

Owner 2026-11-17, after the content review (findings R-236 to R-247 in `tasks/reviews.md`):
the contract shrinks to a trainer mention and the comparison with Figma becomes a look at
both, not a gate run (revises ADR-0179 points 2, 3 and 6 and two of its rejected options);
scope in three waves; new content comes in as stages 1 to 4 of the self-check ladder
(compiler, ESLint, stylelint, story tests with axe) plus a Figma linter in front of them.
The customer agenda is not touched: every change below sits under a sentence it already
has. All minutes are estimates from the run-of-show rows, unmeasured until R-040.

How the new content comes in (**owner 2026-11-17: placement agreed**):

- No new block and no lecture on tooling. One ladder slide in Day 1 Block 00, then each
  stage enters in the block whose agenda row already names its subject, always as the same
  three beats: break it on purpose, the tool says so, the agent gets the output and repairs.
- One take-home page: the ladder as a cheat-sheet card (command, what it catches, what it
  does not see), and the scorecard "what a design system has to bring" as a one-page
  handout (R-245). Both work in a repo that has none of Atelier's checks.

| Stage                    | Tool the participant already has                          | Enters in                                                                                        | Minutes, and where they come from                              |
| ------------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| 0 Design                 | `figma_lint_design`; community plugin as the manual route | Day 1 Block 03 before the checklist; Day 2 Block 01 before the handoff                           | 10 inside the checklist walk; 5 inside the design exercise     |
| 1 Compiler               | `strict`, `strictTemplates`, `npm run build`              | Day 1 Block 04, demo D-4 (an invented value does not compile, an invented static attribute does) | 2 to 3, from the contract half of D-3 (about 5)                |
| 2 ESLint                 | `npm run lint` (template a11y, type-aware rules)          | Day 1 Block 02: the agent runs lint and build and reports exit codes                             | 20, from the parity part (30 to 10)                            |
| 3 Stylelint              | `npm run check:stylelint`                                 | Day 1 Block 00 demo D-1 (already there), Block 05 closing step                                   | 0, wording: the agent runs it                                  |
| 4 Story tests            | `test-run` / `npm run check:stories`, axe                 | Day 1 Block 04 demo D-5 (already there), Day 2 Block 03                                          | 0, already the self-healing loop                               |
| Wiring (not a new stage) | `CLAUDE.md` "Definition of Done", `/verify`               | Day 2 Block 00: open it, change one line                                                         | 10, in place of the `ls .claude/skills` check                  |
| What a DS has to bring   | scorecard handout                                         | Day 1 Block 00 as the map; Day 2 Block 05 as the self-check frame                                | 3 on Day 1 (glossary trim); 0 on Day 2 (frames the self-check) |

Freed elsewhere and spent on the participant's own work: Day 2 Block 02's snapshot row (15)
goes to `docs-show` on the own component and its JSDoc gaps (R-243); Day 2 Block 04's
`codeSpec` and D-8 rows (23 to 8, D-8 on the trainer machine only) go to keyboard, states
and sorting each difference as code, Figma or kept on purpose.

Order of work. Docs, ADR, outline and trainer files are written directly; `.astro`, `.ts`
and scaffold changes go to Sonnet agents.

- [x] Spikes (a) and (c), 2026-11-17, fresh `create-atelier-ui-workspace@0.4.10`
      (`--framework angular --no-figma`), 13 planted mistakes, three commands each; exit
      codes and messages read back from the logs, not taken from the agent's report.
      (a) The compiler catches half of what an agent invents. On `button[atl-button]`:
      `variant="ghost"` fails the build with `TS2322`, static or bound, and the message
      lists the four allowed values; `[shadow]="'lg'"` fails with `NG8002` ("Can't bind to
      'shadow' since it isn't a known property of 'button'"). A static `shadow="lg"` builds
      clean (a plain HTML attribute), and so does `(pressed)="…"` (read as a DOM event).
      Lint adds nothing to those four; it catches the template a11y cases (`alt-text`,
      `click-events-have-key-events`, `interactive-supports-focus`). A raw `<button>`, an
      inline `style=`, `color: red`, `oklch()` and a hex in a component's `styles:` pass all
      three commands; only a hex in a `.css` file fails stylelint (R-241). Warm runs take
      6 to 9 s for build, 6 to 7 s for lint, 2 to 4 s for stylelint.
      (c) One headless run, three mistakes planted (bound unknown input, invalid variant,
      `<img>` without `alt` plus a clickable `<div>`): 78 s, 10 turns, no permission denial,
      both commands exit 0 afterwards, only `app.html` changed, nothing invented; the
      `<div>` became a library button. Two caveats. The failing commands print no error
      text in the agent's shell, only a path to the full log (R-248); the agent found it
      anyway, by a route not traced. And `alt=""` satisfied the rule for an image that
      carries meaning: lint green is not the same as right, which is the sentence the
      block needs. Not measured: a trusted workspace (the headless run ignored the
      workspace allowlist as untrusted and still ran `npm run`), repeatability (one run),
      a participant's own terminal.
      Consequence for the table above: stage 1 is taught on an invented value, not an
      invented name, and the static attribute that builds clean is shown right after it as
      what the compiler does not see.
- [x] ADR-0180 written 2026-11-17 with the measured spike facts, the dated correction in
      ADR-0179 (points 2, 3, 6 and two rejected options) and one in ADR-0175 (the agent runs
      the closing step), and the index row. `check:adr-refs` exit 0. All uncommitted, and
      they have to land in one commit.
- [x] Wave A, wording and order, no new tooling, 2026-11-17: R-236, R-237, R-238 and
      R-246 closed, R-242 closed except "contract" with three meanings (Wave B). Loop
      step 3 is "Generate" everywhere outside the published decks: it is the customer
      agenda's own verb for the step ("erzeugen") and what the loop diagram and four
      reference pages already said. Verified: `check:format`, `check:adr-refs`,
      `check:docs`, `check:docs-layout`, `check:llms`, `check:stylelint` and
      `nx build docs` exit 0; the Angular tutorial sample builds, lints and stylelints
      clean in a fresh scaffold. Not verified: the React and Vue samples; `check:all`
      as a whole. Found on the way: R-249 (the cheat sheet does not print).
- [ ] R-249 before cohort 1: the cheat sheet's print layout (five pages, unreadable).
      Not wording, so it is its own step.
- [x] Wave B, new content, 2026-11-18: R-243, R-244, R-245, R-247 and the rest of R-242
      closed. Outline first, then the participant pages, run-of-show, demo scripts, golden
      prompts (§1a to §1c, §2.5, §2.6), trainer notes, dry-run kit and three handouts
      (`workshop/handouts/`: scorecard, Figma readiness, Storybook readiness);
      `npm run trainer:print` regenerated `tasks/print/`; both decks republished (Day 1
      version 28, 59 slides; Day 2 version 20, 54 slides). What changed for a participant:
      the ladder of five standard tools with the agent running each check, the Figma linter
      as stage 0, `docs-show` on the own component, the rules file exercise, the scorecard
      as map and self-check, and "contract" as the deliberate differences in the handoff
      document, with no contract file and no `figma:snapshot`/`check:contracts` on the
      participant path.
      Verified: `check:format`, `check:docs`, `check:docs-layout`, `check:llms`,
      `check:stylelint`, `check:adr-refs`, `check:component-count`, `check:sync` and
      `nx build docs` exit 0; `node tools/e2e/schulung-claims.e2e.mjs` exit 0 (every named
      command and Figma reference exists); the published `deck.json` order read back equals
      the outline, 59 and 54 ids; no foreign edits before the publish (108 file sizes equal
      to the backup); `check_deck.py` reports only the known false positive (`d1-00-09`);
      contact sheets of the changed slides looked at.
      Not verified: `check:all` as a whole; the published decks in the claude.ai viewer
      (local render only); the Codex cross-check, which failed twice on 2026-11-18 with
      `model_not_found`, so the consistency review ran as one fresh-context Sonnet agent
      instead of a second model.
      Weakest point: the `atelier-component` skill of a Figma workspace still tells the
      agent to write a contract file and run `check:contracts`, so the generation step can
      show a participant the thing the course just took off their path. It is a trainer
      note on `/schulung` and in the D2-02-03 speaker notes; the fix is a scaffold change
      and belongs to Wave C. And `/verify` at exit 0 in a Figma workspace is read from
      `check-contracts.mjs`, not run.
      Consistency review, 2026-11-18 (one fresh-context agent, 15 findings, each checked
      against the cited line before acting): 12 fixed. The undo rule now reads the same
      everywhere (stop, go back to the last green commit, then re-diagnose, no third
      patch: `/schulung`, run-of-show, trainer notes, outline and slide D2-03-03); the
      golden-prompt map on `/schulung` names §1a to §1c, §2.5 and §2.6; the scripts list
      says `lint`, `build`, `check:*` (the scaffold writes no `verify` script, `/verify`
      is a command file); `/design-to-code` sorts a parity difference into code, Figma or
      a deliberate difference and no longer calls the contract file the thing that
      transfers; `/tutorial` step 2 says the deliberate differences are written on Day 2;
      golden prompt §1b equals the page's `CHECKS_PROMPT`; §2.6 no longer asks for a
      count word that would make the generated sentence about `/verify` false. Two are
      left on purpose: `/verify` runs `check:contracts` in a `--figma` workspace and the
      `atelier-component` skill writes a contract file (both Wave C, rehearsal item 8).
      One is the owner's: the customer agenda says "Skills für den Agenten einrichten"
      for Day 2 Block 00, and no participant sets up a skill there; they edit one line
      of the rules file and see the shipped skill (ADR-0180 point 3).
      Verified after the fixes, by exit code 0: `check:format`, `check:docs`,
      `check:docs-layout`, `check:llms`, `nx build docs`,
      `tools/e2e/schulung-claims.e2e.mjs`, `trainer:print`, `check_deck.py` on Day 2;
      Day 2 deck republished as Version 22 (slide D2-03-03 only).
- [x] uianatomy out of the course and the scaffold, and Day 2 Block 00 explains what a
      skill is (owner 2026-11-18; ADR-0181; R-250, R-251). Why: the hosted server is
      sometimes overloaded, the generated preflight probed it on every seat, and demo D-7
      called it live. Scaffold: no `.mcp.json` entry, no copied skill, no rules-file
      section; spec tests pin the absence. Course: D-7 is now "What a skill is, on a
      local file" with checkpoint D2B00-C2 and rehearsal check 9; the wiring row names
      four things on two files; "five servers" is "four" everywhere. Pages: `/schulung`,
      `/workshop` (the `.mcp.json` sample and both preflight samples, recounted),
      `/mcp`, `/agent-skills`, `/build-your-own`. Decks: Day 1 slide D1-04-04, Day 2
      slides D2-00-04, D2-00-05, D2-00-06, D2-05-04, republished.
      Left on purpose: the repo's own `.mcp.json`, `AGENTS.md`, `.claude/skills/uianatomy-mcp/`,
      `.agents/skills/uianatomy-mcp/`, `skills/design-to-code/` and
      `check-skill-discovery.mjs` (maintainer tooling), the briefs' provenance, the
      sample brief text on `/design-to-code`, two code comments in the React and Vue
      menu, and all history.
      Verified, by exit code 0: `nx test create-workspace`,
      `nx lint create-workspace`, `nx lint create-atelier-ui-workspace`,
      `sync-preflight.mjs --check`, `check:adr-refs`, `check:format`, `check:docs`,
      `check:docs-layout`,
      `check:llms`, `nx build docs`, `tools/e2e/schulung-claims.e2e.mjs`, the deck
      checker on Day 2 (Day 1 exits 1 on its one known false positive, D1-00-09).
      Red and not caused here: `gen-scaffold-snapshot.mjs --check` reports `[DRIFT]`
      for the `AtlButton` master, from the already modified `tools/figma/snapshot.json`.
      Not verified: the new D-7 on a real seat (rehearsal check 9); `cli.e2e.mjs`; any
      generated workspace built from the changed preset.
      Weakest point: D-7 shows the `atelier-component` description, which in a Figma
      workspace names the contract loop and `check:contracts` (Wave C); the trainer has
      one sentence for it. And every "four" is false on a machine provisioned from the
      current release (R-252).
- [ ] Release the scaffold with the uianatomy removal and provision the course machines
      from that release (R-252). A push is a release run.
- [ ] Wave B leftovers. Rehearsal (R-040), the nine numbered items in
      `tasks/schulung-dry-run-kit.md`: the planted-break prompts in 20 minutes, the
      three-rule Figma lint count, 5 minutes for the remaining readiness rows, the two
      Block 00 answers after `/clear`, `docs-show` over the local MCP and its refresh after
      a JSDoc edit, "read the full log" while R-248 is open, FigmaLint without an API key
      (owner), `/verify` at exit 0 at the end of Day 2, the D-7 question on every seat in
      five minutes. Decks: the screenshot placeholder on
      `d2-02-04` and the FigmaLint bullet on `d2-05-05` (speaker notes only until the owner
      has seen the keyless run). Wording: §-references to the golden prompts in the task
      docs carry no anchors; the contract passages left on `/design-to-code`, in the cheat
      sheet's clone paths and in `/build-your-own` step 7 describe the Atelier repo and stay.
- [ ] Wave C, scaffold, only with a release and the R-040 rehearsal: R-239; cohort 2:
      R-240, R-241, a browser check stage, the scorecard as a docs page, an eval exercise.
- [ ] Figma lint plugin. **Owner 2026-11-17:** FigmaLint, by the author of
      figma-console-mcp (Southleft). Read from the vendor post (2025-07-02) and a third-party
      listing mirror, the official Community page answered 403: free; checks interactive
      states, WCAG (contrast, touch target, focus indicator, font size), component readiness
      (properties, descriptions), detached instances, variables against hard-coded values,
      generic layer names, and gives a readiness score; "AI API key is optional" (Anthropic,
      OpenAI or Google, the user's own key), and which checks run without a key is not
      stated; it can write to the file ("Apply fixes", "Fix All", bind to variables);
      exports Markdown and JSON. Open before it goes on a slide: install it on one course
      machine, run it without a key (ADR-0178: the course has subscription logins, no API
      keys) and note what still works; decide whether the course shows the fix buttons at
      all, since the block's rule is "never mutate the master". 2026-11-17: installed on
      the owner's machine; the run without a key is the owner's, a plugin cannot be driven
      through the bridge. Wanted from it: which checks work without a key, the Markdown or
      JSON export for `Inputs/AtlButton`, and whether it also reports the hidden
      `_disabled-overlay` label as a contrast failure.
- [ ] Spike (b), half done 2026-11-17 (bridge connected to the Atelier file, read-only):
      `figma_lint_design` on the master `Inputs/AtlButton` (`129:20`), default rules:
      121 nodes, 59 findings, none of the ones looked at is a defect. 18 "critical"
      `wcag-contrast` (3.9:1, `#64748B` on `#E2E8F0`) all sit on the `label` inside
      `_disabled-overlay`, a frame with `visible: false` bound to the `disabled` Boolean
      property, so the linter reads a hidden layer, and a disabled control is exempt from
      the contrast criterion anyway; 40 `no-text-style` because the file binds `fontSize`
      and `fills` to variables and uses no text styles; 1 `no-autolayout` on the component
      set itself. 0 `hardcoded-color`. A rule filter by id works
      (`rules: ['hardcoded-color', 'default-name', 'detached-component']`); on the page
      `default-name` then reports vectors inside nested instances, as `/readiness` warns.
      Consequences for the block: the exercise prompt names the rules, it does not run the
      default set (59 findings on the reference master after lunch is noise); the 18 false
      criticals are a ready example for "a finding is something to sort, not a verdict",
      trainer only. Still open: the positive case (a raw colour on a duplicate, does
      `hardcoded-color` fire and how does it name the layer) and the runtime, both on a
      course duplicate, not on the Atelier file.

## Near-term work

Ranked; each carries why it's worth doing next rather than later.

### Atelier MCP package (ADR-0177, owner go 2026-10-21)

Atelier keeps its library as the lab; `@atelier-ui/mcp` (modelled on CDS-ADR-0012) is where we
measure how much design-system knowledge an agent can use. Measure first, then build. Pushes and
anything in the CDS repo need the owner's go. Eval runs use the subscription quota.

- [x] **M0 Eval spike.** _(done 2026-10-21: `tools/mcp-eval/`, `npm run eval:mcp`, 66 offline checker tests as `test:mcp-eval`. Baseline 13 questions × 3 repeats, sonnet, after checker fixes via recheck: without 48 % (47–49), hosted Angular endpoint 96 % (95–97), gap 47 pts vs spread 2.6. Findings: (1) ceiling — L0 already scores 96 %, so M2 needs questions L0 cannot answer (tokens, when-to-use, composition, component-specific a11y), else layer effects are invisible; (2) `tokens-contrast` 56 % with server, invented `--ui-color-danger-light`: manifest exposes few `--ui-*` tokens → first L2 candidate; (3) `dialog-a11y` no longer separates the variants, needs an `atl-dialog`-specific claim; (4) context cost: 25.9 k vs 1.4 k input tokens per answer. Isolation: `--setting-sources ""`, strict MCP config, no tools, neutral system prompt, temp cwd, verified per run; org instructions and account context still leak into both variants. Unexplained: one 240 s timeout during the smoke run.)_ Question set (Angular, mixed: API lookup, "which component for X",
      styling/tokens, a11y, composition), runner `claude -p` with/without MCP, checker per
      question. Baseline: hosted Angular endpoint vs. no server, ≥3 runs each. Done when the
      report shows a with/without gap larger than the run-to-run spread; if not, the question
      set is redesigned before anything is built.
- [x] **M1 Package L0** _(done 2026-10-21: `libs/mcp`, `check:mcp-package` in `check:all`, private, not in the release group. Eval 13 × 3: local 94 % (92–95) vs hosted 96 % (95–97) — equivalent within noise (2 pts ≈ one failed check per run), same failure types. Layer seam `ATELIER_MCP_LAYERS`; likely too narrow for L1/L2, which must transform manifest content. Lockstep release needs the owner's go — seven steps listed in the agent report: nx group, drop `private`, release block, publish target, Storybook pin, publishConfig, snapshot before pack in CI.)_ `libs/mcp` → `@atelier-ui/mcp`: stdio, Angular manifest snapshot from the
      same build, `@storybook/mcp` pinned to the Storybook version, `instructions` with hard rules,
      version-mismatch warning. Smoke test on the packed tarball as a gate in `check:all`. Done
      when the eval reaches at least the hosted endpoint's score.
- [ ] **M2 Layers L1–L6, one at a time** _(question set ready 2026-10-21: `questions-layers.json`, 15 questions tagged L1–L5, each fact checked present in its layer source and absent from the manifest; L0 hosted scores 52 % (51/53, 2 repeats) — the ceiling is gone. Compare L0 vs L0+layer, not vs `without`. L3/L4 are thin (2 and 1 questions survived): contract mismatches and ARIA notes are mostly derivable from docgen or generic knowledge — possibly a result in itself. Knowledge that contradicts the source must be fixed before it becomes a layer: R-230.)_ (purpose, tokens/styling rules, contract mismatches,
      anatomy/a11y, composition/anti-patterns, instructions). Done per layer when its ablation
      run is recorded (effect, spread, token cost, snapshot size) — a layer without effect is
      removed again, and that is a result too.
  - [x] **Ablation L1 + L2** _(2026-10-21, `questions-layers.json`, 15 q × 3 repeats, sonnet, local package; report `eval-2026-10-21T14-35-40-439Z`, gitignored)_:
        overall L0 53 % (51–53) → L1 64 % (61–67) → L2 64 % (62–69) → L1+L2 72 % (72–72).
        On their own questions: L1 50 % → 96 %, L2 71 % → 100 %. Layers are additive and do not
        touch other layers' questions (L3–L5 unchanged = control). Knowledge made answers cheaper:
        input tokens per answer 27.6 k (L0) → 23.8 k (L1+L2), tool calls 4.3 → 3.6 (focus-ring:
        6.3 → 1.3). `chip-filter`: badge's `useInstead` names "a dedicated chip/tag component" that
        does not exist, so the model improvises (badge wrapping a button) — a pointer to nothing is
        not guidance. Still open: L3 (2 q, both 0 % in every variant — figma-node-dialog is trivia),
        L4 (1 q), L5 composition layer (source: `docs/src/data/patterns.ts`), L6 instructions split.
  - [x] **Ablation L5 + all** _(2026-10-22, same set and method; report `eval-2026-10-22T04-47-11-164Z`)_:
        L0 54 % (53–56, reproduces 53 % of the day before) → L5 61 % (60–62) → all four layers
        85 % (78–89). L5 on its own questions 56 % → 100 %. All layers: L1 88 %, L2 98 %, L5 100 %,
        L3 33 % (loading-button-grey 2/3 — helped by other layers, not by a contract layer), L4
        67 %. Cost: L5 adds tool calls on its questions (5.3 → 7–8); all layers 28.0 k vs 26.0 k
        input tokens. Open: chip-filter (no chip component to point at), L3/L4 layers, L6
        instructions split, second model.
- [ ] **M3 Best-practice catalog** (started 2026-10-21 at `plan/mcp-best-practices.md`, 9 entries with evidence; open: L5, second model): one entry per proven practice —
      claim, questions it was proven on, measured effect, cost, DS-neutral wording, CDS transfer
      status. Done when every M2 layer has an entry (kept or rejected).
- [ ] **M4 Replace the hosted endpoints**: scaffold `.mcp.json`, `AGENTS.md` table, docs pages,
      worker route, correction in ADR-0173. Not before cohort 1 unless R-040 rehearses on the
      package. Done when no hosted MCP URL is left and `check:all` exits 0.
- [ ] **M5 Rename** `@conciso/design-contracts` → `@atelier-ui/contracts` (package, imports,
      `sync-preflight`, scaffold, docs). Done when `check:all` exits 0 and no `@conciso/` name is
      left outside history.
- [ ] Triage `tasks/reviews.md` rows that waited on the CDS migration.

### Customer angle: existing Storybook + guardrails (owner go 2026-10-20)

Focus review 2026-10-20: customers mostly already have Figma, a CI and a Storybook. The pitch
for them: AI-generated frontends need not sprawl if the frontend is fenced in (Storybook MCP,
tooling, preselected tech), and the agent then uses their library and tokens. Two gaps:
`/readiness` checks Figma masters only, nothing says what an existing Storybook must deliver
before `docs-show` answers usefully; and D-1 shows that context steers, never that a gate
catches what slips through. Agenda unchanged before R-040 (owner: stages 1+2 now, a
brownfield Day 2 track only after cohort 1).

- [x] **S1 Storybook readiness page** `/storybook-readiness`. Done when: checklist items are
      each tied to what the manifest/`docs-show` actually emits (no claimed field the 10.6
      docgen does not produce), every "verify" line is a command or MCP call that exists;
      one annotated real `docs-show` excerpt (hosted Angular endpoint), no invented
      before-output; a self-check prompt + 30 min timebox in the `/design-principles`
      check-your-own pattern; linked from `/readiness`, `/storybook`, nav; offered as the
      second choice in Day 2 Block 05 transfer (`/schulung`, `/build-your-own`, run-of-show).
- [x] **S2 D-1 third step: the gate catches it.** Done when: D-1 script, `/prompts#guardrails`
      and `/schulung` Day 1 Block 00 show window (a)'s CSS dropped into a scaffold workspace
      `.css` file and the stylelint target turning red on `atelier/no-raw-color-literal`;
      exact target name verified; the limit stated (only `.css` files are linted — inline
      `style=` or `styles:` strings are not).
- [x] `npm run check:all` exit 0, generated files (llms.txt etc.) regenerated.
- [x] **S3 Consumer case in the agenda (owner go 2026-10-20: replace the kata).** Day 1 Block 05
      (second round of the same Settings Card) becomes: build a screen only from existing library
      components, with Storybook MCP (`docs-list`/`docs-show`) as the only source, no Figma frame,
      no guidance, against the clock. Done when: a participant page states the screen brief, the
      done-when and the gates a participant can actually run in the scaffold (verified target
      names); `/schulung` Block 05, run-of-show, dry-run kit, trainer notes and golden prompts
      updated; every reference to the kata as Block 05 retargeted (the `/first-component` page and
      its `#bridge` homework stay); ADR recorded; customer agenda doc updated; `check:all` exit 0.
      Done 2026-10-20: `/screen-from-storybook` (Team directory, six components), ADR-0175. Owner then
      asked for MCP-derived content: querying the hosted Angular MCP found the AtlTable usage example
      garbled (`@for` at line start in JSDoc is parsed as a tag) — fixed in `atl-table.ts` (one row +
      comment; `\@for` / `&#64;for` render as junk), plus a page section on what `docs-show` gives and
      where its gaps are. Unverified: hosted output after deploy, React/Vue, all timings (R-040).
      Open owner question: Day 2 Block 04 parity labels lost their Day 1 practice — label in Block 02?
- [x] **S4 Parity labels split (owner ok 2026-10-20).** Day 1 Block 02 labels each parity finding
      "code or Figma" (contracts are not taught yet); Day 2 Block 04 adds "contract". Done when
      `/schulung`, `/tutorial` (if it carries the verify step), run-of-show, trainer notes, outline and
      both decks say so; timings unchanged.
- [x] **S5 R-223** drop the hand-typed component count from the three `introduction.mdx`; widen
      `check:component-count` to `libs/*/src/**/*.mdx`. Done when the gate fails on a planted number.
- [x] **S6 R-222** AtlButton `variant`/`size` values visible in `docs-show` (all three frameworks);
      `/storybook-readiness#closed-values` shows before/after instead of citing it as a live defect.
- [x] **S7 R-221** (ADR-0176) purpose reaches agents: spike first (how `purpose`, the class JSDoc,
      `parameters.docs.description.component` and `story-description-source` relate after 5b4b5b00),
      then owner-approved change + ADR.

**Review 2026-10-20.** Verified: every checklist item read against real Storybook 10.6.0 Angular
output (hosted MCP + CLI); the red stylelint run is real (3× `[RAW-COLOR]`, 1× `[UNDECLARED]`) but on
a stand-in workspace with the scaffold's rule files and config shape, not a freshly generated one.
Unverified: React/Vue output shapes; story-JSDoc descriptions rendering; what window (a) of D-1
actually emits (no hex → gate stays green → use the pre-saved output). Weakest point: the gate
only reads `.css` under the app's `src/`; inline `style=`, `styles:` strings and a raw `<button>`
pass — the demo names this instead of hiding it. Side findings: AGENTS.md CLI `docs show <id>` was
wrong (fixed to `--input`), R-221 (purpose never reaches `docs-show`), R-222 (AtlButton alias types).
Open: deck outline slides D1-00-05 and the Day 2 Block 05 transfer slide need the same change
(outline is untracked, not edited).

### Component knowledge projection (owner go 2026-10-16)

Triggered by DSDS 0.23.0 (designsystemdocspec.org). A throwaway spike (2026-10-16, scratchpad,
not committed) derived a schema-valid DSDS doc for AtlButton from our sources; validate/lint exit 0
but trait descriptions and rule levels were placeholder glue. Owner: no need for the exact schema —
derive a similar, own-format projection from what we already own. Inventory found every fact has
an owner and a gate, but nothing joins them, and behaviours (`behaviors.json` → `covers()`) reach
no agent-facing output at all (0 hits in `llms-full.txt`).

- [x] **Step 1 — cleanups the projection needs** _(done 2026-10-16, 5b4b5b00; found 4 dangling `relatedComponents` and 4 components missing from `DOCS_PRIMARY_SPECS`)_
  - [x] Component description has one owner: docs `components.ts` `description` derives from
        `metadata.purpose` where metadata exists (precedent: `docs/src/data/accessibility.ts`).
        Today Button's two texts disagree. JSDoc and the Figma master description stay as they are.
  - [x] `relatedComponents` validated by `check:metadata`: every entry names an exported spec
        interface in `libs/spec/src/index.ts`; Button's stray `'AtlToggle'` fixed.
  - Dropped: a `level` field on `antiPatterns` — no data to fill it; the generator defaults to
    `should-not` and says so.
- [x] **Step 2 — generator + drift gate + ADR** _(done 2026-10-16, ADR-0174: `gen:knowledge` / `check:knowledge`, 26 components + index, listed in `llms.txt`; toast and code-block under `missing`. Open follow-ups: token lists are noisy (every `--ui-*` the stylesheet uses); usage rules stay `verifiedBy: "none"`)_: one JSON per component joining metadata,
      contract, behaviours (+ their `covers()` test sites), manifest/story pointers and token
      intents; `check:knowledge`-style drift gate; ADR for the format decision (own format, not
      DSDS-exact, not a new source of truth). Long-term home: `@conciso/design-contracts` (CDS, P6).

### First cohort, end of November 2026 (decided 2026-10-12)

Owner, 2026-10-12: the course runs at the end of November 2026, on Atelier's own library, Angular
only; the CDS switch (ADR-0165) waits until after it. Consequence: the `## Until P6` section of
`tasks/reviews.md` is live again for Angular, and course blockers that do not depend on the CDS
come first. Ranked:

1. **Course blockers (CDS-independent):** R-040 timed rehearsal on a non-author machine (with the
   R-170 `cli-e2e` run), R-043 unverified participant steps, R-044 pre-workshop mail / setup PDF,
   R-049 trainer kit, R-041 agenda gaps, R-042 recovery path — now against the Atl kata, not the
   CDS one.
2. **Atl defects participants see in Angular:** R-134 danger focus ring, R-133 RadioGroup name,
   R-135 button loading focus, R-145 /accessibility claims, R-144 Angular toast snippet, R-146
   React-shaped `llms-full.txt`, R-148 token collection name; then R-137–R-143 by demo exposure.
3. **Revived triage closures:** `OBSOLETE-CDS` rows of
   `tasks/archive/review-triage-2026-10-11.md` that an Angular cohort on Atelier hits again —
   7 of 124 revived on 2026-10-12 as R-176–R-182 (R-176/R-177 touch the kata's Card and Button
   parity, so they rank first); none blocks the course.
4. Everything else in `tasks/reviews.md` that names the CDS waits for the resumed migration.

**Status 2026-10-12** (pushed `80dae6b6`, `check:all` green):

- [x] Machine part of R-040, scripted in a fresh Angular workspace from the published scaffold:
      setup and every scaffold gate green in ~3 min machine time (warm caches). Scope (owner):
      Claude login and Bridge setup stay pre-work and are not rehearsed.
- [x] R-043 write-a-story example red/green in a generated workspace; R-159 claims script kept.
- [x] R-170 scaffold e2e green for all three frameworks (7m54s, Verdaccio, `check:stories`).
- [x] R-183–R-188 fixed: Node claim, `check:contracts` external-skip message (reaches
      participants with the next scaffold release), plugin-pin case in `/troubleshooting`,
      preflight sample and no-op `npm install`, scaffolder `--help` and non-TTY exit 1,
      claims-script port probe.
- [x] R-189 lint stack trace (`tools/eslint-rules/tsconfig.json` ENOENT) in the generated
      Angular workspace — small, next.
- [x] Nx 23.2.0 → 23.3.0 in repo and scaffold (no migrations). Generated workspaces use
      inferred lint (`@nx/eslint/plugin`), no `@nx/eslint:lint` warning. That switched on the
      type-aware lint blocks ADR-0140 lever 5 meant to add (corrected there); three scaffold
      defects fixed. `check:all` and scaffold e2e green. R-192 fixed; R-190, R-191 open.
- [ ] Human part of R-040: kata, Day 2 and block timing on a non-author machine, per
      `tasks/schulung-dry-run-kit.md`.
- [x] R-176/R-177 (owner: Figma moves): Button master aligned with code; Card tracking
      documented as a deliberate mismatch (no per-component tracking in Figma styles).
- [ ] Rest of item 1 (organisational parts — setup mail, provisioning, notices, feedback — handled separately by the owner, 2026-10-13): R-044 deck (briefs done 2026-10-13; both decks built 2026-10-14, open: cohort date, follow-up channel, screenshot placeholders), ~~R-049 run-of-show/demo scripts/cheat sheet~~ (done 2026-10-13), ~~R-041 agenda gaps~~ (done 2026-10-12), ~~R-042 recovery
      path~~ (done 2026-10-13). Then item 2.
- [x] Docs navigation for the course (owner go 2026-10-13; done same day, ADR-0169, `check:all` green): Day 2 has no participant page —
      the workshop track ends at the Day 1 kata, Day 2 lives only on the instructor page
      `/schulung`. Steps: (a) new participant page for Day 2 as track step 7, briefs visible
      on the site; (b) an always-open "Course kit" sidebar group (glossary, briefs, prompt
      rubric, guardrail demo, rescue path); (c) `/claude-design` → "For instructors",
      `/runbook` into the sidebar; (d) TOC on `/prompts`, `/schulung` link on the front page
      (R-062). Done when `check:all` is green and every link resolves on the built site.
- [x] Scaffold release on npm: `check:release-drift` in sync after the Publish run.

**Status 2026-10-14** (course review and owner decisions; not committed at the time of writing):

- [x] Course review (plausibility, gaps, `/schulung` as a trainer tool): findings filed as
      R-205–R-219; per-block trainer notes in `tasks/schulung-trainer-notes.md`.
- [x] R-205 contradictions and R-206 drifts fixed across `/schulung`, `/build-your-own`,
      `day2-done.ts`, the run-of-show, the golden prompts, the briefing §6 and the deck outline.
- [x] Owner decisions 2026-10-14, all as recommended, applied in the same session: R-207 Figma
      micro-exercise (Day 1 Block 03), R-208 bridge exercise as green-seat homework and the
      contract walk-through first in Day 2 Block 02, R-209 `/prompts#claude-code-basics` in the
      rescue slot, R-210 undo rule (Block 03, `/cheat-sheet`, `/design-to-code`), R-211 API rules
      before the handoff (Day 2 Block 01), R-212 Day 2 Block 03 90→75 and Block 05 16:25–17:30 with
      15 min workspace anatomy (every Day 2 time after 14:45 is 15 min earlier), R-213 mail step
      (`/workshop#send-preflight`), R-215 one Figma duplicate, R-216 prompted story, R-217 block
      anchors and `npm run trainer:print` (`tools/scripts/trainer-print.mjs`, `tasks/print/`
      gitignored), R-218 run-of-show rule R12, R-219 `/verify` bullet. Deck outline follows
      (53 + 50 slides, 208 line citations re-verified).
- [x] Gates: prettier, `nx lint docs`, `check:docs`, `check:llms`, `check:docs-layout`,
      `tools/e2e/schulung-claims.e2e.mjs` (`E2E_PORT_BASE=4410`), `trainer-print.test.mjs` and
      `check:all` all exit 0.
- [x] R-044: both decks regenerated from the outline on 2026-10-14 (Day 1 version 13, 53 slides;
      Day 2 version 10, 50 slides); still open on the decks: cohort date, trainer names, wordmark,
      follow-up channel, rehearsal screenshots.
- [x] R-047: the parity double call ran live on AtlButton (call 1 flags the wrong `gap`, call 2
      without `spacing` shows no spacing row, score 48 → 72); demo D-8, golden prompts §3.3,
      dry-run kit, trainer notes and the two pages carry the observed behaviour. Real drifts
      found on the way → R-220 (button padding 18/14 vs 20/16, weight 600 vs 500).
- [x] R-203 reproduced and fixed: the breaking commit was scoped `a11y`, no project name, so
      nx's `useCommitScope` downgraded it to an indirect patch before the 0.x mapping;
      `release.conventionalCommits.useCommitScope: false` (ADR-0172), verified by dry run.
- [ ] R-214 desk-checked (Starter has no modes per Figma's plan table; duplicate behaviour
      undocumented; dev-plugin import is on any plan); the live Starter test stays.
- [ ] R-214: verify Figma free-plan Dark mode in the duplicate and the dev-plugin import before
      R-040. Organisational (owner): second person for Day 1 Block 01, spend cap per seat.

### Course content review follow-up (2026-10-10)

Source: `tasks/archive/reviews/content-review-2026-10-10.md` (§ numbers below refer to it). Owner, 2026-10-10:
start the quick fixes now; the structural rework (§3–5) is ordered against the CDS switch
(ADR-0165), so pages that get rewritten anyway are not polished twice.

**Wave Q — quick fixes (§6), survive the CDS switch** — done 2026-10-10 (Q1–Q11; gates
`check:format`, `check:docs`, `check:llms`, `check:adr-refs`, `check:docs-layout`, `nx lint docs`
green; two scaffold-port allowlist entries for the new 6006 lines in `workshop.astro`).

- [x] Q1 `schulung.astro`: delete the "Drei Gates werden erwartungsgemäß rot" bullet (contradicts
      the verify section); replace `libs/design-contracts/bin` + `libs/<fw>/src/lib/<name>`
      with the scaffold paths (`tools/design-contracts/bin`, `workshop-<fw>/src/…`)
- [x] Q2 one parity prompt everywhere: tutorial + first-component take design-to-code's
      "say whether code, master or contract … fix only the code ones"
- [x] Q3 kata pass bar: "0 discrepancies" → every discrepancy fixed or labelled, plus one thing
      the report did not check
- [x] Q4 kata step count: agenda "sechs" vs. kata "seven"; tutorial "5 Schritte" vs. page
- [x] Q5 `figma-console-mcp@latest` → the scaffold pin; `${FIGMA_ACCESS_TOKEN}` → `${…:-}`
      (figma-token, troubleshooting)
- [x] Q6 `mcp.astro`: ".mcp.json wires only the three hosted endpoints" → actual server list
- [x] Q7 `workshop.astro`: Playwright install, Storybook 6006, `/mcp` check with expected output,
      `claude auth login --console` (as in the agenda)
- [x] Q8 `claude-md.astro`: "open your generated CLAUDE.md first", strip ADR refs from the
      template, Angular as default tab
- [x] Q9 `tokens.astro`: React token import → Angular
- [x] Q10 agenda points participants at `tasks/schulung-golden-prompts.md` (not served) → reword
- [x] Q11 small wording: uianatomy tool count; "No exceptions" (design-principles) vs. the scan's
      findings; figma "same name, no translation" vs. empty `codeSyntax.WEB`;
      `/doctor` vs. `claude doctor`; `lsof | xargs kill` warning; preflight prompt string
      German vs. English

Follow-ups found while fixing — done 2026-10-10 except the AtlProgress debt:

- [x] React token import: **no defect.** The review called `@atelier-ui/react/styles/tokens.css`
      invalid because the source `package.json` has no `exports` entry; but the package has no
      `exports` map at all and the 0.4.1 tarball holds `styles/tokens.css`, so the import resolves.
      The line wrongly removed from `gen-llms-txt.mjs` in 19fa9b91 is restored (see lessons.md).
- [x] Pin drift: `check:docs` now fails with `[MCP-PIN]` when a docs page or `.mcp.json` cites
      another `figma-console-mcp` version than `preset.ts` (negative-tested). The two figma sync
      scripts spawned `@latest`; they now read the pin via `tools/scripts/lib/figma-console-pin.mjs`.
- [x] Second `lsof | xargs kill` in troubleshooting got the warning.
- [x] `:-` rationale spiked (Claude Code 2.1.296, `claude -p --debug`, both `--mcp-config` and
      project `.mcp.json`): an unset `${VAR}` gives a per-entry "Missing environment variables"
      warning and the server still starts; nothing rejects the file. `figma-token.astro` now says
      the token is optional and the default avoids the warning.
- → **R-131** AtlProgress: `aria-progressbar-name` still disabled as a11y debt in all three libs; the
  a11y-workflow worked example now carries a dated correction.

**Wave S — structure (§3–5), with or after the CDS swap**

- [x] S1 done 2026-10-10: `/schulung` rebuilt to §3 in English — why / pages / done / stretch / recap per block, Claude Design demo in a trainer appendix, kata names in one `TARGET` constant; `schulung-claims` e2e follows it (passed with `E2E_PORT_BASE=4500`, 4401 was taken locally).
- [x] S2 done 2026-10-10: `design-to-code#contract-example` (AtlToast, real failing/passing output), `#finding-codes`.
- [x] S3 done 2026-10-10: `check:contracts` + `check:stories` before parity in tutorial and kata; kata pass bar includes them.
- [x] S4 done 2026-10-10: `storybook#write-a-story` (story + `play`, see it red then green, read a failure); the rest of `/storybook` is local-only.
- [x] S5 done 2026-10-10: `design-to-code#handoff-example` (Toast), linked from the four briefs and kata step 1.
- [x] S6 done 2026-10-10: `mcp#your-servers`; maintainer part under its own heading.
- [x] S7 done 2026-10-10 (ADR-0167): scaffold ships `uianatomy-mcp` + `figma-workspace-architect` (with `--figma`), sync-gated; `agent-skills#your-skills` says what ships and how to retry the Storybook skills.
- [x] S8 done 2026-10-10: `/readiness` (11 master checks with Figma fix steps, 5 system groups, concepts); old anchors stubbed.
- [x] S9 done 2026-10-10: `a11y-workflow#a11y-in-the-loop`; maintainer history under its own heading.
- [x] S10 done 2026-10-10 (ADR-0168, superseding 0166): maintainer content ships as collapsed `<details>` — `/runbook` whole page; sections on mcp, a11y-workflow, figma, tokens, claude-design, design-principles, design-to-code, storybook, agent-skills, skills/*. Participant entries moved to troubleshooting (`#plugin-update`, `#stale-instances`).
- [x] S11 done 2026-10-10: `tokens#naming`, `/readiness` (scopes, modes, properties, fixing a
      failing master), `claude-design#artboard-to-master`, `design-principles#check-your-own`.
- [x] → **R-041** _(done 2026-10-12, see tasks/reviews.md)_ Gaps the new agenda links around (§3): a glossary (B12), a guardrail demo with and
      without a DS (A5), a published prompt rubric (Day 2 block 03), a rescue path for a red
      setup beyond `/troubleshooting`.
- [x] → **R-043** _(done 2026-10-12: example red/green in a generated workspace; packed-tarball e2e green as R-170)_ Unverified since 2026-10-10: the `storybook#write-a-story` example (`Disabled` story +
      `toBeDisabled`) was not run in a generated workspace; the packed-tarball e2e
      (`libs/create-atelier-ui-workspace/e2e`) needs network and was not run.
- → **R-065** Open call: the token value catalogue on `/tokens` (`#colors` … `#motion`) stays visible
  for kata lookups; hide it with the CDS swap if participants no longer use Atelier tokens.
- → **R-005, R-042** S12 recovery path per tutorial/kata step; bridge exercise compose → build new (§5.10–11)
- [x] S13 Atl/Atelier-file → CDS swap across agenda, ~18 pages, briefs, trainer files (§7); _(closed 2026-10-11 by the review triage: DUPLICATE; see tasks/archive/review-triage-2026-10-11.md)_
      blocked on the CDS kata target (P4)

**Owner decisions (§9)** — decided 2026-10-10:

- Agenda: §3 is the target structure (mini-loop before lunch, readiness on your own master,
  transfer block Day 2). Built now on the current kata component; the CDS swap (S13) replaces it.
- Agenda ↔ track: each agenda block links its pages (`pages` field); the track stays the
  self-serve path.
- Claude Design demo: optional / trainer appendix, not a core block.
- Language: everything English, the agenda included (no more "(German)" notes).
- Maintainer content: stays on the pages but renders only in local dev (`nx serve`), not in the
  deployed build (ADR to record the mechanism).
- Skills: the scaffold adds `uianatomy-mcp` (always) and `figma-workspace-architect` (with
  `--figma`), copied and sync-gated. `design-to-code` is NOT shipped: it is monorepo-bound
  (~60 % of it names repo paths and gates) and would collide with the scaffold's
  `atelier-component`, which already is the design-to-code loop for a workspace (owner,
  2026-10-10). `atelier-design`, `artboard-bridge`, `design-to-code` stay repo/trainer.
- Cohort: up to 8 (show & tell in 50 min holds, ~5 min each).
- `/schulung` hero: Angular by default, other frameworks on request, one framework per cohort.
- AtlProgress a11y debt: later, not now (the CDS swap may replace the component).

### Docs-site critique follow-up (2026-10-07)

Impeccable critique of the docs site scored 27/40 (snapshot in
`.impeccable/critique/2026-10-07T17-32-18Z__docs-src-pages.md`). Owner chose: all five
priority issues, typography first, and the hero/chrome should visibly practise the
Atelier token system instead of the generic gradient/grid look.

- [x] **1. typeset** — done 2026-10-07 (ADR-0155). Not a new scale: ADR-0088 had already
      decided the roles on the library's `--ui-font-size-*` and rejected `--docs-text-*`;
      its page-scoped second pass (review n13) simply never ran, and nothing gated it.
      Pages, islands and SVG diagram labels are now on the roles; `check:docs-layout`
      fails on any text under 12 px at 1440 (`[FONT-SIZE]`, negative-tested for HTML and
      SVG). Open from this step: the H2/body ratio (20/16) is still weak, and the guard
      does not cover the sidebar, topbar or collapsed `<details>`.
- [x] **2. shape** — done 2026-10-07 (ADR-0156). Home = H1 + one action + `LoopDiagram`
      (spec-sheet loop, also on `/design-to-code`); hero decoration, eyebrows and pillar cards
      gone; side stripes replaced site-wide; kit, `SKILL.md`, `brand-guide.md` updated, and the
      kit's broken token-sheet path fixed. Open: at a 1200 px window the Inspect card loses
      its leader lines.
- [x] **3. distill** — done 2026-10-07 (ADR-0157). Track-first sidebar with `<details>`
      groups (24 → 7 visible links on `/design-to-code`), `PageMeta` under the H1 instead of
      the eyebrow, one name, one MCP endpoint on the home, Prev/Step/Next bottom nav.
- [x] **4. clarify** — done 2026-10-07. `/design-to-code` in attendee language with a
      "Why (for maintainers)" disclosure per step; tutorial/kata roles stated on both pages;
      component pages label snippets by framework and say the preview is the React adapter;
      demos show every variant the API lists (button `danger`, card `flat`, tabs `pills`, …).
- [x] **5. harden** — done 2026-10-07 except two library findings (below). Forced-colors
      focus outline, unclipped search placeholder, one drawer close, scroll-top clear of the
      bottom nav, prompt blocks wrap, nav landmark labels distinct.
- [x] **5a. library: placeholder contrast** — done 2026-10-08 (ADR-0159). — `--ui-color-placeholder` `#64748b` on
      `--ui-color-input-bg` (= surface-sunken `#f1f5f9`) is 4.34:1, below AA, in light mode;
      `check:contrast` has no placeholder pair, which is why it passed. Needs an owner
      decision (token change touches all three adapters and Figma). Owner 2026-10-08:
      `#566579` (5.43:1 on input-bg, 5.94 on surface, 3.00 vs entered text); add the pairs.
- [x] **5b. library: dark disabled button** — done 2026-10-08 (ADR-0159); Figma master has a
      `label` text property and an opaque `_disabled-overlay`. Open: ~15 other components still dim
      by opacity (dark disabled input unmeasured); artboard generator has no disabled colours. — `.atl-button.is-disabled` relies on
      `--ui-opacity-disabled: 0.65` in dark, so Disabled/Loading read as enabled. Owner
      2026-10-08: dedicated button disabled colour tokens (reverses the manifest's
      "opacity, not colour tokens" rule for the button → ADR).
- [x] **5c. AtlTextarea Readonly hover border** — Angular and Vue render a transparent border on _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      hover where Figma and React draw `surface-sunken` (recorded in `paint-baseline.json`
      2026-10-08, surfaced by the Boolean-cover round of `check:paint`, ADR-0159).
- [x] **6. delight** — done 2026-10-07. Kata ends with a real finish (recap, one action to
      `/patterns`); WIP banner calm, dismissible, remembered before paint.
- [x] **7. polish + re-critique** — done 2026-10-07. Re-critique scored 26/40 (was 27): a fresh
      reviewer found new, pre-existing problems rather than regressions. Its P1s are open as 8–10.
- [x] **8. gallery shows components** — done 2026-10-08: 28/28 live previews (overlays at rest,
      `inert` + `aria-hidden`, CLS 0), framework-dot legend; +~13 KB gz JS, +9.7 KB gz CSS. — `/components` cards are letter monograms; render
      previews, legend for the framework dots. Owner 2026-10-08: live mini-previews from the
      React adapter (overlays as static resting states).
- [x] **9. track ends on a finish** — done 2026-10-08 (ADR-0158): 6 steps, `/patterns` in the
      Reference group; measured "Step 6 of 6" on the kata, no track chrome on `/patterns`. — step 7 `/patterns` is a reference page ending on a
      "Previous" card; the finish moment sits on step 6. Owner 2026-10-08: the track ends on the
      kata (6 steps); `/patterns` stays reference, linked from the finish.
- [x] **10. one framework switcher** — done 2026-10-08. Kata uses `FwSwitcher`; it is now a
      toggle group (`aria-pressed`, 44 px measured) with a quiet "Remembered from your last
      visit" / "Set by this link" hint. Only one storage key existed already (`atelier.fw`).
      Footer fixed in step 11–13's commit. Left: code-block tab strips on `/patterns`,
      `/patterns/[id]`, `/claude-md`, `/prompts` stay hand-rolled (small targets, no hint;
      they do get `aria-pressed` from the shared script).
- [x] **11. mobile prose column** — done 2026-10-08: 358 px column at 390 px (measured). — `.docs-inline-page` keeps `padding: 2.5rem 2rem` at 390px
      (global.css:624, no override) on top of the shell gutter: 294 px column, 28–41
      characters per line on 26 pages (critique 3, 2026-10-07).
- [x] **12. `/design-to-code` wayfinding** — done 2026-10-08: 6-entry TOC; settled/owed moved
      verbatim into the Contract disclosure. — 7 H2s and no `tocItems`; the Contract section's
      settled/owed theory still sits inline instead of in its maintainer disclosure.
- [x] **13. small consistency** — done 2026-10-08 (footer from 10 too: x=256 at 1440). — topbar "Workshop" active only on `/workshop`; "Patterns" vs
      "Cookbook patterns"; gallery slices descriptions at 85 chars mid-word; "Identical APIs"
      claim (`ComponentGallery.tsx:65`) contradicts the framework-native story.

- [x] **14. dark-mode logo** — done 2026-10-08: `logo-dark.png` (glyph recoloured to `#f1f5f9`,
      ~13.8:1), switched by `[data-theme]` with an OS fallback; measured in all three states. — the black "A" in `logo.png` vanishes on `#0a1116`
      (`BaseLayout.astro:333`); dark variant or SVG with `currentColor` (critique 4, P1).
- [x] **15. `/workshop` distill + outline** — done 2026-10-08: own h2 for the setup steps, route
      cards at the end with page names, contributor note in a closed `<details>`, 5-entry TOC. — contributor callout before step 01; steps are h3
      under "Install prerequisites"; four route cards mid-page; no TOC (critique 4, P1).
- [x] **16. one numbering** — done 2026-10-08: setup steps are a checklist; `/tutorial` A–E became
      the four loop stages (C+D under Generate), diagram too. — track 1–6, setup 01–04, loop 1–4, tutorial A–E; numerals for
      the track only, the four loop stages named the same everywhere (critique 4, P1).
- [x] **19. no gate sees TS errors in library builds** — done 2026-10-08 (ADR-0160): `vite-plugin-dts`
      `afterDiagnostic` throws; negative-tested for `.vue` and `.ts`. — `nx build vue` printed TS7053
      (`atl-breadcrumbs.vue:53`, fixed 2026-10-08) and exited 0; `check:types` runs `tsc` on the
      spec tsconfigs only, and plain `tsc` does not read `.vue`. Needs `vue-tsc --noEmit` or a
      gate that fails on `error TS` in the build output.
- [x] **17. jargon in attendee copy** — done 2026-10-08: kata ADR-0097 theory in a maintainer
      disclosure; tutorial lede links the MCP section; prompt follows the framework switcher. — `first-component.astro:180,215`, `tutorial.astro:165,193`,
      `design-to-code.astro:317,377`; "The switcher below stay in sync" (critique 4, P2).
- [x] **18. preview vs. switcher** — done 2026-10-08: one note under the switcher; gallery dots
      removed (identical coverage); previews fit; search placeholder on the token. — one note above the switcher that the preview is the shared
      look and the switcher changes code only (owner 2026-10-08); gallery dots identical on all
      28 cards; Card/CodeBlock previews clipped; gallery search placeholder 4.4:1 (UA default).

> **Picking this up in a new session?** Read
> `tasks/handover-design-skills-2026-09-08.md` first — it carries what is blocked
> (figma-console reconnect, 37/37 parity DRIFT), the agreed order of next steps, the
> scratch Claude Design project, and the eval-harness facts.

> **Cross-model plausibility review, 2026-09-08:**
> `tasks/archive/reviews/review-plausibility-2026-09-08.md` — 30+ findings across the docs site, the
> four skills, the newest ADRs and this file's companion handover, with what was
> verified and what is single-reader. Nothing fixed yet; the four that change
> behaviour are A1 (mcp.astro still shows the pre-ADR-0097 "via React" model), A2 (28
> vs 29 components, `radio` missing from the docs catalog), A5 (the MCP playground
> POSTs invented tool names at the live endpoint) and C1–C3 (`artboard-bridge`
> governance ordering, the confirmation carve-out, and the Publish etag window).

> **Training-content review, 2026-09-08:**
> `tasks/archive/reviews/schulung-content-review-2026-09-08.md` — the first pass over the _whole_
> teaching surface (agenda, docs site, briefs, talk, the `plan/` files the curriculum
> injects into prompts), asking whether the material teaches rather than whether it is
> accurate. Ran without a second model (Codex quota, agy quota) — a Codex Gegenprobe is
> ran at 00:25 on 2026-09-09 and is recorded in that file (ten new findings; **G1** is a
> defect in the fix § B recommends — the `design-to-code` skill's handoff template sends
> the participant's spec into the shared master that the curriculum warns them off).
> **Second round, same day: § B, § C, G5, G8, G9 and G10 closed too** (ADR-0116 cite the
> source not the value — `big-picture.md` is prompt context and is now on the real API,
> with fictional props cut rather than replaced; ADR-0117 the silence was not the
> decision — both new skills named in participant material, `claude-design.astro`'s
> absolutes narrowed without weakening its fence argument). **G1–G4, G6 and G7 were fixed on 2026-09-09** (ADR-0113 the workshop branch, ADR-0114
> the state axis, ADR-0115 the token ownership map); **G5, G8, G9, G10 stay open**, as do
> § B and § C. Both § A blockers were
> fixed the same day — the 10.6 curriculum sweep, and the `test-run` workspace-discovery
> regression (ADR-0112, now gated by `check:vitest-discovery`). The rest is
> open, and § B — the two new skills being invisible to the material, and the ADR-0096
> handoff document missing from the English learner path — is the part with the most
> leverage.

> **Spec-format review, 2026-09-10:** `tasks/archive/reviews/spec-format-review-2026-09-10.md` — the
> first review of `libs/spec` as a _format_ (five repo agents, one web scan, Codex
> Gegenprobe). Verdict: the spec is a naming key for the drift gates, not a component
> contract; the compiler binds only React (Angular 1/29, Vue 0/29 import an interface);
> 27 of its exports are referenced by no adapter; defaults, descriptions, events, slots,
> states, tokens-per-part and Figma provenance live in three to seven hand-written copies
> elsewhere, none derived. The scaffold ships no contract infrastructure, and no page
> states what the spec does for a one-framework team. Twenty findings, two blockers
> (F1 false compiler-parity claim in README/big-picture/ADR-0006; F12 the scaffold ships
> no contract infrastructure, so "run the same steps" is not held). Decision open — § 6
> there: **A** honesty pass
> now regardless; **B** one authored contract record with everything else projected as
> the direction, its own ADR naming ADR-0006/0010/0096 as revised.

- [x] **0.3.5 on npm is not this repo's 0.3.5 (found 2026-10-03; resolved by 0.3.6 the same day, `12840b2e`: all six packages published from that commit, react depends on styles 0.3.6, a fresh npm consumer bundle carries the shared and native CSS, `check:release-drift` exits 0).** Guards done 2026-10-03
      (ADR-0150: `--pre-publish` task, `[CONTENT-DRIFT]` via `gitHead`); still open is (1), the
      0.3.6 release itself — pushing the guard commit triggers it. A release run on
      2026-10-01 (`9a14c13c`, run 36884693651) published react, angular, vue, create-workspace and
      create-atelier-ui-workspace 0.3.5, then failed before its release commit and tag. Today's
      release (`cfd43ce6`) re-used 0.3.5. npm skipped the five existing versions, and only
      `@atelier-ui/styles@0.3.5` is new. So the published react/angular/vue 0.3.5 are the
      pre-migration code: self-contained and working, but without ADR-0148. Needed: (1) a 0.3.6
      release carrying the migration; (2) make the publish step fail instead of skipping when a
      version already exists on npm; (3) `check:release-drift` compares versions only, so it
      should also catch "same version, different content", e.g. by comparing the published
      `gitHead` with the tagged commit.

- [x] **Menu: disabled items — React/Vue now keep them focusable, as Angular and the APG do (2026-10-07).**
      React and Vue render `aria-disabled="true"` instead of a native `disabled` button; disabled
      items stay in the arrow, Home, End and type-ahead rotation, and Enter, Space and click do
      not activate them or close the menu. The CDK source (`skipPredicate(() => false)`,
      `attr.aria-disabled`) confirmed the Angular side.

- [x] **Structure lessons from the DB UX Design System (planned 2026-10-01).** Comes out of _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
      a fact-check of a Gemini Deep Research report on multi-framework design systems. The
      report says DB UX (`db-ux-design-system/core-web`) maintains native Angular, React and
      Vue implementations in parallel in an Nx monorepo — **both false**: it writes every
      component once in Mitosis (`*.lite.tsx`; `packages/components/configs/mitosis.config.cjs`
      targets angular, vue, react, stencil) and is a pnpm workspace with changesets (no
      `nx.json`). Mitosis is not on the table — it would cost the Angular idioms the workshop
      teaches (signals, `model()`). Worth copying is the package cut around the components:
      one SCSS per component usable without JS (`db-*` classes), a separate
      `@db-ux/core-foundations`, lint packages for consumers (`@db-ux/core-stylelint`,
      `@db-ux/core-eslint-plugin`), docs beside the component
      (`<name>/docs/{HTML,Angular,React,Vue,Migration}.md`, `examples/`). Lockstep releases
      we already have. Parked in `plan/roadmap.md` ("Later: runtime coverage beyond
      Storybook"): Angular SSR showcase, ARIA snapshots.
      **Order (owner, 2026-10-01): P1.0 first** — find out whether one CSS source carries at
      all — then decide P1 vs. P2. Each P that settles an approach gets its own ADR.
      **Framework scope (owner, 2026-10-01):** Angular is the default and first workshop
      framework, but React and Vue may still be taught — Angular-first decides order and
      design, not whether the other two adapters stay maintainable.

  - [x] **P1 — One source for component CSS instead of three hand-kept copies.** Facts _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
        (verified 2026-10-01): React and Vue CSS are byte-identical for 27 of 29 components
        (`chat`, `table` differ). Angular uses `:host` under Emulated encapsulation (only
        `tooltip`, `table`, `menu` use `None`); React/Vue use a root class `.atl-X`. A
        mechanical `:host` → `.atl-X` rewrite makes Angular equal React for only **5 of
        29**; the other 24 differ by scoping (Angular relies on Emulated for bare selectors
        like `.variant-icon`, React writes `.atl-badge .variant-icon`), by DOM (`select` is a
        native `<select>` in React, a custom trigger in Angular; `dialog` splits its parts
        differently) and by comment drift. No gate compares the CSS: `check:sync` checks
        directory names and story presence only (its own header says so); `check:variants`,
        `check:dead-selectors`, `check:box-sizing` run per framework because the CSS is
        triplicated. Shipping today: Angular inlines via `styleUrl`, React via
        `import './atl-X.css'`, Vue extracts into `index.css`.
    - [x] **P1.0 Inventory — done 2026-10-01**, `tasks/p1-css-inventory-2026-10-01.md`.
          **Verdict: one CSS source carries.** 23 of 29 components need no genuine
          difference — 9 transform-only, 12 scoping-only, 2 scoping plus a value fix. Of the
          rule-aware pass's 195 residual lines, 155 are `select` and `tooltip`. The 6
          DOM divergences: **deliberate** — `select` (native vs CDK listbox), `tooltip` (CDK
          overlay), `menu` (CDK menu), `table` (`atl-tr` with `display: contents`); these
          need a per-framework override file, not convergence. **Incidental** —
          `breadcrumbs` (custom element between `<ol>` and `<li>`; a11y snapshots equal).
          **`drawer`** — React's wrapper is deliberate, Vue's is a bug (below).
          The transform is not purely mechanical. It needs a per-component root/host-class
          table, tag → class rules, `:host(X):host-context(Y)` → `Y X` (15 uses: accordion,
          card), and class renames (combobox 21, breadcrumbs 5, avatar and drawer aliases).
          Side benefit: React/Vue carry 80 rules with no `.atl-*` root (`.spinner`,
          `.track`, `.page-btn` …) that leak globally today; a generated, root-prefixed copy
          removes the leak.
          Surfaced bugs, independent of P1 (both statically confirmed by me; not checked in
          Storybook):
      - [x] **Fixed 2026-10-01 (`c8273cbe`).** **Angular `AtlStepper` uses `--step-circle` / `--step-connector-width` and
            never defines them** (`libs/angular/src/lib/stepper/atl-stepper.css:41,59,60,188,192`);
            React/Vue define them at `atl-stepper.css:15-16`. Reproduce in Storybook first.
      - [x] **Fixed 2026-10-01 (`b21a0e0b`; contract probe note corrected in `643597f9`).** **Vue `AtlDrawer` puts `atl-drawer-host` on the `<dialog>` itself**
            (`atl-drawer.vue:83-99`), so every `.atl-drawer-host dialog` rule
            (`atl-drawer.css:38,59,65`) misses. The headless probe measured the open dialog
            at `display: block` and ~88px wide instead of `flex` and 448px. Reproduce in
            Storybook first.
    - [x] **P1.1 Spike — done 2026-10-01**, `tasks/p1-1-spike-2026-10-01.md`. A 208-line
          prototype generator plus a 30-line config (scratchpad only, not kept) reproduces
          today's React/Vue CSS for 23 of 29 components, comment-stripped and after
          Prettier. I re-counted that independently. It needs 32 config entries: 5 inherent
          and 27 accidental naming or scope drift. A rename pass first brings that to about
          8, at a cost of roughly 14 Angular and 6 React/Vue template lines.
          `select` and `tooltip` stay hand-kept overrides, about 140 lines.
          **Caveat:** 11 of the entries are a `scope: 'bare'` switch whose only job is to
          reproduce today's global leak (~80 React/Vue rules with no `.atl-*` root). The
          intended policy is prefix-everywhere, which changes three places that depend on
          the leak today: chat `.close-btn`, drawer `.panel`, toggle `.track`.
          Second model: Gemini 3.1 Pro (Codex quota out until 2026-10-06), via
          adversarial review. It independently picks A. Its new risk is specificity: the
          `:host-context` → `.atl-x.y .z` rewrite raises specificity for consumer overrides.
          It also re-flags the leak, which is correct for the default config.
    - [x] **P1.1b Spike Option C on button, badge, dialog — done 2026-10-01**, committed as the
          first migration step (`0ed39bb6`..`fabae87b`). The React blocker below was solved by
          publishing `@atelier-ui/styles` (owner's choice), proven by `check:pack-styles`. One class-rooted file per component in `libs/styles/src/<dir>/`
          (Nx project, for stylelint and module boundaries). Angular uses
          `ViewEncapsulation.None` plus a static root class on the host, which survives
          `[class]`; React and Vue import the same file.
          Green: `check:all`, `storybook-test`, `test` and `lint` for all three frameworks.
          The declaration-level diff against the old React CSS is zero, and 151 Angular
          elements measure identical computed styles.
          **Blocker: the React package is broken as built.** `dist/libs/react/.../atl-button.js`
          imports `@atelier-ui/styles/button/atl-button.css`, which resolves nowhere, and no
          CSS is copied. I verified this myself.
          Caveats: Angular-projected content inside `button`/`dialog` now gets
          `box-sizing: border-box`, as React/Vue already do, which consumers can see.
          `FORCEPREFIX` output needed hand fixes: an impossible
          `.atl-dialog dialog > .panel`, and descendant selectors that hit consumer content
          (a select's `.panel` inside a dialog), so four selectors became child combinators.
          Prefix-everywhere is therefore not safe by itself. `@keyframes` names stay global
          (`shimmer` and `toast-enter` would collide). Two gates had passed vacuously (see
          the separate item below). Stale paths remain in `tools/figma/parity.json`,
          `plan/` and the ADR text. `tools/parity/typeface-baseline.json` was rebaselined:
          dialog NO-SIZE went from 3 identities to 1, the same debt deduplicated. Review it.
    - [x] **P1.2 ADR — done 2026-10-01: ADR-0148**, Option C plus a published
          `@atelier-ui/styles`. The owner questioned my lean towards A, and C won: the file
          read is the file shipped. ADR-0028 carries the dated correction.
    - [x] **P1.3 Migrate the remaining 26 components, one per commit — done 2026-10-02.** Per component:
          write the class-rooted file in `libs/styles` (the spike generator in
          `tasks/spikes/p1-css/generator` with `FORCEPREFIX=1` as a one-time aid, then fix by
          hand); give generic part classes (`.panel`, `.track`, `.close-btn`, `.spinner`) the
          child combinator; prefix `@keyframes` names; switch Angular to `None` with a static
          host root class; switch React/Vue to the shared import; delete the three old files.
          **Done per component when** `check:all` (incl. `check:pack-styles`) and the three
          `storybook-test` runs are green and a before/after computed-style probe of the
          Angular stories shows only the documented changes. Order: the 9 transform-only
          components, then the 12 scoping-only ones, then stepper and toast, then breadcrumbs
          (DOM convergence) and drawer, then menu and table, and select and tooltip last
          (with per-framework override files). Check the three spots that change visibly when
          the leak closes (chat `.close-btn`, drawer `.panel`, toggle `.track`) in a browser.
          **Progress 2026-10-02:** 11 of 29 migrated (button, badge, dialog in P1.1b; batch 1
          alert, checkbox, icon, input, radio, radio-group, textarea, toggle in
          `948e34dd`..`ef83e334` plus fix-forward `e6f5362a`); `check:all` exits 0. Findings:
          checkbox now takes Angular's hover-on-invalid behaviour, so a hovered invalid
          checkbox keeps its red border in React/Vue too (visible change there). Table's
          `.atl-tr-select-cell .atl-checkbox label` now matches in Angular
          (`justify-content: center`); its dead-selector exemption was removed. The
          stylelint exemption-staleness scan now reads `libs/styles` as evidence
          (`sharedRoot`). The toggle `.track` leak comes from progress's unrooted `.track`
          and closes only when progress migrates. Checked by me: 11 shared files, 168
          selectors, 0 unrooted, every `@keyframes` prefixed. Not covered: the React side was
          probed only for toggle; the others rest on story tests and the shared file.
          **Progress 2026-10-02, batch 2:** 21 of 29 migrated. Batch 2 is skeleton,
          code-block, pagination, progress, avatar, tabs, accordion, card, chat and
          combobox (`379e0d7b`..`3561298c`), with fix-forwards `e29b7c7f` (typeface
          rebaseline) and `eb4de871` (`check:figma` resolves child-combinator parts).
          `check:all` exits 0.
          The migration fixed five Angular bugs that Emulated `:host` had been hiding, and
          each is a visible change in Angular:
          the card slots had no padding at all (the default card grows from 82.5px to
          226.5px);
          every accordion item got a bottom border (the group is now 1px shorter);
          chat `status-streaming` never matched;
          the code-block host was never styled;
          the avatar group host was styled as an avatar.
          `check:figma` had been skipping layers silently whenever a part was rooted
          through child combinators: 31 resolved before, 77 after.
          Progress → toggle leak, measured: the toggle `.track` goes from
          `overflow: hidden` to `visible` in the React showcase, and the thumb was never
          clipped.
          Chat `.close-btn` now states `margin-left: 0` and `line-height: normal`, so a
          later drawer migration cannot change it.
          The new stories `NestedPadding` (card), `NestedGroups` (accordion) and
          `PanelScope` (tabs) pin the nesting case. The card and accordion ones fail in
          React with descendant selectors.
          combobox was renamed on the Angular side.
          Checked by me: 21 shared files, 391 selectors, every one rooted in `.atl-*` or
          `[data-theme]`, every `@keyframes` prefixed.
          Open: Vue visuals rest on `storybook-test` only.
          **Batch 3, done 2026-10-02:** stepper, toast, drawer, breadcrumbs, table, menu,
          tooltip and select (`c05003ea`..`b74562ff`), plus `2599781d` (gates read override
          sheets), `d660926f` (gen-box-sizing) and `e78b7d6c` (ADR-0148 Decision 4
          correction). `check:all` exits 0. All 29 are migrated.
          The per-framework overrides are `atl-<name>.<fw>.css` next to the component. The
          ones that exist: table (Angular), menu (React, Vue), tooltip and select (all
          three); React's and Vue's copies are byte-identical.
          Visible Angular changes from bugs the old setup hid:
          menu rows were content-box (224px in a 192px menu, now 190px);
          tooltip LongText goes from 336px to 320px;
          table's five sub-components were still Emulated;
          the drawer host is now `display: contents` (showcase 12px shorter);
          the select label is now styled as in React/Vue.
          React/Vue `th.align-*` was out-ranked by `thead th` and is now fixed.
          breadcrumbs converged on the React/Vue DOM (host is the list item, current page
          is `<span aria-current>`), and the a11y snapshot passes unmodified.
          drawer's `check:paint` NO-PROBE is resolved.
          Checked by me: 38 shared and override files, 615 selectors, 0 unrooted, no
          `:host`, every `@keyframes` prefixed.
    - [x] **Owner decisions from batch 3.** (2) and (4) were settled on 2026-10-03: the _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
          React/Vue override is now `libs/styles/src/<dir>/atl-<name>.native.css`
          (ADR-0148 Decision 4, "Corrected 2026-10-03"), and `check:paint` fails with
          `[STALE]` when its Storybook build is older than the source. (1) and (3) stay open.
          (1) **Drawer padding:** the Figma master draws 16/20px, the CSS states 20/24px.
          14 `allowlists.js` exemptions hold this until you decide which side is right.
          (2) **React and Vue override files are byte-identical** (menu, tooltip, select).
          Proposal: one shared `libs/styles/src/<dir>/atl-<name>.native.css`, imported by
          React and Vue, so "React and Vue, not Angular" has a home.
          (3) **breadcrumbs NoLinks:** a non-current crumb without an `href` renders
          semibold in all three frameworks now, so all three crumbs are bold in Angular's
          NoLinks story; fixing it is a shared-CSS change.
          (4) **`check:paint` reads the built `dist/storybook`**, not the source. It
          checks nothing until `check:storybook-manifests` has rebuilt; decide whether to
          make that dependency explicit.
    - [x] **P1.4 Retire what the migration makes redundant (2026-10-03).** Remove the per-framework
          fallback in `componentCssFiles()` once no per-framework stylesheet is left. Then
          re-evaluate `check:variants`, `check:dead-selectors` and `check:box-sizing`: do
          they need to run three times over one file? Add a lint rule, "every selector
          rooted in `.atl-*`", out of the spike's leak script; per ADR-0126 it is
          single-file, so it is a stylelint rule, not a gate.
          Done: the fallback is gone from `componentCssFiles()`, `gen-box-sizing` and
          `check-figma`; `atelier/rooted-selector` is wired for `libs/styles` and the
          framework overrides, with 31 `node:test` cases run by `check:stylelint`. The
          three gates stay: variants and dead-selectors judge each framework's own
          templates and overrides, and box-sizing already judges a shared sheet once.
    - [x] **Two gates passed vacuously (fixed 2026-10-03: `[PARTIAL-COVERAGE]`; `check:figma` ratchets its 80 unresolved layers)** (found by P1.1b): `check:box-sizing` covered 78
          of 87 stylesheets and `check:dead-selectors` 80 of 89 before the path fix. Make
          each fail when it finds fewer stylesheets than component directories (ADR-0080).
          This is independent of the migration.
    - [x] **Batch-3 decisions (1) and (3), owner 2026-10-03.** (3) is done in `4ea59019`: _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
          a crumb that has no link and is not the current page renders
          `<span class="breadcrumb-text">` (regular weight, muted), and only the current item
          keeps `breadcrumb-current` and `aria-current="page"`. That is pinned by a `NoLinks`
          play in all three libs. Found along the way: Angular and React mark the _last_ item
          as current, while Vue uses an explicit `current` prop. That is an older
          cross-framework difference and not part of this fix; check it against the contract.
          (1) Owner decision: **the CSS is right.** The Figma drawer master moves to 20/24px
          padding, a 20px title and a 12px footer gap, matching AtlDialog. Then the 14
          `AtlDrawer:layer:*` exemptions in `allowlists.js` are deleted. This is blocked
          until the Desktop Bridge is connected to the Atelier UI file: on 2026-10-03 it was
          connected to a different file, so nothing was changed.
          **Done 2026-10-03 in `d291e7cd`.** All 7 drawer variants are bound to `spacing/5`,
          `spacing/6`, `spacing/3` and `font-size/xl`. The 14 exemptions are deleted and
          `check:figma` exits 0. **Correction to my argument:** I told the owner that
          AtlDialog's master matches the CSS "with 0 exemptions". That was an absence of
          signal, not agreement. AtlDialog's header, content and footer layers are unnamed
          `Frame`s, so `check:figma` captures no layers for it (`layers: []` in the
          snapshot). It also has no `LAYER-UNRESOLVED` entries, because that ratchet only
          counts _named_ layers. The drawer agent read the dialog's real values: its footer
          is 16/24px against the CSS's 20/24px.
    - [x] **AtlDialog master is not layer-checked at all.** (2026-10-03) Header, content and
          footer frames are named in all 5 variants, so `check:figma` compares them. Footer
          20/24 and gap 12, content 24/24 and the 20px title now follow the CSS (c286d6f0).
          `check:figma` also counts _unnamed_ auto-layout frames per master now
          (`LAYER-UNNAMED` in `type-baseline.json`: 127 in 5 masters, AtlTable 75, AtlAvatarGroup
          20, AtlDrawer 14, AtlDialog 10, AtlToast 8); a new one fails, a named one fails until
          re-recorded.
    - [x] **AtlDialog draws its header and footer rules as 1px divider frames.** The CSS has a _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          border-bottom on the header and a border-top on the footer; the master has two empty
          frames between the layers. Same pixels, so four `AtlDialog:layer:border|stroke`
          entries in `allowlists.js` carry it. Move the rule onto the layers as strokes (as
          AtlDrawer draws it), delete the dividers and the four entries. The footer buttons
          are anonymous `Frame`s too (10 of the `LAYER-UNNAMED` entries); instances of
          AtlButton would retire them.
    - [x] **Follow-ups from ADR-0149 (2026-10-03).** Split the 80 `LAYER-UNRESOLVED` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          entries in `tools/figma/type-baseline.json` into `design` (true wrappers,
          auto-layout frames) and `gap` (parts whose layer name does not spell their
          class); today all are `design`. Remove the dead `:host` handling in
          `check-typeface` and `check-geometry`.
    - [x] **Before merging to main:** `check:release-drift` will report _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
          `@atelier-ui/styles` as unpublished and exit 1 until the first release; the
          main-only CI job goes red. Check whether the npm token may create a new package
          under the `@atelier-ui` scope. Publish order is already dependency-first
          (ADR-0148 Decision 3). Stale paths to refresh: `tools/figma/parity.json` (needs
          a figma re-verify), `plan/` and the ADR text naming per-framework CSS.

  - [x] **P2 — Foundations as its own lib, tokens' source of truth moved there. Done 2026-10-05 as ADR-0151** (`e375af65`, `13ae030b`): the source is `libs/styles/src/tokens.css`, published as `@atelier-ui/styles/tokens.css`, with every other copy generated; the stale preset comment is fixed. P2.3 (the three byte-identical `foundation/*.mdx` pages with literal hex values) stays open.
        **Re-think after ADR-0148:** with a published `@atelier-ui/styles`, the tokens
        likely belong in that package rather than a private `libs/foundations`. Decide
        before P2.1. Facts
        (verified 2026-10-01): canonical `tokens.css` sits in the scaffold template
        (`libs/create-workspace/src/generators/preset/files/styles/tokens.css`);
        `sync-tokens.mjs` copies it to `libs/{angular,react,vue}/src/styles/` and
        `skills/atelier-design/assets/colors_and_type.css`; `docs/src/styles/tokens.css`
        imports the _React_ copy; `stylelint.config.mjs` and the `nx.json` inputs point at
        the preset copy; `icons.ts` is copied 3× by `sync-spec.mjs`;
        `foundation/{colors,spacing,typography}.mdx` exist 3× by hand; no font files. The
        preset comment saying published packages ship no `tokens.css` is stale (all three
        builds copy it). Scaffolded workspaces vendor `tokens.css` on purpose (attendees
        edit it) — that stays.
    - [x] **P2.1** `libs/foundations` (private, not published — no new release surface) _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
          holds `tokens.css` as source of truth; the preset becomes a generated copy like
          the others. Repoint `sync-tokens.mjs`, `stylelint.config.mjs`, `nx.json` inputs,
          `gen-figma-library-tokens.mjs`, and the docs import.
    - [x] **P2.2** Fix the stale preset comment about `tokens.css` not shipping. _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
    - [x] **P2.3** Decide: three `foundation/*.mdx` copies → one source plus generated _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          copies, or docs app only.
    - [x] **P2.4** Small ADR, or a dated correction of the ADR that made the preset copy _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
          canonical (find it first); record publishing `@atelier-ui/foundations` as
          considered and deferred (tokens already ship in each framework package).
          **Done when** exactly one hand-edited `tokens.css` exists, `check:tokens` diffs
          every copy against it, `check:all` green.

  - [x] **P3 — Lint rules as a package, and a consumer-usage rule set.** Facts (verified _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
        2026-10-01): `tools/stylelint-rules` has four rules (`no-raw-color-literal`,
        `no-undeclared-token`, `no-primitive-token`, `no-token-bypass`), **no tests**, not
        publishable; the preset vendors all six files byte-identically, held by
        `check:preflight-clone-sync` (ADR-0130). `tools/eslint-rules` is repo-internal
        hygiene only. No rule validates how a consumer uses Atl components.
    - [x] **P3.1** Rule tests, one valid and one invalid case per branch, exemption maps
          included. Done 2026-10-06 as `node:test` files beside the rules (not Vitest: that is
          how `rooted-selector.test.js` is wired and `check:stylelint` already runs it), one per
          rule, fixtures in `os.tmpdir()`. Not vendored into the scaffold:
          `tools/scripts/sync-preflight.mjs` clones an explicit list, and the tests read repo
          paths a scaffold lacks. Known limit, recorded not fixed: token values, the allowlists
          module and the staleness scan are cached per process, so a long-lived editor server
          keeps the first answer until restart. Commits: `45a9cf50` (tests), and test-first fixes
          `2472c279`, `04db7926`, `036a6405` for four defects the tests found.
    - [x] **P3.2 Owner decision: package or vendored. Decided 2026-10-06: vendored, as
          today** (participants adapt the rules for their own design system). A published
          `@atelier-ui/stylelint-plugin` would retire the vendored copy and that part of
          `check:preflight-clone-sync`; against it, the vendored copy is readable and
          editable in the attendee's repo — curriculum value. Judge it as curriculum first.
    - [x] **P3.3 — done 2026-10-06 as ADR-0152** (`4be078c3` dev-mode warnings in Angular and Vue, `4394f6f0` two vendored template rules; spike report `tasks/p3-3-angular-usage-rules-spike-2026-10-06.md`). Follow-ups: `AtlCombobox` has no `label`/`aria-label` API at all (an a11y API gap that needs a spec decision); the input/textarea `label-title-only` axe waivers may now be removable; run the generated scaffold's own `nx lint` with the new rules; add `tools/eslint-rules` to the scaffold's lint cache inputs. Original item: Spike: Angular consumer-usage rules (`@angular-eslint` template rules).
          List 3–5 checks Angular's strict template type-check does _not_ catch (icon-only
          `atl-button` without `aria-label`, `atl-dialog` without a title, `atl-option`
          outside `atl-select`). Build only if at least three survive; else record and drop.

  - [x] **P4 — Docs beside the component; retire the hand-written docs props.** Re-scoped _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
        with the owner on 2026-10-07 after a read-only survey. That survey found two of my
        earlier P4 assumptions wrong: `gen-llms-txt.mjs` reads neither `aiUsage` nor `a11y`,
        and no story carries a `docs.source` an example could come from. S6 (retiring
        `libs/spec/src/index.ts`, the metadata modules, `behaviors.json`, `tokens.manifest.ts`
        and `check:props`) stays its own project. It needs an answer first on ADR-0121's
        contradictory Option B (rejected at lines 140-144, kept open as S6(c) here) and a
        home for `check:props`' `[DEAD]` (a declared but unread prop, which a manifest cannot
        see). Facts (2026-10-07): `docs/src/data/components.ts` has 2569 lines, 28 entries and
        162 hand-written prop rows; `check:docs` checks name, type and default one way only.
        Empty prop descriptions in the docgen manifests: Angular 4/145, React 49/163, Vue
        126/138. The docs build runs before the Storybook builds (`wrangler.jsonc`), so the
        manifests do not exist yet when the docs would need them.
    - [x] **P4a — prop tables from the three `components.json` manifests. Done 2026-10-07, ADR-0154** (final shape `572cbcf3`): a committed projection, `docs/src/data/props.generated.json`, generated from the manifests and pinned by `check:props-projection` in `check:all`. The docs, `llms.txt` and `check:defaults` read the JSON; nothing needs Storybook or `dist/` at docs-build, release or pre-push time. A first version read the manifests at build time and set off a chain of follow-up fixes; it was reworked (see `tasks/lessons.md`, 2026-10-07; the partial fix is in `git stash` as "abandoned: llms freshness chain"). `components.ts`: 2569 → 1698 lines. Still on hand-written rows: sub-components no manifest describes (AtlOption, AtlTr/Th/Td, AtlTab, AtlStep, AtlMenuItem, …) and toast. `llms.txt` stays; owner noted it could be dropped if it ever made the setup too complex, and it no longer does. Original item: Step 1: write the
          missing JSDoc. Vue first (126 of 138 props), then React (49) and Angular (4), so
          that every manifest describes every prop; this also improves the per-framework
          Storybook MCP. Step 2: the docs build reads `dist/storybook/<fw>/manifests`. That
          needs a build dependency or a reversed order in `wrangler.jsonc`, and a fail-loud
          check when a manifest is missing. Step 3: `ComponentDetail` renders props from the
          manifest of the selected framework. The `PropRow` entries in `components.ts` are
          deleted, as is the props half of `check:docs`. This is the docs part of S6; tick
          it there too.
          **Step 1 done 2026-10-07** (`1b47efb9`, `3a16141c`, `8444ed34`, `bff43d3e`). All 468
          props in the three manifests are described, with no exemptions, and
          `check:storybook-manifests` fails on `[NO-DESCRIPTION]`. Writing the descriptions
          surfaced behaviour that differs between frameworks, now documented honestly in each
          framework's JSDoc but not reconciled:
          pagination `page` is two-way in Angular and controlled in Vue;
          tooltip flips when clipped in Angular only;
          Vue stepper `linear` lets users pass optional steps;
          `errors` is `ValidationError[]` in Angular and `string[]` in Vue.
          Compare these against the contracts; each is either a recorded `codeOnly` difference
          or a bug. Open: React sub-components that are not a story's `meta.component`
          (`AtlOption`, `AtlTd`, …) are not in the manifest, so their props are unmeasured.
    - [x] **Closed 2026-10-07 by owner decision: examples stay hand-authored in `components.ts`** (no story parsing, no Angular-only second path). P4b — examples from one tagged story per component. Spiked 2026-10-07: blocked,
          not built.** The examples stay hand-authored, as ADR-0121 keeps prose examples
          authored; the plan was one `docs-example`-tagged story per component and framework
          with an explicit `parameters.docs.source.code`, projected like the props (ADR-0154).
          The spike (button `Primary`, tag + explicit source in all three frameworks, built with
          `nx run-many -t build-storybook`) says the manifest cannot carry it:
          Angular's `story-docs` shard honours `docs.source.code` as the story's `snippet`;
          React's `components.json` and Vue's story-docs shard still print the args-generated
          snippet (both build it statically from the CSF AST in `@storybook/react` /
          `@storybook/vue3`, which never read `parameters.docs.source`); and no framework's
          manifest carries a story's `tags`, so "the story tagged `docs-example`" cannot be
          found. Workarounds (parsing story files, a second Storybook build in the docs path)
          were excluded by the build-time constraint of ADR-0154. Options for the owner:
          Angular-only examples from the projection (Angular is the workshop framework) with
          React/Vue examples staying in `components.ts`; or wait for React/Vue manifests to
          honour `docs.source`; or keep `examples` authored as today.
    - [x] **P4c — move `a11y` into the metadata — done 2026-10-07 except toast.** 10 of the 11
          entries are merged into `metadata.accessibility` (`role`, `relatedRoles`, `notes`, and
          `keyboard` rows or prose `keyboardBehavior`, exactly one; `check:metadata` enforces
          it) and the docs page renders from it. Toast has no metadata file and
          `AtlToastOptions` is not a registry spec, so its `a11y` stays in `components.ts`
          until toast gets a metadata home. `aiUsage` (3 entries), `composition` (13) and
          `status` (6) stay in the docs data as page data.

- [x] **The scaffold becomes the AI-development workspace, and the cohort's environment** _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
      (owner decisions, 2026-09-12). Four blocks chosen out of five; **"Gates + CI" was
      deliberately not chosen** — the generated workspace keeps its five separate
      `check:*` scripts, gets no `check:all` umbrella, no `lint` script and no CI
      workflow of its own. Everything below is scoped by that.
      Findings: ADR-0134 through ADR-0137, and the step commits below.

  - [x] **S1 — one framework in the schema, not a list — done 2026-09-12** (`d4b1cfb`,
        ADR-0134; nx test 122, lint, build with all 32 templates in `dist/`, CLI test 21).
        `framework` as an enum
        (`angular|react|vue`) with an `x-prompt`, `frameworks` dropped; `preset.ts` loses
        `frameworks.indexOf(...)` port arithmetic (Storybook is always 6006), the
        `primaryFramework = frameworks[0]` narrowing, the multi-entry `.mcp.json` loop and
        the per-framework fan-out in `buildStylelintConfig` and the generated `nx.json`
        inputs. `bin/index.ts` passes `framework`. `preset.spec.ts`'s 14 multi-framework
        call sites collapse. Ports 6007/6008 disappear with the code that produced them.
  - [x] **S2 — reproducibility — done 2026-09-13** (`de06988`, ADR-0135 + ADR-0136; the
        first `play` failed for real in a generated workspace on `pointer-events: none` and
        moved to an enabled story; e2e green per framework: angular, react, vue). (a) `@atelier-ui/<fw>` pinned to the preset's own
        version, read from its `package.json` at generate time — the e2e's verdaccio
        publishes the matching local tarballs, so the pin resolves there too. (b)
        `uianatomy` always in the generated `.mcp.json`; `angular-cli` when the framework
        is Angular. (c) The example stories rewritten per framework to the doctrine they
        teach: one story per variant value and Boolean state, `args`-based, one `play`
        with an assertion. The e2e pins five substrings of `check:contracts`' summary
        (`no-component: 0`, `external: 1`, `docgen-failed: 0`, `[NO-STORY-META]`,
        `total: 0 error(s)`) — they must stay true, and `AtlButton` staying
        package-imported is what keeps them so. (d) `docs/src/pages/workshop.astro:44-73`
        swept in the same change: its hand-maintained `.mcp.json` copy is already drifted
        (`figma-console-mcp@latest` there, `1.40.0` in the preset).
  - [x] **S3 — the workspace is set up for Claude Code — done 2026-09-13** (`e277204`;
        nx test 154, build with the three new templates in `dist/`, and the hook run for
        real against eight stdin payloads — exit 0 in every case). Generated `.claude/settings.json`
        with a `permissions.allow` list covering `npx nx …`, `npm run …`, `npx storybook …`
        and `npx playwright …`, plus `enableAllProjectMcpServers: true`; a `PostToolUse`
        hook on `Edit|Write` that formats the edited file (path from stdin JSON) and runs
        stylelint on `.css`; `.claude/settings.local.json` added to `.gitignore`; a
        `/verify` command that runs the four checks and reports each exit code; a
        `component-review` subagent (Read/Grep/Glob/Bash, `model: sonnet`) that reads a
        component against its contract, its stories and the a11y rules. The generated
        `CLAUDE.md` gains a "Definition of done" section, this repo's "a gate's result is
        its exit code — never pipe it" rule, and framework idioms (Angular signals /
        zoneless / built-in control flow; Vue `<script setup>` + `defineModel`; React
        hook rules).
  - [x] **S4 — one Atelier skill in the generated workspace — done 2026-09-13** (`50169e2`).
        Shipped as a preset-only template, **not** under `skills/`: its instructions are false
        in the monorepo and `sync-skill-discovery.mjs` would publish it to the docs site's
        discovery index, offering it to the readers it misleads. Every factual claim in it was
        checked against the code that has to make it true, including all thirteen
        `check:contracts` finding codes against that script's own `TAG_LEVEL`. Same commit put
        `npx nx migrate` on `permissions.ask` rather than `deny` — and whether a narrow `ask`
        even beats a broad `allow` was settled by running the installed CLI, not by reading
        the bundle. Originally planned as
        `skills/atelier-component/` in this repo (so it gets discovery, `check:skill-discovery`
        and an eval home) and shipped into `.claude/skills/atelier-component/` by the
        preset as a byte-identical clone — new pairs in `sync-preflight.mjs`'s `FILES`,
        which is the only thing that enforces a copy. It is **not** a fork of
        `design-to-code`: that skill names `libs/spec` and the monorepo gates 16 times in
        its `SKILL.md` alone. This one names the scaffold's real surfaces —
        `workshop-<fw>/src/contracts/`, `contracts.config.json`, `check:contracts`,
        `check:stories`, the hosted `docs-show`.
  - [x] **S5 — a unit-test runner, without losing the browser one — done 2026-09-13**
        (`fa60042`). Two config files, not a `projects` array, for the ADR-0112 reason. The
        e2e step added with it earned itself immediately: Vue died on
        `Unknown file extension ".css"`, and the diagnosis found that React survives the same
        condition only because its published package declares `"type": "commonjs"` over ESM
        files — recorded above as a decision to take. Originally planned as: one
        `vitest.config.ts` per app declaring two `projects`: the existing Storybook
        browser project and a jsdom unit project (`src/**/*.spec.*`, Testing Library for
        the chosen framework, `@testing-library/jest-dom`). A `test` target so
        `nx test workshop-<fw>` works, one example unit test as the pattern to copy, and
        `check:stories` kept on the browser project. Why the file is shaped this way
        rather than letting the app generator write its own: the preset already owns
        `<app>/vitest.config.ts` — addon-vitest resolves the nearest config by that exact
        name — which is why `unitTestRunner: 'none'` was passed in the first place. The
        Angular half is the risky one (`@analogjs/vitest-angular`) and gets its own real
        scaffold run, not an in-memory Tree.

- [x] **A dormant rootDir violation in the generated workspace's story-test setup.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      `src/test-setup-stories.ts` imports `'../.storybook/preview'`, which reaches outside
      `tsconfig.app.json`'s `src`-scoped `rootDir`. Harmless today because nothing invokes a
      `typecheck` target in a generated workspace — `nx build` does not compile that file since
      the explicit `import { beforeAll } from 'vitest'` fix — but it would fail TS6059/TS6307
      the moment such a target is wired. Found 2026-09-13 while fixing the `beforeAll`
      regression. Identical in React and Vue. Decide: relax the rootDir, move the annotations
      import, or leave it and note that a `typecheck` target cannot simply be switched on.

- → **R-104** **Every release leaves two files for a human to clean up.** `nx release`'s own
  `chore(release): publish` commit bumps versions without running the generators, so
  `docs/public/llms.txt` goes stale (known, one line, happens every time), and it embeds
  commit bodies verbatim into each package's `CHANGELOG.md`, which Prettier then reflows
  differently — so `check:format`, the _first_ gate in `check:all`, is red on `main`
  immediately after every publish. Both were hit again on 2026-09-13. The fix is to run
  `gen:llms` and `prettier --write` inside the release workflow, before its commit, rather
  than pushing a main that fails its own first gate and waiting for the next person to
  notice.

- [x] **No gate has ever formatted an `.astro` file — fixed 2026-10-01 (ADR-0147).** `check:format` is `prettier --check .`,
      and without `prettier-plugin-astro` installed Prettier cannot parse `.astro` at all —
      targeted, it errors on all 24 pages; across the tree, it silently skips them. So the docs
      site, which is most of what this repo publishes, has never had a formatter's word on it.
      Found 2026-09-13 while extending `design-principles.astro`. Installing the plugin would
      reformat every page in one commit, which is the reason to decide it deliberately rather
      than discover it mid-review.
      **Decided 2026-10-01 (owner):** one format-only commit, listed in `.git-blame-ignore-revs`;
      ESLint via `eslint-plugin-astro@1.7` on ESLint 9 now, the ESLint 10 bump separately.
      Spike (scratchpad copy): `prettier-plugin-astro@1.1.0` reformats 46/50 files
      (+10870/−3226), idempotent; it wraps text inside inline elements (`<a>…</a>.`), which
      Astro's whitespace collapsing may render as "Setup ." — unproven, S1 measures it. Also:
      `docs/` has no `eslint.config.mjs`, so no `lint` target exists and CI never lints it.
      Done when: `check:format` covers `.astro`; `nx lint docs` exists and is clean with
      `eslint-plugin-astro` + jsx-a11y; reformatting changes no page's rendered text (built
      HTML text diff); `check:all` exit 0; ADR recorded.
  - [x] S1 built-HTML text diff — plugin defaults changed visible text on 27/61 pages
        (spaces before punctuation and inside links); `htmlWhitespaceSensitivity: strict` is
        ignored by the plugin; `astroCompressHTML: "html"` (matches Astro 6's
        `compressHTML: true`) brings it to 0/61. Cross-checked with Chromium `innerText` of
        every page and link: 0 diffs, control run without the option 61 diffs.
  - [x] S2 `3f14528d` config, `ab1f4946` format-only, `ce0b3906` blame-ignore; plus
        `6a6e5daf`/`29324f0d` re-keying `allowlists.js` entries the reflow broke.
        `check:all` exit 0.
  - → **R-066** Found by S2, owner call: `skills/figma-workspace-architect.astro` has
    `style="margin: 0 0 {mode.subModes.length ? …}"` — braces in a quoted attribute are
    never evaluated, so the margin has never applied on the live site. Fix is
    `style={`…${…}`}`, which changes rendering; until then it carries a
    `<!-- prettier-ignore -->` (the plugin lowercased `subModes` inside the string).
  - → **R-127** Found by S2: `check:component-count` / `check:docs` allowlists key on exact
    adjacent source lines, so any reflow of a prose paragraph breaks them. Key on content
    instead?
  - [x] S3 `97ddb2bd` config (`eslint-plugin-astro@1.7.0`), `31373193` 54 findings fixed
        (49 `no-var`, 3 tabindex, 2 TS); browser smoke across ClientRouter navigation clean.
  - [x] S4 ADR-0147 (0146 is taken on branch `spike/own-mcp-server`).

- [x] **`@atelier-ui/react` is published as a self-contradictory package — fixed 2026-09-13**
      (`68a3b52`, ADR-0138; the `"type": "module"` declaration then exposed `check:exports`
      resolving with NodeNext against libraries that use bundler resolution, measuring zero
      React exports and reporting that as 40 findings — `ae33c45`, ADR-0139). Original entry:
      something
      depends on that.** `dist/libs/react/package.json` declares `"type": "commonjs"` while
      the files it ships are raw ESM. Found 2026-09-13 while diagnosing why only Vue's
      generated unit tests died on `Unknown file extension ".css"`: Vue's package is
      _correctly_ formed ESM, so Vitest externalises it and hands it to Node, which cannot
      load the `import "./index.css"` that `libs/vue/vite.config.mts` injects as a rollup
      banner. React ships the same per-component `import './atl-button.css'` and survives
      only because Vite's dual-package guard refuses to externalise a package whose
      declared type contradicts its contents, and inlines it instead — which is where the
      CSS-stubbing lives. Proven in both directions in an isolated repro built from the
      real tarballs: forcing `@atelier-ui/react` external reproduces the crash with Vite's
      own "seems to be an ES Module but shipped in a CommonJS package" diagnostic; forcing
      `@atelier-ui/vue` inline fixes it. So the fix that shipped (`server.deps.inline` in
      the generated Vue unit config) is correct for Vue and React is a latent version of
      the same bug, held off by a build defect rather than by design. Angular has no
      version of it — ng-packagr inlines styles as literal strings, so no `.css` import
      exists to load. Decide whether to correct the React package's `type` (and then also
      give React's generated config the same `inline` entry), or to leave the accident in
      place with this note as its record.

- [x] **`@nx/vue`'s application generator writes a spec file despite `unitTestRunner: 'none'`.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      A generated Vue workspace carries `src/app/App.spec.ts` (Nx's own default, using
      `@vue/test-utils`' `mount`), which neither the preset writes nor documents, and which
      the unit project's deliberately recursive `src/**/*.spec.*` glob then runs. React and
      Angular honour the option. Harmless today — the file passes — but it means "the tests
      in this workspace" is one file larger than the preset knows about for one framework.
      Either narrow nothing and document it, or delete the file post-generation.

  - [x] **S5a — the Figma file key the attendee actually owns — done 2026-09-13** (`40a2eff`,
        plus `e6eb441` closing the generator-side validation its own author named). Owed from the same
        owner decision as S1 and not delivered with it: `figma:snapshot` ships with a
        literal `<YOUR_FIGMA_FILE_KEY>` placeholder because the preset has only a boolean
        `figmaMcp` option, and `QMnDD8uZQPldPrlCwZZ58T` is _this_ repo's file, not the
        attendee's. A `figmaFile` option on the preset and a `--figma-file` flag plus
        prompt on the CLI (asked only when the Figma MCP was accepted) put the right key
        into the generated script at scaffold time. This matters more now than when it was
        first noted: the cohort duplicates the Atelier file into their own drafts on Day 2,
        so every attendee has a different key, and the placeholder is the first thing that
        breaks.

  - [x] **S6 — the scaffold becomes the cohort environment — done 2026-09-13** (ADR-0137 in
        `751cad6` with the English pages, `a4952b4` with the German curriculum). The deletion
        turned out to be the substantive part: the agenda's half-page on which gates go red
        _by design_ in the clone exists only because attendees worked in our repo. One
        consequence the ADR names is still landing separately — the API rules as a hosted page
        both audiences read. Originally planned as: Today's
        split is clone-for-the-cohort, scaffold-for-the-self-serve-reader, and the
        curriculum names three things the scaffold does not have: `plan/big-picture.md`'s
        API rules (Day 2 Block 2), `libs/spec/src/index.ts` as the spec template (same
        block), and `nx storybook <fw>` on 4400-4402. `design-principles` is already a
        hosted page; `big-picture` is not. Closing it means: the API rules reach the
        scaffold (a hosted page the generated `CLAUDE.md` links, plus a vendored short
        form), a spec-style example ships beside the contracts, and the doc pages that
        branch clone-vs-scaffold get rewritten — `tutorial.astro:622` ("the scaffold has
        no Storybook of its own") is **already false** against `preset.ts`'s per-app
        Storybook targets, `first-component.astro` mounts the kata under `libs/<fw>/…`,
        and `schulung.astro:299-301` plus `tasks/archive/schulung-2tage-agenda-2026-09.md:14` state the
        excluded-scaffold rule in prose. Every new docs line that cites 6006 needs a
        content-keyed `SCAFFOLD_PORT_EXEMPT` entry (`tools/scripts/lib/allowlists.js`),
        and the ADR needs its row in `plan/adr/README.md` plus a dated `Corrected`
        paragraph written **into** ADR-0084 in the same commit, or `check:adr-refs` fails.

    Order: S1 → S2 → S3 + S4 → S5 → S6, each its own commit. The expensive gate is
    `cli-e2e` (~7 min per framework, ~20-45 min total, and `nx affected` reaches it from
    any preset edit); run it single-framework per step and full before the last push.

- [x] **Where Angular's a11y coverage actually comes from — eslint (static) and axe _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      (rendered) cover different ground, not the same ground twice.** Found 2026-09-11
      investigating a false "zero `@angular-eslint/template/accessibility-*` rules
      enabled" premise: `libs/angular/eslint.config.mjs`'s
      `...nx.configs['flat/angular-template']` already pulls in all 11 rules of
      angular-eslint's own `templateAccessibility` preset (alt-text,
      click-events-have-key-events, elements-content, interactive-supports-focus,
      label-has-associated-control, mouse-events-have-key-events, no-autofocus,
      no-distracting-elements, role-has-required-aria, table-scope, valid-aria), on
      `**/*.html` and on inline templates alike. `check:stories`'s axe pass
      (`parameters.a11y.test: 'error'`) overlaps for six of them — `alt-text` ↔ axe's
      `image-alt`/`area-alt`/`input-image-alt`/`object-alt`/`role-img-alt`/`svg-img-alt`;
      `valid-aria` ↔ `aria-valid-attr`/`aria-valid-attr-value`; `role-has-required-aria` ↔
      `aria-required-attr`; `table-scope` ↔ `scope-attr-valid`; `label-has-associated-control`
      ↔ `label`; `no-distracting-elements` ↔ axe's own `blink`/`marquee` rules — but **four
      have no axe equivalent at all**: `no-autofocus`, `click-events-have-key-events`,
      `interactive-supports-focus`, `mouse-events-have-key-events`. And even where a rule
      overlaps, the two mechanisms don't check the same thing: eslint statically walks
      _every_ template branch at author time regardless of what any story renders; axe
      only sees whatever DOM a story actually puts on screen, so a variant no story
      exercises gets zero axe coverage but still gets the eslint pass. Neither subsumes
      the other. No action needed here — recorded so the next "is X accessibility check
      already covered by Y" question doesn't have to re-derive this from scratch.
- [x] **Three gaps ADR-0128 named and did not close** (2026-09-11). _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
  - [x] **`check:paint`'s measurements are not run-to-run deterministic — check this _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        before trusting any tighter tolerance.** Two `--update-baseline` runs each drifted
        Vue's `AtlAlert` height from 55px to 56px, on a _different subset of its stories each
        time_ (three, then five of six). Always the same component, field and direction, always
        inside the 2px tolerance, so it has never flipped a finding and nothing noticed. Find
        out whether it is layout timing, font loading or a measurement race before anyone
        narrows the tolerances or reads a 1px paint finding as real.
        **Sharpened 2026-09-11 after writing the above:** the risk is a nondeterministically RED
        gate, not a cosmetic wobble. ADR-0080 §2 puts a finding's own measured text into its
        identity, and these AtlAlert heights are _recorded_ findings — so a run measuring 56px
        where the baseline says 55px yields an unrecorded finding and a stale one at once, two
        blockers on a gate that was green the run before. Then measured: two consecutive unscoped
        runs, both exit 0, neither producing an AtlAlert height finding. The drift has been seen
        only in `--update-baseline` runs and does not reproduce on demand. Not reproducible, not
        explained, not currently firing — the worst of the three states to leave a gate in. Find
        the mechanism (layout timing, font loading, a measurement race); do not widen a tolerance
        around it. Clearing it by hand-editing the baseline was done once today, under review, for
        five entries known to be this noise; the file's own header forbids hand edits and that was
        a deliberate exception, not a precedent.
  - [x] **`paint-baseline.json` keys a finding without its measured value, so drift inside a _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        recorded finding is invisible.** `check-paint.mjs:1803` keys on
        `fw|component|story|state|field`; the `detail` string (`"rendered 172px, figma 222px"`) is
        not part of it. A height drifting 172px → 400px against the same Figma 222px keeps its key
        and the gate stays green. ADR-0080 §2 closed exactly this hole for `type-baseline.json` —
        "the measured value is part of the finding's text, so 14-vs-16 drifting to 14-vs-18 is now
        two blockers" — and `paint-baseline.json`, written later under ADR-0121, did not inherit
        it. Not a mechanical port: putting the value in the key makes every wobble inside the 2px
        tolerance a blocker, which is what the AtlAlert case shows can happen. Decide the pairing
        (value in the identity **and** a tolerance-aware comparison) rather than porting one half.
  - [x] **The `play` wait costs about 50% runtime**, measured 2026-09-11: `check:paint` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        unscoped went from ~230 s to ~345 s, because every story now pays Storybook's own
        `waitForAnimations` (~100 ms flat, since this Chromium session does not match its
        `isTestEnvironment()` check) plus the settle poll — even though no story has a `play` yet.
        A known mitigation was deliberately not taken: spoofing the page's user agent to contain
        `"StorybookTestRunner"`, the string `@storybook/test-runner` itself relies on, short-circuits
        that wait. Left out to avoid a second dependency on a Storybook internal in the same change.
  - [x] **The ADR-0124 `[ROSTER]` floor is cross-framework.** It fires when a component has _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        zero measurements in _every_ framework, so one framework silently losing all coverage of
        a component — someone breaks `meta.component` in just the Vue story — is caught by
        nothing. A per-framework floor needs its own exemption axis, because several components
        legitimately measure in one framework and not another (Angular's `AtlDrawer` resolves a
        probe where React and Vue do not).
  - [x] **`no-probe` never counted the "probe element vanished while measuring" case.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        That warning fires from `comparePaint`/`compareFull`, which have no access to
        `runFramework`'s counter, so the sub-case is warned and never ratcheted. Pre-existing,
        preserved deliberately by ADR-0128 rather than widened alongside it.
- [x] **Pay down the `check:paint` skip debt, now that ADR-0128 makes it immovable.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      Ordered by what the breakdown says it costs, cheapest first:
  - [x] **`not-rendered` is three components.** `AtlChat` contributes 12 in every framework _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (its Drawer, Popup and Inline stories render closed), `AtlDialog` 6-9, Angular adds
        `AtlDrawer`. Give them stories that open, or probes that measure the open state.
  - [x] **The resolution half of `no-probe` is four contracts.** `AtlDrawer`, `AtlMenu` and _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `AtlTooltip` declare no `probes` at all; Angular's `AtlSelect` is the documented
        button-trigger case. Adding a probe to three contracts is the single highest-yield edit
        in this list.
  - [x] **Angular's `AtlButton` fails every one of its nine focus probes**, where React's _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        equivalent fails two of nine. That asymmetry is its own bug and is not explained by the
        contract.
  - [x] **`skipped-demo` is the expensive half and partly not a defect.** 16/18/24 distinct _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        components. Vue's 62 against Angular's 37 is broader reach plus a real difference in
        story granularity — Vue's `AtlAvatarGroup` is its own roster member with four stories
        where Angular folds the same demo into one story inside `atl-avatar.stories.ts`. React's
        `AtlRadioGroup` contributes six known false positives of the ambiguous-demo heuristic
        itself. Decide per component whether the story or the heuristic is wrong before touching
        either.

- → **R-133** **`AtlRadioGroup` has no accessible-name mechanism.** No `aria-label` or
  `aria-labelledby` prop, and no story wraps it in `<fieldset><legend>`. Found 2026-09-12 by
  the Codex cross-check during the Vue a11y work — **not** by any of the 20
  `vuejs-accessibility` rules and not by axe's default ruleset either, so nothing in this
  repo would have surfaced it. Likely a small API addition, and it needs Angular/React parity
  consideration before it lands in one framework only.
- [x] **Where Vue's a11y coverage comes from — eslint (static) and axe (rendered).** Mirrors _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      the Angular entry above, measured 2026-09-12 against the installed axe-core's 105 rules.
      Twelve of `eslint-plugin-vuejs-accessibility`'s twenty rules overlap axe
      (`alt-text` ↔ `image-alt` and friends, `form-control-has-label`/`label-has-for` ↔ `label`,
      `aria-props` ↔ `aria-valid-attr*`, `tabindex-no-positive` ↔ `tabindex`, …). **Seven have no
      axe equivalent at all:** `aria-unsupported-elements`, `click-events-have-key-events`,
      `interactive-supports-focus`, `mouse-events-have-key-events`, `no-autofocus`,
      `no-redundant-roles`, `no-static-element-interactions` — four of which are the same family
      Angular's analysis independently identified. `no-access-key` is a nominal overlap only: axe's
      `accesskeys` checks uniqueness, the lint rule checks presence.
      The branch-coverage argument is not theoretical here: **5 of those 7 axe-blind rules are
      exactly the ones that fired**, and the one overlapping rule that caught a real defect
      (`role-has-required-aria-props`, the combobox's `filteredOptions.length === 0` branch) sits
      on a branch **no story renders**, so axe never had a chance to see it.
- [x] **Two suppressions that rest on platform guarantees and no repo test** (Vue, 2026-09-12). _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      The `<dialog>` Escape-close path behind the backdrop-click suppressions in `atl-chat.vue`,
      `atl-dialog.vue` and `atl-drawer.vue`, and the native-button Enter/Space→click path behind
      `atl-menu-trigger.vue`'s wrapper suppression. Both are standard platform behaviour and both
      are architecturally sound — but the tooltip defect found the same day proves that a
      confident comment is not evidence. Pin them with tests or accept them knowingly.
- [x] **Optional, lower priority:** `atl-dialog`, `atl-chat` and `atl-drawer` have no built-in _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      close-button affordance. Raised by the Codex cross-check: the backdrop-click suppression is
      sound only because Escape is guaranteed, which leaves touch-only users without a first-class
      close control.

- [x] **A NUL byte in `check-figma.js` makes `grep` go blind on it, tool- and _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
      locale-dependently.** Byte 93981 is a literal U+0000, used deliberately as a key separator
      that cannot collide with content. The side effect is that some `grep` builds classify the
      whole 3,778-line file as binary and report zero matches without saying why — it silently
      produced a wrong measurement twice this week, once in a gate-wide audit and once in a scope
      classification. Either swap the delimiter for something printable that still cannot collide,
      or record the hazard where measurement passes will meet it. Until then: `grep -a` or
      ripgrep when sweeping the gate suite.

- → **R-112** **The repo root is lint-uninhabited apart from `package.json`.** The root
  `eslint.config.mjs` has carried a `**/*.json` block with `jsonc-eslint-parser` since the
  workspace was created, pointing at nothing: `@nx/eslint/plugin` only infers a lint target
  for a project root of `.` when that root has a `src/` or `lib/` directory (read from
  `@nx/eslint/dist/src/plugins/plugin.js`), and the repo root has neither. As of 2026-09-12 an
  explicit root `lint` target covers `package.json` and nothing else. `nx.json`, `.prettierrc`,
  `wrangler.jsonc` and the rest of the root configuration are still unlinted — decide
  deliberately whether that is fine or whether the target should widen, rather than leaving it
  to whoever next wonders why a root file has no rules.
- → **R-153** **`atelier/storybook-version-lockstep`'s outlier is a majority vote.** It names the
  package that disagrees with the majority-pinned version, lexicographic tie-break. Correct and
  unambiguous at 11-vs-1; in an even split — mid-migration, say 5 vs 5 after a deliberate
  partial bump — it still flags a disagreement but which half it calls the outlier is
  arbitrary. Anchoring on `storybook`'s own version instead would be semantically meaningful
  (the family follows core). Small change, worth doing the next time that file is open.
  The rule also accepts prerelease and build suffixes (`10.6.0-beta.1`) as exact — defensible,
  but it was a judgement call, not a stated requirement.

- [x] **`storybook doctor` as a gate — blocked on an offline requirement, not on value.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      Measured 2026-09-12: it is a cheap static health check (missing dependency, incompatible
      packages, mismatched versions, duplicated dependencies, config-load errors), needs no build
      and no server, and reports clean here today. But `@storybook/cli` is **not a dependency of
      this repo** — `storybook`'s dispatcher delegates `doctor` to it and npm fetches it on first
      use. `check:all` is offline by design, so adding it means vendoring `@storybook/cli` as a
      devDependency first, and that is its own decision about carrying a package we otherwise
      never install.
- [x] **`check:storybook-manifests` cannot be made cheaper — answered, so nobody re-tries it.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      The gate builds three Storybooks to check the emitted `components.json`, and four cheaper
      paths were tested 2026-09-12 and all fail: `storybook index` produces a different artefact
      with no docgen; `build --preview-only` emits a byte-identical manifest but saves nothing
      measurable (~11.8s vs ~11.6s for Angular — the manager UI was never the expensive part);
      `storybook tools docs list` without a running server returns **decoy-shaped** `id`/`name`-only
      entries for all 32 Angular components, exactly what `check-manifests.js`'s own `[DECOY]`
      check exists to catch; and a running dev server 404s the manifest routes by design under
      `experimentalDocgenServer`. Nx's caching of `build-storybook` stays the mitigation.

- [x] **Five real interactions have no behaviour id at all** (found 2026-09-11 by sweeping _(closed 2026-10-11: all children closed by the review triage)_
      for interactive affordances; ADR-0129 records why the manifest could not surface them
      itself — it locks what is already covered). Each needs a spec in all three frameworks
      before an id can be added, which is the manifest's own admission rule:
  - [x] **Tooltip**: focus/blur show and hide, and Escape to dismiss. The four existing ids _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
        are hover-only. React wires `onFocus`/`onBlur` beside the hover handlers plus a
        document-level Escape listener; Angular and Vue do the same in their own idiom.
  - [x] **Menu**: Escape-to-close, outside-click-to-close, and arrow-key navigation between _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        items. React and Vue implement all three by hand; Angular delegates the entire
        interaction surface to `@angular/cdk/menu`. The five existing ids cover only
        trigger-click, item-click, variant class and disabled item.
  - [x] **Dialog and Drawer**: the native `<dialog>` `cancel` event synced to `open` — _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        exactly what Angular's `EscapeToClose` story play already demonstrates without an id.
  - [x] **Chat**: the `drawer` variant is the **default** and appears nowhere in the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        manifest, which names only `inline-variant` and `popup-variant`. It is the variant
        backed by a real `<dialog>` with `showModal`, `cancel` handling and backdrop dismissal.
  - [x] **Table**: `AtlTh.onSort` (cycles asc→desc→none, reflected in `aria-sort`) and _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `AtlTr.onSelectedChange` (reflected in `aria-selected`). The ids `sort-button` and
        `checkbox-selectable` only assert the controls render.
- [x] **Apply ADR-0129's criterion to the remaining 47 story-classified behaviours.** The _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      accordion pilot found 2 of 9 — a play earns its place only where the assertion depends on
      computed layout, real focus order or real browser event sequencing, because every
      behaviour is already covered three times in jsdom and jsdom implements
      `activeElement`/`focus()`/`blur()` fully. Cheap now that the criterion is sharp, and it
      produces the actual work item; 49 is only the upper bound.
- [x] **A fixed Figma height for a content-driven component.** `AtlAccordionGroup` is _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      `display: block` with auto height, and every story renders a different pixel height
      against the master's single 222px row — which is why its eighteen existing height findings
      are recorded rather than fixed. Same class of question as the AtlChat master's one row for
      three structurally different panels. Answer it at the master, not in the gate.

- [x] **Introduce stylelint and let it replace the hand-written CSS gates** (owner
      decision 2026-09-11; ported 2026-09-11/12, ADR-0130). Three gates became four rules in
      `tools/stylelint-rules/`: `check:css-tokens` split into `atelier/no-raw-color-literal`
      and `atelier/no-undeclared-token`, `check:token-tiers` into `atelier/no-primitive-token`,
      `check:token-bypass` into `atelier/no-token-bypass`. `check:all` 46 → 43 steps; the four
      scripts are deleted, parity proven by ten mutations against the old scripts first.
      No `stylelint-config-prettier`: stylelint 17 ships zero formatting rules (removed in 16,
      split into an opt-in `@stylistic` plugin), verified by listing the installed rules
      directory. Exemption maps stayed in `tools/scripts/lib/allowlists.js` and the rules
      `require()` it — `kind: design|gap`, the `why` and the staleness check are the content,
      and a rule option taking a list of strings loses all three.
  - [x] **The three that stay gates, decided 2026-09-12 and recorded in ADR-0130 §4–5 with the
        sharpened test written back into ADR-0126.** The line is not "how many files does it
        read" — `no-undeclared-token` reads `tokens.css` and `no-primitive-token` walks all
        three trees, and both are rules. It is **attribution**: a rule earns the line only when
        every occurrence it could flag has one specific file and location where the finding
        belongs. `check:variants` fails it twice over (its primary verdict is "does
        `.variant-danger` exist anywhere in this _directory_", load-bearing because Angular's
        toast splits `.variant-*` and `.position-*` across two stylesheets under one component
        key; and the defect is an _absence_, with no line to anchor). `check:typeface` fails it
        for the same directory-scoped reason plus a ratchet baseline stylelint cannot model.
        `check:dead-selectors` joins CSS against what a template can emit. `check:box-sizing`
        was never a candidate — a generator in `--check` mode that calls Prettier's async API.
  - [x] **Staleness narrowed cross-framework → per-framework, as the price of cache _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        independence.** Nx wires one `stylelint` target per project, so an exemption that is
        legitimately asymmetric across frameworks would be reported stale by the two that do
        not reference it. Every current entry is referenced identically in all three (verified
        by grep), so behaviour is unchanged today. Revisit only if an asymmetric exemption is
        actually wanted; the alternative — each target scanning all three trees — makes every
        framework's lint cache invalidate on any framework's CSS change.

- [x] **The scaffold gets the CSS-discipline rules (2026-09-12, ADR-0131).** Three of the four
      stylelint rules ship wired into a generated workspace — `no-raw-color-literal`,
      `no-undeclared-token`, `no-token-bypass` — on the criterion of what an attendee hits by
      writing ordinary CSS in their first hour. `no-primitive-token` ships inert (index.js
      requires all four) and is deliberately not turned on. Six files as byte-identical clones,
      `sync-preflight` 8 pairs → 14; the generated `nx.json` declares them as `stylelint`
      inputs, so the cache trap's fix ships with the trap. Proven against a real generated
      workspace via a locally published CLI, not an in-memory Tree.
  - → **R-096** **Should stylelint be a permanent assertion in `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs`?**
    The end-to-end proof was real — verdaccio, the published CLI, a bad stylesheet failing
    the scaffold's own target by name — but it lives in a session scratchpad, so nothing
    re-runs it. Adding it to the e2e means adding to a file that also builds Storybook and
    runs Playwright; decide whether the coverage is worth the minutes.
  - → **R-097** **An implicit coupling nothing enforces.** The scaffold's config passes neither
    `componentRoot` nor `allowlistsFile`, correct while it has no exemption file. Someone
    hand-adding exemptions later without adding `componentRoot` gets a staleness scan that
    silently does not run.
  - [x] **Formatting ships, a `types` script does not (2026-09-12, ADR-0131's dated
        extension).** A fresh Nx tree has no `prettier` devDependency and no `.prettierrc`, so
        the preset writes both plus `format` / `check:format`, in this repo's
        `prettier --check .` shape — `nx format:check` exits 0 printing "No formatter
        configured" when none is resolvable, which is a silent pass on an untouched tree.
        `types` ships nothing: no generated framework exposes a `typecheck` target, and
        `nx build` already type-checks the example story (proven by injecting a `TS2322`).
  - → **R-095** **Nothing type-checks `.storybook/*` in a generated workspace**, for any framework —
    `main.ts`, `preview.ts`, `vitest.setup.ts`. Angular's scaffold writes a
    `.storybook/tsconfig.json` that nothing runs `tsc` against; React and Vue get no such
    file. Closing it means writing a tsconfig for two of three frameworks, which is why it
    was left open rather than guessed at. The same gap in this repo is covered by
    `check:types`.

- [x] **The staleness half of the stylelint rules has no home for its finding**, which is the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      attribution test of ADR-0130 failing against a rule this repo kept. A `[STALE]` report
      anchors at `1:1` of whichever file stylelint happens to process first, and that file
      varies run to run (reproduced on the unmodified code, so it predates the port). It
      survives as a _secondary_ signal on rules whose primary verdict is local — but if a
      third such signal ever wants adding, this is the wrinkle to weigh, not a precedent to
      copy.

- → **Gate review of 2026-09-11 — the findings not fixed in the same session.** _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  All 47 runnable gates were run individually (exit code + duration, warm: 471 s total,
  `check:paint` 230 s of it, tree clean afterwards). 46 green; the only red is
  `check:parity`, whose 37 DRIFT blockers are the known debt below and whose `:report`
  twin is what `check:all` actually runs. Three gates that could read green while
  measuring nothing were fixed the same day (ADR-0124); these are the rest, each
  verified by reading the code.
  - [x] **Nobody polices `PROP_SURFACE_EXEMPT`.** `check-prop-surface.js:1076` skips _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `[STALE]` for any key whose prop the spec does not declare, saying
        "check-manifest-parity.mjs is what actually keeps such an entry live";
        `check-manifest-parity.mjs:263` says "STALE-EXEMPTION hygiene over
        PROP_SURFACE_EXEMPT stays check:props' job — this gate reads the list, it does not
        police it." Both in writing, in the files. 61 entries, of which **21 key on the prop
        `errors`, a name that appears zero times in `libs/spec/src/index.ts`**. Decide which
        gate owns it and make the other stop claiming it does.
  - [x] **`check:manifest-parity`'s `[DEFAULT]` is guarded on both sides** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (`:345`, `ea.default !== undefined && eb.default !== undefined && …`), so a real
        default divergence where one framework's docgen reports no default is invisible.
        The file header calls this tag "check:defaults' cross-framework half" —
        **do not retire `check:defaults` on that claim** until the guard is answered. The
        three normalizers also disagree on quoting (`lib/docgen.mjs:492` strips, `:234`
        `JSON.parse`s, `:197` passes through raw), which any surviving asymmetry is
        currently masked by.
  - → **R-154** **Exemption staleness is per-gate and mostly absent.** 19 gates import
    `lib/allowlists.js`, which holds 20 exemption maps; **7 gates check their own
    entries for rot.** ADR-0034 requires the check ("load-bearing allowlists rot") and
    ADR-0119 sharpened what an entry is. Belongs in the shared harness, not in each
    gate — see ADR-0125's `gate-kit` boundary.
  - → **R-110** **ADR-0009's regenerate-and-diff idiom is reimplemented ~10 times**, each with
    its own `--check`/write boundary: `check:spec`, `check:tokens`,
    `check:preflight-clone-sync`, `check:scaffold-snapshot`, `check:artboard-palette`,
    `check:box-sizing`, `check:behaviors-gen`, `check:llms`, `check:cookbook-manifest`,
    `check:design-status`. Two of them decide write-vs-check with
    `mode = process.argv[2]` and a bare `=== '--check'`
    (`sync-preflight.mjs:96`, `gen-scaffold-snapshot.mjs:67`), so a typo'd flag
    **mutates the repo instead of checking it**. One helper, one boundary.
  - [x] **`check:paint`'s two swallowed Playwright calls.** `:1190` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `.hover().catch(() => undefined)` with no `page.setDefaultTimeout` anywhere: a
        non-actionable probe burns Playwright's 30 s default silently, and the element is
        then measured **un-hovered** and compared against the `state=hover` row — a pass on
        an interaction that never happened. Same shape at `:1109-1117` (15 s
        `waitForFunction`). These are the mechanism behind the "prime suspect check:paint"
        note already in this file, and they are also most of why the gate costs 230 s.
  - [x] **`check:paint` does not check that `dist/storybook/<fw>` is fresh** (`:983`, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        it only requires `index.json` to exist), so a stale build measures old code and
        passes. The ordering dependency on `check:storybook-manifests` lives only in
        `check:all`'s `&&` chain, nowhere in the gate. Also `:1249` stamps
        `generatedAt: new Date().toISOString()`, so every `--update-baseline` is a diff even
        when the findings are identical.
  - [x] **`check:paint`'s story-evidence scan reads prose.** `:1043-1060` builds the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        evidence blob from the story's whole node range and feeds it to `scanLiteralAttrs`
        (`:387`) and `scanObjectLiteralProps` (`:402`), so a
        `parameters.docs.description.story` containing `size="lg"` is indistinguishable from
        markup. Confined to render-only stories without `args` (verified — `literalOverrides`
        is only populated inside `isRenderOnlyDemo && !isForwardingDemo`), but inside that
        branch a literal ranks **above** the resolved args in `buildVariantKey:538`, so the
        story can be compared green against the wrong master variant.
  - → **R-128** **`check-docs-sync.js` holes.** `:377` populates `used` for
    `SCAFFOLD_PORT_EXEMPT` and never reads it, so there is no `[DEAD-ALLOWLIST]` check —
    unlike `check-component-count.js:179`, which uses the identical content-keyed idiom.
    `:104-146` `parseSpec()` builds a one-file `ts.createProgram` and never checks
    diagnostics, so degraded module resolution empties `specProps` and the
    `[DRIFT]`/`[TYPE-DRIFT]` halves pass vacuously while `[MISSING]` still fires.
    `:316` requires `[1-9]\d+` on both halves of a Figma node id, so `1:23` is never
    validated.
  - [x] **`check-category-alignment.js:265`'s ALL-SKIPPED guard is `&&`, not _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        per-check.** Renaming the `libs/<fw>/src/lib/<id>` convention kills the whole
        `[STORY-CATEGORY]` half while `figmaChecked` stays 43, so the guard never fires and
        half the gate goes dark quietly.
  - → **R-155** **Smaller, same family:** `check-component-count.js:111` treats any
    `/generated by/i` in the first 1000 chars as "generated, skip the file";
    `check-vitest-discovery.js:110` is satisfied by the path appearing in a _comment_
    (its header is honest about being a text check); `check-skill-discovery.mjs:74`
    can report ✓ with `checked === 0`; `check-figma-token-names.js:95` matches a
    `--ui-*` declaration in any selector block, not just `:root` (but its
    `checked === 0` guard at `:125` is the model the others should copy);
    `check-sync.js:65` throws on a broken symlink.
  - → **R-156** **`check:stories` runs twice in CI.** `.github/workflows/ci.yml` has a
    dedicated "Storybook tests" job (`nx affected -t storybook-test`), and the "Sync
    checks" job's `check:all` ends with `check:stories`
    (`nx run-many -t storybook-test`) — on a PR the first is affected-scoped and the
    second is not, so the unscoped run happens anyway. The same 60-minute job also
    carries `check:storybook-manifests` (three Storybook builds), `check:paint` (230 s)
    and `check:docs-layout` (a docs build plus a browser). Splitting those out with
    their own timeouts is the operational half of ADR-0125 and is what would have
    bounded the 110-minute hang.
  - [x] **`check:paint`'s three other counters are still printed and unasserted.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        ADR-0124 rule 1 ("every counter a gate prints is asserted or removed") is met only
        for the counters that separate "measured nothing" from "found nothing". A green run
        still reports, per framework, `skipped-demo` 37/43/62, `not-rendered` 25/20/21 and
        `no-probe` 30/21/22 — between 73 and 106 stories each — with nothing asserting any of
        them. Three different questions: a story the ambiguous-demo heuristic could not
        disambiguate, a story that did not render at all, and a probe that would not focus.
        Each wants its own floor or its own exemption map, the same way the roster got one.
  - [x] **Are the fourteen subcomponent `PAINT_ROSTER_EXEMPT` entries really closed?** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `check:paint`'s new roster floor (ADR-0124) records 24 of 43 roster components as
        never measured: 8 `gap` (real defects, warn every run) and 16 `design`. Two of the
        `design` calls are settled — `AtlRadio` matches the call `A11Y_PARITY_EXEMPT`
        already makes, `AtlToast` is an imperative service. The other fourteen are
        subcomponents exempted because **no story sets `meta.component` to them**, and that
        is a property of the story set, not of the component: each has its own Figma master
        and its own contract file, which is what put it in the roster at all, and ADR-0121
        decision 2 asks for a story per variant and per interaction state. Either a
        subcomponent gets a story and is measured, or the reason it never will be belongs in
        the entry. Left as `design` for now because authoring fourteen stories is its own
        decision, not a gate fix.
  - → **R-101** **Is `[DOCGEN-FAILED]` load-flaky?** Promoting a docgen failure from a silent
    `null` to an error (ADR-0124) is right, but it makes the gate's verdict depend on a
    Storybook worker completing. One unexplained observation on 2026-09-11: a
    `check:contracts` run exited 1 with 4 errors while a `check:paint` browser run was in
    flight on the same machine; three immediately following runs were exit 0 / 0 errors
    and the log had already been overwritten, so the 4 errors were never identified. CI
    runs the gates sequentially, so the contention is lower there, but this needs one
    deliberate test — run `check:contracts` under load and see whether the Angular/Vue
    docgen workers fail — before a red build on that tag is trusted as a real finding.
  - → **R-103** **Not reproduced, left recorded:** the concern that `process.exit()` immediately
    after a large finding burst truncates output on a pipe. Measured on
    `check:manifest-parity` — 34 lines identical with and without a pipe. Plausible only
    above the pipe buffer, i.e. exactly on a red run of `check:paint` or
    `check:contracts`. Worth one deliberate test before trusting a red build's output.

- → **Spec-format review follow-ups** (owner decided 2026-09-10: A first, then plan _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  the workflow — `tasks/spec-workflow-plan-2026-09-10.md`):
  - [x] **Option A, honesty pass — done 2026-09-10.** Dated "Corrected" paragraphs on
        ADR-0006 (compiler claim) and ADR-0013 (Angular/Vue "read the spec" fallback);
        `README.md` spec section rewritten (gates, not compiler; example brought to the real
        `AtlButtonSpec`; docs path fixed); `plan/big-picture.md:464` (agent prompt context,
        ADR-0116) and `tasks/claude-design-prompt.md:14` corrected; `AGENTS.md` step 2 says
        "naming contract" and step 3 says what the spec can and cannot settle;
        `/design-to-code` step 2 carries the same plus a "Building for one framework?"
        paragraph; `/tutorial` callout softened the same way. Gates: `check:adr-refs`,
        `check:docs-layout`, `check:llms` exit 0. The scaffold half of A (contract example,
        handoff template) is **not** done here — its shape is the workflow decision, so it
        moved to S2/S4 of the plan.
  - [x] **Target shape decided 2026-09-10 — S, "the stories are the spec" — ADR-0121.**
        Owner answers to the rethink's § 5: S as target (T stays the additive fallback); the
        micro-contract block is **hoisted** to one file per component under
        `libs/spec/src/contracts/`, imported by the three story metas via the
        `@atelier-ui/spec/...` alias the stories already use for `metadata.purpose`, and sits
        beside the component in a one-framework repo; the snapshot generator is pinned to the
        `.mcp.json` version (see below); `index.ts` retires **after** the three-manifest diff
        is green on the whole roster (S6), each retirement with its own ADR and the matching
        correction on ADR-0006/0010/0011. ADR-0096 corrected the same day (handoff document =
        thinking step whose lines have machine-checked destinations).
  - [x] **S0 — switch the instruments on — done 2026-09-10, ADR-0122.** The `CI=1`
        failure was `viteFinal` in the three `.storybook/main.ts` setting the hosted base
        `/storybook-<fw>/` on `process.env.CI`, which the addon-vitest plugin also applies to
        the test server, so the orchestrator's root-relative scripts 404'd (found by fetching
        what the page fetches; `tasks/lessons.md` 2026-09-10). Base now keyed on
        `BUILD_STORYBOOK` alone (`wrangler.jsonc` already sets it). Suite wired as the CI job
        `storybook-test` and as `check:stories` at the end of `check:all`; Angular got its
        `storybook-test` target, a11y wiring, project name and the `@analogjs/vite-plugin-angular`
        plugin its browser config lacked (the suite had never been runnable); its dialog story
        asserted a synchronous answer to an asynchronous state (`@starting-style` fade,
        `cancel` → `effect()`), fixed in the story with `waitFor`. `a11y.test: 'error'` in
        all three previews. Negative test: a broken `play` assertion named the story and
        turned `check:stories` red; restored from a copy. Verified: Vue 242, React 216,
        Angular 229 under `CI=1`. Real CI proof lands with the next push.
  - → **a11y backlog from S0** (React/Vue measured 2026-09-10 with `a11y.test: 'error'`: _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
    **React 28 · Vue 36 failing stories**. Angular's own measurement did not land until
    2026-09-12: the "Angular 0" first recorded here was zero _checks_, not zero failures —
    `vitest.setup.ts` called `setProjectAnnotations([projectAnnotations])` without
    `a11yAddonAnnotations`, so `a11y.test: 'error'` had no consumer and axe never ran in
    the browser suite (found by injection: a bare `<img>` with no `alt` passed clean;
    ADR-0122 "Corrected 2026-09-12"). Fixed — `import '@angular/compiler'` (the same
    partial-Ivy idiom `src/test-setup.ts` already carries) plus the addon's project
    annotations — Angular surfaced **32 failing stories** of its own, across 9 story files
    and 10 components. Totals: **Angular 32 · React 28 · Vue 36**.) Recorded as
    `parameters.a11y.config.rules` exemptions at file or story scope, each rule id and
    reason in a comment pointing here; remove the exemption when the component or story
    is fixed. Per rule (impact) → where; the per-story list is in the exemption comments
    themselves:
    - [x] `select-name` (critical) — React ×6, Vue ×9: native `<select>` without an _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          accessible name (Select stories, Settings Page, Showcase). Same defect as L1 above.
          Angular's `AtlSelect` has no native `<select>` at all — a CDK-overlay custom listbox
          — so it never trips this rule; its own unlabeled-trigger defect is `button-name`
          below, a different rule id for the same missing-name shape.
    - → **R-131** `aria-progressbar-name` (serious) — React ×11, Vue ×9, **Angular ×21**:
      `role=progressbar` without `aria-label` when `label` is omitted. Same as L2 above;
      the spec leaves `label` optional — decide whether the component requires it (React's
      Button-style discriminated union) or every story passes one. Angular: all 6
      `AtlProgress` stories (meta-scoped), the `ManagementDashboard` cookbook demo
      (story-scoped — same story name and cause as React's and Vue's own
      `ManagementDashboard`), and Showcase `AllComponents`.
    - → **R-136** `aria-required-children` (critical) — React ×6, Vue ×4, **Angular ×2** (6 stories,
      2 distinct printed violations — Vitest collapses the identical Empty-group and
      Error-group renders into one message each): AtlChat's `.messages-list[role="list"]`
      carries the empty-state icon/button or the error-state `[role=alert]` as children.
      Component defect — and, corrected from the assumption this line carried before
      Angular's suite ran at all: Angular hits the **identical shape**, not a different
      one (all 6 Drawer/Popup/Inline × Empty/Error stories, meta-scoped). Compare all
      three frameworks together before fixing.
    - → **R-137** `label` (critical) — React ×4, Vue ×2, **Angular ×9**: Table Kitchen Sink /
      Selectable checkbox cells, React Input Disabled / Read Only. Angular: the same
      Table Kitchen Sink / Selectable row-select checkboxes (story-scoped). Angular's
      Table select-all header cell already carries accessible text, so — unlike React and
      Vue — it does not also hit `empty-table-header` below.
    - [x] `scrollable-region-focusable` (serious) — React ×1, Vue ×5: AtlCodeBlock's _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          `.code-block-body` scroll container is not focusable. Already open above
          (docs review); now measured in stories too. Angular's `AtlCodeBlock` stories render
          clean under this rule — not (yet) a cross-framework match.
    - → **R-137** `label-title-only` (serious) — React ×1, Vue ×6, **Angular ×2**: Combobox / Input /
      Select / Textarea error-state inputs named by `title` only. Angular's Input and
      Textarea `WithErrors` stories (story-scoped) hit the same rule by a different path —
      there is no `title` attribute anywhere in either component: axe's `title-only` check
      (`!labelText && !!(title || ariaDescribedBy)`) treats a present `aria-describedby`
      (here, pointing at the rendered error list) the same as a `title`, so it fires anyway.
    - [x] `empty-table-header` (minor) — React ×2, Vue ×2: the select-all checkbox _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          header cell has no text.
    - [x] `landmark-unique` (moderate) — Vue ×2: Accordion panel, Pagination. _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
    - [x] `aria-allowed-attr` (critical) — Vue ×1: tooltip-wrapped menu trigger. _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
    - → **R-138** `button-name` (critical) — **Angular ×12, new bucket, no React/Vue counterpart**.
      AtlSelect's CDK-overlay trigger `<button>` has no accessible name when `label` is
      omitted (meta-scoped, ×8 stories — the architectural sibling of `select-name` above:
      same missing-name defect, different rule id because Angular's Select isn't a native
      `<select>`). AtlTh's sort-direction button renders only an icon glyph, no accessible
      name (Table `Sortable` + `Kitchen Sink`, story-scoped, ×3 combined). Showcase
      `AllComponents` (×1, both causes together).
    - → **R-139** `listitem` (serious) — **Angular ×20, new bucket, no React/Vue counterpart, and
      missing from ADR-0122's "Corrected 2026-09-12" tally** — a real gap in that
      paragraph's count, found while writing this entry: every `<atl-breadcrumb-item>`
      wraps its own host element around the `<li>`, so the `<li>`'s immediate DOM parent
      is `<atl-breadcrumb-item>`, not the `<ol>` — axe's `listitem` check (distinct from
      `aria-required-children`) fires because Angular components, unlike React's and
      Vue's plain-DOM children, always interpose a real host element between a projected
      child and its logical parent. All 5 `AtlBreadcrumbs` stories (meta-scoped, ×16) and
      Showcase `AllComponents` (×4).
  - [x] **S1 — standalone docgen spike — feasible, done 2026-09-10**
        (`tasks/docgen-spike-2026-09-10.md`). Call the docgen workers Storybook itself uses
        (`@storybook/angular-vite/internal/docgen-worker`, `@storybook/vue3/internal/docgen-worker`;
        React through `react-docgen` `parse()` directly — its worker export drives a different
        engine that this repo does not enable). Cold 3.7 s / 3.5 s / 0.56 s, warm 83 / 93 / 40 ms;
        output identical to the built shards for AtlButton and AtlDialog. Story `args` resolve
        statically through `storybook/internal/csf-tools` (`createStoryArgsResolver`, 85 ms,
        meta merged, `unresolved` reported). Whole roster ≈ 6 s per framework in one process.
        No fallback needed. Rule for S3: render-only stories are demos, not variant claims.
  - [x] **S2 — the micro-contract layer — done 2026-09-10.** `libs/spec/src/contracts/`:
        `types.ts` (schema, `satisfies`-guarded — an extra key is TS2353), `README.md`, 43
        contracts, one per snapshot master, derived from the snapshot, `index.ts`,
        `FIGMA_CONFORMANCE_EXCEPTIONS` and the master descriptions. Codex Gegenprobe on the
        schema found five real gaps (state-axis data values, cross-component `axisMap`,
        `null` values, Toggle's wrong keys, exemptions unmirrored in the master) — all folded
        into the check's rules and the contracts; recorded as the "Refined 2026-09-10"
        paragraph in ADR-0121. Not yet done from Decision 3: the story metas do not import
        the contract (no consumer yet — lands with the docs block in S5).
  - [x] **S3 stage 1 — `check:contracts` — done 2026-09-10.** `tools/scripts/check-contracts.mjs`,
        in `check:all` before `check:stories`. Offline, ≈ 4 s per framework: docgen via the
        Storybook workers, story args via csf-tools, snapshot, contracts. Rules `[AXIS]`,
        `[BOOLEAN]`, `[ENUM-UNDRAWN]`, `[COVERAGE]`, `[STALE-EXEMPTION]`, `[CONTRACT-*]`,
        `[DOCGEN-EMPTY]` (errors) and `[COVERAGE-BOOL]`, `[FIGMA-ONLY]`, `[UNMIRRORED]`,
        `[NO-STORY-META]`, `[NO-MASTER]`, `[FW-ONLY]`, `[UNRESOLVED-ARGS]` (warnings);
        `--emit` writes the parity `codeSpec` sections it can fill. Three negative tests red
        then restored. Closing the roster's real coverage gaps took **26 new stories**
        (Angular 5, React 10, Vue 11), all rendered and axe-clean in the browser suite.
        Exit 0 with 93 warnings — the visible debt below.
  - [x] **Debt `check:contracts` made visible** (93 warnings, 2026-09-10): _(closed 2026-10-11: all children closed by the review triage)_
    - [x] `[COVERAGE-BOOL]` ×31 — booleans never `true` in any story (Combobox _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          `required`/`readonly`, Progress `indeterminate`, Radio `disabled`, Stepper
          `linear`, Table `stickyHeader`, Textarea `required`/`readonly`, plus React-only
          Checkbox/Input/Pagination/RadioGroup/Select). Under S every Boolean state gets a
          story; promote to error once the stories exist.
    - [x] `[NO-STORY-META]` ×46 — 15–16 child masters per framework (Th, Td, Tr, Tbody, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          Tab, Step, Option, MenuItem, MenuSeparator, AccordionItem, BreadcrumbItem,
          ChatMessage, ChatSuggestion, ChatTyping, AvatarGroup in Angular, Toast in
          React/Vue) have no story meta of their own — their shape and coverage are stage 2
          (nested-arg evidence).
    - [x] `[FIGMA-ONLY]` ×7 UNEXPLAINED — Combobox `state=filtered`/`selected`, Input and _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          Textarea `state=filled`, Select `state=filled`/`open`, Table `error`. Each needs a
          decision: draw it in code, drop it from the master, or give it a sourced reason.
    - [x] `[NO-MASTER]` — AtlIcon has no snapshot master (its glyphs are on the Icons page _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          the snapshot does not index; ADR-0057). Decide: index the Icons page into the
          snapshot, or record AtlIcon as code-only by design.
    - [x] `[FW-ONLY]` ×2 — AtlButton `type` exists in Vue only; AtlRadioGroup _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          `orientation` in React only. `check:props` territory (ADR-0093); the React
          `react-docgen` importer also drops props resolved only through `node_modules` types,
          so React's `type` absence may be tooling, not code — verify before fixing.
    - [x] `[UNMIRRORED]` ×2 — the same two `codeOnly` entries are not named in their _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          masters' descriptions; add the line on the Figma side when the Bridge is connected.
  - [x] **S3 stage 2 — `check:paint` — done 2026-09-10** (ADR-0121 "S3 stage 2 done").
        Playwright over the built Storybooks, rendered values vs the resolved `--ui-*` token
        the master binds, hover/focus rows, ratchet `tools/figma/paint-baseline.json` (755
        entries after probes and `[NOT-RENDERED]`), six `probes` in contracts. ~220 s in
        `check:all` after the Storybook builds.
  - [x] **`check:paint` follow-ups:** _(closed 2026-10-11: all children closed by the review triage)_
    - [x] Root-cause the nine frequent shapes not yet examined (Checkbox/Toggle gap, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          radius, font-size; Card/Badge/Textarea height). AtlInput's height (40 vs 44) is the
          2026-09-08 token change — decide code or master per shape, then re-record.
    - [x] React `AtlSelect` stories are classified as demos (three `optionValue` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          literals trip the literal-scan heuristic) and have never been measured. Teach the
          heuristic that repeated literals on _child_ elements are not a variant claim.
    - [x] Overlays (Dialog, Drawer, Chat) are `[NOT-RENDERED]` closed; an open-state _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          recipe per component (click the trigger, then measure) is needed before their paint
          counts. Codex's AtlChat probe finding (per-variant `drawer-panel`/`popup-bg`/
          `chat-card` layers) lives here too.
    - [x] `--theme dark` works but is not in `check:all`; decide whether the chain runs both. _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
    - [x] The baseline is a ratchet on 755 recorded drifts. It is only worth its 220 s if _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          the backlog above shrinks it; review the count monthly.
  - [x] **S6a — `check:manifest-parity` — done 2026-09-10** (ADR-0121 "S6a done"): the
        three-manifest diff with `check:props`' equivalences and allowlist; six real
        divergences recorded (list above); `--compare-props` evidence in
        `scratchpad`/the ADR paragraph — 22 findings only the diff sees, 48 only `check:props`
        (`[DEAD]`, `errors`). Shared `tools/scripts/lib/docgen.mjs` now feeds both checks.
  - [x] **S4 — the scaffold ships the loop — done 2026-09-10** (ADR-0121 "S4 done"
        paragraph; ADR-0123 corrected: addon-vitest ships after all, owner decision).
        Per scaffold: `<app>/src/contracts/` (types, README, AtlButton example),
        `tools/scripts/{check-contracts, lib/ts-eval, figma-snapshot-contracts}` as synced
        copies, a projected AtlButton snapshot (`check:scaffold-snapshot`), `contracts.config.json`,
        `check:contracts` / `check:stories` / `figma:snapshot`, per-app `vitest.config.ts` +
        `vitest.setup.ts`, `a11y.test: 'error'`, `storybook-test` target; Chromium via
        `npx playwright install chromium` (preflight warns). React e2e green in 176 s through
        verdaccio incl. `check:contracts` and `check:stories`; `nx test create-workspace` 78.
  - → **S4 follow-ups** (facts the proof surfaced, not smoothed over): _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
    - → **R-100** `check:contracts` is **vacuously green on the scaffold's example**: `AtlButton`
      is imported from `@atelier-ui/<fw>` in `node_modules`. Since 2026-09-11 the check
      skips such a component itself, before any docgen call, in every framework (summary
      `external: N`) — until then only React's resolver and Vue's worker happened to return
      nothing, while Angular's followed the package's `.d.ts` and returned a zero-prop
      payload (first Angular e2e, CI run 34562307047, red). Only `[NO-STORY-META]`
      remains. Real work happens on the attendee's own components. Give the check a `--manifest <components.json|url>`
      input so library components are compared through the hosted Storybook manifest
      (ADR-0097) — then the example proves something. CLAUDE.md says so today.
    - [x] Angular and Vue scaffolds not run through a real install — **CI ran both on
          2026-09-11** (run 34562307047): Vue green; Angular red on `check:contracts` (the
          item above). Fixed the same day; `E2E_FRAMEWORKS=angular` locally green in 3 m 15 s
          with `external: 1` and only `[NO-STORY-META]`. Lesson recorded (`tasks/lessons.md`,
          2026-09-11): a "not run" follow-up on a shipped artefact is a known-red, not a follow-up.
    - → **R-001** The scaffold ships no `docs-block.ts`, so `[CONTRACT-IMPORT]` is a **warning**
      there (severity keyed on that file's presence beside the contracts — a proxy for the
      preview's wiring, not a check of it) and an attendee's `parameters.contract` renders
      nothing. Decide: ship the block into `<app>/src/contracts/` + `docs.page` in the
      scaffold preview (needs `react` resolvable in the Angular/Vue scaffolds via
      addon-docs), or make the severity an explicit `contracts.config.json` field.
    - → **R-102** `findExternalPackageDir` keys on `_rawComponentPath`, which csf-tools sets only
      for a directly imported identifier; `import * as UI` + `component: UI.AtlButton` or
      `const C = AtlButton` bypass the skip (Codex, 2026-09-11). The templates use direct
      imports; note, not fix.
    - [x] `figma-snapshot-contracts.mjs` verified in `--dry-run` only — the connect path _(closed 2026-10-11 by the review triage: DUPLICATE; see tasks/archive/review-triage-2026-10-11.md)_
          needs the Desktop Bridge. First Bridge session: run it against the Atelier file and
          diff its AtlButton entry with `tools/figma/snapshot.json`'s.
    - → **R-087** The scaffold's `figma:snapshot` script carries a `<YOUR_FIGMA_FILE_KEY>`
      placeholder because the preset has only a boolean `figmaMcp` option. Consider a
      `figmaFile` option so the workshop duplicate's key lands at scaffold time.
  - [x] **CI after the 2026-09-11 push (`bd28fe0`, run 34562307047 / publish 34562307018) —
        diagnosed 2026-09-11.** Storybook tests, Build, Test, Lint, Release drift green on the
        runner; CLI e2e red (Angular `check:contracts`, fixed above). `check:all` then hung ~110
        min on **both** runners, in `check:manifest-parity`: the log shows its complete output at
        04:30:52, 11 s after it started, and nothing afterwards until the cancellation at 06:21:30,
        with the runner's orphan reaper killing `npm run check:all` → `sh` → `npm run
check:manifest-parity` → `sh` → `MainThread`. The gate finished its work and the process
        never exited — it was the only one of the three `lib/docgen.mjs` consumers ending on
        `process.exitCode` alone, while `check-contracts.mjs` and `check-paint.mjs` both call
        `process.exit()`. Fixed by matching them, plus `timeout-minutes: 60` on the `Sync checks`
        and `Verify (release gate)` jobs (neither had one; GitHub's default is 360). Exact
        Linux-only mechanism NOT established — the docgen workers' recursive `fs.watch` handles
        are `unref()`'d and no disposer is reachable; the code comment separates fact from
        hypothesis. Consequence worth keeping: **`check:paint`, `check:contracts` and
        `check:stories` inside `check:all` have still never run on a runner** — the chain never
        reached them. Watch the next run's duration; `check:paint` is ~220 s locally.
  - → **R-105** **`publish.yml` uses `concurrency: { group: publish, cancel-in-progress: false }`**, so
    the hung "Verify (release gate)" job blocks every later release run until GitHub's 6 h
    timeout retires it. Cancel a hung publish run by hand; the new `timeout-minutes: 60` caps
    the next one at an hour. Consider whether the release gate should cancel in progress.
  - [x] **S5a — skill and curriculum — done 2026-09-10** (ADR-0121 "S5a done"; ADR-0113
        corrected). `design-to-code` steps 3/5/6/7 on contract + stories + `check:contracts`;
        handoff template and three fixtures; `schulung.astro` Tag 2 (new gate claim, Block 02
        "Contract & Stories per Prompt", verify list); `design-to-code.astro` step 2 "Contract";
        `first-component`, `workshop`, `claude-design`, `agent-skills` pages; `AGENTS.md`
        steps 2–4; briefs "done when" 5; `@atelier-ui/spec/contracts/*` alias;
        `schulung-claims.e2e.mjs` rewritten (wsdemo fixture, no `index.ts` scenario). Gates:
        docs build, docs-layout, adr-refs, skill-discovery, llms, contracts, lint docs,
        check-skill, test-skill (offline) all 0.
  - [x] → **R-003** _(done 2026-10-12 as R-159: all claims hold, script kept)_ **S5a follow-up:** run `node tools/e2e/schulung-claims.e2e.mjs` on a clean tree —
        Part 1 (the gate claim) was reproduced gate by gate but not executed by the script,
        because its `assertCleanTree` met the day's uncommitted work.
  - [x] **S5b — the contract docs block + story-meta import — done 2026-09-10** (ADR-0121
        "S5b done"). `libs/spec/src/contracts/docs-block.ts` (`ContractBlock`,
        `contractDocsPage`, `createElement` only), `parameters.docs.page` in all three
        previews, 83 story metas import their contract, `[CONTRACT-IMPORT]` in
        `check:contracts`. Playwright read "Contract / 129:20 / hasIcon" off AtlButton's built
        React docs page; suites 234/226/253; Angular and Vue Storybook builds green.
  - [x] **S5 follow-ups:** _(closed 2026-10-11: all children closed by the review triage)_
    - [x] `docs-block.ts` carries one `@ts-ignore` on `@storybook/addon-docs/blocks` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          (`libs/spec/tsconfig.json` uses classic `moduleResolution`, which rejects the
          `exports` subpath; the framework tsconfigs resolve it). Decide: move the spec project
          to `bundler` resolution, or keep the ignore with its comment.
    - [x] React's and Vue's Toast story metas set no `component`, so they carry no contract _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          import and `check:contracts` cannot key them (`[NO-STORY-META]` for AtlToast there).
          Give them a `component` (the container) so the contract reaches their Docs tab.
    - [x] The participant walk-through (Codex, 2026-09-10) still lists: `AGENTS.md`'s local _(closed 2026-10-11 by the review triage: DUPLICATE; see tasks/archive/review-triage-2026-10-11.md)_
          MCP calls heading fixed, but the e2e's Part 1 remains unexecuted until the tree is
          clean (the other session's untracked skill files count).
  - [x] **Cross-framework gaps found by `check:manifest-parity` (S6a, 2026-09-10)** — _(closed 2026-10-11: all children closed by the review triage)_
        recorded as `kind: 'gap'` in `PROP_SURFACE_EXEMPT` so the gate ships green; each is a
        real divergence `check:props` could not see because the spec is silent there
        (ADR-0093 Consequences predicted the first):
    - [x] `AtlDialog` — Vue exposes no `aria-labelledby`; it hardcodes its own `headerId`
          while Angular and React accept the prop. **Resolved 2026-10-08** (`6b3e4aa2`): a
          caller's `aria-labelledby` falls through to the `<dialog>` and wins (pinned by a Vue
          spec), so the behaviour is equal; the allowlist entry is now `kind: 'design'`.
    - [x] `AtlButton` — Angular's `<atl-button>` has no `type` binding or passthrough; _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
          React (via `...rest`) and Vue (`type` prop) do. A `submit` button is impossible in
          Angular today.
    - [x] `AtlCheckbox`, `AtlToggle` — Angular offers no way to pass a custom `id`; React
          and Vue do. Matters for external `<label for>`. **Done 2026-10-08** (`b109160a`):
          Angular gained an `id` input (host `[attr.id]: 'null'` per ADR-0091); the two
          `AtlCheckboxSpec:id:angular` / `AtlToggleSpec:id:angular` gap entries are removed.
    - [x] `AtlAlert` — `dismissed` (Angular, Vue) vs `onDismissed` (React). **Resolved
          2026-10-08** (`6b3e4aa2`): framework-idiomatic naming, like `onPageChange`; the three
          entries are `kind: 'design'`, and `check:manifest-parity` now accepts `design`
          entries as settled.
  - [x] **Class-c behaviour bugs from `tasks/archive/reviews/divergence-triage-2026-10-08.md`, fixed 2026-10-08**
        (test red before, green after, one commit each): Vue tooltip `aria-describedby`
        (`f96a861f`), Vue tabs focus (`8fc1bd77`), Vue accordion group scoping (`553fa4ce`),
        React/Vue combobox skip-disabled (`38536d84`), Angular checkbox/toggle `id`
        (`b109160a`), Vue toggle `useId()` (`22d3749c`). React tooltip JSDoc no longer claims a
        flip it does not do; the flip itself stays an owner decision. Still open from the
        triage: item 7b (Angular button `type`), and
        the Figma master text for stepper `linear` (needs the Desktop Bridge).
  - [x] **Owner decisions of 2026-10-08 on the triage, done** (see the "Resolved 2026-10-08"
        column in `tasks/archive/reviews/divergence-triage-2026-10-08.md`): `errors` accept the shared
        `AtlErrorItem` in React and Vue, 21 gap entries removed (`aaf1cbd3`); breadcrumb
        `current` is the last item by default in all three, any explicit `current` switches
        the default off (`3b850592`); the tooltip no-flip is recorded in its contract and the
        position JSDoc (`b7ce573e`); pagination, stepper `linear`, select keyboard, dialog and
        alert records (`6b3e4aa2`).
  - [x] **Menu keyboard in React and Vue (triage 6a), done 2026-10-08, owner decision**: the
        trigger and menu follow the WAI-ARIA menu-button pattern (`74fab516`): Enter/Space/
        ArrowDown open on the first enabled item, ArrowUp on the last, arrows wrap, Home/End,
        type-ahead, roving tabindex, Escape/Tab/activation close and return focus. Submenus
        stay Angular-only (metadata says so). Disabled items are skipped in React/Vue; the
        CDK keeps them focusable, a recorded difference. 15 specs per framework red then
        green, plus a `KeyboardNavigation` story play each. `a11y-tree.ts` now records
        `aria-describedby` presence, so the Vue-tooltip class of defect fails `check:a11y-parity`
        (shown by reverting `f96a861f` in a scratch change).
  - [x] Stepper `linear` in the Figma master description still says "only the active and _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        completed steps are clickable"; the code (all three) also passes `optional` steps.
        Correct the master's description line, then refresh `tools/figma/snapshot.json`.
  - [x] S6 monorepo retirements — as ADR-0121 Decision 6. S6a (`check:manifest-parity`, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        the three-manifest diff) is built; `--compare-props` evidence in the S6a report: 28
        findings only the manifest diff sees, 48 only `check:props` sees (`[DEAD]` inputs —
        a manifest cannot see consumption — and the 21-key `errors` family, which is a
        spec-incompleteness finding, not a cross-framework one). Retiring `check:props` needs
        a home for `[DEAD]` first.
  - [x] Background for the decision — `tasks/archive/reviews/spec-rethink-2026-09-10.md`: the greenfield _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
        pass the owner asked for. Inventories what a machine can test
        without massive effort (26 rows; 19 need no authored artefact), what figma-console-mcp
        1.40 and Storybook 10.6 extract and verify, and derives the thinnest spec: **S —
        stories are the spec** (component JSDoc + one story per variant/state with a Figma link
        and `play` + a micro-contract block in the story meta for master id, intentional
        mismatches and parity probes; everything else derived from the manifest, the rendered
        story and the snapshot). Codex converged on the same shape independently. It amends
        the morning plan's § 2 and steps S2/S3 (no contract document; T stays as the additive
        fallback) and adds **S0: wire the idle browser-mode suite into CI and set
        `a11y.test: 'error'`** — the largest verification gain available, needs no spec.
        Five decision points in its § 5; S1 (standalone docgen spike) stays the feasibility gate.
  - [x] **Side findings from the rethink, each independent of the shape decision:** _(closed 2026-10-11: all children closed by the review triage)_
    - [x] **Done 2026-09-10** — `tools/scripts/figma-snapshot.mjs` started
          `figma-console-mcp@latest` while `.mcp.json` pins `1.40.0` (ADR-0110);
          `tools/figma/snapshot.json` recorded `serverVersion: null`. The generator now
          resolves the package spec from `.mcp.json`'s `figma-console` entry (missing entry =
          exit 2, no `@latest` fallback) and records `client.getServerVersion()`, marking the
          declared version if the server stays silent. ADR-0110 carries the dated correction.
          The snapshot stays `serverVersion: null` until the next Bridge-connected refresh
          (Codex finding, verified 2026-09-10).
    - [x] The Storybook browser-mode suite (interaction + axe, ~11 s per lib) is `# NOT _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
WIRED` in `.github/workflows/ci.yml:122-135` because it fails under `CI=1` for an
          unfound reason; `parameters.a11y.test` is `'todo'` (React, Vue) and unset (Angular),
          so axe gates nothing today.
    - [x] `AGENTS.md` names an addon-mcp tool `display-review`; the wire name is _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
          `review-create` (`node_modules/@storybook/addon-mcp/dist/preset.js:193`,
          `toMcpToolName("review.create")`).
  - [x] Review Option B (derive `index.ts` unions from a contract record) stays open as _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        plan S6(c) — after one cohort has used S2–S5, not before.
  - [x] Side finding (Codex, verified): Vue generator writes `atl-<fileName>.vue` while _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
        its test template imports `./<className>.vue`
        (`tools/generators/atl-component-vue/files/atl-__fileName__.spec.ts__tmpl__:2`).
        Fix independent of the decision above.

- → **Design-workflow skills — build the decided catalog** (decided 2026-09-07). _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  Research and proposal in `plan/design-skills-blueprint.md` (§ 8 carries the six
  decisions); verbatim digests in `plan/research/design-skills-2026-09-07/`, draft of
  `design-to-code` under its `drafts/`. Decided shape: **two new skills**
  (`design-to-code` with a review/verify mode, `artboard-bridge` for Claude Design)
  **plus architect additions**. Order as decided:
  - [x] `skills/figma-workspace-architect/references/plugin-api-gotchas.md` from the Figma
        section of `tasks/lessons.md`; SKILL.md references list updated; discovery re-synced
        (3a8035d).
  - [x] Fix `tools/scripts/test-skill.mjs`: valid modes derived from the skill's own
        `### <Mode> mode` headings (3d118e8).
  - [x] Pin `figma-console-mcp` to 1.40.0 in `.mcp.json` and in the scaffold preset —
        ADR-0110 (20efda2, 6b23b2b).
  - [x] Record the Code Connect exclusion (toolchain choice) — ADR-0111 (20efda2).
  - [x] ADR-0096 dated correction: `design-to-code` may prefill provenance and scope of the
        handoff document; behaviour, exclusions and reuse decision stay with the author
        (20efda2).
  - [x] `design-to-code` into `skills/` with Build and Review modes, four references, six
        fixtures, `project.json`, explicit `nx.json` entry, `UNDISTRIBUTED_SKILLS` (the
        no-argument `sync-skill-discovery` now skips undistributed names) — d6273ce.
  - [x] skill-creator iteration 1 (2026-09-07): three evals × with/without skill in
        worktrees; graded; with-skill 86 % vs 59 % pass rate, +44k tokens, same wall time.
        Record and critique in `skills/design-to-code/evals/iteration-1.md`; revisions in
        bde4432.
  - → **R-117** skill-creator iteration 2: neutral run names in the prompts, the split/added
    assertions from iteration-1.md, a live-id variant of eval 0, and a Build-from-handoff
    eval once a scratch Figma draft with a code-less master exists.
  - → **R-118** Description optimisation (`run_loop.py`) after the owner reviews
    `skills/design-to-code/evals/trigger-eval.json`.
  - [x] Architect additions (2026-09-07): `references/build-from-code-contract.md` (generic
        recipe, Atelier worked example — kept generic so the distributed skill stays
        repo-free); tool map 71 → 100 tool names with Bridge/REST marks and five new sections
        (token I/O, slots, history/changelog/blame, `ds_*` pipeline, session/multi-file);
        page taxonomy gains Playground/Deprecated/spacer pages, cover contents, doc frames,
        split-on-symptom; component-design gains the state → CSS mapping table and the native
        Slot property; token-architecture gains `codeSyntax.WEB`; audit-checklist gains the
        two Category-1 rules (enumerate consumers before "unused"; delete/rebind is Migrate)
        and the report-tool / a11y-weights note; SKILL.md Audit text carries the same rules.
        Not ported: the southleft lint rule catalog (digest 06 has only its counts).
  - [x] `artboard-bridge` landed 2026-09-08 (9c38317 + revisions): Intake + Publish
        modes, three references (sheet shape, palette mapping, governance), five fixtures.
        Iteration-1 evals (Intake ×2, governance ×1): 87 % vs 43 %; record and critique in
        `skills/artboard-bridge/evals/iteration-1.md`. Publish mode not yet exercised — needs
        a scratch project (`create_project` with the Atelier `design_system_id`), owner's go.
  - [x] `artboard-bridge` iteration 2 (2026-09-08): Intake 7/7 vs 1/7, governance 2/5 vs
        3/5, Publish 2/8 vs 3/8 — record and the reading of those numbers in
        `skills/artboard-bridge/evals/iteration-2.md`. Publish ran for the first time, against
        scratch project `44481d29-1041-4aa0-adf0-cf59028016d7`; the skill correctly refused
        (AtlBadge DRIFT) while the baseline published unverified code. Revisions: description
        carve-out for third-party artboards, P0 refusal as a successful run, P0a repo-wide
        DRIFT case.
  - → **R-006** `artboard-bridge` iteration 3: the write path (P1–P7) is still unexercised —
    needs one component with a fresh parity record (Desktop Bridge re-verify +
    `parity:record`, or a marked synthetic fixture). Also: re-run the governance eval
    against the fixed description, add an assertion that penalises publishing over a
    DRIFT row, lift the `list_projects`-only cap, require the correct decider roles.
  - [x] **Decide: package the skills into `create-workspace`** (owner's question, _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
        2026-09-07; blueprint § 8 decision 7). Preset ships `.mcp.json` + `CLAUDE.md`, no
        skills. Recommended: vendor the generic skills at generate time and give
        `design-to-code` a scaffold profile — but only after its eval runs pass in the
        monorepo. The preset's own `figma-console-mcp@latest` gets the ADR-0110 pin now.
- → **R-149** **`tools/design/artboards.json` has drifted from the live Claude Design project**
  (verified 2026-09-07 via `list_files`): the registry lists 31 artboards including
  `Typography Directions.dc.html`, which no longer exists in the project; the project has
  31 `.dc.html` files including `Index.dc.html`, which the registry does not list. Same
  count, two mismatches. `gen-design-status` reads the registry, so `plan/design-status.md`
  is stale in the one column it says cannot be derived. Why now: it is the exact staleness
  the file's own header warns about, observed rather than hypothetical.
- [x] **AtlCard header tracking: decide which side moves.** `.atl-card-header` sets _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      `letter-spacing: var(--ui-letter-spacing-tight)` (−0.01em) in all three frameworks; the
      master's title text sits on the shared `ty/title` style at 0 %. Known and left open in
      c88a543 (2026-09-07 09:20, "Not changed: the master shows letter-spacing 0% against the
      code's -0.01em"); both eval runs of 2026-09-07 re-found it independently, one calling
      it uncaught. Manifest: `--ui-type-display` pairs with the tight tracking; the title role
      does not say. Decide (tighten the master's style, or drop the tracking from the header)
      and only then treat AtlCard's parity record as clean rather than "clean except the
      documented gap".
- [x] **Is the `Library Tokens` collection stale against `tokens.css`?** Reported by a _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      baseline eval run on 2026-09-07 (unverified by me): the collection was generated
      2026-07-22 (`gen-figma-library-tokens.mjs` unchanged since 39f92a4) while `tokens.css`
      gained the teal/status ramps, `border-width-*` and the `type-*` roles since; the
      generator's header documents which families it skips, so that part is by design, but no
      gate compares Figma variable _values_ to `tokens.css` (`check-figma.js` checks bindings,
      not values). Verify with `figma_get_variables` against the current sheet; if stale,
      re-run `npm run figma:sync-tokens` and decide whether a value-sync gate is worth having.
- [x] **Story `figmaNode()` design links are unchecked against the live file.** All three _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      `atl-breadcrumbs.stories.*` point at `55-141`, which no longer exists (live
      `getNodeByIdAsync` → `null`, 2026-09-07; the master is `55:139`). 91 of the 119
      distinct ids the stories link are outside what `tools/figma/snapshot.json` records
      (masters + referencedNodes), so an offline gate cannot yet tell dead from unrecorded.
      Extend `figma-snapshot.mjs` to resolve every story-linked id (exists / type / master
      it belongs to) and add a `check:story-designs` gate on that; fix the three Breadcrumbs
      links now.
- [x] **Architect Audit mode recommends deletions without its own Migrate protocol.** In _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
      the 2026-09-07 eval run of the token-architecture prompt, `figma-workspace-architect`
      (Audit) classified findings with severities but never opened
      `references/migration-playbook.md`, called deleting the `Effects Tokens` STRING
      variables "zero risk" and offered in-place rebinding — both classified Breaking by its
      own playbook — and never queried `Docs Brand Tokens` before calling `Primitive Tokens`
      a dead duplicate (the baseline run did, and found it backs that system, consistent with
      ADR-0018 → ADR-0030). Fix in the skill: Audit's fix column must route any delete/rebind
      through Migrate's safety classes, and Token Architecture findings must enumerate every
      collection's consumers before "unused".
- [x] **All 37 parity records are DRIFT after the token change** (measured 2026-09-08, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      `npm run check:parity` exit 1, 37 blockers, 0 critical). Expected by ADR-0104 — the
      shared `tokens.css` is part of every component's `inputsHash` — but it means the whole
      gate is red until a re-verify sweep, and `artboard-bridge` Publish is blocked repo-wide
      because its P0 refuses on DRIFT. The sweep needs the Desktop Bridge
      (`figma_check_design_parity` per component, then `parity:record`); the interactive
      Light/Dark pass is only needed for the stateful ones. Decide whether the sweep runs
      per component on demand or as one session.
- [x] **`AtlDrawer.dc.html`'s finding 4 is wrong and should be corrected in the sheet.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      It claims `closeOnBackdrop` is a visible Boolean on AtlDrawer's master but code-only on
      AtlDialog. `tools/figma/snapshot.json` says otherwise for both: AtlDrawer's `properties`
      are `{position, size}` only, and each component's own description cites ADR-0056 —
      "Boolean `closeOnBackdrop`: not modelled — behaviour only, as on AtlDialog." Two
      independent eval runs (2026-09-07, 2026-09-08) reported the finding as fact from the
      sheet; a third caught it only because the skill made it cross-check. Fix the sheet in
      the redesign project (an `artboard-bridge` Publish-style edit) so the next reader does
      not inherit it.
- → **R-151** **`plan/figma.md` carries two stale tables.** § Variable Collections is pre-ADR-0030
  (flagged stale there since 2026-08-26), and the § Components node-id table still says
  `LlmBreadcrumbs 55:141` / `LlmPagination 55:145` where `tools/figma/snapshot.json`
  (2026-09-07) has `AtlBreadcrumbs 55:139` / `AtlPagination 55:143` — a baseline eval run
  spent 35 tool calls on the dead `55:141` (2026-09-07). Replace both tables with pointers
  to the snapshot and `check-figma.js`, or regenerate them from the snapshot.

- → **Component backlog surfaced by the docs review (L1–L4)** — not docs CSS; the _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  docs gate allowlists each with a reason pointing here. Why now: L1 is a critical axe
  violation and the rest are already root-caused.
  - → **R-132** **L1** `AtlSelect` demo / component: native `<select>` without an accessible
    name (axe `select-name`, critical) — either the demo omits the label the
    component needs, or the spec lets it be omitted.
  - → **R-132** **L2** `AtlProgress`: `role=progressbar` without `aria-label` in 16 demo
    instances (axe `aria-progressbar-name`) — compare `AtlButton`'s
    discriminated-union enforcement.
  - → **R-132** **L3** Checkbox/toggle inputs measure 20×20 / 1×1; login-form demo
    `input[type=email]` under 24 px when the sticky nav overlaps — confirm the label
    extends the hit area (WCAG 2.5.8).
  - → **R-132** **L4** `AtlTabs` `variant="pills"` neither wraps nor scrolls at 375 (+19 px on
    `/patterns*`) — `chip-collection-reflow`.
  - → **R-132** `AtlCodeBlock`'s scroller has no focusable content (axe
    `scrollable-region-focusable` on `/components/code-block`).

- → **R-140** **Radio groups lay out in a row in Angular and Vue and in a column in React.**
  `.atl-radio-group` / `:host` is `display: flex` with no `flex-direction`, so the
  default is `row`; `flex-direction: column` lives only under `.orientation-vertical`,
  which only React emits and whose default in React's own props interface is
  `'vertical'`. A three-option group therefore renders stacked in React and
  side-by-side in the other two. Why now: live rendering divergence across all three
  frameworks, already root-caused.

- [x] **Vue's checkbox and toggle still lack `aria-required`.** Angular sets _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      `[attr.aria-required]` and no native `required`; React sets both; Vue sets only the
      native `:required`. The same bug was found and fixed for `atl-input.vue`; the
      sibling controls were never swept. Why now: mechanical, same fix already proven.

- → **R-141** **Three CSS defects from the type-role pass still stand** (two siblings already
  closed and gated by `check:dead-selectors`, ADR-0081):
  - `.atl-tbody-empty-cell`'s `font-size` is dead — specificity (0,1,0) loses to
    `.atl-table.size-md tbody td` at (0,2,2), so the empty message renders 14px, not
    the 16px written. Identical in Angular and Vue.
  - `.atl-tooltip` contradicts itself: `max-width: 20rem` + `word-wrap: break-word`
    **and** `white-space: nowrap`. React/Vue have the nowrap, Angular does not — same
    tooltip wraps in one framework and cannot in the other two.
  - Five chat controls render in the UA font (`.action-btn`, `.fab-bubble`,
    `.close-btn`, `.chip`, `.field`) — every other component writes `font: inherit`
    explicitly; `atl-chat.css` omits it despite its own comment saying it exists to
    prevent exactly this.
  - (`.radio-text` unstyled-in-Angular was examined and deliberately left — see the
    AtlRadioGroup pass below.)

- [x] **Write the accordion a11y specs.** The one `kind: 'gap'` entry left in _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      `A11Y_PARITY_EXEMPT` — comparable across all three adapters and the exact component
      ADR-0025 cites as its motivating divergence. Why now: most likely place left for a
      real finding; removing the exemption is a one-line follow-up once the specs land.

- → **R-007** **Scope a real-browser a11y check — proposal only, nothing built.**
  `check:a11y-parity`'s header (extended 2026-09-06) now names three defect
  classes it structurally cannot reach, all found by hand this session with
  Playwright, none catchable by a jsdom-based gate: AtlStepper's
  keyboard-unreachable headers (no tab order in jsdom), AtlBreadcrumbs'
  CSS-generated separator leaking into the tree (jsdom never computes
  `::after` content), and `a11y-tree.ts`'s accessible-name shortcuts
  disagreeing with real engines (the stepper panel's `"2"` vs `"Profile"`,
  the chat log's manufactured transcript-as-name). `check:docs-layout`
  (ADR-0089) already launches Playwright+chromium+axe-core against the built
  docs site, but its own header deliberately scopes its axe rules away from a
  general a11y audit and points back at `check:a11y-parity` — which, per the
  above, can't do this job either, for the opposite reason (jsdom vs. no
  layout). Two reuse candidates worth comparing before writing a new gate
  from scratch, not yet costed against each other: (1) add a per-component
  whole-document Tab-order probe plus a native-tree
  (`Accessibility.getFullAXTree`) read onto `check-docs-layout.mjs`'s
  existing browser session, reusing its solved server/settle/retry plumbing;
  or (2) once the blocked `storybook-test+axe` CI item below is unblocked,
  its Vitest-browser-mode chromium session is closer to per-component
  isolation than a full docs-page render and may be the more natural home.
  Whichever path, a real check would need to assert on live focus order and
  a native/ARIA-computed tree — exactly what today's three findings had to
  be measured by hand instead.

- [x] **`storybook-test+axe` in CI — blocked, with a full repro.** Passes locally (216 _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
      React + 242 Vue, ~11s/lib) but fails identically whenever `CI` is set — a
      `vitest`-browser-provider connection issue, not a runner/chromium issue (ruled out
      via ADR-0042's `check:geometry`, which drives real chromium on the same runner and
      passes). Why now: repro is narrowed to two candidate next steps — capture the served
      page's console in CI, or bisect `@storybook/addon-vitest` / `@vitest/browser`.

- [x] **AtlInput, AtlTextarea and AtlCombobox have no non-colour invalid indicator in _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      Figma.** ADR-0055 made the `AtlIcon danger` indicator mandatory in code for WCAG
      1.4.1, and AtlInput's own master description already claims it — the master just
      doesn't show it. Why now: the Icon masters (ADR-0057) now make it placeable; it was
      blocked on exactly that until 2026-08-27.

- → **R-040** _(machine part done 2026-10-12; human part open — see "First cohort, end of November 2026")_ **One rehearsal of the participant path on a non-author machine, timed**
  (Schulung review §10). Why now: last unverified step — everything else in both
  Schulung reviews is closed. Run it against `tasks/schulung-dry-run-kit.md`
  (built 2026-09-06): the ordered checkpoint list, known-blocked items,
  timing tracker and a findings table shaped like the three existing reviews —
  built so the rehearsal is a one-day job with a comparable result instead of
  an improvisation.

- [x] **Schulung M11: trainer-internal tone still on the public page** _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
      (`tasks/archive/reviews/schulung-review-2026-09-02.md` §7). Re-verified 2026-09-06 while
      closing the `solved-*`/repo-location item below (see ADR-0103): this finding
      itself had silently dropped out of this file during today's restructuring —
      re-added here rather than left untracked. Still exactly as the review found
      it: `docs/src/pages/schulung.astro:96`'s "nur Trainer-Maschine —
      claude.ai/design braucht ein anderes Login als der Kohorten-API-Key"
      credential-class remark (plus the neighboring fence-script/"Gegenmittel"
      lines the review names at `:97-99`), and `tasks/archive/schulung-2tage-agenda-2026-09.md` Block 4's
      "Alle Minutenangaben sind Schätzungen … kein Dry-Run … die erste Kohorte
      mitstoppen" admission. Not personal data or a secret (ADR-0103 confirms this
      is a different question from I1), so no repo-split rationale — just trim the
      page to curriculum + prerequisites and move the contingency/tone lines to
      wherever trainer prep material lives day to day.

- → **Small near-term fixes (grab-bag)** — none blocking, each cheap: _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  - [x] The superseded glyph documentation frame on the Icons page is verified inert _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (1200×1328, 107 nodes, 0 components/instances/external refs) and ready to delete;
        left standing only because deleting from the shared Figma file wasn't part of an
        approved batch.
  - [x] The Vue mount hint (`first-component.astro`, `tutorial.astro`: edit _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `workshop-vue/src/views/HomeView.vue`) has never been confirmed against a real
        scaffold — `@nx/vue` isn't in `node_modules`. Scaffold one before the next
        workshop.
  - → **R-099** `libs/create-workspace`'s token-vendoring comment is stale in one clause
    (`preset.ts:108-110`): "published packages don't ship tokens.css" is no longer
    true (they do), but the other justification — editing colours inside
    `node_modules` is a bad workshop experience — carries the decision on its own.
    Comment-only fix.
  - [x] `coverage.thresholds` in 3 vite configs — measure current coverage first, may _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        fail CI.
  - [x] Latent Chat divergence: React's `AtlChatHeader` renders its close button _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        unconditionally where Angular/Vue gate it behind `variant !== 'inline'`. Align
        React when Chat is next touched.
  - → **R-142** `.atl-tr-select-cell` is 44px wide with 32px of inherited padding, leaving a
    12px content box for an 18px checkbox — reset the cell's padding, or widen it (a
    code change in three frameworks).
  - [x] Re-verify the 30 stale parity records with the Figma Desktop Bridge open _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (`figma_check_design_parity` per master → `parity:record` → `check:parity`).
        **Sequence this after** the parity-record-scope decision below — narrowing
        `inputsHash` first would shrink this list, so deciding it first avoids 30 wasted
        bridge round-trips.
  - → **R-004** Schulung M4–M6: clone-first kata prompt + story file; Block 05 exercise page;
    clone quickstart + local `.mcp.json` snippet on 440x.
  - [x] Schulung M12: `solved-*` branches — build the promise or remove it _(closed 2026-10-11 by the review triage: DONE; see tasks/archive/review-triage-2026-10-11.md)_
        (`agenda:81,208`). Owner decision 2026-09-06: fix in place, not remove — the
        agenda's two mentions (gap-table row 81, Folie-7 bullet, now ~209) were reworded
        to say the branches don't exist yet and are trainer prep, not an existing asset;
        building the four `solved-toast`/`solved-tagchip`/`solved-statcard`/`solved-avatar`
        branches themselves is still open.
  - [x] ~~Gate gap: nothing cross-checks `snapshot.json.uiTokens`.~~ Closed 2026-09-09:
        `check:figma-token-names` asserts every `color/*` / `spacing/*` / `radius/*` name in
        the snapshot has a matching `--ui-*` declaration in the canonical token file
        (ADR-0115), and fails loudly when it finds zero relevant entries — which is what the
        old prefix-sum guard let a truncated list slip through. One-directional by design:
        code may carry a token before Figma catches up, which is lag, not drift. It cannot
        prove value equality (that is `figma_check_design_parity`'s job) and is silent on the
        other token groups.
  - [x] ~~**Category split: Figma `Action` + `Form` vs code `Inputs`.**~~ Closed 2026-09-10,
        ADR-0120. Figma moved: `Action` merged into `Form`, the Section renamed `Inputs`, and
        all ten masters re-prefixed (`AtlOption` included, which the first pass missed). Every
        `COMPONENT_SET` node id verified unchanged live, before and after — the only way this
        change could have been expensive. `CATEGORY_ALIGNMENT_EXEMPT` is empty and
        `check:category-alignment` passes with no exemption in use. The rule the collision
        produced — the side carrying no downstream identity moves — is ADR-0120, with the
        matching dated correction written into ADR-0118.
  - [x] **Figma: `AtlButton` has no card wrapper while the other nine Inputs masters do.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        Fallout of the merge above: `Action` laid its component directly on the Section, `Form`
        wrapped each in a white card frame. Merging kept each container "as is", so Button now
        sits bare on the tinted background — visible asymmetry in a file that is itself teaching
        material. Cosmetic only; building the wrapper is a larger mutation than the merge was.
        Owner decision pending.
  - → **R-111** **A `figma-console-mcp@latest` instance is running unpinned** (pid seen 2026-09-10).
    `.mcp.json` pins `1.40.0` (ADR-0110); this process was started as `@latest`, most likely
    by following `preflight.mjs`'s old fix hint, which has since been corrected to derive the
    pin. Nothing detects an unpinned _running_ server — preflight now compares the on-disk
    `.version` against the pin, which is a different thing. Restart it against the pin, and
    decide whether the running-version case is worth catching too.
  - [x] **Gate gap: `check:category-alignment`'s selector→master heuristic has no gate of _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        its own.** It resolves a `components.ts` entry to its Figma master by taking the first
        `Atl[A-Za-z]+` token in the `selector` field, with a hand-maintained override table for
        the two entries whose `selector` is prose (`tooltip`, `toast`). A ninth odd selector
        hits `[SELECTOR-UNRESOLVED]` — loud, verified, not a silent mis-map — but nothing
        checks that the override table is complete. Also: the gate assumes one flat category
        string per component and has no vocabulary for a master that genuinely spans two
        Sections.
  - [x] ~~**Category name split: `Feedback` vs `Layout`.**~~ Resolved 2026-09-09,
        ADR-0118: two agreeing sources (Figma master names + story titles) outrank one, so
        `components.ts` follows and now says `Feedback`. Three further hardcoded `Layout` keys
        turned up outside the file the finding named — `ComponentDetail.tsx`'s `CATEGORY_TONE`
        and `STORYBOOK_CATEGORY` (the latter a workaround map whose own comment cited this
        bug as its reason for existing) and `McpExplorer.tsx`'s mock data. Held by
        `check:category-alignment` from now on. Original finding, for the record: Storybook's own sidebar groups
        `AtlAccordionGroup` / `AtlAlert` under `Feedback` (`storySort.order` in all three
        `.storybook/preview.*`, and the story `title:` prefixes agree);
        `docs/src/data/components.ts` calls the same grouping `Layout`. Two sources, two
        names, neither obviously wrong — and `tasks/archive/reviews/schulung-content-review-2026-09-08.md`
        § E2 asserted `Layout` was simply "the actual name", which is now corrected in place.
        Surfaced by the ADR-0116 work, which hit it from the `plan/figma.md` side and
        correctly declined to pick a side from outside `docs/src/**`. Decide which name wins,
        then make the other follow — and check whether a gate can hold it, since nothing
        currently compares the two.
  - [x] ~~**Gate design: `SCAFFOLD_PORT_EXEMPT` is keyed by `file:line`.**~~ Closed
        2026-09-09, ADR-0119: re-keyed on content (`scaffoldPortKey(file, prevLine, line)`),
        two lines of context because `workshop.astro` renders the identical citing line in
        two preflight panels, plus a require-time duplicate-key guard — a `new Map([...])`
        literal silently keeps only the last entry on a collision, which would have been a
        quieter version of the same bug. Proven by reproducing the original line shift and
        confirming the gate stays green. Remaining limit: the two-line key is a heuristic, and
        a third occurrence sharing both lines would need a hand-picked context line (the guard
        throws rather than dropping it silently).
  - [x] ~~Gate gap: the two `preflight.mjs` copies are in sync by hand only.~~ **Stale
        entry, not open work** — `tools/scripts/sync-preflight.mjs` plus
        `check:preflight-clone-sync` landed in `b1b52d9` (2026-09-05) and are in the
        `check:all` chain; re-verified 2026-09-09 (exit 0 clean, `[DRIFT]` naming both paths
        when one copy is tampered with, exit 0 again after restore). The two copies are
        required to be byte-identical: the clone-vs-scaffold branching lives inside the single
        file's own `detectEnvironment()`, so there is no legitimate per-copy divergence.
  - [x] Gate gap: nothing stops a new page hardcoding `workshop-<fw>` again with no _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        monorepo branch beside it.
  - → **R-074** _(Bonus, spawned by ticking L2285 above, not one of the original 130):_
    `docs/src/pages/claude-design.astro` still hand-types "twenty-four tags" and
    "17/13 ADRs" (should read 16/12) — same derive-don't-hand-type pattern as
    `gate-count.ts` (below), now cheap to copy.

### Storybook + the storybookjs/mcp skills in the scaffolded workspace (2026-09-10)

Owner asked: install the `storybookjs/mcp` agent skills automatically when a new
workspace is created. Two decisions taken at the start (owner, 2026-09-10):
**Storybook always ships in the scaffolded workspace** (not behind a flag), and
**the skills are installed by the preset itself** (network call during scaffold),
not vendored and not left to the attendee.

Why Storybook has to come first: all four skills (`stories`, `storybook-init`,
`storybook-setup`, `storybook-upgrade`) require a local Storybook ≥ 10.5 plus
`@storybook/addon-mcp` and the `storybook ai` CLI. The scaffold has none today, and
`stories` declares itself as "invoke FIRST, before creating, editing or deleting
components, stories, styles, CSS, themes, colors or design tokens — no exceptions",
so shipping it into a Storybook-less workspace would route every UI task an attendee
starts into a skill whose first move is to propose installing Storybook.

`preflight.mjs` already assumes the outcome: its `scaffold` branch checks "dev server
(4200) + Storybook (6006)" and its comment calls 6006 "its single local Storybook",
while `preset.ts` never wrote one. This closes that gap rather than opening it.

- [x] **S1 — Storybook in every scaffolded app.** Per `workshop-<fw>`: `.storybook/`
      (`main.ts` + `preview.(ts|tsx)`), framework `@storybook/{angular-vite,react-vite,
vue3-vite}`, addons `addon-mcp` + `addon-docs` + `addon-a11y`, `features.componentsManifest`
      and (Angular/Vue) `features.experimentalDocgenServer`, tokens.css imported in preview,
      one example story per app. `storybook` / `build-storybook` targets as `nx:run-commands`
      mirroring the monorepo's shape (`npx storybook dev --config-dir … --port`), port 6006
      for the first framework (+1 per extra framework). Storybook deps pinned to 10.6.0, the
      same versions the monorepo runs. No `addon-vitest`: the scaffold has no test runner, so
      the skills' `test-run` tool stays unavailable — deliberate, recorded in the ADR.
- [x] **S2 — Skill install as a post-generator task.** `npx -y skills@<pinned> add
storybookjs/mcp -s '*' -a claude-code -y --copy` at the workspace root, `DO_NOT_TRACK=1`
      and a bounded `SKILLS_CLONE_TIMEOUT_MS` so a conference network cannot hang the scaffold.
      `--copy` rather than the CLI's default symlink farm (Windows attendees without developer
      mode). Non-fatal: a failed install prints the exact command to re-run and the scaffold
      still completes. New `skills` schema option (default `true`) so CI and offline runs can
      opt out.
- [x] **S3 — Say it where attendees read it.** Generated `CLAUDE.md` and `README.md` gain
      the Storybook commands and a short "these skills are installed, here is what they do and
      how to update them" section.
- [x] **S4 — Prove it.** `nx test create-workspace` (spec extended for both S1 and S2,
      including the failure path), `nx lint create-workspace`, `npm run check:preflight-clone-sync`,
      and the real gate: `nx run create-atelier-ui-workspace:e2e` — it scaffolds through local
      verdaccio and runs `nx build workshop-<fw>`; extend its file assertions to `.storybook/main.ts`
      and the installed skill directory.
- [x] **S5 — ADR-0123.** Records both decisions and, honestly, the cost of the second one:
      `skills-lock.json` carries only `source` + `computedHash`, the CLI clones the default
      branch (bundled simple-git) and `--help` exposes no ref/commit pin, so the scaffold pulls
      **unpinned third-party skill text at workshop time**. That is the same risk class ADR-0110
      decided the other way for `figma-console-mcp@latest`; the divergence is deliberate here and
      needs to be written down as such, together with what would let us pin later (an upstream
      `owner/repo@ref` form, or vendoring with a byte-drift gate like `sync-preflight.mjs`).

**Review (2026-09-10).** Done, with two defects found by the work rather than by the
plan — both recorded in [ADR-0123](../plan/adr/0123-the-prerequisite-ships-with-the-skill.md).

- `@storybook/angular`'s non-optional `@angular-devkit/build-angular` peer broke the
  scaffold's `npm install` (ERESOLVE against Angular 22). The scaffold now uses
  `@storybook/angular-vite` alone; React and Vue declare their renderer packages
  explicitly instead of leaning on npm hoisting, which pnpm would not provide.
- `@atelier-ui/angular` imports six `@angular/cdk/*` subpaths and declared none of them.
  Invisible here (the root has CDK) until the example story became the first real
  consumer. Now a declared peer.

Gates run by me, exit codes: `nx test create-workspace` 0, `nx lint create-workspace` 0,
`nx build create-workspace` 0 (all ten templates confirmed present in `dist/`),
`nx test create-atelier-ui-workspace` 0, `nx lint create-atelier-ui-workspace` 0,
`nx lint angular` 0, `nx build angular` 0, `nx test angular` 0,
`check:preflight-clone-sync` 0, `check:adr-refs` 0. Full CLI e2e: **React green end to
end** (install, `nx build`, `nx build-storybook`). The skills install was proven directly
— the preset's exact argv in a scratch directory, exit 0, four real `SKILL.md` files under
`.claude/skills/`.

A second-model review (Codex) of the finished diff produced eight findings; six were
acted on (the `.mcp.json`-vs-CLAUDE.md toolset promise, the "installed" claim over a
swallowed failure, the unreachable `--skills` flag, the e2e's three uncontrolled clones,
the `@storybook/angular` import, and a `test-run` claim in three template comments). One
was rejected with a reason (`ensureBuilt()` staleness — the `e2e` target's `dependsOn`
rebuilds; the gap only exists on the direct-`node` debug path the file's own header
documents).

Open, from this work:

- [x] Angular's `nx build-storybook` in a scaffolded workspace has not been re-run since _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
      the `@angular/cdk` peer landed — the run died on `ENOSPC` (the machine's disk was at
      100%), not on the fix. Re-run `E2E_FRAMEWORKS=angular npx nx run create-atelier-ui-workspace:e2e`
      once there is disk.
- [x] `@nx/dependency-checks` is still not enabled for `libs/react` and `libs/vue` — the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      same structural gap that hid the `@angular/cdk` defect, currently with no defect behind
      it. Wire it the same way `libs/angular` now is, deliberately rather than as a drive-by.
- [x] The example story is proven to compile, not to render — a static Storybook build _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
      never executes it. Nothing currently renders a scaffolded story.
- → **R-086** `installSkills()`'s Windows path (`shell: true` + `taskkill /T /F` on timeout) is
  unverified on Windows; there is no Windows machine or runner in this project.
- [x] `SKILLS_TEST_FRAMEWORK = FRAMEWORKS[0]` in the e2e keeps the network install to one _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      clone per run only while CI invokes the job unmatrixed. A per-framework matrix would
      silently restore three.

## Needs an owner decision

The ones the owner and I will walk through together.

### Workshop substrate: move to the Conciso Design System (ADR-0165, 2026-10-09)

**Superseded 2026-10-21 by ADR-0177 (owner).** Atelier keeps its library; the open steps below
(P0b, P1.5, P1.6, P2–P6) are dropped, not deferred. The contract package stays here (M5 above).

Decided 2026-10-09. Spike: `plan/research/cds-substrate-spike-2026-10-09.md`. Pushes, the CDS PR
and npm deprecations each need the owner's explicit go.

**Paused 2026-10-12 (owner) until after the first cohort, end of November 2026.** That cohort runs
on Atelier's library (Angular); see "First cohort, end of November 2026" under Near-term work.
Nothing below proceeds until then, P1.5 included; P6 is off the table before the course.

- [x] P0a ADR-0165 in Atelier.
- [ ] P0b CDS ADR superseding CDS-ADR-0015 (draft, German, CDS format:
      `plan/research/cds-adr-contract-layer-draft-2026-10-09.md`; number 0016 provisional; it
      proposes `tools/figma/contracts/` instead of the spike's root `contracts/`, per CDS-ADR-0014)
      (contract layer in the repo, `check-contracts` as an
      offline CI gate, snapshot refresh manual). In the CDS repo, via PR.
- [ ] P1 `@conciso/design-contracts`, built in Atelier first to try it out, moved to the CDS repo
      once proven (ADR-0165 §4, revised 2026-10-09). Not published from Atelier.
  - [x] P1.1 `libs/design-contracts`: self-contained (own `package.json`, plain Node ESM, no Nx
        or Atelier imports), bins `check-contracts` and `figma-snapshot-contracts`, exports the
        `ComponentContract` type. Source of truth for the scripts from now on. Done when Atelier's
        `check:contracts` runs through the package bin with unchanged output (all three
        frameworks).
  - [x] P1.2 Pin today's behaviour first: `node --test` on a small non-CDS fixture (one
        component, snapshot, contract, story; `--ui-*` prefix, English names), golden output.
        Done when green.
  - [x] P1.3 Spike fixes, each with a red test first: `--file` among several connected files,
        create the output dir, `.cjs` for `"type": "module"`, token prefixes from config (today
        hard-coded `--ui-`, `check-contracts.mjs:999`), `--emit` maps the codeSpec to Figma names
        via `axisMap`/`figmaOnly`. Done when tests are green and a Snackbar parity run shows no
        name-only discrepancies (needs the owner's bridge).
  - [x] P1.3 code done 2026-10-09 (`check:contracts-package`, 14 node tests on a non-Atelier
        fixture; Codex cross-check found two defects, both fixed). Still open: the live Snackbar
        parity run and a live multi-file snapshot against the Desktop Bridge (owner's machine);
        `--file` targeting is tested only against a fake modelled on figma-console-mcp 1.40.0.
  - [x] Gate gap found in review, closed 2026-10-09 (`[AXIS]` error when a no-`values` boolean
        axisMap entry meets an axis that is not exactly `true`/`false`): an `axisMap` entry without `values`
        marks every Figma axis value covered, so a boolean prop mapped to an axis `ja/nein`
        passes `check-contracts` (pinned in the package tests). `--emit` now surfaces it in
        parity; decide whether the gate should require `values` when a boolean meets a
        non-`true/false` axis.
  - [x] P1.4 Rewire Atelier: `sync-preflight` copies from the package into the scaffold;
        `check-manifest-parity` imports docgen from the package instead of `tools/scripts/lib`.
        Done when `check:all` passes.
  - [ ] P1.5 Test `@conciso/design-contracts` in the CDS. Waits until the owner's running change
        in the CDS repo is through (2026-10-09); do not touch the CDS repo before.
    - [ ] `npm pack` in `libs/design-contracts`, install the tarball on a new CDS branch from
          `main` (not the spike branch), move the spike's contract and snapshot over, delete the
          spike scripts. Done when `check:contracts` exits 0 there with no manual step.
    - [ ] Live, with the owner at the Desktop Bridge: `figma-snapshot-contracts --file
BQCBQwIDcconnYNpb2w9fn` while a second Figma file is connected. Done when the snapshot
          is written without switching the active file. (Tested only against a fake of
          figma-console-mcp 1.40.0 so far.)
    - [ ] Live parity on the Snackbar (`4:5222`) with the codeSpec from `check-contracts --emit`.
          Done when the API part shows no name-only discrepancies (spike: 7).
    - [ ] Check the new boolean rule on real CDS data: does any no-`values` boolean axisMap
          meet a non-`true`/`false` axis (e.g. `Aktion anzeigen`)?
  - [ ] P1.6 Move to the CDS (`packages/contracts`, into its release chain), after P0b. Atelier
        keeps no copy; the scaffold consumes the published package (P3).
- [ ] P2 Contracts for all CDS components, `check-contracts` in the CDS CI. Done when it exits 0
      in CI.
- [ ] P3 `create-workspace` on `@conciso/design-system-angular`; React/Vue branches removed for
      now. Done when the scaffold e2e passes.
- [ ] P4 New kata: target, Figma master in the owner's training copy of the CDS file, steps. Done
      when the kata has been run once end to end.
- [ ] P5 Docs and skills: swap examples (~18 pages), remove library pages (~6), delete the
      `atelier-design` skill, rewrite the repo branch of `design-to-code`. Redo course-gap
      examples built on Atl components. Done when the docs gates pass.
- [ ] P6 Tag the last commit with the library, then remove `libs/{angular,react,vue,spec}`, their
      gates, Storybooks and hosted MCP endpoints; keep the release pipeline for `create-workspace`; deprecate `@atelier-ui/{angular,react,vue}` on npm. Done when `check:all`
      passes.

### AI & Design Systems course gaps (2026-10-08)

- → **R-051** Walk through the triage of the "AI & Design Systems" course gaps (271 transcripts vs.
  Atelier's teaching sources): 11 core-loop items (A), 13 deepening (B), 12 side notes
  (C), 9 out-of-scope blocks (X). The single tracked list, with a status per item
  (Offen / Übernehmen / Erledigt / Gestrichen), is
  `plan/research/ai-ds-course-gap-2026-10-08/triage.md` — update status there, not here.

- → Findings from the A4 judge dry run on AtlButton (2026-10-09; evidence and per-finding _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  verification in `plan/research/ai-ds-course-gap-2026-10-08/a4-judge-dry-run-atlbutton.md`,
  checked against code, CSS cascade and master JSON, not in a browser):
  - → **R-134** **Danger button has no visible focus ring** (WCAG 2.4.7). `.atl-button.variant-danger`
    (`libs/styles/src/button/atl-button.css:91-96`) sets `box-shadow` at the same
    specificity as `.atl-button:focus-visible` (`:34-37`) and comes later, so it wins in all
    three frameworks. Master `468:2598` draws the ring plus the inset shadow. Confirm in a
    browser, then combine both shadows in a `.variant-danger:focus-visible` rule.
  - → **R-135** **Loading drops focus.** `loading` sets native `disabled` (Angular `atl-button.ts:46,66`,
    React `atl-button.tsx:49,65`), so a focused button that starts loading loses focus, and
    nothing announces `aria-busy`. `button.metadata.ts:41` contradicts itself ("remove from
    the tab order" vs. "loading retains focus"). Decide which is canonical (ADR-0159 ties
    loading to disabled).
  - [x] **`aria-disabled` next to `disabled`**: code sets both; the master description says _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        "HTML `disabled` (not aria-disabled)". Pick one and align the other.
  - [x] **Primary active inset shadow**: master `437:1516` has an 18 % inner shadow, code has _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        none outside danger. Decide which side is right.
  - [x] **Outline disabled fill**: master overlay `1169:834` is filled, code uses `transparent` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (`atl-button.css:164-166`). Deliberate or drift?
  - [x] **No hover/focus/active stories and no `play` functions** for the button in any _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        framework; behaviour lives only in the unit specs (ADR-0121 asks for a `play` per
        behaviour line).

- → Findings from course-gap wave 3 (2026-10-09; evidence in _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  `plan/research/ai-ds-course-gap-2026-10-08/wave3-b3-cold-start-log.md` and the agents'
  reads of the code):
  - [x] (done 2026-10-09, ADR-0163: `button[atl-button]`) **Angular `atl-button` is not a native button.** The host is `<atl-button role="button">`
        with no inner `<button>`, so it never submits a `<form>` and has no `type`; React and Vue
        render a native `<button>`. The Figma master description says "native HTML <button>".
        Decide: render an inner `<button>` in Angular (API/DOM change), or document the
        divergence and correct the description.
  - [x] **Vue dialog/drawer do not restore focus themselves.** React and Angular store _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `document.activeElement` on open and refocus it on close; Vue relies on native
        `dialog.close()`. Verify in a browser; align if the platform does not cover it.
  - [x] (owner 2026-10-09: keep as is; the accessibility page documents it) **Only Angular traps focus in a dialog** (`cdkTrapFocus`); React/Vue rely on
        `showModal()` making the page inert (Tab can leave into browser chrome). Decide whether
        that difference is intended; the accessibility page now describes it as is.
  - [x] (done 2026-10-09: `tooltip.show-on-focus`, `tooltip.hide-on-escape`) **Tooltip behaviour the spec does not ask for:** all three handle Escape and Angular/React
        bind focus, but `libs/spec/src/behaviors.json` has no ids for them, so no test covers them.
        Add `tooltip.hide-on-escape` / `tooltip.show-on-focus` and the tests.
  - [x] **Button `type` default differs:** Angular and Vue default to `type="button"`, React sets _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        none, so a React `AtlButton` inside a form submits by default. Decide one default.
  - [x] **Outline button focus border** paints `rgb(100,116,139)` where Figma has the primary _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        colour (`check:paint`, recorded in all three frameworks now that Angular can focus).
  - [x] `a[atl-button]` for links styled as buttons (ADR-0163 §4). _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
  - [x] Stale comments: `libs/{react,vue}/src/testing/a11y-tree.ts` still say Angular renders _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `<atl-button role="button">`.
  - → **R-146** **Prop tables in `llms-full.txt` are React-shaped for every framework** (`onValueChange`,
    `children`); the cold-start agent had to translate them for Angular.

- → Findings from course-gap B2/B4/B5/B7 docs sections (2026-10-09; docs only, nothing fixed): _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  - → **R-157** Stale header: `tools/scripts/gen-figma-library-tokens.mjs:3-4` names the create-workspace
    preset copy as source; line 39 reads `libs/styles/src/tokens.css`.
  - [x] `libs/spec/src/tokens.manifest.ts:15-16` cites `tools/scripts/check-css-tokens.js`, which _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        does not exist; `check-token-annotations.js` does that job.
  - → **R-079** ADR-0115 axis 2 names the preset `tokens.css` as authority and lists `check:css-tokens` /
    `check:token-tiers`; neither gate exists and `sync-tokens.mjs:30` uses
    `libs/styles/src/tokens.css`. Needs a dated "Corrected" paragraph.
  - [x] Vocabulary drift in the spec (scan 2026-10-09, figma page `#shared-language`): _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        tooltip `above/below` vs drawer `top/bottom`; button `outline` vs card `outlined`;
        `danger` / `error` / `invalid` for failure. Decide whether each pair is one concept.
        No gate compares vocabulary across components.
  - → **R-008** No deprecation policy (ADR-0023 ties 1.0.0 to one), no `@deprecated` in `libs/`, no
    codemod. Unverified: whether `docs-show` surfaces a `@deprecated` tag.
  - [x] The Storybook MCP deploy runs in Cloudflare's own build; no repo-local deploy command _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        a participant could copy (`mcp.astro#own-mcp` says so).

- → Follow-ups from ADR-0161 (code-only facts as `- Code-only` description lines, 2026-10-08): _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  - → **R-009** Read-side A/B: does an agent generating from the master use a `- Code-only` line
    (AtlButton `type`) better than the old parenthetical? Untested for both carriers.
  - [x] Fold the older "(code-only props on …: …)" parentheticals in master descriptions _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        into `- Code-only` lines, then drop them.

- → Defects found by the wave-2 research runs (2026-10-08, evidence in _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  `plan/research/ai-ds-course-gap-2026-10-08/wave2-a3-parity-run.md` and
  `wave2-a10-readiness-run.md`):
  - [x] AtlBadge font weight (2026-10-09, ADR-0162): owner chose 600. New role
        `--ui-type-emphasis` (SemiBold sm/tight) + Figma `ty/emphasis`, bound to badge md, step
        numbers, current breadcrumb. Badge `sm` keeps a recorded 500/600 split: SemiBold xs has
        only 2 clean CSS rules, so no role (ADR-0074 rule of three).
  - → **R-143** Move `.step-circle` and `.breadcrumb-current` onto `font: var(--ui-type-emphasis)`
    (computed-identical candidates from ADR-0162).
    Also: add a `live` scenario (`role="status"` passed) to the three `atl-badge.a11y.spec.*`.
  - [x] (done 2026-10-09: no default role in any framework; consumer passes `role="status"`; metadata role `none`) AtlBadge `role="status"` is set on every host, while the master description says badges
        are decorative by default and only wrapped in `role="status"` when they announce changes.
  - [x] (done 2026-10-09) AtlBadge (Angular) class JSDoc sits above `VARIANT_ICON_NAMES`, not `@Component`, so
        `check:contracts --emit` produces metadata without a description.
  - [x] Figma variables and AtlDialog layers (done 2026-10-09). `codeSyntax.WEB` is now set on all
        141 Library Tokens (`figma:sync-tokens` writes it for the 135 generated ones; the 6
        hand-made `control-height/*` / `row-height/*` were set by hand, scoped `WIDTH_HEIGHT`).
        Primitive, Component and Docs Brand Tokens have no `--ui-*` counterpart, so they carry
        none. The 13 Effects/Motion STRING variables (ADR-0060: cannot paint) are scoped to
        nothing, so they leave every picker; 0 `ALL_SCOPES` remain. AtlDialog's 10 one-pixel
        divider frames became header/footer strokes, as AtlDrawer already drew them, and the
        hand-drawn footer buttons in AtlDialog and AtlDrawer are `AtlButton` instances
        (`outline` Cancel, `primary` Confirm/Save, as the stories use); the Drawer footer now
        hugs to 80px (20 + 40 + 20).
  - [x] `control-height/*` and `row-height/*` are not generated: `cssName()` has no mapping and _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `row-height` is a `calc()` the parser cannot read, so the sync lists them as orphans.
  - → **R-010** `figma_audit_component_accessibility` classifies AtlDialog as presentational and skips
    focus/target-size checks — its 100 means "not assessed".

### From the Storybook review, 2026-09-14

Full reasoning and evidence: `tasks/archive/reviews/storybook-review-2026-09-14.md`. One item is done: the
curriculum's backgrounds-vs-theme wording, corrected in the agenda and `schulung.astro` to match
ADR-0142. The vendored-skills fix was written and then reverted on the owner's call — see the
first item below. What is left needs a decision.

- → **R-152** **Dark-mode axe coverage — ADR-0142's option (b) has a first-party replacement.** The
  ADR costed "reading `initialGlobals.theme` from an environment variable and invoking
  `nx storybook-test <fw>` once per value". `storybookTest()` takes `initialGlobals`
  directly (shipped 10.5, PR #35226; the option's own JSDoc recommends exactly the
  per-theme-Vitest-project pattern), and its `tags: { include | exclude | skip }` is the
  coverage regulator the ADR left to the owner. `vitest.config.mjs` already lists
  `projects:`. Decide: full second run, or a tagged sample. Then an ADR-0142 addendum —
  the ADR's option list is incomplete as written and should say so in place.
- → **R-091** **CSF factories.** Preview for all three frameworks since 10.2; the **default story
  format in Storybook 11**. 95 CSF3 story files, a curriculum that teaches CSF3, a
  scaffold that generates CSF3, and `storybook automigrate csf-factories` is unavailable
  here (`@storybook/cli` is not a dependency; `check:all` is offline). Needs a spike and
  an ADR before the next cohort, not a drive-by.
- → **R-090** **`addon-designs` in the scaffold — behind ADR-0144's `--figma` switch.** 85 story files
  here use `parameters.design`; the three `main.ts.template` files do not list the addon
  and no scaffold story sets the parameter, so a learner in a Figma-to-code workshop never
  sees the Figma frame beside the component. With `--figma`: addon plus parameter. With
  `--no-figma`: neither. Ships to npm.
- → **R-116** **The vendored `storybookjs/mcp` skills name a deprecated command — left untouched, on
  purpose.** `.agents/skills/storybook-setup/SKILL.md:11` instructs `npx storybook ai setup`;
  `.agents/skills/stories/SKILL.md:13,15,17` builds its whole mandatory workflow on
  `STORYBOOK_FEATURE_AI_CLI=1 npx storybook ai …`. Both are deprecated in Storybook 10.6, and
  `AGENTS.md` plus `docs/src/pages/storybook.astro` already say so — so the repo tells humans
  one thing and agents another, and nothing gates it (`check:skill-discovery` walks `skills/`,
  not `.agents/skills/`; nothing reads `skills-lock.json`). A patch was written on 2026-09-14
  and reverted on the owner's call: do not touch the Storybook skills for now. Three options
  when it is picked up — patch in place (forks upstream; a re-run of `npx skills add` silently
  reverts it), wait for upstream (weak bet: `storybookjs/mcp` moved into `storybookjs/storybook`
  as of 10.6.0, so the standalone package is the thing being superseded), or retire the four
  copies in favour of the built-in `npx storybook skills` (verified working here, config-aware —
  its `setup` output already names this repo's real addon set including `addon-designs`; this
  supersedes ADR-0123 and removes a `.agents/skills/` surface Codex and the Antigravity CLI
  reach). No ADR was written: no decision was taken.
- → **R-089** **Storybook telemetry.** `core.disableTelemetry` defaults to false and nothing here sets
  it — neither the three `main.ts` nor any scaffold template, so it applies to every
  workspace a participant scaffolds. Configuration fact, not a legal reading: any
  data-protection assessment belongs with the internal DSB.
- → **R-092** **The onboarding-checklist widgets.** `sidebarOnboardingChecklist` and
  `menuOnboardingChecklist` both default `true`, so Storybook's own guided tour sits beside
  the workshop's guidance in every scaffolded Storybook. Embrace or disable — currently
  neither, just an unexamined default.
- [x] **`experimentalReactComponentMeta` for React.** Angular and Vue extract props through the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      docgen server; React still runs plain `react-docgen` (`@storybook/react/dist/preset.js:388`
      — the two flags are separate and both read, not a rename). Two classes of analyzer feeding
      `check:manifest-parity`. Worth a spike, unhurried.
- → **R-093** **Four one-line calls.** `parameters.docs.toc` (the docs site treats a persistent TOC as a
  reading requirement, ADR-0086/0087; the Storybook docs pages have none),
  `features.experimentalSearchDocsHeadings`, and the two above.

- → **R-108** **Confirm the lockfile flavor.** `package-lock.json` was regenerated on macOS
  for dep-batch A (Docker daemon down that day), then rewritten on Linux by the
  publish job (`7cca39c`), pruning 27 macOS-only transitive entries. What that commit
  did _not_ visibly touch is ~47 `dev` ↔ `devOptional` marker flips from the same
  install. Run `tools/scripts/relock.sh` with Docker up once; if it's an empty diff,
  close this.

- [x] **AtlStepper's Figma master has two open gaps** (merged — both block on the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      same "is this component chrome or artboard decoration" judgment):
  - [x] It pads 16 where the code root pads 0 — decide whether that's component _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        chrome the code is missing, or artboard breathing room Figma should drop;
        `[ROOT-BOX]` warns until settled.
  - [x] It has no focus variant, no disabled variant, and no a11y annotations in its _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        description (5 of 7 remaining parity findings) — pairs with the role question
        below.
  - [x] **Was a three-way disagreement, not two — resolved 2026-09-06, the other
        way round from how this item first framed it.** Earlier the same day,
        metadata was corrected to say `tablist`, matching all three code adapters
        (`tablist`/`tab`/`tabpanel`), and this item then read that convergence as
        the signal that code was right and the Figma master's `ol` +
        `aria-current="step"` description was stale. That reasoning doesn't
        survive a check: searching `plan/adr/` turned up no ADR that ever decided
        the tab-shaped markup — this item's own closing sentence called it
        "ADR-reasoned in the code," which was never true. It was three independent
        implementations converging on the same shape without anyone weighing it
        against what a stepper does. `linear` ("only the active and completed steps are
        clickable") is a progression model, not a tab model, and the metadata's
        own anti-pattern already named `AtlTabGroup` as the component for
        non-sequential switching — implementing the stepper as a tablist
        duplicated the semantics its own docs point away from. The ARIA tab
        pattern also requires roving-tabindex arrow-key navigation that no
        adapter ever implemented, which the tablist role had been quietly
        obligating without anyone paying it. ADR-0101 reverses the direction:
        code and metadata now match Figma's `ol`/`aria-current="step"`, and no
        Figma edit is needed — Figma was right. The other two items above (root
        padding, missing focus/disabled/a11y-annotation variants) are unrelated
        and stay open.

- [x] **Harden Atelier's own design system; Conciso as theme demo.** Plan: _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
      `tasks/atelier-design-system-plan.md`. ADR-0020 already settled the palette
      ("Direction A: Conciso anchor only" — brand DNA is typography + motion, not
      colour); the plan ports six brand-neutral patterns from Conciso (tonal ramps,
      annotated contrast, role-based type scale, tonal overlays, `[data-area]` scope,
      `_adherence.oxlintrc.json`) and makes Conciso a `[data-brand="conciso"]` theme demo.
      The 29 existing parity records stay valid until component CSS migrates onto role
      tokens, at which point the ADR-0024 Phase 0 change becomes blocking.

- [~] **An axis is owed for `AtlAvatarStatus` and `AtlChatStatus`.** Two separable
  questions, as originally written: draw the axes in Figma (design), and should the
  gate's axis-word list include `Status` at all (gate). The gate half is done — see
  "Closed this session" below. (The item as originally written cited `[NAME]`'s
  seven-word list, Variant/Size/Shape/Position/Orientation/Align/Role — that's
  `check-figma.js`'s own axis list, and correct for that gate, but it is not why
  `check:variants`/`check:defaults` never asked about `Status`: those two are driven
  by `tools/scripts/lib/component-axes.js`'s `axisOf`, a _different_, five-word regex
  — Variant/Size/Shape/Position/Orientation — that the item conflated with `[NAME]`'s.)
  - [x] **Design half, open and blocked**: drawing the `AtlAvatarStatus` axis in _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        Figma (a real `.status-online`/`.status-offline`/`.status-away`/`.status-busy`
        paint axis, now gate-enforced in code) needs the Desktop Bridge, which is not
        connected in this environment. Not claimed here.

- [x] **`check:props`'s own known blind spots** (ADR-0093), worth a decision each: _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
  - [x] It's spec-keyed, so it can't see adapter-vs-adapter divergence where the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        spec is silent — e.g. Vue's dialog hardcodes its own `headerId` as the
        `aria-labelledby` target while Angular and React expose it as a prop, and
        `AtlDialogSpec` declares neither name. Closing it means completing the spec.
  - [x] Seven components have no spec interface at all: `AtlCodeBlock`, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `AtlAccordionHeader`, `AtlMenuSeparator`, `AtlMenuTrigger`, `AtlChatInput`,
        `AtlChatTyping`, `AtlThead`. Named as unkeyed in the gate's summary; nothing
        checks them.
  - [x] `toast` is excluded outright — Angular takes four flat props where React/Vue _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        take one `data: ToastData` object, and the real API is imperative
        (`AtlToastService.show()` / `useAtlToast()`). A set comparison can't express a
        shape mismatch.
  - [x] Worth its own investigation (from ADR-0093's rejected alternatives): Vue's _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `defineProps<AtlXSpec>` could give Vue a real type-level link to the contract —
        the root-cause fix the gate only detects around. Angular can't (signal inputs
        are class fields, not a props object).

- → **R-106** **`nx release --yes` commits and pushes the version bump as part of the same
  command that publishes**, so a failed publish leaves git ahead of npm by
  construction — exactly what happened for six releases (see the release-pipeline
  fix, now closed, below). Reordering so the commit only lands after a successful
  publish is the structural fix; wants its own ADR.

- [x] **Parity-record scope: what should an `inputsHash` / a parity stamp cover?** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      One ADR closes four separate findings:
  - [x] The parity gate is blind to the shared token layer — a component's _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `inputsHash` covers only `libs/{angular,react,vue}/src/lib/<module>/`, so
        `styles/tokens.css` is outside it (ADR-0035 changed the UI typeface for all 29
        components and triggered no DRIFT blocker).
  - [x] A parity record is equally blind to a change on the _Figma_ side — it stores _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `figmaNodeId`, `verifiedSha`, `inputsHash`, nothing about the master's state.
  - [x] `inputsHash` can't tell a rendered file from a test file — it walks every _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        file under the module directory, so a comment in a `.spec.tsx` triggers a false
        DRIFT. Narrowing it needs a migration (recompute each record's hash at its own
        `verifiedSha` first, or all 37 records go stale at once).
  - [x] Do this **before** spending 30 Figma-bridge round-trips re-verifying records _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        that are stale only because of the `inputsHash` weakness above (see the
        near-term grab-bag item for the actual re-verify).

- [x] **Typography-role completion — anchor question: does `fontSize` resolve _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      through Library Tokens or Docs Brand Tokens?** 212 TEXT nodes bind `fontSize` to
      the docs-site collection, not the library tier ADR-0030 made semantic. The two
      scales agree today, so nothing renders wrong yet — but it blocks promoting
      `[ROOT-TYPE]`, `[TEXT-UNSTYLED]` and `[FIGMA-AUTO-LEADING]` from ratchets to plain
      blockers, and every "correct this master's size" recommendation below is
      unexecutable until it's answered. Sub-steps, all downstream of this one decision:
  - [x] 311 of 566 census'd TEXT nodes across 33 masters carry no `ty/*` role; 206 _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        of those sit on `lineHeight: AUTO` (matches no role at all); all three counts
        are gated as ratchets (`[TEXT-UNSTYLED]` 257, `[FIGMA-AUTO-LEADING]` 206,
        `[FIGMA-VARIABLE-COLLECTION]` 212).
  - [x] Two roles the existing ten don't span: `ty/row` (Instrument Sans Regular _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        16/1.25, 10 CSS sites, 27 faithful Figma nodes) and `ty/row-sm` (Regular
        14/1.25, 5 CSS sites, 16 faithful nodes) — both clear rule-of-three several
        times over.
  - [x] Seven masters the six mapping groups never covered — 54 unbound nodes _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (`AtlButton` 20, `AtlStep` 12, `AtlTr` 8, `AtlBreadcrumbs` 7, `AtlAvatar` 6,
        `AtlCodeBlock` 4, `AtlTh` 3, `AtlChatSuggestion` 1). `AtlButton` matters most —
        its `size=md`/`size=lg` labels are Medium where `.atl-button` is SemiBold.
  - [x] 77 Figma text nodes are in combinations no role expresses (Medium 16, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        Regular 12, SemiBold 14, Medium 18, JetBrains Mono Bold 12, Italic 12, Regular
        13, Bold 10, SemiBold 15/12, and one each of SemiBold 13/20/26 and Italic 14) —
        five sizes are off the type scale entirely.

- [x] **AtlRadioGroup pass — one pass over one component:** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
  - [x] Emits a dead `is-readonly` class in `atl-radio-group.tsx`; no stylesheet in _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        any framework has a rule for it. Style it or drop it.
  - [x] Its Figma master draws one radio, not a group — variants are a single 18px _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        circle plus a label, so group-level states have nothing to sit on.
  - [x] Its parity record hashes the wrong directory: `COMPONENT_METADATA_REGISTRY` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        maps it to `'radio'`, so `computeInputsHash('radio')` backs the record, whose
        `inputsHash` is byte-identical to AtlRadio's. Every change under
        `libs/*/src/lib/radio-group/` is invisible to the gate.
  - [x] AtlToggle/AtlCheckbox hug at 24px and AtlRadio at 28px against a code row _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        height of 40px (`--ui-row-height-sm`) — the form-row masters never moved to the
        row ladder ADR-0052 shipped for everything else.
  - [x] Its error region is three different shapes in ARIA across the three _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        frameworks (Angular: `<div class=errors>` + `aria-describedby` on host; React:
        `role=alert`, no id/describedby; Vue: `role=alert`, no `aria-live`, no
        id/describedby) — the element/class contract holds, the announcement contract
        doesn't.
  - _Cross-reference:_ also touches the Figma-polish collector's row-ladder
    Figma-Variables question below.

- [x] **AtlSelect structure — one ADR-level decision, two findings, one is a _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      symptom of the other:**
  - [x] It's the deepest structural divergence in the library: React and Vue render _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        a native `<select>`; Angular renders a `<button role="combobox">` and points
        `<label>` at its `triggerId`. Both are labelable in isolation, but "one spec,
        three frameworks" is weakest exactly here, and nothing measures it (not
        answerable by an a11y-tree snapshot — see the closed item on why Select is
        exempt by design).
  - [x] Symptom: Angular Select's `role="combobox"` sits on the host while every _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        combobox state and the focus (`aria-expanded`, `aria-haspopup`,
        `aria-controls`, `aria-activedescendant`) sit on the `<button>` — not the
        WAI-ARIA 1.2 pattern. Bigger than a binding move; resolve with the same ADR.

- [x] **Bonus, found while restructuring (not one of the original 130, no checkbox _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      in the old file):** is a `is-*` state class (`is-checked`, `is-open`, `is-active`,
      `is-selected` — emitted inconsistently across the three frameworks' stylesheets,
      e.g. `is-checked` only on Angular's and React's checkbox, not Vue's) **public
      contract or private implementation?** If public, it belongs in `libs/spec` and all
      three adapters must emit it; if private, the current divergence is free and
      `[UNSTYLED-CLASS]` (`check:dead-selectors`'s un-shipped mirror direction) can be
      designed once this is answered. Also decides two smaller `DEAD_SELECTOR_EXEMPT`
      entries: promote React's `orientation` prop to the spec (or drop it + six CSS
      rules), and fix the Angular `atl-table.css:157` / `<atl-checkbox>` element-vs-class
      selector mismatch.

## Collectors

### Storybook config drift, found 2026-09-14

**Closed 2026-09-14.** Five one-line divergences between the three `.storybook` directories,
plus one pin. Nothing gated any of them — `check:manifest-parity` compares docgen output, not
configuration. Detail in `tasks/archive/reviews/storybook-review-2026-09-14.md` §1.

Two follow-ons were taken beyond the six, both necessary: Vue's rewritten `include` keeps
`../src/**/*.d.ts` (`libs/vue/src/env.d.ts` declares `*.vue`, and Vue stories import SFCs
directly, so the ambient declaration is load-bearing) and gains `./manager.ts`, without which
the newly created file would have reproduced exactly the "exists but nothing type-checks it"
defect this closed for React.

Verification note worth keeping: **no gate covers `.storybook/tsconfig.json`.** `check:types`
runs `tsc` against `libs/<fw>/tsconfig.spec.json`, so a green chain says nothing about these
three files — the same blind spot already recorded above for a generated workspace, now known
to apply to this repo too. The rewrite was therefore checked by hand, `tsc -p
libs/<fw>/.storybook/tsconfig.json --noEmit` for all three, 0 errors each, alongside
`npm run check:all` exit 0 (full chain, `check:stories` included) and `nx lint` per library.

- [x] `libs/vue/.storybook/manager.ts` does not exist; Angular and React brand their manager.
      `manager.ts` predates the Vue library (`5aac829`), so Vue never got one.
- [x] `controls.matchers` (colour/date) is in Angular's `preview.ts` only — and in all three
      scaffold templates. The repo's React and Vue Storybooks are behind their own scaffold.
- [x] The three `.storybook/tsconfig.json` differ four ways: React's `include` omits its own
      `manager.ts`, Vue has no `exclude` and names neither `preview.ts` nor `main.ts`, Vue alone
      carries `vitest/globals`, Vue alone lacks `"outDir": ""`.
- [x] Dead commented-out `typescript.reactDocgen` block in `libs/react/.storybook/main.ts`.
- [x] `libs/react/.storybook/main.ts` uses `import { StorybookConfig }`, not `import type`.
- [x] `@storybook/addon-designs` is `^11.1.4` — a caret. The different major is fine and decided:
      the package is in `atelier/storybook-version-lockstep`'s `DEFAULT_EXEMPT` because it is a
      third-party addon on its own release line. But the exemption skips the exactness check too,
      so the caret is unguarded, which is the drift shape that rule's own header warns about. Pin
      `11.1.4` exactly, keep the exemption.

### Breaking changes for 0.3.0

One release, one item — each sub-bullet is an independent, already-diagnosed finding
that wants its own ADR and a changelog line. Ship together.

- [x] **Ship the 0.3.0 breaking-changes batch:** _(closed 2026-10-11: all children closed by the review triage)_
  - [x] ⚠️ **`AtlRadioGroupContext.invalid` became required** in _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `libs/angular/src/lib/radio-group/atl-radio-group.token.ts` (no `?`), exported
        from the public barrel. No in-repo implementor breaks, but any outside
        implementor of the interface does — **this is an unreleased semver-major that
        has already shipped in the code and needs a changelog note before the next
        release goes out.**
  - [x] Angular's `touched` is public API the spec never declared (ADR-0055) — _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        seven components expose it as `model(false)`; React/Vue have no equivalent and
        it no longer gates the error message. Remove it with this batch, or add it to
        the spec and the other two frameworks.
  - [x] React carries two public spellings for one prop: the spec says `readonly` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (Angular/Vue agree), React redeclares `readOnly`. Not dead — both are merged
        with `readOnly` taking precedence — but only the React spelling is tested.
        Consolidating on the spec's spelling is the breaking rename. Affects Input,
        Textarea, RadioGroup.
  - [x] `AtlSelect.name` is a genuinely dead prop (declared, never bound, absent _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        from `AtlSelectContext`, untested) — honoring it means deciding whether
        Angular's button-trigger select emits a hidden input.
  - [x] `AtlAccordionGroup.multi` is a third dead prop, via a third mechanism: the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        public binding is served by
        `hostDirectives: [{ directive: CdkAccordion, inputs: ['multi'] }]` forwarding to
        the CDK's own input, not the component's own declared `multi()`.
  - [x] `errors` is implemented by all three adapters on all seven form components, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        declared by no spec — blocked on a type decision (Angular types it
        `WithOptionalFieldTree<ValidationError>[]`, React/Vue as strings).
  - [x] The spec models exactly one event (`AtlFormFieldSpec.onValueChange`); nine _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        more are implemented consistently in all three adapters and declared nowhere
        (`Alert.dismissed`, `Chat.onOpenChange`, `ChatSuggestion.selected`,
        `Drawer.onOpenChange`, `MenuItem.onTriggered`, `Pagination.onPageChange`,
        `Stepper.onActiveStepChange`, `Th.sort`, `Tr.selectedChange`).
  - [x] `AtlChatMessageSpec` requires `id` and `content` (non-optional) and _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `AtlChatSuggestionSpec` requires `id` — no adapter implements any of them;
        content is passed as children/slot everywhere.
  - [x] `AtlDialogSpec` declares neither `aria-label` nor `aria-labelledby` while _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        all three adapters expose both.
  - [x] `AtlTrSpec.rowId` is wrong three different ways: dead in Angular, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        inherited-but-never-wired in React, absent from Vue's props entirely.
  - [x] `AtlBreadcrumbItem.current` is a settable prop in the spec, React and Vue; _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        Angular computes it internally and never exposes it.
  - [x] `AtlButtonSpec` requires `aria-label` when the button has no visible label; _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        Angular and Vue answer with a dev-mode warning instead of enforcing the prop.
  - [x] React-only props with no spec entry: radio-group `orientation` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (cross-references the AtlRadioGroup pass above) and tbody `emptyContent`.
  - [x] `AtlChatMessageSpec.role` → `messageRole` rename across all three _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        frameworks (removes an ARIA-name collision for good).

### Figma polish pass

The long tail of undecided cosmetic Figma-vs-code questions with **no known live
defect**. Tracking collapsed into one item; every finding kept as its own checkbox.

- → **Work through the Figma polish backlog:** _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  - [x] `color-mix()` cannot be a Figma Variable — AtlAvatar's root, AtlBadge's _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        variant borders, AtlToast's variant fills, AtlAlert's variant borders are
        unverifiable by construction. Add resolved semantic tokens for the mixes, or
        accept as code-only.
  - [x] "Effects Tokens" holds eleven STRING variables (`e/0…e/5`, `tonal/1…5`) _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        that duplicate the generated `shadow/xs…xl` effect styles (ADR-0060) — check
        references, remove the collection.
  - [x] `[MASTER-GLYPH]` walks masters only, so a content-sample frame is invisible _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        to it — widen the probe to every frame on the Components page.
  - [x] Nothing detects an orphaned main component (Figma keeps a removed _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `COMPONENT` alive while an instance still references it) — no live defect as of
        the last check, but gate work against the class: walk instances, resolve
        `getMainComponentAsync()`, assert reachability from the document.
  - [x] Two variable collections carry the same ten spacing values (`Primitive _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
Tokens` `spacing/s1…s16` vs `Library Tokens` `spacing/1…16`, only the latter
        generated from `tokens.css`) — decide whether `Primitive Tokens` (76 variables)
        is still needed.
  - [x] `2.25rem` appears six times for two different reasons _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (AtlInput/AtlTextarea's invalid-icon gutter, AtlPagination's button
        min-width/height) — neither is on the spacing scale; decide a token per reason,
        or record both as intentional dimensions.
  - [x] `margin-top: 2px` on `.step-description`/`.step-optional` — half of _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `--ui-spacing-1`, two uses; either the scale gains a 0.5 step or these become
        4px (a design change). Figma agrees with the code on the value, on a name
        neither side has.
  - [x] The dialog and drawer headers are SemiBold 20px, 2px off _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `--ui-type-title` (18) — Figma masters already draw 18 and are bound to
        `ty/title`; decide whether CSS moves to the role or 20 gets justified.
  - [x] AtlCard and AtlDialog draw their buttons by hand at Medium 14 instead of _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        instantiating AtlButton (`.atl-button` is SemiBold `md`); same class as the
        icon masters — a parent can only instantiate what the child can express.
  - [x] `[LAYER-PAINT]` skips every variant whose `state` axis isn't `default` — _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        found the hard way when AtlToggle's hover/focus tracks were bound wrong and
        nothing reported it; 12 of AtlButton's 24 variants and 4/5 of each form field
        sit in this blind spot.
  - [x] AtlDrawer's master paints the dialog twice (root carries `color/surface` + _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        shadow, and so does the inner `dialog` layer) — decide whether the root should
        paint the backdrop, nothing, or stay as-is.
  - [x] `.atl-drawer-host dialog` states nothing typographic (`all: unset` wipes _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        size/leading and nothing restores it) — the one `[ROOT-TYPE]` gap that's a
        defect rather than legitimate delegation; fix is one CSS declaration, blocked
        on the same collection question as everything else in this cluster.
  - [x] AtlCombobox's fifteen unstyled TEXT nodes are a layer problem, not a root _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        one — no single direct TEXT child for `[ROOT-TYPE]` to find, and
        `[LAYER-PAINT]` can't reach them either (state-skip + `font-size: inherit` +
        spaced layer names). Needs the layer cascade to carry the component root for
        type only.
  - [x] AtlChat's master draws an illustrative app mockup (nav rail, breadcrumb, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        page heading, two sidebar lists, minimise glyph) — scenery, excused by name in
        `TEXT_UNSTYLED_PENDING`, marked pending-removal.
  - [x] Six masters pad on an axis the CSS derives (AtlButton, AtlInput, _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        AtlTextarea, AtlSelect, AtlBadge, AtlTab) — ADR-0041's recipe gives numbers no
        spacing token holds and no Figma Variable can express. Decide: keep resolved
        numbers in step by hand, or state only height and stop padding.
  - [x] `[ROOT-PAINT]` can't see a cascade that ends at `inherit` (e.g. _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `.atl-textarea textarea { font-size: inherit }`) — the value the field
        actually renders comes from the root, outside the cascade. Fix the gate to walk
        up to the component root; fix the data (the 311-node census) first.
  - [x] Reuse the adherence regexes for ADR-0032 alternative 4 — the synced Claude _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        Design file already carries the three rules an artboard/token gate wants (raw
        hex → token, raw px → spacing token, `font-family` outside the DS list); lift
        them rather than authoring new ones.
  - [x] 464 text nodes below 12px (306 on Inventory card meta, 156 on Colors swatch _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        labels/hex, 2 on Components — the last two already fixed as an AtlAvatar bug).
        Catalogue scaffolding, not component text; decide whether documentation pages
        adopt `--ui-font-size-2xs` (10px, exists since ADR-0054) or stay off-scale by
        intent.
  - [x] AtlProgress's layers were already conventionally named (`track`, `fill`) _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        before there was a convention — worth a look at who drew it and whether other
        conventions in this cluster were arrived at once and never generalised.
  - [x] A glyph typed as an instance OVERRIDE is unseen by `[MASTER-GLYPH]` (which _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        deliberately skips text inside instances, since normally that belongs to the
        child master) — compare an instance's text against its main component's
        instead of skipping wholesale.
  - [x] `[ROOT-BOX]`'s gap comparison is unreachable for the four form-row masters _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (AtlCheckbox, AtlToggle, AtlRadio, AtlRadioGroup are excluded from
        `ROOT_PAINT` for a paint reason that also took gap with it) — all four bind
        8px where all three stylesheets state 12px.
  - [x] `[LAYER-PAINT]` never compares a stroke colour when the CSS border is _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        transparent (`if (!/transparent|none/.test(border))` guard) — six visible
        strokes on AtlPagination's page buttons pass because of it; a transparent
        border is a declared value, not a missing one.
  - [x] AtlMenu's `ROOT_PAINT` entry has no `{variant}` template — _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `variant=compact` is compared against the base rule's 8px padding and passes,
        while the rule that actually applies says 4px.
  - [x] ADR-0055's "nothing moves when the state flips" doesn't hold for two of _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        the four form fields: `.atl-input`/`.atl-textarea` narrow their text box 20px
        when invalid (`padding-right` 1rem → 2.25rem), identical in all three
        frameworks, while AtlSelect/AtlCombobox reserve the space unconditionally as
        the ADR describes.
  - [x] AtlTextarea's master disagrees with itself: `radius/md` (10px) on _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `state=default` vs `radius/sm` (8px) on the other four, no CSS rule changes the
        radius; plus the hover variant's root stroke is an unbound raw colour, the only
        raw paint on any of the three field masters.
  - [x] The combobox master stacks its panel 4px below the field where the code _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        uses 8px, plus fill/radius/padding/gap deltas on the same layer — all inside
        the `state=open` skip already recorded above.
  - [x] AtlPagination: four painted divergences on the page buttons (visible _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        border where CSS is transparent-by-design; muted vs full-contrast number text;
        weight differences on inactive/current page numbers) — all invisible to
        `[LAYER-PAINT]` because the colour lives on the TEXT child, not the named
        frame.
  - [x] ADR-0063's page-button fix was half-applied and its own record overstates _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        it: the fill was removed from the six inactive buttons, the stroke was not —
        nothing has contradicted the record since because the gate can't see it (blind
        spot above).
  - [x] The three adapters disagree on the menu trigger-to-panel offset _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (React/Vue: 8px via `calc(100% + var(--ui-spacing-2))`; Angular: no explicit
        offset, CDK default applies) — the ADR-0081 cleanup deleted the only place the
        intended offset was written down. Give Angular an explicit offset, or record
        the CDK default as intended.
  - [x] Both component artboards (design-findings doc) need a correction pass for _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        two overstated claims: the "code-only props" labels, and AtlButton's "half a
        matrix" note. Listed at the end of `tasks/archive/reviews/design-findings-2026-08-26.md`.
  - [x] The row ladder has no Figma Variables — `--ui-row-inset` and the three _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `--ui-row-height-*` are `calc()` over the control scale, which Figma can't
        express as a derived Variable; they'll land as resolved numbers whose
        derivation lives only in ADR-0052 and `tokens.css`.
  - [x] Nothing gates the Figma icon set against `AtlIconName` (ADR-0057) — no _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        live divergence today (25 `Icon/*` components, 25 names, identical sets,
        checked by hand); `check:figma` reads the Components-page snapshot only, so
        the Icons page isn't cross-checked. Capture it in `figma-snapshot.mjs`.
  - [x] AtlChat's master draws a minimise control the component doesn't have _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        (`AtlChatSpec` exposes only `open`/`onOpenChange`) — decide whether AtlChat
        gains the state or the master loses the button.
  - [x] The checkbox tick is drawn twice in the library: code draws it with a _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        rotated pseudo-element while `ATL_ICON_GEOMETRY` already has a `check`. Either
        render `<AtlIcon name="check">` (keeping the `atl-check-pop` animation on it),
        or accept and record the duplication — Figma now draws the CSS shape
        faithfully, so only the code carries it twice.
  - [x] **AtlButton: six of nine anatomy values are literals, not tokens** — _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        min-height (32/40/48) and padding (6/9/12 block, 14/18/24 inline), of which
        only 24px lands on the spacing scale; `[ROOT-BOX]` now names it every run
        (ADR-0076). Either the size steps get tokens, or the gap is recorded as
        intended.
  - [x] The AtlButton Figma master has 24 variants for a 4×3×4 matrix (48) — half _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        the state combinations are unpopulated. Confirm against the master before the
        transfer decides what to add; `check:figma`'s variant-matrix completeness
        passes today, suggesting the metadata `variantMatrix` doesn't claim the full
        cross-product either.
  - → **R-147** The Figma-side Instructions text overstates the token binding: node
    `703:333` on 🛠️ Workshop-Templates says every fill/padding/radius is bound to a
    UI-Tokens variable; `Avatar / Starter` binds only fills and strokes. Soften the
    Figma text, or bind Avatar's corner radius and revert the (already-softened)
    docs prose — a Figma write, out of scope for the docs pass that found it.
  - [x] `ComponentMetadata` has no field saying which spec a `variantMatrix` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        describes — sharing a metadata module between a parent and its children is
        deliberate (nine modules do it), so "specNames[0] is the primary" isn't a rule
        the data supports. Residue: one allowlist entry plus a latent risk that a
        future child inherits an unrelated matrix. Worth a `variantMatrixFor` field
        when a second collision appears, not for one entry.
  - [x] Compose parents from their child masters: AtlMenu's separators are _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        already instances of AtlMenuSeparator; its items, the tabs, the steps, the
        accordion items and the chat bubbles could be too — where a parent
        instantiates its child, the geometry can't drift at all. Blocker: an instance
        can't gain children, so a part taking free content (an icon plus a label)
        needs the master to expose a slot first. Decide slot-per-part, then convert.
  - [x] Consider a gate forbidding `--ui-font-display` outside the role _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        definition — cheap now that `check:typeface` already resolves a role
        shorthand. The point of ADR-0036 is that a component naming the family
        directly can still break the "serif, italic, never bolded" guarantee a role
        token gives for free.
- [x] **Figma layout restructure (2026-10-15)** — the owner saw "very many overlaps" on the
      Components page. Sections did not overlap; their children did: five sections carried
      every child at a +1291px relative offset, two at −317px, so content spilled 1,267px into
      the next section. Same pattern on the Icons page (all 25 icon masters 1,460px below their
      section) and a true section overlap on Workshop-Templates (the Kata section sat on top of
      Starter frames). Fixed live via figma-console-mcp, Figma version checkpoints "Before /
      After layout restructure (2026-10-15)": children re-anchored to (24,24) and sections
      resized and re-stacked at the 240px gap; the two bare Navigation masters moved into their
      wrapper frames and the two stale sample labels ("page 1 of 10", "page 10 of 10 (last)",
      whose content ADR-0056 moved out) removed; AtlButton wrapped like its eight siblings
      (new frame `1218:867`); Navigation reflowed at the 140px gap the other sections use; the
      superseded icon sheet's 4,430px-wide header text set to wrap. Verified by readback: 8
      sections, 0 children outside, 0 overlaps, every inner gap 140, 43 masters before and
      after; screenshots of the page, Navigation, Inputs, Display and AtlButton read clean.
      Not touched: section order, Child masters (bare by design), the AI section (one set,
      no wrapper), the Inventory page (clean).
      **Second pass, same day** (owner: "Avatar and AvatarGroup still badly shifted"): the
      section-level check had passed while seven wrapper frames carried a master set dropped
      on top of the older hand-drawn sheet — AtlRadioGroup, AtlBadge, AtlAvatar +
      AtlAvatarGroup (40 overlapping pairs), AtlCard, AtlSkeleton, AtlDialog, AtlToast. A
      pairwise child-overlap scan per wrapper found all seven at once. Rebuilt generically:
      title, subtitle, axis labels derived from each set's real variant grid (column = plain
      value, row = `prop: value`, set shifted right of the row labels), set at y=108,
      surviving illustrations below. Removed the orphan fakes the masters had been carved out
      of (RadioGroup's Pro/Enterprise rows minus their "Free" item, Skeleton's two extra text
      lines, Avatar's three square fakes), kept the status-dot illustrations because `status`
      is a real prop whose Figma axis is still owed (avatar.contract.ts), and gave the Dialog
      backdrop illustration a `size=sm` instance so it is not an empty grey box. Checkpoint
      "After wrapper restructure (2026-10-15)". Verified: 0 inner overlaps across all 30
      wrappers, 0 children outside, sections reflowed at 140/240, 43 masters, snapshot delta
      only the loose-text count 1731→1749, `check:figma` exit 0. Left as is: AtlAvatarGroup's
      variants sit in canvas order md, xs, sm, lg, xl — reordering touches the master's
      variant boxes, a separate decision.
  - [ ] **Standing layout probe** — the pattern had sat in the file for weeks although
        `plugin-api-gotchas.md` already described the mechanism. Add to the `figma:snapshot`
        preflight (or `check:figma` over the snapshot): every section child inside its
        section's bounding box, no two sections overlapping on a page; ~20 lines, the exact
        check this pass ran by hand. Lesson recorded in `tasks/lessons.md` (2026-10-15).

## Blocked

Correctly open — not stalled, waiting on something specific. Marked "blocked —
unblocks when X" rather than deleted.

- [x] **Claude Design participant katas, and the trainer run-sheet + participant _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
      how-to that go with them** — blocked, unblocks when: the per-seat Claude Design
      access test (review §5) is widened past the trainer machine. **Narrowed
      2026-09-07:** the _owner_ seat is now proven to write — `write_files` landed a
      27203-byte `libs/react/src/styles/tokens.css` into project
      `019de217-489c-7441-8275-2efe020086b5` via `finalize_plan` → `plan_token`
      (ADR-0106). That is the trainer machine, so this stays blocked: what is still
      untested is whether a _participant's_ seat can write to a project shared with
      them, which is the actual precondition here.
  - [x] The katas themselves. _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
  - [x] Schulung M2/M3 — trainer run-sheet (product, `/design-login`, prompt, _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
        hardcode target, flip value, fallback URL) + participant how-to (image,
        prompt→canvas, Step-5 example, opener).
  - _(Unblocked halves already shipped around this — the trainer demo,
    prerequisites 2–3 — without weakening it: the demo is trainer-machine-only and
    says so in its first sentence.)_

- [x] **Work through the Figma parity sweep** — 16 of 43 masters measured _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      2026-09-07, findings and suggested order in
      `tasks/archive/reviews/figma-parity-sweep-2026-09-07.md`. Already fixed: AtlCard
      `padding=none` (was padding like `md`), the AtlButton label wrap, the
      block-padding policy (ADR-0107), the card header's leading. Highest-value
      remaining, in order:
  - [x] ~~**AtlDrawer's size variants are placeholders**~~ — done 2026-09-07
        (`0cca35b`), rebuilt on a 720×480 viewport, 1:1 with the code.
  - [x] ~~**AtlDialog was authored at 1rem = 10px**~~ — done 2026-09-07
        (`0cca35b`), now 384/576/768/1024 and 1280 for `full`.
  - [x] ~~**A gate that measures master geometry**~~ — done 2026-09-07
        (ADR-0108). `rootPaint` gains per-variant `width`/`height`;
        `[ROOT-SIZE]`/`[LAYER-SIZE]` (BLOCKER) compare them against the CSS,
        resolving `min(Xrem, Yvw)`-shaped viewport clamps by taking the fixed
        operand. Proven against the historical bug numbers (AtlDialog ÷1.6,
        AtlDrawer forced to 220×320) and silent against the real, fixed file,
        twice, independently. Found a third, real defect on its first live run:
        **AtlAvatar's `size=xl` is 56×56 against a plain `64px` literal** on both
        `shape=circle` and `shape=square` — xs/sm/md/lg all match exactly
        (24/32/40/48), so this is one size 8px small, not a systemic error.
        **Fixed the same day rather than allowlisted:** resized to 64×64 on both
        shapes and the two `root-size` allowlist entries deleted, so the gate is
        green on its own merits rather than on an exemption. 64 is also the
        on-scale value (`--ui-spacing-16`); 56 is not a step at all.
    - [x] **AtlAvatarGroup's own frame heights** (24/32/36/44/52 for _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
          xs/sm/md/lg/xl) do not follow the avatar ladder (24/32/40/48/64) from `md`
          up. Noticed while fixing the avatar; not chased, and the new rule does not
          reach it (AtlAvatarGroup is outside `ROOT_PAINT`'s table). May be
          legitimate — a group frame carries overlap and ring offsets, so its height
          is not required to equal one avatar — but nothing records that either way.
  - [x] Code fixes: the two `control`-role weight overrides on _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        `.page-btn.is-active` and `.step-item.is-active .step-label` (against
        tokens.css's own role table), `.step-description`'s hardcoded `2px` margin,
        `.breadcrumb-current`'s missing padding.
  - [x] AtlCheckbox and AtlRadio to match AtlToggle, which is already correct in _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        the same file (box size, `input-bg` vs `surface`, `border-strong` vs
        `border`, 1.5px vs 2px, and a real focus variant).
  - [x] AtlPagination's `showFirstLast` is declared but unwired — no first/last _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        layers, `componentPropertyReferences` empty on all nine children.
  - [x] The decisions, in one pass: the 8-vs-12 label gap across four selection _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        controls, the `color-mix` borders (not expressible as a Figma Variable —
        same class as ADR-0107's derived padding), AtlCard's asymmetric padding
        scale, the breadcrumb separator glyph (code ships `/`, Figma draws `›`, and
        the CSS `'›'` fallback is unreachable), AtlAlert's `dismissible` default,
        and AtlRadioGroup's master, which does not model a radio group at all.
  - [x] 21 masters still unswept, including AtlIcon (25 Figma components vs the _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        sheet's "strict 20-name catalogue") and AtlAvatarGroup (no Claude Design
        sheet).

- → **R-072** **The social cards render in Noto Sans, and the docs build phones home for
  it** (found 2026-09-07 while fixing the `--docs-font` fallback; needs a brand
  decision, so not executed). Measured, not inferred:
  - `docs/src/pages/og/[...slug].ts` passes `families: ['Inter', 'sans-serif']`
    and `weight: 'ExtraBold'`. **Both are inert.** `astro-og-canvas` takes the
    font _name_ from `font.*.families` but the font _data_ from a separate
    top-level `fonts:` option, which that file never passes — so it falls through
    to the library default, one Noto Sans TTF at weight 400. Proven by rendering
    twice through `generateOpenGraphImage` with `['Inter',…]` and
    `['NotARealFace',…]`: byte-identical PNGs, same sha256, `cmp` exit 0. The
    build's own log agrees — `Loaded 1 font families: Noto Sans`.
  - So all 23 emitted cards (`dist/docs/og/`, from 24 `OG_PAGES` entries) have
    always been Noto Sans 400. Not a regression; never worked.
  - **Second, separate finding: `nx build docs` fetches
    `https://api.fontsource.org/v1/fonts/noto-sans/latin-400-normal.ttf` at build
    time.** An undeclared network dependency on a third-party font API, in a repo
    whose gates are deliberately offline. A Fontsource outage breaks the docs
    build, and nothing declares or pins that.
  - Options: (a) `fonts:` pointing at a Fontsource Instrument Sans URL — brand
    face, keeps the network call; (b) vendor an Instrument Sans TTF and reference
    it by local path — offline and deterministic, adds a binary plus its OFL
    licence, and would remove the network call too; (c) leave Noto Sans and say
    so in the file. **(b) is the recommendation** — it fixes the brand and the
    build dependency in one move, and matches how the rest of this repo verifies
    things. Note for any of them: CanvasKit's `FontMgr.FromData` wants TTF/OTF,
    not woff2, so Astro's own self-hosted woff2 files cannot be reused; and
    `weight: 'ExtraBold'` must become Bold/700 because Instrument Sans is a
    400–700 family with no heavier cut.
  - Interim, zero-risk: the file's header comment names the route
    `src/pages/og/[...slug].png.ts`; the file is `[...slug].ts`.

- → **R-073** **Presentation-debt p1 and p2** — blocked, unblocks when: real screen
  captures exist. p1 wants photographs of Figma's plugin menu, token dialog and
  inspect panel to replace placeholder SVGs (interim: the retired `#00BEBE` in
  `figma.astro:335` still needs fixing regardless); p2 wants a terminal capture of
  `npm run preflight` from a genuinely scaffolded single-framework workspace — the
  mock's "3 storybook rows / 15 ok" is a run the current script can't produce. p2's
  prerequisite (the two `preflight.mjs` copies byte-identical) is already met; the
  run itself is not.

- → **R-052** **Verify Figma _export_ from claude.ai/design** — blocked, unblocks when:
  someone spends the ten minutes. Import via Figma links into the canvas is
  confirmed first-party (`hifi-design` skill); export out of it is still
  unverified, and ADR-0032's "the canvas dead-ends" tradeoff rests partly on it.
  Treat as a 10-minute spike, not open-ended research — `/claude-design` already
  names the asymmetry explicitly so the page can't be misread as endorsing the
  forbidden direction.

- [x] **Blocked on Figma/Claude-Design external access** (grouped — same root _(closed 2026-10-11: all children closed by the review triage)_
      blocker, different symptoms):
  - [x] Participant artboards are still ungated: `check:artboard-palette` covers _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
        the shared sheet, but a participant's own `.dc.html` can hardcode a colour
        beside the palette it links, and nothing reads those 31 files. The blocker is
        reach — a gate needs the artboards in-repo or an authenticated client. Katas 2
        and 5 want this.
  - [~] `/design-sync`'s manifest — **half done 2026-09-07 (ADR-0106).** The
    _source_ of the Inter/Fira Code claim is fixed: `colors_and_type.css` no
    longer declares them and `SKILL.md` no longer instructs them. The manifest
    itself (`_ds_manifest.json`) is app-generated (`"source":"spa"`) and is
    therefore stale rather than wrong — it still names Inter and Fira Code, and
    no MCP tool triggers a rebuild. Re-read it after the project's design system
    next rebuilds, and settle the two phantom tokens then; they were not
    identifiable from the current manifest.
  - [x] ~~Re-syncing the Atelier design system in Claude Design is blocked on the
        same interactively-authenticated MCP — no script can drive it.~~ **Done
        2026-09-07 (ADR-0106).** The premise was wrong: the MCP is reachable from a
        normal session and no script is needed. Foundation re-synced — the repo's
        `tokens.css` is now `@import`ed by `colors_and_type.css`, which restates
        nothing from it, and the seven genuinely page-level values moved to `--ds-*`.
        Found on the way: four files in that project declared `--ui-*`, two of them
        the same names with different values, so `_ds_manifest.json` was resolving
        collisions by scan order; and `SKILL.md` was telling agents to use the `Llm`
        prefix, which names nothing that exists (9944 `Atl*` in `libs/`, zero
        `Llm*`). **Not verified: the render** — no browser tooling in that session,
        so someone still has to look at the preview cards.
  - [x] The kata and the tutorial still build the same Figma artifact (one _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
        Settings/Card + four `*/Starter` frames in `snapshot.json`) — giving the kata
        its own target is a Figma write. Both pages now say plainly it's the same
        frame and the kata is a timed second lap, which is the honest interim state.

- → **R-129** **No typeface gate reaches `docs/`.** `check:typeface`
  (`check-typeface.js:133`) scans `libs/{fw}/src/lib` only, which is why the
  `--docs-font` Inter fallback (fixed 2026-09-07, `a90556f`) and the OG-image
  `families: ['Inter']` above both survived. Also uncovered: 14 bare
  `font-family: monospace` declarations across seven `docs/src/pages/*.astro`
  files and `docs/src/components/McpExplorer.tsx`, which bypass
  `--ui-font-mono` rather than name a stale face — a lower-severity smell in the
  same blind spot. Decide whether the gate widens to `docs/` or whether `docs/`
  gets its own rule; a generic keyword is not the same violation as a retired
  brand name, so one rule may not fit both.

- [x] **Three decisions the 2026-09-07 sweep named rather than took.** Each is _(closed 2026-10-11: all children closed by the review triage)_
      recorded in a commit message and nowhere a reader would look, which is why
      they are here.
  - [x] **There is no SemiBold below 16px** — no `--ui-type-*` role and no Figma _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
        text style. `.atl-avatar` states `font-weight: semibold` at font sizes
        2xs/xs/sm (10/12/14px), so following the code faithfully leaves those text
        nodes unbindable; they were bound before only because they carried the wrong
        weight, which happened to match `ty/label` (12 Medium) and `ty/control`
        (14 Medium). Cost 12 findings of type-baseline debt on 2026-09-07. Same
        shape as ADR-0074, which added `control` and `action` because two
        combinations were unspanned — this is a third. Decide: give the small-end
        semibold combination a role, or accept it as off-role and say so.
  - [x] **AtlCombobox's `input` layer passes the block-padding check by _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        coincidence.** It carries `padding: [9, 56, 9, 16]` against `minHeight: 40`,
        and 9px is exactly what `.atl-combobox-input`'s ADR-0041 recipe derives — so
        it reads as correct while being the same false-pass ADR-0107 retired at the
        root. `checkLayerPaint`'s ADR-0107 treatment was deliberately scoped to the
        six masters that ADR names, so this is untouched. Decide: fix the master's
        padding data, or extend the height-derived treatment to AtlCombobox with its
        own ADR.
  - [x] **Three parent masters hand-draw their children instead of instancing _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
        them** — AtlAvatarGroup, AtlTable and AtlAccordionGroup all have
        `compositionDependencies` null and redraw their parts as plain frames.
        `AtlTr`, `AtlTd` and `AtlTbody` compose real instances two levels deep, so
        the discipline exists below the parents but not in them. This is the root
        cause of three separate drifts fixed on 2026-09-07 — including AtlTable's
        thead diverging from its own child master, which renders correctly — and of
        having patched AtlAvatarGroup's numbers twice in one hour. Patching numbers
        on a hand-drawn copy is symptom treatment; the fix is instancing, and it
        needs care because the parents' boolean properties are wired to their own
        hand-drawn helper layers.

- → **R-050** **An automated parity pass validates about a fifth of what Figma paints.**
  Measured 2026-09-07 from AtlSelect's own `cssMapping`: four of its five
  painted states are gated behind pseudo-classes (`.has-value`,
  `[aria-expanded]`, `:hover`, `:focus-visible`), and a static component-tree
  read can never trigger any of them. `figma_check_design_parity` therefore
  only ever validates the resting state. Every defect the two sweep waves found
  came from opening painted variants by hand. Not a bug to fix — a coverage
  fact that should shape how much a green parity score is trusted, and it is
  why `tasks/archive/reviews/figma-parity-sweep-2026-09-07.md` records what the score cannot
  see. Consider whether an interactive pass (Storybook + real hover/focus, or
  per-variant screenshot review) belongs in the workshop's own verify loop.

- → **R-107** **`check:release-drift`'s diagnosis assumes one direction.** Seen
  2026-09-07: with the registry at 0.2.39 and the working tree at 0.2.38 (a
  `chore(release)` commit fetched but not yet rebased onto), it printed
  `✗ [DRIFT] local 0.2.38 vs published 0.2.39` followed by _"A publish did not
  reach the registry — check the token/scope … and republish"_. The numbers said
  the opposite: published was AHEAD, the publish had fully succeeded, and the
  fix was `git rebase origin/main` — after which the same gate reported 5 of 5
  in sync. The advice it gives for local-behind is actively wrong and points at
  a republish that would be a no-op at best. It should compare the direction
  first and say "your tree is behind the release commit" when local < published.

## Optional / low priority

Not urgent; fix opportunistically or when touching the same area anyway.

- [x] **Two net-zero commits** (`98e8755`, `ac3c854`) stay in git history — they _(closed 2026-10-11 by the review triage: SUPERSEDED; see tasks/archive/review-triage-2026-10-11.md)_
      cancel exactly, and rewriting unpushed history was blocked by the auto-mode
      classifier. Harmless; squash them if the branch is ever rebased anyway.

- → **Old "Larger workstreams" leftovers** (from the original ranked roadmap; _(review triage 2026-10-11: open children tracked in tasks/reviews.md)_
  kept, not deleted):
  - [x] C7 capture bound-token name/value in the Figma snapshot · C8 `check:figma` _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
    - freshness check (the snapshot never checks its own age; `figmaLastModified`
      is still `null`) · C9 a full 27-master snapshot.
  - → **R-011** D12 de-personalize the host + deploy workflow · D14 invert
    `check-docs-sync` · D15 secret/RCE defaults review. (D10, D11, D13 from the
    same original list are done and archived — see
    `tasks/archive/2026-07-defect-batch-h1-figma-audit.md`.)

- [x] **`@angular/animations` is not the only optional peer a prune could take.** _(closed 2026-10-11 by the review triage: OBSOLETE-CDS; see tasks/archive/review-triage-2026-10-11.md)_
      The dep-prune reasoning that failed once already ("zero source imports") is
      sound about this repo's own code and blind to what a dev-dependency reaches for
      at build time. No gate checks that, and probably doesn't need one — recorded so
      the next prune's author reads this first. Partial mitigation already exists: CI
      now builds Storybook, so a prune that breaks a builder fails the PR.

- → **R-098** **`@nx/devkit` is still a hard dependency of the preset, pinned to the
  monorepo's nx.** ADR-0053 closed the peer-dependency route by which a plugin
  outran nx core, but `NX_VERSION` is read from whichever devkit the preset itself
  carries — if `create-nx-workspace` ever scaffolds on a newer nx than this pin,
  the skew returns inverted. Hasn't bitten because the pin moves with the
  monorepo, but that's discipline, not a mechanism. _(Note: the triage's "Figma
  polish pass" list named this line, but its content has nothing to do with Figma
  — moved here as a judgment call; see the session report.)_

- → **R-071** **Bonus, found while restructuring (not one of the original 130, no
  checkbox in the old file): 16 pre-existing horizontal-overflow page/width
  combinations**, surfaced (not caused) when the docs scrollport fix removed
  `.docs-main`'s `overflow-y: auto`. Contained by `.docs-main-content` — nothing
  is cut off or pushes the page — but real responsive defects (e.g.
  `.docs-props-table`'s 849px min-content width at narrow viewports). Deliberately
  not fixed with the scrollport work to keep the scopes apart; the proper fix is a
  per-element scroll container on the wide content.

## Closed this session (2026-09-06)

- [x] **`Status` joins the gate's axis-word list** — `tools/scripts/lib/component-axes.js`'s
      `axisOf`/`AXIS_PREFIX` (and its two duplicated axis-word regexes,
      `tools/scripts/lib/component-map.js`'s `AXIS_RE` and `check-variants.js`'s own
      union-parsing regex) now recognize `Status` alongside
      Variant/Size/Shape/Position/Orientation. Two unions newly validated:
  - `AtlAvatarStatus` (`'online' | 'offline' | 'away' | 'busy' | ''`) is a genuine,
    CSS-backed paint axis — all three frameworks already carry `.status-online` /
    `.status-offline` / `.status-away` / `.status-busy`, so it now passes
    `check:variants` and `check:defaults` with zero code changes needed. The empty
    `''` member ("no status") needed no special handling: `check-variants.js`
    already skips falsy members (`if (!member) continue;`), so `''` was never going
    to be misread as a missing `.status-` class.
  - `AtlChatStatus` (`'idle' | 'streaming' | 'error'`) is behavioural state, not
    paint — only `.status-streaming` exists in any framework, driving the input
    footer's Send/Stop button swap (`isStreaming` in `atl-chat.tsx` and the
    Angular/Vue equivalents). `idle` and `error` legitimately have no CSS class.
    Exempted per `angular|react|vue:AtlChatStatus:idle|error` (6 entries, one
    shared reason) in `tools/scripts/lib/allowlists.js`'s `VARIANT_AXIS_EXCEPTIONS`,
    which was converted from a `Set` to a `Map` of `{kind, reason}` (matching this
    file's other allowlists) — a drop-in change for `check-variants.js`'s consumer
    side since `Map.has()` reads identically to `Set.has()`.
  - Verified: `check:variants` 24→26 unions × 3 frameworks (both new unions passed
    clean); `check:defaults` 22→24 props (both new prop defaults agree across all
    three adapters and docs — `avatar.status` defaults `''` everywhere,
    `chat.status` defaults `'idle'` everywhere). Turning the word on surfaced
    nothing beyond the two unions described above.
  - `tools/scripts/check-figma.js`'s own `[NAME]` axis-word regex (Variant/Size/
    Shape/Position/Orientation/Align/Role — a different, seven-word list, unrelated
    to this gate pair) was deliberately left untouched — out of scope for this
    decision; drawing the Figma-side `AtlAvatarStatus` axis is a separate, still-open
    follow-up above (Needs an owner decision) and needs the Desktop Bridge.
- [x] **The agenda's `solved-*` branch promise, and the trainer-kit repo-location
      decision it turned out to be entangled with** — `tasks/archive/schulung-2tage-agenda-2026-09.md`
      claimed (gap-table row `:81` and a Folie-7 bullet) that four Git branches
      `solved-toast`/`solved-tagchip`/`solved-statcard`/`solved-avatar` exist as a
      trainer safety net; `git branch -a` confirms zero `solved-*` branches. Both
      lines reworded to say the branches are trainer prep, not an existing asset.
      Searched for the same promise elsewhere: `docs/src/pages/schulung.astro` (no
      mention), the rest of `tasks/` (only prior review docs _describing_ the gap,
      already phrased accurately — untouched), `plan/adr/*` (two false-positive
      greps on "unresolved"/"resolved" containing "solved" as a substring — not the
      same word, untouched). Pulling this thread reopened
      `tasks/archive/reviews/schulung-review-2026-09-02.md` §6.3's still-open recommendation to
      move trainer material to a private `atelier-trainer` repo — re-checked and
      closed as **no, not now**: the one sensitive finding it rested on (I1,
      colleagues' names + internal mailbox) is already fixed to role-only phrasing,
      and a second, ungated repo would fare worse than this one at exactly the kind
      of drift the `solved-*` claim itself is an instance of (`plan/ai-readiness.md`
      needed a full ADR supersession, ADR-0083→ADR-0097, within five months).
      Recorded as ADR-0103; "Decide trainer-kit repo location" removed from
      Needs an owner decision above. M12 (building the four branches themselves)
      stays open — see Near-term work / grab-bag.
- [x] **No target type-checks the stories** — `check:types`
      (`tools/scripts/check-types.mjs`, commit `6a8ac9f`) runs `tsc --noEmit` over each
      framework's `tsconfig.spec.json`, which globs `*.stories.*`. Gate is wired into
      `check:all`.
- [x] **`workshop/` is untracked and unignored** — `git ls-files 'workshop/*'` now
      returns five tracked files.
- [x] **Rotate `NPM_TOKEN`** and **republish the six missing versions** — done today:
      all five publishable packages are at 0.2.35 on npm, `npm run check:release-drift`
      exits 0 ("5 of 5 in sync"). No sequencing note remains open.
- [x] **a11y-parity: Select/Combobox out of the gate by design** — closed as
      answered, not merely re-triaged: the 2026-09-05 caption-fix cross-check ("What
      cross-checking the closed item turned up," now archived) reconfirmed Select/
      Combobox (and Radio) are exempt by design (ADR-0007/ADR-0091); only `accordion` is
      a real gap, and it's tracked in Near-term work above.
- [~] **No gate typechecks the three `libs/*/.storybook/tsconfig.json` projects** —
  closed with a note rather than a tick: `check:types` already covers the story
  prop-typing failure class this item worried about; the only residual is the three
  `.storybook/tsconfig.json` config files themselves, a much thinner problem than the
  item as originally written.
- [~] **`/claude-design` stale numbers (M1)** — split: the gate-count half is done
  (`docs/src/lib/gate-count.ts` derives "33" at build time from `package.json`); the
  "twenty-four tags" / "17/13 ADRs" half is not — carried forward above (Near-term
  work, grab-bag) since we now have the derivation pattern to copy.
- [x] **Four a11y-role/pictogram questions, decided by the owner** — the three
      `METADATA_ROLE_EXCEPTIONS` divergences plus the breadcrumb separator, closed
      together:
  - **AtlStepper** — metadata corrected `progressbar` → `tablist`, matching all
    three code adapters. Its `METADATA_ROLE_EXCEPTIONS` entry removed. Vue's
    `tabpanel` turned out to already exist (`atl-step.vue`, present since the
    original Vue rename commit) and already matches the committed baseline — the
    item as written overstated a gap that wasn't there; no Vue code change was
    needed. The Figma-master disagreement is unrelated and stays open, see
    AtlStepper's Figma item above.
  - **AtlChat** — kept `role: 'log'` and added the missing container:
    `AtlChatMessages` renders `role="log"` (named, `aria-label="Conversation"`)
    with `aria-live="polite"` in all three adapters. **First pass was wrong,
    caught by a second-model review before commit**: `role="log"` alone does
    not give `role="listitem"` a list parent — `listitem` requires an ancestor
    with `role="list"`, and `log` isn't one; the original fix left the
    `listitem`s exactly as orphaned as before, while its own comments (and
    `docs/src/data/components.ts`) claimed otherwise. Fixed by nesting a
    second, `display:contents` element with `role="list"` inside the log —
    verified in Chromium/Firefox/WebKit that the `display:contents` wrapper
    doesn't disturb the messages' flex/gap layout, and confirmed via
    Chromium's native accessibility tree that the structure now reads `log
"Conversation" > list > listitem, listitem`. Politeness is `polite`, not
    `assertive` — `workshop/briefs/toast.md` §4.3 uses severity to choose
    (`info`/`success` polite, `danger` assertive) specifically to avoid
    training users to ignore/disable notifications; an ordinary chat message
    isn't an interruption-worthy event, and the existing `AtlChatTyping`
    indicator already sets `aria-live="polite"` for the same reason. The log's
    accessible name (`"Conversation"`) also had to be added explicitly: without
    it, the shared `a11y-tree.ts` test helper's visible-text fallback (meant
    for name-from-content roles like `button`) produced a manufactured name —
    the concatenated text of every message — for a role (`log`) that is
    name-from-author-only. Checked whether this is a systemic bug in the
    shared helper (it would affect every component's snapshot): no — every
    other name-from-author-only role in the committed baselines
    (`AtlBreadcrumbs`/`AtlPagination` navigation, `AtlTable` region) already
    carries an explicit author label, and `AtlAlert`/`AtlBadge`/`AtlToast`'s
    `alert`/`status` roles have single self-contained message content where
    the fallback happens to coincide with a reasonable name — `AtlChatMessages`
    was the only case with genuinely list-shaped children and no label at all.
    `METADATA_ROLE_EXCEPTIONS` entry removed; a11y baselines regenerated.
  - **AtlSkeleton** — turned out already done: commit `57a24b1` (2026-08-26)
    had already corrected the metadata to `role: 'none'` and removed its
    exception. Verified, not re-fixed; no diff here.
  - **The breadcrumb separator** — stated as the one allowed exception to "every
    pictogram is an AtlIcon" rather than becoming an `AtlIcon` in three
    templates: [ADR-0100](../plan/adr/0100-a-pseudo-element-the-icon-set-cannot-reach.md),
    with a same-change "Corrected 2026-09-06" paragraph on
    [ADR-0050](../plan/adr/0050-a-glyph-in-a-string-map-is-still-an-icon.md).
    Verifying "hidden from assistive tech" found a real defect the pre-existing
    CSS comment had only assumed away: on Chromium, `CDPSession
.getFullAXTree` (the browser's own native accessibility tree) showed the
    separator glyph reaching the tree as its own text node; Firefox and WebKit
    were checked with Playwright's `ariaSnapshot()` — its own DOM-based ARIA
    computation, not those engines' native trees, but consistent with the same
    finding. Fixed with the CSS Generated Content alt-text pair (`content:
<value> / ''`) in all three stylesheets — re-measured, the glyph still
    renders visually and is gone from Chromium's native tree and all three
    engines' `ariaSnapshot()`. **Second-model review also caught**: React and
    Vue's `<ol>` had no explicit `role="list"` (only Angular did) despite both
    setting `list-style: none` — the documented Safari/VoiceOver case where an
    unstyled list can lose its implicit list semantics. Added to both; not
    independently reproduced here (no macOS Safari + VoiceOver access in this
    environment), applied on the strength of the documented real-world
    behaviour rather than a local repro.
  - `check:a11y-parity`, `check:metadata` and `check:adr-refs` all exit 0 after
    this change.

## Follow-up package I — Figma's own MCP server joins the seat in Day 2 Block 05 (2026-11-21)

Owner, 2026-11-21: the training machines are the owner's own, each with its own
Figma account on a Full seat; of the four routes offered (fixed in the scaffold,
active from Day 1 at provisioning, Day 2 Block 05, trainer demo only) the owner
chose **Block 05**. Measured the same day: `get_design_context` on the AtlButton
master returns one React + Tailwind component even with the Angular hint
(memory `project_figma_connector_spike_2026_11_21`).

Done when: the Day 2 deck carries a comparison slide and a mini-exercise behind
`d2-05-04b`, a participant can follow the exercise from the slide alone, and the
scaffold, the release and the seats stay untouched.

- [x] I1 `d2-05-04c` + note: the two routes to Figma side by side (Figma's own
      MCP server / figma-console-mcp), layout differs from `d2-05-04b`.
- [x] I2 `d2-05-04d` + note: mini-exercise, one command, login in `/mcp`, one
      design-context question on the own component, compare with the own code;
      rescue line for a hanging login on the slide.
- [x] I3 `deck.json` order, `outline-ids-day2.txt`, backup, checker, render
      heights, foreign-edit check, publish as draft, read back.
- [x] I4 outline entries, `changelog-day2.md`, archive under `~/Backups/atelier-schulung/`.
      Published as Day 2 version 59 (id 1795260250-6ece), read back byte-identical;
      render heights 853 / 734 / 920 / 754; the checker's one new real line is
      `d2-05-04d: url`, accepted because the command needs the address.
- [x] I5 ADR-0190 + README row; memory.
- [x] I6 **Owner, 2026-11-21: yes.** The exercise's ten minutes come from the
      transfer exercise (`d2-05-06`, 25 → 15). New block: 5 rules, 25 show &
      tell, 5 synthesis, 10 anatomy, 5 talk (`d2-05-04b` + `d2-05-04c`),
      **10 exercise (17:00–17:10)**, **15 transfer (17:10–17:25)**, 5 exit.
      The transfer drops the neighbour reading (my call, not the owner's): 10
      framing and marking, 5 choosing and writing; the exit round reads the step.
- [ ] I7 **Owner, 2026-11-21: yes, with R-040.** Rehearsal on a real seat:
      `claude mcp add` + `/mcp` login with the seat's Figma account; which
      server the agent picks with both Figma servers connected; whether the
      output on a participant's own component is React + Tailwind as on
      AtlButton. Written into R-040 and the dry-run kit (rehearsal check 13).

### Second round, same day (owner: "1 ja 2 ja 3 kannst du noch machen")

Done when: every place that states the transfer's 25 minutes or 17:00–17:25 says
15 and 17:10–17:25, the exercise has its own row at 17:00–17:10, the
`figma-workspace-architect` skill no longer advises against Figma's own MCP
server in any of its three copies, both ADRs carry the dated correction, and the
gate chain is green by exit code.

- [x] I8 Deck: `d2-05-06` (15 Min.), `d2-05-06-n`, `d2-05-01-n`,
      `d2-05-04c-n`; render, checker, publish, read back, changelog, archive.
- [x] I9 `docs/src/pages/schulung.astro`, Day 2 Block 05: times in the first
      bullet, a bullet for the exercise, transfer 15 min, one trainer entry.
- [x] I10 Trainer documents: run-of-show (new row, checkpoint D2B05-C4, sum),
      trainer notes (items 3, 5, new 6, "Watch for"), outline, dry-run kit
      (Block 05 bullets, rehearsal check 13), R-040.
- [x] I11 Skill `figma-workspace-architect`: six passages in the source, synced
      to the scaffold copy and the discovery copy (`sync:preflight`,
      `sync-skill-discovery.mjs`).
- [x] I12 ADR-0190 (three dated corrections: minutes, "no release", the skill)
      and ADR-0111 (dated correction: the skill no longer states the exclusion;
      the decision stands).
- [x] I13 Gates: `check:all` by exit code. Exit 0 on 2026-11-21, one run, after both
      agents had finished (`storybook-test` for all three libraries included). The
      deck: version 60 read back, four files byte-identical.
- [x] I14 **Owner:** commit and push. Owner go 2026-11-21 ("Ja"). Four commits
      (`9364323a` skill, `7de78332` course pages, `d64236e4` ADRs, `4e5a85bd`
      trainer documents), pushed once. Publish and CI for `4e5a85bd` both
      succeeded; released as **0.4.21** (tag `v0.4.21`, skill tag
      `skill-figma-workspace-architect-0.2.59`), `check:release-drift` exit 0
      afterwards, 7 of 7 packages in sync with npm.
- [ ] I16 **Owner:** reprovision the seats from 0.4.21. Seats provisioned from
      0.4.20 keep the old skill text, which tells the agent not to recommend
      Figma's own MCP server — the opposite of what the Block 05 exercise does.
- [ ] I15 Not done, named: no exercise prompt on `course/day2-prompts.md` (the
      slide carries the steps); `d2-05-04` still says "15 Min." in its eyebrow
      while its note says ten (older than this package).

## Scaffold: initial commit + Angular skills (2026-11-21)

- [x] Root cause: `create-atelier-ui-workspace` calls Nx's programmatic `createWorkspace()` without
      `commit`; only the Nx CLI gets the yargs default `commit.message`, so the workspace was staged
      but never committed. Fix: `commit: initialCommitOptions()`, with a neutral fallback identity
      only when `git config` has none. Verified against Nx 23.3.0's real `initializeGitRepo` with an
      empty HOME: without `commit` no commit; with it "Initial commit" by the fallback, tree clean.
- [x] ADR-0191: Angular workspaces also install `angular/angular --skill angular-developer` and
      `marmicode/skills --skill angular-testing` (spike: 8 s / 3 s with skills@1.5.25), each install
      non-fatal on its own. Unit tests + `check:all` exit 0.
- [ ] e2e not run (Verdaccio + network): the HEAD/clean-tree assertion and the two Angular skill dirs.
- [ ] Commit, release, reprovision seats from the new version.
