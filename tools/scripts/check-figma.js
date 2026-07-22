#!/usr/bin/env node
/**
 * check-figma.js
 *
 * Figma conformance gate — the drift gate for the AI-readiness layer that
 * previously had none (see plan/ai-readiness.md §4). Closes the loop the
 * manual plan/figma-component-checklist.md used to hold open.
 *
 * Figma is an *external* source, so unlike every other check:* gate this one
 * does NOT read Figma live. It runs fully OFFLINE against a committed snapshot
 * (`tools/figma/snapshot.json`) produced by the connected refresh step
 * (`npm run figma:snapshot`, see tools/scripts/figma-snapshot.mjs). The snapshot
 * carries Figma *facts* (names, variant axes, descriptions, layoutMode, which
 * fills/spacings/radii are token-bound vs. raw); this gate applies the *rules*
 * and severities. That keeps the gate deterministic and CI-safe — the only part
 * that needs the Figma Desktop Bridge is the refresh.
 *
 * For each master COMPONENT_SET captured in the snapshot, compared against
 * libs/spec/src/index.ts (selectors + string-literal unions) and
 * libs/spec/src/metadata/<component>.metadata.ts:
 *
 *   1. Name alignment        — component name == spec selector; variant-property
 *                              names == spec axis unions; values == literals
 *                              exactly (`primary`, not `Primary`).      BLOCKER
 *   2. Variant-matrix         — every metadata.variantMatrix row exists as a
 *      completeness            Figma variant.                            BLOCKER
 *   3. Token-link coverage    — no raw hex fills/strokes, no raw px radii or
 *                              spacing; all bound to UI-Tokens variables. CRITICAL
 *   4. Auto-layout present    — every frame WITH children uses Auto Layout. CRITICAL
 *   5. Description congruence — master description set and references the spec
 *                              interface it maps to.                      WARNING
 *
 * Exit-code (symmetric with the other gates): BLOCKER + CRITICAL go to `errors`
 * → process.exit(1). WARNING is printed but does not block.
 *
 * Run via:  node tools/scripts/check-figma.js   (or  npm run check:figma)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { parseExportedVars, findExportedInterfaces } = require('./lib/ts-eval');
const { FIGMA_CONFORMANCE_EXCEPTIONS } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const SNAPSHOT_FILE = path.join(ROOT, 'tools/figma/snapshot.json');
const SPEC_FILE = path.join(ROOT, 'libs/spec/src/index.ts');
const METADATA_INDEX = path.join(ROOT, 'libs/spec/src/metadata/index.ts');
const METADATA_DIR = path.join(ROOT, 'libs/spec/src/metadata');

// Severity → bucket. BLOCKER + CRITICAL fail the build; WARNING is advisory.
const errors = []; // { sev, tag, msg }
const warnings = [];
function blocker(tag, msg) { errors.push({ sev: 'BLOCKER', tag, msg }); }
function critical(tag, msg) { errors.push({ sev: 'CRITICAL', tag, msg }); }
function warning(tag, msg) { warnings.push({ sev: 'WARNING', tag, msg }); }

/** Allowlisted? Key is `selector:check:detail` — same exact-string idiom as the
 *  other gates' Sets (see tools/scripts/lib/allowlists.js). */
function allowed(selector, check, detail) {
  return FIGMA_CONFORMANCE_EXCEPTIONS.has(`${selector}:${check}:${detail}`);
}

// ---------------------------------------------------------------------------
// Load the snapshot. Fail loud — never a silent pass — if it is missing or
// unreadable. (The connected refresh step is the only thing that can write it.)
// ---------------------------------------------------------------------------
if (!fs.existsSync(SNAPSHOT_FILE)) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} not found.\n` +
      `\nThe Figma gate runs offline against a committed snapshot. Generate it with a\n` +
      `connected Figma Desktop Bridge:  npm run figma:snapshot`
  );
  process.exit(1);
}

let snapshot;
try {
  snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
} catch (err) {
  console.error(`✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} is not valid JSON: ${err.message}`);
  process.exit(1);
}
if (!snapshot || !Array.isArray(snapshot.components) || snapshot.components.length === 0) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} has no components. Re-run npm run figma:snapshot.`
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load the spec side: exported Atl*Spec interfaces + the string-literal unions.
// ---------------------------------------------------------------------------
const specInterfaces = new Set(findExportedInterfaces(SPEC_FILE, 'Spec'));
const unionMembers = parseSpecUnions(SPEC_FILE); // { AtlButtonVariant: ['primary', ...], ... }

