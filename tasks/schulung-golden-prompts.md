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
- **Block mapping** (block numbers and titles as on `/schulung`):
  - §1 = Day 1 Block 02 "Mini-loop: first success" (existing components only — the
    Settings Card).
  - §1b = Day 1 Block 05 "A screen from Storybook, against the clock" (existing
    components only, no Figma — the Team directory screen).
  - §2.1 = Day 2 Block 02 "Contract, component, stories" (the generation prompt);
    §2.2–2.4 = Day 2 Block 03 "Iterate: prompt quality and the self-healing loop" (the
    correction prompts — the block `schulung.astro` names for golden prompts).
  - §3 = Day 2 Block 04 "Verify: a11y, states, parity" (a11y + dark mode + the closing
    parity check).

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

(Grounded directly in the tutorial's own React/Angular/Vue output blocks — all three
already use exactly these four token names for exactly these four properties.)

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

**When the agent starts writing without calling `docs-list`** (it can): hand it this.

> Stop. Do not write more code yet. Call `docs-list` on the Storybook MCP and give me the
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

## 2. Day 2 · Blocks 02–03 — Codegen and corrections (token-fidelity)

### 2.1 Generation prompt (Block 02 — Contract, component, stories)

> Generate the `<FRAMEWORK>` implementation of `<ComponentName>` from the handoff
> document below — not from the Figma picture alone (ADR-0096). Read every requirement
> before writing code.
>
> --- HANDOFF DOCUMENT (paste yours here) ---
> `<PASTE THE DAY-2-BLOCK-01 HANDOFF DOCUMENT>`
> --- END HANDOFF DOCUMENT ---
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
> 4. **Every icon-only control gets a real accessible name.** Follow `AtlIconSpec`'s own
>    pattern (`libs/spec/src/index.ts`): a `label` prop that's absent by default — the
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
> (`workshop/briefs/README.md` "Done when" item 6 — without it the story renders Canvas
> only, no Docs tab, for a reason that has nothing to do with the component itself).

### 2.2 Correction — invented prop (Block 03)

Use when Claude adds a prop the handoff document never named.

> You added `<PROP>` to `<ComponentName>`. Check what actually authorizes a prop here —
> the handoff document's "In scope" / "Token bindings" lines, or (if you're extending an
> existing library component) `libs/spec/src/index.ts`. Is `<PROP>` named there? If not,
> remove it — a prop that "seems reasonable" is still not in the contract. If you think
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
> `libs/create-workspace/src/generators/preset/files/styles/tokens.css` (the canonical
> token file) for the matching name — don't guess one. If this is elevation/shadow:
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
> "`<Belongs as, from the row above>`" — see `workshop/briefs/<component>.md` §5 for why.

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
> Fix only the obligations tagged **(this block)** in `workshop/briefs/<component>.md`
> §4, for the variant/state you actually built. Leave **(full component)** items as a
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
>    (`plan/design-principles.md` §1, "Physical Authenticity"): state is a colour/border
>    token swap only — no shrink, no lift. Confirmed against all three framework libs;
>    the one documented exception is the Chat popup's floating action button, which
>    doesn't apply here.
> 3. **Disabled state still reads as `opacity: var(--ui-opacity-disabled)` with
>    `cursor: not-allowed` and `pointer-events: none`** — the same one token/one value
>    pattern every other component in the library uses, not a separate dark-mode-only
>    treatment.

### 3.3 Parity double-call prompt (the `codeSpec` field exercise)

This is the exact exercise `tasks/schulung-dry-run-kit.md` §4 (Day 2, Block 04) flags as
"never watched live" before a real rehearsal runs it — hand it to participants verbatim
once they've built their component:

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

| Symptom in the room                                                                                               | Use                |
| ----------------------------------------------------------------------------------------------------------------- | ------------------ |
| Inline `style`/hex/Tailwind class instead of a token, anywhere in Day 2 Blocks 02–03, or the Day 1 Settings Card  | §1 add-on, or §2.3 |
| Agent writes without `docs-list`, uses an undocumented input, or hand-builds a library component (Day 1 Block 05) | §1b                |
| A prop appears that the handoff document / spec never named                                                       | §2.2               |
| Structural content (header/action/remove-button/etc.) dumped as flat children instead of its own region           | §2.4               |
| A11y panel or keyboard walk turns something up in Day 2 Block 04                                                  | §3.1               |
| Dark-mode toggle reveals a hardcoded colour or a stray hover animation                                            | §3.2               |
| Closing parity check, to actually exercise the "fields not passed aren't compared" claim                          | §3.3               |

---

## 5. Verification — what was checked, what was cut

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
