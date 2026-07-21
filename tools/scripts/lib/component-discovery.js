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
    .some((f) => /^atl-.*\.(ts|tsx|vue)$/.test(f) && !/\.(spec|stories)\./.test(f));
}

/** Immediate subdirectory names of `dir` (the component dirs of a lib). */
function getComponentDirs(dir) {
  if (!fs.existsSync(dir)) return new Set();
  return new Set(
    fs.readdirSync(dir).filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory())
  );
}

/** Does a component dir ship a Storybook story? */
function hasStory(dirPath) {
  return fs.readdirSync(dirPath).some((f) => /\.stories\./.test(f));
}

module.exports = { FRAMEWORKS, isComponentDir, getComponentDirs, hasStory };
