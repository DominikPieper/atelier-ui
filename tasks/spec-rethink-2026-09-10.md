# The spec layer, rethought from the tools up — 2026-09-10

_Third document of the day. The review (`tasks/spec-format-review-2026-09-10.md`) measured
the current spec; the plan (`tasks/spec-workflow-plan-2026-09-10.md`) proposed a
contract-document workflow on top of it. This one does what the owner asked next: ignore
the current spec layer entirely, inventory what figma-console-mcp 1.40 and Storybook 10.6
can extract and verify, write down what is machine-testable without massive effort, and
from that derive the thinnest spec that still buys correctness. Where it contradicts the
morning's plan, it says so._

## 0. Two facts that reframe the question (verified from the tool schemas)

**The `figma_ds_*` pipeline runs code → Figma, not Figma → code.** `figma_ds_analyze` scans
an existing app codebase for components and styling; `figma_ds_extract_component` returns
a component's source, prop contract and observed call-site variants for *porting into a
design-system package*; `figma_ds_scaffold` writes that package; `figma_ds_setup_storybook`
wires a fresh Storybook to it; `figma_ds_verify` runs fidelity evals on the extracted
package (DTCG tokens parse, `var()`s resolve, every component has a stories file). It is
the extraction of a design system *out of* production code. It does not generate a spec
from a Figma master. Ruled out as a spec source; noted so nobody re-investigates.

**`figma_check_design_parity`'s `codeSpec` is already a machine-readable component
contract.** Seven sections: `componentAPI` (props with `name`, `type`, `values`,
`defaultValue`, `description`, `required`; `events`; `slots`), `accessibility` (`role`,
`semanticElement`, `ariaLabel`, `keyboardInteractions`, `focusVisible`,
`supportsDisabled`, `supportsError`, `contrastRatio`, `renderedSize`), `spacing`
(paddings, gap, width/height, min/max, `layoutDirection`), `typography`, `visual` (fills,
strokes, radius, effects, opacity), `tokens` (`usedTokens`, `hardcodedValues`,
`tokenPrefix`), `metadata`. Today the repo assembles it by hand per run, which is why a
thin `codeSpec` passes. Every one of those sections has a mechanical source in this
environment — the docgen manifest, a rendered story's computed styles, an axe scan of the
rendered HTML, a CSS token scan. The question "what is the thinnest spec" becomes "which
`codeSpec` fields can no artefact produce".

## 1. What a machine can test without massive effort

The unit of testing is **one rendered story**: a story fixes the props (`args`), links a
Figma node (`parameters.design` via `figmaNode()` — in 85 of 91 story files here, though
not yet on every named story), renders in a real browser (addon-vitest browser mode,
already configured), and can carry a `play` function. The Figma side is already
snapshotted at the same grain: `tools/figma/snapshot.json` carries root paint (fill,
stroke, radius, padding, gap — each with its bound variable — width, height, font size,
leading) **per variant combination including interaction states** (AtlButton: 24 entries,
`state=hover` among them), for all 43 masters. Almost
every property below is measurable from that unit plus two derived artefacts — the docgen
manifest and the Figma snapshot. "Effort" is what a human writes per component beyond the
component and its stories; "instrument" is the cheapest one available in this environment.

