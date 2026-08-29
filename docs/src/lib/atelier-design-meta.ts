/**
 * Build-time metadata for the atelier-design skill.
 *
 * Canonical source is `skills/atelier-design/` at the repo root
 * (`.claude/skills/atelier-design` is a symlink to it). Unlike
 * figma-workspace-architect, this skill has no `.well-known/agent-skills/`
 * distribution copy — it ships in the repo only, and the docs page says so
 * rather than linking a URL that does not resolve.
 *
 * The typeface names are PARSED from the skill's own token sheet rather than
 * typed here. That is the whole point: the 2026-08-28 review found the sheet
 * still declaring Inter and Fira Code — the brand the library retired on
 * 2026-08-26 — while every page describing it said otherwise. Deriving the
 * names means the page and the sheet cannot disagree, and `check:tokens`
 * keeps the sheet itself identical to `tokens.css`.
 *
 * Node-only (fs/path): import from `.astro` frontmatter, never from client code.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './skill-meta';

const skillDir = join(repoRoot, 'skills/atelier-design');

export const designSkillVersion: string = JSON.parse(
  readFileSync(join(skillDir, 'package.json'), 'utf-8'),
).version;

export const designReferenceFiles: string[] = readdirSync(join(skillDir, 'references'))
  .filter((file) => file.endsWith('.md'))
  .sort();

export const designPreviewCount: number = readdirSync(join(skillDir, 'preview')).filter((f) =>
  f.endsWith('.html'),
).length;

const tokenSheet = readFileSync(join(skillDir, 'assets/colors_and_type.css'), 'utf-8');

/** Distinct `--ui-*` custom properties the sheet declares. */
export const designTokenCount: number = new Set(
  [...tokenSheet.matchAll(/(--ui-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
).size;

/** Composed `--ui-type-*` roles — the layer the skill should reference. */
export const designTypeRoleCount: number = new Set(
  [...tokenSheet.matchAll(/(--ui-type-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
).size;

/** First quoted family of a `--ui-font-*` stack, e.g. `--ui-font-mono` → `JetBrains Mono`. */
function family(token: string): string {
  const declaration = new RegExp(`--ui-font-${token}\\s*:\\s*'([^']+)'`).exec(tokenSheet);
  if (!declaration) {
    throw new Error(
      `atelier-design-meta: the skill's colors_and_type.css declares no --ui-font-${token}. ` +
        `Run: node tools/scripts/sync-tokens.mjs`,
    );
  }
  return declaration[1];
}

export const designTypefaces = {
  ui: family('family'),
  display: family('display'),
  mono: family('mono'),
};
