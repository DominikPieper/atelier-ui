#!/usr/bin/env node
/**
 * check-dead-selectors.js
 *
 * A state class the CSS styles and the template never emits. The rule is dead:
 * the state it paints can never render, and nothing in the repo could see it.
 * `.atl-toggle.is-checked .track` is the only rule that fills a Vue toggle's
 * track, and `atl-toggle.vue` bound `is-invalid` and `is-disabled` and stopped —
 * so the published Vue toggle never visibly turned on, while React and Angular
 * both emitted `is-checked`. Fourteen rules across two frameworks were dead the
 * same way; the whole class of defect was invisible to every other gate here,
 * because each one asks whether a class EXISTS in the CSS and none asks whether
 * a template can put it on an element.
 *
 * Checks:
 *   [DEAD-SELECTOR]  a class selected by a component stylesheet that no source
 *                    in that component directory can ever emit.
 *   [UNRESOLVED]     a class name built from an expression whose type is not a
 *                    string-literal union, so the gate cannot enumerate what it
 *                    produces. A blocker, not a skip — see below.
 *
 * Constructed names are resolved, not exempted. Every dynamic class in this repo
 * is built as `` `variant-${v}` `` or `'align-' + align()`, and the TypeScript
 * type checker types the substitution exactly — through the spec unions the
 * component props re-export, and through `InputSignal<T>` for an Angular input.
 * A prefix carve-out (`ignore everything starting variant-`) was rejected: it
 * would blind the gate to a whole family nothing else owns, since check:variants
 * walks spec → CSS and never asks the reverse. A spec-table lookup was rejected
 * too — React's radio-group declares `orientation` in its own props interface and
 * not in libs/spec, so a spec-only resolver reports a live class dead. Where the
 * checker cannot resolve a substitution the gate FAILS with [UNRESOLVED] rather
 * than skipping it, because a guard that skips is not a check (ADR-0080).
 *
 * Scope is the component DIRECTORY, per framework — not the stylesheet.
 * Four Angular components ship no `styleUrl` at all (`atl-menu-item`,
 * `atl-menu-separator`, `atl-step`, `atl-tab`) and are styled by a sibling's
 * sheet, and Vue's `import './x.css'` edge is actively misleading
 * (`atl-menu.css` is imported only by `atl-menu-trigger.vue` while three other
 * SFCs in that directory emit the classes it styles). Pairing by filename — the
 * shape check:geometry got wrong until `select/` held two components
 * (tasks/lessons.md) — reports those as dead. The looseness this buys is stated
 * under Limits.
 *
 * Limits, deliberate:
 *   - Two Angular directories hold two stylesheets (`select/`, `toast/`). A class
 *     styled in `atl-option.css` but emitted only by `atl-select.ts` passes here.
 *     Tightening to per-stylesheet is not available for the reason above.
 *   - The collector over-collects, and that direction is the safe one: following
 *     an identifier to its declaration harvests every string literal there, so a
 *     destructured prop's default (`variant = 'elevated'`) contributes a token
 *     `elevated` that is not really a class. Three shapes reach the bag that way,
 *     not one: an axis member; a comparison operand (`sortDirection() === 'asc'`
 *     contributes `asc`); and an object-literal KEY, because the branch that reads
 *     Vue's `:class="{…}"` runs on every object literal, so
 *     `input(false, { alias: 'disabled' })` contributes `alias`. It can only ever
 *     make a dead class look live, never the reverse. Measured: no stylesheet
 *     selects any of the three today (gating the object-key branch to Vue changes
 *     nothing), and tightening it would cost the identifier resolution the whole
 *     gate depends on.
 *   - Cross-directory liveness is the RENDER relation and nothing wider. A class
 *     is rescued from another directory only when this one renders that component
 *     (`.atl-avatar .atl-icon`) or that one renders this (`<AtlIcon
 *     className="invalid-icon"/>`, styled in the icon's own sheet). The relation is
 *     read from tag names in the source text, which over-collects — a directory
 *     that mentions `<AtlIcon>` in a comment counts as rendering it — and that is
 *     the forgiving direction. What it does NOT cover: a class applied two
 *     components out, or by a consumer app. A `kind: 'design'` exemption is the
 *     escape if that is ever the right markup.
 *   - Class attributes are read as `class="…"` / `className="…"` — double quotes
 *     only. Measured: no single-quoted class attribute exists in any adapter.
 *   - Names are compared, not elements. `atl-select.ts` adds `is-open` to the
 *     overlay panel at runtime while the host carries `is-open` too, so a rule
 *     targeting one is rescued by the other. Deciding that needs a rendered DOM,
 *     which is check:geometry's job and costs a browser.
 *   - The reverse direction (emitted but selected by no stylesheet) is NOT
 *     checked. Measured with this same extractor: 49 rows, and they are not one
 *     population. Most are deliberate unstyled markup hooks (`radio-text`,
 *     `checkbox-label`, `tab-panels`), some are vestigial (`is-touched` on seven
 *     Angular components, after ADR-0055 dropped `touched` from the contract),
 *     and at least two are artifacts of this extractor rather than findings
 *     (`status-`, because `AtlAvatarStatus` includes `''`; `asc`/`desc`). A rule
 *     that fires on all three is the unclearable warning ADR-0066 refuses, and a
 *     blocker on it would demand deleting markup the adapters are entitled to
 *     differ on (ADR-0007). Recorded in tasks/todo.md instead, which is where an
 *     open question belongs rather than in an allowlist nobody reads.
 *
 * Run via:  node tools/scripts/check-dead-selectors.js  (or npm run check:dead-selectors)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { FRAMEWORKS, isComponentDir, getComponentDirs } = require('./lib/component-discovery');
const { rootsFor } = require('./lib/component-roots');
const { DEAD_SELECTOR_EXEMPT } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');

/** Sources that describe a component rather than render one. */
const NOT_A_TEMPLATE = /\.(spec|stories|a11y)\./;

