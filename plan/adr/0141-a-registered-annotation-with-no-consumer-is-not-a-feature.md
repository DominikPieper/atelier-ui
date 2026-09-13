---
status: accepted
date: 2026-09-13
sources:
  - node_modules/@storybook/{react,vue3,angular}/dist/index.d.ts and dist/index.js (10.6.0, read directly)
  - node_modules/@storybook/{react-vite,vue3-vite,angular-vite}/dist/index.js (10.6.0, `Object.keys()` at runtime)
  - https://github.com/storybookjs/storybook/issues/28897
  - libs/react/src/lib/accordion/atl-accordion.stories.tsx (`ExpandOnClick`/`CollapseOnClick`, the spike component)
  - libs/{react,vue}/tsconfig.lib.json (the pre-existing `src/test-setup.ts` exclude convention)
  - measured 2026-09-13: `nx test/build/lint` for create-workspace, react, vue, angular, before and after; a throwaway composed-story spike on `atl-accordion.stories.tsx`, timed
---

# ADR-0141: A registered annotation with no consumer is not a feature

## Status

Accepted.

## Context

The ask was to wire Storybook's portable-stories support (`composeStories`,
`setProjectAnnotations`) into Vitest so stories run as fast jsdom tests, not just as
browser-mode tests (`@storybook/addon-vitest`) — in this monorepo's `libs/react`/`libs/vue`/
`libs/angular` and by default in the workspaces `libs/create-workspace` scaffolds. The
starting premise was that `@storybook/{react,vue3,angular}@10.6.0` all ship both functions.

That premise is half wrong. Read directly against the installed `10.6.0` dist — both the base
renderer packages and their `-vite` framework-preset counterparts, not just their `.d.ts`
files (whose JSDoc turned out to be misleading, see below) — `@storybook/react` and
`@storybook/vue3` (and `@storybook/react-vite`, which re-exports the same functions, and
`@storybook/vue3-vite`, which does `export * from '@storybook/vue3'` verbatim) all export
`composeStories`, `composeStory`, and `setProjectAnnotations`. `@storybook/angular` and
`@storybook/angular-vite` export **only** `setProjectAnnotations`. A full grep of both
packages' `dist/` trees for `function composeStories` / `function composeStory` returns zero
matches. The `.d.ts` files' own JSDoc is what caused the original premise: Angular's
`setProjectAnnotations` doc-comment says "so that your global config … is applied … when
using `composeStories` or `composeStory`" — boilerplate copied across all three renderers'
otherwise-identical JSDoc templates, describing what the function is _for_ in general, not
what this specific package ships. This is a currently open upstream gap, not a shape
difference to adapt to: `storybookjs/storybook#28897`, "Introduce portable stories support for
Angular," open since August 2024, evaluating feasibility, no PR attached.

Separately, `@storybook/addon-vitest`'s own browser-mode `test-run` tool _does_ successfully
run Angular stories (ADR-0112 measured "Angular 1/1" against a real story) — but it does so
through `composeStory` imported from `storybook/preview-api`, a renderer-agnostic internal
built for that addon's own instrumented browser environment, not documented as a supported
entry point for a hand-written jsdom test, and not something this decision reproduces: doing
so would mean depending on Angular's `renderToCanvas` bootstrapping inside jsdom, a mechanism
this repo's own Angular unit tests do not use today (they use `@analogjs/vitest-angular`'s
TestBed-based rendering instead) and had no reason to assume would work.

## Decision

Implement the capability fully for React and Vue, in both places:

- A new Vitest setup file, `src/test-setup-stories.ts`, that calls `setProjectAnnotations`
  against the project's own `.storybook/preview` module and runs its returned `beforeAll`
  hook through Vitest's own `beforeAll` (Storybook's documented Vitest recipe, not a local
  invention) — added to `setupFiles` alongside the existing `src/test-setup.ts`, in
  `libs/{react,vue}/vite.config.mts` and the create-workspace preset's
  `vitest.unit.config.ts.template` for both frameworks.
- One worked example per place: `AtlButton`'s example unit spec now composes
  `atl-button.stories.*` via `composeStories(...).Primary.run()` instead of hand-writing the
  same "renders with its accessible name" / "fires its click handler" claims a second time —
  in the create-workspace preset (replacing the old duplicate spec) and, additively, in this
  monorepo's own `libs/react`/`libs/vue` (a new `atl-button.stories.spec.*` sitting beside the
  existing `atl-button.spec.*`, which stays untouched — it is tagged with this repo's
  `covers()` behavior-coverage helper and remains the source of this component's behavior
  claims; the new file demonstrates the catalog renders correctly, it does not replace
  behavior coverage).

