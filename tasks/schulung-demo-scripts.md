# Schulung Demo Scripts

_Written 2026-10-13. Trainer material, not participant-facing._

One script per live demo the current agenda (`docs/src/pages/schulung.astro`)
contains. Times and block names come from there; where each demo sits in the minute
plan is in `tasks/schulung-run-of-show.md` (ids `D-1`…`D-8`). Prompts that already
live in `tasks/schulung-golden-prompts.md` are linked, not copied.

**Verification convention.** Every command, MCP tool name, port, path and id below was
checked against this repo on 2026-10-13 (grep/ls, `docs-list` on the hosted Angular
endpoint, and `npm run check:artboard-palette` exit 0). Anything I could not check is
marked **UNVERIFIED**. Nothing here has been rehearsed live; "expected result" is
derived from the code, not from a recorded run.

## Demos in the current agenda, and what was dropped

| Id  | Demo                                                              | Where on `/schulung`                                                  | Status                          |
| --- | ----------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------- |
| D-1 | Guardrail demo: same prompt without/with MCP, then a gate         | Day 1 Block 00 (5 min)                                                | New since the earlier review    |
| D-2 | One-change live demo                                              | Day 1 Block 00 ("change an Atelier component by prompt in 5 minutes") | Kept, narrowed to one framework |
| D-3 | Design tab + contract section in Storybook                        | Day 1 Block 04                                                        | New                             |
| D-4 | Negative (hallucination) demo + `docs-show`                       | Day 1 Block 04                                                        | Kept                            |
| D-5 | Red-then-green story with a `play` function                       | Day 1 Block 04                                                        | New                             |
| D-6 | Three directions (Claude Design) + palette fence                  | Day 1 buffer 16:00–16:10, 10 min, or skip                             | Kept, optional                  |
| D-7 | uianatomy MCP as helper, introducing skills                       | Day 2 Block 00                                                        | New                             |
| D-8 | Parity on purpose (`codeSpec` fields not passed are not compared) | Day 2 Block 04                                                        | New                             |

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

- Two checkouts or one: the **Atelier clone** (this repo) for D-1 (windows a/b), D-2…D-4, D-6, D-8
  trainer-side, with the `.mcp.json` servers connected (`/mcp` in Claude Code lists
  `storybook-angular`, `storybook-react`, `storybook-vue`, `nx-mcp`, `figma-console`,
  `uianatomy`, `angular-cli`, `Astro docs`). A **scaffolded workspace** (Angular,
  `npx create-atelier-ui-workspace`, Storybook on `localhost:6006`, app on
  `localhost:4200`) for D-5 and for D-1 step 3 (the stylelint gate), because that is what participants have.
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

## D-1 · Guardrail demo (Day 1 Block 00, 5 min)

**Goal.** Two messages in one demo. (1) Context steers the agent: the same prompt gives a
hallucinating answer or a token-exact one, and participants name one concrete
difference. (2) Context is not enough on its own: a gate in the workspace catches what
still slips through, so AI output cannot quietly bypass the design system.

**Preconditions.**

- Two windows side by side: (a) a plain chat with no design-system context (no MCP, no
  `llms-full.txt`), (b) Claude Code in the Atelier clone with the Storybook MCP
  connected (`storybook-angular`).
- A **scaffolded workspace** (Angular, `npx create-atelier-ui-workspace`; the one from
  the shared preconditions above) with `npm install` done and a clean tree, a terminal
  open in its root. It must contain `stylelint.config.mjs` and `tools/stylelint-rules/`
  (the generator writes both) and the app `workshop-angular/`. Run
  `npx nx stylelint workshop-angular` once before the session: it must exit 0 on the
  untouched scaffold, otherwise the red run proves nothing.
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
   `npx nx stylelint workshop-angular` (same as `npm run check:stylelint`, which runs
   the `stylelint` target of every project). It goes red.
4. 4:30 to 5:00 State the limit (below) and the sentence in "Point at".

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
variable" and "the context steers, the gate catches what still slips through."

