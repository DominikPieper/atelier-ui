---
status: accepted
date: 2026-09-13
sources:
  - tasks/todo.md, "`@atelier-ui/react` is published as a self-contradictory package" (2026-09-13)
  - dist/libs/react/package.json, built from libs/react before/after this change
  - libs/react/tsconfig.json (`"module": "preserve"`, `"moduleResolution": "bundler"`)
  - node_modules/@nx/js/dist/src/executors/tsc/tsc.impl.js, `determineModuleFormatFromTsConfig` (@nx/js 23.2.0)
  - node_modules/@nx/js/dist/src/utils/package-json/update-package-json.js, `getUpdatedPackageJsonContent`
  - TypeScript 6.0.3, `ts.ModuleKind.Preserve` (= 200)
  - libs/create-workspace/src/generators/preset/files/testing/{react,vue}/vitest.unit.config.ts.template
  - isolated repro: `npm pack dist/libs/react`, installed into a throwaway project, run under Vitest with and without `server.deps.inline`
---

# ADR-0138: A published package declares what it actually ships

## Status

Accepted 2026-09-13.

## Context

`dist/libs/react/package.json` declared `"type": "commonjs"` while every file it shipped
used raw ESM `import`/`export` syntax — a self-contradictory package. This surfaced while
diagnosing why only Vue's generated-workshop unit tests died on
`TypeError: Unknown file extension ".css"`: Vue's package is correctly formed ESM
(`.mjs` main, `"type"` absent, extension alone disambiguates it), so Vitest's dual-package
hygiene check hands it to Node's own module loader instead of routing it through Vite —
and Node's loader has no idea what to do with the bare `import "./index.css"` banner
Vue's own `vite.config.mts` injects. React ships the identical per-component
`import './x.css'` pattern and appeared unaffected only because Vite's dual-package guard
refuses to externalize a package whose declared `"type"` contradicts its actual contents,
and inlines it instead — which is where the CSS-import handling lives. So React's
generated unit tests were passing _because_ the published package was malformed, not
because it was correct.

**Root cause, established with evidence, not assumed:** `libs/react/tsconfig.json` sets
`"module": "preserve"` (paired with `"moduleResolution": "bundler"`) — a TypeScript 5.4+
module kind that emits the source's own `import`/`export` syntax completely unchanged,
deferring every module-format decision to a downstream bundler. `@nx/js:tsc`'s
`determineModuleFormatFromTsConfig` (the function whose output becomes the package.json's
`"type"`) recognizes `NodeNext`, `ES2015`, `ES2020`, `ES2022` and `ESNext` as ESM output,
but has no case for `Preserve` — so it falls through to the function's own `cjs` default,
and `update-package-json.js` stamps `"type": "commonjs"` onto a package whose emitted
`.js` files are unmodified ESM. Confirmed directly: a probe script resolving
`libs/react/tsconfig.lib.json` (and the temporary path-remapped tsconfig `@nx/js:tsc`
generates for it, which preserves the same `extends` chain) both report
`ts.ModuleKind[options.module] === 'Preserve'`; `dist/libs/react/src/index.js` is verbatim
`export * from './lib/accordion/atl-accordion';` etc. This is very likely a genuine gap in
`@nx/js@23.2.0` (`Preserve` is a legitimate, newer TS module kind its detector predates),
not something particular to this repo's setup — but the fix belongs here regardless, since
it is this package that ships self-contradictory.

Angular (`ng-packagr`) and Vue (`vite build` writing a hand-authored, `.mjs`-disambiguated
package.json) never run through `@nx/js:tsc`'s package.json generation at all, so neither
carries this defect — confirmed by inspecting both built `package.json`s: Angular already
declares `"type": "module"` correctly, and Vue never needed to.

## Decision

1. **`libs/react/package.json` (source) now declares `"type": "module"` explicitly.**
   `update-package-json.js` checks the _source_ package.json's own `"type"` field first,
   before consulting the tsconfig-derived (and buggy, for `Preserve`) detection — so an
   explicit, correct declaration bypasses the broken auto-detection entirely. Rebuilding
   confirms it: the tool logs a harmless warning (`Package type is set to "module" but
"cjs" format is included...`, because the detector's wrong `cjs` guess is still
   computed and handed in alongside the correct source value) and then honors the source
   value, producing `"type": "module"`, `"main": "./src/index.js"`,
   `"module": "./src/index.js"` — self-consistent, and no longer accidentally protected by
   Vite's dual-package guard.

