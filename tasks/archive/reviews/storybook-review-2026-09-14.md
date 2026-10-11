# Review — the three Storybook configurations, the 10.6 feature surface, and what the curriculum teaches

**Date:** 2026-09-14 · **Scope:** `libs/{angular,react,vue}/.storybook`, the scaffold templates in
`libs/create-workspace/.../files/storybook`, the installed Storybook 10.6.0 feature surface, and every
teaching surface that mentions Storybook · **Method:** four parallel research passes (installed
`node_modules` dist, official 10.0–10.6 release sources, repo usage, curriculum coverage), with every
claim that changes a conclusion re-verified here against the installed code.

Prior art this builds on and does not repeat: `tasks/storybook-10-6-spike-2026-09-05.md`,
`tasks/storybook-10-6-migration-plan-2026-09-05.md`, ADR-0097, ADR-0112, ADR-0121/0122, ADR-0142,
ADR-0143.

---

## 1. The configurations, as they stand

The three `main.ts` are the strongest part of the setup: every non-obvious flag carries a comment that
says what reads it and what happens without it, and each one names the ADR behind it. `viteFinal`'s
`BUILD_STORYBOOK` gate (ADR-0122) and the `experimentalReview` block (ADR-0143) are both the kind of
comment that survives the next reader. Nothing below disputes that; the findings are drift and omission,
not error.

### 1.1 Drift between the three libraries

| #   | Finding                                                                                                                                                                                                                                                                                                                                             | Evidence                                                                        | Severity                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| D1  | **Vue has no `manager.ts`.** Angular and React brand their manager (`brandTitle`, `brandImage`, `brandUrl`); Vue's Storybook shows the stock Storybook chrome. `manager.ts` was added by `5aac829` ("Rename libs to angular, react, spec") — before the Vue library existed, so Vue never got one.                                                  | `libs/{angular,react}/.storybook/manager.ts`; absent in `libs/vue/.storybook/`  | Cosmetic, but it is a workshop-visible surface                                            |
| D2  | **`controls.matchers` is Angular-only.** The `color` / `date` matchers that turn matching args into colour and date pickers exist in `libs/angular/.storybook/preview.ts` and in nothing else — including all three scaffold templates' `preview`, which do carry them. So the repo's own React and Vue Storybooks are _behind their own scaffold_. | `libs/angular/.storybook/preview.ts` vs `libs/{react,vue}/.storybook/preview.*` | Low, but inverted: the teaching artefact is better than the reference                     |
| D3  | **Three different `.storybook/tsconfig.json`.** React's `include` omits its own `./manager.ts` (so nothing type-checks that file); Vue has no `exclude` and never names `preview.ts`/`main.ts`; Vue alone carries `"vitest/globals"` in `types`; Vue alone lacks `"outDir": ""`.                                                                    | `libs/*/.storybook/tsconfig.json`                                               | Low individually, but it is the file that decides whether config errors are caught at all |
| D4  | **Dead code in React's `main.ts`.** A commented-out `typescript.reactDocgen` / `reactDocgenTypescriptOptions` block, unreferenced by anything.                                                                                                                                                                                                      | `libs/react/.storybook/main.ts`                                                 | Trivial                                                                                   |
| D5  | **React's `main.ts` uses `import { StorybookConfig }`, not `import type`.** Angular and Vue use `import type`.                                                                                                                                                                                                                                      | `libs/react/.storybook/main.ts:3`                                               | Trivial                                                                                   |

D1–D5 are all one-line fixes. They matter as a set rather than individually: this repo's whole premise
is that the three adapters stay in lockstep, and there are five places where they silently do not.
Nothing gates any of them — `check:manifest-parity` compares docgen output, not configuration.

### 1.2 Two version-hygiene findings

**V1 — `@storybook/addon-designs` carries a caret nothing guards.** Corrected 2026-09-14, after this
section first said the lockstep rule "does not cover it": it exempts it, deliberately and with a reason.
`@storybook/addon-designs` is in the rule's `DEFAULT_EXEMPT`
(`tools/eslint-rules/storybook-version-lockstep.js`), whose header states why — _"a third-party addon on
its own release line rather than part of the Storybook core release train"_ — and `create()` skips
exempt names outright, so neither the exactness check nor the lockstep check runs on it. The different
major is a decision, not an oversight.

