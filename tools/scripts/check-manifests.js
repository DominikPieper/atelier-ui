#!/usr/bin/env node
/**
 * check-manifests.js
 *
 * Wave 3 of the Storybook 10.6 migration (tasks/storybook-10-6-migration-plan-2026-09-05.md)
 * retired the worker's React-manifest fallback (plan/adr/0097-the-manifest-the-framework-can-emit-now.md,
 * superseding ADR-0083): each hosted MCP endpoint now serves its own framework's
 * `manifests/components.json`, and nothing answers in its place if that artefact
 * is broken. This gate is what used to be a manual fallback path — it asserts
 * the artefact the whole migration rests on is real, so a broken or degraded
 * manifest fails loudly here instead of shipping with every other gate green.
 *
 * Checks, per framework (angular, react, vue):
 *   [NO-BUILD] `dist/storybook/<fw>/manifests/components.json` does not exist.
 *   [PARSE]    the file is not valid JSON.
 *   [EMPTY]    `components` is missing or has zero entries — the shape
 *              `@storybook/mcp` throws on for every tool call (`fetchManifests`),
 *              not only component lookups.
 *   [NO-DOCGEN-META] `meta.docgen` is missing or empty — the generator name
 *              (`angular-component-meta` / `react-docgen` / `vue-component-meta`)
 *              that proves a real docgen pass ran, not just that a manifest
 *              file was written.
 *   [DECOY]    a component entry carries nothing beyond `id`/`name` — no
 *              docgen ref, no inline docgen, no error, not even a stories
 *              ref. This is the exact shape `@analogjs/storybook-angular`
 *              wrote for all 32 components when it could not supply
 *              `components.meta.docgen` (build still exit 0; see the ADR).
 *              An empty manifest that looks full.
 *   [UNRESOLVED-REF] a component's `docgen.$ref` does not resolve to a real
 *              file + JSON-pointer on disk. This is the exact defect class
 *              `worker/mcp.ts`'s `manifestProvider` was fixed for: proves the
 *              shard the ref names is actually there, not just that the ref
 *              string is present.
 *
 * WHY THIS READS BUILT OUTPUT, AND WHY THAT IS SAFE HERE:
 * `dist/storybook/<fw>/manifests/components.json` only exists after
 * `nx build-storybook <fw>`. Nothing else in `check:all` builds Storybook, so
 * unlike most gates in the chain this one is not self-sufficient from a bare
 * checkout — the same tradeoff `check:docs-layout` already made for
 * `dist/docs` (its own header, and the `nx build docs &&` prefix on
 * `check:docs-layout` in package.json). This gate follows the identical
 * pattern: `check:storybook-manifests` in package.json runs `nx run-many -t
 * build-storybook -p angular,react,vue` first, so `npm run check:storybook-manifests`
 * (and `check:all`) is self-sufficient; running this file directly without a
 * prior build fails fast with [NO-BUILD] rather than silently reading stale
 * output. Nx caches `build-storybook`'s declared outputs, so a rerun with no
 * source change is fast.
 *
 * Run via:  node tools/scripts/check-manifests.js   (or  npm run check:storybook-manifests,
 *           which builds Storybook for all three frameworks first)
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { FRAMEWORKS } = require('./lib/component-discovery');

const ROOT = path.resolve(__dirname, '../..');
const DIST = path.join(ROOT, 'dist/storybook');

const errors = [];
const fail = (tag, msg) => errors.push(`✗ [${tag}] ${msg}`);

/** Split a manifest `$ref` string into its file part and its `#/...` JSON pointer. */
function parseRef(ref) {
  const hashIdx = ref.indexOf('#');
  if (hashIdx === -1) return { filePart: ref, pointer: '' };
  return { filePart: ref.slice(0, hashIdx), pointer: ref.slice(hashIdx + 1) };
}

/** Resolve an RFC-6901 JSON pointer against a parsed object; undefined if it does not resolve. */
function resolvePointer(obj, pointer) {
  if (!pointer) return obj;
  const parts = pointer
    .split('/')
    .filter((p) => p.length > 0)
    .map((p) => p.replace(/~1/g, '/').replace(/~0/g, '~'));
  let cur = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object' || !(part in cur))
      return undefined;
    cur = cur[part];
  }
  return cur;
}