| # | Property | Instrument | Needs | Per-component effort | Here today |
|---|---|---|---|---|---|
| 1 | Prop names, types, defaults, descriptions | docgen manifest | Storybook build (or standalone docgen — spike) | none (derived from the source) | yes |
| 2 | Axis names and values equal the master's | manifest enum schema ↔ snapshot `variantAxes` (or `figma_analyze_component_set`) | snapshot refresh (Bridge, once) | none | yes, keyed on `libs/spec` (`check:figma`) |
| 3 | Boolean / Text properties equal the master's | manifest prop kinds ↔ snapshot `properties` | same | none | partly (`check:figma` `[BOOL-*]`) |
| 4 | Every variant has a story | manifest `stories[]` args ↔ enum schema | build | none | no — `variantMatrix` is hand-typed |
| 5 | Variant CSS class is emitted and styled | AST over template + CSS | offline | none | yes (`check:variants`, `check:dead-selectors`) |
| 6 | Default-state paint, spacing, radius, typography match Figma | computed styles of the rendered story ↔ snapshot root paint per variant | browser + snapshot | none | half: `check:geometry` measures height from fixture HTML, not the component; parity is a manual call |
| 7 | Same, per variant | same, per story | same | none (one story per variant already) | no |
| 8 | Interaction states (hover, focus, active, disabled) | a story whose `play` hovers/focuses, or a pseudo-state parameter, then computed styles ↔ snapshot `state=…` paint | browser | one `play` or one parameter per state | no — "a fifth of what Figma paints" |
| 9 | No raw literals; every `var()` resolves; semantic tier only | CSS scans | offline | none | yes (`check:css-tokens`, `check:token-bypass`, `check:token-tiers`) |
| 10 | Root token bindings equal Figma's (fill → `--ui-color-primary`) | CSS source per root selector ↔ snapshot `rootPaint.*Bound` | offline | none | partly (`check:figma-token-names`) |
| 11 | ARIA role, name, states; semantic element | axe on the rendered story (`addon-a11y`, `test: 'error'`) or `figma_scan_code_accessibility` on story HTML | browser (or JSDOM) | none | suite exists, **not in CI**; `'todo'`, Angular unconfigured |
| 12 | Accessibility tree stable across changes | a11y-tree snapshot test | jsdom | none once written | yes (25 components) |
| 13 | Keyboard behaviour | `play` with `userEvent` + `expect` | browser | 5–10 lines per behaviour | 6 story files with assertions; keyboard in 1 of 9 sampled unit specs |
| 14 | Focus management (trap, restore) | `play` + `toHaveFocus` in a browser (jsdom has no tab order) | browser | 5–10 lines | none in the dialog specs, any framework |
| 15 | Events with payload | unit test spies, or `play` with `fn()` | jsdom | small | mostly yes |
| 16 | Slots / content projection | unit test | jsdom | small | yes |
| 17 | Behaviour the brief names (timers, dismissal, live region) | `play` or unit test — someone must name it first | browser/jsdom | medium; the naming is the work | `behaviors.json` ids + `covers()`, tests per framework |
| 18 | Dark mode renders through tokens | dark-mode story (global) → computed styles ↔ snapshot Dark values; axe contrast in dark | browser | one decorator | docs pages only |
| 19 | Contrast | token-pair math offline; axe `color-contrast` in browser | offline / browser | none | yes (`check:contrast`) |
| 20 | Control height ladder | Playwright on the rendered story | browser | none | fixture-based (`check:geometry`) |
| 21 | Pixel-level visual regression | Playwright screenshot diff per story | browser, baselines | none, but flaky | no; Chromatic is paid |
| 22 | Motion runs with the stated duration | — | — | — | token-name check only; not cheap |
| 23 | RTL / i18n | `dir=rtl` story + screenshot smoke | browser | one decorator | none |
| 24 | Composition rules ("one modal at a time") | — | — | — | not machine-checkable cheaply |
| 25 | Intent — purpose, when to use, anti-patterns are *true* | — | — | — | presence only (`check:metadata`) |
| 26 | Exclusions and decisions are *recorded* | allowlist entry with reason; master description; a decisions note | offline | a sentence each | `FIGMA_CONFORMANCE_EXCEPTIONS`, master descriptions |

Rows 1–12 and 15–16 and 18–20 need **no authored artefact at all** once the instruments run:
everything is derived from the component, its stories, the manifest and the snapshot. Rows
13, 14 and 17 need authored *tests*, which is where the behaviour has to be written down
anyway. Rows 22–26 are where machines stop; 26 is recordable, the rest are judgement.

