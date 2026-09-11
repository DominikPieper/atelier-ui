# Spec format review — 2026-09-10

_First dedicated review of `libs/spec` as a **format**: what it can express, what actually
reads it, what it does for a single-framework team, what a scaffolded project receives,
and whether the repo's claims about it hold. Reviewed by Claude (Fable 5.1) with five
Sonnet research agents on the repo, one web scan of comparable contract formats, and a
Codex Gegenprobe that received the artefact and the questions but not this reading._

## The five questions

1. Where does the format have gaps?
2. What is the actual flow for a new component, and where is the same fact written twice?
3. What does a new project outside the monorepo receive, and does the taught loop run there?
4. Does the spec only pay for multi-framework sync, or also for a team on one framework?
5. Do we hold what we promise?

## Verdict

**The spec is a naming key for drift gates, not a component contract.** It holds the one
part of a contract that docgen derives for free — prop names and string-literal unions —
and omits everything a picture cannot carry and an agent needs: behaviour, slots, states,
events beyond `on*Change`, per-part ARIA, tokens per part, defaults, descriptions, Figma
provenance. Those facts exist in the repo, hand-written three to five times each (metadata
prose, `docs/src/data/components.ts`, the Figma master description, story `argTypes`, the
adapters), and none of the copies is derived from another.

Its value is real but confined to the three-framework rig: it is the join column that
lets about ten offline gates compare Figma axes, CSS classes, the docs table, the
adapters and the metadata files. Even there the compiler-enforcement claim is false for
two of three adapters and has been since day one (ADR-0093 found it; ADR-0006, the README
and `plan/big-picture.md` still say the opposite).

For a single-framework customer the format as it stands is duplication. The **idea** — a
written contract settled before code is generated — is the right one and is what the
training actually teaches; but that contract lives today in the prose handoff document
(ADR-0096), un-templated and un-gated, and the scaffold ships neither a place for it nor
a gate that reads it.

## 1. What the spec is (facts)

| Layer              | File                                                      | Shape                                                                                                                                   | Size                                                                                  |
| ------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Type contract      | `libs/spec/src/index.ts`                                  | flat `Atl*Spec` interfaces, string-literal unions, five `on*Change` callbacks, three `aria-label`/`label` props                         | 505 lines, 42 interfaces, 29 components, 21 commits since 2026-03-21, shape unchanged |
| Intent sidecar     | `libs/spec/src/metadata/*.metadata.ts`                    | `purpose`, `whenToUse[]`, `antiPatterns[]`, `relatedComponents[]`, `variantMatrix[]`, `accessibility { role, keyboardBehavior: prose }` | 26 modules + registry                                                                 |
| Token dictionary   | `libs/spec/src/tokens.manifest.ts`                        | per token: `intent`, `constraints[]`, `darkMode?` — keyed by token, no per-component field                                              | 1296 lines                                                                            |
| Behaviour test ids | `libs/spec/src/behaviors.json` → `behaviors.generated.ts` | per component: `{ id, describe }[]` bound via typed `covers()`                                                                          | 30 subjects                                                                           |
| Icon geometry      | `libs/spec/src/icons.ts`                                  | runtime SVG path data                                                                                                                   | 25 icons                                                                              |

Field vocabulary, complete: _name-typed prop, string-literal union, boolean flag, one
`on<X>Change` callback signature, one purpose sentence, when-to-use list, anti-pattern
pairs, related-component list, a variant-combination sample list, one ARIA role string, one
keyboard prose string, a flat list of test-id/description pairs, a token→intent dictionary._
Nothing else.

## 2. What the spec actually does (consumption map)

Thirty readers were found; the ones that matter, grouped by what they do with the spec:

