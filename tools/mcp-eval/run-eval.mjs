#!/usr/bin/env node
// Live MCP eval: answers every question in questions.json with `claude -p`, once per variant and
// repeat, scores the answers with the deterministic checker and writes a markdown report plus the
// raw answers (see ../../tasks/todo.md "Atelier MCP package", step M0).
//
// Variants: `without` (no MCP server) and `with:<name>`, where <name> selects
// servers/<name>.json, an MCP config as `claude --mcp-config` takes it. The server under test is
// therefore a parameter: add a file, name it in MCP_EVAL_VARIANTS.
//
// NOT a gate. A run costs subscription quota and is not deterministic. The exit code is non-zero
// only for infrastructure failures (claude process error, timeout, failed isolation, MCP tool
// error), never for bad answer quality, which lives in the report.
//
// Environment:
//   MCP_EVAL_REPEATS       repeats per question and variant (default 3)
//   MCP_EVAL_CONCURRENCY   parallel claude processes (default 4)
//   MCP_EVAL_VARIANTS      comma list (default `without,with:hosted-angular`)
//   MCP_EVAL_ONLY_ID       comma list of question ids to run
//   MCP_EVAL_QUESTIONS     question file next to this script (default questions.json)
//   MCP_EVAL_MODEL         model alias or id passed to claude (default `sonnet`)
//   MCP_EVAL_MANIFEST      built Angular Storybook (default dist/storybook/angular)
//   MCP_EVAL_REPORT_DIR    where report and answers go (default tools/mcp-eval/reports)
//   MCP_EVAL_CLAUDE_BIN    claude executable (default `claude`)
//   MCP_EVAL_TIMEOUT_MS    per call (default 240000)

import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildTruth } from './checker.mjs';
import {
  ANSWERS_SCHEMA_VERSION,
  evaluateAttempts,
  renderReport,
} from './report.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, '..', '..');

// File, shell and web tools are off in BOTH variants (and `--tools ""` removes every built-in
// tool); the question must be answered from the model's knowledge or from the MCP server alone.
const DISALLOWED_TOOLS = [
  'Bash',
  'Read',
  'Edit',
  'Write',
  'Glob',
  'Grep',
  'WebFetch',
  'WebSearch',
  'NotebookEdit',
  'Task',
  'Agent',
  'Skill',
  'ToolSearch',
];

const log = (message) => console.error(message);

export function readConfig(env = process.env) {
  const int = (name, fallback) => {
    const raw = env[name];
    if (raw === undefined || raw === '') return fallback;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 1)
      throw new Error(`${name} must be a positive integer, was "${raw}".`);
    return value;
  };
  const list = (name, fallback) =>
    (env[name] ?? '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)
      .concat(env[name] ? [] : fallback);
  const variants = list('MCP_EVAL_VARIANTS', [
    'without',
    'with:hosted-angular',
  ]);
  for (const variant of variants) {
    if (variant !== 'without' && !/^with:[\w.-]+$/.test(variant)) {
      throw new Error(
        `Variant "${variant}" must be "without" or "with:<server config name>".`,
      );
    }
  }
  return {
    repeats: int('MCP_EVAL_REPEATS', 3),
    concurrency: int('MCP_EVAL_CONCURRENCY', 4),
    timeoutMs: int('MCP_EVAL_TIMEOUT_MS', 240_000),
    variants,
    onlyIds: list('MCP_EVAL_ONLY_ID', []),
    questionsFile: env.MCP_EVAL_QUESTIONS || 'questions.json',
    questionsPath: resolve(HERE, env.MCP_EVAL_QUESTIONS || 'questions.json'),
    model: env.MCP_EVAL_MODEL || 'sonnet',
    manifestDir: resolve(
      REPO_ROOT,
      env.MCP_EVAL_MANIFEST || 'dist/storybook/angular',
    ),
    reportDir: resolve(
      REPO_ROOT,
      env.MCP_EVAL_REPORT_DIR || 'tools/mcp-eval/reports',
    ),
    claudeBin: env.MCP_EVAL_CLAUDE_BIN || 'claude',
  };
}

/** Replaces the `${REPO_ROOT}` placeholder in every string value of a parsed server config. */
export function substituteRepoRoot(value, repoRoot = REPO_ROOT) {
  if (typeof value === 'string')
    return value.replaceAll('${REPO_ROOT}', repoRoot);
  if (Array.isArray(value))
    return value.map((v) => substituteRepoRoot(v, repoRoot));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        substituteRepoRoot(v, repoRoot),
      ]),
    );
  return value;
}

