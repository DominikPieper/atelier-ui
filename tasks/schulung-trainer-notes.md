# Schulung trainer notes: what to say, show and check per block

_Written 2026-10-14. Trainer material, not participant-facing._

**What this is.** The content layer under the other four trainer files. `/schulung` says
what a block is for and when it is done; `tasks/schulung-run-of-show.md` says what
happens at which minute; `tasks/schulung-deck-outline.md` says what is on the slide;
`tasks/schulung-demo-scripts.md` scripts the eight demos. None of them says what the
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
purpose), the printed `/cheat-sheet` (its ladder card), one copy per participant of the three
handouts `workshop/handouts/ds-scorecard.md`, `figma-readiness-checklist.md` and
`storybook-readiness-checklist.md`, the golden prompts (`tasks/schulung-golden-prompts.md`,
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

Measured 2026-11-17 on a fresh 0.4.10 Angular scaffold. Slide, `/cheat-sheet` card, take-home.

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

| Stage  | Where it enters                                                                 | Minutes                                  |
| ------ | ------------------------------------------------------------------------------- | ---------------------------------------- |
| 0      | Day 1 Block 03 before the checklist; Day 2 Block 01 before the handoff document | 10; 5                                    |
| 1      | Day 1 Block 04, demo D-4                                                        | 3, taken from D-3                        |
| 2      | Day 1 Block 02                                                                  | 20, taken from the comparison (30 to 10) |
| 3      | Day 1 Block 00 demo D-1 (already there); Day 1 Block 05 closing step            | 0                                        |
| 4      | Day 1 Block 04 demo D-5; Day 2 Block 03                                         | 0                                        |
| Wiring | Day 2 Block 00: `CLAUDE.md` "Definition of Done", one `SKILL.md`, the hook      | 10                                       |

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

The two other handouts (`workshop/handouts/figma-readiness-checklist.md` from `/readiness`,
`storybook-readiness-checklist.md` from `/storybook-readiness`, its checks and its self-check)
are check titles as tick boxes plus the page link for the how, one copy of each per
participant on paper. Nobody calls either one homework; both are handouts. The ladder is not
a file of its own: it is a card on `/cheat-sheet`.

---

## Day 0: before the course

The machines are provisioned by Conciso before Day 1 (owner decision 2026-11-12,
ADR-0178; what a provisioned machine has is listed there). Nothing is installed at home
and nothing is mailed beforehand: the preflight mail step (`/workshop#send-preflight`,
R-213) is gone for the course, and Block 01 verifies the machine in the room.

- Per seat: a Claude training subscription, login in Block 01 (`claude auth login`).
  How the account is handed to a seat is organisational and stays `TODO(owner)`.
- Figma Desktop is logged in with a Conciso account, the Atelier file is already
  duplicated once and the Desktop Bridge plugin is imported. Nobody duplicates in the room.
- A second person for Day 1 09:30–12:00 (anyone who has run the scaffold once). Block 01
  and the Day 1 lunch are where one trainer and eight laptops do not scale.
- A seat's training subscription hits its usage limit mid-block: run-of-show rule R12
  (pair with a neighbour, the neighbour drives). A reserve account for that seat is
  `TODO(owner)`; tell the organiser afterwards (R-218).

---

## Day 1: understand the tools and practise the workflow step by step

### Block 00 · 09:00–09:30 · Kickoff and thesis

**On screen.** `/` overview, then `/workshop#glossary`, then two windows for D-1 plus the scaffolded workspace's terminal for its check step, then
terminal + Atelier Storybook :4400 for D-2, then the ladder slide and the scorecard slide,
then `/schulung`.

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
3. The loop with the tool per step, because the recap asks for exactly that:
   **Inspect** = `figma_get_component_for_development` on the node (figma-console);
   **Contract** = the deliberate differences between design and code, written down before
   generating (in the course: the "Deliberate differences" section of the handoff document,
   Day 2 Block 01; one sentence for the trainer: Atelier's own repo keeps them in a contract
   file that a check reads, and participants never open, write or check one); **Generate** = a
   prompt in Claude Code that reads the docs first (`docs-show`), one story per variant value
   and Boolean state, a `play` per behaviour; **Verify** = the agent runs the ladder checks
   (`npm run lint`, `npm run build`, `npm run check:stylelint`, the story tests) and reports
   each exit code, then the parity prompt (`figma_check_design_parity`) against the master.
   The loop keeps its name: Inspect, Contract, Generate, Verify.
4. Glossary, two minutes, the four definitions from `docs/src/data/glossary.ts`
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
6. D-2 (one token change in `libs/styles/src/button/atl-button.css`, `.atl-button.size-sm`
   literal `0.875rem` → `var(--ui-spacing-4)`): point at docs read first, one-line diff, a
   token not a literal, Storybook updates. Undo with `git checkout` even on success.
7. The ladder and the scorecard (09:19, three minutes): the slide "Five tools the agent checks
   itself with" (stage, tool, where in the two days, and the three beats: break it on purpose,
   the tool says so, the agent gets the output and repairs; D-1 just showed stage 3), then
   the slide "What a design system has to bring" (the seven rows as the map of the two days);
   the scorecard handout is given out here. Both tables are in "The ladder and the scorecard"
   above.
8. "What you learn, what you do not" (09:22, three minutes, no slide). `Proposal:` the
   list, since no file has one. Learn: prompting and judging instead of typing; the loop
   on an existing library, then on your own component; reading check output and a parity
   report; judging a Figma file's readiness; writing a handoff document. Do not learn:
   Angular itself; Figma design craft; prompt engineering in general; building a design
   system from zero; CI, release, publishing; Claude Code internals.

