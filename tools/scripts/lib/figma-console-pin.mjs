/**
 * Resolve the exact `figma-console-mcp@<version>` npm spec to spawn via npx.
 *
 * Read from .mcp.json's own `mcpServers['figma-console'].args` — the ONE place
 * this repo pins the server version (ADR-0110: pin the server the skills
 * hardcode). `@latest` is deliberately not a fallback when the entry is
 * missing: a silent fallback would recreate the drift, just quietly.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
export const MCP_CONFIG_PATH = resolve(ROOT, '.mcp.json');

export function resolveFigmaConsolePackageSpec() {
  let config;
  try {
    config = JSON.parse(readFileSync(MCP_CONFIG_PATH, 'utf8'));
  } catch (err) {
    throw new Error(
      `could not read/parse ${MCP_CONFIG_PATH}: ${err?.message ?? err}`,
    );
  }
  const args = config?.mcpServers?.['figma-console']?.args;
  const spec = Array.isArray(args)
    ? args.find((a) => /^figma-console-mcp@/.test(a))
    : undefined;
  if (!spec) {
    throw new Error(
      `${MCP_CONFIG_PATH} has no mcpServers['figma-console'].args entry matching ` +
        `/^figma-console-mcp@/ — refusing to fall back to @latest (ADR-0110 pins this server).`,
    );
  }
  return spec;
}
