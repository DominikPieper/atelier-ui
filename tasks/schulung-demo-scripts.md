# Schulung Demo Scripts

_Written 2026-10-13, revised 2026-11-18 for ADR-0180 (the ladder of standard tools; the contract leaves the participant path). Trainer material, not participant-facing._

One script per live demo the current agenda (`docs/src/pages/schulung.astro`)
contains. Times and block names come from there; where each demo sits in the minute
plan is in `tasks/schulung-run-of-show.md` (ids `D-1`…`D-8`). Prompts that already
live in `tasks/schulung-golden-prompts.md` are linked, not copied.

**Revision 2026-11-18 (ADR-0180).** D-1, D-3, D-4, D-5, D-7 and D-8 changed; D-2 and D-6
did not. The demos are the first beat of the proof thread, "the ladder" (five standard
tools; each taught as: break it on purpose, the tool says so, the agent gets the output and
repairs). Every new or changed step below is **NOT YET VERIFIED (rehearsal, R-040)** unless
it carries a measured date. Measured 2026-11-17 on a fresh `create-atelier-ui-workspace@0.4.10`
Angular scaffold: the compiler results of D-4, and the warm run times (build 6-9 s, lint 6-7 s,
stylelint 2-4 s). The minute rows are the run-of-show estimates.

**Revision 2026-11-18 (ADR-0181).** D-7 is rewritten. uianatomy left the course and the
scaffold: its hosting is not reliable enough to stand in a live block. D-7 now shows what a
skill is on a local file and needs no network.

**Verification convention (original, 2026-10-13).** Every command, MCP tool name, port, path and id below was
checked against this repo on 2026-10-13 (grep/ls, `docs-list` on the hosted Angular
endpoint, and `npm run check:artboard-palette` exit 0). Anything I could not check is
marked **UNVERIFIED**. Nothing here has been rehearsed live; "expected result" is
derived from the code, not from a recorded run.

## Demos in the current agenda, and what was dropped

| Id  | Demo                                                                   | Where on `/schulung`                              | Min | Status                                      |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------- | --- | ------------------------------------------- |
| D-1 | Guardrail demo: same prompt without/with MCP, then stylelint (stage 3) | Day 1 Block 00, 09:09-09:14                       | 5   | Reworded (ladder stage 3)                   |
| D-2 | One-change live demo                                                   | Day 1 Block 00, 09:14-09:19                       | 5   | Kept, narrowed to one framework             |
| D-3 | Design tab in Storybook                                                | Day 1 Block 04, 14:30-14:37                       | 7   | Shortened (was 10; contract section gone)   |
| D-4 | Hallucination, the compiler stage (stage 1), then `docs-show`          | Day 1 Block 04, 14:47-15:00                       | 13  | Extended (was 10; compiler stage added)     |
| D-5 | Red-then-green story with a `play` function (stage 4)                  | Day 1 Block 04, 15:15-15:40                       | 25  | Named as ladder stage 4, steps unchanged    |
| D-6 | Three directions (Claude Design) + palette fence                       | Day 1 buffer 15:45-15:55, 10 min, or skip         | 10  | Kept, optional                              |
| D-7 | What a skill is, on a local file                                       | Day 2 Block 00, 09:13-09:18                       | 5   | Rewritten (ADR-0181; was the uianatomy MCP) |
| D-8 | Parity on purpose, trainer machine only                                | Day 2 Block 04, inside the parity row 15:45-15:53 | ~3  | Shortened (was 15), trainer only            |

**Dropped (no longer in the agenda):**

- **Cross-framework "one change" demo.** The agenda is one framework per cohort;
  D-2 shows the change in the Angular Storybook only. (The CSS under `libs/styles` is
  shared by all three frameworks, so React/Vue would show the same change; saying so in
  one sentence is optional, not a demo.)
- **Changed-stories micro demo** (`stories-changed`). It appears nowhere in
  `schulung.astro` (grep). The open item is R-130 in `tasks/reviews.md`.
