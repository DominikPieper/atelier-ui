---
status: accepted
date: 2026-07-10
sources:
  - tasks/todo.md (H1 follow-ups, item D10)
  - ~/.claude/plans/validated-sniffing-lamport.md ("Live defects shipping today")
---

# Ship component CSS and tokens.css inside the npm packages

## Status

Accepted.

## Context

The 2026-06-17 approach audit found two packaging defects shipping behind green
gates, and fixing them surfaced a third:

1. **React shipped zero CSS.** Every compiled component keeps its
   `import './llm-x.css'` side-effect import, but the `@nx/js:tsc` build only
   copied `*.md` assets. Any consumer bundler failed to resolve the import —
   the package was unusable outside this repo.
2. **No package shipped `styles/tokens.css`**, yet all three READMEs advertise
   `@import '@atelier-ui/<fw>/styles/tokens.css'`. ADR-less prior state: the
   create-workspace preset writes its own `tokens.css` into scaffolded
   workspaces (2026-04-22 decision), so the workshop path worked while the
   plain-npm path silently didn't.
3. **The Vue package had no entry point at all.** `libs/vue/package.json`
   (copied verbatim to dist) declared no `main`/`module`/`types`/`exports`;
   Vite's lib mode also extracts all SFC CSS into `index.css` without emitting
   an import for it. `import '@atelier-ui/vue'` failed to resolve, and even
   with a manual deep path the components rendered unstyled.

None of this was visible in CI: the `cli-e2e` builds a scaffolded app that
never imports a component, and all drift gates compare sources, not dist.

## Decision

Make every published package self-sufficient: importing the package gives
working, styled components, and `<pkg>/styles/tokens.css` resolves as the
READMEs promise.

- **React** (`libs/react/project.json`): add asset globs so `lib/**/*.css`
  lands next to the compiled JS (relative imports resolve) and
  `src/styles/tokens.css` lands at package root `styles/tokens.css`. The
  tsc-generated package.json has no `exports` field, so no mapping is needed.
- **Vue**: declare `main`/`module`/`types` plus an `exports` map in
  `libs/vue/package.json` (dist-relative paths); flatten d.ts output with
  `vite-plugin-dts` `entryRoot: 'src'`; prepend `import './index.css';` to the
  bundle via a rollup `banner` so extracted component CSS loads automatically;
  copy `tokens.css` to `dist/libs/vue/styles/` in the build command.
- **Angular**: component CSS was never affected (ng-packagr inlines it).
  Ship tokens via `ng-package.json` `assets` (lands at `src/styles/tokens.css`
  in dist) and a custom `exports` entry `"./styles/tokens.css"` (with `style`
  + `default` conditions) that ng-packagr merges into its generated map.
- **The preset keeps its own canonical `tokens.css`** and keeps writing it into
  scaffolded workspaces. This ADR does not reverse the 2026-04-22 decision —
  attendees still get an editable local copy; the package export serves
  plain-npm consumers. `sync-tokens.mjs` already guarantees the copies agree.

Alternatives rejected:

- *Fix the READMEs instead of the packages* (document the copy-the-file
  approach): cheapest, but leaves the packages broken for any consumer outside
  the workshop preset, and React would still ship unresolvable CSS imports.
- *`vite-plugin-lib-inject-css` for Vue*: does per-chunk CSS injection
  properly, but adds a dependency where a one-line rollup `banner` suffices
  for a single-entry bundle.
- *Angular assets at package root*: ng-packagr copies assets preserving their
  source-relative path, so the file necessarily lands under `src/`; the
  `exports` mapping gives consumers the clean specifier instead.

## Consequences

- `npm install @atelier-ui/<fw>` now works standalone; verified by packing all
  three dist tarballs, installing them into a scratch project, and bundling
  entries with esbuild: React pulls component CSS + tokens, Vue resolves via
  `exports` and auto-loads `index.css`, the Angular tokens subpath resolves.
- Vue consumers get all component CSS as soon as they import anything from the
  package (single extracted stylesheet — no per-component splitting). That is
  ~63 kB raw / ~9 kB gzip, acceptable for a teaching library.
- The `cli-e2e` still never renders a component, so dist regressions of this
  class stay invisible to CI. Follow-up recorded in `tasks/todo.md`: make the
  scaffolded app (or an e2e step) import a component so the gate would fire.
- Publishing note: the fix reaches npm with the next release; versions
  ≤ the current band are broken-as-audited.
