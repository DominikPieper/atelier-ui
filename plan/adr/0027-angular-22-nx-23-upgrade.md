---
status: accepted
date: 2026-07-21
sources:
  - user request ("wir sollten auf die neuste angular version gehen" / "Bzw auch Nx auf die neuste")
---

# Upgrade Angular to 22 and Nx to 23

## Status

Accepted.

## Context

The workspace was pinned to Angular `~21.2.4` and Nx `22.7.2`. Angular 22.0.7
(current-active) and Nx 23.1.0 had both shipped, one major step ahead of what
the workspace ran. Nx's own migration guidance treats "one major version at a
time" as a hard requirement for Angular (its packages only carry migrations
for a single major), not just a recommendation — 21→22 and 22→23 are each
exactly one step, so no intermediate stop was needed.

Only `libs/angular` depends on Angular in this workspace (no `apps/`); no CI
config pins an Angular or Node version directly (Node comes from
`.node-version`, already ahead of what Angular 22 requires).

## Decision

Run `npx nx migrate latest` followed by `npx nx migrate --run-migrations`.
This single pass covered far more than the Nx/Angular core packages: `@nx/*`
22.7.2→23.1.0, `@angular/*` 21.2.x→22.0.7, and — contrary to the original
plan, which expected these to need manual bumps — Nx's dependency graph also
carried `@analogjs/vitest-angular` / `vite-plugin-angular` / `storybook-angular`
to 2.6.3, `angular-eslint` to 22.1.0, `@angular/cdk`/`aria` to 22.0.5, and
`ng-packagr` to 22.0.1 automatically. TypeScript jumped 5.9→6.0 and Vite
7→8 as hard transitive requirements (`@angular/compiler-cli@22` demands
`typescript: >=6.0 <6.1`; `@nx/vitest@23` bumped Vite to 8).

The deterministic codemods this produced needed two manual follow-ups, both
because a rule/package genuinely disappeared rather than just being renamed:

- `libs/angular/eslint.config.mjs`: the codemod stripped
  `@angular-eslint/no-conflicting-lifecycle` (removed in `angular-eslint@22`,
  confirmed by listing the installed plugin's rule set) but left a blank line;
  tidied.
- A stale `/* eslint-disable @angular-eslint/prefer-on-push-component-change-detection */`
  in `cookbook.stories.ts` started flagging as an unused directive under the
  new rule-set behavior; removed the now-inert half of the comment.

Two published packages needed a manual, un-migrated bump because `nx migrate`
only touches the root workspace `package.json`, not packages this repo
publishes: `libs/create-workspace/package.json`'s `@nx/devkit` pin and
`libs/create-atelier-ui-workspace/package.json`'s `create-nx-workspace` pin
were still `22.7.2`; the `@nx/dependency-checks` lint rule caught both.

Root `package.json` also dropped an explicit `@vitest/browser` devDependency
per the Vitest-4 migration's own hint — nothing in the repo imports from it
directly, and `@vitest/browser-playwright` already carries it transitively.

Docs describing the current stack ("Angular 21", "Nx 22") were updated to
match — `README.md`, `libs/angular/README.md`,
`tasks/claude-design-prompt.md`, `plan/big-picture.md`,
`docs/src/pages/troubleshooting.astro`. `plan/roadmap.md`'s "Angular 21"
mentions were left as-is: they sit under a phase marked `COMPLETE` and record
what was true when that work happened, not the current state.

While verifying the upgrade in a real browser, `LlmButton` rendered with no
visible styling at all despite correct classes/ARIA. Root cause, found by
inspecting the DOM inside the Storybook preview iframe: `llm-button.css`
wrote plain class selectors (`.llm-button`, `.llm-button.variant-primary`,
…) for rules meant to style the *host* element. Angular's emulated view
encapsulation rewrites a bare `.foo` selector to `.foo[_ngcontent-xxx]` —
which only matches a **content child** carrying that attribute, never the
host itself (the host gets `_nghost-xxx`, a different attribute). Since
`LlmButton`'s template is just a conditional spinner plus `<ng-content/>` —
no element inside it carries `.llm-button` — every rule in the file was
dead on arrival, pre-existing and unrelated to this upgrade (confirmed via
`git log`/`git diff` showing the file untouched before this session).
Fixed by rewriting every host-targeting selector to `:host(...)` form
(`.llm-button` → `:host`, `.llm-button.variant-primary` →
`:host(.variant-primary)`, etc.), matching the working convention already
used by `LlmBadge`. `.spinner` stayed a plain class selector — it *is* a
real template child, so `_ngcontent` scoping is correct there.

Alternatives rejected:

- *Bump Angular only, defer Nx*: the user explicitly asked for both latest;
  and Nx's own Angular-version compatibility matrix ties the two together
  closely enough that mismatching them invites exactly the peer-dependency
  conflicts seen mid-migration (see Consequences).
- *Step through an intermediate Nx/Angular minor first*: unnecessary — both
  moves are a single major version step, which `nx migrate` supports directly.

## Consequences

- `npm install` initially failed with an `ERESOLVE` conflict (stale
  `@nx/angular@22.7.2` peer metadata in `package-lock.json` conflicting with
  the newly-declared `23.1.0`). Fixed by deleting `node_modules` and
  `package-lock.json` and reinstalling clean — not a config change, just a
  side effect of a two-major-package cross-bump landing in one lockfile
  update; no long-term consequence.
- Verified via `nx run angular:build`, `nx run angular:lint`,
  `nx run angular:test` (528/528 passing), `nx affected -t lint test build`
  (mirrors the CI gate), and booting Storybook Angular in a real browser —
  Angular initializes cleanly, the component tree renders with correct
  classes/ARIA attributes, and `--ui-*` design tokens resolve.
- Zoneless change detection (`provideZonelessChangeDetection`) remains
  out of scope — zone.js is still active workspace-wide; adopting zoneless
  is a separate, larger decision.
- Incidental finding, fixed for `LlmButton` only (see above). A full audit
  (cross-checking every component's CSS base selector against its host
  `[class]`/`class` binding, not just visual inspection — native form-control
  chrome masks the same bug in `LlmInput`/`LlmCheckbox`/`LlmToggle`) found the
  identical defect in 19 more: `LlmAccordionGroup`, `LlmAlert`,
  `LlmBreadcrumbs`, `LlmCard`, `LlmCheckbox`, `LlmCombobox`, `LlmDialog`,
  `LlmDrawer`, `LlmInput`, `LlmPagination`, `LlmProgress`, `LlmRadio`,
  `LlmRadioGroup`, `LlmSelect`, `LlmSkeleton`, `LlmStepper`, `LlmTable`,
  `LlmTabGroup`, `LlmTextarea`, `LlmToggle` — their base CSS rule (`.llm-x`)
  never matches because their host binding never emits that literal class.
  Confirmed unaffected (already `:host`-scoped or a static class binding):
  `LlmAvatar`, `LlmBadge`, `LlmChat`, `LlmCodeBlock`, `LlmIcon`, `LlmMenu`,
  `LlmToast`, `LlmTooltipContent`. Out of scope for this upgrade — it
  predates it and touches ~20 files; tracked as a follow-up pending the
  user's go-ahead.
