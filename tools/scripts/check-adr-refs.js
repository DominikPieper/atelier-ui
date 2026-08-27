#!/usr/bin/env node
'use strict';
/**
 * check-adr-refs.js
 *
 * The ADR log is the project's memory, and a cross-reference that points at a file
 * which does not exist degrades it silently — nobody follows a link in a markdown
 * file until they need it, by which time the reason it was written is gone.
 *
 * Six such references had accumulated across 65 ADRs, and the same wrong filename
 * appeared twice independently: a reader guesses the path from the TITLE
 * (`0035-instrument-sans-and-serif.md`) while the file is named something else
 * (`0035-typography-instrument-pair.md`). That is a mistake the author cannot catch
 * by re-reading, which is exactly what a gate is for.
 *
 * Checks, over plan/adr/ and the docs that link into it:
 *   [REF]    a `plan/adr/NNNN-....md` reference whose file does not exist
 *   [INDEX]  an ADR file with no row in plan/adr/README.md
 *   [ORPHAN] a README row pointing at a file that does not exist
 *   [SELF]   an ADR citing itself
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const ADR_DIR = path.join(ROOT, 'plan/adr');
const README = path.join(ADR_DIR, 'README.md');
// Every place that links into plan/adr/ — a broken pointer is as bad from a task file.
const EXTRA_SOURCES = ['CLAUDE.md', 'plan/figma.md', 'plan/big-picture.md', 'plan/roadmap.md', 'tasks/todo.md', 'tasks/lessons.md'];

const errors = [];
const fail = (tag, msg) => errors.push(`✗ [${tag}] ${msg}`);

const adrFiles = fs
  .readdirSync(ADR_DIR)
  .filter((f) => /^\d{4}-[a-z0-9-]+\.md$/.test(f))
  .sort();
const existing = new Set(adrFiles);

const sources = [
  ...adrFiles.map((f) => path.join('plan/adr', f)),
  ...EXTRA_SOURCES.filter((f) => fs.existsSync(path.join(ROOT, f))),
];

for (const rel of sources) {
  const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  const seen = new Set();
  // The reference must be a whole path segment. Without the boundary this matched
  // the date tail of `tasks/design-findings-2026-07-22.md` as if it were ADR 2026.
  for (const m of text.matchAll(/(?:plan\/adr\/|\(\.\/)(\d{4}-[a-z0-9-]+\.md)/g)) {
    const target = m[1];
    if (seen.has(target)) continue;
    seen.add(target);
    if (!existing.has(target)) {
      const stem = target.slice(0, 4);
      const actual = adrFiles.find((f) => f.startsWith(stem));
      fail('REF', `${rel} references ${target}, which does not exist.${actual ? ` Did you mean ${actual}?` : ''}`);
    } else if (rel.endsWith(target)) {
      fail('SELF', `${rel} cites itself.`);
    }
  }
}

const readme = fs.readFileSync(README, 'utf8');
for (const f of adrFiles) {
  if (f === 'README.md') continue;
  if (!readme.includes(f)) fail('INDEX', `${f} has no row in plan/adr/README.md. Every ADR is indexed (CLAUDE.md step 4).`);
}
for (const m of readme.matchAll(/\((\d{4}-[a-z0-9-]+\.md)\)/g)) {
  if (!existing.has(m[1])) fail('ORPHAN', `plan/adr/README.md points at ${m[1]}, which does not exist.`);
}

if (errors.length) {
  for (const e of errors) console.error(e);
  console.error(`\n${errors.length} ADR reference issue(s) across ${adrFiles.length} ADRs.`);
  process.exit(1);
}
console.log(`✓ ADR references resolve (${adrFiles.length} ADRs, ${sources.length} source file(s) scanned).`);
