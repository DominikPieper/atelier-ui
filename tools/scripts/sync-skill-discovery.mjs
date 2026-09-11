#!/usr/bin/env node
/**
 * Mirror Claude Code skills' runtime payload (SKILL.md + references/ +
 * assets/) into the docs site's `.well-known/agent-skills/<name>/` and
 * update the discovery `index.json` so each skill is reachable at
 * `https://atelier.pieper.io/.well-known/agent-skills/<name>/SKILL.md`.
 *
 * Usage:
 *   node tools/scripts/sync-skill-discovery.mjs              # every skill under skills/
 *   node tools/scripts/sync-skill-discovery.mjs <skill-name> # just that one
 *
 * The roster for the no-argument form is derived from the filesystem — every
 * directory under `skills/` that has a `SKILL.md` — not from a maintained
 * list, so a new skill added later is picked up automatically instead of
 * silently missing from discovery until someone remembers to add its name
 * here. This is what `npm run sync:generated` (and the pre-push hook) calls;
 * the single-name form stays available for each skill's own `sync-discovery`
 * nx target and for a targeted local run.
 *
 * What this writes, per skill:
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
import { discoverSkillNames, digestSkillMd } from './lib/skill-discovery.mjs';
import allowlists from './lib/allowlists.js';

const { UNDISTRIBUTED_SKILLS } = allowlists;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE_URL = 'https://atelier.pieper.io';
const SKILLS_ROOT = resolve(ROOT, 'skills');

/** Mirror one skill's payload into docs/public and return its discovery-index entry. */
function syncOne(skillName) {
  const skillDir = resolve(SKILLS_ROOT, skillName);
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
    console.error(`${skillName}: SKILL.md has no YAML frontmatter`);
    process.exit(1);
  }

  // The discovery index needs a short, human-facing description.
  // SKILL.md's frontmatter description is tuned for Claude Code's routing
  // (long, full of trigger keywords) — not appropriate for a public listing.
  // Prefer package.json's `description` for the listing instead.
  const skillPkgPath = resolve(skillDir, 'package.json');
  if (!existsSync(skillPkgPath)) {
    console.error(`${skillName}: package.json missing: ${skillPkgPath}`);
    process.exit(1);
  }
  const skillPkg = JSON.parse(readFileSync(skillPkgPath, 'utf-8'));
  const shortDesc = skillPkg.description?.trim();
  if (!shortDesc) {
    console.error(`${skillName}: package.json missing description`);
    process.exit(1);
  }

  const digest = digestSkillMd(skillMd);

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
    cpSync(referencesDir, resolve(targetDir, 'references'), {
      recursive: true,
    });
  }

  const assetsDir = resolve(skillDir, 'assets');
  if (existsSync(assetsDir)) {
    cpSync(assetsDir, resolve(targetDir, 'assets'), { recursive: true });
  }

  const url = `${SITE_URL}/.well-known/agent-skills/${skillName}/SKILL.md`;
  return {
    name: skillName,
    type: 'skill-md',
    description: shortDesc,
    url,
    digest,
  };
}

const requestedName = process.argv[2];
let names = requestedName ? [requestedName] : discoverSkillNames(SKILLS_ROOT);

// The no-argument, filesystem-derived form must not publish a skill that is
// deliberately undistributed (tools/scripts/lib/allowlists.js) — an explicit
// single-name invocation (this skill's own sync-discovery nx target, a
// targeted local run) still honors that request literally.
if (!requestedName) {
  names = names.filter((name) => {
    if (Object.prototype.hasOwnProperty.call(UNDISTRIBUTED_SKILLS, name)) {
      console.log(
        `– ${name} skipped — undistributed (${UNDISTRIBUTED_SKILLS[name].reason})`,
      );
      return false;
    }
    return true;
  });
}

if (names.length === 0) {
  console.error(`no skills found under ${SKILLS_ROOT} (each needs a SKILL.md)`);
  process.exit(1);
}

const indexPath = resolve(
  ROOT,
  'docs/public/.well-known/agent-skills/index.json',
);
const index = JSON.parse(readFileSync(indexPath, 'utf-8'));

for (const skillName of names) {
  const entry = syncOne(skillName);
  const existing = index.skills.findIndex((s) => s.name === entry.name);
  if (existing >= 0) {
    index.skills[existing] = entry;
  } else {
    index.skills.push(entry);
  }
  console.log(
    `✓ ${entry.name} synced to discovery — ${entry.digest.slice(0, 19)}… at ${entry.url}`,
  );
}

index.skills.sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n');