/**
 * Reads servers/<name>.json and returns the path to use and the server names it declares. With
 * `scratchDir` the config is written there with `${REPO_ROOT}` resolved (the shipped file is never
 * rewritten); without it the shipped path is returned, which is enough to fail early.
 * Extra server env or a different layer set is a separate servers/<name>.json, selected as
 * `with:<name>`: no new variant syntax (a comma list would clash with MCP_EVAL_VARIANTS), and
 * each ablation config stays a reviewable file.
 */
export function loadServer(variant, scratchDir = null) {
  const name = variant.slice('with:'.length);
  const path = join(HERE, 'servers', `${name}.json`);
  if (!existsSync(path))
    throw new Error(
      `No MCP config for variant "${variant}": ${path} does not exist.`,
    );
  const config = JSON.parse(readFileSync(path, 'utf8'));
  const servers = Object.keys(config.mcpServers ?? {});
  if (servers.length === 0) throw new Error(`${path} declares no mcpServers.`);
  if (!scratchDir) return { path, servers };
  const resolved = join(scratchDir, `${name}.json`);
  writeFileSync(resolved, JSON.stringify(substituteRepoRoot(config), null, 2));
  return { path: resolved, servers };
}

/**
 * Arguments that isolate one call. Why each flag is there is verified live, see
 * docs in tasks/todo.md; `verifyIsolation` re-checks the result on every single run.
 *  --setting-sources ""   no user, project or local settings: no user hooks (SessionStart etc.),
 *                         no user plugins, skills or MCP servers, no ~/.claude/CLAUDE.md
 *  --strict-mcp-config    only the servers in the --mcp-config below
 *  --disable-slash-commands  no skills or commands
 *  --tools ""             no built-in tools (file, shell, web)
 *  --no-session-persistence  nothing written to the user's session history
 *  --system-prompt        replaces the default prompt, see SYSTEM_PROMPT
 * The prompt goes in through stdin: the options above are variadic and would swallow a
 * positional prompt.
 */
// Replaces Claude Code's default system prompt, which tells the model to explore files with tools
// that are disabled here (in a probe the model then wrote fake Glob/Grep calls as its "answer").
// The same text for every variant, so it cannot favour one.
export const SYSTEM_PROMPT =
  'You are an assistant that answers questions from Angular developers. You have no file, shell or web access. Answer in a single message, from your own knowledge and from the tools you have been given, if any. Always answer in English.';

export function buildClaudeArgs({ model, mcpConfigPath, servers }) {
  const args = [
    '-p',
    '--output-format',
    'stream-json',
    '--verbose',
    '--model',
    model,
    '--setting-sources',
    '',
    '--strict-mcp-config',
    '--mcp-config',
    mcpConfigPath,
    '--disable-slash-commands',
    '--tools',
    '',
    '--disallowedTools',
    DISALLOWED_TOOLS.join(','),
    '--no-session-persistence',
    '--system-prompt',
    SYSTEM_PROMPT,
  ];
  if (servers.length)
    args.push('--allowedTools', servers.map((s) => `mcp__${s}`).join(','));
  return args;
}

/**
 * Compares what the init event of a run says it loaded against what the variant allows.
 * @returns {string[]} violations, empty when the run was isolated
 */
export function verifyIsolation(init, { servers }) {
  if (!init) return ['no system/init event in the output'];
  const violations = [];
  const tools = init.tools ?? [];
  const connected = (init.mcp_servers ?? [])
    .map((s) => `${s.name}:${s.status}`)
    .sort();
  const expectedServers = servers.map((s) => `${s}:connected`).sort();
  if (JSON.stringify(connected) !== JSON.stringify(expectedServers)) {
    violations.push(
      `mcp servers were [${connected.join(', ')}], expected [${expectedServers.join(', ')}]`,
    );
  }
  const allowedPrefixes = servers.map((s) => `mcp__${s}__`);
  const strays = tools.filter(
    (t) => !allowedPrefixes.some((p) => t.startsWith(p)),
  );
  if (strays.length) violations.push(`unexpected tools: ${strays.join(', ')}`);
  if (servers.length && tools.length === 0)
    violations.push('the MCP server exposes no tools');
  if ((init.skills ?? []).length)
    violations.push(`${init.skills.length} skills loaded`);
  if ((init.slash_commands ?? []).length)
    violations.push(`${init.slash_commands.length} slash commands loaded`);
  const userPlugins = (init.plugins ?? []).filter(
    (p) => !String(p.source).endsWith('@builtin'),
  );
  if (userPlugins.length)
    violations.push(
      `user plugins loaded: ${userPlugins.map((p) => p.name).join(', ')}`,
    );
  return violations;
}

