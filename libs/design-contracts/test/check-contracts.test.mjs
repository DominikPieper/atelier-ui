import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  FIXTURE_DIR,
  copyFixture,
  goldenPath,
  parityDiscrepancies,
  readGolden,
  runBin,
} from './helpers.mjs';

// The fixture is a small non-Atelier design system: one Angular component
// (`NButton`), German Figma names mapped to English props through `axisMap`,
// a `--n-` token prefix, a hand-written snapshot.

test('a clean fixture exits 0 with no findings', () => {
  const r = runBin('check-contracts', ['--report'], { cwd: FIXTURE_DIR });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /ok {2}NButton \(props: 6, stories: 8\)/);
  assert.match(r.stdout, /total: 0 error\(s\), 0 warning\(s\)/);
});

test('Figma drift (an axis value the contract does not cover) exits 1 with [AXIS]', () => {
  const fx = copyFixture();
  try {
    const snapshot = fx.readJson('snapshot.json');
    snapshot.components[0].variantAxes['Größe'].push('groß');
    fx.writeJson('snapshot.json', snapshot);

    const r = runBin('check-contracts', [], { cwd: fx.dir });
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(
      r.stdout,
      /\[AXIS\] \(angular\) NButton: axis 'Größe' values not covered by axisMap or figmaOnly: groß/,
    );
    assert.match(r.stdout, /total: 1 error\(s\)/);
  } finally {
    fx.remove();
  }
});

test('code drift (an enum value no story sets) exits 1 with [COVERAGE]', () => {
  const fx = copyFixture();
  try {
    const story = join(fx.dir, 'src/n-button/n-button.stories.ts');
    const source = readFileSync(story, 'utf8').replace(
      "export const Secondary: Story = { args: { variant: 'secondary' } };\n",
      '',
    );
    writeFileSync(story, source);

    const r = runBin('check-contracts', [], { cwd: fx.dir });
    assert.equal(r.status, 1, r.stdout + r.stderr);
    assert.match(r.stdout, /\[COVERAGE\] \(angular\) NButton: prop 'variant'/);
  } finally {
    fx.remove();
  }
});

test('an unknown framework is a configuration error: exit 2', () => {
  const r = runBin('check-contracts', ['--fw', 'svelte'], {
    cwd: FIXTURE_DIR,
  });
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /Unknown framework 'svelte'/);
});

test('invalid contracts.config.json is a configuration error: exit 2', () => {
  const fx = copyFixture();
  try {
    writeFileSync(join(fx.dir, 'contracts.config.json'), '{ nope');
    const r = runBin('check-contracts', [], { cwd: fx.dir });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /invalid JSON/);
  } finally {
    fx.remove();
  }
});

test('a missing required setting is a configuration error: exit 2', () => {
  const fx = copyFixture();
  try {
    const config = fx.readJson('contracts.config.json');
    delete config.snapshot;
    fx.writeJson('contracts.config.json', config);
    const r = runBin('check-contracts', [], { cwd: fx.dir });
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /No Figma snapshot set/);
  } finally {
    fx.remove();
  }
});

test('--emit writes the codeSpec (golden)', () => {
  const fx = copyFixture();
  try {
    const r = runBin('check-contracts', ['--emit', 'out'], { cwd: fx.dir });
    assert.equal(r.status, 0, r.stdout + r.stderr);
    const actual = readFileSync(
      join(fx.dir, 'out/angular/NButton.codespec.json'),
      'utf8',
    );
    if (process.env.UPDATE_GOLDEN) {
      writeFileSync(goldenPath('NButton.codespec.json'), actual);
    }
    assert.equal(actual, readGolden('NButton.codespec.json'));
  } finally {
    fx.remove();
  }
});

function emitCodeSpec(fx, expectedStatus = 0) {
  const r = runBin('check-contracts', ['--emit', 'out'], { cwd: fx.dir });
  assert.equal(r.status, expectedStatus, r.stdout + r.stderr);
  return fx.readJson('out/angular/NButton.codespec.json');
}

test('--emit: deliberate Figma/code differences do not surface as parity discrepancies', () => {
  const fx = copyFixture();
  try {
    const codeSpec = emitCodeSpec(fx);
    const master = fx.readJson('snapshot.json').components[0];
    assert.deepEqual(
      parityDiscrepancies(master, codeSpec.componentAPI.props),
      [],
    );
    // The parity tool's schema takes event names, not objects.
    assert.deepEqual(codeSpec.componentAPI.events, ['pressed']);
    // codeOnly: left out. axisMap: no second copy under the code name.
    const names = codeSpec.componentAPI.props.map((p) => p.name);
    for (const codeName of ['tone', 'variant', 'size', 'selected', 'disabled'])
      assert.ok(!names.includes(codeName), `${codeName} was emitted`);
  } finally {
    fx.remove();
  }
});

test('--emit: a difference the contract does not record is still reported', () => {
  const fx = copyFixture();
  try {
    // The same contract, minus the axisMap entry for the German size axis.
    const contract = join(fx.dir, 'contracts/n-button.contract.ts');
    const source = readFileSync(contract, 'utf8');
    const start = source.indexOf("figmaAxis: 'Größe'");
    const entryStart = source.lastIndexOf('\n    {', start);
    const entryEnd = source.indexOf('\n    },', start) + '\n    },'.length;
    writeFileSync(
      contract,
      source.slice(0, entryStart) + source.slice(entryEnd),
    );
    const codeSpec = emitCodeSpec(fx, 1); // the AXIS error is expected
    const master = fx.readJson('snapshot.json').components[0];
    const found = parityDiscrepancies(master, codeSpec.componentAPI.props);
    assert.deepEqual(found, [
      'minor: code prop size has no Figma property',
      'info: Figma property Größe has no code prop',
    ]);
  } finally {
    fx.remove();
  }
});

test('--emit: a component without a snapshot master keeps the code names', () => {
  const fx = copyFixture();
  try {
    const snapshot = fx.readJson('snapshot.json');
    snapshot.components = [];
    fx.writeJson('snapshot.json', snapshot);
    const codeSpec = emitCodeSpec(fx);
    assert.deepEqual(codeSpec.componentAPI.props.map((p) => p.name).sort(), [
      'disabled',
      'selected',
      'size',
      'tone',
      'variant',
    ]);
  } finally {
    fx.remove();
  }
});

test('--emit: a boolean code prop on a Figma axis states true/false, so value drift on that axis is reported', () => {
  const fx = copyFixture();
  try {
    const snapshot = fx.readJson('snapshot.json');
    snapshot.components[0].variantAxes['Ausgewählt'] = ['ja', 'nein'];
    fx.writeJson('snapshot.json', snapshot);
    // The gate lets a no-values axisMap cover every axis value, so it stays 0.
    const codeSpec = emitCodeSpec(fx);
    const prop = codeSpec.componentAPI.props.find(
      (p) => p.name === 'Ausgewählt',
    );
    assert.deepEqual(prop.values, ['true', 'false']);
    assert.deepEqual(
      parityDiscrepancies(snapshot.components[0], codeSpec.componentAPI.props),
      [
        'major: Ausgewählt value true is not in Figma',
        'major: Ausgewählt value false is not in Figma',
        'info: Ausgewählt value ja is not in code',
        'info: Ausgewählt value nein is not in code',
      ],
    );
  } finally {
    fx.remove();
  }
});