- **A11y three-step on a deliberately broken component.** The agenda has the three-step
  a11y check as a participant exercise on their own component (Day 2 Block 04), with
  no broken specimen to demonstrate on. If you want a specimen, use
  [golden prompts §3.1](schulung-golden-prompts.md#31-three-step-a11y-audit-prompt)
  on a participant's component; no script is needed.

## Shared preconditions (trainer machine)

- Two checkouts or one: the **Atelier clone** (this repo) for D-1 (windows a/b), D-2, D-6, D-8
  (D-8 on the trainer machine only), with the `.mcp.json` servers connected (`/mcp` in Claude Code lists
  `storybook-angular`, `storybook-react`, `storybook-vue`, `nx-mcp`, `figma-console`,
  `uianatomy`, `angular-cli`, `Astro docs`; `uianatomy` is the repo's own tooling, no demo
  calls it, and a failed entry there is harmless). A **scaffolded workspace** (Angular,
  `npx create-atelier-ui-workspace`, Storybook on `localhost:6006`, app on
  `localhost:4200`) for D-3, D-4 (window b and the compiler stage), D-5 and for D-1 step 3 (the stylelint
  check), because that is what participants have. Its `.mcp.json` has five servers: `atelier`
  (the library's docs, stdio, no port), `storybook-local` (the workspace's own Storybook,
  connected only while `npm run storybook` runs; tools missing: check Storybook runs, then `/mcp`, reconnect),
  `nx-mcp`, `angular-cli`, `figma-console`. The library Storybook is mounted at
  `http://localhost:6006/atelier/`.
- Atelier Angular Storybook: `nx storybook angular` (project `angular`, target
  `storybook`, binds **4400**). React is 4401, Vue 4402 (`libs/react/project.json`,
  `libs/vue/project.json`); not needed for any demo.
- Figma Desktop Bridge connected: needed only for D-8. For all others, not needed.
- Clean working tree before each demo (`git status` empty), so `git checkout <file>`
  is the whole undo.
- Every demo has a **saved-output fallback**: run it once in the 24 h before, save the
  terminal output / screenshots in a scratch folder (outside the repo). That is the
  fallback below whenever it says "pre-saved".

---

## D-1 · Guardrail demo (Day 1 Block 00, 09:09-09:14, 5 min) · ladder stage 3

**Goal.** Two messages in one demo. (1) Context steers the agent: the same prompt gives a
hallucinating answer or a token-exact one, and participants name one concrete
difference. (2) Context is not enough on its own: a lint rule (stylelint) in the
workspace catches what still slips through, so AI output cannot quietly bypass the design
system. This is stage 3 of the ladder (the slide at 09:19 names all five stages), and it
is taught with what it does not see (below).

**Preconditions.**

- Two windows side by side: (a) a plain chat with no design-system context (no MCP, no
  `llms-full.txt`), (b) Claude Code in the Atelier clone with the Storybook MCP
  connected (`storybook-angular`).
- A **scaffolded workspace** (Angular, `npx create-atelier-ui-workspace`; the one from
  the shared preconditions above) with `npm install` done and a clean tree, a terminal
  open in its root. It must contain `stylelint.config.mjs` and `tools/stylelint-rules/`
  (the generator writes both) and the app `workshop-angular/`. Run
  `npm run check:stylelint` once before the session: it must exit 0 on the
  untouched scaffold, otherwise the red run proves nothing. (Warm run measured
  2026-11-17: 2-4 s.)
- Rehearse step 3 once (see "Expected result") and keep the CSS file ready in a scratch
  folder, so the live step is a copy, not a typing exercise.
- Source of the prompt and the framing: `docs/src/pages/prompts.astro`, card
  `same-prompt-demo`, rendered at `/prompts#guardrails`.
- Do not use a model with the Atelier files pre-loaded in window (a).

**Prompt (identical in both windows, verbatim):**

```text
Add a simple page footer: a logo, three columns of links (Product, Company, Legal) and a copyright line.
```

**Steps and timing (5 min).**

1. 0:00 to 0:30 Send the prompt in both windows (or show the pre-saved outputs).
2. 0:30 to 2:30 Compare (a) and (b): hex vs `var(--ui-*)`, invented vs real `Atl*`
   components, landmark and labelled `<nav>`. One sentence: "the prompt is identical; the
   context is the only variable."
3. 2:30 to 4:30 Take the CSS from window (a) (the `<style>` block or the footer's CSS)
   and save it as `workshop-angular/src/footer.css` in the scaffolded workspace. Run
   `npm run check:stylelint` (it runs the `stylelint` target of every project;
   `npx nx stylelint workshop-angular` is the single-project form). It goes red.
4. 4:30 to 5:00 Say what it does not see (below) and the sentence in "Point at".

If time is short, cut step 2 to one difference (hex vs token) and keep step 3; step 3
is the new message, step 2 is the one participants can already see on screen.

**Expected result.**

- (a) typically hard-coded hex colours, generic class names, invented or no components,
  minimal a11y (no landmark, unlabelled nav). Not deterministic; this is the _expected
  tendency_, not a guaranteed output. **UNVERIFIED** (not recorded in this repo).
- (b) uses `Atl*` components and `--ui-*` custom properties, because it reads the
  docs through the MCP first.
- Step 3: the command exits non-zero (stylelint exit code 2 for lint errors) and prints
  one `[RAW-COLOR]` error per raw colour, in the shape (verified 2026-10-20 by running
  the scaffold's three rules and config shape against a stand-in file, not in a
  freshly generated workspace):

  ```text
  workshop-angular/src/footer.css
    1:16  ✖  [RAW-COLOR] 'background' uses literal '#1a1a2e' — use a --ui-* token (or var(--token, fallback)) instead of a raw color literal.  atelier/no-raw-color-literal
  ```

  Which lines appear depends on what window (a) wrote. If (a) used only named colours
  or `var(--x)` of its own, nothing is flagged: pick a model output that contains hex,
  `rgb()` or `hsl()`, or fall back to the pre-saved one. Typo'd tokens (`var(--ui-space-4)`
  where only `--ui-spacing-4` exists) are reported as `[UNDECLARED]`, and a literal that
  equals a token's value (e.g. `#006470` when `--ui-color-brand` holds it) as `[BYPASS]`.
  Exact generated-workspace output is **UNVERIFIED** (no workspace was generated; it
  needs `npm install`).

- Fix to close the loop (optional, 30 s): replace the hex with the `--ui-*` token from
  `workshop-angular/src/styles/tokens.css`, re-run, exit 0.

**Point at.** Colour values (`#...` vs `var(--ui-*)`), component names that do not
exist in the library, `<footer>` landmark, labelled `<nav>`, focus styles; then the
red terminal. Two sentences: "the prompt is identical; the context is the only
variable" and "the context steers, a lint rule catches what still slips through."

**What it does not see (say it out loud, do not let a participant find it).** This stage is
narrow. What it reads: `workshop-angular/src/**/*.css` only (`tokens.css` is excluded,
because it defines the literals), and only colour literals, undeclared `--ui-*` tokens
and literals that duplicate a token's value. What it does not catch: (1) colours in
inline `style="..."` attributes in a template, (2) colours in a component's inline
`styles: [...]` string in a `.ts` file (and in `.scss` or any non-`.css` file),
(2b) named colours (`red`) and `oklch()`, (3) a
raw `<button>`, `<input>` or `<div class="card">` instead of `AtlButton` and friends:
no shipped lint rule asks for library components. The two shipped template rules
(`atl-button-icon-only-needs-name`, `atl-sub-component-needs-parent`) only check how an
`Atl*` component is used, and angular-eslint's accessibility preset checks a11y of
whatever is there. Closing those gaps is the participant's own next step (Day 2
transfer). Also: `npm run lint` does not run stylelint; it is a separate command, so a
participant who only runs lint sees green. (Stage 2, ESLint, belongs to Block 02; its
demo is not this one.)

