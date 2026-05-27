#!/usr/bin/env node
/**
 * check-sync.js
 *
 * Detects component drift across the Angular, React, and Vue libraries:
 *   [DRIFT]     a component directory exists in one library but not the others
 *   [NO-STORY]  a directory has a component source but no *.stories.* file
 *               (so it would be invisible in Storybook / the hosted MCP docs)
 *
 * Run via:  node tools/scripts/check-sync.js
 *           (or  npm run check:sync  /  pnpm check:sync)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const ANGULAR_LIB = path.join(ROOT, 'libs/angular/src/lib');
const REACT_LIB = path.join(ROOT, 'libs/react/src/lib');
const VUE_LIB = path.join(ROOT, 'libs/vue/src/lib');

/** @returns {Set<string>} */
function getComponentDirs(dir) {
  if (!fs.existsSync(dir)) return new Set();
  return new Set(
    fs
      .readdirSync(dir)
      .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory())
  );
}

/** A dir is a component when it holds an `llm-*` source that is not a spec/story. */
function isComponentDir(dirPath) {
  return fs
    .readdirSync(dirPath)
    .some((f) => /^llm-.*\.(ts|tsx|vue)$/.test(f) && !/\.(spec|stories)\./.test(f));
}

function hasStory(dirPath) {
  return fs.readdirSync(dirPath).some((f) => /\.stories\./.test(f));
}

const angular = getComponentDirs(ANGULAR_LIB);
const react = getComponentDirs(REACT_LIB);
const vue = getComponentDirs(VUE_LIB);

let errors = 0;

const allComponents = new Set([...angular, ...react, ...vue]);

for (const name of allComponents) {
  if (!angular.has(name)) {
    console.error(`[DRIFT] '${name}' is missing from Angular`);
    errors++;
  }
  if (!react.has(name)) {
    console.error(`[DRIFT] '${name}' is missing from React`);
    errors++;
  }
  if (!vue.has(name)) {
    console.error(`[DRIFT] '${name}' is missing from Vue`);
    errors++;
  }
}

// Story presence — every component dir must ship a story (else it is absent
// from Storybook and the hosted MCP docs surface).
for (const [label, lib] of [
  ['Angular', ANGULAR_LIB],
  ['React', REACT_LIB],
  ['Vue', VUE_LIB],
]) {
  if (!fs.existsSync(lib)) continue;
  for (const name of fs.readdirSync(lib)) {
    const dirPath = path.join(lib, name);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    if (!isComponentDir(dirPath)) continue;
    if (!hasStory(dirPath)) {
      console.error(`[NO-STORY] ${label}/${name} has a component source but no *.stories.* file`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(
    `\n${errors} sync issue(s) found. Mirror missing components / add the missing story.`
  );
  process.exit(1);
} else {
  console.log(`✓ All libraries are in sync (${allComponents.size} components each, stories present)`);
}
