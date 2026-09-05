#!/usr/bin/env node
/**
 * check-host-attr-guards.js
 *
 * Angular quirk: a static attribute written on a component's tag matches an
 * aliased/plain `input()` of the same name AND independently stays on the
 * host element as a literal DOM attribute — Angular keeps static attributes
 * even when they also bind an input (unlike a `[prop]="…"` binding, which
 * does not reflect). So `<atl-input aria-label="Name">` puts `aria-label` on
 * BOTH the `<atl-input>` host and (via the aliased input) the inner
 * `<input>`; `<atl-input id="x">` duplicates `id` onto both elements the
 * same way.
 *
 * Two ways that bites, ADR-0091:
 *   - `id` duplicated onto host + inner control is invalid HTML (two elements,
 *     one id) and breaks `<label for>` association, since the host is not
 *     labelable and is first in document order.
 *   - `aria-label`/`aria-labelledby` on a roleless host is a harmless no-op
 *     today, but becomes a second, competing accessible name the moment that
 *     host gains a `role` (already true for Select, whose host carries
 *     `role="combobox"`).
 *
 * ADR-0091 fixed this three times by hand — Input, Textarea (both `id` +
 * `aria-label`), Select (`aria-label` only, it has no `id` input) — by
 * force-nulling the attribute on the host: `'[attr.id]': 'null'` /
 * `'[attr.aria-label]': 'null'`. Nothing enforced the pattern staying in
 * place, or being applied to the next component that aliases `aria-label` /
 * `aria-labelledby` or declares a literal `id` input. This gate closes that:
 * per Angular `@Component` class,
 *   - aliases an input to `aria-label`       -> host needs '[attr.aria-label]': 'null'
 *   - aliases an input to `aria-labelledby'` -> host needs '[attr.aria-labelledby]': 'null'
 *   - declares an input literally named `id` -> host needs '[attr.id]': 'null'
 *
 * The main implementation hazard: several files declare MORE THAN ONE
 * `@Component` (`atl-dialog.ts` holds four, `atl-table.ts` holds six).
 * Grading per FILE would let one component's `host` satisfy a sibling's
 * requirement — a gate reporting green for a thing it never looked at, the
 * exact failure mode check-a11y-parity.js's header warns about. So this gate
 * slices each file into per-`@Component(…) export class Foo { … }` blocks at
 * the `@Component(` boundary and checks each class only against its OWN
 * decorator's `host` object and its OWN class body, never a sibling's — e.g.
 * `atl-dialog.ts`'s `AtlDialogHeader` binds `'[attr.id]': 'context.headerId'`
 * on its host, a real id binding for a component with no `id` input at all,
 * and must never be read as satisfying `AtlDialog`'s guard.
 *
 * Regex/line-based, same as check-defaults.js and check-primitives.js — no TS
 * AST dependency. Exemptions (should any legitimate one ever arise) live in
 * HOST_ATTR_GUARD_EXEMPT next to the other gates' allowlists, keyed by
 * `<ClassName>:<attr>` — class, not component dir, for the same per-class
 * precision the file-splitting above exists for.
 *
 * Run via: node tools/scripts/check-host-attr-guards.js (or npm run check:host-guards)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { getComponentDirs, isComponentDir } = require('./lib/component-discovery');
const { HOST_ATTR_GUARD_EXEMPT } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const LIB_BASE = path.join(ROOT, 'libs/angular/src/lib');

/** The three attribute rules this gate enforces, and how each is detected in a class body. */
const RULES = [
  {
    attr: 'aria-label',
    describe: "aliases an input to 'aria-label'",
    detect: (classPart) => /alias:\s*['"]aria-label['"]/.test(classPart),
  },
  {
    attr: 'aria-labelledby',
    describe: "aliases an input to 'aria-labelledby'",
    detect: (classPart) => /alias:\s*['"]aria-labelledby['"]/.test(classPart),
  },
  {
    attr: 'id',
    describe: 'declares an input literally named `id`',
    detect: (classPart) => /\bid\s*=\s*input\b/.test(classPart),
  },
];

/** Split a source file into one block per `@Component(` decorator, up to the next one (or EOF). */
function splitComponentBlocks(src) {
  const starts = [];
  const re = /@Component\(/g;
  let m;
  while ((m = re.exec(src)) !== null) starts.push(m.index);
  return starts.map((start, i) => src.slice(start, starts[i + 1] ?? src.length));
}

/** `{ className, decoratorPart, classPart }` for one block, or null if it has no class. */
function parseBlock(block) {
  const classMatch = /export\s+(?:abstract\s+)?class\s+(\w+)/.exec(block);
  if (!classMatch) return null;
  return {
    className: classMatch[1],
    decoratorPart: block.slice(0, classMatch.index),
    classPart: block.slice(classMatch.index),
  };
}

/** Balanced-brace text of the decorator's `host: { … }` object, or '' if the decorator has none. */
function hostBlockOf(decoratorPart) {
  const m = /host\s*:\s*{/.exec(decoratorPart);
  if (!m) return '';
  const braceStart = decoratorPart.indexOf('{', m.index);
  let depth = 0;
  for (let i = braceStart; i < decoratorPart.length; i++) {
    if (decoratorPart[i] === '{') depth++;
    else if (decoratorPart[i] === '}') {
      depth--;
      if (depth === 0) return decoratorPart.slice(braceStart, i + 1);
    }
  }
  return decoratorPart.slice(braceStart);
}

/**
 * Strip `//` line comments and `/* … *\/` block comments from `src`, respecting
 * (and passing through untouched) single-, double-, and backtick-quoted string
 * literals — so a `//` or `/*` that happens to sit inside a host binding's
 * string value is never mistaken for the start of a comment.
 */
function stripComments(src) {
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      let j = i + 1;
      out += ch;
      while (j < src.length) {
        out += src[j];
        if (src[j] === '\\') {
          j++;
          if (j < src.length) out += src[j];
        } else if (src[j] === quote) {
          j++;
          break;
        }
        j++;
      }
      i = j - 1;
      continue;
    }
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      out += '\n';
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i++; // now on the '/' of the closing '*/'
      continue;
    }
    out += ch;
  }
  return out;
}

/** Does `hostBlock` force `[attr.<attr>]` to `null`? Comments in the block don't count. */
function hasGuard(hostBlock, attr) {
  const escaped = attr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\[attr\\.${escaped}\\]['"]?\\s*:\\s*['"]null['"]`).test(
    stripComments(hostBlock)
  );
}

const errors = [];
const warnings = [];
const triggeredKeys = new Set();
let classesScanned = 0;
let rulesTriggered = 0;

for (const dir of [...getComponentDirs(LIB_BASE)].sort()) {
  const dirPath = path.join(LIB_BASE, dir);
  if (!isComponentDir(dirPath)) continue;

  for (const file of fs.readdirSync(dirPath).sort()) {
    if (!/^atl-.*\.ts$/.test(file) || /\.(spec|stories)\./.test(file)) continue;
    const filePath = path.join(dirPath, file);
    const src = fs.readFileSync(filePath, 'utf8');
    if (!src.includes('@Component(')) continue;
    const rel = path.relative(ROOT, filePath);

    for (const block of splitComponentBlocks(src)) {
      const parsed = parseBlock(block);
      if (!parsed) continue;
      const { className, decoratorPart, classPart } = parsed;
      classesScanned++;
      const hostBlock = hostBlockOf(decoratorPart);

      for (const rule of RULES) {
        if (!rule.detect(classPart)) continue;
        rulesTriggered++;
        const key = `${className}:${rule.attr}`;
        triggeredKeys.add(key);

        const guarded = hasGuard(hostBlock, rule.attr);
        const exemption = HOST_ATTR_GUARD_EXEMPT.get(key);

        if (guarded) {
          if (exemption) {
            errors.push(
              `[STALE] HOST_ATTR_GUARD_EXEMPT carries '${key}' (${exemption.kind}) but ` +
                `${rel}'s ${className} already guards [attr.${rule.attr}]. Remove the entry.`
            );
          }
          continue;
        }

        if (!exemption) {
          errors.push(
            `[HOST-GUARD] ${rel}: ${className} ${rule.describe} but its host has no ` +
              `'[attr.${rule.attr}]': 'null' guard. A static ${rule.attr}="…" attribute written on ` +
              `<${className}>'s tag matches the input AND independently stays on the host element ` +
              `(Angular keeps static attributes even when they also bind an input) — add ` +
              `'[attr.${rule.attr}]': 'null' to ${className}'s host block (ADR-0091), or record a ` +
              `justified exemption in HOST_ATTR_GUARD_EXEMPT.`
          );
          continue;
        }

        if (exemption.kind === 'gap') {
          warnings.push(`[GAP] ${key} — ${exemption.reason}`);
        }
      }
    }
  }
}