**The stated limit (say it out loud, do not let a participant find it).** The gate is
narrow. What it reads: `workshop-angular/src/**/*.css` only (`tokens.css` is excluded,
because it defines the literals), and only colour literals, undeclared `--ui-*` tokens
and literals that duplicate a token's value. What it does not catch: (1) colours in
inline `style="..."` attributes in a template, (2) colours in a component's inline
`styles: [...]` string in a `.ts` file (and in `.scss` or any non-`.css` file), (3) a
raw `<button>`, `<input>` or `<div class="card">` instead of `AtlButton` and friends:
no shipped lint rule asks for library components. The two shipped template rules
(`atl-button-icon-only-needs-name`, `atl-sub-component-needs-parent`) only check how an
`Atl*` component is used, and angular-eslint's accessibility preset checks a11y of
whatever is there. Closing those gaps is the participant's own next step (Day 2
transfer). Also: `nx lint` does not run stylelint; it is a separate target, so a
participant who only runs `nx lint` sees green.

**Fallback.** Show the two pre-saved outputs from your rehearsal. If (b) does not call
the MCP, say "it did not read the docs, so it guessed" and re-run with "Use
`docs-list` first". If step 3 is green because (a)'s CSS has no hex, paste the saved
red terminal output or run the command on the pre-saved CSS file. If `nx` is slow, run
`npx stylelint 'workshop-angular/src/**/*.css' --ignore-pattern
'workshop-angular/src/styles/tokens.css' --config stylelint.config.mjs` directly (the
exact command the target runs). Do not improvise a different prompt.

---

## D-2 · One-change live demo (Day 1 Block 00, 5 min)

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
  horizontal padding of literal `0.875rem` (line 131 of that file), which has no
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

**Undo (always, even on success):** `git checkout libs/styles/src/button/atl-button.css`.

**Fallback.** Live change fails or Storybook does not hot-reload: show the saved diff
and screenshot. If Claude edits more than one file, revert and say "that is exactly why
the next two days are about contracts and gates".

**Not specified on `/schulung`:** whether this demo runs in the Atelier clone or in a
workspace. The scripts above assume the clone (it has the story with the stable id).

---

## D-3 · Design tab and the contract section (Day 1 Block 04, part of the first 10 min)

**Goal.** Show the two things "explained nowhere else": the Design tab
(`parameters.design`, addon-designs) and the contract block at the bottom of every Docs
tab (`contractDocsPage` via `parameters.docs.page`, ADR-0121 S5b).

**Preconditions.**

- Primary: the hosted Atelier Storybook, `https://atelier.pieper.io/storybook-angular/`.
  Local fallback: `http://localhost:4400` (`nx storybook angular`).
- The participants' scaffolded workspace stories (the `AtlButton` template under
  `libs/create-workspace/src/generators/preset/files/storybook/angular/`) carry **no**
  `parameters.design`, so their Design tab is empty. Demo on the Atelier Storybook, not
  on a participant's.

**Script.**

1. Open `Components/Inputs/AtlButton` → story `Primary` (`parameters.design` is
   `figmaNode('129-4')` in `atl-button.stories.ts`). Click the **Design** tab: the Figma
   frame is shown next to the component.
2. Open the **Docs** tab, scroll to the bottom: the contract section. Say in one
   sentence: this comes from `contractDocsPage` in `libs/angular/.storybook/preview.ts`,
   not from Storybook itself.
3. Name the claim: "the component's own types are the API; the contract holds only
   what we chose to differ from Figma".

**Expected result.** Design tab shows the frame; Docs tab ends with a contract section.
Contract content for AtlButton: **UNVERIFIED** (not opened).

**Fallback.** Design tab blank (Figma embed blocked/offline): show the screenshot, say
"it is a link to the frame, nothing more". Docs section missing: log it, move on.

---

## D-4 · Negative demo and `docs-show` (Day 1 Block 04, ~10 min)

**Goal.** Participants see that the same question is answered wrongly without MCP and
correctly with it, and that "not documented" is the right answer for a missing prop.

**Preconditions.**

- A browser chat with no MCP and no repo access (window a).
- Claude Code in the Atelier clone with `storybook-angular` connected (window b).
  Tools: `docs-list`, `docs-show`, `docs-show-story` (server instructions, and the
  `docs`-only hosted surface in `AGENTS.md`).
