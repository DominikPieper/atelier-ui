#!/usr/bin/env node
/**
 * Package a Claude Code skill into the canonical zip layout for distribution.
 *
 * Usage:
 *   node tools/scripts/package-skill.mjs <skill-name>
 *
 * Output:
 *   dist/skills/<skill-name>.zip
 *
 * The zip has a single top-level directory <skill-name>/ containing the
 * skill's SKILL.md + references/ + assets/ — matching what Claude Code's
 * skill loader expects when extracted into ~/.claude/skills/.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const skillName = process.argv[2];

if (!skillName) {
  console.error('usage: package-skill.mjs <skill-name>');
  process.exit(2);
}

const skillDir = resolve(ROOT, 'skills', skillName);
if (!existsSync(skillDir)) {
  console.error(`skill not found: ${skillDir}`);
  process.exit(1);
}

const outDir = resolve(ROOT, 'dist/skills');
const outFile = resolve(outDir, `${skillName}.zip`);
mkdirSync(outDir, { recursive: true });
if (existsSync(outFile)) rmSync(outFile);

// zip from skills/ so the archive's top-level entry is "<skillName>/...",
// and only include the runtime payload (SKILL.md, references/, assets/) —
// not the dev-only project.json / package.json / README.md.
execFileSync(
  'zip',
  [
    '-rq',
    outFile,
    skillName,
    '-i',
    `${skillName}/SKILL.md`,
    `${skillName}/references/*`,
    `${skillName}/assets/*`,
  ],
  { cwd: resolve(ROOT, 'skills'), stdio: 'inherit' },
);

console.log(`✓ packaged ${skillName} → ${outFile.replace(ROOT + '/', '')}`);
