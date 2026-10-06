'use strict';

/**
 * Tests for atelier/no-token-bypass. Run with `node --test
 * tools/stylelint-rules/` (part of `npm run check:stylelint`).
 *
 * Branches of the rule: the family check (a literal that equals a token in the
 * family its own property draws from, for each property in `FAMILY`); the
 * border-width check (any literal length on a `border*` property); the
 * structural / `var(--ui-` early returns; `TOKEN_BYPASS_EXEMPT` with its two
 * kinds (`design` silent, `gap` a warning); the `tokenFile`, `allowlistsFile`,
 * `componentRoot` and `sharedRoot` options; `[INVALID-ALLOWLISTS]`; and the
 * once-per-root `[STALE-EXEMPT]` scan with the cache key that guards it.
 *
 * Token sources and allowlists are temp files, so the tests do not move when
 * the live tokens or the live `TOKEN_BYPASS_EXEMPT` do. The last block reads the
 * live map and the live config once, as a smoke test.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const stylelint = require('stylelint');
const plugin = require('./no-token-bypass');
const { REPO_ROOT } = require('./utils');
const {
  workspace,
  lintRule,
  texts,
  errorsOf,
  warningsOf,
} = require('./test-support');

/** family prefix -> [the value its token holds, the properties that draw on it] */
const FAMILIES = {
  z: ['1000', ['z-index']],
  opacity: ['0.5', ['opacity']],
  'letter-spacing': ['0.02em', ['letter-spacing']],
  'font-weight': ['600', ['font-weight']],
  'font-size': ['0.875rem', ['font-size']],
  'line-height': ['1.4', ['line-height']],
  radius: ['0.375rem', ['border-radius']],
  shadow: ['0 1px 2px black', ['box-shadow']],
  duration: ['150ms', ['transition-duration', 'animation-duration']],
  spacing: [
    '0.75rem',
    [
      ...['padding', 'margin'].flatMap((p) => [
        p,
        `${p}-top`,
        `${p}-right`,
        `${p}-bottom`,
        `${p}-left`,
      ]),
      'gap',
      'row-gap',
      'column-gap',
    ],
  ],
  'control-height': ['2.5rem', ['min-height', 'height', 'width', 'min-width']],
};

const TOKENS = `
/* --ui-spacing-commented: 9rem; */
:root {
${Object.entries(FAMILIES)
  .map(([prefix, [value]]) => `  --ui-${prefix}-md: ${value};`)
  .join('\n')}
  --ui-spacing-twin: 0.75rem;
  --ui-control-height-alias: var(--ui-control-height-md);
  --ui-misc-size: 7px;
  --ui-color-border: #ccc;
}
@media (prefers-color-scheme: dark) {
  :root { --ui-opacity-dark: 0.9; --ui-spacing-dark: 7rem; }
}
`;

const EXEMPT_DESIGN = `'toast:border-left:4px': { kind: 'design', why: 'accent bar, not a border weight' }`;
const EXEMPT_GAP = `'tabs:min-height:2.5rem': { kind: 'gap', why: 'still bound by hand' }`;

function allowlists(ws, { exempt = [], name } = {}) {
  return ws.write(
    name || 'allowlists.js',
    `module.exports = { TOKEN_BYPASS_EXEMPT: { ${exempt.join(',')} } };`,
  );
}

function setup(extra = {}) {
  const ws = workspace();
  const tokenFile = ws.write('tokens.css', TOKENS);
  return { ws, tokenFile, ...extra };
}

function lintIn(ws, options, dir, decl, file = 'a.css') {
  return lintRule(
    plugin,
    [true, options],
    `.a { ${decl} }`,
    ws.path(`components/${dir}/${file}`),
  );
}

const rootOf = (ws) => ws.path('components');

// --- the family check ----------------------------------------------------------

