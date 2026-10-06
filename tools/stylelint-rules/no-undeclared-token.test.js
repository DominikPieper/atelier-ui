'use strict';

/**
 * Tests for atelier/no-undeclared-token. Run with `node --test
 * tools/stylelint-rules/` (part of `npm run check:stylelint`).
 *
 * Branches of the rule: the required `tokenFiles` option (validated, resolved
 * against the repo root, unioned across files, loud on a missing file); the
 * read-vs-declaration split (only `var(--ui-*)` reads are policed, only
 * `--ui-*:` declarations count); one report per undeclared read; and the
 * cache question ADR-0126/0130 raise — this rule keeps no cache of its own, so
 * a change to a token file is seen by the next lint in the same process.
 * The cross-run half of that trap is Nx's, and is pinned at the bottom.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const stylelint = require('stylelint');
const plugin = require('./no-undeclared-token');
const { REPO_ROOT } = require('./utils');
const { workspace, lintRule, texts } = require('./test-support');

const TOKENS = `
:root {
  --ui-color-text: #111;
  --ui-spacing-md: 1rem;
}
@media (prefers-color-scheme: dark) {
  :root { --ui-color-dark-only: #eee; }
}
[data-theme='dark'] { --ui-color-themed: #fff; }
`;

function setup(tokens = TOKENS) {
  const ws = workspace();
  const tokenFile = ws.write('tokens.css', tokens);
  return { ws, tokenFile };
}

const lint = (tokenFiles, decl) =>
  lintRule(plugin, [true, { tokenFiles }], `.a { ${decl} }`, '/tmp/x/a.css');

const valid = {
  'a declared token': 'color: var(--ui-color-text);',
  'a declared token with a fallback': 'color: var(--ui-color-text, red);',
  'a token declared only in a dark @media block':
    'color: var(--ui-color-dark-only);',
  'a token declared only under [data-theme]': 'color: var(--ui-color-themed);',
  'whitespace inside var(': 'color: var(   --ui-color-text );',
  'a --docs-* custom property (not the --ui- prefix)':
    'color: var(--docs-whatever);',
  'a var() of a non-token name': 'color: var(--local);',
  'no var() at all': 'color: red;',
  'a plain custom-property value': '--local: 1px;',
  'several declared reads in one value':
    'padding: var(--ui-spacing-md) var(--ui-spacing-md);',
};

for (const [name, decl] of Object.entries(valid)) {
  test(`accepts ${name}`, async () => {
    const { tokenFile } = setup();
    assert.deepEqual(texts(await lint([tokenFile], decl)), []);
  });
}

const invalid = {
  'an undeclared token': ['color: var(--ui-missing);', ['--ui-missing']],
  'an undeclared token behind a fallback that would hide it': [
    'color: var(--ui-missing, red);',
    ['--ui-missing'],
  ],
  'a token that is only a prefix of a declared one': [
    'color: var(--ui-color);',
    ['--ui-color'],
  ],
  'a token that is only a longer name than a declared one': [
    'color: var(--ui-color-text-strong);',
    ['--ui-color-text-strong'],
  ],
  'a read nested inside another var() fallback': [
    'color: var(--ui-color-text, var(--ui-missing));',
    ['--ui-missing'],
  ],
  'two undeclared reads in one declaration': [
    'padding: var(--ui-a) var(--ui-b);',
    ['--ui-a', '--ui-b'],
  ],
  'one undeclared and one declared read': [
    'padding: var(--ui-spacing-md) var(--ui-gone);',
    ['--ui-gone'],
  ],
};

for (const [name, [decl, expected]] of Object.entries(invalid)) {
  test(`rejects ${name}`, async () => {
    const { tokenFile } = setup();
    const found = texts(await lint([tokenFile], decl));
    assert.equal(found.length, expected.length, found.join('\n'));
    expected.forEach((name, i) => {
      assert.match(found[i], /\[UNDECLARED\]/);
      assert.ok(found[i].includes(`'${name}'`), found[i]);
    });
  });
}

test('a custom-property declaration is a read site too', async () => {
  const { tokenFile } = setup();
  const found = texts(await lint([tokenFile], '--ui-new: var(--ui-nope);'));
  assert.equal(found.length, 1);
  assert.match(found[0], /'--ui-nope'/);
});

test('reports inside @media and nested rules', async () => {
  const { tokenFile } = setup();
  const result = await lintRule(
    plugin,
    [true, { tokenFiles: [tokenFile] }],
    '@media (min-width: 1px) { .a { .b { color: var(--ui-nope); } } }',
    '/tmp/x/a.css',
  );
  assert.equal(texts(result).length, 1);
});

// --- tokenFiles -----------------------------------------------------------

test('the declared set is the union of every file in tokenFiles', async () => {
  const ws = workspace();
  const a = ws.write('a.css', ':root { --ui-from-a: 1; }');
  const b = ws.write('b.css', ':root { --ui-from-b: 1; }');
  const decl = 'padding: var(--ui-from-a) var(--ui-from-b);';
  assert.deepEqual(texts(await lint([a, b], decl)), []);
  // ...and each file alone is not enough: the docs scope relies on the union.
  assert.equal(texts(await lint([a], decl)).length, 1);
  assert.equal(texts(await lint([b], decl)).length, 1);
});

test('tokenFiles is resolved against the repo root when relative', async () => {
  const result = await lint(
    ['libs/styles/src/tokens.css'],
    'color: var(--ui-this-token-does-not-exist-anywhere);',
  );
  assert.equal(texts(result).length, 1);
});

test('a token the real token source declares passes (smoke, live tokens)', async () => {
  const live = fs.readFileSync(
    path.join(REPO_ROOT, 'libs/styles/src/tokens.css'),
    'utf8',
  );
  const name = live.match(/(--ui-color-[a-z0-9-]+)\s*:/)[1];
  const result = await lint(
    ['libs/styles/src/tokens.css'],
    `color: var(${name});`,
  );
  assert.deepEqual(texts(result), []);
});

test('a declaration inside a comment in the token source does not declare the token', async () => {
  const { ws } = setup();
  const tokenFile = ws.write(
    'commented.css',
    ':root { --ui-real: 1; }\n/* --ui-ghost: 1; */\n/*\n  --ui-ghost-multi: 2;\n*/',
  );
  assert.deepEqual(
    texts(await lint([tokenFile], 'color: var(--ui-real);')),
    [],
  );
  assert.equal(
    texts(await lint([tokenFile], 'color: var(--ui-ghost);')).length,
    1,
  );
  assert.equal(
    texts(await lint([tokenFile], 'color: var(--ui-ghost-multi);')).length,
    1,
  );
});