const registry = parseExportedVars(METADATA_INDEX).COMPONENT_METADATA_REGISTRY || {};
const metadataCache = new Map();
function metadataForSpec(specName) {
  const moduleName = registry[specName];
  if (!moduleName) return null;
  if (!metadataCache.has(moduleName)) {
    const file = path.join(METADATA_DIR, `${moduleName}.metadata.ts`);
    metadataCache.set(moduleName, fs.existsSync(file) ? parseExportedVars(file).metadata : null);
  }
  return metadataCache.get(moduleName);
}

// ---------------------------------------------------------------------------
// Run the five checks per component.
// ---------------------------------------------------------------------------
for (const comp of snapshot.components) {
  const selector = comp.selector; // e.g. 'AtlButton'
  const specName = `${selector}Spec`;

  checkNameAlignment(comp, selector, specName);
  checkVariantMatrix(comp, selector, specName);
  checkTokenLinks(comp, selector);
  checkAutoLayout(comp, selector);
  checkDescription(comp, selector, specName);
}

// ---------------------------------------------------------------------------
// Report — prioritized (Blocker → Critical → Warning), styled like the other
// gates. Each finding is one actionable line.
// ---------------------------------------------------------------------------
report();

// ===========================================================================
// Checks
// ===========================================================================

/** 1. Name alignment — selector exists in the spec; every spec axis union is a
 *  Figma variant property whose values match the literals exactly. Figma axes
 *  with no matching spec union (e.g. interaction `state`) are ignored. */
function checkNameAlignment(comp, selector, specName) {
  if (!specInterfaces.has(specName)) {
    // Some masters are deliberately spec-less (Toast is options-based per
    // ADR-0008, CodeBlock has no spec contract) — allowlist as
    // `selector:name:spec-interface` instead of inventing an interface.
    if (allowed(selector, 'name', 'spec-interface')) return;
    blocker('NAME', `${selector}: Figma component "${comp.name}" has no matching spec interface ${specName} in libs/spec/src/index.ts. Rename the Figma component or fix the spec.`);
    return;
  }
  const axes = comp.variantAxes || {};
  // For every spec union that belongs to this selector, the Figma axis must
  // exist and its values must match the literals exactly.
  for (const [unionName, members] of Object.entries(unionMembers)) {
    if (!unionName.startsWith(selector)) continue;
    const axisProp = lowerFirst(unionName.slice(selector.length)); // AtlButtonVariant -> 'variant'
    if (!axisProp) continue;
    const figmaValues = axes[axisProp];
    if (!figmaValues) {
      // Some spec unions are realised as code-only props (e.g. a landmark role),
      // never as a Figma variant axis — allowlist them as `selector:name:<axis>`.
      if (allowed(selector, 'name', axisProp)) continue;
      blocker('NAME', `${selector}: spec axis "${axisProp}" (${unionName}) has no matching Figma variant property. Add a "${axisProp}" variant axis, or allowlist it if it is a code-only prop.`);
      continue;
    }
    const figmaSet = new Set(figmaValues);
    const specSet = new Set(members);
    const missing = members.filter((m) => !figmaSet.has(m) && !allowed(selector, 'name', `${axisProp}=${m}`));
    const extra = figmaValues.filter((v) => !specSet.has(v) && !allowed(selector, 'name', `${axisProp}=${v}`));
    if (missing.length) {
      blocker('NAME', `${selector}.${axisProp}: Figma is missing value(s) [${missing.map(q).join(', ')}] present in spec ${unionName}. Add the variant value(s) (exact casing).`);
    }
    if (extra.length) {
      blocker('NAME', `${selector}.${axisProp}: Figma has value(s) [${extra.map(q).join(', ')}] not in spec ${unionName}. Rename to the spec literal or remove (casing must match exactly, e.g. "primary" not "Primary").`);
    }
  }
}

