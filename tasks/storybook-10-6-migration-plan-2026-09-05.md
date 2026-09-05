# Plan — Storybook 10.6 migration and dependency sweep

**Date:** 2026-09-05 · **Basis:** `tasks/storybook-10-6-spike-2026-09-05.md` (the spike that measured this) · **Prior art:** `tasks/review-state-2026-08-26.md:97` already scoped the framework swap as "Effort: M, own PR, own ADR" · **Working mode:** main branch, one commit per wave, every wave gated green before the next starts.

## Decisions taken up front

**`@angular/animations` comes back, and the stub goes.** It is a hard peer of `@storybook/angular-vite`, so the only way to avoid it is not to migrate. The `viteFinal` stub for `@angular/platform-browser/animations` becomes not just redundant but actively wrong once the real package resolves — a stub would shadow `provideAnimations` and friends. Measured in the spike: the build succeeds without it. Removed, and the reasoning moves from the `viteFinal` comment into the ADR.

**TypeScript stays on 6.0.x.** `@angular/compiler-cli@22.1.5` declares `typescript: ">=6.0 <6.1"`. TS 7.0.2 exists and is not available to this repo. Not a judgement call — a peer constraint.

**`npm outdated` lied about two packages.** It reported `@angular-devkit/build-angular` 22.0.7 → 21.2.23 and `@angular/platform-browser-dynamic` 22.0.7 → 20.0.7, which read as downgrades. `npm view <pkg> dist-tags.latest` says **22.1.7** and **22.1.5**. They are ordinary minor bumps and go in with the rest of Angular 22.1.x. Trust `dist-tags`, not the `outdated` table.

**Majors are not part of this work.** Each is its own risk and its own decision — listed at the bottom, none touched here.

---

## Wave 1 — Storybook 10.6 and the framework swap

The goal. Everything else follows from it.

