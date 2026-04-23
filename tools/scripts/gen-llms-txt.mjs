#!/usr/bin/env node
/**
 * gen-llms-txt.mjs
 *
 * Generates docs/public/llms.txt (short index) and docs/public/llms-full.txt
 * (complete API reference) from docs/src/data/components.ts.
 *
 * Why this exists: the library's value proposition is "LLM-optimized", so the
 * public text reference MUST stay fresh. Before this generator, both files
 * were hand-maintained and had already drifted (e.g. version number, component
 * count) between releases. Spec → components.ts sync is enforced separately
 * by tools/scripts/check-docs-sync.js; this script closes the last manual step.
 *
 * Usage:
 *   node tools/scripts/gen-llms-txt.mjs           # write files
 *   node tools/scripts/gen-llms-txt.mjs --check   # exit 1 on drift (for CI)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_FILE = resolve(ROOT, 'docs/src/data/components.ts');
const VERSION_FILE = resolve(ROOT, 'libs/angular/package.json');
const LLMS_TXT = resolve(ROOT, 'docs/public/llms.txt');
const LLMS_FULL_TXT = resolve(ROOT, 'docs/public/llms-full.txt');

const SITE_URL = 'https://atelier.pieper.io';

// ---------------------------------------------------------------------------
// Parse components.ts via TypeScript Compiler API.
// ---------------------------------------------------------------------------

function evalNode(node) {
  if (!node) return null;
  if (ts.isStringLiteralLike(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken) {
    const v = evalNode(node.operand);
    return typeof v === 'number' ? -v : null;
  }
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(evalNode);
  if (ts.isObjectLiteralExpression(node)) {
    const obj = {};
    for (const prop of node.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const key = ts.isStringLiteralLike(prop.name)
        ? prop.name.text
        : ts.isIdentifier(prop.name)
          ? prop.name.text
          : null;
      if (!key) continue;
      obj[key] = evalNode(prop.initializer);
    }
    return obj;
  }
  return null;
}

function parseComponents() {
  const program = ts.createProgram([DATA_FILE], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const sourceFile = program.getSourceFile(DATA_FILE);
  if (!sourceFile) throw new Error(`Could not load ${DATA_FILE}`);

  let categories = null;
  let docs = null;

  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      const name = decl.name.text;
      let init = decl.initializer;
      if (ts.isAsExpression(init)) init = init.expression;
      if (name === 'COMPONENT_CATEGORIES') categories = evalNode(init);
      if (name === 'componentDocs') docs = evalNode(init);
    }
  });

  if (!categories) throw new Error('COMPONENT_CATEGORIES not found');
  if (!docs) throw new Error('componentDocs not found');
  return { categories, docs };
}

function readVersion() {
  const pkg = JSON.parse(readFileSync(VERSION_FILE, 'utf-8'));
  return pkg.version;
}

// ---------------------------------------------------------------------------
// Props-table formatter — columnar layout matching the existing file style:
//   name  type  default  description
// Columns are padded so they align inside the props block of each component.
// ---------------------------------------------------------------------------

function formatPropsTable(props) {
  if (!props || props.length === 0) return '    (no props)';
  const nameW = Math.max(...props.map((p) => p.name.length));
  const typeW = Math.max(...props.map((p) => p.type.length));
  const defW = Math.max(...props.map((p) => p.default.length));
  return props
    .map((p) => {
      const name = p.name.padEnd(nameW);
      const type = p.type.padEnd(typeW);
      const def = p.default.padEnd(defW);
      return `    ${name}  ${type}  ${def}  ${p.description}`;
    })
    .join('\n');
}

function indent(text, pad = '    ') {
  return text
    .split('\n')
    .map((l) => (l.length ? pad + l : l))
    .join('\n');
}

// ---------------------------------------------------------------------------
// Order components the same way COMPONENT_CATEGORIES declares them, so the
// short index and the long reference stay in the same visual order as the
// docs sidebar.
// ---------------------------------------------------------------------------

function orderedKeys(categories) {
  const seen = new Set();
  const out = [];
  for (const cat of Object.keys(categories)) {
    for (const key of categories[cat]) {
      if (!seen.has(key)) {
        seen.add(key);
        out.push(key);
      }
    }
  }
  return out;
}

// Compact one-line prop summary for llms.txt — picks up to 5 key props and
// lists them bare, dropping defaults/descriptions. Keeps the short index
// small enough to paste into a tight context window.
function compactPropSummary(comp) {
  const props = comp.props ?? [];
  const names = props
    .filter((p) => !p.name.startsWith('on'))
    .slice(0, 6)
    .map((p) => {
      const m = p.type.match(/^'([^']+)'(?:\s*\|\s*'([^']+)')+/);
      if (m) {
        const variants = Array.from(p.type.matchAll(/'([^']+)'/g)).map((x) => x[1]);
        return `${p.name} (${variants.join('|')})`;
      }
      return p.name;
    });
  return names.join(', ');
}

// ---------------------------------------------------------------------------
// Build llms.txt — short index. One line per component, following the
// llms.txt spec format (proposed standard for LLM-readable site indexes).
// ---------------------------------------------------------------------------

function buildShortIndex({ categories, docs }, version) {
  const total = orderedKeys(categories).length;
  const lines = [];

  lines.push('# Atelier UI');
  lines.push('');
  lines.push(
    `> LLM-optimized component library for Angular, React, and Vue. ${total} accessible components with flat prop APIs, data-driven patterns, and consistent naming across all three frameworks.`
  );
  lines.push('');
  lines.push('Packages: @atelier-ui/angular | @atelier-ui/react | @atelier-ui/vue');
  lines.push(`Version: ${version}`);
  lines.push(`Docs: ${SITE_URL}`);
  lines.push('');
  lines.push('## Full API Reference');
  lines.push('');
  lines.push(
    `- [llms-full.txt](${SITE_URL}/llms-full.txt): Complete props, types, defaults, and usage examples for every component. Paste this into your LLM context window.`
  );
  lines.push('');
  lines.push('## Documentation');
  lines.push('');
  lines.push(`- [Installation](${SITE_URL}/install): Setup guide for Angular, React, and Vue`);
  lines.push(
    `- [LLM-Optimized APIs](${SITE_URL}/design-principles): Why the APIs are designed for LLM consumption`
  );
  lines.push(`- [Components](${SITE_URL}/components): Interactive component catalog with live examples`);
  lines.push(`- [Storybook (Angular)](${SITE_URL}/storybook-angular): Angular component stories`);
  lines.push(`- [Storybook (React)](${SITE_URL}/storybook-react): React component stories`);
  lines.push(`- [Storybook (Vue)](${SITE_URL}/storybook-vue): Vue component stories`);
  lines.push('');
  lines.push('## Components');
  lines.push('');
  for (const key of orderedKeys(categories)) {
    const comp = docs[key];
    if (!comp) continue;
    const summary = compactPropSummary(comp);
    lines.push(`- [${comp.name}](${SITE_URL}/components/${key}): ${summary}`);
  }
  return lines.join('\n') + '\n';
}

// ---------------------------------------------------------------------------
// Build llms-full.txt — complete API reference.
// ---------------------------------------------------------------------------

const STATIC_QUICK_START = `## Quick Start

### Install

  npm install @atelier-ui/angular   # Angular 21+
  npm install @atelier-ui/react     # React 18+
  npm install @atelier-ui/vue       # Vue 3+

### Design tokens (add to global styles)

  @import '@atelier-ui/angular/styles/tokens.css';
  @import '@atelier-ui/react/styles/tokens.css';
  @import '@atelier-ui/vue/styles/tokens.css';

### Framework-specific patterns

  Angular — signal inputs, two-way binding via [(value)], Signal Forms via [formField]
  React   — controlled props + callback (value + onValueChange), hooks for context
  Vue     — v-model:value, props + emits, provide/inject for compound components`;

const STATIC_SYNTAX_CHEATSHEET = `## Framework Syntax Cheatsheet

Each component's Usage block below uses JSX-like syntax as a lingua franca.
Apply the following transformations for Angular or Vue:

  Construct           JSX / React            Angular                         Vue
  ---------           -------------          ---------------                 --------------
  Tag name            <LlmButton>            <llm-button>                    <LlmButton>
  Static attr         variant="primary"      variant="primary"               variant="primary"
  Bool attr           loading={true}         [loading]="true"                :loading="true"
  Expression          count={items.length}   [count]="items.length"          :count="items.length"
  Event               onClick={save}         (click)="save()"                @click="save"
  Two-way (value)     value + onValueChange  [(value)]="v"                   v-model:value="v"
  Signal Forms        (n/a)                  [formField]="form.email"        (n/a)
  Loop / iteration    {items.map(x => ...)}  @for (x of items; track x.id)   v-for="x in items"
  Conditional         {cond && <X/>}         @if (cond) { <X/> }             v-if="cond"

Import lines are identical across frameworks: adjust the package path.

  import { LlmButton } from '@atelier-ui/angular';
  import { LlmButton } from '@atelier-ui/react';
  import { LlmButton } from '@atelier-ui/vue';`;

const STATIC_DESIGN_TOKENS = `## Design Token System

All components use CSS custom properties. Override at :root or on any ancestor element.

  --ui-font-family          Font stack
  --ui-font-size-xs/sm/md/lg/xl  Type scale
  --ui-font-weight-normal/medium/semibold/bold  Weight scale

  --ui-spacing-1 through --ui-spacing-12  Spacing scale (0.25rem steps)

  --ui-radius-sm/md/lg/full  Border radii
  --ui-shadow-sm/md/lg       Box shadows

  --ui-color-primary         Brand color
  --ui-color-primary-light   Tinted brand (for selected states)
  --ui-color-text            Primary text
  --ui-color-text-muted      Secondary text
  --ui-color-background      Page background
  --ui-color-surface-raised  Card/panel background (elevated above page)
  --ui-color-surface-sunken  Hover/input background (recessed)
  --ui-color-border          Default borders
  --ui-color-input-bg        Input field background
  --ui-color-input-border    Input border
  --ui-color-input-border-focus  Focused input border
  --ui-color-input-border-invalid  Error state border
  --ui-color-placeholder     Placeholder text color
  --ui-color-error-text      Error message text

  --ui-focus-ring            Full focus ring box-shadow value

  --ui-z-dropdown            z-index for dropdowns/panels
  --ui-z-modal               z-index for dialogs/drawers

Dark mode: all tokens shift automatically via prefers-color-scheme, or set data-theme="dark" on <html>.

Custom theme example:
  :root {
    --ui-color-primary: #10b981;
    --ui-color-primary-light: #d1fae5;
    --ui-radius-md: 2px; /* sharp corners */
  }`;

const STATIC_A11Y = `## Accessibility Notes

