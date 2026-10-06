'use strict';

/**
 * Tests for atelier-template/atl-sub-component-needs-parent. Run with
 * `node --test tools/eslint-rules/` (part of `npm run check:eslint-rules`).
 *
 * Two halves. The first drives the rule through every pair in its table. The second
 * is the check that keeps that table true: it reads the Angular component sources
 * and fails when the table disagrees with them (see the rule's header).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const rule = require('./atl-sub-component-needs-parent');
const { run } = require('./template-rule-tester');

const { SUB_COMPONENT_PARENTS: TABLE } = rule;
const pairs = Object.entries(TABLE).map(([child, { parent }]) => [
  child,
  parent,
]);

const orphan = (child, parent, extra = {}) => [
  { messageId: 'orphan', data: { child, parent }, ...extra },
];

// ─── The rule, branch by branch ──────────────────────────────────────────────

const valid = {
  'a sibling that merely shares a parent': `<atl-card><atl-card-header>H</atl-card-header></atl-card>`,
  'an element that is not in the table': `<atl-badge>New</atl-badge><atl-card-content>x</atl-card-content>`,
  'a native element named like a child': `<option value="a">A</option>`,
  'a deeply nested child': `<atl-select label="X"><div><section><atl-option optionValue="a">A</atl-option></section></div></atl-select>`,
  'a child inside @if inside the parent': `<atl-select label="X">@if (show) { <atl-option optionValue="a">A</atl-option> }</atl-select>`,
  'a child inside @for inside the parent': `<atl-select label="X">@for (o of opts; track o) { <atl-option [optionValue]="o">{{ o }}</atl-option> }</atl-select>`,
  'a child inside @switch inside the parent': `<atl-select label="X">@switch (k) { @case (1) { <atl-option optionValue="a">A</atl-option> } }</atl-select>`,
  'a child under *ngIf inside the parent': `<atl-select label="X"><atl-option *ngIf="x" optionValue="a">A</atl-option></atl-select>`,
  'a child in an ng-template inside the parent': `<atl-select label="X"><ng-template><atl-option optionValue="a">A</atl-option></ng-template></atl-select>`,
  'a child in an ng-container inside the parent': `<atl-select label="X"><ng-container><atl-option optionValue="a">A</atl-option></ng-container></atl-select>`,
  'the parent itself inside @if, the child inside it': `@if (a) { <atl-select label="X"><atl-option optionValue="a">A</atl-option></atl-select> }`,
  'the right parent among other atl ancestors': `<atl-dialog><atl-card><atl-dialog-header>T</atl-dialog-header></atl-card></atl-dialog>`,
  'two different parents, each with its own child': `<atl-dialog><atl-dialog-header>T</atl-dialog-header></atl-dialog><atl-drawer><atl-drawer-header>T</atl-drawer-header></atl-drawer>`,
  'the menu in an ng-template, as documented': `<atl-button [atlMenuTriggerFor]="m">Actions</atl-button><ng-template #m><atl-menu><atl-menu-item>Copy</atl-menu-item></atl-menu></ng-template>`,

  // The template-local limit: a custom element may forward its content into the parent.
  'an orphan inside a custom wrapper element (ng-content forwarding)': `<my-select-chrome><atl-option optionValue="a">A</atl-option></my-select-chrome>`,
  'an orphan deep inside a custom wrapper element': `<my-chrome><div><atl-tab label="A">A</atl-tab></div></my-chrome>`,
  'an orphan inside a wrapper, inside @if': `@if (x) { <app-tabs-shell><atl-tab label="A">A</atl-tab></app-tabs-shell> }`,
};

const invalid = {
  // Every pair, orphaned at the template root.
  ...Object.fromEntries(
    pairs.map(([child, parent]) => [
      `${child} with no ${parent}`,
      { code: `<${child}>x</${child}>`, errors: orphan(child, parent) },
    ]),
  ),

  'the location is the open tag': {
    code: `<div>\n  <atl-option optionValue="a">A</atl-option>\n</div>`,
    errors: orphan('atl-option', 'atl-select', {
      line: 2,
      column: 3,
      endLine: 2,
      endColumn: 31,
    }),
  },
  'a self-closing orphan': {
    code: `<atl-menu-item />`,
    errors: orphan('atl-menu-item', 'atl-menu'),
  },
  'the parent is a sibling, not an ancestor': {
    code: `<atl-select label="X"></atl-select><atl-option optionValue="a">A</atl-option>`,
    errors: orphan('atl-option', 'atl-select'),
  },
  'the parent is a descendant, not an ancestor': {
    code: `<atl-option optionValue="a"><atl-select label="X"></atl-select></atl-option>`,
    errors: orphan('atl-option', 'atl-select'),
  },
  'the wrong parent': {
    code: `<atl-drawer><atl-dialog-header>T</atl-dialog-header></atl-drawer>`,
    errors: orphan('atl-dialog-header', 'atl-dialog'),
  },
  'a sibling slot of the same family': {
    code: `<atl-dialog><atl-drawer-footer>x</atl-drawer-footer></atl-dialog>`,
    errors: orphan('atl-drawer-footer', 'atl-drawer'),
  },
  'under native wrappers only': {
    code: `<div><ul><li><atl-breadcrumb-item href="/">Home</atl-breadcrumb-item></li></ul></div>`,
    errors: orphan('atl-breadcrumb-item', 'atl-breadcrumbs'),
  },
  'under another atl component (not a forwarder)': {
    code: `<atl-card><atl-tab label="A">A</atl-tab></atl-card>`,
    errors: orphan('atl-tab', 'atl-tab-group'),
  },
  'inside @if with no parent': {
    code: `@if (x) { <atl-accordion-item>x</atl-accordion-item> }`,
    errors: orphan('atl-accordion-item', 'atl-accordion-group'),
  },
  'inside @for with no parent': {
    code: `@for (s of steps; track s) { <atl-step label="S">x</atl-step> }`,
    errors: orphan('atl-step', 'atl-stepper'),
  },
  'inside ng-template and ng-container with no parent': {
    code: `<ng-template #t><ng-container><atl-chat-input /></ng-container></ng-template>`,
    errors: orphan('atl-chat-input', 'atl-chat'),
  },
  'two orphans are two reports': {
    code: `<atl-option optionValue="a">A</atl-option><atl-option optionValue="b">B</atl-option>`,
    errors: [
      ...orphan('atl-option', 'atl-select', { line: 1, column: 1 }),
      ...orphan('atl-option', 'atl-select', { line: 1, column: 43 }),
    ],
  },
  'one orphan beside a correct use': {
    code: `<atl-select label="X"><atl-option optionValue="a">A</atl-option></atl-select><atl-option optionValue="b">B</atl-option>`,
    errors: orphan('atl-option', 'atl-select', { column: 78 }),
  },
};

run('atl-sub-component-needs-parent', rule, { valid, invalid });

// ─── The table is kept true by reading the Angular sources ────────────────────

const LIB = path.resolve(__dirname, '../../libs/angular/src/lib');

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return /\.ts$/.test(e.name) &&
      !/\.(spec|stories|a11y\.spec)\.ts$/.test(e.name)
      ? [p]
      : [];
  });
}

const stringValue = (node) =>
  node && ts.isStringLiteralLike(node) ? node.text : undefined;

const prop = (obj, name) =>
  obj.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name.getText() === name,
  )?.initializer;

/**
 * Every `@Component` class in the library: its selector, the tokens its own
 * `providers` / `viewProviders` provide, the tokens or classes it `inject()`s
 * without `optional: true`, and the JSDoc above it.
 */
