// Build-time projection of the knowledge layers into the package snapshot (ADR-0177 M2):
//
//   snapshot/knowledge/components.json   L1 `purpose`: when to use / not to use / related, keyed by
//                                        component name (AtlBadge, and every sub-component spec)
//   snapshot/knowledge/patterns.json     L5 `composition`: each cookbook pattern with the components
//                                        it composes, when it is the wrong choice, and its pitfalls
//   snapshot/knowledge/tokens.json       L2 `tokens`: every --ui-* token with its light and dark
//                                        value and, where annotated, intent and constraints; plus
//                                        the stylelint rules a scaffolded consumer workspace wires
//
// Sources are read from the repo at build time, never at run time, and never parsed from .ts:
//   - docs/public/.well-known/components/*.json  (ADR-0174, drift-gated by check:knowledge)
//   - docs/public/.well-known/cookbook-patterns.json (drift-gated by check:cookbook-manifest)
//   - libs/styles/src/tokens.css                 (the values)
//   - the scaffold's preset.ts and rule files    (which rules a consumer's CSS is linted against)
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);
const KNOWLEDGE_DIR = 'docs/public/.well-known/components';
const PATTERNS_JSON = 'docs/public/.well-known/cookbook-patterns.json';
const TOKENS_CSS = 'libs/styles/src/tokens.css';
const PRESET_DIR = 'libs/create-workspace/src/generators/preset';
const LIGHT_SELECTOR = ':root';
const DARK_SELECTOR = "[data-theme='dark']";
// Messages of a rule that only make sense with an exemption allowlist, which a scaffold has none of.
const NOT_FOR_CONSUMERS = new Set([
  'STALE-EXEMPT',
  'INVALID-ALLOWLISTS',
  'GAP',
]);

const squash = (text) => text.replace(/\s+/g, ' ').trim();
const componentName = (spec) => spec.replace(/(Spec|Options)$/, '');

/**
 * Declared `--ui-*` custom properties. Light is the plain `:root` block, dark the
 * `[data-theme='dark']` block (the `prefers-color-scheme` media copy repeats the same values and
 * is ignored, as are `[data-theme='light']` and reduced-motion overrides).
 * @param {string} css
 * @returns {Array<{ name: string, light?: string, dark?: string }>}
 */
export function parseTokensCss(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const byName = new Map();
  const stack = [];
  let buffer = '';
  const record = () => {
    const path = stack.join(' > ');
    const match = /^\s*(--ui-[\w-]+)\s*:([\s\S]+)$/.exec(buffer);
    buffer = '';
    if (!match || (path !== LIGHT_SELECTOR && path !== DARK_SELECTOR)) return;
    const token = byName.get(match[1]) ?? { name: match[1] };
    token[path === LIGHT_SELECTOR ? 'light' : 'dark'] = squash(match[2]);
    byName.set(match[1], token);
  };
  for (const char of source) {
    if (char === '{') {
      stack.push(squash(buffer));
      buffer = '';
    } else if (char === '}') {
      record();
      stack.pop();
    } else if (char === ';') record();
    else buffer += char;
  }
  return [...byName.values()];
}

function readComponentUnits(repoRoot) {
  const dir = join(repoRoot, KNOWLEDGE_DIR);
  if (!existsSync(dir))
    throw new Error(`Knowledge projection missing: "${dir}".`);
  return readdirSync(dir)
    .sort()
    .filter((file) => file.endsWith('.json') && file !== 'index.json')
    .map((file) => JSON.parse(readFileSync(join(dir, file), 'utf8')));
}

/** L1 data: only the `should` / `should-not` rules, the others are behaviour checks. */
function buildComponentKnowledge(units) {
  const out = {};
  for (const unit of units) {
    const rules = unit.rules ?? [];
    const entry = {
      whenToUse: rules
        .filter((rule) => rule.level === 'should')
        .map((rule) => rule.statement),
      whenNotToUse: rules
        .filter((rule) => rule.level === 'should-not')
        .map((rule) => ({
          statement: rule.statement,
          ...(rule.useInstead ? { useInstead: rule.useInstead } : {}),
        })),
      related: (unit.related ?? []).map((related) =>
        componentName(related.spec),
      ),
    };
    for (const spec of unit.specs ?? []) out[componentName(spec)] ??= entry;
  }
  return out;
}

