// Deterministic answer checker for the MCP eval (plan: tasks/todo.md "Atelier MCP package", M0).
//
// No LLM judge. Every check is a pure function of (answer text, truth). The truth is derived
// at run time from the built Angular Storybook manifest (and, for tokens, from the token
// stylesheet); nothing about the library's API is listed by hand in this file. The truth is plain
// JSON so it can be saved next to the raw answers and re-used by `recheck.mjs` offline.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ─── Truth ────────────────────────────────────────────────────────────────────────────────────

function walkFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
}

/** Follows a manifest `$ref` such as `../services/core/docgen/x.json#/components/x`. */
function resolveRef(manifestsDir, ref) {
  const [file, pointer = ''] = ref.split('#');
  let node = JSON.parse(readFileSync(resolve(manifestsDir, file), 'utf8'));
  for (const part of pointer.split('/').filter(Boolean)) node = node?.[part];
  return node;
}

/**
 * Splits a Storybook/Angular selector such as `button[atl-button]` or `atl-card` into
 * `{ kind: 'element', tag }` or `{ kind: 'attribute', attr, host }` (host is '' for `[atlTooltip]`).
 */
export function parseSelector(selector) {
  return selector
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const attr = part.match(/^([\w-]*)\[([\w-]+)\]$/);
      return attr
        ? { kind: 'attribute', host: attr[1], attr: attr[2] }
        : { kind: 'element', tag: part };
    });
}

/**
 * @param {{ manifestDir: string, repoRoot?: string }} options
 *   manifestDir: the built Angular Storybook (`dist/storybook/angular`), containing
 *   `manifests/components.json` and the `services/core/**` files it references.
 *   repoRoot: optional, adds `--ui-*` tokens from `libs/styles/src/tokens.css` and component
 *   selectors declared in `libs/angular/src` to the truth.
 */
