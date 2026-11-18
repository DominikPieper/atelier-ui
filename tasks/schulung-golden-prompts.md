# Golden-Prompts — trainer cheat sheet

**What this is.** Ready-to-paste prompts for the blocks that need them — the
retired 2026-09 agenda (`tasks/archive/schulung-2tage-agenda-2026-09.md`, German) named
this exact gap in its material-gaps table: _"Trainer cheat sheet with golden prompts:
typical errors / prompts per block"_ (translated; it listed Day 1 Block 5 and Day 2
Blocks 3 and 4 under its old block numbering). The current curriculum is
`docs/src/pages/schulung.astro`; its Day 2 Block 03 ("Iterate: prompt quality and the
self-healing loop") tells participants: _"Enforce token fidelity: golden prompts demand
`--ui-*` custom properties."_ Neither page carries the actual prompts; this file does.

**Not a substitute for this: `docs/src/pages/prompts.astro`.** Checked directly before
writing this — its eight cards (`Chat interface`, `Login form`, `Stats dashboard`, …)
are whole-page generation templates: "build a settings page", "build a data table",
25–40 lines of requirements each, meant to be pasted into a fresh LLM session with no
MCP. Nothing there targets a single component's token fidelity, corrects an invented
prop, or fixes a wrong slot — the granularity this sheet needs does not exist anywhere
else in the repo. It borrows one convention from that page (fetch the API reference /
handoff document first, then generate) and stops there. The old agenda's
material-gaps row said this sheet is "derived from `docs/src/pages/prompts.astro`"
(translated) — read literally, that overstates it; what actually transfers is the _convention_, not the _content_, and
that row now points here instead.

**Where this lives, and why not `/schulung`.** This is trainer prep, read before or
during a live session, not participant-facing curriculum — the same standing as
`tasks/schulung-dry-run-kit.md` and the three `tasks/schulung-review-*.md` files it
sits beside. `tasks/archive/reviews/schulung-review-2026-09-02.md` §6.3 recommended eventually moving
_all_ trainer-only material to a separate private repo; that repo does not exist and
building one is out of scope here. What that same review's §7 table actually gates on
is personal data and credential/contingency admissions (I1: two colleagues' names and
an internal mailbox) — explicitly **not** a blanket ban on trainer content in `tasks/`;
§7 itself says dated review files "stay public… contain no personal data." This sheet
carries neither: no names, no credentials, no timing admissions, just prompt text
grounded in the public spec. It stays in `tasks/`, the file the agenda and
`schulung.astro` already point at for exactly this kind of thing, rather than on the
public docs site — putting trainer-only correction scripts in front of participants on
`atelier.pieper.io` would be the wrong direction for the tone problem `tasks/todo.md`'s
open "Schulung M11" item already names, not a fix for it.

**Verification stance.** Every prop, token, variant value, component name and file path
below was checked against `libs/spec/src/index.ts`, `libs/{angular,react,vue}/src/index.ts`,
`plan/big-picture.md`, `plan/design-principles.md`,
`libs/create-workspace/src/generators/preset/files/styles/tokens.css` (the canonical
token file, ADR-0115/ADR-0116) and the four `workshop/briefs/*.md` files, on
2026-09-10 (block names and numbers retargeted to the current `/schulung` on 2026-10-13;
prompt text unchanged). §5 lists exactly what was checked and what got cut for being unverifiable.
Per ADR-0116: names below are the stable part and are cited as fact; a couple of
current _values_ (e.g. a specific px number) are deliberately not repeated here for the
same reason ADR-0116 gives — read them fresh from `tokens.css` at prompt time rather
than trusting a number that was correct on 2026-09-10.

**Revision 2026-11-18 (ADR-0180).** The proof thread is now five standard tools ("the
ladder": Figma linter, compiler, ESLint, stylelint, story tests), each taught in three
beats: break it on purpose, the tool says so, the agent gets the output and repairs. New:
§1a, §1c, §2.5, §2.6; changed: §1, §1b, §2.1, §3.3; §3.4 and the old double call are
trainer-only now (§3.4, §3.5, demo D-8). **Every new or changed prompt below is NOT YET
VERIFIED (rehearsal, R-040)**, and the verification dates in §5 and in the older text refer
to the prompts as they stood then, not to the revised ones. Measured 2026-11-17 on a fresh
`create-atelier-ui-workspace@0.4.10` Angular scaffold: the compiler and lint results named
below, warm run times (build 6-9 s, lint 6-7 s, stylelint 2-4 s), and one headless repair run
(four planted defects, build and lint) in 78 s and 10 turns.

## 0. How to use this sheet

- **Paste, don't paraphrase.** These are meant to go into a participant's live Claude
  Code session verbatim. A paraphrase risks re-inventing exactly the kind of plausible
  but wrong detail this sheet exists to avoid.
- **`<ANGLE-BRACKET>` placeholders are yours to fill from the participant's own
  material** — their handoff document (Day 2 Block 01→02, ADR-0096), their chosen
  component (Toast / Avatar / TagChip / StatCard), their chosen framework. Never fill
  one from memory or invent a value that "sounds right" — that is precisely the
  failure mode (§2.2–2.4) this sheet corrects elsewhere. If a placeholder can't be
  filled from something the participant already has in hand, stop and ask them for it
  instead of guessing.
- **`[FW]` = the participant's chosen framework's own convention**, not a translation
  step — Angular kebab-case elements (`atl-button`, `atl-card-header`) with
  `input()`/`model()`/`output()`; React PascalCase components (`AtlButton`,
  `AtlCardHeader`) with props and `children`; Vue PascalCase SFC exports
  (`atl-card-header.vue`, exporting `AtlCardHeader`) with `defineProps` and the
  default `<slot />`. Verified identical pattern across
  `libs/react/src/lib/card/atl-card.tsx`, `libs/angular/src/lib/dialog/atl-dialog.ts`
  and `libs/vue/src/lib/dialog/*.vue` (`plan/big-picture.md`'s "Framework
  Differences" table names the same three rows).
- **Prompts that make the agent run a command have one shape**: "Run `<command>`. Report
  each exit code. If one is not 0, read the output (the full log when the summary has no
  error text), repair, and run it again." The agent runs the checks, not the participant;
  if the agent stalls, the participant types the command. The "full log" clause is there
  because a failing command prints no error text in the agent's non-TTY shell, only a path
  to the log (open item R-248).
- **"Green" is not "right".** The trainer's example: lint asks for `alt`, the agent writes
  `alt=""`, lint is green, and an image that carries meaning is now hidden from a screen
  reader. Read every repair, not only the exit code.
- **Sorting labels** for differences between design and code: Day 1 = **code** / **Figma**.
  Day 2 = **code** / **Figma** / **kept on purpose** (the last points at the "Deliberate
  differences" section of the handoff document). "Contract" is not a label any more.
- **Block mapping** (block numbers and titles as on `/schulung`):
  - §1 = Day 1 Block 02 "Mini-loop: first success" (existing components only — the
    Settings Card): generation prompt and token fix-up. §1a = the same block, row 11:25 to
    11:45: ladder stage 2, the agent checks itself with lint and build. The comparison with
    Figma is the 10-minute row after it (the parity prompt on `/tutorial`).
  - §1b = Day 1 Block 05 "A screen from Storybook, against the clock" (existing
    components only, no Figma — the Team directory screen), including the closing checks.
  - §1c = Day 1 Block 03 (ladder stage 0, 13:45 to 13:55) and Day 2 Block 01 (ladder stage 0
    on your own component set, 10:35 to 10:40): the Figma linter.
  - §2.1 = Day 2 Block 02 "Component and stories from the handoff" (the generation prompt);
    §2.2–2.4 = Day 2 Block 03 "Iterate: prompt quality and the self-healing loop" (the
    correction prompts — the block `schulung.astro` names for golden prompts; also the home
    of ladder stage 4, where the agent runs `test-run` and repairs);
    §2.5 = Day 2 Block 02, row 12:05 to 12:20 (`docs-show` on your own component);
    §2.6 = Day 2 Block 00, row 09:18 to 09:28 (the Definition-of-Done exercise).
  - §3 = Day 2 Block 04 "Verify: a11y, states, parity" (a11y + dark mode + the participant
    parity prompt §3.3). §3.4 and §3.5 are trainer-only material for demo D-8.

---

## 1. Day 1 · Block 02 (Mini-loop) — Settings Card

The generation prompt for this block already exists and is live — `examplePrompt` in
`docs/src/pages/tutorial.astro` (mirrored in the optional kata `/first-component`), which composes
`AtlCard`/`AtlInput`/`AtlToggle`/`AtlButton` and explicitly tells Claude to pull _"the
exact token names from `boundVariables`… no conversion needed."_ Do not re-type it here —
that is exactly the mistake ADR-0116 corrects elsewhere (a hand-copied restatement of a
value that already has a live source). Point participants at the page.

**When the first draft still drifts on tokens** (it can — pattern-matching models
sometimes fall back to a literal px/hex value even when told not to), hand the
participant this one-line fix-up rather than a full re-prompt:

> Re-check every inline `style`/CSS value you just wrote against
> `var(--ui-*)`. `AtlCard`'s heading in the canonical example uses
> `var(--ui-font-size-lg)` for size, `var(--ui-color-text)` for colour, and the card's
> own padding/gap are `var(--ui-spacing-6)` / `var(--ui-spacing-4)` — no literal `px`,
> no hex, no Tailwind class. Replace anything that isn't a `--ui-*` custom property with
> the matching one and tell me which line you changed.

**The comparison with Figma (the 10-minute row after §1a).** The prompt stays as it stands
on `/tutorial` (`PARITY_PROMPT`: run `figma_check_design_parity` on the settings card node,
say for each discrepancy whether the code or the Figma master should change). Nothing
before it has participants run `check:contracts` or `check:stories`: the proof in Day 1
Block 02 is lint and build run by the agent (§1a). Two labels only, **code** or **Figma**.
A long list: label the three largest. A difference that fits neither (someone chose it on
purpose) is parked: "not code, not Figma, we name it on Day 2", and is not "fixed" in code.

(Grounded directly in the tutorial's own React/Angular/Vue output blocks — all three
already use exactly these four token names for exactly these four properties. Since
2026-11-17 the blocks keep their styles in `settings-card.css` instead of inline `style`
(R-237), and the heading weight is `var(--ui-font-weight-semibold)`: the literal `600`
passed unseen while it sat inline and failed `npm run check:stylelint` with `[BYPASS]`
the moment it moved into a `.css` file. That is the fix-up to hand over when a
participant's draft has the same literal.)

---

## 1a. Day 1 · Block 02, row 11:25 to 11:45 (20 min) — ladder stage 2: the agent checks itself

ESLint with the Angular template rules, run by the agent. NOT YET VERIFIED as prompts
(rehearsal). Three prompts, in order, on the Settings Card the participant just generated.
Beat 1 is the clean run, beats 2 and 3 are break it on purpose, the tool says so, the agent
repairs.

**Prompt 1, the clean run.**

> Run `npm run lint` and `npm run build`. Report each exit code. If one is not 0, read the
> output (the full log when the summary has no error text), repair, and run both again.

**Prompt 2, break it on purpose.** Do not let the agent fix anything yet.

> Add an `<img src="/avatar.png">` without `alt` and a `<div (click)="save()">Save</div>`
> to the Settings Card. Do not fix anything. Run `npm run lint`, report the exit code and
> the rule ids it names.

**Prompt 3, repair from the output.**

> Repair from the lint output. Run lint and build again and report both exit codes.

Then **read the repair**: did the agent write `alt=""`? Lint is green and the image, if it
carries meaning, is now hidden from a screen reader. Green is not right. Last prompt, the
clean-up:

> Remove the image and the div again, run both, report the exit codes.

**Expected output.**

- After prompt 2: a **non-zero exit code** and these rule ids (measured 2026-11-17, fresh
  0.4.10 Angular scaffold): `alt-text` (the image), `click-events-have-key-events` and
  `interactive-supports-focus` (the div).
- After prompt 3: exit 0 for lint and build. The `<img>` repair is often `alt=""`.
- After the clean-up: exit 0 for both, the two planted elements gone.
- Warm run times (measured 2026-11-17): lint 6-7 s, build 6-9 s. One headless repair run
  (four planted defects, build and lint): 78 s, 10 turns, one file touched, nothing invented.

**What to look at.** The `alt` attribute on the image in the diff (`alt=""`); the rule ids
named in the agent's report, not only "lint failed"; that the repair touched the two planted
elements and nothing else.

**What it does not see (say it).** A raw `<button>` where a library component exists, and
meaning (`alt=""` passes). The compiler half is named here only as "build also ran"; its
demo is Block 04 (D-4).

**Checkpoints.** D1B02-C3: every seat has seen a non-zero lint exit code and a rule id.
D1B02-C4: lint and build exit 0 after the repair on at least 70 % of the seats.

**Fallback.** The agent stalls, or reports "failed" without error text (the known R-248
gap): the participant types `npm run lint` (or `npm run build`) in the terminal and reads
the rule ids from the output. If `alt-text` etc. do not appear, check the template really
contains the planted elements before blaming the tool.

---

## 1b. Day 1 · Block 05 (A screen from Storybook, against the clock) — Team directory

The starter prompt is live on `/screen-from-storybook` (`prompt()` in that page's
frontmatter, one copy per framework, with the MCP name, package and file paths already
filled in), and so is the receipts prompt (`RECEIPTS_PROMPT`). Do not re-type either
here; point participants at the page. What this section adds is the steering the trainer
hands out when a run goes wrong, and the expected result to judge a run against.

**Expected result (Angular, what a good run looks like).**

- Before any file is written the agent has called `docs-list` and `docs-show` for
  AtlInput, AtlSelect, AtlButton, AtlTable, AtlBadge and AtlPagination and named them.
  All six are in `docs-list` of the hosted Angular, React and Vue endpoints
  (checked 2026-10-20).
- The screen imports them from `@atelier-ui/angular` (`AtlInput`, `AtlSelect`,
  `AtlOption`, `AtlButton`, `AtlTable`, `AtlThead`, `AtlTbody`, `AtlTr`, `AtlTh`, `AtlTd`,
  `AtlBadge`, `AtlPagination` are all exported by `libs/angular/src/index.ts`) and lists
  them in the component's `imports`.
- Search and select carry a `label` (the docs say an unlabelled input has no accessible
  name); the status badge maps active to `success`, invited to `warning`, suspended to
  `danger` (the documented `variant` values); the table's empty state uses the documented
  `atlTableEmpty` content on `atl-tbody`; pagination uses `[(page)]` and `[pageCount]`.
- Styles sit in `team-directory.component.css`, tokens only. `npm run lint`,
  `npm run check:stylelint` and `npm run check:format` exit 0, and `npm run build`
  compiles with strict templates.

**Fallback.** `atelier` not connected on a seat: `/mcp` → reconnect; still red: pair with a neighbour.
It is a local process, there is no endpoint that can be down for the room.

**Closing checks, run by the agent (row 16:30 to 16:45; before the receipts prompt).** NOT
YET VERIFIED as a prompt (rehearsal). The agent runs the workspace's own checks and
repairs from the output; `npm run format` is the fix for a format failure and nothing else.
On Angular the build is part of it; on React or Vue drop the `npm run build` clause.

> Run `npm run lint`, `npm run check:stylelint`, `npm run check:format` and, on Angular,
> `npm run build`. Report each exit code. If one is not 0, read the output (the full log
> when the summary has no error text), repair, and run it again. Then list what you
> changed.

This is the page's prompt (`CHECKS_PROMPT` on `/screen-from-storybook`), which is the copy
the participants paste. If the agent repairs formatting by hand, tell it: "`npm run format`
is the fix for `check:format`, and for nothing else."

Then the receipts prompt (live on the page as `RECEIPTS_PROMPT`). The "they do not see"
sentence stays: these checks do not catch an invented name or a hand-built element, which
is why the receipts come next. Fallback: the participant types the command.

**When the agent starts writing without calling `docs-list`** (it can): hand it this.

> Stop. Do not write more code yet. Call `docs-list` on `atelier` and give me the
> ids of the components you will use. Then call `docs-show` on each and tell me, for
> every prop you plan to use, where it appears in the output.

**When it uses an input the docs do not list** (typical on the table parts `atl-th` and
`atl-tr`, and on `atl-option`: the main entry's input table does not list the
sub-components, their inputs appear only in its code examples):

> You used `<INPUT>` on `<ELEMENT>`. Show me the exact line of the `docs-show` or
> `docs-show-story` output it comes from. If there is none, remove it and tell me what
> you do instead.

**When it hand-builds something the library has** (a bordered `div` as a card, a styled
`span` as a badge):

> `<ELEMENT>` is hand-built. Call `docs-list` and check whether the library has a
> component for it. If it does, replace it with that component, using only documented
> props.

(Everything in this section was read from the hosted `docs-show` output and
`libs/angular/src/index.ts` on 2026-10-20. The React and Vue shapes of AtlTable and
AtlPagination were not read; UNVERIFIED.)

---

## 1c. Day 1 · Block 03 and Day 2 · Block 01 — ladder stage 0: the Figma linter

Day 1 Block 03, 13:45 to 13:55 (10 min): the same prompt on the same master in the prepared
duplicate. Day 2 Block 01, 10:35 to 10:40 (5 min): on your own component set, before the
handoff document; real findings are fixed first, false alarms are noted. NOT YET VERIFIED
as a prompt (rehearsal). Read-only: nothing is changed in the file.

**Trainer first (Day 1 only): the default run.** On `Inputs/AtlButton` (node `129:20` in
the Atelier file) the default `figma_lint_design` run reports **59 findings** (measured
2026-11-17): **18 "critical"** contrast failures, all on the hidden `_disabled-overlay`
label (false alarms), **40** about missing text styles (the file binds type to variables
instead), and none of the ones examined is a defect. Say: "a finding is something to sort,
not a verdict."

**Participant prompt.**

> Run `figma_lint_design` on the node `<NODE>` (`<MASTER NAME>`) with only the rules
> `hardcoded-color`, `default-name` and `detached-component`. Return the findings as a list:
> layer, rule, message. Change nothing in the file.

`<NODE>`: Day 1, the same master in the prepared duplicate (`129:20` is its id in the
Atelier file; read the id in the duplicate, do not assume it is the same); Day 2, the
participant's own component set: select it in Figma and say "the node I have selected"
(the agent reads the id with `figma_get_selection`). The handoff document does not exist
yet at 10:35; it is written after this run.

**Expected output.** A list, no edit. What the three rules catch: raw colours, layers left
on default names, detached instances. The participant sorts each line: **real** or **false
alarm**. UNVERIFIED (rehearsal): the number of findings the three-rule run returns on that
master.

**What it does not see (say it).** Whether the design is right; spacing and radius. Its
default rule set also reports false alarms (see above), which is why the rules are named.

**Fallback.** Bridge not connected (`figma_get_status`): the trainer shows a saved result
and the participants sort that list. Do not let anyone "fix" a finding in the shared master.

---

## 2. Day 2 · Blocks 02–03 — Codegen and corrections (token-fidelity)

### 2.1 Generation prompt (Block 02)

NOT YET VERIFIED as revised (rehearsal). One step, no contract file: the participant does
not write, open or check one. The handoff document's **"Deliberate differences"** section
(what the code will do differently from the design on purpose, and why) goes into the
prompt as given constraints. The same prompt is printed on `/build-your-own`.

> Generate the `<FRAMEWORK>` implementation of `<ComponentName>` from the handoff
> document below — not from the Figma picture alone (ADR-0096). Read every requirement
> before writing code. Write the component with its test, and its stories, in one step: one
> story per variant value and per Boolean state, `args`-based where possible, and a `play`
> function for each behaviour line the document names. Do not write any other file.
>
> --- HANDOFF DOCUMENT (paste yours here) ---
> `<PASTE THE DAY-2-BLOCK-01 HANDOFF DOCUMENT>`
> --- END HANDOFF DOCUMENT ---
>
> The handoff document's "Deliberate differences" are **given constraints**, not mistakes
> to correct: where the code differs from the design on purpose, build it that way.
> `<PASTE THE "DELIBERATE DIFFERENCES" SECTION OF THE HANDOFF DOCUMENT>`
>
> Hard requirements — check each one explicitly and report which you had to make a
> judgement call on:
>
> 1. **Every prop name matches the handoff document's "In scope"/"Token bindings"
>    section, one-for-one.** Do not add a prop the document doesn't name. Do not rename
>    one it does name.
> 2. **Every fill, border, radius, spacing, gap, shadow and font-size value is a
>    `--ui-*` custom property** (`var(--ui-color-…)`, `var(--ui-radius-…)`,
>    `var(--ui-spacing-…)`, `var(--ui-shadow-…)`, `var(--ui-font-size-…)`). No hex/rgb
>    literals, no raw `px`, no Tailwind utility class (`bg-*`, `p-*`, `rounded-*`,
>    `shadow-*`) — this library has no Tailwind dependency anywhere in it.
> 3. **Compose structurally, don't flatten.** If the component has more than one
>    logical region (a header/body/footer, a viewport/container split, an icon + label
>    - action), give each region its own sub-component or the framework's own slot
>      mechanism — the same pattern `AtlCard`/`AtlCardHeader`/`AtlCardContent`/
>      `AtlCardFooter` and `AtlDialog`/`AtlDialogHeader`/`AtlDialogContent`/
>      `AtlDialogFooter` already use in this repo, identically in all three frameworks:
>      Angular content projection (`<ng-content>`) plus a named `atl-<name>-<region>`
>      element per region; React a named function export per region, content via
>      `children`; Vue a named SFC export per region, content via the default `<slot />`.
>      Do not dump every region into one flat prop bag or one undifferentiated block of
>      children.
> 4. **Every icon-only control gets a real accessible name.** Follow `AtlIcon`'s own
>    pattern (look it up with `docs-show`): a `label` prop that's absent by default — the
>    icon is decorative unless a name is explicitly supplied — and `AtlButton`'s own
>    rule: an icon-only button needs `aria-label` (the React adapter enforces this at
>    the type level; Angular/Vue warn in dev mode). Every non-icon interactive control
>    is a real `<button>`/`<a>`, never a styled `<div>`/`<span>`.
> 5. **Any severity/status/state the handoff document names is visible without
>    colour** — an icon, a prefix word, or a visually-hidden string, never colour alone.
> 6. **If a requirement has no natural mapping onto what you're generating, say so** —
>    ask, don't silently drop it or invent a workaround prop.
>
> When you're done: confirm the story you generated declares `tags: ['autodocs']`
> (the brief's "Done when" item 6 — without it the story renders Canvas
> only, no Docs tab, for a reason that has nothing to do with the component itself).

### 2.2 Correction — invented prop (Block 03)

Use when Claude adds a prop the handoff document never named.

> You added `<PROP>` to `<ComponentName>`. Check what actually authorizes a prop here —
> the handoff document's "In scope" / "Token bindings" lines, or (if you're extending an
> existing library component) its `docs-show` entry. Is `<PROP>` named there? If not,
> remove it — a prop that "seems reasonable" is still not in the handoff document. If you think
> the component genuinely needs it, ask me as a question instead of shipping it as code.

**Why this is the right shape, not a made-up scenario:** it already happened, for real,
in this repo's own prompt-context document. An earlier draft of `plan/big-picture.md`
gave `AtlToggle` a `variant` input in its worked example. The shipped `AtlToggleSpec`
(`libs/spec/src/index.ts:172-175`) never carried one — only `checked`, `onCheckedChange`
plus the shared form-field fields (`disabled`, `invalid`, `required`, `name`). The
current file's own correction note reads: _"An earlier draft of this example invented
one; cut rather than carried forward."_ That is the exact shape of mistake this prompt
corrects, verified against the file it happened in.

### 2.3 Correction — missing token (Block 03)

Use when Claude hardcodes a value instead of reaching for a `--ui-*` custom property.

> You rendered `<value/effect>` on `<ComponentName>` with a hardcoded value (or with
> none at all) instead of a `--ui-*` custom property. Check
> `workshop-<fw>/src/styles/tokens.css` (the workspace's token file) for the matching name — don't guess one. If this is elevation/shadow:
> there is no `shadow/*` Figma variable in `Library Tokens` at all — every brief in this
> workshop says so explicitly — so elevation is _always_ CSS-only: `var(--ui-shadow-lg)`
> for a floating surface (a toast), `var(--ui-shadow-md)` for a raised one (an elevated
> card). Never a literal `box-shadow` value, never `none` where the design calls for
> elevation.

**Grounding:** `--ui-shadow-lg`, `--ui-shadow-md`, `--ui-shadow-sm/xs/xl` all exist in
the canonical `tokens.css` (checked directly, full grep of `--ui-shadow-*`). Two of the
four briefs draw on this gap by name — `toast.md` ("The shadow is not a variable… state
that in your Figma description; do not invent a variable for it.") and `statcard.md`
("Elevation is a CSS-only token") — and the shared `README.md` states the same rule for
all four ("`Library Tokens` carries… no shadow"). Avatar and TagChip have no elevation of
their own and neither brief mentions it.

### 2.4 Correction — wrong slot (Block 03)

Use when Claude puts structural content in the wrong place instead of the region that
owns it.

> `<content>` belongs in `<ComponentName>`'s `<region>` slot as a real interactive
> element, not inline text or a styled `<span>`/`<a>` standing in for one. Move it into
> its own element in the right region, reachable by keyboard the same way the rest of
> the component is.

**Per-brief grounding — each brief already names one real Figma↔code mismatch of
exactly this shape (§5 of each), quoted directly rather than invented:**

| Component | Drawn/typed as (wrong)                                              | Belongs as (right)                                                                           | Source                           |
| --------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| Toast     | An inline link "Undo" inside the body text                          | A Button in the `action` slot                                                                | `workshop/briefs/toast.md` §5    |
| Avatar    | "Avatar (image)" and "Avatar (initials)" as two separate components | One component with a runtime fallback chain (`image` → `initials` → `icon`)                  | `workshop/briefs/avatar.md` §5   |
| TagChip   | Static text-with-border decoration, no real control                 | A live element with a real `<button>` remove control that's part of the form value           | `workshop/briefs/tagchip.md` §5  |
| StatCard  | A card stacked on top of an invisible button component              | One `<a>`/`<button>` wrapping the card, or the overlay pattern (`::before` on the activator) | `workshop/briefs/statcard.md` §5 |

Hand the trainer the one row matching whichever component the participant picked — it's
already phrased as a ready one-line correction:

> "`<Drawn/typed as, from the row above>`" is the wrong shape here. Rebuild it as
> "`<Belongs as, from the row above>`" — §5 of the brief says why.

---

### 2.5 `docs-show` on your own component (Day 2 Block 02, 12:05 to 12:20, part 1: 10 min)

NOT YET VERIFIED (rehearsal). Through the local Storybook MCP (`storybook-local`), once the
component and its stories render. The point: what would an agent that uses your component
have to guess?

> Call `docs-list` on `storybook-local`, then `docs-show` for my component `<ComponentName>`.
> List what an agent using this component would have to guess: a missing component
> description, a property without a description, a value set shown as a bare alias. Do not
> change anything yet.

Then:

> Add the JSDoc that closes those gaps: a description for the component and one line per
> property. Call `docs-show` again and show me what changed.

Part 2 (5 min, no prompt): the running stories next to the Figma component, every variant and
state; write the differences down as a list (Block 04 sorts it).

**Expected output.** A list of gaps, then a second `docs-show` that has the description and
the property lines. Checkpoint D2B02-C4 (12:20): `docs-show` ran on the own component and at
least one description was added on at least 70 % of the seats. Rule R9: at 12:05, if 30 % or
more have no rendering story, this row becomes a trainer demo on one green seat.

**Fallback without the MCP:**

```text
npx storybook tools --config-dir workshop-<fw>/.storybook --json docs show --input '{"id":"<id>"}'
```

Measured 2026-11-18 on the 0.4.10 Angular scaffold through that CLI route: a new component
with a story appears in `docs list`; `docs show` prints Inputs and Outputs, the JSDoc line
where one exists and nothing where none does. UNVERIFIED: the same call over the running
local MCP, and whether the dev server refreshes the entry after a JSDoc edit without a
restart.

### 2.6 The Definition-of-Done exercise (Day 2 Block 00, 09:18 to 09:28, 10 min)

NOT YET VERIFIED (rehearsal): that the two answers differ as described. The workspace the
participants have already carries the rule the agent reads every session. Projector first
(3 min): the four things an agent gets in this workspace (the rules file, read every
session; a skill, loaded when the task matches and shown in demo D-7 just before; an MCP
server from `.mcp.json`, tools and data; a hook, run without being asked), on two files:
`CLAUDE.md` → "Definition of Done" and `.claude/settings.json` → `hooks.PostToolUse` →
`.claude/hooks/format-edited.sh`. Then the exercise (7 min), four steps:

1. Ask: "Which commands does this workspace's Definition of Done list? Only list them."
   The answer names six.
2. Delete this exact line from the list in `CLAUDE.md` and save. Leave the count word
   ("all six") as it is:

   ```text
   - `npm run check:stories` — every story, rendered in Chromium, axe-checked
   ```

3. `/clear`, ask the same question again. The list now names five; `check:stories` is gone.
4. Put the line back (undo) and save.

**Checkpoint D2B00-C3:** the second answer on every seat no longer names
`npm run check:stories`, and the line is back in `CLAUDE.md` at 09:28.

**Trainer notes.** Line for the room: the agent runs what the list names, and a check that
is not in the list is a check nobody asked for. An agent that points out "the text says six,
the list has five" has read the file closely: say so. `/verify` has its own list in
`.claude/commands/verify.md` and still runs six. **Stretch:** write down the one line your
own team would add to this list, the command and what it proves. Until the scaffold release
of 2026-11 this exercise added lint and build to the list; the scaffold now ships both
(commit 8c8fdf6a), so the exercise takes a line out and puts it back.

**Fallback.** The second answer still names it: the file was not saved or the session was
not cleared; show the list in `CLAUDE.md` and ask again.

---

## 3. Day 2 · Block 04 — Verify: a11y, states, parity

### 3.1 Three-step a11y audit prompt

> Run the three-step accessibility check on `<ComponentName>`, in order, and report each
> step's result before moving to the next:
>
> 1. `figma_audit_component_accessibility` against the Figma node (needs the Desktop
>    Bridge running — confirm `figma_get_status` reports `setup.valid: true` first).
> 2. Open the story in Storybook and read the A11y panel (axe-core) — list every
>    violation, not just the count.
> 3. Keyboard-walk the rendered component yourself: Tab, Shift+Tab, Enter, Escape — does
>    focus order, activation and dismissal all work with no mouse?
>
> Fix only the obligations tagged **(this block)** in §4 of the brief, pasted below this
> prompt, for the variant/state you actually built. Leave **(full component)** items as a
> written note in the master's Figma description, not as code you claim passes a check
> it was never exercised against.

### 3.2 Dark-mode token audit prompt

> Switch the theme control in Storybook's toolbar to dark (addon-themes, it sets
> `data-theme="dark"`; the backgrounds control only recolours the canvas and switches
> nothing) and look at `<ComponentName>` in both variants/states you built. Confirm
> three things and report each:
>
> 1. **Every colour still resolves through a `--ui-*` custom property** — none
>    hardcoded — so the dark override already declared in `tokens.css`'s
>    `[data-theme="dark"]` block actually takes effect. A hardcoded colour is invisible
>    in light mode and wrong in dark mode at the same time.
> 2. **No control gained a `transform` on hover or press.** Atelier's own rule
>    (`/design-principles`, "Physical Authenticity"): state is a colour/border
>    token swap only — no shrink, no lift. Confirmed against all three framework libs;
>    the one documented exception is the Chat popup's floating action button, which
>    doesn't apply here.
> 3. **Disabled state still reads as `opacity: var(--ui-opacity-disabled)` with
>    `cursor: not-allowed` and `pointer-events: none`** — the same one token/one value
>    pattern every other component in the library uses, not a separate dark-mode-only
>    treatment.

### 3.3 Parity prompt for your own component (participants)

Day 2 Block 04, parity row 15:45 to 15:53 (8 min). Same shape as the Day 1 comparison
prompt; the node id comes from the participant's handoff document. NOT YET VERIFIED as
rewritten (rehearsal). The report is only a list here: the **sorting row** (15:53 to
16:13) labels each difference and fixes the code ones.

> Run `figma_check_design_parity` on the node `<NODE FROM THE HANDOFF DOCUMENT>` against my
> component `<ComponentName>`. For each discrepancy, say whether it is **code** (the code
> should change), **Figma** (the master should change) or **kept on purpose**, and why. Only
> call it "kept on purpose" if the handoff document's "Deliberate differences" section
> names it. Do not fix anything yet.

Without the bridge: no parity call; sort the Block 02 list instead.

While this runs, the trainer shows demo D-8 (§3.5) on the trainer machine only. The
participants do not assemble a `codeSpec` and do not run `check:contracts -- --emit`.

### 3.4 codeSpec assembly prompt (trainer only: preparation for D-8)

**Trainer-only material.** Participants never see or run this. It prepares the `codeSpec`
for the D-8 demo on the trainer machine. `UNVERIFIED live (R-235)`: not yet run end to end
in a rehearsal. The emit command is documented on `/build-your-own` and in
`libs/design-contracts/README.md`; the accessibility step on `/build-your-own` (Block 04):

> Build the `codeSpec` for `figma_check_design_parity` on my component `<Name>`.
>
> 1. Run `npm run check:contracts -- --emit tmp/codespec` and read what it writes for
>    `<Name>`: that gives `componentAPI`, `metadata` and `tokens`.
> 2. Call `figma_scan_code_accessibility` with the HTML below and `mapToCodeSpec: true`:
>    that gives `accessibility`.
> 3. Show me one `codeSpec` object with exactly these four sections and say for each where
>    it came from. Do not add a section you have no source for.
>
> HTML (the story root's `outerHTML`, copied from DevTools):
> `<paste>`

(What `--emit` writes, read in `libs/design-contracts/README.md`: one file per component,
`<folder>/<fw>/<Component>.codespec.json`, so with this prompt
`tmp/codespec/<fw>/<Name>.codespec.json` for the workspace's framework, holding
`componentAPI`, `metadata` and `tokens.usedTokens`. The command writes a file for every
component it checks, not only `<Name>`, and the pages `/build-your-own` and
`/design-to-code` name no file path; the prompt's "read what it writes for `<Name>`"
therefore stands, the path is the README's. If Claude cannot find the file, ask it to list
`tmp/codespec`.)

### 3.5 Parity double-call prompt (trainer only: D-8)

**Trainer-only material**, about 3 minutes on the trainer machine inside the parity row.
One point: a field you do not pass is not compared, so a quiet report is not a clean
component. This is the exercise `tasks/schulung-dry-run-kit.md` §4 (Day 2, Block 04) flags as
"never watched live" before a rehearsal runs it. Run §3.4 first.

> Call `figma_check_design_parity` on `<node>`/`<variant>` twice, same node both times.
> Use the variant node: geometry lives there. The component set is for `componentAPI`
> only; a variant carries no component properties.
>
> First call: pass the four sections I already have — `componentAPI`, `metadata`,
> `tokens`, `accessibility` — plus a `spacing` section I wrote by hand from the
> component's CSS (`paddingTop`, `paddingRight`, `paddingBottom`, `paddingLeft`, `gap`)
> with one value deliberately wrong. Expect the report to catch it.
>
> Second call: the same four sections and the same wrong value, but leave the
> `spacing` section out of `codeSpec` entirely this time. Expect **no spacing row** —
> fields you don't pass are not compared, which is different from "fields that happen
> to be correct."

(Schema verified against `skills/figma-workspace-architect/references/code-sync.md` —
the seven field names are `visual`, `spacing`, `typography`, `tokens`, `componentAPI`,
`accessibility`, `metadata`, all optional. `visual` and `typography` are left out on
purpose: 30 minutes is not enough to hand-write them. The 2026-10-14 run below used all
seven; the four-plus-spacing pair is UNVERIFIED live, R-227.)

(Run live 2026-10-14 on AtlButton, R-047: call 1 flagged the wrong `gap` as major, call 2
showed no spacing row and the parity score rose from 48 to 72. The report echoes the
passed sections under `codeData` and lists under `summary.categories` only the categories
with findings; it has no "sections compared" list. Against the component set `129:20`
`componentAPI` matched; against the variant `129:4` every prop came back as missing.)

---

## 4. Quick index — which prompt for which failure

| Symptom in the room                                                                                                | Use                |
| ------------------------------------------------------------------------------------------------------------------ | ------------------ |
| Inline `style`/hex/Tailwind class instead of a token, anywhere in Day 2 Blocks 02–03, or the Day 1 Settings Card   | §1 add-on, or §2.3 |
| Day 1 Block 02, 11:25: the agent runs lint and build, then the planted `alt`/click defects, then the repair        | §1a                |
| Agent writes without `docs-list`, uses an undocumented input, or hand-builds a library component (Day 1 Block 05)  | §1b                |
| Day 1 Block 05, 16:30: closing checks run by the agent (lint, stylelint, format, build), then the receipts         | §1b                |
| Figma linter run (Day 1 Block 03, Day 2 Block 01): the list is long, or the default run drowns the room            | §1c                |
| Generating the component on Day 2 (component, test and stories in one step, deliberate differences as constraints) | §2.1               |
| A prop appears that the handoff document / spec never named                                                        | §2.2               |
| Structural content (header/action/remove-button/etc.) dumped as flat children instead of its own region            | §2.4               |
| `docs-show` on your own component: what would a consumer's agent have to guess (Day 2 Block 02, 12:05)             | §2.5               |
| Definition-of-Done exercise (Day 2 Block 00, 09:18): the second answer still names `check:stories`                 | §2.6               |
| A11y panel or keyboard walk turns something up in Day 2 Block 04                                                   | §3.1               |
| Dark-mode toggle reveals a hardcoded colour or a stray hover animation                                             | §3.2               |
| Parity report on your own component (Day 2 Block 04, 15:45)                                                        | §3.3               |
| Trainer only: demo D-8, "a field you do not pass is not compared" (prepare with §3.4, then §3.5)                   | §3.4, then §3.5    |

---

## 5. Verification — what was checked, what was cut

**Revision 2026-11-18: NOT YET VERIFIED (rehearsal, R-040).** Every prompt in §1a, §1b (the
closing-checks prompt), §1c, §2.1 (as revised), §2.5, §2.6 and §3.3 is new or changed and has
not been run in a rehearsal; their expected outputs are the measured facts named in the
sections (2026-11-17: the lint rule ids, the compiler error codes, the 59 / 18 / 40 findings,
the run times; 2026-11-18: the `storybook tools` CLI route) and nothing else. Unverified, by
name: the number of findings of the three-rule Figma run; that the two Definition-of-Done
answers differ as described; the local-MCP form of §2.5 and whether the dev server refreshes
after a JSDoc edit; §3.4 and §3.5 as a four-plus-spacing pair (R-227, R-235). The dates below
belong to the earlier text only.

**Checked directly against the repo (2026-09-10), not assumed:**

- `AtlButtonSpec`, `AtlBadgeSpec`, `AtlAvatarSpec`, `AtlCardSpec`, `AtlToastVariant`/
  `AtlToastOptions`, `AtlIconSpec`/`AtlIconName`, `AtlToggleSpec`, `AtlFormFieldSpec` —
  all read directly from `libs/spec/src/index.ts`.
- `AtlCard`/`AtlCardHeader`/`AtlCardContent`/`AtlCardFooter` exports — read from
  `libs/react/src/lib/card/atl-card.tsx`; the Angular selectors
  (`atl-dialog-header`/`-content`/`-footer`) and the matching Vue SFC files
  (`libs/vue/src/lib/dialog/atl-dialog-{header,content,footer}.vue`) read directly, not
  inferred from the React file alone.
- `AtlButton`'s `aria-label` discriminated-union enforcement — read directly from
  `libs/react/src/lib/button/atl-button.tsx`.
- Every `--ui-*` token name cited (`--ui-shadow-{xs,sm,md,lg,xl}`, `--ui-radius-*`,
  `--ui-spacing-*`, `--ui-opacity-disabled`, `--ui-color-*`) — extracted by grep from
  `libs/create-workspace/src/generators/preset/files/styles/tokens.css`, the canonical
  file per ADR-0115/ADR-0116; only names are cited, per that ADR's rule, not values.
- The `tutorial.astro` `examplePrompt`/`OUTPUT` blocks (Settings Card) — read in full,
  all three frameworks, to confirm the four token names in §1 are exactly what the page
  already generates.
- 2026-11-17 (R-237, R-246): the Angular `OUTPUT` block was built, linted and
  stylelinted in a fresh `create-atelier-ui-workspace@0.4.10` scaffold (exit 0 each, after
  the weight token); the React and Vue blocks were not run. The seven repo-only paths
  that stood inside §2 prompt text were replaced by names a scaffolded workspace has;
  no quoted prompt line names a `libs/`, `plan/` or `workshop/briefs/` path any more
  (checked by grep, not by pasting each prompt into a workspace).
- The `AtlToggle`/`variant` correction example — read directly from the current
  `plan/big-picture.md` (§2), which carries its own "cut rather than carried forward"
  note; not paraphrased from memory.
- The four brief's §5 Figma↔code gotcha tables (`toast.md`, `avatar.md`, `tagchip.md`,
  `statcard.md`) — read in full; the table in §2.4 quotes them, does not paraphrase.
- The seven `codeSpec` field names — read directly from
  `skills/figma-workspace-architect/references/code-sync.md`.
- `plan/design-principles.md` §1 (no transform on hover/press) and §7/§8 (dark mode,
  disabled pattern) — read in full, including the one documented FAB exception.

**Deliberately left out for being unverifiable, rather than guessed:**

- A generation prompt with **concrete prop names for the participant's own new
  component** (Toast/Avatar/TagChip/StatCard as the _workshop_ build, not the existing
  library reference). Those specs don't exist yet — ADR-0113 puts them in the
  participant's own file, never the shared master — so any prop name here would be
  invented, exactly the failure mode this sheet exists to prevent. §2.1's generation
  prompt uses the handoff document as the only source of truth for that component's
  actual prop names, by design.
- A single canonical `--ui-shadow-*` value for "elevation" across all four briefs.
  `toast.md` names `--ui-shadow-lg`; the design-to-code skill's own worked Toast example
  (`skills/design-to-code/references/handoff-document.md`) uses `--ui-shadow-md` for the
  same component. Both are real, cited verbatim from their own source, and left
  side-by-side rather than silently resolved to one — that's a live inconsistency
  between two documents, not a typo in this sheet, and picking one to paper over it
  would be inventing an answer neither source actually gives.
