import { createStorybookMcpHandler } from "@storybook/mcp";
import { basename } from "node:path";

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
      const file = basename(path);
      // Fetch the manifest through the static assets binding, NEVER via a
      // plain fetch() of the public https://atelier.pieper.io URL: this worker
      // is deployed with `run_worker_first`, so a subrequest to its own zone
      // re-enters the same worker and Cloudflare kills it as a same-zone loop
      // (error 522/523) — which made every MCP tool call fail while the
      // manifests themselves were served fine to external clients. The
      // binding reads the deployed assets directly; only the pathname of the
      // Request matters, the host is ignored.
      const fetchAsset = (from: Storybook) =>
        assets.fetch(new Request(`${SITE}/storybook-${from}/manifests/${file}`));
      let response = await fetchAsset(sb);
      // Storybook 10.4 only emits components.json for React (the addon-mcp /
      // TS Language Server docgen path); Angular/Vue static builds ship
      // docs.json but no components.json. An empty-components fallback is NOT
      // an option: @storybook/mcp (0.8.0, and still 10.6.0-beta.0) routes
      // every tool through getManifests, which throws on a components manifest
      // with zero components — a docs-only endpoint would fail every call.
      // Instead, serve the React manifest as the cross-framework API
      // reference: the prop/variant contract (libs/spec) is identical across
      // the three frameworks and drift-gated, which is exactly the fallback
      // CLAUDE.md already prescribes to agents manually.
      if (response.status === 404 && sb !== "react") {
        response = await fetchAsset("react");
      }
      if (response.ok) {
        return response.text();
      }
      throw new Error(`Failed to fetch manifest ${file}: ${response.status} ${response.statusText}`);
    },
  });

const cache: Partial<Record<Storybook, HandlerPromise>> = {};

export function mcpHandler(sb: Storybook, assets: AssetsFetcher): HandlerPromise {
  // The assets binding is stable for the lifetime of the isolate, so caching
  // the handler created from the first request's binding is safe.
  return (cache[sb] ??= make(sb, assets));
}