export function buildTruth({ manifestDir, repoRoot = null }) {
  const manifestsDir = join(manifestDir, 'manifests');
  const manifestPath = join(manifestsDir, 'components.json');
  if (!existsSync(manifestPath)) {
    throw new Error(
      `Manifest not found: ${manifestPath}. Build it with \`npx nx build-storybook angular\`.`,
    );
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const elements = {};
  const attributes = {};

  for (const entry of Object.values(manifest.components ?? {})) {
    const docgen = entry.docgen?.$ref
      ? resolveRef(manifestsDir, entry.docgen.$ref)
      : entry.docgen;
    const meta = docgen?.angularComponentMeta;
    if (!meta?.selector) continue;

    const inputs = {};
    const outputs = new Set(meta.outputs ?? []);
    for (const [name, argType] of Object.entries(docgen.argTypes ?? {})) {
      const category = argType?.table?.category;
      if (category === 'inputs') {
        inputs[name] =
          argType.type?.name === 'enum' ? argType.type.value.map(String) : null;
      } else if (category === 'outputs') {
        outputs.add(name);
      }
    }
    for (const name of meta.inputs ?? [])
      if (!(name in inputs)) inputs[name] = null;

    const base = {
      componentId: entry.id,
      name: meta.name,
      inputs,
      outputs: [...outputs],
    };
    for (const sel of parseSelector(meta.selector)) {
      if (sel.kind === 'element') elements[sel.tag] = base;
      else attributes[sel.attr] = { ...base, host: sel.host };
    }
  }

  // Child elements and helper directives (`atl-option`, `atl-tab`, `[atlMenuTriggerFor]`) are
  // not manifest entries of their own. They are real, so they must not read as invented: collect
  // them from everything the manifest tree mentions, plus the library's own selectors if the
  // source tree is at hand. Their attributes are not checked (the manifest has no inputs for them).
  const knownTags = new Set(Object.keys(elements));
  const knownAttributes = new Set(Object.keys(attributes));
  const treeText = walkFiles(manifestDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
  for (const m of treeText.matchAll(/<(atl-[a-z][a-z0-9-]*)/g))
    knownTags.add(m[1]);
  for (const m of treeText.matchAll(/\batl[A-Z][A-Za-z]+/g))
    knownAttributes.add(m[0]);

  // Names a consumer can import from '@atelier-ui/angular': the entry point's own exports plus
  // the component classes of the manifest.
  const exportNames = new Set(
    Object.values(elements)
      .concat(Object.values(attributes))
      .map((t) => t.name),
  );
  const tokens = new Set();
  if (repoRoot) {
    const indexFile = join(repoRoot, 'libs/angular/src/index.ts');
    if (existsSync(indexFile)) {
      for (const m of readFileSync(indexFile, 'utf8').matchAll(
        /export\s+(?:type\s+)?\{([^}]*)\}/g,
      )) {
        const list = m[1]
          .replace(/\/\*[\s\S]*?\*\//g, ' ')
          .replace(/\/\/[^\n]*/g, ' ');
        for (const part of list.split(',')) {
          const name = part
            .trim()
            .split(/\s+as\s+/)
            .pop()
            .trim();
          if (name) exportNames.add(name);
        }
      }
    }
    const tokenFile = join(repoRoot, 'libs/styles/src/tokens.css');
    if (existsSync(tokenFile)) {
      for (const m of readFileSync(tokenFile, 'utf8').matchAll(
        /^\s*(--ui-[a-z0-9-]+)\s*:/gm,
      )) {
        tokens.add(m[1]);
      }
    }
    for (const file of walkFiles(join(repoRoot, 'libs/angular/src')).filter(
      (f) => f.endsWith('.ts') && !/\.(spec|stories)\.ts$/.test(f),
    )) {
      for (const m of readFileSync(file, 'utf8').matchAll(
        /selector:\s*['"]([^'"]+)['"]/g,
      )) {
        for (const sel of parseSelector(m[1])) {
          if (sel.kind === 'element' && sel.tag.startsWith('atl-'))
            knownTags.add(sel.tag);
          if (sel.kind === 'attribute' && sel.attr.startsWith('atl'))
            knownAttributes.add(sel.attr);
        }
      }
    }
  }
  // Tokens the manifest itself mentions count too (the repo's tokens.css is the fuller list).
  for (const m of treeText.matchAll(/--ui-[a-z0-9]+(?:-[a-z0-9]+)*/g))
    tokens.add(m[0]);

  return {
    elements,
    attributes,
    knownTags: [...knownTags].sort(),
    knownAttributes: [...knownAttributes].sort(),
    exports: [...exportNames].sort(),
    tokens: [...tokens].sort(),
  };
}

// ─── Extracting code from an answer ───────────────────────────────────────────────────────────

/**
 * Fenced blocks (an unterminated fence runs to the end of the text) and inline code spans that
 * contain a tag. Prose outside code is deliberately not scanned for bindings.
 * @returns {string[]}
 */
export function extractCode(markdown) {
  const blocks = [];
  const rest = (markdown ?? '').replace(
    /```[^\n]*\n([\s\S]*?)(?:```|$)/g,
    (_, body) => {
      blocks.push(body);
      return ' ';
    },
  );
  for (const m of rest.matchAll(/`([^`\n]*<[a-zA-Z][^`\n]*)`/g))
    blocks.push(m[1]);
  return blocks;
}

/**
 * Small tag scanner. It reads quoted attribute values as a unit, so `(click)="a > b"` and
 * `=>` inside handlers do not end the tag early.
 * `closed` is true when the tag ended with `>` or `/>` (not at a stray `<` or the end of the text).
 * @returns {{ tag: string, attrs: { raw: string, value: string|null }[], closed: boolean }[]}
 */
export function extractElements(code) {
  const text = code.replace(/<!--[\s\S]*?-->/g, ' ');
  const out = [];
  const tagStart = /<([a-zA-Z][\w-]*)/g;
  let m;
  while ((m = tagStart.exec(text))) {
    const tag = m[1];
    let i = m.index + m[0].length;
    const attrs = [];
    let closed = false;
    for (;;) {
      while (i < text.length && /\s/.test(text[i])) i++;
      if (i >= text.length) break;
      if (text[i] === '>' || (text[i] === '/' && text[i + 1] === '>')) {
        closed = true;
        break;
      }
      if (text[i] === '<') break; // not a tag after all (generics, comparison)
      let start = i;
      while (
        i < text.length &&
        !/[\s=>"'`]/.test(text[i]) &&
        !(text[i] === '/' && text[i + 1] === '>')
      )
        i++;
      if (i === start) {
        i++; // stray quote or similar, skip it
        continue;
      }
      const raw = text.slice(start, i);
      let value = null;
      let j = i;
      while (j < text.length && /[ \t]/.test(text[j])) j++;
      if (text[j] === '=') {
        j++;
        while (j < text.length && /\s/.test(text[j])) j++;
        const quote = text[j];
        if (quote === '"' || quote === "'") {
          const end = text.indexOf(quote, j + 1);
          const stop = end === -1 ? text.length : end;
          value = text.slice(j + 1, stop);
          i = Math.min(stop + 1, text.length);
        } else {
          start = j;
          while (j < text.length && !/[\s>]/.test(text[j])) j++;
          value = text.slice(start, j);
          i = j;
        }
      }
      attrs.push({ raw, value });
    }
    // Tags that are only a prefix (`<atl-...>`) or lack a real name are placeholders.
    if (!tag.endsWith('-')) out.push({ tag, attrs, closed });
    tagStart.lastIndex = Math.max(tagStart.lastIndex, i);
  }
  return out;
}

// ─── API check ────────────────────────────────────────────────────────────────────────────────

/** Attributes of any element that are never a component input, whatever the host. */
const GLOBAL_ATTRIBUTES = new Set([
  'class',
  'id',
  'style',
  'title',
  'hidden',
  'tabindex',
  'slot',
  'dir',
  'lang',
  'role',
  'translate',
  'draggable',
  'spellcheck',
  'i18n',
  'ngSkipHydration',
  'ngNonBindable',
  'ngProjectAs',
  // Angular forms and common directives that may sit on any element.
  'ngModel',
  'ngModelChange',
  'ngModelOptions',
  'formControl',
  'formControlName',
  'formGroup',
  'formField',
  'ngClass',
  'ngStyle',
  'ngTemplateOutlet',
  'routerLink',
  'routerLinkActive',
]);
const GLOBAL_PREFIXES = [
  'aria-',
  'data-',
  'ng-reflect-',
  'class.',
  'style.',
  'attr.',
  'i18n-',
  'ng',
];

/** HTML attributes and DOM properties of a native host (`<button atl-button ...>`). */
const NATIVE_HOST_ATTRIBUTES = new Set([
  'type',
  'name',
  'value',
  'form',
  'autofocus',
  'accesskey',
  'contenteditable',
  'inert',
  'inputmode',
  'enterkeyhint',
  'nonce',
  'autocapitalize',
  'popover',
  'popovertarget',
  'popovertargetaction',
  'formaction',
  'formenctype',
  'formmethod',
  'formnovalidate',
  'formtarget',
  'href',
  'target',
  'rel',
  'download',
  'textContent',
  'innerHTML',
  'innerText',
]);

/** DOM events that bubble from any element, so `(click)` on a component is always valid. */
const NATIVE_EVENTS = new Set([
  'click',
  'dblclick',
  'mousedown',
  'mouseup',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'mousemove',
  'keydown',
  'keyup',
  'keypress',
  'input',
  'change',
  'submit',
  'focus',
  'blur',
  'focusin',
  'focusout',
  'scroll',
  'contextmenu',
  'wheel',
  'touchstart',
  'touchend',
  'touchmove',
  'pointerdown',
  'pointerup',
  'pointermove',
  'pointerenter',
  'pointerleave',
  'dragstart',
  'dragend',
  'dragover',
  'drop',
  'animationend',
  'transitionend',
]);

/** @returns {{ kind: 'banana'|'input'|'output'|'structural'|'ref'|'plain', name: string }} */
function classify(raw) {
  if (raw.startsWith('[(') && raw.endsWith(')]'))
    return { kind: 'banana', name: raw.slice(2, -2) };
  if (raw.startsWith('[') && raw.endsWith(']'))
    return { kind: 'input', name: raw.slice(1, -1) };
  if (raw.startsWith('(') && raw.endsWith(')'))
    return { kind: 'output', name: raw.slice(1, -1) };
  if (raw.startsWith('*')) return { kind: 'structural', name: raw.slice(1) };
  if (raw.startsWith('#')) return { kind: 'ref', name: raw.slice(1) };
  return { kind: 'plain', name: raw };
}

function isIgnored(name) {
  return (
    GLOBAL_ATTRIBUTES.has(name) ||
    GLOBAL_PREFIXES.some((p) => name.startsWith(p))
  );
}

/** The literal a value binds to when it is a single string literal, else null. */
function literalValue(kind, value) {
  if (value === null) return null;
  if (kind === 'plain') return value.includes('{{') ? null : value;
  if (kind === 'input') {
    const m = value.trim().match(/^(['"`])([^'"`$\\]*)\1$/);
    return m ? m[2] : null;
  }
  return null;
}

/**
 * How one truth entry judges one attribute: `accept` (documented), `reject` (it owns this
 * attribute space and the name is not in it) or `n/a` (this truth has no opinion).
 */
function judge(truth, { kind, name }, selectorAttr, hostRule) {
  const base = kind === 'output' ? name.split('.')[0] : name;
  if (kind === 'output') {
    if (truth.outputs.includes(name)) return 'accept';
  } else if (Object.hasOwn(truth.inputs, name)) {
    return 'accept';
  }
  if (hostRule === 'element') return 'reject';
  if (hostRule === 'native-host') {
    if (kind === 'output') return 'reject';
    return NATIVE_HOST_ATTRIBUTES.has(base) ? 'accept' : 'reject';
  }
  // Bare attribute directive (`[atlTooltip]`): it only owns names that start with its selector.
  return name.startsWith(selectorAttr) ? 'reject' : 'n/a';
}

/**
 * A hyphenated tag (a custom element) that is neither the library's nor something an app
 * legitimately has: its own `app-*` components, Angular's `ng-*` / `router-outlet`, and Angular's own
 * Material/CDK elements (`mat-*`, `cdk-*`: a wrong choice of library, not an invented element).
 */
function isInventedCustomElement(tag, knownTags) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z][a-z0-9]*)+$/.test(tag)) return false;
  if (/^(?:app|ng|mat|cdk)-/.test(tag) || tag === 'router-outlet') return false;
  return !knownTags.has(tag);
}

/**
 * Checks every `atl-*` element or attribute component in the answer's code against the truth.
 * Finding reasons: unknown-element (any invented custom element), unknown-import, unknown-attribute-selector, wrong-host, undocumented-input,
 * undocumented-output, invalid-value.
 */
export function checkApi(answerText, truth) {
  const findings = [];
  const checked = new Set();
  const knownTags = new Set(truth.knownTags);
  const knownAttributes = new Set(truth.knownAttributes);
  const find = (reason, selector, attribute, detail) =>
    findings.push({ reason, selector, attribute, detail });

  for (const block of extractCode(answerText)) {
    if (truth.exports) {
      const exported = new Set(truth.exports);
      const importRe =
        /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"]@atelier-ui\/angular['"]/g;
      for (const m of block.matchAll(importRe)) {
        const list = m[1]
          .replace(/\/\*[\s\S]*?\*\//g, ' ')
          .replace(/\/\/[^\n]*/g, ' ');
        for (const part of list.split(',')) {
          const name = part
            .trim()
            .replace(/^type\s+/, '')
            .split(/\s+as\s+/)[0]
            .trim();
          if (name && !exported.has(name)) {
            find(
              'unknown-import',
              '@atelier-ui/angular',
              name,
              `"${name}" is not exported by @atelier-ui/angular.`,
            );
          }
        }
      }
    }
    for (const { tag, attrs, closed } of extractElements(block)) {
      const elementTruth = Object.hasOwn(truth.elements, tag)
        ? truth.elements[tag]
        : null;
      const attrTruths = [];
      for (const { raw } of attrs) {
        const { name } = classify(raw);
        if (Object.hasOwn(truth.attributes, name))
          attrTruths.push({ name, truth: truth.attributes[name] });
      }

      if (!elementTruth && attrTruths.length === 0) {
        if (/^atl-/.test(tag) && !knownTags.has(tag)) {
          find(
            'unknown-element',
            tag,
            null,
            `<${tag}> is not a component of the library.`,
          );
        } else if (closed && isInventedCustomElement(tag, knownTags)) {
          find(
            'unknown-element',
            tag,
            null,
            `<${tag}> is not a component of the library and not an app-* element.`,
          );
        }
        for (const { raw } of attrs) {
          const { kind, name } = classify(raw);
          if (
            kind === 'plain' &&
            /^atl-/.test(name) &&
            !knownAttributes.has(name)
          ) {
            find(
              'unknown-attribute-selector',
              tag,
              raw,
              `"${raw}" on <${tag}> is not a component attribute of the library.`,
            );
          }
        }
        continue;
      }

      // Entries judging the element: (truth, attribute that selected it, rule).
      const judges = [];
      if (elementTruth)
        judges.push({ truth: elementTruth, sel: tag, rule: 'element' });
      for (const { name, truth: t } of attrTruths) {
        if (t.host && t.host !== tag) {
          find(
            'wrong-host',
            tag,
            name,
            `"${name}" belongs on <${t.host}>, not on <${tag}>.`,
          );
        }
        judges.push({
          truth: t,
          sel: name,
          rule: t.host ? 'native-host' : 'prefix',
        });
      }
      for (const j of judges) checked.add(j.truth.componentId);

      for (const { raw, value } of attrs) {
        const c = classify(raw);
        if (c.kind === 'structural' || c.kind === 'ref') continue;
        if (attrTruths.some((a) => a.name === c.name && c.kind === 'plain'))
          continue; // the selector itself
        if (isIgnored(c.name)) continue;
        if (c.kind === 'output') {
          const base = c.name.split('.')[0];
          if (NATIVE_EVENTS.has(base) || c.name.includes(':')) continue;
        }
        const verdicts = judges.map((j) => ({
          j,
          v: judge(j.truth, c, j.sel, j.rule),
        }));
        const accepted = verdicts.find((x) => x.v === 'accept');
        if (!accepted) {
          if (knownAttributes.has(c.name)) continue; // a helper directive such as atlMenuTriggerFor
          if (verdicts.some((x) => x.v === 'reject')) {
            const owner = verdicts.find((x) => x.v === 'reject').j.truth;
            find(
              c.kind === 'output'
                ? 'undocumented-output'
                : 'undocumented-input',
              tag,
              raw,
              `"${raw}" is not a documented ${c.kind === 'output' ? 'output' : 'input'} of ${owner.name}.`,
            );
          }
          continue;
        }
        const allowed = accepted.j.truth.inputs[c.name];
        const literal =
          c.kind === 'output' ? null : literalValue(c.kind, value);
        if (
          Array.isArray(allowed) &&
          literal !== null &&
          !allowed.includes(literal)
        ) {
          find(
            'invalid-value',
            tag,
            raw,
            `${c.name}="${literal}" is not a value of ${accepted.j.truth.name}.${c.name} (${allowed.join(' | ')}).`,
          );
        }
      }
    }
  }
  return { findings, checkedComponents: [...checked] };
}

// ─── Selector, claim, token, colour checks ────────────────────────────────────────────────────

function escapeRe(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** True when `selector` is used in the answer's code (as a tag or as an attribute). */
export function usesSelector(answerText, selector) {
  const re = new RegExp(`(?<![\\w-])${escapeRe(selector)}(?![\\w-])`);
  return extractCode(answerText).some((block) => re.test(block));
}

/** `expect` items are a selector or an array of alternatives; all items must be used. */
export function checkSelectors(answerText, expect) {
  const missing = expect.filter((item) => {
    const alternatives = Array.isArray(item) ? item : [item];
    return !alternatives.some((sel) => usesSelector(answerText, sel));
  });
  return { pass: missing.length === 0, missing };
}

export function checkForbidden(answerText, forbid) {
  const used = forbid.filter((sel) => usesSelector(answerText, sel));
  return { pass: used.length === 0, used };
}

const VOID_TAGS = new Set(['br', 'hr', 'img', 'input', 'meta', 'link']);

/**
 * `pairs`: `[outer, inner]` element names that must not nest. A tag is "inside" another while the
 * other is open in the same code block; self-closing and void tags never open, and a closer
 * closes everything opened after its matching opener (the way a browser would). Only code is
 * scanned, so prose such as "do not put <a> in <a>" does not count.
 */
export function checkNesting(answerText, pairs) {
  const found = new Set();
  for (const block of extractCode(answerText)) {
    const stack = [];
    for (const m of block.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^<>]*?)(\/?)>/g)) {
      const [, closing, name, , selfClosing] = m;
      if (closing) {
        const at = stack.lastIndexOf(name);
        if (at !== -1) stack.length = at;
        continue;
      }
      for (const [outer, inner] of pairs)
        if (name === inner && stack.includes(outer))
          found.add(`${inner} in ${outer}`);
      if (!selfClosing && !VOID_TAGS.has(name)) stack.push(name);
    }
  }
  return { pass: found.size === 0, found: [...found] };
}

