import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { createPurposeLayer } from '../src/layer-purpose.mjs';
import { createTokensLayer } from '../src/layer-tokens.mjs';
import { LAYERS, resolveLayers } from '../src/layers.mjs';
import {
  createManifestProvider,
  manifestProvider,
} from '../src/manifest-provider.mjs';
import { createServer } from '../src/server.mjs';

const COMPONENTS = {
  AtlBadge: {
    whenToUse: ['Marking the status of a row.'],
    whenNotToUse: [
      {
        statement: 'Holding a removable user-entered chip.',
        useInstead: 'A dedicated chip component.',
      },
    ],
    related: ['AtlAlert'],
  },
};
const TOKENS = {
  tokens: [
    {
      name: '--ui-focus-ring',
      light: '0 0 0 2px var(--ui-color-surface)',
      dark: '0 0 0 2px var(--ui-color-surface-dark)',
      intent: 'Double-ring box-shadow for :focus-visible.',
      constraints: ['Never on :focus alone.'],
    },
    { name: '--ui-opacity-disabled', light: '0.5', dark: '0.65' },
  ],
  rules: [
    {
      id: 'atelier/no-raw-color-literal',
      codes: ['RAW-COLOR'],
      summary: 'No raw colour literals.',
    },
  ],
};
const DOCGEN = JSON.stringify({
  components: {
    'components-display-atlbadge': {
      id: 'components-display-atlbadge',
      name: 'AtlBadge',
      description: 'Compact inline label.',
    },
    'components-x-atlother': {
      id: 'x',
      name: 'AtlOther',
      description: 'Other.',
    },
  },
});

