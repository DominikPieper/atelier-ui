#!/usr/bin/env node
/**
 * check-category-alignment.js
 *
 * Nothing compared a component's category in docs/src/data/components.ts
 * against the category its Figma master and its Storybook story title
 * declare, which is why `accordion`/`alert` sat under `Layout` in
 * components.ts for a while after Figma's masters (`Feedback/AtlAccordionGroup`,
 * `Feedback/AtlAlert`, `Feedback/AtlAccordionItem`) and every Storybook
 * `title:` (`Components/Feedback/Atl…`) had already settled on `Feedback` —
 * two agreeing sources and one silent outlier (plan/adr/0118, ADR-0116's
 * side-note, tasks/todo.md's "Category name split" item). This gate is what
 * would have caught that the moment it happened.
 *
 * Runs fully OFFLINE — same posture as check-figma.js — against two
 * committed artefacts:
 *   - docs/src/data/components.ts (`componentDocs`, parsed statically via
 *     lib/ts-eval so this file is never executed, only read)
 *   - tools/figma/snapshot.json (Figma facts, same as check-figma.js)
 * plus a plain-text read of every `*.stories.*` file under
 * libs/{angular,react,vue}/src/lib/<id>/ — no Storybook build required, unlike
 * check:storybook-manifests.
 *
 * Per component in componentDocs, two independent comparisons:
 *
 *   [FIGMA-CATEGORY] components.ts's `category` must equal the section
 *                     (the text before the first `/`) of the Figma master
 *                     name that component's `selector` field resolves to.
 *   [STORY-CATEGORY] components.ts's `category` must equal the category
 *                     segment of `Components/<Category>/<Name>` in every
 *                     framework's story `title:` for that component.
 *
 * A component legitimately has no Figma master (e.g. `icon` — no COMPONENT_SET
 * named AtlIcon exists in the snapshot) or no story in some framework; those
 * are SKIPPED, not failed, and every skip is counted and printed so a run that
 * skipped everything cannot read as a quiet pass ([ALL-SKIPPED] below hard-fails
 * that exact case).
 *
 * A component whose `selector` field is prose rather than an `AtlXxx` name
 * (`tooltip`: `[atlTooltip]`, `toast`: `Toast (service / hook +
 * AtlToastContainer)`) cannot be resolved by the general "first Atl* token"
 * rule; both are named explicitly in SELECTOR_OVERRIDES below. A selector this
 * gate cannot resolve at all — no override, no Atl* token — is
 * [SELECTOR-UNRESOLVED], a defect in this gate's own coverage, not a business
 * fact about the component, and always fails.
 *
 * EXEMPTIONS: tools/scripts/lib/allowlists.js's CATEGORY_ALIGNMENT_EXEMPT,
 * keyed `<component-id>:figma` (no `:story` entries exist today — nothing
 * needs one). Same two-kind idiom as TOKEN_BYPASS_EXEMPT: `design` is a closed
 * question and prints nothing; `gap` is open and prints on every run so it
 * keeps nagging. An exemption that suppressed nothing this run is
 * [STALE-EXEMPTION] (a warning, not a failure — same severity check-figma.js
 * gives its own stale-exemption check).
 *
 * Run via:  node tools/scripts/check-category-alignment.js
 *           (or  npm run check:category-alignment, once wired into package.json)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { parseExportedVars } = require('./lib/ts-eval');
const { FRAMEWORKS } = require('./lib/component-discovery');
const { CATEGORY_ALIGNMENT_EXEMPT } = require('./lib/allowlists');

const ROOT = path.resolve(__dirname, '../..');
const DOCS_FILE = path.join(ROOT, 'docs/src/data/components.ts');
const SNAPSHOT_FILE = path.join(ROOT, 'tools/figma/snapshot.json');
const libSrc = (fw) => path.join(ROOT, 'libs', fw, 'src/lib');

const errors = [];
const fail = (tag, msg) => errors.push(`[${tag}] ${msg}`);

// ---------------------------------------------------------------------------
// Load docs/src/data/components.ts. Fail loud — this file is the roster this
// gate walks, so an unreadable one means the gate checked nothing real.
// ---------------------------------------------------------------------------
if (!fs.existsSync(DOCS_FILE)) {
  console.error(`✗ [DOCS-PARSE] ${path.relative(ROOT, DOCS_FILE)} not found.`);
  process.exit(1);
}
let componentDocs;
try {
  componentDocs = parseExportedVars(DOCS_FILE).componentDocs;
} catch (err) {
  console.error(
    `✗ [DOCS-PARSE] ${path.relative(ROOT, DOCS_FILE)}: ${err.message}`,
  );
  process.exit(1);
}
if (
  !componentDocs ||
  typeof componentDocs !== 'object' ||
  Object.keys(componentDocs).length === 0
) {
  console.error(
    `✗ [DOCS-PARSE] ${path.relative(ROOT, DOCS_FILE)} produced no componentDocs entries (static evaluator returned nothing).`,
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load the Figma snapshot. Same fail-loud rule check-figma.js uses: never a
// silent pass if it is missing, unparsable, or empty.
// ---------------------------------------------------------------------------
if (!fs.existsSync(SNAPSHOT_FILE)) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} not found.\n` +
      `This gate runs offline against a committed snapshot. Generate it with a connected ` +
      `Figma Desktop Bridge:  npm run figma:snapshot`,
  );
  process.exit(1);
}
let snapshot;
try {
  snapshot = JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
} catch (err) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} is not valid JSON: ${err.message}`,
  );
  process.exit(1);
}
if (
  !snapshot ||
  !Array.isArray(snapshot.components) ||
  snapshot.components.length === 0
) {
  console.error(
    `✗ [SNAPSHOT] ${path.relative(ROOT, SNAPSHOT_FILE)} has no components. Re-run npm run figma:snapshot.`,
  );
  process.exit(1);
}

/** Figma master selector (e.g. 'AtlBadge') -> its section (e.g. 'Display'),
 *  the text before the first '/' in its slash-named `name`. */