let componentsChecked = 0;

for (const fw of FRAMEWORKS) {
  const manifestDir = path.join(DIST, fw, 'manifests');
  const manifestPath = path.join(manifestDir, 'components.json');

  if (!fs.existsSync(manifestPath)) {
    fail(
      'NO-BUILD',
      `${path.relative(ROOT, manifestPath)} not found. Run: npx nx build-storybook ${fw}`,
    );
    continue;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    fail('PARSE', `${path.relative(ROOT, manifestPath)}: ${err.message}`);
    continue;
  }

  const components =
    manifest.components && typeof manifest.components === 'object'
      ? manifest.components
      : null;
  const ids = components ? Object.keys(components) : [];
  if (!components || ids.length === 0) {
    fail(
      'EMPTY',
      `${fw}: manifests/components.json has zero components. @storybook/mcp throws on this ` +
        `shape for every tool call, not just component lookups.`,
    );
    continue;
  }

  if (!manifest.meta || !manifest.meta.docgen) {
    fail(
      'NO-DOCGEN-META',
      `${fw}: manifests/components.json has no meta.docgen. A real docgen pass records its ` +
        `generator name there (e.g. 'angular-component-meta'); its absence is the same signal ` +
        `as the decoy manifest below, one level up.`,
    );
  }

  for (const id of ids) {
    const entry = components[id];
    componentsChecked++;
    if (!entry || typeof entry !== 'object') {
      fail('DECOY', `${fw}/${id}: entry is not an object.`);
      continue;
    }

    // Every docgen provider shapes its payload differently — Angular/Vue
    // reference an external shard (`docgen.$ref`, checked below), React
    // inlines its own (`reactDocgen`), and a story that isn't a single
    // documentable component (a showcase page, a cookbook index) legitimately
    // carries no docgen at all but still says so (an `error`, or at least a
    // `stories` ref). What no legitimate entry does is carry NOTHING beyond
    // `id`/`name` — that bare pair, with no docgen, no error, no stories ref,
    // nothing — is exactly the shape a docgen-less build wrote for all 32
    // components under `@analogjs/storybook-angular` (spike, 2026-09-05): the
    // Invariant on missing `components.meta.docgen` was swallowed and every
    // entry came out empty. Checked independently of the meta.docgen check
    // above so a manifest that lies about its own meta is still caught here.
    const extraKeys = Object.keys(entry).filter(
      (k) => k !== 'id' && k !== 'name',
    );
    if (extraKeys.length === 0) {
      fail(
        'DECOY',
        `${fw}/${id}: carries only id/name, nothing else. This is the decoy shape a ` +
          `docgen-less build writes.`,
      );
      continue;
    }

    const ref = entry.docgen && entry.docgen.$ref;
    if (typeof ref !== 'string' || ref.length === 0) {
      continue; // no external ref to resolve for this provider's shape
    }

    const { filePart, pointer } = parseRef(ref);
    const shardPath = path.resolve(manifestDir, filePart);
    if (!fs.existsSync(shardPath)) {
      fail(
        'UNRESOLVED-REF',
        `${fw}/${id}: docgen.$ref '${ref}' points at ${path.relative(ROOT, shardPath)}, which does not exist.`,
      );
      continue;
    }

    let shard;
    try {
      shard = JSON.parse(fs.readFileSync(shardPath, 'utf8'));
    } catch (err) {
      fail(
        'UNRESOLVED-REF',
        `${fw}/${id}: docgen.$ref shard ${path.relative(ROOT, shardPath)} is not valid JSON: ${err.message}`,
      );
      continue;
    }

    const resolved = resolvePointer(shard, pointer);
    if (
      resolved === undefined ||
      resolved === null ||
      typeof resolved !== 'object'
    ) {
      fail(
        'UNRESOLVED-REF',
        `${fw}/${id}: docgen.$ref '${ref}' — pointer '#${pointer}' does not resolve inside ${path.relative(ROOT, shardPath)}.`,
      );
    }
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(e);
  console.error(`\n${errors.length} manifest issue(s) found.`);
  process.exit(1);
} else {
  console.log(
    `✓ Storybook component manifests present, docgen-backed, and resolvable for all ${FRAMEWORKS.length} frameworks (${componentsChecked} components checked).`,
  );
}