What is left is narrower and still real: the version is `^11.1.4`, a caret. Every other Storybook package
is pinned exactly to `10.6.0`. The rule's own header names this exact failure shape — _"A non-exact entry
can drift on its own, silently, on the next `npm install` or the next automigrate run"_ — and the
exemption means no gate will say so. Pin it exactly at `11.1.4` and keep the exemption; the major stays
legitimate, the silent drift does not.

**V2 — Storybook telemetry is on.** `core.disableTelemetry` defaults to false
(`node_modules/storybook/dist/core-server/presets/common-preset.js:2178`) and no `main.ts` here — nor any
scaffold template — sets it. It applies to the repo and to every workspace a workshop participant
scaffolds. This is a configuration fact, not a legal assessment: any data-protection judgement on it
belongs with the internal DSB (Michael Didion / Harry Ursinus, datenschutz@conciso.de), not with this
review.

---

## 2. Feature ledger — what 10.6 offers, what we use, what we should

Sources: the installed dist (every row verified against a file path) and the official 10.0–10.6 release
notes. "Verdict" is a recommendation, not a decision taken.

### 2.1 In use

| Surface                                    | Where                                                                                                  | Note                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `features.componentsManifest`              | all three `main.ts`                                                                                    | ADR-0097; gated by `check:storybook-manifests`      |
| `features.experimentalDocgenServer`        | Angular (redundant — `@storybook/angular-vite` defaults it on in 10.6), Vue (load-bearing until SB 11) | comments already say which is which                 |
| `features.experimentalReview`              | all three                                                                                              | ADR-0143                                            |
| `features.changeDetection`                 | default `true`, never overridden                                                                       | what `stories-changed` and `review-create` hang off |
| addons                                     | `addon-mcp`, `addon-vitest`, `addon-a11y`, `addon-designs`, `addon-docs`, `addon-themes`               |                                                     |
| `parameters.docs.page`                     | all three previews → `contractDocsPage`                                                                | ADR-0121 S5b — a genuinely custom docs page         |
| `parameters.a11y.test: 'error'`            | all three previews                                                                                     | ADR-0121 S0                                         |
| `options.storySort`                        | all three previews                                                                                     |                                                     |
| `withThemeByDataAttribute`                 | all three previews                                                                                     | ADR-0142                                            |
| `parameters.design`                        | 85 story files                                                                                         | the Figma panel                                     |
| `tags: ['autodocs']`                       | ~89 story metas                                                                                        | graded in `workshop/briefs/README.md`               |
| `play` + `storybook/test`                  | 9 of 95 story files                                                                                    |                                                     |
| `storybookTest()` browser mode             | three `vitest.storybook.config.ts`                                                                     | ADR-0122                                            |
| portable stories                           | React and Vue only — Angular cannot (ADR-0141)                                                         |                                                     |
| `storybook tools` / `storybook skills` CLI | documented in `docs/src/pages/storybook.astro`                                                         |                                                     |

### 2.2 Not used — worth adopting

**A1 — `storybookTest({ initialGlobals: { theme: 'dark' } })`. Highest-value finding in this review.**

ADR-0142 named the gap precisely ("axe had never once seen the dark state") and costed three ways to
close it, settling on option (b): _"reading `initialGlobals.theme` from an environment variable and
invoking `nx storybook-test <fw>` once per value"_. The addon has a first-class option for exactly this,
and its own JSDoc recommends this exact use:

> Globals applied to every story run by this project… Use it to pin a toolbar global for the whole run —
> most usefully to test a specific theme: define one Vitest project per theme, each with a different
> value, e.g. `storybookTest({ initialGlobals: { theme: 'dark' } })`.
> — `node_modules/@storybook/addon-vitest/dist/vitest-plugin/index.d.ts`

