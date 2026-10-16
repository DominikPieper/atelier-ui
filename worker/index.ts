import { mcpHandler, type AssetsFetcher, type Storybook } from './mcp';
import { negotiateMarkdown } from './markdown-negotiation';
import { checkBasicAuth } from './basic-auth';

interface Env {
  ASSETS: AssetsFetcher;
  SITE_PASSWORD?: string;
}

const MCP_ROUTE = /^\/storybook-(react|angular|vue)\/mcp$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    const mcpMatch = pathname.match(MCP_ROUTE);
    if (mcpMatch) {
      const handler = await mcpHandler(mcpMatch[1] as Storybook, env.ASSETS);
      return handler(request);
    }

    // After the MCP route on purpose: MCP clients cannot answer a Basic
    // challenge, and that endpoint stays public. Everything else is gated.
    const denied = await checkBasicAuth(request, env.SITE_PASSWORD);
    if (denied) return denied;

    return negotiateMarkdown(request, env.ASSETS);
  },
};
