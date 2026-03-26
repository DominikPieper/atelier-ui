import type { Framework, McpTool } from './-mcp.types';

export const MCP_URLS: Record<Framework, string> = {
  angular: 'https://atelier-ui.netlify.app/storybook-angular/mcp',
  react:   'https://atelier-ui.netlify.app/storybook-react/mcp',
  vue:     'https://atelier-ui.netlify.app/storybook-vue/mcp',
};

// Sensible first-call defaults for known Storybook MCP tools
export const LIVE_DEFAULT_PARAMS: Record<string, Record<string, string>> = {
  'get-documentation':           { component: 'button' },
  'get-storybook-story-instructions': {},
  'list-all-documentation':      {},
  'preview-stories':             { component: 'button' },
  'run-story-tests':             { component: 'button' },
};

let _id = 1;

async function mcpPost(url: string, method: string, params?: unknown): Promise<unknown> {
  const body = JSON.stringify({ jsonrpc: '2.0', id: _id++, method, ...(params ? { params } : {}) });
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json() as { result?: unknown; error?: { message: string } };
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

export async function fetchMcpTools(framework: Framework): Promise<McpTool[]> {
  const result = await mcpPost(MCP_URLS[framework], 'tools/list') as { tools: McpTool[] };
  return result.tools ?? [];
}

export async function invokeMcpTool(
  framework: Framework,
  name: string,
  args: Record<string, string>,
): Promise<unknown> {
  return mcpPost(MCP_URLS[framework], 'tools/call', { name, arguments: args });
}
