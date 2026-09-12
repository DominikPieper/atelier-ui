'use strict';

/**
 * Small, dependency-free helpers shared by the local rules in this
 * directory. Deliberately does not import anything from `stylelint/lib/*`
 * beyond the public API (`stylelint.utils.*`, `stylelint.createPlugin`) —
 * those subpaths happen to be resolvable (the package's `exports` map
 * allows `./lib/utils/*`), but they are stylelint's own internals, not part
 * of its documented `PublicApi`, so a rule in this repo doesn't take a
 * dependency on them staying stable across versions.
 */

const path = require('path');

/**
 * Absolute path to the repository root, computed from this file's own
 * location rather than from `process.cwd()` — `tools/stylelint-rules/` sits
 * at the same depth as `tools/scripts/` (two levels under the root), so this
 * resolves correctly regardless of which directory stylelint is invoked
 * from (an Nx target may run with `cwd` set to a project root, not the
 * workspace root).
 */
const REPO_ROOT = path.resolve(__dirname, '../..');

/**
 * `absPath` expressed relative to `REPO_ROOT`, POSIX-separated so an option
 * written as `'docs/src/styles/global.css'` matches on every platform.
 *
 * @param {string} absPath
 */
function toRepoRelative(absPath) {
  return path.relative(REPO_ROOT, absPath).split(path.sep).join('/');
}

/** Is `value` a non-empty string? Used to validate rule options without
 *  depending on stylelint's internal `validateTypes` module (see header). */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

module.exports = { REPO_ROOT, toRepoRelative, isNonEmptyString };