Shipped in 10.5 (PR #35226) — i.e. it did not exist when the option was costed, and the ADR was written
against 10.6 without it being found. A second Vitest project per framework, no environment variable, no
second gate invocation, and the root `vitest.config.mjs` already uses a `projects:` array.

The cost ADR-0142 correctly flagged remains: it doubles the axe-checked surface. Which is what the _next_
row is for.

**A2 — `storybookTest({ tags: { include, exclude, skip } })`.** The coverage regulator ADR-0142 said the
owner had to choose by hand. A dark project scoped to a tag (`tags: { include: ['dark'] }`) tests a
chosen representative sample rather than all 95 stories. Same option object as A1; adopt them together
or not at all.

**A3 — CSF factories. A decision with a deadline, not a preference.** `definePreview()` / `preview.meta()`
/ `meta.story()` are fully shipped in the installed dist (`node_modules/storybook/dist/chunk-Br3Wsk04.d.ts:590-660`),
Preview status for all of React/Vue/Angular since 10.2, and **the default story format in Storybook 11**
(official 11.0 addon migration guide). This repo has 95 CSF3 story files, a curriculum that teaches CSF3,
a scaffold that generates CSF3, and a `storybook automigrate csf-factories` codemod it cannot run
(`automigrate` is barred here — `@storybook/cli` is not a dependency and `check:all` is offline). The
choice is between migrating deliberately, on our own schedule, and teaching a format that upstream will
call legacy within one major. Worth a spike and an ADR before the next cohort, not a decision to take in
this review.

**A4 — `features.experimentalReactComponentMeta` for React.** Angular and Vue extract props through the
docgen server; React still runs plain `react-docgen`
(`node_modules/@storybook/react/dist/preset.js:388`). The three frameworks' prop tables are therefore
produced by two different classes of analyzer — in a repo whose central gate (`check:manifest-parity`)
compares exactly those outputs. Note that the two flags are **not** the same thing and not a rename: the
React preset reads both, independently, at lines 379 and 388. A spike would answer whether RCM removes
known React-side docgen deltas; it is not free (TS language service, worker thread).

**A5 — `parameters.docs.toc`.** The docs site already treats a persistent TOC as a reading requirement
(ADR-0086/0087); the Storybook docs pages, which are the _other_ half of the same documentation surface,
have none. One line in each preview.

**A6 — `features.experimentalSearchDocsHeadings`.** Adds docs story subheadings to the manager search
index. One line, no cost, directly useful for a workshop where people search rather than browse.

**A7 — `core.disableTelemetry`.** See V2. A decision, cheap either way.

**A8 — the onboarding checklist flags.** `sidebarOnboardingChecklist` and `menuOnboardingChecklist` both
default `true` (`common-preset.js:2199-2200`), so a scaffolded workshop Storybook shows Storybook's own
guided-tour widget beside our curriculum. Either deliberate (it teaches Storybook) or noise (it competes
with the workshop's own guidance) — currently it is neither, just a default nobody has looked at.

### 2.3 Not used — correctly

| Surface                                                                                    | Why skipping is right                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@storybook/test-runner`                                                                   | superseded by `addon-vitest`, which is what `check:stories` runs                                                                                                                                                 |
| `@storybook/addon-essentials`, `addon-interactions`, `addon-links`                         | empty packages since SB 9; controls/viewport/backgrounds/measure/outline/actions/interactions are core `features.*` here                                                                                         |
| `sb.mock` module mocking (`storybook/test`, verified present)                              | a token-and-component library has no modules to mock                                                                                                                                                             |
| `experimentalRSC`, `experimentalCodeExamples`                                              | React-only, and `experimentalCodeExamples` is mutually exclusive with the docgen server (`react/dist/preset.js:462`)                                                                                             |
| `refs` (Storybook Composition)                                                             | one Storybook composing all three frameworks contradicts "one framework per workshop" (`project_workshop_single_framework`)                                                                                      |
| `build.test.*`                                                                             | those flags cheapen _test_ builds; the builds here are for hosting and for the manifest gate                                                                                                                     |
| `afterEach`, `parameters.test.*`, per-story `globals`, `loaders`, `mount`, `subcomponents` | no current need; none is a gap                                                                                                                                                                                   |
| Chromatic / visual regression                                                              | not installed, and `check:paint` plus `figma_check_design_parity` already cover the ground differently. 10.4's "Quick Sharing" is publish-to-Chromatic hosting, not visual diffing — worth knowing, not adopting |

### 2.4 Investigated and dismissed

`experimental_importParsers` — the change-detection dependency-graph parser for `.vue` files. Looked like
a Vue-side gap in `stories-changed`; it is not. `@storybook/vue3/dist/preset.js:1451` registers it
already.

---

## 3. What the curriculum teaches, and the four gaps that matter

The coverage is broad and mostly current: MCP surfaces, toolset gating, `docs-list`/`docs-show`,
`get-storybook-story-instructions`, `test-run`, CSF3 authoring, args/argTypes, autodocs (graded),
`play` + `storybook/test`, `a11y.test: 'error'`, the browser-mode gate, the docgen server, and the
`storybook tools` / `storybook skills` distinction all have a home. No CSF2, no `addon-essentials`, no
`@storybook/testing-library`, no `storyStoreV7` anywhere. What follows are the exceptions.

**G1 — Four checked-in skills instruct agents to run a command deprecated in 10.6.** This is the only
outright contradiction found, and it is live: any agent that loads these acts on them.

- `.claude/skills/storybook-setup/SKILL.md:11` and `.agents/skills/storybook-setup/SKILL.md:11` —
  `Run \`npx storybook ai setup\``
- `.agents/skills/stories/SKILL.md:13,15,17` — `STORYBOOK_FEATURE_AI_CLI=1 npx storybook ai --help`

Meanwhile `AGENTS.md` and `docs/src/pages/storybook.astro` both correctly state that `storybook ai` is
deprecated in favour of `storybook skills`. Verified in this session: `npx storybook skills setup
--config-dir libs/react/.storybook` and `npx storybook skills stories --config-dir libs/react/.storybook`
both work, and the `setup` output is config-aware — it already lists this repo's real addon set,
`@storybook/addon-designs` included, which a vendored file cannot know.

**Status: found, not fixed.** A patch replacing the deprecated commands was written on 2026-09-14 and
reverted the same day on the owner's call — the Storybook skills stay untouched for now. Nothing was
half-applied: `.agents/skills/{stories,storybook-setup}/SKILL.md` are byte-identical to the vendored
originals, and no ADR was written, because no decision was taken. The finding stands and is carried as
an open item in `tasks/todo.md` with the three options and their costs.

The reason it is not a one-liner: these files came from the third-party `storybookjs/mcp` package
(ADR-0123), so patching them in place forks upstream, and the next `npx skills add storybookjs/mcp`
reverts the patch silently — with the only warning living inside the files that get overwritten.

**G2 — `addon-designs` is used in 85 story files and taught nowhere — and the scaffold does not ship it.**
For a workshop whose entire subject is Figma → code, the addon that puts the Figma frame in a panel
beside the component is the most on-topic thing installed, and a learner never meets it. The three
scaffold `main.ts.template` files list `addon-mcp`, `addon-vitest`, `addon-a11y`, `addon-docs`,
`addon-themes` — no `addon-designs` — and no scaffold story template sets `parameters.design`.
ADR-0144 (`--figma` / `--no-figma`) is exactly the switch this belongs behind: with Figma, the addon and
the `design` parameter; without it, neither.

**G3 — `contractDocsPage` is the repo's own signature Storybook feature and is untaught.** All three
previews override `parameters.docs.page` to render the ADR-0121 contract on every Docs tab. It is the
visible payoff of the whole contract mechanism, and no curriculum surface explains that the Contract
section on the Docs tab is ours rather than Storybook's.

**G4 — the agenda's dark-mode wording predates ADR-0142.** `schulung-2tage-agenda.md` teaches the
dark-mode toggle _"via Storybook backgrounds-/theme-Addon"_. ADR-0142 deliberately decoupled those two:
`backgrounds` is canvas colour, the theme control is `withThemeByDataAttribute`. Conflating them is the
exact bug that ADR-0142 removed from the code.

Smaller, real, lower priority: MDX authoring (12 `.mdx` files ship in the libraries; nothing teaches
writing one), `storySort` (used, unexplained), `stories-changed` and `review-create` (documented, never
exercised), story tags beyond `autodocs`.

---

## 4. Recommended sequence

1. **G4** — correct the agenda's backgrounds/theme wording to match ADR-0142. **Done 2026-09-14.**
2. **G1** — deferred by the owner; the vendored skills stay as they are. Carried in `tasks/todo.md`.
3. **D1–D5, V1** — close the config drift and put `addon-designs` under the lockstep rule.
4. **G2, G3** — the two curriculum gaps that are pure documentation of what already exists (G2's scaffold
   half is a code change behind ADR-0144's `--figma` switch, and ships to npm).
5. **A1 + A2** — dark-mode axe coverage, as an addendum to ADR-0142 recording that the option it costed
   has a first-party replacement.
6. **A5, A6, A7, A8** — the four one-line calls.
7. **A3 (CSF factories)** — its own spike and its own ADR, before the next cohort.
8. **A4 (React docgen parity)** — its own spike, unhurried.

---

## Weakest point of this review

Everything in §2.2 is a reading of the installed dist and the release notes; only A1 was proven to work
by driving it (the JSDoc is upstream's own recommendation, and the `initialGlobals` plumbing is visible
at `dist/vitest-plugin/index.js:2667`). A1's _cost_ — what a second browser project does to
`check:stories` wall-clock, which `tasks/todo.md` already records as ~345 s unscoped — is estimated, not
measured. Nothing here should be adopted on this document's authority alone; each item still owes its
gate run.
