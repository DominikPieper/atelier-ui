---
status: accepted
date: 2026-09-05
supersedes: plan/adr/0083-the-manifest-the-framework-cannot-emit.md
sources:
  - tasks/storybook-10-6-spike-2026-09-05.md (the measurement that triggered this)
  - tasks/storybook-10-6-migration-plan-2026-09-05.md (Waves 1-3, the work this records)
  - plan/adr/0083-the-manifest-the-framework-cannot-emit.md (superseded by this record)
  - worker/mcp.ts (the manifestProvider fix and the retired fallback)
  - tools/scripts/check-manifests.js (the new gate)
  - libs/angular/.storybook/main.ts (the framework swap and its feature flags)
  - libs/vue/.storybook/main.ts (experimentalDocgenServer)
  - libs/react/.storybook/main.ts (unchanged framework, for contrast)
---

# ADR-0097: The manifest the framework can emit now

## Status

Accepted. Supersedes ADR-0083 in full. Each hosted Storybook MCP endpoint
(`/storybook-{angular,react,vue}/mcp`) now serves its own framework's
`components.json`; the worker's React-manifest substitution is deleted, not
shrunk.

## Context

ADR-0083 recorded why the hosted Angular and Vue endpoints served **React's**
`components.json` on a 404: Storybook 10.4/10.5 only emitted a real
`components` manifest entry for React (`@storybook/react`'s
`experimental_manifests` preset contributed it; the Angular and Vue framework
packages contributed nothing), and `@storybook/mcp` throws on an empty
components manifest inside `fetchManifests` — a path every tool routes
through, including docs-only lookups. The substitution was legitimate because
the spec contract (`libs/spec/src/index.ts`) is identical across the three
adapters and drift-gated, but the reply was React-**shaped** throughout: JSX
snippets, React story paths, `children`, `on*Change`.

Storybook 10.6.0 (stable 2026-09-02) changes the precondition ADR-0083 rested
on. It ships `@storybook/angular-vite` and `@storybook/vue3-vite` with
`experimentalDocgenServer`, a background docgen server that can emit a real
`components.json` for those frameworks too — measured directly against both
local dev servers before any code changed
(`tasks/storybook-10-6-spike-2026-09-05.md`): Angular's `docs-show` for
`AtlToggle` returns `<atl-toggle [(checked)]="enabled">` with split
Inputs/Outputs; Vue's returns `v-model:checked`, `update:checked`, typed
slots. Neither carries React's `children` or `onCheckedChange`. This is the
exact inverse of ADR-0083's behaviour.

Getting there cost more than a version bump:

- **Angular could not reach it through the incumbent framework package.**
  `@analogjs/storybook-angular` with `experimentalDocgenServer: true` still
  exits 0, but swallows `Invariant failed: experimental_manifests must supply
  components.meta.docgen` and writes a **decoy** manifest — 32 entries
  carrying only `id`/`name`, no props, `meta.docgen` absent. An empty
  manifest that looks full, and nothing was checking for the difference. Only
  the first-party `@storybook/angular-vite@10.6.0` produces real docgen
  (`angular-component-meta`); its peers (Angular ≥21 <23, vite ≥8, TS ≥5.9)
  were already satisfied in this repo.
- **`@angular/animations` returns as a real dependency.** It is a hard peer of
  `@storybook/angular-vite` and was previously, deliberately, never installed
  — `libs/angular/.storybook/main.ts` carried a `viteFinal` stub for
  `@angular/platform-browser/animations` specifically to stand in for it.
  Under the new framework the package resolves for real, so the stub would
  now shadow live exports instead of missing ones; it is removed rather than
  kept alongside a real `@angular/animations`.
- **Every `@storybook/mcp` tool was renamed** except
  `get-storybook-story-instructions` (`list-all-documentation` →
  `docs-list`, `get-documentation` → `docs-show`, and five more). 32 files in
  this repo named the old tools, including a generator that ships to npm
  (`libs/create-workspace/src/generators/preset/preset.ts`) and three
  published skill files.
