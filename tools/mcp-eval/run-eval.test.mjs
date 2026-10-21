import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildTruth } from './checker.mjs';
import {
  analyzeStream,
  buildClaudeArgs,
  loadServer,
  pool,
  SYSTEM_PROMPT,
  readConfig,
  verifyIsolation,
} from './run-eval.mjs';
import { evaluateAttempts, renderReport, summarize } from './report.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const manifestDir = join(repoRoot, 'dist/storybook/angular');
const questions = JSON.parse(
  readFileSync(join(here, 'questions.json'), 'utf8'),
).questions;

const cleanInit = (extra = {}) => ({
  tools: [],
  mcp_servers: [],
  skills: [],
  slash_commands: [],
  plugins: [
    { name: 'cc-plugin-telemetry', source: 'cc-plugin-telemetry@builtin' },
  ],
  ...extra,
});

describe('verifyIsolation', () => {
  it('accepts a clean run without servers and a clean run with one', () => {
    assert.deepEqual(verifyIsolation(cleanInit(), { servers: [] }), []);
    assert.deepEqual(
      verifyIsolation(
        cleanInit({
          tools: ['mcp__atelier__docs-list'],
          mcp_servers: [{ name: 'atelier', status: 'connected' }],
        }),
        { servers: ['atelier'] },
      ),
      [],
    );
  });

  it('rejects any tool, server, skill, command or user plugin that should not be there', () => {
    const bad = cleanInit({
      tools: ['Bash', 'mcp__other__x'],
      mcp_servers: [{ name: 'other', status: 'connected' }],
      skills: ['s'],
      slash_commands: ['c'],
      plugins: [{ name: 'caveman', source: 'caveman@caveman' }],
    });
    const v = verifyIsolation(bad, { servers: [] }).join('\n');
    for (const needle of [
      'mcp servers',
      'unexpected tools: Bash, mcp__other__x',
      '1 skills',
      '1 slash commands',
      'caveman',
    ]) {
      assert.match(v, new RegExp(needle));
    }
  });

  it('rejects a server that is not connected and a missing init event', () => {
    assert.match(
      verifyIsolation(
        cleanInit({ mcp_servers: [{ name: 'atelier', status: 'failed' }] }),
        { servers: ['atelier'] },
      ).join(),
      /mcp servers/,
    );
    assert.deepEqual(verifyIsolation(null, { servers: [] }), [
      'no system/init event in the output',
    ]);
  });
});

describe('buildClaudeArgs', () => {
  const args = buildClaudeArgs({
    model: 'sonnet',
    mcpConfigPath: '/x.json',
    servers: ['atelier'],
  });
  it('carries the isolation flags', () => {
    const at = (flag) => args[args.indexOf(flag) + 1];
    assert.equal(at('--setting-sources'), '');
    assert.ok(args.includes('--strict-mcp-config'));
    assert.ok(args.includes('--disable-slash-commands'));
    assert.equal(at('--tools'), '');
    assert.equal(at('--allowedTools'), 'mcp__atelier');
    assert.ok(args.includes('--no-session-persistence'));
    assert.equal(at('--system-prompt'), SYSTEM_PROMPT);
  });
  it('allows no tools for the variant without a server', () => {
    assert.ok(
      !buildClaudeArgs({
        model: 'sonnet',
        mcpConfigPath: '/x.json',
        servers: [],
      }).includes('--allowedTools'),
    );
  });
});

describe('analyzeStream', () => {
  it('collects tool calls, tool errors, answer, tokens and cost', () => {
    const r = analyzeStream([
      { type: 'system', subtype: 'init', tools: [] },
      {
        type: 'assistant',
        message: {
          content: [{ type: 'tool_use', name: 'mcp__a__docs-list', input: {} }],
        },
      },
      {
        type: 'user',
        message: {
          content: [
            {
              type: 'tool_result',
              is_error: true,
              content: [{ text: 'boom' }],
            },
          ],
        },
      },
      {
        type: 'result',
        subtype: 'success',
        result: 'the answer',
        total_cost_usd: 0.5,
        usage: {
          input_tokens: 1,
          cache_creation_input_tokens: 2,
          cache_read_input_tokens: 3,
          output_tokens: 4,
        },
        duration_ms: 10,
      },
    ]);
    assert.equal(r.text, 'the answer');
    assert.deepEqual(r.toolCalls, [{ name: 'mcp__a__docs-list', input: {} }]);
    assert.deepEqual(r.toolErrors, [{ text: 'boom' }]);
    assert.deepEqual(r.tokens, { input: 6, output: 4 });
    assert.equal(r.costUsd, 0.5);
    assert.equal(r.isError, false);
  });
  it('marks an error result', () => {
    assert.equal(
      analyzeStream([
        {
          type: 'result',
          subtype: 'error_max_turns',
          is_error: true,
          result: '',
        },
      ]).isError,
      true,
    );
  });
});

