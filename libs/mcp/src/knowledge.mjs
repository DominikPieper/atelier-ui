// Reads a knowledge file of the shipped snapshot (see scripts/build-knowledge.mjs). Cached per
// path: the snapshot cannot change under a running server.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cache = new Map();

/**
 * @param {string} root snapshot root
 * @param {'components' | 'tokens' | 'patterns'} name
 */
export function loadKnowledge(root, name) {
  const file = join(root, 'knowledge', `${name}.json`);
  if (!cache.has(file)) {
    try {
      cache.set(file, JSON.parse(readFileSync(file, 'utf8')));
    } catch (err) {
      throw new Error(
        `Knowledge file "${file}" cannot be read (${err.message}). Rebuild the snapshot: npm run build -w libs/mcp.`,
      );
    }
  }
  return cache.get(file);
}
