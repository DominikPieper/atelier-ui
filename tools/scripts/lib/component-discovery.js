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

/** `atl-select.angular.css`: a per-framework override of a shared sheet (ADR-0148 Decision 4). */
const OVERRIDE_SHEET = /\.(angular|react|vue)\.css$/;

/**
 * Every stylesheet a component ships to one framework, in cascade order: the shared
 * `libs/styles/src/<dir>/` sheet first, then the `.css` files in the component's own
 * directory. A component that has moved to the shared location has nothing left in
 * `libs/<fw>/src/lib/<dir>/` but, at most, the per-framework overrides
 * (`atl-<name>.<fw>.css`, for DOM that legitimately differs), which load after the
 * shared sheet; a gate that only read that directory would pass without reading the
 * component's CSS. A component that has not moved yet has only its own files.
 * Returns `{ abs, rel, shared, override }`, `rel` being repo-relative with forward
 * slashes. `shared` and `override` sheets are class-rooted (no `:host`); an override
 * sheet of another framework is never returned for `fw`.
 */
function componentCssFiles(fw, dir) {
  const out = [];
  const add = (base, shared) => {
    if (!fs.existsSync(base) || !fs.statSync(base).isDirectory()) return;
    for (const f of fs.readdirSync(base).sort()) {
      if (!f.endsWith('.css')) continue;
      const m = OVERRIDE_SHEET.exec(f);
      if (m && m[1] !== fw) continue;
      const abs = path.join(base, f);
      out.push({
        abs,
        rel: path.relative(REPO_ROOT, abs).split(path.sep).join('/'),
        shared,
        override: Boolean(m),
      });
    }
  };
  add(path.join(SHARED_STYLES_DIR, dir), true);
  add(path.join(REPO_ROOT, 'libs', fw, 'src/lib', dir), false);
  return out;
}

module.exports = {
  FRAMEWORKS,
  isComponentDir,
  getComponentDirs,
  hasStory,
  SHARED_STYLES_DIR,
  componentCssFiles,
  OVERRIDE_SHEET,
};
