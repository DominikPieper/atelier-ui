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
`Verify in rehearsal:` marks a claim no one has observed live (R-040, R-202).

**Print.** `npm run trainer:print` writes `tasks/print/day-1.md` and `day-2.md`: the
day's run-of-show, these notes, the day's demo scripts and golden-prompt sections in one
file for a tablet (R-217). Blocks on `/schulung` have anchors such as `#day-1-block-04`.

**Have ready on both days.** Two checkouts on the trainer machine: the Atelier clone
(demos, Storybook on :4400) and a scaffolded Angular workspace (what participants have,
Storybook on :6006, app on :4200). Saved outputs of every demo from the rehearsal. A
timer visible to the room. Paper: the three triage labels (code / Figma / contract),
the printed `/cheat-sheet`, the golden prompts (`tasks/schulung-golden-prompts.md`,
handed out on site, never on the projector). The run-of-show open on a second screen.

---

## Day 0: before the course

The homework is "preflight green". Decided 2026-10-14 (R-213): the mail step below
verifies it before 09:30; the helper is still the owner's call (`Proposal`):

- Ask every participant to mail, three working days before Day 1: the full
  `npm run preflight` output and the reply of
  `claude -p "Reply with exactly: PREFLIGHT-OK"`. Red seats are then known before the
  room exists; the 18-minute rescue slot in Block 01 is for the leftovers, not for first
  contact. On `/workshop#send-preflight` and in the run-of-show day frame.
- A second person for Day 1 09:30–12:15 (anyone who has run the scaffold once). Block 01
  and the Day 1 lunch are where one trainer and eight laptops do not scale.
- API budget or rate limit exhausted mid-block: run-of-show rule R12 (pair with a
  neighbour, the one with the key drives; trainer key as reserve on that seat only, for
  the day). A spend cap per seat stays organisational (R-218).

---

## Day 1: understand the tools and run the workflow end to end

### Block 00 · 09:00–09:30 · Kickoff and thesis

**On screen.** `/` overview, then `/workshop#glossary`, then two windows for D-1 plus the scaffolded workspace's terminal for its gate step, then
terminal + Atelier Storybook :4400 for D-2, then `/schulung`.

**Say.**

1. The thesis, as an argument and not a slogan: an agent multiplies what it reads. One
   canonical token name per colour and a prop table it can query → consistent output.
   Three spellings of "primary", no docs → three new spellings. So the order is
   guardrails first, speed second. The guardrails are concrete: a readable source
   (Figma masters with bound variables), a readable API (the Storybook manifest,
   `components.json`, reached over MCP), and checks that can fail (contracts, stories as
   tests, axe, parity).
2. The four pillars, one sentence each: **Figma** = source of shape and tokens (the
   Components page); **Storybook** = the manifest, the prop table the agent reads
   (Angular: `angular-component-meta`, ADR-0097); **MCP** = the connection: JSON-RPC
   tools such as `docs-show` and `figma_get_component_for_development`; **Claude Code**
   = execution: an agent in a loop that reads files, runs commands, calls those tools.
3. The loop with the tool per step, because the recap asks for exactly that:
   **Inspect** = `figma_get_component_for_development` on the node (figma-console);
   **Contract** = `workshop-<fw>/src/contracts/<name>.contract.ts`: the node id and only
   the deliberate Figma-vs-code mismatches; **Code** = a prompt in Claude Code that reads
   the docs first (`docs-show`), one story per variant value and Boolean state, a `play`
   per behaviour; **Verify** = `npm run check:contracts` (contract + manifest + story
   args against the Figma snapshot), `npm run check:stories` (every story in Chromium,
   `play`, axe), then `figma_check_design_parity` (a `codeSpec` against the master).
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
5. D-1 (same prompt twice, then a gate): point at hex vs `var(--ui-*)`, invented vs real
   `Atl*` components, `<footer>` landmark and labelled `<nav>`. One sentence: the prompt
   is identical, the context is the only variable. Then save window (a)'s CSS as
   `workshop-angular/src/footer.css` in the scaffolded workspace and run
   `npx nx stylelint workshop-angular`: red with `[RAW-COLOR]` lines. Second sentence:
   context steers, the gate catches what still slips through. Say the limit yourself: it
   reads `.css` under the app's `src/` only, not inline `style=` attributes, component
   `styles:` strings or a raw `<button>`, and `nx lint` does not run it. If time is
   short, cut the footer comparison to one difference, keep the gate.
