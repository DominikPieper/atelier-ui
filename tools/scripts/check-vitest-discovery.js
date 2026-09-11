#!/usr/bin/env node
/**
 * check-vitest-discovery.js
 *
 * plan/adr/0112-a-comment-the-test-runner-reads.md fixed the Storybook MCP
 * `test-run` tool (and the Storybook "Testing" panel) after it failed on all
 * three frameworks with "No projects matched the filter". Root cause:
 * `@storybook/addon-vitest`'s `VitestManager.startVitest()` walks up from a
 * story's `.storybook` directory looking for the nearest
 * `vitest.workspace.*` / `vitest.config.*` / `vite.config.*` file whose
 * *source text* contains the literal substring `storybookTest` or
 * `@storybook/addon-vitest`, and uses that file's directory as the Vitest
 * workspace root. This repo's root `vitest.config.mjs` carries a comment
 * that supplies that literal on purpose, and lists every framework's
 * `libs/<fw>/vitest.storybook.config.ts` in its `projects:` array so the
 * walk-up actually finds each framework's real, storybookTest()-wired config
 * once it lands there.
 *
 * The ADR names its own weakness: the comment is prose. A future cleanup
 * could delete it as decoration, or add a fourth framework's
 * `vitest.storybook.config.ts` without registering it, and the exact
 * "No projects matched the filter" failure would come back with nothing in
 * `check:all` to catch it (`check:all` never boots Storybook or calls
 * `test-run`). This gate is that catch.
 *
 * Checks:
 *   [NO-SNIFF-LITERAL]   root `vitest.config.mjs` no longer contains either
 *                        literal the addon's content-sniffing walk-up checks
 *                        for (`storybookTest` / `@storybook/addon-vitest`).
 *   [UNREGISTERED-PROJECT] a `libs/<fw>/vitest.storybook.config.ts` exists on
 *                        disk but its path string is not present in the root
 *                        config, so the walk-up would never route that
 *                        framework's `test-run` calls to it.
 *
 * The framework list is discovered from `libs/*\/vitest.storybook.config.ts`
 * on disk, not hardcoded — a fourth framework added later is covered
 * automatically instead of silently slipping past a stale list of three.
 *
 * WHAT THIS GATE CANNOT PROVE: it is a static text check. It proves the
 * literal string is present in the file and that each config's path string
 * appears in the root `projects:` array — it does NOT run Vitest, call
 * `test-run`, or otherwise prove `@storybook/addon-vitest`'s own
 * `startVitest()` still reads either file the way ADR-0112 describes. If a
 * future Storybook release changes that discovery mechanism, this gate will
 * keep passing on the old literal while the real behavior has moved on; see
 * the ADR's Consequences for that caveat and re-verify against a running
 * Storybook (`test-run` over MCP) when this addon is upgraded.
 *
 * Run via:  node tools/scripts/check-vitest-discovery.js
 *           (or  npm run check:vitest-discovery)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const ROOT_CONFIG_REL = 'vitest.config.mjs';
const ROOT_CONFIG = path.join(ROOT, ROOT_CONFIG_REL);
const LIBS_DIR = path.join(ROOT, 'libs');
const STORYBOOK_CONFIG_NAME = 'vitest.storybook.config.ts';

// The two literals @storybook/addon-vitest's VitestManager.startVitest()
// checks a candidate config file's source text for (dist/node/vitest.js,
// 10.6.0). Either one, present anywhere in the file, satisfies the sniff.
const SNIFF_LITERALS = ['storybookTest', '@storybook/addon-vitest'];

const errors = [];
const fail = (tag, msg) => errors.push(`✗ [${tag}] ${msg}`);

if (!fs.existsSync(ROOT_CONFIG)) {
  fail(
    'NO-SNIFF-LITERAL',
    `${ROOT_CONFIG_REL} not found. See plan/adr/0112-a-comment-the-test-runner-reads.md.`,
  );
} else {
  const rootConfigText = fs.readFileSync(ROOT_CONFIG, 'utf8');

  const hasSniffLiteral = SNIFF_LITERALS.some((lit) =>
    rootConfigText.includes(lit),
  );
  if (!hasSniffLiteral) {
    fail(
      'NO-SNIFF-LITERAL',
      `${ROOT_CONFIG_REL} no longer contains either literal ` +
        `(${SNIFF_LITERALS.map((l) => `"${l}"`).join(' or ')}) that ` +
        `@storybook/addon-vitest's startVitest() sniffs a config file's source ` +
        `text for. Without it, the walk-up skips this file, falls through to ` +
        `libs/<fw>/vite.config.mts (a single unnamed project with no ` +
        `projects: list), and every framework's test-run MCP call fails with ` +
        `"No projects matched the filter". See ` +
        `plan/adr/0112-a-comment-the-test-runner-reads.md.`,
    );
  }

  // Discover frameworks from disk: any libs/<name>/vitest.storybook.config.ts
  // that exists, not a hardcoded list — so a framework added later is covered
  // automatically instead of needing this gate edited to notice it.
  const frameworks = fs
    .readdirSync(LIBS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) =>
      fs.existsSync(path.join(LIBS_DIR, name, STORYBOOK_CONFIG_NAME)),
    )
    .sort();

  if (frameworks.length === 0) {
    fail(
      'UNREGISTERED-PROJECT',
      `no libs/<fw>/${STORYBOOK_CONFIG_NAME} found anywhere under libs/ — expected at least one framework's Storybook Vitest config.`,
    );
  }

  for (const fw of frameworks) {
    const relPath = `libs/${fw}/${STORYBOOK_CONFIG_NAME}`;
    if (!rootConfigText.includes(relPath)) {
      fail(
        'UNREGISTERED-PROJECT',
        `${relPath} exists but is not listed in ${ROOT_CONFIG_REL}'s projects: array. ` +
          `The addon's walk-up would land on this file (once the sniff literal above ` +
          `is present) but Vitest's project filter would still find no project for ` +
          `${fw}'s test-run calls. See plan/adr/0112-a-comment-the-test-runner-reads.md.`,
      );
    }
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(e);
  console.error(`\n${errors.length} vitest-discovery issue(s) found.`);
  process.exit(1);
} else {
  console.log(
    `✓ vitest.config.mjs still carries the addon's sniff literal and registers every libs/*/${STORYBOOK_CONFIG_NAME} found on disk (static text check only — see file header for what this cannot prove).`,
  );
}
