#!/usr/bin/env node
// Re-scores saved answers with the CURRENT checker and questions.json, without calling claude.
// Use it after a checker or question-check fix: `npm run eval:mcp:recheck -- <answers.json>`.
// The saved truth (derived from the manifest at run time) is reused, so the result differs from
// the original run only by checker/question changes. Pass `--rebuild-truth` to derive it again
// from the current manifest instead.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTruth } from './checker.mjs';
import {
  ANSWERS_SCHEMA_VERSION,
  evaluateAttempts,
  renderReport,
} from './report.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');

function main() {
  const args = process.argv.slice(2);
  const rebuild = args.includes('--rebuild-truth');
  const file = args.find((a) => !a.startsWith('--'));
  if (!file)
    throw new Error('Usage: recheck.mjs <answers.json> [--rebuild-truth]');
  const path = resolve(file);
  const saved = JSON.parse(readFileSync(path, 'utf8'));
  if (saved.schemaVersion !== ANSWERS_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported schemaVersion ${saved.schemaVersion}, expected ${ANSWERS_SCHEMA_VERSION}.`,
    );
  }
  // The question file of the run (recorded in the answers file), or MCP_EVAL_QUESTIONS to
  // re-score against another one. Questions the file no longer has are dropped with their
  // attempts, so a pruned set can be re-scored without re-running anything.
  const questionsFile =
    process.env.MCP_EVAL_QUESTIONS || saved.questionsFile || 'questions.json';
  const current = JSON.parse(
    readFileSync(resolve(HERE, questionsFile), 'utf8'),
  ).questions;
  const byId = new Map(current.map((q) => [q.id, q]));
  const dropped = saved.questions.filter((q) => !byId.has(q.id));
  if (dropped.length)
    console.error(
      `note: ${questionsFile} no longer has ${dropped.map((q) => q.id).join(', ')}; dropped from this report.`,
    );
  const questions = saved.questions
    .filter((q) => byId.has(q.id))
    .map((q) => byId.get(q.id));
  const keep = new Set(questions.map((q) => q.id));
  saved.attempts = saved.attempts.filter((a) => keep.has(a.questionId));
  const needsRebuild = !rebuild && !saved.truth?.exports;
  if (needsRebuild) {
    console.error(
      'note: this answers file predates the exports list in the truth; rebuilding the truth from the current repo and manifest.',
    );
  }
  const truth =
    rebuild || needsRebuild
      ? buildTruth({
          manifestDir: resolve(
            REPO_ROOT,
            process.env.MCP_EVAL_MANIFEST || 'dist/storybook/angular',
          ),
          repoRoot: REPO_ROOT,
        })
      : saved.truth;

  const evaluated = evaluateAttempts(saved.attempts, questions, truth);
  const report = renderReport({
    meta: {
      createdAt: new Date().toISOString(),
      recheckOf: path,
      model: saved.model,
      repeats: saved.repeats,
      filters: saved.filters,
      questionsFile,
      answersFile: path,
    },
    attempts: evaluated,
    questions,
    variants: saved.variants,
  });
  const dir = dirname(path);
  mkdirSync(dir, { recursive: true });
  const out = join(
    dir,
    `${basename(path).replace(/\.answers\.json$/, '')}-recheck-${Date.now()}.md`,
  );
  writeFileSync(out, report);
  console.log(report);
  console.error(`report: ${out}`);
}

try {
  main();
} catch (error) {
  console.error(`recheck failed: ${error.message}`);
  process.exit(1);
}
