import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  NX_VERSION,
  readJson,
  removeDependenciesFromPackageJson,
  Tree,
  updateJson,
  writeJson,
} from '@nx/devkit';
import { spawn, type SpawnOptions } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PresetGeneratorSchema } from './schema';

function readTemplate(relativePath: string): string {
  return readFileSync(join(__dirname, 'files', relativePath), 'utf-8');
}

// All five packages this monorepo publishes (angular, react, vue,
// create-workspace, create-atelier-ui-workspace) release in lockstep from
// nx.json's `libraries` release group — they always carry the same version.
// So rather than pinning @atelier-ui/<framework> to `latest` (which drifts
// out from under a workshop the moment a newer version ships, and can't be
// reproduced later), the preset pins it to ITS OWN version: this package's
// package.json, one level above `src/generators/preset` from this file.
// Verified to resolve identically from both places this file runs as:
// `libs/create-workspace/src/generators/preset/preset.ts` under jest
// (ts-jest preserves the real on-disk __dirname), and the published
// `dist/libs/create-workspace/src/generators/preset/preset.js` (the
// `@nx/js:tsc` build mirrors the same src-relative depth under dist/, and
// its default `generatePackageJson` behaviour writes a package.json at
// dist/libs/create-workspace — confirmed against this repo's own dist/ output).
function readOwnVersion(): string {
  const pkgPath = join(__dirname, '../../../package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as {
    version?: string;
  };
  if (!pkg.version) {
    throw new Error(`Cannot read a "version" field from ${pkgPath}`);
  }
  return pkg.version;
}

const SITE_URL = 'https://atelier.pieper.io';

type Framework = 'angular' | 'react' | 'vue';

// Pinned to the exact version this monorepo runs (root package.json
// devDependencies) — the workshop needs the same Storybook every attendee's
// neighbour has, not whatever `latest` resolves to on the day of the cohort.
const STORYBOOK_VERSION = '10.6.0';

// Storybook's `framework.name` package per scaffolded app, and the exact
// devDependency set each one needs beyond the common addons below.
const STORYBOOK_FRAMEWORK_PACKAGE: Record<Framework, string> = {
  angular: '@storybook/angular-vite',
  react: '@storybook/react-vite',
  vue: '@storybook/vue3-vite',
};

// Templates that contain literal TypeScript source (not JSX) are suffixed
// `.template` in files/storybook/<fw>/ so that neither tsc nor the asset-copy
// glob touches them before this generator ships: tsconfig.lib.json's
// `include: ["src/**/*.ts"]` would otherwise compile them as part of this
// package's own build, and project.json's build `assets` glob
// (`**/!(*.ts)`) explicitly excludes `.ts` files from the verbatim asset
// copy — between the two, a template literally named `main.ts` would be
// transpiled away and never reach dist/ under a name this generator's
// `readTemplate()` can find at runtime. `.tsx` files (no literal `.ts`
// suffix) hit neither rule and are stored under their real name. Verified the
// hard way once already: `contracts/types.ts` and `contracts/button.contract.ts`
// (no `.template` suffix) threw `ENOENT` from inside a packed npm tarball —
// see sync-preflight.mjs's comment on those two entries.
function storybookTemplateName(
  framework: Framework,
  base:
    | 'main.ts'
    | 'preview'
    | 'atl-button.stories'
    | 'vitest.config'
    | 'vitest.setup',
) {
  if (base === 'main.ts') return `storybook/${framework}/main.ts.template`;
  // vitest.config.ts and .storybook/vitest.setup.ts are always written out
  // as plain `.ts` regardless of framework — unlike main.ts/preview/the
  // example story, react does NOT get a `.tsx` variant for these (neither
  // file contains JSX), so both need the `.template` dodge on every framework.
  if (base === 'vitest.config' || base === 'vitest.setup')
    return `storybook/${framework}/${base}.ts.template`;
  const ext = framework === 'react' ? 'tsx' : 'ts.template';
  return `storybook/${framework}/${base}.${ext}`;
}

// The destination filename written into the scaffolded workspace — a plain,
// correct `.ts`/`.tsx` extension regardless of the source template's name.
function storybookOutputExt(framework: Framework) {
  return framework === 'react' ? 'tsx' : 'ts';
}

// S5's own template lookup, mirroring storybookTemplateName()'s `.template`
// dodge above: `vitest.unit.config.ts` and `test-setup.ts` contain no JSX on
// any framework, so both always need the suffix; `atl-button.spec` follows
// the same per-framework extension as the example story (`.tsx` on react,
// `.ts.template` elsewhere).
function testingTemplateName(
  framework: Framework,
  base: 'vitest.unit.config' | 'test-setup' | 'atl-button.spec',
): string {
  if (base === 'atl-button.spec') {
    const ext = framework === 'react' ? 'tsx' : 'ts.template';
    return `testing/${framework}/atl-button.spec.${ext}`;
  }
  return `testing/${framework}/${base}.ts.template`;
}

// The workspace's own component skill (`.claude/skills/atelier-component/`)
// ships as a static `files/` template — its instructions don't vary by
// framework except for two names: the app directory (`workshop-<fw>`) and
// the `@atelier-ui/<fw>` package/framework name. Rather than rewrite it as a
// JS template string (like CLAUDE.md/README.md below, which vary in far more
// places), it stays a template file with those two spots marked
// `<app>`/`<framework>`, substituted here at generate time.
//
// `<app>` and `<framework>` (angle-bracket-wrapped) were chosen as the
// substitution tokens deliberately, over inventing a new one: the skill's own
// prose already uses the BARE words "app" and "framework" as ordinary
// English (e.g. "one app (`workshop-<framework>`), one framework, ..." and "
// ... two-way bindings ... for this framework"), so a substitution key of the
// bare word would have corrupted those sentences. The angle-bracket form is
// the one substring that appears ONLY at the seven spots meant to be filled
// in (four `<app>`, three `<framework>`) — verified against the shipped
// file, not assumed — and is
// distinct from the file's other bracketed placeholder, `<name>` (a
// component name, e.g. in `<name>.contract.ts`), which stays generic prose
// for the reader and must NOT be substituted.
function renderAtelierComponentSkill(
  appName: string,
  framework: Framework,
): string {
  // `.split(token).join(value)` rather than `String.prototype.replaceAll`:
  // this package's tsconfig targets a lib below ES2021, where `replaceAll`
  // doesn't type-check.
  return readTemplate('claude/skills/atelier-component/SKILL.md')
    .split('<app>')
    .join(appName)
    .split('<framework>')
    .join(framework);
}

// Splices `block` (one or more object literals, as raw source text, starting
// with a leading comma) into the flat ESLint config a framework's own
// application generator (@nx/angular, @nx/react, @nx/vue — all invoked with
// `linter: 'eslint'` below) already wrote at `path`, immediately before the
// file's closing `];`, and prepends any `imports` the block needs.
//
// This is text surgery, not an AST rewrite, and that is deliberate: the
// generated file is Nx's, not ours, and a future Nx version reshaping it
// should not silently swallow this addition the way editing its AST in place
// might. `@nx/eslint`'s own flat-config codegen (confirmed by actually
// running the three application generators against an in-memory Tree —
// verified for this Nx version, not assumed) always emits a single
// `export default [ ... ];` as the file's last statement, so anchoring on the
// final `];` is stable across the Nx versions this generator supports.
// `formatFiles(tree)` at the end of presetGenerator reformats whatever this
// produces, so exact indentation here doesn't matter.
//
// Throws loudly if the file is missing or doesn't have that shape, rather
// than silently skipping the addition — same reasoning as the storybook
// targets' `updateJson` calls below: a workshop app whose ESLint config
// silently didn't get the framework's accessibility rule is worse than a
// generator that stops.
function appendToFlatEslintConfig(
  tree: Tree,
  path: string,
  block: string,
  imports: string[] = [],
): void {
  const content = tree.read(path, 'utf-8');
  if (content === null) {
    throw new Error(
      `Cannot find ${path} — expected the framework application generator to have already written a flat ESLint config there (this generator always passes linter: 'eslint').`,
    );
  }
  const closeIndex = content.lastIndexOf('];');
  if (closeIndex === -1) {
    throw new Error(
      `${path} does not end with a flat-config array ("];") — the framework application generator's ESLint output may have changed shape; appendToFlatEslintConfig needs updating.`,
    );
  }
  const importPrefix = imports.length ? `${imports.join('\n')}\n` : '';
  tree.write(
    path,
    importPrefix +
      content.slice(0, closeIndex) +
      block +
      content.slice(closeIndex),
  );
}

// Ported CSS-discipline stylelint rules (ADR-0130): assembles the scaffold's
// own stylelint.config.mjs — the one override block for the scaffold's single
// `workshop-<fw>/src` tree, mirroring this repo's own stylelint.config.mjs
// (which does the same per libs/{angular,react,vue}). Built as a template
// string here rather than a static files/ template, because the app-relative
// paths it names depend on which framework was selected — the same reason
// CLAUDE.md/README.md below are assembled from `framework`, not copied
// verbatim.
//
// Only three of the four shipped rules are wired: `atelier/no-primitive-token`
// polices reaching past the semantic token tier into a primitive ramp (e.g.
// `--ui-color-teal-500`), which presupposes knowing that ramp exists — this
// workspace's own tokens.css has no such tiering to police. The file still
// ships (see the loop that writes tools/stylelint-rules/* below) because
// index.js requires all four rule files unconditionally, and a
// byte-identical index.js (kept in sync with the canonical copy by
// sync-preflight.mjs) is worth more than a scaffold-specific fork that drops
// one require().
//
// Neither wired rule is given `componentRoot` or `allowlistsFile`: this
// workspace ships no allowlists.js, so every exemption map defaults to empty
// and the staleness scan those two options drive never runs (documented in
// each rule's own header in tools/stylelint-rules/) — passing them here would
// configure a scan that can never find anything.
function buildStylelintConfig(framework: Framework): string {
  const appName = `workshop-${framework}`;
  const tokensCss = `${appName}/src/styles/tokens.css`;
  const overrides = `    {
      files: ['${appName}/src/**/*.css'],
      rules: {
        'atelier/no-raw-color-literal': true,
        'atelier/no-undeclared-token': [true, { tokenFiles: ['${tokensCss}'] }],
        'atelier/no-token-bypass': [true, { tokenFile: '${tokensCss}' }],
      },
    },`;

  return `// This workspace's own CSS-discipline rules only ('tools/stylelint-rules/')
// — ported from the parent Atelier monorepo (ADR-0130). No
// stylelint-config-standard or any other base config: stylelint 16+ ships no
// built-in formatting/stylistic rules at all (split out to the separate,
// opt-in @stylistic plugin, which this workspace does not install), so there
// is nothing here that could fight Prettier.
//
// Three of the four shipped rules are wired below. atelier/no-primitive-token
// is NOT — it polices reaching past the semantic token tier into a primitive
// ramp, which presupposes knowing that ramp exists, and this workspace's own
// tokens.css has no such tiering. The three below catch what an attendee does
// by writing ordinary component CSS on day one: a raw color literal, a
// typo'd or undeclared --ui-* token, and a literal that duplicates a token's
// value instead of binding to it.
//
// tokens.css itself is EXCLUDED from the app's stylelint target (via
// --ignore-pattern in the app's project.json, not an exemption here): it is
// the one file that legitimately spells out raw color/dimension literals as
// token DEFINITIONS — the opposite of what these rules police in a file that
// CONSUMES tokens.
import atelier from './tools/stylelint-rules/index.js';

export default {
  plugins: [atelier],
  rules: {},
  overrides: [
${overrides}
  ],
};
`;
}