/** 2. Variant-matrix completeness — every metadata.variantMatrix row must be
 *  satisfied by at least one captured Figma variant (superset match on the axis
 *  keys the row and the component share). */
function checkVariantMatrix(comp, selector, specName) {
  const meta = metadataForSpec(specName);
  if (!meta || !Array.isArray(meta.variantMatrix)) return; // metadata gate owns this
  const axisKeys = new Set(Object.keys(comp.variantAxes || {}));
  const variants = comp.variants || [];
  for (const row of meta.variantMatrix) {
    if (!row || typeof row !== 'object') continue;
    // Only the row's keys that are real Figma variant axes are matchable
    // (rows may carry boolean/code-only keys like closeOnBackdrop).
    const keys = Object.keys(row).filter((k) => axisKeys.has(k));
    if (keys.length === 0) continue;
    const detail = keys.map((k) => `${k}=${row[k]}`).join(',');
    if (allowed(selector, 'variant', detail)) continue;
    const hit = variants.some((v) => keys.every((k) => String(v[k]) === String(row[k])));
    if (!hit) {
      blocker('VARIANT', `${selector}: metadata.variantMatrix entry {${detail}} has no matching Figma variant. Add it to the COMPONENT_SET.`);
    }
  }
}

/** 3. Token-link coverage — raw colors, raw radii, raw spacing, and bindings to
 *  a non-semantic collection. Aggregated per component so the report stays
 *  readable. */
function checkTokenLinks(comp, selector) {
  const rawColorNodes = [];
  const rawRadiusNodes = [];
  const rawSpacingNodes = [];
  const nonSemantic = [];
  for (const n of comp.nodes || []) {
    if ((n.rawColors || []).length && !allowed(selector, 'token', `color:${n.name}`)) {
      rawColorNodes.push(`${n.name} (${n.rawColors.join(', ')})`);
    }
    if (n.unboundRadius && !allowed(selector, 'token', `radius:${n.name}`)) {
      rawRadiusNodes.push(`${n.name} (${n.unboundRadius})`);
    }
    if ((n.unboundSpacing || []).length && !allowed(selector, 'token', `spacing:${n.name}`)) {
      rawSpacingNodes.push(n.name);
    }
    for (const t of n.nonSemanticTokens || []) {
      if (!allowed(selector, 'token', `nonsemantic:${t}`)) nonSemantic.push(`${t} on ${n.name}`);
    }
  }
  if (rawColorNodes.length) {
    critical('TOKEN', `${selector}: raw color fill/stroke (no bound variable) on ${rawColorNodes.join('; ')}. Bind to a UI-Tokens color variable (--ui-color-*).`);
  }
  if (rawRadiusNodes.length) {
    critical('TOKEN', `${selector}: raw corner radius (not bound) on ${rawRadiusNodes.join('; ')}. Bind to a radius variable (--ui-radius-*).`);
  }
  if (rawSpacingNodes.length) {
    critical('TOKEN', `${selector}: raw padding/gap (not bound) on ${rawSpacingNodes.length} node(s) [${rawSpacingNodes.join(', ')}]. Bind to a spacing variable (--ui-spacing-*).`);
  }
  if (nonSemantic.length) {
    warning('TOKEN', `${selector}: bound to non-semantic collection — ${nonSemantic.join('; ')}. Components should bind to the UI Tokens (semantic) layer, not primitives.`);
  }
}

/** 4. Auto-layout present — any node with children that is a frame-like
 *  container must use Auto Layout (layoutMode != NONE). Childless frames
 *  (dividers, spacers) are exempt. */
