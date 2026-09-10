# Spike S1 — docgen and story args without a Storybook build, 2026-09-10

_ADR-0121 step S1: the feasibility gate for the "stories are the spec" check. Question:
can a script produce a component's prop contract (names, types, defaults, JSDoc) and each
story's resolved `args` — the two derived inputs the check joins with the Figma snapshot —
without running `storybook build`, in seconds, with output identical to what the built
manifest carries? Throwaway scripts in the session scratchpad; this document is the record._

## Verdict

**Feasible, for all three frameworks, with exact fidelity.** The check can read both
inputs in one process per framework in about 5–6 seconds for the whole roster.

| Framework | Docgen, cold (one component) | Docgen, warm (second component, same process) | Fidelity vs. built shard |
|---|---|---|---|
| Angular | 3.7 s (3.1 s building the TS program) | 83 ms | identical — AtlButton and AtlDialog |
| Vue | 3.5 s (2.6 s building the checker) | 93 ms | identical |
| React | 0.56 s | 40 ms | identical |

Batch estimate per framework: one program build plus 28 warm extractions ≈ 3 s + 28 × 90 ms
≈ **5.5 s**, not 29 × 3 s. Story `args` for a whole file resolve in **≈ 85 ms**.

## 1. Docgen: call the workers Storybook itself uses

Storybook 10.6 extracts docgen in a worker; each framework ships the worker module and it
runs fine in-process:

- **Angular** — `@storybook/angular-vite/internal/docgen-worker` exports
  `createDocgenProvider(options)`. It needs `{ propsTable: 'api' }` (dereferenced without a
  guard; `'api'` is what this repo's build resolves to). Underneath: `ComponentMetaManager`
  from `storybook/internal/component-meta` with a TypeScript program from the nearest
  `tsconfig.json` above the **component** file (`libs/angular/tsconfig.json` → its
  references), independent of `cwd`.
- **Vue** — `@storybook/vue3/internal/docgen-worker` exports `createDocgenProvider()` (no
  options). Underneath: `vue-component-meta`'s checker via `createVueComponentMetaChecker`,
  same tsconfig discovery.
- **React** — **do not use `@storybook/react/internal/docgen-worker`.** It exists, but it
  drives `react-component-meta`, a TS-program engine that is active only under
  `features.experimentalDocgenServer`, which this repo sets for Angular and Vue and **not**
  for React. The manifest React actually ships (`reactDocgen` key) comes from
  `@storybook/react/dist/preset.js`'s `getComponentDocgen` path: `react-docgen`'s `parse()`
  with `FindExportedDefinitionsResolver` and the default handlers. Mirror that.

Protocol (from `node_modules/storybook/dist/chunk-zQu03vfn.d.ts` ≈ 8118–8150):
`createDocgenProvider(options)` returns a middleware `(nextDocgen) => provider`; a provider
is `(input) => Promise<payload | undefined>`; `input = { entry }`, a story-index entry. The
load-bearing fields are `type: 'story'`, `importPath` (the story file, resolved against
`cwd`) and `id`; `title` is a naming fallback. The entry shape that worked:

```js
{ type: 'story', subtype: 'story', id: `${toId(title)}--docgen`, name: 'Docgen',
  title, importPath: './libs/<fw>/src/lib/button/atl-button.stories.ts', tags: [] }
```

Pass `async () => undefined` as `nextDocgen`. The worker resolves the story file's
`meta.component` to the component file itself — so the story file is the entry point, which
is exactly the grain the check wants. Compound components resolve to the right export
(AtlDialog, not AtlDialogHeader) in all three frameworks.

Payload shapes are the shards' shapes: Angular `argTypes` (keep `table.category` `inputs`
and `outputs`; internal `Signal<…>` members sit under `properties`), Vue `vueComponentMeta`
(`props[]`, `events[]`, typed `slots[]`), React `reactDocgen.props`. A normaliser to
`{ name, type, default, description, required }` is about forty lines.

Caveats measured: no warnings on any run; `cwd` may be the repo root or the library
directory; no root `tsconfig.json` is needed (none was created); a script outside the repo
must resolve the packages through `createRequire(<repo>/package.json)` because bare
specifiers do not resolve from the scratchpad.

## 2. Story args: `storybook/internal/csf-tools`, statically

```js
const { loadCsf, createStoryArgsResolver } = await import('storybook/internal/csf-tools');
const csf = loadCsf(source, { makeTitle: (t) => t, fileName }).parse();
const resolver = createStoryArgsResolver(csf);
resolver.resolve('Danger').args   // { variant: StringLiteral 'danger', size: 'md', … }
```

`loadCsf(...).parse()` gives `_meta.title`, `_meta.component`, the story list, and per
story `__stats` (`play`, `render`, `tags`, …). `createStoryArgsResolver` merges meta args
under story args and reports `unresolved` source text it could not read. Measured on
`libs/vue/src/lib/button/atl-button.stories.ts`: 13 stories, all args resolved to literals,
nothing unresolved, 85 ms.

One rule the check must carry: a **render-only story** (`AllVariants`, `AllSizes`,
`Playground` — `__stats.render: true`, no own `args`) inherits the meta's args and is
therefore **not** a variant claim. Coverage counts stories with their own `args`; render
stories are demos.

## 3. What this settles for S3

- The check needs no Storybook build and no running server: two library imports, one
  process per framework, ≈ 6 s for 29 components. Well inside the complexity budget in
  `tasks/spec-workflow-plan-2026-09-10.md` § 4.
- Both derived inputs come from the story file as the entry point: docgen via the worker
  (story → `meta.component` → component), args via csf-tools. The story file is the unit,
  as ADR-0121 assumes.
- Fidelity is exact, so the check and the hosted MCP describe the same contract; there is
  no second docgen dialect to reconcile.
- The fallback branch in the plan (`storybook build --test`, local `docs-show`) is not
  needed.
- React must be wired through `react-docgen` directly, not the worker export, until this
  repo turns `experimentalDocgenServer` on for React as well — a separate decision, not
  S3's.

## Verified vs. assumed

**Verified:** timings above (wall clock via `time` plus in-script `performance.now()`,
repo root, cold and warm); fidelity by diffing normalised `(name, type, default)` against
`dist/storybook/{angular,vue}/services/core/docgen/components-inputs-atlbutton.json` and
React's inline `components.json` for AtlButton, and by hand for AtlDialog; `cwd`
independence by running from `libs/angular/`; the csf-tools resolution on the Vue button
story with values printed.

**Assumed:** that warm-extraction cost stays near 90 ms for the heavier components (Table,
Chat, Select) — measured on Button and Dialog only; that `createStoryArgsResolver` resolves
args that spread from other modules when given `references` (the cookbook stories do this;
not tested).

**Weakest point:** the spike scripts are throwaway and not in the repo; S3 re-implements
the recipe above under `tools/scripts/`. If the worker protocol changes in a Storybook
minor, the recipe changes with it — the entry shape is an internal contract, not a public
API. `check-manifests.js` already guards the built shards; the S3 check should assert the
same three docgen names on its own output so a silent engine swap is caught.
