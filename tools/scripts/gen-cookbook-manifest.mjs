#!/usr/bin/env node
/**
 * gen-cookbook-manifest.mjs
 *
 * Generates docs/public/.well-known/cookbook-patterns.json from
 * docs/src/data/patterns.ts.
 *
 * Why this exists: the cookbook is the canonical "how to compose Atelier
 * components" surface. The /patterns page renders it for humans; this manifest
 * exposes the same catalog as a stable JSON URL so any agent or tool can
 * discover the patterns without scraping HTML or parsing the TypeScript
 * source. Tags, descriptions, and per-framework snippets are reused
 * verbatim — no separate authoring step.
 *
 * Output schema (version "1"):
 *   {
 *     "version": "1",
 *     "site": "https://atelier.pieper.io",
 *     "patterns": [
 *       {
 *         "id": "login-form",
 *         "num": 1,
 *         "title": "Login Form",
 *         "description": "...",
 *         "url": "https://atelier.pieper.io/patterns#pattern-1",
 *         "components": ["LlmCard", "LlmInput", ...],
 *         "frameworks": { "angular": "...", "react": "...", "vue": "..." }
 *       }
 *     ]
 *   }
 *
 * Usage:
 *   node tools/scripts/gen-cookbook-manifest.mjs           # write file
 *   node tools/scripts/gen-cookbook-manifest.mjs --check   # exit 1 on drift (CI)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_FILE = resolve(ROOT, 'docs/src/data/patterns.ts');
const OUT_FILE = resolve(
  ROOT,
  'docs/public/.well-known/cookbook-patterns.json',
);

const SITE_URL = 'https://atelier.pieper.io';
const SCHEMA_VERSION = '1';

// ---------------------------------------------------------------------------
// Parse patterns.ts via TypeScript Compiler API. Pattern objects reference
// snippet constants declared earlier in the file (loginAngular, settingsReact,
// …), so the eval helper has to resolve identifier references against a
// top-level const symbol table.
// ---------------------------------------------------------------------------

function buildSymbolTable(sourceFile) {
  const symbols = new Map();
  ts.forEachChild(sourceFile, (node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const decl of node.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !decl.initializer) continue;
      symbols.set(decl.name.text, decl.initializer);
    }
  });
  return symbols;
}

function makeEval(symbols) {
  function evalNode(node) {
    if (!node) return null;
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isTemplateExpression(node)) {
      // Template literals with `${…}` substitutions aren't supported in
      // patterns.ts (snippets are plain backtick strings). Fall back to head.
      return node.head.text;
    }
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
    if (ts.isAsExpression(node) || ts.isParenthesizedExpression(node)) {
      return evalNode(node.expression);
    }
    if (ts.isIdentifier(node)) {
      const ref = symbols.get(node.text);
      if (!ref) {
        throw new Error(`Identifier "${node.text}" not found in patterns.ts`);
      }
      return evalNode(ref);
    }
    return null;
  }
  return evalNode;
}

function parsePatterns() {
  const program = ts.createProgram([DATA_FILE], {
    target: ts.ScriptTarget.Latest,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
  });
  const sourceFile = program.getSourceFile(DATA_FILE);
  if (!sourceFile) throw new Error(`Could not load ${DATA_FILE}`);

  const symbols = buildSymbolTable(sourceFile);
  const evalNode = makeEval(symbols);

  const patternsRef = symbols.get('PATTERNS');
  if (!patternsRef) throw new Error('PATTERNS export not found in patterns.ts');

  const patterns = evalNode(patternsRef);
  if (!Array.isArray(patterns) || patterns.length !== 6) {
    throw new Error(
      `Expected PATTERNS to evaluate to a 6-entry array; got ${
        Array.isArray(patterns) ? patterns.length : typeof patterns
      }.`,
    );
  }
  return patterns;
}

// ---------------------------------------------------------------------------
// Build manifest and serialize.
// ---------------------------------------------------------------------------

function buildManifest(patterns) {
  return {
    version: SCHEMA_VERSION,
    site: SITE_URL,
    patterns: patterns
      .slice()
      .sort((a, b) => a.num - b.num)
      .map((p) => ({
        id: p.id,
        num: p.num,
        title: p.title,
        description: p.description,
        url: `${SITE_URL}/patterns/${p.id}`,
        components: p.tags,
        frameworks: {
          angular: p.angular,
          react: p.react,
          vue: p.vue,
        },
      })),
  };
}

function serialize(manifest) {
  return JSON.stringify(manifest, null, 2) + '\n';
}

// ---------------------------------------------------------------------------
// Entry point.
// ---------------------------------------------------------------------------

function main() {
  const check = process.argv.includes('--check');
  const patterns = parsePatterns();
  const manifest = buildManifest(patterns);
  const next = serialize(manifest);

  if (check) {
    let current = '';
    try {
      current = readFileSync(OUT_FILE, 'utf-8');
    } catch {
      // file missing — drift
    }
    if (current !== next) {
      console.error(
        'Cookbook manifest is stale. Run `npm run gen:cookbook-manifest`.',
      );
      process.exit(1);
    }
    console.log(`Cookbook manifest OK (${manifest.patterns.length} patterns).`);
    return;
  }

  mkdirSync(dirname(OUT_FILE), { recursive: true });
  writeFileSync(OUT_FILE, next);
  console.log(
    `Wrote ${OUT_FILE} (${manifest.patterns.length} patterns, ${
      next.length
    } bytes).`,
  );
}

main();
