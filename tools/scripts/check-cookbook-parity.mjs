#!/usr/bin/env node
/**
 * check-cookbook-parity.mjs
 *
 * Validates that docs/src/data/patterns.ts (the cookbook catalog read by
 * /patterns and downstream consumers) stays in sync with the live cookbook
 * stories in libs/{angular,react,vue}/src/lib/cookbook.stories.{ts,tsx}.
 *
 * Failure modes detected:
 *   [MISSING]  A pattern's tags[] names a component that does not appear in
 *              the corresponding story section (catalog claims more than the
 *              story renders).
 *   [EXTRA]    A story section uses a component that is not in tags[]
 *              (catalog under-reports — agents may miss a relevant component).
 *
 * The catalog uses parent-component names (LlmCard, LlmDialog, LlmTable, ...).
 * Stories use sub-components (LlmCardHeader, LlmDialogFooter, LlmTd, ...).
 * SUBCOMPONENT_MAP normalizes sub-components to their parent before comparison.
 *
 * Run via:  node tools/scripts/check-cookbook-parity.mjs
 *           (or  npm run check:cookbook)
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const PATTERNS_FILE = resolve(ROOT, 'docs/src/data/patterns.ts');
const STORY_FILES = {
  angular: resolve(ROOT, 'libs/angular/src/lib/cookbook.stories.ts'),
  react: resolve(ROOT, 'libs/react/src/lib/cookbook.stories.tsx'),
  vue: resolve(ROOT, 'libs/vue/src/lib/cookbook.stories.ts'),
};

// Sub-component → parent component. Catalog uses parent names; story imports
// pull sub-components individually. Normalize before comparing.
const SUBCOMPONENT_MAP = {
  LlmCardHeader: 'LlmCard',
  LlmCardContent: 'LlmCard',
  LlmCardFooter: 'LlmCard',
  LlmDialogHeader: 'LlmDialog',
  LlmDialogContent: 'LlmDialog',
  LlmDialogFooter: 'LlmDialog',
  LlmDrawerHeader: 'LlmDrawer',
  LlmDrawerContent: 'LlmDrawer',
  LlmDrawerFooter: 'LlmDrawer',
  LlmTab: 'LlmTabGroup',
  LlmThead: 'LlmTable',
  LlmTbody: 'LlmTable',
  LlmTr: 'LlmTable',
  LlmTh: 'LlmTable',
  LlmTd: 'LlmTable',
  LlmAccordionItem: 'LlmAccordionGroup',
  LlmAccordionHeader: 'LlmAccordionGroup',
  LlmOption: 'LlmSelect',
  LlmMenuItem: 'LlmMenu',
  LlmMenuSeparator: 'LlmMenu',
  LlmMenuTrigger: 'LlmMenu',
};

// Identifiers that look like Llm* but are not components. Strip these from
// extracted sets before reporting.
const IGNORE_TOKENS = new Set([
  'LlmComponentName',
]);

function normalize(component) {
  return SUBCOMPONENT_MAP[component] ?? component;
}

/** Extracts { num, id, tags } per pattern from patterns.ts via regex. */
function readPatterns() {
  const src = readFileSync(PATTERNS_FILE, 'utf8');
  // Each pattern object has the shape:
  //   { id: '...', num: N, title: '...', description: '...',
  //     tags: ['LlmX', ...], angular: ..., react: ..., vue: ... }
  const re = /\{\s*id:\s*'([^']+)',\s*num:\s*(\d+),\s*title:\s*'([^']+)',[\s\S]*?tags:\s*\[([^\]]+)\]/g;
  const out = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    const [, id, numStr, title, tagsRaw] = m;
    const tags = [
      ...tagsRaw.matchAll(/'([^']+)'/g),
    ].map((tm) => tm[1]);
    out.push({ id, num: Number(numStr), title, tags });
  }
  if (out.length !== 6) {
    throw new Error(
      `patterns.ts: expected 6 patterns, found ${out.length}. Regex assumes a stable shape.`,
    );
  }
  out.sort((a, b) => a.num - b.num);
  return out;
}

/**
 * Splits a cookbook.stories.* file into sections keyed by num (1..6).
 * Section markers look like:  `// 1. Login Form`
 *
 * The Vue stories file (and similarly-shaped React/Angular files) end with
 * a `// Storybook Meta & Stories` block that registers components per
 * exported story. That block must NOT bleed into the last pattern's
 * section, otherwise Vue's `components: { LlmInput, LlmSelect, ... }`
 * registrations get attributed to whichever pattern happened to be last.
 * Same applies to a `// Shared inline styles` block in the React file.
 */
const POST_PATTERN_HEADERS = [
  /^\/\/\s+Storybook\b/,
  /^\/\/\s+Shared\s+(inline\s+)?styles\b/i,
];

function splitStoryByNum(src) {
  const lines = src.split('\n');
  const markers = [];
  let endLine = lines.length;
  for (let i = 0; i < lines.length; i++) {
    const m = /^\/\/\s+(\d+)\.\s+(.+)$/.exec(lines[i]);
    if (m) {
      markers.push({ num: Number(m[1]), title: m[2].trim(), line: i });
      continue;
    }
    if (POST_PATTERN_HEADERS.some((re) => re.test(lines[i])) && endLine === lines.length) {
      endLine = i;
    }
  }
  const sections = new Map();
  for (let i = 0; i < markers.length; i++) {
    const { num } = markers[i];
    const start = markers[i].line;
    const end = i + 1 < markers.length ? markers[i + 1].line : endLine;
    sections.set(num, lines.slice(start, end).join('\n'));
  }
  return sections;
}