// ---------------------------------------------------------------------------
// CSS side — class names in SELECTOR position
// ---------------------------------------------------------------------------

/**
 * Every class name a stylesheet selects on, with the line and selector it first
 * appears in. Works in selector position only: check-variants' `cssClasses()`
 * regexes the whole file, so `url(./x.png)` yields a class `png` — a safe
 * superset for "does this class exist?", a phantom-defect generator for this
 * question. Comments are blanked rather than removed so line numbers survive
 * (check-typeface.js drops them, and reports the wrong line).
 * @param {string} cssText
 * @returns {Map<string, {line: number, selector: string, generated: boolean}[]>}
 */
function classSelectors(cssText) {
  const src = cssText.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));

  // The `:is(…)` list at the top of every React and Vue sheet is written by
  // gen-box-sizing.mjs from the sheet's own `.atl-*` rules, so it echoes any dead
  // root back at us. Report the real rule, not the generated echo.
  let generatedEnd = -1;
  if (/^\s*\/\* Geometry contract/.test(cssText)) {
    const open = src.indexOf('{');
    if (open !== -1) generatedEnd = src.indexOf('}', open);
  }

  const lineStarts = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') lineStarts.push(i + 1);
  const lineOf = (offset) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= offset) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  /** @type {Map<string, {line: number, selector: string, generated: boolean}[]>} */
  const found = new Map();
  let start = 0;

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch !== '{' && ch !== '}') continue;
    if (ch === '{') handlePrelude(src.slice(start, i), start);
    start = i + 1;
  }

  function handlePrelude(raw, offset) {
    const lead = raw.length - raw.trimStart().length;
    const prelude = raw.trim();
    if (!prelude) return;
    // @media / @supports / @keyframes / @layer / @starting-style: the blocks
    // inside them are visited as ordinary preludes on their own.
    if (prelude.startsWith('@')) return;
    // A keyframe stop (`from`, `to`, `50%`) is not a selector.
    if (/^(from|to|[\d.]+%)\s*(,|$)/.test(prelude)) return;

    const clean = prelude
      .replace(/"[^"]*"|'[^']*'/g, '""') // content: '.foo' is not a selector
      .replace(/\[[^\]]*\]/g, ''); // [type='radio'], [data-theme='dark']

    const line = lineOf(offset + lead);
    const generated = generatedEnd !== -1 && offset < generatedEnd;
    const selector = prelude.replace(/\s+/g, ' ');

    // Classes inside :not() / :is() / :where() / :host() / :host-context() are
    // real selectors — `:host(.is-invalid) input` is how Angular writes a state
    // rule — so match them wherever they sit in the prelude.
    for (const m of clean.matchAll(/\.(-?[A-Za-z_][A-Za-z0-9_-]*)/g)) {
      if (!found.has(m[1])) found.set(m[1], []);
      found.get(m[1]).push({ line, selector, generated });
    }
  }

  return found;
}

// ---------------------------------------------------------------------------
// Emission side — one collector, three front-ends
// ---------------------------------------------------------------------------

const COMPILER_OPTIONS = {
  target: ts.ScriptTarget.Latest,
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  strict: false,
  allowJs: false,
  baseUrl: ROOT,
  paths: { '@atelier-ui/spec': ['libs/spec/src/index.ts'] },
};

/**
 * `<script setup>` macros, declared so the checker can type a Vue SFC's props
 * without the SFC compiler. Without these `props` is `any` and every axis class
 * a Vue template builds becomes [UNRESOLVED].
 */
