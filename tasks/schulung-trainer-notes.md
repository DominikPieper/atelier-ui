# Schulung trainer notes: what to say, show and check per block

_Written 2026-10-14. Trainer material, not participant-facing. Participants cannot open the docs site (ADR-0184): every `/route` below is the trainer's own reference or screen. What participants paste is in `course/` in their workspace, what they keep is a printed handout._

**What this is.** The content layer under the other four trainer files. `/schulung` says
what a block is for and when it is done; `tasks/schulung-run-of-show.md` says what
happens at which minute; `tasks/schulung-deck-outline.md` says what is on the slide;
`tasks/schulung-demo-scripts.md` scripts the five demos. None of them says what the
trainer actually says and points at. This file does: per block, the talking points with
their facts, what to put on the projector, the answers the recap should produce, where
the room gets stuck, and what to have ready. Block numbers, times and done-when are
`/schulung`'s; re-check against the page if it changes.

**Conventions.** Every fact below was read from the repo on 2026-10-14 (file named where
it matters). `Decided 2026-10-14:` marks content the owner approved on 2026-10-14 (R-207 to R-219)
and that is on `/schulung` since then; `Proposal:` marks what still needs an owner's yes.
`Verify in rehearsal:` marks a claim no one has observed live (R-040, R-202); `UNVERIFIED` means the same
and is kept visible as a rehearsal note (the points of ADR-0180 are numbered in
`tasks/schulung-dry-run-kit.md`). `Measured 2026-11-17` / `2026-11-18` marks numbers taken on a fresh 0.4.10 Angular scaffold.

**Print.** `npm run trainer:print` writes `tasks/print/day-1.md` and `day-2.md`: the
day's run-of-show, these notes, the day's demo scripts and golden-prompt sections in one
file for a tablet (R-217). Blocks on `/schulung` have anchors such as `#day-1-block-04`.

**Have ready on both days.** Two checkouts on the trainer machine: the Atelier clone
(demos, Storybook on :4400) and a scaffolded Angular workspace (what participants have,
Storybook on :6006, app on :4200). Saved outputs of every demo from the rehearsal. A
timer visible to the room. Paper: the labels for sorting differences (Day 1: code / Figma; Day 2: code / Figma / kept on
purpose), one copy per participant of the five
handouts `workshop/handouts/ds-scorecard.md`, `figma-readiness-checklist.md`,
`storybook-readiness-checklist.md`, `ladder-card.md` and `rescue-sheet.md`, the golden prompts (`tasks/schulung-golden-prompts.md`,
handed out on site, never on the projector). The run-of-show open on a second screen.

---

## The ladder and the scorecard (cross-block reference)

Two things that more than one block uses. Wording rules (ADR-0180): "check" for the
standard tools, "gate" only for Atelier's own (the `/verify` line, these notes). **The agent
runs the checks, not the participant:** "Run `<command>`. Report each exit code. If one is
not 0, read the output (the full log when the summary has no error text), repair, and run it
again." Fallback if the agent stalls: the participant types the command. **Each stage is
taught in three beats:** break it on purpose, the tool says so, the agent gets the output and
repairs. **Each stage is taught with what it does not see.** **Green is not right:** lint asks
for `alt`, the agent writes `alt=""`, lint is green, and an image that carries meaning is now
hidden from a screen reader. `/verify` stays the single closing proof line; no other Atelier
gate joins the participant path.

### The ladder

Measured 2026-11-17 on a fresh 0.4.10 Angular scaffold. Slide, printed handout `workshop/handouts/ladder-card.md`, take-home (trainer source `/cheat-sheet`).

| Stage         | Command                                                                                                      | Catches                                                                                                                                    | Does not see                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0 Design      | agent: `figma_lint_design` with rules `hardcoded-color`, `default-name`, `detached-component` (Figma linter) | raw colours, layers left on default names, detached instances                                                                              | whether the design is right; spacing and radius; its default rule set also reports false alarms (18 "critical" contrast findings on a hidden layer of `Inputs/AtlButton`) |
| 1 Compiler    | `npm run build` (TypeScript `strict`, Angular `strictTemplates`)                                             | an invented value (`variant="ghost"` gives `TS2322`, lists the allowed values); an invented bound input (`[shadow]="'lg'"` gives `NG8002`) | an invented static attribute (`shadow="lg"`) and an invented event (`(pressed)`) build clean                                                                              |
| 2 ESLint      | `npm run lint` (ESLint, Angular template rules)                                                              | missing `alt` (`alt-text`), click without keyboard (`click-events-have-key-events`), not focusable (`interactive-supports-focus`)          | a raw `<button>` where a library component exists; meaning (`alt=""` passes)                                                                                              |
| 3 Stylelint   | `npm run check:stylelint`                                                                                    | a raw colour in a `.css` file (`[RAW-COLOR]`), a token bypass (`[BYPASS]`)                                                                 | inline `style=`, a `styles:` array in the component, named colours (`red`), `oklch()`                                                                                     |
| 4 Story tests | `npm run check:stories` (or `test-run` over the local Storybook MCP)                                         | a story that stops rendering, a `play` assertion that fails, an axe violation                                                              | anything without a story; dark mode (axe runs in light mode only); a keyboard path no `play` walks                                                                        |

Invented names and hand-built elements are caught by none of the five; the receipts table of
Day 1 Block 05 (a `docs-show` source for every property) stays that check.

Numbers for the room and for timing: warm runtimes build 6–9 s, lint 6–7 s, stylelint 2–4 s.
One headless repair run (four planted defects, build + lint): 78 s, 10 turns. **Known gap until
R-248:** a failing command prints no error text in a non-TTY shell, so every prompt says "read
the full log"; whether that works is a rehearsal check (UNVERIFIED, kit).

| Stage  | Where it enters                                                                 | Minutes                         |
| ------ | ------------------------------------------------------------------------------- | ------------------------------- |
| 0      | Day 1 Block 03 before the checklist; Day 2 Block 01 before the handoff document | 10; 5                           |
| 1      | Day 1 Block 04, demo D-4                                                        | 3, inside the 15 minutes of D-4 |
| 2      | Day 1 Block 02                                                                  | 10, one pass                    |
| 3      | Day 1 Block 00 demo D-1 (already there); Day 1 Block 05 closing step            | 0                               |
| 4      | Day 1 Block 04 demo D-5; Day 2 Block 03                                         | 0                               |
| Wiring | Day 2 Block 00: `CLAUDE.md` "Definition of Done", one `SKILL.md`, the hook      | 10 (5 projector, 5 exercise)    |

### The scorecard

"What a design system has to bring", `workshop/handouts/ds-scorecard.md`, one printed page.
Shown as the map in Day 1 Block 00, given out there, and the frame of the transfer in Day 2
Block 05. Seven rows; scoring on the handout is yes / partly / no per row, and "pick the
weakest row" is the next step.

| Row         | Question                                                                                                              | "Yes" looks like                                                                                                                                      | Course                                                     | Check                  |
| ----------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------- |
| 1 Describe  | Can the agent read what each component is for and what each property does?                                            | a description per component and per property, values printed in full, the import line in the usage example; read through `docs-show`                  | Day 1 Blocks 04–05, Day 2 Block 02                         | `/storybook-readiness` |
| 2 Constrain | Does the API leave little to guess?                                                                                   | literal unions instead of `string`, one variant axis instead of a pile of Boolean props, composition over configuration, a default for every property | Day 2 Block 01                                             | `/design-principles`   |
| 3 Tokens    | Is every colour, spacing and radius a named token, the same name in Figma and code, and do modes switch through them? | named tokens with one name on both sides; modes switch through them                                                                                   | Day 1 Block 03                                             | `/readiness`           |
| 4 Prove     | Does every variant value and state have a story, and do the stories run as tests with axe?                            | a story per variant value and state, run as tests with axe                                                                                            | Day 1 Block 04, Day 2 Block 03                             | —                      |
| 5 Enforce   | Is every rule that can be enforced in a linter or the compiler enforced there, and not in a wiki?                     | strict TypeScript, ESLint, stylelint, a Figma linter                                                                                                  | the ladder, Day 1 Blocks 02 and 05                         | —                      |
| 6 Instruct  | Does the repo have its own rules file with the exact check commands, and a skill for the recurring task?              | a rules file with the commands, a skill                                                                                                               | Day 2 Blocks 00 and 05                                     | —                      |
| 7 Measure   | Do you know the agent is better with the design system than without?                                                  | the same prompt run with and without the context, results compared (the guardrail demo of Day 1 Block 00 is the smallest form)                        | Day 1 Block 00; an exercise of its own comes with cohort 2 | —                      |

The other handouts (`workshop/handouts/figma-readiness-checklist.md` from `/readiness`,
`storybook-readiness-checklist.md` from `/storybook-readiness`, its checks and its read-only
self-check prompt) are check titles as tick boxes, one copy of each per participant on paper;
they name no page. Both checklists are explicit homework for the participant's own system: run with the check prompt, each time-boxed at 30 minutes on its page; nobody starts one on their own system in the room. The one room use is Day 1 Block 03, 13:35–13:45: Part A of the Figma checklist, once, for the Atelier master just linted (decision 2026-10-14, R-207; the handout's first line says both since 2026-11-21, R-278). The scorecard is the room work (Day 2 Block 05, from memory). The ladder card is
the handout `workshop/handouts/ladder-card.md` (source `/cheat-sheet`), the rescue steps are
`workshop/handouts/rescue-sheet.md` and `course/rescue.md` in the workspace.

---

## Day 0: before the course

The machines are provisioned by Conciso before Day 1 (owner decision 2026-11-12,
ADR-0178; what a provisioned machine has is listed there). Nothing is installed at home
and nothing is mailed beforehand: the preflight mail step (`/workshop#send-preflight`,
R-213) is gone for the course, and Block 01 verifies the machine in the room.

- Per seat: a Claude training subscription; the seat is logged in during provisioning, before the course (owner 2026-11-20), not in Block 01.
  How the account is handed to a seat is organisational and stays `TODO(owner)`.
- Figma Desktop is logged in with a Conciso account, the Atelier file is already
  duplicated once and the Desktop Bridge plugin is imported. Nobody duplicates in the room.
- A second person for Day 1 09:25–12:00 (anyone who has run the scaffold once). Block 01
  and the Day 1 lunch are where one trainer and eight laptops do not scale.
