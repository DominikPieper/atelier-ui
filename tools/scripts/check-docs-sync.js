#!/usr/bin/env node
/**
 * check-docs-sync.js
 *
 * Validates that docs/src/data/components.ts is in sync with the spec interfaces
 * in libs/spec/src/index.ts, and guards the docs pages' Figma and port citations.
 *
 * Checks:
 *   [MISSING]    A spec interface has no corresponding entry in componentDocs
 *   [NODE-ID]    A Figma node-id cited in participant-facing material does not
 *                resolve against tools/figma/snapshot.json (masters, sampled
 *                variants, or the Workshop-Templates kata frames in
 *                `referencedNodes`) — a dead node-id opens the file and silently
 *                focuses nothing. Scanned: docs/src plus workshop/ (the Day-2
 *                component briefs, which cite the four starter frames). The
 *                briefs sat outside the
 *                original docs/src scope while citing four node ids — exactly the
 *                failure this check exists to prevent, in an unguarded location.
 *   [PORT-6006]  A line under docs/src/pages/** cites Storybook's scaffold-only
 *                port 6006. ADR-0084 makes the cloned atelier monorepo canonical
 *                for the two-day cohort — its Storybook binds 4400 (angular) /
 *                4401 (react) / 4402 (vue) and docs binds 4300 — so 6006 is only
 *                ever correct where a page is explicitly describing the
 *                `create-atelier-ui-workspace` scaffold. Genuine scaffold
 *                mentions are named in SCAFFOLD_PORT_EXEMPT
 *                (tools/scripts/lib/allowlists.js), same allowlist idiom as the
 *                other gates; an unlisted 6006 is the exact defect the ADR's
 *                2026-09-05 amendment records. Keyed on content, not `file:line`
 *                (scaffoldPortKey — the citing line plus the non-blank line
 *                above it): a purely additive edit anywhere else in the file
 *                cannot desync the exemption (ADR-0119).
 *
 * Retired (P4a, ADR-0121): [DRIFT] and [TYPE-DRIFT], which compared the spec's
 * props and string-literal unions with the hand-written `props` arrays in
 * components.ts. Those arrays are gone: the docs prop tables are generated from
 * each framework's Storybook manifest (projected into docs/src/data/props.generated.json), so the
 * docs cannot drift from the adapters. The spec <-> adapter comparison itself is
 * check:props (prop names), check:variants (union values) and check:defaults.
 *
 * Run via:  node tools/scripts/check-docs-sync.js
 *           (or  npm run check:docs)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const { SCAFFOLD_PORT_EXEMPT, scaffoldPortKey } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const DOCS_FILE = path.join(ROOT, 'docs/src/data/components.ts');
const SNAPSHOT_FILE = path.join(ROOT, 'tools/figma/snapshot.json');
const DOCS_SRC = path.join(ROOT, 'docs/src');
const PAGES_DIR = path.join(ROOT, 'docs/src/pages');
/**
 * Participant-facing material outside docs/src that also cites Figma node ids —
 * today, the Day-2 component briefs, which name the four starter frames by id.
 *
 * schulung-2tage-agenda.md is deliberately NOT scanned. It cites its Figma frames
 * by NAME (`Toast / Starter`), never by id, so there is nothing here to guard —
 * and its schedule is full of time ranges (`16:10–17:15`) on the same lines that
 * mention Figma, which is precisely the shape the bare-colon extractor accepts.
 * Scanning it produced seven findings, all of them clock times. Cite a frame by id
 * there and this decision has to be revisited along with the extractor.
 */
const NODE_ID_ROOTS = [DOCS_SRC, path.join(ROOT, 'workshop')];

/**
 * Primary spec interface -> docs slug. Single-sourced from
 * libs/spec/src/metadata/index.ts (DOCS_PRIMARY_SPECS) since ADR-0031.
 */
const SPEC_TO_DOCS = require('./lib/component-map').maps().docsPrimary;

/**
 * Parses component-data.ts and returns the componentDocs keys and the set of all
 * keys listed in COMPONENT_CATEGORIES.
 * @returns {{ docKeys: Set<string>, categoryKeys: Set<string> }}
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

  /** @type {Set<string>} */
  const docKeys = new Set();
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
      if (key) docKeys.add(key);
    }
  }

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer
    ) {
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
  return { docKeys, categoryKeys };
}

