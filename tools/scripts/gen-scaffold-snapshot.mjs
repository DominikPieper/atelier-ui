#!/usr/bin/env node
/**
 * gen-scaffold-snapshot.mjs
 *
 * `libs/create-workspace/src/generators/preset/files/figma/snapshot.json` is a
 * PROJECTION of this repo's own `tools/figma/snapshot.json`: just the
 * AtlButton master entry, in the shape `check-contracts.mjs` consumes
 * (`selector`, `nodeId`, `name`, `description`, `variantAxes`, `properties`,
 * `variants`) — the same shape `figma-snapshot-contracts.mjs` produces. It
 * exists so a freshly scaffolded workspace's `npm run check:contracts` has a
 * Figma side to check the example AtlButton contract + story against on day
 * one, before the attendee ever runs `figma:snapshot` themselves.
 *
 * Unlike the tools/scripts/*.mjs pair sync-preflight.mjs owns, this is not a
 * byte-identical copy of a source file — it is DERIVED (one component
 * extracted and re-shaped out of 43), so it gets its own generator rather
 * than joining FILES in sync-preflight.mjs.
 *
 *   node tools/scripts/gen-scaffold-snapshot.mjs          # regenerate the projection
 *   node tools/scripts/gen-scaffold-snapshot.mjs --check  # fail non-zero on drift
 *
 * --check is `check:scaffold-snapshot`, folded into `check:all` immediately
 * after `check:preflight-clone-sync` — the two gates guard the same kind of
 * fact (a preset template file drifting from its source of truth) and belong
 * next to each other in the chain.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = 'tools/figma/snapshot.json';
const TARGET =
  'libs/create-workspace/src/generators/preset/files/figma/snapshot.json';
const PROJECTED_SELECTOR = 'AtlButton';

function buildProjection() {
  const snapshot = JSON.parse(readFileSync(resolve(ROOT, SOURCE), 'utf-8'));
  const master = snapshot.components.find(
    (c) => c.selector === PROJECTED_SELECTOR,
  );
  if (!master) {
    throw new Error(
      `${SOURCE} has no '${PROJECTED_SELECTOR}' master — nothing to project.`,
    );
  }
  return {
    meta: {
      fileKey: snapshot.meta?.fileKey ?? null,
      figmaLastModified: snapshot.meta?.figmaLastModified ?? null,
      projectedFrom: SOURCE,
    },
    components: [
      {
        selector: master.selector,
        nodeId: master.nodeId,
        name: master.name,
        description: master.description ?? '',
        variantAxes: master.variantAxes ?? {},
        properties: master.properties ?? {},
        variants: master.variants ?? [],
      },
    ],
  };
}

const mode = process.argv[2];
const expected = JSON.stringify(buildProjection(), null, 2) + '\n';

if (mode === '--check') {
  let actual = null;
  try {
    actual = readFileSync(resolve(ROOT, TARGET), 'utf-8');
  } catch {
    // actual stays null — reported as drift below
  }
  if (actual !== expected) {
    console.error(
      `[DRIFT] ${TARGET} does not match the current '${PROJECTED_SELECTOR}' master in ${SOURCE}.`,
    );
    console.error(`Run: node tools/scripts/gen-scaffold-snapshot.mjs`);
    process.exit(1);
  }
  console.log(
    `✓ ${TARGET} matches the '${PROJECTED_SELECTOR}' master in ${SOURCE}`,
  );
  process.exit(0);
}

const targetPath = resolve(ROOT, TARGET);
mkdirSync(dirname(targetPath), { recursive: true });
writeFileSync(targetPath, expected);
console.log(`wrote ${TARGET}`);