- Verified on 2026-10-13 via `docs-list` on the hosted Angular endpoint: id
  `components-inputs-atlbutton` exists (`AtlButton`). `AtlButton`'s inputs per
  `libs/angular/src/lib/button/atl-button.ts`: `variant`, `size`, `disabled`,
  `loading`, `type`. It has no `shadow` or `rounded` input.

**Prompts (verbatim):**

Window (a), no MCP:

```text
What props does the AtlButton component of the Atelier UI library have? List them with their allowed values.
```

Window (b), with MCP:

```text
Use the storybook-angular MCP. Call docs-list, then docs-show for the AtlButton id, and list its props with allowed values. Do not guess.
```

Stretch (page: "ask the MCP server for a prop that does not exist"):

```text
Does AtlButton have a `shadow` prop? Answer from docs-show only.
```

**Expected result.** (a) an invented or generic prop list (typical for an unknown
library). **UNVERIFIED** as a recorded run; the demo's strength is the tendency, so
run it once beforehand and save the answer. (b) `variant`, `size`, `disabled`,
`loading`, `type`, framed in Angular terms (inputs, not React-style props). Stretch:
"not documented".

**Point at.** In (b) the tool calls (`docs-list` then `docs-show`) before the answer.
The sentence: "if it is not documented, it does not exist; say so rather than invent".

**Fallback.** Hosted endpoint down: run `npx storybook tools --config-dir
libs/angular/.storybook --json docs list` / `docs show components-inputs-atlbutton`
(CLI passthrough from `AGENTS.md`; **UNVERIFIED** whether the `docs show` id matches the
MCP id). Or show pre-saved screenshots.

**Then (same row):** every participant runs the (b) prompt in their own workspace and
confirms the reply is shaped for Angular. A React-shaped reply (JSX, `children`,
`on*Change`) is a regression; note it.

---

## D-5 · Red-then-green story with a `play` function (Day 1 Block 04, 25 min exercise)

**Goal.** Model the first red-then-green cycle once, so participants copy the habit:
a story that never failed claims nothing.

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
4. Ask participants to do the same on a variant they write themselves (the exercise).

**Expected result.** Interactions panel: red with a "Unable to find an element with the
text" style message, then green. Exact message text **UNVERIFIED**.

**Gate check (optional, trainer machine, not live):** `nx storybook-test <fw>` renders
every story and would fail on the broken `play`; do not run it live (shares Vitest's
browser port; never two at once).

**Fallback.** HMR does not refresh the panel: reload the story. If the scaffold's
story lacks the `play`: write the 3-line `play` live from the template shape above.

---

## D-6 · Three directions, Claude Design (Trainer appendix, optional, 10 min in the Day 1 buffer)

**Goal.** Show that a Claude Design artboard has none of the four gate identities, and
that the palette gate fences exactly the generated sheet, not the artboards.

**Slotting.** Owner decision 2026-10-14: it runs in the Day 1 buffer 16:00–16:10
(between Block 04 and Block 05), cut to 10 minutes, or is skipped. It does not fit
inside Block 04's 75 minutes.
Trainer machine only: `claude.ai/design` needs a different login than the cohort API
key.

**Preconditions.**

- Logged in to Claude Design on the trainer machine. In this session the
  `claude-design` MCP server failed to connect (HTTP 403 on the login); re-run
  `/design-login` before the day, and test it. **UNVERIFIED** whether it is fixed.
- Three direction artboards for the Toast brief (`workshop/briefs/toast.md`) generated
  **beforehand in the coffee break 14:30–14:45**, seeded from the generated palette
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

## D-7 · uianatomy MCP as helper, introducing skills (Day 2 Block 00, 7 min)

**Goal.** Show the canonical record of a component (anatomy, axes, states, a11y) as
a helper, then use it to say what a skill is: a guide Claude loads when the task
matches.

**Preconditions.**

- `uianatomy` connected (HTTP, `https://uianatomy.dev/mcp`, in `.mcp.json`). Tools
  verified in this session's tool list: `get_component_view`, `get_component`,
  `search_components`, `get_implementations`, `get_mismatches`, among others.
