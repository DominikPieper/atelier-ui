import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { createCompositionLayer } from '../src/layer-composition.mjs';
import { createPurposeLayer } from '../src/layer-purpose.mjs';
import { LAYERS, resolveLayers } from '../src/layers.mjs';
import { createManifestProvider } from '../src/manifest-provider.mjs';

const pattern = (id, title, components, extra = {}) => ({
  id,
  title,
  description: `${title} description.`,
  components,
  whenNotToUse: [],
  pitfalls: [],
  ...extra,
});
const PATTERNS = {
  patterns: [
    pattern(
      'confirmation-dialog',
      'Confirmation Dialog',
      ['AtlDialog', 'AtlButton'],
      {
        whenNotToUse: ['Type-to-confirm: use a page or an AtlDrawer.'],
        pitfalls: ['Autofocus on the destructive button.'],
      },
    ),
    pattern('login', 'Login Form', ['AtlCard', 'AtlButton']),
    pattern('settings', 'Settings Page', [
      'AtlCard',
      'AtlButton',
      'AtlTabGroup',
    ]),
    pattern('list', 'Data List', ['AtlCard', 'AtlButton']),
  ],
};
const COMPONENTS = {
  AtlDialog: { whenToUse: ['Confirming.'], whenNotToUse: [], related: [] },
};
const DOCGEN = JSON.stringify({
  components: {
    d: { id: 'd', name: 'AtlDialog', description: 'Modal dialog.' },
    b: { id: 'b', name: 'AtlButton', description: 'Button.' },
    o: { id: 'o', name: 'AtlOther', description: 'Other.' },
  },
});
const PATH = './services/core/docgen/components-overlay-atldialog.json';

async function withSnapshot(fn) {
  const root = mkdtempSync(join(tmpdir(), 'atelier-mcp-composition-'));
  try {
    mkdirSync(join(root, 'knowledge'), { recursive: true });
    mkdirSync(join(root, 'services', 'core', 'docgen'), { recursive: true });
    writeFileSync(
      join(root, 'knowledge', 'patterns.json'),
      JSON.stringify(PATTERNS),
    );
    writeFileSync(
      join(root, 'knowledge', 'components.json'),
      JSON.stringify(COMPONENTS),
    );
    writeFileSync(join(root, PATH), DOCGEN);
    return await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}
const descriptions = (text) =>
  Object.fromEntries(
    Object.values(JSON.parse(text).components).map((c) => [
      c.name,
      c.description,
    ]),
  );

test('the shipped registry ends with composition', () => {
  assert.deepEqual(
    LAYERS.map((layer) => layer.id),
    ['api', 'purpose', 'tokens', 'composition'],
  );
});

test('composition off: the docgen shard is served byte-identical', () =>
  withSnapshot(async (root) => {
    const layers = resolveLayers('api,purpose', [
      LAYERS[0],
      createPurposeLayer({ root }),
      createCompositionLayer({ root }),
    ]);
    const provider = createManifestProvider({ layers, root });
    assert.ok(!(await provider(undefined, PATH)).includes('Composition'));
    const none = createManifestProvider({ layers: [LAYERS[0]], root });
    assert.equal(await none(undefined, PATH), DOCGEN);
  }));

test('composition on: a pattern subject gets Not for and Common mistakes; description start and others untouched', () =>
  withSnapshot(async (root) => {
    const provider = createManifestProvider({
      layers: [createCompositionLayer({ root })],
      root,
    });
    const d = descriptions(await provider(undefined, PATH));
    assert.ok(d.AtlDialog.startsWith('Modal dialog.'));
    assert.match(d.AtlDialog, /Composition patterns/);
    assert.match(d.AtlDialog, /Confirmation Dialog/);
    assert.match(d.AtlDialog, /Type-to-confirm: use a page or an AtlDrawer\./);
    assert.match(d.AtlDialog, /Autofocus on the destructive button\./);
    assert.match(d.AtlDialog, /AtlButton/);
    assert.equal(d.AtlOther, 'Other.');
  }));

test('composition on: a building block (in more than two patterns) gets an index line only', () =>
  withSnapshot(async (root) => {
    const provider = createManifestProvider({
      layers: [createCompositionLayer({ root })],
      root,
    });
    const d = descriptions(await provider(undefined, PATH));
    assert.match(d.AtlButton, /Composition patterns/);
    assert.match(d.AtlButton, /Confirmation Dialog/);
    assert.match(d.AtlButton, /Login Form/);
    assert.doesNotMatch(d.AtlButton, /Type-to-confirm/);
    assert.doesNotMatch(d.AtlButton, /Autofocus/);
  }));

test('composition and purpose each add their own block and do not change the other', () =>
  withSnapshot(async (root) => {
    const both = createManifestProvider({
      layers: [createPurposeLayer({ root }), createCompositionLayer({ root })],
      root,
    });
    const purposeOnly = createManifestProvider({
      layers: [createPurposeLayer({ root })],
      root,
    });
    const withBoth = descriptions(await both(undefined, PATH)).AtlDialog;
    const alone = descriptions(await purposeOnly(undefined, PATH)).AtlDialog;
    assert.ok(withBoth.startsWith(alone));
    assert.match(withBoth, /When to use/);
    assert.match(withBoth, /Composition patterns/);
  }));

test('composition layer adds no tools and one instruction section', () =>
  withSnapshot((root) => {
    const layer = createCompositionLayer({ root });
    assert.equal(layer.register, undefined);
    assert.equal(layer.instructions.length, 1);
    assert.match(layer.instructions[0], /Composition patterns/);
  }));