Two instruments are already installed and idle: the Storybook browser-mode suite
(interaction + axe, 216 React and 242 Vue checks, about 11 s per lib) is "NOT WIRED" in
`.github/workflows/ci.yml:122-135` because it fails under `CI=1` for a reason nobody has
found; and `parameters.a11y.test` is `'todo'` everywhere it is set, so axe currently gates
nothing. Turning those on is the cheapest single increase in machine-verified correctness
available in this repo — it needs no spec of any shape.

## 2. What the two tools can extract and verify

### 2a. Storybook 10.6 (as pinned here: `storybook` and every `@storybook/*` at 10.6.0)

| Capability | Machine-readable yield | On here? | Cost in a one-framework repo |
|---|---|---|---|
| Component manifest (`components.json` + docgen shards) | per component: `name`, `description`, `jsDocTags`, props with type / default / description (Angular `angular-component-meta`, Vue `vue-component-meta`, React `react-docgen`), `apiDescription` markdown (Angular, Vue), story ids with framework-native `snippet`s | yes, all three | low — two feature flags |
| Hosted / local MCP `docs` toolset | the manifest, queryable (`docs-list`, `docs-show`, `docs-show-story`) | yes | low |
| Local MCP `dev` toolset | preview URLs, story-authoring instructions, component → story graph | yes | low |
| Local MCP `test-run` | runs the addon-vitest suite for named stories, with a11y when addon-a11y is present; pass/fail per story (exact JSON shape not located in the shipped bundle — unverified) | yes (ADR-0112 fixed discovery) | medium — needs the Vitest-root comment this repo carries |
| addon-vitest browser mode | every story is a render test in real Chromium (Playwright); `play` assertions are interaction tests | configs exist for all three; Nx target only for React and Vue; **not in `check:all` or CI** | low — config already present |
| `play` functions with `expect`/`userEvent` | keyboard, focus, events, state — asserted in a browser | 68 story files carry `play`; **6** import assertions; the rest are demos | low, incremental per story |
| addon-a11y (axe) | rule violations per story; `parameters.a11y.test: 'error'` fails the run | React and Vue at `'todo'`; Angular has no a11y config; **none at `'error'`** | low — one parameter |
| Change detection / `stories-changed` / `review-create` | new/modified/related stories vs git | off (`features.changeDetection` unset) | low to flip; UI-oriented payload |
| CSF factories (type-checked `args`) | compile-time arg typing | no — all 68 story files are classic CSF3 | high — repo-wide rewrite, stable in 11 |
| `storybook build --test` | stripped build for CI test runs | no | low |
| Visual regression | pixel diff per story | no | external SaaS (Chromatic) or a Playwright screenshot harness — medium |

What Storybook can **verify** (not merely document): a story renders; a `play` assertion
holds in a real browser; axe finds no violation; the prop table reflects the source
(because docgen reads the source, not a hand-written table). What it **cannot**: anything
about Figma — geometry, paint, tokens, axis names; and cross-framework parity, since every
manifest is per framework. It also does not detect its own docgen silently degrading to
`{id, name}` — this repo's `check-manifests.js` exists for that.

Side finding: `AGENTS.md` names a tool `display-review`; the wire name under
`toMcpToolName("review.create")` is `review-create` (`node_modules/@storybook/addon-mcp/dist/preset.js:193`).

### 2b. figma-console-mcp 1.40.0 (as pinned in `.mcp.json`, ADR-0110)

Of about 100 tools, eight matter for verification. Everything else is authoring, slides,
FigJam, or the reverse-direction `ds_*` pipeline (§ 0).