function checkAutoLayout(comp, selector) {
  const FRAME_LIKE = new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'GROUP']);
  const offenders = [];
  for (const n of comp.nodes || []) {
    if (!n.hasChildren) continue;
    if (!FRAME_LIKE.has(n.type)) continue;
    if (n.layoutMode && n.layoutMode !== 'NONE') continue;
    if (allowed(selector, 'autolayout', n.name)) continue;
    offenders.push(n.name);
  }
  if (offenders.length) {
    critical('AUTOLAYOUT', `${selector}: frame(s) without Auto Layout — [${offenders.join(', ')}]. Enable Auto Layout so generators can infer responsive intent.`);
  }
}

/** 5. Description congruence — the master description must be set and must
 *  reference the spec interface it maps to (the contract link). Figma
 *  descriptions are intentionally richer than the one-line metadata.purpose, so
 *  byte-equality is not enforced; presence + spec linkage is the meaningful
 *  signal. Advisory (Warning). */
function checkDescription(comp, selector, specName) {
  const desc = (comp.description || '').trim();
  if (!desc) {
    warning('DESC', `${selector}: master component has no Figma description. Add one that maps it to ${specName}.`);
    return;
  }
  if (!desc.includes(specName) && !allowed(selector, 'desc', 'spec-ref')) {
    warning('DESC', `${selector}: description does not reference its spec interface ${specName}. State the spec mapping so the description stays congruent with the contract.`);
  }
}

// ===========================================================================
// Helpers
// ===========================================================================

function report() {
  const order = { BLOCKER: 0, CRITICAL: 1, WARNING: 2 };
  const all = [...errors, ...warnings].sort((a, b) => order[a.sev] - order[b.sev]);
  const icon = (sev) => (sev === 'WARNING' ? '⚠' : '✗');
  const stamp = snapshot.meta || {};
  const head = `Snapshot: ${stamp.generatedAt || '?'}${stamp.figmaLastModified ? ` · Figma edited ${stamp.figmaLastModified}` : ''} · ${snapshot.components.length} master(s)`;

  if (all.length === 0) {
    console.log(`✓ figma conformance in sync (${snapshot.components.length} masters checked). ${head}`);
    return;
  }

  for (const f of all) {
    const line = `${icon(f.sev)} [${f.sev}] [${f.tag}] ${f.msg}`;
    if (f.sev === 'WARNING') console.warn(line);
    else console.error(line);
  }

  const blockers = errors.filter((e) => e.sev === 'BLOCKER').length;
  const criticals = errors.filter((e) => e.sev === 'CRITICAL').length;
  if (errors.length > 0) {
    console.error(
      `\n${errors.length} figma conformance issue(s): ${blockers} blocker, ${criticals} critical, ${warnings.length} warning. ${head}\n` +
        `Fix in Figma (file ${stamp.fileKey || ''}) and re-run npm run figma:snapshot, or allowlist a known false-positive in tools/scripts/lib/allowlists.js.`
    );
    process.exit(1);
  }
  console.warn(`\n${warnings.length} figma warning(s) (non-blocking). ${head}`);
}

function lowerFirst(s) {
  return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}
function q(s) {
  return `'${s}'`;
}

/** Parse libs/spec/src/index.ts for `type Atl... = 'a' | 'b'` string-literal
 *  unions. Syntactic parse (createSourceFile) — fast, no type resolution. */
function parseSpecUnions(file) {
  const src = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true);
  const out = {};
  ts.forEachChild(sf, (node) => {
    if (!ts.isTypeAliasDeclaration(node)) return;
    const members = literalMembers(node.type);
    if (members) out[node.name.text] = members;
  });
  return out;
}
function literalMembers(typeNode) {
  if (!typeNode || !ts.isUnionTypeNode(typeNode)) return null;
  const out = [];
  for (const t of typeNode.types) {
    if (ts.isLiteralTypeNode(t) && ts.isStringLiteralLike(t.literal)) {
      out.push(t.literal.text);
    } else {
      return null; // not a pure string-literal union — skip
    }
  }
  return out.length ? out : null;
}
