---
status: accepted
date: 2026-10-08
sources:
  - libs/vue/vite.config.mts (vite-plugin-dts afterDiagnostic)
  - tools/scripts/check-types.mjs (header)
  - libs/vue/src/lib/breadcrumbs/atl-breadcrumbs.vue (the TS7053 that shipped)
---

# ADR-0160: A type error in library source fails the build, in every framework

## Status

Accepted. `nx build vue` now exits non-zero on any TypeScript diagnostic from the library's
sources, `.vue` files included, the way the Angular and React builds already did. Recorded
at decision time.

## Context

On 2026-10-07 commit 3b850592 introduced `slots['default']` on an untyped `useSlots()` in
`atl-breadcrumbs.vue`. The Vue build printed `error TS7053` and exited 0, so `check:all`,
CI and the publish workflow were green over it, and it shipped in `@atelier-ui/vue@0.3.11`
(fixed in 0.3.12). It surfaced on 2026-10-08 only because a human read a failed publish log
for an unrelated reason (`assert-unpublished`).

`check:types` was written for what the build does not check: it runs `tsc --noEmit` on each
framework's `tsconfig.spec.json`. Its header said "the build target compiles the library
entry points", which assumed every build typechecks library sources. Measured on
2026-10-08 with a deliberate `const x: number = 'a'` in one component per framework:

| Framework | Builder                  | Exit on a library type error       |
| --------- | ------------------------ | ---------------------------------- |
| Angular   | ng-packagr               | 1                                  |
| React     | `@nx/js:tsc`             | 1                                  |
| Vue       | Vite + `vite-plugin-dts` | **0** (error printed, build green) |

Vue is also the one framework where `check:types` cannot help. Its spec tsconfig lists
`src/**/*.vue`, but plain `tsc` does not read single-file components, so the dts pass in
the build is the only place `.vue` sources are typechecked at all.

## Decision

`vite-plugin-dts` gets an `afterDiagnostic` hook that throws when the diagnostics list is
non-empty. The build itself fails, so every chain that builds (`check:all`, CI, publish)
stops on it, and no new gate is needed. `check-types.mjs`'s header now states what each
build checks and that Vue SFCs are covered only by this hook.

Rejected:

- **`vue-tsc --noEmit` as a step in `check-types.mjs`.** It would catch it too, and the
  publish workflow runs `check:all` as its release gate, so it would stop a release. But it
  is a second type pass over sources the dts plugin already checks, and it leaves
  `nx build vue` itself green over a broken `.d.ts`. The failure belongs where that output
  is produced.
- **Grepping build output for `error TS` in a gate.** It parses log text whose format the
  plugin owns. A thrown error from the plugin's own hook does not depend on log format.

## Consequences

- Negative-tested: with the hook, a type error in a `.vue` `<script setup>` and in a plain
  `.ts` file under `libs/vue/src` each make `nx build vue` exit 1. The clean tree exits 0.
- The hook throws on any diagnostic, including a warning-level one. There are none today.
  If one appears, it has to be fixed or the hook narrowed, deliberately.
- Weakest point: nothing pins the negative test. A `vite-plugin-dts` major that renamed or
  dropped `afterDiagnostic` would silently restore the old behaviour, and the Angular and
  React facts above are a one-time measurement, not a gate.