// The four storybookjs/mcp skills this generator installs post-scaffold (S2).
// Pinned the same way ADR-0110 pins figma-console-mcp: a skill install is a
// remote pull of skill *text*, and an un-pinned CLI could silently change what
// gets written into an attendee's .claude/skills/ between one workshop and the
// next.
const SKILLS_CLI_VERSION = '1.5.25';
const SKILLS_ADD_ARGV = [
  '-y',
  `skills@${SKILLS_CLI_VERSION}`,
  'add',
  'storybookjs/mcp',
  '--skill',
  '*',
  '--agent',
  'claude-code',
  '--yes',
  '--copy',
];
// Kept in sync with SKILLS_ADD_ARGV by hand — this is the string shown to a
// human (the failure warning, CLAUDE.md, README.md), quoted the way a real
// shell needs it. It is unrelated to how SKILLS_ADD_ARGV itself reaches the
// child process below: on POSIX it goes straight to `spawn` as an argv array
// with no shell involved (so nothing there needs quoting at all), and on
// Windows it is re-quoted for cmd.exe by `quoteForCmdExe` — this constant
// exists only for the text a person reads and re-types by hand.
const SKILLS_ADD_COMMAND_FOR_HUMANS = `npx -y skills@${SKILLS_CLI_VERSION} add storybookjs/mcp --skill "*" --agent claude-code --yes --copy`;
// Bounds the CLI's own git clone (it reads this env var itself) so a bad
// conference network fails fast with a clear message instead of hanging.
const SKILLS_CLONE_TIMEOUT_MS = 60_000;

// The contract loop (ADR-0121 S4): figma-snapshot-contracts.mjs imports the
// MCP SDK directly (the same client figma-snapshot.mjs uses), pinned to the
// exact version this monorepo runs (root package.json devDependencies) so
// the scaffold's copy behaves the same as the canonical script.
const MCP_SDK_VERSION = '^1.29.0';
// ts-eval.js (shared by check-contracts.mjs and figma-snapshot-contracts.mjs)
// needs `typescript` at runtime. Every framework's Nx application generator
// already adds it, so this is a safety net, not the primary source — see the
// conditional add near the end of presetGenerator, which only includes this
// constant in the devDependencies write when `typescript` isn't already
// present.
const TYPESCRIPT_VERSION = '6.0.3';

// Ported CSS-discipline stylelint rules (ADR-0130): pinned the same way
// STORYBOOK_VERSION above is — the exact version this monorepo actually
// runs, not the caret range root package.json declares (`^17.15.0`); the
// resolved, installed version (package-lock.json) is 17.15.0, and that's
// the one every attendee's neighbour should get too. No `postcss-html`
// devDependency: that's only needed to lint `.astro` files, and the
// scaffold has none.
const STYLELINT_VERSION = '17.15.0';

// Formatting enforcement (measured 2026-09-12 against a real workspace
// generated through this preset via a local verdaccio, per
// tasks/todo.md — not assumed from Nx's docs): a freshly `create-nx-workspace`'d
// tree declares no `prettier` devDependency and writes no `.prettierrc` — this
// monorepo's own ADR-0127 baseline ("configured and never enforced") does not
// even get as far as "configured" here, it has to be added from scratch. Root
// package.json's own declaration (`~3.9.6`) is already a tight tilde, not the
// wide caret range some of this file's other *_VERSION constants have to
// narrow — package-lock.json resolves it to the same 3.9.6, so there's no
// "declared vs. actually resolved" gap to reconcile.
const PRETTIER_VERSION = '~3.9.6';

// Browser-mode Storybook tests (owner correction, 2026-09-10, to ADR-0123's
// "no test runner" decision — see the dated correction on that record).
// Every scaffolded app gets its own vitest.config.ts + storybook-test target,
// mirroring libs/{angular,react,vue}/vitest.storybook.config.ts. Versions are
// copied verbatim from the monorepo's own root package.json — most are exact
// pins there; `vitest` and `@vitest/browser-playwright` are themselves caret
// ranges in root package.json, so they stay caret ranges here too, rather
// than inventing an exact pin root itself doesn't have.
const VITEST_VERSION = '^4.0.8';
const VITEST_BROWSER_PLAYWRIGHT_VERSION = '^4.1.0';
// @vitest/browser-playwright declares a PEER (not transitive) dependency on
// `playwright` itself (peerDependencies: { playwright: "*" }). Root
// package.json has no bare `playwright` entry — only `@playwright/test`
// (^1.36.0), whose own dependency on `playwright` satisfies the peer there
// via monorepo-wide hoisting. A standalone scaffold gets no such hoist, so
// the bare peer is pinned here directly, at the same range @playwright/test
// itself uses — there is no "exact version root package.json has" for the
// bare package to copy, since root never names it.
const PLAYWRIGHT_VERSION = '^1.36.0';
const VITE_PLUGIN_REACT_VERSION = '6.1.1';
const VITE_PLUGIN_VUE_VERSION = '^6.0.5';
const ANALOGJS_VITE_PLUGIN_ANGULAR_VERSION = '2.7.1';
// Imported by Vue's browser-mode vitest.setup.ts.template (custom jest-dom
// matchers, mirroring libs/vue/.storybook/vitest.setup.ts exactly) AND, since
// S5, by every framework's own src/test-setup.ts (the jsdom unit-test
// runner's setup file) — the same custom matchers there too.
const TESTING_LIBRARY_JEST_DOM_VERSION = '^6.9.1';

// S5 — the unit test runner (`nx test`, jsdom, separate from the browser-mode
// story tests above): each framework's own Testing Library, `jsdom` itself
// (Vitest doesn't bundle a DOM implementation — `environment: 'jsdom'` needs
// the package installed), and Angular's `@analogjs/vitest-angular` (the
// TestBed setup helpers `libs/angular/src/test-setup.ts` uses, mirrored here
// per the same file). Versions copied verbatim from this monorepo's own root
// package.json, like the vitest/browser-mode constants above.
const TESTING_LIBRARY_ANGULAR_VERSION = '^19.2.1';
const TESTING_LIBRARY_REACT_VERSION = '^16.3.2';
const TESTING_LIBRARY_VUE_VERSION = '^8.1.0';
const JSDOM_VERSION = '^27.1.0';
// Same pin as ANALOGJS_VITE_PLUGIN_ANGULAR_VERSION above — both packages are
// released in lockstep by @analogjs.
const ANALOGJS_VITEST_ANGULAR_VERSION = '2.7.1';
// The Vue eslint.config.mjs addition above (see the appendToFlatEslintConfig
// call in the vue branch) imports this directly. @nx/eslint's own root config
// setup already adds it unconditionally regardless of framework or of
// whether `prettier` itself is installed (confirmed by running all three
// application generators against an empty Tree), so the conditional add near
// the end of presetGenerator below is a safety net, not the primary source —
// same reasoning as TYPESCRIPT_VERSION above. Version matches what that run
// installed.
const ESLINT_CONFIG_PRETTIER_VERSION = '^10.0.0';
// Hard kill for the whole child process — a backstop above the CLI's own
// clone timeout, covering the install/copy phase after the clone too.
const SKILLS_INSTALL_TIMEOUT_MS = 120_000;

// `execFile` (and its promisified form) never actually spawns a shell — it
// forwards only a fixed allowlist of options to the underlying `spawn` call,
// and `stdio` is not on that list. Measured: `promisify(execFile)(...,
// { stdio: 'inherit' })` still resolves with the child's stdout captured in
// `result.stdout`, and nothing is written to this process's own stdout in
// the meantime — the attendee would see a silent multi-minute pause (the
// CLI's own clone can take that long over a bad conference network) and then
// either a success or failure with no progress in between. `spawn` (used
// below) genuinely honours `stdio: 'inherit'`, wiring the child's streams to
// this process's own so the CLI's progress reaches the terminal live.
//
// `process.platform` is read live inside `runSkillsAddCommand` (rather than
// cached in a module-level constant) so a test can stub it per-case without
// having to reset and re-import the module.

