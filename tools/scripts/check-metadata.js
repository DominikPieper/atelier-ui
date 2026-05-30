#!/usr/bin/env node
/**
 * check-metadata.js
 *
 * Verifies the AI-readiness metadata layer (`libs/spec/src/metadata/`):
 *
 *   1. Every exported `Llm*Spec` interface in `libs/spec/src/index.ts` is
 *      either listed in COMPONENT_METADATA_REGISTRY (it has a metadata
 *      file) or in NON_COMPONENT_SPECS (it is a shared shape / option
 *      type that intentionally has none).
 *   2. Every registry entry resolves to a `<name>.metadata.ts` file in
 *      `libs/spec/src/metadata/` that exports a `metadata` const.
 *   3. That const has every required field populated:
 *        specNames (non-empty array, must contain the registered spec
 *          name), purpose (non-empty),
 *        whenToUse (non-empty array), antiPatterns (array, may be empty),
 *        relatedComponents (array, may be empty),
 *        variantMatrix (non-empty array of axis maps),
 *        accessibility.role + accessibility.keyboardBehavior (non-empty).
 *   4. For every prop on the spec interface whose type is a union of
 *      string literals, `variantMatrix` covers every member of the union
 *      at least once across its entries (mirrors check-variants' axis
 *      logic so the metadata cannot claim less coverage than the
 *      component actually ships).
 *
 * The gate is intentionally generous about the *shape* of variantMatrix
 * entries — it only enforces *coverage*. Components are free to omit
 * states (e.g. `disabled`) from the matrix if the variant axes alone are
 * what agents need.
 *
 * Run via:  node tools/scripts/check-metadata.js
 *           (or  npm run check:metadata)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { parseExportedVars, findExportedInterfaces } = require('./lib/ts-eval');

const ROOT = path.resolve(__dirname, '../..');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');
const METADATA_INDEX = path.join(ROOT, 'libs/spec/src/metadata/index.ts');
const METADATA_DIR = path.join(ROOT, 'libs/spec/src/metadata');

const errors = [];
const warnings = [];

// ---------------------------------------------------------------------------
// Step 1 — read the registry + non-component allowlist.
// ---------------------------------------------------------------------------
const registryExports = parseExportedVars(METADATA_INDEX);
const registry = registryExports.COMPONENT_METADATA_REGISTRY;
if (!registry || typeof registry !== 'object') {
  errors.push(
    `[REGISTRY] COMPONENT_METADATA_REGISTRY not found in ${path.relative(ROOT, METADATA_INDEX)}`
  );
}

// NON_COMPONENT_SPECS is a `new Set([...])` literal — parseExportedVars
// returns null for the `new Set(...)` call. Read the .ts directly with a
// targeted parse so the allowlist stays maintainable in one place.
const nonComponent = readNonComponentSet(METADATA_INDEX);

// ---------------------------------------------------------------------------
// Step 2 — discover every Llm*Spec interface in the source of truth.
// ---------------------------------------------------------------------------
const specInterfaces = findExportedInterfaces(SPEC_FILE, 'Spec');

// Also capture every Llm* union type (for variantMatrix coverage). Parse the
// file once for both axes.
const { unionMembers, propsBySpec } = parseSpec(SPEC_FILE);

// ---------------------------------------------------------------------------
// Step 3 — every component spec must be registered or allowlisted.
// ---------------------------------------------------------------------------
const orphanSpecs = [];
const knownComponent = registry ? Object.keys(registry) : [];
for (const spec of specInterfaces) {
  if (knownComponent.includes(spec)) continue;
  if (nonComponent.has(spec)) continue;
  orphanSpecs.push(spec);
}
for (const spec of orphanSpecs) {
  errors.push(
    `[MISSING-REGISTRY] ${spec}: not in COMPONENT_METADATA_REGISTRY and not in NON_COMPONENT_SPECS. Either add a metadata file and register it, or allowlist it.`
  );
}

const orphanRegistry = knownComponent.filter((s) => !specInterfaces.includes(s));
for (const spec of orphanRegistry) {
  errors.push(
    `[STALE-REGISTRY] ${spec}: in COMPONENT_METADATA_REGISTRY but no matching exported interface in libs/spec/src/index.ts.`
  );
}

// ---------------------------------------------------------------------------
// Step 4 — load + validate every metadata file referenced by the registry.
// ---------------------------------------------------------------------------
// Multiple registry entries can point at the same module (compound
// components — Table family — share one metadata file). Parse each file
// once, then run per-spec checks.
const loaded = new Map();
let validatedFiles = 0;
for (const [specName, modulePath] of Object.entries(registry || {})) {
  const file = path.join(METADATA_DIR, `${modulePath}.metadata.ts`);
  if (!loaded.has(file)) {
    if (!fs.existsSync(file)) {
      loaded.set(file, { missing: true });
    } else {
      const exported = parseExportedVars(file);
      loaded.set(file, { meta: exported.metadata, missing: false });
      validatedFiles++;
    }
  }
  const entry = loaded.get(file);
  if (entry.missing) {
    errors.push(
      `[NO-FILE] ${specName}: registry points at ${path.relative(ROOT, file)} which does not exist.`
    );
    continue;
  }
  if (!entry.meta || typeof entry.meta !== 'object') {
    errors.push(
      `[NO-EXPORT] ${specName}: ${path.relative(ROOT, file)} must export a const named 'metadata'.`
    );
    continue;
  }
  validateMetadata(specName, entry.meta, file);
}

// ---------------------------------------------------------------------------
// Done — report.
// ---------------------------------------------------------------------------
if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  warnings.forEach((w) => console.warn(`⚠ ${w}`));
  console.error(
    `\n${errors.length} metadata issue(s). Add or fix the metadata file, register it in libs/spec/src/metadata/index.ts, or extend NON_COMPONENT_SPECS.`
  );
  process.exit(1);
}
warnings.forEach((w) => console.warn(`⚠ ${w}`));
console.log(
  `✓ metadata in sync (${validatedFiles} components validated; ${nonComponent.size} non-component specs allowlisted)`
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validateMetadata(specName, meta, file) {
  const rel = path.relative(ROOT, file);
  const tag = `[FIELDS] ${specName} (${rel})`;

  if (!Array.isArray(meta.specNames) || meta.specNames.length === 0) {
    errors.push(`${tag}: 'specNames' must be a non-empty array.`);
  } else if (!meta.specNames.includes(specName)) {
    errors.push(
      `${tag}: 'specNames' (${JSON.stringify(meta.specNames)}) does not include '${specName}'.`
    );
  }
  if (typeof meta.purpose !== 'string' || meta.purpose.trim().length === 0) {
    errors.push(`${tag}: 'purpose' must be a non-empty string.`);
  }
  if (!Array.isArray(meta.whenToUse) || meta.whenToUse.length === 0) {
    errors.push(`${tag}: 'whenToUse' must be a non-empty array of strings.`);
  } else if (meta.whenToUse.some((s) => typeof s !== 'string' || !s.trim())) {
    errors.push(`${tag}: 'whenToUse' entries must be non-empty strings.`);
  }
  if (!Array.isArray(meta.antiPatterns)) {
    errors.push(`${tag}: 'antiPatterns' must be an array (may be empty).`);
  } else {
    for (const [i, ap] of meta.antiPatterns.entries()) {
      if (!ap || typeof ap !== 'object') {
        errors.push(`${tag}: 'antiPatterns[${i}]' must be an object.`);
        continue;
      }
      if (!ap.pattern || typeof ap.pattern !== 'string') {
        errors.push(`${tag}: 'antiPatterns[${i}].pattern' must be a non-empty string.`);
      }
      if (!ap.useInstead || typeof ap.useInstead !== 'string') {
        errors.push(`${tag}: 'antiPatterns[${i}].useInstead' must be a non-empty string.`);
      }
    }
  }
  if (!Array.isArray(meta.relatedComponents)) {
    errors.push(`${tag}: 'relatedComponents' must be an array (may be empty).`);
  }
  if (!Array.isArray(meta.variantMatrix) || meta.variantMatrix.length === 0) {
    errors.push(
      `${tag}: 'variantMatrix' must be a non-empty array of {axis: value} objects.`
    );
  } else if (meta.variantMatrix.some((row) => !row || typeof row !== 'object')) {
    errors.push(`${tag}: 'variantMatrix' entries must be plain objects.`);
  }
  if (!meta.accessibility || typeof meta.accessibility !== 'object') {
    errors.push(`${tag}: 'accessibility' must be an object with 'role' and 'keyboardBehavior'.`);
  } else {
    const a = meta.accessibility;
    if (typeof a.role !== 'string' || !a.role.trim()) {
      errors.push(`${tag}: 'accessibility.role' must be a non-empty string.`);
    }
    if (typeof a.keyboardBehavior !== 'string' || !a.keyboardBehavior.trim()) {
      errors.push(`${tag}: 'accessibility.keyboardBehavior' must be a non-empty string.`);
    }
  }

  // Cross-check variantMatrix against the union members declared on the spec
  // interface itself. Every literal-union prop should be covered.
  const props = propsBySpec[specName] || [];
  if (Array.isArray(meta.variantMatrix) && meta.variantMatrix.length > 0) {
    for (const prop of props) {
      const members = literalMembersForPropType(prop.typeText);
      if (!members) continue; // not a literal union — nothing to enforce
      const seen = new Set();
      for (const row of meta.variantMatrix) {
        if (row && typeof row === 'object' && prop.name in row) {
          seen.add(String(row[prop.name]));
        }
      }
      const uncovered = members.filter((m) => !seen.has(m));
      if (uncovered.length === members.length && seen.size === 0) {
        // Prop simply not addressed by the matrix — acceptable when the
        // component intentionally omits it (e.g. boolean axes). Skip.
        continue;
      }
      if (uncovered.length > 0) {
        errors.push(
          `${tag}: variantMatrix mentions '${prop.name}' but is missing values [${uncovered
            .map((v) => `'${v}'`)
            .join(', ')}].`
        );
      }
    }
  }

  // Use the unionMembers map for indirect references — when a prop's type is
  // a named union alias like `LlmButtonVariant`, look it up there.
  if (Array.isArray(meta.variantMatrix) && meta.variantMatrix.length > 0) {
    for (const prop of props) {
      const alias = aliasFromPropType(prop.typeText);
      if (!alias) continue;
      const members = unionMembers[alias];
      if (!members) continue;
      const seen = new Set();
      for (const row of meta.variantMatrix) {
        if (row && typeof row === 'object' && prop.name in row) {
          seen.add(String(row[prop.name]));
        }
      }
      const uncovered = members.filter((m) => !seen.has(m));
      if (uncovered.length === members.length && seen.size === 0) continue;
      if (uncovered.length > 0) {
        errors.push(
          `${tag}: variantMatrix mentions '${prop.name}' (${alias}) but is missing values [${uncovered
            .map((v) => `'${v}'`)
            .join(', ')}].`
        );
      }
    }
  }
}

/** Read NON_COMPONENT_SPECS from the metadata index by parsing the AST for
 *  a `new Set([...])` initializer — parseExportedVars can't evaluate
 *  constructor calls. */
