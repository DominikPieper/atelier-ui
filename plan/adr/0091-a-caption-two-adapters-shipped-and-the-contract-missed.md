---
status: accepted
date: 2026-09-05
sources:
  - libs/spec/src/index.ts (AtlFormFieldSpec, AtlCaptionSpec, AtlInputSpec, AtlTextareaSpec, AtlSelectSpec)
  - libs/react/src/lib/input/atl-input.tsx, libs/react/src/lib/textarea/atl-textarea.tsx, libs/react/src/lib/select/atl-select.tsx
  - libs/vue/src/lib/input/atl-input.vue, libs/vue/src/lib/textarea/atl-textarea.vue, libs/vue/src/lib/select/atl-select.vue
  - libs/angular/src/lib/input/atl-input.ts, libs/angular/src/lib/textarea/atl-textarea.ts, libs/angular/src/lib/select/atl-select.ts
  - tools/parity/a11y/atl-input.{angular,react,vue}.json, tools/parity/a11y/atl-textarea.{angular,react,vue}.json
  - package.json (react ^19.2.4, vue ^3.5.30 — useId() availability)
  - plan/adr/0045-readonly-only-where-it-is-enforced.md (rule-of-three precedent for what does/doesn't join AtlFormFieldSpec)
  - plan/adr/0055-invalid-is-not-a-colour.md (spec vs. framework-only concerns — where `touched` was ruled Angular-only)
  - tasks/todo.md (L1: "AtlSelect demo/component: native <select> without an accessible name")
---

# ADR-0091: A caption two adapters shipped and the contract missed

## Status

Accepted. `label` is now part of a shared `AtlCaptionSpec` mixin applied to
`AtlInputSpec`, `AtlTextareaSpec`, and `AtlSelectSpec`, and implemented in
Angular for all three. All three adapters generate their control-association
id from each framework's native stable-id primitive, and a caller-supplied
`id` and `aria-label` both reach the actual native control, not a wrapper,
in all three. Recorded at decision time; revised same-day after a
second-model review of the working diff found two real defects in the first
pass and disproved this ADR's original occurrence count (see Context and
Decision).

## Context