6. D-2 (one token change in `libs/styles/src/button/atl-button.css`, `.atl-button.size-sm`
   literal `0.875rem` → `var(--ui-spacing-4)`): point at docs read first, one-line diff, a
   token not a literal, Storybook updates. Undo with `git checkout` even on success.
7. "What you learn, what you do not" (09:20, five minutes, no slide). `Proposal:` the
   list, since no file has one. Learn: prompting and judging instead of typing; the loop
   on an existing library, then on your own component; reading gate output and a parity
   report; judging a Figma file's readiness; writing a handoff document. Do not learn:
   Angular itself; Figma design craft; prompt engineering in general; building a design
   system from zero; CI, release, publishing; Claude Code internals.

**Expected recap answers.** Inspect → figma-console MCP; Contract → the contract file
(you and Claude together); Code → Claude Code with the Storybook MCP; Verify →
`check:contracts`, `check:stories`, `figma_check_design_parity`. Six of eight name all four
steps or you say them yourself and ask for the tool per step.

**Watch for.** D-1 window (a) must be a plain chat with no Atelier context, and its CSS must contain a hex/`rgb()`/`hsl()` colour or the gate stays green (use the pre-saved output). The scaffolded workspace for the gate step must be `npm install`ed and green on `nx stylelint` before the session. Late-comers:
run-of-show late-comer track; the thesis is the only thing not on a page.

### Block 01 · 09:30–10:45 · Verify the setup

**On screen.** `/workshop`, then each participant's own terminal via walking the room;
`.mcp.json` and `/mcp` side by side; `/troubleshooting`.

**Say.**

1. Three things that are independent: an installed CLI, a connected MCP server, usable
   model access. Preflight proves the first two and sends no model request.
2. What `npm run preflight` checks (so a green run is read for what it is): Node ≥ 22.12,
   npm from `package.json#packageManager`, `which claude` + `claude --version`, the Figma
   Desktop Bridge, MCP reachability, ports, Playwright Chromium. Not checked: that the
   API key works.
3. Model access: `claude auth login --console` (or `ANTHROPIC_API_KEY`), then
   `claude -p "Reply with exactly: PREFLIGHT-OK"`. A reply = access; an auth error = no
   access; no key at all = pair, trainer provisions at coffee.
4. `.mcp.json` of an Angular scaffold has **five** servers, not four (`preset.ts`
   ~L2325): `nx-mcp` (stdio, `npx nx mcp`), `storybook-angular` (http, hosted),
   `uianatomy` (http), `angular-cli` (stdio), `figma-console` (`npx figma-console-mcp@1.40.0`,
   `FIGMA_ACCESS_TOKEN` optional). Say what each is for in one line; `/mcp` must list all
   five (run-of-show and deck say five since 2026-10-14, R-206).
5. The Figma duplicate made here (10:00) is **the** duplicate for both days. Do not
   duplicate again on Day 2; its file key goes into `package.json` on Day 2 Block 02
   (R-215). Bridge check: ask Claude for the Figma status; `figma_get_status` must report
   `setup.valid: true` on the duplicate.
6. Storybook `npm run storybook` on :6006; `npx playwright install chromium` if
   preflight says it is missing.
7. Decided 2026-10-14 (R-209): green seats in the 10:25 rescue slot, ten minutes at the
   projector, `/prompts#claude-code-basics`: the workspace trust dialog on first start; permission
   prompts (what to accept: edits inside the workspace, the gate commands; what to read
   before accepting: anything that deletes or installs); `Esc` interrupts; `/clear` starts
   a fresh context, `/compact` shrinks it; one session per block, not one per day; `/mcp`
   shows servers and their state; `claude -p` for a one-shot check. Pages:
   `/troubleshooting#workspace-trust`, `#mcp-declined`, `#mcp-scope`.
8. First commit once preflight is green (R-210): the scaffold ran `git init` and staged
   everything, committed nothing; `git commit -m "scaffold: preflight green"` is the first
   "last green" Day 2's loop can fall back to. Greens do it in the rescue slot.

**Expected recap answers.** CLI installed, MCP connected, model access, each can be red
alone.

**Watch for.** Rule R1 at 09:50 (most common failing line on the projector), R2 at
10:15. Nobody continues red into Day 2 Block 01; the lunch fix is yours.