// ---------------------------------------------------------------------------
// Figma node-id citations
// ---------------------------------------------------------------------------

/**
 * Every node id the committed snapshot can vouch for: the masters, the variant
 * each master's deep read sampled, and the Workshop-Templates kata frames
 * captured as `referencedNodes` (a docs-cited exercise frame lives on that
 * page, not among the masters).
 * @returns {Set<string>} ids in canonical `123:456` form
 */
function knownFigmaNodeIds() {
  const snap = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
  const ids = new Set();
  for (const c of snap.components ?? []) {
    if (c.nodeId) ids.add(c.nodeId);
    if (c.sampledVariant) ids.add(c.sampledVariant);
  }
  for (const r of snap.referencedNodes ?? []) {
    if (r.id) ids.add(r.id);
  }
  return ids;
}

/**
 * Extracts Figma node-id citations from one line of docs source. Two shapes,
 * built from the citations the docs actually carry:
 *   - URL/prose dash form: `?node-id=936-2954`, `node-id 936-2954`
 *   - bare colon form: `936:2954` in prose, `nodeId: "129:20"` in code samples.
 *     Guarded three ways so times ("11:00–12:15") and contrast ratios ("3:1",
 *     "4.5:1") never read as node ids: the line must also mention figma or
 *     node-id, both parts need >= 2 digits, and neither may start with 0.
 * @param {string} line
 * @returns {string[]} ids in canonical `123:456` form
 */
function nodeIdCitationsOf(line) {
  const ids = [];
  const dashRe = /node-id[= ](\d+)-(\d+)/gi;
  let m;
  while ((m = dashRe.exec(line)) !== null) ids.push(`${m[1]}:${m[2]}`);
  if (/figma|node[-_ ]?id/i.test(line)) {
    const colonRe = /(?<![\d:.])([1-9]\d+):([1-9]\d+)(?![\d:])/g;
    while ((m = colonRe.exec(line)) !== null) ids.push(`${m[1]}:${m[2]}`);
  }
  return ids;
}

/** @returns {string[]} absolute paths of docs source files worth scanning */
function docsSourceFiles(dir = DOCS_SRC) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...docsSourceFiles(full));
    else if (/\.(astro|tsx?|jsx?|mjs|mdx?)$/.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * [NODE-ID]: every Figma node-id cited in participant-facing material must resolve against the
 * committed snapshot. A dead id is the worst kind of workshop failure: the
 * Figma URL opens the file, focuses nothing, and every downstream MCP call
 * fails with no error the participant can act on.
 * @param {string[]} errors
 */
function checkNodeIdCitations(errors) {
  const known = knownFigmaNodeIds();
  const scanned = NODE_ID_ROOTS.filter((d) => fs.existsSync(d)).flatMap((d) =>
    docsSourceFiles(d),
  );
  for (const file of scanned) {
    const rel = path.relative(ROOT, file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const id of new Set(nodeIdCitationsOf(line))) {
        if (!known.has(id)) {
          errors.push(
            `[NODE-ID] ${rel}:${i + 1} cites Figma node ${id}, which tools/figma/snapshot.json does not know — ` +
              `fix the citation, or refresh the snapshot (npm run figma:snapshot) if the node was just created`,
          );
        }
      }
    });
  }
}

/**
 * [PORT-6006]: docs/src/pages/** must not cite Storybook's scaffold-only port
 * 6006 outside a line named in SCAFFOLD_PORT_EXEMPT. ADR-0084 is the record of
 * why this matters: the cloned monorepo (canonical for the two-day cohort)
 * binds each framework's Storybook to its own port (4400/4401/4402) and the
 * docs app to 4300, and the ADR's own decision text shipped with the
 * scaffold's 6006 in a clone-branch sentence — the same mistake this gate now
 * catches mechanically.
 *
 * The exemption match is content-addressed (scaffoldPortKey, ADR-0119): the
 * citing line's own trimmed text plus the trimmed text of the non-blank line
 * immediately above it, never a line number. That means a citation keeps its
 * exemption through any edit elsewhere in the file — this function cannot
 * mistake "a concurrent edit shifted an unrelated exempt line" for "this
 * citation is new."
 * @param {string[]} errors
 */