**Fallback.** Show the two pre-saved outputs from your rehearsal. If (b) does not call
the MCP, say "it did not read the docs, so it guessed" and re-run with "Use
`docs-list` first". If step 3 is green because (a)'s CSS has no hex, paste the saved
red terminal output or run the command on the pre-saved CSS file. If `npm run` is slow, run
`npx stylelint 'workshop-angular/src/**/*.css' --ignore-pattern
'workshop-angular/src/styles/tokens.css' --config stylelint.config.mjs` directly (the
exact command the target runs). Do not improvise a different prompt.

---

## D-2 · One-change live demo (Day 1 Block 00, 09:14-09:19, 5 min)

**Goal.** Make the loop concrete before any theory: a component change by prompt, seen
in Storybook, in five minutes.

**Preconditions.**

- Atelier clone, clean tree, Angular Storybook running: `nx storybook angular`,
  open `http://localhost:4400`, story `Components/Inputs/AtlButton`.
- Story id for the preview: `components-inputs-atlbutton--small` (title
  `Components/Inputs/AtlButton`, export `Small` in
  `libs/angular/src/lib/button/atl-button.stories.ts`).
- Claude Code in the same clone with `storybook-angular` connected.
- The button's CSS is shared by all frameworks:
  `libs/styles/src/button/atl-button.css`; at the time of writing the small size has a
  horizontal padding of literal `0.875rem` (line 131 of that file) **only on the demo tag**:
  main fixed it to `var(--ui-spacing-4)` on 2026-11-19 after a Figma parity check (Figma binds
  spacing/4 = 16px). Before the demo: `git switch --detach demo/d1-button-padding` (the tag
  is the commit before that fix), then restart Storybook. On the tag it has no
  `--ui-spacing-*` equivalent (the scale has `3` = 0.75rem and `4` = 1rem).