// Allowlist hygiene: an entry whose class/attr pair this scan never triggered
// — either the class doesn't exist, or it no longer declares that alias/id —
// has outlived its reason. (Entries for a NOW-guarded class/attr are caught
// above, inline, as [STALE] too — same rule, the other trigger.)
for (const [key, entry] of HOST_ATTR_GUARD_EXEMPT) {
  if (!triggeredKeys.has(key)) {
    errors.push(
      `[STALE] HOST_ATTR_GUARD_EXEMPT carries '${key}' (${entry.kind}), but no component class ` +
        `declares that alias/id any more. Remove the entry.`
    );
  }
}

const total =
  `${classesScanned} component class(es) scanned, ${rulesTriggered} alias/id rule(s) triggered, ` +
  `${HOST_ATTR_GUARD_EXEMPT.size} exemption(s)`;

if (errors.length === 0 && warnings.length === 0) {
  console.log(`✓ every aliased aria-label/aria-labelledby/id input has its host guard (${total}).`);
  process.exit(0);
}
for (const w of warnings) console.warn(`⚠ [WARNING] ${w}`);
for (const e of errors) console.error(`✗ ${e}`);
if (errors.length > 0) {
  console.error(`\n${errors.length} host-attr-guard issue(s). ${total}.`);
  process.exit(1);
}
console.warn(`\n${warnings.length} host-attr-guard warning(s) (non-blocking). ${total}.`);