// `spawn`'s `shell: true` mode does not escape an `args` array for you — it
// just space-joins `[command, ...args]` before handing the result to the
// shell (this is exactly what Node's DEP0190 deprecation warns about:
// "Passing args to a child process with shell option true ... arguments are
// not escaped, only concatenated"). So this is not a general-purpose Windows
// command-line escaper — every token in SKILLS_ADD_ARGV is a fixed literal
// (a package specifier, a flag name, or the bare `*`) with no embedded quotes
// of its own, and wrapping a token in quotes whenever it contains whitespace
// or a metacharacter is sufficient for that fixed, known argv. `*`/`?` are
// included even though cmd.exe itself does not glob-expand them (unlike a
// POSIX shell, wildcard expansion on Windows is the invoked program's own
// job, not the shell's) — quoting them anyway is the belt-and-suspenders
// match for the POSIX side's guarantee, so `--skill "*"` reaches npx as a
// literal one-character string on both platforms by construction, not by
// relying on cmd.exe's particular behaviour.
function quoteForCmdExe(token: string): string {
  return /[\s"^&|<>()*?]/.test(token)
    ? `"${token.replace(/"/g, '\\"')}"`
    : token;
}

// Runs `npx <SKILLS_ADD_ARGV...>` with the child's stdio wired to this
// process's own, resolving on a clean exit and rejecting with a descriptive
// error otherwise (non-zero exit, the install timeout killing the child, or
// the child never starting at all) — installSkills' catch block below turns
// any of those into the same non-fatal warning.
function runSkillsAddCommand(
  cwd: string,
  env: NodeJS.ProcessEnv,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    let settled = false;
    // Set only by the Windows timeout backstop below — the `exit` handler
    // needs it because a `taskkill /F` termination is not guaranteed to show
    // up as a `signal` on the `exit` event the way POSIX's SIGTERM does.
    let timedOut = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const spawnOptions: SpawnOptions = {
      cwd,
      env,
      stdio: 'inherit',
      // POSIX only. Bounds the whole install/copy phase (a backstop above the
      // CLI's own SKILLS_CLONE_TIMEOUT_MS-bounded clone) — `spawn` honours
      // `timeout` + `killSignal` natively, and on POSIX the process this
      // `child` refers to below IS `npx` itself (no shell in between), so the
      // signal reaches the right process. Deliberately not set on Windows —
      // see the `windowsTimeoutHandle` backstop after the child is spawned.
      ...(isWindows
        ? {}
        : { timeout: SKILLS_INSTALL_TIMEOUT_MS, killSignal: 'SIGTERM' }),
    };

    const child = isWindows
      ? // Windows can only execute a `.cmd` file (npx resolves to npx.cmd
        // there) through cmd.exe, and Node no longer shells out to run one
        // implicitly — a hardening in the Node 18.20 / 20.12 lines now
        // requires the caller to opt in with `shell: true`, or the spawn
        // never starts at all. That is exactly the platform `--copy` above
        // was chosen for, so this path has to work. `shell: true` (rather
        // than hardcoding the `npx.cmd` binary name) is enough on its own:
        // once cmd.exe is in the loop it resolves the bare `npx` via its own
        // PATHEXT lookup, the same as typing `npx` at a Windows prompt.
        // Because `shell: true` does not escape an args array (see
        // quoteForCmdExe above), the whole command line is built and quoted
        // by hand instead of passing SKILLS_ADD_ARGV as a separate array.
        spawn(['npx', ...SKILLS_ADD_ARGV].map(quoteForCmdExe).join(' '), {
          ...spawnOptions,
          shell: true,
        })
      : // POSIX: no shell is spawned at all, so nothing is in a position to
        // glob-expand the literal `*` in `--skill *` — `npx` is exec'd
        // directly with SKILLS_ADD_ARGV as its argv.
        spawn('npx', SKILLS_ADD_ARGV, spawnOptions);

    // Windows-only backstop for SKILLS_INSTALL_TIMEOUT_MS. `spawn`'s own
    // `timeout` + `killSignal` (used above for POSIX) only terminates the
    // process `child` actually refers to — under `shell: true` that is
    // cmd.exe, not `npx`. cmd.exe does not propagate termination to the
    // `npx`/npm/git descendants it launched, so relying on the same option
    // here would kill the shell while the clone it kicked off kept running
    // in the background — orphaned, and still writing into the scaffolded
    // workspace after this function had already rejected. `taskkill /T`
    // kills the whole process tree rooted at cmd.exe's pid instead of just
    // cmd.exe itself.
    //
    // UNVERIFIED ON WINDOWS: reasoned through from documented cmd.exe/
    // taskkill behaviour, but there is no Windows machine or CI runner
    // available in this environment to actually exercise it. Verify on a
    // real Windows box before relying on it.
    let windowsTimeoutHandle: ReturnType<typeof setTimeout> | undefined;
    if (isWindows) {
      windowsTimeoutHandle = setTimeout(() => {
        if (settled) return;
        timedOut = true;
        if (typeof child.pid === 'number') {
          // `taskkill` is a stock Windows binary, so this should never itself
          // fail to spawn — but an unhandled `error` event on a ChildProcess
          // throws, and there is nothing more useful to do here than swallow
          // it: the `exit` handler above has already been told (`timedOut`)
          // and will reject with the real, readable timeout message either way.
          spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
            stdio: 'ignore',
          }).on('error', () => undefined);
        }
      }, SKILLS_INSTALL_TIMEOUT_MS);
    }

    child.on('error', (error) => {
      // The child never started (e.g. `npx` not found on PATH).
      clearTimeout(windowsTimeoutHandle);
      settle(() => reject(error));
    });

    child.on('exit', (code, signal) => {
      clearTimeout(windowsTimeoutHandle);
      if (signal || timedOut) {
        settle(() =>
          reject(
            new Error(
              `npx was killed${signal ? ` by ${signal}` : ''} before finishing — most likely the ` +
                `${SKILLS_INSTALL_TIMEOUT_MS}ms install timeout on a slow or unreachable network`,
            ),
          ),
        );
        return;
      }
      if (code !== 0) {
        settle(() => reject(new Error(`npx exited with code ${code}`)));
        return;
      }
      settle(resolve);
    });
  });
}

// Exported (rather than inlined into the returned post-generator task) so it
// can be exercised directly in tests without also invoking the real
// `npm install` that `installTask`/`removePresetTask` run when called.
export async function installSkills(
  tree: Tree,
  skillsEnabled: boolean,
): Promise<void> {
  if (!skillsEnabled) return;

  console.log(
    `\n◇ Installing storybookjs/mcp skills (stories, storybook-init, storybook-setup, storybook-upgrade)…`,
  );
  try {
    // Runs in the scaffolded workspace's real root: by the time the
    // post-generator task calls this, Nx has already flushed the virtual Tree
    // to disk (that's what lets installTask run a real `npm install`).
    // `--copy` (not the CLI's default symlink farm) because an attendee on
    // Windows without developer mode cannot create symlinks. `--agent
    // claude-code` (not `--all`) so the scaffold doesn't also grow
    // `.cursor/`, `.codex/`, etc.
    const env: NodeJS.ProcessEnv = {
      ...process.env,
      DO_NOT_TRACK: '1',
      SKILLS_CLONE_TIMEOUT_MS: String(SKILLS_CLONE_TIMEOUT_MS),
    };
    await runSkillsAddCommand(tree.root, env);
  } catch (error) {
    // Non-fatal by design: a scaffold that dies on this last step because a
    // conference network can't reach GitHub is a ruined workshop morning; a
    // workspace merely missing its skills is a nuisance the attendee (or
    // facilitator) can fix with the command below.
    console.warn(
      `\n⚠ Could not install the storybookjs/mcp skills automatically (${
        error instanceof Error ? error.message : String(error)
      }).`,
    );
    console.warn(`  Run this by hand once you have network access:\n`);
    console.warn(`    ${SKILLS_ADD_COMMAND_FOR_HUMANS}\n`);
  }
}