**Prompt (verbatim, deliberately explicit so the diff is predictable):**

```text
Use the storybook-angular MCP (docs-show for components-inputs-atlbutton) first.
In libs/styles/src/button/atl-button.css the small size (.atl-button.size-sm) has a
horizontal padding of the literal 0.875rem. Change it to var(--ui-spacing-4).
Change nothing else, no API change. Then tell me which line you changed.
```

**Expected result / diff.** One line in `libs/styles/src/button/atl-button.css`:
`0.875rem` → `var(--ui-spacing-4)` inside `.atl-button.size-sm`. Reload story
`Small`: the button is visibly wider by 2 px per side. **UNVERIFIED** that Claude does
exactly this and nothing more (not rehearsed).

**Point at.** (1) Claude reads the docs before editing, (2) the diff is one line,
(3) it uses a token, not a literal, (4) the preview updates without a rebuild step you
had to do.

**Undo (always, even on success):** `git checkout libs/styles/src/button/atl-button.css && git switch main`.
The point to add after the demo: this exact change is the real fix main received on
2026-11-19, found by comparing the code with the Figma variable binding.

**Fallback.** Live change fails or Storybook does not hot-reload: show the saved diff
and screenshot. If Claude edits more than one file, revert and say "that is exactly why
the next two days are about checks the agent runs on its own work".

**Not specified on `/schulung`:** whether this demo runs in the Atelier clone or in a
workspace. The scripts above assume the clone (it has the story with the stable id).

---

## D-3 · Design tab (Day 1 Block 04, 14:30-14:37, 7 min)

**Goal.** Show the one thing "explained nowhere else": the Design tab
(`parameters.design`, addon-designs), which puts the Figma frame next to the component.
NOT YET VERIFIED (rehearsal): the 7-minute timing.

The contract section of the Docs tab (`contractDocsPage`) is no longer part of this
script (ADR-0180: the contract leaves the participant path). If someone asks about it,
one trainer sentence at most: Atelier's own repo keeps its deliberate differences from
Figma in a contract file that a check reads; participants write theirs down in the
handoff document on Day 2. Do not scroll to it, do not open it.

**Preconditions.**

- Primary: the library Storybook mounted in the trainer's own workspace,
  `http://localhost:6006/atelier/` (`npm run storybook` running), story AtlButton, Design
  tab. NOT YET VERIFIED (rehearsal): the Design tab inside the mounted build. One fallback:
  the hosted Atelier Storybook, `https://atelier.pieper.io/storybook-angular/`.
- The participants' scaffolded workspace stories (the `AtlButton` template under
  `libs/create-workspace/src/generators/preset/files/storybook/angular/`) carry **no**
  `parameters.design`, so their own Design tab is empty. Participants watch the projector;
  they may open the same `localhost:6006/atelier/` URL on their seat. Demo on the library
  Storybook, not on a participant's own stories.

**Script.**

1. Open `Components/Inputs/AtlButton` → story `Primary` (`parameters.design` is
   `figmaNode('129-4')` in `atl-button.stories.ts`). Click the **Design** tab: the Figma
   frame is shown next to the component.
2. Switch to another story of the same component and back; say what the tab is: a link
   from the story to the frame it was built from, nothing more.
3. Name the claim, which is the lead-in to D-4: "the design is the reference; the
   component's own types and the docs are what an agent reads".

**Expected result.** Design tab shows the frame.

**Fallback.** Design tab blank (Figma embed blocked/offline): show the screenshot, say
"it is a link to the frame, nothing more".