### Block 02 · 11:00–12:15 · Mini-loop: first success

**On screen.** `/tutorial`, a participant's terminal, then one parity report.

**Say.**

1. The tutorial's four stages (answer to deck TODO `D1-02-02`, from
   `docs/src/pages/tutorial.astro`): **Inspect** "Select the component in Figma";
   **Contract** "AI reads the spec"; **Generate** "AI matches to Atelier UI components"
   and "AI generates token-exact code"; **Verify** "Offline gates first, then parity".
2. The target: Settings Card, node `936-2954`, composed from AtlCard / AtlInput /
   AtlToggle / AtlButton. No new component, no API change; composition from existing
   building blocks. The prompt is live on the page (`examplePrompt`); do not retype it
   (golden prompts §1 says why).
3. What the two gates check, verbatim so the room can repeat it: `check:contracts` joins
   the contract, the docgen manifest and the stories' `args` against
   `tools/figma/snapshot.json`; `check:stories` renders every story in Chromium, runs
   each `play`, runs axe (`a11y.test: 'error'`). Exit code is the result; read it as
   `cmd > /tmp/x 2>&1; echo $?`.
4. A parity report, before anyone runs one: `figma_check_design_parity` compares the
   master with a `codeSpec` of up to seven sections (`visual`, `spacing`, `typography`,
   `tokens`, `componentAPI`, `accessibility`, `metadata`). Sections you did not pass are
   not compared. So the first line to read is the list of compared sections, not the
   verdict. `Verify in rehearsal:` which sections the tutorial's call passes; the recap
   answer depends on it.
5. Token drift in the first draft: hand the §1 add-on line, not a re-prompt.

**Expected recap answers.** Compared: the sections the tutorial passed (likely
`componentAPI`, `tokens`, `metadata`). Not compared: anything not passed (spacing,
typography), plus everything a parity call never sees: dark mode, behaviour, keyboard.
Labels (code or Figma only, no "contract" on Day 1; owner decision 2026-10-20): code, a
literal that should be a token; Figma, a master value that is simply off.

**Watch for.** A finding that fits neither label (a mismatch someone chose on purpose):
park it, say "we name it on Day 2", and do not let anyone "fix" it in code. Bridge red at 11:15 → rule R3 (trainer reads the frame once, shares the
data, marks the parity row degraded). "Prompt, do not type": watch for people editing
the generated file by hand; send them back to the prompt.

### Block 03 · 13:15–14:30 · Figma for code: is the file ready?

**On screen.** Figma desktop, the participant's duplicate: Variables panel, Components
page, Inventory page, Workshop-Templates page; `/tokens#naming`, `/tokens#pink-test`,
`/readiness`.

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
5. The readiness checklist, Part A (the master), ten checks (`docs/src/pages/readiness.astro`):
   colour/spacing/radius bound to variables; auto layout on every frame with children;
   variables scoped, not "all scopes"; each variable's code name recoverable; each
   variable says what it is for; no default layer names in the component's tree; layer
   names match across variants; the master has a structured description; variants and
   states complete and on the right axis; content decisions recorded as properties or
   with a reason. Part B (the system: Complete, Sound, Synchronized, Extensible,
   AI-ready) is for the participant's own DS and returns on Day 2 Block 05.
6. Decided 2026-10-14 (R-207): 14:00–14:15 the readiness checklist for one Atelier
   master (the own-DS form is homework); 14:15–14:25 the micro-exercise on a copy of a
   master in the duplicate: bind one fill to a Library Tokens variable, add one variant
   value, put one frame on auto layout, pink test on the copy. Checkpoint D1B03-C5 at
   14:25: the copy's fill is bound and the pink test shows it. Seat behind: the fill
   binding only. Without it, Day 2 Block 01 is the first time anyone builds in Figma.

**Expected recap answers.** Most often: "colour bound to variables" (the agent would have
read a hex), "code name recoverable" (the agent would have invented a token name),
"variants on the right axis" (the agent would have made `hover` a prop).

**Watch for.** No own-DS master → rule R4, second Atelier master, say so. Participants
without a Figma account in the room cannot do the pink test; pair them.

### Block 04 · 14:45–16:00 · Guardrails: stories as claims, and MCP

**On screen.** Hosted Atelier Storybook (`atelier.pieper.io/storybook-angular/`, fallback
:4400) for D-3; `/mcp` in Claude Code; two windows for D-4; the scaffold workspace's
Storybook :6006 for D-5.

