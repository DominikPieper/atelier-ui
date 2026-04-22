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
  const presetMain = join(DIST_PRESET, 'src/index.js');
  const cliMain = join(DIST_CLI, 'bin/index.js');
  if (existsSync(presetMain) && existsSync(cliMain)) {
    ok('dist/ artifacts present');
    return;
  }
  section('Building create-workspace + create-atelier-ui-workspace');
  run('npx nx run-many -t build -p create-workspace create-atelier-ui-workspace');
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

  // The preset and CLI packages are served LOCAL-ONLY (no proxy), so verdaccio
  // accepts publishes of dev versions that conflict with what's on npmjs.org.
  // Everything else proxies to npmjs so @atelier-ui/{angular,react,vue,spec}
  // and @nx/* resolve from the real registry.
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

  const proc = spawn('npx', ['-y', 'verdaccio@5', '--config', configPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
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
    const res = spawnSync(cliBin, [wsName, `--framework=${framework}`], {
      cwd: scratch,
      stdio: 'inherit',
      env: {
        ...process.env,
        NPM_CONFIG_REGISTRY: registryUrl,
        NPM_CONFIG_USERCONFIG: npmrcPath,
        NX_NO_CLOUD: 'true',
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
  ok(`preset: ${presetTarball}`);
  const cliTarball = pack(DIST_CLI);
  ok(`cli:    ${cliTarball}`);

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

    for (const fw of FRAMEWORKS) {
      try {
        testFramework(fw, registry.url, npmrcPath);
      } catch (err) {
        console.error(`  ✗ ${fw} failed: ${err.message}`);
        failed.push({ fw, err });
      }
    }
  } finally {
    try {
      registry.proc.kill('SIGTERM');
    } catch {
      /* noop */
    }
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