---

## D-4 · Hallucination, the compiler stage, and `docs-show` (Day 1 Block 04, 14:47-15:00, 13 min) · ladder stage 1

**Goal.** Participants see (1) that the same question is answered wrongly without MCP and
correctly with it, (2) that the compiler catches a wrong value and a bound invented input
but not an invented static attribute, and (3) that "not documented" is the right answer
for a missing prop. The 3 minutes for (2) are taken from D-3.

**Preconditions.**

- A browser chat with no MCP and no repo access (window a).
- Claude Code in the **scaffold workspace** with `atelier` connected (window b): the
  workspace is already on screen for the build step. Tools: `docs-list`, `docs-show`,
  `docs-show-story` (`atelier` serves `docs` only).
- The same **scaffolded Angular workspace** (the one participants have) for the compiler stage,
  clean tree, with a template that already uses `atl-button` (the Settings Card from
  Block 02, or the `AtlButton` story's host). `npm run build` must exit 0 before you
  start; otherwise the red run proves nothing. Warm build measured 2026-11-17: 6-9 s.
- Verified on 2026-10-13 via `docs-list` on the hosted Angular endpoint: id
  `components-inputs-atlbutton` exists (`AtlButton`). `AtlButton`'s inputs per
  `libs/angular/src/lib/button/atl-button.ts`: `variant`, `size`, `disabled`,
  `loading`, `type`. It has no `shadow` or `rounded` input.

**Prompts (verbatim):**

Window (a), no MCP:

```text
What props does the AtlButton component of the Atelier UI library have? List them with their allowed values.
```

**Order of the row (13 min).**

1. 0:00 to 2:00 Window (a): the hallucination.
2. 2:00 to 5:00 **Compiler stage (ladder stage 1), three beats** (below).
3. 5:00 to 10:00 Window (b): `docs-show`, then the stretch.
4. 10:00 to 13:00 Every participant runs the (b) prompt in their own workspace (the
   "Then" paragraph at the end).

### Compiler stage (the three beats)

The agent runs the build; the trainer only pastes the invented usage. Prompt shape for
every beat (the agent runs the command, you do not):

```text
Run `npm run build`. Report the exit code. If it is not 0, read the output (the full log when the summary has no error text), and tell me the error code and message. Do not fix anything yet.
```

1. **Break it on purpose, an invalid value on a real input.** In a template that uses
   `atl-button`, paste:

   ```html
   <atl-button variant="ghost">Cancel</atl-button>
   ```

   The agent runs `npm run build`. Expected: non-zero exit, `TS2322`, and a message that
   lists the allowed values (measured 2026-11-17, 0.4.10 scaffold). Say: the tool says
   so, and it names the allowed values.

2. **A bound input that does not exist.** Replace it with:

   ```html
   <atl-button [shadow]="'lg'">Cancel</atl-button>
   ```

   Expected: non-zero exit, `NG8002` (measured 2026-11-17). Now let the agent repair from
   the output ("Repair from the build output, run the build again, report the exit
   code."): third beat, the agent gets the output and repairs. Check what it did: removed
   `shadow`, or invented a workaround?

3. **The same invented name as a static attribute.** Paste:

   ```html
   <atl-button shadow="lg">Cancel</atl-button>
   ```

   Expected: **exit 0, the build is clean** (measured 2026-11-17; so is an invented
   output such as `(pressed)`). Pause on the green result.

**The line for the room (say it):** "the compiler catches a wrong value, not an invented
name. That is why `docs-show` comes first, and why Block 05 asks for receipts: a source
for every property."

**Fallback.** The agent stalls or the summary shows no error text: the trainer types
`npm run build` in the terminal and reads the error aloud; point at the full log path it
prints. If a beat does not fail as described, show the saved output of the rehearsal and
say it is a saved run; do not improvise a different snippet. After the demo: remove the
pasted snippets (`git checkout <file>`).

Window (b), with MCP:

```text
Use the atelier MCP. Call docs-list, then docs-show for the AtlButton id, and list its props with allowed values. Do not guess.
```

Stretch (page: "ask the MCP server for a prop that does not exist"):

```text
Does AtlButton have a `shadow` prop? Answer from docs-show only.
```

**Expected result.** (a) an invented or generic prop list (typical for an unknown
library). **UNVERIFIED** as a recorded run; the demo's strength is the tendency, so
run it once beforehand and save the answer. (b) `variant`, `size`, `disabled`,
`loading`, `type`, framed in Angular terms (inputs, not React-style props). Stretch:
"not documented". Compiler stage: see the three beats above.

**Point at.** In (b) the tool calls (`docs-list` then `docs-show`) before the answer.
The sentence: "if it is not documented, it does not exist; say so rather than invent".

**Fallback (the MCP part).** Show pre-saved screenshots.

**Then (same row):** every participant runs the (b) prompt in their own workspace and
confirms the reply is shaped for Angular. A React-shaped reply (JSX, `children`,
`on*Change`) is a regression; note it.

---

## D-5 · Red-then-green story with a `play` function (Day 1 Block 04, 15:15-15:40, 25 min exercise) · ladder stage 4

**Goal.** Model the first red-then-green cycle once, so participants copy the habit:
a story that never failed claims nothing. This is stage 4 of the ladder; the steps do not
change. What it does not see (say it): anything without a story, dark mode (axe runs in
light mode only), and a keyboard path no `play` walks. From here the local server is part of
the course: the agent calls `get-storybook-story-instructions` before it writes the story and
runs `test-run` through `storybook-local` on it, so it sees the red itself; the participant
watches the same red in the play panel. Day 2 Block 03 repeats this as the self-healing loop.
`test-run` through `storybook-local` on a seat: verified headless 2026-11-18 (R-262); the interactive run is open in R-040 (it passes, and a planted failure is reported).

**Preconditions.**

- A **scaffolded Angular workspace** (what participants have), `npm run storybook` on
  `localhost:6006`.
- Existing pattern to copy: the `AtlButton` template (the `Primary` story with a
  `play` that clicks the button and expects the text `clicked`), from
  `libs/create-workspace/src/generators/preset/files/storybook/angular/atl-button.stories.ts.template`.
  Its destination path inside a generated workspace is **UNVERIFIED**; use
  `find . -name "atl-button.stories.ts" -not -path "./node_modules/*"`.
- Story id: title `AtlButton` gives `atlbutton--primary`, **UNVERIFIED** (derived
  from Storybook's id rule, not seen in a running scaffold).

**Script.**

1. Open story `Primary`, show the `play` panel (Interactions) green.
2. Break it on purpose in the story file: change `getByText('clicked')` to
   `getByText('never')`. Save. The play panel goes **red**. Say: "this is the claim
   failing; a play that never failed would claim nothing".
3. Fix it back. Green again.
4. Ask participants to do the same on a variant they write themselves (the exercise): the
   agent calls `get-storybook-story-instructions`, writes the story, runs `test-run` through
   `storybook-local` and reports the red; the participant fixes by prompt until green.

**Expected result.** Interactions panel: red with a "Unable to find an element with the
text" style message, then green. Exact message text **UNVERIFIED**.

**Gate check (optional, trainer machine, not live):** `nx storybook-test <fw>` (Atelier clone; a generated workspace uses `npm run check:stories`) renders
every story and would fail on the broken `play`; do not run it live (shares Vitest's
browser port; never two at once).

**Fallback.** HMR does not refresh the panel: reload the story. If the scaffold's
story lacks the `play`: write the 3-line `play` live from the template shape above.
`storybook-local` not connected: Storybook is not running; start it (the tools appear on
their own), `/mcp` → reconnect is the fallback; the play panel shows the same red meanwhile.

---

## D-6 · Three directions, Claude Design (Trainer appendix, optional, 10 min in the Day 1 buffer)

**Goal.** Show that a Claude Design artboard has none of the four gate identities, and
that the palette gate fences exactly the generated sheet, not the artboards.

**Slotting.** Owner decision 2026-10-14: it runs in the Day 1 buffer 15:45–15:55
(between Block 04 and Block 05), cut to 10 minutes, or is skipped. It does not fit
inside Block 04's 75 minutes.
Trainer machine only: `claude.ai/design` needs a different login than the cohort's training
subscription.

**Preconditions.**

- Logged in to Claude Design on the trainer machine. In this session the
  `claude-design` MCP server failed to connect (HTTP 403 on the login); re-run
  `/design-login` before the day, and test it. **UNVERIFIED** whether it is fixed.
- Three direction artboards for the Toast brief (`workshop/briefs/toast.md`) generated
  **beforehand in the coffee break 14:15–14:30**, seeded from the generated palette
  `tools/design/artboard-palette.css` (not from the `atelier-design` skill).
- Fallback assets in the repo: `tools/design/artboards.json` holds 31 artboards
  (checked: 31 entries), including `AtlToast.dc.html`.
- Clean tree (the demo ends with an edit to `artboard-palette.css`).

**Script (as on the page).**

1. Name the four gate identities in one sentence: the Figma `COMPONENT_SET` with
   variant axes, the component's literal union, the `--ui-*` token, the Figma node id.
2. Show the three artboards. Hard-code a colour in one artboard.
3. Run `npm run check:artboard-palette`. Expected **green** (exit 0): it reads only the
   shared sheet against `tokens.css`, not any artboard. Verified green on 2026-10-13
   with `npm run check:artboard-palette` (exit 0,
   `✓ artboard palette in sync with tokens.css (48 value(s))`).
4. Change one colour value in `tools/design/artboard-palette.css` (for example the
   `--primary: #006470;` line), run the same command again. Expected **red** (the file
   header says it is generated; the check script prints that it "is out of sync with
   tokens.css"). Red output text not run today, **UNVERIFIED** as a live red.
5. **Checkpoint question to the room:** which of the four gate identities does this
   artboard have? Expected: none. Only then the classification: Claude Design is step 0
   (divergence) and step 5 (handoff), never steps 1–4. Step 5 is **not** shown live.
6. Undo: `git checkout tools/design/artboard-palette.css`.

**Point at.** Exit codes of both runs; the sentence "never inline hex holds where a gate
can enforce it".

**Fallback.** No Claude Design login or generation fails: use two or three artboards
from `tools/design/artboards.json` and run only steps 3–6, which need no login. Skip
entirely if time is short.

---

## D-7 · What a skill is, on a local file (Day 2 Block 00, 09:13-09:18, 5 min)

**Goal.** Say what a skill is with the participants' own file in front of them: a guide
Claude loads when the task matches its description. Nothing in this demo needs the network.
Rewritten 2026-11-18 (ADR-0181); until then it called the uianatomy MCP live. That the answer lists the skills (check 9) is verified headless 2026-11-18 (R-262); the interactive run is open in R-040; that it
fits in 5 minutes is NOT YET VERIFIED.

**Preconditions.**

- A **scaffolded workspace** on the projector, not the Atelier clone: the file shown has to
  be the one the participants have.
- `.claude/skills/atelier-component/SKILL.md` exists. The generator writes it into every
  workspace, no network involved; its frontmatter has `name` and `description` (read from
  the scaffold template, 2026-11-18). A Figma workspace also has
  `.claude/skills/figma-workspace-architect/`. The four Storybook skills are fetched from
  GitHub at the end of scaffolding; whether they landed is a provisioning check
  (`ls .claude/skills/`).

**Steps.**

1. Open `.claude/skills/atelier-component/SKILL.md` (1 min). Mark the frontmatter: `name`
   and `description`. Say: the description is all Claude sees of a skill until the task
   matches it; then it loads the body, and the body is the procedure.
2. Ask, on the projector and on every seat (3 min), the prompt below.
3. Put the answer next to the file (1 min).

**Prompt (verbatim):**

```text
Which skills do you have in this workspace, and when would you load each? Only list them.
```

**Expected result.** A list that names `atelier-component` with a "when" that paraphrases
its description; in a Figma workspace also `figma-workspace-architect`; the four Storybook
skills where their install landed. Seats can differ in that last group, and the difference
is worth one sentence: a skill that is not in the folder cannot load. The answer lists the skills (check 9): verified headless 2026-11-18 (R-262); the interactive run is open in R-040; that it fits in 5 minutes is **UNVERIFIED**.

**Point at.** The "when" in the answer beside the `description` line in the file: the same
sentence, and that is the whole mechanism. Then stop. The next row (09:18-09:28) puts the
skill beside the rules file, the MCP servers and the hook. The
description says writing a Figma ↔ code contract is opt-in, not part of the loop (scaffold
release of 2026-11): if asked, one sentence, "Atelier's own check, the last and optional
rung", and move on.

**Checkpoint D2B00-C2.** Every seat's answer names `atelier-component`.

**Fallback.** The answer lists nothing or invents a skill: `ls .claude/skills/`, the folder
is the truth, and read the `description` lines from the files. A skill missing on a seat:
copy the folder from a green neighbour and log it; re-scaffolding is not the fix. Do not
claim a skill loaded when it did not; say "it did not load, here is how we would notice"
(the block's recap question).

---

## D-8 · Parity on purpose (Day 2 Block 04, about 3 min inside the parity row 15:45-15:53) · trainer machine only

**Goal.** One point: **a field you do not pass is not compared, so a quiet report is not a
clean component.** The same wrong value is flagged in one call and silent in the next.

**Placement.** While the participants' parity prompt runs on their own component (the
participant prompt is [golden prompts §3.3](schulung-golden-prompts.md#33-parity-prompt-for-your-own-component-participants)),
the trainer shows this on the trainer machine only. Participants do **not** assemble a
`codeSpec` and do **not** run `check:contracts -- --emit`. The sorting row (15:53-16:13)
follows. NOT YET VERIFIED (rehearsal): that it fits in 3 minutes.

**Preconditions.**

- Figma Desktop Bridge connected to the trainer's duplicate (check Figma status via
  Claude first). Without the bridge this demo cannot run live; show the saved pair of
  reports.
- A built component with its Figma node (the trainer's own Block 01 example). Node id and
  variant: from that component's handoff document. Rehearsed 2026-10-14 on AtlButton: set
  `129:20` for `componentAPI`, variant `129:4` (primary/md/default) for `spacing`,
  `visual`, `typography`. A variant node carries no component properties (every prop comes
  back "no matching Figma component property"); the set answers geometry with its default
  variant (size=sm).
- Tool: `figma_check_design_parity` (figma-console-mcp, pinned `1.40.0` in `.mcp.json`).
  The seven `codeSpec` sections, per
  `skills/figma-workspace-architect/references/code-sync.md`: `visual`, `spacing`,
  `typography`, `tokens`, `componentAPI`, `accessibility`, `metadata`.

**Trainer preparation (before the day, not shown to participants).** The `codeSpec` is
assembled on the trainer machine: `check:contracts -- --emit <folder>` (an Atelier check,
so trainer-only; participants never run it) provides `componentAPI`, `metadata` and
`tokens` only, per the page, and Claude assembles the object from it by prompt
([golden prompts §3.4](schulung-golden-prompts.md#34-codespec-assembly-prompt-trainer-only-preparation-for-d-8)),
adding `accessibility` from `figma_scan_code_accessibility`. The demo starts from that
object, saved beforehand.

**Prompt (trainer only):** [golden prompts §3.5](schulung-golden-prompts.md#35-parity-double-call-prompt-trainer-only-d-8)
verbatim, with `<node>`/`<variant>` filled from the handoff document.

**Expected result.**

- Call 1 (the four sections `componentAPI` + `metadata` + `tokens` + `accessibility`,
  plus one hand-added `spacing` section with one value deliberately wrong): the report
  flags the spacing deviation. The schema (`figma_check_design_parity`) makes every
  `codeSpec` section optional, so this is a valid call.
- Call 2 (same wrong value left in place, `spacing` section omitted): no spacing row at
  all, the other findings unchanged. Fields not passed are not compared; that is not the
  same as "correct".
- The report does not name the compared sections: `summary.categories` lists only
  categories with findings, and `codeData` echoes exactly the sections passed; point
  at `codeData`. Observed 2026-10-14 with all seven sections (AtlButton, `gap: 16` wrong;
  not the four-plus-spacing pair, which is UNVERIFIED live, R-227): call 1 → 13 findings,
  score 48, three major spacing rows; call 2 → 10 findings, score 72, no spacing row,
  everything else identical. The score rose because less was compared.

**Point at.** The compared-section list (`codeData`) in each report; the sentence "a
quiet report is not a clean component: what you do not pass is not compared". Then hand
over to the participants' own reports: ask each seat what its prompt did **not** pass.

**Fallback.** Bridge red or tool errors: show the saved pair of reports from rehearsal.
If call 1 does not flag the deviation either, the codeSpec was probably too thin:
check that `spacing` was actually in the passed object, rerun once, then stop and say
so. Short on time: show only the saved pair and say the one sentence.

**Undo.** Revert the deliberately wrong spacing value in the component.
