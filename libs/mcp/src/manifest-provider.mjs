// Reads manifests from the shipped snapshot instead of over HTTP. `@storybook/mcp` calls the
// provider with paths relative to the Storybook output root (`./manifests/components.json`, and
// for a `$ref` `./services/core/docgen/<id>.json`); the hosted worker (worker/mcp.ts) answers the
// same calls from its assets binding, so both surfaces serve the same bytes.
import { readFile } from 'node:fs/promises';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SNAPSHOT_ROOT = join(PACKAGE_ROOT, 'snapshot');

/**
 * `@storybook/mcp` resolves `$ref` paths URL-style, so a ref to a file with a non-ASCII name
 * arrives percent-encoded. Over HTTP the server decodes that; a file system provider has to do
 * it itself. Decoding runs BEFORE the containment check, otherwise an encoded `..%2F` traversal
 * would pass the check as a harmless string and only turn into a real traversal afterwards.
 * @param {unknown} _request always undefined over stdio
 * @param {string} manifestPath
 * @param {string} [root] snapshot root, a parameter for tests
 * @returns {Promise<string>}
 */
export async function manifestProvider(
  _request,
  manifestPath,
  root = SNAPSHOT_ROOT,
) {
  let decoded;
  try {
    decoded = decodeURIComponent(manifestPath.replace(/^\.\//, ''));
  } catch {
    throw new Error(
      `Invalid percent-encoding in manifest path "${manifestPath}".`,
    );
  }
  const absolute = join(root, decoded);
  if (absolute !== root && !absolute.startsWith(root + sep)) {
    throw new Error(
      `Manifest path outside the snapshot rejected: "${manifestPath}".`,
    );
  }
  return readFile(absolute, 'utf8');
}

/**
 * The provider the server uses: the snapshot as it is, passed through the active layers'
 * `transformManifest`. With only the base layer it serves the snapshot's bytes unchanged.
 * @param {{ layers: Array<{ transformManifest?: (path: string, text: string) => string }>, root?: string }} options
 */
export function createManifestProvider({ layers, root = SNAPSHOT_ROOT }) {
  return async (request, manifestPath) => {
    let text = await manifestProvider(request, manifestPath, root);
    for (const layer of layers) {
      if (layer.transformManifest)
        text = layer.transformManifest(manifestPath, text);
    }
    return text;
  };
}
