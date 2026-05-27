#!/usr/bin/env node
/**
 * check-variants.mjs
 *
 * Validates that every member of a CSS-backed spec union (variant / size /
 * shape / position) has a matching CSS class in each framework's component
 * stylesheet. Catches the silent "spec gained a variant, the CSS forgot it →
 * renders unstyled" drift that the type contract cannot see (the prop compiles
 * fine; only the visual treatment is missing).
 *
 * Source of truth: the `Llm<Component><Axis>` string-literal unions in
 * libs/spec/src/index.ts. For each, the matching CSS class is
 * `.<axis-lowercased>-<member>` (e.g. LlmButtonVariant 'primary' -> .variant-primary).
 *
 * Run via:  node tools/scripts/check-variants.mjs
 *           (or  npm run check:variants)
 */
'use strict';

const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const { UNION_TO_COMPONENT, AXIS_PREFIX } = require('./lib/component-axes');

const ROOT = path.resolve(__dirname, '../..');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');
const FRAMEWORKS = ['angular', 'react', 'vue'];

/**
 * `framework:union:member` triples that intentionally have no CSS class — the
 * axis is realised by a non-class mechanism in that framework. Keep this list
 * short and justified; each entry is re-verified when the component changes.
 */
const ALLOW = new Set([
  // Angular tooltip positions via the CDK overlay's flexible-connected
  // position strategy (inline transforms), not .position-* CSS classes.
  // React/Vue use CSS classes, so they stay enforced.
  'angular:LlmTooltipPosition:above',
  'angular:LlmTooltipPosition:below',
  'angular:LlmTooltipPosition:left',
  'angular:LlmTooltipPosition:right',
]);

/**
 * Unions whose `'default'` member is the unmodified base style (styled on the
 * component root, e.g. `.llm-table { … }`) with only non-default variants
 * getting a `.variant-<x>` modifier — so `.variant-default` legitimately does
 * not exist. (badge / toast / accordion DO style `default` explicitly and are
 * intentionally absent here, so their `default` stays enforced.)
 */
const DEFAULT_IS_BASE = new Set([
  'LlmTabGroupVariant',
  'LlmMenuVariant',
  'LlmProgressVariant',
  'LlmTableVariant',
]);

/** Extract string-literal members of a type alias, or null if not a pure literal union. */
function literalsOfAlias(node, checker) {
  const type = checker.getTypeAtLocation(node.name);
  const members = type.isUnion() ? type.types : [type];
  const lits = new Set();
  for (const t of members) {
    if (t.isStringLiteral()) lits.add(t.value);
  }
  return lits;
}

function parseSpecUnions() {
  const program = ts.createProgram([SPEC_FILE], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const sf = program.getSourceFile(SPEC_FILE);
  if (!sf) throw new Error(`Could not load spec: ${SPEC_FILE}`);

  /** @type {{ union: string, axis: string, members: Set<string> }[]} */
  const found = [];
  ts.forEachChild(sf, (node) => {
    if (!ts.isTypeAliasDeclaration(node)) return;
    const name = node.name.text;
    const m = /^Llm.+(Variant|Size|Shape|Position|Orientation)$/.exec(name);
    if (!m) return;
    found.push({ union: name, axis: m[1], members: literalsOfAlias(node, checker) });
  });
  return found;
}

/** Collect class names defined in every .css file of a component dir. */
function cssClasses(framework, component) {
  const dir = path.join(ROOT, 'libs', framework, 'src', 'lib', component);
  let files = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith('.css'));
  } catch {
    return null; // dir missing — surfaced separately
  }
  const classes = new Set();
  const re = /\.([a-zA-Z][\w-]*)/g;
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), 'utf-8');
    let mm;
    while ((mm = re.exec(src)) !== null) classes.add(mm[1]);
  }
  return classes;
}

const unions = parseSpecUnions();
const errors = [];

for (const { union, axis, members } of unions) {
  const component = UNION_TO_COMPONENT[union];
  if (!component) {
    errors.push(`[UNMAPPED] ${union} (${axis}) is not in UNION_TO_COMPONENT — add it or confirm it is not CSS-backed`);
    continue;
  }
  const prefix = AXIS_PREFIX[axis];
  for (const framework of FRAMEWORKS) {
    const classes = cssClasses(framework, component);
    if (classes === null) {
      errors.push(`[NO-CSS] ${framework}/${component}: no stylesheet found`);
      continue;
    }
    for (const member of members) {
      if (!member) continue; // skip '' members
      if (member === 'default' && DEFAULT_IS_BASE.has(union)) continue;
      if (ALLOW.has(`${framework}:${union}:${member}`)) continue;
      if (!classes.has(`${prefix}-${member}`)) {
        errors.push(
          `[VARIANT-DRIFT] ${framework}/${component}: spec ${union} allows '${member}' ` +
            `but .${prefix}-${member} is not defined in the component CSS`
        );
      }
    }
  }
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(`\n${errors.length} variant/size drift issue(s). Add the missing CSS class, or allowlist a non-class axis in check-variants.js.`);
  process.exit(1);
} else {
  console.log(`✓ variant/size CSS in sync (${unions.length} unions × ${FRAMEWORKS.length} frameworks)`);
}