- [ ] Bump to `10.6.0`: `storybook`, `@storybook/angular`, `@storybook/addon-docs`, `@storybook/addon-a11y`, `@storybook/addon-vitest`, `@storybook/react-vite`, `@storybook/vue3-vite`, `eslint-plugin-storybook`
- [ ] `@storybook/addon-mcp` `0.7.0` → `10.6.0` and `@storybook/mcp` `0.8.0` → `10.6.0` (their versioning now tracks Storybook's; the old peer ranges exclude 10.6)
- [ ] Add `@storybook/angular-vite@10.6.0`; remove `@analogjs/storybook-angular` (it is referenced only from `package.json` — verified by grep; `@analogjs/vite-plugin-angular` and `@analogjs/vitest-angular` stay, `libs/angular/src/test-setup.ts` needs them)
- [ ] `libs/angular/.storybook/main.ts`: `framework` → `@storybook/angular-vite`, add `experimentalDocgenServer: true`, delete the `atelier:stub-deprecated-angular-animations` plugin and its comment block
- [ ] `libs/vue/.storybook/main.ts`: add `experimentalDocgenServer: true` (not defaulted until Storybook 11)
- [ ] Check whether `@angular-devkit/build-angular` and `@angular/platform-browser-dynamic` actually leave the tree. `review-state-2026-08-26.md:97` predicts both do; `npm ls` currently shows build-angular pulled by `@nx/angular` and `@analogjs/vite-plugin-angular` as well, and platform-browser-dynamic is a **direct** dependency. Verify rather than assume, and adjust `package.json` to match reality.

**Gate:** `npm run check:all` exit 0 · `nx build-storybook angular|react|vue` exit 0 each · `dist/storybook/{angular,vue}/manifests/components.json` present with `meta.docgen` of `angular-component-meta` / `vue-component-meta` · `nx test angular|react|vue` exit 0 · a live MCP `docs-show` on 4400 and 4402 returning framework-native shapes (Angular `[(checked)]`, Vue `v-model:checked`).

## Wave 2 — the MCP tool rename

Only `get-storybook-story-instructions` survives 10.6.

| 10.5.10 | 10.6.0 |
|---|---|
| `list-all-documentation` | `docs-list` |
| `get-documentation` | `docs-show` |
| `get-documentation-for-story` | `docs-show-story` |
| `preview-stories` | `stories-preview` |
| `run-story-tests` | `test-run` |
| `get-changed-stories` | `stories-changed` |
| `get-stories-by-component` | `stories-find-by-component` |

- [ ] Sweep the 32 files that name the old tools. Not a blind find-and-replace: several are historical records (`tasks/review-*`, `tasks/schulung-review-*`, `tasks/angular-storybook-vitest-triage-*`) where the old name is what was true at the time and must stay. Change instructions, leave records.
- [ ] `libs/create-workspace/src/generators/preset/preset.ts` — **ships to npm**. Stale names here would scaffold broken workspaces. `preset.spec.ts` asserts on them, so both move together.
- [ ] `docs/public/.well-known/agent-skills/storybook-{angular,react,vue}/SKILL.md` — published surface, three files.
- [ ] `AGENTS.md`, `README.md`, `talk/storybook-mcp-talk.md`, and the docs pages.

**Gate:** `npm run check:all` exit 0 · `nx build docs` exit 0 · zero hits for the seven old names outside `tasks/` historical records and `plan/adr/0083`.

## Wave 3 — retire ADR-0083

- [ ] Test the **hosted** path first: does the Cloudflare Worker serve the new sharded `$ref` manifest shape unchanged? Both spike probes were against local dev servers. This is the one unknown that can still block the wave.
- [ ] Remove the worker's React-manifest substitution for the Angular and Vue endpoints
- [ ] New ADR superseding ADR-0083; flip ADR-0083 to `status: superseded`, add the row to `plan/adr/README.md`. The new ADR records the framework swap, the animations reversal, and the rename — one decision, three consequences.

**Gate:** `npm run check:adr-refs` exit 0 · hosted endpoints answer Angular/Vue-shaped for a known component.

## Wave 4 — the safe dependency sweep

Minor and patch only, one batch, one commit.

- [ ] Angular `22.0.7` → `22.1.x` (core, common, compiler, compiler-cli, forms, router, platform-browser, cli, build, devkit/core, devkit/schematics, schematics/angular, language-service, aria, cdk, plus build-angular 22.1.7 and platform-browser-dynamic 22.1.5 if they survive Wave 1)
- [ ] Nx `23.1.1` → `23.2.0` (all `@nx/*`, `nx`, `create-nx-workspace`)
- [ ] `@analogjs/vite-plugin-angular` + `@analogjs/vitest-angular` `2.6.3` → `2.7.1`
- [ ] vite `8.1.5` → `8.2.2`, `@vitejs/plugin-react` `6.1.1`, `@swc/core` `1.16.2`, `@swc-node/register` `1.12.1`
- [ ] `@playwright/test` `1.63.0`, jest `30.5.1` trio, prettier `3.9.6`, `typescript-eslint` + `@typescript-eslint/utils` `8.69.0`, `angular-eslint` `22.2.0`
- [ ] vue `3.5.42` + `@vue/compiler-sfc` `3.5.42`, zone.js `0.16.3`, postcss `8.5.28`, autoprefixer `10.5.5`
- [ ] docs-side: `astro-expressive-code` `0.44.2`, `astro-og-canvas` `0.13.1`, `@astrojs/sitemap` `3.7.4`, `@iconify-json/lucide`, `@material-symbols/svg-400` `0.47.1`, `canvaskit-wasm` `0.42.0`
- [ ] `verdaccio` `6.10.2`, `tsx` `4.23.13`, `ts-node` `10.9.2`, `@testing-library/react` `16.3.3`, `@types/react-dom` `19.2.7`

**Gate:** `npm run check:all` exit 0 · all three `nx test` exit 0 · `nx build docs` exit 0 · `nx build-storybook` for all three exit 0.

## Wave 5 — the curriculum catches up

Subtraction, mostly.

- [ ] `docs/src/pages/schulung.astro`: the M3 bullet added this morning (Angular/Vue translating a React-shaped reply via the spec) becomes obsolete — the hosted endpoints now answer natively. Remove or reduce to a note about pre-10.6 versions.
- [ ] `AGENTS.md`: the Storybook MCP section loses its central asymmetry ("the reply is React-shaped throughout") and the ADR-0083 substitution paragraph.
- [ ] Day 1 Block 03's `experimentalReactComponentMeta` line — revisit next to its now-existing Angular and Vue siblings.
- [ ] `tasks/schulung-review-2026-09-05.md`: mark M3 closed-by-upstream rather than closed-by-edit.

**Gate:** `npm run check:all` exit 0 · `nx build docs` exit 0.

---

## Deferred majors — not in this work

Each needs its own spike and its own call:

| Package | now | latest | note |
|---|---|---|---|
| `typescript` | 6.0.3 | 7.0.2 | **blocked** — `@angular/compiler-cli` peer is `>=6.0 <6.1` |
| `eslint` + `@eslint/js` | 9.39.5 | 10.x | flat-config churn; `typescript-eslint` and `angular-eslint` must support it |
| `vitest` + `@vitest/*` | 4.1.11 | 5.0.0 | test runner for all three libs; `@analogjs/vitest-angular` compatibility unknown |
| `astro` | 6.4.8 | 7.3.1 | docs app; drags `@astrojs/mdx` 8, `@astrojs/react` 6, `astro-llms-md` 3, `astro-pagefind` 2 |
| `jsdom` | 27.4.0 | 30.0.1 | three majors; a11y snapshots render in it, so `check:a11y-parity` is exposed |
| `@types/node` | 22.20.1 | 26.4.1 | should follow the runtime floor (Node ≥ 22.12), not run ahead of it |
| `@testing-library/jest-dom` | 6.9.1 | 7.0.1 | matcher behaviour changes reach every test |
| `vite-plugin-dts` | 4.5.4 | 5.1.0 | library build output |
| `jsonc-eslint-parser` | 2.4.2 | 3.3.0 | small, but rides with the eslint 10 decision |
