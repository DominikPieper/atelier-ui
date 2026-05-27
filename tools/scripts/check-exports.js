#!/usr/bin/env node
/**
 * check-exports.js
 *
 * Validates that every component directory is re-exported from its framework's
 * public barrel (src/index.ts). check-sync guarantees the directories exist in
 * all three libraries; this guarantees each is actually reachable from the
 * package entry point — a component dir present but missing its barrel line
 * ships source that consumers cannot import.
 *
 * Robust without TS resolution: every barrel references a component by its
 * module path (`export * from './lib/button/llm-button'` in React,
 * `export { LlmButton } from './lib/button/llm-button'` in Angular/Vue), so the
 * check asserts the barrel text references `lib/<dir>/` for each component dir.
 *
 * Run via:  node tools/scripts/check-exports.js
 *           (or  npm run check:exports)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const FRAMEWORKS = ['angular', 'react', 'vue'];

/** A dir is a component when it holds an `llm-*` source that is not a spec/story. */
function isComponentDir(dirPath) {
  return fs
    .readdirSync(dirPath)
    .some((f) => /^llm-.*\.(ts|tsx|vue)$/.test(f) && !/\.(spec|stories)\./.test(f));
}

const errors = [];

for (const framework of FRAMEWORKS) {
  const libDir = path.join(ROOT, 'libs', framework, 'src', 'lib');
  const barrelPath = path.join(ROOT, 'libs', framework, 'src', 'index.ts');
  if (!fs.existsSync(barrelPath)) {
    errors.push(`[NO-BARREL] ${framework}: src/index.ts not found`);
    continue;
  }
  // Strip block + line comments so a commented-out export does not count.
  const barrel = fs
    .readFileSync(barrelPath, 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n');
  for (const name of fs.readdirSync(libDir)) {
    const dirPath = path.join(libDir, name);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    if (!isComponentDir(dirPath)) continue;
    if (!barrel.includes(`lib/${name}/`)) {
      errors.push(
        `[NO-EXPORT] ${framework}/${name}: component is not re-exported from src/index.ts`
      );
    }
  }
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(`\n${errors.length} export issue(s). Add the missing re-export to the framework barrel (src/index.ts).`);
  process.exit(1);
} else {
  console.log('✓ every component is re-exported from each framework barrel');
}
