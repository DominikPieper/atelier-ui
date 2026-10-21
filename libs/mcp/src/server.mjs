// MCP server for consumers of @atelier-ui/angular. Builds the layers' tools on a tmcp server with
// the stdio transport and reads only from the shipped snapshot: no network, no port. stdout
// belongs exclusively to the JSON-RPC protocol; every diagnostic goes to stderr.
import { createRequire } from 'node:module';

import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import { McpServer } from 'tmcp';

import { buildInstructions } from './instructions.mjs';
import { LAYERS_ENV, resolveLayers } from './layers.mjs';
import { SNAPSHOT_ROOT, manifestProvider } from './manifest-provider.mjs';
import { checkVersion, resolveInstalledVersion } from './version-check.mjs';

// createRequire rather than a JSON import attribute: it works on every Node the engines field allows.
const pkg = createRequire(import.meta.url)('../package.json');

export const VERSION_CHECK_ENV = 'ATELIER_MCP_VERSION_CHECK';

/**
 * Builds the server with the active layers registered, without starting a transport. Returns the
 * server and the layers that are on.
 * @param {{ cwd?: string, env?: Record<string, string | undefined> }} [options] `cwd`: where the
 *   version check looks for the installed library; `env`: a parameter for tests.
 */
export async function createServer({
  cwd = process.cwd(),
  env = process.env,
} = {}) {
  const layers = resolveLayers(env[LAYERS_ENV]);

  // `off` is for the evaluation lab, where the server is started from a temp directory that has
  // no node_modules and the "not installed" note would be a confound, not information.
  let versionNote = null;
  if (env[VERSION_CHECK_ENV] !== 'off') {
    const { instructionsNote, stderrNote } = checkVersion(
      pkg.version,
      resolveInstalledVersion(cwd),
    );
    versionNote = instructionsNote;
    if (stderrNote) console.error(stderrNote);
  }

  const server = new McpServer(
    {
      name: pkg.name,
      version: pkg.version,
      description:
        'Documented inputs and outputs of the Atelier UI Angular library, from a manifest snapshot, no network.',
    },
    {
      adapter: new ValibotJsonSchemaAdapter(),
      capabilities: { tools: { listChanged: true } },
      instructions: buildInstructions({ versionNote, layers }),
    },
  ).withContext();

  for (const layer of layers) await layer.register?.(server);
  return { server, layers };
}

/** Builds the server and attaches it to stdio. */
export async function startServer() {
  const { server, layers } = await createServer();
  const transport = new StdioTransport(server);
  transport.listen({ manifestProvider });
  console.error(
    `[atelier-mcp] ready (stdio), layers: ${layers.map((layer) => layer.id).join(', ')}, snapshot: ${SNAPSHOT_ROOT}`,
  );
  return transport;
}