const VUE_MACRO_SHIM = [
  'declare function defineProps<T>(): Readonly<T>;',
  'declare function withDefaults<T>(p: T, d: unknown): T;',
  'declare function defineEmits<T>(): (...a: never[]) => void;',
  'declare function defineOptions(o: unknown): void;',
  'declare function defineSlots<T>(): T;',
  'declare function defineExpose(o?: unknown): void;',
  'declare function defineModel<T>(...a: unknown[]): { value: T };',
  '',
].join('\n');

/**
 * A program whose nodes carry parent pointers, and a checker that can therefore
 * follow an identifier to its declaration. Nearly every class in the library is
 * reached that way — React writes `className={classes}` and Angular writes
 * `'[class]': 'hostClasses()'` — so symbol resolution is the load-bearing part
 * of this gate, not a convenience: neutering `getSymbolAtLocation` turns 5
 * findings into 288 (149 React, 131 Vue), i.e. the gate reports most of the
 * library dead while looking like it ran.
 *
 * Measured, because it is the opposite of the usual warning: `setParentNodes`
 * makes no difference HERE, since the binder sets parents for every file that
 * reaches a Program. It is passed anyway — it costs nothing and it removes the
 * dependency on that being true. Where it genuinely is load-bearing is the
 * standalone `ts.createSourceFile` in `rewriteTemplateExpr`, which is never
 * bound; passing false there throws outright.
 * @param {string[]} rootFiles
 * @param {Map<string, string>} virtual synthesized sources, keyed by absolute path
 */
function createProgram(rootFiles, virtual) {
  const host = ts.createCompilerHost(COMPILER_OPTIONS, /* setParentNodes */ true);
  const readReal = host.readFile.bind(host);
  const existsReal = host.fileExists.bind(host);
  const getReal = host.getSourceFile.bind(host);

  host.readFile = (f) => (virtual.has(f) ? virtual.get(f) : readReal(f));
  host.fileExists = (f) => virtual.has(f) || existsReal(f);
  host.getSourceFile = (f, lang, onError, shouldCreate) =>
    virtual.has(f)
      ? ts.createSourceFile(f, virtual.get(f), COMPILER_OPTIONS.target, true)
      : getReal(f, lang, onError, shouldCreate);

  return ts.createProgram([...rootFiles, ...virtual.keys()], COMPILER_OPTIONS, host);
}

/** What one directory's templates can put on an element. */
function newBag() {
  return { statics: new Set(), unresolved: [] };
}

/**
 * The shared collector. `emit` receives whole class-attribute strings; `expand`
 * resolves a constructed name through the type checker.
 */