| Tool | Yields | Needs | Verifies or extracts |
|---|---|---|---|
| `figma_get_component_for_development` | depth-4 tree, `boundVariables`, sizing, text behaviour, slots, annotations, 2× image | REST | extract |
| `..._for_development_deep` | unlimited depth, token **names** resolved, `mainComponent` refs, `reactions` | Bridge | extract |
| `figma_analyze_component_set` | variant axes and values; **Figma state → CSS pseudo-class map** (hover→`:hover`, disabled→`:disabled`, error→`[aria-invalid]`); cross-variant visual diff (only changed properties); property definitions **mapped to code props** (BOOLEAN→boolean, TEXT→string, INSTANCE_SWAP→slot); SLOT properties | Bridge | extract — this is the design side's prop contract, produced by the tool |
| `figma_check_design_parity` | score, `discrepancies[]` (category, severity, designValue, codeValue, suggestion), `actionItems[]` for both sides | Bridge for the live compare | **verifies** — for exactly the `codeSpec` sections declared |
| `figma_scan_code_accessibility` | axe-core structural findings on HTML; `mapToCodeSpec: true` emits the `accessibility` section of a `codeSpec` | none (JSDOM, standalone) | **verifies** code a11y; feeds parity |
| `figma_audit_component_accessibility` | 0–100 design-side scorecard (state coverage, focus indicator, colour difference, target size, annotations) | Bridge | scores the master, not the code |
| `figma_lint_design` | WCAG + design-system-hygiene findings on the master | Bridge | lints the master |
| `figma_export_tokens` / `figma_get_design_system_kit` | tokens in DTCG and nine other formats; per-component `visualSpec` | Bridge-first | extract |

**The ceiling, from the repo's own measurements** (`skills/design-to-code/references/parity-codespec.md`,
ADR-0024, `skills/figma-workspace-architect/references/tool-map.md`):

- A static parity read reaches the **default state only**; on AtlSelect four of five painted
  states sit behind pseudo-classes — "about a fifth of what Figma paints".
- The parity **score is not a property of the component**: three runs on one AtlStepper
  commit returned 70, 52 and 83, depending on the sampled node and the declared fields.
  A thinner `codeSpec` scores higher. That is why the score is not stored.
- **Behaviour, motion, easing are invisible** to every tool; they exist only as Figma
  annotations, which `figma-snapshot.mjs` never reads.
- `check:figma` samples the **default variant** for token and auto-layout rules; a raw
  hex on `variant=danger` passes the offline gate.
- `figma_diff_versions` misses description and annotation edits made while the Bridge was
  down, and never tracks variable *values*.

**What the snapshot already carries offline** (`tools/figma/snapshot.json`, per master):
name and selector, variant axes and values, Boolean/Text/Instance-swap property names,
description, `layoutMode`, per-variant root paint (fill, stroke, radius, padding, gap,
each with its bound variable or `null`), per-variant width and height, text styles, and a
566-node text census. Not carried: annotations, reactions, the pseudo-class map, anything
below the root frame's paint.

### 2c. Where the two overlap, and the gap between them

Overlap: **the prop contract.** `figma_analyze_component_set` produces it from the master
(axes, values, Booleans, Texts, slots — already mapped to code prop kinds); the Storybook
manifest produces it from the code (props, types, defaults, descriptions). Two derived
artefacts describing the same thing from opposite ends. Nothing hand-written is needed to
compare them — only a comparison.

Also overlapping, at lower fidelity: **a11y** (`figma_audit_component_accessibility` on
the master; axe via addon-a11y or `figma_scan_code_accessibility` on the rendered story)
and **paint/geometry/typography** (the snapshot's root paint; a rendered story's computed
styles, which `check:geometry` already reads).

The gap neither tool covers, in descending order of how much a picture cannot carry:

1. **Behaviour** — timers, keyboard beyond the pseudo-class map, focus return, live-region
   politeness, dismissal rules. Figma: annotations at best. Storybook: `play` functions —
   *executable*, but only if someone writes them.
2. **States behind pseudo-classes** — the pseudo-class map says *which* states exist; no
   tool renders them. Storybook can (a story with `parameters.pseudo` or a `play` that
   hovers/focuses); the parity tool then needs that state's computed styles.
3. **Exclusions and decisions** — what is deliberately out, why the code and the master
   differ where they do. No tool; today the handoff document and `FIGMA_CONFORMANCE_EXCEPTIONS`.