async function withSnapshot(fn) {
  const root = mkdtempSync(join(tmpdir(), 'atelier-mcp-layers-'));
  try {
    mkdirSync(join(root, 'knowledge'), { recursive: true });
    mkdirSync(join(root, 'services', 'core', 'docgen'), { recursive: true });
    writeFileSync(
      join(root, 'knowledge', 'components.json'),
      JSON.stringify(COMPONENTS),
    );
    writeFileSync(
      join(root, 'knowledge', 'tokens.json'),
      JSON.stringify(TOKENS),
    );
    writeFileSync(
      join(
        root,
        'services',
        'core',
        'docgen',
        'components-display-atlbadge.json',
      ),
      DOCGEN,
    );
    return await fn(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const DOCGEN_PATH = './services/core/docgen/components-display-atlbadge.json';
const descriptions = (text) =>
  Object.fromEntries(
    Object.values(JSON.parse(text).components).map((c) => [
      c.name,
      c.description,
    ]),
  );

test('the shipped registry is api, purpose, tokens, composition, in that order', () => {
  assert.deepEqual(
    LAYERS.map((layer) => layer.id),
    ['api', 'purpose', 'tokens', 'composition'],
  );
});

test('purpose off: the docgen shard is served byte-identical', () =>
  withSnapshot(async (root) => {
    const layers = resolveLayers('api,tokens', [
      LAYERS[0],
      createPurposeLayer({ root }),
      createTokensLayer({ root }),
    ]);
    const provider = createManifestProvider({ layers, root });
    assert.equal(await provider(undefined, DOCGEN_PATH), DOCGEN);
    assert.equal(await manifestProvider(undefined, DOCGEN_PATH, root), DOCGEN);
  }));

test('purpose on: the description gains when-to-use, anti-patterns and related; others untouched', () =>
  withSnapshot(async (root) => {
    const provider = createManifestProvider({
      layers: [createPurposeLayer({ root })],
      root,
    });
    const d = descriptions(await provider(undefined, DOCGEN_PATH));
    assert.ok(d.AtlBadge.startsWith('Compact inline label.'));
    assert.match(d.AtlBadge, /When to use/);
    assert.match(d.AtlBadge, /Marking the status of a row\./);
    assert.match(d.AtlBadge, /removable user-entered chip/);
    assert.match(d.AtlBadge, /Use instead: A dedicated chip component\./);
    assert.match(d.AtlBadge, /Related:\*\* AtlAlert/);
    assert.equal(d.AtlOther, 'Other.');
  }));

test('purpose on: the manifest entry is enriched too, because its description wins over the shard', () =>
  withSnapshot(async (root) => {
    mkdirSync(join(root, 'manifests'), { recursive: true });
    writeFileSync(join(root, 'manifests', 'components.json'), DOCGEN);
    const provider = createManifestProvider({
      layers: [createPurposeLayer({ root })],
      root,
    });
    const d = descriptions(
      await provider(undefined, './manifests/components.json'),
    );
    assert.match(d.AtlBadge, /When not to use/);
    assert.equal(d.AtlOther, 'Other.');
  }));

test('purpose on: non-docgen paths pass through unchanged', () =>
  withSnapshot(async (root) => {
    writeFileSync(join(root, 'x.json'), '{"a":1}');
    const provider = createManifestProvider({
      layers: [createPurposeLayer({ root })],
      root,
    });
    assert.equal(await provider(undefined, './x.json'), '{"a":1}');
  }));

test('purpose layer adds no tools and one instruction section', () =>
  withSnapshot(async (root) => {
    const layer = createPurposeLayer({ root });
    assert.equal(layer.register, undefined);
    assert.equal(layer.instructions.length, 1);
    assert.match(layer.instructions[0], /When to use/);
  }));

function fakeServer() {
  const tools = new Map();
  return {
    tools,
    tool: (meta, handler) => tools.set(meta.name, { meta, handler }),
  };
}

test('tokens on: registers tokens-search, which finds a known token by name and intent', () =>
  withSnapshot(async (root) => {
    const server = fakeServer();
    await createTokensLayer({ root }).register(server);
    assert.deepEqual([...server.tools.keys()], ['tokens-search']);
    const { handler } = server.tools.get('tokens-search');
    const byName = (await handler({ query: 'focus ring' })).content[0].text;
    assert.match(byName, /--ui-focus-ring/);
    assert.match(byName, /Double-ring box-shadow/);
    assert.match(byName, /Never on :focus alone/);
    assert.match(byName, /dark: 0 0 0 2px/);
    assert.doesNotMatch(byName, /--ui-opacity-disabled/);
    const byValue = (await handler({ query: 'disabled' })).content[0].text;
    assert.match(byValue, /--ui-opacity-disabled/);
    assert.match(byValue, /0\.5/);
  }));

test('tokens-search says so when nothing matches, and lists families without a query', () =>
  withSnapshot(async (root) => {
    const server = fakeServer();
    await createTokensLayer({ root }).register(server);
    const { handler } = server.tools.get('tokens-search');
    assert.match(
      (await handler({ query: 'zzz-nothing' })).content[0].text,
      /No token matches/,
    );
    const all = (await handler({})).content[0].text;
    assert.match(all, /--ui-focus-ring/);
    assert.match(all, /--ui-opacity-disabled/);
  }));

test('tokens layer: instructions carry the stylelint rules and name the tool', () =>
  withSnapshot((root) => {
    const text = createTokensLayer({ root }).instructions.join('\n');
    assert.match(text, /tokens-search/);
    assert.match(text, /atelier\/no-raw-color-literal/);
    assert.match(text, /RAW-COLOR/);
  }));

test('createServer: layer sets decide tools and instructions', async () => {
  const options = (layers) => ({
    cwd: '/nonexistent-consumer',
    env: { ATELIER_MCP_VERSION_CHECK: 'off', ATELIER_MCP_LAYERS: layers },
  });
  const l0 = await createServer(options('api'));
  assert.deepEqual(
    l0.layers.map((l) => l.id),
    ['api'],
  );
  const both = await createServer(options('api,purpose,tokens,composition'));
  assert.deepEqual(
    both.layers.map((l) => l.id),
    ['api', 'purpose', 'tokens', 'composition'],
  );
});
