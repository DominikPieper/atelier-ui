#!/usr/bin/env node
/**
 * check-behavior-coverage.mjs
 *
 * Behavioral-parity gate. The type contract (libs/spec) guarantees the three
 * framework adapters expose the same *shape*; it says nothing about *behavior*
 * ("loading=true renders a spinner", "Escape closes the listbox"). Those live
 * only in per-framework unit tests, written independently — so one adapter can
 * silently stop testing a behavior the others cover.
 *
 * This script reads the behavior contract (libs/spec/src/behaviors.json) and
 * asserts every behavior `id` is tagged in each framework's spec file via a
 * `// @behavior <id>` marker. It is a dumb token check (like check-sync.js),
 * intentionally: it enforces coverage *parity*, not behavior correctness — the
 * tests themselves do that.
 *
 * Exits non-zero and lists every (component, behavior, framework) gap.
 *
 * Run via:  node tools/scripts/check-behavior-coverage.mjs
 *           (or  npm run check:behavior)
 */
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST = resolve(ROOT, 'libs/spec/src/behaviors.json');
const FRAMEWORKS = ['angular', 'react', 'vue'];

/** Finds a component's spec file in a framework lib, regardless of extension. */
function specFile(framework, component) {
  const dir = join(ROOT, 'libs', framework, 'src', 'lib', component);
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return null;
  }
  const match = entries.find((e) => /\.spec\.(ts|tsx)$/.test(e));
  return match ? join(dir, match) : null;
}

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf-8'));
const errors = [];
let checked = 0;

for (const [component, behaviors] of Object.entries(manifest)) {
  if (component.startsWith('$')) continue; // skip $comment etc.
  for (const framework of FRAMEWORKS) {
    const file = specFile(framework, component);
    if (!file) {
      errors.push(`[NO-SPEC] ${framework}/${component}: no *.spec file found`);
      continue;
    }
    const src = readFileSync(file, 'utf-8');
    for (const { id } of behaviors) {
      checked++;
      // Match the marker as a whole token so 'open' can't satisfy 'open-on-trigger'.
      const re = new RegExp(`@behavior\\s+${id}(?![\\w-])`);
      if (!re.test(src)) {
        errors.push(
          `[UNCOVERED] ${component}/${id} not tagged in ${framework} (${file.replace(ROOT + '/', '')})`
        );
      }
    }
  }
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(
    `\n${errors.length} behavior-coverage gap(s). Add a \`// @behavior <id>\` marker above the ` +
      `covering test, or extend libs/spec/src/behaviors.json.`
  );
  process.exit(1);
} else {
  const components = Object.keys(manifest).filter((k) => !k.startsWith('$')).length;
  console.log(
    `✓ behavior coverage in sync (${checked} checks across ${components} components × ${FRAMEWORKS.length} frameworks)`
  );
}
