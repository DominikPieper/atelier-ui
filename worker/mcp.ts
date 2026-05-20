import { createStorybookMcpHandler } from "@storybook/mcp";
import { basename } from "node:path";

const SITE = "https://atelier.pieper.io";

export type Storybook = "react" | "angular" | "vue";

type HandlerPromise = ReturnType<typeof createStorybookMcpHandler>;

const EMPTY_COMPONENTS_MANIFEST = JSON.stringify({ v: 0, components: {} });
const EMPTY_DOCS_MANIFEST = JSON.stringify({ v: 0, docs: {} });

const emptyManifestFor = (file: string): string | null => {
  if (file === "components.json") return EMPTY_COMPONENTS_MANIFEST;
  if (file === "docs.json") return EMPTY_DOCS_MANIFEST;
  return null;
};

const make = (sb: Storybook): HandlerPromise =>
  createStorybookMcpHandler({
    manifestProvider: async (_request, path) => {
      const file = basename(path);
      const response = await fetch(`${SITE}/storybook-${sb}/manifests/${file}`);
      if (response.ok) {
        return response.text();
      }
      // Storybook 10.4 only emits components.json for React (the addon-mcp /
      // TS Language Server docgen path). Angular/Vue static builds ship docs.json
      // but no components.json. Fall back to an empty manifest so the MCP can
      // still serve whatever the other manifest provides.
      if (response.status === 404) {
        const fallback = emptyManifestFor(file);
        if (fallback) return fallback;
      }
      throw new Error(`Failed to fetch manifest ${file}: ${response.status} ${response.statusText}`);
    },
  });

const cache: Partial<Record<Storybook, HandlerPromise>> = {};

export function mcpHandler(sb: Storybook): HandlerPromise {
  return (cache[sb] ??= make(sb));
}