/** Reads the stream-json lines of one run. */
export function analyzeStream(lines) {
  const out = {
    init: null,
    toolCalls: [],
    toolErrors: [],
    text: null,
    isError: false,
    errorDetail: null,
    costUsd: null,
    tokens: null,
    durationMs: null,
  };
  for (const line of lines) {
    if (line.type === 'system' && line.subtype === 'init') out.init = line;
    if (line.type === 'assistant') {
      for (const block of line.message?.content ?? []) {
        if (block.type === 'tool_use')
          out.toolCalls.push({ name: block.name, input: block.input });
      }
    }
    if (line.type === 'user') {
      for (const block of line.message?.content ?? []) {
        if (block.type === 'tool_result' && block.is_error) {
          const text = Array.isArray(block.content)
            ? block.content.map((c) => c?.text ?? '').join(' ')
            : String(block.content ?? '');
          out.toolErrors.push({ text });
        }
      }
    }
    if (line.type === 'result') {
      out.text = line.result ?? '';
      out.isError =
        Boolean(line.is_error) || (line.subtype && line.subtype !== 'success');
      if (out.isError)
        out.errorDetail =
          `result ${line.subtype ?? ''} ${String(line.result ?? '').slice(0, 200)}`.trim();
      out.costUsd =
        typeof line.total_cost_usd === 'number' ? line.total_cost_usd : null;
      const u = line.usage;
      if (u) {
        out.tokens = {
          input:
            (u.input_tokens ?? 0) +
            (u.cache_creation_input_tokens ?? 0) +
            (u.cache_read_input_tokens ?? 0),
          output: u.output_tokens ?? 0,
        };
      }
      out.durationMs = line.duration_ms ?? null;
    }
  }
  return out;
}

/** One claude call in a fresh, empty directory outside the repo. */
function runClaude({ config, prompt, mcpConfigPath, servers }) {
  return new Promise((resolvePromise) => {
    const cwd = mkdtempSync(join(tmpdir(), 'atelier-mcp-eval-'));
    const done = (result) => {
      rmSync(cwd, { recursive: true, force: true });
      resolvePromise(result);
    };
    let child;
    try {
      child = spawn(
        config.claudeBin,
        buildClaudeArgs({ model: config.model, mcpConfigPath, servers }),
        {
          cwd,
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      );
    } catch (error) {
      done({
        ok: false,
        error: `could not start claude: ${error.message}`,
        lines: [],
      });
      return;
    }
    let stdout = '';
    let stderr = '';
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill('SIGKILL');
      done({
        ok: false,
        error: `timeout after ${config.timeoutMs} ms`,
        lines: [],
      });
    }, config.timeoutMs);
    // The result line is the end of the run. If the process then lingers (an MCP child keeping
    // the pipes open), stop waiting for it instead of burning the whole timeout.
    let lingerTimer = null;
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      if (!lingerTimer && stdout.includes('"type":"result"')) {
        lingerTimer = setTimeout(() => child.kill('SIGKILL'), 10_000);
      }
    });
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.stdin.on('error', () => undefined); // EPIPE when claude exits early
    child.stdin.end(prompt);
    child.on('error', (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      done({
        ok: false,
        error: `claude process error: ${error.message}`,
        lines: [],
      });
    });
    child.on('close', (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(lingerTimer);
      const lines = stdout
        .split('\n')
        .filter((l) => l.trim())
        .flatMap((l) => {
          try {
            return [JSON.parse(l)];
          } catch {
            return [];
          }
        });
      if (!lines.some((l) => l.type === 'result')) {
        done({
          ok: false,
          error: `claude exited ${code} without a result. ${stderr.trim().slice(0, 300)}`,
          lines,
        });
        return;
      }
      done({ ok: true, lines });
    });
  });
}

/** Runs one (question, variant, repeat) and returns an Attempt. */
export async function runAttempt({
  config,
  question,
  variant,
  repeat,
  emptyConfigPath,
}) {
  const base = { questionId: question.id, variant, repeat };
  const server =
    variant === 'without'
      ? { path: emptyConfigPath, servers: [] }
      : loadServer(variant, dirname(emptyConfigPath));
  const run = await runClaude({
    config,
    prompt: question.prompt,
    mcpConfigPath: server.path,
    servers: server.servers,
  });
  if (!run.ok) {
    return {
      ...base,
      infraError: run.error,
      text: '',
      toolCalls: [],
      toolErrors: [],
      tokens: null,
      costUsd: null,
      durationMs: null,
      isolation: null,
    };
  }
  const analysis = analyzeStream(run.lines);
  const violations = verifyIsolation(analysis.init, {
    servers: server.servers,
  });
  const infraError = violations.length
    ? `isolation violated: ${violations.join('; ')}`
    : analysis.isError
      ? analysis.errorDetail
      : null;
  return {
    ...base,
    infraError,
    text: analysis.text ?? '',
    toolCalls: analysis.toolCalls,
    toolErrors: analysis.toolErrors,
    tokens: analysis.tokens,
    costUsd: analysis.costUsd,
    durationMs: analysis.durationMs,
    isolation: analysis.init
      ? {
          model: analysis.init.model,
          tools: analysis.init.tools,
          mcpServers: analysis.init.mcp_servers,
          skills: (analysis.init.skills ?? []).length,
          plugins: (analysis.init.plugins ?? []).map((p) => p.name),
        }
      : null,
  };
}