for (const [prefix, [value, props]] of Object.entries(FAMILIES)) {
  for (const prop of props) {
    test(`rejects ${prop}: ${value} (the --ui-${prefix}-md value)`, async () => {
      const { ws, tokenFile } = setup();
      const found = texts(
        await lintIn(ws, { tokenFile }, 'button', `${prop}: ${value};`),
      );
      assert.equal(found.length, 1, found.join('\n'));
      assert.match(found[0], /\[BYPASS\]/);
      assert.ok(found[0].includes(`var(--ui-${prefix}-md)`), found[0]);
    });
  }
}

test('lists every token that holds the value', async () => {
  const { ws, tokenFile } = setup();
  const [text] = texts(
    await lintIn(ws, { tokenFile }, 'button', 'padding: 0.75rem;'),
  );
  assert.match(text, /var\(--ui-spacing-md\) \/ var\(--ui-spacing-twin\)/);
  assert.match(text, /sets padding: 0\.75rem/);
  assert.match(text, /TOKEN_BYPASS_EXEMPT/);
});

const valid = {
  'a literal no token holds': 'padding: 0.8rem;',
  'a token read': 'padding: var(--ui-spacing-md);',
  'a value from the wrong family (a spacing value on a width)':
    'width: 0.75rem;',
  'a radius value on padding': 'padding: 0.375rem;',
  'a property with no family': 'top: 0.75rem;',
  'a property that only starts like a family one': 'padding-inline: 0.75rem;',
  'a literal held by a token in no family': 'padding: 7px;',
  'a value held only by a dark-mode token': 'opacity: 0.9;',
  'a value held only by an alias token (an alias has no value of its own)':
    'height: var(--ui-control-height-alias);',
  'a value held only inside a comment in the token source': 'padding: 9rem;',
  'a multi-value literal that is not any token': 'padding: 0.75rem 1rem;',
  0: 'padding: 0;',
  none: 'box-shadow: none;',
  auto: 'width: auto;',
  inherit: 'padding: inherit;',
  initial: 'padding: initial;',
  unset: 'padding: unset;',
  currentColor: 'border-color: currentColor;',
  transparent: 'border-color: transparent;',
  'a token read mixed with a literal': 'padding: var(--ui-spacing-md) 0.75rem;',
};

for (const [name, decl] of Object.entries(valid)) {
  test(`accepts ${name}`, async () => {
    const { ws, tokenFile } = setup();
    assert.deepEqual(
      texts(await lintIn(ws, { tokenFile }, 'button', decl)),
      [],
    );
  });
}

test('the property name is matched case-insensitively', async () => {
  const { ws, tokenFile } = setup();
  const found = texts(
    await lintIn(ws, { tokenFile }, 'button', 'PADDING: 0.75rem;'),
  );
  assert.equal(found.length, 1);
});

test('whitespace inside the value is normalised before comparing', async () => {
  const { ws, tokenFile } = setup();
  const found = texts(
    await lintIn(
      ws,
      { tokenFile },
      'button',
      'box-shadow: 0   1px   2px black;',
    ),
  );
  assert.equal(found.length, 1);
});

test('without tokenFile the family check finds nothing, the border check still runs', async () => {
  const { ws } = setup();
  assert.deepEqual(
    texts(await lintIn(ws, {}, 'button', 'padding: 0.75rem;')),
    [],
  );
  assert.equal(
    texts(await lintIn(ws, {}, 'button', 'border: 1px solid red;')).length,
    1,
  );
});

// --- the border-width check ------------------------------------------------------

for (const [decl, shown] of [
  ['border: 1px solid red;', '1px'],
  ['border-top: 2px solid red;', '2px'],
  ['border-right: 1px dashed red;', '1px'],
  ['border-bottom: 1px solid red;', '1px'],
  ['border-left: 4px solid red;', '4px'],
  ['border-width: 3px;', '3px'],
  ['border-top-width: 1px;', '1px'],
  ['border-left-width: 0.5em;', '0.5em'],
  ['border: 0.0625rem solid red;', '0.0625rem'],
]) {
  test(`[BORDER] rejects ${decl}`, async () => {
    const { ws, tokenFile } = setup();
    const found = texts(await lintIn(ws, { tokenFile }, 'button', decl));
    assert.equal(found.length, 1, found.join('\n'));
    assert.match(found[0], /\[BORDER\]/);
    assert.ok(found[0].includes(shown), found[0]);
  });
}

