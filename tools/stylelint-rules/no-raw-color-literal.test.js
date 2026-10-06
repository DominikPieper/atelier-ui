'use strict';

/**
 * Tests for atelier/no-raw-color-literal. Run with `node --test
 * tools/stylelint-rules/` (part of `npm run check:stylelint`).
 *
 * Branches of the rule: primary option; the shadow/mask property exemption;
 * `var()` stripping (balanced, nested, with a fallback); the colour literal
 * shapes; the `exempt` option (file + literal + reason, validated); and a
 * declaration carrying more than one literal.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const stylelint = require('stylelint');
const plugin = require('./no-raw-color-literal');
const { REPO_ROOT, toRepoRelative } = require('./utils');
const { workspace, lintRule, texts } = require('./test-support');

const FILE = '/tmp/atelier-fixture/button/atl-button.css';
// `secondary` is the rule's second config element: `[true, secondary]`.
const lint = (decl, secondary, file = FILE) =>
  lintRule(
    plugin,
    secondary === undefined ? true : [true, secondary],
    `.a { ${decl} }`,
    file,
  );

const valid = {
  'a token read': 'color: var(--ui-color-text);',
  'a named colour (not a literal this rule polices)': 'color: red;',
  'a literal fallback inside var()': 'color: var(--ui-color-text, #fff);',
  'an rgba() fallback with nested parens inside var()':
    'color: var(--ui-color-text, rgba(0, 0, 0, 0.5));',
  'a var() whose fallback is another var() with a literal':
    'color: var(--ui-a, var(--ui-b, #abc));',
  'a two-digit run after # (not a hex colour)': 'content: "#ab";',
  'box-shadow': 'box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.2);',
  '-webkit-box-shadow': '-webkit-box-shadow: 0 0 1px #000;',
  'text-shadow': 'text-shadow: 0 0 1px #000;',
  'an upper-case shadow property': 'BOX-SHADOW: 0 0 1px #000;',
  'mask-image':
    'mask-image: linear-gradient(to bottom, #000 0, rgba(0, 0, 0, 0) 100%);',
  '-webkit-mask-image': '-webkit-mask-image: linear-gradient(#000, #0000);',
};

const invalid = {
  'a 3-digit hex': ['color: #fff;', '#fff'],
  'a 4-digit hex': ['color: #fff8;', '#fff8'],
  'a 6-digit hex': ['color: #006470;', '#006470'],
  'an 8-digit hex': ['color: #00647055;', '#00647055'],
  rgb: ['color: rgb(0 0 0);', 'rgb('],
  rgba: ['color: rgba(0, 0, 0, 0.5);', 'rgba('],
  hsl: ['color: hsl(0 0% 0%);', 'hsl('],
  hsla: ['color: hsla(0, 0%, 0%, 0.5);', 'hsla('],
  'a literal beside a var() in one value': [
    'border-color: var(--ui-a, red) #fff;',
    '#fff',
  ],
  'a literal in a shorthand that is not a shadow': [
    'background: linear-gradient(#fff, #000);',
    '#fff',
  ],
  'a property that merely contains "shadow"': [
    'filter: drop-shadow(0 0 1px #000);',
    '#000',
  ],
  'a custom property declaration': ['--x: #123456;', '#123456'],
};

for (const [name, decl] of Object.entries(valid)) {
  test(`accepts ${name}`, async () => {
    assert.deepEqual(texts(await lint(decl)), []);
  });
}

for (const [name, [decl, literal]] of Object.entries(invalid)) {
  test(`rejects ${name}`, async () => {
    const found = texts(await lint(decl));
    assert.equal(found.length, 1, `expected one warning for: ${decl}`);
    assert.match(found[0], /\[RAW-COLOR\]/);
    assert.ok(found[0].includes(`'${literal}'`), found[0]);
  });
}

test('the message names the property and the literal', async () => {
  const [text] = texts(await lint('color: #abc;'));
  assert.match(text, /'color' uses literal '#abc'/);
});

test('rejects an invalid primary option', async () => {
  const result = await lintRule(plugin, 'yes', '.a { color: #fff; }', FILE);
  assert.ok(result.invalidOptionWarnings.length > 0);
});

test('reports a violation and not an option error for the default `true`', async () => {
  const result = await lint('color: #fff;');
  assert.equal(result.invalidOptionWarnings.length, 0);
  assert.equal(result.warnings.length, 1);
});

// --- the `exempt` secondary option -----------------------------------------

const exemption = (file, literal, reason = 'deliberate') => ({
  file,
  literal,
  reason,
});

test('an exemption for this file and this literal passes', async () => {
  const rel = toRepoRelative(FILE);
  assert.deepEqual(
    texts(await lint('color: #fff;', { exempt: [exemption(rel, '#fff')] })),
    [],
  );
});

test('the same declaration without the exemption fails', async () => {
  assert.equal(texts(await lint('color: #fff;')).length, 1);
});

test('an exemption for a different file does not apply', async () => {
  const other = exemption('libs/styles/src/other/atl-other.css', '#fff');
  assert.equal(
    texts(await lint('color: #fff;', { exempt: [other] })).length,
    1,
  );
});

test('an exemption for a different literal does not apply', async () => {
  const rel = toRepoRelative(FILE);
  const other = exemption(rel, '#000');
  assert.equal(
    texts(await lint('color: #fff;', { exempt: [other] })).length,
    1,
  );
});

test('the file in an exemption is repo-root-relative POSIX', async () => {
  const real = `${REPO_ROOT}/docs/src/styles/global.css`;
  const options = {
    exempt: [exemption('docs/src/styles/global.css', '#fff')],
  };
  assert.deepEqual(texts(await lint('color: #fff;', options, real)), []);
});

test('an exemption with an empty file is an invalid option, not a wildcard', async () => {
  const { results } = await stylelint.lint({
    code: '.a { color: #fff; }',
    config: {
      plugins: [plugin],
      rules: {
        'atelier/no-raw-color-literal': [
          true,
          { exempt: [exemption('', '#fff')] },
        ],
      },
    },
  });
  assert.ok(results[0].invalidOptionWarnings.length > 0);
});

for (const [name, entry] of Object.entries({
  'no reason': { file: 'a.css', literal: '#fff' },
  'an empty reason': { file: 'a.css', literal: '#fff', reason: '' },
  'no literal': { file: 'a.css', reason: 'x' },
  'no file': { literal: '#fff', reason: 'x' },
  'a string instead of an object': 'a.css',
  null: null,
})) {
  test(`rejects an exemption with ${name}`, async () => {
    const result = await lint('color: #fff;', { exempt: [entry] });
    assert.ok(result.invalidOptionWarnings.length > 0);
  });
}

test('an exemption excuses only its own literal, not a second one in the same value', async () => {
  const rel = toRepoRelative(FILE);
  const found = texts(
    await lint('background: linear-gradient(#fff, #000);', {
      exempt: [exemption(rel, '#fff')],
    }),
  );
  assert.equal(found.length, 1);
  assert.ok(found[0].includes("'#000'"), found[0]);
});

test('works on a real temp file, not just inline code', async () => {
  const ws = workspace();
  const file = ws.write('card/atl-card.css', '.atl-card { color: #fff; }\n');
  const { results } = await stylelint.lint({
    files: [file],
    config: {
      plugins: [plugin],
      rules: { 'atelier/no-raw-color-literal': true },
    },
  });
  assert.equal(results[0].warnings.length, 1);
});