- All interactive components have appropriate ARIA roles, states, and properties
- Keyboard navigation follows WAI-ARIA patterns (arrow keys for composite widgets)
- Focus is managed programmatically for dialogs (trap), select/combobox (active descendant), tabs (roving tabindex)
- Color is never the sole indicator of state — icons and text labels accompany color changes
- All form controls support invalid, disabled, required, and readonly states with proper aria- attributes`;

function buildFullReference({ categories, docs }, version) {
  const total = orderedKeys(categories).length;
  const lines = [];

  lines.push('# Atelier UI — Full API Reference');
  lines.push('');
  lines.push(
    `> Complete component API for LLM consumption. ${total} accessible components for Angular, React, and Vue with consistent prop naming across all frameworks.`
  );
  lines.push(`> Version ${version} | ${SITE_URL}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(STATIC_QUICK_START);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(STATIC_SYNTAX_CHEATSHEET);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Component API');
  lines.push('');
  lines.push('Each entry lists:');
  lines.push('  Props: name | type | default | description');
  lines.push('  Then a generic Usage example (apply the Framework Syntax Cheatsheet above).');
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const key of orderedKeys(categories)) {
    const comp = docs[key];
    if (!comp) continue;
    lines.push(`### ${comp.selector}`);
    lines.push('');
    lines.push(`  ${comp.description}`);
    lines.push('');
    lines.push('  Props:');
    lines.push(formatPropsTable(comp.props));
    lines.push('');
    lines.push('  Usage:');
    lines.push(indent(comp.codeExample, '    '));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push(STATIC_DESIGN_TOKENS);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(STATIC_A11Y);
  lines.push('');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const mode = process.argv[2];

const parsed = parseComponents();
const version = readVersion();
const shortOut = buildShortIndex(parsed, version);
const fullOut = buildFullReference(parsed, version);

if (mode === '--check') {
  const drift = [];
  for (const [path, expected] of [
    [LLMS_TXT, shortOut],
    [LLMS_FULL_TXT, fullOut],
  ]) {
    try {
      const actual = readFileSync(path, 'utf-8');
      if (actual !== expected) drift.push(path);
    } catch {
      drift.push(path);
    }
  }
  if (drift.length) {
    console.error('llms.txt / llms-full.txt are out of sync with docs/src/data/components.ts:');
    for (const f of drift) console.error(`  - ${f}`);
    console.error('Run: node tools/scripts/gen-llms-txt.mjs');
    process.exit(1);
  }
  console.log('llms.txt and llms-full.txt are in sync');
  process.exit(0);
}

writeFileSync(LLMS_TXT, shortOut);
console.log(`wrote ${LLMS_TXT}`);
writeFileSync(LLMS_FULL_TXT, fullOut);
console.log(`wrote ${LLMS_FULL_TXT}`);
