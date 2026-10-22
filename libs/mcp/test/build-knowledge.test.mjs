import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { buildKnowledge, parseTokensCss } from '../scripts/build-knowledge.mjs';

const CSS = `
/* a comment with { braces } and --ui-fake: 1; */
:root {
  --ui-opacity-disabled: 0.5;
  --ui-focus-ring:
    0 0 0 2px var(--ui-color-surface),
    0 0 0 4px var(--ui-color-primary);
  --not-ui: 1;
}
@media (prefers-color-scheme: dark) {
  :root { --ui-opacity-disabled: 0.9; }
}
[data-theme='dark'] {
  --ui-opacity-disabled: 0.65;
}
`;

test('parseTokensCss: light from :root, dark from [data-theme=dark], multi-line values, comments ignored', () => {
  const tokens = parseTokensCss(CSS);
  const by = Object.fromEntries(tokens.map((t) => [t.name, t]));
  assert.deepEqual(Object.keys(by).sort(), [
    '--ui-focus-ring',
    '--ui-opacity-disabled',
  ]);
  assert.equal(by['--ui-opacity-disabled'].light, '0.5');
  assert.equal(by['--ui-opacity-disabled'].dark, '0.65');
  assert.equal(by['--ui-focus-ring'].dark, undefined);
  assert.equal(
    by['--ui-focus-ring'].light,
    '0 0 0 2px var(--ui-color-surface), 0 0 0 4px var(--ui-color-primary)',
  );
});

function fixtureRepo() {
  const root = mkdtempSync(join(tmpdir(), 'atelier-mcp-kb-'));
  const comps = join(root, 'docs/public/.well-known/components');
  mkdirSync(comps, { recursive: true });
  mkdirSync(join(root, 'libs/styles/src'), { recursive: true });
  const scaffold = join(root, 'libs/create-workspace/src/generators/preset');
  mkdirSync(join(scaffold, 'files/tools/stylelint-rules'), { recursive: true });
  writeFileSync(join(root, 'libs/styles/src/tokens.css'), CSS);
  writeFileSync(
    join(comps, 'badge.json'),
    JSON.stringify({
      name: 'AtlBadge',
      specs: ['AtlBadgeSpec', 'AtlBadgeItemSpec'],
      rules: [
        { level: 'should', statement: 'Mark status.' },
        {
          level: 'should-not',
          statement: 'Hold a chip.',
          useInstead: 'A chip component.',
        },
        { level: 'must', statement: 'renders' },
      ],
      related: [{ spec: 'AtlAlertSpec', slug: 'alert' }],
      tokens: [
        {
          name: '--ui-opacity-disabled',
          intent: 'Disabled opacity.',
          constraints: ['Use opacity.'],
        },
      ],
    }),
  );
  writeFileSync(join(comps, 'index.json'), '{"not":"a component"}');
  writeFileSync(
    join(root, 'docs/public/.well-known/cookbook-patterns.json'),
    JSON.stringify({
      version: '1',
      patterns: [
        {
          id: 'confirmation-dialog',
          num: 3,
          title: 'Confirmation Dialog',
          description: 'Modal flow for destructive actions.',
          url: 'https://example.test/patterns/confirmation-dialog',
          components: ['AtlDialog', 'AtlButton'],
          whenToUse: ['Irreversible actions.'],
          whenNotToUse: ['Type-to-confirm: use a page or an AtlDrawer.'],
          pitfalls: ['Autofocus on the destructive button.'],
          frameworks: { angular: '<atl-dialog />', react: '', vue: '' },
        },
      ],
    }),
  );
  writeFileSync(
    join(scaffold, 'preset.ts'),
    `const x = { 'atelier/no-raw-color-literal': true, 'atelier/no-token-bypass': [true, {}] };`,
  );
  const rules = join(scaffold, 'files/tools/stylelint-rules');
  writeFileSync(
    join(rules, 'no-raw-color-literal.js'),
    `/**\n * atelier/no-raw-color-literal\n *\n * Do not use raw colours. Use a token.\n * Second paragraph line.\n *\n * Other paragraph.\n */\nconst m = '[RAW-COLOR] x';`,
  );
  writeFileSync(
    join(rules, 'no-token-bypass.js'),
    `/**\n * atelier/no-token-bypass\n *\n * Catches duplicates.\n */\nconst m = { bypass: '[BYPASS] x', stale: '[STALE-EXEMPT] y' };`,
  );
  return root;
}

test('buildKnowledge: component guidance keyed by every spec name, tokens joined with intent, wired rules only', () => {
  const repo = fixtureRepo();
  const out = mkdtempSync(join(tmpdir(), 'atelier-mcp-kb-out-'));
  try {
    buildKnowledge({ repoRoot: repo, snapshotDir: out });
    const comps = JSON.parse(
      readFileSync(join(out, 'knowledge/components.json'), 'utf8'),
    );
    assert.deepEqual(Object.keys(comps).sort(), ['AtlBadge', 'AtlBadgeItem']);
    assert.deepEqual(comps.AtlBadge.whenToUse, ['Mark status.']);
    assert.deepEqual(comps.AtlBadge.whenNotToUse, [
      { statement: 'Hold a chip.', useInstead: 'A chip component.' },
    ]);
    assert.deepEqual(comps.AtlBadge.related, ['AtlAlert']);

    const patterns = JSON.parse(
      readFileSync(join(out, 'knowledge/patterns.json'), 'utf8'),
    );
    assert.deepEqual(patterns, {
      patterns: [
        {
          id: 'confirmation-dialog',
          title: 'Confirmation Dialog',
          description: 'Modal flow for destructive actions.',
          components: ['AtlDialog', 'AtlButton'],
          whenNotToUse: ['Type-to-confirm: use a page or an AtlDrawer.'],
          pitfalls: ['Autofocus on the destructive button.'],
        },
      ],
    });

    const tokens = JSON.parse(
      readFileSync(join(out, 'knowledge/tokens.json'), 'utf8'),
    );
    const t = Object.fromEntries(tokens.tokens.map((x) => [x.name, x]));
    assert.equal(t['--ui-opacity-disabled'].intent, 'Disabled opacity.');
    assert.equal(t['--ui-focus-ring'].intent, undefined);
    assert.deepEqual(
      tokens.rules.map((r) => r.id),
      ['atelier/no-raw-color-literal', 'atelier/no-token-bypass'],
    );
    assert.deepEqual(tokens.rules[1].codes, ['BYPASS']);
    assert.match(
      tokens.rules[0].summary,
      /^Do not use raw colours\. Use a token\./,
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test('buildKnowledge fails when a wired rule has no rule file', () => {
  const repo = fixtureRepo();
  rmSync(
    join(
      repo,
      'libs/create-workspace/src/generators/preset/files/tools/stylelint-rules/no-token-bypass.js',
    ),
  );
  try {
    assert.throws(
      () => buildKnowledge({ repoRoot: repo, snapshotDir: join(repo, 'o') }),
      /no-token-bypass/,
    );
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});
