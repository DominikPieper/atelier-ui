import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyFixture, runBin } from './helpers.mjs';

const FAKE_SERVER = join(
  dirname(fileURLToPath(import.meta.url)),
  'fake-figma-console.mjs',
);

const master = (name) => ({
  name,
  description: `${name} description`,
  properties: { Variante: 'VARIANT' },
  variantAxes: { Variante: ['primär', 'sekundär'] },
  variants: [{ Variante: 'primär' }, { Variante: 'sekundär' }],
});

/**
 * Run `figma-snapshot-contracts` in a copy of the fixture against the fake
 * figma-console server. The script spawns `npx -y figma-console-mcp@<v>`; a
 * stub `npx` first on PATH starts the fake instead, so the real child-process
 * and stdio-transport path is exercised without a live Figma.
 */
function runSnapshot({ files, active, args }) {
  const fx = copyFixture();
  const scratch = mkdtempSync(join(tmpdir(), 'fake-figma-'));
  try {
    fx.writeJson('.mcp.json', {
      mcpServers: {
        'figma-console': { args: ['-y', 'figma-console-mcp@1.40.0'] },
      },
    });
    const state = join(scratch, 'state.json');
    const callLog = join(scratch, 'calls.jsonl');
    writeFileSync(state, JSON.stringify({ files, active }));
    writeFileSync(callLog, '');
    const shim = join(scratch, 'npx');
    writeFileSync(
      shim,
      `#!/bin/sh\nexec "${process.execPath}" "${FAKE_SERVER}"\n`,
    );
    chmodSync(shim, 0o755);

    const result = runBin('figma-snapshot-contracts', args(fx.dir), {
      cwd: fx.dir,
      env: {
        PATH: `${scratch}${delimiter}${process.env.PATH}`,
        FAKE_FIGMA_STATE: state,
        FAKE_FIGMA_LOG: callLog,
      },
    });
    const calls = readFileSync(callLog, 'utf8')
      .split('\n')
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    return {
      ...result,
      calls,
      fx,
      cleanup: () => (
        fx.remove(),
        rmSync(scratch, { recursive: true, force: true })
      ),
    };
  } catch (e) {
    fx.remove();
    rmSync(scratch, { recursive: true, force: true });
    throw e;
  }
}

test('writes the snapshot into an output directory that does not exist yet', () => {
  const run = runSnapshot({
    files: [
      {
        fileKey: 'AAA',
        fileName: 'A',
        masters: { '10:1': master('Schaltfläche A') },
      },
    ],
    active: 'AAA',
    args: () => ['--file', 'AAA', '--out', 'out/nested/snapshot.json'],
  });
  try {
    assert.equal(run.status, 0, run.stdout + run.stderr);
    const out = join(run.fx.dir, 'out/nested/snapshot.json');
    assert.ok(existsSync(out), 'snapshot was not written');
    const snapshot = JSON.parse(readFileSync(out, 'utf8'));
    assert.equal(snapshot.meta.fileKey, 'AAA');
    assert.equal(snapshot.components[0].selector, 'NButton');
    assert.equal(snapshot.components[0].name, 'Schaltfläche A');
  } finally {
    run.cleanup();
  }
});

test('--file targets the requested file among several connected ones', () => {
  const run = runSnapshot({
    files: [
      {
        fileKey: 'AAA',
        fileName: 'A',
        masters: { '10:1': master('Schaltfläche A') },
      },
      {
        fileKey: 'BBB',
        fileName: 'B',
        masters: { '10:1': master('Schaltfläche B') },
      },
    ],
    active: 'AAA',
    args: () => ['--file', 'BBB', '--out', 'snapshot.out.json'],
  });
  try {
    assert.equal(run.status, 0, run.stdout + run.stderr);
    const snapshot = run.fx.readJson('snapshot.out.json');
    assert.equal(snapshot.meta.fileKey, 'BBB');
    assert.equal(snapshot.components[0].name, 'Schaltfläche B');
    // The user's active file is left alone: no navigation, no pinning.
    assert.ok(!run.calls.some((c) => c.name === 'figma_navigate'));
  } finally {
    run.cleanup();
  }
});

test('--file naming a file that is not connected exits 2 and lists the connected ones', () => {
  const run = runSnapshot({
    files: [
      {
        fileKey: 'AAA',
        fileName: 'A',
        masters: { '10:1': master('Schaltfläche A') },
      },
      {
        fileKey: 'BBB',
        fileName: 'B',
        masters: { '10:1': master('Schaltfläche B') },
      },
    ],
    active: 'AAA',
    args: () => ['--file', 'CCC', '--out', 'snapshot.out.json'],
  });
  try {
    assert.equal(run.status, 2, run.stdout + run.stderr);
    assert.match(run.stderr, /CCC/);
    assert.match(run.stderr, /not connected/);
    assert.match(run.stderr, /AAA/);
    assert.match(run.stderr, /BBB/);
    assert.ok(!existsSync(join(run.fx.dir, 'snapshot.out.json')));
  } finally {
    run.cleanup();
  }
});
