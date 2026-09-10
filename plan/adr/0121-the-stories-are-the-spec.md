---
status: accepted
date: 2026-09-10
sources:
  - tasks/spec-format-review-2026-09-10.md (what the current spec is and is not — 20 findings)
  - tasks/spec-workflow-plan-2026-09-10.md (the contract-document workflow this record replaces in shape, kept as the fallback)
  - tasks/spec-rethink-2026-09-10.md (the tool inventories, the 26-row testability matrix, the ranked shapes)
  - plan/adr/0006-framework-agnostic-spec-source-of-truth.md (the record this one will eventually retire; corrected 2026-09-10, not superseded here)
  - plan/adr/0010-ai-readiness-layer.md (metadata, token manifest, behaviour manifest — the layers that fold)
  - plan/adr/0011-typed-covers-behavior-gate.md (the `covers()` mechanism that survives only as governance)
  - plan/adr/0024-design-parity-persistence-gate.md (why a thin codeSpec passes and why the score is not stored)
  - plan/adr/0093-the-contract-two-adapters-were-never-held-to.md (the compiler binds only React)
  - plan/adr/0096-the-handoff-a-picture-cannot-carry.md (the handoff document; corrected 2026-09-10 in the same commit as this record)
  - plan/adr/0097-the-manifest-the-framework-can-emit-now.md (the docgen manifests this record makes load-bearing)
  - libs/{angular,react,vue}/vitest.storybook.config.ts and .github/workflows/ci.yml:122-135 (the browser-mode suite, configured and not wired)
  - dist/storybook/<fw>/services/core/docgen/components-inputs-atlbutton.json (names, types, defaults, JSDoc per framework)
  - tools/figma/snapshot.json (root paint per variant combination, all 43 masters)
  - the `figma_check_design_parity` codeSpec schema (seven sections; read from the tool definition 2026-09-10)
---

# ADR-0121: The stories are the spec

## Status

Accepted as the **target shape**, decided by the owner on 2026-09-10 after three documents
in one day. Not yet built: `S1` below is the feasibility gate, and shape `T` is the
additive fallback if a cohort shows the shape too thin. **This record supersedes nothing
today.** Each retirement it implies — `index.ts`, the metadata modules, `behaviors.json`,
`tokens.manifest.ts`, the hand-written props in `docs/src/data/components.ts` — lands with
its own record and the matching dated correction on ADR-0006, ADR-0010 or ADR-0011 in
that commit, per the same-commit rule in `AGENTS.md`. ADR-0096 is corrected today because
the handoff document's role changes today.

## Context

The spec-format review measured what `libs/spec` is: a flat prop-type interface plus a
prose sidecar, a test-id list and a token dictionary. It carries names and string-literal
unions and nothing else a contract needs — no defaults, descriptions, events beyond
`on*Change`, slots, states, tokens per part or Figma provenance — and those facts live
elsewhere, hand-written three to seven times each (a Button default: three adapters,
three story `args`, the docs table). The compiler binds only React to it; Angular and
Vue are held by `check:props` with 56 recorded exemptions; 27 of its exports are imported
by no adapter. For a one-framework customer it is a fourth copy of the union with nothing
reading it, and the scaffold ships none of its infrastructure.

The rethink started from the other end — what the tools emit — and found the contract
already exists twice as a *derived* artefact:

- **Storybook 10.6's docgen manifest** carries, per framework and from the component's own
  source, every prop with its type, default and JSDoc description, plus the story list with
  framework-native snippets. `check-manifests.js` already guards its integrity.
- **The Figma snapshot** carries, per master, the variant axes and values, the property
  kinds, the description, and the root paint (fill, stroke, radius, padding, gap — each
  with its bound variable — width, height, font size, leading) for **every variant
  combination including interaction states**: 24 entries for AtlButton, `state=hover`
  among them, for all 43 masters. `figma_analyze_component_set` produces the same prop
  contract live, with the state → pseudo-class map and property kinds already mapped to
  code prop kinds.

