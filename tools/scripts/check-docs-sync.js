#!/usr/bin/env node
/**
 * check-docs-sync.js
 *
 * Validates that docs/src/data/components.ts is in sync with the spec interfaces
 * in libs/spec/src/index.ts.
 *
 * Checks:
 *   [MISSING]    A spec interface has no corresponding entry in componentDocs
 *   [DRIFT]      A prop defined in the spec is absent from the component's props array
 *   [TYPE-DRIFT] A string-literal-union prop allows a value in the spec that is
 *                not present in the docs `type` string (docs undersell the API)
 *
 * Note: extra props in docs (e.g. callbacks like onValueChange) are intentionally
 * not checked — they are legitimate additions beyond the spec. Likewise, only
 * pure string-literal unions get TYPE-DRIFT checks; boolean/number/callback props
 * carry no enumerable values to compare. The check is one-directional (spec →
 * docs): docs listing extra literals is allowed, dropping a spec literal is not.
 *
 * Run via:  node tools/scripts/check-docs-sync.js
 *           (or  npm run check:docs)
 */
'use strict';

const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '../..');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');
const DOCS_FILE = path.join(ROOT, 'docs/src/data/components.ts');

/**
 * Primary spec interface -> docs slug. Single-sourced from
 * libs/spec/src/metadata/index.ts (DOCS_PRIMARY_SPECS) since ADR-0031.
 */
const SPEC_TO_DOCS = require('./lib/component-map').maps().docsPrimary;

/**
 * Returns the set of string-literal values a type permits, or null when the
 * type is not a pure string-literal union (e.g. boolean, number, callback, or
 * a union mixing `string` with literals). `undefined` members from optional
 * props are ignored so `variant?: 'a' | 'b'` resolves to { 'a', 'b' }.
 * @param {import('typescript').Type} type
 * @returns {Set<string> | null}
 */
function stringLiteralsOf(type) {
  const members = type.isUnion() ? type.types : [type];
  const lits = new Set();
  let sawNonLiteral = false;
  for (const t of members) {
    if (t.isStringLiteral()) lits.add(t.value);
    else if (t.flags & ts.TypeFlags.Undefined) continue;
    else sawNonLiteral = true;
  }
  if (sawNonLiteral || lits.size === 0) return null;
  return lits;
}

/**
 * Parses the spec file. Returns the prop-name set per docs key plus, for any
 * pure string-literal-union prop, the set of literal values it permits.
 * Uses the TypeScript type checker to resolve inherited properties.
 * @returns {{ propMap: Record<string, Set<string>>, litMap: Record<string, Record<string, Set<string>>> }}
 */
function parseSpec() {
  const program = ts.createProgram([SPEC_FILE], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(SPEC_FILE);

  if (!sourceFile) {
    throw new Error(`Could not load spec file: ${SPEC_FILE}`);
  }

  /** @type {Record<string, Set<string>>} */
  const propMap = {};
  /** @type {Record<string, Record<string, Set<string>>>} */
  const litMap = {};

  ts.forEachChild(sourceFile, (node) => {
    const name =
      ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)
        ? node.name.text
        : null;

    const docsKey = name && SPEC_TO_DOCS[name];
    if (!docsKey) return;

    const type = checker.getTypeAtLocation(node.name);
    const props = checker.getPropertiesOfType(type);
    propMap[docsKey] = new Set(props.map((p) => p.name));

    /** @type {Record<string, Set<string>>} */
    const lits = {};
    for (const p of props) {
      const decl = p.valueDeclaration ?? p.declarations?.[0] ?? node.name;
      const literals = stringLiteralsOf(checker.getTypeOfSymbolAtLocation(p, decl));
      if (literals) lits[p.name] = literals;
    }
    litMap[docsKey] = lits;
  });

  return { propMap, litMap };
}

/**
 * Parses component-data.ts and returns the prop-name set per docs key, the
 * `type` string per prop, and the set of all keys listed in COMPONENT_CATEGORIES.
 * @returns {{ docsMap: Record<string, Set<string>>, typeMap: Record<string, Record<string, string>>, categoryKeys: Set<string> }}
 */
