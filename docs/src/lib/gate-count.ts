/**
 * Build-time gate count for `check:all` — derived from `package.json`'s
 * `check:all` script rather than hand-maintained. The number of gates has
 * gone stale four times in two days (29 -> 34 -> 35 -> 36 -> 37), each
 * change caught by a person re-reading it out of `package.json` and copying
 * it into prose elsewhere. Counting the actual chain removes that step.
 *
 * Node-only (fs/path): import from `.astro` frontmatter, never client code.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from './skill-meta';

const pkg: { scripts?: Record<string, string> } = JSON.parse(
  readFileSync(join(repoRoot, 'package.json'), 'utf-8'),
);

const checkAll = pkg.scripts?.['check:all'] ?? '';
const matches = checkAll.match(/npm run check:[a-zA-Z0-9:-]+/g);
if (!matches || matches.length === 0) {
  throw new Error(
    "gate-count: package.json's check:all script has no `npm run check:*` calls to count — did the script get renamed?",
  );
}

/** Number of gates chained in `npm run check:all`, the release gate. */
export const gateCount: number = matches.length;