| Role                                              | Readers                                                                                                                                                                                                                                                                                                                                                                                                   | What they take                                            |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Join key for gates** (spec ↔ something else)    | `check:variants` (unions ↔ CSS classes), `check:props` (interfaces ↔ adapter prop surfaces), `check:docs` (interfaces ↔ docs table, one-way), `check:figma` (selectors + unions + `variantMatrix` ↔ Figma snapshot), `check:defaults` (axis names → adapters ↔ docs), `check:exports`, `check:metadata`, `check:icon-duplication`, `check:dead-selectors` (the only reader that runs a real type checker) | names, union literals, interface list                     |
| **Projection source** (spec → generated artefact) | `sync-spec.mjs` (byte copy into three `spec.ts`), `gen-behaviors.mjs` (`behaviors.json` → typed ids), `gen-llms-txt.mjs` (**metadata + token manifest only** — the props come from `docs/src/data/components.ts`)                                                                                                                                                                                         | copies; metadata prose; token intents                     |
| **Compile-time consumer**                         | 42 adapter files import from the local `spec.ts` copy — React 28, Angular 8, Vue 6 — plus 82 story files import `metadata.purpose` for the Storybook description, plus `covers()` in each `testing/behavior.ts`                                                                                                                                                                                           | React: whole interfaces; Angular/Vue: a few unions        |
| **Module lookup**                                 | `component-map.js`, `parity-inputs.js` → `check:parity`, `check:design-status`, `parity:record`, `check:cookbook`                                                                                                                                                                                                                                                                                         | `COMPONENT_METADATA_REGISTRY` as a selector→directory map |
| **Existence check**                               | `preflight.mjs` (`isDir('libs/spec')` = "this is the clone")                                                                                                                                                                                                                                                                                                                                              | nothing of the content                                    |

Twenty-five of the ~40 `check:*` gates never touch `libs/spec`. **27 of the spec's exported
names are referenced by zero adapter files** — among them `AtlDialogSize`, `AtlCardVariant`,
`AtlTableVariant`, `AtlTooltipPosition`, `AtlFormFieldSpec`, `AtlChatSpec`; the adapters
re-declare those unions inline or type the prop as `string`. Spot-checked: `AtlDialogSize`
is typed out as `'sm' | 'md' | 'lg' | 'xl' | 'full'` verbatim in `atl-dialog.ts:90`,
`atl-dialog.vue:14` and `atl-dialog.tsx:44` — React included, although its props interface
extends `AtlDialogSpec`. Four copies of one union. For those 27, what keeps the three
adapters on the same literals is `check:variants` reading CSS class names and `check:props`
reading declared prop names — not a type anyone imports.

The one place spec **content** reaches an agent-facing surface by derivation rather than
by gate is `metadata.purpose` → story `parameters.docs.description.component` →
`components.json` description. Everything else an agent sees about a component came from
the adapter (docgen) or from the docs table (`llms-full.txt`).

Two things follow from the map:

- **The compiler binds only React.** Angular: 1 of 29 components imports a spec
  interface, and only as an indexed-access pluck (`AtlBreadcrumbsSpec['separator']`,
  `libs/angular/src/lib/breadcrumbs/atl-breadcrumbs.ts:56`); 6 import unions; 22 import
  nothing. Vue: 0 of 29 import an interface; 5 import unions; 24 import nothing — eight
  `.vue` files re-declare the variant union inline
  (`libs/vue/src/lib/button/atl-button.vue:8`). React: 26 of 29 `extends`/intersect the
  spec interface. `check:props` (ADR-0093) is the compensating gate; it runs exit 0 with
  **56 live exemptions in 14 groups**.
- **Neither agent-facing surface is derived from the spec.** The hosted Storybook MCP
  prop tables come from each adapter's source via docgen (`angular-component-meta`,
  `vue-component-meta`, `react-docgen`; `libs/*/.storybook/main.ts`,
  `tools/scripts/check-manifests.js`). `llms-full.txt` is generated from the hand-written
  `docs/src/data/components.ts` plus the metadata files (`tools/scripts/gen-llms-txt.mjs:30-36`).
  The spec is upstream of both only by **gate** (`check:docs` one-directional spec→docs;
  `check:props` spec→adapters), never by derivation. So for Angular and Vue the prop table
  an agent reads reflects whatever the adapter author wrote, exemptions included.