Between them sits a third artefact nobody had read as a contract: the `codeSpec` that
`figma_check_design_parity` accepts has seven sections — `componentAPI`, `accessibility`,
`spacing`, `typography`, `visual`, `tokens`, `metadata` — and every one of them has a
mechanical source: the manifest, an axe scan of the rendered story, the rendered story's
computed styles, a CSS token scan. It is assembled by hand today, which is why a thin one
passes (ADR-0024).

The rethink's testability matrix (26 properties) showed that nineteen need **no authored
artefact** once three things are joined: the manifest, the rendered story in a real
browser, and the snapshot. The three that need authoring are behaviour (keyboard, focus,
the brief's timers and dismissal rules), which must be *tests*, and exclusions and
decisions, which must be *recorded*. The instrument for behaviour — the addon-vitest
browser-mode suite: every story rendered in Chromium, `play` assertions, axe — is
configured in all three libraries, runs green locally in about eleven seconds per
library, and is `# NOT WIRED` in CI because it fails under `CI=1` for a reason nobody has
found. `parameters.a11y.test` is `'todo'` where set and unset for Angular, so axe gates
nothing. 62 of 68 story files that carry a `play` carry no assertion.

Codex, given the environment facts and the questions but not the analysis, arrived at the
same shape and named the risk of the zero-authoring version: three adapters and their
manifests can agree with each other and all be wrong in the same way; a human must be able
to say which side is canonical where Figma and the code differ on purpose.

## Decision

**A component's spec is its component file, its stories, and one micro-contract block.
Everything else is derived and checked, not written.**

1. **The component carries the API and the intent.** Typed inputs with defaults in code;
   a class-level JSDoc with the purpose sentence and two tags for what today's
   `whenToUse` / `antiPatterns` carry. The docgen manifest is the machine-readable
   projection; `gen-llms-txt` and the docs site read it, not a hand-written table.
2. **One story per variant and per interaction state.** Each story has `args` (the
   variant coordinates), a `parameters.design` Figma node link (via `figmaNode()`, which 85
   of 91 story files already use — it becomes required per story), a `play` function
   wherever behaviour exists (keyboard, focus, events, timers), and `parameters.a11y.test:
   'error'`. The story list is the variant matrix; the `play` title is the behaviour id;
   the render is the geometry and paint under test.
3. **One micro-contract block per component.** Its only permitted fields: the master's
   node id; intentional Figma ↔ code mismatches, each with a side and a reason (an axis
   drawn for documentation only, a code-only prop, a state not modelled); and, only where
   the root frame is not the comparable layer, which part a parity probe should measure.
   **Forbidden by schema:** props, defaults, unions, variant matrices, prose descriptions,
   token lists — so the block cannot regrow into today's metadata layer. In this monorepo
   the block lives in one file per component under `libs/spec/src/contracts/`, imported
   by the three story metas through the `@atelier-ui/spec/...` alias the stories already
   use for `metadata.purpose` (hoisted, not triplicated — owner decision 2026-09-10). In
   a one-framework repo it lives beside the component. The master's description keeps its
   design-side "not modelled: …" lines, which `check:figma` reads; the block is where the
   code side records that it agrees.
4. **One check joins the artefacts** and replaces, over time, every gate keyed on
   `index.ts`: manifest ↔ snapshot for shape (axis names, values, property kinds, defaults
   where Figma has them); story `args` ↔ manifest enum schema for coverage; rendered
   computed styles ↔ snapshot root paint per variant and state for geometry, paint and
   typography (the parity tool's tolerances); axe for accessibility; the suite for
   behaviour; and it emits a **complete** `codeSpec` per story for the parity call, so a
   clean parity report means something.
5. **Cross-framework parity is a diff of the three manifests** — names, enum members,
   defaults, with the `on<X>Change` ↔ `output()` / `update:*` mapping `check:props`
   already knows. `libs/spec/src/index.ts` retires when that diff is green on the whole
   roster (owner decision 2026-09-10) — not before, and with its own record correcting
   ADR-0006.
6. **Order.** `S0` wire the browser-mode suite into CI, find the `CI=1` failure, set
   `a11y.test: 'error'` for React and Vue and configure it for Angular — no spec decision
   depends on it and it is the largest cheap gain. `S1` the feasibility spike: docgen for
   one component without a Storybook build, in seconds; if it fails, the check falls back
   to `storybook build --test` or the local `docs-show`, and the complexity budget is
   re-read. `S2` the conventions (JSDoc tags, story-per-state rule, the block's schema).
   `S3` the check with three negative tests. `S4` the scaffold ships the check, the block
   template, a test runner and the CLAUDE.md section. `S5` skill and curriculum. `S6` the
   monorepo retirements, each its own ADR.

Alternatives considered:

- **T — a contract document per component** (`<name>.contract.md`, fixed headings,
  `[b:id]` behaviour lines gated against `covers()`; this morning's plan). Adds a prose home
  for behaviour and exclusions before code exists, at the cost of one more artefact, a
  markdown parser in the check, and the ADR-0096 discussion. **Kept as the additive
  fallback:** if a cohort shows `play` titles too terse for a trainer to review in thirty
  seconds, T is layered on top and every check in this record keeps running unchanged.
- **U — author the `codeSpec` JSON by hand.** Rejected: it duplicates what the manifest
  and the rendered story produce, and it is precisely the thin-spec-passes failure
  ADR-0024 recorded.
- **V — Figma is the spec** (S without `play`). Rejected as a whole: behaviour has no home
  and no check. It is S's design half.
- **Keep `index.ts` and add derivation around it** (the review's Option B). Rejected as
  the direction: it keeps the one artefact two of three frameworks cannot bind to and
  that docgen already produces, and it keeps the customer taking home a file their repo
  has no use for.

## Consequences

- **Stories become load-bearing.** A story is a claim: "these `args` render like this Figma
  node, pass axe, and behave as this `play` asserts." That is a discipline change for a
  team that treats stories as demos; today's 62 assertion-free `play` functions are the
  measure of the distance. If the discipline fails, S degrades to V and behaviour is
  untested again — prose would not fix that; only the suite running in CI does, which is
  why `S0` comes first.
- **Nothing new is authored; two things stop being authored.** Under S a component is
  described in its file, its stories and the master. The metadata modules fold into
  JSDoc; `behaviors.json` folds into test titles and survives only if the owner wants a
  ratchet against the same test being deleted from all three adapters at once;
  `tokens.manifest.ts`'s intents move to DTCG `$description` on the token source;
  `icons.ts` is an asset, not a spec, and stays as code; the docs table's props, defaults,
  descriptions and snippets are generated from the manifest, leaving `aiUsage` and the
  prose examples authored. Four of the seven copies of a default disappear with that.
- **Gates change owners.** `check:variants` (shape half), `check:defaults`,
  `check:props`, `check:metadata`, `check:docs`, `check:story-descriptions` and the spec
  half of `check:figma` are superseded by the one check in Decision 4 and the manifest
  diff in Decision 5, as each retirement lands. `check:variants`' CSS half,
  `check:dead-selectors`, the token scans, `check:geometry`, `check:a11y-parity` and
  `check-manifests.js` keep their jobs.
- **The handoff document is demoted, not removed** (ADR-0096, corrected today): the
  thinking step whose lines have machine-checked destinations.
- **Facts that still have no machine-readable home:** composition rules, motion
  correctness, tokens per part below the root, and the *reason* behind a decision beyond
  a reason string in the block. T would give them a paragraph; it would not give them a
  check.
- **Verified vs. assumed, as of this record.** Verified: the manifests' fields per
  framework; the snapshot's per-variant root paint including states; the suite's
  configuration and its `NOT WIRED` status; the `codeSpec` schema; the `play` assertion
  count. Assumed, and what `S1` and `S3` exist to test: that standalone docgen runs in
  seconds; that a computed-style ↔ root-paint comparator at the parity tool's tolerance is
  a small script (precedent: `check-geometry.mjs`); that the block's schema stays small
  under use. The claim that S is *thinner* rests on counting authored artefacts, not yet
  on a timed cohort.

**Verified 2026-09-10 (S1).** The first assumption held: docgen without a Storybook build
runs through the framework workers Storybook itself uses — Angular 3.7 s cold / 83 ms warm,
Vue 3.5 s / 93 ms, React 0.56 s / 40 ms via `react-docgen` directly — with output identical
to the built shards, and story `args` resolve statically through `storybook/internal/csf-tools`
in about 85 ms per file. The fallback branch in Decision 6 (`storybook build --test`, local
`docs-show`) is not needed. Record: `tasks/docgen-spike-2026-09-10.md`.

**Refined 2026-09-10 (S2 and S3, stage 1).** Building the contract layer and the check
against the real data sharpened Decision 3 and 4 in seven places; an independent Codex
review of the schema and eight contracts found five of them. Recorded here so the
Decision text stays what was decided and this paragraph says what the data taught.

1. **The code → Figma direction checks enum props only.** A string-literal-union prop
   with no Figma axis needs a `codeOnly` entry; booleans, strings, numbers, callbacks and
   events never do. Without this domain rule every contract would re-enumerate the prop
   list — the regrowth Decision 3 forbids. `types.ts` states it.
2. **The `state` axis is not ignored wholesale.** Only its interaction values (`default`,
   `hover`, `focus`, `focus-visible`, `active`, `pressed`) are pseudo-classes by
   convention (ADR-0114). Its data values — `filled`, `invalid`, `open`, `selected`,
   `completed`, `error`, `optional`, `filtered`, measured on nine masters — must map
   through `axisMap` (`state=invalid` → `invalid`) or be excused as `figmaOnly`
   `state=<value>`. Known imprecision: `active` is the pressed pseudo-class on AtlButton
   and the selected item on AtlTab, AtlStep, AtlOption; stage 1 skips both.
3. **`axisMap` reaches child components and `null`.** `codeProp` may be dotted
   (`AtlStep.completed` for AtlStepper's `state` axis; `AtlToastContainer.position`),
   several entries may share one `figmaAxis`, and `values` may map to `null`
   (AtlTh `sortDirection`: `none → null`). Without `values` the mapping is identity and
   the value sets must be equal verbatim.
4. **An exemption for something that no longer exists is an error**; one whose name the
   master's description does not mention is a warning (`[UNMIRRORED]`); one whose reason
   says `UNEXPLAINED` is a warning that nags every run — the ADR-0093 shape, kept against
   the review's preference for rejecting sentinels, because visible debt beats a red gate
   nobody can clear.
5. **Coverage reads what a story actually renders**, not only its `args`: literal prop
   assignments in JSX, Angular templates and Vue templates, `.map` over a literal array,
   the object-literal idiom of imperative APIs (AtlToast's `show(msg, { variant })`), and
   a `render` that forwards `args` is a claim of the meta's args, not a demo. The
   manifest default counts as covered when a story omits the prop. Pure demos
   (`AllVariants`, `Playground`) count for nothing.
6. **Child masters are visible, not compared.** AtlTh, AtlStep, AtlOption and thirteen
   more have no story meta of their own; the check lists them as `[NO-STORY-META]` and
   defers their shape and coverage to stage 2, which needs nested-arg evidence.
   Components with no master at all (AtlIcon, whose glyphs live on a page the snapshot
   does not index) are `[NO-MASTER]`, not errors.
7. **A `codeOnly` prop present in one framework only is a cross-framework fact**
   (`[FW-ONLY]` warning; AtlButton `type` in Vue only, AtlRadioGroup `orientation` in
   React only), owned by `check:props`, not a stale exemption.

Stage 1 is offline and takes about four seconds per framework; it emits the parity
tool's `componentAPI`, `metadata` and `tokens.usedTokens` sections per component. One
deviation from Decision 3, deliberate: the contracts are **not yet imported by the story
metas**. The check reads them by selector, and an import with no consumer would be dead
weight in 87 files; the import lands with the Storybook docs block that displays the
block (S5), which is its first consumer. Closing the roster's coverage gaps under rule 5
took 26 new stories (Angular 5, React 10, Vue 11), all rendered and axe-clean. Stage 2
— rendered paint against the snapshot's per-variant root paint, interaction states,
children — is not built. What the review found that this stage does not answer: the
snapshot carries no Figma defaults and no child node ids, so defaults stay
`check:defaults`' job and story design links stay unverified.

**S4 done 2026-09-10 — the scaffold ships the loop.** `create-workspace` now writes, per
scaffolded workspace: `<app>/src/contracts/{types.ts, README.md, button.contract.ts}`
(outside `libs/spec/`, which `preflight.mjs` uses to tell a clone from a scaffold),
`tools/scripts/{check-contracts.mjs, lib/ts-eval.js, figma-snapshot-contracts.mjs}` as
byte-identical copies gated by the generalised `sync-preflight.mjs`, a projection of the
AtlButton master as `tools/figma/snapshot.json` (`check:scaffold-snapshot` keeps it equal
to the real snapshot's entry), a root `contracts.config.json`, and the scripts
`check:contracts`, `check:stories`, `figma:snapshot`. Three facts fixed here:

- **The check is portable**: flags → `contracts.config.json` → monorepo defaults, and the
  docgen packages resolve from the *cwd's* `node_modules`, so a scaffold uses its own
  Storybook. The monorepo run is unchanged (0 errors, 93 warnings).
- **The snapshot generator's roster is the contracts.** `figma-snapshot-contracts.mjs`
  reads every contract's `figmaNodeId` and `--file <key>`, and writes exactly the fields
  the check consumes; the Atelier-specific `figma-snapshot.mjs` (hardcoded masters, token
  census, type census) stays the monorepo's. Verified only in `--dry-run` — there is no
  Desktop Bridge in the environment that built it.
- **addon-vitest ships after all.** ADR-0123 had left it out the same morning; the owner
  reversed that once ADR-0121 was on the table (ADR-0123 carries the dated correction).
  Per app: `vitest.config.ts` — that literal name, so `test-run`'s walk-up finds it
  (ADR-0112) — with the framework's Vite plugin, `.storybook/vitest.setup.ts`,
  `a11y.test: 'error'`, a `storybook-test` target; Chromium is the attendee's
  `npx playwright install chromium`, checked by `preflight.mjs`, never a postinstall.

Proven: React end to end through local verdaccio in 176 s — install, `nx build`,
`build-storybook`, `check:contracts`, Chromium install, `check:stories` green, skills
installed; `nx test create-workspace` 78 passing; the projection gate red on a corrupted
node id, then restored. Not proven: Angular and Vue through a real install (one framework
per e2e run, ADR-0123's precedent); the Bridge path of the generator.

**What the proof does not say, recorded rather than smoothed over:** on the example story
`check:contracts` is green *vacuously*. The example renders `AtlButton` from
`@atelier-ui/<fw>` in `node_modules`, where local docgen cannot follow a bare specifier,
so the check finds no component to compare and reports only `[NO-STORY-META]`. It proves
the wiring, not the example. The check does its real work on components whose source is
in the workspace — the attendee's — and for library components the prop source is the
hosted Storybook manifest (ADR-0097), which a `--manifest` input could feed the check in a
later step. The generated `CLAUDE.md` says so. Two smaller traps for the record: `.ts`
files under the preset's `files/` must carry the `.template` suffix or the package's own
`tsc` compiles them away (found by an `ENOENT` inside the packed tarball, not by a
gate), and `@vitest/browser-playwright` has a bare `playwright` peer this repo's root
never named — the scaffold pins it at `@playwright/test`'s range.

**S5a done 2026-09-10 — the skill and the curriculum teach the loop.** `design-to-code`
Build step 3 is "Contract": in the repo case two artefacts, both required until S6 retires
the legacy gates — the `Atl*Spec` block and metadata module as the cross-framework join
key, and the micro-contract under `libs/spec/src/contracts/`; in the workshop case the
micro-contract alone, beside the component, typed through a new `@atelier-ui/spec/contracts/*`
alias, with the participant's own snapshot written by `figma-snapshot-contracts.mjs` to an
explicit `--out` and the check run with `--fw --contracts --stories --snapshot`. Step 5 is
stories as claims, step 6 adds `storybook-test`, step 7 opens with `check:contracts` and
assembles the parity `codeSpec` from `--emit`. ADR-0113's workshop artefact — a
hand-written `Atl*Spec` interface in `atl-<name>.contract.ts` — is superseded and ADR-0113
says so; the participant's component declares its own input types. The Day-2 curriculum's
gate claim changed with it: three gates red by design for a single-framework addition
(`check:sync`, `check:a11y-parity`, `check:design-status`), `check:contracts` warns
`[NO-MASTER]` in its default run and is red only with the participant's flags on a real
mismatch; the "spec landed in the shared master" scenario is retired because there is no
spec to land, and `schulung-claims.e2e.mjs` asserts the new claim with a `wsdemo` fixture
that never touches `index.ts`. Docs pages, AGENTS.md, the briefs and the skill fixtures
follow; the loop's step 2 is now named Contract everywhere. Not proven here: the e2e's
Part 1 did not execute end to end — its clean-tree precondition met the same day's
uncommitted work — and was reproduced by hand gate by gate; it runs on the next clean
tree. Still open from Decision 3: the Storybook docs block that displays the contract and,
with it, the story-meta import (S5b).

The same day a second model walked the rewritten material as a Day-2 participant and
stopped twenty times, five of them blockers that no gate could see because every
sentence was true on its own: stories written before the component they import existed;
a generator invoked as an executable that does not exist (the real form is
`npx nx g @atelier-ui/generators:atl-component <name> --framework=<fw>`); every
`check:contracts` command line missing the `--emit` the next step consumed; parity taught
as "continue" without the Desktop Bridge it needs; a "full `codeSpec`" acceptance that no
command produces (`--emit` fills `componentAPI`, `metadata` and token names; a11y comes
from the story's rendered HTML through `figma_scan_code_accessibility`; paint and geometry
only where measured). Fixed the same day, with two code defects the walk exposed: the Vue
generator's templates imported `./<ClassName>.vue` for a file written as
`atl-<name>.vue`, and `figma-snapshot-contracts.mjs` stamped `--file`'s key onto whatever
file the Bridge had open — it now refuses a mismatch. `nx test` is the unit half, not the
equivalent of `test-run`; `nx storybook-test <fw>` is. The lesson is in `tasks/lessons.md`
under this date: material that tells a person what to do gets a walk-through review.

**S5b done 2026-09-10 — Decision 3 is now fully executed.** `libs/spec/src/contracts/docs-block.ts`
renders the contract on every component's Docs tab: `ContractBlock` reads
`parameters.contract` through addon-docs' `useOf('meta')` and draws the master's node id
as a Figma link and the `figmaOnly` / `codeOnly` / `axisMap` / `probes` entries with their
reasons, marking `UNEXPLAINED` ones; `contractDocsPage` is Storybook's default autodocs
composition plus that block, set as `parameters.docs.page` in all three previews. It is
plain TypeScript with `createElement` — the Angular and Vue Storybooks have no JSX
transform — and one `@ts-ignore` on the `@storybook/addon-docs/blocks` import, because
`libs/spec`'s classic `moduleResolution` rejects the package's `exports` subpath while
the framework tsconfigs that also reach the file resolve it fine; widening the spec
project's resolution was judged the larger change. 83 story metas (28 Angular, 27 React,
28 Vue — React's and Vue's Toast stories set no `component`) import their contract from
`@atelier-ui/spec/contracts/<name>.contract` and carry it as `parameters.contract`;
`check:contracts` enforces it as `[CONTRACT-IMPORT]`. Proven: the React Storybook built
and served, Playwright read "Contract", `129:20` and `hasIcon` off AtlButton's docs page;
the three browser suites (234 / 226 / 253) and the Angular and Vue Storybook builds pass
with the changed previews.
