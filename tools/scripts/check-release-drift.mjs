#!/usr/bin/env node
/**
 * check-release-drift.mjs
 *
 * Publishing to npm broke silently on 2026-08-29: six `chore(release): publish`
 * commits since then each bumped `libs/<lib>/package.json`, wrote a changelog, and
 * pushed — but every run with a real version bump failed inside `nx release`
 * with npm's 404-on-PUT mask for missing publish rights:
 *
 *   PUT https://registry.npmjs.org/@atelier-ui%2fangular - Not found
 *   '@atelier-ui/angular@0.2.33' could not be found or you do not have permission
 *
 * The runs in between were green no-ops (`nx release --yes` skips publishing
 * when there is no version bump), so CI never turned red and nothing else in
 * this repo compares the local version to what npm actually serves. Git ran
 * ahead of the registry for a week with zero local signal.
 *
 * This gate is that signal: for every publishable package in nx.json's
 * `release.groups.libraries`, compare the local `package.json` version
 * against `npm view <name> version`. The package list is DERIVED from
 * nx.json, not hardcoded — a project renamed or added to the release group
 * is picked up without touching this file. Each project name is resolved to
 * its directory by scanning `libs/<lib>/project.json` for a matching `name`
 * field (not assumed to be `libs/<name>`), and any project without a
 * `package.json`, or marked `"private": true`, is excluded from the compare
 * and named in the summary rather than silently dropped.
 *
 * TWO FAILURE MODES, not one, and this gate must never blur them:
 *   - The registry cannot be reached (offline, DNS failure, timeout). This is
 *     NOT evidence of being in sync — it means the question was never asked.
 *     Exits 0 with a [SKIP] message that says so explicitly.
 *   - The registry answers and a published version differs from local. This
 *     IS release drift. Exits 1, naming every package with both versions.
 *
 * Deliberately NOT part of `check:all` (ADR-0024's reasoning for keeping that
 * chain offline and deterministic applies here too — see the ADR for
 * `check:figma`'s equivalent case). A registry lookup is neither: it depends
 * on network reachability and on npm's registry state at the moment it runs,
 * so folding it into `check:all` would make every one of those 34 gates only
 * as reliable as the network. It runs as its own `check:release-drift` script
 * and its own CI job (main-branch pushes only — see .github/workflows/ci.yml),
 * plus a verification step in `.github/workflows/publish.yml` right after the
 * release/publish step it is meant to catch.
 *
 * Run via:
 *   node tools/scripts/check-release-drift.mjs             check every publishable package
 *   node tools/scripts/check-release-drift.mjs <project>   check one project only (matches
 *                                                           the name in nx.json's release group)
 * (or  npm run check:release-drift)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LIBS_DIR = join(ROOT, 'libs');
const NPM_VIEW_TIMEOUT_MS = 10_000;

const only = process.argv[2];

/** `release.groups.libraries.projects` from nx.json — the roster, not hardcoded. */
function readLibraryProjectNames() {
  const nxJson = JSON.parse(readFileSync(join(ROOT, 'nx.json'), 'utf8'));
  const projects = nxJson?.release?.groups?.libraries?.projects;
  if (!Array.isArray(projects) || projects.length === 0) {
    console.error('✗ [CONFIG] nx.json has no release.groups.libraries.projects array.');
    process.exit(1);
  }
  return projects;
}

/**
 * Map every `libs/*\/project.json`'s declared `name` to its directory. Built
 * by scanning, not by assuming `libs/<name>` — a project's directory need not
 * match its nx project name (it doesn't have to today; it just happens to).
 */
