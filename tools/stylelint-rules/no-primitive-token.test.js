'use strict';

/**
 * Tests for atelier/no-primitive-token. Run with `node --test
 * tools/stylelint-rules/` (part of `npm run check:stylelint`).
 *
 * Branches of the rule: the per-declaration check (a read of a token that
 * matches a `PRIMITIVE_TOKENS` pattern); the exemption lookup keyed
 * `<component-dir>:<token>` with its two kinds (`design` silent, `gap` a
 * warning); the `allowlistsFile` option (absent = no-op, supplied = validated,
 * `[INVALID-ALLOWLISTS]`); and the once-per-root staleness scan with its
 * `componentRoot` / `sharedRoot` scope and the cache key that guards it.
 *
 * The allowlists are temp modules, so the tests do not move when the live
 * `PRIMITIVE_EXEMPTIONS` do. The last block loads the live module once, to
 * check the real map against the rule and the real config against the real CSS.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const stylelint = require('stylelint');
const plugin = require('./no-primitive-token');
const { REPO_ROOT } = require('./utils');
const {
  workspace,
  lintRule,
  texts,
  errorsOf,
  warningsOf,
} = require('./test-support');

const TEAL = `{
  match: /^--ui-color-teal-\\d{2,3}$/,
  label: 'teal ramp step',
  useInstead: 'the semantic alias',
  why: 'ADR-0038: the ramp is the primitive tier.',
}`;
const DISPLAY = `{
  match: /^--ui-font-display$/,
  label: 'display font stack',
  useInstead: '--ui-type-display',
  why: 'ADR-0036: the role carries the weight.',
}`;
const ANY_FONT = `{
  match: /^--ui-font-/,
  label: 'any font token',
  useInstead: 'a type role',
  why: 'overlaps DISPLAY on purpose.',
}`;
const GAP = `['code-block:--ui-font-display', { kind: 'gap', reason: 'one label still needs it' }]`;
const DESIGN = `['toast:--ui-color-teal-500', { kind: 'design', reason: 'a closed question' }]`;

/** A temp allowlists module. `tokens`/`exemptions` are source text. */
function allowlists(
  ws,
  { tokens = [TEAL, DISPLAY], exemptions = [], name } = {},
) {
  return ws.write(
    name || 'allowlists.js',
    `module.exports = {
  PRIMITIVE_TOKENS: [${tokens.join(',')}],
  PRIMITIVE_EXEMPTIONS: new Map([${exemptions.join(',')}]),
};`,
  );
}

/** Lint `decl` as `<root>/<dir>/a.css`. */
function lintIn(ws, options, dir, decl, file = 'a.css') {
  return lintRule(
    plugin,
    [true, options],
    `.a { ${decl} }`,
    ws.path(`components/${dir}/${file}`),
  );
}

const rootOf = (ws) => ws.path('components');

// --- the per-declaration check -------------------------------------------------

const valid = {
  'a semantic token': 'color: var(--ui-color-primary);',
  'a ramp step with one digit (pattern wants 2-3)':
    'color: var(--ui-color-teal-5);',
  'a ramp step with a suffix (pattern is anchored)':
    'color: var(--ui-color-teal-500-hover);',
  'a non-token custom property': 'color: var(--local-teal-500);',
  'a token name only quoted in a string': 'content: "--ui-font-display";',
  'a declaration with no var() at all': 'color: red;',
};

for (const [name, decl] of Object.entries(valid)) {
  test(`accepts ${name}`, async () => {
    const ws = workspace();
    const options = { allowlistsFile: allowlists(ws) };
    assert.deepEqual(texts(await lintIn(ws, options, 'button', decl)), []);
  });
}

test('rejects a primitive and says what to use instead and why', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws) };
  const [text, ...rest] = texts(
    await lintIn(ws, options, 'button', 'color: var(--ui-color-teal-500);'),
  );
  assert.equal(rest.length, 0);
  assert.match(
    text,
    /\[PRIMITIVE\] references --ui-color-teal-500 \(teal ramp step\)/,
  );
  assert.match(text, /Use the semantic alias\./);
  assert.match(text, /ADR-0038/);
});