function normalize(text) {
  return (text ?? '').normalize('NFC').toLowerCase();
}

/** Keyword hit: substring, or for `--token` keywords a whole-token match (so `--ui-color-border`
 * does not hit `--ui-color-border-strong`). */
export function hasKeyword(answerText, keyword) {
  const text = normalize(answerText);
  const kw = normalize(keyword);
  if (kw.startsWith('--'))
    return new RegExp(`${escapeRe(kw)}(?![\\w-])`).test(text);
  return text.includes(kw);
}

/**
 * `claims`: list of groups of synonyms. All groups must hit, one keyword per group is enough.
 * @param {string} answerText
 * @param {string[][]} claims
 */
export function checkClaims(answerText, claims) {
  const missing = claims.filter(
    (group) => !group.some((kw) => hasKeyword(answerText, kw)),
  );
  return { pass: missing.length === 0, missing };
}

/** Fenced code bodies of a markdown answer, and the prose left over once they are cut out. */
function splitFences(markdown) {
  const blocks = [];
  const prose = (markdown ?? '').replace(
    /```[^\n]*\n([\s\S]*?)(?:```|$)/g,
    (_, body) => {
      blocks.push(body);
      return ' ';
    },
  );
  return { blocks, prose };
}

/**
 * Every `--ui-*` custom property the answer USES must exist: those in code blocks and those read
 * with `var(--ui-x)` in prose. A name that only appears in prose ("there is no `--ui-control-height`
 * token") is a statement about the library, not a use, and is not checked. Wildcards and prefixes
 * are skipped.
 */