export async function presetGenerator(
  tree: Tree,
  options: PresetGeneratorSchema,
) {
  const framework: Framework = (options.framework as Framework) ?? 'angular';

  const skillsEnabled = options.skills ?? true;

  // Pinned, not `latest` — see readOwnVersion()'s comment.
  const componentPackageVersion = readOwnVersion();

  const deps: Record<string, string> = {};

  // Every scaffolded workspace gets a local Storybook — not behind a flag
  // (2026-09-10 owner decision, tasks/todo.md "Storybook + the storybookjs/mcp
  // skills in the scaffolded workspace"). It exists so the storybookjs/mcp
  // skills installed below have a Storybook ≥ 10.5 with `@storybook/addon-mcp`
  // to talk to; without it, the `stories` skill's own first move on any UI task
  // would be to propose installing one.
  const storybookDevDeps: Record<string, string> = {
    storybook: STORYBOOK_VERSION,
    '@storybook/addon-mcp': STORYBOOK_VERSION,
    '@storybook/addon-a11y': STORYBOOK_VERSION,
    '@storybook/addon-docs': STORYBOOK_VERSION,
    // Browser-mode Storybook tests (owner correction 2026-09-10 to ADR-0123) —
    // written unconditionally, independent of which framework is selected; the
    // framework-specific Vite plugin is added conditionally, further below,
    // once the app generator has had a chance to bring its own in.
    '@storybook/addon-vitest': STORYBOOK_VERSION,
    vitest: VITEST_VERSION,
    '@vitest/browser-playwright': VITEST_BROWSER_PLAYWRIGHT_VERSION,
    playwright: PLAYWRIGHT_VERSION,
  };

  const appName = `workshop-${framework}`;

  if (framework === 'angular') {
    console.log(`\n◇ Generating Angular workshop app…`);
    // NX_VERSION is the version of the nx running this generator, which is the
    // one create-nx-workspace installed into the workspace. Pinning to it is not
    // tidiness: nx ships core and plugins as one release and they reach across
    // the package boundary, so a plugin one patch ahead of core throws at load.
    // `@nx/eslint@23.1.2` calls `combineGlobPatterns` from `@nx/devkit/internal`,
    // which `@nx/devkit@23.1.1` does not export — measured, and it broke CI the
    // day 23.1.2 was published.
    //
    // This is also why `@nx/angular` is an OPTIONAL peer of this package. npm
    // auto-installs a required peer, and `>=22.0.0` resolves to whatever is
    // latest — measured: it installed @nx/angular 23.1.2 into a workspace whose
    // nx was 23.1.1, dragging @nx/eslint 23.1.2 with it, before this generator
    // ever ran. Optional peers are not auto-installed, so the first thing that
    // installs it is the line below, at the version that matches.
    await ensurePackage('@nx/angular', NX_VERSION);
    const {
      applicationGenerator: angularAppGenerator,
    } = require('@nx/angular/generators');
    await angularAppGenerator(tree, {
      name: appName,
      directory: appName,
      style: 'css',
      routing: true,
      standalone: true,
      ssr: false,
      skipTests: true,
      e2eTestRunner: 'none',
      skipFormat: true,
      // Without this, the generator's own linter choice defaults to
      // `normalizeLinterOption`'s non-interactive fallback: follow an
      // eslint setup already detected in the tree, or `'none'` if there is
      // none yet. A single-framework Angular scaffold (the common,
      // documented case — ADR-0084) starts from a genuinely empty tree, so
      // that fallback silently produced ZERO eslint.config.mjs and no
      // eslint devDependency at all — verified by running the real
      // generator against an empty workspace with this line omitted.
      // React and Vue below already pass this explicitly; Angular didn't,
      // which was the actual defect, not merely a posture gap.
      linter: 'eslint',
    });
    deps['@atelier-ui/angular'] = componentPackageVersion;

    // `flat/angular-template` above (written into workshop-angular's own
    // eslint.config.mjs by the application generator, confirmed by a real
    // run) already carries angular-eslint's `templateAccessibility` preset
    // — see libs/angular/eslint.config.mjs's comment for the 11 rules that
    // covers. This one isn't part of that preset (not `:accessibility:`
    // tagged in angular-eslint's README): WCAG 2.4.3, positive tabindex
    // fights natural DOM tab order. Same addition libs/angular's own config
    // makes on top of the identical preset.
    appendToFlatEslintConfig(
      tree,
      `${appName}/eslint.config.mjs`,
      `,
{
  // Not covered by \`flat/angular-template\` above (angular-eslint's own
  // \`templateAccessibility\` preset only) — WCAG 2.4.3, positive tabindex
  // fights natural DOM tab order. Mirrors libs/angular/eslint.config.mjs's
  // identical addition on top of the same preset.
  files: ['**/*.html'],
  rules: {
    '@angular-eslint/template/no-positive-tabindex': 'error',
  },
},
`,
    );
  }

  if (framework === 'react') {
    console.log(`\n◇ Generating React workshop app…`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { applicationGenerator: reactAppGenerator } =
      await ensurePackage<any>('@nx/react', NX_VERSION);
    await reactAppGenerator(tree, {
      name: appName,
      directory: appName,
      style: 'css',
      routing: true,
      bundler: 'vite',
      linter: 'eslint',
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
      skipFormat: true,
    } as Parameters<typeof reactAppGenerator>[1]);
    deps['@atelier-ui/react'] = componentPackageVersion;

    // Deliberately nothing added here. `flat/react` above (written into
    // workshop-react's own eslint.config.mjs by the application generator,
    // confirmed by a real run) already carries jsx-a11y's full 18-rule
    // active set — the same rule set libs/react/eslint.config.mjs relies on
    // without adding anything of its own either.
  }

  if (framework === 'vue') {
    console.log(`\n◇ Generating Vue workshop app…`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { applicationGenerator: vueAppGenerator } = await ensurePackage<any>(
      '@nx/vue',
      NX_VERSION,
    );
    await vueAppGenerator(tree, {
      name: appName,
      directory: appName,
      style: 'css',
      routing: true,
      linter: 'eslint',
      unitTestRunner: 'none',
      e2eTestRunner: 'none',
      skipFormat: true,
    } as Parameters<typeof vueAppGenerator>[1]);
    deps['@atelier-ui/vue'] = componentPackageVersion;

    // @nx/vue's own application generator (confirmed by a real run against
    // an in-memory Tree, packed from the exact pinned version — @nx/vue is
    // an optional peer, not installed in this workspace) DOES match `.vue`
    // files and wire vue-eslint-parser + typescript-eslint's parser for
    // them via `parserOptions.parser` — the gap this generator's own
    // libs/vue/eslint.config.mjs once had (`.vue` files matched by no
    // config at all) does not exist in the scaffold. What IS missing,
    // mirrored below from libs/vue/eslint.config.mjs:
    //
    // 1. `eslint-config-prettier` after eslint-plugin-vue's rules, scoped
    //    to `.vue` — without it, eslint-plugin-vue's layout/whitespace
    //    rules (max-attributes-per-line, html-self-closing, …) fight
    //    Prettier. eslint-config-prettier is already an unconditional
    //    devDependency here (added by @nx/eslint's own root config setup,
    //    confirmed by the same run), independent of whether `prettier`
    //    itself is installed — the defensive add near the end of
    //    presetGenerator below is a safety net for that, not the primary
    //    source.
    // 2. `vue/no-unused-properties` — not part of any eslint-plugin-vue
    //    preset, opted in explicitly.
    //
    // Deliberately NOT mirrored: libs/vue/eslint.config.mjs also re-scopes
    // eslint-plugin-vue's `flat/recommended` essential/strongly-recommended
    // /recommended blocks to `**/*.vue` (verified here too: those blocks
    // carry no `files` restriction in the installed eslint-plugin-vue, so
    // @nx/vue's own `...vue.configs['flat/recommended']` spread — which
    // this generator does not rewrite, only append to — applies Vue-only
    // rules to every .ts/.js file in the app as well). Doing the same here
    // would mean rewriting a block the application generator wrote, not
    // appending to it, which is the one thing this helper is built to
    // avoid; the practical exposure in a fresh single-app scaffold is low
    // (no .spec.ts/.stories.ts test-double files exist yet at this point in
    // the generator, and @nx/vue already turns off the rule most likely to
    // misfire on plain .ts — vue/multi-word-component-names — project-wide
    // on its own). Recorded here rather than silently left unmentioned.
    appendToFlatEslintConfig(
      tree,
      `${appName}/eslint.config.mjs`,
      `,
{
  // eslint-plugin-vue's flat/recommended (spread above by @nx/vue's own
  // application generator) ships layout/whitespace rules that fight
  // Prettier — same gap libs/vue/eslint.config.mjs closes.
  files: ['**/*.vue'],
  rules: eslintConfigPrettier.rules,
},
{
  // Not part of any eslint-plugin-vue preset — opted in explicitly, same as
  // libs/vue/eslint.config.mjs: catches a declared prop nothing in the
  // component reads.
  files: ['**/*.vue'],
  rules: {
    'vue/no-unused-properties': ['error', { groups: ['props'] }],
  },
},
`,
      [`import eslintConfigPrettier from 'eslint-config-prettier';`],
    );
  }

  // Copy design tokens into the scaffolded app so attendees can edit them
  // directly. They're not imported from the @atelier-ui/<fw> npm package
  // because (a) those published packages don't ship tokens.css, and (b) a
  // workshop attendee editing colors in node_modules is a bad experience.
  tree.write(
    `${appName}/src/styles/tokens.css`,
    readTemplate('styles/tokens.css'),
  );

  // Prepend the tokens import to the app's global stylesheet
  const stylesPath = `${appName}/src/styles.css`;
  const existing = tree.exists(stylesPath)
    ? (tree.read(stylesPath, 'utf-8') ?? '')
    : '';
  tree.write(stylesPath, `@import './styles/tokens.css';\n\n${existing}`);

  // Storybook config: mirrors libs/{angular,react,vue}/.storybook/main.ts
  // minus staticDirs, the BUILD_STORYBOOK viteFinal block (hosted-path-only),
  // and @storybook/addon-designs (no Figma handoff doc to link from here).
  // @storybook/addon-vitest DOES ship (owner correction 2026-09-10 to
  // ADR-0123's original "no test runner" call).
  tree.write(
    `${appName}/.storybook/main.ts`,
    readTemplate(storybookTemplateName(framework, 'main.ts')),
  );
  tree.write(
    `${appName}/.storybook/preview.${storybookOutputExt(framework)}`,
    readTemplate(storybookTemplateName(framework, 'preview')),
  );
  if (framework === 'angular') {
    // The only framework that needs its own Storybook-scoped tsconfig — see
    // libs/angular/.storybook/tsconfig.json, which this mirrors against the
    // tsconfig.json the Angular application generator actually writes (both
    // shapes verified: `files: []`, `include: []`, `references` to app/spec).
    tree.write(
      `${appName}/.storybook/tsconfig.json`,
      readTemplate('storybook/angular/tsconfig.json'),
    );
  }

  // One example story per app: small on purpose — it exists so Storybook
  // isn't empty and the attendee has a working pattern to copy, not as a
  // second component showcase.
  tree.write(
    `${appName}/src/atl-button.stories.${storybookOutputExt(framework)}`,
    readTemplate(storybookTemplateName(framework, 'atl-button.stories')),
  );

  // Browser-mode Storybook tests (owner correction 2026-09-10 to ADR-0123 —
  // storybook-test / check:stories ship with the scaffold after all).
  // `vitest.config.ts` is always plain `.ts`, never `.tsx` — see
  // storybookTemplateName()'s comment. The literal filename matters:
  // @storybook/addon-vitest's `test-run` tool walks up from a story's
  // .storybook directory looking for the nearest vitest/vite config by
  // this standard name.
  tree.write(
    `${appName}/vitest.config.ts`,
    readTemplate(storybookTemplateName(framework, 'vitest.config')),
  );
  tree.write(
    `${appName}/.storybook/vitest.setup.ts`,
    readTemplate(storybookTemplateName(framework, 'vitest.setup')),
  );

  // S5 — the unit test runner: a second, unmarked Vitest config
  // (`vitest.unit.config.ts`, never `vitest.config.ts` — see that file's own
  // comment above and testingTemplateName()'s) so a composable, a service, a
  // helper, or a form-validation rule gets a fast, jsdom-based `nx test` —
  // not just the browser-mode story tests above. One example unit test per
  // app, same purpose as atl-button.stories.*: the pattern that gets copied.
  tree.write(
    `${appName}/vitest.unit.config.ts`,
    readTemplate(testingTemplateName(framework, 'vitest.unit.config')),
  );
  tree.write(
    `${appName}/src/test-setup.ts`,
    readTemplate(testingTemplateName(framework, 'test-setup')),
  );
  tree.write(
    `${appName}/src/atl-button.spec.${storybookOutputExt(framework)}`,
    readTemplate(testingTemplateName(framework, 'atl-button.spec')),
  );

  // The application generator (@nx/{angular,react,vue}:application, above)
  // guarantees `${appName}/project.json` exists at this point — updateJson
  // reads it first and throws `Cannot find ${path}` if it doesn't, which is
  // exactly the loud failure we want: a workshop app with a Storybook config
  // directory but no way to start it is worse than a generator that stops.
  // Always 6006 — the workshop scaffolds exactly one app, so there is no
  // second framework's Storybook to offset a port against.
  const storybookPort = 6006;
  updateJson(tree, `${appName}/project.json`, (config) => {
    config.targets ??= {};
    config.targets['storybook'] = {
      executor: 'nx:run-commands',
      options: {
        command: `npx storybook dev --config-dir ${appName}/.storybook --port ${storybookPort}`,
      },
    };
    config.targets['build-storybook'] = {
      executor: 'nx:run-commands',
      outputs: [`{workspaceRoot}/dist/storybook/${appName}`],
      options: {
        command: `npx storybook build --config-dir ${appName}/.storybook --output-dir dist/storybook/${appName}`,
      },
    };
    // Mirrors libs/{angular,react,vue}/project.json's own "storybook-test"
    // target exactly, modulo the config filename (vitest.config.ts here,
    // vitest.storybook.config.ts there — see storybookTemplateName()'s
    // comment on why the scaffold uses the standard name instead).
    config.targets['storybook-test'] = {
      executor: 'nx:run-commands',
      options: {
        command: 'npx vitest run --config vitest.config.ts',
        cwd: appName,
      },
    };
    // Ported CSS-discipline rules (ADR-0130): a sibling target, not folded
    // into `lint` — same reasoning as this repo's own libs/{fw}/project.json
    // (lint is inferred by @nx/eslint/plugin per project; overriding it to
    // also shell out would re-implement what inference gives for free).
    // --ignore-pattern excludes this app's own tokens.css from the run: it
    // is a token DEFINITION file, the one place these rules' raw literals
    // are supposed to live, not a file that reads/consumes tokens.
    config.targets['stylelint'] = {
      executor: 'nx:run-commands',
      options: {
        command: `stylelint '${appName}/src/**/*.css' --ignore-pattern '${appName}/src/styles/tokens.css' --config stylelint.config.mjs`,
      },
    };
    // S5 — the unit test runner. Mirrors "storybook-test" above exactly
    // (nx:run-commands + cwd), just pointed at vitest.unit.config.ts instead.
    // This REPLACES whatever "test" target the framework's own application
    // generator wrote: React/Vue write none (unitTestRunner: 'none'); Angular
    // writes its own native `@angular/build:unit-test` wiring regardless of
    // skipTests (confirmed against the real generator — skipTests only skips
    // generating example spec files, not the target). This workspace instead
    // mirrors libs/angular's own proven setup — @analogjs/vitest-angular +
    // a vite.config-style file — the same way on all three frameworks, so
    // `nx test` behaves identically across the workshop regardless of which
    // one was chosen.
    config.targets['test'] = {
      executor: 'nx:run-commands',
      options: {
        command: 'npx vitest run --config vitest.unit.config.ts',
        cwd: appName,
      },
    };
    return config;
  });

  storybookDevDeps[STORYBOOK_FRAMEWORK_PACKAGE[framework]] = STORYBOOK_VERSION;
  // @storybook/react-vite and @storybook/vue3-vite each carry their
  // non-vite renderer counterpart as a plain (non-peer) `dependency`, not
  // something npm/pnpm is told the app needs directly — but the story and
  // preview templates import straight from '@storybook/react' /
  // '@storybook/vue3' for the `Meta`/`StoryObj`/`Preview` types. That
  // resolves today only because npm hoists it; pnpm's stricter, non-hoisted
  // layout would leave the import unresolved. Angular has no matching case:
  // '@storybook/angular-vite' has no such counterpart to hoist, and the
  // angular templates import their types from '@storybook/angular-vite'
  // itself (see files/storybook/angular/*.template) — adding
  // '@storybook/angular' back here would reintroduce exactly the ERESOLVE
  // this generator now avoids (its peer on @angular-devkit/build-angular is
  // not satisfiable by a freshly scaffolded Angular 22 app).
  if (framework === 'react') {
    storybookDevDeps['@storybook/react'] = STORYBOOK_VERSION;
  }
  if (framework === 'vue') {
    storybookDevDeps['@storybook/vue3'] = STORYBOOK_VERSION;
  }

  // ─── Prettier (formatting enforcement) ───────────────────────────────────
  // Measured 2026-09-12 (tasks/todo.md, "A. Formatting enforcement"): a
  // fresh `create-nx-workspace` tree ships neither a `prettier`
  // devDependency nor a `.prettierrc` — this is the ADR-0127 problem before
  // even the "configured" half exists, so both are written here rather than
  // assumed present. Content is byte-identical to this monorepo's own
  // `.prettierrc` — no reason for a workshop attendee to start from a
  // different formatting convention than the repo whose components they're
  // consuming.
  console.log(`\n◇ Wiring Prettier…`);
  writeJson(tree, '.prettierrc', { singleQuote: true });

  // ─── Stylelint (ported CSS-discipline rules, ADR-0130) ───────────────────
  console.log(`\n◇ Wiring stylelint (ported CSS-discipline rules)…`);

  tree.write('stylelint.config.mjs', buildStylelintConfig(framework));

  // Six files, byte-identical to the canonical copies in tools/stylelint-rules/
  // (kept that way by this repo's own sync-preflight.mjs) — see
  // buildStylelintConfig's comment above for why no-primitive-token.js ships
  // even though it's never wired into the config just written.
  for (const ruleFile of [
    'index.js',
    'utils.js',
    'no-raw-color-literal.js',
    'no-undeclared-token.js',
    'no-primitive-token.js',
    'no-token-bypass.js',
  ]) {
    tree.write(
      `tools/stylelint-rules/${ruleFile}`,
      readTemplate(`tools/stylelint-rules/${ruleFile}`),
    );
  }

  // The config and the rule files above both live outside the project that
  // reads them (the app's own `stylelint` target added above) — exactly the
  // cache trap ADR-0130 proved twice in this repo's own nx.json. Mirrors this
  // repo's own targetDefaults.stylelint, minus
  // `tools/scripts/lib/allowlists.js` (the scaffold ships no such file — see
  // buildStylelintConfig's comment on why neither wired rule is given
  // `allowlistsFile`). The application generator above is guaranteed to
  // have already written nx.json (create-nx-workspace writes it before any
  // preset runs), so `updateJson` here is safe the same way the package.json
  // update below is.
  updateJson(tree, 'nx.json', (config) => {
    config.targetDefaults ??= {};
    config.targetDefaults['stylelint'] = {
      cache: true,
      inputs: [
        'default',
        '^default',
        '{workspaceRoot}/stylelint.config.mjs',
        '{workspaceRoot}/tools/stylelint-rules/**/*',
        `{workspaceRoot}/${appName}/src/styles/tokens.css`,
        { externalDependencies: ['stylelint'] },
      ],
    };
    return config;
  });

  // ─── The contract loop (ADR-0121 S4) ─────────────────────────────────────
  // contracts.config.json names the workshop's one framework and app —
  // `framework`/`appName`, already established above.
  console.log(
    `\n◇ Writing the contract loop (check:contracts, the example AtlButton contract, the Figma snapshot projection)…`,
  );

  // .ts.template, not .ts — see the comment on storybookTemplateName() above:
  // a literal `.ts` file under files/ is compiled away by this package's own
  // tsconfig.lib.json (`include: ["src/**/*.ts"]`) and never reaches dist/
  // under a name readTemplate() can find at runtime. The OUTPUT filenames
  // below stay plain `.ts` — only the template source needs the suffix.
  tree.write(
    `${appName}/src/contracts/types.ts`,
    readTemplate('contracts/types.ts.template'),
  );
  tree.write(
    `${appName}/src/contracts/README.md`,
    readTemplate('contracts/README.md'),
  );
  tree.write(
    `${appName}/src/contracts/button.contract.ts`,
    readTemplate('contracts/button.contract.ts.template'),
  );

  tree.write(
    'tools/scripts/check-contracts.mjs',
    readTemplate('tools/scripts/check-contracts.mjs'),
  );
  tree.write(
    'tools/scripts/lib/ts-eval.js',
    readTemplate('tools/scripts/lib/ts-eval.js'),
  );
  tree.write(
    'tools/scripts/lib/docgen.mjs',
    readTemplate('tools/scripts/lib/docgen.mjs'),
  );
  tree.write(
    'tools/scripts/figma-snapshot-contracts.mjs',
    readTemplate('tools/scripts/figma-snapshot-contracts.mjs'),
  );
  // The AtlButton-only projection of this repo's own tools/figma/snapshot.json
  // (gen-scaffold-snapshot.mjs) — gives check:contracts a Figma side for the
  // example contract + story on day one, before the attendee ever runs
  // figma:snapshot themselves.
  tree.write('tools/figma/snapshot.json', readTemplate('figma/snapshot.json'));

  writeJson(tree, 'contracts.config.json', {
    framework,
    contracts: `${appName}/src/contracts`,
    stories: [`${appName}/src`],
    snapshot: 'tools/figma/snapshot.json',
  });

  console.log(`\n◇ Writing project files (CLAUDE.md, README, .mcp.json)…`);

  // Write CLAUDE.md with framework-specific guidance
  let frameworkSection = '';
  if (framework === 'angular') {
    frameworkSection = `### Angular (\`@atelier-ui/angular\`)
- Selectors: \`atl-button\`, \`atl-input\`, \`atl-dialog\`, …
- Import: \`import { AtlButton } from '@atelier-ui/angular';\`
- Add to \`@Component({ imports: [AtlButton] })\`
- Form controls implement Signal Forms (\`FormValueControl\` / \`FormCheckboxControl\`)`;
  } else if (framework === 'react') {
    frameworkSection = `### React (\`@atelier-ui/react\`)
- Elements: \`<AtlButton>\`, \`<AtlInput>\`, \`<AtlDialog>\`, …
- Import: \`import { AtlButton } from '@atelier-ui/react';\`
- Event handlers follow \`onXxx\` / \`onXxxChange\` convention
- Toast: use \`useAtlToast()\` hook inside \`<AtlToastProvider>\``;
  } else if (framework === 'vue') {
    frameworkSection = `### Vue (\`@atelier-ui/vue\`)
- Elements: \`<AtlButton>\`, \`<AtlInput>\`, \`<AtlDialog>\`, …
- Import: \`import { AtlButton } from '@atelier-ui/vue';\`
- Two-way binding: \`v-model\` and \`v-model:value\` where applicable
- Toast: use \`useAtlToast()\` composable`;
  }

  // Idioms for the ONE framework this workspace scaffolds (tasks/todo.md's
  // "S3 — the workspace is set up for Claude Code" — a later plan than, and
  // unrelated to, the S1-S4 labels elsewhere in this file, which are this
  // package's own now-shipped Storybook/skills slices) — three to
  // four bullets, not an essay; each names the thing an attendee coming from
  // a different framework (or an agent trained on generic examples) is most
  // likely to get wrong on day one.
  let frameworkIdiomsSection = '';
  if (framework === 'angular') {
    frameworkIdiomsSection = `- Prefer signals (\`signal\`, \`computed\`, \`linkedSignal\`) over manual state
  bookkeeping — this workspace runs **zoneless** (no Zone.js), so change
  detection reacts to signal writes, not to arbitrary async callbacks.
- Use the built-in control-flow syntax (\`@if\`, \`@for\`, \`@switch\`) in
  templates, not the legacy \`*ngIf\`/\`*ngFor\` structural directives.
- Use \`inject()\` for dependency injection in fields and functions instead of
  constructor-parameter injection.
- Form controls implement Signal Forms (\`FormValueControl\` /
  \`FormCheckboxControl\`, not \`ReactiveFormsModule\`) — see Component Libraries
  above.`;
  } else if (framework === 'react') {
    frameworkIdiomsSection = `- Follow the Rules of Hooks: only call hooks at the top level of a component
  or custom hook, never inside a condition, loop, or nested function.
- This is a **Vite SPA, not an RSC app** — there are no Server Components, no
  \`"use client"\` directives, and no server actions; everything renders
  client-side.
- Keep \`useEffect\` dependency arrays honest — a missing dependency is a bug
  to fix, not a lint rule to silence.
- Event handlers on Atelier components follow the \`onXxx\` / \`onXxxChange\`
  convention (see Component Libraries above) — match it in your own composed
  components too.`;
  } else if (framework === 'vue') {
    frameworkIdiomsSection = `- Use \`<script setup>\` with the Composition API — no Options API (\`data()\`,
  \`methods\`, …) in new components.
- Use \`defineModel()\` for two-way-bound props instead of hand-rolling a
  \`modelValue\` prop plus \`emit('update:modelValue')\`.
- Prefer \`ref\`/\`reactive\` + \`computed\` over ad-hoc mutable state.
- Two-way binding on Atelier components follows \`v-model\` / \`v-model:value\`
  (see Component Libraries above) — mirror that convention in your own
  composed components.`;
  }

  const mcpSection = `### \`storybook-${framework}\` MCP
Before using any component:
1. Call \`docs-list\` to get valid component IDs
2. Call \`docs-show\` with the ID — never invent props
3. Call \`docs-show-story\` for a specific variant
4. Do not use a component that is not in the docs

### \`uianatomy\` MCP
Canonical component anatomy, axes, slots, transitions, motion, tokens, events, and
cross-framework/library divergences. Reach for it when a Storybook doc leaves a
prop's shape, an interaction, or a cross-library convention ambiguous.`;

  const angularCliMcpSection =
    framework === 'angular'
      ? `

### \`angular-cli\` MCP
Angular CLI best practices, API search, and docs lookups — prefer it over guessing
at \`ng\` flags or Angular API shape from memory.`
      : '';

  const versionsSection = `## Versions

\`@atelier-ui/${framework}\` is pinned to \`${componentPackageVersion}\` — the version
this workspace was scaffolded with — so the workshop is reproducible: every attendee
gets the same component behavior, not whatever \`latest\` happens to resolve to that
morning. Move it deliberately when you want a newer release:

\`\`\`bash
npm install @atelier-ui/${framework}@latest
\`\`\`
`;

  // S5a — the generated \`figma:snapshot\` npm script names the attendee's own
  // Figma file key when the CLI collected one (see the \`options.figmaFile\`
  // branch on \`pkg.scripts['figma:snapshot']\` further below); otherwise it
  // keeps today's literal \`<YOUR_FIGMA_FILE_KEY>\` placeholder. This sentence
  // has to agree with whichever branch that assignment takes, or CLAUDE.md
  // would tell the reader to edit a placeholder that was never written.
  const figmaSnapshotRefreshInstruction = options.figmaFile
    ? `\`figma:snapshot\` is already pointed at \`${options.figmaFile}\`; change it if you
duplicate the file again`
    : `edit the \`--file\` placeholder in \`package.json\`'s \`figma:snapshot\` script to
your own Figma file key`;

  tree.write(
    'CLAUDE.md',
    `# Atelier Workshop

This workspace uses Atelier for all UI components.
Full API reference: ${SITE_URL}/llms-full.txt

## MCP Servers

The servers are pre-configured in \`.mcp.json\` and connect automatically —
**but only once you've trusted this folder.** The first time you open this
workspace in Claude Code, accept the "do you trust the files in this folder?"
prompt; until then, \`.mcp.json\` and everything in \`.claude/settings.json\`
(the permissions allowlist, \`enableAllProjectMcpServers\`, the format-on-save
hook) are silently ignored, and every server below has to be approved by hand
instead. \`npm run preflight\` (see Troubleshooting) flags this if it's still
outstanding.

${mcpSection}${angularCliMcpSection}

## Component Libraries

${frameworkSection}

${versionsSection}

## Framework Idioms

${frameworkIdiomsSection}

## Composition Patterns

When composing multi-component flows (login form, settings page, confirmation dialog, data list, notification center, management dashboard), check the cookbook first:

- Browse: ${SITE_URL}/patterns
- JSON catalog (machine-readable): ${SITE_URL}/.well-known/cookbook-patterns.json

Patterns shown there are the canonical way to combine atoms in this library — prefer them over inventing a composition from scratch.

## Design Tokens

All colors, spacing, and radii use CSS custom properties. Never use
hardcoded hex values or pixel sizes — always reference a token.

Key tokens:
- Colors:   --ui-color-primary, --ui-color-text, --ui-color-surface-raised, --ui-color-border
- Spacing:  --ui-spacing-4 (1rem), --ui-spacing-6 (1.5rem), --ui-spacing-8 (2rem)
- Radius:   --ui-radius-sm (0.5rem), --ui-radius-md (0.625rem), --ui-radius-lg (0.875rem)

## Rules
- Prefer component props over custom CSS
- When custom styling is needed, use --ui-color-* and --ui-spacing-* tokens
- Do not install other UI component libraries alongside Atelier
- Do not add inline hex colors or hardcoded spacing values

## Formatting

Prettier is configured (\`.prettierrc\`, \`{ singleQuote: true }\`): \`npm run format\`
(\`prettier --write .\`) and \`npm run check:format\` (\`prettier --check .\`). The
scaffold itself is already Prettier-clean — \`check:format\` passes right after
\`npm install\`, before you've written a line of your own.

## Apps

- \`${appName}\` — run with \`npm start\`

## Storybook

The app has its own local Storybook:

- \`${appName}\` — \`npm run storybook\` — http://localhost:6006

Build a static Storybook (CI, hosting) with \`npm run build:storybook\`.

Every story is also a browser-mode test (\`@storybook/addon-vitest\`). One-time setup
after \`npm install\`:

\`\`\`bash
npx playwright install chromium
\`\`\`

Then run every app's stories headless in Chromium with axe checks:

\`\`\`bash
npm run check:stories
\`\`\`

## Agent Skills

This workspace also ships \`atelier-component\` (\`.claude/skills/atelier-component/SKILL.md\`)
unconditionally — this generator writes it straight to disk as part of scaffolding, with no
network fetch and no \`skills: false\` opt-out, unlike the four skills below. It runs the
Figma → contract → stories → checks loop scoped to what this workspace can actually check —
see the skill itself, or ask Claude Code to use it, for the loop and \`check:contracts\`'s
finding codes.

${
  skillsEnabled
    ? `The scaffold attempted to install four \`storybookjs/mcp\` skills for Claude
Code (\`.claude/skills/\`) during setup — a failed clone (offline, unreachable
registry) does not stop the workspace from being created, so this file can't
promise they actually landed. Check \`.claude/skills/\` for the four directories
below; re-run the command further down if any are missing:

- **stories** — invoke first, before creating, editing, or deleting components, stories, styles, CSS, themes, colors, or design tokens
- **storybook-init** — adding Storybook to a project that does not have it configured yet
- **storybook-setup** — Storybook is installed and you want a working \`preview\` file and stories for real components
- **storybook-upgrade** — Storybook exists but needs an upgrade

Re-run or update the install at any time:

\`\`\`bash
${SKILLS_ADD_COMMAND_FOR_HUMANS}
\`\`\`

**Which MCP tools these skills can reach depends on \`.mcp.json\`, not just on the
skills being present.** \`.mcp.json\` wires only the *hosted* Storybook MCP servers
(\`storybook-<fw>\` → ${SITE_URL}/storybook-<fw>/mcp), which serve the \`docs\`
toolset — \`docs-list\`, \`docs-show\`, \`docs-show-story\` all work out of the box.
The skills' \`dev\`-toolset tools (\`stories-preview\`, \`get-storybook-story-instructions\`)
instead come from \`@storybook/addon-mcp\` inside a *running local* Storybook
(already configured in every app's \`.storybook/main.ts\`) — that local endpoint is
deliberately not wired into \`.mcp.json\` by default, the same as this repo's own
root \`.mcp.json\`, because a fixed \`localhost\` entry would fail to connect on
every Claude Code session started without that Storybook already running. To use
the \`dev\` toolset: start \`npm run storybook\` (see Storybook below),
then add this to \`.mcp.json\`'s \`mcpServers\` (only while that Storybook is up):

\`\`\`json
"storybook-<fw>-local": {
  "type": "http",
  "url": "http://localhost:<port>/mcp"
}
\`\`\`

(\`<port>\` is the one listed for that app under Storybook below.) \`test-run\`
works too, once that local Storybook is running — every story here IS a
render + accessibility test (\`@storybook/addon-vitest\`, run offline via
\`npm run check:stories\`; see "The Contract Loop" below).`
    : `Skipped for this workspace (\`skills: false\`). Install the four \`storybookjs/mcp\`
skills for Claude Code by hand:

\`\`\`bash
${SKILLS_ADD_COMMAND_FOR_HUMANS}
\`\`\`
`
}

## API Design Principles

Every component in \`@atelier-ui/${framework}\` follows one set of API-design rules —
predictable naming across components, narrow literal-union types instead of \`string\`,
composition over configuration, and a sensible default for every prop — so a model that
has generated code for one component can infer the shape of the next. When you design
the API of your own component, these are the rules the library itself follows:

- Guide: ${SITE_URL}/design-principles

## The Contract Loop

A contract (\`${appName}/src/contracts/<name>.contract.ts\`) is the one hand-authored
spec file per component: the Figma master's node id, plus intentional Figma ↔ code
mismatches (\`figmaOnly\`, \`codeOnly\`, \`axisMap\`) — never props, defaults, or
descriptions; those live in the component's own types/JSDoc and its stories.

Order: read the Figma handoff → write the contract → write one story per variant and
interaction state → \`npm run check:contracts\` → \`figma_check_design_parity\` in Storybook.

\`check:contracts\` joins the contract, the component's docgen, and \`tools/figma/snapshot.json\`
offline — no browser, no Storybook build — and reports one line per finding:
- \`[CONTRACT-MISSING]\` / \`[CONTRACT-NODE]\` — no contract file, or its node id disagrees
- \`[AXIS]\` / \`[BOOLEAN]\` / \`[ENUM-UNDRAWN]\` — a Figma property has no matching code prop
- \`[COVERAGE]\` / \`[COVERAGE-BOOL]\` — a variant value or boolean is never rendered by a story
- \`[FIGMA-ONLY]\` / \`[STALE-EXEMPTION]\` / \`[UNMIRRORED]\` — an exemption is missing, stale, or unexplained
- \`[NO-STORY-META]\` / \`[NO-MASTER]\` — a contract with nothing yet to check it against
- \`[CONTRACT-IMPORT]\` — a story meta doesn't import its component's contract and set
  \`contract\` in \`parameters\` (a warning here, until this workspace ships a docs block
  that renders it)

Refresh \`tools/figma/snapshot.json\` from the real master with the Figma Desktop Bridge
connected: ${figmaSnapshotRefreshInstruction}, then run \`npm run figma:snapshot\`.

\`check:contracts\` proves shape and story coverage; \`npm run check:stories\` (every story,
rendered headless in Chromium via \`@storybook/addon-vitest\`, with axe) proves rendering
and accessibility. It does so for components whose source lives in this workspace. For
components imported from \`@atelier-ui/${framework}\` — the example \`AtlButton\`
included — the check recognises that the import resolves into \`node_modules\` and skips
docgen for it — the same rule in every framework — so it has nothing to compare and
reports only \`[NO-STORY-META]\`; their prop tables come from the hosted
Storybook MCP (\`docs-show\`) instead. A green \`check:contracts\` on the example story
therefore proves the wiring, not the example. Run \`npx playwright install chromium\`
once after \`npm install\` — see Storybook below.

## Definition of Done

A change here is done when all five of these pass:

- \`npm run check:format\` — Prettier
- \`npm run check:stylelint\` — the ported CSS-discipline rules
- \`npm run check:contracts\` — contract ↔ docgen ↔ Figma-snapshot parity
- \`npm run check:unit\` — jsdom unit tests (components, composables, helpers)
- \`npm run check:stories\` — every story, rendered in Chromium, axe-checked

**A gate's result is its exit code.** Run it as
\`<command> > /tmp/x.log 2>&1; echo $?\` and read the log afterwards — never pipe
a gate into \`head\` or \`grep\`. The pipe's own exit status is always \`0\`, which
silently turns a failing gate into a passing one. \`/verify\` runs all five and
reports each exit code (\`.claude/commands/verify.md\`).

## Troubleshooting

Run the preflight self-check to verify your environment:

\`\`\`bash
npm run preflight
\`\`\`

It checks Node, Claude CLI, \`FIGMA_ACCESS_TOKEN\`, MCP endpoint reachability, and port availability.
Full troubleshooting guide: ${SITE_URL}/troubleshooting
${
  options.figmaMcp
    ? `
## Figma Setup

The \`figma-console\` MCP is enabled in \`.mcp.json\`. It needs the Figma Desktop Bridge
plugin installed in the Figma desktop app before the server can respond.

Setup guide: ${SITE_URL}/figma-token

A \`FIGMA_ACCESS_TOKEN\` is optional — only required for REST-backed reads (screenshots,
file exports). The Desktop Bridge covers creation and inspection without a token.
`
    : ''
}
## Reference

- Component browser + docs: ${SITE_URL}
- MCP Playground (inspect tool responses): ${SITE_URL}/mcp
- CLAUDE.md template: ${SITE_URL}/claude-md
`,
  );

  // The contract loop's own devDependencies (ADR-0121 S4): the MCP SDK
  // figma-snapshot-contracts.mjs imports directly, always; `typescript` only
  // when the framework application generator (above) didn't already add it —
  // read from the tree's package.json as it stands right now, after the
  // framework's generator has run and before this generator's own writes
  // below it.
  const pkgSoFar = readJson(tree, 'package.json');
  const existingDeps: Record<string, string> = {
    ...(pkgSoFar.dependencies ?? {}),
    ...(pkgSoFar.devDependencies ?? {}),
  };
  const hasTypescript = Boolean(existingDeps.typescript);
  const contractLoopDevDeps: Record<string, string> = {
    '@modelcontextprotocol/sdk': MCP_SDK_VERSION,
  };
  if (!hasTypescript) {
    contractLoopDevDeps.typescript = TYPESCRIPT_VERSION;
  }

  // Browser-mode Storybook tests (owner correction 2026-09-10 to ADR-0123):
  // the selected framework needs its own Vite plugin for the vitest browser
  // pipeline, added only when the framework's own application generator
  // (above) didn't already bring it in. React and Vue's vite-based app
  // generators typically already do; Angular's esbuild-based one never does.
  const viteFrameworkDevDeps: Record<string, string> = {};
  if (framework === 'react' && !existingDeps['@vitejs/plugin-react']) {
    viteFrameworkDevDeps['@vitejs/plugin-react'] = VITE_PLUGIN_REACT_VERSION;
  }
  if (framework === 'vue' && !existingDeps['@vitejs/plugin-vue']) {
    viteFrameworkDevDeps['@vitejs/plugin-vue'] = VITE_PLUGIN_VUE_VERSION;
  }
  if (
    framework === 'angular' &&
    !existingDeps['@analogjs/vite-plugin-angular']
  ) {
    viteFrameworkDevDeps['@analogjs/vite-plugin-angular'] =
      ANALOGJS_VITE_PLUGIN_ANGULAR_VERSION;
  }
  // Generalized for S5 (was Vue-only, for its browser-mode vitest.setup.ts):
  // every framework's own src/test-setup.ts now imports this too.
  if (!existingDeps['@testing-library/jest-dom']) {
    viteFrameworkDevDeps['@testing-library/jest-dom'] =
      TESTING_LIBRARY_JEST_DOM_VERSION;
  }
  if (framework === 'vue' && !existingDeps['eslint-config-prettier']) {
    viteFrameworkDevDeps['eslint-config-prettier'] =
      ESLINT_CONFIG_PRETTIER_VERSION;
  }

  // S5 — the unit test runner: each framework's own Testing Library, plus
  // `jsdom` itself (Vitest's `environment: 'jsdom'` needs the package
  // installed — it isn't bundled), added only when not already present.
  // Measured against the real application generators: Angular's own
  // (`addVitestAngular`, its native @angular/build:unit-test wiring, present
  // regardless of `skipTests`) already adds both `jsdom` and `vitest`; none
  // of the three adds a Testing Library package or `@analogjs/vitest-angular`.
  const unitTestDevDeps: Record<string, string> = {};
  if (!existingDeps.jsdom) {
    unitTestDevDeps.jsdom = JSDOM_VERSION;
  }
  if (framework === 'angular' && !existingDeps['@testing-library/angular']) {
    unitTestDevDeps['@testing-library/angular'] =
      TESTING_LIBRARY_ANGULAR_VERSION;
  }
  if (framework === 'react' && !existingDeps['@testing-library/react']) {
    unitTestDevDeps['@testing-library/react'] = TESTING_LIBRARY_REACT_VERSION;
  }
  if (framework === 'vue' && !existingDeps['@testing-library/vue']) {
    unitTestDevDeps['@testing-library/vue'] = TESTING_LIBRARY_VUE_VERSION;
  }
  if (framework === 'angular' && !existingDeps['@analogjs/vitest-angular']) {
    unitTestDevDeps['@analogjs/vitest-angular'] =
      ANALOGJS_VITEST_ANGULAR_VERSION;
  }

  // Ported CSS-discipline rules (ADR-0130). No postcss-html: that's only
  // needed to lint .astro files, and the scaffold has none.
  const stylelintDevDeps: Record<string, string> = {
    stylelint: STYLELINT_VERSION,
  };

  // Formatting enforcement — see the "Prettier" section above for why this
  // is written at all.
  const prettierDevDeps: Record<string, string> = {
    prettier: PRETTIER_VERSION,
  };

  // Install selected @atelier-ui/* packages (dependencies) and Storybook +
  // the contract loop's own tools + the vitest browser-mode tooling + the
  // unit test runner's own tooling (S5) + stylelint + prettier
  // (devDependencies, exact pins — see the *_VERSION constants above)
  const installTask = addDependenciesToPackageJson(tree, deps, {
    ...storybookDevDeps,
    ...contractLoopDevDeps,
    ...viteFrameworkDevDeps,
    ...unitTestDevDeps,
    ...stylelintDevDeps,
    ...prettierDevDeps,
  });

  // Remove the preset package itself — create-nx-workspace adds it automatically
  // but it's a build-time tool and should not be in the workspace's dependencies
  const removePresetTask = removeDependenciesFromPackageJson(
    tree,
    ['@atelier-ui/create-workspace'],
    [],
  );

  // Write preflight script into the scaffolded workspace
  tree.write(
    'tools/scripts/preflight.mjs',
    readTemplate('tools/scripts/preflight.mjs'),
  );

  // Add `preflight` npm script to the generated workspace's package.json.
  // create-nx-workspace guarantees package.json exists before the preset runs,
  // so we write unconditionally — a missing package.json here should fail loudly,
  // not silently drop the npm script the workshop docs tell attendees to run.
  updateJson(tree, 'package.json', (pkg) => {
    pkg.scripts = pkg.scripts ?? {};
    pkg.scripts.preflight = 'node tools/scripts/preflight.mjs';
    // The contract loop (ADR-0121 S4). `figma:snapshot` names the attendee's
    // own Figma file key (schema option `figmaFile`, S5a) when the caller
    // supplied one — QMnDD8uZQPldPrlCwZZ58T is THIS repo's own file, never a
    // default here. Most direct-preset callers have no key to hand, so
    // without one it ships with the same literal placeholder as before;
    // CLAUDE.md's "The Contract Loop" section (figmaSnapshotRefreshInstruction
    // above) spells out how to fill it in either way.
    pkg.scripts['check:contracts'] = 'node tools/scripts/check-contracts.mjs';
    pkg.scripts['figma:snapshot'] = options.figmaFile
      ? `node tools/scripts/figma-snapshot-contracts.mjs --file ${options.figmaFile}`
      : 'node tools/scripts/figma-snapshot-contracts.mjs --file <YOUR_FIGMA_FILE_KEY>';
    // Browser-mode Storybook tests (owner correction 2026-09-10 to ADR-0123).
    // Identical to the monorepo's own root package.json script.
    pkg.scripts['check:stories'] = 'nx run-many -t storybook-test --parallel=1';
    // Ported CSS-discipline rules (ADR-0130). Identical to the monorepo's own
    // root package.json script.
    pkg.scripts['check:stylelint'] = 'nx run-many -t stylelint';
    // S5 — the unit test runner: jsdom-based tests for anything that is not
    // itself a story (a component's own logic, a service, a helper, a
    // form-validation rule). A sibling check, not folded into check:stories
    // (which proves rendering + a11y in a real browser) — this scaffold
    // deliberately has no check:all umbrella, so this is one more named
    // check, not a chain.
    pkg.scripts['check:unit'] = 'nx run-many -t test';
    // Formatting enforcement. Deliberately this monorepo's own
    // `prettier --write .` / `prettier --check .` shape, not `nx format:*` —
    // measured 2026-09-12 against a real generated workspace, two distinct
    // failure modes:
    //   1. Unconditional, on the pristine, untouched scaffold: with no
    //      formatter resolvable in node_modules, `nx format:check` exits 0
    //      printing "No formatter configured" — a silent pass before any git
    //      logic even runs. Worth keeping in mind even though this preset
    //      now installs prettier: the tool's own failure mode is "nothing is
    //      configured, so nothing is wrong", not a loud error.
    //   2. Conditional: once prettier is installed, `nx format:check`
    //      un-flagged does NOT silently pass immediately after scaffolding —
    //      `git init` stages files without committing, so the `main` ref
    //      doesn't resolve yet, Nx catches that specific git failure and
    //      falls back to an all-files scan, correctly reporting every
    //      unformatted file with exit 1 (after an alarming
    //      `Command failed: ... fatal: ambiguous argument 'main'` on
    //      stderr). The silent zero-file pass only appears once the
    //      attendee makes their own first commit, putting `main` and `HEAD`
    //      at the same revision — the steady state a workspace reaches
    //      within minutes of scaffolding, and the one `nx format:check`
    //      un-flagged reads as "nothing changed, nothing to check".
    // `prettier --check .` has neither failure mode: it always scans the
    // whole tree (honouring .gitignore's node_modules/dist/.nx exclusions
    // already, so no .prettierignore is needed), and if prettier were ever
    // missing it fails loudly rather than reporting a silent pass. A script
    // an attendee runs unmodified should not depend on remembering `--all`.
    pkg.scripts.format = 'prettier --write .';
    pkg.scripts['check:format'] = 'prettier --check .';
    // The names a JS developer already expects — no Nx knowledge required to
    // serve, build, lint, or run Storybook (owner requirement: everything
    // startable through `npm run`). The preset scaffolds exactly one app
    // (`${appName}`, ADR-0134), so these can name it literally — there is no
    // second app to disambiguate against and no placeholder for anyone to
    // fill in. `start` and `test` (below) are npm's own bare-word aliases
    // for the `start`/`test` script keys, so `npm start`/`npm test` work
    // without `run`.
    pkg.scripts.start = `nx serve ${appName}`;
    pkg.scripts.build = `nx build ${appName}`;
    pkg.scripts.lint = `nx lint ${appName}`;
    pkg.scripts.storybook = `nx storybook ${appName}`;
    pkg.scripts['build:storybook'] = `nx build-storybook ${appName}`;
    // `npm test` runs the jsdom unit tests ONLY — never the browser suite
    // (`check:stories` stays the separate, slower gate; a `test` script that
    // boots Chromium on every run is a script people stop running). This
    // delegates to `check:unit` rather than respelling `nx run-many -t test`
    // a second time: `check:unit` is already the one CLAUDE.md's Definition
    // of Done, `/verify`, and the atelier-component skill name, so it stays
    // the single source of truth for what "run the unit tests" actually
    // does, and `test` (the name `npm test` needs) just calls it. Keeping
    // `check:unit` on `run-many` rather than narrowing it to `nx test
    // ${appName}` also means it keeps working unchanged if this
    // single-app workspace ever grows a second test-bearing project.
    pkg.scripts.test = 'npm run check:unit';
    return pkg;
  });

  // Write .mcp.json with MCP servers for the selected framework
  const mcpServers: Record<string, unknown> = {
    'nx-mcp': {
      type: 'stdio',
      command: 'npx',
      args: ['nx', 'mcp'],
    },
    [`storybook-${framework}`]: {
      type: 'http',
      url: `${SITE_URL}/storybook-${framework}/mcp`,
    },
    // Canonical component anatomy, axes, slots, transitions, motion, tokens,
    // events, and cross-library divergences — copied verbatim from this
    // monorepo's own root .mcp.json, where it is wired unconditionally.
    uianatomy: {
      type: 'http',
      url: 'https://uianatomy.dev/mcp',
    },
  };
  if (framework === 'angular') {
    // Angular CLI best practices, API search, and examples — copied verbatim
    // from this monorepo's own root .mcp.json. That file wires it
    // unconditionally because the monorepo itself always has an Angular app;
    // a single-framework workshop only needs it when Angular is the one
    // chosen.
    mcpServers['angular-cli'] = {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@angular/cli', 'mcp'],
    };
  }
  if (options.figmaMcp) {
    // Desktop Bridge plugin (installed separately). FIGMA_ACCESS_TOKEN is
    // optional — only needed for REST-backed reads. See ${SITE_URL}/figma-token.
    mcpServers['figma-console'] = {
      command: 'npx',
      args: ['-y', 'figma-console-mcp@1.40.0'],
      env: {
        FIGMA_ACCESS_TOKEN: '${FIGMA_ACCESS_TOKEN:-}',
        ENABLE_MCP_APPS: 'true',
      },
    };
  }
  writeJson(tree, '.mcp.json', { mcpServers });

  // Write README
  tree.write(
    'README.md',
    `# Atelier Workshop

## Apps

- \`${appName}\` — \`@atelier-ui/${framework}\`

## Versions

\`@atelier-ui/${framework}\` is pinned to \`${componentPackageVersion}\` for reproducibility —
not \`latest\`, so the workshop behaves the same for everyone. Upgrade deliberately:
\`npm install @atelier-ui/${framework}@latest\`.

## Getting started

\`\`\`bash
npm install
npx playwright install chromium   # one-time — needed by npm run check:stories
npm start
\`\`\`

## Formatting

Prettier is configured (\`.prettierrc\`): \`npm run format\` (\`prettier --write .\`) and
\`npm run check:format\` (\`prettier --check .\`). The scaffold is already
Prettier-clean out of the box — \`check:format\` passes right after \`npm install\`.

## Storybook

- \`${appName}\` — \`npm run storybook\` — http://localhost:6006

Every story is also a browser-mode test — run them all headless in Chromium with
\`npm run check:stories\`.

## Agent Skills

${
  skillsEnabled
    ? `The scaffold attempted to install the four \`storybookjs/mcp\` skills (\`stories\`,
\`storybook-init\`, \`storybook-setup\`, \`storybook-upgrade\`) for Claude Code under
\`.claude/skills/\` — check that directory, since a failed clone doesn't stop the
workspace from being created. Re-run or update them with:

\`\`\`bash
${SKILLS_ADD_COMMAND_FOR_HUMANS}
\`\`\`

Note: \`test-run\` works once a local Storybook is running — every story here is a
render + accessibility test (\`@storybook/addon-vitest\`, also runnable offline via
\`npm run check:stories\`). See CLAUDE.md for details.`
    : `Skipped (\`skills: false\`). Install by hand:

\`\`\`bash
${SKILLS_ADD_COMMAND_FOR_HUMANS}
\`\`\``
}