function parseDocs() {
  const program = ts.createProgram([DOCS_FILE], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const sourceFile = program.getSourceFile(DOCS_FILE);

  if (!sourceFile) {
    throw new Error(`Could not load docs file: ${DOCS_FILE}`);
  }

  /** @type {Record<string, Set<string>>} */
  const result = {};
  /** @type {Record<string, Record<string, string>>} */
  const typeResult = {};
  /** @type {Set<string>} */
  const categoryKeys = new Set();

  /** @param {ts.ObjectLiteralExpression} objNode */
  function extractComponentCategories(objNode) {
    for (const prop of objNode.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      const arr = prop.initializer;
      if (!ts.isArrayLiteralExpression(arr)) continue;
      for (const elem of arr.elements) {
        if (ts.isStringLiteral(elem)) categoryKeys.add(elem.text);
      }
    }
  }

  /** @param {ts.ObjectLiteralExpression} objNode */
  function extractComponentDocs(objNode) {
    for (const prop of objNode.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;

      const key = ts.isStringLiteral(prop.name)
        ? prop.name.text
        : ts.isIdentifier(prop.name)
        ? prop.name.text
        : null;
      if (!key) continue;

      const compObj = prop.initializer;
      if (!ts.isObjectLiteralExpression(compObj)) continue;

      for (const compField of compObj.properties) {
        if (!ts.isPropertyAssignment(compField)) continue;
        if (
          !ts.isIdentifier(compField.name) ||
          compField.name.text !== 'props'
        )
          continue;

        const propsArr = compField.initializer;
        if (!ts.isArrayLiteralExpression(propsArr)) continue;

        const propNames = new Set();
        /** @type {Record<string, string>} */
        const typeByName = {};
        for (const elem of propsArr.elements) {
          if (!ts.isObjectLiteralExpression(elem)) continue;
          let propName = null;
          let propType = null;
          for (const field of elem.properties) {
            if (!ts.isPropertyAssignment(field)) continue;
            if (!ts.isIdentifier(field.name)) continue;
            const literal =
              ts.isStringLiteral(field.initializer) ||
              ts.isNoSubstitutionTemplateLiteral(field.initializer)
                ? field.initializer.text
                : null;
            if (field.name.text === 'name' && literal != null) propName = literal;
            if (field.name.text === 'type' && literal != null) propType = literal;
          }
          if (propName != null) {
            propNames.add(propName);
            if (propType != null) typeByName[propName] = propType;
          }
        }
        result[key] = propNames;
        typeResult[key] = typeByName;
      }
    }
  }

  function visit(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const varName = node.name.text;
      const init = ts.isAsExpression(node.initializer)
        ? node.initializer.expression
        : node.initializer;
      if (!ts.isObjectLiteralExpression(init)) {
        ts.forEachChild(node, visit);
        return;
      }
      if (varName === 'componentDocs') extractComponentDocs(init);
      if (varName === 'COMPONENT_CATEGORIES') extractComponentCategories(init);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { docsMap: result, typeMap: typeResult, categoryKeys };
}

/**
 * Extracts the quoted string literals from a docs `type` string, e.g.
 * "'primary' | 'secondary'" → { 'primary', 'secondary' }.
 * @param {string} typeStr
 * @returns {Set<string>}
 */
function docsLiteralsOf(typeStr) {
  const set = new Set();
  const re = /'([^']*)'|"([^"]*)"/g;
  let m;
  while ((m = re.exec(typeStr)) !== null) {
    set.add(m[1] !== undefined ? m[1] : m[2]);
  }
  return set;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { propMap: specMap, litMap: specLitMap } = parseSpec();
const { docsMap, typeMap, categoryKeys } = parseDocs();

const errors = [];

// 1. Spec ↔ docs props parity (+ string-literal-union value parity)
for (const [specInterface, docsKey] of Object.entries(SPEC_TO_DOCS)) {
  if (!docsMap[docsKey]) {
    errors.push(
      `[MISSING] '${docsKey}' has no entry in component-data.ts (spec: ${specInterface})`
    );
    continue;
  }

  const specProps = specMap[docsKey];
  if (!specProps) continue;

  const docProps = docsMap[docsKey];
  for (const prop of specProps) {
    if (!docProps.has(prop)) {
      errors.push(
        `[DRIFT] ${docsKey}.props: '${prop}' exists in spec (${specInterface}) but is missing from docs`
      );
    }
  }

  // String-literal-union value parity: every literal the spec allows must
  // appear in the docs `type` string. Only checked for props the docs
  // actually list a type for (name-presence is handled above).
  const specLits = specLitMap[docsKey] ?? {};
  const docTypes = typeMap[docsKey] ?? {};
  for (const [prop, lits] of Object.entries(specLits)) {
    const typeStr = docTypes[prop];
    if (typeStr == null) continue;
    const docLits = docsLiteralsOf(typeStr);
    const missing = [...lits].filter((l) => !docLits.has(l));
    if (missing.length) {
      errors.push(
        `[TYPE-DRIFT] ${docsKey}.${prop}: spec (${specInterface}) allows ` +
          `${missing.map((v) => `'${v}'`).join(', ')} not present in docs type "${typeStr}"`
      );
    }
  }
}

// 2. COMPONENT_CATEGORIES ↔ componentDocs parity
for (const key of categoryKeys) {
  if (!docsMap[key]) {
    errors.push(
      `[MISSING] '${key}' is listed in COMPONENT_CATEGORIES but has no entry in componentDocs`
    );
  }
}
for (const key of Object.keys(docsMap)) {
  if (!categoryKeys.has(key)) {
    errors.push(
      `[MISSING] '${key}' is in componentDocs but not listed in COMPONENT_CATEGORIES`
    );
  }
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(
    `\n${errors.length} issue(s) found. Update docs/src/data/components.ts to fix.`
  );
  process.exit(1);
} else {
  const count = Object.keys(SPEC_TO_DOCS).length;
  console.log(`✓ All ${count} spec interfaces, props, and categories match component-data.ts`);
}