## 3. Findings

Severity: **blocker** = a claim readers act on is false, or a taught path cannot run;
**major** = a structural gap with a live example; **minor** = hygiene.

### Promise vs. reality

**F1 · blocker · "the compiler enforces parity across all three frameworks" is false and
uncorrected.** Stated in `README.md:127`, `plan/big-picture.md:464-466` (prompt context
injected into agents per ADR-0116), `tasks/claude-design-prompt.md:14`, ADR-0006
Decision. ADR-0093 (2026-09-05) established the opposite for Angular and Vue, but
ADR-0006 carries no dated "Corrected" paragraph and ADR-0093 does not name it — the
`check:adr-refs` rule fires only on an explicit supersede claim, so the contradiction sat
outside its reach. Same class: ADR-0013 still states "Angular/Vue fall back to reading the
spec" with no correction after ADR-0097.

**F2 · major · "spec is the source of truth" is true only for names.** A prop's default
value is hand-written in **seven** places and not in the spec: the three adapters
(`libs/angular/src/lib/button/atl-button.ts:43`, `libs/react/src/lib/button/atl-button.tsx:27`,
`libs/vue/src/lib/button/atl-button.vue:16`), the three stories' `args`
(`atl-button.stories.ts:33`, `atl-button.stories.tsx:21`, vue `atl-button.stories.ts:27`),
and the docs table (`docs/src/data/components.ts:98`). `check:defaults` compares adapters ↔
docs table and never reads `libs/spec` (its own header, `tools/scripts/check-defaults.js:1-24`).
A prop's description lives in the docs table and in each framework's story `argTypes`; the
spec has JSDoc on 8 of ~120 props.