**Say.**

1. A story is a claim: `args` claim a state, `play` claims a behaviour. Three sources,
   three roles: the component's own types are the shape (the API), the contract is the
   intent (deliberate mismatches only), the story is the claim. Who checks the claim:
   `check:stories` (`nx storybook-test`, same thing) runs it in Chromium with axe;
   `check:contracts` checks that every variant value has a story (`[COVERAGE]`, error)
   and every Boolean too (`[COVERAGE-BOOL]`, warning).
2. D-3 on the **Atelier** Storybook only: Design tab = `parameters.design` =
   `figmaNode('129-4')` on AtlButton `Primary`; the contract section at the bottom of
   the Docs tab = `contractDocsPage` in `libs/angular/.storybook/preview.ts`. The
   participant's scaffold stories carry no `parameters.design`; their Design tab is
   empty. The run-of-show row 14:45 still expects them to find it in :6006 (R-205);
   until that is fixed, say "look at mine, yours has none".
3. MCP in two sentences: a server exposes tools, the client (Claude Code) lists and
   calls them over JSON-RPC. Two surfaces for Storybook: hosted = `docs` only
   (`docs-list`, `docs-show`, `docs-show-story`); the local addon (Day 2) adds `dev` and
   `test`. The five servers from Block 01; run `/mcp`, name them.
4. D-4: window (a) invents props; window (b) calls `docs-list` then `docs-show` for
   `components-inputs-atlbutton`. AtlButton's real inputs: `variant`, `size`, `disabled`,
   `loading`, `type`. No `shadow`, no `rounded` → "not documented" is the correct
   answer. Angular-shaped reply expected; a React-shaped one (JSX, `children`,
   `on*Change`) is a regression, note it.
5. D-5 in the scaffold: the template story `AtlButton` → `Primary` has a `play` that
   clicks and expects the text `clicked`. Change `getByText('clicked')` to
   `getByText('never')`, save, Interactions panel red; fix, green. The sentence: a
   `play` that never failed claims nothing.
6. The exercise: one story with a `play` for a variant, red once, then green, prompted
   with the template story (`AtlButton`) as context (decided 2026-10-14, R-216). On Day 1
   there is no local Storybook MCP yet, so `get-storybook-story-instructions` is not
   available; say so, it arrives on Day 2 Block 02.

**Expected recap answers.** "A story claims a state and a behaviour; `check:stories`
runs the claim in a browser with axe; `check:contracts` checks the claims cover the
variants." Stretch: "not documented" is right because the manifest is the API; an
invented prop would compile nowhere.

**Watch for.** Rule R5 at 15:30 (`docs-show` on every seat) and 15:45 (red seen). Take
time from the stretch, never from the red-then-green row. Hosted endpoint down → the
CLI passthrough from the demo script, or saved screenshots.

### Block 05 · 16:10–17:15 · A screen from Storybook, against the clock

**On screen.** `/screen-from-storybook`, the timer, then one volunteer's receipts list.

**Say.**

