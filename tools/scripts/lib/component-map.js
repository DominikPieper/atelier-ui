'use strict';
/**
 * Single-source component maps, read from `libs/spec/src/metadata/index.ts`
 * (the authoritative registry file — see its header for the add-a-component
 * steps). This module replaces the four hand-maintained copies that used to
 * live in check-docs-sync.js, component-axes.js, and check-cookbook-parity.mjs
 * (ADR-0031): adding a component now means touching the registry file once.
 *
 * The union→component map is DERIVED, not maintained: an axis union named
 * `Atl<Base><Axis>` (Axis ∈ Variant|Size|Shape|Position|Orientation) maps to
 * the registry entry for `Atl<Base>Spec`; the few unions with no spec
 * interface (Toast) come from UNION_COMPONENT_EXCEPTIONS.
 */

const path = require('path');
const fs = require('fs');
const ts = require('typescript');
const { parseExportedVars } = require('./ts-eval');

const ROOT = path.resolve(__dirname, '../../..');
const METADATA_INDEX = path.join(ROOT, 'libs/spec/src/metadata/index.ts');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');

const AXIS_RE = /(Variant|Size|Shape|Position|Orientation)$/;

let cache = null;
function maps() {
  if (cache) return cache;
  const vars = parseExportedVars(METADATA_INDEX);
  const registry = vars.COMPONENT_METADATA_REGISTRY || {};
  const docsPrimary = vars.DOCS_PRIMARY_SPECS || {};
  const unionExceptions = vars.UNION_COMPONENT_EXCEPTIONS || {};
  const subcomponentParents = vars.SUBCOMPONENT_PARENTS || {};

  // Derive union -> component from the spec's exported axis unions.
  const src = fs.readFileSync(SPEC_FILE, 'utf8');
  const sf = ts.createSourceFile(SPEC_FILE, src, ts.ScriptTarget.Latest, true);
  const unionToComponent = {};
  ts.forEachChild(sf, (node) => {
    if (!ts.isTypeAliasDeclaration(node)) return;
    const name = node.name.text;
    if (!AXIS_RE.test(name)) return;
    const base = name.replace(AXIS_RE, '');
    const component = unionExceptions[name] ?? registry[`${base}Spec`];
    if (component) unionToComponent[name] = component;
  });

  // The specs the metadata index deliberately does NOT treat as components —
  // shared shapes and option types. A gate that asks for a registry entry has to
  // be able to tell "decided against" from "forgotten" (ADR-0066).
  const nonComponentSpecs = new Set(
    [...fs.readFileSync(METADATA_INDEX, 'utf8').matchAll(/'(Atl\w+)',?\s*\/\/[^\n]*/g)]
      .map((m) => m[1])
      .filter((name) => {
        const block = /export const NON_COMPONENT_SPECS[^;]+;/s.exec(fs.readFileSync(METADATA_INDEX, 'utf8'));
        return block ? block[0].includes(`'${name}'`) : false;
      })
  );
  // Every `Atl*Spec` the spec library actually exports, so a master whose spec does
  // not exist at all is a different case from one whose spec was left unregistered.
  const exportedSpecs = new Set(
    [...fs.readFileSync(SPEC_FILE, 'utf8').matchAll(/export interface (Atl\w*Spec)\b/g)].map((m) => m[1])
  );

  cache = { registry, docsPrimary, unionExceptions, subcomponentParents, unionToComponent, nonComponentSpecs, exportedSpecs };
  return cache;
}

module.exports = { maps };
