import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createServer } from '../src/server.mjs';

// Quiet by default: createServer logs a version warning to stderr; these tests assert on the
// returned values, not on the log.
const options = (env = {}) => ({
  cwd: '/nonexistent-consumer',
  env: { ATELIER_MCP_VERSION_CHECK: 'off', ...env },
});

test('default build has every layer on', async () => {
  const { layers } = await createServer(options());
  assert.deepEqual(
    layers.map((layer) => layer.id),
    ['api', 'purpose', 'tokens', 'composition'],
  );
});

test('an unknown layer id fails createServer', async () => {
  await assert.rejects(
    createServer(options({ ATELIER_MCP_LAYERS: 'nope' })),
    /unknown layer/,
  );
});

test('the version check can be switched off for the lab', async () => {
  const { server } = await createServer(options());
  assert.ok(server);
});
