/**
 * Build-time metadata for the figma-workspace-architect skill.
 *
 * Canonical source is `skills/figma-workspace-architect/` at the repo root:
 * `.claude/skills/figma-workspace-architect` is a symlink to it, and
 * `docs/public/.well-known/agent-skills/figma-workspace-architect/` is a
 * synced distribution copy. Reading the source (not the synced copy) means
 * the docs are correct even when a sync hasn't run yet — and the build fails
 * loudly if the skill directory moves.
 *
 * Node-only (fs/path): import from `.astro` frontmatter, never from client code.
 * Paths are resolved from the repo root (found via nx.json) rather than
 * import.meta.url, because Astro bundles this module into a prerender chunk
 * at a different directory depth.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

function findRepoRoot(start: string): string {
  let dir = start;
  while (!existsSync(join(dir, 'nx.json'))) {
    const parent = dirname(dir);
    if (parent === dir) {
      throw new Error(`skill-meta: repo root (nx.json) not found walking up from ${start}`);
    }
    dir = parent;
  }
  return dir;
}

/** Absolute path of the workspace root — exported for other build-time fs reads. */
export const repoRoot: string = findRepoRoot(process.cwd());

const skillDir = join(repoRoot, 'skills/figma-workspace-architect');

/** Version from the skill's package.json (single source of truth, bumped by release). */
export const skillVersion: string = JSON.parse(
  readFileSync(join(skillDir, 'package.json'), 'utf-8'),
).version;

/** Markdown reference files shipped in the skill's references/ directory. */
export const referenceFiles: string[] = readdirSync(join(skillDir, 'references'))
  .filter((file) => file.endsWith('.md'))
  .sort();

export const referenceCount: number = referenceFiles.length;
