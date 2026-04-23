#!/usr/bin/env node
/**
 * End-to-end test for `npx create-atelier-ui-workspace`.
 *
 * Spins up a local verdaccio npm registry, publishes the locally-built
 * preset and CLI to it, installs the CLI into a scratch directory like a
 * real user would, then runs it with --framework=<fw>. Verifies the
 * scaffolded workspace contains expected files and that `nx build`
 * actually compiles the generated app.
 *
 * verdaccio is fetched on-demand via `npx -y verdaccio`; the first run
 * downloads it (~50 MB, cached afterwards). Uplinks to npmjs.org so any
 * published @atelier-ui/* v0.0.x packages and @nx/* deps resolve normally.
 *
 * Run locally:
 *   node libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs
 *
 * Restrict frameworks (comma-separated):
 *   E2E_FRAMEWORKS=angular node libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs
 *
 * Keep scratch dirs for debugging:
 *   E2E_KEEP_SCRATCH=true node libs/create-atelier-ui-workspace/e2e/cli.e2e.mjs
 *
 * Via Nx:
 *   nx run create-atelier-ui-workspace:e2e
 */

import { execSync, spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const DIST_PRESET = join(ROOT, 'dist/libs/create-workspace');
const DIST_CLI = join(ROOT, 'dist/libs/create-atelier-ui-workspace');
const DIST_ANGULAR = join(ROOT, 'dist/libs/angular');
const DIST_REACT = join(ROOT, 'dist/libs/react');
const DIST_VUE = join(ROOT, 'dist/libs/vue');

const FRAMEWORKS = (process.env.E2E_FRAMEWORKS || 'angular,react,vue')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const KEEP_SCRATCH = process.env.E2E_KEEP_SCRATCH === 'true';

function section(msg) {
  console.log(`\n=== ${msg} ===`);
}

function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

function run(cmd, opts = {}) {
  const cwdHint = opts.cwd ? ` (cwd=${opts.cwd})` : '';
  console.log(`  $ ${cmd}${cwdHint}`);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

function runCapture(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf-8', ...opts });
}

function pack(distDir) {
  const out = runCapture('npm pack --json', { cwd: distDir });
  const entry = JSON.parse(out)[0];
  if (!entry?.filename) throw new Error(`npm pack produced no tarball in ${distDir}`);
  const tarballPath = join(distDir, entry.filename);
  if (!existsSync(tarballPath)) throw new Error(`tarball missing: ${tarballPath}`);
  return tarballPath;
}

function ensureBuilt() {
  // Framework libs are packed and published to verdaccio so the e2e validates
  // *our source*, not whatever @atelier-ui/{angular,react,vue}@latest is on
  // npmjs — which can lag behind an unreleased fix (exactly the situation
  // that motivated adding this.)
  const needed = [
    [join(DIST_PRESET, 'src/index.js'), 'create-workspace'],
    [join(DIST_CLI, 'bin/index.js'), 'create-atelier-ui-workspace'],
    [join(DIST_ANGULAR, 'package.json'), 'angular'],
    [join(DIST_REACT, 'package.json'), 'react'],
    [join(DIST_VUE, 'package.json'), 'vue'],
  ];
  const missing = needed.filter(([p]) => !existsSync(p)).map(([, n]) => n);
  if (!missing.length) {
    ok('dist/ artifacts present');
    return;
  }
  section(`Building missing projects: ${missing.join(', ')}`);
  run(`npx nx run-many -t build -p ${missing.join(' ')}`);
}

function getFreePort() {
  return new Promise((resolvePort, reject) => {
    const server = createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolvePort(port));
    });
  });
}

async function waitForRegistry(url, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/-/ping`);
      if (res.ok || res.status === 404) return;
    } catch (err) {
      lastErr = err;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`verdaccio did not come up within ${timeoutMs}ms: ${lastErr?.message ?? ''}`);
}

async function startVerdaccio() {
  section('Starting local verdaccio');
  const port = await getFreePort();
  const dir = mkdtempSync(join(tmpdir(), 'atelier-e2e-verdaccio-'));
  const storage = join(dir, 'storage');
  const htpasswd = join(dir, 'htpasswd');
  const configPath = join(dir, 'config.yaml');
  mkdirSync(storage, { recursive: true });
  writeFileSync(htpasswd, '');

  // All six @atelier-ui packages are served LOCAL-ONLY (no npmjs proxy) so
  // the e2e validates the source in this branch — not whatever versions are
  // currently published on npmjs. Without this, a fix to the framework libs
  // couldn't be verified until after a real release, and a still-broken
  // published version would mask a locally-good fix.
  // Everything else (@nx/*, prettier, peer deps, etc.) proxies to npmjs.
  const config = `storage: ${storage}
auth:
  htpasswd:
    file: ${htpasswd}
    max_users: 1000
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    timeout: 60s
packages:
  '@atelier-ui/create-workspace':
    access: $all
    publish: $all
    unpublish: $all
  '@atelier-ui/angular':
    access: $all
    publish: $all
    unpublish: $all
  '@atelier-ui/react':
    access: $all
    publish: $all
    unpublish: $all
  '@atelier-ui/vue':
    access: $all
    publish: $all
    unpublish: $all
  'create-atelier-ui-workspace':
    access: $all
    publish: $all
    unpublish: $all
  '@*/*':
    access: $all
    publish: $all
    unpublish: $all
    proxy: npmjs
  '**':
    access: $all
    publish: $all
    unpublish: $all
    proxy: npmjs
listen: 127.0.0.1:${port}
log:
  type: stdout
  format: pretty
  level: warn
`;
  writeFileSync(configPath, config);

  // detached: true puts verdaccio in its own process group so we can signal
  // the whole tree later. `npx -y verdaccio@5` spawns an intermediate wrapper
  // that doesn't forward SIGTERM to the node process running verdaccio, which
  // is why the CI job used to hang on a zombie verdaccio until the 30-minute
  // timeout fired.
  const proc = spawn('npx', ['-y', 'verdaccio@5', '--config', configPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });
  proc.stdout.on('data', (d) => process.stdout.write(`[verdaccio] ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`[verdaccio] ${d}`));
  proc.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.error(`[verdaccio] exited with code ${code}`);
    }
  });

  const url = `http://127.0.0.1:${port}`;
  await waitForRegistry(url);
  ok(`verdaccio listening at ${url}`);
  return { url, proc, dir };
}