2. **The generated workshop's React unit test config gets the same
   `server.deps.inline: ['@atelier-ui/react']` entry Vue's already has** — Vue's own
   template comment had already predicted this exact contingency ("if
   `@atelier-ui/react`'s build is ever made internally consistent, it will need this
   exact same `inline` entry"), and the prediction is now confirmed rather than assumed.
   Proven by direct repro, not by inspection alone: `npm pack dist/libs/react` (with the
   `"type": "module"` fix applied) into a real tarball, installed into a throwaway
   project alongside Vitest/`@vitejs/plugin-react`/`@testing-library/react`, and run
   against a component test both without and with the `inline` entry.
   - **Without** it: Vitest's dual-package guard now correctly treats the fixed package
     as ordinary external ESM and hands it to Node's own loader, which fails twice —
     first on the barrel `index.js`'s extensionless relative re-exports
     (`export * from './lib/accordion/atl-accordion'`, no `.js` suffix — a consequence of
     `moduleResolution: bundler`, which defers extension resolution to a bundler and is
     satisfied by every real consumer, none of which is Node's bare loader) with
     `Cannot find module`, and — importing a single component file directly, past the
     barrel — with the exact `TypeError: Unknown file extension ".css"` the original
     finding named.
   - **With** it: the same test passes (`1 passed`).

## Consequences

- `@atelier-ui/react`'s published shape is now honest: a `"type": "module"` package whose
  `main`/`module` point at genuine ESM, matching what Angular and Vue already guarantee.
- **Not breaking for anyone who currently `require()`s the package — tested directly, not
  assumed.** Reproduced the pre-fix package.json (`"type": "commonjs"`) against the
  unchanged compiled JS and called `require()` on it: it throws
  `SyntaxError: Unexpected token 'export'` immediately, both before and after this change.
  `require()` support never existed to take away.
- **A real behavior change for an external Vitest consumer**, worth a changelog callout at
  the next release: anyone outside this repo who installs `@atelier-ui/react` from npm and
  imports it in their own Vitest suite was — silently, by accident — protected by the
  dual-package guard's auto-inlining. After this ships, such a consumer needs the same
  `server.deps.inline: ['@atelier-ui/react']` entry in their own Vitest config, or their
  tests start failing on `Unknown file extension ".css"`.
- Vue's template comment (which had speculatively predicted this fix) and
  `preset.spec.ts`'s assertion (which had pinned "react's generated config carries no
  `deps` block" as expected, permanent behavior) are updated in the same diff — the two
  are one change, not landed separately.
- Angular and Vue were checked and do not carry this condition; nothing about their build
  or published shape changes here.
- **Named, not fixed here:** `dist/libs/react`'s relative imports stay extensionless
  because `moduleResolution: bundler` defers extension resolution to a bundler — every
  actual consumption path in this repo and in a generated workshop goes through one (Vite,
  webpack, or Vitest's own transform pipeline once inlined), so this never manifests in
  practice, but a hypothetical raw Node `import` of the package with no bundler in front of
  it would still fail on that alone, independent of this ADR's fix. Vue's Vite
  library-mode build bundles into a single file with no unresolved relative specifiers,
  and Angular's ng-packagr FESM bundle is similarly self-contained, so neither carries the
  equivalent exposure. Rewriting React's build to bundle (or to emit resolvable
  extensions) is a larger, separate decision and out of scope here.

**Rejected alternatives:**

- _Leave the accident in place with a note._ Rejected: it means React's generated unit
  tests pass only because the published package is malformed, and a future
  `@nx/js` release that learns to recognize `Preserve` would silently break them with no
  warning — the opposite of the honest-package invariant Angular and Vue already hold.
- _A dual CJS+ESM build._ Rejected as over-scoped: `"module": "preserve"` exists
  specifically to defer format decisions to a bundler; a real CJS build would need actual
  `import`/`export`-to-`require`/`module.exports` transformation, which neither Vue nor
  Angular do either, and no consumer — in or out of this repo — has a working `require()`
  path today to preserve.
- _An `exports` map mirroring Vue's._ Rejected for now: Vue's `exports` map exists to
  disambiguate CSS subpaths behind a single bundled `.mjs` entry. React ships one CSS file
  per component under an already-unambiguous `src/lib/**` layout with no existing
  `exports` field restricting anything; introducing one now, without enumerating every
  subpath the docs app and generated workshops already import bare (for example
  `@atelier-ui/react/styles/tokens.css`), risks breaking those imports for a benefit this
  fix does not need.