function makeCollector(checker, bag, where) {
  const addTokens = (str) => {
    for (const t of String(str).split(/\s+/)) if (t) bag.statics.add(t);
  };

  /** The string-literal members of an expression's type, or null. */
  function literalsOfType(type) {
    if (!type) return null;
    const parts = type.isUnion() ? type.types : [type];
    const lits = [];
    for (const t of parts) {
      if (t.isStringLiteral()) lits.push(t.value);
      // `string | undefined` on an optional prop: undefined contributes nothing,
      // but a lone `undefined` must not read as a resolved empty union.
      else if (!(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null))) return null;
    }
    return lits.length ? lits : null;
  }

  /** Unwrap `InputSignal<T>` / `Signal<T>` / `computed()` to the value type. */
  function valueTypeOf(type) {
    const direct = literalsOfType(type);
    if (direct) return direct;
    if (!type) return null;
    for (const sig of checker.getSignaturesOfType(type, ts.SignatureKind.Call)) {
      const lits = literalsOfType(checker.getReturnTypeOfSignature(sig));
      if (lits) return lits;
    }
    return null;
  }

  function literalUnionOf(expr) {
    return valueTypeOf(checker.getTypeAtLocation(expr));
  }

  /** `prefix` + every member the substitution can be, or an [UNRESOLVED] record. */
  function expand(prefix, expr, members) {
    const lits = members || literalUnionOf(expr);
    if (lits) {
      for (const m of lits) addTokens(prefix + m);
      return true;
    }
    bag.unresolved.push({
      where,
      prefix,
      exprText: expr.getText().replace(/\s+/g, ' ').slice(0, 80),
      typeText: checker.typeToString(checker.getTypeAtLocation(expr)).slice(0, 60),
    });
    return false;
  }

  const seen = new Set();

  function collect(node) {
    if (!node || seen.has(node)) return;
    seen.add(node);

    if (ts.isTemplateExpression(node)) return fromTemplate(node);

    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      return addTokens(node.text);
    }

    if (ts.isIdentifier(node)) {
      const sym = checker.getSymbolAtLocation(node);
      const decls = sym ? sym.declarations || [] : [];
      for (const d of decls) {
        // A `className` prop is a BindingElement with no initializer: it yields
        // nothing, which is correct — a consumer's class never justifies a rule
        // in the library's own CSS.
        if ((ts.isVariableDeclaration(d) || ts.isPropertyDeclaration(d)) && d.initializer) {
          collect(d.initializer);
        } else if (ts.isGetAccessor(d) && d.body) {
          collect(d.body);
        } else if (ts.isBindingElement(d) && d.initializer) {
          collect(d.initializer);
        }
      }
      return;
    }

    if (ts.isPropertyAccessExpression(node)) return collect(node.name);

    if (ts.isObjectLiteralExpression(node)) {
      // `:class="{ 'is-checked': checked }"` — the KEY is the class, the value
      // is the condition. Losing this rule reports is-invalid/is-disabled dead
      // in four Vue directories where they are plainly emitted.
      for (const p of node.properties) {
        if (!p.name) continue;
        if (ts.isStringLiteral(p.name) || ts.isNoSubstitutionTemplateLiteral(p.name)) {
          addTokens(p.name.text);
        } else if (ts.isIdentifier(p.name)) {
          bag.statics.add(p.name.text);
        } else if (ts.isComputedPropertyName(p.name)) {
          collect(p.name.expression);
        }
      }
      return;
    }

    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const left = node.left;
      if (ts.isStringLiteral(left) || ts.isNoSubstitutionTemplateLiteral(left)) {
        const toks = left.text.split(/\s+/).filter(Boolean);
        const glued = toks.length > 0 && !/\s$/.test(left.text);
        toks.forEach((t, i) => {
          if (i === toks.length - 1 && glued) expand(t, node.right);
          else bag.statics.add(t);
        });
        if (!glued) {
          if (toks.length === 0) expand('', node.right);
          else collect(node.right);
        }
        return;
      }
    }

    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      // Unwrap `[…].filter(Boolean).join(' ')` and `[…].map(…)`.
      if (/^(join|filter|trim|map|concat|flat)$/.test(node.expression.name.text)) {
        collect(node.expression.expression);
        for (const a of node.arguments) collect(a);
        return;
      }
    }

    ts.forEachChild(node, collect);
  }

  function fromTemplate(tpl) {
    const chunks = [{ text: tpl.head.text, sub: tpl.templateSpans[0] }];
    tpl.templateSpans.forEach((span, i) => {
      chunks.push({ text: span.literal.text, sub: tpl.templateSpans[i + 1] });
    });

    for (const { text, sub } of chunks) {
      const toks = text.split(/\s+/).filter(Boolean);
      const glued = sub && text !== '' && !/\s$/.test(text);
      if (toks.length === 0) {
        if (sub) expand('', sub.expression);
        continue;
      }
      toks.forEach((t, i) => {
        if (i === toks.length - 1 && glued) expand(t, sub.expression);
        else bag.statics.add(t);
      });
      if (sub && !glued) expand('', sub.expression);
    }
  }

  return { collect, addTokens, expand, literalUnionOf, valueTypeOf };
}

// ---------------------------------------------------------------------------
// React — every class reaches an element through a `className` JSX attribute
// ---------------------------------------------------------------------------

function collectReact(sourceFile, api) {
  const walk = (node) => {
    if (ts.isJsxAttribute(node) && node.name.getText() === 'className') {
      const init = node.initializer;
      if (init && ts.isStringLiteral(init)) api.addTokens(init.text);
      else if (init && ts.isJsxExpression(init) && init.expression) api.collect(init.expression);
    }
    ts.forEachChild(node, walk);
  };
  walk(sourceFile);
}

// ---------------------------------------------------------------------------
// Vue — a virtual .ts per SFC, so the checker can type the template's props
// ---------------------------------------------------------------------------

const VUE_GLOBALS = new Set([
  'true', 'false', 'null', 'undefined', 'this', 'Math', 'Object', 'Array',
  'String', 'Number', 'Boolean', 'JSON', 'Date', 'typeof', 'void', 'in',
  'new', 'instanceof', 'props', '$slots', '$attrs', '$props',
]);