- **The hosted worker could not simply stop 404-ing into React.**
  `@storybook/mcp@10.6.0` resolves manifest `$ref`s (our Angular/Vue
  manifests carry `docgen.$ref: "../services/core/docgen/<id>.json#/..."`
  for the docgen-server shards) through the *same* `manifestProvider` the
  top-level manifest uses (`fetchRefValue`, `dist/index.js:1299`, read
  directly from `node_modules/@storybook/mcp/dist/index.js`). The provider in
  `worker/mcp.ts` did `basename(path)` and always fetched
  `manifests/<basename>` — flattening every shard reference to `<id>.json`
  and requesting it from a directory that only ever held `components.html`,
  `components.json`, `docs.json`. Every shard 404'd; the ADR-0083 fallback
  then 404'd again on the same wrong filename, and the provider threw. Traced
  entirely from source (the `@storybook/mcp` dist bundle) and from the
  deploy config (`wrangler.jsonc:5-6` builds each Storybook straight into
  `dist/docs/storybook-<fw>`, and the same file's `assets.directory` serves
  `dist/docs`, so the shards are genuinely deployed) before any fix was
  written — this was a push blocker: Waves 1 and 2 (framework swap, tool
  rename) were already committed and would have broken the hosted Angular and
  Vue endpoints outright, not merely degraded them, if deployed as they
  stood.
- **Nothing gated the artefact this whole migration rests on.** A
  `components.json` with zero entries, a missing `meta.docgen`, or the
  Analog "decoy" shape would all have shipped with every one of the 34
  existing `check:all` gates green — none of them reads a Storybook build's
  manifest output at all.

## Decision

One decision, several consequences, landed as one migration in three waves
(`tasks/storybook-10-6-migration-plan-2026-09-05.md`):

1. **Bump to Storybook 10.6.0** across `storybook` and its first-party
   packages, and swap Angular's Storybook framework from
   `@analogjs/storybook-angular` to `@storybook/angular-vite@10.6.0`. Vue
   adds `experimentalDocgenServer: true` explicitly (not yet the default
   there; Angular's copy of the same flag is verified redundant — the build
   is identical with it removed — and kept only as insurance against a future
   default flip). React is unchanged; it already defaulted its docgen path.
2. **`@angular/animations` comes back**, and the `viteFinal` stub that
   shadowed it is deleted. Accepted as a direct, understood consequence of
   the framework swap, not absorbed silently.
