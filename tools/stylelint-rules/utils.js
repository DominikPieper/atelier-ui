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

/**
 * A `componentRoot`-shaped option, normalized exactly the way a linted
 * file's own path already is by `toRepoRelative` above: resolved to an
 * absolute path, then re-expressed relative to `REPO_ROOT` with POSIX
 * separators. Without this, a rule comparing an option value directly
 * against `toRepoRelative(inputFile)` (a plain `===`/`startsWith` string
 * compare) silently disagrees on a leading `./`, a trailing slash, or an
 * absolute path — all three name the same directory as the plain
 * `libs/<fw>/src/lib` form every config in this repo happens to use today,
 * but nothing enforced that shape until this normalization existed
 * (2026-09-12 stylelint review, claim 4: reproduced — `componentRoot:
 * 'scratch-claim4/'` (trailing slash), `'./scratch-claim4'` (leading dot),
 * and the equivalent absolute path each turned a genuinely stale
 * `PRIMITIVE_EXEMPTIONS` entry from a blocking `[STALE]` into total silence,
 * exit 0 — the staleness scan never ran because `inScope` never matched).
 * Both `no-primitive-token.js` and `no-token-bypass.js` normalize
 * `componentRoot` through this before using it either in the `inScope`
 * check or as (part of) a cache key.
 *
 * @param {string} relOrAbsPath
 */
function normalizeRepoRelative(relOrAbsPath) {
  return toRepoRelative(path.resolve(REPO_ROOT, relOrAbsPath));
}

module.exports = {
  REPO_ROOT,
  toRepoRelative,
  isNonEmptyString,
  normalizeRepoRelative,
};