const figmaCategoryBySelector = new Map();
for (const c of snapshot.components) {
  if (c && typeof c.selector === 'string' && typeof c.name === 'string') {
    figmaCategoryBySelector.set(c.selector, c.name.split('/')[0]);
  }
}

/**
 * componentDocs' own `selector` field is prose for two entries — an attribute
 * selector, and a parenthetical describing an imperative API — so the general
 * "first Atl* token" rule below cannot read a Figma-matching name out of
 * either. Resolved by hand; see the file header for which components and why.
 */
const SELECTOR_OVERRIDES = {
  tooltip: 'AtlTooltip',
  toast: 'AtlToast',
};

/** The Atl* token this docs component's selector text names, honoring
 *  SELECTOR_OVERRIDES first. Returns null only when NEITHER an override NOR a
 *  regex match exists — a gap in this gate's own coverage, not a fact about
 *  the component (that case is [SELECTOR-UNRESOLVED], always a failure). */
function primarySelectorFor(id, selectorText) {
  if (SELECTOR_OVERRIDES[id]) return SELECTOR_OVERRIDES[id];
  const m = /\bAtl[A-Za-z]+\b/.exec(selectorText || '');
  return m ? m[0] : null;
}

function allowed(id, check) {
  const key = `${id}:${check}`;
  const exemption = CATEGORY_ALIGNMENT_EXEMPT.get(key);
  if (exemption) exemptionsUsed.add(key);
  return exemption || null;
}

const exemptionsUsed = new Set();
let figmaChecked = 0;
let figmaSkipped = 0;
let storyChecked = 0;
let storySkipped = 0;

// ---------------------------------------------------------------------------
// Per-component checks, roster derived from componentDocs — never hardcoded.
// ---------------------------------------------------------------------------
const ids = Object.keys(componentDocs).sort();