**Expected recap answers.** Inspect → figma-console MCP; Contract → the deliberate differences
written down (the handoff document, which comes tomorrow; no Day 1 tool carries it); Generate → Claude Code with the library's MCP (`atelier`); Verify →
the ladder checks the agent runs (lint, build, stylelint, story tests) and
`figma_check_design_parity`. Six of eight name all four
steps or you say them yourself and ask for the tool per step.

**Watch for.** D-1 window (a) must be a plain chat with no Atelier context, and its CSS must contain a hex/`rgb()`/`hsl()` colour or the check stays green (use the pre-saved output). The scaffolded workspace for the gate step must be `npm install`ed and green on `nx stylelint` before the session. Late-comers:
run-of-show late-comer track; the thesis is the only thing not on a page.

### Block 01 · 09:30–10:15 · Verify the setup

**On screen.** `/workshop`, then each participant's own terminal via walking the room;
`.mcp.json` and `/mcp` side by side; `/troubleshooting`.

**Say.**

1. Three things that are independent: an installed CLI, a connected MCP server, usable
   model access. Preflight proves the first two and sends no model request.
2. What `npm run preflight` checks (so a green run is read for what it is): Node ≥ 22.12,
   npm from `package.json#packageManager`, `which claude` + `claude --version`, the Figma
   Desktop Bridge, MCP reachability, ports, Playwright Chromium. Not checked: that the
   login works.
3. Model access: `claude auth login` with the seat's training account (subscription
   login in the browser, the CLI default), then
   `claude -p "Reply with exactly: PREFLIGHT-OK"`. A reply = access; an auth error = no
   access; login fails = pair, trainer takes it at the coffee break.
4. `.mcp.json` of an Angular scaffold has **five** servers: `atelier` (stdio, `npx atelier-mcp`,
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
5. The prepared Figma duplicate opened here (09:50) is **the** duplicate for both days; it
   was made once by Conciso, nobody duplicates in the room. Do not
   duplicate again on Day 2; its file key is already in `package.json` (provisioning) and is read on Day 2 Block 02
   (R-215). Bridge check: ask Claude for the Figma status; `figma_get_status` must report
   `setup.valid: true` on the duplicate.
6. Storybook `npm run storybook` on :6006; `npx playwright install chromium` if
   preflight says it is missing.
7. Decided 2026-10-14 (R-209), changed 2026-11-12: everybody, 10:02–10:12, ten minutes at the
   projector, `/prompts#claude-code-basics`: the workspace trust dialog on first start; permission
   prompts (what to accept: edits inside the workspace, the check commands; what to read
   before accepting: anything that deletes or installs); `Esc` interrupts; `/clear` starts
   a fresh context, `/compact` shrinks it; one session per block, not one per day; `/mcp`
   shows servers and their state; `claude -p` for a one-shot check. Pages:
   `/troubleshooting#workspace-trust`, `#mcp-declined`, `#storybook-local-not-connected`.
8. First commit once preflight is green (R-210): the scaffold ran `git init` and staged
   everything, committed nothing; `git commit -m "scaffold: preflight green"` is the first
   "last green" Day 2's loop can fall back to. Everybody does it in the 10:02–10:12 row.

**Expected recap answers.** CLI installed, MCP connected, model access, each can be red
alone.

**Watch for.** Rule R1 at 09:50 (most common failing line on the projector), R2 at
10:00. There is no rescue slot any more: a red seat pairs with a neighbour and you take it at the coffee break 10:15–10:30 or at lunch. Nobody continues red into Day 2 Block 01.

### Block 02 · 10:30–12:00 · Mini-loop: first success

**On screen.** `/tutorial`, a participant's terminal, then one parity report.

**Say.**

1. The tutorial's four stages (answer to deck TODO `D1-02-02`, from
   `docs/src/pages/tutorial.astro`; re-check the titles against the page, step 4 changed with
   ADR-0180): **Inspect** "Select the component in Figma"; **Contract** "Write down the
   deliberate differences" (said in one sentence on Day 1, written on Day 2 Block 01);
   **Generate** "AI matches to Atelier UI components" and "AI generates token-exact code";
   **Verify**: the agent runs lint and build, then the comparison with Figma.
2. The target: Settings Card, node `936-2954`, composed from AtlCard / AtlInput /
   AtlToggle / AtlButton. No new component, no API change; composition from existing
   building blocks. The prompt is live on the page (`examplePrompt`); do not retype it
   (golden prompts §1 says why).
3. Ladder stage 2, the agent checks itself (11:25–11:45, 20 minutes, golden prompts §1a), three
   beats, each stage with what it does not see. (1) The agent runs `npm run lint` and
   `npm run build` and reports each exit code. (2) Break it on purpose: an `<img
src="/avatar.png">` without `alt` and a `<div (click)="save()">Save</div>` in the Settings
   Card; lint says so with rule ids (`alt-text`, `click-events-have-key-events`,
   `interactive-supports-focus`) and a non-zero exit code. (3) The agent repairs from the
   output, both run again. Then read the repair: did it write `alt=""`? **Green is not
   right** (lint is green, the image that carries meaning is hidden from a screen reader).
   What lint does not see: a raw `<button>` where a library component exists, and meaning.
   Last prompt: remove the image and the div again, run both, report the exit codes. Numbers
   for the room: lint 6–7 s, build 6–9 s warm; one headless repair run (four planted
   defects) took 78 s and 10 turns. The compiler half is named here only as "build also ran";
   its demo is Block 04 (D-4). Fallback if the agent stalls: the participant types the
   command. A failing command prints no error text in a non-TTY shell until R-248, hence "the
   full log" in the prompt. UNVERIFIED (rehearsal): that the three planted-break prompts run as
   participant prompts within the 20 minutes.
4. The proof in this block is lint and build run by the agent; `check:contracts` is not part
   of the participant path (ADR-0180), and neither is `check:stories` in this block. Exit
   code is the result; read it as `cmd > /tmp/x 2>&1; echo $?` when you run one yourself.