4. **Intent** — purpose, when to use, anti-patterns. Figma: the description field.
   Storybook: the component's JSDoc → manifest `description` and `jsDocTags`.
5. **Tokens per part below the root** — the snapshot reads root paint only; a rendered
   story's computed styles per part could, with a selector map nobody has written.

## 3. The thinnest spec that still buys correctness

Start from § 1: which rows need a human to write something that is *not* the component, a
story, or a test? Only row 26 (exclusions and decisions) and the part of row 17 that is
the *naming* of behaviour before it is tested. Everything else is derivable. So the spec's
irreducible core is: **stories as claims, tests as behaviour, a few recorded decisions.**

### 3a. Candidate shapes, ranked

**S · Stories are the spec.** Authored per component: the component with typed inputs and
JSDoc (purpose in the class comment; `whenToUse` / `avoid` as JSDoc tags, which the
manifest carries as `jsDocTags`); one story per variant and per state, each with `args`
and a `parameters.design` Figma node link (`args` are universal here; the link is on most
story files and would become required per story) and a `play` where behaviour exists;
`parameters.a11y.test: 'error'`. Nothing else. Derived: the manifest
(props, defaults, descriptions, story list), the rendered story (paint, spacing,
typography, a11y), the test run (behaviour). Compared against: the Figma snapshot
(axes, properties, per-variant root paint, description). One check joins them:
`manifest ↔ snapshot` for shape, `story args ↔ enum schema` for coverage, `rendered ↔
snapshot` for paint, axe for a11y, the suite for behaviour, and it emits a complete
`codeSpec` per story for the parity call. **The one authored thing that is not a
component, story or test** is a micro-contract block in the story meta's `parameters`,
next to the design link that is already there: the master's node id, intentional
Figma ↔ code mismatches with a reason (an axis drawn for documentation only, a code-only
prop, a state not modelled), and — only where the root frame is not the comparable layer —
which part the parity probe should measure. Nothing else may go in it: no props, no
defaults, no variant matrix, no prose description; the schema forbids them so the block
cannot regrow into today's metadata layer. Design-side decisions also stay in the master's
description ("not modelled: …", which `check:figma` reads); the block is where the code
side records that it agrees. The handoff document stays the *thinking* step of Day 2 and
is disposable: its behaviour lines become the `play` titles, its exclusions become the
block's entries. **Tradeoff:** behaviour is only as written as the tests are; no prose home
for "why" beyond a reason string; per-part tokens below the root stay unchecked; in this
monorepo the block is repeated in three story files, one per adapter, unless hoisted.

Codex reached the same shape independently and named the risk of the zero-block version
precisely: three adapters and their manifests can agree with each other and all be wrong
in the same way — the block is where a human says which side is canonical when Figma and
the code disagree on purpose.

