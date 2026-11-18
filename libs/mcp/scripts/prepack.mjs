#!/usr/bin/env node
// npm runs `prepack` before `npm pack` and `npm publish`. The snapshot is generated and not
// committed, so it is rebuilt here, and the tarball can never carry a stale or missing one. The
// static Angular Storybook ships too (storybook/), for a consumer to mount at /atelier/.
import { cpSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSnapshot } from './build-snapshot.mjs';

const PKG_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const STORYBOOK_BUILD = join(
  PKG_ROOT,
  '..',
  '..',
  'dist',
  'storybook',
  'angular',
);

try {
  buildSnapshot();
  if (!existsSync(join(STORYBOOK_BUILD, 'index.html')))
    throw new Error(
      'no Storybook build. Run "npx nx build-storybook angular" first.',
    );
  rmSync(join(PKG_ROOT, 'storybook'), { recursive: true, force: true });
  cpSync(STORYBOOK_BUILD, join(PKG_ROOT, 'storybook'), { recursive: true });
  console.error('prepack ok: snapshot built, Storybook copied.');
} catch (err) {
  console.error(`prepack failed: ${err.message}`);
  process.exit(1);
}