5. The comparison with Figma (11:45–11:55, 10 minutes): the parity prompt from `/tutorial`;
   Claude lists the differences; sort each one: code or Figma; a long list: label the three
   largest. Before anyone runs one, what a parity report is: `figma_check_design_parity` compares the
   master with a `codeSpec` of up to seven sections (`visual`, `spacing`, `typography`,
   `tokens`, `componentAPI`, `accessibility`, `metadata`). Sections you did not pass are
   not compared. So the first line to read is the list of compared sections, not the
   verdict. `Verify in rehearsal:` which sections the tutorial's call passes; the recap
   answer depends on it.
6. Token drift in the first draft: hand the §1 add-on line, not a re-prompt.

**Expected recap answers.** The recap asks which check the agent ran on its own work and what
it reported: lint and build, both exit codes, and after the planted break the rule ids lint
named. Differences: code, a literal that should be a token; Figma, a master value that is
simply off. Two labels only on Day 1 (owner decision 2026-10-20). If time allows, what the
parity report compared (the sections the tutorial passed, likely `componentAPI`, `tokens`,
`metadata`) and did not (anything not passed, plus dark mode, behaviour, keyboard).

**Watch for.** The parked difference: a finding that fits neither label (a mismatch someone
chose on purpose) is parked with the line "not code, not Figma, we name it on Day 2", and is
not "fixed" in code. Bridge red at 10:50 → rule R3 (trainer reads the frame once, shares the
data, marks the parity row degraded). "Prompt, do not type": watch for people editing
the generated file by hand; send them back to the prompt.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 1 block 02: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 03 · 13:00–14:15 · Figma for code: is the file ready?

**On screen.** Figma desktop, the participant's duplicate: Variables panel, Components
page, Inventory page, Workshop-Templates page; `/tokens#naming`, `/tokens#pink-test`,
`/readiness`, the agent's `figma_lint_design` output.

**Say.**

1. Three tiers in the Atelier file: **Primitives** → **Library Tokens** (the semantic
   tier; Light and Dark modes; 84 variables: 50 colour, 10 spacing, 6 sizing, 5 radius,
   12 typography, 1 opacity; **no shadow**, elevation is CSS-only `--ui-shadow-*`) →
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
5. Ladder stage 0, the Figma linter (13:45–13:55, 10 minutes, golden prompts §1c). First the
   default run on `Inputs/AtlButton` (node `129:20`), measured 2026-11-17: 59 findings, 18 of
   them "critical" contrast failures on the hidden `_disabled-overlay` label, 41 about missing
   text styles. Say: "a finding is something to sort, not a verdict". Then everyone prompts: the
   agent runs `figma_lint_design` on the same master in the prepared duplicate with the rules
   `hardcoded-color`, `default-name`, `detached-component` only and returns a list; the
   participant sorts each line: real / false alarm. Read-only: nothing is changed in the file.
   Beats: break it on purpose is the file itself (the three planted defects: an unbound
   colour, a default name, a detached-looking `Icon/Arrow` frame; golden prompts §1c); the tool says
   so; the agent's output is the list. What it does not see: whether the design is right,
   spacing and radius, and its default rule set reports false alarms. Exactly three findings
   come back, all real (answer key in §1c). UNVERIFIED (rehearsal): the planting snippet has not
   run against Figma yet.
6. The readiness checklist, Part A (the master), eleven checks (`docs/src/pages/readiness.astro`):
   colour/spacing/radius bound to variables; auto layout on every frame with children;
   variables scoped, not "all scopes"; each variable's code name recoverable; each
   variable says what it is for; no default layer names in the component's tree; layer
   names match across variants; the master has a structured description; variants and
   states complete and on the right axis; content decisions recorded as properties or
   with a reason; the accessibility audit ran and you read how it classified the component.
   Part B (the system: Complete, Sound, Synchronized, Extensible,
   AI-ready) is for the participant's own DS and returns on Day 2 Block 05. The linter and the
   pink test answer the rows on tokens, names and instances; the remaining rows are filled in
   by looking, 13:55–14:00 (UNVERIFIED (rehearsal): that 5 minutes are enough).
7. Decided 2026-10-14 (R-207), re-timed 2026-11-17: 13:45–14:00 the linter and then the readiness
   checklist for one Atelier master (the checklist for your own Figma file is a handout, the
   Figma readiness checklist; Day 2 Block 05 starts it); 14:00–14:10 the micro-exercise on a
   copy of a master in the prepared duplicate: bind one fill to a Library Tokens variable, add
   one variant value, put one frame on auto layout, pink test on the copy. Checkpoint D1B03-C5 at
   14:10: the copy's fill is bound and the pink test shows it. Seat behind: the fill
   binding only. Without it, Day 2 Block 01 is the first time anyone builds in Figma.

**Expected recap answers.** Most often: "colour bound to variables" (the agent would have
read a hex), "code name recoverable" (the agent would have invented a token name),
"variants on the right axis" (the agent would have made `hover` a prop).

**Watch for.** No master at hand → rule R4, second Atelier master, say so. Every machine
has Figma Desktop logged in with a Conciso account, so no seat is without Figma; a seat whose
bridge or file is red pairs with a neighbour.

### Block 04 · 14:30–15:45 · Guardrails: stories as claims, and MCP

**On screen.** The library Storybook mounted in the trainer's own workspace
(`localhost:6006/atelier/`, fallback the hosted `atelier.pieper.io/storybook-angular/`) for D-3 (7 min); `/mcp` in Claude Code; two windows for D-4 (13 min) plus the workspace terminal; the scaffold workspace's
Storybook :6006 for D-5.

**Say.**

