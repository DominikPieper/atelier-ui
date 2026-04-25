#!/usr/bin/env node
/**
 * Mirror a Claude Code skill's runtime payload (SKILL.md + references/ +
 * assets/) into the docs site's `.well-known/agent-skills/<name>/` and
 * update the discovery `index.json` so the skill is reachable at
 * `https://atelier.pieper.io/.well-known/agent-skills/<name>/SKILL.md`.
 *
 * Usage:
 *   node tools/scripts/sync-skill-discovery.mjs <skill-name>
 *
 * What this writes:
 *   - docs/public/.well-known/agent-skills/<name>/SKILL.md
 *   - docs/public/.well-known/agent-skills/<name>/references/*.md  (if any)
 *   - docs/public/.well-known/agent-skills/<name>/assets/*         (if any)
 *   - docs/public/.well-known/agent-skills/index.json              (entry merged in)
 *
 * The discovery `index.json` follows
 * https://schemas.agentskills.io/discovery/0.2.0/schema.json — entries are
 * `type: "skill-md"` with a URL pointing to SKILL.md. Crawlers fetch the
 * SKILL.md and follow relative links into references/ and assets/ on demand.
 */
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE_URL = 'https://atelier.pieper.io';
const skillName = process.argv[2];

if (!skillName) {
  console.error('usage: sync-skill-discovery.mjs <skill-name>');
  process.exit(2);
}

const skillDir = resolve(ROOT, 'skills', skillName);
if (!existsSync(skillDir)) {
  console.error(`skill not found: ${skillDir}`);
  process.exit(1);
}

const skillMdPath = resolve(skillDir, 'SKILL.md');
if (!existsSync(skillMdPath)) {
  console.error(`SKILL.md missing: ${skillMdPath}`);
  process.exit(1);
}

const skillMd = readFileSync(skillMdPath, 'utf-8');
const fmMatch = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!fmMatch) {
  console.error(`SKILL.md has no YAML frontmatter`);
  process.exit(1);
}

// The discovery index needs a short, human-facing description.
// SKILL.md's frontmatter description is tuned for Claude Code's routing
// (long, full of trigger keywords) — not appropriate for a public listing.
// Prefer package.json's `description` for the listing instead.
const skillPkgPath = resolve(skillDir, 'package.json');
if (!existsSync(skillPkgPath)) {
  console.error(`package.json missing: ${skillPkgPath}`);
  process.exit(1);
}
const skillPkg = JSON.parse(readFileSync(skillPkgPath, 'utf-8'));
const shortDesc = skillPkg.description?.trim();
if (!shortDesc) {
  console.error(`package.json missing description`);
  process.exit(1);
}

const digest = 'sha256:' + createHash('sha256').update(skillMd).digest('hex');

const targetDir = resolve(
  ROOT,
  'docs/public/.well-known/agent-skills',
  skillName,
);

if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true });
}
mkdirSync(targetDir, { recursive: true });

cpSync(skillMdPath, resolve(targetDir, 'SKILL.md'));

const referencesDir = resolve(skillDir, 'references');
if (existsSync(referencesDir)) {
  cpSync(referencesDir, resolve(targetDir, 'references'), { recursive: true });
}

const assetsDir = resolve(skillDir, 'assets');
if (existsSync(assetsDir)) {
  cpSync(assetsDir, resolve(targetDir, 'assets'), { recursive: true });
}

// Merge into index.json
const indexPath = resolve(
  ROOT,
  'docs/public/.well-known/agent-skills/index.json',
);
const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

const url = `${SITE_URL}/.well-known/agent-skills/${skillName}/SKILL.md`;
const entry = {
  name: skillName,
  type: 'skill-md',
  description: shortDesc,
  url,
  digest,
};

const existing = index.skills.findIndex((s) => s.name === skillName);
if (existing >= 0) {
  index.skills[existing] = entry;
} else {
  index.skills.push(entry);
}
index.skills.sort((a, b) => a.name.localeCompare(b.name));

writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');

console.log(
  `✓ ${skillName} synced to discovery — ${digest.slice(0, 19)}… at ${url}`,
);
