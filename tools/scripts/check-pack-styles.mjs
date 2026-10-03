#!/usr/bin/env node
/**
 * check-pack-styles.mjs
 *
 * Proves that `@atelier-ui/react`, as it would be published, brings its CSS
 * with it. React components `import '@atelier-ui/styles/<dir>/atl-<name>.css'`;
 * the built `dist/libs/react` keeps that specifier, so it only resolves for a
 * consumer if the published react package DECLARES `@atelier-ui/styles` as a
 * dependency and the published styles package serves that path. Neither is
 * visible from inside the monorepo, where tsconfig `paths` resolve the
 * specifier to `libs/styles/src` regardless — every other gate here is blind
 * to a missing dependency declaration or a wrong `exports` map.
 *
 * What it does, offline:
 *   1. builds styles + react (Nx cache makes this free when nothing changed),
 *   2. `npm pack`s dist/libs/styles and dist/libs/react into a temp dir,
 *   3. asserts the packed react package.json declares `@atelier-ui/styles`
 *      with a concrete version equal to the packed styles version,
 *   4. creates a throw-away consumer, installs ONLY the react tarball, and
 *      points `@atelier-ui/styles` at the styles tarball through an npm
 *      `overrides` entry. An override cannot ADD a dependency, so if react
 *      stopped declaring it, the styles package would simply not be installed
 *      and step 5 fails — which is the point. (Installing both tarballs on the
 *      command line would pass either way and prove nothing.)
 *   5. bundles `import { AtlButton, AtlTooltip } from '@atelier-ui/react'` with esbuild
 *      (react/react-dom external — resolving the CSS is the question, not
 *      React) and asserts the emitted CSS holds the `.atl-button` rules, and
 *      that esbuild read them from the consumer's node_modules, not the repo.
 *
 * Offline choices: `npm install --offline --ignore-scripts --legacy-peer-deps`.
 * `--legacy-peer-deps` stops npm fetching react/react-dom (the peers) from
 * the registry; they are marked external in the bundle, so they are not needed.
 * Nothing here contacts the registry or writes to it.
 *
 * Not part of `check:all`: it builds two projects and runs `npm install`
 * (about 10-20 s warm, longer cold), and it is the only gate that depends on
 * npm's resolver. It is its own script, `npm run check:pack-styles`, and runs
 * in CI beside the other release checks.
 *
 * Run via:  node tools/scripts/check-pack-styles.mjs
 *           (or  npm run check:pack-styles)
 */
import { spawnSync } from 'node:child_process';
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
import { build } from 'esbuild';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST_STYLES = join(ROOT, 'dist/libs/styles');
const DIST_REACT = join(ROOT, 'dist/libs/react');

// What the bundled CSS must contain. Taken from libs/styles/src/button/
// atl-button.css; if that file changes these, update them here.
const EXPECT_SELECTOR = '.atl-button.variant-primary';
const EXPECT_DECLARATION = 'letter-spacing: var(--ui-letter-spacing-tight)';
// The React/Vue-only override (`atl-tooltip.native.css`, ADR-0148 Decision 4) must travel
// too: `.atl-tooltip-wrapper` exists in that file alone, `.atl-tooltip` in the shared one.
const EXPECT_NATIVE_SELECTOR = '.atl-tooltip-wrapper';
const EXPECT_SHARED_TOOLTIP_SELECTOR = '.atl-tooltip';

const failures = [];
const fail = (msg) => failures.push(msg);

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    throw new Error(
      `${cmd} ${args.join(' ')} exited ${r.status}\n${r.stdout ?? ''}${r.stderr ?? ''}`,
    );
  }
  return r.stdout;
}

function pack(distDir, dest) {
  const out = run(
    'npm',
    ['pack', distDir, '--pack-destination', dest, '--json', '--ignore-scripts'],
    { cwd: ROOT },
  );
  const [entry] = JSON.parse(out);
  return {
    file: join(dest, entry.filename),
    files: entry.files.map((f) => f.path),
  };
}

const scratch = mkdtempSync(join(tmpdir(), 'atelier-pack-styles-'));