1. A story is a claim: `args` claim a state, `play` claims a behaviour. The triangle slide:
   component = shape, story = claim, the test checks the claim. Who checks the claim:
   `check:stories` (the `storybook-test` target of the app) runs it in Chromium with axe.
   There is no contract corner and no `check:contracts` here.
2. D-3 on the **library** Storybook only (7 minutes; the trainer's own workspace mount
   `localhost:6006/atelier/`, NOT YET VERIFIED (rehearsal): the Design tab inside the mounted build): Design tab = `parameters.design` =
   `figmaNode('129-4')` on AtlButton `Primary`. The Docs tab's contract section is no longer
   taught; at most one trainer sentence: Atelier's own repo keeps the deliberate differences in
   a contract file that a check reads, participants do not open one. The participant's scaffold
   stories carry no `parameters.design`; their own Design tab is empty. Say "look at mine,
   yours has none"; participants may open the same `localhost:6006/atelier/` URL on their seat.
3. MCP in two sentences: a server exposes tools, the client (Claude Code) lists and
   calls them over JSON-RPC. Two servers for Storybook content: the library server
   (`atelier`: `docs` only: `docs-list`, `docs-show`, `docs-show-story`) and the local addon
   server (`storybook-local`: `docs` + `dev` + `test`). The five servers from Block 01; run
   `/mcp`, name them, and say the two roles: `atelier` answers for the library,
   `storybook-local` for what you build.
4. D-4 (13 minutes, with ladder stage 1): window (a) invents props; the compiler stage comes
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
5. D-5 in the scaffold (ladder stage 4): the template story `AtlButton` → `Primary` has a `play` that
   clicks and expects the text `clicked`. Change `getByText('clicked')` to
   `getByText('never')`, save, Interactions panel red; fix, green. The sentence: a
   `play` that never failed claims nothing. What stage 4 does not see: anything without a
   story, dark mode (axe runs in light mode only), a keyboard path no `play` walks.
6. The exercise: one story with a `play` for a variant, red once, then green, prompted
   with the template story (`AtlButton`) as context (decided 2026-10-14, R-216). The local
   server is part of the course from here: the agent calls `get-storybook-story-instructions`
   before it writes the story and runs `test-run` through `storybook-local` on it, so it sees
   the red itself; the participant watches the same red in the play panel, fixes by prompt,
   green. NOT YET VERIFIED (rehearsal): `test-run` through `storybook-local` on a seat.

**Expected recap answers.** "A story claims a state and a behaviour; `check:stories`
runs the claim in a browser with axe; the build catches a wrong value, not an invented name." Stretch: "not documented" is right because the manifest is the API; an
invented prop would compile nowhere.

**Watch for.** Rule R5 at 15:15 (`docs-show` on every seat) and 15:30 (red seen). Take
time from the stretch, never from the red-then-green row. D-4 down → saved screenshots.
`atelier` not connected on a seat: `/mcp` → reconnect; still red: pair with a neighbour.
`storybook-local` not connected: Storybook is not running; start it (the tools appear on
their own), `/mcp` → reconnect is the fallback; the play panel shows the same red meanwhile.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 1 block 04: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 05 · 15:55–17:15 · A screen from Storybook, against the clock

**On screen.** `/screen-from-storybook`, the timer, then one volunteer's receipts list.

**Say.**