/** Scans a chunk of source for `Llm[A-Z]\w*` identifiers. */
function extractComponents(chunk) {
  const set = new Set();
  for (const m of chunk.matchAll(/\bLlm[A-Z][A-Za-z0-9]*/g)) {
    if (IGNORE_TOKENS.has(m[0])) continue;
    set.add(m[0]);
  }
  return set;
}

function checkPattern(pattern, frameworkSections) {
  const findings = [];
  const expected = new Set(pattern.tags.map(normalize));

  // Build per-framework actual sets.
  const perFw = {};
  const missingSections = [];
  for (const [framework, section] of Object.entries(frameworkSections)) {
    if (!section) {
      missingSections.push(framework);
      perFw[framework] = new Set();
      continue;
    }
    const raw = extractComponents(section);
    perFw[framework] = new Set([...raw].map(normalize));
  }

  for (const fw of missingSections) {
    findings.push({
      kind: 'MISSING_SECTION',
      severity: 'fail',
      framework: fw,
      message: `${fw} cookbook story has no section "// ${pattern.num}. *"`,
    });
  }

  const fwNames = Object.keys(perFw);
  const usedAnywhere = new Set();
  fwNames.forEach((fw) => perFw[fw].forEach((c) => usedAnywhere.add(c)));
  const usedEverywhere = new Set();
  usedAnywhere.forEach((c) => {
    if (fwNames.every((fw) => perFw[fw].has(c))) usedEverywhere.add(c);
  });

  // Tag in catalog but no framework uses it → catalog lies.
  for (const tag of expected) {
    if (!usedAnywhere.has(tag)) {
      findings.push({
        kind: 'MISSING',
        severity: 'fail',
        framework: 'all',
        message: `tags[] declares ${tag} for "${pattern.title}" but no framework story references it`,
      });
    }
  }

  // Component used by every framework but missing from tags → catalog under-reports.
  for (const used of usedEverywhere) {
    if (!expected.has(used)) {
      findings.push({
        kind: 'EXTRA',
        severity: 'fail',
        framework: 'all',
        message: `every framework story for "${pattern.title}" uses ${used} but it is not in tags[]`,
      });
    }
  }

  // Component used by some but not all frameworks → drift (warn).
  for (const used of usedAnywhere) {
    if (usedEverywhere.has(used)) continue;
    if (expected.has(used)) continue; // tagged + used by ≥1 fw — fine
    const using = fwNames.filter((fw) => perFw[fw].has(used));
    findings.push({
      kind: 'DRIFT',
      severity: 'warn',
      framework: using.join('+'),
      message: `${using.join('+')} story for "${pattern.title}" uses ${used}; other frameworks do not, and it is not in tags[]`,
    });
  }

  // Tag declared and used by ≥1 framework but not all → drift (warn) for the missing ones.
  for (const tag of expected) {
    if (!usedAnywhere.has(tag)) continue;
    if (usedEverywhere.has(tag)) continue;
    const missing = fwNames.filter((fw) => !perFw[fw].has(tag));
    findings.push({
      kind: 'DRIFT',
      severity: 'warn',
      framework: missing.join('+'),
      message: `${missing.join('+')} story for "${pattern.title}" omits ${tag} (declared in tags[] and used by other frameworks)`,
    });
  }

  return findings;
}

function main() {
  const patterns = readPatterns();
  const sections = {};
  for (const [framework, file] of Object.entries(STORY_FILES)) {
    sections[framework] = splitStoryByNum(readFileSync(file, 'utf8'));
  }

  let fails = 0;
  let warns = 0;
  for (const pattern of patterns) {
    const fwSections = {
      angular: sections.angular.get(pattern.num),
      react: sections.react.get(pattern.num),
      vue: sections.vue.get(pattern.num),
    };
    const findings = checkPattern(pattern, fwSections);
    const failsHere = findings.filter((f) => f.severity === 'fail');
    const warnsHere = findings.filter((f) => f.severity === 'warn');

    if (failsHere.length === 0 && warnsHere.length === 0) {
      console.log(`  ✓  ${pattern.num}. ${pattern.title}`);
      continue;
    }
    const sigil = failsHere.length > 0 ? '✗' : '⚠';
    console.log(`  ${sigil}  ${pattern.num}. ${pattern.title}`);
    for (const f of findings) {
      const tag = f.severity === 'fail' ? `[${f.kind}]` : `(${f.kind})`;
      console.log(`       ${tag} (${f.framework}) ${f.message}`);
    }
    fails += failsHere.length;
    warns += warnsHere.length;
  }

  console.log('');
  if (fails > 0) {
    console.error(`Cookbook parity FAILED: ${fails} hard finding(s), ${warns} drift warning(s).`);
    console.error(
      'Hard findings indicate a catalog ↔ story mismatch. Update docs/src/data/patterns.ts tags[],',
    );
    console.error(
      'fix the story imports, or extend SUBCOMPONENT_MAP in this script.',
    );
    process.exit(1);
  }
  if (warns > 0) {
    console.log(`Cookbook parity OK with ${warns} drift warning(s) (per-framework variation).`);
    return;
  }
  console.log('Cookbook parity OK (6 patterns × 3 frameworks).');
}

main();