for (const decl of [
  'border: none;',
  'border: 0;',
  'border: solid red;',
  'border: thin solid red;',
  'border-style: solid;',
  'border-color: red;',
  'border-radius: 9px;',
  'border-collapse: collapse;',
  'border: var(--ui-border-width) solid red;',
]) {
  test(`[BORDER] accepts ${decl}`, async () => {
    const { ws, tokenFile } = setup();
    assert.deepEqual(
      texts(await lintIn(ws, { tokenFile }, 'button', decl)),
      [],
    );
  });
}

for (const [decl, shown] of [
  ['border: 1px solid var(--ui-color-border);', '1px'],
  ['border-left: 4px solid var(--ui-color-danger);', '4px'],
  ['border-bottom: 0.0625rem dashed var(--ui-color-border, red);', '0.0625rem'],
]) {
  test(`[BORDER] rejects a literal width beside a token colour: ${decl}`, async () => {
    const { ws, tokenFile } = setup();
    const found = texts(await lintIn(ws, { tokenFile }, 'button', decl));
    assert.equal(found.length, 1, found.join('\n'));
    assert.match(found[0], /\[BORDER\]/);
    assert.ok(found[0].includes(shown), found[0]);
  });
}

test('[BORDER] accepts a token width beside a token colour', async () => {
  const { ws, tokenFile } = setup();
  const decl = 'border: var(--ui-border-width) solid var(--ui-color-border);';
  assert.deepEqual(texts(await lintIn(ws, { tokenFile }, 'button', decl)), []);
});

test('[BORDER] needs no token to be held: the width is wrong on its own', async () => {
  const { ws } = setup();
  assert.equal(
    texts(await lintIn(ws, {}, 'button', 'border-width: 9px;')).length,
    1,
  );
});

// --- exemptions: TOKEN_BYPASS_EXEMPT -----------------------------------------------

test('a design exemption on a border width is silent', async () => {
  const { ws, tokenFile } = setup();
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [EXEMPT_DESIGN] }),
  };
  const result = await lintIn(
    ws,
    options,
    'toast',
    'border-left: 4px solid red;',
  );
  assert.deepEqual(texts(result), []);
});

test('the same border without the exemption fails, in another directory', async () => {
  const { ws, tokenFile } = setup();
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [EXEMPT_DESIGN] }),
  };
  const result = await lintIn(
    ws,
    options,
    'card',
    'border-left: 4px solid red;',
  );
  assert.equal(errorsOf(result).length, 1);
});

test('the same border without any allowlists fails', async () => {
  const { ws, tokenFile } = setup();
  const result = await lintIn(
    ws,
    { tokenFile },
    'toast',
    'border-left: 4px solid red;',
  );
  assert.equal(errorsOf(result).length, 1);
});

test('an exemption on a border is keyed on the property too', async () => {
  const { ws, tokenFile } = setup();
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [EXEMPT_DESIGN] }),
  };
  const result = await lintIn(
    ws,
    options,
    'toast',
    'border-right: 4px solid red;',
  );
  assert.equal(errorsOf(result).length, 1);
});

test('an exemption on a border is keyed on the width too', async () => {
  const { ws, tokenFile } = setup();
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [EXEMPT_DESIGN] }),
  };
  const result = await lintIn(
    ws,
    options,
    'toast',
    'border-left: 5px solid red;',
  );
  assert.equal(errorsOf(result).length, 1);
});

test('a gap exemption on a family value passes but warns, as a warning not an error', async () => {
  const { ws, tokenFile } = setup();
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [EXEMPT_GAP] }),
  };
  const result = await lintIn(ws, options, 'tabs', 'min-height: 2.5rem;');
  assert.deepEqual(errorsOf(result), []);
  assert.deepEqual(warningsOf(result), [
    '[GAP] min-height: 2.5rem should bind to var(--ui-control-height-md). still bound by hand (atelier/no-token-bypass)',
  ]);
});

