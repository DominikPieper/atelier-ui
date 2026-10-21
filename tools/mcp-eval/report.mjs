// Scoring, statistics and the markdown report for the MCP eval. Pure functions of saved attempts,
// so `recheck.mjs` can rebuild the same report from an answers file without calling claude.

import { evaluateAnswer } from './checker.mjs';

export const ANSWERS_SCHEMA_VERSION = 1;

/**
 * @typedef {object} Attempt
 * @property {string} questionId
 * @property {string} variant        'without' or 'with:<server config name>'
 * @property {number} repeat         0-based index of the repeat
 * @property {string|null} infraError  set when the claude process, isolation or the run itself failed
 * @property {string} text           the answer
 * @property {{name: string, input: unknown}[]} toolCalls
 * @property {{ text: string }[]} toolErrors
 * @property {{ input: number, output: number }|null} tokens
 * @property {number|null} costUsd
 * @property {number|null} durationMs
 * @property {object|null} isolation  what the init event of the run reported
 */

/** Attaches `evaluation` to every attempt that produced an answer. Questions are looked up by id. */
export function evaluateAttempts(attempts, questions, truth) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  return attempts.map((attempt) => {
    const question = byId.get(attempt.questionId);
    if (!question || attempt.infraError)
      return { ...attempt, evaluation: null };
    return {
      ...attempt,
      evaluation: evaluateAnswer(question, attempt.text ?? '', truth),
    };
  });
}

const mean = (xs) =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const fmt = (x, digits = 2) =>
  x === null || x === undefined ? 'n/a' : x.toFixed(digits);
const pct = (x) => (x === null ? 'n/a' : `${Math.round(x * 100)}%`);

/**
 * @param {(Attempt & { evaluation: ReturnType<typeof evaluateAnswer>|null })[]} attempts
 * @param {{id: string}[]} questions
 * @param {string[]} variants
 */
export function summarize(attempts, questions, variants) {
  const perVariant = {};
  for (const variant of variants) {
    const mine = attempts.filter((a) => a.variant === variant);
    const scored = mine.filter((a) => a.evaluation);
    const repeats = [...new Set(mine.map((a) => a.repeat))].sort(
      (a, b) => a - b,
    );
    // One "run" = repeat number r answered across all questions. Its score is the mean of the
    // per-answer scores; min/max across runs is the run-to-run spread.
    const runScores = repeats
      .map((r) =>
        mean(
          scored.filter((a) => a.repeat === r).map((a) => a.evaluation.score),
        ),
      )
      .filter((x) => x !== null);
    perVariant[variant] = {
      attempts: mine.length,
      infraFailures: mine.filter((a) => a.infraError).length,
      toolErrors: mine.reduce((n, a) => n + (a.toolErrors?.length ?? 0), 0),
      runScores,
      meanScore: mean(runScores),
      minScore: runScores.length ? Math.min(...runScores) : null,
      maxScore: runScores.length ? Math.max(...runScores) : null,
      meanToolCalls: mean(scored.map((a) => a.toolCalls?.length ?? 0)),
      meanInputTokens: mean(
        scored.filter((a) => a.tokens).map((a) => a.tokens.input),
      ),
      meanOutputTokens: mean(
        scored.filter((a) => a.tokens).map((a) => a.tokens.output),
      ),
      totalCostUsd: scored.reduce((n, a) => n + (a.costUsd ?? 0), 0),
      meanDurationMs: mean(
        scored.filter((a) => a.durationMs).map((a) => a.durationMs),
      ),
    };
  }

  const perQuestion = questions.map((question) => {
    const cells = {};
    for (const variant of variants) {
      const scored = attempts.filter(
        (a) =>
          a.questionId === question.id && a.variant === variant && a.evaluation,
      );
      const checks = {};
      for (const attempt of scored) {
        for (const check of attempt.evaluation.checks) {
          checks[check.id] ??= { passed: 0, total: 0, failures: [] };
          checks[check.id].total++;
          if (check.pass) checks[check.id].passed++;
          else
            checks[check.id].failures.push({
              repeat: attempt.repeat,
              detail: check.detail,
            });
        }
      }
      cells[variant] = {
        n: scored.length,
        meanScore: mean(scored.map((a) => a.evaluation.score)),
        checks,
        meanToolCalls: mean(scored.map((a) => a.toolCalls?.length ?? 0)),
      };
    }
    return { id: question.id, category: question.category ?? '', cells };
  });

  // The M0 criterion: the with/without gap must exceed the run-to-run spread.
  const baseline = perVariant.without;
  const verdicts = variants
    .filter((v) => v !== 'without')
    .map((variant) => {
      const v = perVariant[variant];
      if (!baseline || baseline.meanScore === null || v.meanScore === null) {
        return { variant, gap: null, spread: null, exceedsSpread: null };
      }
      const spread = Math.max(
        (baseline.maxScore ?? 0) - (baseline.minScore ?? 0),
        (v.maxScore ?? 0) - (v.minScore ?? 0),
      );
      const gap = v.meanScore - baseline.meanScore;
      return {
        variant,
        gap,
        spread,
        exceedsSpread: gap > spread,
        runs: Math.min(baseline.runScores.length, v.runScores.length),
      };
    });

  return { perVariant, perQuestion, verdicts };
}