3. **Every renamed `@storybook/mcp` tool is swept** across the 32 files that
   named the old ones, except deliberately-preserved historical records
   (`tasks/review-*`, `tasks/schulung-review-*`,
   `tasks/angular-storybook-vitest-triage-*`, this ADR's own predecessor).
4. **`worker/mcp.ts`'s `manifestProvider` resolves paths against the
   framework's Storybook root instead of flattening them with `basename()`.**
   Every path the provider receives — the two top-level manifest paths and
   every `$ref`-resolved shard path — arrives already rooted at that
   framework's Storybook output directory; the fix is `new URL(path,
   base)`, not a rewrite of what gets requested.
5. **The React-manifest fallback is deleted, not shrunk.** Once Angular and
   Vue emit their own real `components.json`, a fallback that silently
   serves a different framework's shape is no longer a stopgap for a
   framework limitation — it would be a silent failure mode of its own if a
   manifest ever regressed. Removed outright; the comment in its place
   records why it existed and why its precondition is gone.
6. **A new gate, `check:manifests`, closes the hole ADR-0083's context
   named but did not act on.** It builds all three Storybooks
   (`nx run-many -t build-storybook -p angular,react,vue`, chained into the
   npm script the same way `check:docs-layout` chains `nx build docs`) and
   asserts, per framework: `manifests/components.json` exists, has at least
   one component, has a non-empty `meta.docgen`, and that no entry is the
   `id`/`name`-only decoy shape or carries a `docgen.$ref` that fails to
   resolve to a real file and JSON pointer on disk. Verified against all five
   failure modes by injecting each into the built (gitignored) `dist/`
   output and confirming the gate fails with the matching tag, then
   restoring and confirming it returns to green.

**Alternatives rejected** (mostly inherited from the spike; recorded here
because ADR-0083 no longer describes current behaviour):

- **Keep `@analogjs/storybook-angular` and accept a docs-only Angular
  endpoint.** Rejected: the decoy manifest is not docs-only, it is a
  components manifest that *looks* populated (32 entries) while carrying no
  usable data — worse than an honest absence, and indistinguishable from a
  real manifest without a gate reading inside it.
- **Keep the React fallback as a safety net "just in case" a framework's
  manifest regresses.** Rejected: that is precisely the failure mode this
  migration removes. A regression must surface as a loud failure on the
  affected framework's own endpoint (and, offline, as a `check:manifests`
  failure), not a quiet answer in the wrong framework's shape.
- **Only fix the 404 path (basename → root-relative resolution) without
  removing the fallback.** Rejected: with the fix alone, Angular and Vue's
  own manifests resolve correctly and the fallback simply stops firing —
  correct, but leaves dead code whose comment would describe a precondition
  that no longer holds, exactly the kind of stale rationale ADR-0083 itself
  had to correct once already.

### The second defect: a bundle that cannot boot on Workers

Fixing the path resolution was necessary and not sufficient. Verifying it
against a locally-run worker surfaced a second, independent failure that no
amount of reading `worker/mcp.ts` would have found.

`@storybook/mcp@10.6.0`'s published bundle opens with a CJS-interop preamble
(`dist/index.js:5-7`):

```js
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var require = createRequire(import.meta.url);
```

`import.meta.url` is `undefined` in workerd — Workers modules have no script
URL — so `fileURLToPath(undefined)` throws at module load and the worker never
starts. Not one failing request: no requests at all, on all three endpoints,
React included. A throwaway worker importing nothing but
`createStorybookMcpHandler` reproduces it. `0.8.0`, which production runs
today, has no such preamble, which is why the hosted endpoints work right now.

**Decision: define `import.meta.url` to a harmless literal in the worker bundle**
(`wrangler.jsonc` `define`, forwarded to esbuild). Grepping the whole 1926-line
bundle shows `__filename`, `__dirname` and `require` are each referenced exactly
once — at their own definition — and never read. The crash comes from computing
values nothing consumes, so any value ends it.

Rejected:

- **Pinning `@storybook/mcp` to `0.8.0`.** It boots, and its `parseManifestRef`
  is behaviourally identical, so the path fix works there too. But `0.8.0` has
  no knowledge of `apiDescription`, the 10.6 field the framework pre-renders the
  prop table into — measured: zero references, against seven in 10.6.0. Angular
  and Vue would get native story code and descriptions but **no prop table**,
  under the old tool names, contradicting the rename this same migration just
  made everywhere. Half the prize and a split-brain surface.
- **Patching `node_modules`.** Does not survive a fresh install; CI would
  diverge from local.
- **Aliasing `node:url` and `node:module` to tolerant shims.** Broader surface —
  it changes the semantics of two node-compat modules to fix one wrong argument
  — and it does not map cleanly onto "delete this when upstream stops computing
  the values."

**The accepted cost:** the `define` is a bundle-wide textual substitution, not
scoped to `@storybook/mcp`. Today nothing else reads `import.meta.url` — our own
worker sources and every runtime dependency (`tmcp`, `@tmcp/transport-http`,
`@tmcp/adapter-valibot`, `valibot`) were checked. If a future dependency does
read it for a real purpose, it will silently receive a fake path instead of
failing loudly, turning an obvious crash into a quiet wrong value. The mechanism
is safe by present fact, not by construction. It is marked for deletion in
`wrangler.jsonc`, and this is worth reporting upstream: Storybook documents the
Cloudflare Worker as a way to host its MCP server, and its own bundle cannot
boot there.

## Consequences

- The hosted Angular and Vue endpoints answer natively: two-way bindings and
  split Inputs/Outputs for Angular, `v-model`/`update:*` events and typed
  slots for Vue — no more `children`, `onCheckedChange`, or
  `@atelier-ui/react` imports on non-React endpoints. React is unchanged.
- `CLAUDE.md`'s "the reply is React-shaped throughout" framing and the
  `schulung.astro` M3 curriculum bullet it fed are now stale; simplifying
  them is scoped as Wave 5, deliberately sequenced after this record so the
  training material never describes a workaround upstream has removed.
- `@angular/animations` is a real, resolved dependency again. Any future code
  that assumed its absence (there was none to find) would need revisiting;
  none was found.
- `check:manifests` is now part of `check:all`, so a components-manifest
  regression in any framework — including a future Storybook default flip
  that silently drops `experimentalDocgenServer`, or a docgen provider that
  starts writing the decoy shape again — fails the gate chain before it fails
  the hosted MCP surface.
- If Storybook ever changes the manifest `$ref` shape again (a different
  fragment syntax, a different root), both `worker/mcp.ts`'s
  `manifestProvider` and `check-manifests.js`'s pointer resolution
  (`parseRef`/`resolvePointer`) need the same update — they encode the same
  assumption about the shape from two different angles (serving it, and
  verifying it), and nothing currently keeps them in sync beyond this ADR
  naming both.
- The hosted surface now depends on a `define` in `wrangler.jsonc` that exists
  only to work around an upstream packaging bug. It is the one piece of this
  migration that is a workaround rather than a fix, and the only piece whose
  correctness rests on a dependency graph staying as it is today.
