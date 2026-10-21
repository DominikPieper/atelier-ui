#!/usr/bin/env node
// Copies `manifests/` and `services/` from the Angular Storybook build (dist/storybook/angular)
// into this package's snapshot, layout unchanged: the manifests reference their docgen, story and
// MDX shards by `$ref` into `services/`, so the provider needs both. Does not run the Storybook
// build itself (`npx nx build-storybook angular`, cached by Nx). The snapshot is generated, not
// committed (see .gitignore): it is a projection of the build, and a committed copy would go
// stale against the library on every change. It is rewritten from scratch on each run.
import { cpSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildKnowledge } from './build-knowledge.mjs';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_STORYBOOK_STATIC = join(
  PKG_ROOT,
  '..',
  '..',
  'dist',
  'storybook',
  'angular',
);
const DEFAULT_SNAPSHOT_DIR = join(PKG_ROOT, 'snapshot');
const BUILD_HINT = 'Run "npx nx build-storybook angular" first.';

// `manifests/` also holds `components.html`, a human-readable debug page of ~430 KB that no tool
// ever requests; only JSON is copied from it. `services/` is copied whole.
const isJsonOrDir = (src) =>
  statSync(src).isDirectory() || src.endsWith('.json');

/** The files the manifest provider reads first; without them the snapshot is useless. */
export const REQUIRED_FILES = [
  'manifests/components.json',
  'manifests/docs.json',
  'knowledge/components.json',
  'knowledge/tokens.json',
];

/**
 * @param {{ storybookStatic?: string, snapshotDir?: string, repoRoot?: string }} [options]
 * @returns {string} the snapshot directory written
 */
export function buildSnapshot({
  storybookStatic = DEFAULT_STORYBOOK_STATIC,
  snapshotDir = DEFAULT_SNAPSHOT_DIR,
  repoRoot,
} = {}) {
  for (const name of ['manifests', 'services']) {
    const src = join(storybookStatic, name);
    if (!existsSync(src))
      throw new Error(
        `Storybook build output missing: "${src}". ${BUILD_HINT}`,
      );
  }

  rmSync(snapshotDir, { recursive: true, force: true });
  mkdirSync(snapshotDir, { recursive: true });
  cpSync(join(storybookStatic, 'manifests'), join(snapshotDir, 'manifests'), {
    recursive: true,
    filter: isJsonOrDir,
  });
  cpSync(join(storybookStatic, 'services'), join(snapshotDir, 'services'), {
    recursive: true,
  });

  // The knowledge layers (L1, L2) come from the repo, not from the Storybook build.
  buildKnowledge({ snapshotDir, ...(repoRoot ? { repoRoot } : {}) });

  for (const name of REQUIRED_FILES) {
    if (!existsSync(join(snapshotDir, name))) {
      throw new Error(
        `Snapshot incomplete: "${join(snapshotDir, name)}" is missing after copying.`,
      );
    }
  }
  return snapshotDir;
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  try {
    // stderr, not stdout: this also runs from prepack inside `npm pack`, whose stdout must carry
    // only the tarball name.
    console.error(`Snapshot built: ${buildSnapshot()}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}