function readComponents() {
  const out = [];
  for (const file of sourceFiles(LIB)) {
    const text = fs.readFileSync(file, 'utf8');
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    sf.forEachChild((node) => {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const deco = (ts.getDecorators(node) ?? []).find(
        (d) =>
          ts.isCallExpression(d.expression) &&
          d.expression.expression.getText() === 'Component',
      );
      if (!deco) return;
      const meta = deco.expression.arguments[0];
      if (!meta || !ts.isObjectLiteralExpression(meta)) return;
      const selector = stringValue(prop(meta, 'selector'));
      if (!selector) return;

      const provides = [];
      for (const key of ['providers', 'viewProviders']) {
        const arr = prop(meta, key);
        if (!arr || !ts.isArrayLiteralExpression(arr)) continue;
        for (const el of arr.elements) {
          if (!ts.isObjectLiteralExpression(el)) continue;
          const token = prop(el, 'provide');
          if (token && ts.isIdentifier(token)) provides.push(token.text);
        }
      }

      const injects = [];
      const visit = (n) => {
        if (
          ts.isCallExpression(n) &&
          ts.isIdentifier(n.expression) &&
          n.expression.text === 'inject' &&
          n.arguments[0] &&
          ts.isIdentifier(n.arguments[0])
        ) {
          const opts = n.arguments[1];
          const optional =
            opts &&
            ts.isObjectLiteralExpression(opts) &&
            prop(opts, 'optional')?.getText() === 'true';
          if (!optional) injects.push(n.arguments[0].text);
        }
        n.forEachChild(visit);
      };
      node.members.forEach(visit);

      const doc = (ts.getLeadingCommentRanges(text, node.getFullStart()) ?? [])
        .map((r) => text.slice(r.pos, r.end))
        .join('\n');

      out.push({
        file: path.relative(LIB, file),
        className: node.name.text,
        selector,
        provides,
        injects,
        doc,
      });
    });
  }
  return out;
}

