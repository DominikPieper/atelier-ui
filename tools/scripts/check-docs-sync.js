#!/usr/bin/env node
/**
 * check-docs-sync.js
 *
 * Validates that docs/app/component-data.ts is in sync with the spec interfaces
 * in libs/spec/src/index.ts.
 *
 * Checks:
 *   [MISSING]  A spec interface has no corresponding entry in componentDocs
 *   [DRIFT]    A prop defined in the spec is absent from the component's props array
 *
 * Note: extra props in docs (e.g. callbacks like onValueChange) are intentionally
 * not checked — they are legitimate additions beyond the spec.
 *
 * Run via:  node tools/scripts/check-docs-sync.js
 *           (or  npm run check:docs)
 */
'use strict';

const path = require('path');
const ts = require('typescript');

const ROOT = path.resolve(__dirname, '../..');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');
const DOCS_FILE = path.join(ROOT, 'docs/app/component-data.ts');

/**
 * Maps spec interface names to their docs component key.
 * Only "primary" interfaces (one per docs entry) are listed here.
 * Child interfaces (LlmRadioSpec, LlmTabSpec, etc.) and the base
 * LlmFormFieldSpec are intentionally omitted.
 */
const SPEC_TO_DOCS = {
  LlmButtonSpec: 'button',
  LlmBadgeSpec: 'badge',
  LlmAvatarSpec: 'avatar',
  LlmCardSpec: 'card',
  LlmInputSpec: 'input',
  LlmTextareaSpec: 'textarea',
  LlmCheckboxSpec: 'checkbox',
  LlmToggleSpec: 'toggle',
  LlmRadioGroupSpec: 'radio-group',
  LlmSelectSpec: 'select',
  LlmAlertSpec: 'alert',
  LlmDialogSpec: 'dialog',
  LlmTabGroupSpec: 'tabs',
  LlmAccordionGroupSpec: 'accordion',
  LlmMenuSpec: 'menu',
  LlmTooltipSpec: 'tooltip',
  LlmToastOptions: 'toast',
  LlmSkeletonSpec: 'skeleton',
  LlmPaginationSpec: 'pagination',
  LlmProgressSpec: 'progress',
  LlmDrawerSpec: 'drawer',
  LlmBreadcrumbsSpec: 'breadcrumbs',
};

/**
 * Parses the spec file and returns a map of { docsKey → Set<propName> }.
 * Uses the TypeScript type checker to resolve inherited properties.
 * @returns {Record<string, Set<string>>}
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
  const result = {};

  ts.forEachChild(sourceFile, (node) => {
    const name =
      ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)
        ? node.name.text
        : null;

    const docsKey = name && SPEC_TO_DOCS[name];
    if (!docsKey) return;

    const type = checker.getTypeAtLocation(node.name);
    const props = checker.getPropertiesOfType(type);
    result[docsKey] = new Set(props.map((p) => p.name));
  });

  return result;
}

/**
 * Parses component-data.ts and returns a map of { docsKey → Set<propName> }
 * plus the set of all component keys listed in COMPONENT_CATEGORIES.
 * @returns {{ docsMap: Record<string, Set<string>>, categoryKeys: Set<string> }}
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
        for (const elem of propsArr.elements) {
          if (!ts.isObjectLiteralExpression(elem)) continue;
          for (const field of elem.properties) {
            if (!ts.isPropertyAssignment(field)) continue;
            if (
              !ts.isIdentifier(field.name) ||
              field.name.text !== 'name'
            )
              continue;
            if (ts.isStringLiteral(field.initializer)) {
              propNames.add(field.initializer.text);
            }
          }
        }
        result[key] = propNames;
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
  return { docsMap: result, categoryKeys };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const specMap = parseSpec();
const { docsMap, categoryKeys } = parseDocs();

const errors = [];

// 1. Spec ↔ docs props parity
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
    `\n${errors.length} issue(s) found. Update docs/app/component-data.ts to fix.`
  );
  process.exit(1);
} else {
  const count = Object.keys(SPEC_TO_DOCS).length;
  console.log(`✓ All ${count} spec interfaces, props, and categories match component-data.ts`);
}
