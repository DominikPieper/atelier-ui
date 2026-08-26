#!/usr/bin/env node
/**
 * gen-box-sizing.mjs
 *
 * Writes — and in `--check` mode verifies — the geometry-contract block at the top
 * of every component stylesheet:
 *
 *     .atl-button,
 *     .atl-button * { box-sizing: border-box; }
 *
 * WHY THIS IS NOT A GLOBAL RESET. The library ships its CSS (ADR-0026), so its
 * sizes are only correct if the consuming app happens to supply a border-box
 * reset. Measured, without one: an Angular `atl-button` at `size=md` renders 60px
 * against a token that claims 40 (a custom element gets the CSS default
 * content-box, unlike React's `<button>`, which the UA stylesheet already makes
 * border-box); a menu item renders 52px against a stated 36; a code-block header
 * 65 against 43. Declaring the contract in the component's own stylesheet means
 * it ships in the same file as the sizes it governs and cannot be forgotten,
 * which a separate opt-in reset file could be. See ADR-0043.
 *
 * The root list is DERIVED from each component's own CSS: every `.atl-*` class
 * that starts a rule in that directory. So a new root class added later without
 * re-running this script fails `--check` instead of silently sitting outside the
 * contract. Angular encapsulates its styles, so `:host` covers it by definition.
 *
 * Specificity is deliberately (0,1,0) — a plain class, not `:where()`. It has to
 * beat a consumer's `* { box-sizing: content-box }` while still losing to any rule
 * that names an element explicitly, which is how `.atl-avatar .status-dot` keeps
 * the `content-box` its 2px ring needs.
 *
 *   node tools/scripts/gen-box-sizing.mjs            write the blocks
 *   node tools/scripts/gen-box-sizing.mjs --check    fail if any is missing or stale
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { FRAMEWORKS } = require('./lib/component-discovery.js');

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CHECK = process.argv.includes('--check');
const MARKER = '/* Geometry contract';

/** Every `.atl-*` class that starts a rule — the component's root classes. */
function leadingAtlClasses(css) {
  const found = new Set();
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const rule of clean.matchAll(/(^|[};])\s*([^{};@][^{}]*?)\{/g)) {
    for (const selector of rule[2].split(',')) {
      const m = selector.trim().match(/^\.(atl-[a-z0-9-]+)/);
      if (m) found.add(m[1]);
    }
  }
  return found;
}

function selectorFor(fw, roots) {
  if (fw === 'angular') return ':host';
  if (roots.length === 1) return `.${roots[0]}`;
  return `:is(\n  .${roots.join(',\n  .')}\n)`;
}

function blockFor(selector) {
  return (
    `/* Geometry contract: every size this component states is a border-box size.\n` +
    ` * Declared with the component rather than as a global reset, so it ships in the\n` +
    ` * same file as the sizes it governs and no consuming app has to supply one.\n` +
    ` * Gated by check:box-sizing; the resulting boxes are measured by check:geometry.\n` +
    ` * See ADR-0043. */\n` +
    `${selector},\n${selector} * {\n  box-sizing: border-box;\n}\n\n`
  );
}

const problems = [];
let written = 0;
let verified = 0;

for (const fw of FRAMEWORKS) {
  const base = join(ROOT, 'libs', fw, 'src/lib');
  for (const dir of readdirSync(base)) {
    const dirPath = join(base, dir);
    if (!statSync(dirPath).isDirectory()) continue;
    const cssFiles = readdirSync(dirPath).filter((f) => f.endsWith('.css'));
    if (cssFiles.length === 0) continue; // no stylesheet, no geometry to contract

    // The component's primary stylesheet: atl-<dir>.css when it exists. Roots are
    // collected across all of the directory's stylesheets, so a class declared in
    // a split-out file (Angular's atl-toast-container.css) is still covered.
    const primary = cssFiles.includes(`atl-${dir}.css`) ? `atl-${dir}.css` : [...cssFiles].sort()[0];
    const target = join(dirPath, primary);
    const rel = `libs/${fw}/src/lib/${dir}/${primary}`;

    const roots = [
      ...new Set(cssFiles.flatMap((f) => [...leadingAtlClasses(readFileSync(join(dirPath, f), 'utf8'))])),
    ].sort();

    if (fw !== 'angular' && roots.length === 0) {
      problems.push(`[NO-ROOT] ${rel} declares no .atl-* root class, so the contract has nothing to attach to.`);
      continue;
    }

    const want = blockFor(selectorFor(fw, roots));
    const css = readFileSync(target, 'utf8');
    const has = css.startsWith(want);

    if (has) {
      verified++;
      continue;
    }

    if (CHECK) {
      problems.push(
        css.includes(MARKER)
          ? `[STALE] ${rel} has a geometry-contract block that no longer matches its root classes ` +
            `(${roots.join(', ') || ':host'}). Run: npm run gen:box-sizing`
          : `[MISSING] ${rel} declares sizes but no geometry contract, so its boxes depend on the ` +
            `consuming app's reset. Run: npm run gen:box-sizing`
      );
      continue;
    }

    // Replace an existing stale block, or prepend a new one.
    const body = css.startsWith(MARKER) ? css.slice(css.indexOf('*/') + 2).replace(/^[\s\S]*?\n\n/, '') : css;
    writeFileSync(target, want + body);
    written++;
  }
}

if (problems.length > 0) {
  for (const p of problems) console.error(`✗ ${p}`);
  console.error(`\n${problems.length} geometry-contract issue(s).`);
  process.exit(1);
}
console.log(
  CHECK
    ? `✓ every component declares its geometry contract (${verified} stylesheets).`
    : `✓ geometry contract written (${written} updated, ${verified} already current).`
);
