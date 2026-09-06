# Bug report — `@storybook/mcp@10.6.0` cannot start on Cloudflare Workers

**For:** the Storybook maintainers · **Written:** 2026-09-06 · **Reporter context:** Atelier, an open-source teaching repo that hosts three Storybook MCP endpoints (Angular, React, Vue) on a Cloudflare Worker.

Everything below was measured in this repo, not inferred. Where something is inference, it says so.

---

## Summary

`@storybook/mcp@10.6.0`'s published bundle evaluates `fileURLToPath(import.meta.url)` at module load. `import.meta.url` is `undefined` in workerd, so the call throws and **the Worker never starts** — not one failing request, no requests at all, on every endpoint.

The three values it computes (`__filename`, `__dirname`, `require`) are never read anywhere in the bundle. The crash comes from computing values nothing consumes.

`@storybook/mcp@0.8.0` has no such preamble and runs fine on the same setup — that version is what our production has been serving on.

This matters because Storybook documents the Cloudflare Worker as a way to host the MCP server, and 10.6.0 cannot boot there.

---

## Environment

| | |
|---|---|
| `@storybook/mcp` | `10.6.0` |
| `storybook` and framework packages | `10.6.0` |
| `wrangler` | `4.129.0` |
| `compatibility_date` | `2026-04-30` |
| `compatibility_flags` | `["nodejs_compat"]` |
| Node (local) | `v26.3.0` |
| Bundler | wrangler's own esbuild pass over `worker/index.ts` |

---

## What happens

`npx wrangler dev`:

```
✘ [ERROR] service core:user:atelier-ui: Uncaught TypeError: The "path" argument must be
  of type string or an instance of URL. Received undefined
    at null.<anonymous> (node-internal:internal_url:155:15) in fileURLToPath
    at null.<anonymous> (index.js:7972:49)
✘ [ERROR] The Workers runtime failed to start.
```

## Where it comes from

`node_modules/@storybook/mcp/dist/index.js`, lines 1-7 — the first thing in the file:

```js
import CJS_COMPAT_NODE_URL_jzv0nukkq2 from 'node:url';
import CJS_COMPAT_NODE_PATH_jzv0nukkq2 from 'node:path';
import CJS_COMPAT_NODE_MODULE_jzv0nukkq2 from "node:module";

var __filename = CJS_COMPAT_NODE_URL_jzv0nukkq2.fileURLToPath(import.meta.url);
var __dirname  = CJS_COMPAT_NODE_PATH_jzv0nukkq2.dirname(__filename);
var require    = CJS_COMPAT_NODE_MODULE_jzv0nukkq2.createRequire(import.meta.url);
```

Workers modules have no script URL, so `import.meta.url` is `undefined` there. I confirmed that directly with a minimal worker that does nothing but report it: it prints `{"url":"undefined"}`. `fileURLToPath(undefined)` then throws exactly the error above.

## Minimal reproduction

A worker whose entire source is the import — no application code, no `manifestProvider`, no handler:

```ts
import { createStorybookMcpHandler } from '@storybook/mcp';
export default { fetch: () => new Response('ok') };
```

`npx wrangler dev` on that reproduces the identical crash.

## The computed values are unused

This is what makes the crash gratuitous rather than a genuine platform incompatibility. Grepping the whole 1926-line bundle:

- `__filename` — referenced once, at its own definition on line 5.
- `__dirname` — referenced once, at its own definition on line 6.
- `require` — referenced once, at its own definition on line 7. `require(` appears nowhere in the file.

So nothing downstream needs a filesystem path or a CJS `require`. This looks like an unconditional CJS-interop preamble emitted by the bundler configuration, not a deliberate runtime dependency.

## Not present in 0.8.0

`@storybook/mcp@0.8.0`'s `dist/index.js` contains no `fileURLToPath(import.meta.url)` and no `createRequire(import.meta.url)` anywhere. Our production deployment runs 0.8.0 on this exact Worker setup and serves MCP traffic normally — so this is a regression introduced somewhere between 0.8.0 and 10.6.0, most plausibly with the bundler change that accompanied the move onto `tmcp` (0.8.0 already depends on `tmcp`, so the framework move itself is not the trigger — the packaging is). That last clause is inference; the rest of this section is measured.

---

## Impact

- Any Cloudflare Worker importing `@storybook/mcp@10.6.0` fails to start. There is no partial degradation and no per-request error to catch — the runtime refuses to boot the script.
- There is no compatibility flag that makes `import.meta.url` defined in workerd, so this cannot be worked around in Worker configuration alone.
- Staying on 0.8.0 is not a neutral fallback for 10.6 users: 0.8.0 has **zero** references to `apiDescription`, the field 10.6 frameworks pre-render prop tables into (10.6.0 has seven). On a 10.6-shaped manifest, 0.8.0 serves correct framework-native story code and descriptions but **no prop tables**, and under the pre-10.6 tool names. Measured against Angular and Vue manifests in this repo.

## Our workaround

An esbuild `define` in `wrangler.jsonc`, substituting the expression with a harmless literal:

```jsonc
"define": {
  "import.meta.url": "\"file:///atelier-ui-worker.js\""
}
```

This is safe here only because the values are provably unread. It is a bundle-wide textual substitution, so it is not something we would want to keep: if any future dependency reads `import.meta.url` for a real purpose, it silently receives a fake path instead of failing loudly.

## Suggested fix

Emit the CJS-interop preamble only when something in the bundle actually uses it, or guard it — e.g. derive `__filename` lazily, or fall back when `import.meta.url` is falsy:

```js
var __filename = import.meta.url ? fileURLToPath(import.meta.url) : '';
```

Either removes the crash without changing behaviour on Node, since nothing reads the values.

## Happy to help

We have the reproduction standing and can test a canary against three framework endpoints (Angular, React, Vue) on a real Worker deployment, including the sharded `$ref` manifest path (`../services/core/docgen/<id>.json#/components/<id>`) that 10.6 introduced. Ping us and we will run it.

---

## Appendix — a second, smaller observation

Not a bug, and not blocking us, but it cost us a debugging round and may be worth a doc line.

`manifestProvider` receives paths rooted at the Storybook output root, not bare filenames: `./manifests/components.json` and `./manifests/docs.json` for the two top-level manifests, and `./services/core/docgen/<id>.json` for each `$ref` that `fetchRefValue` resolves through the same provider.

Our provider had been written against 10.4/10.5 behaviour and called `basename(path)` before fetching from a hardcoded `manifests/` directory. That worked by accident for the two top-level paths — `basename` plus the hardcoded prefix happens to reconstruct them — and broke for every shard once 10.6 started emitting them, because `manifests/` contains only `components.html`, `components.json` and `docs.json`.

The fix on our side was to resolve the provider's path against the Storybook root instead of flattening it. If the documented contract for `manifestProvider` stated that its `path` argument is root-relative and may point outside `manifests/`, implementers upgrading from 10.5 would not have to discover that from a 404.