async function stopVerdaccio(registry) {
  if (!registry?.proc) return;
  const { proc } = registry;
  if (proc.exitCode !== null || proc.signalCode !== null) return;

  const exited = new Promise((resolvePromise) => {
    if (proc.exitCode !== null || proc.signalCode !== null) resolvePromise();
    else proc.once('exit', () => resolvePromise());
  });

  // Negative pid → signal the whole process group created by detached: true.
  // This reaches the real verdaccio process even when npx's wrapper would
  // otherwise swallow the signal.
  try {
    process.kill(-proc.pid, 'SIGTERM');
  } catch {
    try { proc.kill('SIGTERM'); } catch { /* already gone */ }
  }

  const timeout = new Promise((resolvePromise) => setTimeout(resolvePromise, 5000));
  await Promise.race([exited, timeout]);

  if (proc.exitCode === null && proc.signalCode === null) {
    try { process.kill(-proc.pid, 'SIGKILL'); } catch { /* noop */ }
    try { proc.kill('SIGKILL'); } catch { /* noop */ }
  }
}

function publishToRegistry(tarballPath, registryUrl, npmrcPath) {
  run(`npm publish "${tarballPath}" --registry=${registryUrl} --userconfig="${npmrcPath}"`, {
    stdio: 'pipe',
  });
}