export function checkTokens(answerText, truth) {
  const known = new Set(truth.tokens);
  const { blocks, prose } = splitFences(answerText);
  const scope = [
    ...blocks,
    ...[...prose.matchAll(/var\(\s*--ui-[a-z0-9-]*/g)].map((m) => m[0]),
  ].join('\n');
  const invented = new Set();
  for (const m of scope.matchAll(/--ui-[a-z0-9]+(?:-[a-z0-9]+)*/g)) {
    const next = scope[m.index + m[0].length];
    if (next && '*{<[…'.includes(next)) continue; // `--ui-color-*`, `--ui-color-{role}`
    if (next === '-') continue; // trailing hyphen: a prefix, not a name
    if (!known.has(m[0])) invented.add(m[0]);
  }
  return { pass: invented.size === 0, invented: [...invented] };
}

const COLOR_PROPERTY =
  '(?:color|background(?:-color)?|border(?:-[a-z]+)*|fill|stroke|outline(?:-color)?|box-shadow)';
const NAMED_COLORS =
  'red|blue|green|white|black|gray|grey|orange|yellow|purple|pink|navy|teal|crimson|silver|lightgr[ae]y|darkgr[ae]y';
const RAW_COLOR_RE = new RegExp(
  [
    `:[^;{}\\n]*#[0-9a-fA-F]{3,8}(?![\\w-])`,
    `(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\\(`,
    `${COLOR_PROPERTY}\\s*:\\s*[^;{}\\n]*\\b(?:${NAMED_COLORS})\\b`,
  ].join('|'),
  'i',
);

/** Removes the fallback of every `var(--x, fallback)`, the way atelier/no-raw-color-literal does. */
function stripVarFallbacks(text) {
  let out = '';
  for (let i = 0; i < text.length;) {
    const m = /^var\(\s*--[\w-]+\s*,/.exec(text.slice(i));
    if (!m) {
      out += text[i++];
      continue;
    }
    let depth = 1;
    let j = i + 'var('.length;
    while (j < text.length && depth > 0) {
      if (text[j] === '(') depth++;
      else if (text[j] === ')') depth--;
      j++;
    }
    out += 'var()';
    i = j;
  }
  return out;
}

const SHADOW_PROPERTY = /^\s*-?(?:webkit-)?(?:box|text)-shadow\s*:/i;

/**
 * Raw colour literals in declarations of the answer's code blocks (CSS or inline `style`). Mirrors
 * the repo's atelier/no-raw-color-literal: CSS comments and the fallback inside `var(--x, fb)` are
 * not literals, and shadow properties carry rgba alpha legitimately.
 */
export function checkRawColors(answerText) {
  const hits = [];
  for (const block of extractCode(answerText)) {
    const code = stripVarFallbacks(block.replace(/\/\*[\s\S]*?\*\//g, ' '));
    for (const line of code.split('\n')) {
      if (/^\s*\d+:\d+\s/.test(line)) continue; // pasted linter output: "2:10  ✖ ..."
      // One declaration at a time, so a shadow next to a real colour does not hide it.
      const bad = line
        .split(/[;{}]/)
        .filter((decl) => !SHADOW_PROPERTY.test(decl))
        .filter((decl) => RAW_COLOR_RE.test(decl));
      if (bad.length) hits.push(line.trim());
    }
  }
  return { pass: hits.length === 0, hits };
}

// ─── One question, one answer ─────────────────────────────────────────────────────────────────

/**
 * Question fields read here: `checks` (any of 'api', 'selectors', 'forbid', 'claims', 'tokens',
 * 'raw-color', 'nesting'), `expectSelectors`, `forbidSelectors`, `claims`, `claimsIn` ('code' to match
 * claims in code blocks only), `forbidNested`.
 * @returns {{ checks: { id: string, pass: boolean, detail: string }[], score: number, checkedComponents: string[] }}
 */
export function evaluateAnswer(question, answerText, truth) {
  const checks = [];
  let checkedComponents = [];
  for (const id of question.checks ?? []) {
    if (id === 'api') {
      const r = checkApi(answerText, truth);
      checkedComponents = r.checkedComponents;
      checks.push({
        id,
        pass: r.findings.length === 0,
        detail: [...new Set(r.findings.map((f) => f.detail))].join(' '),
      });
    } else if (id === 'selectors') {
      const r = checkSelectors(answerText, question.expectSelectors ?? []);
      checks.push({
        id,
        pass: r.pass,
        detail: r.missing.length
          ? `not used: ${r.missing.map((x) => [].concat(x).join('|')).join(', ')}`
          : '',
      });
    } else if (id === 'forbid') {
      const r = checkForbidden(answerText, question.forbidSelectors ?? []);
      checks.push({
        id,
        pass: r.pass,
        detail: r.used.length ? `used: ${r.used.join(', ')}` : '',
      });
    } else if (id === 'nesting') {
      const r = checkNesting(answerText, question.forbidNested ?? []);
      checks.push({
        id,
        pass: r.pass,
        detail: r.found.length ? `nested: ${r.found.join(', ')}` : '',
      });
    } else if (id === 'claims') {
      // `claimsIn: 'code'` matches the claims in code blocks only: a negation in prose ("there is no
      // `headingLevel` input") must not count as the claim.
      const scope =
        question.claimsIn === 'code'
          ? extractCode(answerText).join('\n')
          : answerText;
      const r = checkClaims(scope, question.claims ?? []);
      checks.push({
        id,
        pass: r.pass,
        detail: r.missing.length
          ? `missing: ${r.missing.map((g) => `[${g.join(' | ')}]`).join(' ')}`
          : '',
      });
    } else if (id === 'tokens') {
      const r = checkTokens(answerText, truth);
      checks.push({
        id,
        pass: r.pass,
        detail: r.invented.length ? `invented: ${r.invented.join(', ')}` : '',
      });
    } else if (id === 'raw-color') {
      const r = checkRawColors(answerText);
      checks.push({
        id,
        pass: r.pass,
        detail: r.hits.length
          ? `raw colour: ${r.hits.slice(0, 3).join(' ; ')}`
          : '',
      });
    } else {
      throw new Error(`Question "${question.id}": unknown check "${id}".`);
    }
  }
  const score = checks.length
    ? checks.filter((c) => c.pass).length / checks.length
    : 0;
  return { checks, score, checkedComponents };
}