function mapProjectNamesToDirs() {
  const map = new Map();
  for (const dir of readdirSync(LIBS_DIR, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const projectJsonPath = join(LIBS_DIR, dir.name, 'project.json');
    if (!existsSync(projectJsonPath)) continue;
    try {
      const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf8'));
      if (typeof projectJson.name === 'string') {
        map.set(projectJson.name, dir.name);
      }
    } catch {
      // A malformed project.json is check:sync's problem, not this gate's.
    }
  }
  return map;
}

/**
 * npm prints a multi-line stack + advice block on failure. This gate's report
 * is one line per package, so keep only the first line that names the actual
 * error (skips the blank lead-in and the generic "A complete log of this run
 * can be found in ..." footer).
 */
function summarizeStderr(stderr) {
  const lines = stderr
    .split('\n')
    .map((l) => l.replace(/^npm error\s*/, '').trim())
    .filter((l) => l.length > 0 && !/^A complete log of this run/.test(l));
  return lines.find((l) => /FetchError|E404/.test(l)) || lines[0] || stderr.slice(0, 200);
}

/**
 * Query the npm registry for `pkgName`'s published version. Bounded by both
 * npm's own `--fetch-timeout` and a Node-level `timeout` (belt and suspenders
 * — the second exists so an npm hang that ignores its own flag can never wedge
 * this gate). Returns one of:
 *   { unreachable: true,  detail }             registry never answered
 *   { unreachable: false, notFound: true }      registry answered: no such version/package
 *   { unreachable: false, version }             registry answered: here is the version
 */
function queryPublishedVersion(pkgName) {
  const result = spawnSync(
    'npm',
    ['view', pkgName, 'version', '--json', '--fetch-timeout=8000', '--fetch-retries=0'],
    { encoding: 'utf8', timeout: NPM_VIEW_TIMEOUT_MS }
  );

  if (result.error) {
    return { unreachable: true, detail: result.error.message };
  }
  if (result.signal) {
    return { unreachable: true, detail: `npm view was killed (${result.signal}) after ${NPM_VIEW_TIMEOUT_MS}ms` };
  }

  const stderr = (result.stderr || '').trim();
  if (result.status !== 0) {
    if (/\bE404\b/.test(stderr)) {
      return { unreachable: false, notFound: true, detail: summarizeStderr(stderr) };
    }
    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ECONNRESET|ENETUNREACH|FetchError|network/i.test(stderr)) {
      return { unreachable: true, detail: summarizeStderr(stderr) };
    }
    // An npm failure this gate doesn't recognize. Treated as unreachable —
    // never report drift from a registry response this code doesn't
    // understand — but the detail says exactly that, so it isn't mistaken
    // for a clean offline skip.
    return { unreachable: true, detail: stderr ? summarizeStderr(stderr) : `npm view exited ${result.status} with no stderr` };
  }

  try {
    const parsed = JSON.parse(result.stdout);
    // A single matching version is a string; npm returns an array only when
    // more than one version could match, which an exact package name with no
    // range shouldn't produce — handled defensively anyway.
    const version = Array.isArray(parsed) ? parsed[parsed.length - 1] : parsed;
    return { unreachable: false, version };
  } catch (err) {
    return { unreachable: true, detail: `unparsable npm view output: ${err.message}` };
  }
}

const projectNames = readLibraryProjectNames();

if (only && !projectNames.includes(only)) {
  console.error(
    `✗ [CONFIG] '${only}' is not in nx.json's release.groups.libraries.projects (${projectNames.join(', ')}).`
  );
  process.exit(1);
}

const dirsByName = mapProjectNamesToDirs();

const warnings = [];
const resolved = []; // { name, dir, pkgName, localVersion }
let privateCount = 0;

for (const name of only ? [only] : projectNames) {
  const dir = dirsByName.get(name);
  if (!dir) {
    warnings.push(`[UNRESOLVED] '${name}' (from nx.json release.groups.libraries) has no libs/*/project.json declaring that name — skipped.`);
    continue;
  }

  const pkgJsonPath = join(LIBS_DIR, dir, 'package.json');
  if (!existsSync(pkgJsonPath)) {
    warnings.push(`[UNRESOLVED] '${name}' resolves to libs/${dir}, which has no package.json — not publishable, skipped.`);
    continue;
  }

  let pkgJson;
  try {
    pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf8'));
  } catch (err) {
    warnings.push(`[UNRESOLVED] libs/${dir}/package.json failed to parse (${err.message}) — skipped.`);
    continue;
  }

  if (pkgJson.private === true) {
    privateCount++;
    continue;
  }

  resolved.push({ name, dir, pkgName: pkgJson.name, localVersion: pkgJson.version });
}

if (resolved.length === 0) {
  for (const w of warnings) console.warn(`⚠ [WARNING] ${w}`);
  console.error('✗ [CONFIG] no publishable package resolved to check against npm.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Query the registry for every resolved package BEFORE deciding anything.
// If any single query comes back unreachable, the whole gate skips — a
// registry that answered for package 1 and vanished for package 2 has not
// proven package 1 is the only thing worth reporting; it has proven the
// registry is unreliable right now, so the honest response is "couldn't ask",
// not a partial report dressed up as a full one.
// ---------------------------------------------------------------------------
const drifted = [];
let inSync = 0;

for (const pkg of resolved) {
  const result = queryPublishedVersion(pkg.pkgName);

  if (result.unreachable) {
    console.warn(
      `⚠ [SKIP] npm registry unreachable while checking '${pkg.pkgName}' (${result.detail}). ` +
        `release-drift check skipped — this is NOT evidence the release is in sync, only that ` +
        `the registry could not be asked.`
    );
    process.exit(0);
  }

  const published = result.notFound ? '(not published)' : result.version;
  if (published !== pkg.localVersion) {
    drifted.push(`[DRIFT] ${pkg.pkgName}: local ${pkg.localVersion} vs published ${published}`);
  } else {
    inSync++;
  }
}

for (const w of warnings) console.warn(`⚠ [WARNING] ${w}`);

const total =
  `${inSync} of ${resolved.length} publishable package(s) in sync with npm` +
  (privateCount ? `, ${privateCount} private (skipped)` : '') +
  (warnings.length ? `, ${warnings.length} unresolved` : '');

if (drifted.length === 0) {
  console.log(`✓ no release drift (${total}).`);
  process.exit(0);
}

for (const d of drifted) console.error(`✗ ${d}`);
console.error(
  `\n${drifted.length} release-drift issue(s). ${total}. ` +
    `A publish did not reach the registry — check the token/scope used by ` +
    `.github/workflows/publish.yml (secrets.NPM_TOKEN) and republish with ` +
    `'workflow_dispatch: publish-only' once fixed.`
);
process.exit(1);
