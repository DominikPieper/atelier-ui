'use strict';

/**
 * Shared scaffolding for the `*.test.js` files beside the rules. Not a test
 * file itself (`check:stylelint` runs `*.test.js` only), and not vendored into
 * the create-workspace preset: `tools/scripts/sync-preflight.mjs` lists the
 * rule files it clones by name, and the tests reach repo paths a scaffold
 * does not have.
 *
 * Fixtures live in `os.tmpdir()`, never in the repo, so a test does not depend
 * on the live tokens or allowlists. A rule resolves its path options with
 * `path.resolve(REPO_ROOT, option)`, so an absolute temp path works wherever a
 * repo-relative one would; `toRepoRelative(absTempPath)` gives the `../..`
 * spelling the rule itself computes for a file linted from there.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const stylelint = require('stylelint');

const created = [];
process.on('exit', () => {
  for (const dir of created) fs.rmSync(dir, { recursive: true, force: true });
});

/**
 * A fresh scratch directory. The rules cache per (root, options) for the life
 * of the process, so every test takes its own directory rather than reusing a
 * path another test already primed.
 */
function workspace() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atelier-stylelint-'));
  created.push(dir);
  return {
    dir,
    /** Write `content` at `rel` (creating parents); returns the absolute path. */
    write(rel, content) {
      const abs = path.join(dir, rel);
      fs.mkdirSync(path.dirname(abs), { recursive: true });
      fs.writeFileSync(abs, content);
      return abs;
    },
    path: (rel) => path.join(dir, rel),
  };
}

/** Lint `code` as if it were the file `file`, with exactly one rule turned on. */
async function lintRule(plugin, options, code, file) {
  const { results } = await stylelint.lint({
    code,
    codeFilename: file,
    config: { plugins: [plugin], rules: { [plugin.ruleName]: options } },
  });
  return results[0];
}

/** Every warning's text, errors and warnings alike. */
const texts = (result) => result.warnings.map((w) => w.text);
/** Texts of the blocking ones (severity `error`). */
const errorsOf = (result) =>
  result.warnings.filter((w) => w.severity === 'error').map((w) => w.text);
/** Texts of the non-blocking ones (severity `warning`, i.e. `[GAP]`). */
const warningsOf = (result) =>
  result.warnings.filter((w) => w.severity === 'warning').map((w) => w.text);

module.exports = { workspace, lintRule, texts, errorsOf, warningsOf };