test('a gap exemption on a border width warns that it is still unbound', async () => {
  const { ws, tokenFile } = setup();
  const gap = `'tabs:border-bottom:2px': { kind: 'gap', why: 'later' }`;
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [gap] }),
  };
  const result = await lintIn(
    ws,
    options,
    'tabs',
    'border-bottom: 2px solid red;',
  );
  assert.deepEqual(errorsOf(result), []);
  assert.deepEqual(warningsOf(result), [
    '[GAP] border-bottom: 2px still unbound. later (atelier/no-token-bypass)',
  ]);
});

test('a design exemption on a family value is silent', async () => {
  const { ws, tokenFile } = setup();
  const design = `'progress:opacity:0.5': { kind: 'design', why: 'coincidence' }`;
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [design] }),
  };
  assert.deepEqual(
    texts(await lintIn(ws, options, 'progress', 'opacity: 0.5;')),
    [],
  );
});

test('the same family value without the exemption fails, in another directory', async () => {
  const { ws, tokenFile } = setup();
  const design = `'progress:opacity:0.5': { kind: 'design', why: 'coincidence' }`;
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [design] }),
  };
  const result = await lintIn(ws, options, 'toggle', 'opacity: 0.5;');
  assert.equal(errorsOf(result).length, 1);
});

test('an exemption on one property does not excuse another with the same value', async () => {
  const { ws, tokenFile } = setup();
  const options = {
    tokenFile,
    allowlistsFile: allowlists(ws, { exempt: [EXEMPT_GAP] }),
  };
  const result = await lintIn(ws, options, 'tabs', 'height: 2.5rem;');
  assert.equal(errorsOf(result).length, 1);
});

// --- allowlistsFile validation (ADR-0124's failure class) -----------------------------

for (const [name, body, reason] of [
  [
    'TOKEN_BYPASS_EXEMPT missing',
    'module.exports = {};',
    /is undefined \(no such export\), expected an object/,
  ],
  [
    'TOKEN_BYPASS_EXEMPT an array',
    'module.exports = { TOKEN_BYPASS_EXEMPT: [] };',
    /is an array, expected an object/,
  ],
  [
    'TOKEN_BYPASS_EXEMPT a Map (the shape of PRIMITIVE_EXEMPTIONS, not of this one)',
    "module.exports = { TOKEN_BYPASS_EXEMPT: new Map([['toast:border-left:4px', { kind: 'design', why: 'x' }]]) };",
    /is a Map, expected an object/,
  ],
  [
    'TOKEN_BYPASS_EXEMPT null',
    'module.exports = { TOKEN_BYPASS_EXEMPT: null };',
    /is null, expected an object/,
  ],
  [
    'TOKEN_BYPASS_EXEMPT a string',
    "module.exports = { TOKEN_BYPASS_EXEMPT: 'x' };",
    /is a string, expected an object/,
  ],
]) {
  test(`reports [INVALID-ALLOWLISTS] when ${name}`, async () => {
    const { ws, tokenFile } = setup();
    const allowlistsFile = ws.write('broken.js', body);
    const result = await lintIn(
      ws,
      { tokenFile, allowlistsFile },
      'button',
      'color: red;',
    );
    assert.equal(errorsOf(result).length, 1, texts(result).join('\n'));
    assert.match(errorsOf(result)[0], /\[INVALID-ALLOWLISTS\]/);
    assert.match(errorsOf(result)[0], reason);
  });
}

test('[INVALID-ALLOWLISTS] repeats on every file, it is not a once-per-root report', async () => {
  const { ws, tokenFile } = setup();
  const allowlistsFile = ws.write('broken.js', 'module.exports = {};');
  for (let i = 0; i < 2; i++) {
    const result = await lintIn(
      ws,
      { tokenFile, allowlistsFile },
      'button',
      'color: red;',
      `f${i}.css`,
    );
    assert.equal(errorsOf(result).length, 1);
  }
});