function testFramework(framework, registryUrl, npmrcPath) {
  section(`Framework: ${framework}`);
  const scratch = mkdtempSync(join(tmpdir(), `atelier-e2e-${framework}-`));
  console.log(`  scratch: ${scratch}`);
  let passed = false;
  try {
    run('npm init -y', { cwd: scratch, stdio: 'pipe' });
    run(
      `npm install --no-audit --no-fund --ignore-scripts --registry=${registryUrl} --userconfig="${npmrcPath}" create-atelier-ui-workspace`,
      { cwd: scratch, stdio: 'pipe' },
    );
    const cliBin = join(scratch, 'node_modules', '.bin', 'create-atelier-ui-workspace');
    if (!existsSync(cliBin)) throw new Error(`CLI bin not found at ${cliBin}`);
    ok('CLI installed from verdaccio');

    const wsName = `workshop-${framework}-ws`;
    // --no-figma keeps the CLI non-interactive (the figma MCP prompt would
    // otherwise hang because stdio is inherited). The opt-in path is covered
    // by unit tests in preset.spec.ts and index.spec.ts.
    const res = spawnSync(cliBin, [wsName, `--framework=${framework}`, '--no-figma'], {
      cwd: scratch,
      stdio: 'inherit',
      env: {
        ...process.env,
        NPM_CONFIG_REGISTRY: registryUrl,
        NPM_CONFIG_USERCONFIG: npmrcPath,
        NX_NO_CLOUD: 'true',
        // If an ensurePackage ever fails again, surface npm's actual error
        // instead of a bare `Command failed: npm install` swallowed by Nx.
        NX_VERBOSE_LOGGING: 'true',
      },
    });
    if (res.status !== 0) throw new Error(`CLI exited with status ${res.status}`);
    ok('CLI completed');

    const wsPath = join(scratch, wsName);
    if (!statSync(wsPath).isDirectory()) throw new Error(`workspace dir missing: ${wsPath}`);
    ok(`workspace at ${wsPath}`);

    const mustExist = [
      'package.json',
      'CLAUDE.md',
      '.mcp.json',
      `workshop-${framework}/src/styles.css`,
      `workshop-${framework}/src/styles/tokens.css`,
      'tools/scripts/preflight.mjs',
    ];
    for (const rel of mustExist) {
      if (!existsSync(join(wsPath, rel))) throw new Error(`missing: ${rel}`);
    }
    ok('scaffolded files present (including local tokens.css)');

    const stylesPath = join(wsPath, `workshop-${framework}/src/styles.css`);
    const styles = readFileSync(stylesPath, 'utf-8');
    if (!styles.includes(`@import './styles/tokens.css';`)) {
      throw new Error(`relative tokens import missing in ${stylesPath}`);
    }
    const tokensPath = join(wsPath, `workshop-${framework}/src/styles/tokens.css`);
    const tokens = readFileSync(tokensPath, 'utf-8');
    if (!tokens.includes('--ui-color-')) {
      throw new Error(`tokens.css looks empty or corrupt at ${tokensPath}`);
    }
    ok('tokens.css written locally and imported relatively');

    // Docs tell attendees to run `npm run preflight` after `npm install`
    // (docs/src/pages/workshop.astro step 02). Assert the npm script is
    // actually wired into the generated package.json — the existing file-
    // existence check above would pass even if the script entry was skipped.
    const pkgPath = join(wsPath, 'package.json');
    const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const expectedPreflight = 'node tools/scripts/preflight.mjs';
    if (pkgJson.scripts?.preflight !== expectedPreflight) {
      throw new Error(
        `package.json scripts.preflight = ${JSON.stringify(pkgJson.scripts?.preflight)}, expected ${JSON.stringify(expectedPreflight)}`,
      );
    }
    ok('package.json scripts.preflight wired correctly');

    // Smoke-test the npm script entrypoint resolves. Preflight will report
    // warnings/errors in this scratch environment (no Figma, no Claude CLI,
    // etc.) — we only care that `npm run preflight` doesn't exit with
    // "missing script: preflight". Any other non-zero exit is tolerated.
    const preflightRes = spawnSync('npm', ['run', 'preflight'], {
      cwd: wsPath,
      stdio: 'pipe',
      env: process.env,
    });
    const preflightOutput = [
      preflightRes.stdout?.toString() ?? '',
      preflightRes.stderr?.toString() ?? '',
    ].join('\n');
    if (preflightOutput.toLowerCase().includes('missing script: preflight')) {
      throw new Error('npm run preflight failed: script not registered');
    }
    ok('npm run preflight entrypoint resolves');

    run(`npx nx build workshop-${framework} --skip-nx-cache`, { cwd: wsPath });
    ok(`nx build workshop-${framework} green`);
    passed = true;
  } finally {
    if (KEEP_SCRATCH) {
      console.log(`  (kept scratch at ${scratch} for inspection)`);
    } else if (passed) {
      rmSync(scratch, { recursive: true, force: true });
    } else {
      console.log(`  scratch preserved at ${scratch} for debugging`);
    }
  }
}

async function main() {
  section('CLI e2e');
  console.log(`  frameworks: ${FRAMEWORKS.join(', ')}`);

  ensureBuilt();

  section('Packing tarballs');
  const presetTarball = pack(DIST_PRESET);
  ok(`preset:  ${presetTarball}`);
  const cliTarball = pack(DIST_CLI);
  ok(`cli:     ${cliTarball}`);
  const angularTarball = pack(DIST_ANGULAR);
  ok(`angular: ${angularTarball}`);
  const reactTarball = pack(DIST_REACT);
  ok(`react:   ${reactTarball}`);
  const vueTarball = pack(DIST_VUE);
  ok(`vue:     ${vueTarball}`);

  const registry = await startVerdaccio();
  const npmrcPath = join(registry.dir, '.npmrc');
  const token = 'e2e-test-token';
  writeFileSync(
    npmrcPath,
    `registry=${registry.url}/\n//${registry.url.replace(/^https?:\/\//, '')}/:_authToken=${token}\n`,
  );

  const failed = [];
  try {
    section('Publishing tarballs to verdaccio');
    publishToRegistry(presetTarball, registry.url, npmrcPath);
    ok('preset published');
    publishToRegistry(cliTarball, registry.url, npmrcPath);
    ok('cli published');
    publishToRegistry(angularTarball, registry.url, npmrcPath);
    ok('angular published');
    publishToRegistry(reactTarball, registry.url, npmrcPath);
    ok('react published');
    publishToRegistry(vueTarball, registry.url, npmrcPath);
    ok('vue published');

    for (const fw of FRAMEWORKS) {
      try {
        testFramework(fw, registry.url, npmrcPath);
      } catch (err) {
        console.error(`  ✗ ${fw} failed: ${err.message}`);
        failed.push({ fw, err });
      }
    }
  } finally {
    await stopVerdaccio(registry);
    if (!KEEP_SCRATCH) {
      rmSync(registry.dir, { recursive: true, force: true });
    }
  }

  if (failed.length) {
    console.error(`\n${failed.length}/${FRAMEWORKS.length} framework(s) failed:`);
    for (const { fw, err } of failed) {
      console.error(`  - ${fw}: ${err.message}`);
    }
    process.exit(1);
  }

  console.log(`\nAll ${FRAMEWORKS.length} framework(s) green.`);
}

main()
  .then(() => {
    // Force exit even if some library left a handle open (verdaccio's pipes,
    // dangling sockets from `npm publish`, etc.) — without this the job used
    // to sit idle until the 30-min CI timeout fired.
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
