#!/usr/bin/env node
/**
 * check-story-descriptions.js
 *
 * Every Storybook story for a component spec must declare a
 * component-level description so the generated Component Manifest
 * (Storybook MCP) carries real context for downstream agents. Without
 * this, the hosted MCP at `atelier.pieper.io/storybook-<fw>/mcp` serves
 * an empty description per component and agents fall back to reading
 * raw source — wasteful and lossy.
 *
 * What this gate checks:
 *   1. Every `llm-*.stories.{ts,tsx}` file under
 *      `libs/{angular,react,vue}/src/lib/<component>/` declares
 *      `parameters.docs.description.component: <value>` on the default
 *      export.
 *   2. The value is sourced from the metadata barrel — i.e. it
 *      references a `.purpose` property or imports `metadata` from
 *      `@atelier-ui/spec/metadata/...`. A bare string literal is an
 *      ERROR: the description must derive from `metadata.purpose` so it
 *      can never drift from the AI-readiness source of truth (the same
 *      "derive, don't annotate" rule the behavior gate now follows).
 *
 * Heuristics, not full AST:
 *   The check uses targeted regular expressions against the source.
 *   This is consistent with how `check-defaults.js` and
 *   `check-css-tokens.js` work — a fast, deterministic read of a
 *   shape-conventional file. Story files in this repo follow a tight
 *   convention (default `meta` object literal, identical across the
 *   three frameworks) so regex is sufficient.
 *
 * Run via:  node tools/scripts/check-story-descriptions.js
 *           (or  npm run check:story-descriptions)
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const FRAMEWORKS = ['angular', 'react', 'vue'];

// Component dirs that intentionally do not have a metadata file:
//   - toast:       no LlmToastSpec interface; toast is a service + container
//                  pair documented manually in components.ts.
//   - code-block:  docs-site widget, not part of the public component API.
//   - showcase:    composite docs sandbox; not a shipped component.
const SKIP_DIRS = new Set(['toast', 'code-block', 'showcase']);

const errors = [];
let checked = 0;
let skipped = 0;

for (const fw of FRAMEWORKS) {
  const libDir = path.join(ROOT, 'libs', fw, 'src', 'lib');
  if (!fs.existsSync(libDir)) continue;
  for (const entry of fs.readdirSync(libDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (SKIP_DIRS.has(entry.name)) {
      skipped++;
      continue;
    }
    const compDir = path.join(libDir, entry.name);
    const stories = fs
      .readdirSync(compDir)
      .filter((f) => /\.stories\.(ts|tsx)$/.test(f));
    for (const story of stories) {
      const file = path.join(compDir, story);
      const rel = path.relative(ROOT, file);
      const src = fs.readFileSync(file, 'utf-8');
      checked++;

      // 1. parameters.docs.description.component must be present somewhere.
      //    The story files use either an inline literal or a reference to
      //    a `metadata.purpose` import — accept both forms here.
      const present = /description\s*:\s*\{[^}]*component\s*:\s*[^,}]+/m.test(src);
      if (!present) {
        errors.push(
          `[NO-DESCRIPTION] ${rel}: no 'parameters.docs.description.component' set on the story default export. Source it from '@atelier-ui/spec/metadata/<name>.metadata'.`
        );
        continue;
      }

      // 2. The description must be sourced from metadata, not a bare string
      //    literal, so it can never drift from the metadata source of truth.
      const sourcedFromMetadata =
        /component\s*:\s*[A-Za-z_$][\w$]*\.purpose/m.test(src) ||
        /component\s*:\s*metadata\.purpose/m.test(src);
      if (!sourcedFromMetadata) {
        errors.push(
          `[INLINE-DESCRIPTION] ${rel}: description.component is a literal — import metadata.purpose from '@atelier-ui/spec/metadata/<name>.metadata' so the description never drifts from the metadata.`
        );
      }
    }
  }
}

if (errors.length > 0) {
  errors.forEach((e) => console.error(`✗ ${e}`));
  console.error(
    `\n${errors.length} story description issue(s). Add 'parameters.docs.description.component: metadata.purpose' to the default export.`
  );
  process.exit(1);
}

console.log(
  `✓ story descriptions present (${checked} story file${checked === 1 ? '' : 's'} scanned, ${skipped} dir${skipped === 1 ? '' : 's'} allowlisted)`
);
