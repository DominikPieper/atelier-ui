import { createStorybookMcpHandler } from '@storybook/mcp';
import { basename } from 'node:path';

const STORYBOOK_URL = 'https://atelier-ui.netlify.app/storybook-vue';

let cachedHandlerPromise: ReturnType<typeof createStorybookMcpHandler> | undefined;

export default async function handler(request: Request): Promise<Response> {
  if (!cachedHandlerPromise) {
    cachedHandlerPromise = createStorybookMcpHandler({
      manifestProvider: async (_request, path) => {
        const fileName = basename(path);
        const response = await fetch(`${STORYBOOK_URL}/manifests/${fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch manifest ${fileName}: ${response.status} ${response.statusText}`);
        }
        return response.text();
      },
    });
  }

  const mcpHandler = await cachedHandlerPromise;
  return mcpHandler(request);
}
