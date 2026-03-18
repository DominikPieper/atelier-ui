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
const ANGULAR_LIB = path.join(ROOT, 'libs/llm-components-angular/src/lib');
const REACT_LIB = path.join(ROOT, 'libs/llm-components-react/src/lib');

/** @returns {Set<string>} */
function getComponentDirs(dir) {
  return new Set(
    fs
      .readdirSync(dir)
      .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory())
  );
}

const angular = getComponentDirs(ANGULAR_LIB);
const react = getComponentDirs(REACT_LIB);

let errors = 0;

for (const name of angular) {
  if (!react.has(name)) {
    console.error(`[DRIFT] '${name}' exists in Angular but is missing from React`);
    errors++;
  }
}

for (const name of react) {
  if (!angular.has(name)) {
    console.error(`[DRIFT] '${name}' exists in React but is missing from Angular`);
    errors++;
  }
}

if (errors > 0) {
  console.error(
    `\n${errors} sync issue(s) found. Mirror the missing component(s) in the other library.`
  );
  process.exit(1);
} else {
  console.log(`✓ Libraries are in sync (${angular.size} components each)`);
}
