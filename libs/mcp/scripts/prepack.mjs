#!/usr/bin/env node
// npm runs `prepack` before `npm pack` and `npm publish`. The snapshot is generated and not
// committed, so it is rebuilt here, and the tarball can never carry a stale or missing one.
import { buildSnapshot } from './build-snapshot.mjs';

try {
  buildSnapshot();
  console.error('prepack ok: snapshot built.');
} catch (err) {
  console.error(`prepack failed: ${err.message}`);
  process.exit(1);
}