test('an allowlistsFile that does not exist throws rather than passes', async () => {
  const { ws, tokenFile } = setup();
  await assert.rejects(
    lintIn(
      ws,
      { tokenFile, allowlistsFile: ws.path('nope.js') },
      'button',
      'color: red;',
    ),
    /Cannot find module/,
  );
});

test('a tokenFile that does not exist throws rather than passes', async () => {
  const { ws } = setup();
  await assert.rejects(
    lintIn(
      ws,
      { tokenFile: ws.path('nope.css') },
      'button',
      'padding: 0.75rem;',
    ),
    /ENOENT/,
  );
});

test('allowlistsFile and tokenFile are resolved against the repo root when relative', async () => {
  const result = await lintRule(
    plugin,
    [
      true,
      {
        tokenFile: 'libs/styles/src/tokens.css',
        allowlistsFile: 'tools/scripts/lib/allowlists.js',
      },
    ],
    '.a { border: 1px solid red; }',
    '/tmp/x/button/a.css',
  );
  assert.equal(errorsOf(result).length, 1);
});

// --- reading the token source -----------------------------------------------------------

test('only the light block of the token source supplies values', async () => {
  const { ws } = setup();
  const tokenFile = ws.write(
    'light-dark.css',
    ':root { --ui-spacing-md: 1rem; } @media (prefers-color-scheme: dark) { :root { --ui-spacing-md: 2rem; } }',
  );
  assert.equal(
    texts(await lintIn(ws, { tokenFile }, 'b', 'padding: 1rem;')).length,
    1,
  );
  assert.deepEqual(
    texts(await lintIn(ws, { tokenFile }, 'b', 'padding: 2rem;')),
    [],
  );
});

test('a token source without a dark block is read whole', async () => {
  const { ws } = setup();
  const tokenFile = ws.write('plain.css', ':root { --ui-spacing-md: 1rem; }');
  assert.equal(
    texts(await lintIn(ws, { tokenFile }, 'b', 'padding: 1rem;')).length,
    1,
  );
});

test('different tokenFile paths are read independently', async () => {
  const { ws } = setup();
  const a = ws.write('a.css', ':root { --ui-spacing-md: 1rem; }');
  const b = ws.write('b.css', ':root { --ui-spacing-md: 3rem; }');
  assert.equal(
    texts(await lintIn(ws, { tokenFile: a }, 'b', 'padding: 1rem;')).length,
    1,
  );
  assert.equal(
    texts(await lintIn(ws, { tokenFile: b }, 'b', 'padding: 1rem;')).length,
    0,
  );
  assert.equal(
    texts(await lintIn(ws, { tokenFile: b }, 'b', 'padding: 3rem;')).length,
    1,
  );
});

// --- option validation ------------------------------------------------------------------

