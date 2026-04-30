import { createStorybookMcpHandler } from "@storybook/mcp";
import { basename } from "node:path";

const SITE = "https://atelier.pieper.io";

export type Storybook = "react" | "angular" | "vue";

type HandlerPromise = ReturnType<typeof createStorybookMcpHandler>;

const make = (sb: Storybook): HandlerPromise =>
  createStorybookMcpHandler({
    manifestProvider: async (_request, path) => {
      const file = basename(path);
      const response = await fetch(`${SITE}/storybook-${sb}/manifests/${file}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch manifest ${file}: ${response.status} ${response.statusText}`);
      }
      return response.text();
    },
  });

const cache: Partial<Record<Storybook, HandlerPromise>> = {};

export function mcpHandler(sb: Storybook): HandlerPromise {
  return (cache[sb] ??= make(sb));
}