test('rejects a primitive with a fallback, and one nested in a fallback', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws) };
  const a = texts(
    await lintIn(
      ws,
      options,
      'button',
      'color: var(--ui-font-display, serif);',
    ),
  );
  const b = texts(
    await lintIn(
      ws,
      options,
      'button',
      'color: var(--ui-color-primary, var(--ui-font-display));',
    ),
  );
  assert.equal(a.length, 1);
  assert.equal(b.length, 1);
});

test('reports each primitive read in one declaration', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws) };
  const found = texts(
    await lintIn(
      ws,
      options,
      'button',
      'font: var(--ui-font-display) var(--ui-color-teal-100);',
    ),
  );
  assert.equal(found.length, 2);
});

test('the first matching pattern names the primitive', async () => {
  const ws = workspace();
  const options = {
    allowlistsFile: allowlists(ws, { tokens: [DISPLAY, ANY_FONT] }),
  };
  const [text] = texts(
    await lintIn(ws, options, 'button', 'font: var(--ui-font-display);'),
  );
  assert.match(text, /display font stack/);
  assert.doesNotMatch(text, /any font token/);
});

test('is a no-op without allowlistsFile, the documented scaffold default', async () => {
  const ws = workspace();
  const result = await lintIn(
    ws,
    { componentRoot: rootOf(ws) },
    'button',
    'color: var(--ui-color-teal-500);',
  );
  assert.deepEqual(texts(result), []);
});

test('a bare `true` with no secondary options object is an invalid configuration', async () => {
  const ws = workspace();
  const result = await lintRule(
    plugin,
    true,
    '.a { color: var(--ui-color-teal-500); }',
    ws.path('components/button/a.css'),
  );
  assert.ok(result.invalidOptionWarnings.length > 0);
});

test('an empty secondary options object is the scaffold default: valid, and a no-op', async () => {
  const ws = workspace();
  const result = await lintIn(
    ws,
    {},
    'button',
    'color: var(--ui-color-teal-500);',
  );
  assert.equal(result.invalidOptionWarnings.length, 0);
  assert.deepEqual(texts(result), []);
});

test('an empty PRIMITIVE_TOKENS list forbids nothing', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws, { tokens: [] }) };
  assert.deepEqual(
    texts(
      await lintIn(ws, options, 'button', 'color: var(--ui-color-teal-500);'),
    ),
    [],
  );
});

// --- exemptions: PRIMITIVE_EXEMPTIONS -------------------------------------------

test('a design exemption is silent', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws, { exemptions: [DESIGN] }) };
  const result = await lintIn(
    ws,
    options,
    'toast',
    'color: var(--ui-color-teal-500);',
  );
  assert.deepEqual(texts(result), []);
});

test('the same declaration without the exemption fails', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws, { exemptions: [] }) };
  const result = await lintIn(
    ws,
    options,
    'toast',
    'color: var(--ui-color-teal-500);',
  );
  assert.equal(errorsOf(result).length, 1);
});

test('a gap exemption passes but warns, and the warning is not an error', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws, { exemptions: [GAP] }) };
  const result = await lintIn(
    ws,
    options,
    'code-block',
    'font: var(--ui-font-display);',
  );
  assert.deepEqual(errorsOf(result), []);
  assert.deepEqual(warningsOf(result), [
    '[GAP] code-block:--ui-font-display — one label still needs it (atelier/no-primitive-token)',
  ]);
});

test('an exemption is keyed on the directory: the same token elsewhere fails', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws, { exemptions: [GAP] }) };
  const result = await lintIn(
    ws,
    options,
    'button',
    'font: var(--ui-font-display);',
  );
  assert.equal(errorsOf(result).length, 1);
  assert.deepEqual(warningsOf(result), []);
});

test('an exemption excuses its own token only, not another primitive in that directory', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws, { exemptions: [GAP] }) };
  const result = await lintIn(
    ws,
    options,
    'code-block',
    'font: var(--ui-font-display) var(--ui-color-teal-500);',
  );
  assert.equal(errorsOf(result).length, 1);
  assert.match(errorsOf(result)[0], /--ui-color-teal-500/);
  assert.equal(warningsOf(result).length, 1);
});

