#!/usr/bin/env node
/**
 * Validate the structure of a Claude Code skill's test fixtures.
 *
 * Usage:
 *   node tools/scripts/test-skill.mjs <skill-name>
 *
 * For each tests/<scenario>/ directory under skills/<skill-name>/, checks:
 *   - input.md and expected.md both exist
 *   - both files have YAML frontmatter
 *   - input.md frontmatter has a `scenario` field that matches the directory name
 *   - expected.md frontmatter has `mode`, `references`, `first-tool`, `out-of-scope`
 *   - mode value is one of the four supported modes plus Out-of-scope
 *   - every references/*.md path listed in expected.md frontmatter resolves
 *     against the skill's references/ directory
 *
 * The fixtures themselves are graded manually or by an LLM judge — this
 * runner only catches structural drift (typo'd reference names, missing
 * fields, dangling references after a reference rename).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const skillName = process.argv[2];

if (!skillName) {
  console.error('usage: test-skill.mjs <skill-name>');
  process.exit(2);
}

const skillDir = resolve(ROOT, 'skills', skillName);
const testsDir = join(skillDir, 'tests');
const referencesDir = join(skillDir, 'references');

if (!existsSync(testsDir)) {
  console.log(`✓ ${skillName}: no tests/ directory — skipping`);
  process.exit(0);
}

const VALID_MODES = new Set(['Build', 'Audit', 'Decide', 'Migrate', 'Out-of-scope']);

const errors = [];
let scenarioCount = 0;

function parseFrontmatter(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;

  const block = m[1];
  const fields = {};
  let currentKey = null;
  let currentList = null;

  for (const line of block.split(/\r?\n/)) {
    if (!line.trim()) continue;

    const listItem = line.match(/^\s+-\s+(.+)$/);
    if (listItem && currentList) {
      currentList.push(listItem[1].trim());
      continue;
    }

    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const value = kv[2].trim();
      if (value === '') {
        currentList = [];
        fields[currentKey] = currentList;
      } else if (value === '[]') {
        fields[currentKey] = [];
        currentList = null;
      } else {
        fields[currentKey] = value;
        currentList = null;
      }
    }
  }
  return fields;
}

const scenarios = readdirSync(testsDir)
  .filter((name) => statSync(join(testsDir, name)).isDirectory());

for (const scenario of scenarios) {
  scenarioCount++;
  const scenarioDir = join(testsDir, scenario);
  const inputPath = join(scenarioDir, 'input.md');
  const expectedPath = join(scenarioDir, 'expected.md');

  if (!existsSync(inputPath)) {
    errors.push(`tests/${scenario}/input.md is missing`);
    continue;
  }
  if (!existsSync(expectedPath)) {
    errors.push(`tests/${scenario}/expected.md is missing`);
    continue;
  }

  const inputFm = parseFrontmatter(inputPath);
  const expectedFm = parseFrontmatter(expectedPath);

  if (!inputFm) {
    errors.push(`tests/${scenario}/input.md is missing YAML frontmatter`);
    continue;
  }
  if (!expectedFm) {
    errors.push(`tests/${scenario}/expected.md is missing YAML frontmatter`);
    continue;
  }

  if (inputFm.scenario !== scenario) {
    errors.push(
      `tests/${scenario}/input.md frontmatter scenario "${inputFm.scenario}" does not match directory "${scenario}"`,
    );
  }

  for (const required of ['mode', 'references', 'first-tool', 'out-of-scope']) {
    if (expectedFm[required] === undefined) {
      errors.push(`tests/${scenario}/expected.md is missing frontmatter field "${required}"`);
    }
  }

  if (expectedFm.mode && !VALID_MODES.has(expectedFm.mode)) {
    errors.push(
      `tests/${scenario}/expected.md mode "${expectedFm.mode}" is not one of: ${[...VALID_MODES].join(', ')}`,
    );
  }

  const refs = Array.isArray(expectedFm.references) ? expectedFm.references : [];
  for (const ref of refs) {
    const refPath = join(referencesDir, ref);
    if (!existsSync(refPath)) {
      errors.push(
        `tests/${scenario}/expected.md references "${ref}" but skills/${skillName}/references/${ref} does not exist`,
      );
    }
  }
}

if (errors.length) {
  console.error(`✗ ${skillName} tests:`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ ${skillName} tests: ${scenarioCount} scenario(s) well-formed`);
