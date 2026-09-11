---
status: accepted
date: 2026-09-10
sources:
  - plan/adr/0121-the-stories-are-the-spec.md (S0 — the step this record executes)
  - .github/workflows/ci.yml (the "Storybook tests — NOT WIRED" block this record removes, and the job that replaces it)
  - libs/{angular,react,vue}/.storybook/main.ts (the `viteFinal` base condition)
  - wrangler.jsonc (the deploy's own `BUILD_STORYBOOK=1`)
  - libs/{angular,react,vue}/vitest.storybook.config.ts and .storybook/vitest.setup.ts (the browser-mode suite)
  - node_modules/@storybook/addon-vitest/dist/vitest-plugin/index.js:2578 (`presets.apply("viteFinal", commonConfig)` — why the build condition reached the test server)
  - tasks/lessons.md, 2026-09-10 entry ("CI" is not a deploy target)
  - tasks/spec-rethink-2026-09-10.md § 1 (the idle-instrument finding)
---

# ADR-0122: CI is not a deploy target, and every story is a test

## Status

Accepted. The Storybook browser-mode suite — every story rendered in Chromium, every
`play` assertion executed, axe run on every story — is wired into CI as its own job and
into `check:all` as `check:stories`; `parameters.a11y.test` is `'error'` in all three
previews; Angular has the `storybook-test` target and a11y wiring it lacked. This is `S0`
of ADR-0121, executed before any spec-shape work because no spec decision depended on it
and it was the largest cheap increase in machine-verified correctness available.

## Context

The suite had been configured in all three libraries since the Storybook 10.6 migration
and ran green locally in about eleven seconds per library — 216 React and 242 Vue checks —
but `.github/workflows/ci.yml` carried it as a comment block headed "NOT WIRED": every run
with `CI` set failed with _Failed to connect to the browser session … within the timeout_
and _Tests no tests_. The comment recorded a careful diagnosis that had ruled out the
browser binary, sandbox flags, file parallelism, the connect timeout, and "any CI branch in
this repo's `.storybook` config". The job was left out "rather than made non-blocking",
which was the right call for a job that asserts nothing; it also meant that for weeks
nothing in CI rendered a story, ran a `play` function, or ran axe.

The 2026-09-10 spec rethink (`tasks/spec-rethink-2026-09-10.md` § 1) named this the
cheapest gain in the repo and put it first. Reproducing it took one afternoon and a
different first question: not _why does the connection time out_ but _what does the page
fetch after it loads_. A twenty-line Playwright probe on the live orchestrator URL showed
three 404s within eighty milliseconds — `/__vitest_browser__/orchestrator-*.js`,
`/__vitest_browser__/utils-*.js`, `/@fs/…/error-catcher.js` — and a `curl` of one of them
returned the cause as prose: _The server is configured with a public base URL of
`/storybook-vue/` — did you mean to visit `/storybook-vue/__vitest_browser__/…`?_

Each `libs/<fw>/.storybook/main.ts` ended with
`if (process.env['CI'] || process.env['BUILD_STORYBOOK']) config.base = '/storybook-<fw>/'`.
That `viteFinal` hook shapes the production build **and** the Vite server
`@storybook/addon-vitest` starts for browser-mode tests
(`presets.apply("viteFinal", commonConfig)`). Under `CI=1` the test server therefore
served everything under `/storybook-<fw>/` while Vitest's orchestrator HTML — served by a
middleware that ignores `base` — loaded its scripts from the root. Page loads, scripts 404,
WebSocket never opens, session times out. The earlier diagnosis had dismissed this branch
because it changes the _build_, and the question being asked was about the _test_.

The `CI` half of the condition was redundant the whole time: `wrangler.jsonc`'s
`build.command` sets `BUILD_STORYBOOK=1` explicitly for each of the three `storybook build`
calls the deploy runs. The CI job's own `nx run-many -t build,build-storybook` output is
never deployed.

## Decision

1. **The hosted base path is an explicit opt-in, never inferred from `CI`.** The condition
   is `if (process.env['BUILD_STORYBOOK'])` in all three `main.ts`, with a comment saying
   why. An environment flag that means "automated environment" may not be used to mean
   "building for the hosted path"; the test runner is also an automated environment.
2. **The suite is a gate.** A `storybook-test` job in `ci.yml` (Playwright Chromium
   installed with deps; `nx affected -t storybook-test --parallel=1` on pull requests,
   `run-many` on main) replaces the comment block, and `check:stories` joins the end of
   `check:all`. `--parallel=1` because the three suites share Vitest's browser port.
3. **Angular gets what React and Vue had:** a `storybook-test` target, the a11y preview
   annotations in its Vitest setup, a project name in its browser config, and the `a11y`
   parameter block in its preview.
4. **`parameters.a11y.test` is `'error'` in all three previews.** Axe violations fail
   the run. Measured before flipping, sequentially under `CI=1`: **Angular 0 failing
   stories, React 28, Vue 36** — nine axe rules, several of them component defects the
   backlog already knew (`select-name` on the native `<select>`, L1;
   `aria-progressbar-name`, L2; `scrollable-region-focusable` on AtlCodeBlock) and
   others new (`aria-required-children` on AtlChat's `role="list"` with non-listitem
   empty-state children, `label` and `empty-table-header` on AtlTable, `label-title-only`
   on error-state inputs, `landmark-unique`, `aria-allowed-attr`). Sixty-four stories is
   too many to fix inside an instrument-wiring step and too many to leave red, so the
   debt is recorded where it lives: `parameters.a11y.config.rules` disabling **only the
   failing rule id** at the smallest scope — the story file's `meta` where the violation
   is inherent to the component, the single story otherwise — each with a comment naming
   the rule, the reason and `tasks/todo.md`. Every other axe rule keeps running on those
   stories. Same shape as ADR-0093's `gap` entries: the gate ships green and every known
   miss nags until fixed. That Angular is clean where React and Vue are not is itself a
   cross-framework finding for the backlog.
5. **The Angular suite had never run.** Its `vitest.storybook.config.ts` lacked the
   `@analogjs/vite-plugin-angular` plugin the `nx test` config carries, so importing
   `@storybook/angular` threw _The injectable 'PlatformLocation' needs to be compiled
   using the JIT compiler_ before any story loaded — all 32 files failed to import.
   Added; the suite then produced 226 passing and **three failing dialog stories**:
   `toBeVisible()` on the `<dialog open>` element. Cause: `atl-dialog.css` fades the
   dialog in from `@starting-style { opacity: 0 }` over `--ui-duration-slow`; `showModal()`
   runs synchronously inside the component's `effect()`, so the `open` attribute is
   present the instant the assertion runs, but jest-dom's visibility check also reads
   `opacity`, and the transition has not left its first frame. A second, same-class
   timing miss sat behind it: `dispatchEvent(new Event('cancel'))` is synchronous, the
   effect that calls `close()` is not. Both fixed in the **story** with `waitFor`, not in
   the component — the component is correct, the assertion asked a synchronous question
   about an asynchronous state.

Alternatives considered:

- **Guard the base on `configType === 'PRODUCTION'`** and keep `CI` in the condition.
  Rejected: it keeps a flag with the wrong meaning and makes local `storybook build`
  output unservable at the root for no reason; the explicit flag already exists and the
  deploy already sets it.
- **Override `base: '/'` in `vitest.storybook.config.ts`.** Rejected: the plugin merges
  Storybook's Vite config over the user's, so the override is fragile, and it treats the
  symptom.
- **Wire the job as non-blocking (`continue-on-error`).** Rejected, as the original comment
  already had: a permanently yellow job asserts nothing and trains people to ignore it.
- **Flip a11y to `'error'` only where it is already green.** Rejected: an uneven gate is a
  gate nobody can reason about; per-story exemptions with reasons keep one rule and make the
  debt visible.

## Consequences

- Every story in all three libraries is now a render test, an interaction test where it
  has a `play`, and an axe test, on every push and every pull request — about 680 checks
  in roughly forty seconds of CI. Before this record, zero of them ran in CI.
- A deliberately broken `play` assertion turns `check:stories` and the CI job red
  (negative-tested in this session, then restored byte-for-byte from a copy).
- `check:all` gains a gate that needs Playwright's Chromium, as `check:geometry` already
  did; ADR-0034's "what a green `check:all` asserts" gains a line by reference, not by
  restating the count here.
- The stories' new load-bearing role (ADR-0121 Consequences) starts today rather than with
  the spec work: a story that stops rendering, or a `play` that stops holding, is now a
  failed build, not a stale demo.
- The redundant `CI` branch is gone from the build path; local `nx build-storybook`
  output is served at `/` unless `BUILD_STORYBOOK=1` is set, which is what the deploy
  does and what a local preview wants.
- Two weeks of "unexplained" were one unread HTTP response. The lesson is recorded in
  `tasks/lessons.md` under this date: when a page loads and then nothing happens, fetch
  what the page fetches before tuning timeouts.
