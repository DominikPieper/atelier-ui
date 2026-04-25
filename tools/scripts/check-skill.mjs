#!/usr/bin/env node
/**
 * Lint the structure of a Claude Code skill.
 *
 * Usage:
 *   node tools/scripts/check-skill.mjs <skill-name>
 *
 * Checks:
 *   - SKILL.md exists at the skill root.
 *   - SKILL.md has YAML frontmatter with `name` and `description` fields.
 *   - frontmatter `name` matches the directory name.
 *   - Every relative reference path that appears in SKILL.md
 *     (`references/x.md`, `assets/y.md`, etc.) resolves to an existing file.
 *
 * Fails non-zero on any drift so the skill can't ship in a broken state.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const skillName = process.argv[2];

if (!skillName) {
  console.error('usage: check-skill.mjs <skill-name>');
  process.exit(2);
}

const skillDir = resolve(ROOT, 'skills', skillName);
const skillMd = join(skillDir, 'SKILL.md');
const errors = [];

if (!existsSync(skillMd)) {
  console.error(`✗ ${skillName}: SKILL.md missing at ${skillMd}`);
  process.exit(1);
}

const content = readFileSync(skillMd, 'utf-8');

// Frontmatter: --- ... ---
const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!fm) {
  errors.push('SKILL.md is missing YAML frontmatter (--- ... ---) at the top.');
} else {
  const block = fm[1];
  const nameMatch = block.match(/^name:\s*(\S.*)$/m);
  const descMatch = block.match(/^description:\s*(\S.*)$/m);
  if (!nameMatch) errors.push('frontmatter is missing required field `name`.');
  if (!descMatch) errors.push('frontmatter is missing required field `description`.');
  if (nameMatch && nameMatch[1].trim() !== skillName) {
    errors.push(
      `frontmatter name "${nameMatch[1].trim()}" does not match directory "${skillName}".`,
    );
  }
}

// Relative reference paths used in the body
const bodyRefs = new Set();
const refRe = /(references\/[^\s)`'"]+|assets\/[^\s)`'"]+)/g;
let m;
while ((m = refRe.exec(content)) !== null) {
  // strip any trailing punctuation that crept in
  bodyRefs.add(m[1].replace(/[.,;:]$/, ''));
}

for (const rel of bodyRefs) {
  const abs = join(skillDir, rel);
  if (!existsSync(abs)) {
    errors.push(`SKILL.md references "${rel}" but the file does not exist.`);
  } else if (!statSync(abs).isFile()) {
    errors.push(`SKILL.md references "${rel}" but the path is not a file.`);
  }
}

if (errors.length) {
  console.error(`✗ ${skillName}:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ ${skillName}: SKILL.md valid, ${bodyRefs.size} references resolved`);