test('a token source that does not exist fails loudly, it does not pass', async () => {
  const ws = workspace();
  await assert.rejects(
    lint([ws.path('missing.css')], 'color: var(--ui-color-text);'),
    /ENOENT/,
  );
});

test('rejects a missing tokenFiles option', async () => {
  const result = await lintRule(
    plugin,
    true,
    '.a { color: red; }',
    '/tmp/x/a.css',
  );
  assert.ok(result.invalidOptionWarnings.length > 0);
});

test('rejects an empty-string tokenFiles entry', async () => {
  const result = await lint([''], 'color: red;');
  assert.ok(result.invalidOptionWarnings.length > 0);
});

test('rejects an invalid primary option', async () => {
  const result = await lintRule(
    plugin,
    'yes',
    '.a { color: red; }',
    '/tmp/x/a.css',
  );
  assert.ok(result.invalidOptionWarnings.length > 0);
});

// --- the cache trap (ADR-0126, ADR-0130) ---------------------------------------

test('a change to the token file is seen by the next lint in the same process', async () => {
  const ws = workspace();
  const tokenFile = ws.write('tokens.css', ':root { --ui-before: 1; }');
  const decl = 'color: var(--ui-after);';
  assert.equal(texts(await lint([tokenFile], decl)).length, 1);

  fs.writeFileSync(tokenFile, ':root { --ui-before: 1; --ui-after: 2; }');
  assert.deepEqual(texts(await lint([tokenFile], decl)), []);

  fs.writeFileSync(tokenFile, ':root { --ui-before: 1; }');
  assert.equal(texts(await lint([tokenFile], decl)).length, 1);
});

test('Nx lists the token source and the rules as inputs of the stylelint target', () => {
  // The cross-run half of the trap: this rule reads a file outside the one it
  // lints, so Nx must hash it or a renamed token serves a stale green.
  const nx = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'nx.json'), 'utf8'),
  );
  const inputs = nx.targetDefaults.stylelint.inputs.filter(
    (i) => typeof i === 'string',
  );
  assert.ok(inputs.includes('{workspaceRoot}/libs/styles/src/tokens.css'));
  assert.ok(inputs.includes('{workspaceRoot}/stylelint.config.mjs'));
  assert.ok(inputs.includes('{workspaceRoot}/tools/stylelint-rules/**/*'));
});

test('lints a real temp file through stylelint.lint({ files })', async () => {
  const { ws, tokenFile } = setup();
  const file = ws.write('x/a.css', '.a { color: var(--ui-nope); }');
  const { results } = await stylelint.lint({
    files: [file],
    config: {
      plugins: [plugin],
      rules: { [plugin.ruleName]: [true, { tokenFiles: [tokenFile] }] },
    },
  });
  assert.equal(results[0].warnings.length, 1);
});
