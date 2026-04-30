import { mcpHandler, type Storybook } from "./mcp";
import { negotiateMarkdown } from "./markdown-negotiation";

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const MCP_ROUTE = /^\/storybook-(react|angular|vue)\/mcp$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    const mcpMatch = pathname.match(MCP_ROUTE);
    if (mcpMatch) {
      const handler = await mcpHandler(mcpMatch[1] as Storybook);
      return handler(request);
    }

    return negotiateMarkdown(request, () => env.ASSETS.fetch(request));
  },
};
