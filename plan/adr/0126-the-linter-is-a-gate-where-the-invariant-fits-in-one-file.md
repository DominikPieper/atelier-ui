---
status: accepted
date: 2026-09-11
sources:
  - tools/scripts/check-host-attr-guards.js and tools/scripts/check-story-descriptions.js (the two scripts retired here, read 2026-09-11)
  - tools/eslint-rules/{index,utils,host-attr-guard,story-description-source}.js (what replaces them)
  - nx.json (`{workspaceRoot}/tools/eslint-rules/**/*` as a lint input on every lint target — declared long before the directory existed)
  - plan/adr/0091-a-caption-two-adapters-shipped-and-the-contract-missed.md (where the host-attribute fix itself was decided)
  - plan/adr/0092-a-guard-hand-copied-three-times-now-a-gate.md (the gate the first rule replaces)
  - plan/adr/0084-two-environments-one-canonical-per-audience.md (clone vs. scaffold, and why the scaffold's answer differs)
  - plan/adr/0121-the-stories-are-the-spec.md (why the second rule's source property is an option, not a constant)
  - plan/adr/0125-the-gates-stay-scripts-until-the-cases-abstract.md (where these rules would travel if they ever leave this repo)
  - measured 2026-09-11: active ESLint rules per project, six parity mutations, and the Nx application generators' real output against an in-memory Tree
---

# ADR-0126: The linter is a gate, where the invariant fits in one file

## Status

Accepted 2026-09-11, after asking which of the 46 `check:*` gates standard tooling models
better than a bespoke script does.

## Context

The gate suite grew to 48 scripts because every invariant this repo cares about got the same
treatment: a Node script that walks the tree, reads files, and reports. For invariants that
join two different sources of truth — Figma against code, framework against framework, a
generated artifact against a fresh regeneration — that is the only shape available, and
ADR-0125 records why it stays.

Two of them were not that shape:

- **`check-host-attr-guards.js`** (262 lines, the gate ADR-0092 added to enforce ADR-0091's fix) asserts a property of a single
  Angular `@Component` class: an input aliased to `aria-label` needs `'[attr.aria-label]':
'null'` on that class's own host, and likewise for `aria-labelledby` and a literal `id`
  input. Its own header names its main hazard — `atl-dialog.ts` holds four `@Component`s and
  `atl-table.ts` six, so grading per _file_ would let one component's `host` satisfy a
  sibling's requirement — and it hand-rolls file slicing at `@Component(` boundaries to avoid
  that. **88 of its 262 lines, a third of the script, are that scoping work.** A linter
  visiting a `ClassDeclaration` never sees a sibling's decorator in the first place.
- **`check-story-descriptions.js`** (102 lines) asserts that a story's default export carries
  `parameters.docs.description.component` and that its value is derived rather than an inline
  literal. Its header is candid about the method: "Heuristics, not full AST — targeted
  regular expressions."

Meanwhile `nx.json` had declared `{workspaceRoot}/tools/eslint-rules/**/*` as a lint input on
every lint target since the Nx workspace was created, and the directory did not exist.
`@typescript-eslint/utils` — the package one needs to write a rule — was installed and
imported nowhere. The infrastructure had been announced and never built.

Measuring what the linter already does turned up two holes and one false alarm:

- **Vue was not linted at all.** `libs/vue` had a `lint` target running `eslint .`, no own
  flat config, and the root config's `files` globs cover `.ts/.tsx/.js/.jsx/.cts/.mts/.cjs/
.mjs` and `.json` — never `.vue`. `eslint-plugin-vue` was installed and wired nowhere.
  Angular had 27 active rules, React 32, Vue zero.
- **A scaffolded Angular workspace got no ESLint config at all.** The preset's call to
  `@nx/angular`'s application generator passed no `linter` option, and Nx's
  `normalizeLinterOption` falls back to whatever linter it detects in the tree — which, in a
  fresh one-framework workspace generated from an empty tree, is none. Verified by running
  the real generator: no `eslint.config.mjs`, no eslint dependency. React and Vue passed
  `linter: 'eslint'` and were fine.
- **The false alarm:** Angular's template accessibility rules looked absent and were not.
  `nx.configs['flat/angular-template']` extends angular-eslint's `templateAccessibility`
  preset — all 11 of its `:accessibility:` rules, on `.html` files and on inline templates
  alike through the `extract-inline-html` processor. `eslint --print-config` on a `.ts` path
  cannot show this, because it only evaluates blocks whose `files` glob matches `*.ts`
  literally and never simulates the processor's virtual `*.html` sub-file. That is a
  measurement trap, and it is now documented at the spread itself.

## Decision

**An invariant that can be decided from one file is a lint rule. An invariant that joins two
sources of truth is a gate.**

1. **`tools/eslint-rules/` exists**, as a plain flat-config plugin built on
   `ESLintUtils.RuleCreator` — no build step, no new dependency. The lint input `nx.json`
   already declared now points at something, which also means a rule change correctly
   invalidates every project's lint cache.
2. **Two rules replace two scripts**, and the scripts are deleted in the same change:
   `atelier/host-attr-guard` and `atelier/story-description-source`. `check:all` goes from 46
   gates to 44.
3. **Parity is proven by mutation, not by a green run.** Six mutations, each made to a real
   file, each confirmed to fail the old script _and_ the new rule, then reverted — including
   the sibling hazard: remove `AtlDialog`'s guard and add a decoy guard to `AtlDialogHeader`
   in the same file; neither implementation is fooled. A rule that merely passes on a clean
   tree proves nothing, which is the same standard ADR-0124 set the same day.
4. **Exemptions move to where they are read.** `HOST_ATTR_GUARD_EXEMPT` was empty and is
   gone. `STORY_DESCRIPTION_SKIP_DIRS` was _not_ empty — `toast`, `code-block`, `showcase`,
   three components with no metadata file whose stories declare no description at all — and
   survives as an `ignores` glob on the rule's config block, at config level rather than
   baked into the rule. The second rule's source property is a rule _option_ defaulting to
   `purpose`, so ADR-0121's move of that text into class JSDoc is a one-line config change
   rather than a regex rewrite.
5. **The linter's per-framework posture is now declared, not inherited by accident.** Vue
   gets `eslint-plugin-vue`'s `flat/recommended` scoped to `**/*.vue` (its blocks carry no
   `files` restriction and otherwise lint `.ts` spec and story files for SFC conventions),
   the parser wiring `<script setup lang="ts">` needs, `eslint-config-prettier` after it, and
   `vue/no-unused-properties`. Angular gets `no-positive-tabindex`, the one accessibility
   rule outside `templateAccessibility`. React gets nothing, because `flat/react` already
   brings 18 `jsx-a11y` rules — recorded as a deliberate no-op rather than an omission.
6. **The scaffold gets the same posture for its framework**, through the preset: the missing
   `linter: 'eslint'` on the Angular generator call, then the same per-framework additions
   appended to the config Nx's own generator wrote. Appended, not rewritten — the generated
   file is Nx's, and it throws loudly if its shape ever changes rather than silently dropping
   the addition.

Alternatives considered:

- **Leave both as scripts.** Rejected for these two: a third of one script is scoping the AST
  already knows, the other says in its own header that it is regex where it wants a parser,
  and neither invariant needs anything outside the file it is looking at. The move also buys
  editor feedback, which a gate that runs at the end of `check:all` cannot give.
- **Port more gates.** Considered and declined for now, with reasons recorded in
  `tasks/todo.md`: the CSS scanning family (`check:css-tokens`, `check:token-tiers`,
  `check:token-bypass`) maps cleanly onto stylelint, which is not installed and is its own
  decision; `check:geometry` and `check:docs-layout` are bespoke browser harnesses that want
  to be Playwright projects or, better, stories with `play` functions; `check:typeface`,
  `check:variants` and `check:dead-selectors` look like stylelint and are not, because they
  join CSS against the spec's unions or against what a template can emit.
- **Replace `check:vitest-discovery` with a Vitest `projects` glob.** Rejected after reading
  ADR-0112: a glob replaces the "every framework is listed" half, but the other half is that
  `vitest.config.mjs` must contain the literal `storybookTest` / `@storybook/addon-vitest`
  strings, because Storybook's `test-run` discovery sniffs the file's _source text_ on its
  walk up. A glob contains neither. Half the gate, and the only real verification path is a
  live MCP session per framework.
- **Put the rules in the future `@atelier-ui/nx` package** (ADR-0125). Not yet, and this is
  the honest boundary: `tools/eslint-rules/` is monorepo-local, so a scaffolded workspace
  does **not** get these two rules. If they should ever travel, they travel in that package,
  under that record's condition.

## Consequences

- **Two invariants now fail in the editor instead of at the end of a 44-gate chain**, and
  both are cached and `affected`-scoped by Nx. That is the gain; the matching obligation is
  that a rule reading anything outside its own file needs that file declared as a lint input,
  or the cache serves a stale pass. Neither of these two rules reads anything outside its
  file. A future one might, and that is the trap to remember.
- **Vue source is linted for the first time.** The first run produced 231 formatting warnings
  and a handful of real findings; the formatting rules are off, because Prettier owns formatting here and its own record follows this one
  and the real ones are fixed. `vue/no-unused-properties` reports nothing today — a verified
  zero, checked by adding an unused prop and watching the rule catch it, not an assumed one.
- **A workshop attendee on Angular had no linter.** That is a defect in the shipped product,
  not a posture gap, and it was invisible because the monorepo's own Angular library is
  linted by a different config than the one the preset generates. The preset's spec now
  carries a per-framework regression guard for the `linter` option.
- **Two things this does not do.** The rules do not reach a scaffolded workspace. And the
  `--print-config` trap that made the Angular accessibility rules look absent is documented
  in one config file, not in a check — the next person to measure coverage that way will be
  misled unless they read that file first.
- **Verified as of this record:** the active-rule counts per framework; that `.vue` files
  were ignored, by reproducing the "File ignored because no matching configuration was
  supplied" message; that the Angular generator writes no config without the `linter` option,
  by running the real generator against an in-memory Tree; all six parity mutations; and that
  `nx run-many -t lint` and the three framework test suites pass. **Assumed:** that the two
  story-file shapes the second rule resolves — a direct object literal, and `const meta =
{…}; export default meta;` — remain the only shapes in use. All 84 current story files fit;
  a story built through a spread or a factory would be reported as missing a description
  rather than silently skipped, which is the safer of the two failure directions.
