/**
 * A stand-in for the `figma-console-mcp` stdio server, just big enough for
 * `figma-snapshot-contracts`: it speaks MCP over stdio, keeps a list of
 * "connected" Figma files (FAKE_FIGMA_STATE, a JSON file path) and logs every
 * tool call to FAKE_FIGMA_LOG (one JSON line per call).
 *
 * It models the pinned server's multi-file behaviour (figma-console-mcp 1.40.0,
 * dist/local.js and dist/core/multi-file-tools.js):
 *   - `figma_execute` runs in the ACTIVE file only;
 *   - `figma_execute_across_files` runs in the files named by `fileKeys`,
 *     without touching the active file;
 *   - `figma_list_open_files` lists the connected files.
 * The plugin code is not evaluated: the fake recognises the two snippets the
 * script sends (`figma.fileKey` and `getNodeByIdAsync('<id>')`).
 */
import { appendFileSync, readFileSync } from 'node:fs';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const state = JSON.parse(readFileSync(process.env.FAKE_FIGMA_STATE, 'utf8'));
// state: { files: [{ fileKey, fileName, masters: { '<nodeId>': master } }], active: '<fileKey>' }

const log = (entry) =>
  appendFileSync(process.env.FAKE_FIGMA_LOG, JSON.stringify(entry) + '\n');
const text = (value) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
});

function runIn(file, code) {
  if (code.includes('figma.fileKey')) {
    return { fileKey: file.fileKey, fileName: file.fileName };
  }
  const m = /getNodeByIdAsync\('([^']+)'\)/.exec(code);
  if (m) return file.masters[m[1]] ?? null;
  throw new Error('fake figma: unrecognised plugin code');
}

const server = new Server(
  { name: 'fake-figma-console', version: '1.40.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    'figma_get_status',
    'figma_list_open_files',
    'figma_execute',
    'figma_execute_across_files',
  ].map((name) => ({
    name,
    inputSchema: { type: 'object', additionalProperties: true },
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  log({ name, args });
  const active = state.files.find((f) => f.fileKey === state.active);
  switch (name) {
    case 'figma_get_status':
      return text({ connected: state.files.length > 0 });
    case 'figma_list_open_files':
      return text({
        activeFileKey: state.active,
        files: state.files.map((f) => ({
          fileName: f.fileName,
          fileKey: f.fileKey,
          isActive: f.fileKey === state.active,
        })),
        totalFiles: state.files.length,
      });
    case 'figma_execute':
      return text({ success: true, result: runIn(active, args.code) });
    case 'figma_execute_across_files': {
      const wanted = args.fileKeys ?? [];
      const results = {};
      for (const file of state.files.filter((f) =>
        wanted.includes(f.fileKey),
      )) {
        results[file.fileKey] = {
          fileName: file.fileName,
          success: true,
          result: runIn(file, args.code),
        };
      }
      return text({
        results,
        totalTargeted: Object.keys(results).length,
        missingFileKeys: wanted.filter((k) => !results[k]),
      });
    }
    default:
      return { ...text({ error: `unknown tool ${name}` }), isError: true };
  }
});

await server.connect(new StdioServerTransport());