function readNonComponentSet(file) {
  const src = fs.readFileSync(file, 'utf-8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const out = new Set();
  ts.forEachChild(sf, (node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== 'NON_COMPONENT_SPECS') continue;
      let init = decl.initializer;
      if (init && ts.isAsExpression(init)) init = init.expression;
      if (!init || !ts.isNewExpression(init)) return;
      if (!init.expression || init.expression.getText() !== 'Set') return;
      const arg = init.arguments && init.arguments[0];
      if (!arg || !ts.isArrayLiteralExpression(arg)) return;
      for (const el of arg.elements) {
        if (ts.isStringLiteralLike(el)) out.add(el.text);
      }
    }
  });
  return out;
}

/** Parse libs/spec/src/index.ts once and return:
 *    unionMembers: { LlmFooVariant: ['primary', 'secondary', ...], ... }
 *    propsBySpec:  { LlmFooSpec: [{ name, typeText }, ...], ... }
 *
 *  Inheritance is not flattened — base props (LlmFormFieldSpec) are tracked on
 *  the base interface. The variant-coverage check looks at the interface's own
 *  declared props which is what the metadata is supposed to describe.
 */
function parseSpec(file) {
  const src = fs.readFileSync(file, 'utf-8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const unionMembers = {};
  const propsBySpec = {};

  ts.forEachChild(sf, (node) => {
    if (ts.isTypeAliasDeclaration(node)) {
      const members = literalMembersOfTypeNode(node.type);
      if (members) unionMembers[node.name.text] = members;
      return;
    }
    if (ts.isInterfaceDeclaration(node)) {
      const props = [];
      for (const member of node.members) {
        if (!ts.isPropertySignature(member)) continue;
        if (!member.name || !ts.isIdentifier(member.name) && !ts.isStringLiteralLike(member.name)) {
          continue;
        }
        const name = ts.isIdentifier(member.name) ? member.name.text : member.name.text;
        const typeText = member.type ? member.type.getText(sf) : '';
        props.push({ name, typeText });
      }
      propsBySpec[node.name.text] = props;
    }
  });
  return { unionMembers, propsBySpec };
}

function literalMembersOfTypeNode(typeNode) {
  if (!typeNode) return null;
  if (ts.isUnionTypeNode(typeNode)) {
    const out = [];
    for (const t of typeNode.types) {
      if (ts.isLiteralTypeNode(t) && ts.isStringLiteralLike(t.literal)) {
        out.push(t.literal.text);
      } else {
        return null; // mixed union (not all string literals) — skip coverage
      }
    }
    return out.length ? out : null;
  }
  return null;
}

/** Extract literal members directly from a `typeText` like `'a' | 'b' | 'c'`. */
function literalMembersForPropType(typeText) {
  if (!typeText) return null;
  const text = typeText.trim();
  if (!text.includes('|')) return null;
  const parts = text.split('|').map((s) => s.trim());
  if (!parts.every((p) => /^'[^']+'$/.test(p))) return null;
  return parts.map((p) => p.slice(1, -1));
}

/** If a propType is a single identifier (a named alias like `LlmButtonVariant`),
 *  return the alias name. Otherwise null. */
function aliasFromPropType(typeText) {
  if (!typeText) return null;
  const text = typeText.trim();
  if (!/^Llm[A-Za-z]+$/.test(text)) return null;
  return text;
}