/** Runs `tasks` with at most `limit` in flight. */
export async function pool(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, worker),
  );
  return results;
}

export function stamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

async function main() {
  const config = readConfig();
  const all = JSON.parse(readFileSync(config.questionsPath, 'utf8')).questions;
  const questions = config.onlyIds.length
    ? all.filter((q) => config.onlyIds.includes(q.id))
    : all;
  if (questions.length === 0)
    throw new Error(
      `No question matches MCP_EVAL_ONLY_ID=${config.onlyIds.join(',')}.`,
    );
  for (const variant of config.variants)
    if (variant !== 'without') loadServer(variant); // fail early

  const truth = buildTruth({
    manifestDir: config.manifestDir,
    repoRoot: REPO_ROOT,
  });
  log(
    `truth: ${Object.keys(truth.elements).length} element selectors, ${Object.keys(truth.attributes).length} attribute selectors, ${truth.tokens.length} tokens`,
  );

  const scratch = mkdtempSync(join(tmpdir(), 'atelier-mcp-eval-cfg-'));
  const emptyConfigPath = join(scratch, 'empty.mcp.json');
  writeFileSync(emptyConfigPath, JSON.stringify({ mcpServers: {} }));

  const jobs = [];
  for (const question of questions) {
    for (const variant of config.variants) {
      for (let repeat = 0; repeat < config.repeats; repeat++)
        jobs.push({ question, variant, repeat });
    }
  }
  log(
    `${jobs.length} calls (${questions.length} questions x ${config.variants.length} variants x ${config.repeats} repeats), concurrency ${config.concurrency}, model ${config.model}`,
  );

  let finished = 0;
  const attempts = await pool(
    jobs.map((job) => async () => {
      const attempt = await runAttempt({ config, emptyConfigPath, ...job });
      log(
        `[${++finished}/${jobs.length}] ${job.question.id} ${job.variant} #${job.repeat + 1}${attempt.infraError ? ` INFRA: ${attempt.infraError}` : ''}`,
      );
      return attempt;
    }),
    config.concurrency,
  );
  rmSync(scratch, { recursive: true, force: true });

  mkdirSync(config.reportDir, { recursive: true });
  const id = stamp();
  const answersPath = join(config.reportDir, `eval-${id}.answers.json`);
  const reportPath = join(config.reportDir, `eval-${id}.md`);
  const createdAt = new Date().toISOString();
  const filters = [
    config.onlyIds.length
      ? `MCP_EVAL_ONLY_ID=${config.onlyIds.join(',')}`
      : null,
    process.env.MCP_EVAL_QUESTIONS
      ? `MCP_EVAL_QUESTIONS=${process.env.MCP_EVAL_QUESTIONS}`
      : null,
    process.env.MCP_EVAL_VARIANTS
      ? `MCP_EVAL_VARIANTS=${process.env.MCP_EVAL_VARIANTS}`
      : null,
  ]
    .filter(Boolean)
    .join(' ');
  writeFileSync(
    answersPath,
    JSON.stringify(
      {
        schemaVersion: ANSWERS_SCHEMA_VERSION,
        createdAt,
        model: config.model,
        repeats: config.repeats,
        variants: config.variants,
        filters,
        questionsFile: config.questionsFile,
        questions,
        truth,
        attempts,
      },
      null,
      2,
    ) + '\n',
  );
  const evaluated = evaluateAttempts(attempts, questions, truth);
  const report = renderReport({
    meta: {
      createdAt,
      model: config.model,
      repeats: config.repeats,
      filters,
      questionsFile: config.questionsFile,
      answersFile: answersPath,
    },
    attempts: evaluated,
    questions,
    variants: config.variants,
  });
  writeFileSync(reportPath, report);
  console.log(report);
  log(`report:  ${reportPath}\nanswers: ${answersPath}`);

  const broken = attempts.filter((a) => a.infraError || a.toolErrors.length);
  if (broken.length) {
    log(
      `exit 1: ${broken.length} call(s) with infrastructure failures or MCP tool errors (not answer quality).`,
    );
    process.exit(1);
  }
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  main().catch((error) => {
    console.error(`mcp-eval failed: ${error.stack ?? error.message}`);
    process.exit(1);
  });
}
