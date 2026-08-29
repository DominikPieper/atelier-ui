#!/usr/bin/env node
/**
 * check-types.mjs
 *
 * Typecheck what `nx run-many -t build` does not: the spec projects — every
 * *.spec.*, *.stories.* and the testing helpers, per framework.
 *
 * Why this exists. The build target compiles the library entry points, and lint
 * runs ESLint, which does not typecheck. So the three `tsconfig.spec.json`
 * projects were compiled by nothing, and `check:all`, `nx test` and `nx lint`
 * were all green over 146 type errors. Most were configuration rather than
 * defects — but not all, and the two that were not are exactly the kind a story
 * file hides:
 *
 *   - `atl-chat.stories.ts` declared `props:` TWICE in one object literal. The
 *     later key wins in JS, so the earlier one had been dead since it was
 *     written, and nothing said so.
 *   - `atl-toast.stories.ts` documented `position` and `duration` as controls on
 *     AtlToast. They are inputs of the story's own wrapper — the container
 *     places the stack, the service carries the duration. Two `as any` casts
 *     silenced the `args` half and left `argTypes` failing, which is a cast
 *     hiding a mismatch rather than naming it.
 *
 * A story is API documentation that runs. A type error in one is a claim about
 * the component that does not hold, and it reaches a reader as though it did.
 *
 * Runs `tsc --noEmit` per framework against its own tsconfig.spec.json, so the
 * per-project `types` arrays and strictness settings apply exactly as they do in
 * an editor. Sequential rather than parallel: three tsc processes contend, and
 * this gate is 8s of a 40s chain, not the thing to optimise first.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const FRAMEWORKS = ['angular', 'react', 'vue'];

const errors = [];
let checked = 0;

for (const fw of FRAMEWORKS) {
  const rel = `libs/${fw}/tsconfig.spec.json`;
  const cfg = resolve(ROOT, rel);
  if (!existsSync(cfg)) {
    // A missing project is not "nothing to check" — it is a framework whose
    // specs and stories are compiled by nobody, which is the state this gate
    // exists to end.
    errors.push(
      `[NO-PROJECT] ${rel} does not exist, so ${fw}'s specs and stories are typechecked by nothing. ` +
        `Add the project, or state here why ${fw} is exempt.`
    );
    continue;
  }

  const res = spawnSync('npx', ['tsc', '-p', rel, '--noEmit'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  checked++;

  const out = `${res.stdout || ''}${res.stderr || ''}`;
  const lines = out.split('\n').filter((l) => /error TS\d+/.test(l));

  if (res.status !== 0 && lines.length === 0) {
    // tsc failed without emitting a diagnostic: a bad config, a missing
    // dependency, a crash. Reporting "0 errors" here would be the green run
    // that is really a broken one.
    errors.push(
      `[TSC-FAILED] tsc exited ${res.status} for ${rel} without reporting a single diagnostic, so this ` +
        `is a broken invocation rather than a clean project. Output:\n${out.trim().split('\n').slice(0, 6).join('\n')}`
    );
    continue;
  }

  for (const line of lines) errors.push(`[TYPE] ${line.trim()}`);
}

if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(
    `\n${errors.length} type issue(s) across ${checked} spec project(s). A *.stories.* file is API ` +
      `documentation that runs: a type error in one is a claim about the component that does not hold. ` +
      `Fix them, or — if a story deliberately renders a wrapper rather than the component — type that ` +
      `story against what it actually renders instead of casting the mismatch away.`
  );
  process.exit(1);
}

console.log(
  `✓ specs and stories typecheck (${checked} project(s): ${FRAMEWORKS.join(', ')} — *.spec.*, *.stories.*, testing helpers).`
);