const clip = (text, max = 300) => {
  const flat = String(text ?? '')
    .replace(/\s+/g, ' ')
    .trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

export function renderReport({ meta, attempts, questions, variants }) {
  const s = summarize(attempts, questions, variants);
  const lines = [];
  lines.push('# Atelier MCP eval report', '');
  lines.push(`- Date: ${meta.createdAt}`);
  if (meta.recheckOf)
    lines.push(`- Re-checked from: \`${meta.recheckOf}\` (no claude calls)`);
  lines.push(`- Model: ${meta.model ?? 'n/a'}`);
  lines.push(`- Variants: ${variants.map((v) => `\`${v}\``).join(', ')}`);
  lines.push(
    `- Questions: ${questions.length}, repeats per question and variant: ${meta.repeats ?? 'n/a'}`,
  );
  if (meta.filters) lines.push(`- Filters: ${meta.filters}`);
  if (meta.answersFile) lines.push(`- Raw answers: \`${meta.answersFile}\``);
  lines.push(
    '- Cost: `total_cost_usd` is the API-price equivalent. The owner runs on a subscription, so this is quota-equivalent, not billed.',
    '- Score of an answer = share of its deterministic checks that passed. No LLM judge.',
    '',
  );

  lines.push('## Per variant', '');
  lines.push(
    '| Variant | Answers | Infra failures | Mean score per run | Min | Max | Tool calls / answer | Input tok / answer | Output tok / answer | Cost (USD, quota-equiv.) |',
    '|---|---|---|---|---|---|---|---|---|---|',
  );
  for (const variant of variants) {
    const v = s.perVariant[variant];
    lines.push(
      `| \`${variant}\` | ${v.attempts - v.infraFailures}/${v.attempts} | ${v.infraFailures} | ${pct(v.meanScore)} | ${pct(v.minScore)} | ${pct(v.maxScore)} | ${fmt(v.meanToolCalls, 1)} | ${fmt(v.meanInputTokens, 0)} | ${fmt(v.meanOutputTokens, 0)} | ${fmt(v.totalCostUsd, 4)} |`,
    );
  }
  lines.push('');
  lines.push('Run scores (one per repeat, mean over questions):', '');
  for (const variant of variants) {
    lines.push(
      `- \`${variant}\`: ${s.perVariant[variant].runScores.map(pct).join(', ') || 'none'}`,
    );
  }
  lines.push('');

  if (s.verdicts.length) {
    lines.push('## Gap against spread', '');
    for (const v of s.verdicts) {
      if (v.gap === null) {
        lines.push(`- \`${v.variant}\` vs \`without\`: not enough data.`);
        continue;
      }
      lines.push(
        `- \`${v.variant}\` vs \`without\`: gap ${(v.gap * 100).toFixed(1)} points, run-to-run spread ${(v.spread * 100).toFixed(1)} points over ${v.runs} run(s) -> ${v.exceedsSpread ? 'gap exceeds spread' : 'gap does NOT exceed spread'}${v.runs < 2 ? ' (a single run has no measurable spread; use at least 3 repeats)' : ''}.`,
      );
    }
    lines.push('');
  }

  lines.push('## Per question', '');
  lines.push(
    `| Question | ${variants.map((v) => `\`${v}\``).join(' | ')} |`,
    `|---|${variants.map(() => '---').join('|')}|`,
  );
  for (const q of s.perQuestion) {
    const cells = variants.map((variant) => {
      const c = q.cells[variant];
      if (!c.n) return 'no answers';
      const checks = Object.entries(c.checks)
        .map(([id, r]) => `${id} ${r.passed}/${r.total}`)
        .join(', ');
      return `${pct(c.meanScore)} (${checks}); ${fmt(c.meanToolCalls, 1)} tool calls`;
    });
    lines.push(`| ${q.id} | ${cells.join(' | ')} |`);
  }
  lines.push('');

  lines.push('## Failed checks', '');
  let any = false;
  for (const q of s.perQuestion) {
    for (const variant of variants) {
      for (const [id, r] of Object.entries(q.cells[variant].checks)) {
        if (!r.failures.length) continue;
        any = true;
        lines.push(
          `- **${q.id}** / \`${variant}\` / ${id} (${r.passed}/${r.total}):`,
        );
        for (const f of r.failures)
          lines.push(
            `  - repeat ${f.repeat + 1}: ${clip(f.detail, 400) || '(no detail)'}`,
          );
      }
    }
  }
  if (!any) lines.push('None.');
  lines.push('');

  const infra = attempts.filter((a) => a.infraError || a.toolErrors?.length);
  if (infra.length) {
    lines.push(
      '## Infrastructure problems (these make the exit code non-zero)',
      '',
    );
    for (const a of infra) {
      lines.push(
        `- ${a.questionId} / \`${a.variant}\` / repeat ${a.repeat + 1}: ${a.infraError ?? ''}${a.toolErrors?.length ? ` tool errors: ${a.toolErrors.map((e) => clip(e.text, 160)).join(' | ')}` : ''}`,
      );
    }
    lines.push('');
  }

  lines.push('## Tool calls', '');
  for (const variant of variants) {
    const names = {};
    for (const a of attempts.filter((x) => x.variant === variant)) {
      for (const call of a.toolCalls ?? [])
        names[call.name] = (names[call.name] ?? 0) + 1;
    }
    lines.push(
      `- \`${variant}\`: ${
        Object.entries(names)
          .map(([n, c]) => `${n} x${c}`)
          .join(', ') || 'none'
      }`,
    );
  }
  lines.push('');
  return lines.join('\n');
}