`AtlInput`'s React and Vue adapters render an optional `label` prop as a
`<label>` wired to the control via `for`/`id` — React at
`libs/react/src/lib/input/atl-input.tsx:35,83`, Vue at
`libs/vue/src/lib/input/atl-input.vue:17,51`. Neither `AtlInputSpec` nor the
Angular adapter had it. The docs' `/tutorial` page teaches `label="..."` on
`AtlInput`, so a participant in an Angular cohort who copies the taught
sample gets a prop that does not exist and the code fails to compile — a
rule the spec-and-three-adapters contract exists to prevent (`CLAUDE.md`:
"Any prop, variant, or size that exists must be reflected in all four
locations or it doesn't exist").

**This ADR's first pass reasoned that Input was the only occurrence, and
used that to justify putting `label` on `AtlInputSpec` alone with a rule-of-
three argument against generalizing it. That reasoning was wrong.** A
second-model review checked the same defect against Input's siblings and
found it already existed, unfixed, twice more:

- `AtlTextarea` — React at `atl-textarea.tsx:31,90`, Vue at
  `atl-textarea.vue:17,78`.
- `AtlSelect` — React at `atl-select.tsx:38,74`, Vue at
  `atl-select.vue:15,51`.

Both extend `AtlFormFieldSpec` and had the identical gap: `label` shipped in
two adapters, absent from the spec and from Angular. Three occurrences is
not a coincidence to special-case around — it is exactly what the rule of
three asks for a shared abstraction to cover. The correct count changes the
decision (see below), and it also means `AtlSelect`'s Angular adapter had no
way to give its trigger an accessible name via a visible caption at all,
which is independently on the project's backlog: **L1** — "`AtlSelect` demo
/ component: native `<select>` without an accessible name (axe
`select-name`, critical) — either the demo omits the label the component
needs, or the spec lets it be omitted." The demo omitted it because there
was no working `label` to pass on the Angular side and no prop wired end to
end anywhere to point at in the fix; this ADR's fix supplies both halves.

Auditing the six call sites (React + Vue × Input/Textarea/Select) for the id
each one generates surfaced a second, independent defect, present in four of
the six:

- React derived the id from the label text in both Input and Textarea:
  `` `input-${label.toLowerCase().replace(/\s+/g, '-')}` ``, `` `textarea-${label...}` ``.
  Two controls with the same label text collided on one id, silently
  breaking the `for`/`id` association for the second one (the browser
  resolves `for="input-email"` to whichever element with that id it finds
  first). Select's React adapter had the identical pattern:
  `` `select-${label.toLowerCase()...}` ``.
- Vue called `Math.random()` inside a `computed()` in both Input and
  Textarea: `` `input-${Math.random().toString(36).slice(2)}` ``,
  `` `textarea-${Math.random()...}` ``. A random id rolled fresh per client
  instantiation, differing between a server render and the client's
  hydration render — an SSR hydration mismatch waiting to happen the day
  these adapters are server-rendered. Vue's Select adapter did **not** have
  this bug — it already called `useId()` correctly for `selectId` — so it
  needed no id-generation fix, only the spec/Angular `label` work.

A **third-party review of the Angular implementation itself** (after `label`
was added for Input, before this revision) found two further defects, both
now fixed and both described in full under Decision:

1. **[P1]** A static `id="…"` attribute on `<atl-input>` — the shape a
   tutorial sample writes — matched the declared `id` input **and** stayed
   as a literal DOM attribute on the host element, duplicating the id this
   component also put on the native `<input>`. Because the host is not
   labelable and is first in document order, `<label for>` resolved to
   nothing: `input.labels.length === 0`, even though a naive test comparing
   `id` attribute strings on the two elements would not have noticed
   (they read equal; they just did not point at each other). Reproduced and
   confirmed empirically in jsdom before any fix was applied.
2. **[P2]** The Angular JSDoc told callers to reach for `aria-label` when
   there is no visible `label`, but that attribute never reached the native
   control on Angular (no forwarding existed) or on Vue (an undeclared
   attribute falls through to the component's root `<div>` by Vue's default
   inheritance, not to the nested native control). Only React forwarded it
   correctly, via its generic `...rest` prop spread.

The same review also caught that this ADR's own justification for the
Angular id-generation idiom was not true as written: it claimed the
module-scoped `nextId` counter was "deterministic across server and client
render because both walk the same component tree in the same order." A
persistent Node SSR process does not reset `nextId` between requests, while
a fresh client always starts at 0 — so server and client render would
diverge from the second request onward, the exact class of bug the counter
was credited with avoiding. See Decision for the corrected claim.

## Decision

**Introduce `AtlCaptionSpec` as its own mixin — `{ label?: string }` — not
merged into `AtlFormFieldSpec`, and not left as three separate,
easy-to-drift declarations either.** Every consumer of `AtlFormFieldSpec`
was checked before deciding where `label` belongs:

- `AtlInputSpec`, `AtlTextareaSpec`, `AtlSelectSpec` — a `label` string prop
  exists in React and Vue today. These three extend `AtlCaptionSpec`.
- `AtlCheckboxSpec`, `AtlToggleSpec` — project their caption as **content**
  (`children` in React, `<ng-content>` in Angular, `<slot>` in Vue), not as
  a string prop. Merging `label` into `AtlFormFieldSpec` would have handed
  these two an inherited `label?: string` that no adapter reads — a second,
  silently-ignored way to say the same thing, which is worse than absent
  (the same reasoning ADR-0045 applied to `readonly`). They do not extend
  `AtlCaptionSpec`.
- `AtlRadioGroupSpec`, `AtlComboboxSpec` — have no caption prop in any
  adapter today. Applying `AtlCaptionSpec` to them would be speculative,
  not a fix to an observed divergence. They do not extend it either.

**Implement `label` in Angular** for all three components, as an `input('')`
bound to a `<label [attr.for]>`, conditional on `label()` being set —
mirroring where React and Vue place it and the same "no `<label>` when
omitted" behavior:

- **Input, Textarea** — the `<label>` is rendered before the field wrapper
  and points at the same id the native control gets (see the id-generation
  and P1 fix below).
- **Select** — the trigger is a `<button>`, which is a labelable element per
  the HTML standard, so the same `<label for>` pattern works pointing at the
  (always-present, internally generated) `triggerId`. Select's Angular
  adapter has no caller-overridable `id` input — matching Vue's Select,
  which also has none — so there is no id to collide with and no P1-style
  host-duplication risk to fix there.

**Alternatives rejected** (unchanged from the first pass, still correct):

- *Remove `label` from React and Vue.* Would be a breaking change at 0.2.31
  across three components instead of one, and `/tutorial` already teaches
  it for Input.
- *Leave it as a documented divergence.* Contradicts "any given workshop
  uses exactly one framework" and each is a first-class, interchangeable
  target (`CLAUDE.md`).

**Unify the id-generation strategy on each framework's native stable-id
primitive**, with a caller-supplied `id` always winning over the
auto-generated one, everywhere the bug existed:

- **React** — `useId()` in Input, Textarea, and Select. Replaces the
  label-text slug in all three. Called unconditionally at the top of each
  component (hooks rule), same as the sibling `AtlCheckbox` adapter already
  does for its own id.
- **Vue** — `useId()` in Input and Textarea, replacing `Math.random()`.
  Select needed no change — it already used `useId()` correctly.
- **Angular** — a module-scoped `nextId` counter (`` `atl-<name>-${nextId++}` ``)
  in Input and Textarea, not `useId()`-equivalent tooling. Not a new
  mechanism: every other Angular form control in this lib (`AtlCheckbox`,
  `AtlRadio`, `AtlToggle`, `AtlSelect`, and now `AtlTextarea`) already
  generates its own ids this way.

  **The honest claim, corrected**, is narrower than what the first pass of
  this ADR said: `nextId` gives collision-free ids across every instance
  rendered within one running copy of the module — one browser tab, or one
  server-render pass — which is the guarantee this lib actually needs, since
  none of these adapters are server-rendered today. It does **not** give
  `useId()`'s cross-request SSR guarantee: `nextId` is a plain module-level
  variable, not reset per request, so a persistent Node SSR process would
  keep incrementing it across requests while a fresh client always starts at
  0, diverging from the second request onward. Two independently bundled
  copies of this module could likewise each start their own `nextId` at 0
  and collide. Both risks are real and both are currently unexercised — this
  repo does not server-render these adapters — and both are now stated
  plainly in the code comment (`atl-input.ts`, `atl-textarea.ts`) instead of
  the disproved "just as SSR-safe" claim the first pass wrote. Revisit this
  if SSR or module-duplication ever applies here; keeping the counter for
  now (rather than reaching for Angular's own hydration-id machinery, which
  no sibling control uses either) is the smaller, more consistent change.

In all three, the shape is the same: `id || (label ? generatedId : undefined)`
— an explicit `id` always wins; the generated id is used only as a fallback,
and only when a `<label>` needs something to point `for` at.

**Fix the P1 host-duplication defect** by forcing the host's own `id`
attribute to always be absent, in Angular's Input and Textarea:
`host: { '[attr.id]': 'null' }`. A host attribute binding runs on every
change-detection pass and overwrites whatever the parent template's static
attribute placed there at creation, so this reliably strips the duplicate
regardless of whether the caller wrote `id="x"` or `[id]="x"` on
`<atl-input>`. The alternative — renaming the component's `id` input to
something else so it can never collide with a plain HTML attribute — was
rejected: it would make Angular's `AtlInput`/`AtlTextarea` the one adapter
where the natural, HTML-matching prop name does not work, surprising anyone
moving between frameworks or copying a React/Vue sample. Forcing the host
attribute absent keeps `id` meaning exactly one thing — the native control's
id — with no new naming surface. New tests pin the fix by checking the
actual for/id **association** (`getByLabelText`, `input.labels`), not by
comparing two `id` attribute strings (which is what let the bug ship
unnoticed the first time): each of Input's and Textarea's Angular specs
gained a regression test that renders `<atl-input label="Email"
id="custom-email-id">` and asserts both that the host carries no `id`
attribute and that `getByLabelText('Email')` resolves — confirmed to fail
against the pre-fix code and pass against the fix.

**Fix the P2 aria-label defect** by making all three adapters route
`aria-label` to the native control specifically, instead of leaving it to
each framework's default (and differing) attribute-forwarding behavior:

- **React** — already correct (forwards via `...rest`); no change.
- **Angular** — an aliased input, `input('', { alias: 'aria-label' })`,
  bound to `[attr.aria-label]` on the native control (the input, the
  textarea, or Select's trigger button), with the same host
  `'[attr.aria-label]': 'null'` defense as the `id` fix — for the same
  reason: a static `aria-label="…"` on the host component tag both binds
  the aliased input and stays on the host element. On Select specifically
  the host also carries `role="combobox"`, so an un-defended `aria-label`
  there would not be a harmless no-op like on Input's roleless host — it
  would be a second, competing accessible name next to the trigger
  button's.
- **Vue** — an explicit, typed prop, not `inheritAttrs: false` +
  `v-bind="$attrs"`. The latter was considered and rejected: it would
  change fallthrough behavior for every other undeclared attribute
  (`class`, `data-*`, …), a materially bigger and riskier change than this
  defect calls for, and Vue's default behavior for genuinely-undeclared
  attributes (fallthrough to the single root element) is not itself wrong
  anywhere else in these three components. The explicit `ariaLabel?:
  string` prop was declared **camelCase**, matching every other prop and
  the existing `AtlTable` precedent — an early version of this fix declared
  it as `'aria-label'?: string` (matching the DOM attribute name) and bound
  `props['aria-label']` in the template, and it silently did nothing: Vue's
  runtime `camelize()`s both the declared option key and an incoming raw
  prop key before matching them, so the resolved reactive value lives at
  `props.ariaLabel` regardless of how the TS interface spelled the key, and
  `props['aria-label']` is simply never populated. Caught by the new tests
  before being shipped (see Consequences) — proof that "test the real
  behavior, not a string" from the P1 fix applies here too.

## Consequences

- `AtlCaptionSpec` exists once; `AtlInputSpec`, `AtlTextareaSpec`, and
  `AtlSelectSpec` extend it; `AtlCheckboxSpec`, `AtlToggleSpec`,
  `AtlRadioGroupSpec`, and `AtlComboboxSpec` do not. `label` compiles and
  renders identically in Angular, React, and Vue for all three captioned
  components. The `/tutorial` sample compiles for an Angular cohort.
- `tools/parity/a11y/atl-input.{angular,react,vue}.json` and
  `atl-textarea.{angular,react,vue}.json` each gained a `labelled` scenario
  proving the fix end-to-end: all three normalize to the identical
  accessibility-tree node `{ "role": "textbox", "name": "<label text>" }`,
  with no `states` key. The pre-existing scenarios in both files are
  byte-for-byte unchanged, since none of them passes `label`. `AtlSelect`'s
  a11y snapshot is exempt from cross-framework comparison by design
  (`A11Y_PARITY_EXEMPT`, ADR-0007: native `<select>` vs. Angular's
  CDK-overlay listbox produce legitimately different trees), so it gained
  unit-test coverage for `label` instead, including one that asserts the
  trigger button now has a real accessible name — the L1 axe finding.
- **L1 is closed by this fix.** `AtlSelect` now has a working `label` prop
  in Angular (previously absent entirely) and the docs' live Select demo
  (`docs/src/components/ComponentDetail.tsx`) now passes `label="Country"`,
  giving the demo's native `<select>` an accessible name. The docs data
  (`docs/src/data/components.ts`) documents the prop for all three
  components consistently with the spec JSDoc.
- Two controls on the same page with the same `label` text no longer
  collide on one generated id in React, for Input, Textarea, or Select
  (previously a real bug in all three: the second control's `<label for>`
  pointed at the first control's id).
- Vue's Input and Textarea ids are now stable across server and client
  render, closing an SSR-hydration-mismatch risk that existed even though
  this repo does not currently server-render these adapters. Vue's Select
  already had no such risk.
- Angular's Input and Textarea no longer produce a broken label association
  when a caller passes a static `id="…"` attribute — the shape a
  copy-pasted tutorial sample uses. Confirmed by reproducing the failure in
  jsdom before the fix (host and native control both carried the same `id`,
  `input.labels.length === 0`) and confirming the fix (host `id` absent,
  `input.labels.length === 1`), and by regression tests in both components'
  spec files that assert the real for/id association rather than comparing
  attribute strings.
- `aria-label` now reaches the actual native control — not a wrapper — in
  all three frameworks, for Input, Textarea, and Select alike. Pinned by new
  tests in all three frameworks' spec files.
- Three dead, unstyled CSS classes were removed rather than kept: Vue's
  `input-label`, `textarea-label`, and `select-label` on the `<label>`
  elements had no matching rule in any of the three frameworks' stylesheets
  (React and Angular render a bare `<label>`). Dropping the class from Vue
  was the smaller change versus adding it to Angular and React and writing
  a shared CSS rule for it, and it makes all three bare-`<label>` again.
- Out of scope, left as found: `AtlCheckbox`'s Vue adapter
  (`libs/vue/src/lib/checkbox/atl-checkbox.vue`) has the identical
  `` `checkbox-${Math.random()...}` `` id-generation pattern this ADR fixes
  for Input, Textarea, and Select. It is a real instance of the same
  defect, but out of this task's component scope (`AtlCheckbox` is not one
  of the three captioned components) — worth a follow-up task, not folded
  in here as a drive-by fix to a file this task was not asked to touch.
- Also out of scope, and deliberately not attempted here: a build-time
  prop-parity gate that would have caught the original `label` divergence
  automatically. That gate is a separate task with its own agent.
