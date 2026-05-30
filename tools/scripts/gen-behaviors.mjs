#!/usr/bin/env node
/**
 * gen-behaviors.mjs
 *
 * Generates libs/spec/src/behaviors.generated.ts from libs/spec/src/behaviors.json.
 *
 * Why this exists: behaviors.json is the cross-framework behavior contract —
 * every component (subject) lists the runtime behavior ids each framework
 * adapter must cover. The behavior-coverage gate asserts each id is bound to a
 * test via `covers(subject, id)(...)`. This generated file gives `covers` a
 * TYPED surface: `BehaviorId<'button'>` is exactly the union of button's ids,
 * so `covers('button', 'typo')` is a compile error — the id can no longer drift
 * or be mistyped the way the old `// @behavior <id>` comment could.
 *
 * The generated file is committed and prettier-ignored (a generated artifact).
 * A `--check` run regenerates in memory and fails on drift, mirroring
 * sync-spec.mjs / gen-cookbook-manifest.mjs.
 *
 * Usage:
 *   node tools/scripts/gen-behaviors.mjs           # write the file
 *   node tools/scripts/gen-behaviors.mjs --check   # exit 1 on drift (CI / pre-push)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE = resolve(ROOT, 'libs/spec/src/behaviors.json');
const OUT_FILE = resolve(ROOT, 'libs/spec/src/behaviors.generated.ts');

const HEADER = `// AUTO-GENERATED from libs/spec/src/behaviors.json — do not edit here.
// Run \`node tools/scripts/gen-behaviors.mjs\` after editing the source of truth.
//
// Maps each component (subject) to the behavior ids every framework adapter
// must cover. Consumed by the typed \`covers(subject, id)\` test helper and the
// behavior-coverage gate so a wrong id is a compile error, not a silent miss.
`;

function readManifest() {
  const manifest = JSON.parse(readFileSync(SOURCE, 'utf-8'));
  // Skip $comment etc.; preserve manifest insertion order for deterministic output.
  return Object.entries(manifest).filter(([subject]) => !subject.startsWith('$'));
}

function build() {
  const entries = readManifest();
  // Single-quoted TS literal with the escapes that matter (backslash, quote,
  // newline) so an id/subject with those chars can't emit a non-compiling file.
  const q = (s) =>
    `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  const lines = entries.map(([subject, behaviors]) => {
    // Quote keys that aren't valid JS identifiers (e.g. `code-block`).
    const key = /^[A-Za-z_$][\w$]*$/.test(subject) ? subject : q(subject);
    const ids = behaviors.map((b) => q(b.id)).join(', ');
    return `  ${key}: [${ids}],`;
  });
  return (
    HEADER +
    '\nexport const BEHAVIORS = {\n' +
    lines.join('\n') +
    '\n} as const;\n\n' +
    'export type Subject = keyof typeof BEHAVIORS;\n\n' +
    'export type BehaviorId<S extends Subject> = (typeof BEHAVIORS)[S][number];\n'
  );
}

function main() {
  const check = process.argv.includes('--check');
  const next = build();
  const subjects = readManifest().length;

  if (check) {
    let current = '';
    try {
      current = readFileSync(OUT_FILE, 'utf-8');
    } catch {
      // file missing — drift
    }
    if (current !== next) {
      console.error(
        'behaviors.generated.ts is stale. Run `node tools/scripts/gen-behaviors.mjs`.'
      );
      process.exit(1);
    }
    console.log(`behaviors.generated.ts OK (${subjects} subjects).`);
    return;
  }

  writeFileSync(OUT_FILE, next);
  console.log(`wrote ${OUT_FILE} (${subjects} subjects, ${next.length} bytes).`);
}

main();