for (const [name, options] of Object.entries({
  'an empty tokenFile': { tokenFile: '' },
  'an empty componentRoot': { componentRoot: '' },
  'a non-string sharedRoot': { sharedRoot: 3 },
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

test('a bare `true` with no secondary options object is an invalid configuration', async () => {
  const result = await lintRule(
    plugin,
    true,
    '.a { border: 1px solid red; }',
    '/tmp/x/a.css',
  );
  assert.ok(result.invalidOptionWarnings.length > 0);
});

test('an empty secondary options object runs the border check only', async () => {
  const result = await lintRule(
    plugin,
    [true, {}],
    '.a { border: 1px solid red; }',
    '/tmp/x/a.css',
  );
  assert.equal(texts(result).length, 1);
});

// --- staleness (ADR-0034) -----------------------------------------------------------------

function staleSetup({ exempt = [EXEMPT_GAP], css = {}, tokens } = {}) {
  const ws = workspace();
  const tokenFile = ws.write('tokens.css', tokens || TOKENS);
  const allowlistsFile = allowlists(ws, { exempt });
  for (const [rel, body] of Object.entries(css))
    ws.write(`components/${rel}`, body);
  return { ws, tokenFile, allowlistsFile };
}

const staleOptions = ({ ws, tokenFile, allowlistsFile }, extra = {}) => ({
  tokenFile,
  allowlistsFile,
  componentRoot: rootOf(ws),
  ...extra,
});

const TABS_CSS = { 'tabs/atl.css': '.x { min-height: 2.5rem; }' };

test('reports [STALE-EXEMPT] for an exemption no stylesheet carries any more', async () => {
  const s = staleSetup({ css: { 'tabs/atl.css': '.x { color: red; }' } });
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
  assert.match(
    errorsOf(result)[0],
    /\[STALE-EXEMPT\] TOKEN_BYPASS_EXEMPT lists 'tabs:min-height:2.5rem'/,
  );
});

test('an exemption whose literal is still in a stylesheet is not stale', async () => {
  const s = staleSetup({ css: TABS_CSS });
  assert.deepEqual(
    errorsOf(await lintIn(s.ws, staleOptions(s), 'button', 'color: red;')),
    [],
  );
});

test('a border exemption is kept alive by a literal width beside a token colour', async () => {
  const s = staleSetup({
    exempt: [EXEMPT_DESIGN],
    css: {
      'toast/atl.css': '.x { border-left: 4px solid var(--ui-color-danger); }',
    },
  });
  assert.deepEqual(
    errorsOf(await lintIn(s.ws, staleOptions(s), 'button', 'color: red;')),
    [],
  );
});

test('a border exemption is kept alive by a border literal', async () => {
  const s = staleSetup({
    exempt: [EXEMPT_DESIGN],
    css: { 'toast/atl.css': '.x { border-left: 4px solid red; }' },
  });
  assert.deepEqual(
    errorsOf(await lintIn(s.ws, staleOptions(s), 'button', 'color: red;')),
    [],
  );
});

test('staleness sees a literal in a stylesheet this run never lints', async () => {
  const s = staleSetup({ css: TABS_CSS });
  const result = await lintIn(
    s.ws,
    staleOptions(s),
    'elsewhere',
    'color: red;',
  );
  assert.deepEqual(errorsOf(result), []);
});

test('a literal in the wrong directory does not keep an exemption alive', async () => {
  const s = staleSetup({
    css: { 'button/atl.css': '.x { min-height: 2.5rem; }' },
  });
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a literal on another property does not keep it alive', async () => {
  const s = staleSetup({ css: { 'tabs/atl.css': '.x { height: 2.5rem; }' } });
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a literal that no token holds any more is stale: the family scan reads the tokens', async () => {
  const s = staleSetup({
    css: TABS_CSS,
    tokens: ':root { --ui-control-height-md: 3rem; }',
  });
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a declaration bound to a token does not keep an exemption alive', async () => {
  const s = staleSetup({
    css: { 'tabs/atl.css': '.x { min-height: var(--ui-control-height-md); }' },
  });
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a literal inside a comment does not keep an exemption alive', async () => {
  const s = staleSetup({
    css: { 'tabs/atl.css': '/* .x { min-height: 2.5rem; } */' },
  });
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('the scan finds a literal inside @media, after a `{`', async () => {
  const s = staleSetup({
    css: {
      'tabs/atl.css': '@media (min-width: 1px) { .x { min-height: 2.5rem } }',
    },
  });
  assert.deepEqual(
    errorsOf(await lintIn(s.ws, staleOptions(s), 'button', 'color: red;')),
    [],
  );
});

test('only `<root>/<dir>/*.css` counts: other extensions and nested folders do not', async () => {
  const s = staleSetup({
    css: {
      'tabs/atl.scss': '.x { min-height: 2.5rem; }',
      'tabs/deep/atl.css': '.x { min-height: 2.5rem; }',
      'loose.css': '.x { min-height: 2.5rem; }',
    },
  });
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('a componentRoot that does not exist reports every exemption stale', async () => {
  const s = staleSetup();
  const result = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.equal(errorsOf(result).length, 1);
});

test('stale is reported once per componentRoot per process, on the first file', async () => {
  const s = staleSetup();
  const first = await lintIn(
    s.ws,
    staleOptions(s),
    'button',
    'color: red;',
    'one.css',
  );
  const second = await lintIn(
    s.ws,
    staleOptions(s),
    'button',
    'color: red;',
    'two.css',
  );
  assert.equal(errorsOf(first).length, 1);
  assert.deepEqual(errorsOf(second), []);
});

test('without componentRoot there is no staleness scan', async () => {
  const s = staleSetup();
  const { tokenFile, allowlistsFile } = s;
  const result = await lintIn(
    s.ws,
    { tokenFile, allowlistsFile },
    'button',
    'color: red;',
  );
  assert.deepEqual(texts(result), []);
});

test('a file outside componentRoot is not in scope', async () => {
  const s = staleSetup();
  const result = await lintRule(
    plugin,
    [true, staleOptions(s)],
    '.a { color: red; }',
    s.ws.path('elsewhere/button/a.css'),
  );
  assert.deepEqual(texts(result), []);
});

test('a root that is only a path prefix of the file is not in scope', async () => {
  const s = staleSetup();
  const result = await lintRule(
    plugin,
    [true, staleOptions(s)],
    '.a { color: red; }',
    s.ws.path('components-extra/button/a.css'),
  );
  assert.deepEqual(texts(result), []);
});

test('an empty TOKEN_BYPASS_EXEMPT skips the scan, so nothing is stale', async () => {
  const s = staleSetup({ exempt: [] });
  assert.deepEqual(
    texts(await lintIn(s.ws, staleOptions(s), 'button', 'color: red;')),
    [],
  );
});

test('without allowlistsFile there are no exemptions and no staleness', async () => {
  const s = staleSetup();
  const options = { tokenFile: s.tokenFile, componentRoot: rootOf(s.ws) };
  assert.deepEqual(
    texts(await lintIn(s.ws, options, 'button', 'color: red;')),
    [],
  );
});

test('sharedRoot literals count as evidence an exemption is still used', async () => {
  const without = staleSetup();
  without.ws.write('shared/tabs/atl.css', '.x { min-height: 2.5rem; }');
  const a = await lintIn(
    without.ws,
    staleOptions(without),
    'button',
    'color: red;',
  );
  assert.equal(errorsOf(a).length, 1, 'stale without the shared tree');

  const withShared = staleSetup();
  withShared.ws.write('shared/tabs/atl.css', '.x { min-height: 2.5rem; }');
  const b = await lintIn(
    withShared.ws,
    staleOptions(withShared, { sharedRoot: withShared.ws.path('shared') }),
    'button',
    'color: red;',
  );
  assert.deepEqual(errorsOf(b), []);
});

test('sharedRoot is evidence only: it is never a scope to lint', async () => {
  const s = staleSetup();
  const result = await lintRule(
    plugin,
    [true, staleOptions(s, { sharedRoot: s.ws.path('shared') })],
    '.a { color: red; }',
    s.ws.path('shared/button/a.css'),
  );
  assert.deepEqual(texts(result), []);
});

for (const [name, spell] of Object.entries({
  'a leading ./': (rel) => `./${rel}`,
  'a trailing slash': (rel) => `${rel}/`,
  'an absolute path': (rel, abs) => abs,
})) {
  test(`componentRoot with ${name} still runs the staleness scan`, async () => {
    const s = staleSetup();
    const abs = rootOf(s.ws);
    const rel = path.relative(REPO_ROOT, abs);
    const result = await lintIn(
      s.ws,
      staleOptions(s, { componentRoot: spell(rel, abs) }),
      'button',
      'color: red;',
    );
    assert.equal(errorsOf(result).length, 1);
  });
}

test('the staleness cache is keyed on allowlistsFile', async () => {
  const s = staleSetup();
  const other = allowlists(s.ws, { exempt: [EXEMPT_GAP], name: 'other.js' });
  const first = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  const second = await lintIn(
    s.ws,
    staleOptions(s, { allowlistsFile: other }),
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

test('the staleness cache is keyed on tokenFile: the scan depends on token values', async () => {
  const s = staleSetup({ css: TABS_CSS });
  const sparse = s.ws.write(
    'sparse.css',
    ':root { --ui-control-height-md: 3rem; }',
  );
  const alive = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  const stale = await lintIn(
    s.ws,
    staleOptions(s, { tokenFile: sparse }),
    'button',
    'color: red;',
  );
  assert.deepEqual(errorsOf(alive), []);
  assert.equal(errorsOf(stale).length, 1);
});

test('the staleness cache is keyed on sharedRoot', async () => {
  const s = staleSetup();
  s.ws.write('shared/tabs/atl.css', '.x { min-height: 2.5rem; }');
  const kept = await lintIn(
    s.ws,
    staleOptions(s, { sharedRoot: s.ws.path('shared') }),
    'button',
    'color: red;',
  );
  const stale = await lintIn(s.ws, staleOptions(s), 'button', 'color: red;');
  assert.deepEqual(errorsOf(kept), []);
  assert.equal(errorsOf(stale).length, 1);
});

// --- the cache trap (ADR-0126, ADR-0130) ---------------------------------------------------
//
// Not tested, on purpose: that rewriting a token file, an allowlists module or a
// stylesheet under componentRoot is seen by a second lint in the SAME process.
// It is not: the token values, the allowlists module (`require`) and the scan
// result are cached for the life of the process. That is safe for a CLI or an
// Nx run, which is one process per run. It is a real limit for a long-lived
// editor server, which keeps the first answer until restart.
// What IS pinned is the cross-run half, which is Nx's: the `stylelint` target's
// inputs must name everything this rule reads outside the file it lints.

test('Nx lists tokens.css, the allowlists, the config and the rules as stylelint inputs', () => {
  const nx = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'nx.json'), 'utf8'),
  );
  const inputs = nx.targetDefaults.stylelint.inputs.filter(
    (i) => typeof i === 'string',
  );
  for (const input of [
    '{workspaceRoot}/libs/styles/src/tokens.css',
    '{workspaceRoot}/tools/scripts/lib/allowlists.js',
    '{workspaceRoot}/stylelint.config.mjs',
    '{workspaceRoot}/tools/stylelint-rules/**/*',
  ]) {
    assert.ok(inputs.includes(input), `${input} is not a stylelint input`);
  }
});

// --- the live map and the live config (smoke) --------------------------------------------------

const live = require(path.join(REPO_ROOT, 'tools/scripts/lib/allowlists.js'));

test('every live TOKEN_BYPASS_EXEMPT entry has the shape the rule reads', () => {
  for (const [key, entry] of Object.entries(live.TOKEN_BYPASS_EXEMPT)) {
    assert.match(key, /^[a-z-]+:[a-z-]+:[\w.]+$/, key);
    assert.ok(['design', 'gap'].includes(entry.kind), key);
    assert.ok(entry.why && entry.why.length > 0, key);
  }
});

test('every live border exemption passes in its directory and fails in another', async () => {
  const options = { allowlistsFile: 'tools/scripts/lib/allowlists.js' };
  let checked = 0;
  for (const [key, entry] of Object.entries(live.TOKEN_BYPASS_EXEMPT)) {
    const [dir, prop, value] = key.split(':');
    if (!/^border/.test(prop)) continue; // a family entry needs the live token value
    checked++;
    const css = `.a { ${prop}: ${value} solid red; }`;
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
  assert.ok(checked >= 1, 'the live map has no border entry to check');
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
    r.warnings.filter((w) => w.rule === 'atelier/no-token-bypass'),
  );
  assert.deepEqual(
    mine.filter((w) => w.severity === 'error').map((w) => w.text),
    [],
  );
  assert.ok(mine.every((w) => w.text.startsWith('[GAP]')));
});