// --- allowlistsFile validation (ADR-0124's failure class) -------------------------

function brokenAllowlists(ws, body, name) {
  return ws.write(name || 'broken.js', body);
}

for (const [name, body, reason] of [
  [
    'PRIMITIVE_TOKENS missing',
    'module.exports = { PRIMITIVE_EXEMPTIONS: new Map() };',
    /'PRIMITIVE_TOKENS' is undefined \(no such export\), expected an array/,
  ],
  [
    'PRIMITIVE_TOKENS not an array',
    'module.exports = { PRIMITIVE_TOKENS: {}, PRIMITIVE_EXEMPTIONS: new Map() };',
    /'PRIMITIVE_TOKENS' is a object, expected an array/,
  ],
  [
    'PRIMITIVE_EXEMPTIONS missing',
    'module.exports = { PRIMITIVE_TOKENS: [] };',
    /'PRIMITIVE_EXEMPTIONS' is undefined \(no such export\), expected a Map/,
  ],
  [
    'PRIMITIVE_EXEMPTIONS a plain object',
    'module.exports = { PRIMITIVE_TOKENS: [], PRIMITIVE_EXEMPTIONS: {} };',
    /'PRIMITIVE_EXEMPTIONS' is a object, expected a Map/,
  ],
  [
    'PRIMITIVE_EXEMPTIONS an array',
    'module.exports = { PRIMITIVE_TOKENS: [], PRIMITIVE_EXEMPTIONS: [] };',
    /'PRIMITIVE_EXEMPTIONS' is an array, expected a Map/,
  ],
]) {
  test(`reports [INVALID-ALLOWLISTS] when ${name}`, async () => {
    const ws = workspace();
    const options = { allowlistsFile: brokenAllowlists(ws, body) };
    const result = await lintIn(ws, options, 'button', 'color: red;');
    assert.deepEqual(errorsOf(result).length, 1, texts(result).join('\n'));
    assert.match(errorsOf(result)[0], /\[INVALID-ALLOWLISTS\]/);
    assert.match(errorsOf(result)[0], reason);
  });
}

test('both exports wrong gives one report naming both', async () => {
  const ws = workspace();
  const options = {
    allowlistsFile: brokenAllowlists(ws, 'module.exports = {};'),
  };
  const found = errorsOf(await lintIn(ws, options, 'button', 'color: red;'));
  assert.equal(found.length, 1);
  assert.match(found[0], /PRIMITIVE_TOKENS.*;.*PRIMITIVE_EXEMPTIONS/);
});

test('[INVALID-ALLOWLISTS] repeats on every file, because it is not a once-per-root report', async () => {
  const ws = workspace();
  const options = {
    allowlistsFile: brokenAllowlists(ws, 'module.exports = {};'),
  };
  for (let i = 0; i < 2; i++) {
    const result = await lintIn(
      ws,
      options,
      'button',
      'color: red;',
      `f${i}.css`,
    );
    assert.equal(errorsOf(result).length, 1);
  }
});

test('a broken allowlists module polices nothing but is not a silent pass', async () => {
  const ws = workspace();
  const options = {
    allowlistsFile: brokenAllowlists(ws, 'module.exports = {};'),
  };
  const result = await lintIn(
    ws,
    options,
    'button',
    'color: var(--ui-color-teal-500);',
  );
  assert.deepEqual(
    errorsOf(result).filter((t) => t.includes('[PRIMITIVE]')),
    [],
  );
  assert.equal(errorsOf(result).length, 1);
});

test('an allowlistsFile that does not exist throws rather than passes', async () => {
  const ws = workspace();
  await assert.rejects(
    lintIn(ws, { allowlistsFile: ws.path('nope.js') }, 'button', 'color: red;'),
    /Cannot find module/,
  );
});

test('allowlistsFile is resolved against the repo root when relative', async () => {
  const result = await lintRule(
    plugin,
    [true, { allowlistsFile: 'tools/scripts/lib/allowlists.js' }],
    '.a { color: var(--ui-color-teal-500); }',
    '/tmp/x/button/a.css',
  );
  assert.equal(errorsOf(result).length, 1);
});

// --- option validation ----------------------------------------------------------