**F3 · major · `docs/src/data/components.ts` is the de-facto contract.** It is the richest
per-component record in the repo: 230 props with type, default, description and
per-framework overrides, `a11y { role, keyboard: KeyBinding[], notes }` as **data**,
`composition: CompositionPart[]`, `aiUsage { bestPractices, promptSnippet,
commonHallucinations }`, examples ×3. Hand-written, one-directionally gated against the
spec (`check-docs-sync.js:39-40`: "docs listing extra literals is allowed"). The spec's
metadata carries the same keyboard contract as one prose sentence
(`dialog.metadata.ts:39-40`); the Figma master description carries it a third time
(`tools/figma/snapshot.json`, AtlDialog: "Esc closes; first focusable element receives
focus on open"). Three authored copies, zero derivations.

### Format gaps (measured against the uianatomy canon for button, modal, select)

**F4 · major · Events.** The spec models five `on*Change` callbacks and nothing else
(`grep "on[A-Z]" index.ts`). Nine events are implemented consistently in all three
adapters and declared nowhere: `Alert.dismissed`, `Chat.onOpenChange`,
`ChatSuggestion.selected`, `Drawer.onOpenChange`, `MenuItem.onTriggered`,
`Pagination.onPageChange`, `Stepper.onActiveStepChange`, `Th.sort`, `Tr.selectedChange`
(`check:props` GAP group of 13). No payload shape, no dismiss reason.

**F5 · major · Slots / anatomy.** No field. Card, Dialog and Drawer parts are empty
Angular classes (`atl-card.ts:75,93,113`, `atl-dialog.ts:177,190`); Chat message content is
a slot in all three adapters while `AtlChatMessageSpec.content: string` says prop (a spec
bug the gate exempts). The canon's dialog has ten named slots with per-slot a11y hints.

**F6 · major · States, keyboard, focus, per-part ARIA.** Only as one prose string per
component (`accessibility.keyboardBehavior`). No transitions (canon: opening → open →
closing → closed), no focus-restore obligation, no per-part attributes. `AtlDialogSpec`
declares neither `aria-label` nor `aria-labelledby` while all three adapters expose both;
Vue's dialog hardcodes its own `headerId` — invisible to `check:props` because it is
spec-keyed (ADR-0093 Consequences).

**F7 · major · Tokens per component.** `tokens.manifest.ts` is keyed by token; no
`consumedBy`. Which `--ui-*` a component uses is recoverable only from its CSS and from
Figma `boundVariables` in the snapshot. The parity `codeSpec` (`tokens` section) has to be
typed by hand each run.

**F8 · major · Defaults and descriptions.** See F2. A contract that omits defaults cannot
be the thing `check:defaults` checks against, and is not.

**F9 · major · Provenance.** No Figma node id, no snapshot stamp in the spec. Node ids are
declared per story file (`figmaNode('129-20')` three times per component) and in
`tools/figma/snapshot.json`; 91 of 119 story-linked ids are outside what the snapshot
records (`tasks/todo.md`, open item).

**F10 · major · Coverage.** Seven components with declared props and no spec interface:
`AtlCodeBlock`, `AtlAccordionHeader`, `AtlMenuSeparator`, `AtlMenuTrigger`,
`AtlChatInput`, `AtlChatTyping`, `AtlThead`. Toast excluded outright (imperative API,
Angular four flat props vs React/Vue one `data` object). `errors` implemented on seven
form components in all three adapters, declared by no spec (type disagreement blocks it).

**F11 · major · The "framework-agnostic" shape is React-shaped.** `AtlFormFieldSpec.onValueChange`
is a React callback prop; Angular's `model()` and Vue's `update:*` emit are _mapped_ to it
inside `check-prop-surface.js`. `readonly` vs React's `readOnly` is the same class in the
other direction. The contract is React's prop bag plus a translation table in a gate.

### New project and single framework

**F12 · blocker · The scaffold ships no contract infrastructure.** `libs/create-workspace`
preset writes: one Nx app, `tokens.css` (real, 586 lines), `.mcp.json` (nx-mcp + hosted
`storybook-<fw>` + optional figma-console), a generated `CLAUDE.md`, `preflight.mjs`.
No spec, no metadata, no `behaviors.json`, no `check:*` gate, no generator, no Storybook,
no test runner (`unitTestRunner: 'none'` / `skipTests: true`, `preset.ts:52,74,90`). Of
the design-to-code skill's eight Build steps, step 3 (spec) has no home, step 6 (gates)
cannot run, steps 5 and 7 run partially. `design-to-code.astro:178-183` tells scaffold
users to read Atelier's contract through the hosted MCP — a consumer path. No page, skill or
ADR tells a customer how to author their own spec, metadata, behaviours or token manifest.

**F13 · major · "Eine Spec im Stil von libs/spec" has no template.** The workshop case
(ADR-0113) sends the participant's contract to `libs/<fw>/src/lib/<name>/atl-<name>.contract.ts`.
No `*.contract.ts` exists anywhere in the repo as an example; the path presumes the cloned
monorepo layout. The **workshop case** (clone + duplicate Figma file) and the **scaffold
case** (no `libs/` at all) are two non-overlapping situations the skill treats as one
sentence ("stop where a gate does not exist").

**F14 · major · No document states the single-framework value.** 47 claims about the spec
were collected across docs, plan, skills and briefs; zero say what it does for a one-framework
team or how to adopt it. The machinery treats a single-framework addition as an exception
to route around: three gates go red by design (`check:sync`, `check:a11y-parity`,
`check:design-status`), six if the participant puts the spec where the docs page says the
contract lives.

### Added by the Codex Gegenprobe (verified here)

**F15 · major · Conditional requirements and value constraints have no representation.**
Button's "aria-label is required when there is no visible text" is a JSDoc comment on an
optional string (`index.ts:22-29`); React enforces it with a separate discriminated union
(`atl-button.tsx:5`), Angular warns after render (`atl-button.ts:85`). `AtlPaginationSpec`
exposes unconstrained `page`/`pageCount`/`siblingCount`; `AtlProgressSpec` says nothing
about `value` ≤ `max`. The contract cannot state its own invariants.

**F16 · major · The generator never reads the spec.** `tools/generators/atl-component*`
templates start from a hard-coded `variant: 'default'` API; the skill says so
(`SKILL.md:135`). Step 3 (spec) and step 5 (generate) are joined by the agent's reading,
not by tooling. Side finding, same place: the Vue generator writes `atl-<fileName>.vue`
(`tools/generators/atl-component/index.ts:56-60`) while its test template imports
`./<className>.vue` (`atl-component-vue/files/atl-__fileName__.spec.ts__tmpl__:2`) — the
generated test cannot resolve its component on a case-sensitive filesystem.

**F17 · minor · Green gates prove less than their names suggest.** `check:props` is green
by design with 56 warning-only exemptions (ADR-0093 chose that); `check:docs` is one-way
and checks no descriptions, defaults or types beyond literal unions
(`check-docs-sync.js:36-40`); `check:a11y-parity` proves three jsdom trees agree, not that
any of them is right. A green run of all three says "every known mismatch is absent or
exempted", not "the contract is honoured".

### Hygiene

**F18 · minor.** `metadata.relatedComponents` mixes naming conventions (`'AtlToggle'`,
`'AtlMenuSpec'`, `button.metadata.ts:26`); nothing validates the keys.
**F19 · minor.** `variantMatrix` hand-duplicates the union cross-product; the gate checks
only that every member appears once, so it cannot say which combinations are _supported_.
**F20 · minor.** `AtlComboboxOption`, `AtlToastContainerPosition`, `AtlChatMessageSpec`
are exported as spec surface but keyed as non-components; their status as contract is
undefined.

## 4. Answers

**Q1 — gaps.** F4–F11. The format expresses roughly the first column of a contract
(names and enum values) and none of the other nine columns a canonical record carries.

**Q2 — the real flow.** For a new component in the repo, in order: Figma master →
handoff document (prose) → spec block in `index.ts` → metadata module + four registry
edits → `behaviors.json` + regen → `docs/src/data/components.ts` entry (props, defaults,
descriptions, a11y, examples ×3) → adapter → story with `argTypes` and `figmaNode()` →
`sync-spec`, `gen-llms` → `parity:record`. One prop name is typed by hand in six places
(spec, metadata `variantMatrix`, docs table, adapter, story `argTypes`, Figma description
"maps to"); its default in four; its description in three. The spec is first in the gate
chain and the source of nothing that is generated.

**Q3 — new project.** A customer receives tokens, MCP wiring and a `CLAUDE.md`, and can
_read_ Atelier's contract. They cannot author their own in any taught shape, and the loop
they are shown stops at step 2 for them. What the training gives them that transfers is
the handoff document and the parity call — both prose, both un-gated.

**Q4 — multi vs single.** Multi-framework: yes, as the join key; the sync work is done by
the gates, and it works (with 56 recorded exemptions). Single-framework: the TS interface
duplicates the component's own input types, Angular cannot bind to it at all, and docgen
already derives the prop table from the component. What a one-framework team needs from a
contract — behaviour, anatomy, states, a11y map, tokens, provenance, exclusions — is
exactly what the format does not hold as data. **As a type file the spec brings a
single-framework team nothing measurable. As a contract record it would, and that record
does not exist yet; the prose handoff document is its stand-in.**

**Q5 — promises.**

| Claim                                                         | Where                                                          | Status                                                                                                                                        |
| ------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Compiler enforces parity across all three adapters            | README:127, big-picture:464, ADR-0006, claude-design-prompt:14 | **not held** (React only)                                                                                                                     |
| Spec is the source of truth / ground truth                    | AGENTS.md:24, :70, :92; design-to-code.astro:175               | **partial** — source of names; defaults, descriptions, a11y, tokens live elsewhere                                                            |
| Identical prop names and unions everywhere                    | AGENTS.md:25, first-component:207                              | **partial** — 56 exemptions, 9 undeclared events, `readonly`/`readOnly`, 7 unkeyed components                                                 |
| "Spec-aware — Claude knows which props exist"                 | index.astro:128                                                | **held**, but via docgen manifests derived from adapters, not from the spec                                                                   |
| Hosted manifests drift-gated against the spec                 | design-to-code.astro:183, SKILL.md:126                         | **partial** — `check:props` gates adapters; `check:manifests` checks only that docgen ran                                                     |
| In a scaffolded workspace, run the same steps                 | SKILL.md:15-17                                                 | **not held** for steps 3, 6, 7                                                                                                                |
| "Any binding the docs leave ambiguous is settled in the spec" | AGENTS.md:34                                                   | **not held** — the format cannot encode slots, imperative APIs, events beyond `on*Change`, or two-way vs. one-way binding; the gate maps them |
| Mirrored byte-identically into each lib                       | ADR-0006                                                       | **held** (`sync-spec.mjs --check`)                                                                                                            |
| Angular/Vue read the spec as fallback                         | ADR-0013                                                       | **stale**, uncorrected after ADR-0097                                                                                                         |

Codex's sharper framing of Q5, adopted here: **there is no single de-facto source; the
authority depends on the fact.** Visual axes and token bindings → the Figma snapshot.
The real Angular API, binding form, default and DOM → the Angular source (docgen derives
from it). Public prop prose, defaults and examples → `docs/src/data/components.ts`.
Purpose and usage guidance → metadata. Behavioural obligations → `behaviors.json`, the
tests, the handoff document. `index.ts` is an intended vocabulary and a comparison
baseline — neither generative nor complete enough to be the authority for any of those.

## 5. What comparable formats carry (web scan, for calibration)

Custom Elements Manifest (attributes, slots, events, CSS parts, CSS properties), Zag.js
(state machine + `createAnatomy` parts, one behaviour source for five adapters), Figma
Code Connect (Figma prop → code prop mapping), DTCG tokens (schema-validated), Storybook
`components.json` (derived, props only), Panda/Chakra slot recipes (tokens per part), and
**uianatomy** — this owner's own project — one Zod-validated YAML per component with
anatomy, axes, states/transitions, events with payloads, a11y acceptance (keyboard walk,
SR announcements, axe rules), tokens per slot, `propertyMap` Figma → code with defaults,
motion, i18n, and `nonNegotiable` contracts. The four workshop briefs are already
transcriptions of uianatomy records into prose. Every one of these formats names
sub-parts, states as data, and a11y as a sourced contract; a props-only TS interface names
none of them.

## 6. Options

Context: two "specs" coexist — the thin typed one (gate key) and the rich prose one (the
handoff document, "a checklist, not a schema" by ADR-0096) — with the docs data file as an
unacknowledged third and richest copy.

- **A · Honesty pass, keep the shape.** Correct ADR-0006 and ADR-0013 with dated
  paragraphs; fix README:127 and big-picture:464; write one paragraph on `/design-to-code`
  stating what the spec is for (multi-framework join key, repo-internal) and what a
  single-framework team uses instead (handoff document + docgen manifest + parity call);
  ship a `*.contract.ts` example and a handoff template in the scaffold. Cheap. Leaves
  customers without a contract format and the repo with five hand-written copies.
- **B · One authored contract record, everything else projected.** Per component, one
  record (TS object or YAML; a uianatomy-shaped subset: anatomy, axes with defaults and
  descriptions, states, events with payloads, a11y map, tokens per part, behaviours,
  Figma node + snapshot stamp, explicit exclusions, free-text behaviour and decisions).
  `index.ts` unions, metadata, `behaviors.json`, the docs table's props and a11y, story
  `argTypes` and the parity `codeSpec` become `--check`ed projections — ADR-0009's own
  idiom applied to the contract itself. The scaffold ships the record schema and one gate
  (record ↔ docgen manifest ↔ Figma snapshot), so a single-framework customer gets the
  same loop with one framework. Costly: touches about eight gates and reverses part of
  ADR-0096 (a schema, but with _required prose fields_ for behaviour and exclusions, which
  keeps the "author decides" argument intact). Needs its own ADR and a dated correction on
  ADR-0096.
- **C · Docgen-first for single framework.** Drop the separate type file for customers;
  the component's own types + JSDoc + a metadata sidecar are the contract; gates read the
  Storybook manifest. Cheapest for customers; this repo would keep the TS spec internally
  as the multi-framework key. C is B's single-framework projection, not an alternative to
  it — it still leaves behaviour, anatomy and provenance in prose.

**Recommendation:** A now, regardless. B as the direction for the format, staged behind
the training's next cohort; decide it in an ADR that names ADR-0006, ADR-0010 and
ADR-0096 as revised. Rejecting B means accepting that the training teaches a contract step
whose artefact the customer cannot take home.

## 7. Codex Gegenprobe

Codex (GPT-5.x via the Codex MCP, read-only sandbox) received the file list, the
environment facts and the six questions — not this document or its reading — and returned
ten findings with file:line evidence. Convergence is high, which is expected where both
sides count the same source: it independently arrived at "not a contract format, a
prop-name vocabulary", "spec is the source of nothing generated", the React-shaped
callback problem, the scaffold gap, and the not-held status of ADR-0006's compiler claim.

What it added that this review had not:

- The **seven** hand-written copies of Button's default (the three story `args` files on
  top of the four counted here) — verified, folded into F2.