1. Why this block: most customer teams do not build components, they write application
   code against components that already exist, and the only thing they know about them is
   what Storybook says. No Figma frame, no steps. The page gives the brief (a Team
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
   separate one, and it stays inside the 5 minutes. The page section "What the
   Storybook MCP gives you, and what it does not" has the same walk-through for the room.
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
4. The audit: the receipts prompt on the page makes the agent print the `docs-show`
   passage behind every prop. Participants spot-check three and mark where each import name came from. Green checks say the code is
   clean, not that it is honest. Debrief, 16:45–17:10, on two volunteers' receipts; one question is
   fixed: where did the agent get `AtlThead` and `AtlOption` from when `docs-show` never names them?
   Expected answer: it read the package's type exports under `node_modules/@atelier-ui/angular`, or got the
   names from a compile error. The point for the room's own design system: a manifest that documents
   the tag but not the import sends the agent off the documented path; put the import line into the usage example.
5. The fifth known gap (measured on the Angular endpoint 2026-11-12, not for React and Vue):
   `docs-show` shows the sub-component tags (`atl-thead`, `atl-option`) but neither the class
   names to import (`AtlThead`, `AtlTbody`, `AtlTr`, `AtlTh`, `AtlTd`, `AtlOption`) nor the
   package name; the story snippets import from `./atl-table`, the library's internal path.
   The block's premise "`atelier` is the only source" has this one named exception:
   the names come from the package's type exports in `node_modules/@atelier-ui/angular`, the
   import is from `@atelier-ui/angular`, and the receipts say so.
6. No machine homework (D7, 2026-11-12): the course machines stay in the room. The bridge
   exercise `/first-component#bridge` (add a `density` variant to SettingsCard: component, a
   story per value, `docs-show`, then the agent runs lint, build and `check:stories`) and the kata `/first-component` are optional and only
   with the participant's own machine and Claude access; say so at 17:25. An unfinished
   screen stays in the workspace, which is still there on Day 2. The checklist for your own
   Figma file is a handout, not homework.

**Expected recap answers.** The agent broke rule 2 first (a prop or an input on a table
part or `atl-option` that `docs-show` does not list on the main entry: the Inputs block
never lists sub-component inputs such as `sortable` on `atl-th`; on Angular they are in the usage
example, everywhere in the `Sortable` story, which the opener now points at) or rule 3 (a
hand-built badge or card); `npm run build` on Angular, the template lint rules, the
receipts audit or the participant's own reading caught it. Stylelint catches a hex, rgb or hsl
colour in the `.css` file; nothing but the greps on the page catches one elsewhere, or a
named colour or pixel spacing anywhere.

**Watch for.** Hard stop 16:30 (rule R6). Measured 2026-11-12, one headless run on the trainer
machine without permission prompts: build 195 s, the four checks from a cold cache 20 s,
receipts prompt 39 s. UNVERIFIED is how long a participant needs to approve, read and
judge; the dry run logs it. If most seats are still on the table at minute 20 of the 30
build minutes, cut the invite button and the status badge column from the brief on the page, not the checks. Agents invent a search-bar or layout component,
forget that a filter change must go back to page 1, and put styles in an inline array. The
`docs-list` entry "cookbook" lists a "Data List with Actions" story, but `docs-show-story`
returns no code for it (checked 2026-10-20 on the Angular endpoint), so it does not hand
over the answer.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 1 block 05: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 06 · 17:15–17:30 · Recap and exit ticket

**On screen.** Whiteboard, `/briefs`, `/first-component#bridge`.

**Say.** Three questions for the five-minute discussion: where did the AI guess, and
which guardrail caught it; which check output did you read, which did you skip; what
would you check first tomorrow. The four briefs in one line each (Day 2 Block 00 has
the detail). No machine homework: the course machines stay in the room. Take the brief and
sketch it on paper if you like; the readiness checklist for your own Figma file
(Block 03) is a handout; Day 2 Block 05 starts it. The bridge exercise and the kata `/first-component` are optional,
only with your own machine and Claude access. Exit ticket: one
sentence, paper or spoken.

**Watch for.** Everyone names a brief aloud; undecided → Toast.

---

## Day 2: build your own component

### Block 00 · 09:00–09:30 · Recap, brief, skills

**On screen.** Blank for the recall; `/briefs/<name>`; a scaffolded workspace for D-7 (5 min:
`.claude/skills/atelier-component/SKILL.md`, then Claude Code); then the projector with two
more files of the workspace: `CLAUDE.md` and `.claude/settings.json`.

**Say.**

1. Active recall, eight minutes, the room answers: name the loop and the tool for each step Day 1 practised;
   what did the parity report compare and not compare; which three setup things are
   independent; why is a story a claim; which rule did the agent break first on the Team directory and what caught it;
   which check did the agent run on its own work, and what did it report.
2. The briefs: what a finished component owes (anatomy, axes, states, a11y obligations),
   not how to draw it. Provenance matters: Toast and Avatar are transcriptions of a
   canonical uianatomy record; TagChip (`tag-input`'s `tag`/`tag-remove` + `badge`) and
   StatCard (`card` + `badge`) are **compositions**, there is no canonical chip or stat
   card. That is the lesson: a canonical vocabulary tells you when you build a known
   thing and when you assemble one.
3. The shared rules all four briefs follow: 2 variants × 2 states, no more; start from
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
   optional rung"), move on. `Verify in rehearsal` (check 9): that the answer lists the skills on every seat.
7. What the agent reads here, and change one line (09:18–09:28, 10 minutes; ladder "wiring").
   Projector, 3 minutes, the four things an agent gets in this workspace: the rules file
   (read every session), a skill (loads when the task matches; shown in D-7), an MCP server
   from `.mcp.json` (tools and data), a hook (runs without being asked). Open two files:
   `CLAUDE.md` → "Definition of Done"; `.claude/settings.json` → `hooks.PostToolUse` →
   `.claude/hooks/format-edited.sh`. Exercise,
   7 minutes: (1) ask "Which commands does this workspace's Definition of Done list? Only
   list them."; (2) delete the line
   ``- `npm run check:stories` — every story, rendered in Chromium, axe-checked`` from the
   list, save, leave the count word; (3) `/clear`, ask again: five commands, `check:stories`
   is gone; (4) put the line back (undo), save. Checkpoint D2B00-C3: the second answer on
   every seat no longer names `npm run check:stories`, and the line is back in `CLAUDE.md`
   at 09:28. Line for the room: the agent runs what the list names, and a check that is not
   in the list is a check nobody asked for. Trainer: `/verify` has its own list in
   `.claude/commands/verify.md` and still runs six. Stretch: write down the one line your
   own team would add to this list, the command and what it proves. UNVERIFIED (rehearsal):
   that the two answers differ as described after `/clear`.

**Expected recap answers.** The recap asks where the team's check commands go so that the
agent runs them: the rules file's "Definition of Done" (`CLAUDE.md` or `AGENTS.md`), plus a
skill and a hook for the recurring task; how you would notice it did not read them: the
second answer lacks the command, or the agent skips the check. Skills as before:
`atelier-component` on "build/generate the component"; `figma-workspace-architect` on
"structure the Figma master".

**Watch for.** A missing skill is copied from a neighbour, logged, never re-scaffolded.

### Block 01 · 09:30–11:00 · Design in Figma and the handoff document

**On screen.** Figma desktop; `/build-your-own#block-01`; `/design-to-code#handoff-example`.

**Say.**

1. The prepared duplicate on the machine is the one copy used on both days (R-215); do not duplicate again. Confirm the bridge is on it: Claude reports
   `figma_get_status` with `setup.valid: true`. Nobody continues red.
2. The build order that fits 40 minutes: copy the starter and rename it → the `variant`
   axis, lowercase values exactly as the code union will be (`success`, not `Success`)
   → the second axis your brief names, as a `state` axis → the Boolean properties the
   brief lists (`dismissible`, `hasIcon` …) → bind every fill, radius, padding, gap to a
   Library Tokens variable → auto layout on every frame with children → switch the
   frame to the Dark mode and look (Layer → Appearance → Variable modes) → write the
   master's description: what is out of scope, the a11y items tagged "(full component)",
   that the shadow is CSS-only, the duration or other behaviour the brief names.
3. MCP structuring (20 min): `figma-workspace-architect` is the co-pilot; the tools that
   matter are `figma_add_component_property`, `figma_analyze_component_set`,
   `figma_audit_component_accessibility`, `figma_set_description`. Ask Claude for the
   audit and read it; the bridge must stay connected. 20 minutes (10:15–10:35).
4. Ladder stage 0 on your own component set (10:35–10:40, 5 minutes): the same prompt as Day 1
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
   code). This is agenda step 2 and loop step 2, the "Contract" of the loop. A checklist,
   not a template. Short on time: node id, variants, exclusions, deliberate differences first.
6. Decided 2026-10-14 (R-211): the five-minute "LLM-friendly API rules" talk
   (predictable naming, literal unions, composition over config, no hidden defaults) is
   the 10:40–10:45 row, directly before the handoff, because the handoff fixes the prop
   names; MCP structuring is 10:15–10:35. Block 02 no longer has it.

**Expected recap answers.** Lines you decided: reuse vs rebuild, exclusions, acceptance
criteria, the deliberate differences. What the AI would have guessed: prop names, the position values, a shadow
variable, a `state` prop.

**Watch for.** Rule R7 at 10:15 and 10:35 (give MCP time to the manual row, never cut
the handoff). Bridge drops → `/runbook#stale-instances`. Figma novices stall on the
variant axis UI; walk the room with the five-step build order above, not with Figma
theory. `Verify in rehearsal` (R-214): a free-plan Figma account keeps the Dark mode in
a duplicated file and can import the dev plugin.

### Block 02 · 11:15–12:30 · Component and stories from the handoff

**On screen.** Terminal (`/mcp`, tool list), a participant's running Storybook, then one
participant's `docs-show` output before and after the JSDoc edit.

**Say.**

1. The local Storybook MCP (11:15–11:17, 2 minutes): start `npm run storybook` if it is not
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
   prompt as they are. One step: component with its test, and stories; one story per variant
   value and Boolean state, a `play` per behaviour line. Then the participants look at the
   result: every story open in the running Storybook (or `stories-preview`), compared by eye
   with the Figma master, what is wrong handed back to Claude by prompt, never typed. That is
   the 48-minute row (11:17–12:05). The generation prompt (§2.1) is also printed on
   `/build-your-own`.
4. What the agent can read about your component (12:05–12:20, 15 minutes). Part 1, 10 minutes
   (golden prompts §2.5): `docs-list`, then `docs-show` on your own component through
   `storybook-local`. List what an agent using the component would have to guess: no component
   description, a property without a description, a value set shown as a bare alias. Claude
   adds the JSDoc; call `docs-show` again and compare. Fallback without the MCP:
   `npx storybook tools --config-dir workshop-<fw>/.storybook --json docs show --input '{"id":"<id>"}'`.
   Measured 2026-11-18 on the 0.4.10 Angular scaffold through that CLI route: a new component
   with a story appears in `docs list`; `docs show` prints Inputs and Outputs, the JSDoc line
   where one exists and nothing where none does. UNVERIFIED (rehearsal): the same call over the
   running local MCP, and whether the dev server refreshes the entry after a JSDoc edit without
   a restart.
5. Part 2, 5 minutes: the running stories next to the Figma component, every variant and state;
   write the differences down as a list (Block 04 sorts it). One pass. No `figma:snapshot`, no
   `check:contracts`, no finding codes in this block.
6. Trainer note: the `atelier-component` skill no longer has a contract step (scaffold release of
   2026-11, commit 8c8fdf6a); the contract is an optional trailing section there, and nobody on
   a seat is coached through it.
7. `tags: ['autodocs']` on the generated story, or there is no Docs tab.
8. `/verify` in Claude Code runs all six checks (`check:format`, `check:stylelint`, `lint`,
   `build`, `check:unit`, `check:stories`); since 2026-11-17 it is the proof line of
   the end-of-day checklist, not a Block 02 target. Formatting and CSS lint, the two the
   agent first ran in Day 1 Block 05, are cheap and mechanical: fix by prompt.

**Expected recap answers.** The recap asks what `docs-show` did not know about the component and
where it was written down: the component description, a property's description, a value set
shown as a bare alias; written as JSDoc in the component.

**Watch for.** Rule R8 at 11:17. Rule R9 at 12:05 (checkpoint D2B02-C3): at 30 percent
without a rendering story, take one stalled seat's handoff document onto the projector,
find the missing line with the room, re-run the prompt, and show the `docs-show` row as a
trainer demo on one green seat. A stalled seat: check the handoff document first, not the
prompt. Checkpoints: D2B02-C2 (11:50) component and stories on disk; C3 (12:05) renders with
one story per variant value; C4 (12:20) `docs-show` ran on the own component and at least one
description was added, each on ≥ 70 %.

**Commit habit (R-226).** Participants close the block with `git add -A && git commit -m "day 2 block 02: green"` inside the recap row (no timing change). Day 2 Block 03's undo rule reverts to the last of these commits, so a revert never reaches past the current block.

### Block 03 · 13:30–14:45 · Iterate: prompt quality and the self-healing loop

**On screen.** `/prompts#rubric`, `/prompts#stuck`, `/design-to-code#self-healing-loop`,
a volunteer's loop.

**Say.**

1. The six checks (`docs/src/pages/prompts.astro` `RUBRIC`), names and meaning: **Source
   named** (node id or brief); **Docs first** (`docs-show` before guessing props);
   **Tokens** (`--ui-*` only, no hex or px); **Scope guard** (only what the design shows,
   missing things go in a question list); **Done stated** (which checks must be green and
   that the agent runs them); **One change per round** (a revision fixes one named
   problem and says which finding it answers). Everyone scores their Block 02 prompt; the
   failed check is the reason stated on revision (the done-when).
2. Correction prompts by symptom (golden prompts §4 index): invented prop → §2.2;
   hardcoded value or missing shadow → §2.3; structural content in the wrong place
   (Undo as inline link, remove as styled span, StatCard as card over invisible button,
   Avatar as two components) → §2.4 with the brief's §5 row; token drift anywhere → §1
   add-on.
3. The self-healing loop: run the check → read the exit code and the **first** error →
   paste the four things from `/prompts#stuck` (exact error, exit code, what you expected,
   what changed since green) → one change → rerun. Stop rule: two failed fixes → stop,
   re-diagnose from the failing story, not from the prompt.
4. Decided 2026-10-14 (R-210): commit when the stories are green
   (`git add -A && git commit -m "<step>: green"`); after two failed fixes stop, go back to
   the last green commit with `git reset --hard HEAD && git clean -fd -- workshop-<fw>/src` (preview:
   `git clean -nd -- workshop-<fw>/src`), then re-diagnose before the next prompt; no
   third patch. Unconditional since 2026-11-17 (R-242), as the customer agenda says it. R-226 (2026-10-20): a bare `git checkout -- .` leaves the files the
   agent newly created (untracked), so the checks stay red; `git stash -u` was rejected
   because it also stashes unrelated untracked work and leaves a stash to explain; the
   `clean` is scoped to the app's `src/` and never `-x`, so unrelated files survive.
   Commit points: Day 1 Blocks 02, 04, 05 and Day 2 Block 02 (the recap rows). The scaffold runs `git init` and stages,
   commits nothing (`preset.ts` ~L2279); the first commit is Day 1 Block 01's. Rows since
   2026-10-14: 10 focus/rubric, 15 correction prompts (C2 at 13:55), 10 test-loop demo,
   25 self-healing loop (C4 at 14:20), 10 AI-assisted debugging, 3 stretch, 2 recap; the
   block ends 14:45, coffee 14:45–15:00.
5. The test loop (ladder stage 4: the agent runs `test-run`, gets the failure, repairs): `test-run` over the local MCP = `npm run check:stories`
   (every story in Chromium, `play`, axe). `npm test` / `check:unit` is the jsdom
   half only. Never two `storybook-test` at once (shared browser port). In a
   generated workspace the Nx project is `workshop-<fw>`, not `<fw>`: use the npm
   scripts (R-228).
6. Token fidelity at 14:40: ask Claude to grep the component's files for `#[0-9a-f]{3,8}`
   and `[0-9]+px` and replace each hit with the matching `--ui-*` name read from
   `tokens.css`, then report the lines.

**Expected recap answers.** "Added Docs first → the invented `rounded` prop disappeared."
"Added the scope guard → it stopped adding the six positions." "One change per round →
I could tell which change fixed the red story."

**Watch for.** Rule R10 at 14:00 and 14:30 (one shared revision on the projector). A seat
typing code by hand: back to the prompt. Trainer hands out the golden prompts on paper
here, not earlier.

### Block 04 · 15:00–16:15 · Verify: a11y, states, parity

**On screen.** `/a11y-workflow#a11y-in-the-loop`; a participant's Storybook a11y panel
and theme toolbar; a participant's parity report; the trainer machine for D-8.

**Say.**

1. "A quiet report is not a clean component": a report is only as strong as the
   sections it names, and axe only sees what renders in light mode.
2. The three-step a11y check, in order, each result reported before the next (golden
   prompts §3.1): `figma_audit_component_accessibility` on the node (bridge);
   the Storybook a11y panel (axe-core, the same engine `check:stories` runs); a keyboard
   walk (Tab, Shift+Tab, Enter, Escape). Fix only the brief's obligations tagged
   **(this block)**; the **(full component)** ones go into the master's description, not
   into code that claims a check it never ran.
3. States: hover, active, disabled are CSS, never a variant; no `transform` on hover or
   press (`plan/design-principles.md` §1); after the fixes the keyboard walk is done again and
   every state is looked at: hover, active, focus, disabled; disabled = `opacity: var(--ui-opacity-disabled)`,
   `cursor: not-allowed`, `pointer-events: none`; the focus ring comes from tokens.
4. Dark mode: the **theme** control in the Storybook toolbar (`withThemeByDataAttribute`,
   sets `data-theme`, the selector `tokens.css` switches on). The **backgrounds** control
   is canvas colour, not a theme (ADR-0142). Golden prompt §3.2 names the theme control
   since 2026-10-14 (R-205). Axe runs in light mode only: the toggle is a preview, not
   coverage. Three confirmations per §3.2: every colour through `--ui-*`, no transform
   on hover, disabled unchanged.
5. Parity report (15:45–15:53, 8 minutes, golden prompts §3.3 rewritten as that prompt):
   participants run the parity prompt on their own component, the same shape as Day 1, node id
   from the handoff document. No `codeSpec` assembly by participants, no
   `check:contracts -- --emit`. No bridge → no parity call; say "degraded" on the seat, not
   silently, and sort the Block 02 list.
6. D-8 on the trainer machine only, about 3 minutes inside the parity row: a field you do not
   pass is not compared (recall from Day 1 Block 02, not a new insight), so a quiet report is not a clean component. The double call (§3.5)
   and the codeSpec assembly (§3.4) are trainer-only: call 1 with the four sections plus a
   hand-added `spacing` section holding one wrong value → flagged as major; call 2 with the
   four sections only → no spacing row, and the score rises (48 → 72 on AtlButton,
   2026-10-14, measured with all seven sections; the four-plus-spacing variant is
   UNVERIFIED live, R-227). A rising score is not a better component. The report has no
   "compared sections" list: point at `codeData` (what was passed) and `summary.categories`
   (only categories with findings). Variant node for geometry, component set for
   `componentAPI` (a variant has no component properties).
7. Sort every difference (15:53–16:13, 20 minutes): the parity list plus the list from Block 02,
   one label each. **Code**: hand it back to Claude, fixed inside this row. **Figma**: a note
   for the designer; the master is not changed now. **Kept on purpose**: it must be in the
   handoff document's "Deliberate differences" section; if it is not there, either write it
   there and say why, or it is code or Figma. The third label is new today (Day 1 Block 02
   practised only code and Figma); the word "contract" is not a sorting label any more. One
   sentence for the trainer: in Atelier's own repo such a difference lives in a contract file
   that a check reads. Classic mislabel: "fixing" in code what was kept on purpose. More rows
   than time: label the major ones, mark the rest open (checkpoint D2B04-C7: each difference has
   one label on every seat, unchanged in meaning).

**Expected recap answers.** Code: a missing `aria-label` on the close button, a literal
colour. Figma: an unbound fill, a wrong layer name. Kept on purpose: the `state` axis (it must be
in the handoff document's Deliberate differences). Almost mislabelled: a deliberate mismatch
nearly "fixed" in code.

**Watch for.** Rule R11 at 15:35 (checkpoint D2B04-C3, the fix row now ends 15:35): axe first, parity rows shrink before a11y does. Confirm
the bridge at 15:00 before anyone relies on it. Every row is 15 minutes earlier than
before 2026-10-14 (buffer 16:15–16:25).

### Block 05 · 16:25–17:30 · Show & tell and transfer

**On screen.** The timer; participant screens; whiteboard; `/design-principles#check-your-own` (or `/storybook-readiness#self-check`);
`/readiness` Part B.

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
3. Transfer, 17:15–17:27 (decided 2026-10-14, R-212; the scorecard is the frame since
   ADR-0180): mark the seven rows of the scorecard (`workshop/handouts/ds-scorecard.md`) for
   your own design system, yes / partly / no, pick the weakest row, then start the checklist
   that matches it: the Figma checklist or the Storybook checklist (both are handouts, you take
   both home). `/design-principles#check-your-own`
   is written as a **30-minute** exercise (run, pick one finding, fix, re-run), and so is
   `/storybook-readiness#self-check`; in the room (12 minutes) they start it and pick the
   one finding. The full run and the fix come after the course; the finding is the next
   step they write down. Second choice, same scope and same output: a participant whose team already
   has a Storybook runs `/storybook-readiness#self-check` instead and picks one finding
   from it. `/readiness` Part B (Complete,
   Sound, Synchronized, Extensible, AI-ready) is the other lens for a next step. One
   conditional bullet on the transfer slide: "A designer without an agent: a lint plugin in
   Figma (FigmaLint)". `TODO(owner)`: keep it only once a run without an API key has shown what
   it does (UNVERIFIED, rehearsal).
4. Workspace anatomy, 17:00–17:15 (decided 2026-10-14, R-212), what your own repo needs
   to run this loop, shown in a participant's own workspace tree (it also names `.claude/settings.json`,
   permissions and the format hook; `.claude/commands/verify.md`, the one proof command; and
   `.claude/agents/component-review.md`, a review agent the workspace ships) and said in the
   order to adopt it, most portable first (the list on `/build-your-own`, Block 05; ADR-0180, R-238):
   (1) a Storybook that emits `components.json` (docgen) and serves `/mcp`, and a
   `.mcp.json` pointing at it (two roles: in your own repo the library half is your library's
   manifest or package, the local half is the addon MCP of the Storybook you already run); (2) a rules file with the token rule and the exact check
   commands, its "Definition of Done" (`CLAUDE.md` or `AGENTS.md`, `/claude-md`);
   (3) strict TypeScript, ESLint and stylelint, which most repos already have: the step is
   to let the agent run them and read the output; (4) stories as tests (`addon-vitest` +
   `addon-a11y`); (5) one proof command and the hooks; (6) the skills you want loaded
   (`/agent-skills`); (7) the contract check (`tools/design-contracts/`), Atelier's own,
   last and optional (a one-sentence trainer mention; nobody runs it today). The bridge for parity belongs to the Figma side, not to this list.
   Example next steps: "bind the
   variables on our Button master", "add docgen to our Storybook", "write the CLAUDE.md
   token rule". One sentence to add here: you take the workspace home as it is on this
   machine, and the trainer tells you how (`TODO(owner)`: how it leaves the machine, the
   open question of ADR-0178).
5. Exit round and the follow-up channel (owner, TODO). Closing slide and note: the outcomes say
   "component and stories", not "contract"; the proof line stays `/verify`.

**Expected recap answers.** One sentence each; a concrete first action in their own DS.

**Watch for.** Eight presenters = 24 minutes; the whiteboard synthesis is eight minutes
from what was shown, not a lecture. Rows since 2026-10-14: 3 rules, 24 show & tell
(16:28–16:52), 8 synthesis, 15 anatomy, 12 transfer, 3 exit; 65 minutes.

---

## Answers to the deck's open TODO(owner)

- `D1-00-03` glossary definitions: Day 1 Block 00 §4 above (verbatim from `glossary.ts`).
- `D1-02-02` tutorial step titles: Inspect "Select the component in Figma" · Contract
  "Write down the deliberate differences" · Generate "AI matches to Atelier UI components" / "AI generates
  token-exact code" · Verify: the agent runs lint and build, then the comparison with Figma
  (`tutorial.astro`; step 4 changed with ADR-0180, re-check the title on the page).
- `D1-03-04` pink test mechanics: Day 1 Block 03 §4 above (`/tokens#pink-test`).
- `D2-05-03` synthesis seeds: Day 2 Block 05 §2 above, to be replaced by the room's.
- The screenshot list's loop-diagram note points at `D1-00-08` (the recap) since
  2026-10-14; it said `D1-00-07` before.
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