const components = readComponents();
const bySelector = new Map(components.map((c) => [c.selector, c]));

/** child selector -> parent selector, from non-optional `inject()` of a parent-provided token or a parent class. */
function deriveInjectPairs() {
  const providerOf = new Map();
  for (const c of components) {
    for (const token of c.provides) providerOf.set(token, c);
    providerOf.set(c.className, c);
  }
  const derived = {};
  for (const child of components) {
    for (const token of child.injects) {
      const parent = providerOf.get(token);
      if (parent && parent !== child) {
        assert.equal(
          derived[child.selector],
          undefined,
          `${child.selector} injects two parents; the table holds one`,
        );
        derived[child.selector] = parent.selector;
      }
    }
  }
  return derived;
}

test('table drift: the sources are found', () => {
  assert.ok(
    components.length > 30,
    `expected the Angular components under ${LIB}, found ${components.length}`,
  );
});

test('table drift: every inject() pair in the sources is in the table, and nothing else is marked inject', () => {
  const derived = deriveInjectPairs();
  const tabled = Object.fromEntries(
    Object.entries(TABLE)
      .filter(([, e]) => e.via === 'inject')
      .map(([child, e]) => [child, e.parent]),
  );
  assert.deepEqual(
    tabled,
    derived,
    'SUB_COMPONENT_PARENTS (via: inject) disagrees with the inject() calls in libs/angular. ' +
      'Left: the table. Right: derived from the sources.',
  );
});

test('table drift: every selector in the table is a real component', () => {
  for (const [child, { parent }] of Object.entries(TABLE)) {
    assert.ok(
      bySelector.has(child),
      `${child}: no @Component with that selector`,
    );
    assert.ok(
      bySelector.has(parent),
      `${parent}: no @Component with that selector`,
    );
  }
});

test('table drift: a slot row has no inject() of the parent, and its docs name the pairing', () => {
  const derived = deriveInjectPairs();
  for (const [child, { parent, via }] of Object.entries(TABLE)) {
    if (via !== 'slot') continue;
    assert.equal(
      derived[child],
      undefined,
      `${child} now injects ${derived[child]}: mark it via: 'inject'`,
    );
    const a = bySelector.get(child).doc;
    const b = bySelector.get(parent).doc;
    assert.ok(
      a.includes(parent) || b.includes(child),
      `${child} (slot of ${parent}): neither class's JSDoc mentions the other. ` +
        `A slot row must be documented as part of its parent.`,
    );
  }
});

test('table drift: every table row names a known via', () => {
  for (const [child, { via }] of Object.entries(TABLE)) {
    assert.ok(['inject', 'slot'].includes(via), `${child}: via is ${via}`);
  }
});
