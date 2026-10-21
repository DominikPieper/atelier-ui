// The seam for knowledge layers (ADR-0177: each layer is measured by an ablation run, so each
// must be switchable). A layer is a plain object:
//
//   { id, summary,
//     instructions?: string[],                          sections appended to the server instructions
//     register?: (server) => Promise<void> | void }     adds tools to the tmcp server
//
// Which layers run is decided by one string: the env var ATELIER_MCP_LAYERS, a comma list of ids.
// Unset or empty means every layer in LAYERS; a list means exactly those. The base layer `api`
// cannot be switched off (without it there is no server, and "no server" is the eval's own
// `without` variant). An unknown id is an error at start, never a silent no-op, because a typo
// would otherwise turn an ablation run into a measurement of the wrong thing.
//
// Only L0 exists. A new layer is one object added to LAYERS plus its own test; nothing else in
// the server changes.
import {
  STORYBOOK_MCP_INSTRUCTIONS,
  addGetDocumentationTool,
  addGetStoryDocumentationTool,
  addListAllDocumentationTool,
} from '@storybook/mcp';

import { API_RULES } from './instructions.mjs';

export const LAYERS_ENV = 'ATELIER_MCP_LAYERS';
export const BASE_LAYER = 'api';

/** L0: the Storybook docs toolset, answered from the snapshot. */
const apiLayer = {
  id: BASE_LAYER,
  summary:
    'docs-list, docs-show, docs-show-story over the Angular manifest snapshot (L0)',
  instructions: [API_RULES, STORYBOOK_MCP_INSTRUCTIONS],
  async register(server) {
    await addListAllDocumentationTool(server);
    await addGetDocumentationTool(server);
    await addGetStoryDocumentationTool(server);
  },
};

export const LAYERS = [apiLayer];

/**
 * @param {string | undefined} spec value of ATELIER_MCP_LAYERS
 * @param {Array<{ id: string }>} [registry] a parameter for tests
 */
export function resolveLayers(spec, registry = LAYERS) {
  const requested = (spec ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  if (requested.length === 0) return registry;

  const known = registry.map((layer) => layer.id);
  const unknown = requested.filter((id) => !known.includes(id));
  if (unknown.length > 0) {
    throw new Error(
      `${LAYERS_ENV}: unknown layer(s) ${unknown.map((id) => `"${id}"`).join(', ')}. Known: ${known.join(', ')}.`,
    );
  }
  if (!requested.includes(BASE_LAYER)) {
    throw new Error(
      `${LAYERS_ENV}: the base layer "${BASE_LAYER}" cannot be switched off.`,
    );
  }
  // Registry order, not the order given: the same set always yields the same server.
  return registry.filter((layer) => requested.includes(layer.id));
}