for (const [name, options] of Object.entries({
  'an empty componentRoot': { componentRoot: '' },
  'a non-string componentRoot': { componentRoot: 7 },
  'an empty sharedRoot': { sharedRoot: '' },
  'an empty allowlistsFile': { allowlistsFile: '' },
  'an unknown option': { tokenFiles: ['x'] },
})) {
  test(`rejects ${name}`, async () => {
    const result = await lintRule(
      plugin,
      [true, options],
      '.a { color: red; }',
      '/tmp/x/a.css',
    );
    assert.ok(result.invalidOptionWarnings.length > 0);
  });
}

test('rejects an invalid primary option', async () => {
  const result = await lintRule(
    plugin,
    'yes',
    '.a { color: red; }',
    '/tmp/x/a.css',
  );
  assert.ok(result.invalidOptionWarnings.length > 0);
});

// --- staleness (ADR-0034) ---------------------------------------------------------

/** Components dir with `code-block` referencing the primitive the GAP names. */
function referencing(
  ws,
  dir = 'code-block',
  decl = 'font: var(--ui-font-display)',
) {
  ws.write(`components/${dir}/atl.css`, `.x { ${decl}; }`);
}

const staleOpts = (ws, extra = {}) => ({
  componentRoot: rootOf(ws),
  allowlistsFile: allowlists(ws, { exemptions: [GAP] }),
  ...extra,
});

test('reports [STALE] for an exemption no component CSS references', async () => {
  const ws = workspace();
  ws.write('components/button/atl.css', '.x { color: red; }');
  const result = await lintIn(
    ws,
    staleOpts(ws),
    'button',
    'color: red;',
    'a.css',
  );
  assert.deepEqual(errorsOf(result).length, 1);
  assert.match(
    errorsOf(result)[0],
    /\[STALE\] PRIMITIVE_EXEMPTIONS carries 'code-block:--ui-font-display' \(gap\)/,
  );
});

test('names the exemption kind in the stale report', async () => {
  const ws = workspace();
  ws.write('components/button/atl.css', '.x { color: red; }');
  const options = {
    componentRoot: rootOf(ws),
    allowlistsFile: allowlists(ws, { exemptions: [DESIGN] }),
  };
  const [text] = errorsOf(await lintIn(ws, options, 'button', 'color: red;'));
  assert.match(text, /\(design\)/);
});

test('an exemption whose primitive is still referenced is not stale', async () => {
  const ws = workspace();
  referencing(ws);
  const result = await lintIn(ws, staleOpts(ws), 'button', 'color: red;');
  assert.deepEqual(errorsOf(result), []);
});

test('staleness sees a reference in a file this run never lints', async () => {
  const ws = workspace();
  referencing(ws, 'code-block');
  // The linted file is in another directory entirely.
  const result = await lintIn(ws, staleOpts(ws), 'button', 'color: red;');
  assert.deepEqual(errorsOf(result), []);
});

