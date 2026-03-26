#!/usr/bin/env node
/**
 * check-sync.js
 *
 * Detects component drift between the Angular and React libraries.
 * Run via:  node tools/scripts/check-sync.js
 *           (or  npm run check:sync  /  pnpm check:sync)
 *
 * Exits non-zero if any component directory exists in one library but not the other.
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

if (errors > 0) {
  console.error(
    `\n${errors} sync issue(s) found. Mirror the missing component(s) in the other libraries.`
  );
  process.exit(1);
} else {
  console.log(`✓ All libraries are in sync (${allComponents.size} components each)`);
}
