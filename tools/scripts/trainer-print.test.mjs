// Run with: node --test tools/scripts/trainer-print.test.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = join(
  dirname(fileURLToPath(import.meta.url)),
  'trainer-print.mjs',
);
let out;
let day1;
let day2;

before(() => {
  out = mkdtempSync(join(tmpdir(), 'trainer-print-'));
  execFileSync('node', [script, '--out', out], { stdio: 'pipe' });
  day1 = readFileSync(join(out, 'day-1.md'), 'utf8');
  day2 = readFileSync(join(out, 'day-2.md'), 'utf8');
});
after(() => rmSync(out, { recursive: true, force: true }));

test('day 1 carries its own material and none of day 2', () => {
  for (const s of ['Kata against the clock', '## D-5', '## 1. ', '## Day 1:'])
    assert.ok(day1.includes(s), s);
  for (const s of ['## D-8', '## 3. ']) assert.ok(!day1.includes(s), s);
});

test('day 2 carries its own material and none of day 1', () => {
  for (const s of ['## D-8', '## 3. ', '## Day 2:', '## End-of-Day-2'])
    assert.ok(day2.includes(s), s);
  assert.ok(!day2.includes('## D-5'));
});
