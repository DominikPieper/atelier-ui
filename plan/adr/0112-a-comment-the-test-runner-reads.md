---
status: accepted
date: 2026-09-08
sources:
  - vitest.config.mjs
  - libs/{react,angular,vue}/vitest.storybook.config.ts
  - libs/{react,angular,vue}/vite.config.mts
  - node_modules/@storybook/addon-vitest/dist/node/vitest.js (VitestManager.startVitest, 10.6.0)
  - node_modules/@storybook/addon-vitest/dist/vitest-plugin/index.js (storybookTest(), the `storybook:workspace-name-override` plugin, 10.6.0)
  - node_modules/@storybook/addon-vitest/dist/_node-chunks/vitest.config.4.template-4ST5CPM2.js (the addon's own scaffolding template)
---

# ADR-0112: A comment the test runner reads

## Status

Accepted.

## Context

The Storybook MCP `test-run` tool (`@storybook/addon-vitest`'s `storybook/test`
runtime, wired through `@storybook/addon-mcp`) failed on all three frameworks:
`Error: Failed to start Vitest`, with the real reason only in Storybook's own
stdout — `No projects matched the filter
"storybook:/…/libs/react/.storybook"`.

Reproduced live against a running `nx storybook react`/`angular`/`vue` over
MCP (`initialize` → `notifications/initialized` → `tools/call test-run`), then
instrumented `VitestManager.startVitest()` (dist, not committed, reverted
after) to print its own computed root. Confirmed: `vitestWorkspaceConfig` was
`undefined` and it fell back to `libs/react` as the Vitest root — the
directory of `libs/react/vite.config.mts`, a single unnamed project with no
`projects:` list, so the `storybook:<configDir>` filter matched nothing.

The reason traces to `startVitest()`'s own discovery algorithm, read from
source: starting at the `.storybook` directory's parent, it walks upward
(bounded by the Nx workspace root) checking each ancestor for a file named
`vitest.workspace.*`, `vitest.config.*`, or `vite.config.*`. The **first
existing file matching one of those names**, at each directory, is read and
checked for the literal substring `"storybookTest"` or
`"@storybook/addon-vitest"` in its own source text; the first directory whose
file passes that check becomes the Vitest workspace root. This is exactly the
shape the addon's own scaffolding templates produce (verified in
`vitest.config.4.template-4ST5CPM2.js`): a single project's `vitest.config.ts`
imports `storybookTest` and calls it directly, so the check passes on the very
first directory, with no walk-up needed.

This repo's shape is different by design: each framework keeps its
storybook-specific Vitest config in a separately-named file,
`libs/<fw>/vitest.storybook.config.ts`, precisely so `@nx/vitest`'s plugin
(`vitestConfigGlob = '**/{vite,vitest}.config.{js,ts,mjs,mts,cjs,cts}'`) does
not also infer a second, colliding `test` target from it — that file name
never matches the glob. The root `vitest.config.mjs` lists all per-framework
project files (including, until now, only react/angular — vue's config
existed but was registered nowhere) as **path strings**, without importing
`storybookTest` itself. Both conditions defeat the addon's discovery: the
walk-up finds `libs/<fw>/vite.config.mts` first (matches the filename
pattern, fails the content check), and even once it reaches the repo root, the
root file itself fails the content check too — so `vitestWorkspaceConfig`
never resolves, for any of the three frameworks. Angular's missing `test.name`
field is not the cause: `storybookTest()` installs its own
`storybook:workspace-name-override` plugin that overwrites `test.name` on any
project it's attached to whenever `VITEST_STORYBOOK=true` (set once, by
Storybook's own server process, before any config file loads) — so the
explicit names on react/vue are already redundant for this path, and deleting
Angular's would not have been the fix either, matching what the reproduction
showed.

## Decision

Add vue's two config files to the root `projects:` array, and add a comment
to `vitest.config.mjs` that documents this discovery mechanism — a comment
whose necessary side effect is that its text also contains the literal
substring `@storybook/addon-vitest`, satisfying the walk-up's content check on
the first directory it reaches (the repo root, since `libs/<fw>/vite.config.mts`
still fails the check and is skipped). No other file changes.

Alternatives considered:

- **Rename `vitest.storybook.config.ts` → `vitest.config.ts` per library.**
  This would satisfy the discovery check at the *library* directory (no
  walk-up needed) since that file already imports `storybookTest` for real.
  Rejected: it also matches `@nx/vitest`'s `vitestConfigGlob`, which would
  make Nx infer a second `test` target from the same directory that already
  has one (from `vite.config.mts`) — an untested collision risk against a
  working, gate-verified `nx test <lib>` path, for no smaller a diff.
- **Inline each project as `{ extends: true, plugins: [storybookTest(...)] }`
  in the root config**, matching the addon's own scaffolding template
  verbatim. Rejected: it would require duplicating each framework's plugin
  list, browser config, and setup files into the root file, or restructuring
  the per-library files to export something the root can import — a larger,
  riskier diff than one comment, for a problem the comment already fixes.
- **A dead `import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'`**
  instead of a comment. Rejected: an unused import fails `nx lint`, and would
  misrepresent the file as calling the plugin when it does not.

## Consequences

- `test-run` now returns real Vitest results for all three frameworks;
  verified live (not just "no error"): React 1/1, Angular 1/1, Vue 1/1,
  passing against a real story each.
- The comment is load-bearing in a way that is easy to miss: it is prose, not
  code, so a future edit could delete it as decoration during an unrelated
  cleanup and silently reintroduce this exact failure with no gate to catch
  it (`check:all` doesn't start Storybook or call `test-run`). The comment
  says this explicitly for that reason.
- This is scoped to the addon's own `startVitest()` discovery path (the
  MCP/Storybook-UI "Testing" panel). The ordinary `nx test <lib>` / `npx
  vitest run --config vitest.storybook.config.ts` paths were already
  unaffected (verified: `nx test react/angular/vue` pass 450/601/338 tests
  respectively, before and after this change) since those invoke Vitest with
  an explicit config or root and never go through this walk-up at all.
- If a future Storybook release changes or removes this content-sniffing
  heuristic, this ADR's Context is what should be checked against the new
  behavior before assuming the comment is still necessary.

**Corrected 2026-09-08.** The second Consequence above says the deletion risk has "no gate
to catch it". That was true when written and is no longer. `check:vitest-discovery`
(`tools/scripts/check-vitest-discovery.js`, in the `check:all` chain after
`check:adr-refs`) asserts that `vitest.config.mjs` still carries one of the two sniff
literals, and that every `libs/*/vitest.storybook.config.ts` found on disk is registered
in the root `projects:` array — the framework list is read from the filesystem, so a
fourth adapter cannot slip through. Both failure modes were exercised in both directions
before the gate was accepted. What the Consequence says about the *upstream* risk still
stands exactly as written: the gate is a static text check, so it proves the literal is
present, never that the addon still reads it. A heuristic change upstream would leave this
gate green and `test-run` broken.