- A seat's training subscription hits its usage limit mid-block: run-of-show rule R12
  (pair with a neighbour, the neighbour drives). A reserve account for that seat is
  `TODO(owner)`; tell the organiser afterwards (R-218).

---

## Day 1: understand the tools and practise the workflow step by step

### Block 00 · 09:00–09:25 · Kickoff and thesis

**On screen.** `/` overview, then `/workshop#glossary`, then two windows for D-1 plus the scaffolded workspace's terminal for its check step, then the ladder slide and the scorecard slide, then `/schulung`.

**Say.**

1. The thesis, as an argument and not a slogan: an agent multiplies what it reads. One
   canonical token name per colour and a prop table it can query → consistent output.
   Three spellings of "primary", no docs → three new spellings. So the order is
   guardrails first, speed second. The guardrails are concrete: a readable source
   (Figma masters with bound variables), a readable API (the Storybook manifest,
   `components.json`, reached over MCP), and checks that can fail (the ladder below: build,
   lint, stylelint, story tests with axe, and a comparison with the design).
2. The four pillars, one sentence each: **Figma** = source of shape and tokens (the
   Components page); **Storybook** = the manifest, the prop table the agent reads
   (Angular: `angular-component-meta`, ADR-0097); **MCP** = the connection: JSON-RPC
   tools such as `docs-show` and `figma_get_component_for_development`; **Claude Code**
   = execution: an agent in a loop that reads files, runs commands, calls those tools.
3. The loop as the map of both days, with the tool per step (participants do not memorise
   it and nothing asks them to list it; each block's title slide shows which step it works
   on): **Read the design** (in Figma) = `figma_get_component_for_development` on the node
   (figma-console); **Record deliberate differences** (in the handoff document) = the
   differences between design and code, written down before generating (in the course: the "Deliberate differences" section of the handoff document,
   Day 2 Block 01; one sentence for the trainer: Atelier's own repo keeps them in a contract
   file that a check reads, and participants never open, write or check one); **Generate** (with Claude Code) = a
   prompt in Claude Code that reads the docs first (`docs-show`), one story per variant value
   and Boolean state, a `play` per behaviour; **Verify** (checks and comparison with Figma) = the agent runs the ladder checks
   (`npm run lint`, `npm run build`, `npm run check:stylelint`, the story tests) and reports
   each exit code, then the parity prompt (`figma_check_design_parity`) against the master.
   Slide names (German): "Design lesen (in Figma)", "Abweichungen festhalten (im Übergabedokument)", "Erzeugen (mit Claude Code)", "Prüfen (Checks und Vergleich mit Figma)". "Contract" survives only as the repo's internal file name (see above).
4. Glossary, inside the first 10-minute row (09:00–09:10, with the thesis), the four definitions from `docs/src/data/glossary.ts`
   verbatim (also the answer to deck TODO `D1-00-03`):
   - **LLM**: a next-token predictor that works from patterns in its training data, not
     a database of facts. Not deterministic, not infallible.
   - **Agent**: an LLM running in a loop that can call tools (read files, run commands,
     query MCP servers) and act on the results instead of only answering.
   - **Subagent**: a separate agent instance the main agent hands a focused task to; own
     context window, returns a summary.
   - **MCP**: Model Context Protocol, a JSON-RPC standard that lets AI assistants call
     structured tools on external servers instead of guessing from training data.
5. D-1 (same prompt twice, then a check): point at hex vs `var(--ui-*)`, invented vs real
   `Atl*` components, `<footer>` landmark and labelled `<nav>`. One sentence: the prompt
   is identical, the context is the only variable. Then save window (a)'s CSS as
   `workshop-angular/src/footer.css` in the scaffolded workspace and run
   `npm run check:stylelint`: red with `[RAW-COLOR]` lines. Second sentence:
   context steers, a lint rule (stylelint) catches what still slips through; this is ladder
   stage 3. Name what it does not see: it reads `.css` under the app's `src/` only, not
   inline `style=` attributes, a `styles:` array in the component, named colours or
   `oklch()`, nor a raw `<button>`, and `nx lint` does not run it. If time is
   short, cut the footer comparison to one difference, keep the check.
6. The ladder and the scorecard (09:15, ten minutes together with item 7): the slide "Five tools the agent checks
   itself with" (stage, tool, where in the two days, and the three beats: break it on purpose,
   the tool says so, the agent gets the output and repairs; D-1 just showed stage 3), then
   the slide "What a design system has to bring": walk the seven rows one by one, each with
   the block where the room meets it. The page is the map of the two days; there is no
   exercise on it. The scorecard handout is given out here. Both tables are in "The ladder
   and the scorecard" above.
7. "What you learn, what you do not" (the last minutes of the 09:15–09:25 row, no slide). `Proposal:` the
   list, since no file has one. Learn: prompting and judging instead of typing; the loop
   on an existing library, then on your own component; reading check output and a parity
   report; judging a Figma file's readiness; writing a handoff document. Do not learn:
   Angular itself; Figma design craft; prompt engineering in general; building a design
   system from zero; CI, release, publishing; Claude Code internals.

**No recap, no exercise (decided 2026-11-19).** The block has no recap row and no exercise.
Done when everyone has seen the loop and the seven scorecard rows as the maps of
the two days. Do not ask the room to name the loop; it is a map, not something to memorise.

**Watch for.** D-1 window (a) must be a plain chat with no Atelier context, and its CSS must contain a hex/`rgb()`/`hsl()` colour or the check stays green (use the pre-saved output). The scaffolded workspace for the gate step must be `npm install`ed and green on `nx stylelint` before the session. Late-comers:
run-of-show late-comer track; the thesis is the only thing not on a page.

### Block 01 · 09:25–09:50 · Verify the setup

**On screen.** `/workshop`, then each participant's own terminal via walking the room;
`.mcp.json` and `/mcp` side by side; the rescue sheet (trainer source `/troubleshooting`).

**Say.**

1. No slide for what `npm run preflight` checks, but read a run for what it is: Node ≥ 22.12,
   npm from `package.json#packageManager`, `which claude` + `claude --version`, the Figma
   Desktop Bridge, MCP reachability, ports, Playwright Chromium. Not checked: that the
   login works; preflight sends no model request.
2. Model access is not a step of this block: the seats are logged in during provisioning,
   before the course (owner 2026-11-20). It can still fail on a seat (expired login, usage
   limit); then it is the third part to name next to CLI and MCP, the seat pairs with a
   neighbour and the trainer takes it at the coffee break.
3. `.mcp.json` of an Angular scaffold has **five** servers: `atelier` (stdio, `npx atelier-mcp`,
   package `@atelier-ui/mcp` installed in the workspace; the library's docs: `docs-list`,
   `docs-show`, `docs-show-story`; no network, no port), `storybook-local` (http, fixed
   `http://localhost:6006/mcp`; the participant's own Storybook), `nx-mcp` (stdio,
   `npx nx mcp`), `angular-cli` (stdio), `figma-console` (`npx figma-console-mcp@1.40.0`,
   `FIGMA_ACCESS_TOKEN` optional). Say what each is for in one line; `/mcp` must list all
   five. `storybook-local` is connected only while `npm run storybook` runs: if its tools are
   missing, check that Storybook runs first, `/mcp` → reconnect when they still do not appear. The hosted `storybook-angular`
   entry is gone from an Angular seat. `uianatomy` left the scaffold on 2026-11-18
   (ADR-0181); a machine provisioned from an older release still lists it; no block calls
   it, so a failed entry is harmless, but log the machine. The Atelier clone keeps it (and
   its hosted `storybook-angular`) as the repo's own tooling: run the `/mcp` walk in a
   scaffolded workspace, not in the clone.
4. The prepared Figma duplicate opened here (inside the 09:25–09:35 verification pass) is **the** duplicate for both days; it
   was made once by Conciso, nobody duplicates in the room. Do not
   duplicate again on Day 2; its file key is already in `package.json` (provisioning) and is read on Day 2 Block 02
   (R-215). Bridge check: ask Claude for the Figma status; `figma_get_status` must report
   `setup.valid: true` on the duplicate.
5. Storybook `npm run storybook` on :6006; `npx playwright install chromium` if
   preflight says it is missing.
6. Decided 2026-10-14 (R-209), changed 2026-11-12: everybody, 09:35–09:50, fifteen minutes (basics and first commit) at the
   projector (trainer source `/prompts#claude-code-basics`): the workspace trust dialog on first start; permission
   prompts (what to accept: edits inside the workspace, the check commands; what to read
   before accepting: anything that deletes or installs); `Esc` interrupts; `/clear` starts
   a fresh context, `/compact` shrinks it; one session per block, not one per day; `/mcp`
   shows servers and their state; `claude -p` for a one-shot check. Trainer pages:
   `/troubleshooting#workspace-trust`, `#mcp-declined`, `#storybook-local-not-connected`.
7. First commit once preflight is green (R-210): the scaffold ran `git init` and staged
   everything, committed nothing; `git commit -m "scaffold: preflight green"` is the first
   "last green" Day 2's loop can fall back to. Everybody does it in the 09:35–09:50 row.

**Watch for.** The block has no recap row. The three checkpoints of the verification pass are all
at 09:35: rule R1 (most common failing line on the projector) and rule R2 (`/mcp`). There is
no rescue slot any more: a red seat pairs with a neighbour and you take it at the coffee break
09:50–10:05 or at lunch. Nobody continues red into Day 2 Block 01.

### Block 02 · 10:05–11:25 · Mini-loop: first success

**On screen.** `/tutorial` (trainer screen), a participant's terminal, then one parity report.

**Say.**

1. The tutorial's four stages (answer to deck TODO `D1-02-02`, from
   `docs/src/pages/tutorial.astro`; re-check the titles against the page, step 4 changed with
   ADR-0180): **Read the design** "Select the component in Figma"; **Record deliberate differences** "Write down the
   deliberate differences" (said in one sentence on Day 1, written on Day 2 Block 01);
   **Generate** "AI matches to Atelier UI components" and "AI generates token-exact code";
   **Verify**: the agent runs lint and build, then the comparison with Figma.
2. The target: Settings Card, node `936-2954`, composed from AtlCard / AtlInput /
   AtlToggle / AtlButton. No new component, no API change; composition from existing
   building blocks. The prompt is live on the trainer's page (`examplePrompt`); do not retype it
   (golden prompts §1 says why).
