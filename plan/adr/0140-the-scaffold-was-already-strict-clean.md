---
status: accepted
date: 2026-09-13
sources:
  - measurements against real workspaces scaffolded from the published
    `create-atelier-ui-workspace` 0.3.0, one per framework (`--framework
    angular|react|vue`), 2026-09-13: `tsconfig.base.json`'s `strict` field,
    presence of `angularCompilerOptions`, a `strict: true` build, ESLint's
    active/warning rule counts (`eslint --print-config` against a real
    generated tree, cwd set to the app directory so the app-level
    `eslint.config.mjs` — not the root one — is the one resolved)
  - `node_modules/@nx/js/dist/src/utils/typescript/create-ts-config.js`
    (`tsConfigBaseOptions`, `strict: false` pinned deliberately for TS 6.0
    parity) — confirms lever 1's target file and why it starts `false`
  - `node_modules/@nx/angular/dist/src/generators/application/lib/normalize-options.js`
    (`strict: true` default) and
    `.../lib/enable-strict-type-checking.js` (what that default actually
    writes into `${appName}/tsconfig.json`) — the real reason lever 2 turned
    out to be a backstop, not a new capability
  - `libs/angular/eslint.config.mjs`, `libs/react/eslint.config.mjs`,
    `libs/vue/eslint.config.mjs` — this repo's own three libraries, read for
    precedent on every lever-3 promotion decision (Angular already promotes
    exactly the same four rules; React and Vue leave `react-hooks/exhaustive-deps`
    and their own stylistic warning tiers untouched the same way)
  - `libs/react/src/lib/button/atl-button.stories.tsx`,
    `libs/vue/src/lib/button/atl-button.stories.ts` (import `Meta`/`StoryObj`
    from `@storybook/react-vite` / `@storybook/vue3-vite`, not the renderer
    package) — the precedent lever 4 needed once `eslint-plugin-storybook`
    flagged the scaffold's own templates
  - isolated probes, 2026-09-13: real (unmocked) `@nx/{angular,react,vue}:application`
    generators run against an in-memory `Tree` and flushed to disk; `npm
    install` against real `@atelier-ui/{angular,react,vue}@0.3.1`; `npm run
    lint`/`npm run build`/`npm run check:contracts`/`npm test` against the
    result, for all three frameworks, both before and after every lever
  - a real CLI e2e run against a freshly scaffolded Angular workspace, 2026-09-13:
    `Cannot find tsconfig.base.json` thrown from lever 1's `updateJson`, at scaffold
    time, before any check ran — caught the ordering bug this ADR's Decision §1 was
    corrected for
  - isolated probes, 2026-09-13 (second round, post-correction): each real
    `@nx/{angular,react,vue}:application` generator run against a tree with
    `tsconfig.base.json` deliberately deleted beforehand, confirming all three
    create it themselves when absent; the corrected `presetGenerator` re-run the
    same way end to end, for all three frameworks
  - libs/create-workspace/src/generators/preset/preset.ts and preset.spec.ts
    (this decision's implementation and its 233 passing tests)
---

# ADR-0140: The scaffold was already strict-clean

## Status

Accepted 2026-09-13.

## Context

The workspace `create-atelier-ui-workspace` scaffolds is not strict by any of the
measures a TypeScript/ESLint setup usually is: `tsconfig.base.json` pins
`compilerOptions.strict: false`, Angular's own `tsconfig.json` never gets
`angularCompilerOptions` written into it by this preset, and each framework's ESLint
config leaves a sizeable tier of rules at `'warn'` rather than `'error'` — 66 of 142
active rules on a React `.tsx` file, 4 of 85 on Angular's `.ts`, roughly 20-30 of the
`vue/*` family on a `.vue` file (exact counts drift with whichever `eslint-plugin-vue`/
`eslint-plugin-react-hooks` version a fresh `npm install` resolves — see the
Consequences section). No type-aware linting exists on any framework (no
`no-floating-promises`, no `no-misused-promises`, no `await-thenable`), and nothing
lints the Storybook story files at all despite this repo's own doctrine that "the
stories are the claims" (ADR-0121).

The owner's decision, made after seeing these numbers: turn all of it on. The reasoning
that made this cheap rather than risky is the measurement that came with the numbers —
a real generated workspace, on all three frameworks, **already builds with zero errors
under `strict: true`**. Nobody has broken code to fix; strictness only ever fires on
what an attendee (or an agent) writes into the workspace next. That is the one fact
that turns "make it stricter" from a migration into a pure addition.

Two things complicated an otherwise mechanical flip, both found only by generating a
real workspace and inspecting it — not by reading the generators' source and reasoning
about what they _should_ do:

1. **Lever 2's premise was half wrong.** `@nx/angular:application`'s own schema
   already defaults `strict: true` (`normalize-options.js`), and that default is what
   already writes `angularCompilerOptions.strictTemplates` /
   `strictInjectionParameters` / `strictInputAccessModifiers` into
   `${appName}/tsconfig.json` today, via `enable-strict-type-checking.js`. This
   preset's Angular branch never passed `strict` at all, so it rode that upstream
   default without saying so. "The Nx generator does not [set these]" is not accurate
   for the pinned `@nx/angular` 23.2.0 — but relying on an unstated default this repo
   does not control is still worth closing, so lever 2 became an explicit
   `strict: true` argument plus a defensive `updateJson` backstop, not a new
   capability.
2. **Type-aware linting (lever 5) does not compose with this preset's existing config
   surgery for free.** Two real failures surfaced only by running the real generated
   config through `eslint --print-config` and a real `nx lint`:
   - `@nx/eslint-plugin`'s own `flat/javascript` config assigns typescript-eslint's
     parser to `.js`/`.jsx`/`.cjs`/`.mjs` files (including `eslint.config.mjs` itself,
     linted like any other file in the project) with **no** `tsconfigRootDir` — its
     `flat/typescript` sibling does set one, for `.ts`/`.tsx`/`.cts`/`.mts`. Harmless
     on its own; once _any_ block anywhere in the merged config turns on
     `projectService`, typescript-eslint's parser service scans the whole run for
     tsconfig roots and refuses to guess a default for a file with none of its own,
     once more than one distinct root exists anywhere in the run. `eslint.config.mjs`
     hit this immediately: `Parsing error: No tsconfigRootDir was set, and multiple
candidate TSConfigRootDirs are present`. Fix: an explicit `tsconfigRootDir` (the
     workspace root, matching nx's own value) for `.js`/`.jsx`/`.cjs`/`.mjs` files too.
   - For Vue's `.vue` files specifically, splitting `parser` (already assigned by
     `@nx/vue:application`'s own generator) and `projectService`/`tsconfigRootDir`/
     `extraFileExtensions` (this preset's own addition) across two separate config
     blocks — even though both match `**/*.vue` and ESLint's flat config otherwise
     merges `languageOptions` across matching blocks — reproduces the identical
     ambiguous-root failure for every `.vue` file. Verified by testing both shapes
     against a real generated tree: splitting fails; combining `parser`,
     `projectService`, `tsconfigRootDir`, and `extraFileExtensions` into one single
     block works. This preset's Vue addition re-specifies `parser` redundantly for
     exactly this reason.
3. **`eslint-plugin-storybook`'s `flat/recommended` flags the scaffold's own example.**
   Its `no-renderer-packages` rule rejects importing `@storybook/react` /
   `@storybook/vue3` directly — but the scaffold's own `atl-button.stories.tsx`/
   `preview.tsx` templates did exactly that, for the `Meta`/`StoryObj`/`Preview` types.
   This repo's own `libs/react` and `libs/vue` stories already import those same types
   from `@storybook/react-vite` / `@storybook/vue3-vite` instead (confirmed: the types
   are re-exported there), so the fix was to bring the scaffold's own templates in line
   with that existing convention, not to carve out an exemption from the new rule.

## Decision

Five levers, all in `libs/create-workspace/src/generators/preset/preset.ts` unless
noted:

1. **`tsconfig.base.json`'s `compilerOptions.strict: true`**, all three frameworks —
   `updateJson` after all three framework branches have run, once exactly one of
   `@nx/{angular,react,vue}:application` has executed.
   **Corrected 2026-09-13**: this originally said the write ran "right after the
   framework is decided, before any app generator runs," on the belief that
   `create-nx-workspace` writes `tsconfig.base.json` itself before invoking this
   preset. That was wrong, and a real CLI e2e run against a freshly scaffolded
   Angular workspace caught it immediately: `create-nx-workspace` writes only
   `package.json`/`nx.json`/`.gitignore` before invoking the preset;
   `tsconfig.base.json` is written for the first time by whichever framework's own
   application generator runs (via `@nx/js`'s `extractTsConfigBase`, confirmed for
   all three frameworks by running each real, unmocked generator against a tree with
   the file deliberately absent beforehand). Placing the write before any framework
   branch reproduced the exact failure this decision was supposed to prevent:
   `updateJson` throwing `Cannot find tsconfig.base.json` at scaffold time, before a
   single check could run — the scaffold never gets far enough to be
   half-strict-configured, it fails outright. Fixed by moving the write to run after
   the three framework branches, where the guarantee actually holds; the two
   in-memory-tree testing setups that had exercised this code (`preset.spec.ts`'s own
   suite, and my own probes for this ADR) both used
   `createTreeWithEmptyWorkspace()`, which pre-seeds a stub `tsconfig.base.json`
   regardless of generator order — the exact reason neither one had caught the
   ordering bug before a real e2e run did. `preset.spec.ts`'s `beforeEach` now
   deletes that pre-seeded stub and its mocked application generators write the same
   shape the real ones do, so the suite exercises the real ordering directly; a
   dedicated regression test pins the exact scenario (`tsconfig.base.json` absent
   before `presetGenerator` runs, framework generator supplies it, the preset does
   not throw).
2. **Angular gets `strict: true`** passed explicitly to `@nx/angular:application`
   (rather than silently inheriting its own default), plus a defensive `updateJson` on
   `${appName}/tsconfig.json` that forces `strictTemplates` /
   `strictInjectionParameters` / `strictInputAccessModifiers` to `true` regardless of
   what the application generator did or didn't already write.
3. **Promoted rule severities, one curated set per framework — not a blanket flip.**
   - Angular: all four of its warning-only rules
     (`@angular-eslint/use-lifecycle-interface`, `@typescript-eslint/no-explicit-any`,
     `@typescript-eslint/no-non-null-assertion`, `@typescript-eslint/no-unused-vars`) —
     matching this repo's own `libs/angular/eslint.config.mjs`, which already sets
     exactly these four to `'error'`.
   - React: 26 of ~68 warning-only rules — the correctness/security family named in
     the brief (`eqeqeq`, `no-eval`, `no-implied-eval`, `array-callback-return`) plus
     their kin (`no-new-func`, `no-script-url`, `no-caller`, `no-extend-native`,
     `no-iterator`, `no-label-var`, `no-loop-func`, `no-native-reassign`,
     `no-negated-in-lhs`, `no-new-wrappers`, `no-octal-escape`, `no-self-compare`,
     `no-sequences`, `no-template-curly-in-string`, `no-throw-literal`,
     `react/jsx-no-target-blank`, `react/jsx-no-duplicate-props`,
     `react/jsx-no-comment-textnodes`, `react/no-direct-mutation-state`,
     `react/no-is-mounted`, `react/no-danger-with-children`,
     `react/style-prop-object`). **`react-hooks/exhaustive-deps` deliberately stays a
     warning** — see Consequences. jsx-a11y's own warning-only rules are untouched:
     a11y stays enforced by axe in `check:stories`, a stronger runtime check than these
     static heuristics, and lever 3's brief scoped to correctness/security, not a11y.
   - Vue: four rules (`vue/no-v-html` — this framework's `dangerouslySetInnerHTML`, the
     same security family as `no-eval`; `vue/no-required-prop-with-default`,
     `vue/no-template-shadow` — real logic bugs; `vue/require-explicit-emits` — the
     emitted-event counterpart to the already-promoted `vue/no-unused-properties`). The
     ~30 remaining `vue/*` warnings are layout/whitespace rules `eslintConfigPrettier`
     already neutralises where it applies, or naming/style conventions — this repo's
     own `libs/vue/eslint.config.mjs` makes the identical call, touching none of them.
4. **`eslint-plugin-storybook`'s `flat/recommended`**, wired into all three frameworks'
   generated `eslint.config.mjs`, plus `storybook/no-uninstalled-addons` scoped to
   `.storybook/main.ts`. Pinned to `STORYBOOK_VERSION` (10.6.0), the same pin every
   other Storybook devDependency in this preset already uses. Required the React and
   Vue example templates (`atl-button.stories.tsx`/`.ts`, `preview.tsx`/`.ts`) to move
   from importing `Meta`/`StoryObj`/`Preview` off `@storybook/react` / `@storybook/vue3`
   to `@storybook/react-vite` / `@storybook/vue3-vite` — see Context point 3. The
   now-unnecessary `@storybook/react`/`@storybook/vue3` devDependencies stay (harmless,
   pulled in transitively by their `-vite` counterparts regardless, and removing them
   would touch already-passing, unrelated tests for no behavioural gain).
5. **Type-aware linting**: `typescript-eslint`'s `recommendedTypeChecked`, scoped to
   each app's own source (`src/**/*.ts`/`.tsx`, excluding the example spec file, which
   `tsconfig.app.json` itself already excludes from its own project) via
   `projectService: true`. Vue additionally scopes this to `.vue` files (most Vue
   component code lives there, not in `.ts`) — see Context point 2 for why that block
   re-specifies `parser` rather than relying on a separate one. Every framework also
   gets the `.js`/`.jsx`/`.cjs`/`.mjs` `tsconfigRootDir` fix from Context point 2.
   `typescript-eslint` is added as a devDependency defensively (each framework's own
   application generator already adds it independently, confirmed against a real
   generated tree — this is a safety net, matching this file's existing
   `TYPESCRIPT_VERSION` convention, not the primary source).

Also: `libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs` switches its unit-test step
from `npx nx test workshop-${framework}` to `npm test` (matching its neighbours, which
already run the npm script an attendee is actually told to type) and adds `npm run
lint -- --skip-nx-cache` as its own step, so the e2e proves a generated workspace
passes its own linter — not just that `preset.spec.ts` produced the right config
_text_. The generated `CLAUDE.md`'s "Definition of Done" section gained a short
paragraph naming `npm run lint`'s promoted rules and type-aware checks explicitly, so
an attendee (or an agent) reads "the linter is the feedback loop, not friction to
prompt around" in the same place it already reads the other five gates.

## Consequences

- **Nobody migrates.** Verified directly: all three frameworks' example scaffolds
  build clean under `strict: true`, and — after every lever above, combined — lint
  clean, `check:contracts` clean (only the pre-existing, expected
  `[NO-STORY-META]`/`[UNMIRRORED]` warnings on the vacuous external-package example),
  and unit-test clean. This was proven against the real generated `preset.js` output
  (not the in-memory Jest tree), with `@atelier-ui/{angular,react,vue}@0.3.1` actually
  installed from the public registry.
- **Lint gets slower, measurably — the size of the cost depends on which number you
  read.** `npm run lint` (the `nx lint`-wrapped npm script CLAUDE.md tells an attendee
  to run) stayed at 2.0-2.2s for React and Angular before and after lever 5, and rose
  from ~2.1s to ~3.4-3.9s for Vue — small enough on a fresh scaffold's handful of files
  that Nx's own process/daemon overhead dominates the signal. The real ESLint cost is
  visible only bypassing Nx: raw `npx eslint .` inside the app directory rose from
  ~2.4-2.7s to ~4.2-5.8s across all three frameworks (roughly +80% to +140%, worst on
  Vue's `.vue` SFC type-checking). That is a real, non-trivial relative slowdown, not
  noise — but the absolute number stays a few seconds on a scaffold this size, nowhere
  near "a person stops running it." The honest caveat: this was measured on the
  scaffold's own handful of example files. Type-aware linting's cost scales with the
  size of the TypeScript program it has to build, which grows with the codebase over
  the course of a workshop — worth re-measuring against a workshop-sized codebase
  later, not assumed to stay this cheap indefinitely.
- **The React/Vue rule-count table in the brief and this repo's own measurement
  disagree by a margin, for a known reason.** The brief's numbers (142 active / 66
  warning-only on React `.tsx`; ~103/181 active, 20 warning-only on Vue) come from
  whatever `eslint-plugin-react-hooks`/`eslint-plugin-vue` version a fresh `npm
install` resolved at measurement time — a range this preset does not pin. This
  decision's own measurement (156 active / 68 warning-only on React; 118 active / 33
  warning-only on Vue `.vue`) used whatever this monorepo's own `package-lock.json`
  currently resolves, which is not guaranteed to be the same snapshot. Neither number
  is "the" count — the promoted rule _names_ in the Decision section are what this
  preset actually asserts, and those were checked against the real, currently-resolved
  versions directly, not read off either table.
- **`react-hooks/exhaustive-deps` is a deliberate warning, argued both ways.** For: a
  missing effect dependency is a real, common LLM bug (a stale closure over `props` or
  local state) — CLAUDE.md's own React idioms section already says "a missing
  dependency is a bug to fix, not a lint rule to silence," which reads as a hard rule
  already. Against: the rule has a well-known false-positive rate around
  intentionally-omitted stable references (a `dispatch`, a `setState` function, a ref)
  and "run once" effects — exactly the shape of strictness that fires on legitimate
  code and teaches the wrong fix (suppress the warning) to a beginner-and-LLM-agent
  audience, which is the one failure mode this whole exercise is designed to avoid.
  Decided by precedent, not by re-litigating the argument from scratch: this repo's own
  `libs/react/eslint.config.mjs` — the most strictly-linted React code in this
  monorepo — makes the identical call, leaving this one rule untouched at `'warn'`.
- **Two other close calls, decided the same way — by what this repo's own libraries
  already do:** `@typescript-eslint/no-explicit-any`/`no-non-null-assertion`/
  `no-unused-vars` are promoted for Angular (matching `libs/angular/eslint.config.mjs`,
  which already promotes exactly these three) but left as warnings for React and Vue
  (matching `libs/react/eslint.config.mjs` and `libs/vue/eslint.config.mjs`, neither of
  which touches them) — a type-strictness preference, not the "correctness and
  security family" lever 3 was scoped to.
- **`check:docs`, `check-adr-refs`, `prettier --check` and the constrained files
  (`tools/scripts/sync-preflight.mjs`'s `FILES` array, every existing npm script name)
  are untouched** — nothing in this decision needed to touch any of them.
- **Named but not done here:** the generated `CLAUDE.md`'s "Definition of Done" list
  still names only five checks and does not add `npm run lint` as a sixth — the brief
  asked for "a sentence or two" documenting strictness where the checks are already
  discussed, not a redesign of that list's shape (which `/verify` and its own tests
  also depend on). Worth a deliberate follow-up, not a silent gap: today an attendee
  could pass all five listed gates while failing `npm run lint` without either
  `CLAUDE.md` or `/verify` saying so.

**Rejected alternatives:**

- _Blanket-promote every warning-only rule to `'error'` on all three frameworks._
  Rejected per the brief's own constraint: Vue's ~30 stylistic `vue/*` warnings would
  turn Prettier-adjacent formatting choices into hard errors, and React's a11y/style
  warnings would fire on patterns this repo's own reference libraries deliberately
  leave alone. A strict setup that fires on already-accepted style is exactly the setup
  people turn off.
- _Leave `react-hooks/exhaustive-deps` unmentioned, promoted alongside everything
  else._ Rejected: the brief explicitly asked for the call to be made and defended: see
  Consequences above.
- _Split `parser`/`projectService` across two separate blocks for Vue's `.vue`
  files, matching the pattern used everywhere else in this preset._ Rejected after
  being tested and failing: reproduced the identical "multiple candidate
  TSConfigRootDirs" parsing error on every `.vue` file, twice, before landing on the
  one-block shape that actually works.
- _Remove the now-unreferenced `@storybook/react`/`@storybook/vue3` devDependencies_
  once the templates stopped importing from them directly. Rejected: harmless (already
  pulled in transitively by `@storybook/react-vite`/`@storybook/vue3-vite` regardless),
  and removing them would mean rewriting two already-passing, unrelated tests
  (`"adds @storybook/react-vite and its non-vite counterpart..."`) for no behavioural
  gain — out of scope for a decision about strictness levers.