test('a reference in the wrong directory does not keep an exemption alive', async () => {
  const ws = workspace();
  referencing(ws, 'button'); // the key is code-block:..., this is button:...
  const result = await lintIn(ws, staleOpts(ws), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a reference to a different primitive does not keep it alive either', async () => {
  const ws = workspace();
  referencing(ws, 'code-block', 'color: var(--ui-color-teal-500)');
  const result = await lintIn(ws, staleOpts(ws), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a reference to a non-primitive token does not keep it alive', async () => {
  const ws = workspace();
  referencing(ws, 'code-block', 'font: var(--ui-type-code)');
  const result = await lintIn(ws, staleOpts(ws), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('only `<root>/<dir>/*.css` counts: other extensions and nested folders do not', async () => {
  const ws = workspace();
  ws.write(
    'components/code-block/atl.scss',
    '.x { font: var(--ui-font-display); }',
  );
  ws.write(
    'components/code-block/deep/atl.css',
    '.x { font: var(--ui-font-display); }',
  );
  ws.write('components/loose.css', '.x { font: var(--ui-font-display); }');
  const result = await lintIn(ws, staleOpts(ws), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a componentRoot that does not exist reports every exemption stale', async () => {
  const ws = workspace();
  const result = await lintRule(
    plugin,
    [true, staleOpts(ws)],
    '.a { color: red; }',
    ws.path('components/button/a.css'),
  );
  assert.equal(errorsOf(result).length, 1);
});

test('stale is reported once per componentRoot per process, on the first file', async () => {
  const ws = workspace();
  const options = staleOpts(ws);
  const first = await lintIn(ws, options, 'button', 'color: red;', 'one.css');
  const second = await lintIn(ws, options, 'button', 'color: red;', 'two.css');
  assert.equal(errorsOf(first).length, 1);
  assert.deepEqual(errorsOf(second), []);
});

test('without componentRoot there is no staleness scan', async () => {
  const ws = workspace();
  const options = { allowlistsFile: allowlists(ws, { exemptions: [GAP] }) };
  const result = await lintIn(ws, options, 'button', 'color: red;');
  assert.deepEqual(texts(result), []);
});

test('a file outside componentRoot is not in scope, so no staleness is reported', async () => {
  const ws = workspace();
  ws.write('components/button/atl.css', '.x { color: red; }');
  const options = staleOpts(ws, {
    componentRoot: ws.path('components/button'),
  });
  const result = await lintRule(
    plugin,
    [true, options],
    '.a { color: red; }',
    ws.path('elsewhere/a.css'),
  );
  assert.deepEqual(texts(result), []);
});

test('a file named by a root that is a prefix of another directory is not in scope', async () => {
  const ws = workspace();
  const options = staleOpts(ws, { componentRoot: ws.path('components') });
  const result = await lintRule(
    plugin,
    [true, options],
    '.a { color: red; }',
    ws.path('components-extra/button/a.css'),
  );
  assert.deepEqual(texts(result), []);
});

test('an empty PRIMITIVE_EXEMPTIONS map skips the scan, so nothing is stale', async () => {
  const ws = workspace();
  const options = {
    componentRoot: rootOf(ws),
    allowlistsFile: allowlists(ws, { exemptions: [] }),
  };
  assert.deepEqual(
    texts(await lintIn(ws, options, 'button', 'color: red;')),
    [],
  );
});

test('sharedRoot references count as evidence an exemption is still used', async () => {
  const ws = workspace();
  ws.write('components/button/atl.css', '.x { color: red; }');
  ws.write('shared/code-block/atl.css', '.x { font: var(--ui-font-display); }');
  const without = await lintIn(ws, staleOpts(ws), 'button', 'color: red;');
  assert.equal(errorsOf(without).length, 1, 'stale without the shared tree');

  const ws2 = workspace();
  ws2.write('components/button/atl.css', '.x { color: red; }');
  ws2.write(
    'shared/code-block/atl.css',
    '.x { font: var(--ui-font-display); }',
  );
  const withShared = await lintIn(
    ws2,
    staleOpts(ws2, { sharedRoot: ws2.path('shared') }),
    'button',
    'color: red;',
  );
  assert.deepEqual(errorsOf(withShared), []);
});

test('sharedRoot is evidence only: it is never a scope to lint', async () => {
  const ws = workspace();
  const options = staleOpts(ws, { sharedRoot: ws.path('shared') });
  const result = await lintRule(
    plugin,
    [true, options],
    '.a { color: red; }',
    ws.path('shared/button/a.css'),
  );
  assert.deepEqual(texts(result), []);
});

for (const [name, spell] of Object.entries({
  'a leading ./': (rel) => `./${rel}`,
  'a trailing slash': (rel) => `${rel}/`,
  'an absolute path': (rel, abs) => abs,
})) {
  test(`componentRoot with ${name} still runs the staleness scan`, async () => {
    const ws = workspace();
    const abs = rootOf(ws);
    const rel = path.relative(REPO_ROOT, abs);
    const options = staleOpts(ws, { componentRoot: spell(rel, abs) });
    const result = await lintIn(ws, options, 'button', 'color: red;');
    assert.equal(errorsOf(result).length, 1);
  });
}

test('the staleness cache is keyed on allowlistsFile, not only componentRoot', async () => {
  const ws = workspace();
  ws.write('components/button/atl.css', '.x { color: red; }');
  const a = allowlists(ws, { exemptions: [GAP], name: 'a.js' });
  const b = allowlists(ws, { exemptions: [GAP], name: 'b.js' });
  const first = await lintIn(
    ws,
    { componentRoot: rootOf(ws), allowlistsFile: a },
    'button',
    'color: red;',
  );
  const second = await lintIn(
    ws,
    { componentRoot: rootOf(ws), allowlistsFile: b },
    'button',
    'color: red;',
  );
  assert.equal(errorsOf(first).length, 1);
  assert.equal(
    errorsOf(second).length,
    1,
    'the second override must get its own scan',
  );
});

test('the staleness cache is keyed on sharedRoot', async () => {
  const ws = workspace();
  ws.write('components/button/atl.css', '.x { color: red; }');
  ws.write('shared/code-block/atl.css', '.x { font: var(--ui-font-display); }');
  const base = staleOpts(ws);
  const kept = await lintIn(
    ws,
    { ...base, sharedRoot: ws.path('shared') },
    'button',
    'color: red;',
  );
  const stale = await lintIn(ws, base, 'button', 'color: red;');
  assert.deepEqual(errorsOf(kept), []);
  assert.equal(errorsOf(stale).length, 1);
});

// Not tested, on purpose: that rewriting a stylesheet under componentRoot is
// seen by a second lint in the SAME process. It is not: the scan result and the
// allowlists module are cached for the life of the process (`seenByRoot`,
// `require`). That is safe because one stylelint run is one process, and the
// cross-run half is Nx's, whose `stylelint` inputs name the rules, the config,
// tokens.css and allowlists.js (asserted in no-undeclared-token.test.js and
// no-token-bypass.test.js).

// --- the live map and the live config (smoke) --------------------------------------

const live = require(path.join(REPO_ROOT, 'tools/scripts/lib/allowlists.js'));

test('every live PRIMITIVE_EXEMPTIONS entry has the shape the rule reads', () => {
  for (const [key, entry] of live.PRIMITIVE_EXEMPTIONS) {
    assert.match(key, /^[a-z-]+:--ui-[a-z0-9-]+$/, key);
    assert.ok(['design', 'gap'].includes(entry.kind), key);
    assert.ok(entry.reason && entry.reason.length > 0, key);
    assert.ok(
      live.PRIMITIVE_TOKENS.some((p) => p.match.test(key.split(':')[1])),
      `${key} exempts a token no PRIMITIVE_TOKENS pattern forbids`,
    );
  }
});

test('every live exemption passes in its directory and fails in another', async () => {
  const options = { allowlistsFile: 'tools/scripts/lib/allowlists.js' };
  for (const [key, entry] of live.PRIMITIVE_EXEMPTIONS) {
    const [dir, token] = key.split(':');
    const css = `.a { font: var(${token}); }`;
    const inside = await lintRule(
      plugin,
      [true, options],
      css,
      `/tmp/x/${dir}/a.css`,
    );
    assert.deepEqual(errorsOf(inside), [], key);
    assert.equal(warningsOf(inside).length, entry.kind === 'gap' ? 1 : 0, key);
    const elsewhere = await lintRule(
      plugin,
      [true, options],
      css,
      '/tmp/x/not-a-component/a.css',
    );
    assert.equal(errorsOf(elsewhere).length, 1, key);
  }
});

test('the live config is clean over the live component CSS, [GAP] warnings aside', async () => {
  const { results } = await stylelint.lint({
    files: [
      'libs/angular/src/lib/**/*.css',
      'libs/react/src/lib/**/*.css',
      'libs/vue/src/lib/**/*.css',
      'libs/styles/src/*/**/*.css',
    ],
    cwd: REPO_ROOT,
    configFile: path.join(REPO_ROOT, 'stylelint.config.mjs'),
  });
  assert.ok(results.length >= 29, `only ${results.length} files linted`);
  const mine = results.flatMap((r) =>
    r.warnings.filter((w) => w.rule === 'atelier/no-primitive-token'),
  );
  assert.deepEqual(
    mine.filter((w) => w.severity === 'error').map((w) => w.text),
    [],
  );
  assert.ok(mine.every((w) => w.text.startsWith('[GAP]')));
});