3. Ladder stage 2, the agent checks itself (11:00–11:10, 10 minutes, one pass, golden prompts §1a), three
   beats, each stage with what it does not see. (1) The agent runs `npm run lint` and
   `npm run build` and reports each exit code. (2) Break it on purpose: an `<img
src="/avatar.png">` without `alt` and a `<div (click)="save()">Save</div>` in the Settings
   Card; lint says so with rule ids (`alt-text`, `click-events-have-key-events`,
   `interactive-supports-focus`) and a non-zero exit code. (3) The agent repairs from the
   output, both run again. Then read the repair: did it write `alt=""`? **Green is not
   right** (lint is green, the image that carries meaning is hidden from a screen reader).
   With a current model expect a name instead: three of three repairs on 2026-11-20 wrote
   `alt="User avatar"`. The question for the room is then: is that name right, and who
   decided it? Lint is green with any text.
   What lint does not see: a raw `<button>` where a library component exists, and meaning.
   Last prompt: remove the image and the div again, run both, report the exit codes. Numbers
   for the room: lint 6–7 s, build 6–9 s warm; one headless repair run (four planted
   defects) took 78 s and 10 turns. The compiler half is named here only as "build also ran";
   its demo is Block 04 (D-4). Fallback if the agent stalls: the participant types the
   command. A failing command prints no error text in a non-TTY shell until R-248, hence "the
   full log" in the prompt. UNVERIFIED (rehearsal): that the three planted-break prompts run as
   participant prompts within the 10 minutes.