try {
  run('npx', ['nx', 'run-many', '-t', 'build', '-p', 'styles,react'], {
    cwd: ROOT,
  });

  const packs = join(scratch, 'packs');
  mkdirSync(packs);
  const styles = pack(DIST_STYLES, packs);
  const react = pack(DIST_REACT, packs);

  // The tarball, not the source tree, is the thing under test.
  const stylesPkg = JSON.parse(
    readFileSync(join(DIST_STYLES, 'package.json'), 'utf8'),
  );
  const reactPkg = JSON.parse(
    readFileSync(join(DIST_REACT, 'package.json'), 'utf8'),
  );

  for (const f of [
    'tooltip/atl-tooltip.css',
    'tooltip/atl-tooltip.native.css',
  ]) {
    if (!styles.files.includes(f)) {
      fail(
        `styles tarball does not contain ${f} (${styles.files.join(', ')}).`,
      );
    }
  }

  if (!styles.files.includes('button/atl-button.css')) {
    fail(
      `styles tarball does not contain button/atl-button.css (${styles.files.join(', ')})`,
    );
  }

  const declared = reactPkg.dependencies?.['@atelier-ui/styles'];
  if (!declared) {
    fail(
      'dist/libs/react/package.json does not declare "@atelier-ui/styles" in dependencies — ' +
        'a consumer of @atelier-ui/react cannot resolve its CSS imports.',
    );
  } else if (declared !== stylesPkg.version) {
    fail(
      `react declares @atelier-ui/styles@${declared} but the built styles package is ${stylesPkg.version} ` +
        '(must be the concrete, lockstep version — not "*", a range or "workspace:").',
    );
  }

  // Throw-away consumer.
  const app = join(scratch, 'app');
  mkdirSync(app);
  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify(
      {
        name: 'consumer',
        private: true,
        type: 'module',
        overrides: { '@atelier-ui/styles': `file:${styles.file}` },
      },
      null,
      2,
    ),
  );
  run(
    'npm',
    [
      'install',
      react.file,
      '--offline',
      '--no-audit',
      '--no-fund',
      '--ignore-scripts',
      '--legacy-peer-deps',
    ],
    { cwd: app },
  );

  writeFileSync(
    join(app, 'entry.js'),
    "import { AtlButton, AtlTooltip } from '@atelier-ui/react';\nconsole.log(AtlButton, AtlTooltip);\n",
  );

  let result;
  try {
    result = await build({
      entryPoints: [join(app, 'entry.js')],
      bundle: true,
      format: 'esm',
      outdir: join(app, 'out'),
      absWorkingDir: app,
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      metafile: true,
      logLevel: 'silent',
    });
  } catch (err) {
    fail(
      `esbuild could not bundle @atelier-ui/react from the installed tarballs:\n${(
        err.errors ?? [err]
      )
        .map((e) => `    ${e.text ?? e.message}`)
        .join('\n')}`,
    );
  }

  if (result) {
    const cssFile = join(app, 'out/entry.css');
    const css = existsSync(cssFile) ? readFileSync(cssFile, 'utf8') : '';
    const flat = css.replace(/\s+/g, ' ');
    if (!css.includes('.atl-button')) {
      fail('bundled CSS has no .atl-button rule.');
    }
    if (!css.includes(EXPECT_SELECTOR)) {
      fail(`bundled CSS lacks the selector ${EXPECT_SELECTOR}.`);
    }
    if (!flat.includes(EXPECT_DECLARATION)) {
      fail(`bundled CSS lacks the declaration "${EXPECT_DECLARATION}".`);
    }
    if (!css.includes(EXPECT_SHARED_TOOLTIP_SELECTOR)) {
      fail(
        `bundled CSS lacks the shared tooltip selector ${EXPECT_SHARED_TOOLTIP_SELECTOR}.`,
      );
    }
    if (!css.includes(EXPECT_NATIVE_SELECTOR)) {
      fail(
        `bundled CSS lacks ${EXPECT_NATIVE_SELECTOR}: atl-tooltip.native.css did not travel with ` +
          '@atelier-ui/react.',
      );
    }
    const inputs = Object.keys(result.metafile.inputs);
    const fromPackage = inputs.some((p) =>
      p.endsWith('node_modules/@atelier-ui/styles/button/atl-button.css'),
    );
    const nativeFromPackage = inputs.some((p) =>
      p.endsWith(
        'node_modules/@atelier-ui/styles/tooltip/atl-tooltip.native.css',
      ),
    );
    if (!nativeFromPackage) {
      fail(
        'atl-tooltip.native.css was not read from node_modules/@atelier-ui/styles in the consumer.',
      );
    }
    if (!fromPackage) {
      fail(
        'the CSS was not read from node_modules/@atelier-ui/styles in the consumer ' +
          `(inputs: ${inputs.join(', ')}).`,
      );
    }
  }
} catch (err) {
  fail(err.message);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}

if (failures.length) {
  console.error(
    '✗ check:pack-styles — @atelier-ui/react is not self-contained when installed:',
  );
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(
  '✓ check:pack-styles — installing the packed @atelier-ui/react pulls @atelier-ui/styles, and a bundle of AtlButton and AtlTooltip carries the .atl-button CSS and the React/Vue-only tooltip CSS (atl-tooltip.native.css).',
);