/** Top-level names a `<script setup>` block declares. */
function scriptBindingsOf(scriptText) {
  const sf = ts.createSourceFile('__s.ts', scriptText, ts.ScriptTarget.Latest, true);
  const names = new Set();
  const addName = (n) => {
    if (!n) return;
    if (ts.isIdentifier(n)) names.add(n.text);
    else if (ts.isObjectBindingPattern(n) || ts.isArrayBindingPattern(n)) {
      for (const el of n.elements) if (ts.isBindingElement(el)) addName(el.name);
    }
  };
  for (const st of sf.statements) {
    if (ts.isVariableStatement(st)) st.declarationList.declarations.forEach((d) => addName(d.name));
    else if (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st)) addName(st.name);
    else if (ts.isImportDeclaration(st) && st.importClause) {
      addName(st.importClause.name);
      const b = st.importClause.namedBindings;
      if (b && ts.isNamedImports(b)) for (const e of b.elements) names.add(e.name.text);
      if (b && ts.isNamespaceImport(b)) names.add(b.name.text);
    }
  }
  return names;
}

/**
 * A template expression is evaluated in the component's scope, so a bare
 * identifier that is not a script binding is a prop. Rewritten on the AST rather
 * than by regex, so an object-literal key and a ternary's middle arm are not
 * confused for each other.
 */