/** L5 data: the composition guidance of each pattern; snippets, a11y notes and variations stay out. */
function buildPatternKnowledge(repoRoot) {
  const file = join(repoRoot, PATTERNS_JSON);
  if (!existsSync(file))
    throw new Error(`Cookbook projection missing: "${file}".`);
  const { patterns } = JSON.parse(readFileSync(file, 'utf8'));
  return {
    patterns: patterns.map((pattern) => ({
      id: pattern.id,
      title: pattern.title,
      description: pattern.description,
      components: pattern.components,
      whenNotToUse: pattern.whenNotToUse ?? [],
      pitfalls: pattern.pitfalls ?? [],
    })),
  };
}

function ruleSummary(source, id) {
  const header = /\/\*\*([\s\S]*?)\*\//.exec(source)?.[1] ?? '';
  const paragraphs = header
    .split('\n')
    .map((line) => line.replace(/^\s*\*? ?/, ''))
    .join('\n')
    .split(/\n\s*\n/)
    .map(squash)
    .filter(Boolean);
  const titled = paragraphs.findIndex(
    (paragraph) => paragraph === `atelier/${id}`,
  );
  const first = paragraphs[titled + 1] ?? '';
  // Whole sentences, up to two, stopping early once a sentence has made the point at length.
  let summary = '';
  for (const sentence of first.split(/(?<=[.!?])\s+(?=[A-Z])/).slice(0, 2)) {
    summary = squash(`${summary} ${sentence}`);
    if (summary.length >= 220) break;
  }
  return summary;
}

function buildRules(repoRoot) {
  const preset = readFileSync(join(repoRoot, PRESET_DIR, 'preset.ts'), 'utf8');
  const ids = [
    ...new Set(
      [...preset.matchAll(/'atelier\/([a-z-]+)':\s*(?:true|\[)/g)].map(
        (m) => m[1],
      ),
    ),
  ];
  if (ids.length === 0)
    throw new Error('No wired stylelint rule found in the scaffold preset.');
  return ids.map((id) => {
    const file = join(
      repoRoot,
      PRESET_DIR,
      'files/tools/stylelint-rules',
      `${id}.js`,
    );
    if (!existsSync(file))
      throw new Error(
        `The scaffold wires atelier/${id} but "${file}" does not exist.`,
      );
    const source = readFileSync(file, 'utf8');
    return {
      id: `atelier/${id}`,
      codes: [
        ...new Set(
          [...source.matchAll(/\[([A-Z][A-Z-]+)\]/g)].map((m) => m[1]),
        ),
      ].filter((code) => !NOT_FOR_CONSUMERS.has(code)),
      summary: ruleSummary(source, id),
    };
  });
}

/**
 * @param {{ repoRoot?: string, snapshotDir: string }} options
 * @returns {string} the knowledge directory written
 */
export function buildKnowledge({ repoRoot = REPO_ROOT, snapshotDir }) {
  const units = readComponentUnits(repoRoot);
  const annotations = new Map();
  for (const unit of units)
    for (const token of unit.tokens ?? []) annotations.set(token.name, token);
  const tokens = parseTokensCss(
    readFileSync(join(repoRoot, TOKENS_CSS), 'utf8'),
  ).map((token) => {
    const note = annotations.get(token.name);
    return {
      ...token,
      ...(note?.intent ? { intent: note.intent } : {}),
      ...(note?.constraints?.length ? { constraints: note.constraints } : {}),
    };
  });
  const dir = join(snapshotDir, 'knowledge');
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'components.json'),
    JSON.stringify(buildComponentKnowledge(units)),
  );
  writeFileSync(
    join(dir, 'patterns.json'),
    JSON.stringify(buildPatternKnowledge(repoRoot)),
  );
  writeFileSync(
    join(dir, 'tokens.json'),
    JSON.stringify({ tokens, rules: buildRules(repoRoot) }),
  );
  return dir;
}
