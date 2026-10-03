'use strict';

/**
 * Tests for atelier/rooted-selector. Run with `node --test tools/stylelint-rules/`
 * (part of `npm run check:stylelint`). Each branch of the rule has a valid and an
 * invalid case; the last block lints the real shared sheets and a deliberately bare rule.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const stylelint = require('stylelint');
const plugin = require('./rooted-selector');

const config = {
  plugins: [plugin],
  rules: { 'atelier/rooted-selector': true },
};

async function warnings(code) {
  const { results } = await stylelint.lint({ code, config });
  return results[0].warnings.map((w) => w.text);
}

const valid = {
  'a .atl-* class': '.atl-card { color: red; }',
  'a .atl-* class with a descendant':
    '.atl-select > .select-wrapper { color: red; }',
  'a .atl-* class with a state':
    '.atl-button.variant-primary:hover { color: red; }',
  'a comma list of rooted selectors': '.atl-a, .atl-b .child { color: red; }',
  'an :is() list of roots': ':is(.atl-a, .atl-b) * { box-sizing: border-box; }',
  'an :is() list of roots with a descendant':
    ':is(.atl-a, .atl-b) .x { color: red; }',
  'a data-theme ancestor then a root':
    "[data-theme='dark'] .atl-card { color: red; }",
  'a bare data-theme ancestor then a root':
    '[data-theme] .atl-card { color: red; }',
  'a data-theme ancestor then :is()':
    "[data-theme='dark'] :is(.atl-a, .atl-b) { color: red; }",
  'a rooted rule inside @media':
    '@media (min-width: 1px) { .atl-card { color: red; } }',
  'keyframe selectors inside an atl-* @keyframes':
    '@keyframes atl-spin { from { opacity: 0; } 50% { opacity: .5; } to { opacity: 1; } }',
  'a nested rule under a rooted rule': '.atl-card { .inner { color: red; } }',
  'a comma inside a function does not split':
    '.atl-card:not(.a, .b) { color: red; }',
};

const invalid = {
  'a bare element': [
    'button { color: red; }',
    /\[UNROOTED\] selector 'button'/,
  ],
  'a bare class': ['.foo { color: red; }', /\[UNROOTED\] selector '\.foo'/],
  'a class that only looks like the prefix': [
    '.atlas { color: red; }',
    /UNROOTED/,
  ],
  'the universal selector': ['* { box-sizing: border-box; }', /UNROOTED/],
  'a rooted first selector and a bare second one': [
    '.atl-card, .foo { color: red; }',
    /selector '\.foo'/,
  ],
  'a bare descendant of a non-root': [
    '.foo .atl-card { color: red; }',
    /UNROOTED/,
  ],
  'an :is() list with one bare member': [
    ':is(.atl-a, .foo) * { color: red; }',
    /UNROOTED/,
  ],
  'an :is() list with an empty member': [
    ':is(.atl-a, ) * { color: red; }',
    /UNROOTED/,
  ],
  ':where() instead of :is()': [':where(.atl-a) * { color: red; }', /UNROOTED/],
  'a data-theme ancestor then a bare class': [
    "[data-theme='dark'] .foo { color: red; }",
    /UNROOTED/,
  ],
  'a data-theme ancestor alone': [
    "[data-theme='dark'] { color: red; }",
    /UNROOTED/,
  ],
  'a different attribute ancestor': [
    '[data-foo] .atl-card { color: red; }',
    /UNROOTED/,
  ],
  'a bare rule inside @media': [
    '@media (min-width: 1px) { .foo { color: red; } }',
    /UNROOTED/,
  ],
  'an unprefixed @keyframes': [
    '@keyframes spin { to { opacity: 1; } }',
    /\[KEYFRAMES\] @keyframes 'spin'/,
  ],
  'an unprefixed vendor @keyframes': [
    '@-webkit-keyframes spin { to { opacity: 1; } }',
    /KEYFRAMES/,
  ],
};

for (const [name, code] of Object.entries(valid)) {
  test(`accepts ${name}`, async () => {
    assert.deepEqual(await warnings(code), []);
  });
}

for (const [name, [code, pattern]] of Object.entries(invalid)) {
  test(`rejects ${name}`, async () => {
    const found = await warnings(code);
    assert.ok(found.length >= 1, `expected a warning for: ${code}`);
    assert.match(found.join('\n'), pattern);
  });
}

test('rejects an invalid primary option', async () => {
  const { results } = await stylelint.lint({
    code: '.atl-card { color: red; }',
    config: { plugins: [plugin], rules: { 'atelier/rooted-selector': 'yes' } },
  });
  assert.ok(results[0].invalidOptionWarnings.length > 0);
});

test('every real component stylesheet in libs/styles is rooted', async () => {
  const root = path.resolve(__dirname, '../../libs/styles/src');
  const files = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((d) =>
      fs
        .readdirSync(path.join(root, d.name))
        .filter((f) => f.endsWith('.css'))
        .map((f) => path.join(root, d.name, f)),
    );
  assert.ok(files.length >= 29, `found only ${files.length} stylesheets`);
  const { results } = await stylelint.lint({ files, config });
  const found = results.flatMap((r) =>
    r.warnings.map((w) => `${r.source}: ${w.text}`),
  );
  assert.deepEqual(found, []);
});

test('a bare rule appended to a real sheet is caught', async () => {
  const file = path.resolve(
    __dirname,
    '../../libs/styles/src/button/atl-button.css',
  );
  const code = fs.readFileSync(file, 'utf8') + '\nbutton { margin: 0; }\n';
  const { results } = await stylelint.lint({
    code,
    codeFilename: file,
    config,
  });
  const found = results[0].warnings.map((w) => w.text);
  assert.equal(found.length, 1);
  assert.match(found[0], /selector 'button'/);
});