function rewriteTemplateExpr(expr, bindings, propsVar) {
  if (!propsVar) return expr;
  const wrapper = `const __x = (${expr});`;
  const offset = 'const __x = ('.length;
  const sf = ts.createSourceFile('__e.ts', wrapper, ts.ScriptTarget.Latest, true);
  const edits = [];
  const root = sf.statements[0].declarationList.declarations[0].initializer;

  const walk = (node) => {
    if (ts.isIdentifier(node)) {
      const p = node.parent;
      const isPropertyName =
        (ts.isPropertyAccessExpression(p) && p.name === node) ||
        (ts.isPropertyAssignment(p) && p.name === node) ||
        ts.isShorthandPropertyAssignment(p) ||
        (ts.isBindingElement(p) && p.propertyName === node);
      if (!isPropertyName && !bindings.has(node.text) && !VUE_GLOBALS.has(node.text)) {
        edits.push({ start: node.getStart(sf) - offset, end: node.getEnd() - offset, text: node.text });
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(root);

  let out = expr;
  for (const e of edits.sort((a, b) => b.start - a.start)) {
    out = out.slice(0, e.start) + `${propsVar}.${e.text}` + out.slice(e.end);
  }
  return out;
}

/** Split one SFC into a virtual TypeScript source plus its static classes. */
function vueVirtualSource(text) {
  const { parse } = require('@vue/compiler-sfc');
  const { descriptor } = parse(text);
  // Both blocks, in source order: an SFC that declares its props interface in a
  // plain `<script>` and consumes it from `<script setup>` is the common shape
  // here, and taking only one leaves every axis prop typed `any`.
  const script =
    ((descriptor.script || {}).content || '') + '\n' + ((descriptor.scriptSetup || {}).content || '');
  const template = (descriptor.template || {}).content || '';

  const statics = [];
  for (const m of template.matchAll(/(?:^|[\s'"])class\s*=\s*"([^"]*)"/g)) statics.push(m[1]);

  const bindings = scriptBindingsOf(script);
  let propsVar = null;
  for (const line of script.split('\n')) {
    const m = /^\s*(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=[^=]*defineProps/.exec(line);
    if (m) propsVar = m[1];
  }

  const exprs = [];
  for (const m of template.matchAll(/(?::class|v-bind:class)\s*=\s*"([\s\S]*?)"(?=[\s/>])/g)) {
    exprs.push(rewriteTemplateExpr(m[1].replace(/\s+/g, ' ').trim(), bindings, propsVar));
  }

  const body =
    VUE_MACRO_SHIM +
    script +
    '\n;const __atl_classes__ = [\n' +
    exprs.map((e) => `  (${e}),`).join('\n') +
    '\n];\nvoid __atl_classes__;\n';

  return { body, statics };
}

function collectVue(sourceFile, api) {
  const walk = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText() === '__atl_classes__' && node.initializer) {
      return api.collect(node.initializer);
    }
    ts.forEachChild(node, walk);
  };
  walk(sourceFile);
}

// ---------------------------------------------------------------------------
// Angular — `host: {…}` and an inline `template:` string
// ---------------------------------------------------------------------------

/**
 * An Angular binding value is an expression written as a STRING, so there is no
 * node for the checker to type. Resolve each `name()` / `name` against the
 * decorated class's own members, which the checker types natively.
 */
function angularExpr(src, members, api, bag, where) {
  // Top-level `+` split; string literals may contain `+`.
  const parts = [];
  let depth = 0;
  let quote = null;
  let buf = '';
  for (const ch of src) {
    if (quote) {
      buf += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue; }
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (ch === '+' && depth === 0) { parts.push(buf); buf = ''; continue; }
    buf += ch;
  }
  parts.push(buf);

  let pendingPrefix = null;
  for (const rawPart of parts) {
    const part = rawPart.trim();
    if (!part) continue;
    const lit = /^(['"])([\s\S]*)\1$/.exec(part);
    if (lit) {
      const toks = lit[2].split(/\s+/).filter(Boolean);
      const glued = toks.length > 0 && !/\s$/.test(lit[2]);
      toks.forEach((t, i) => {
        if (i === toks.length - 1 && glued) pendingPrefix = t;
        else bag.statics.add(t);
      });
      if (!glued) pendingPrefix = null;
      continue;
    }

    // A member reference: `hostClasses()`, `panelClass()`, `size()`, `this.x()`.
    const ref = /^(?:this\.)?([A-Za-z_$][\w$]*)\s*(\(\s*\))?$/.exec(part);
    const decl = ref ? members.get(ref[1]) : null;
    if (decl) {
      if (pendingPrefix === null) {
        // The whole value is the class string: walk the member's definition.
        if (ts.isGetAccessor(decl)) api.collect(decl.body);
        else if (decl.initializer) api.collect(decl.initializer);
      } else {
        const lits = api.valueTypeOf(api.checker.getTypeAtLocation(decl));
        if (lits) for (const m of lits) api.addTokens(pendingPrefix + m);
        else
          bag.unresolved.push({
            where,
            prefix: pendingPrefix,
            exprText: part,
            typeText: api.checker.typeToString(api.checker.getTypeAtLocation(decl)).slice(0, 60),
          });
      }
      pendingPrefix = null;
      continue;
    }

    bag.unresolved.push({
      where,
      prefix: pendingPrefix || '',
      exprText: part.slice(0, 80),
      typeText: ref ? `no member '${ref[1]}' on the decorated class` : 'not a member reference',
    });
    pendingPrefix = null;
  }
  // A trailing literal with nothing concatenated after it is a whole class, not
  // a prefix: `host: { '[class]': '"atl-code-block"' }`.
  if (pendingPrefix !== null) bag.statics.add(pendingPrefix);
}

const NG_TEMPLATE_CLASS =
  /(?:^|\s)(?:\[class\.([A-Za-z_][\w-]*)\]|class\s*=\s*"([^"]*)"|\[class\]\s*=\s*"([^"]*)"|\[ngClass\]\s*=\s*"([^"]*)"|\[attr\.class\]\s*=\s*"([^"]*)")/g;

function collectAngular(sourceFile, api, bag, rel) {
  const walk = (node) => {
    if (ts.isClassDeclaration(node)) {
      const members = new Map();
      for (const m of node.members) {
        if ((ts.isPropertyDeclaration(m) || ts.isGetAccessor(m)) && m.name && ts.isIdentifier(m.name)) {
          members.set(m.name.text, m);
        }
      }
      for (const dec of ts.getDecorators(node) || []) {
        if (!ts.isCallExpression(dec.expression)) continue;
        const arg = dec.expression.arguments[0];
        if (!arg || !ts.isObjectLiteralExpression(arg)) continue;
        for (const prop of arg.properties) {
          if (!ts.isPropertyAssignment(prop) || !prop.name) continue;
          const key = ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name) ? prop.name.text : '';

          if (key === 'host' && ts.isObjectLiteralExpression(prop.initializer)) {
            for (const h of prop.initializer.properties) {
              if (!ts.isPropertyAssignment(h) || !h.name) continue;
              const hk = ts.isStringLiteral(h.name) || ts.isIdentifier(h.name) ? h.name.text : '';
              const value =
                ts.isStringLiteral(h.initializer) || ts.isNoSubstitutionTemplateLiteral(h.initializer)
                  ? h.initializer.text
                  : null;
              if (hk === 'class' && value !== null) api.addTokens(value);
              else if (/^\[class\.([A-Za-z_][\w-]*)\]$/.test(hk)) {
                bag.statics.add(/^\[class\.([A-Za-z_][\w-]*)\]$/.exec(hk)[1]);
              } else if ((hk === '[class]' || hk === '[ngClass]') && value !== null) {
                angularExpr(value, members, api, bag, `${rel} host ${hk}`);
              }
            }
          }

          if (key === 'template' && (ts.isStringLiteral(prop.initializer) || ts.isNoSubstitutionTemplateLiteral(prop.initializer))) {
            const tpl = prop.initializer.text;
            for (const m of tpl.matchAll(NG_TEMPLATE_CLASS)) {
              if (m[1]) bag.statics.add(m[1]);
              else if (m[2] !== undefined) api.addTokens(m[2]);
              else angularExpr(m[3] ?? m[4] ?? m[5], members, api, bag, `${rel} template [class]`);
            }
          }
        }
      }
    }
    ts.forEachChild(node, walk);
  };
  walk(sourceFile);
}

// ---------------------------------------------------------------------------
// Drive it
// ---------------------------------------------------------------------------

/** Component directories of one framework that hold at least one source. */
function componentDirsOf(fw) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  return [...getComponentDirs(base)].sort().filter((d) => isComponentDir(path.join(base, d)));
}

/** Root class name (no dot) -> the component directory that renders it. */
function rootOwnersOf(dirs) {
  const owners = new Map();
  for (const dir of dirs) for (const root of rootsFor(dir)) owners.set(root.slice(1), dir);
  return owners;
}

/**
 * Which other component directories one directory RENDERS, read from the tag
 * names in its own sources: `<atl-checkbox …>` in Angular and Vue,
 * `<AtlCheckbox …>` in React and Vue. Text, not AST, because the three template
 * dialects put tags in three different places and a tag is a tag in all of them.
 * A type position that happens to look like one (`Array<AtlBadgeVariant>`) drops
 * out here, because the name has to match a real root in `lib/component-roots.js`.
 * @param {string} text
 * @param {Map<string, string>} owners
 * @returns {Set<string>}
 */
function renderedDirsIn(text, owners) {
  const out = new Set();
  for (const m of text.matchAll(/<([A-Za-z][A-Za-z0-9-]*)/g)) {
    const raw = m[1];
    const kebab = /[A-Z]/.test(raw)
      ? raw.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
      : raw;
    const dir = owners.get(kebab);
    if (dir) out.add(dir);
  }
  return out;
}

/** Emission bags keyed by component directory, for one framework. */
function emissionFor(fw) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  const dirs = componentDirsOf(fw);
  /** @type {Map<string, ReturnType<typeof newBag>>} */
  const bags = new Map(dirs.map((d) => [d, newBag()]));
  /** @type {Map<string, string>} absolute file -> component dir */
  const owner = new Map();
  /** @type {Map<string, string>} virtual sources */
  const virtual = new Map();
  const rootFiles = [];
  const owners = rootOwnersOf(dirs);
  /** @type {Map<string, Set<string>>} component dir -> the dirs it renders */
  const renders = new Map(dirs.map((d) => [d, new Set()]));

  for (const dir of dirs) {
    const dirPath = path.join(base, dir);
    for (const entry of fs.readdirSync(dirPath).sort()) {
      if (NOT_A_TEMPLATE.test(entry)) continue;
      const abs = path.join(dirPath, entry);
      if (/\.(ts|tsx|vue|html)$/.test(entry)) {
        for (const rendered of renderedDirsIn(fs.readFileSync(abs, 'utf8'), owners)) {
          if (rendered !== dir) renders.get(dir).add(rendered);
        }
      }
      if (fw === 'react' && /^atl-.*\.tsx$/.test(entry)) {
        rootFiles.push(abs);
        owner.set(abs, dir);
      } else if (fw === 'angular' && /^atl-.*\.ts$/.test(entry)) {
        rootFiles.push(abs);
        owner.set(abs, dir);
      } else if (fw === 'vue' && /^atl-.*\.vue$/.test(entry)) {
        const { body, statics } = vueVirtualSource(fs.readFileSync(abs, 'utf8'));
        for (const s of statics) for (const t of s.split(/\s+/)) if (t) bags.get(dir).statics.add(t);
        const virt = `${abs}.__classes.ts`;
        virtual.set(virt, body);
        owner.set(virt, dir);
      }
    }
  }

  const program = createProgram(rootFiles, virtual);
  const checker = program.getTypeChecker();

  for (const [abs, dir] of owner) {
    const sf = program.getSourceFile(abs);
    if (!sf) throw new Error(`could not load ${abs} into the ${fw} program`);
    const bag = bags.get(dir);
    const rel = path.relative(ROOT, abs).replace(/\.__classes\.ts$/, '');
    const api = makeCollector(checker, bag, rel);
    api.checker = checker;
    if (fw === 'react') collectReact(sf, api);
    else if (fw === 'vue') collectVue(sf, api);
    else collectAngular(sf, api, bag, rel);
  }

  return { bags, renders, owners };
}

const errors = [];
const warnings = [];
const seenExemptions = new Set();
let stylesheets = 0;
let selectorsScanned = 0;

for (const fw of FRAMEWORKS) {
  const base = path.join(ROOT, 'libs', fw, 'src/lib');
  const { bags, renders, owners } = emissionFor(fw);

  for (const dir of componentDirsOf(fw)) {
    const dirPath = path.join(base, dir);
    const bag = bags.get(dir);

    /** @type {Map<string, {file: string, line: number, selector: string, generated: boolean}[]>} */
    const css = new Map();
    for (const entry of fs.readdirSync(dirPath).filter((f) => f.endsWith('.css')).sort()) {
      const file = path.join(dirPath, entry);
      stylesheets++;
      for (const [name, sites] of classSelectors(fs.readFileSync(file, 'utf8'))) {
        if (!css.has(name)) css.set(name, []);
        for (const s of sites) css.get(name).push({ file, ...s });
      }
    }

    for (const [name, sites] of [...css].sort((a, b) => a[0].localeCompare(b[0]))) {
      selectorsScanned++;
      const key = `${fw}:${dir}:${name}`;
      if (bag.statics.has(name)) continue;

      // Two cross-directory rescues, both gated on the render relation: a class is
      // live here only because of a component this directory renders, or one that
      // renders this directory. A framework-wide fallback with no relation at all
      // was measured and rejected — it rescues 7 of the 14 real defects.
      //
      //   child root as a descendant selector — `.atl-avatar .atl-icon`: the icon
      //     directory emits its own root and the avatar renders it. The relation is
      //     what makes this a rescue rather than a blanket: a component always emits
      //     its own root, so asking only that made every `.atl-*` root live in every
      //     directory of the framework, and `.atl-menu .atl-avatar` — a rule for a
      //     child the menu does not render — passed.
      //   a class the PARENT puts on the child's element — `<AtlIcon
      //     className="invalid-icon"/>`: the class lands in the input's bag while the
      //     rule for it may live in the icon's own sheet. Without this the gate
      //     blocks correct markup and tells the author to delete live CSS.
      const childDir = owners.get(name);
      const asChildRoot =
        childDir !== undefined &&
        childDir !== dir &&
        renders.get(dir).has(childDir) &&
        bags.get(childDir).statics.has(name);
      const fromParent =
        !asChildRoot &&
        [...renders].some(
          ([parent, kids]) => parent !== dir && kids.has(dir) && bags.get(parent).statics.has(name)
        );
      if (asChildRoot || fromParent) continue;

      const site = sites.find((s) => !s.generated) || sites[0];
      const rel = path.relative(ROOT, site.file);

      const exemption = DEAD_SELECTOR_EXEMPT.get(key);
      if (exemption) {
        seenExemptions.add(key);
        if (exemption.kind === 'gap') {
          warnings.push(`[GAP] ${key} (${rel}:${site.line}) — ${exemption.reason}.`);
        }
        continue;
      }

      errors.push(
        `[DEAD-SELECTOR] ${rel}:${site.line} styles \`${name}\` on \`${site.selector}\`, but no ` +
          `source in libs/${fw}/src/lib/${dir}/ can put that class on an element — nor can a ` +
          `component that renders this one or that this one renders — so the rule does not match ` +
          `anything the library itself builds. Emit the class where the state is modelled, or delete ` +
          `the rule — and check the other two frameworks first, since most of these are one adapter ` +
          `forgetting a class the other two emit. If some further-out directory really is the right ` +
          `place to emit it, record that as a \`design\` entry in DEAD_SELECTOR_EXEMPT.`
      );
    }
  }

  for (const bag of bags.values()) {
    for (const u of bag.unresolved) {
      errors.push(
        `[UNRESOLVED] ${u.where} builds a class name as \`${u.prefix}\` + \`${u.exprText}\`, whose ` +
          `type is \`${u.typeText}\` — not a string-literal union, so the gate cannot enumerate the ` +
          `classes it produces and every rule matching that family is unchecked. Narrow the type to a ` +
          `union (the spec axes already are), or the check is blind here.`
      );
    }
  }
}

// Allowlist hygiene: an exemption whose class is emitted now is a repair nobody
// recorded, and leaving it behind lets the next regression hide under it.
for (const [key, entry] of DEAD_SELECTOR_EXEMPT) {
  if (!seenExemptions.has(key)) {
    errors.push(
      `[STALE-EXEMPTION] DEAD_SELECTOR_EXEMPT carries '${key}' (${entry.kind}), but that class is ` +
        `emitted now — or the stylesheet no longer selects it. Remove the entry.`
    );
  }
}

const total =
  `${selectorsScanned} class selector(s) across ${stylesheets} component stylesheet(s); ` +
  `${DEAD_SELECTOR_EXEMPT.size} documented exception(s)`;

if (errors.length === 0 && warnings.length === 0) {
  console.log(`✓ every class a component stylesheet selects can be emitted by its templates (${total}).`);
  process.exit(0);
}
for (const w of warnings) console.warn(`⚠ [WARNING] ${w}`);
for (const e of errors) console.error(`✗ ${e}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} dead-selector issue(s). ${total}.`);
  process.exit(1);
}
console.warn(`\n${warnings.length} dead-selector warning(s) (non-blocking). ${total}.`);