## MCP

Claude Code MCP servers are pre-configured in \`.mcp.json\`. They — and the
permissions/hooks in \`.claude/settings.json\` — only take effect once you've
accepted Claude Code's folder-trust prompt in your first session here; run
\`npm run preflight\` if you're not sure whether that's happened yet.
Browse components at ${SITE_URL}
`,
  );

  // ─── Claude Code project setup ────────────────────────────────────────────
  // tasks/todo.md's "S3 — the workspace is set up for Claude Code" — a later,
  // unrelated plan from the S1-S4 labels elsewhere in this file (those mark
  // this package's own now-shipped Storybook/skills slices, a different
  // roadmap that reused the same S-numbers first).
  //
  // Everything above this point already writes CLAUDE.md, .mcp.json, and
  // (installSkills, further below) four storybookjs/mcp skills under
  // .claude/skills/ — but nothing else under .claude/, so every session in a
  // generated workspace re-asked permission for `npx nx …` / `npm run …` and
  // had to approve each MCP server by hand. This section closes that gap:
  // a checked-in settings.json (nothing personal in it — see below), a
  // formatting hook, a /verify entry point, a read-only review subagent, and
  // the .gitignore line the personal settings.local.json overlay needs.
  console.log(
    `\n◇ Wiring Claude Code project setup (settings, hooks, /verify, component-review)…`,
  );

  // settings.json is CHECKED IN (unlike settings.local.json below), so it
  // carries only shared, non-personal defaults — the same bar CLAUDE.md and
  // .mcp.json already meet.
  writeJson(tree, '.claude/settings.json', {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    // Every server the preset just wrote into .mcp.json (nx-mcp,
    // storybook-${framework}, uianatomy, angular-cli when Angular,
    // figma-console when requested) connects on session start instead of
    // needing individual first-use approval.
    enableAllProjectMcpServers: true,
    permissions: {
      allow: [
        // The Nx CLI directly. CLAUDE.md no longer tells an attendee to type
        // `npx nx serve/storybook/build-storybook <app>` by hand — those are
        // now the `start`/`storybook`/`build:storybook` npm scripts below —
        // but the wildcard stays for the exploratory/diagnostic `nx`
        // subcommands the docs still do use directly (e.g. `nx show
        // projects`, troubleshooting.astro's "which environment am I in"
        // check) and anything an attendee or agent reaches for beyond the
        // fixed script set.
        'Bash(npx nx *)',
        // The fourteen npm scripts this preset writes to package.json
        // (preflight, check:contracts, figma:snapshot, check:unit,
        // check:stories, check:stylelint, format, check:format, start,
        // build, lint, storybook, build:storybook, test) — one wildcard
        // entry rather than fourteen separate ones, since this workspace's
        // package.json carries exactly this fixed, generator-written script
        // set (a workshop attendee adding a script of their own opts into
        // this same allowance by definition, having already edited
        // package.json by hand).
        'Bash(npm run *)',
        // `npm run *` above does not match npm's own bare-word aliases —
        // `npm start` and `npm test` are literally different argv than `npm
        // run start` / `npm run test`, even though they resolve to the same
        // script. CLAUDE.md and README tell an attendee to type the bare
        // form for exactly these two (the names a JS developer already
        // reaches for without `run`), so both need their own entry or every
        // first `npm start`/`npm test` would stop for approval regardless of
        // the wildcard above.
        'Bash(npm start)',
        'Bash(npm test)',
        // The Storybook CLI itself — `dev`/`build` only, the two
        // subcommands the `storybook`/`build:storybook` npm scripts above
        // shell out to under the hood (each app's own project.json target
        // is a literal `npx storybook dev|build ...` `nx:run-commands`
        // string) — kept allowed directly too, for anyone who bypasses the
        // npm script to pass an extra flag by hand.
        // Deliberately NOT a bare `Bash(npx storybook *)`: this repo's own
        // AGENTS.md warns against running `storybook automigrate`/`upgrade`
        // against the pinned 10.6.0 setup (it silently proposes bumping
        // addon-mcp to `latest` and rewriting every main.ts) — a blanket
        // wildcard here would auto-approve exactly that.
        'Bash(npx storybook dev *)',
        'Bash(npx storybook build *)',
        // The one-time browser install `check:stories` needs (CLAUDE.md's
        // "Storybook" section).
        'Bash(npx playwright install *)',
        // Read-only inspection — never something that writes to the repo or
        // reaches the network.
        'Bash(git status)',
        'Bash(git diff *)',
        'Bash(git log *)',
      ],
      ask: [
        // `Bash(npx nx *)` above pre-approves every `nx` subcommand, `migrate`
        // included — the wildcard sits right after the subcommand position,
        // the exact placement the CLI's own settings validator warns matches
        // "any options inserted at that position" without a prompt. `nx
        // migrate` is the same hazard class as the Storybook
        // `automigrate`/`upgrade` commands excluded two entries above: it
        // rewrites package.json, fetches migration scripts from the npm
        // registry, and then runs them. Two entries (bare and with args)
        // rather than one wildcard, so a bare `npx nx migrate` (no version
        // argument) can't slip through a trailing-space gap in the wildcard
        // form. A narrower `ask` rule wins over a broader matching `allow`
        // entry — verified empirically against the installed 2.1.269 CLI, not
        // assumed: the same command matching both a `Bash(echo *)` allow rule
        // and an exact-match `ask` rule was routed to a permission prompt
        // (denied when prompts are disabled); with the `ask` rule removed the
        // identical command ran under the `allow` rule alone. So this narrows
        // just `migrate` back to asking for confirmation every time, without
        // blocking it outright and without touching the `npx nx *` wildcard
        // itself.
        'Bash(npx nx migrate)',
        'Bash(npx nx migrate *)',
      ],
    },
    hooks: {
      // Formats whatever Edit/Write just touched. `matcher` is a regex over
      // the tool name, not a glob — `Edit|Write` is the alternation, not two
      // separate matchers.
      PostToolUse: [
        {
          matcher: 'Edit|Write',
          hooks: [
            {
              type: 'command',
              // `bash "$CLAUDE_PROJECT_DIR/…"`, not a direct executable
              // invocation: the Tree API that wrote this script (below)
              // cannot set an executable bit.
              command:
                'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/format-edited.sh"',
            },
          ],
        },
      ],
    },
  });

  // Static — the hook's formatting logic doesn't depend on which framework
  // was selected, so (unlike CLAUDE.md/README above) this is a files/
  // template rather than an assembled string.
  tree.write(
    '.claude/hooks/format-edited.sh',
    readTemplate('claude/hooks/format-edited.sh'),
  );

  // `.claude/commands/verify.md`, not a `.claude/skills/verify/SKILL.md`:
  // both are invocable as `/verify` (the installed 2.1.269 CLI treats a
  // commands/*.md file as a "slash-command skill" internally, and `--bare`'s
  // own help text says "Skills still resolve via /skill-name" — so either
  // mechanism reaches the same entry point). A command file is the
  // narrower, more honest fit for what this actually is: a fixed action a
  // person explicitly triggers, with nothing for the model to decide about
  // *whether* to invoke it — the thing SKILL.md's richer description-driven
  // auto-triggering and multi-file bundling exist for. Four fixed npm
  // scripts and "read the exit code" is exactly the shape commands/*.md is
  // for.
  tree.write(
    '.claude/commands/verify.md',
    readTemplate('claude/commands/verify.md'),
  );

  // Read-only review subagent (Read/Grep/Glob/Bash only — no Edit/Write), so
  // it can inspect and even run a gate for corroboration but never fix what
  // it finds. Static, like the hook and the command above: the checklist
  // (contract / stories / a11y) is the same shape regardless of framework,
  // and the agent discovers the one scaffolded app itself via Glob.
  tree.write(
    '.claude/agents/component-review.md',
    readTemplate('claude/agents/component-review.md'),
  );

  // The workspace's own component skill — written unconditionally (no
  // network, no `skills` opt-out), unlike the four storybookjs/mcp skills
  // installSkills fetches further below. See renderAtelierComponentSkill's
  // comment above for the `<app>`/`<framework>` substitution it performs, and
  // CLAUDE.md's "Agent Skills" section (built above) for why this one is
  // called out separately from those four.
  tree.write(
    '.claude/skills/atelier-component/SKILL.md',
    renderAtelierComponentSkill(appName, framework),
  );

  // .gitignore: create-nx-workspace already writes this file (before any
  // preset runs) with its own standard ignores (node_modules, dist, .nx, …)
  // — appended to, never overwritten, so a future create-nx-workspace
  // version's own ignores survive. `.claude/settings.local.json` is where
  // Claude Code records an attendee's own permission approvals; it must
  // never be committed, unlike the shared `.claude/settings.json` written
  // above.
  const existingGitignore = tree.exists('.gitignore')
    ? (tree.read('.gitignore', 'utf-8') ?? '')
    : '';
  const gitignoreBase = existingGitignore.replace(/\n+$/, '');
  tree.write(
    '.gitignore',
    `${gitignoreBase}${gitignoreBase ? '\n\n' : ''}# Claude Code — personal overrides, never shared\n.claude/settings.local.json\n`,
  );

  console.log(`\n◇ Formatting files…`);
  await formatFiles(tree);

  // Wrap installTask + removePresetTask so the (multi-second, otherwise silent)
  // npm-install phase that runs after the generator returns has user-visible
  // progress. runTasksInSerial would also work but wouldn't surface phase names.
  return async () => {
    console.log(`\n◇ Installing Atelier component packages…`);
    await installTask();
    console.log(`\n◇ Cleaning up preset package…`);
    await removePresetTask();
    await installSkills(tree, skillsEnabled);
  };
}

export default presetGenerator;