1. Why this block: most customer teams do not build components, they write application
   code against components that already exist, and the only thing they know about them is
   what Storybook says. No Figma frame, no steps. The page gives the brief (a Team
   directory: search field, role select, invite button, table with a status badge per row,
   pagination), a starter prompt, the gates and the clock. Hints only as "which
   `docs-show` line says that?".
   Opener, inside the same 5 minutes: run one live `docs-show components-display-atltable`
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
3. The gates, as exit codes: `npm run lint` (on Angular it includes the two Atelier
   template rules: an icon-only `atl-button` needs a name, `atl-option` needs its
   `atl-select`; the table parts are not in the rule's list), `npm run check:stylelint`,
   `npm run check:format` (`npm run format` only as the fix when it fails); on Angular also
   `npm run build` (strict templates fail on an input the component does not have; the
   Vue build skips type checking and the React build is Vite, so there only the receipts
   audit catches an invented prop). Name the limits out loud: stylelint reads only
   `workshop-<fw>/src/**/*.css`, so a colour in an inline `style`, an Angular `styles`
   array or a Vue `<style>` block passes it; inside the css file it flags hex, rgb and hsl
   but not named colours, `oklch()` or `color-mix()`, and it flags a spacing literal only
   when a token holds the same value, so `padding: 13px` passes; nothing detects a
   hand-built twin of a library component; and no gate checks the running app for
   accessibility. `check:stories` renders stories, not the
   app; the stretch task (a story for the screen, then `check:stories`) is how a screen
   gets an axe run.
4. The audit: the receipts prompt on the page makes the agent print the `docs-show`
   passage behind every prop. Participants spot-check three. Green gates say the code is
   clean, not that it is honest.
5. The bridge exercise `/first-component#bridge` (add a `density` variant to SettingsCard:
   component, a story per value, contract, gates) stays the Day 1 homework for green
   seats (R-208, decided 2026-10-14); say so at 17:25. It is the only place a participant
   authors a contract before Day 2 Block 02, which opens `button.contract.ts` on the
   projector first. The kata `/first-component` is optional homework for everyone.

**Expected recap answers.** The agent broke rule 2 first (a prop or an input on a table
part or `atl-option` that `docs-show` does not list on the main entry: the Inputs block
never lists sub-component inputs such as `sortable` on `atl-th`; on Angular they are in the usage
example, everywhere in the `Sortable` story, which the opener now points at) or rule 3 (a
hand-built badge or card); `npm run build` on Angular, the template lint rules, the
receipts audit or the participant's own reading caught it. Stylelint catches a hex, rgb or hsl
colour in the `.css` file; nothing but the greps on the page catches one elsewhere, or a
named colour or pixel spacing anywhere.

**Watch for.** Hard stop 16:55 (rule R6). The 40 build minutes are an estimate and
nothing has been timed: if most seats are still on the table at minute 30, cut pagination
from the brief on the page, not the gates. Agents invent a search-bar or layout component,
forget that a filter change must go back to page 1, and put styles in an inline array. The
`docs-list` entry "cookbook" lists a "Data List with Actions" story, but `docs-show-story`
returns no code for it (checked 2026-10-20 on the Angular endpoint), so it does not hand
over the answer.

### Block 06 · 17:15–17:30 · Recap and exit ticket

**On screen.** Whiteboard, `/briefs`, `/first-component#bridge`.

**Say.** Three questions for the five-minute discussion: where did the AI guess, and
which guardrail caught it; which gate output did you read, which did you skip; what
would you check first tomorrow. The four briefs in one line each (Day 2 Block 00 has
the detail). Homework: the brief, the sketch, the bridge exercise for green seats (R-208,
decided), and the optional kata `/first-component` alone for anyone. Exit ticket: one
sentence, paper or spoken.

**Watch for.** Everyone names a brief aloud; undecided → Toast.

---

## Day 2: build your own component

### Block 00 · 09:00–09:30 · Recap, brief, skills

**On screen.** Blank for the recall; `/briefs/<name>`; Claude Code for D-7;
`ls .claude/skills` in a workspace.

**Say.**

1. Active recall, eight minutes, the room answers: name the loop and the tool per step;
   what did the parity report compare and not compare; which three setup things are
   independent; why is a story a claim; which rule did the agent break first on the Team directory and what caught it;
   what is `[COVERAGE]`.
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
4. The staleness caveat the briefs README asks you to say when you show uianatomy: the
   four records were last reviewed 2026-05-04/05, past the server's own 90-day
   threshold; a strong prior, not scripture.
5. Skills: a skill is a `SKILL.md` Claude loads when the task matches its description.
   In the workspace: `atelier-component` (the loop for this workspace; carries Blocks
   02–04), `uianatomy-mcp` (knows how to call the uianatomy tools), `figma-workspace-architect`
   (Figma workspaces only; structural Figma work, Block 01), the four Storybook skills.
   How you notice one triggered: Claude says it is reading the skill, and the tool calls
   that follow match it. How you notice it did not: it guessed instead of calling the
   tool; then name the skill in the prompt. Not in the workspace, do not show:
   `design-to-code`, `atelier-design`, `artboard-bridge`.
6. D-7 with the participant's own component; the four uianatomy ids other than `toast`
   are `Verify in rehearsal` (`search_components`).

**Expected recap answers.** `atelier-component` on "build/generate the component";
`uianatomy-mcp` on "anatomy/axes of X"; `figma-workspace-architect` on "structure the
Figma master"; noticed by the announced skill read and the tool calls.

**Watch for.** A missing skill is copied from a neighbour, logged, never re-scaffolded.

### Block 01 · 09:30–11:00 · Design in Figma and the handoff document

**On screen.** Figma desktop; `/build-your-own#block-01`; `/design-to-code#handoff-example`.

**Say.**

1. Reuse the Day 1 duplicate (R-215). Confirm the bridge is on it: Claude reports
   `figma_get_status` with `setup.valid: true`. Nobody continues red.
2. The build order that fits 40 minutes: copy the starter and rename it → the `variant`
   axis, lowercase values exactly as the code union will be (`success`, not `Success`)
   → the second axis your brief names, as a `state` axis → the Boolean properties the
   brief lists (`dismissible`, `hasIcon` …) → bind every fill, radius, padding, gap to a
   Library Tokens variable → auto layout on every frame with children → switch the
   frame to the Dark mode and look (Layer → Appearance → Variable modes) → write the
   master's description: what is out of scope, the a11y items tagged "(full component)",
   that the shadow is CSS-only, the duration or other behaviour the brief names.
3. MCP structuring (30 min): `figma-workspace-architect` is the co-pilot; the tools that
   matter are `figma_add_component_property`, `figma_analyze_component_set`,
   `figma_audit_component_accessibility`, `figma_set_description`. Ask Claude for the
   audit and read it; the bridge must stay connected.
4. The handoff document, eight items, one example line each from the Toast example:
   draft URL + node id; variants and states built (`success`, `danger` × `open`,
   `closing`); token bindings (`color/surface-raised`, `radius/md`, `spacing/*`); reuse
   vs rebuild (close button = AtlButton icon-only, not a new button); behaviour from the
   brief (Escape dismisses, timer pauses on hover: documented, not built); exclusions
   (`info`, `warning`, the six positions, stacking); target files
   (`workshop-<fw>/src/…`); acceptance criteria (`check:contracts` green, a story per
   variant and state, axe clean). A checklist, not a template. Short on time: node id,
   variants, exclusions first.
5. Decided 2026-10-14 (R-211): the five-minute "LLM-friendly API rules" talk
   (predictable naming, literal unions, composition over config, no hidden defaults) is
   the 10:40–10:45 row, directly before the handoff, because the handoff fixes the prop
   names; MCP structuring is 10:15–10:40. Block 02 no longer has it.

**Expected recap answers.** Lines you decided: reuse vs rebuild, exclusions, acceptance
criteria. What the AI would have guessed: prop names, the position values, a shadow
variable, a `state` prop.

**Watch for.** Rule R7 at 10:15 and 10:35 (give MCP time to the manual row, never cut
the handoff). Bridge drops → `/runbook#stale-instances`. Figma novices stall on the
variant axis UI; walk the room with the five-step build order above, not with Figma
theory. `Verify in rehearsal` (R-214): a free-plan Figma account keeps the Dark mode in
a duplicated file and can import the dev plugin.

### Block 02 · 11:15–12:30 · Contract, component, stories

**On screen.** Terminal (`claude mcp add`, tool list), `/design-to-code#contract-example`,
`/design-to-code#finding-codes`, one participant's `check:contracts` output.

**Say.**

1. The local Storybook MCP: `npm run storybook`, then
   `claude mcp add --transport http storybook-local http://localhost:<port>/mcp` with the
   port Storybook printed, local scope (default, `.mcp.json` untouched), reconnect, check
   `get-storybook-story-instructions`, `stories-preview`, `test-run` are listed. "Not
   available" = not configured. From now on `get-storybook-story-instructions` before
   every `*.stories.*` edit.
2. What a contract holds (ADR-0121): the master's node id and only the mismatches you
   chose on purpose: `figmaOnly` (an axis Figma draws and code does not, the `state`
   axis), `codeOnly` (a prop code has and Figma does not), `axisMap` (same thing, two
   names), `probes`. Never props, defaults, unions, prose: the component's own types are
   the API. Typed through `ComponentContract` from `workshop-<fw>/src/contracts/types.ts`;
   the example `button.contract.ts` next to it is the template. Open that file on the
   projector once; nobody has seen it yet.
3. Start a fresh Claude session for this block (`/clear`). Paste golden prompt §2.1 with
   the handoff document inside. One step: contract, component with its test, stories;
   one story per variant value and Boolean state, a `play` per behaviour line.
4. The snapshot: `npm run figma:snapshot` needs the **bridge**, not the REST token: the
   script probes the bridge and exits 2 if it is not connected
   (`tools/design-contracts/bin/figma-snapshot-contracts.mjs` L21–22, L267–280). First
   replace `<YOUR_FIGMA_FILE_KEY>` in `package.json` with the duplicate's key. Output:
   `tools/figma/snapshot.json`, pre-filled only with AtlButton.
5. `npm run check:contracts` and its codes, with severity (from the scaffold's
   `check-contracts.mjs` and `/design-to-code#finding-codes`): `[NO-MASTER]` warning (your
   node is not in the snapshot: snapshot first); `[COVERAGE]` error (a variant value no
   story renders); `[COVERAGE-BOOL]` warning; `[AXIS]` and `[BOOLEAN]` (names or values
   differ between Figma and code); `[NO-STORY-META]`, `[CONTRACT-IMPORT]`,
   `[CONTRACT-DUPLICATE]`, `[ROSTER]`, `[DOCGEN-FAILED]`, `[DOCGEN-EMPTY]`, `[FW-ONLY]`.
   Exit 0 with `[NO-MASTER]` is not green; read the output, not only the code.
6. `npm run check:contracts -- --emit <folder>` writes the codeSpec fragment
   (`componentAPI`, `metadata`, `tokens`) for Block 04; `/schulung` and the run-of-show
   name the same command since 2026-10-14 (R-206).
7. `tags: ['autodocs']` on the generated story, or there is no Docs tab.
8. On the page since 2026-10-14 (R-219): `/verify` in Claude Code runs all five gates;
   the two first run by hand in Day 1 Block 05, formatting and CSS lint, are cheap and
   mechanical, fix by prompt.
9. First five minutes of the 11:25 row on the projector (R-208): `button.contract.ts` and
   `types.ts`, the `ComponentContract` shape Claude generates against; green seats met it
   in the bridge exercise. The generation row is 11:25–11:50.

**Expected recap answers.** "Figma draws a `state` axis, code has none: `figmaOnly` in
the contract." "Figma has `position` on the viewport frame, code has it on the
provider: `axisMap`." Written in `workshop-<fw>/src/contracts/<name>.contract.ts`.

**Watch for.** Rule R8 at 11:25, R9 at 12:15 (all `[NO-MASTER]` = snapshot, not code).
A stalled seat: check the handoff document first, not the prompt.

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
4. Decided 2026-10-14 (R-210): commit when a gate goes green
   (`git add -A && git commit -m "<step>: green"`); after two failed fixes stop,
   re-diagnose, and if the patches made it worse `git checkout -- .` back to the last
   green commit instead of a third patch. The scaffold runs `git init` and stages,
   commits nothing (`preset.ts` ~L2279); the first commit is Day 1 Block 01's. Rows since
   2026-10-14: 10 focus/rubric, 15 correction prompts (C2 at 13:55), 10 test-loop demo,
   25 self-healing loop (C4 at 14:20), 10 AI-assisted debugging, 3 stretch, 2 recap; the
   block ends 14:45, coffee 14:45–15:00.
5. The test loop: `test-run` over the local MCP = `npm run check:stories` =
   `nx storybook-test <fw>` (every story in Chromium, `play`, axe). `nx test` /
   `check:unit` is the jsdom half only. Never two `storybook-test` at once (shared
   browser port).
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
and theme toolbar; terminal + DevTools for the codeSpec; two parity reports for D-8.

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
   press (`plan/design-principles.md` §1); disabled = `opacity: var(--ui-opacity-disabled)`,
   `cursor: not-allowed`, `pointer-events: none`; the focus ring comes from tokens.
4. Dark mode: the **theme** control in the Storybook toolbar (`withThemeByDataAttribute`,
   sets `data-theme`, the selector `tokens.css` switches on). The **backgrounds** control
   is canvas colour, not a theme (ADR-0142). Golden prompt §3.2 names the theme control
   since 2026-10-14 (R-205). Axe runs in light mode only: the toggle is a preview, not
   coverage. Three confirmations per §3.2: every colour through `--ui-*`, no transform
   on hover, disabled unchanged.
5. The codeSpec, assembled by hand once: the fragment from
   `npm run check:contracts -- --emit <folder>` gives `componentAPI`, `metadata`,
   `tokens`; for `accessibility`, open the story in the running Storybook, DevTools →
   right-click the story's root element → Copy → Copy outerHTML, pass it as `html` with
   `mapToCodeSpec: true` to `figma_scan_code_accessibility`. Four sections is the normal
   case. No bridge → the loop ends after `check:contracts` + `storybook-test`; say
   "degraded" on the seat, not silently.
6. D-8, parity on purpose (golden prompts §3.3): call 1 with all seven sections and one
   wrong spacing value → flagged as major; call 2 with the same wrong value and `spacing`
   omitted → no spacing row, and the score rises (48 → 72 on AtlButton, 2026-10-14).
   Fields not passed are not compared; a rising score is not a better component. The
   report has no "compared sections" list: point at `codeData` (what was passed) and
   `summary.categories` (only categories with findings). Variant node for geometry,
   component set for `componentAPI` (a variant has no component properties).
7. Triage: every finding one label, code / Figma / contract, three minutes, the same
   labels, except that "contract" is new today: Day 1 Block 02 practised only code and
   Figma (inside the line-by-line reading, no extra time). Introduce "contract" now, anchored
   on Block 02: the mismatches chosen on purpose and recorded in the contract file.

**Expected recap answers.** Code: a missing `aria-label` on the close button, a literal
colour. Figma: an unbound fill, a wrong layer name. Contract: the `state` axis. Almost
mislabelled: a deliberate mismatch nearly "fixed" in code.

**Watch for.** Rule R11 at 15:30: axe first, parity rows shrink before a11y does. Confirm
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
   a gate it did not run, fixing a deliberate mismatch in code; when Claude fails: unknown
   library (no MCP), a question it should have asked (scope guard missing), a long
   session without `/clear`; drift: it starts in Figma (unbound value) or in the
   contract (an undocumented mismatch), and the parity call only sees passed sections.
3. Transfer, 17:15–17:27 (decided 2026-10-14, R-212): `/design-principles#check-your-own`
   is written as a **30-minute** exercise (run, pick one finding, fix, re-run), and so is
   `/storybook-readiness#self-check`; in the room (12 minutes) they start it and pick the
   one finding. The full run and the fix come after the course; the finding is the next
   step they write down. Second choice, same scope and same output: a participant whose team already
   has a Storybook runs `/storybook-readiness#self-check` instead and picks one finding
   from it. `/readiness` Part B (Complete,
   Sound, Synchronized, Extensible, AI-ready) is the other lens for a next step.
4. Workspace anatomy, 17:00–17:15 (decided 2026-10-14, R-212), what your own repo needs
   to run this loop, one file each, shown in a participant's own workspace tree: a Storybook that emits
   `components.json` (docgen) and serves `/mcp`; `.mcp.json` with that server and
   figma-console; a `CLAUDE.md` with the token rule and the loop (`/claude-md`); the
   skills you want loaded (`/agent-skills`); a contracts folder and the `check:contracts`
   gate (the scaffold's `tools/design-contracts/` is copyable); stories as tests
   (`addon-vitest` + `addon-a11y`); the bridge for parity. Example next steps: "bind the
   variables on our Button master", "add docgen to our Storybook", "write the CLAUDE.md
   token rule".
5. Exit round and the follow-up channel (owner, TODO).

**Expected recap answers.** One sentence each; a concrete first action in their own DS.

**Watch for.** Eight presenters = 24 minutes; the whiteboard synthesis is eight minutes
from what was shown, not a lecture. Rows since 2026-10-14: 3 rules, 24 show & tell
(16:28–16:52), 8 synthesis, 15 anatomy, 12 transfer, 3 exit; 65 minutes.

---

## Answers to the deck's open TODO(owner)

- `D1-00-03` glossary definitions: Day 1 Block 00 §4 above (verbatim from `glossary.ts`).
- `D1-02-02` tutorial step titles: Inspect "Select the component in Figma" · Contract
  "AI reads the spec" · Generate "AI matches to Atelier UI components" / "AI generates
  token-exact code" · Verify "Offline gates first, then parity" (`tutorial.astro`
  L1002–L1212).
- `D1-03-04` pink test mechanics: Day 1 Block 03 §4 above (`/tokens#pink-test`).
- `D2-05-03` synthesis seeds: Day 2 Block 05 §2 above, to be replaced by the room's.
- The screenshot list's loop-diagram note points at `D1-00-08` (the recap) since
  2026-10-14; it said `D1-00-07` before.
- Still owner-only: cohort date and trainer names (`D1-TT-01`), the wordmark asset, the
  follow-up channel (`D2-05-06`, `D2-CL-02`).

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