describe('config, servers and pool', () => {
  it('reads defaults and rejects bad values', () => {
    const c = readConfig({});
    assert.deepEqual(
      [c.repeats, c.concurrency, c.timeoutMs, c.model],
      [3, 4, 240000, 'sonnet'],
    );
    assert.deepEqual(c.variants, ['without', 'with:hosted-angular']);
    assert.throws(
      () => readConfig({ MCP_EVAL_REPEATS: '0' }),
      /positive integer/,
    );
    assert.throws(() => readConfig({ MCP_EVAL_VARIANTS: 'with' }), /must be/);
  });
  it('ships the hosted Angular server config', () => {
    assert.deepEqual(loadServer('with:hosted-angular').servers, ['atelier']);
    assert.throws(() => loadServer('with:nope'), /does not exist/);
  });
  it('never runs more tasks at once than the limit', async () => {
    let live = 0;
    let peak = 0;
    const task = () => async () => {
      peak = Math.max(peak, ++live);
      await new Promise((r) => setTimeout(r, 5));
      live--;
    };
    await pool(Array.from({ length: 10 }, task), 3);
    assert.equal(peak, 3);
  });
});

describe('questions.json', () => {
  it('has 10 to 14 uniquely named questions with a source and valid checks', () => {
    assert.ok(questions.length >= 10 && questions.length <= 14);
    assert.equal(new Set(questions.map((q) => q.id)).size, questions.length);
    for (const q of questions) {
      assert.ok(q.prompt && q.source, q.id);
      assert.ok(q.checks?.length, q.id);
      for (const id of q.checks)
        assert.ok(
          [
            'api',
            'selectors',
            'forbid',
            'claims',
            'tokens',
            'raw-color',
          ].includes(id),
          `${q.id}: ${id}`,
        );
      if (q.checks.includes('selectors'))
        assert.ok(q.expectSelectors?.length, q.id);
      if (q.checks.includes('forbid'))
        assert.ok(q.forbidSelectors?.length, q.id);
      if (q.checks.includes('claims')) assert.ok(q.claims?.length, q.id);
    }
  });

  it(
    'only expects things that exist in the library (needs the built manifest)',
    { skip: !existsSync(join(manifestDir, 'manifests/components.json')) },
    () => {
      const truth = buildTruth({ manifestDir, repoRoot });
      const known = new Set([
        ...Object.keys(truth.elements),
        ...Object.keys(truth.attributes),
        ...truth.knownTags,
        ...truth.knownAttributes,
      ]);
      for (const q of questions) {
        for (const sel of [
          ...(q.expectSelectors ?? []).flat(),
          ...(q.forbidSelectors ?? []),
        ]) {
          assert.ok(
            known.has(sel),
            `${q.id}: "${sel}" is not a selector of the library`,
          );
        }
        for (const kw of (q.claims ?? [])
          .flat()
          .filter((k) => k.startsWith('--'))) {
          assert.ok(truth.tokens.includes(kw), `${q.id}: ${kw} is not a token`);
        }
      }
    },
  );
});

describe('report', () => {
  const truth = {
    elements: {},
    attributes: {},
    knownTags: [],
    knownAttributes: [],
    tokens: [],
  };
  const qs = [{ id: 'q1', checks: ['claims'], claims: [['alpha']] }];
  const attempt = (variant, repeat, text, extra = {}) => ({
    questionId: 'q1',
    variant,
    repeat,
    infraError: null,
    text,
    toolCalls: [],
    toolErrors: [],
    tokens: { input: 10, output: 5 },
    costUsd: 0.01,
    durationMs: 100,
    ...extra,
  });

  it('computes per-run scores, spread and the gap verdict', () => {
    const attempts = evaluateAttempts(
      [
        attempt('without', 0, 'nope'),
        attempt('without', 1, 'alpha'),
        attempt('with:x', 0, 'alpha'),
        attempt('with:x', 1, 'alpha'),
      ],
      qs,
      truth,
    );
    const s = summarize(attempts, qs, ['without', 'with:x']);
    assert.deepEqual(s.perVariant.without.runScores, [0, 1]);
    assert.equal(s.perVariant.without.meanScore, 0.5);
    assert.equal(s.perVariant['with:x'].minScore, 1);
    assert.deepEqual(
      [s.verdicts[0].gap, s.verdicts[0].spread, s.verdicts[0].exceedsSpread],
      [0.5, 1, false],
    );
  });

  it('excludes infrastructure failures from scores and lists them', () => {
    const attempts = evaluateAttempts(
      [attempt('without', 0, '', { infraError: 'timeout' })],
      qs,
      truth,
    );
    const s = summarize(attempts, qs, ['without']);
    assert.equal(s.perVariant.without.infraFailures, 1);
    assert.equal(s.perVariant.without.meanScore, null);
    const md = renderReport({
      meta: { createdAt: 'now' },
      attempts,
      questions: qs,
      variants: ['without'],
    });
    assert.match(md, /Infrastructure problems/);
    assert.match(md, /timeout/);
  });

  it('names the failed check in the report', () => {
    const attempts = evaluateAttempts(
      [attempt('without', 0, 'nope')],
      qs,
      truth,
    );
    const md = renderReport({
      meta: { createdAt: 'now' },
      attempts,
      questions: qs,
      variants: ['without'],
    });
    assert.match(md, /missing: \[alpha\]/);
  });
});
