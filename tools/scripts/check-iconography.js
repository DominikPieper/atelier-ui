#!/usr/bin/env node
/**
 * check-iconography.js
 *
 * One concept, one drawing. This gate exists because the library had four ways to
 * draw the same thing and no gate could see it (ADR-0046):
 *
 *   - AtlIcon rendered Unicode glyphs (`close: '×'`) and no component used it,
 *   - eleven components drew 14 inline `<svg>`s of their own,
 *   - two stylesheets put a literal `✕` in a CSS `content:`,
 *   - so `close` existed as one shape in five components, a *different* X in
 *     AtlStepper, `'×'` in AtlIcon and `'✕'` in CSS, and `check` had three
 *     unrelated paths.
 *
 * Four checks, each closing one of those doors:
 *   [INLINE-SVG]  a component source draws its own svg instead of using AtlIcon
 *   [CSS-GLYPH]   a stylesheet puts a literal glyph in `content:`
 *   [NO-GEOMETRY] a name in AtlIconName has no entry in icons.ts
 *   [ORPHAN]      an entry in icons.ts is not in AtlIconName
 *
 * Story files are exempt: a story may hand arbitrary markup to a slot to show
 * that the slot takes arbitrary markup (AtlTable's `emptyContent` demo does
 * exactly that), which is documentation rather than the library drawing an icon.
 *
 * Run via:  node tools/scripts/check-iconography.js  (or  npm run check:iconography)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { FRAMEWORKS } = require('./lib/component-discovery');

const ROOT = path.resolve(__dirname, '../..');
const SPEC_INDEX = path.join(ROOT, 'libs/spec/src/index.ts');
const SPEC_ICONS = path.join(ROOT, 'libs/spec/src/icons.ts');

const errors = [];

/** The icon component is the one place allowed to draw an svg. */
const isIconComponent = (dir) => dir === 'icon';
const isStory = (file) => /\.stories\./.test(file);

// ── 1 + 2: nobody draws their own icon ───────────────────────────────────────
for (const fw of FRAMEWORKS) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  if (!fs.existsSync(base)) continue;
  for (const dir of fs.readdirSync(base)) {
    const dirPath = path.join(base, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    for (const file of fs.readdirSync(dirPath)) {
      const full = path.join(dirPath, file);
      const rel = `libs/${fw}/src/lib/${dir}/${file}`;
      const isSource = /\.(ts|tsx|vue|html)$/.test(file) && !/\.spec\./.test(file);
      const isCss = file.endsWith('.css');
      if (!isSource && !isCss) continue;
      const text = fs.readFileSync(full, 'utf8');

      if (isSource && !isStory(file) && !isIconComponent(dir) && /<svg[\s>]/.test(text)) {
        errors.push(
          `[INLINE-SVG] ${rel} draws its own <svg>. Use AtlIcon so the shape has one definition; ` +
            `add the geometry to libs/spec/src/icons.ts if the icon does not exist yet.`
        );
      }

      if (isCss) {
        // `content: ''`, `content: attr(…)`, `content: var(…)` and `content: none`
        // are structural; a literal glyph is an icon in disguise. Comments are
        // stripped first — a rule's own explanation may quote the glyph it replaced.
        const code = text.replace(/\/\*[\s\S]*?\*\//g, '');
        for (const m of code.matchAll(/content:\s*(['"])([^'"]*)\1/g)) {
          const value = m[2];
          if (value.trim() === '') continue;
          if (/^[\s ]*$/.test(value)) continue;
          errors.push(
            `[CSS-GLYPH] ${rel} puts the literal ${JSON.stringify(value)} in a CSS content:. ` +
              `Render an AtlIcon instead — a glyph cannot follow the icon set, and Figma cannot ` +
              `put an icon instance behind a pseudo-element.`
          );
        }
      }
    }
  }
}

// ── 3 + 4: the union and the geometry agree ──────────────────────────────────
const specText = fs.readFileSync(SPEC_INDEX, 'utf8');
const unionMatch = specText.match(/export type AtlIconName =([\s\S]*?);/);
if (!unionMatch) {
  errors.push('[UNION] could not find `export type AtlIconName` in libs/spec/src/index.ts.');
} else {
  const names = [...unionMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  const iconsText = fs.readFileSync(SPEC_ICONS, 'utf8');
  const geometryBlock = iconsText.slice(iconsText.indexOf('ATL_ICON_GEOMETRY'));
  const defined = new Set([...geometryBlock.matchAll(/^ {2}'?([a-z-]+)'?:\s*\{/gm)].map((m) => m[1]));

  for (const name of names) {
    if (!defined.has(name)) {
      errors.push(
        `[NO-GEOMETRY] AtlIconName includes '${name}' but icons.ts defines no geometry for it, ` +
          `so AtlIcon would render an empty svg. Add it or drop the name.`
      );
    }
  }
  for (const name of defined) {
    if (!names.includes(name)) {
      errors.push(
        `[ORPHAN] icons.ts defines '${name}' but AtlIconName does not include it, so no consumer can ask for it.`
      );
    }
  }
  if (errors.length === 0) {
    console.log(
      `✓ iconography single-sourced (${names.length} names, all with geometry; no component draws its own svg or glyph).`
    );
    process.exit(0);
  }
}

for (const e of errors) console.error(`✗ ${e}`);
console.error(`\n${errors.length} iconography issue(s).`);
process.exit(1);