- The bundled skill `uianatomy-mcp` exists at `.claude/skills/uianatomy-mcp/SKILL.md`
  (and in the scaffold's `claude/skills/`), and triggers automatically.
- The Toast brief records its own source call: `get_component_view(id: "toast",
view: "designer")` (header of `workshop/briefs/toast.md`). Use the participant-chosen
  brief component for the live call; the four ids are `toast`, `tagchip`, `statcard`,
  `avatar` in the briefs, but only `toast` is known to be a uianatomy id from the brief
  header. The other three ids on uianatomy: **UNVERIFIED** (verify with
  `search_components`).

**Prompt (verbatim; replace `<component>` with the participant's brief component):**

```text
Use the uianatomy MCP. Look up the canonical record for <component> (designer view). List its anatomy parts, axes and a11y requirements, then tell me one thing the Atelier brief in workshop/briefs/<component>.md does not say.
```

**Expected result.** A list of parts and axes from the canonical record, and one gap
versus the brief. The gap itself **UNVERIFIED**; that is the page's stretch task.

**Point at.** The tool call to `uianatomy` (not a guess), and the skill trigger: "the
`uianatomy-mcp` skill is why Claude knew how to call it; that is what a skill is".
Then the skill list for participants: `atelier-component`, `uianatomy-mcp`,
`figma-workspace-architect` (Figma workspaces only), plus the four Storybook skills.

**Fallback.** Server unreachable: open https://uianatomy.dev in the browser and read the
record there, then continue with the skills sentence (no live call needed). Do not
claim a skill triggered when it did not; say "it did not load, here is how we would
notice" (the block's recap question).

---

## D-8 · Parity on purpose (Day 2 Block 04, 15 min, trainer demo then exercise)

**Goal.** Make "fields you do not pass are not compared" visible: the same wrong value
is flagged in one call and silent in the next.

**Preconditions.**

- Figma Desktop Bridge connected to the trainer's duplicate (check Figma status via
  Claude first). Without the bridge this demo cannot run live.
- A built component with its Figma node (the trainer's own Block 01 example, or a
  participant's volunteering machine). Node id and variant: from that component's
  handoff document. Rehearsed 2026-10-14 on AtlButton: set `129:20` for `componentAPI`,
  variant `129:4` (primary/md/default) for `spacing`, `visual`, `typography`. A variant
  node carries no component properties (every prop comes back "no matching Figma
  component property"); the set answers geometry with its default variant (size=sm).
- Tool: `figma_check_design_parity` (figma-console-mcp, pinned `1.40.0` in `.mcp.json`).
  The seven `codeSpec` sections, per
  `skills/figma-workspace-architect/references/code-sync.md`: `visual`, `spacing`,
  `typography`, `tokens`, `componentAPI`, `accessibility`, `metadata`.
- An `--emit` fragment (`check:contracts --emit <folder>`) provides `componentAPI`,
  `metadata`, `tokens` only, per the page.

**Prompt:** use
[golden prompts §3.3](schulung-golden-prompts.md#33-parity-double-call-prompt-the-codespec-field-exercise)
verbatim, with `<node>`/`<variant>` filled from the handoff document.

**Expected result.**

- Call 1 (all seven sections, one spacing value deliberately wrong): the report flags
  the spacing deviation.
- Call 2 (same wrong value left in the component, `spacing` section omitted): no spacing
  row at all, the other findings unchanged. Fields not passed are not compared; that is
  not the same as "correct".
- The report does not name the compared sections: `summary.categories` lists only
  categories with findings, and `codeData` echoes exactly the sections passed; point
  at `codeData`. Observed 2026-10-14 (AtlButton, `gap: 16` wrong): call 1 → 13 findings,
  score 48, three major spacing rows; call 2 → 10 findings, score 72, no spacing row,
  everything else identical. The score rose because less was compared.

**Point at.** The compared-section list in each report; the sentence "a thinly filled
`codeSpec` is the normal case, not a complete one".

**Fallback.** Bridge red or tool errors: show the saved pair of reports from rehearsal.
If call 1 does not flag the deviation either, the codeSpec was probably too thin:
check that `spacing` was actually in the passed object, rerun once, then stop and say
so.

**Undo.** Revert the deliberately wrong spacing value in the component.
