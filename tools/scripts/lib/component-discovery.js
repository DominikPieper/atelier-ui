'use strict';
/**
 * Shared component-directory discovery for the structural gates
 * (check-sync, check-exports). One definition of "what is a component dir"
 * and the framework list, so the two gates can't drift apart.
 */

const fs = require('fs');
const path = require('path');

/** The three framework adapters, in canonical order. */
const FRAMEWORKS = ['angular', 'react', 'vue'];

/** A dir is a component when it holds an `atl-*` source that is not a spec/story. */
function isComponentDir(dirPath) {
  return fs
    .readdirSync(dirPath)
    .some(
      (f) => /^atl-.*\.(ts|tsx|vue)$/.test(f) && !/\.(spec|stories)\./.test(f),
    );
}

/** Immediate subdirectory names of `dir` (the component dirs of a lib). */
function getComponentDirs(dir) {
  if (!fs.existsSync(dir)) return new Set();
  return new Set(
    fs
      .readdirSync(dir)
      .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory()),
  );
}

/** Does a component dir ship a Storybook story? */
function hasStory(dirPath) {
  return fs.readdirSync(dirPath).some((f) => /\.stories\./.test(f));
}

const REPO_ROOT = path.resolve(__dirname, '../../..');

/** Where class-rooted stylesheets shared by all three frameworks live (`libs/styles`). */
const SHARED_STYLES_DIR = path.join(REPO_ROOT, 'libs/styles/src');

/**
 * A per-framework override of a shared sheet (ADR-0148 Decision 4). `atl-select.angular.css`
 * lives with its framework; `atl-select.native.css` lives in `libs/styles` and serves the
 * two frameworks that render a native DOM, React and Vue, never Angular.
 */
const OVERRIDE_SHEET = /\.(angular|react|vue|native)\.css$/;

/** Does an override sheet (`.<tag>.css`) load for `fw`? `native` is React and Vue. */
function overrideAppliesTo(tag, fw) {
  return tag === 'native' ? fw !== 'angular' : tag === fw;
}

/**
 * Every stylesheet a component ships to one framework, in cascade order:
 *   1. the shared sheet, `libs/styles/src/<dir>/atl-<name>.css`;
 *   2. an override that lives with the styles package and serves React and Vue only,
 *      `libs/styles/src/<dir>/atl-<name>.native.css` (never returned for Angular);
 *   3. the framework's own override, `libs/<fw>/src/lib/<dir>/atl-<name>.<fw>.css`
 *      (Angular's CDK-overlay select, tooltip and table).
 * Every component's CSS lives in `libs/styles` (ADR-0148); a `.css` file in a
 * framework directory that is not a `.<fw>.css` override is not a stylesheet this
 * helper knows, so it is not returned, and `check:box-sizing` and `check:dead-selectors`
 * count what exists against what this returns to catch a sheet that is skipped.
 * Returns `{ abs, rel, shared, override }`, `rel` being repo-relative with forward
 * slashes. Every sheet is class-rooted (no `:host`); an override of another framework
 * is never returned for `fw`.
 */
function componentCssFiles(fw, dir) {
  const out = [];
  const add = (base, shared) => {
    if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return;
    for (const f of fs.readdirSync(base).sort()) {
      if (!f.endsWith('.css')) continue;
      const m = OVERRIDE_SHEET.exec(f);
      // The shared directory holds the shared sheet and the `.native.css` override; the
      // framework directory holds nothing but its own `.<fw>.css` override.
      if (!shared && !m) continue;
      if (m && !overrideAppliesTo(m[1], fw)) continue;
      const abs = path.join(base, f);
      out.push({
        abs,
        rel: path.relative(REPO_ROOT, abs).split(path.sep).join('/'),
        shared: shared && !m,
        override: Boolean(m),
      });
    }
  };
  add(path.join(SHARED_STYLES_DIR, dir), true);
  add(path.join(REPO_ROOT, 'libs', fw, 'src/lib', dir), false);
  return out;
}

/** Every `.css` file under `dir`, recursively (absolute paths). */
function walkCss(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkCss(abs, out);
    else if (entry.name.endsWith('.css')) out.push(abs);
  }
  return out;
}

/**
 * Every component stylesheet that EXISTS for `fw`, found by walking the trees rather
 * than by asking `componentCssFiles()`: a gate that reads its sheets through that
 * helper is blind to exactly the sheets the helper does not reach (a directory name
 * the framework does not share, a stray `.css` beside a component), and was found
 * passing over 78 of 87 of them. This is the independent count to hold it against.
 * `libs/styles/src/<dir>/*.css` minus the overrides that are not this framework's,
 * plus every `.css` under `libs/<fw>/src/lib`.
 */
function existingCssFiles(fw) {
  const own = walkCss(path.join(REPO_ROOT, 'libs', fw, 'src/lib'));
  const shared = walkCss(SHARED_STYLES_DIR).filter((abs) => {
    // `libs/styles/src/tokens.css` sits at the package root, beside the component
    // directories: it is the token source, not a component stylesheet.
    if (path.dirname(abs) === SHARED_STYLES_DIR) return false;
    const m = OVERRIDE_SHEET.exec(path.basename(abs));
    return !m || overrideAppliesTo(m[1], fw);
  });
  return [...shared, ...own].sort();
}

/**
 * Compare the sheets a gate read for `fw` (`visited`, a Set of absolute paths, or any
 * iterable) with the sheets that exist. Returns null when it read them all, otherwise
 * the `[PARTIAL-COVERAGE]` message naming what it skipped (ADR-0080: a guard that
 * covers less than exists is not a check). `fws` may be a list when the gate pools
 * its sheets across frameworks.
 */
function coverageGap(gate, fws, visited) {
  const seen = new Set(visited);
  const frameworks = Array.isArray(fws) ? fws : [fws];
  const exist = [
    ...new Set(frameworks.flatMap((fw) => existingCssFiles(fw))),
  ].sort();
  const missing = exist.filter((abs) => !seen.has(abs));
  if (missing.length === 0) return null;
  const dirs = new Set(exist.map((abs) => path.basename(path.dirname(abs))));
  const found = exist.length - missing.length;
  const rel = (abs) => path.relative(REPO_ROOT, abs).split(path.sep).join('/');
  return (
    `[PARTIAL-COVERAGE] ${gate} (${frameworks.join(', ')}) read ${found} component stylesheet(s) but ` +
    `${exist.length} exist across ${dirs.size} component director(ies) with CSS; unread: ` +
    `${missing.slice(0, 5).map(rel).join(', ')}${missing.length > 5 ? ', …' : ''}. ` +
    'A gate that skips sheets passes while blind to them.'
  );
}

module.exports = {
  FRAMEWORKS,
  isComponentDir,
  getComponentDirs,
  hasStory,
  SHARED_STYLES_DIR,
  componentCssFiles,
  OVERRIDE_SHEET,
  overrideAppliesTo,
  existingCssFiles,
  coverageGap,
};