4. The proof in this block is lint and build run by the agent; `check:contracts` is not part
   of the participant path (ADR-0180), and neither is `check:stories` in this block. Exit
   code is the result; read it as `cmd > /tmp/x 2>&1; echo $?` when you run one yourself.
   One difference to have ready for the comparison below, because it repeated in every run
   of 2026-11-20: `Save` sits left in the generated card where Figma has it right (the
   footer's `primaryAxisAlignItems` is `MAX`), and it stayed left after the agent reported
   every listed difference fixed. "Compare again after the fix" on the sheet is for this.
5. The comparison with Figma, by eye (11:10–11:20, 10 minutes), no tool (`course/parity-prompt.md`,
   Day 1 section, for participants; trainer source `/tutorial`): the running Settings Card next
   to the Figma frame; everyone writes down every difference they can see (spacing, colour,
   type, a missing or extra element, a state; five minutes) and sorts each one: code or Figma;
   a long list: label the three largest; the code ones go back to the agent. Closing
   sentence: the tool for this comparison comes on Day 2, it compares what it is handed, so
   the eye stays the first check. What a parity report is belongs to Day 2 Block 04.
6. Token drift in the first draft: hand the §1 add-on line, not a re-prompt.

**Expected recap answers.** The recap asks which check the agent ran on its own work and what
it reported: lint and build, both exit codes, and after the planted break the rule ids lint
named. Differences: code, a literal that should be a token; Figma, a master value that is
simply off. Two labels only on Day 1 (owner decision 2026-10-20).

**Watch for.** The parked difference: a finding that fits neither label (a mismatch someone
chose on purpose) is parked with the line "not code, not Figma, we name it on Day 2", and is
not "fixed" in code. Bridge red at 10:25 → rule R3 (trainer reads the frame once, shares the
data; the comparison by eye needs no bridge). "Prompt, do not type": watch for people editing
the generated file by hand; send them back to the prompt.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 1 block 02: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 03 · 11:25–12:00 and 13:00–14:00 · Figma for code: is the file ready?

**On screen.** Figma desktop, the participant's duplicate: Variables panel, Components
page, Inventory page, Workshop-Templates page; `/tokens#naming`, `/tokens#pink-test`,
`/readiness`, the agent's `figma_lint_design` output.

**Shape.** One block, two parts. Before lunch (11:25–12:00, 35 minutes) the guided tour: a
5-minute opener, tokens (15), structure (15). After lunch (13:00–14:00, 60 minutes) the
hands-on part: re-entry and pink test (10), linter (10), "missing: what the agent guesses"
(15), the remaining checklist rows (10), the construction on a copy (10), recap with the
stretch folded in (5).

**Say.**

1. Three tiers in the Atelier file: **Primitives** → **Library Tokens** (the semantic
   tier; Light and Dark modes; colour, spacing, sizing, radius, typography, border-width and
   opacity variables, 143 when counted on 2026-11-20, so read the number off the Variables
   panel instead of saying one; **no shadow**, elevation is CSS-only `--ui-shadow-*`) →
   **Component Tokens** (single-mode aliases into Library Tokens). Code sees the `--ui-*`
   names; dark mode in code is the `[data-theme="dark"]` block of `tokens.css`. The
   participant's exercise: find the `--ui-*` name behind one variable.
2. Structure Claude can read: a `COMPONENT_SET` with variant axes (Figma's Component
   Property of type Variant), properties (boolean, text, instance swap), auto layout on
   every frame with children, modes. The rule that trips everyone (briefs README): a
   `state` axis in Figma is fine and common (AtlButton draws 24 of 48 combinations); the
   code's `variant` union never carries a state. States are CSS pseudo-classes and
   `disabled`/`aria-*` in code.
3. Pages: **Components** = masters, the truth; **Inventory** = instances of those masters,
   never hand-drawn; **🛠️ Workshop-Templates** = the Day 2 starters (Toast `703:341`,
   StatCard `703:348`, TagChip `703:352`, Avatar `703:355`, plus Variant Matrix /
   Scaffold).
4. The pink test (answer to deck TODO `D1-03-04`, steps from `/tokens#pink-test`): add a
   third mode "Pink Test" to Library Tokens (`figma_add_mode` via the bridge, or by hand);
   set every colour variable in that mode to one pink (`#ff00c8`, batch it); put a test
   frame with master instances on the Pink Test mode (Layer → Appearance → Variable
   modes); read the frame: anything still its original colour is a raw value or a wrong
   tier; fix the binding on the master, not the instance; delete the mode afterwards. Say
   the result aloud ("this token is not bound").
5. Ladder stage 0, the Figma linter (13:10–13:20, 10 minutes, golden prompts §1c). Everyone
   runs it twice, both prompts are on `course/figma-linter-prompt.md` (changed 2026-11-21,
   R-279 follow-up: with three real findings out of three there was nothing to sort). First:
   the agent runs `figma_lint_design` on `Inputs/AtlButton` (node `129:20`) in the prepared
   duplicate with the rules `hardcoded-color`, `default-name`, `detached-component` only and
   returns a list: exactly three, all real. Second: the same master with every rule, grouped
   by rule. Measured 2026-11-21 on the planted duplicate: 23 findings (19 on an unplanted
   file): 18 "critical" contrast failures on the label inside the hidden `_disabled-overlay`
   (the false alarm: nobody ever sees that layer; the sheet tells the participant to open the
   example layer before sorting), one about Auto Layout on the set itself (a matter of
   opinion: a component set is a canvas, not a layout), the three from the first run and the
   planted `Icon/Arrow` frame a second time as an empty container. Run it once before the
   session: the count moves with the file. Say: "a finding is something to sort, not a
   verdict". The participant sorts each group: real / false alarm / opinion. Read-only:
   nothing is changed in the file.
   Beats: break it on purpose is the file itself (the three planted defects: an unbound
   colour, a default name, a detached-looking `Icon/Arrow` frame; golden prompts §1c); the tool says
   so; the agent's output is the list. What it does not see: whether the design is right,
   spacing and radius, and its default rule set reports false alarms. Exactly three findings
   come back from the first run, all real (answer key in §1c). UNVERIFIED (rehearsal): the planting snippet has not
   run against Figma yet.
6. "Missing in the file: what the agent guesses" (13:20–13:35, 15 minutes, two slides). Each
   line is a row of the readiness checklist, Part A, read as "missing, so the agent guesses
   this". Tokens: a value not bound to a variable, so the literal lands in code; a code name
   that is not recoverable, so it guesses the name; a variable without a stated purpose, so
   it picks by value; a variable with all scopes, so no hint where it belongs. Structure: no
   Auto Layout, so padding and gap are guessed from pixel offsets; default layer names, so a
   tree of anonymous divs; layer names that differ across variants, so two different
   elements; no description on the master, so it is chosen by how it looks; a missing variant,
   so it is improvised and that is where drift starts; a label that is not a property, so the
   text is written in as a constant. The pink test and the linter have just shown the first
   row on a real master; the others are said, not demonstrated. Not on the slides: the
   accessibility-audit row of Part A and all of Part B; they stay on the handout.
7. The readiness checklist, Part A (the master), eleven checks (`docs/src/pages/readiness.astro`):
   colour/spacing/radius bound to variables; auto layout on every frame with children;
   variables scoped, not "all scopes"; each variable's code name recoverable; each
   variable says what it is for; no default layer names in the component's tree; layer
   names match across variants; the master has a structured description; variants and
   states complete and on the right axis; content decisions recorded as properties or
   with a reason; the accessibility audit ran and you read how it classified the component.
   Part B (the system: Complete, Sound, Synchronized, Extensible,
   AI-ready) is for the participant's own DS and returns on Day 2 Block 05. The linter and the
   pink test answer the rows on tokens, names and instances; the remaining rows are filled in
   by looking, 13:35–13:45 (rehearsal item: whether 10 minutes are enough).
8. Decided 2026-10-14 (R-207): 13:35–13:45 the remaining rows of the readiness checklist for
   one Atelier master (the checklist for your own Figma file is a handout, the Figma readiness
   checklist, and explicit homework for after the course; Day 2 Block 05 hands it over); 13:45–13:55 the
   micro-exercise on a copy of a master in the prepared duplicate: bind one fill to a Library
   Tokens variable, add one variant value, put one frame on auto layout, pink test on the
   copy. All three go through the agent; nothing is edited by hand in Figma (ADR-0189, owner
   correction 2026-11-21, replaces the by-hand steps of R-279). The sheet's second pink test
   prompt does the fill binding and the test; the prompt under it does the variant value (a
   second variant "ghost" in a component set of its own) and the Auto Layout frame (two
   instances, the gap bound to a spacing variable, then moved one step up the scale). The
   participant looks at each screenshot and decides. Run 2026-11-21 (Sonnet, 34 s, on a
   clone of `variant=secondary, size=lg, state=default`): the set got `variant` with
   `secondary` and `ghost`, plus `size` and `state` with one value each, taken from the
   copy's name; the gap went from `spacing/2` to `spacing/3`, the second button moved 4 px.
   The find of that run: the ghost variant lost its fill and kept its white label, so the
   label was gone on a white section. "Without a fill" was all the prompt asked. That is the
   point to make at a seat: the agent did what it was told, the participant sees it and says
   what they want. Not every run will show it; an agent may fix the label unasked. Checkpoint
   D1B03-C5 at 13:55: the copy's fill is bound and the pink test shows it.
   Seat behind: the fill binding only. Without it, Day 2 Block 01 is the first time anyone
   builds in Figma.

**Expected recap answers.** Answered from the two "missing" slides. Most often: "colour bound to variables" (the agent would have
read a hex), "code name recoverable" (the agent would have invented a token name),
"variants on the right axis" (the agent would have made `hover` a prop).

**Watch for.** No master at hand → rule R4, second Atelier master, say so. Every machine
has Figma Desktop logged in with a Conciso account, so no seat is without Figma; a seat whose
bridge or file is red pairs with a neighbour.

### Block 04 · 14:15–15:30 · Guardrails: stories as claims, and MCP

**On screen.** `/mcp` in Claude Code; two windows for D-4 (15 min) plus the workspace terminal; the scaffold workspace's
Storybook :6006 for D-5.

**Say.**

1. Open with Storybook in one minute (slide D1-04-01b, provisional draft slide, part of the first ten minutes): a story is one named state of a component; one story file has four parts (meta, args, a story export, `play`) and three readers (person, test, agent). Then a story is a claim: `args` claim a state, `play` claims a behaviour. The triangle slide:
   component = shape, story = claim, the test checks the claim. Who checks the claim:
   `check:stories` (the `storybook-test` target of the app) runs it in Chromium with axe.
   There is no contract corner and no `check:contracts` here. This slide and the MCP slide share the first ten minutes (14:15–14:25).
2. MCP in two sentences: a server exposes tools, the client (Claude Code) lists and
   calls them over JSON-RPC. Two servers for Storybook content: the library server
   (`atelier`: `docs` only: `docs-list`, `docs-show`, `docs-show-story`) and the local addon
   server (`storybook-local`: `docs` + `dev` + `test`). The five servers from Block 01; run
   `/mcp`, name them, and say the two roles: `atelier` answers for the library,
   `storybook-local` for what you build.
3. D-4 (15 minutes, with ladder stage 1): window (a) invents props; the compiler stage comes
   after the hallucination and before `docs-show`: paste the invented usage into the
   workspace and the agent runs `npm run build` (6–9 s warm). Beats: an invented value
   (`variant="ghost"`) breaks the build with `TS2322` and the list of allowed values; a bound
   invented input (`[shadow]="'lg'"`) breaks it with `NG8002`; the tool output goes back to
   the agent. What it does not see: the same invented name as a static attribute
   (`shadow="lg"`) and an invented event (`(pressed)`) build clean. Line for the room: the
   compiler catches a wrong value, not an invented name; that is why `docs-show` comes first
   and Block 05 asks for receipts. Then window (b), in the scaffold workspace, calls
   `docs-list` then `docs-show` for `components-inputs-atlbutton` through `atelier`. AtlButton's real inputs: `variant`, `size`, `disabled`,
   `loading`, `type`. No `shadow`, no `rounded` → "not documented" is the correct
   answer. Angular-shaped reply expected; a React-shaped one (JSX, `children`,
   `on*Change`) is a regression, note it.
   Then, in the same 14:40–15:00 row at about 14:55 (provisional draft slide D1-04-04b, no minutes of its own, source `tasks/story-fields-spike-2026-11-20.md`): with the `docs-show` output still on every screen, point at a line and say where in the story file it came from. On the Button entry from `atelier` the description opens with the library's purpose line and the JSDoc is the paragraph after it; in a participant's own Storybook it is the JSDoc alone. It uses the last minutes of the `docs-show` row (the old stretch round is gone).
4. D-5 in the scaffold (ladder stage 4): the template story `AtlButton` → `Primary` has a `play` that
   clicks and expects the text `clicked`. Change `getByText('clicked')` to
   `getByText('never')`, save, Interactions panel red; fix, green. The sentence: a
   `play` that never failed claims nothing. What stage 4 does not see: anything without a
   story, dark mode (axe runs in light mode only), a keyboard path no `play` walks.
5. The exercise: one story with a `play` for a variant, red once, then green, prompted
   with the template story (`AtlButton`) as context (decided 2026-10-14, R-216). The local
   server is part of the course from here: the agent calls `get-storybook-story-instructions`
   before it writes the story and runs `test-run` through `storybook-local` on it, so it sees
   the red itself; the participant watches the same red in the play panel, fixes by prompt,
   green. `test-run` through `storybook-local` on a seat: verified headless 2026-11-18 (R-262); the interactive run is open in R-040.
   The participant prompts for the whole row are on `course/day1-stories.md` (parts 1 to 3; in the scaffold since the release after 0.4.17).
6. Be exact about what the MCP buys on a seat (spike of 2026-11-20): asked to build the Team
   directory without the docs server, the agent invented nothing. It read the installed
   package's manifest and type exports with 14 shell commands and got the same API. So in a
   workspace with the package installed, the difference is cost and reviewability (one
   `docs-show` call a person can read against, instead of a trail through `node_modules`),
   not correctness. The hallucination in D-4 is real where the agent has no package to read:
   a browser chat, a new repository, a library that is not installed. Do not promise the
   room that the agent "would invent props without MCP" on their seat; it will not.

**Expected recap answers.** "A story claims a state and a behaviour; `check:stories`
runs the claim in a browser with axe; the build catches a wrong value, not an invented name." Stretch: "not documented" is right because the manifest is the API; an
invented prop would compile nowhere.

**Watch for.** Rule R5 at 14:55 (`docs-show` on every seat) and 15:15 (red seen). Take
time from the buffer (15:30–15:40), never from the red-then-green row. D-4 down → saved screenshots.
`atelier` not connected on a seat: `/mcp` → reconnect; still red: pair with a neighbour.
`storybook-local` not connected: Storybook is not running; start it (the tools appear on
their own), `/mcp` → reconnect is the fallback; the play panel shows the same red meanwhile.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 1 block 04: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 05 · 15:40–17:15 · A screen from Storybook, against the clock

**On screen.** `course/day1-team-directory.md` (trainer copy `/screen-from-storybook`), the timer, then one volunteer's receipts list.

**Say.**

1. Why this block: most customer teams do not build components, they write application
   code against components that already exist, and the only thing they know about them is
   what Storybook says. No Figma frame, no steps. `course/day1-team-directory.md` gives the brief (a Team
   directory: search field, role select, invite button, table with a status badge per row,
   pagination), a starter prompt, the checks and the clock. Hints only as "which
   `docs-show` line says that?".
   Opener, inside the same 5 minutes: run one live `docs-show components-display-atltable` through `atelier`
   and show where things live (measured 2026-10-20, Angular): the usage example in the
   description (it renders as code since the JSDoc fix of 2026-10-20), the Inputs block
   (only `aria-label`, `size`, `stickyHeader`, `variant`), the first three stories with
   code, the rest under "Other Stories" by name only (`docs-show-story` with the id).
   React and Vue differ: no description or usage example (no component JSDoc), React
   shows Default, Striped, Bordered, Vue shows Empty State, Sticky Header, Playground
   (the first three with a snippet). `Sortable` is reachable only through
   `docs-show-story` on both, `Empty State` on React too. This is the probe; there is no
   separate one, and it stays inside the 5 minutes. The section "What the
   Storybook MCP gives you, and what it does not" has the same walk-through on the trainer's `/screen-from-storybook`.
2. The four rules: look before you write (`docs-list`, then `docs-show`, before any
   code); every prop has a source in the `docs-show` output or `docs-show-story`; no
   hand-built element where the library has a component; no raw colours, only `--ui-*`
   tokens in a plain `.css` file.
3. Closing checks, run by the agent (golden prompts §1b closing prompt), as exit codes:
   `npm run lint` (on Angular it includes the two Atelier
   template rules: an icon-only `atl-button` needs a name, `atl-option` needs its
   `atl-select`; the table parts are not in the rule's list), `npm run check:stylelint`,
   `npm run check:format` (`npm run format` only as the fix when it fails); on Angular also
   `npm run build` (strict templates fail on an input the component does not have; the
   Vue build skips type checking and the React build is Vite, so there only the receipts
   audit catches an invented prop). The agent reports each exit code and repairs from the
   output; then the receipts prompt. If the agent stalls, the participant types the
   command. The slide "What the checks do not see" keeps its content; its note says the
   agent runs them. Name the limits out loud: stylelint reads only
   `workshop-<fw>/src/**/*.css`, so a colour in an inline `style`, an Angular `styles`
   array or a Vue `<style>` block passes it; inside the css file it flags hex, rgb and hsl
   but not named colours, `oklch()` or `color-mix()`, and it flags a spacing literal only
   when a token holds the same value, so `padding: 13px` passes; nothing detects a
   hand-built twin of a library component; and no check looks at the running app for
   accessibility. `check:stories` renders stories, not the
   app; the stretch task (a story for the screen, then `check:stories`) is how a screen
   gets an axe run.
4. The audit: the receipts prompt (in `course/day1-team-directory.md`) makes the agent print the `docs-show`
   passage behind every prop. Participants spot-check three and mark where each import name came from. Green checks say the code is
   clean, not that it is honest. Debrief, 16:45–17:10, on two volunteers' receipts; one question is
   fixed: where did the agent get `AtlThead` and `AtlOption` from when `docs-show` never names them?
   Expected answer: it read the package's type exports under `node_modules/@atelier-ui/angular`, or got the
   names from a compile error. The point for the room's own design system: a manifest that documents
   the tag but not the import sends the agent off the documented path; put the import line into the usage example.
   Then the second list (16:30–16:45, "What nobody looked at" on the sheet): the agent lists
   what it claimed without running or seeing it, and every participant checks three lines by
   hand: holds, does not hold, or the brief does not say. This is the discovery of the block
   on a seat where everything is green. Measured 2026-11-20 on a finished Team directory:
   16 checkable lines (no browser was opened, the mount and the tokens import were never
   seen, page reset after a filter change, combined filters and the last page were untested,
   `Invite member` has no handler, dark mode, narrow width and keyboard unseen).
5. The fifth known gap (measured on the Angular endpoint 2026-11-12, not for React and Vue):
   `docs-show` shows the sub-component tags (`atl-thead`, `atl-option`) but neither the class
   names to import (`AtlThead`, `AtlTbody`, `AtlTr`, `AtlTh`, `AtlTd`, `AtlOption`) nor the
   package name; the story snippets import from `./atl-table`, the library's internal path.
   The block's premise "`atelier` is the only source" has this one named exception:
   the names come from the package's type exports in `node_modules/@atelier-ui/angular`, the
   import is from `@atelier-ui/angular`, and the receipts say so.
6. No machine homework (D7, 2026-11-12): the course machines stay in the room. The kata
   `/first-component` and its bridge exercise are no longer participant material (ADR-0184);
   do not offer them at 17:25. An unfinished
   screen stays in the workspace, which is still there on Day 2. The checklist for your own
   Figma file is homework for after the course (Day 2 Block 05 hands it over), not for tonight.

**Expected recap answers.** The recap asks which "not verified" line turned out wrong when
looked at, and which check would have caught it. Typical: the page does not go back to 1
when a filter changes (a story with a `play` would catch it), the invite button does nothing
(the brief does not say what it should do: a question for whoever wrote the brief), a
search that matches nothing shows an empty table without a message. On a seat with the
start prompt and a current model, expect no broken rule on the first pass (two of two runs
on 2026-11-20 were clean); the older expectation below describes a weaker agent or a seat
that skipped the start prompt. The agent broke rule 2 first (a prop or an input on a table
part or `atl-option` that `docs-show` does not list on the main entry: the Inputs block
never lists sub-component inputs such as `sortable` on `atl-th`; on Angular they are in the usage
example, everywhere in the `Sortable` story, which the opener now points at) or rule 3 (a
hand-built badge or card); `npm run build` on Angular, the template lint rules, the
receipts audit or the participant's own reading caught it. Stylelint catches a hex, rgb or hsl
colour in the `.css` file; nothing but the greps on the page catches one elsewhere, or a
named colour or pixel spacing anywhere.

**Watch for.** The first 15 minutes of the build (15:45–16:00) are silent: note who asks what and whether an agent invents a prop or a component at all (do not wait for it; the "not verified" list is the block's discovery either way); hints start at 16:00. Hard stop 16:30 (rule R6). Measured 2026-11-12, one headless run on the trainer
machine without permission prompts: build 195 s, the four checks from a cold cache 20 s,
receipts prompt 39 s. UNVERIFIED is how long a participant needs to approve, read and
judge; the dry run logs it. If most seats are still on the table at minute 20 of the
build, cut the invite button and the status badge column from the brief on the page, not the checks. Agents invent a search-bar or layout component,
forget that a filter change must go back to page 1, and put styles in an inline array. The
`docs-list` entry "cookbook" lists a "Data List with Actions" story, but `docs-show-story`
returns no code for it (checked 2026-10-20 on the Angular endpoint), so it does not hand
over the answer.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 1 block 05: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 06 · 17:15–17:30 · Recap and exit ticket

**On screen.** Whiteboard, the briefs (`course/briefs/`; trainer copy `/briefs`).

**Say.** Three questions for the five-minute discussion: where did the AI guess, and
which guardrail caught it; which check output did you read, which did you skip; what
would you check first tomorrow. The four briefs in one line each (Day 2 Block 00 has
the detail). No machine homework: the course machines stay in the room. Take the brief and
sketch it on paper if you like; the readiness checklist for your own Figma file
(Block 03) is a handout; Day 2 Block 05 starts it. The kata `/first-component` is not participant material (ADR-0184). Exit ticket: one
sentence, paper or spoken.

**Watch for.** Everyone names a brief aloud; undecided → Toast.

---

## Day 2: build your own component

### Block 00 · 09:00–09:30 · Recap, brief, skills

**On screen.** Blank for the recall; the chosen brief (`course/briefs/<name>.md`); a scaffolded workspace for D-7 (5 min:
`.claude/skills/atelier-component/SKILL.md`, then Claude Code); then the projector with two
more files of the workspace: `CLAUDE.md` and `.claude/settings.json`.

**Say.**

1. Active recall, ten minutes, the room answers: where did the agent guess on Day 1, and
   what stopped it; by eye, which differences were code and which Figma; which rule did the
   agent break first on the Team directory, and what caught it; why is a story a claim, and
   what happens to a variant no story renders.
2. The briefs: what a finished component owes (anatomy, axes, states, a11y obligations),
   not how to draw it. Provenance matters: Toast and Avatar are transcriptions of a
   canonical uianatomy record; TagChip (`tag-input`'s `tag`/`tag-remove` + `badge`) and
   StatCard (`card` + `badge`) are **compositions**, there is no canonical chip or stat
   card. That is the lesson: a canonical vocabulary tells you when you build a known
   thing and when you assemble one.
3. The shared rules all four briefs follow: two variants and the states the brief names, no
   more (TagChip has no second state, R-280); start from
   the starter frame; never mutate the original file; bind tokens, do not type values;
   elevation is CSS-only; a `state` axis may exist in Figma, never in the code union;
   colour is never the only signal. Scope per brief: **Toast** `success`/`danger` ×
   `open`/`closing`; **Avatar** `circle`/`square` × `image-loaded`/`initials-fallback`;
   **TagChip** `default`/`success` with `removable: true`; **StatCard**
   `elevated`/`outlined` × `delta-up`/`delta-down`.
4. Only if someone asks where the briefs come from: they are transcribed from uianatomy, a
   public anatomy reference. The course does not call it (ADR-0181: its hosting is not
   reliable enough for a live block). The four records were last reviewed 2026-05-04/05: a
   strong prior, not scripture.
5. Skills: a skill is a `SKILL.md` Claude loads when the task matches its description. In
   the workspace: `atelier-component` (the loop for this workspace; carries Blocks 02–04),
   `figma-workspace-architect` (Figma workspaces only; structural Figma work, Block 01), the
   four Storybook skills. D-7 (5 minutes) shows it on `atelier-component`'s own file. How you
   notice one triggered: Claude says it is reading the skill, and the tool calls that follow
   match it. How you notice it did not: it guessed instead of calling the tool; then name the
   skill in the prompt. Not in the workspace, do not show: `design-to-code`,
   `atelier-design`, `artboard-bridge`.
6. D-7, in a scaffolded workspace: open `.claude/skills/atelier-component/SKILL.md`, mark
   `name` and `description` (the description is all Claude sees until the task matches; the
   body is the procedure), then every seat asks "Which skills do you have in this workspace, and when would you load each? Only list them."
   Checkpoint D2B00-C2: every answer names `atelier-component`. Fallback:
   `ls .claude/skills/`, the folder is the truth. The description says writing a contract is
   opt-in, not part of the loop: if asked, one sentence ("Atelier's own check, the last and
   optional rung"), move on. That the answer lists the skills (check 9): verified headless 2026-11-18 (R-262); the interactive run is open in R-040.
7. What the agent reads here, and the line your team would add (09:20–09:30, 10 minutes:
   5 on the projector, 5 exercise; ladder "wiring"). Projector, 5 minutes, the four things an
   agent gets in this workspace: the rules file (read every session), a skill (loads when the
   task matches; shown in D-7), an MCP server from `.mcp.json` (tools and data), a hook (runs
   without being asked). Open two files: `CLAUDE.md` → "Definition of Done";
   `.claude/settings.json` → `hooks.PostToolUse` → `.claude/hooks/format-edited.sh`. Then the
   trainer demo, once: (1) ask "Which commands does this workspace's Definition of Done list?
   Only list them." (six); (2) delete the line
   ``- `npm run check:stories` — every story, rendered in Chromium, axe-checked`` from the
   list, save, leave the count word; (3) `/clear`, ask again: five commands, `check:stories`
   is gone; (4) put the line back (undo), save. Line for the room: the agent runs what the
   list names, and a check that is not in the list is a check nobody asked for. Trainer:
   `/verify` has its own list in `.claude/commands/verify.md` and still runs six. Close the
   projector part with the slide "CLAUDE.md asks. A hook enforces." (D2-00-06b, no minutes of its
   own, inside these 5 minutes). Exercise,
   5 minutes, the recap question closes it: everyone asks the first question, then writes down the one line their own team
   would add, in the same shape (the command, a dash, what it proves); think of the thing your
   reviews keep catching by hand. Neighbour check: a command that exits non-zero when it fails,
   or a wish ("the code is clean")? Checkpoint D2B00-C3 at 09:30: every seat has one written
   line with a command in it, and the neighbour has said command or wish. Participants do not
   edit `CLAUDE.md` in this row. That the two answers differ as described after `/clear`:
   verified headless 2026-11-18 (R-262); the interactive run is open in R-040.

**Expected recap answers.** The recap (the last minutes of the exercise row) asks where the team's check commands go so that the
agent runs them: the rules file's "Definition of Done" (`CLAUDE.md` or `AGENTS.md`), plus a
skill and a hook for the recurring task; how you would notice it did not read them: the
second answer lacks the command, or the agent skips the check. Skills as before:
`atelier-component` on "build/generate the component"; `figma-workspace-architect` on
"structure the Figma master".

**Watch for.** A missing skill is copied from a neighbour, logged, never re-scaffolded.

### Block 01 · 09:30–11:00 · Design in Figma and the handoff document

**On screen.** Figma desktop; `/build-your-own#block-01`; the filled handoff document (`course/handoff-example.md`; trainer copy `/design-to-code#handoff-example`).

**Say.**

1. The prepared duplicate on the machine is the one copy used on both days (R-215); do not duplicate again. Confirm the bridge is on it: Claude reports
   `figma_get_status` with `setup.valid: true`. Nobody continues red.
2. The set is built through the agent, 20 minutes (09:35–09:55). Nothing is drawn or edited
   by hand in Figma (ADR-0189, owner correction 2026-11-21): the agent writes, the
   participant chooses the brief, looks, compares with the brief and decides. The prompt is
   on `course/day2-prompts.md`, Block 01 "build your component set through the agent" (the
   prompt of the 2026-11-20 test run, four of four briefs; its agent time on a seat is a rehearsal item). It works on a copy
   of the starter and does in one run what the old build order did by hand: the `variant`
   axis with lowercase values as the code union will be, the states the brief names, the
   Boolean properties, every fill, radius, padding and gap bound to a Library Tokens
   variable, Auto Layout, a Dark check, the description (out of scope, the a11y items tagged
   "(full component)", the shadow as CSS-only, the behaviour the brief names). That list is
   what you walk the room with: does the set on the seat have each of them? Then the
   participant selects the set and steers: one change per prompt, with the steer template
   under the build prompt, so that each screenshot shows what that one change did. Run
   2026-11-21 on a TagChip set (28 s): "the remove button is too close to the label" became
   the gap one step up the scale (`spacing/1` to `spacing/2`), still bound, on both
   variants. The agent's own caveat is the thing to point at: a frame has one gap, so the
   space between the severity prefix and the label grew with it. Two or three rounds are
   normal. A seat that has nothing to steer compares the set with the brief line by line.
3. MCP structuring (20 min, 09:55–10:15): `figma-workspace-architect` is the co-pilot; the
   tools that matter are `figma_add_component_property`, `figma_analyze_component_set`,
   `figma_audit_component_accessibility`, `figma_set_description`. Ask Claude for the audit
   and read it; the bridge must stay connected. The prompt is on `course/day2-prompts.md`,
   Block 01 "make your component set machine-readable" (R-277): it does not redraw the set,
   it binds, structures and describes what is selected. After a build through the agent
   this pass is a check, and a short "changed" list is its result: the build held. Run
   2026-11-21 on the steered TagChip set (23 s): nothing changed; the "could not bind" list
   named a zero padding and gap (no `spacing/0`), the font family and the inside of the icon
   instance. On an earlier run the same prompt found a gap of 7 with no variable and an
   unbound fill. That list is the participant's decision: onto the scale, or into the
   handoff document. A pass that finds nothing is not wasted time; say so, or the room reads
   it as a tool that did nothing.
4. Ladder stage 0 on your own component set (10:15–10:20, 5 minutes): the same prompt as Day 1
   Block 03 (golden prompts §1c) on the participant's own component set; real findings are
   fixed before the handoff document, false alarms are noted. Say again what the linter does
   not see: whether the design is right, spacing and radius.
5. The handoff document, nine items, one example line each from the Toast example:
   file URL + node id; variants and states built (`success`, `danger` × `open`,
   `closing`); token bindings (`color/surface-raised`, `radius/md`, `spacing/*`); reuse
   vs rebuild (close button = AtlButton icon-only, not a new button); behaviour from the
   brief (Escape dismisses, timer pauses on hover: documented, not built); exclusions
   (`info`, `warning`, the six positions, stacking); target files
   (`workshop-<fw>/src/…`); acceptance criteria (lint and build exit 0, a story per
   variant and state, axe clean); and the ninth item, **Deliberate differences**: what the
   code will do differently from the design on purpose, and why (a `State=Hover` variant in
   Figma is `:hover` in CSS, not a property; a Figma Boolean "Show icon" is a slot in
   code). This is agenda step 2 and loop step 2, "Record deliberate differences". A checklist,
   not a template. Short on time: node id, variants, exclusions, deliberate differences first.
6. The "LLM-friendly API rules" row (10:20–10:35, 15 minutes), directly before the handoff
   because the handoff fixes the prop names: about 5 minutes on the four rules (predictable
   naming, literal unions, composition over config, no hidden defaults), about 10 on a short
   exercise on the own component: the prompt on `course/day2-prompts.md` (Block 01, the API
   rules; R-277) lists each property with its name and values, checks the list against the
   four rules and renames nothing. The participant decides per line: have the agent rename it
   (the rename prompt is under it on the sheet), or keep the brief's name and write the
   reason into the handoff document's Deliberate differences. Run 2026-11-21 (5 s):
   `success` became `positive` by renaming the one variant; the "Success:" text on the chip
   and the `color/success-*` tokens kept the old word. A rename changes the name, not what
   the set shows; the sheet says so, and whether the old word may stay is the participant's
   call.
   The exercise has no done-when of its own; its result is the property list the handoff
   document takes over. Expect few renames: the brief fixes the names (four of four runs on
   2026-11-20 renamed nothing). The find is where the brief's own name bends a rule; two runs
   of the sheet prompt on the StatCard set (2026-11-21) both named `state` holding a data
   direction (`delta-up`/`delta-down`) and `hasDelta` as a switch that should be a slot.
   Avatar: `variant` where the library says `shape`. The handoff row is 10:35–11:00 (25
   minutes, the recap question closes it). Block 02 does not have the rules.

**Expected recap answers.** Lines you decided: reuse vs rebuild, exclusions, acceptance
criteria, the deliberate differences. What the AI would have guessed: prop names, the position values, a shadow
variable, a `state` prop.

**Watch for.** Rule R7 at 09:55 and 10:15 (give MCP time to the build row, never cut
the handoff). Bridge drops → `/runbook#stale-instances`: without the bridge nobody on that
seat can change the set, so a dropped bridge is the first thing to fix, not the last. A
seat that reaches for the Figma UI to "just fix it": back to the prompt, one change per
prompt. Walk the room with the list in item 2, not with Figma theory. `Verify in rehearsal` (R-214): a free-plan Figma account keeps the Dark mode in
a duplicated file and can import the dev plugin.

### Block 02 · 11:15–12:30 · Component and stories from the handoff

**On screen.** Terminal (`/mcp`, tool list), a participant's running Storybook, then one
participant's `docs-show` output before and after the JSDoc edit.

**Say.**

1. The local Storybook MCP (11:15–11:20, 5 minutes): start `npm run storybook` if it is not
   running; `/mcp` shows `storybook-local` connected; check `get-storybook-story-instructions`,
   `stories-preview`, `test-run` are listed. Not connected means Storybook is not running on
   :6006: start it, `/mcp` → reconnect when the tools still do not appear. Nobody types a server
   in; there is no `claude mcp add` step. `get-storybook-story-instructions` before every
   `*.stories.*` edit.
2. The contract file, one sentence (ADR-0121): Atelier's own repo keeps the deliberate
   differences between design and code in a contract file that a check reads (the master's node
   id and only the mismatches chosen on purpose). Nothing about it on the projector;
   participants do not open, write or check one. Theirs are the "Deliberate differences" of the
   handoff document.
3. Start a fresh Claude session for this block (`/clear`). Paste golden prompt §2.1 (no
   contract) with the handoff document inside; the handoff's deliberate differences go into the
   prompt as they are. Plan mode: the plan asks questions and proposes things the handoff
   document does not contain (measured 2026-11-20, four of four briefs: an extra `closed`
   output, a role the library card cannot carry, a decorative avatar). A plain "build it"
   approves all of them. Line for the room: answer each of the plan's questions in words,
   yes or no, before you approve; the plan is the cheapest place to say no. One step: component with its test, and stories; one story per variant
   value and Boolean state, a `play` per behaviour line. Then the participants look at the
   result: every story open in the running Storybook (or `stories-preview`), compared by eye
   with the Figma master, what is wrong handed back to Claude by prompt, never typed. That is
   the 45-minute row (11:20–12:05). The generation prompt (§2.1) is also printed on
   `/build-your-own`.
4. What the agent can read about your component (12:05–12:15, 10 minutes, golden prompts
   §2.5): `docs-list`, then `docs-show` on your own component through
   `storybook-local`, read as an agent that has only this text. The agent has usually written
   the JSDoc while it generated, so the three closed categories (no component description, a
   property without one, a value set shown as a bare alias) come back clean (four of four
   runs on 2026-11-20). The open question finds eight to ten other gaps each time: story
   snippets that would not compile as shown, a value whose effect is stated nowhere, an
   import path that only resolves next to the component file. The participant sorts the list
   (a gap in the documentation, or a gap in the component); Claude closes the documentation
   ones in the JSDoc or the story; call `docs-show` again and compare. Fallback without the MCP:
   `npx storybook tools --config-dir workshop-<fw>/.storybook --json docs show --input '{"id":"<id>"}'`.
   Measured 2026-11-18 on the 0.4.10 Angular scaffold through that CLI route: a new component
   with a story appears in `docs list`; `docs show` prints Inputs and Outputs, the JSDoc line
   where one exists and nothing where none does. The same call over the
   running local MCP, and the refresh of the entry after a JSDoc edit without a restart (about
   1 s, by direct JSON-RPC, not through the agent): verified headless 2026-11-18 (R-262); the interactive run is open in R-040.
5. Look at both (12:15–12:25, 10 minutes). First demo **D-3**, about two minutes, on one green
   seat or the trainer machine: a story with the Design panel open (`@storybook/addon-designs`)
   shows two entries, the Figma frame as embed and a PNG of the frame. The `atelier-component`
   skill puts both into the story meta (`parameters.design`) when the handoff document names a
   Figma source: the link from its Source line, and a PNG exported through figma-console
   (`figma_take_screenshot`) and saved next to the stories. The embed may ask for a Figma
   login; the PNG shows without one and is a dated snapshot. UNVERIFIED (rehearsal): that the
   embed loads for a private duplicate in a logged-in browser on a seat; the PNG is the
   fallback that does not depend on it. Then everyone looks at their own stories next to the
   Figma component, every variant and state, and writes the differences down as a list
   (Block 04 sorts it). One pass; the steps are on `course/day2-prompts.md`, "Block 02: look
   at both" (R-283): Tab once for the focus ring, the width, the shadow, do not sort or fix.
   It is the only step that finds what a green check does not measure (test run 2026-11-20:
   a focus ring touching the label, a card as wide as its container, a barely visible
   shadow). The section ends with the commit and "leave this session open over lunch". No `figma:snapshot`, no `check:contracts`, no finding codes
   in this block.
6. Trainer note: the `atelier-component` skill no longer has a contract step (scaffold release of
   2026-11, commit 8c8fdf6a); the contract is an optional trailing section there, and nobody on
   a seat is coached through it.
7. `tags: ['autodocs']` on the generated story, or there is no Docs tab.
8. `/verify` in Claude Code runs all six checks (`check:format`, `check:stylelint`, `lint`,
   `build`, `check:unit`, `check:stories`); since 2026-11-17 it is the proof line of
   the end-of-day checklist, not a Block 02 target. Formatting and CSS lint, the two the
   agent first ran in Day 1 Block 05, are cheap and mechanical: fix by prompt.

**Expected recap answers.** The recap asks what `docs-show` did not know about the component and
where it was written down: a snippet that would not work as shown (fixed in the story), the
effect of a variant value or an undocumented default (written as JSDoc in the component), a
behaviour nobody decided (a note for Block 03, not a documentation fix).

**Watch for.** Rule R8 at 11:20. Rule R9 at 12:05 (checkpoint D2B02-C3): at 30 percent
without a rendering story, take one stalled seat's handoff document onto the projector,
find the missing line with the room, re-run the prompt, and show the `docs-show` row as a
trainer demo on one green seat. A stalled seat: check the handoff document first, not the
prompt. Checkpoints: D2B02-C2 (11:50) component and stories on disk; C3 (12:05) renders with
one story per variant value; C4 (12:25) `docs-show` ran on the own component and at least one
gap was closed, each on ≥ 70 %.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 2 block 02: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 03 · 13:30–14:30 · Iterate: prompt quality and the self-healing loop

**On screen (trainer pages; the four things to paste back are on the slide and in `course/day2-prompts.md`).** `/prompts#rubric`, `/prompts#stuck`, `/design-to-code#self-healing-loop`,
a volunteer's loop.

**Say.**

1. The six checks (`docs/src/pages/prompts.astro` `RUBRIC`), names and meaning: **Source
   named** (node id or handoff document); **Scope guard** (only what the design shows,
   missing things go in a question list); **Plan first** (plan mode, read the plan before
   any code); **Done stated** (what proves this task done beyond `/verify`); **One change
   per round** (a revision fixes one named problem and says which finding it answers);
   **Fix in the right place** (one-off into the next prompt, a recurring mistake into
   CLAUDE.md or the skill with its reason, a never-event into a lint rule or hook).
   Docs-first and token rules are not in the rubric: the skill and stylelint carry them
   (ADR-0183). Everyone scores their Block 02 prompt; the
   failed check is the reason stated on revision (the done-when), and the revision is of the prompt or the context.
2. Correction prompts by symptom (golden prompts §4 index): invented prop → §2.2;
   hardcoded value or missing shadow → §2.3; structural content in the wrong place
   (Undo as inline link, remove as styled span, StatCard as card over invisible button,
   Avatar as two components) → §2.4 with the brief's §5 row; token drift anywhere → §1
   add-on.
3. The self-healing loop (the slides call it "Prüfschleife", verification loop, Anthropic's term; loop step 4 when it is red; owner will revisit its content): run the check → read the exit code and the **first** error →
   paste the four things (slide, `course/day2-prompts.md`; trainer source `/prompts#stuck`) (exact error, exit code, what you expected,
   what changed since green) → one change → rerun. Stop rule: two failed fixes → stop,
   re-diagnose from the failing story, not from the prompt.
4. Decided 2026-10-14 (R-210): commit when the stories are green
   (`git add -A && git commit -m "<step>: green"`); after two failed fixes stop, go back to
   the last green commit with `git reset --hard HEAD && git clean -fd -- workshop-<fw>/src` (preview:
   `git clean -nd -- workshop-<fw>/src`), then re-diagnose before the next prompt; no
   third patch. On "red on purpose" the reset also takes the new story and the handoff line
   (they are younger than the last commit): the seat pastes the first prompt of that section
   again. The sheet has the participant commit before that section for this reason. Unconditional since 2026-11-17 (R-242), as the customer agenda says it. R-226 (2026-10-20): a bare `git checkout -- .` leaves the files the
   agent newly created (untracked), so the checks stay red; `git stash -u` was rejected
   because it also stashes unrelated untracked work and leaves a stash to explain; the
   `clean` is scoped to the app's `src/` and never `-x`, so unrelated files survive.
   Commit points: Day 1 Blocks 02, 04, 05 and Day 2 Block 02 (the recap rows). The scaffold runs `git init` and stages,
   commits nothing (`preset.ts` ~L2279); the first commit is Day 1 Block 01's. Rows:
   10 rubric, 10 revise with the correction prompts (C2 at 13:50), 10 test-loop demo, 25 self-healing
   loop with pasting the error back instead of debugging yourself (C4 at 14:15), 5 recap with the stretch for early finishers folded in;
   the block ends 14:30, coffee 14:30–14:45.
   What fills the rows on a green seat (exercise test run of 2026-11-20: Block 02 ended
   green on four of four briefs, so nothing waits to be corrected): the three steps under
   "Block 03" in `course/day2-prompts.md`, golden prompts §2.7. Revise row: "What was red on
   the way" (the agent marks each repair "fixed" or "went around") and "Is the handoff
   document still true?". The first one needs the session that generated the component: it
   was left open over lunch, a closed one is resumed with `claude --continue` in the
   workspace folder (on the sheet). The list is the agent's account of itself, so the sheet
   holds two commands against it (R-281): `git show --stat HEAD` (what the Block 02 commit
   touched; a config file is a changed rule) and a `git grep` for disable comments and
   skipped tests (checked 2026-11-21 on the TagChip run: it finds the
   `eslint-disable-next-line @angular-eslint/component-selector`). Neither finds a renamed
   selector or a removed assertion: say so. The handoff question is two prompts now: the
   agent lists the lines that no longer hold and says for each "correct the document" or
   "correct the code" (run 2026-11-21: a numbered list, nothing changed); the participant
   decides; a second prompt corrects only the numbers handed back. One prompt that lists and
   rewrites lets the agent rewrite the specification to match whatever it built. Self-healing row: "Make it red on purpose" (one variant or state
   out of "Explicitly out", story first, red, then the loop above). The red already happened
   in Block 02 and the agent repaired it unseen; the first prompt makes it visible. The
   usual find on Angular: the seat's lint rule wants the selector prefix `app`, the course
   convention is `atl-`, and the agent renamed the selector or wrote a disable comment
   (four of four runs). "Fix in the right place" is the prefix list in the ESLint config,
   and that is a person's decision. The scaffold keeps this friction on purpose (ADR-0188).
5. The test loop (ladder stage 4: the agent runs `test-run`, gets the failure, repairs): `test-run` over the local MCP = `npm run check:stories`
   (every story in Chromium, `play`, axe). `npm test` / `check:unit` is the jsdom
   half only. Never two `storybook-test` at once (shared browser port). In a
   generated workspace the Nx project is `workshop-<fw>`, not `<fw>`: use the npm
   scripts (R-228).
6. Tokens, at the end of the self-healing row (by 14:25; the skill and stylelint enforce them, this is the manual check): ask Claude to grep the component's files for `#[0-9a-f]{3,8}`
   and `[0-9]+px` and replace each hit with the matching `--ui-*` name read from
   `tokens.css`, then report the lines.

**Expected recap answers.** The recap asks what was changed in the prompt or the context, and
which red line was the reason. "The agent silenced the selector rule with a disable comment →
I added the prefix to the lint config and one line to `CLAUDE.md`: a rule is changed in its
config, by me." "It deleted the hover assertion to get green → the assertion is back and the
prompt says: never remove an assertion, report it." "Read the plan first → the invented `rounded` prop was a line of plan, not a red story."
"Added the scope guard → it stopped adding the six positions." "One change per round →
I could tell which change fixed the red story."

**Watch for.** Rule R10 at 13:50 and 14:15 (one shared revision on the projector). A seat
typing code by hand: back to the prompt. The golden prompts are the rescue sheet: paste one or hand it to a stuck seat, never
as the thing to copy.

### Block 04 · 14:45–16:00 · Verify: a11y, states, parity

**On screen.** `/a11y-workflow#a11y-in-the-loop`; a participant's Storybook a11y panel
and theme toolbar; a participant's parity report.

**Say.**

1. "A quiet report is not a clean component": a report is only as strong as the
   sections it names, and axe only sees what renders in light mode.
2. The three-step a11y check, in order, each result reported before the next (golden
   prompts §3.1): `figma_audit_component_accessibility` on the node (bridge);
   the Storybook a11y panel (axe-core, the same engine `check:stories` runs); a keyboard
   walk (Tab, Shift+Tab, Enter, Space, Escape), done by the participant by hand, not scripted
   by the agent. Read how the audit classified the component, not only the score: on
   2026-11-20 it returned 100 out of 100 on all four briefs, each classed "presentational",
   with the focus-indicator and target-size checks skipped. The keyboard walk was the only
   step that found something real (the Toast's tab order). Fix only the brief's obligations tagged
   **(this block)**; the **(full component)** ones go into the master's description, not
   into code that claims a check it never ran.
3. States: hover, active, disabled are CSS, never a variant; no `transform` on hover or
   press (`plan/design-principles.md` §1); after the fixes the keyboard walk is done again and
   every state is looked at: hover, active, focus, disabled; the focus ring comes from tokens.
   Do not teach one fixed disabled treatment: most library components dim with
   `--ui-opacity-disabled`, the button uses dedicated neutral tokens (ADR-0159), and three of
   the four briefs have no disabled state at all.
4. Dark mode: the **theme** control in the Storybook toolbar (`withThemeByDataAttribute`,
   sets `data-theme`, the selector `tokens.css` switches on). The **backgrounds** control
   is canvas colour, not a theme (ADR-0142). Golden prompt §3.2 names the theme control
   since 2026-10-14 (R-205). Axe runs in light mode only: the toggle is a preview, not
   coverage. Two confirmations per §3.2: every colour through `--ui-*`, no transform
   on hover or press. Then the participant switches the toolbar and looks; the agent reads
   the stylesheet, a person sees whether the text is still readable.
5. Parity report (15:30–15:40, 10 minutes, golden prompts §3.3 rewritten as that prompt): the
   tool for yesterday's by-eye comparison, run by participants on their own component, node id
   from the handoff document. It is the first parity call of the course. What a report is:
   `figma_check_design_parity` compares the master with a `codeSpec` of up to seven sections
   (`visual`, `spacing`, `typography`, `tokens`, `componentAPI`, `accessibility`, `metadata`);
   a section you did not pass is not compared. Say it once, as one sentence: not passed means
   not compared, so a quiet report is not a clean component. The report has no "compared
   sections" list: point at `codeData` (what was passed) and `summary.categories` (only
   categories with findings). Variant node for geometry, component set for `componentAPI` (a
   variant has no component properties). No `codeSpec` assembly by participants, no
   `check:contracts -- --emit`; the codeSpec assembly (§3.4) and the double call (§3.5) are
   trainer-only reference. No bridge → no parity call; say "degraded" on the seat, not
   silently, and sort the Block 02 list. Prepare the room for the result: a low score and a
   list that is mostly not real. Measured 2026-11-20 on a TagChip: 48 out of 100, eleven
   discrepancies, seven of them artefacts of the comparison (a resolved hex against a
   `var(--ui-*)` string, the set's bounding box against one element, a property reported
   missing on both sides because of Figma's `#id` suffix), two kept on purpose, two Figma,
   none code. The tool marks every finding as a code change; the sorting is the work.
6. Sort every difference (15:40–16:00, 20 minutes, the recap question closes it): the parity list plus the list from Block 02,
   one label each. **Code**: hand it back to Claude, fixed inside this row. **Figma**: a note
   for the designer; the master is not changed now. **Kept on purpose**: it must be in the
   handoff document's "Deliberate differences" section; if it is not there, either write it
   there and say why, or it is code or Figma. **Tool artefact**: the tool compared two things
   that are not the same thing; nothing to fix, but the participant says what was compared
   with what and checks two such lines by hand, because the label is also a way to make a
   real difference disappear. The third and fourth labels are new today (Day 1 Block 02
   practised only code and Figma); the word "contract" is not a sorting label any more. One
   sentence for the trainer: in Atelier's own repo such a difference lives in a contract file
   that a check reads. Classic mislabel: "fixing" in code what was kept on purpose. More rows
   than time: label the major ones, mark the rest open (checkpoint D2B04-C7: each difference has
   one label on every seat, unchanged in meaning).

**Expected recap answers.** Code: a missing `aria-label` on the close button, a literal
colour. Figma: an unbound fill, a wrong layer name. Kept on purpose: the `state` axis (it must be
in the handoff document's Deliberate differences). Tool artefact: a hex against the token
that resolves to it, the set's bounding box as a target size. Almost mislabelled: a deliberate mismatch
nearly "fixed" in code.

**Watch for.** Rule R11 at 15:20 (checkpoint D2B04-C3, the fix row ends 15:20): axe first, parity rows
shrink before a11y does. Confirm the bridge at 14:45 before anyone relies on it. The buffer
after the block is 16:00–16:10.

### Block 05 · 16:10–17:30 · Show & tell and transfer

**On screen.** The timer; participant screens; whiteboard; the two checklist handouts (trainer sources `/design-principles#check-your-own`, `/storybook-readiness#self-check`, `/readiness` Part B).

**Say.**

1. Rules: three minutes strictly, component, one prompt that worked, one that failed.
   Stop at three; cut questions, not presenters.
2. Synthesis seeds (`Proposal`, since `D2-05-03` is a TODO; fill from what the room
   showed): patterns that worked: docs first, source named, one change per round, the
   handoff document as the prompt's input, pasting the error not describing it;
   anti-patterns: "fix it" prompts, screenshots instead of errors, letting Claude claim
   a check it did not run, fixing a deliberate mismatch in code; when Claude fails: unknown
   library (no MCP), a question it should have asked (scope guard missing), a long
   session without `/clear`; drift: it starts in Figma (unbound value) or in a
   deliberate difference nobody wrote down, and the parity call only sees passed sections.
3. Transfer, 17:10–17:25, 15 minutes (decided 2026-10-14, R-212; the scorecard is the frame
   since ADR-0180; reweighted by ADR-0186; shortened from 25 minutes on 2026-11-21, owner
   decision: ten went to the exercise before it, ADR-0190): frame it, then everyone marks
   the seven rows of the scorecard (`workshop/handouts/ds-scorecard.md`) for their own design
   system from memory, yes / partly / no (about 10 minutes with the framing; the course
   machines are Conciso's, nobody has their own system open), picks the weakest row and writes
   the next step for it (about 5 minutes). The step is read out in the exit round; the
   neighbour reading is gone. Homework,
   explicit: both checklists, the Figma one and the Storybook one (which carries the
   read-only self-check prompt inline), with the check prompt, on the own system; the trainer's
   pages `/design-principles#check-your-own` and `/storybook-readiness#self-check` write each
   as a **30-minute** run (run, pick one finding, fix, re-run). Nobody starts a checklist in
   the room. `/readiness` Part B (Complete, Sound, Synchronized, Extensible, AI-ready) is the
   other lens for a next step. One conditional bullet on the transfer slide: "A designer
   without an agent: a lint plugin in Figma (FigmaLint)". `TODO(owner)`: keep it only once a
   run without an API key has shown what it does (UNVERIFIED, rehearsal).
4. Workspace anatomy, 16:45–16:55, 10 minutes (decided 2026-10-14, R-212), what your own repo
   needs to run this loop, shown in a participant's own workspace tree (`.mcp.json`,
   `CLAUDE.md`, `.claude/skills/`, `.claude/settings.json` with permissions and the format
   hook, `.storybook/main.ts`, the `package.json` scripts) and said in the order to adopt it,
   most portable first (the list on `/build-your-own`, Block 05; ADR-0180, R-238; six steps
   since ADR-0186): (1) a Storybook that emits `components.json` (docgen) and serves `/mcp`,
   and a `.mcp.json` pointing at it (two roles: in your own repo the library half is your
   library's manifest or package, the local half is the addon MCP of the Storybook you already
   run; at home the Storybook MCP on your own Storybook replaces the `atelier` package);
   (2) a rules file with the token rule and the exact check commands, its "Definition of
   Done" (`CLAUDE.md` or `AGENTS.md`, `/claude-md`); (3) strict TypeScript, ESLint and
   stylelint, which most repos already have: the step is to let the agent run them and read
   the output; (4) stories as tests (`addon-vitest` + `addon-a11y`); (5) one proof command and
   the hooks; (6) the skills you want loaded (`/agent-skills`). The bridge for parity belongs to
   the Figma side, not to this list. Example next steps: "bind the
   variables on our Button master", "add docgen to our Storybook", "write the CLAUDE.md
   token rule". One sentence to add here: you take the workspace home as it is on this
   machine, and the trainer tells you how (`TODO(owner)`: how it leaves the machine, the
   open question of ADR-0178).
5. What carries your docs, and what you depend on (16:55–17:00, 5 minutes, two slides, talk
   only, no exercise): two things the two days used without naming them. The route that brings
   a design system's docs to the agents of the teams that consume it is the Storybook MCP on
   your own Storybook: consuming teams' agents read your components there. And the Figma
   linter, the a11y audit and parity all stand on one third-party server, `figma-console-mcp`:
   a dependency you choose, not part of Figma or Storybook. The second slide of the same five
   minutes (`d2-05-04c`, ADR-0190) puts the two routes to Figma side by side: Figma's own MCP
   server brings a design context with a code template and Code Connect, `figma-console-mcp`
   carries building and the checks; they complement each other. Code Connect is not set up in
   the course. Two slides in five minutes is tight: two sentences, not the table.
6. The second route to Figma, 17:00–17:10, 10 minutes, an exercise (`d2-05-04d`, added
   2026-11-21, ADR-0190; not rehearsed on a seat, R-040): everyone runs
   `claude mcp add --transport http figma https://mcp.figma.com/mcp` in the workspace folder,
   restarts the agent, logs in under `/mcp` with the seat's Figma account, and asks Figma's own
   MCP server for the design context of their own component. From here on two Figma servers
   are connected, so the prompt names the one it means. Say before they read the answer: it is
   a template to translate, not code to check in. Measured once, 2026-11-21, on the AtlButton
   master with the client named as Angular: one React component with Tailwind classes, a `div`
   as root, a `state` prop, the tokens as `var(--ui-…)` with a fallback. Done when everyone has
   seen the answer for their own component and names two places where it differs from their
   own code. A hanging login: `/mcp` again, then watch a neighbour; the block's outcome does
   not depend on this exercise. The checks stay with `figma-console-mcp`.
7. Exit round (17:25–17:30) and the follow-up channel (owner, TODO). Closing slide and note: the outcomes say
   "component and stories", not "contract"; the proof line stays `/verify`.

**Expected recap answers.** One sentence each; a concrete first action in their own DS.

**Watch for.** Eight presenters = 24 minutes plus about one minute of changeover; the whiteboard synthesis is five minutes
from what was shown, not a lecture. Rows: 5 rules, 25 show & tell (16:15–16:40), 5 synthesis,
10 anatomy, 5 talk (two slides), 10 Figma's own MCP server, 15 transfer, 5 exit; 80 minutes.

---

## Answers to the deck's open TODO(owner)

- `D1-00-03` glossary definitions: Day 1 Block 00 §4 above (verbatim from `glossary.ts`).
- `D1-02-02` tutorial step titles: Read the design "Select the component in Figma" · Record deliberate differences
  "Write down the deliberate differences" · Generate "AI matches to Atelier UI components" / "AI generates
  token-exact code" · Verify: the agent runs lint and build, then the comparison with Figma
  (`tutorial.astro`; step 4 changed with ADR-0180, re-check the title on the page).
- `D1-03-04` pink test mechanics: Day 1 Block 03 §4 above (`/tokens#pink-test`).
- `D2-05-03` synthesis seeds: Day 2 Block 05 §2 above, to be replaced by the room's.
- The screenshot list's loop-diagram note points at `D1-00-04` (the loop diagram, reused in `D1-06-02`).
- Still owner-only: cohort date and trainer names (`D1-TT-01`), the wordmark asset, the
  follow-up channel (`D2-05-06`, `D2-CL-02`), and how the workspace leaves the course
  machine (`D2-05-04`; the material says "the trainer tells you how").

## Review of 2026-10-14

The findings behind the `Proposal` and `R-` marks above are filed as R-205 to R-219 in
`tasks/reviews.md` ("Course and dry run"). Sources: a mechanical consistency audit of
the six course files (5 contradictions, 13 drifts), a second-model read of the same
files, and this read.

Owner decisions 2026-10-14: R-207, R-208, R-209, R-210, R-211, R-212, R-213 (mail step),
R-216, R-217 (anchors and `npm run trainer:print`) and R-218 (rule R12) accepted as
recommended and applied to `/schulung`, the participant pages, the run-of-show, the
dry-run kit and these notes; R-205, R-206, R-215 and R-219 fixed the same day. Still
open: R-214 (verify before R-040) and the organisational second person for Day 1.
