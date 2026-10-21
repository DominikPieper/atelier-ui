// Lockstep check: the snapshot in this package describes exactly one version of
// @atelier-ui/angular. When the consumer has another one installed the server warns, in the
// `instructions` and on stderr, and keeps running. A server that refuses to start is invisible to
// the agent; a visible warning can be acted on.
//
// `checkVersion` is a pure function so it needs no fixtures; resolving the installed version
// touches the file system and lives in `resolveInstalledVersion`.
import { createRequire } from 'node:module';
import { join } from 'node:path';

export const LIBRARY = '@atelier-ui/angular';

/**
 * @param {string} ownVersion version of this package (`package.json#version`)
 * @param {string | null} installedVersion installed @atelier-ui/angular, or null when it cannot be resolved
 * @returns {{ instructionsNote: string | null, stderrNote: string | null }}
 */
export function checkVersion(ownVersion, installedVersion) {
  if (installedVersion === null) {
    return {
      instructionsNote:
        `Note: "${LIBRARY}" is not installed in this project. ` +
        `This snapshot describes version ${ownVersion}.`,
      stderrNote: null,
    };
  }
  if (installedVersion === ownVersion) {
    return { instructionsNote: null, stderrNote: null };
  }
  const note =
    `Warning: this snapshot belongs to version ${ownVersion} of "${LIBRARY}", ` +
    `but version ${installedVersion} is installed. Documented inputs and outputs may differ.`;
  return { instructionsNote: note, stderrNote: `[atelier-mcp] ${note}` };
}

/**
 * Resolves the installed library version from the consumer's working directory, not from where
 * this package lives: `createRequire` starts the lookup at a path inside `cwd` (the file need not
 * exist), so it finds the consumer's `node_modules`.
 * @param {string} [cwd]
 * @returns {string | null}
 */
export function resolveInstalledVersion(cwd = process.cwd()) {
  try {
    const require = createRequire(join(cwd, 'noop.js'));
    return require(`${LIBRARY}/package.json`).version;
  } catch {
    return null;
  }
}