- **Conditional requirements and value constraints** as a distinct gap class — verified,
  now F15.
- The **Vue generator filename bug** — verified, now F16. Unrelated to the spec format;
  reported because a maintainer should know.
- The **"authority depends on the fact"** framing for Q5 — adopted above.
- `AGENTS.md:34` ("settle any ambiguous binding in the spec") as a not-held promise —
  added to the table.
- That `check:props` ignores Vue emits and slots in the `EXTRA` direction entirely
  (`check-prop-surface.js:31`), so a Vue-only surface can never be flagged.

Where it was weaker: it did not run the adapter import census, so it stated ADR-0093's
"6 of 31 `.vue` files" rather than the per-component counts; and it did not read the
uianatomy canon, so its gap list is derived from the repo's own admissions rather than
from an external yardstick. Nothing it reported contradicted a finding here.

## 8. Verified vs. assumed

**Verified this session:** every file:line above was read or grepped; `check-prop-surface.js`
exit 0 and its 14 exemption groups; adapter import counts by script over 29 directories
per framework; 27 zero-reference exports spot-checked (five by hand, all 0); scaffold
contents from `preset.ts` and its `files/`; uianatomy canon read through its MCP for
button, modal, select; `gh repo view` confirms uianatomy's owner; ADR-0006/0013 have no
correction paragraph; README:127 and big-picture:464 read verbatim; Codex's two new
factual claims (seven default copies, Vue generator filename) re-read in source.

**Assumed / single-reader:** the 47-claim inventory (quotes and line numbers from one
agent, spot-checked, not all re-read); the web-scan facts about external formats (URLs
cited in the agent output, not fetched by me); that the Angular "1 of 29" is not undercut
by a helper file outside `src/lib/<component>/`.

**Not done:** no end-to-end run of the workshop path; no measurement of how often the
five copies actually disagree in the field beyond what `check:props` and `check:docs`
already report; Option B not costed beyond "about eight gates".

**Weakest point of this review:** it counts copies and gaps; it does not show a customer
failing because of them. The strongest counter-argument is that React's 26/29 binding
and the gate chain have kept three adapters aligned for six months with no shipped
divergence a user has reported — the spec works _for this repo_. The review's claim is
narrower: it does not work as the thing the training tells customers to take home.
