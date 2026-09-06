#!/usr/bin/env node
/**
 * check-skill-discovery.mjs
 *
 * Every skill directory under skills/ that ships a SKILL.md must be reachable
 * over the public discovery endpoint — mirrored into
 * docs/public/.well-known/agent-skills/<name>/ with a matching entry in that
 * directory's index.json — or be named in UNDISTRIBUTED_SKILLS
 * (tools/scripts/lib/allowlists.js) with a reason.
 *
 * Nothing enforced this before. `figma-workspace-architect`'s discovery sync
 * was wired one skill at a time (b1725d6, "feat(skills): figma-workspace-
 * architect — auto-release + discovery mirror"); a second skill,
 * `atelier-design`, shipped a SKILL.md but was never added to that pipeline —
 * `sync:generated`'s `sync-skill-discovery.mjs` invocation hard-coded the
 * first skill's name, so it never ran for the second one. Every existing
 * discovery entry was individually correct throughout, so every other gate
 * stayed green while the entire second skill was unreachable at
 * `/.well-known/agent-skills/atelier-design/SKILL.md` (404). This gate
 * compares the roster on disk against the roster in the index so that gap
 * cannot recur, for this skill or a future third one.
 *
 * Checks, per directory under skills/ that has a SKILL.md:
 *   [MISSING]        no entry for this skill name in index.json, and it is
 *                     not listed in UNDISTRIBUTED_SKILLS.
 *   [STALE-DIGEST]    an entry exists but its digest does not match a fresh
 *                      sha256 of the on-disk SKILL.md — the published copy
 *                      has drifted from source. Fix: `npm run sync:generated`
 *                      (or `npx nx run <skill>:sync-discovery`).
 *   [NO-FILES]        an entry exists and its digest matches, but
 *                      docs/public/.well-known/agent-skills/<name>/SKILL.md
 *                      is missing from disk — the index says it's there, the
 *                      file mirror does not agree.
 *   [MIRROR-DRIFT]    the mirrored file exists and index.json's digest
 *                      matches the source, but the mirrored file's own bytes
 *                      don't — the published copy was edited directly and no
 *                      longer matches what it claims to be a copy of.
 *
 * And on the allowlist itself:
 *   [DEAD-ALLOWLIST] UNDISTRIBUTED_SKILLS names a skill that no longer
 *                     exists under skills/ (or no longer has a SKILL.md) —
 *                     the exemption outlived its subject.
 *
 * Deliberately OUT of scope: index.json entries with no matching skills/
 * directory (storybook-angular, storybook-react, storybook-vue) — those are
 * hand-authored directly at the discovery endpoint with no skills/ source of
 * truth to compare against, so this gate has nothing to check them against.
 * Also out of scope: .claude/skills/** (e.g. uianatomy-mcp) — a local-only
 * Claude Code skill, never intended for the public endpoint.
 *
 * Run via:  node tools/scripts/check-skill-discovery.mjs
 *           (or  npm run check:skill-discovery)
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { discoverSkillNames, digestSkillMd } from './lib/skill-discovery.mjs';
import allowlists from './lib/allowlists.js';

const { UNDISTRIBUTED_SKILLS } = allowlists;

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SKILLS_ROOT = resolve(ROOT, 'skills');
const DISCOVERY_ROOT = resolve(ROOT, 'docs/public/.well-known/agent-skills');
const INDEX_PATH = resolve(DISCOVERY_ROOT, 'index.json');

const errors = [];
const fail = (tag, msg) => errors.push(`✗ [${tag}] ${msg}`);

const index = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
const byName = new Map((index.skills ?? []).map((entry) => [entry.name, entry]));

const skillNames = discoverSkillNames(SKILLS_ROOT);
let checked = 0;

for (const name of skillNames) {
  if (Object.prototype.hasOwnProperty.call(UNDISTRIBUTED_SKILLS, name)) {
    continue; // deliberately undistributed, reason lives in allowlists.js
  }
  checked++;

  const entry = byName.get(name);
  if (!entry) {
    fail(
      'MISSING',
      `skills/${name}/SKILL.md exists but there is no "${name}" entry in ` +
        `${path_rel(INDEX_PATH)}. Run: npm run sync:generated (or add "${name}" ` +
        `to UNDISTRIBUTED_SKILLS in tools/scripts/lib/allowlists.js with a reason).`,
    );
    continue;
  }

  const skillMdPath = resolve(SKILLS_ROOT, name, 'SKILL.md');
  const freshDigest = digestSkillMd(readFileSync(skillMdPath, 'utf8'));
  if (entry.digest !== freshDigest) {
    fail(
      'STALE-DIGEST',
      `${name}: index.json digest (${entry.digest}) does not match the on-disk ` +
        `SKILL.md (${freshDigest}). Run: npm run sync:generated.`,
    );
    continue;
  }

  const mirroredPath = resolve(DISCOVERY_ROOT, name, 'SKILL.md');
  if (!existsSync(mirroredPath)) {
    fail(
      'NO-FILES',
      `${name}: index.json entry exists and its digest matches, but ` +
        `${path_rel(mirroredPath)} is missing. Run: npm run sync:generated.`,
    );
    continue;
  }

  // index.json's digest matching the *source* SKILL.md is not enough — the
  // published copy under docs/public could itself have been hand-edited
  // after the last sync and now disagree with both. Check the mirror's own
  // bytes, not just that a file happens to exist at that path.
  const mirroredDigest = digestSkillMd(readFileSync(mirroredPath, 'utf8'));
  if (mirroredDigest !== freshDigest) {
    fail(
      'MIRROR-DRIFT',
      `${name}: ${path_rel(mirroredPath)} (${mirroredDigest}) does not match the ` +
        `source skills/${name}/SKILL.md (${freshDigest}), even though index.json's ` +
        `digest agrees with the source. The published copy was edited directly. ` +
        `Run: npm run sync:generated.`,
    );
  }
}

for (const name of Object.keys(UNDISTRIBUTED_SKILLS)) {
  if (!skillNames.includes(name)) {
    fail(
      'DEAD-ALLOWLIST',
      `UNDISTRIBUTED_SKILLS names "${name}" but skills/${name}/SKILL.md no longer ` +
        `exists — remove the entry from tools/scripts/lib/allowlists.js.`,
    );
  }
}

function path_rel(p) {
  return p.replace(ROOT + '/', '');
}

if (errors.length > 0) {
  for (const e of errors) console.error(e);
  console.error(`\n${errors.length} skill-discovery issue(s) found.`);
  process.exit(1);
} else {
  console.log(
    `✓ skill discovery in sync — ${checked} skill(s) under skills/ all present in ` +
      `${path_rel(INDEX_PATH)} with matching digests` +
      (Object.keys(UNDISTRIBUTED_SKILLS).length
        ? ` (${Object.keys(UNDISTRIBUTED_SKILLS).length} allowlisted as undistributed)`
        : ''),
  );
}