for (const id of ids) {
  const doc = componentDocs[id];
  const docsCat = doc && doc.category;
  if (!docsCat) {
    fail(
      'DOCS-CATEGORY',
      `${id}: componentDocs entry has no 'category' field.`,
    );
    continue;
  }

  // ---- Figma ----
  const primary = primarySelectorFor(id, doc.selector);
  if (!primary) {
    fail(
      'SELECTOR-UNRESOLVED',
      `${id}: selector "${doc.selector}" carries no Atl* token this gate can resolve to a Figma master ` +
        `name. Add it to SELECTOR_OVERRIDES in check-category-alignment.js if it is a legitimate ` +
        `non-Atl* selector (an attribute selector, an imperative-API description, ...).`,
    );
  } else if (!figmaCategoryBySelector.has(primary)) {
    figmaSkipped++;
    console.log(
      `  [skip:figma] ${id}: no Figma master named "${primary}" in the snapshot — nothing to compare.`,
    );
  } else {
    figmaChecked++;
    const figmaCat = figmaCategoryBySelector.get(primary);
    if (figmaCat !== docsCat) {
      const exemption = allowed(id, 'figma');
      if (exemption) {
        if (exemption.kind === 'gap') {
          console.warn(
            `  ⚠ [exempt:figma:gap] ${id}: components.ts says '${docsCat}', Figma's ${primary} master says '${figmaCat}' — ${exemption.reason}`,
          );
        }
        // kind 'design' is a closed question: silent.
      } else {
        fail(
          'FIGMA-CATEGORY',
          `${id}: components.ts says category '${docsCat}', but its Figma master "${figmaCat}/${primary}" ` +
            `sits in the '${figmaCat}' section. Rename the category in docs/src/data/components.ts, fix the ` +
            `Figma master's section, or — if the split is intentional and unresolved — add ` +
            `'${id}:figma' to CATEGORY_ALIGNMENT_EXEMPT in tools/scripts/lib/allowlists.js with a reason.`,
        );
      }
    }
  }

  // ---- Storybook ----
  const storyCats = new Set(); // 'fw:Category' entries, one per title found
  for (const fw of FRAMEWORKS) {
    const dir = path.join(libSrc(fw), id);
    if (!fs.existsSync(dir)) continue;
    const storyFiles = fs.readdirSync(dir).filter((f) => /\.stories\./.test(f));
    for (const f of storyFiles) {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      const m = /title:\s*['"]Components\/([^/'"]+)\/[^'"]+['"]/.exec(content);
      if (m) storyCats.add(`${fw}:${m[1]}`);
    }
  }
  if (storyCats.size === 0) {
    storySkipped++;
    console.log(
      `  [skip:story] ${id}: no Storybook story title found in any framework — nothing to compare.`,
    );
  } else {
    storyChecked++;
    const mismatches = [...storyCats].filter(
      (entry) => !entry.endsWith(`:${docsCat}`),
    );
    if (mismatches.length > 0) {
      const exemption = allowed(id, 'story');
      if (exemption) {
        if (exemption.kind === 'gap') {
          console.warn(
            `  ⚠ [exempt:story:gap] ${id}: components.ts says '${docsCat}', story title(s) disagree (${mismatches.join(', ')}) — ${exemption.reason}`,
          );
        }
      } else {
        fail(
          'STORY-CATEGORY',
          `${id}: components.ts says category '${docsCat}', but its Storybook story title says otherwise: ` +
            `${mismatches.join(', ')}. Rename the category in docs/src/data/components.ts, or fix the story's ` +
            `\`title:\`.`,
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// An exemption that suppressed nothing this run — same idiom check-figma.js
// uses for its own allowlist (ADR-0068's point: an excuse for a defect that no
// longer exists reads as one still being excused). Non-blocking, like there.
// ---------------------------------------------------------------------------
const staleExemptions = [...CATEGORY_ALIGNMENT_EXEMPT.keys()].filter(
  (k) => !exemptionsUsed.has(k),
);
if (staleExemptions.length > 0) {
  console.warn(
    `⚠ [STALE-EXEMPTION] ${staleExemptions.length} allowlist entr${staleExemptions.length > 1 ? 'ies' : 'y'} ` +
      `suppressed nothing this run: ${staleExemptions.join(', ')}. Either the mismatch was fixed — delete the ` +
      `entry — or the category it names changed shape and the key no longer matches anything.`,
  );
}

// ---------------------------------------------------------------------------
// A run that skipped every single comparison would still print "0 issues" and
// exit 0 without this — a silent all-skipped pass, which is exactly what
// nothing else in the repo would catch. If neither check ever actually ran,
// something upstream is broken (empty snapshot, unreadable story files, or the
// selector-token rule regressed), not a legitimate absence of masters/stories.
// ---------------------------------------------------------------------------
if (figmaChecked === 0 && storyChecked === 0) {
  fail(
    'ALL-SKIPPED',
    `Every comparison was skipped (${figmaSkipped} Figma, ${storySkipped} story, 0 actually checked) across ` +
      `${ids.length} component(s). That means this gate checked nothing real this run — investigate rather ` +
      `than trust the "0 issues" a naive read of the output would suggest.`,
  );
}

// ---------------------------------------------------------------------------
// Report.
// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error('');
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(
    `\n${errors.length} category-alignment issue(s) found (${figmaChecked} Figma comparison(s), ` +
      `${storyChecked} Storybook comparison(s), ${figmaSkipped + storySkipped} skipped: ${figmaSkipped} Figma, ` +
      `${storySkipped} story).`,
  );
  process.exit(1);
} else {
  console.log(
    `\n✓ ${ids.length} component(s)' categories agree with their Figma master and Storybook story title ` +
      `(${figmaChecked} Figma comparison(s), ${storyChecked} Storybook comparison(s), ` +
      `${figmaSkipped + storySkipped} skipped: ${figmaSkipped} Figma, ${storySkipped} story).`,
  );
}