function checkScaffoldPortCitations(errors) {
  const used = new Set();
  for (const file of docsSourceFiles(PAGES_DIR)) {
    const rel = path.relative(ROOT, file);
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (!line.includes('6006')) return;
      let prevLine = '';
      for (let j = i - 1; j >= 0; j -= 1) {
        if (lines[j].trim() !== '') {
          prevLine = lines[j];
          break;
        }
      }
      const key = scaffoldPortKey(rel, prevLine, line);
      if (SCAFFOLD_PORT_EXEMPT.has(key)) {
        used.add(key);
        return;
      }
      errors.push(
        `[PORT-6006] ${rel}:${i + 1} cites port 6006 with no matching SCAFFOLD_PORT_EXEMPT entry. ` +
          "This key is content-addressed (this line's text plus the non-blank line above it), not a line " +
          'number, so a purely additive edit elsewhere in the file cannot have caused this: either the ' +
          'citation is genuinely new, or the citing line (or the one immediately above it) was itself just ' +
          'edited and the exemption needs a matching update. The clone (this repo) serves Storybook on ' +
          '4400 (angular) / 4401 (react) / 4402 (vue) and the docs app on 4300 — 6006 is ' +
          "create-atelier-ui-workspace's port (ADR-0084). If this line genuinely documents the scaffold, " +
          'add an entry to SCAFFOLD_PORT_EXEMPT in tools/scripts/lib/allowlists.js with a reason, keyed like ' +
          'this:\n' +
          `      scaffoldPortKey(\n` +
          `        ${JSON.stringify(rel)},\n` +
          `        ${JSON.stringify(prevLine.trim())},\n` +
          `        ${JSON.stringify(line.trim())},\n` +
          `      )\n` +
          "    Otherwise, fix the citation to reference the clone's ports (4300/4400/4401/4402).",
      );
    });
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { docKeys, categoryKeys } = parseDocs();

const errors = [];

// 1. Every primary spec interface has a docs entry. (Prop and union-value
// parity moved to the manifests; see the header.)
for (const [specInterface, docsKey] of Object.entries(SPEC_TO_DOCS)) {
  if (!docKeys.has(docsKey)) {
    errors.push(
      `[MISSING] '${docsKey}' has no entry in component-data.ts (spec: ${specInterface})`,
    );
  }
}

// 2. COMPONENT_CATEGORIES ↔ componentDocs parity
for (const key of categoryKeys) {
  if (!docKeys.has(key)) {
    errors.push(
      `[MISSING] '${key}' is listed in COMPONENT_CATEGORIES but has no entry in componentDocs`,
    );
  }
}
for (const key of docKeys) {
  if (!categoryKeys.has(key)) {
    errors.push(
      `[MISSING] '${key}' is in componentDocs but not listed in COMPONENT_CATEGORIES`,
    );
  }
}

// 3. Figma node-id citations ↔ committed snapshot
checkNodeIdCitations(errors);

// 4. Scaffold-only port 6006 cited outside an allowlisted context
checkScaffoldPortCitations(errors);

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  const nodeIdIssues = errors.filter((e) => e.startsWith('[NODE-ID]')).length;
  const portIssues = errors.filter((e) => e.startsWith('[PORT-6006]')).length;
  const docIssues = errors.length - nodeIdIssues - portIssues;
  console.error(
    `\n${errors.length} issue(s) found.` +
      (docIssues
        ? ' Update docs/src/data/components.ts to fix the spec/docs drift.'
        : '') +
      (nodeIdIssues
        ? ' Fix the dead node-id citation(s) in the named docs pages.'
        : '') +
      (portIssues
        ? ' Fix the stray port 6006 citation(s), or allowlist genuine scaffold mentions.'
        : ''),
  );
  process.exit(1);
} else {
  const count = Object.keys(SPEC_TO_DOCS).length;
  console.log(
    `✓ All ${count} spec interfaces and categories match component-data.ts`,
  );
  console.log(
    '✓ Every Figma node-id cited under docs/src and workshop/ resolves against tools/figma/snapshot.json',
  );
  console.log(
    '✓ No stray port-6006 citation under docs/src/pages (create-atelier-ui-workspace scaffold only, ADR-0084)',
  );
}
