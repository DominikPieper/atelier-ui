import { createStorybookMcpHandler } from "@storybook/mcp";

const SITE = "https://atelier.pieper.io";

export type Storybook = "react" | "angular" | "vue";

/** Shape of the Workers static assets binding (wrangler.jsonc `assets.binding`). */
export interface AssetsFetcher {
  fetch: (request: Request) => Promise<Response>;
}

type HandlerPromise = ReturnType<typeof createStorybookMcpHandler>;

const make = (sb: Storybook, assets: AssetsFetcher): HandlerPromise =>
  createStorybookMcpHandler({
    manifestProvider: async (_request, path) => {
      // `path` arrives already rooted at this framework's Storybook output
      // directory, never as a bare filename: for the two top-level manifests
      // it is `./manifests/components.json` / `./manifests/docs.json`
      // (COMPONENT_MANIFEST_PATH / DOCS_MANIFEST_PATH, `@storybook/mcp`
      // dist/index.js:1196/1238-1239); for a `$ref` inside one of those — our
      // manifests carry `docgen.$ref: "../services/core/docgen/<id>.json#/..."`
      // and `stories.$ref` the same way — `fetchRefValue` (dist/index.js:1299)
      // resolves the ref through this same provider via `parseManifestRef`,
      // which strips the `#/...` fragment and resolves the file part relative
      // to the manifest directory, handing this provider
      // `./services/core/docgen/<id>.json`: already rooted at the Storybook
      // output root, exactly like the top-level paths. A prior version of this
      // function called `basename(path)` and always fetched
      // `manifests/<basename>`, which flattens every shard reference to
      // `<id>.json` and looks for it in `manifests/` — a directory that only
      // ever holds `components.html`, `components.json` and `docs.json`.
      // Every shard 404'd. Resolve against the Storybook root instead.
      const url = new URL(path.replace(/^\.\//, ""), `${SITE}/storybook-${sb}/`);
      // Fetch the manifest through the static assets binding, NEVER via a
      // plain fetch() of the public https://atelier.pieper.io URL: this worker
      // is deployed with `run_worker_first`, so a subrequest to its own zone
      // re-enters the same worker and Cloudflare kills it as a same-zone loop
      // (error 522/523) — which made every MCP tool call fail while the
      // manifests themselves were served fine to external clients. The
      // binding reads the deployed assets directly; only the pathname of the
      // Request matters, the host is ignored.
      const response = await assets.fetch(new Request(url));
      // No React-manifest fallback here any more. Storybook 10.4/10.5 emitted
      // `components.json` for React only, so on a 404 this provider used to
      // retry the same path under `storybook-react` and serve React's
      // manifest as a cross-framework API reference — the spec contract
      // (libs/spec) is identical across adapters, and CLAUDE.md separately
      // told agents to do the same substitution by hand (ADR-0083). Storybook
      // 10.6's first-party `@storybook/angular-vite` / `@storybook/vue3-vite`
      // frameworks with `experimentalDocgenServer` now emit real,
      // framework-native `components.json` for all three adapters (superseded
      // by plan/adr/0097-the-manifest-the-framework-can-emit-now.md), so the
      // fallback's precondition is gone. It is removed rather than kept "just
      // in case": a silent fallback to another framework's manifest is
      // exactly the failure mode this migration removes — if a framework's
      // manifest ever regresses (an empty `components` object, or the
      // `id`/`name`-only "decoy" shape `@analogjs/storybook-angular` produced
      // without real docgen), its endpoint must fail loudly, not quietly
      // answer with a different framework's shape. `npm run check:manifests`
      // guards that artifact offline so the regression cannot ship unnoticed.
      if (response.ok) {
        return response.text();
      }
      throw new Error(`Failed to fetch manifest ${path}: ${response.status} ${response.statusText}`);
    },
  });

const cache: Partial<Record<Storybook, HandlerPromise>> = {};

export function mcpHandler(sb: Storybook, assets: AssetsFetcher): HandlerPromise {
  // The assets binding is stable for the lifetime of the isolate, so caching
  // the handler created from the first request's binding is safe.
  return (cache[sb] ??= make(sb, assets));
}