For Angular, no functional change: no `test-setup-stories.ts`, no rewritten example spec.
Calling `setProjectAnnotations` with nothing downstream able to call `composeStories` against
its result would register configuration that nothing reads — code that looks like support and
isn't. A one-line-pointer comment was added instead, in both `test-setup.ts` locations
(monorepo and preset template), naming the verified gap and this ADR, so a future reader
doesn't mistake the omission for an oversight. When `storybookjs/storybook#28897` ships,
mirror the React/Vue shape here — the setup-file pattern and the example rewrite are already
proven, only Angular's own render mechanics remain to be checked against whatever API lands.

Rejected: routing Angular through `storybook/preview-api`'s generic `composeStory` (see
Context). This would depend on undocumented internal wiring, require validating that
Angular's `renderToCanvas` actually mounts correctly in jsdom (untested, and the addon-vitest
precedent that proves Angular _can_ render this way runs in a real browser, not jsdom), and
produce a maintenance liability with no upstream contract behind it — reproducing missing
functionality on someone else's internal API is the wrong fix when the right one is already
tracked upstream.

## A real bug this surfaced, fixed in the same pass

`libs/{react,vue}/tsconfig.lib.json` each already exclude `src/test-setup.ts` from the
library's own public `tsc`/build output (that tsconfig carries no `vitest/globals` ambient
types, only the test-side config does). The new `src/test-setup-stories.ts` needed the same
treatment and initially didn't get it: `nx build react` failed on `beforeAll` — an
unresolved global — because `@nx/js:tsc` type-checks everything `tsconfig.lib.json` matches,
including a file its `exclude` array hadn't caught up to yet. `nx build vue` did not fail the
same way (its Vite lib-mode build only bundles what's reachable from `src/index.ts`, and
`test-setup-stories.ts` isn't imported from there), but got the identical exclude entry anyway
for consistency with the same established convention, rather than leaving a gap that
happens not to bite today only because of which bundler runs the check. Fixed by adding
`"src/test-setup-stories.ts"` next to the existing `"src/test-setup.ts"` entry in both files.

## The sweep-cost measurement (not a decision, a data point for a decision not yet made)

The ask was explicit that this should not become a blanket sweep of all ~40 components' stories
into jsdom — that would duplicate `storybook-test`'s browser-mode coverage at lower fidelity
for signal it already has. To give the owner real numbers rather than a guess: `AtlAccordionGroup`
(the only `libs/react` component with `play` functions that assert on real computed layout) was
composed and run in jsdom as a throwaway spike, then deleted.

- `ExpandOnClick`'s play **failed**: `waitFor(() => expect(wrapper.getBoundingClientRect()
.height).toBeGreaterThan(0))` timed out. `aria-expanded` correctly flipped to `"true"` — the
  click logic is right — but jsdom never computes real layout, so the height stays `0`
  regardless.
- `CollapseOnClick`'s play **passed, vacuously**: its assertion (`height` `toBe(0)`) is
  trivially true in jsdom whether or not the collapse actually ran, for the identical reason.

This is the exact risk the task named going in (a `play` that leans on real layout produces
either a guaranteed jsdom failure or a silent no-op), now confirmed rather than assumed, on a
real component already in this library. Timing was not the constraint: the isolated two-test
spike file ran in ~4.2s wall-clock (1.38s of actual test execution), and a full `nx test react`
run with the spike file present (12.08s) was indistinguishable from without it (12.25s) —
run-to-run noise, not a measurable cost. Composing more stories is cheap; deciding _which_ of
react's 8 `play` functions (across 2 files) and vue's matching count are layout-dependent
traps like this one, versus genuinely safe to run twice, needs per-story judgment. That
judgment is left to the owner, per the task's own instruction not to decide it here.

## Consequences

- `libs/react`: 450 → 453 tests (54 → 55 files). `libs/vue`: 340 → 343 tests (54 → 55 files).
  `libs/angular`: 601 → 601, unchanged (comment-only edit).
- `create-workspace`'s own generator test suite (`preset.spec.ts`, run under Jest via
  `nx test create-workspace`): 233 → 236 tests.
- Two new explicit root `package.json` devDependencies: `@storybook/react`, `@storybook/vue3`
  (both pinned `10.6.0`, matching `@storybook/angular`'s existing explicit pin). Both packages
  were already resolvable in this monorepo, but only as transitive/hoisted dependencies of
  `@storybook/react-vite`/`@storybook/vue3-vite` — sufficient for the type-only imports
  `libs/{react,vue}/.storybook/preview.*` already had, but the new `test-setup-stories.ts`
  files take a genuine runtime import on them, which now has its own explicit declaration
  instead of depending on hoisting continuing to work.
- `npx nx test/build/lint create-workspace`, `npx nx test/build react`, `npx nx test/build
vue`, `npx nx test/build angular`, and a full-repo `npx prettier --check .` all exit `0`,
  verified directly (log read, not piped) after the tsconfig fix above.
- If `storybookjs/storybook#28897` ships Angular `composeStories`/`composeStory` support, this
  ADR's Angular exclusion should be revisited — the shape to copy is already proven on React
  and Vue; nothing here needs to change to accommodate it later, only Angular's own file needs
  to be added.
