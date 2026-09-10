'use strict';
/**
 * Shared TypeScript Compiler API helpers — extract literal values from a
 * `.ts` source file without running it. Used by every drift-gate or
 * generator that needs to read a structured-but-typed export
 * (component data, metadata, token manifests).
 *
 * The pattern: parse the file with `ts.createProgram`, walk the AST
 * looking for `VariableStatement` nodes whose initializer is an array,
 * object, or literal we can evaluate statically. `evalNode` handles the
 * common literal shapes (strings, numbers, booleans, nested arrays,
 * nested object literals, `as const` casts).
 *
 * This is intentionally a *static* evaluator — it does not execute code,
 * resolve identifiers, or follow imports. Drift-gates want a fast,
 * deterministic read of a configuration-shaped file, not a JS runtime.
 *
 * Extracted from `tools/scripts/gen-llms-txt.mjs` (commit 7a61c26-era)
 * so `check-metadata.js`, `check-css-tokens.js`, and the generator share
 * one implementation. CommonJS so the existing `check-*.js` scripts can
 * `require` it without an ESM wrapper.
 */

const ts = require('typescript');

/**
 * Evaluate an AST node as a static literal. Returns `null` for nodes the
 * evaluator does not understand (function calls, identifiers, computed
 * property names, etc.) — callers should treat `null` as "not statically
 * evaluable" rather than "absent".
 */
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

/**
 * Parse a `.ts` source file and return the exported `VariableStatement`
 * initializers keyed by identifier. `as const` and `satisfies` casts are
 * unwrapped automatically. Non-evaluable initializers map to `null`.
 *
 * Example:
 *   const { metadata, COMPONENT_METADATA_REGISTRY } = parseExportedVars(
 *     '/abs/path/to/file.ts'
 *   );
 */
function parseExportedVars(filePath) {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) throw new Error(`Could not load ${filePath}`);

  const out = {};
  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      let init = decl.initializer;
      if (ts.isAsExpression(init)) init = init.expression;
      if (ts.isSatisfiesExpression && ts.isSatisfiesExpression(init)) init = init.expression;
      out[decl.name.text] = evalNode(init);
    }
  });
  return out;
}

/**
 * Parse a `.ts` source file and return the names of every exported
 * `interface` declaration that ends in a given suffix (default `Spec`).
 * Used by `check-metadata.js` to discover which spec interfaces exist
 * without hard-coding the list.
 */
function findExportedInterfaces(filePath, suffix = 'Spec') {
  const program = ts.createProgram([filePath], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const sourceFile = program.getSourceFile(filePath);
  if (!sourceFile) throw new Error(`Could not load ${filePath}`);

  const names = [];
  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isInterfaceDeclaration(node)) return;
    const hasExport = (node.modifiers || []).some(
      (m) => m.kind === ts.SyntaxKind.ExportKeyword
    );
    if (!hasExport) return;
    const name = node.name.text;
    if (suffix && !name.endsWith(suffix)) return;
    names.push(name);
  });
  return names;
}

module.exports = { evalNode, parseExportedVars, findExportedInterfaces };
