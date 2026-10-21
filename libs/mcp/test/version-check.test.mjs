import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  checkVersion,
  resolveInstalledVersion,
} from '../src/version-check.mjs';

test('equal versions: no note anywhere', () => {
  assert.deepEqual(checkVersion('1.2.3', '1.2.3'), {
    instructionsNote: null,
    stderrNote: null,
  });
});

test('different versions: warns in instructions and on stderr, names both versions', () => {
  const { instructionsNote, stderrNote } = checkVersion('1.2.3', '1.0.0');
  assert.match(instructionsNote, /1\.2\.3/);
  assert.match(instructionsNote, /1\.0\.0/);
  assert.match(stderrNote, /^\[atelier-mcp\] Warning/);
});

test('library not installed: a note for the agent, nothing on stderr', () => {
  const { instructionsNote, stderrNote } = checkVersion('1.2.3', null);
  assert.match(instructionsNote, /not installed/);
  assert.equal(stderrNote, null);
});

test('resolveInstalledVersion reads the consumer cwd, null when absent', () => {
  const dir = mkdtempSync(join(tmpdir(), 'atelier-mcp-version-'));
  try {
    assert.equal(resolveInstalledVersion(dir), null);
    const lib = join(dir, 'node_modules', '@atelier-ui', 'angular');
    mkdirSync(lib, { recursive: true });
    writeFileSync(
      join(lib, 'package.json'),
      JSON.stringify({ name: '@atelier-ui/angular', version: '4.5.6' }),
    );
    assert.equal(resolveInstalledVersion(dir), '4.5.6');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
