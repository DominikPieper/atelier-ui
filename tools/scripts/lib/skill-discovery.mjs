/**
 * Shared logic between tools/scripts/sync-skill-discovery.mjs (what to
 * mirror into the public discovery endpoint) and
 * tools/scripts/check-skill-discovery.mjs (what must already be there).
 * Both derive the skill roster and digest the same way so they can never
 * quietly disagree with each other.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Every directory under `skillsRoot` that ships a SKILL.md, sorted for a
 * stable order. Filesystem-derived on purpose — a maintained name list is
 * exactly what let `atelier-design` ship a SKILL.md with no discovery entry
 * and nothing complain.
 * @param {string} skillsRoot absolute path to the repo's `skills/` directory
 * @returns {string[]}
 */
export function discoverSkillNames(skillsRoot) {
  return readdirSync(skillsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(resolve(skillsRoot, name, 'SKILL.md')))
    .sort();
}

/**
 * sha256 digest of a SKILL.md's contents, in the `sha256:<hex>` form the
 * discovery index stores it in.
 * @param {string} skillMdText
 * @returns {string}
 */
export function digestSkillMd(skillMdText) {
  return 'sha256:' + createHash('sha256').update(skillMdText).digest('hex');
}