**T · Contract document + derived rest** (this morning's plan). Adds one authored file per
component with fixed headings and `[b:id]` behaviour lines, gated against `covers()`.
**Gains** a durable prose home for behaviour, exclusions and provenance before code exists.
**Costs** one more artefact to keep honest, a markdown parser in the check, and the
ADR-0096 discussion. Worth it only if S's "decisions in description + allowlist" proves
too thin in a cohort.

**V · Figma is the spec.** S without `play`: code plus stories, decisions in the master's
description, snapshot as the contract. **Fails** row 17 outright — behaviour has no home
and no check. Rejected as a whole; it is S's design half.

**U · Author the `codeSpec` JSON.** Write the parity tool's input by hand as the contract.
**Rejected:** it duplicates what the manifest and the rendered story produce, and it is
exactly the thin-spec-passes failure ADR-0024 recorded.

### 3b. What happens to today's five files under S

| File | Under S, one framework | Under S, this monorepo |
|---|---|---|
| `index.ts` (props + unions) | **unnecessary** — the manifest is the derived contract; Angular could never bind to it anyway | **replaceable**: cross-framework parity becomes `diff(manifest_angular, manifest_react, manifest_vue)` on names, enum members and defaults, with the `on<X>Change` ↔ `output()` / `update:*` mapping `check:props` already has. The three manifests *are* the three specs. Retire `index.ts` when that diff is green on the whole roster; not before |
| `metadata/*.ts` | **folds into JSDoc** (`purpose` → class comment → manifest `description`; `whenToUse` / `antiPatterns` → tags → `jsDocTags`); `variantMatrix` → the story list; `accessibility.role` / `keyboardBehavior` → axe + `play` | same; `gen-llms-txt` reads the manifest instead of the metadata files and `docs/src/data/components.ts` |
| `behaviors.json` + `covers()` | **folds into tests**: the `play` / `it` title is the behaviour id; a story or test that exists is the claim | keep `covers()` only if you want the *same* behaviour ids asserted in three adapters — that is cross-framework work, and the manifest-diff idea has no analogue for it; probably the one file that survives, renamed |
| `tokens.manifest.ts` | **moves to the token file**: DTCG `$description` on each token (`figma_export_tokens` emits DTCG; the CSS is a projection) | same |
| `icons.ts` | not a spec — runtime geometry; stays as code | same |
| `docs/src/data/components.ts` (the unacknowledged sixth) | props, defaults, descriptions and story snippets **derived from the manifest**; only `aiUsage` and the prose examples stay authored | same — kills four of the seven default copies |

Facts that still have no machine-readable home under S: composition rules, motion
correctness, tokens per part below the root, and the *reason* behind a decision beyond a
sentence in a description or an allowlist. Those are the same holes T would leave; T only
gives them a nicer paragraph.

### 3c. Why S is thinner than what exists, not merely different

Today a component in this repo is described in: the spec interface, its metadata module,
`behaviors.json`, the docs table, three story files' `argTypes` and `args`, the Figma
description, and the adapter — with the same default typed seven times. Under S it is
described in the component, its stories, and the master; every other view is generated.
Nothing new is authored; two things stop being authored. The overhead moves from *writing
copies* to *keeping one check running*, and that check reads only artefacts the tools
already emit.

### 3d. What this changes in this morning's plan

- **S0 (new, first):** wire the browser-mode suite into CI and find why it fails under
  `CI=1`; set `a11y.test: 'error'` (React, Vue) and configure it for Angular. This is
  row 11 and the instrument for rows 8, 13, 14, 18. No spec decision depends on it, and it
  is the largest cheap gain.
- **S1 (unchanged):** docgen without a Storybook build — still the feasibility gate.
- **S2 (changed):** no contract file. Instead: JSDoc conventions (purpose + two tags), the
  story-per-variant rule, `play` for behaviour, and the handoff document demoted to a task
  artefact whose lines are meant to become story and test titles. ADR-0096 gets a dated
  paragraph saying so rather than a schema.
- **S3 (changed):** the check joins manifest + story list + rendered stories + snapshot
  and emits `codeSpec` per story; no markdown parsing. Same three negative tests.
- **S4, S5 (unchanged in shape):** scaffold and curriculum follow S2/S3.
- **S6 (sharper):** manifest diff across the three frameworks replaces `check:props`,
  `check:defaults` and the shape half of `check:variants`; `index.ts` retires when it is
  green; metadata and the docs table become derived. Each its own ADR, after one cohort.

If S turns out too thin in the cohort — behaviour written as `play` titles proves too
terse for a trainer to review in thirty seconds — T is the fallback, and it is additive:
S's checks keep running under T unchanged.

## 4. Codex Gegenprobe

Codex received the environment facts, the file pointers and the three questions — not the
inventories above or this document. It converged on the same shape: derive API facts from
the manifests, design facts from the snapshot, visual facts from browser measurements,
behaviour from executable tests, and author only "identity, intent, exceptions and
expected behaviour" in a **story-colocated micro-contract** ("Recommended"), with a tiny
sidecar file as the second-ranked shape and a Figma-description-led contract third.

What it added, each verified here:

- **The snapshot bypasses the server pin.** `tools/scripts/figma-snapshot.mjs:101` starts
  `figma-console-mcp@latest`; `.mcp.json:35` pins `1.40.0` (ADR-0110); the committed
  snapshot's `meta.serverVersion` is `null`. The offline gate's facts therefore cannot be
  attributed to the pinned server. One-line fix; belongs in ADR-0110's consequences.
- **`test-run`'s return shape** — component-test counts, a11y status and reports, errors,
  optional coverage — located in `node_modules/@storybook/addon-vitest/dist/preset.js`
  (`runStoryTests`, around line 1308). Closes the "unverified" note in § 2a.
- **Dark mode is a Vitest project concern**: the addon-vitest plugin accepts per-project
  theme globals, so a Dark run is a second project, not a decorator per story.
- **Combobox already has keyboard `userEvent` tests in React** (`atl-combobox.spec.tsx:87,106`)
  — row 13 is not zero, it is uneven.
- **`behaviors.json` survives only as governance**: a ratchet against the same test being
  deleted from all three adapters at once. Not a component fact. Same conclusion as § 3b,
  stated more sharply.
- **`icons.ts` is an asset, not a spec** — keep it, rename the category.

Where it was weaker: it did not count the idle browser-mode suite or the `'todo'` a11y
setting, so it under-weights the cheapest gain (§ 1, last paragraph). Nothing it reported
contradicts a finding here.

## 5. Decision points for the owner

1. **Adopt S (stories + micro-contract block) as the target shape**, with T (contract
   document) as the additive fallback if a cohort shows `play` titles are too terse to
   review? This supersedes § 2 of this morning's plan; S0–S6 as amended in § 3d.
2. **S0 first, regardless of the shape decision**: wire the browser-mode suite into CI
   (find the `CI=1` failure), set `a11y.test: 'error'`, configure a11y for Angular. This is
   the largest verification gain available and needs no spec.
3. **Where the micro-contract block lives in the monorepo**: three story files (one per
   adapter, simplest, triplicated) or one hoisted file the three stories import.
4. **Pin the snapshot generator** to the same version as `.mcp.json` now (one line), and
   record `serverVersion`.
5. **When to retire `index.ts`**: after the three-manifest diff is green on the whole
   roster (S6), or keep it indefinitely as an internal implementation convenience?

## 6. Verified vs. assumed

**Verified this session:** the `figma_ds_*` and `figma_check_design_parity` tool schemas
(loaded and read); the built manifests' docgen shards for Angular and Vue (`AtlButton`:
names, types, defaults, JSDoc descriptions; Angular leaks internal `Signal<…>` properties
under a separate category); `tools/figma/snapshot.json` root paint per variant combination
including `state=hover` for all 43 masters; `figmaNode()` in 85 of 91 story files;
`figma-snapshot.mjs:101` `@latest` vs `.mcp.json:35` `1.40.0` and `serverVersion: null`;
`check:all` at 41 gates; the browser-mode suite's "NOT WIRED" comment in
`.github/workflows/ci.yml:122-135`.

**Assumed / single-reader:** the Storybook and figma-console capability tables (two agents,
URLs cited, spot-checked against local `node_modules` and the skill references, not
re-fetched); that standalone docgen is feasible (S1 exists to test it); that a computed
style ↔ snapshot root-paint comparator with the parity tool's ~2 px tolerance is a small
script (precedent: `check-geometry.mjs`); the claim that S is *thinner* rests on counting
authored artefacts, not on a timed cohort.

**Weakest point:** S makes stories load-bearing. Today 62 of 68 story files with `play`
carry no assertion — the instrument exists, the discipline does not. If the cohort will
not write `play` assertions, S degrades to V, and behaviour is untested again. T's prose
would not fix that either; only the suite running in CI does.
