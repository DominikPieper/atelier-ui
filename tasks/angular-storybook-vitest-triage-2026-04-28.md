# Angular storybook-vitest triage — 2026-04-28

Triage the cookbook P6 follow-up: Angular `play()` functions don't run
under `@storybook/addon-vitest`, so the 7 cookbook plays only execute in
the Storybook UI's Interactions panel. React + Vue both run cleanly.

## Status

Still broken. Failure mode is **different** from the cookbook P6 plan's
original capture (`_PlatformLocation` JIT compile failure). Whatever
upstream change happened between then and 2026-04-28 fixed the JIT
issue but exposed a framework-wiring gap.

Current symptom: every story (cookbook, table, tabs, breadcrumbs, stepper,
toast, …) fails with:

```
TypeError: context.renderToCanvas is not a function
  at Object.mount (storybook/dist/_browser-chunks/chunk-SZQXB3JV.js:789:61)
  at runStory (storybook/dist/_browser-chunks/chunk-SZQXB3JV.js:1321:43)
  at sb-vitest/deps/@storybook_addon-vitest_internal_test-utils.js:131:184
```

32 test files / 36 plays — all fail. `cookbook.stories.ts` reports
**0 tests collected** rather than failing — the cookbook plays don't
even register, suggesting the file loader bails out earlier than the
framework-annotation lookup.

## What we tried

1. **Fix wrong framework import in `vitest.setup.ts`** — was
   `@storybook/angular` (the official package), should be
   `@analogjs/storybook-angular` (the framework `.storybook/main.ts`
   actually uses). Kept this fix because it's correct independent of the
   runtime issue. Did not move the runtime needle.
2. **Add `import '@angular/compiler'` at top of setup** — original P6
   plan note flagged a JIT compile bug. Did not help; reverted because
   the JIT error no longer surfaces.
3. **Clear the storybook bundle cache** (`rm -rf
   node_modules/.cache/storybook`). No effect.

## What we know

- `@analogjs/storybook-angular`'s `setProjectAnnotations()` *does* return
  an object with `renderToCanvas` defined (verified by
  `node -e "import('@analogjs/storybook-angular').then(m => m.setProjectAnnotations([{}]))"`).
- `@storybook/addon-vitest` 10.3+ logs "Found a setup file with
  setProjectAnnotations. Skipping automatic provisioning of preview
  annotations to avoid conflicts" on every run — same warning React +
  Vue see, where their plays run fine. So the setup-file detection works
  for Angular too.
- Yet `renderToCanvas` doesn't reach the test context. The setup's
  call returns a value the addon-vitest browser harness never reads.

The most likely root cause: addon-vitest's browser-side test harness
expects a *specific transport* for the project annotations (probably a
window-global or a side-effect import path) that
`@analogjs/storybook-angular` doesn't implement. The official
`@storybook/react`, `@storybook/vue3` etc. packages do.

## Suggested next steps (not done in this triage)

1. **File an upstream issue at `analogjs/analog`** with the
   reproduction (this repo + `nx run angular:storybook-test`). Title:
   *"setProjectAnnotations from @analogjs/storybook-angular doesn't
   wire `renderToCanvas` for `@storybook/addon-vitest`'s browser
   runner."*
2. **Check whether analogjs has a parallel
   `@analogjs/storybook-angular/test-utils` or
   `setProjectAnnotations.test` export** — Storybook's official
   frameworks ship a separate compose entrypoint for vitest mode. If
   analogjs doesn't, that's the gap.
3. **Pin React+Vue today** — both work via `nx run-many -t
   storybook-test -p react,vue` (216 + 242 = 458 plays). Add a CI job
   that runs that two-project subset; leave Angular off the
   `storybook-test` matrix until upstream fix.
4. **Don't add a `storybook-test` target to `libs/angular/project.json`**
   yet — running it just produces 36 red lines and a CI failure with no
   actionable signal.

## Verification

- `cd libs/angular && npx vitest run --config vitest.storybook.config.ts`
  → 32 fail / 36 play() failures, all with `context.renderToCanvas is
  not a function`. Reproduces consistently.
- React (216 / 216) and Vue (242 / 242) green on the same harness via
  `npx nx run-many -t storybook-test -p react,vue`.
