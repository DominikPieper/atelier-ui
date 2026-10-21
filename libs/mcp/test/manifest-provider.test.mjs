import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { manifestProvider } from '../src/manifest-provider.mjs';

async function withSnapshot(fn) {
  const root = mkdtempSync(join(tmpdir(), 'atelier-mcp-provider-'));
  try {
    mkdirSync(join(root, 'manifests'), { recursive: true });
    writeFileSync(join(root, 'manifests', 'components.json'), '{"ok":true}');
    writeFileSync(join(root, 'über.json'), '{"umlaut":true}');
    return await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test('reads a path relative to the snapshot root, with or without ./', () =>
  withSnapshot(async (root) => {
    assert.equal(
      await manifestProvider(undefined, './manifests/components.json', root),
      '{"ok":true}',
    );
    assert.equal(
      await manifestProvider(undefined, 'manifests/components.json', root),
      '{"ok":true}',
    );
  }));

test('decodes the percent-encoding @storybook/mcp puts into $ref paths', () =>
  withSnapshot(async (root) => {
    assert.equal(
      await manifestProvider(undefined, './%C3%BCber.json', root),
      '{"umlaut":true}',
    );
  }));

test('rejects traversal, plain and percent-encoded', () =>
  withSnapshot(async (root) => {
    await assert.rejects(
      manifestProvider(undefined, '../outside.json', root),
      /outside the snapshot/,
    );
    await assert.rejects(
      manifestProvider(undefined, '..%2F..%2Fetc%2Fpasswd', root),
      /outside the snapshot/,
    );
  }));

test('rejects an invalid percent-encoding', () =>
  withSnapshot(async (root) => {
    await assert.rejects(
      manifestProvider(undefined, './%E0%A4%A.json', root),
      /percent-encoding/,
    );
  }));
