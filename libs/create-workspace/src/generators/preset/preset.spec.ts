import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson } from '@nx/devkit';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { installSkills, presetGenerator } from './preset';

// This package's own version, read the same way preset.ts's readOwnVersion()
// does (../../../package.json relative to this directory) — the value the
// preset is expected to pin @atelier-ui/<framework> to, not re-derived from
// the preset's own implementation.
const OWN_VERSION: string = JSON.parse(
  readFileSync(join(__dirname, '../../../package.json'), 'utf-8'),
).version;

// A realistic-shaped baseline flat ESLint config per framework — the same
// structure `@nx/{angular,react,vue}:application` actually writes when
// invoked with `linter: 'eslint'` (verified by running all three real
// generators against an in-memory Tree; `@nx/vue` was packed from its exact
// pinned npm version and temporarily inspected, since it's an optional peer
// not installed in this workspace). Only detailed enough for
// appendToFlatEslintConfig's tests to exercise the real shape it anchors on
// (imports, the relevant preset spread, and the closing `export default [
// ... ];`) — not a byte-for-byte copy of Nx's own formatting.
const ESLINT_CONFIG_BASELINE: Record<'angular' | 'react' | 'vue', string> = {
  angular: `import nx from "@nx/eslint-plugin";
import baseConfig from "../eslint.config.mjs";

export default [
    ...nx.configs["flat/angular"],
    ...nx.configs["flat/angular-template"],
    ...baseConfig,
    {
        files: ["**/*.ts"],
        rules: {
            "@angular-eslint/directive-selector": ["error", { type: "attribute", prefix: "app", style: "camelCase" }],
            "@angular-eslint/component-selector": ["error", { type: "element", prefix: "app", style: "kebab-case" }]
        }
    },
    {
        files: ["**/*.html"],
        rules: {}
    }
];
`,
  react: `import nx from "@nx/eslint-plugin";
import baseConfig from "../eslint.config.mjs";

export default [
    ...nx.configs["flat/react"],
    ...baseConfig,
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        rules: {}
    }
];
`,
  vue: `import vue from "eslint-plugin-vue";
import baseConfig from "../eslint.config.mjs";

export default [
    ...baseConfig,
    ...vue.configs["flat/recommended"],
    {
        files: ["**/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: await import("@typescript-eslint/parser")
            }
        }
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.vue"],
        rules: {
            "vue/multi-word-component-names": "off"
        }
    }
];
`,
};

// The real @nx/{angular,react,vue}:application generators write
// `<appName>/project.json` — the preset's Storybook step (S1) reads and
// updates it via `updateJson`, which throws if the file is missing — and,
// when invoked with `linter: 'eslint'` (which this preset always does — see
// the "passes linter: 'eslint'" tests below), `<appName>/eslint.config.mjs`,
// which the preset's per-framework ESLint-posture step (S4) appends to. The
// mocks below stand in for the real generator, so they need to do both
// things the real one does, or every test hits one of those throws.
function mockAppGenerator(framework: 'angular' | 'react' | 'vue') {
  return jest
    .fn()
    .mockImplementation((tree: Tree, options: { name: string }) => {
      // A non-empty `targets` (a placeholder `build`, standing in for the real
      // generator's build/serve/test/etc.) so the "storybook targets get merged
      // in, not swapped in wholesale" test below actually exercises the merge —
      // an empty object would pass even if the preset replaced `targets`
      // outright instead of adding two keys to it.
      tree.write(
        `${options.name}/project.json`,
        JSON.stringify({
          name: options.name,
          targets: { build: { executor: 'fake:build' } },
        }),
      );
      tree.write(
        `${options.name}/eslint.config.mjs`,
        ESLINT_CONFIG_BASELINE[framework],
      );
      return Promise.resolve(undefined);
    });
}

// Capture the framework application-generator mocks at module scope so tests
// can assert on the options object the preset hands to each generator (in
// particular, that `e2eTestRunner: 'none'` is always passed — otherwise the
// generator spawns `npm install @nx/playwright` mid-preset, which is the
// failure mode that crashed `npx create-atelier-ui-workspace`).
const angularAppMock = mockAppGenerator('angular');
const reactAppMock = mockAppGenerator('react');
const vueAppMock = mockAppGenerator('vue');

// The skills post-generator task (S2) shells out via node:child_process —
// mock only `spawn` so the test suite never actually spawns `npx
// skills@... add`. Everything else (exec, execFile, execSync, …) stays real:
// @nx/devkit's own dependency chain (nx's package-manager utilities) uses
// other child_process exports internally, and replacing the whole module
// leaves those `undefined`.
jest.mock('node:child_process', () => ({
  ...jest.requireActual('node:child_process'),
  spawn: jest.fn(),
}));
// Loosely typed on purpose: spawn's real type is a dense set of overloads
// (command-only, command+args, command+options, …) that a single
// mockImplementation can't match cleanly — the tests only need to inspect
// call args and control the fake child's events, not reproduce that overload
// set.
const spawnMock = spawn as unknown as jest.Mock;

// A minimal stand-in for the real ChildProcess: `runSkillsAddCommand` only
// ever calls `.on('error', ...)` and `.on('exit', ...)` on what `spawn`
// returns, so a plain EventEmitter is a faithful fake. Events are emitted on
// a microtask tick, same as the real child_process would (the promise
// executor above has already attached its listeners by the time this runs).
function fakeChildProcess(emit: (child: EventEmitter) => void): EventEmitter {
  const child = new EventEmitter();
  queueMicrotask(() => emit(child));
  return child;
}

function mockSkillsCliSuccess() {
  spawnMock.mockImplementation(() =>
    fakeChildProcess((child) => child.emit('exit', 0, null)),
  );
}

function mockSkillsCliFailure(message: string) {
  spawnMock.mockImplementation(() =>
    fakeChildProcess((child) => child.emit('error', new Error(message))),
  );
}

function mockSkillsCliNonZeroExit(code: number) {
  spawnMock.mockImplementation(() =>
    fakeChildProcess((child) => child.emit('exit', code, null)),
  );
}

// Simulates `spawn`'s own `timeout` + `killSignal` machinery: on timeout, Node
// kills the child and reports `exit` with a null code and the kill signal —
// exactly what SKILLS_INSTALL_TIMEOUT_MS should surface as a distinct,
// readable error rather than a bare "exited with code null".
function mockSkillsCliTimeoutKill(signal: NodeJS.Signals = 'SIGTERM') {
  spawnMock.mockImplementation(() =>
    fakeChildProcess((child) => child.emit('exit', null, signal)),
  );
}

jest.mock('@nx/angular/generators', () => {
  const real = jest.requireActual('@nx/angular/generators');
  if (typeof real.applicationGenerator !== 'function') {
    throw new Error(
      '@nx/angular/generators does not export applicationGenerator as a function',
    );
  }
  return { applicationGenerator: angularAppMock };
});

jest.mock('@nx/devkit', () => {
  const real = jest.requireActual('@nx/devkit');
  return {
    ...real,
    ensurePackage: jest.fn().mockImplementation((packageName: string) => {
      if (packageName === '@nx/react') {
        return Promise.resolve({ applicationGenerator: reactAppMock });
      }
      if (packageName === '@nx/vue') {
        return Promise.resolve({ applicationGenerator: vueAppMock });
      }
      try {
        const realPkg = jest.requireActual(packageName);
        const mocked: Record<string, unknown> = { ...realPkg };
        if (typeof realPkg.applicationGenerator === 'function') {
          mocked['applicationGenerator'] = jest
            .fn()
            .mockResolvedValue(undefined);
        }
        return Promise.resolve(mocked);
      } catch {
        // Package not installed in dev workspace — fall back to plain mock
        return Promise.resolve({
          applicationGenerator: jest.fn().mockResolvedValue(undefined),
        });
      }
    }),
    // Run the real (synchronous) dependency-writing behaviour so tests can
    // still assert on package.json content, but replace the *returned* task
    // with a no-op — the real one shells out to a real `npm install` via
    // execSync, which a unit test must never trigger (particularly since a
    // couple of the new S2 tests below invoke the preset's returned
    // post-generator task directly, to prove the `skills` gate is wired to
    // it end-to-end).
    addDependenciesToPackageJson: jest
      .fn()
      .mockImplementation((...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (real.addDependenciesToPackageJson as (...a: any[]) => unknown)(
          ...args,
        );
        return () => Promise.resolve();
      }),
    removeDependenciesFromPackageJson: jest
      .fn()
      .mockImplementation((...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (real.removeDependenciesFromPackageJson as (...a: any[]) => unknown)(
          ...args,
        );
        return () => Promise.resolve();
      }),
  };
});

describe('preset generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    angularAppMock.mockClear();
    reactAppMock.mockClear();
    vueAppMock.mockClear();
    spawnMock.mockClear();
    mockSkillsCliSuccess();
  });

  // ─── MCP settings ──────────────────────────────────────────────────────────

  it('writes .mcp.json with angular MCP only', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp']).toBeDefined();
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-angular'].url).toContain(
      'storybook-angular/mcp',
    );
    expect(settings.mcpServers['storybook-react']).toBeUndefined();
    expect(settings.mcpServers['storybook-vue']).toBeUndefined();
  });

  it('each MCP entry has type http and correct url', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-react'].type).toBe('http');
    expect(settings.mcpServers['storybook-react'].url).toContain(
      'storybook-react/mcp',
    );
  });

  it('nx-mcp uses stdio command', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp'].type).toBe('stdio');
    expect(settings.mcpServers['nx-mcp'].command).toBe('npx');
  });

  it('nx-mcp args invoke nx mcp', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp'].args).toEqual(['nx', 'mcp']);
  });

  it('writes .mcp.json with react MCP only for react framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-react']).toBeDefined();
    expect(settings.mcpServers['storybook-angular']).toBeUndefined();
    expect(settings.mcpServers['storybook-vue']).toBeUndefined();
  });

  it('writes .mcp.json with vue MCP only for vue framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-vue']).toBeDefined();
    expect(settings.mcpServers['storybook-vue'].url).toContain(
      'storybook-vue/mcp',
    );
    expect(settings.mcpServers['storybook-angular']).toBeUndefined();
    expect(settings.mcpServers['storybook-react']).toBeUndefined();
  });

  // ─── uianatomy MCP (always) ────────────────────────────────────────────────

  it.each(['angular', 'react', 'vue'] as const)(
    'writes .mcp.json with the uianatomy server regardless of framework (%s)',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const settings = readJson(tree, '.mcp.json');
      expect(settings.mcpServers['uianatomy']).toEqual({
        type: 'http',
        url: 'https://uianatomy.dev/mcp',
      });
    },
  );

  // ─── angular-cli MCP (Angular only) ────────────────────────────────────────

  it('writes .mcp.json with the angular-cli server when angular is selected', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['angular-cli']).toEqual({
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@angular/cli', 'mcp'],
    });
  });

  it.each(['react', 'vue'] as const)(
    'omits the angular-cli server for %s',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const settings = readJson(tree, '.mcp.json');
      expect(settings.mcpServers['angular-cli']).toBeUndefined();
    },
  );

  // ─── figma-console MCP (opt-in) ────────────────────────────────────────────

  it('omits figma-console by default', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeUndefined();
  });

  it('omits figma-console when figmaMcp=false', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
      figmaMcp: false,
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeUndefined();
  });

  it('includes figma-console when figmaMcp=true', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
      figmaMcp: true,
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeDefined();
    expect(settings.mcpServers['figma-console'].command).toBe('npx');
    expect(settings.mcpServers['figma-console'].args).toEqual([
      '-y',
      'figma-console-mcp@1.40.0',
    ]);
    expect(settings.mcpServers['figma-console'].env.FIGMA_ACCESS_TOKEN).toBe(
      '${FIGMA_ACCESS_TOKEN:-}',
    );
  });

  it('CLAUDE.md includes Figma setup link when figmaMcp=true', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
      figmaMcp: true,
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('Figma Setup');
    expect(md).toContain('atelier.pieper.io/figma-token');
    expect(md).toContain('Desktop Bridge');
  });

  it('CLAUDE.md omits the Figma setup section when figmaMcp is not set', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).not.toContain('Figma Setup');
    expect(md).not.toContain('atelier.pieper.io/figma-token');
  });

  it('CLAUDE.md points at the composition cookbook', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('Composition Patterns');
    expect(md).toContain('atelier.pieper.io/patterns');
    expect(md).toContain('cookbook-patterns.json');
  });

  // ─── README ────────────────────────────────────────────────────────────────

  it('writes README.md', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });
    expect(tree.exists('README.md')).toBe(true);
  });

  // ─── Component package version pin (S2a) ───────────────────────────────────
  //
  // All five packages in this monorepo (angular, react, vue, create-workspace,
  // create-atelier-ui-workspace) release in lockstep from nx.json's
  // `libraries` release group — create-workspace's own package.json version
  // is always the version @atelier-ui/<framework> was just published at, so
  // pinning to it (rather than `latest`) makes a scaffolded workspace
  // reproducible without a separate schema option to keep in sync.

  it.each([
    ['angular', '@atelier-ui/angular'],
    ['react', '@atelier-ui/react'],
    ['vue', '@atelier-ui/vue'],
  ] as const)(
    `pins %s to this package's own version, not "latest"`,
    async (fw, depName) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const pkg = readJson(tree, 'package.json');
      expect(pkg.dependencies[depName]).toBe(OWN_VERSION);
      expect(pkg.dependencies[depName]).not.toBe('latest');
    },
  );

  it('CLAUDE.md documents the version pin and how to move it deliberately', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('## Versions');
    expect(md).toContain(`@atelier-ui/react\` is pinned to \`${OWN_VERSION}\``);
    expect(md).toContain('npm install @atelier-ui/react@latest');
  });

  it('README documents the version pin and how to move it deliberately', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const readme = tree.read('README.md', 'utf-8') ?? '';
    expect(readme).toContain('## Versions');
    expect(readme).toContain(OWN_VERSION);
    expect(readme).toContain('npm install @atelier-ui/vue@latest');
  });

  // ─── CSS tokens ────────────────────────────────────────────────────────────

  const EXPECTED_IMPORT = "@import './styles/tokens.css';";

  it('writes tokens.css into the scaffolded angular app', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const tokens =
      tree.read('workshop-angular/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('writes tokens.css into the scaffolded react app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const tokens =
      tree.read('workshop-react/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('writes tokens.css into the scaffolded vue app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const tokens =
      tree.read('workshop-vue/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it.each(['angular', 'react', 'vue'] as const)(
    'injects a relative tokens import into styles.css (%s)',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const css = tree.read(`workshop-${fw}/src/styles.css`, 'utf-8') ?? '';
      expect(css).toContain(EXPECTED_IMPORT);
    },
  );

  it.each(['angular', 'react', 'vue'] as const)(
    'does not reference @atelier-ui/%s/styles (tokens are local)',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const css = tree.read(`workshop-${fw}/src/styles.css`, 'utf-8') ?? '';
      expect(css).not.toContain(`@atelier-ui/${fw}/styles`);
    },
  );

  it('tokens import is the first line of styles.css', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8') ?? '';
    expect(css.trimStart()).toMatch(/^@import '\.\/styles\/tokens\.css'/);
  });

  it('preserves existing styles.css content after the import', async () => {
    tree.write('workshop-angular/src/styles.css', '/* existing styles */');

    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8') ?? '';
    expect(css).toContain(EXPECTED_IMPORT);
    expect(css).toContain('/* existing styles */');
    expect(css.indexOf('@import')).toBeLessThan(
      css.indexOf('/* existing styles */'),
    );
  });

  // ─── CLAUDE.md ─────────────────────────────────────────────────────────────

  it('writes CLAUDE.md', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });
    expect(tree.exists('CLAUDE.md')).toBe(true);
  });

  it('CLAUDE.md includes the three Storybook MCP tools', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('docs-list');
    expect(md).toContain('docs-show');
    expect(md).toContain('docs-show-story');
  });

  it('CLAUDE.md references the correct MCP server name for the framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('storybook-angular');
  });

  it('CLAUDE.md includes Angular-specific import pattern', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/angular');
    expect(md).toContain("import { AtlButton } from '@atelier-ui/angular';");
    expect(md).toContain('atl-button');
  });

  it('CLAUDE.md includes React-specific import pattern', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/react');
    expect(md).toContain('useAtlToast');
    expect(md).toContain('onXxx');
  });

  it('CLAUDE.md includes Vue-specific import pattern', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/vue');
    expect(md).toContain('v-model');
    expect(md).toContain('useAtlToast');
  });

  it('CLAUDE.md includes the app run command for the selected framework only', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npx nx serve workshop-angular');
    expect(md).not.toContain('npx nx serve workshop-react');
    expect(md).not.toContain('npx nx serve workshop-vue');
  });

  it('CLAUDE.md links to the docs site', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('atelier.pieper.io');
  });

  // ─── Preflight ─────────────────────────────────────────────────────────────

  it('writes tools/scripts/preflight.mjs', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });
    expect(tree.exists('tools/scripts/preflight.mjs')).toBe(true);
    const content = tree.read('tools/scripts/preflight.mjs', 'utf-8') ?? '';
    expect(content).toContain('Atelier UI Preflight');
  });

  it('adds preflight npm script to package.json', async () => {
    // No manual tree.write — rely on createTreeWithEmptyWorkspace's default
    // package.json so this test exercises the same path the real Nx preset
    // flow takes. If the preset ever silently skips the write again, this
    // assertion fails loudly.
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });
    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts.preflight).toBe('node tools/scripts/preflight.mjs');
  });

  it('preserves existing scripts when adding preflight', async () => {
    // Simulate an Nx-scaffolded package.json that already has build/test scripts
    // — the preflight entry must be added without clobbering siblings.
    tree.write(
      'package.json',
      JSON.stringify({
        name: 'my-workspace',
        scripts: { build: 'nx build', test: 'nx test' },
      }),
    );
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });
    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts.preflight).toBe('node tools/scripts/preflight.mjs');
    expect(pkg.scripts.build).toBe('nx build');
    expect(pkg.scripts.test).toBe('nx test');
  });

  it('CLAUDE.md references preflight in troubleshooting', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });
    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npm run preflight');
    expect(md).toContain('/troubleshooting');
  });

  // ─── Framework application generator args ─────────────────────────────────

  // Regression: in Nx 22, @nx/{angular,react,vue}:application default
  // e2eTestRunner to 'playwright', which triggers ensurePackage('@nx/playwright')
  // mid-preset. That spawns `npm install` and, when it fails, aborts the whole
  // scaffold with `Failed to apply preset: @atelier-ui/create-workspace`.
  // The workshop never runs e2e tests, so we explicitly opt out — this test
  // guards against anyone silently dropping that flag in the future.
  it.each([
    ['angular', angularAppMock],
    ['react', reactAppMock],
    ['vue', vueAppMock],
  ] as const)(
    'passes e2eTestRunner: none to the %s application generator',
    async (fw, mock) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      expect(mock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ e2eTestRunner: 'none' }),
      );
    },
  );

  // Regression: the Angular application generator call omitted `linter:
  // 'eslint'` entirely. Without it, `normalizeLinterOption`'s non-interactive
  // fallback follows whatever the tree already has, or 'none' if nothing does
  // — which is exactly the state of a fresh, single-framework Angular
  // scaffold, so the Angular app got ZERO eslint.config.mjs and no eslint
  // devDependency at all (verified by running the real generator against an
  // empty workspace). React and Vue already passed this; this guards against
  // Angular's call losing it again.
  it.each([
    ['angular', angularAppMock],
    ['react', reactAppMock],
    ['vue', vueAppMock],
  ] as const)(
    "passes linter: 'eslint' to the %s application generator",
    async (fw, mock) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      expect(mock).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ linter: 'eslint' }),
      );
    },
  );

  // ─── Per-framework ESLint posture (S4) ─────────────────────────────────────
  //
  // What the monorepo's own libs/{angular,react,vue}/eslint.config.mjs add on
  // top of the same Nx-generated baseline (ground-truthed by actually running
  // each framework's real application generator, not assumed): Angular adds
  // one rule the templateAccessibility preset omits; React adds nothing (the
  // preset it gets already covers jsx-a11y's active rules); Vue adds
  // eslint-config-prettier for .vue files plus one opted-in rule. These tests
  // assert the preset's OWN addition on top of a realistic mocked baseline —
  // not Nx's generated output, which is out of this package's control.

  it('Angular: appends @angular-eslint/template/no-positive-tabindex, scoped to *.html', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const config =
      tree.read('workshop-angular/eslint.config.mjs', 'utf-8') ?? '';
    expect(config).toContain('@angular-eslint/template/no-positive-tabindex');
    expect(config).toContain("'error'");
    expect(config).toContain("files: ['**/*.html']");
    // Still valid-shaped: exactly one export default array, still closed.
    expect(config.trim().endsWith('];')).toBe(true);
  });

  it('Angular: the appended block sits inside the array, after the baseline content', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const config =
      tree.read('workshop-angular/eslint.config.mjs', 'utf-8') ?? '';
    const baselineIndex = config.indexOf('flat/angular-template');
    const additionIndex = config.indexOf('no-positive-tabindex');
    expect(baselineIndex).toBeGreaterThan(-1);
    expect(additionIndex).toBeGreaterThan(baselineIndex);
  });

  it('React: does not modify workshop-react/eslint.config.mjs beyond the baseline', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const config = tree.read('workshop-react/eslint.config.mjs', 'utf-8') ?? '';
    expect(config).toBe(ESLINT_CONFIG_BASELINE.react);
  });

  it('Vue: appends eslint-config-prettier applied to *.vue, with its import', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const config = tree.read('workshop-vue/eslint.config.mjs', 'utf-8') ?? '';
    expect(config).toContain(
      "import eslintConfigPrettier from 'eslint-config-prettier';",
    );
    expect(config).toContain('eslintConfigPrettier.rules');
    expect(config).toContain("files: ['**/*.vue']");
  });

  it('Vue: appends vue/no-unused-properties opted in for props', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const config = tree.read('workshop-vue/eslint.config.mjs', 'utf-8') ?? '';
    expect(config).toContain(
      "'vue/no-unused-properties': ['error', { groups: ['props'] }]",
    );
  });

  it('Vue: the appended blocks keep the file a valid single flat-config array', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const config = tree.read('workshop-vue/eslint.config.mjs', 'utf-8') ?? '';
    expect((config.match(/export default \[/g) ?? []).length).toBe(1);
    expect(config.trim().endsWith('];')).toBe(true);
  });

  it('adds eslint-config-prettier as a devDependency when vue is selected and it is not already present', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    // The mocked app generator doesn't write package.json devDependencies the
    // way the real one does, so the "already present" branch never fires here
    // — this exercises the preset's own defensive add.
    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['eslint-config-prettier']).toBe('^10.0.0');
  });

  it('does not override an existing eslint-config-prettier devDependency', async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        name: 'my-workspace',
        devDependencies: { 'eslint-config-prettier': '^9.0.0' },
      }),
    );

    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['eslint-config-prettier']).toBe('^9.0.0');
  });

  it('fails loudly if the app generator did not write an eslint.config.mjs for Angular', async () => {
    angularAppMock.mockImplementationOnce(
      (tree: Tree, options: { name: string }) => {
        // Realistic partial failure: writes project.json (like the real
        // generator always does) but not eslint.config.mjs — simulates a
        // future Nx version, or a linter option other than 'eslint', producing
        // no ESLint output for the preset's own step to append to.
        tree.write(
          `${options.name}/project.json`,
          JSON.stringify({ name: options.name, targets: {} }),
        );
        return Promise.resolve(undefined);
      },
    );

    await expect(
      presetGenerator(tree, { name: 'my-workspace', framework: 'angular' }),
    ).rejects.toThrow('workshop-angular/eslint.config.mjs');
  });

  // ─── Storybook (S1) ────────────────────────────────────────────────────────

  it.each([
    ['angular', '@storybook/angular-vite'],
    ['react', '@storybook/react-vite'],
    ['vue', '@storybook/vue3-vite'],
  ] as const)(
    'writes .storybook/main.ts for %s, naming its framework package',
    async (fw, expectedPackage) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const main =
        tree.read(`workshop-${fw}/.storybook/main.ts`, 'utf-8') ?? '';
      expect(main).toContain(expectedPackage);
    },
  );

  it('main.ts keeps addon-mcp/vitest/a11y/docs but drops addon-designs', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const main =
      tree.read('workshop-angular/.storybook/main.ts', 'utf-8') ?? '';
    expect(main).toContain('@storybook/addon-mcp');
    // Owner correction 2026-09-10 to ADR-0123's original "no test runner"
    // call: addon-vitest ships after all.
    expect(main).toContain('@storybook/addon-vitest');
    expect(main).toContain('@storybook/addon-a11y');
    expect(main).toContain('@storybook/addon-docs');
    expect(main).not.toContain('addon-designs');
    expect(main).not.toContain('staticDirs');
    expect(main).not.toContain('BUILD_STORYBOOK');
  });

  it('writes preview.ts for angular', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    expect(tree.exists('workshop-angular/.storybook/preview.ts')).toBe(true);
  });

  it('writes preview.tsx for react, importing tokens.css', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    expect(tree.exists('workshop-react/.storybook/preview.tsx')).toBe(true);
    const reactPreview =
      tree.read('workshop-react/.storybook/preview.tsx', 'utf-8') ?? '';
    expect(reactPreview).toContain('../src/styles/tokens.css');
  });

  it('writes preview.ts for vue', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    expect(tree.exists('workshop-vue/.storybook/preview.ts')).toBe(true);
  });

  it('does not import @angular/cdk/overlay-prebuilt.css in the angular preview', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const preview =
      tree.read('workshop-angular/.storybook/preview.ts', 'utf-8') ?? '';
    expect(preview).not.toContain('overlay-prebuilt.css');
  });

  it('writes a Storybook-scoped tsconfig.json for the angular app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    expect(tree.exists('workshop-angular/.storybook/tsconfig.json')).toBe(true);
  });

  it.each(['react', 'vue'] as const)(
    'does not write a Storybook-scoped tsconfig.json for the %s app',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      expect(tree.exists(`workshop-${fw}/.storybook/tsconfig.json`)).toBe(
        false,
      );
    },
  );

  it.each([
    ['angular', 'ts'],
    ['react', 'tsx'],
    ['vue', 'ts'],
  ] as const)(
    'writes an example AtlButton story for %s, importing from @atelier-ui/%s',
    async (fw, ext) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const story =
        tree.read(`workshop-${fw}/src/atl-button.stories.${ext}`, 'utf-8') ??
        '';
      expect(story).toContain(`from '@atelier-ui/${fw}'`);
    },
  );

  // ─── The example story teaches the ADR-0121 pattern (S2c) ──────────────────
  //
  // The scaffold's own example is what an attendee copies for their next
  // component, so it must model "the stories are the claims": one story per
  // `variant` value and per Boolean state, args-based, and exactly one `play`
  // function carrying a real assertion.

  it.each([
    ['angular', 'ts'],
    ['react', 'tsx'],
    ['vue', 'ts'],
  ] as const)(
    'ships one story per variant value and per Boolean state for %s',
    async (fw, ext) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const story =
        tree.read(`workshop-${fw}/src/atl-button.stories.${ext}`, 'utf-8') ??
        '';
      expect(story).toContain('export const Primary: Story');
      expect(story).toContain('export const Secondary: Story');
      expect(story).toContain('export const Outline: Story');
      expect(story).toContain('export const Danger: Story');
      expect(story).toContain('export const Loading: Story');
      expect(story).toContain('export const Disabled: Story');
    },
  );

  it.each([
    ['angular', 'ts'],
    ['react', 'tsx'],
    ['vue', 'ts'],
  ] as const)(
    'ships exactly one `play` function, on an enabled story, importing test utilities from storybook/test, for %s',
    async (fw, ext) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const story =
        tree.read(`workshop-${fw}/src/atl-button.stories.${ext}`, 'utf-8') ??
        '';
      expect(story).toContain("from 'storybook/test'");
      // Anchored to the start of a line (not just `/play:/`, which also
      // matches inside `display:`) so it counts the CSF `play` key itself.
      expect((story.match(/^\s*play:\s*async/gm) ?? []).length).toBe(1);
      // A real assertion, not a decorative one: clicking an enabled button
      // actually fires its click handler. It must live on an enabled story —
      // `.is-disabled` sets `pointer-events: none`, and Storybook's default
      // `pointerEventsCheck` throws before any assertion runs if
      // `userEvent.click` targets such an element.
      expect(story).toContain('userEvent.click(button)');
      expect(story).toContain("'clicked'");
      // `Disabled` is plain `args`-only: no per-story `render`/`play` left on
      // it (it's the last story in the file, so this also proves the `play`
      // asserted above is not the one pinned here).
      const disabledStory = story.slice(story.indexOf('export const Disabled'));
      expect(disabledStory).not.toContain('render:');
      expect(disabledStory).not.toContain('play:');
    },
  );

  it.each([
    ['angular', 'ts'],
    ['react', 'tsx'],
    ['vue', 'ts'],
  ] as const)(
    'still names exactly one component (AtlButton) for %s — the check:contracts external:1 gate',
    async (fw, ext) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const story =
        tree.read(`workshop-${fw}/src/atl-button.stories.${ext}`, 'utf-8') ??
        '';
      expect(story).toContain('component: AtlButton');
      // No second Atelier component imported alongside AtlButton — the click
      // test uses only the framework's own state primitive (useState/ref/a
      // plain click binding), never a second @atelier-ui/<fw> import, which
      // would turn check:contracts' `external: 1` into `external: 2`.
      expect(story.match(/from '@atelier-ui\//g) ?? []).toHaveLength(1);
    },
  );

  it('adds the pinned common Storybook devDependencies regardless of framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['storybook']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/addon-mcp']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/addon-a11y']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/addon-docs']).toBe('10.6.0');
    // Owner correction 2026-09-10 to ADR-0123's original "no test runner"
    // call: the browser-mode test runner ships after all.
    expect(pkg.devDependencies['@storybook/addon-vitest']).toBe('10.6.0');
    expect(pkg.devDependencies['vitest']).toBe('^4.0.8');
    expect(pkg.devDependencies['@vitest/browser-playwright']).toBe('^4.1.0');
    expect(pkg.devDependencies['playwright']).toBe('^1.36.0');
    expect(pkg.devDependencies['@storybook/addon-designs']).toBeUndefined();
  });

  it('adds @storybook/angular-vite when angular is selected, not the other frameworks packages', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@storybook/angular-vite']).toBe('10.6.0');
    // '@storybook/angular' is deliberately NOT installed: its peer on
    // @angular-devkit/build-angular is not optional, and a freshly scaffolded
    // Angular 22 app's own build-angular peer (^21) collides with it — the
    // angular templates use '@storybook/angular-vite' for their types instead
    // (it has no such peer).
    expect(pkg.devDependencies['@storybook/angular']).toBeUndefined();
    expect(pkg.devDependencies['@storybook/react-vite']).toBeUndefined();
    expect(pkg.devDependencies['@storybook/vue3-vite']).toBeUndefined();
  });

  it('adds @storybook/react-vite and its non-vite counterpart when react is selected, not the other frameworks packages', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@storybook/react-vite']).toBe('10.6.0');
    // @storybook/react-vite carries its non-vite renderer as a plain
    // `dependency`, not a peer — but the story and preview templates import
    // types straight from '@storybook/react'. That only resolves via npm's
    // hoisting today; a pnpm-managed scaffold needs it declared directly.
    expect(pkg.devDependencies['@storybook/react']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/angular-vite']).toBeUndefined();
    expect(pkg.devDependencies['@storybook/vue3-vite']).toBeUndefined();
  });

  it('adds @storybook/vue3-vite and its non-vite counterpart when vue is selected, not the other frameworks packages', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@storybook/vue3-vite']).toBe('10.6.0');
    // Same non-vite-counterpart reasoning as react's own test above.
    expect(pkg.devDependencies['@storybook/vue3']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/angular-vite']).toBeUndefined();
    expect(pkg.devDependencies['@storybook/react-vite']).toBeUndefined();
  });

  it('adds @analogjs/vite-plugin-angular for vitest browser mode when angular is selected', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@analogjs/vite-plugin-angular']).toBe('2.7.1');
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeUndefined();
    expect(pkg.devDependencies['@vitejs/plugin-vue']).toBeUndefined();
  });

  it('adds @vitejs/plugin-react for vitest browser mode when react is selected', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBe('6.1.1');
    expect(
      pkg.devDependencies['@analogjs/vite-plugin-angular'],
    ).toBeUndefined();
    expect(pkg.devDependencies['@vitejs/plugin-vue']).toBeUndefined();
  });

  it('adds @vitejs/plugin-vue and jest-dom for vitest browser mode when vue is selected', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@vitejs/plugin-vue']).toBe('^6.0.5');
    // Only Vue's vitest.setup.ts.template imports jest-dom's custom matchers.
    expect(pkg.devDependencies['@testing-library/jest-dom']).toBe('^6.9.1');
    expect(
      pkg.devDependencies['@analogjs/vite-plugin-angular'],
    ).toBeUndefined();
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBeUndefined();
  });

  it('does not add a framework Vite plugin already present in package.json', async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        name: 'my-workspace',
        devDependencies: { '@vitejs/plugin-react': '5.0.0' },
      }),
    );

    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBe('5.0.0');
  });

  it.each(['angular', 'react', 'vue'] as const)(
    'writes vitest.config.ts and .storybook/vitest.setup.ts for %s',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const config =
        tree.read(`workshop-${fw}/vitest.config.ts`, 'utf-8') ?? '';
      expect(config).toContain('storybookTest');
      expect(config).toContain(`'storybook:${fw}'`);
      const setup =
        tree.read(`workshop-${fw}/.storybook/vitest.setup.ts`, 'utf-8') ?? '';
      expect(setup).toContain('setProjectAnnotations');
    },
  );

  it('angular vitest.setup.ts imports from @storybook/angular-vite, never the peer-incompatible @storybook/angular', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const angularSetup =
      tree.read('workshop-angular/.storybook/vitest.setup.ts', 'utf-8') ?? '';
    expect(angularSetup).toContain("from '@storybook/angular-vite'");
    expect(angularSetup).not.toContain("from '@storybook/angular'");
  });

  it('adds a storybook-test target per app and a root check:stories script', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const project = readJson(tree, 'workshop-react/project.json');
    expect(project.targets['storybook-test'].executor).toBe('nx:run-commands');
    expect(project.targets['storybook-test'].options.command).toBe(
      'npx vitest run --config vitest.config.ts',
    );
    expect(project.targets['storybook-test'].options.cwd).toBe(
      'workshop-react',
    );

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['check:stories']).toBe(
      'nx run-many -t storybook-test --parallel=1',
    );
  });

  // ─── S5: the unit test runner (nx test, jsdom) ───────────────────────────
  // A workshop workspace's whole point is agent-assisted development, and
  // until now it had a feedback loop for stories only — no `nx test`, no
  // Testing Library, nothing for a composable, a service, or a plain helper.
  // These tests mirror the browser-mode ones just above, for the OTHER
  // Vitest config: unmarked on purpose, so @storybook/addon-vitest's own
  // config-discovery walk (ADR-0112) never picks it up.

  it.each(['angular', 'react', 'vue'] as const)(
    'writes vitest.unit.config.ts and src/test-setup.ts for %s, in jsdom, distinct from the browser-mode pair',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const config =
        tree.read(`workshop-${fw}/vitest.unit.config.ts`, 'utf-8') ?? '';
      expect(config).toContain(`'workshop-${fw}'`);
      expect(config).toContain("environment: 'jsdom'");
      expect(config).toContain("include: ['src/**/*.spec.*']");
      expect(config).toContain("setupFiles: ['src/test-setup.ts']");
      // Never a candidate for the Storybook test-run tool's own
      // config-discovery walk (ADR-0112): that walk matches a file's
      // BASENAME first ("vitest.config.*" / "vite.config.*" /
      // "vitest.workspace.*"), and "vitest.unit.config.ts" is none of
      // those — so it never imports or calls the plugin that would make it
      // one, regardless of what its own comments say about why.
      expect(config).not.toMatch(/from ['"]@storybook\/addon-vitest/);
      expect(config).not.toMatch(/\bstorybookTest\s*\(/);

      const setup =
        tree.read(`workshop-${fw}/src/test-setup.ts`, 'utf-8') ?? '';
      expect(setup).toContain('@testing-library/jest-dom/vitest');
    },
  );

  it("angular's vitest.unit.config.ts uses @analogjs/vite-plugin-angular, the same plugin vitest.config.ts uses", async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const config =
      tree.read('workshop-angular/vitest.unit.config.ts', 'utf-8') ?? '';
    expect(config).toContain("from '@analogjs/vite-plugin-angular'");
  });

  it("vue's vitest.unit.config.ts inlines @atelier-ui/vue so its built index.css import resolves under Vitest's default (Node-loader) externalization, unlike angular/react", async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const vueConfig =
      tree.read('workshop-vue/vitest.unit.config.ts', 'utf-8') ?? '';
    expect(vueConfig).toContain("inline: ['@atelier-ui/vue']");

    // angular and react don't need this: react's build (@nx/js:tsc) ships
    // raw ESM import syntax in a package.json declared "type": "commonjs",
    // which trips Vitest's own dual-package guard and forces it through the
    // inlined path automatically; angular's build (ng-packagr) never emits a
    // bare `.css` import at all — component styles are inlined as strings.
    // Neither is a guarantee this generator can rely on going forward (see
    // the template's own comment), but today, neither needs the workaround.
    const reactTree = createTreeWithEmptyWorkspace();
    await presetGenerator(reactTree, {
      name: 'my-workspace',
      framework: 'react',
    });
    const reactConfig =
      reactTree.read('workshop-react/vitest.unit.config.ts', 'utf-8') ?? '';
    expect(reactConfig).not.toContain('deps');

    const angularTree = createTreeWithEmptyWorkspace();
    await presetGenerator(angularTree, {
      name: 'my-workspace',
      framework: 'angular',
    });
    const angularConfig =
      angularTree.read('workshop-angular/vitest.unit.config.ts', 'utf-8') ?? '';
    expect(angularConfig).not.toContain('deps');
  });

  it("angular's test-setup.ts mirrors libs/angular/src/test-setup.ts: TestBed setup via @analogjs/vitest-angular", async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const setup =
      tree.read('workshop-angular/src/test-setup.ts', 'utf-8') ?? '';
    expect(setup).toContain("import '@angular/compiler'");
    expect(setup).toContain('@analogjs/vitest-angular/setup-snapshots');
    expect(setup).toContain(
      "import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed'",
    );
    expect(setup).toContain('setupTestBed();');
  });

  it('adds a "test" target per app (mirroring storybook-test\'s shape) and a root check:unit script', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const project = readJson(tree, 'workshop-react/project.json');
    expect(project.targets.test.executor).toBe('nx:run-commands');
    expect(project.targets.test.options.command).toBe(
      'npx vitest run --config vitest.unit.config.ts',
    );
    expect(project.targets.test.options.cwd).toBe('workshop-react');

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['check:unit']).toBe('nx run-many -t test');
  });

  it("replaces whatever \"test\" target the application generator already wrote (e.g. '@angular/build:unit-test', written regardless of skipTests) with vitest.unit.config.ts's own", async () => {
    angularAppMock.mockImplementationOnce(
      (tree: Tree, options: { name: string }) => {
        tree.write(
          `${options.name}/project.json`,
          JSON.stringify({
            name: options.name,
            targets: {
              build: { executor: 'fake:build' },
              test: {
                executor: '@angular/build:unit-test',
                options: { watch: false },
              },
            },
          }),
        );
        tree.write(
          `${options.name}/eslint.config.mjs`,
          ESLINT_CONFIG_BASELINE.angular,
        );
        return Promise.resolve(undefined);
      },
    );

    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const project = readJson(tree, 'workshop-angular/project.json');
    expect(project.targets.test.executor).toBe('nx:run-commands');
    expect(project.targets.test.options.command).toBe(
      'npx vitest run --config vitest.unit.config.ts',
    );
    // The unrelated target the mock also seeded survives — only "test" gets
    // replaced.
    expect(project.targets.build).toEqual({ executor: 'fake:build' });
  });

  it.each([
    ['angular', 'ts'],
    ['react', 'tsx'],
    ['vue', 'ts'],
  ] as const)(
    'writes an example atl-button.spec importing AtlButton from @atelier-ui/%s, asserting its accessible name and a click reaching the handler',
    async (fw, ext) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const spec =
        tree.read(`workshop-${fw}/src/atl-button.spec.${ext}`, 'utf-8') ?? '';
      expect(spec).toContain(`from '@atelier-ui/${fw}'`);
      expect(spec).toContain("name: 'Click me'");
      expect(spec).toContain('onClick');
      // Exactly one @atelier-ui import — the same external-package-import
      // discipline the example story keeps (see the CLI e2e's
      // 'external: 1' assertion on check:contracts' output).
      expect(spec.match(/from '@atelier-ui\//g) ?? []).toHaveLength(1);
    },
  );

  it('adds jsdom as a devDependency', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['jsdom']).toBe('^27.1.0');
  });

  it("does not override an existing jsdom devDependency (angular's own application generator already adds one via its native unit-test wiring)", async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        name: 'my-workspace',
        devDependencies: { jsdom: '30.0.0' },
      }),
    );

    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies.jsdom).toBe('30.0.0');
  });

  it("adds @testing-library/angular for the unit test runner when angular is selected, not the other frameworks' packages", async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@testing-library/angular']).toBe('^19.2.1');
    expect(pkg.devDependencies['@testing-library/react']).toBeUndefined();
    expect(pkg.devDependencies['@testing-library/vue']).toBeUndefined();
  });

  it("adds @testing-library/react for the unit test runner when react is selected, not the other frameworks' packages", async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@testing-library/react']).toBe('^16.3.2');
    expect(pkg.devDependencies['@testing-library/angular']).toBeUndefined();
    expect(pkg.devDependencies['@testing-library/vue']).toBeUndefined();
  });

  it("adds @testing-library/vue for the unit test runner when vue is selected, not the other frameworks' packages", async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@testing-library/vue']).toBe('^8.1.0');
    expect(pkg.devDependencies['@testing-library/angular']).toBeUndefined();
    expect(pkg.devDependencies['@testing-library/react']).toBeUndefined();
  });

  it.each(['angular', 'react', 'vue'] as const)(
    'adds @testing-library/jest-dom for the unit test runner regardless of framework (%s), generalized from the vue-only browser-mode add',
    async (fw) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      const pkg = readJson(tree, 'package.json');
      expect(pkg.devDependencies['@testing-library/jest-dom']).toBe('^6.9.1');
    },
  );

  it('adds @analogjs/vitest-angular only when angular is selected', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });
    const angularPkg = readJson(tree, 'package.json');
    expect(angularPkg.devDependencies['@analogjs/vitest-angular']).toBe(
      '2.7.1',
    );

    tree = createTreeWithEmptyWorkspace();
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });
    const reactPkg = readJson(tree, 'package.json');
    expect(
      reactPkg.devDependencies['@analogjs/vitest-angular'],
    ).toBeUndefined();
  });

  it.each([
    ['angular', 'ts'],
    ['react', 'tsx'],
    ['vue', 'ts'],
  ] as const)(
    "%s preview template sets parameters.a11y.test to 'error'",
    async (fw, ext) => {
      await presetGenerator(tree, { name: 'my-workspace', framework: fw });

      expect(
        tree.read(`workshop-${fw}/.storybook/preview.${ext}`, 'utf-8'),
      ).toContain("test: 'error'");
    },
  );

  it('adds storybook/build-storybook targets on port 6006 for a single framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const project = readJson(tree, 'workshop-angular/project.json');
    expect(project.targets.storybook.executor).toBe('nx:run-commands');
    expect(project.targets.storybook.options.command).toBe(
      'npx storybook dev --config-dir workshop-angular/.storybook --port 6006',
    );
    expect(project.targets['build-storybook'].outputs).toEqual([
      '{workspaceRoot}/dist/storybook/workshop-angular',
    ]);
    expect(project.targets['build-storybook'].options.command).toBe(
      'npx storybook build --config-dir workshop-angular/.storybook --output-dir dist/storybook/workshop-angular',
    );
  });

  it("preserves the application generator's own targets (e.g. build) alongside storybook", async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    // mockAppGenerator seeds a placeholder `build` target standing in for the
    // real generator's build/serve/test/etc. — asserting it survives proves
    // the preset merges the storybook targets in rather than replacing
    // `targets` wholesale.
    const project = readJson(tree, 'workshop-angular/project.json');
    expect(project.targets.build).toEqual({ executor: 'fake:build' });
    expect(project.targets.storybook).toBeDefined();
    expect(project.targets['build-storybook']).toBeDefined();
  });

  it('fails loudly if the app has no project.json when Storybook targets are added', async () => {
    // Simulate a framework application generator that, unlike the real one,
    // does not write project.json — the preset must not silently skip adding
    // the storybook targets. Still writes eslint.config.mjs (like the real
    // generator does), so the ESLint-posture step (S4, earlier in the
    // pipeline) doesn't pre-empt this with its own loud failure instead —
    // that path has its own dedicated test below.
    angularAppMock.mockImplementationOnce(
      (tree: Tree, options: { name: string }) => {
        tree.write(
          `${options.name}/eslint.config.mjs`,
          ESLINT_CONFIG_BASELINE.angular,
        );
        return Promise.resolve(undefined);
      },
    );

    await expect(
      presetGenerator(tree, { name: 'my-workspace', framework: 'angular' }),
    ).rejects.toThrow('workshop-angular/project.json');
  });

  // ─── Prettier (formatting enforcement) ─────────────────────────────────────
  //
  // Measured 2026-09-12 against a real workspace generated through this
  // preset via a local verdaccio (tasks/todo.md, "A. Formatting
  // enforcement"): a fresh `create-nx-workspace` tree has neither a
  // `prettier` devDependency nor a `.prettierrc`. These tests assert the
  // preset writes both, plus the two scripts, in this monorepo's own
  // `prettier --write .` / `prettier --check .` shape rather than
  // `nx format:*` — chosen on two distinct, separately measured failure
  // modes of the latter: (1) with no formatter installed at all,
  // `nx format:check` exits 0 printing "No formatter configured" — a
  // silent pass on the untouched scaffold, before any git logic runs; (2)
  // once prettier is installed, `nx format:check` un-flagged does NOT
  // silently pass right after scaffolding (`git init` stages without
  // committing, so it falls back to an all-files scan and correctly
  // reports every unformatted file, exit 1) — the silent zero-file pass
  // only appears once the attendee's own first commit puts `main` and
  // `HEAD` at the same revision, which is the state a workspace reaches
  // within minutes either way.

  it("writes .prettierrc with singleQuote: true, matching this monorepo's own", async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const prettierrc = readJson(tree, '.prettierrc');
    expect(prettierrc).toEqual({ singleQuote: true });
  });

  it('adds prettier as a devDependency at the version this monorepo declares', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['prettier']).toBe('~3.9.6');
  });

  it('adds format and check:format scripts in the prettier --write/--check shape, not nx format:*', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts.format).toBe('prettier --write .');
    expect(pkg.scripts['check:format']).toBe('prettier --check .');
  });

  it('CLAUDE.md and README document the Formatting scripts', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('## Formatting');
    expect(md).toContain('check:format');
    expect(md).toContain('.prettierrc');

    const readme = tree.read('README.md', 'utf-8') ?? '';
    expect(readme).toContain('## Formatting');
    expect(readme).toContain('check:format');
  });

  // ─── Stylelint (ported CSS-discipline rules, ADR-0130) ─────────────────────

  it('writes the ported stylelint rule files, byte-identical clones', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    for (const file of [
      'index.js',
      'utils.js',
      'no-raw-color-literal.js',
      'no-undeclared-token.js',
      'no-primitive-token.js',
      'no-token-bypass.js',
    ]) {
      expect(tree.exists(`tools/stylelint-rules/${file}`)).toBe(true);
    }
  });

  it('stylelint.config.mjs wires exactly the three attendee-facing rules, not no-primitive-token', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const config = tree.read('stylelint.config.mjs', 'utf-8') ?? '';
    expect(config).toContain("'atelier/no-raw-color-literal': true");
    expect(config).toContain("'atelier/no-undeclared-token'");
    expect(config).toContain("'atelier/no-token-bypass'");
    // no-primitive-token.js ships (previous test) but is never turned on as
    // a rule here — see buildStylelintConfig's comment on why. The comment
    // itself names the rule to explain the omission, so assert on the
    // rule-key form (quoted, as it would appear if actually wired) rather
    // than banning the bare word.
    expect(config).not.toContain("'atelier/no-primitive-token'");
    expect(config).toContain(
      "import atelier from './tools/stylelint-rules/index.js';",
    );
  });

  it('stylelint.config.mjs names the exact tokens.css path the generator writes for the selected framework, and no other', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const config = tree.read('stylelint.config.mjs', 'utf-8') ?? '';
    // Same path this suite's own "writes tokens.css into the scaffolded ***
    // app" tests assert tree.write puts the file at — not re-derived, the
    // literal string both sides must agree on.
    expect(config).toContain('workshop-angular/src/styles/tokens.css');
    expect(config).not.toContain('workshop-react/src/styles/tokens.css');
    expect(config).not.toContain('workshop-vue/src/styles/tokens.css');
  });

  it("adds a stylelint target per app, ignoring that app's own tokens.css", async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'react',
    });

    const project = readJson(tree, 'workshop-react/project.json');
    expect(project.targets.stylelint.executor).toBe('nx:run-commands');
    const command = project.targets.stylelint.options.command as string;
    expect(command).toContain("stylelint 'workshop-react/src/**/*.css'");
    expect(command).toContain(
      "--ignore-pattern 'workshop-react/src/styles/tokens.css'",
    );
    expect(command).toContain('--config stylelint.config.mjs');
  });

  it('leaves an existing lint target untouched and adds stylelint as a separate sibling', async () => {
    // The real @nx/{angular,react,vue}:application generator DOES write its
    // own `lint` target (an explicit `@nx/eslint:lint` executor entry,
    // confirmed by running it for real) — the plain mock above doesn't, so
    // this test seeds one itself, the same way the "preserves the
    // application generator's own targets" test above seeds a placeholder
    // `build` target, to actually exercise the "don't touch it" claim rather
    // than trivially finding no `lint` key at all.
    reactAppMock.mockImplementationOnce(
      (t: Tree, options: { name: string }) => {
        t.write(
          `${options.name}/project.json`,
          JSON.stringify({
            name: options.name,
            targets: {
              lint: { executor: '@nx/eslint:lint', options: {} },
            },
          }),
        );
        t.write(
          `${options.name}/eslint.config.mjs`,
          ESLINT_CONFIG_BASELINE.react,
        );
        return Promise.resolve(undefined);
      },
    );

    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const project = readJson(tree, 'workshop-react/project.json');
    expect(project.targets.lint).toEqual({
      executor: '@nx/eslint:lint',
      options: {},
    });
    expect(project.targets.stylelint.executor).toBe('nx:run-commands');
  });

  it('adds nx.json targetDefaults.stylelint with cache + the declared inputs, minus allowlists.js', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const nxJson = readJson(tree, 'nx.json');
    const stylelintDefaults = nxJson.targetDefaults.stylelint;
    expect(stylelintDefaults.cache).toBe(true);
    expect(stylelintDefaults.inputs).toEqual(
      expect.arrayContaining([
        'default',
        '^default',
        '{workspaceRoot}/stylelint.config.mjs',
        '{workspaceRoot}/tools/stylelint-rules/**/*',
        '{workspaceRoot}/workshop-angular/src/styles/tokens.css',
        { externalDependencies: ['stylelint'] },
      ]),
    );
    // Only the selected framework's own app is named — no second app's
    // tokens.css to also list.
    expect(stylelintDefaults.inputs).not.toContain(
      '{workspaceRoot}/workshop-vue/src/styles/tokens.css',
    );
    // Unlike this repo's own nx.json: the scaffold ships no allowlists.js.
    expect(
      stylelintDefaults.inputs.some(
        (input: unknown) =>
          typeof input === 'string' && input.includes('allowlists.js'),
      ),
    ).toBe(false);
  });

  it('preserves nx.json targetDefaults already present in the tree', async () => {
    // createTreeWithEmptyWorkspace seeds nx.json with targetDefaults.build and
    // .lint already set — asserting they survive proves the preset merges its
    // own entry in rather than replacing targetDefaults wholesale.
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const nxJson = readJson(tree, 'nx.json');
    expect(nxJson.targetDefaults.build).toBeDefined();
    expect(nxJson.targetDefaults.lint).toBeDefined();
    expect(nxJson.targetDefaults.stylelint).toBeDefined();
  });

  it('adds stylelint as a devDependency at the exact version this monorepo runs', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['stylelint']).toBe('17.15.0');
    // Only needed to lint .astro files — the scaffold has none.
    expect(pkg.devDependencies['postcss-html']).toBeUndefined();
  });

  it('adds check:stylelint to package.json scripts', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['check:stylelint']).toBe('nx run-many -t stylelint');
  });

  // ─── The contract loop (ADR-0121 S4) ───────────────────────────────────────

  it('writes the example contract files under the app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    expect(tree.exists('workshop-react/src/contracts/types.ts')).toBe(true);
    expect(tree.exists('workshop-react/src/contracts/README.md')).toBe(true);
    expect(tree.exists('workshop-react/src/contracts/button.contract.ts')).toBe(
      true,
    );
  });

  it('example contract file references AtlButton and its Figma node id', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'react' });

    const contract =
      tree.read('workshop-react/src/contracts/button.contract.ts', 'utf-8') ??
      '';
    expect(contract).toContain("component: 'AtlButton'");
    expect(contract).toContain("figmaNodeId: '129:20'");
  });

  it('writes the shared contract-loop scripts under tools/scripts', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    expect(tree.exists('tools/scripts/check-contracts.mjs')).toBe(true);
    expect(tree.exists('tools/scripts/lib/ts-eval.js')).toBe(true);
    expect(tree.exists('tools/scripts/lib/docgen.mjs')).toBe(true);
    expect(tree.exists('tools/scripts/figma-snapshot-contracts.mjs')).toBe(
      true,
    );
  });

  it('writes the AtlButton-only Figma snapshot projection', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const snapshot = readJson(tree, 'tools/figma/snapshot.json');
    expect(snapshot.components).toHaveLength(1);
    expect(snapshot.components[0].selector).toBe('AtlButton');
    expect(snapshot.components[0].nodeId).toBe('129:20');
  });

  it('writes contracts.config.json naming the selected framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'vue' });

    const config = readJson(tree, 'contracts.config.json');
    expect(config.framework).toBe('vue');
    expect(config.contracts).toBe('workshop-vue/src/contracts');
    expect(config.stories).toEqual(['workshop-vue/src']);
    expect(config.snapshot).toBe('tools/figma/snapshot.json');
  });

  it('adds check:contracts and a placeholder figma:snapshot script to package.json', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['check:contracts']).toBe(
      'node tools/scripts/check-contracts.mjs',
    );
    expect(pkg.scripts['figma:snapshot']).toBe(
      'node tools/scripts/figma-snapshot-contracts.mjs --file <YOUR_FIGMA_FILE_KEY>',
    );
  });

  // ─── S5a — figmaFile schema option ──────────────────────────────────────

  it('names the given figmaFile key in the figma:snapshot script instead of the placeholder', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
      figmaFile: 'QMnDD8uZQPldPrlCwZZ58T',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['figma:snapshot']).toBe(
      'node tools/scripts/figma-snapshot-contracts.mjs --file QMnDD8uZQPldPrlCwZZ58T',
    );
  });

  it('keeps the literal placeholder in figma:snapshot when figmaFile is not given', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['figma:snapshot']).toBe(
      'node tools/scripts/figma-snapshot-contracts.mjs --file <YOUR_FIGMA_FILE_KEY>',
    );
  });

  it('CLAUDE.md says the figma:snapshot script is already pointed at the given figmaFile key', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
      figmaFile: 'QMnDD8uZQPldPrlCwZZ58T',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain(
      '`figma:snapshot` is already pointed at `QMnDD8uZQPldPrlCwZZ58T`; change it if you\nduplicate the file again',
    );
    expect(md).not.toContain('<YOUR_FIGMA_FILE_KEY>');
  });

  it('CLAUDE.md tells the reader to edit the placeholder when figmaFile is not given', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain(
      "edit the `--file` placeholder in `package.json`'s `figma:snapshot` script to\nyour own Figma file key",
    );
    expect(md).not.toContain('already pointed at');
  });

  // ─── S5a — figmaFile schema pattern ────────────────────────────────────────
  //
  // options.figmaFile is interpolated verbatim into a shell command line
  // (package.json's `figma:snapshot` script — see the `--file
  // ${options.figmaFile}` assignment in preset.ts). The CLI
  // (create-atelier-ui-workspace/bin/index.ts) validates the raw value up
  // front via its own FIGMA_FILE_KEY_PATTERN
  // (`/^[A-Za-z0-9]{10,40}$/`) before ever calling this generator, but that
  // is a courtesy the CLI provides — it is not enforced by the generator
  // itself. A direct `nx g @atelier-ui/create-workspace:preset
  // --figmaFile=...` bypasses the CLI entirely, so the schema's own
  // `pattern` (validated by Nx's `validateProperty`,
  // node_modules/nx/dist/src/utils/params.js) is the only thing that can
  // still catch a malicious or malformed value on that path. These tests
  // pin the schema pattern down directly — not through presetGenerator,
  // which never runs Nx's schema validation itself (see the report for what
  // that implies about the create-nx-workspace path).
  describe('figmaFile schema pattern', () => {
    const schema: {
      properties: { figmaFile: { pattern?: string } };
    } = JSON.parse(readFileSync(join(__dirname, './schema.json'), 'utf-8'));

    // Mirrors bin/index.ts's FIGMA_FILE_KEY_PATTERN verbatim (source of
    // truth per the task: "do not invent a second, different rule"). Kept
    // as a literal here, not a cross-package import, since
    // create-atelier-ui-workspace does not depend on @atelier-ui/create-workspace
    // (or vice versa) at runtime — only the CLI's own validation happens to
    // live in the same monorepo checkout.
    const CLI_FIGMA_FILE_KEY_PATTERN = /^[A-Za-z0-9]{10,40}$/;

    it('is present on figmaFile', () => {
      expect(schema.properties.figmaFile.pattern).toBeDefined();
    });

    it('matches the CLI’s own bare-key pattern exactly, not a different rule', () => {
      expect(schema.properties.figmaFile.pattern).toBe(
        CLI_FIGMA_FILE_KEY_PATTERN.source,
      );
    });

    function schemaPattern(): RegExp {
      return new RegExp(schema.properties.figmaFile.pattern as string);
    }

    it.each([
      ['this repo’s own 22-char mixed-case key', 'QMnDD8uZQPldPrlCwZZ58T'],
      ['the 10-char minimum boundary', 'a'.repeat(10)],
      ['the 40-char maximum boundary', 'a'.repeat(40)],
    ])('accepts %s', (_label, value) => {
      expect(schemaPattern().test(value)).toBe(true);
    });

    it.each([
      ['9 characters (one under the minimum)', 'a'.repeat(9)],
      ['41 characters (one over the maximum)', 'a'.repeat(41)],
      ['a hyphenated URL slug, not a bare key', 'some-file-name'],
      [
        'a full Figma URL (the CLI extracts the key before this generator ever sees it)',
        'https://figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Some-File',
      ],
      [
        'a shell-metacharacter payload (the exact injection this pattern closes)',
        'abc; rm -rf /',
      ],
      ['a value containing whitespace', 'abcdefghij klmnop'],
      ['an empty string', ''],
    ])('rejects %s', (_label, value) => {
      expect(schemaPattern().test(value)).toBe(false);
    });
  });

  it('adds @modelcontextprotocol/sdk as a devDependency', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@modelcontextprotocol/sdk']).toBe('^1.29.0');
  });

  it('adds typescript as a devDependency when the workspace does not already have it', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['typescript']).toBe('6.0.3');
  });

  it('does not override an existing typescript devDependency', async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        name: 'my-workspace',
        devDependencies: { typescript: '5.4.0' },
      }),
    );

    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['typescript']).toBe('5.4.0');
  });

  it('CLAUDE.md contains "The Contract Loop" section', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('## The Contract Loop');
    expect(md).toContain('check:contracts');
    expect(md).toContain('figma:snapshot');
    expect(md).toContain('addon-vitest');
  });

  // ─── CLAUDE.md / README mention Storybook + skills (S3) ────────────────────

  it('CLAUDE.md documents the storybook dev command and port', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npx nx storybook workshop-angular');
    expect(md).toContain('6006');
  });

  it('CLAUDE.md mentions all four storybookjs/mcp skills by name', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('stories');
    expect(md).toContain('storybook-init');
    expect(md).toContain('storybook-setup');
    expect(md).toContain('storybook-upgrade');
    expect(md).toContain('storybookjs/mcp');
  });

  it('CLAUDE.md documents that test-run and check:stories both work', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('test-run');
    expect(md).toContain('addon-vitest');
    expect(md).toContain('check:stories');
    expect(md).toContain('playwright install chromium');
  });

  it('CLAUDE.md prints the re-run command when skills are enabled', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npx -y skills@1.5.25 add storybookjs/mcp');
  });

  it('README mentions the skills and the storybook command', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
    });

    const readme = tree.read('README.md', 'utf-8') ?? '';
    expect(readme).toContain('storybookjs/mcp');
    expect(readme).toContain('npx nx storybook workshop-angular');
  });

  // ─── Skills install as a post-generator task (S2) ──────────────────────────

  // Stubs process.platform for the duration of `fn`, restoring it afterwards
  // — `runSkillsAddCommand` reads `process.platform` live on every call
  // specifically so tests can flip it per-case without resetting modules.
  async function withPlatform(
    platform: NodeJS.Platform,
    fn: () => Promise<void>,
  ) {
    const original = Object.getOwnPropertyDescriptor(process, 'platform');
    if (!original)
      throw new Error('process.platform has no property descriptor');
    Object.defineProperty(process, 'platform', {
      value: platform,
      configurable: true,
    });
    try {
      await fn();
    } finally {
      Object.defineProperty(process, 'platform', original);
    }
  }

  it('invokes the pinned skills CLI with the expected argv and env on POSIX', async () => {
    await withPlatform('darwin', async () => {
      await installSkills(tree, true);
    });

    expect(spawnMock).toHaveBeenCalledTimes(1);
    const [file, args, options] = spawnMock.mock.calls[0];
    // POSIX: no shell involved, so `spawn` gets the command and its argv as
    // two separate arguments — nothing here is in a position to glob-expand
    // the literal `*` in `--skill *`.
    expect(file).toBe('npx');
    expect(args).toEqual([
      '-y',
      'skills@1.5.25',
      'add',
      'storybookjs/mcp',
      '--skill',
      '*',
      '--agent',
      'claude-code',
      '--yes',
      '--copy',
    ]);
    expect(options.shell).toBeUndefined();
    expect(options.stdio).toBe('inherit');
    expect(options.cwd).toBe(tree.root);
    expect(options.env.DO_NOT_TRACK).toBe('1');
    expect(options.env.SKILLS_CLONE_TIMEOUT_MS).toEqual(expect.any(String));
    expect(Number(options.env.SKILLS_CLONE_TIMEOUT_MS)).toBeGreaterThan(0);
    expect(typeof options.timeout).toBe('number');
    expect(options.timeout).toBeGreaterThan(0);
    expect(options.killSignal).toBe('SIGTERM');
  });

  it('on Windows, runs the install through cmd.exe with the literal * quoted', async () => {
    await withPlatform('win32', async () => {
      await installSkills(tree, true);
    });

    expect(spawnMock).toHaveBeenCalledTimes(1);
    const [commandLine, options] = spawnMock.mock.calls[0];
    // Windows: npx resolves to npx.cmd, which Node can only run through
    // cmd.exe — that requires `shell: true`, which in turn means the whole
    // command line has to be built (and quoted) by hand rather than handed
    // to `spawn` as a separate args array.
    expect(typeof commandLine).toBe('string');
    expect(options.shell).toBe(true);
    expect(commandLine).toContain('npx');
    expect(commandLine).toContain('skills@1.5.25');
    expect(commandLine).toContain('storybookjs/mcp');
    // The one token that must survive as a literal, unexpandable `*`.
    expect(commandLine).toContain('--skill "*"');
  });

  it('does not invoke the skills CLI when skills is disabled', async () => {
    await installSkills(tree, false);

    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('skips the skills install entirely when skills: false is passed to the generator', async () => {
    const task = await presetGenerator(tree, {
      name: 'my-workspace',
      framework: 'angular',
      skills: false,
    });
    await task();

    expect(spawnMock).not.toHaveBeenCalled();
  });

  it('does not throw when the skills command fails to spawn — non-fatal by design', async () => {
    mockSkillsCliFailure('network unreachable');

    await expect(installSkills(tree, true)).resolves.toBeUndefined();
  });

  it('prints the manual re-run command when the skills install fails to spawn', async () => {
    mockSkillsCliFailure('network unreachable');
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    await installSkills(tree, true);

    const warnings = warnSpy.mock.calls
      .map((call) => call.join(' '))
      .join('\n');
    expect(warnings).toContain('network unreachable');
    expect(warnings).toContain('npx -y skills@1.5.25 add storybookjs/mcp');
    warnSpy.mockRestore();
  });

  it('does not throw when npx exits with a non-zero code — non-fatal by design', async () => {
    mockSkillsCliNonZeroExit(1);

    await expect(installSkills(tree, true)).resolves.toBeUndefined();
  });

  it('warns with the exit code when npx exits with a non-zero code', async () => {
    mockSkillsCliNonZeroExit(1);
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    await installSkills(tree, true);

    const warnings = warnSpy.mock.calls
      .map((call) => call.join(' '))
      .join('\n');
    expect(warnings).toContain('exited with code 1');
    expect(warnings).toContain('npx -y skills@1.5.25 add storybookjs/mcp');
    warnSpy.mockRestore();
  });

  it('does not throw when the install timeout kills the child — non-fatal by design', async () => {
    mockSkillsCliTimeoutKill('SIGTERM');

    await expect(installSkills(tree, true)).resolves.toBeUndefined();
  });

  it('warns about the timeout, not a bare signal, when the install is killed after SKILLS_INSTALL_TIMEOUT_MS', async () => {
    mockSkillsCliTimeoutKill('SIGTERM');
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    await installSkills(tree, true);

    const warnings = warnSpy.mock.calls
      .map((call) => call.join(' '))
      .join('\n');
    expect(warnings).toContain('SIGTERM');
    expect(warnings).toContain('timeout');
    expect(warnings).toContain('npx -y skills@1.5.25 add storybookjs/mcp');
    warnSpy.mockRestore();
  });

  // ─── Claude Code project setup (settings.json, hooks, /verify, agent) ──────

  it('writes .claude/settings.json as valid JSON with the expected keys', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const settings = readJson(tree, '.claude/settings.json');
    expect(settings.enableAllProjectMcpServers).toBe(true);
    expect(Array.isArray(settings.permissions.allow)).toBe(true);
    expect(settings.hooks.PostToolUse[0].matcher).toBe('Edit|Write');
  });

  it('.claude/settings.json permissions cover the Nx CLI, the npm scripts, the Storybook CLI, and playwright install', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const settings = readJson(tree, '.claude/settings.json');
    const allow: string[] = settings.permissions.allow;
    expect(allow).toContain('Bash(npx nx *)');
    expect(allow).toContain('Bash(npm run *)');
    expect(allow).toContain('Bash(npx storybook dev *)');
    expect(allow).toContain('Bash(npx storybook build *)');
    expect(allow).toContain('Bash(npx playwright install *)');
  });

  it('.claude/settings.json asks before `npx nx migrate` despite the broad `npx nx *` allow wildcard', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const settings = readJson(tree, '.claude/settings.json');
    // The broad allow wildcard stays untouched — narrowing happens via ask,
    // not by editing the allow entry itself.
    expect(settings.permissions.allow).toContain('Bash(npx nx *)');
    const ask: string[] = settings.permissions.ask;
    expect(Array.isArray(ask)).toBe(true);
    // Both the bare form (no version argument) and the with-args form, so a
    // trailing-space gap in the wildcard form can't let a bare invocation
    // through.
    expect(ask).toContain('Bash(npx nx migrate)');
    expect(ask).toContain('Bash(npx nx migrate *)');
  });

  it('.claude/settings.json wires the PostToolUse hook to format-edited.sh via $CLAUDE_PROJECT_DIR', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const settings = readJson(tree, '.claude/settings.json');
    const command = settings.hooks.PostToolUse[0].hooks[0].command;
    expect(command).toBe(
      'bash "$CLAUDE_PROJECT_DIR/.claude/hooks/format-edited.sh"',
    );
  });

  it('writes .claude/hooks/format-edited.sh reading tool_input.file_path off stdin, without depending on jq', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const hook = tree.read('.claude/hooks/format-edited.sh', 'utf-8') ?? '';
    expect(hook).toContain('#!/usr/bin/env bash');
    expect(hook).toContain('tool_input');
    expect(hook).toContain('file_path');
    // Parses JSON with node, never by invoking a `jq` binary — this
    // workspace declares no jq dependency and it isn't guaranteed to be on
    // an attendee's machine.
    expect(hook).not.toMatch(/^\s*jq\b/m);
    expect(hook).toContain('node -e');
    // Prefers the locally installed binaries over npx (npx's per-edit
    // resolution cost is exactly why a hook gets turned off).
    expect(hook).toContain('node_modules/.bin/prettier');
    expect(hook).toContain('node_modules/.bin/stylelint');
    expect(hook).toContain('exit 0');
  });

  it('writes a /verify command naming all five checks', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    expect(tree.exists('.claude/commands/verify.md')).toBe(true);
    const verify = tree.read('.claude/commands/verify.md', 'utf-8') ?? '';
    expect(verify).toContain('check:format');
    expect(verify).toContain('check:stylelint');
    expect(verify).toContain('check:contracts');
    expect(verify).toContain('check:unit');
    expect(verify).toContain('check:stories');
    // The exit-code rule, not a piped pass/fail summary.
    expect(verify).toContain('exit code');
  });

  it('writes a read-only component-review subagent scoped to one component', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    expect(tree.exists('.claude/agents/component-review.md')).toBe(true);
    const agent =
      tree.read('.claude/agents/component-review.md', 'utf-8') ?? '';
    expect(agent).toContain('name: component-review');
    expect(agent).toContain('tools: Read, Grep, Glob, Bash');
    expect(agent).toContain('model: sonnet');
    expect(agent.toLowerCase()).toContain('contract');
    expect(agent.toLowerCase()).toContain('accessibility');
    // No Edit/Write in the tools line — the frontmatter is the enforcement,
    // not just the prose telling it not to edit.
    expect(agent).not.toMatch(/tools:.*\b(Edit|Write)\b/);
  });

  it('writes the atelier-component skill into the workspace', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    expect(tree.exists('.claude/skills/atelier-component/SKILL.md')).toBe(true);
    const skill =
      tree.read('.claude/skills/atelier-component/SKILL.md', 'utf-8') ?? '';
    expect(skill).toContain('name: atelier-component');
  });

  it('atelier-component skill names all five checks in "Definition of done" and check:unit in the check-capability table', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const skill =
      tree.read('.claude/skills/atelier-component/SKILL.md', 'utf-8') ?? '';
    expect(skill).toContain('## Definition of done');
    expect(skill).toContain('check:format');
    expect(skill).toContain('check:stylelint');
    expect(skill).toContain('check:contracts');
    expect(skill).toContain('check:unit');
    expect(skill).toContain('check:stories');
  });

  it.each(['angular', 'react', 'vue'] as const)(
    'atelier-component skill has both placeholders fully substituted for %s, with no `<app>`/`<framework>` token left',
    async (framework) => {
      await presetGenerator(tree, { name: 'my-workspace', framework });

      const skill =
        tree.read('.claude/skills/atelier-component/SKILL.md', 'utf-8') ?? '';
      // Neither placeholder token survives anywhere in the rendered file —
      // `<name>` (the unrelated, per-component placeholder) is untouched and
      // deliberately excluded from this assertion.
      expect(skill).not.toContain('<app>');
      expect(skill).not.toContain('<framework>');
      expect(skill).toContain(`workshop-${framework}`);
      expect(skill).toContain(`@atelier-ui/${framework}`);
      expect(skill).toContain(`workshop-${framework}/src/contracts/README.md`);
      // The per-component placeholder is untouched, not collateral damage
      // from the `<app>`/`<framework>` substitution.
      expect(skill).toContain('<name>.contract.ts');
    },
  );

  it('appends .claude/settings.local.json to .gitignore without disturbing existing entries', async () => {
    tree.write('.gitignore', 'node_modules\ndist\n');

    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const gitignore = tree.read('.gitignore', 'utf-8') ?? '';
    expect(gitignore).toContain('node_modules');
    expect(gitignore).toContain('dist');
    expect(gitignore).toContain('.claude/settings.local.json');
  });

  it('writes .claude/settings.local.json to .gitignore even when no .gitignore existed yet', async () => {
    expect(tree.exists('.gitignore')).toBe(false);

    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const gitignore = tree.read('.gitignore', 'utf-8') ?? '';
    expect(gitignore).toContain('.claude/settings.local.json');
  });

  it('CLAUDE.md has a Definition of Done section naming all five checks and the exit-code rule', async () => {
    await presetGenerator(tree, { name: 'my-workspace', framework: 'angular' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('## Definition of Done');
    expect(md).toContain('check:format');
    expect(md).toContain('check:stylelint');
    expect(md).toContain('check:contracts');
    expect(md).toContain('check:unit');
    expect(md).toContain('check:stories');
    expect(md).toContain("gate's result is its exit code");
  });

  it.each(['true', 'false'] as const)(
    'CLAUDE.md distinguishes the unconditional atelier-component skill from the fetched storybookjs/mcp skills (skills: %s)',
    async (skillsFlag) => {
      await presetGenerator(tree, {
        name: 'my-workspace',
        framework: 'angular',
        skills: skillsFlag === 'true',
      });

      const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
      expect(md).toContain('## Agent Skills');
      expect(md).toContain('atelier-component');
      expect(md).toContain('.claude/skills/atelier-component/SKILL.md');
      expect(md).toContain('network fetch');
      expect(md).toContain('no `skills: false` opt-out');
      expect(md).toContain('unlike the four skills below');
    },
  );

  it.each(['angular', 'react', 'vue'] as const)(
    'CLAUDE.md has a Framework Idioms section for %s',
    async (framework) => {
      await presetGenerator(tree, { name: 'my-workspace', framework });

      const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
      expect(md).toContain('## Framework Idioms');
      if (framework === 'angular') {
        expect(md).toContain('zoneless');
        expect(md).toContain('inject()');
      }
      if (framework === 'react') {
        expect(md).toContain('Rules of Hooks');
        expect(md).toContain('Vite SPA');
      }
      if (framework === 'vue') {
        expect(md).toContain('<script setup>');
        expect(md).toContain('defineModel()');
      }
    },
  );

  // ─── CLAUDE.md Design Tokens section stays pinned to tokens.css ───────────
  //
  // preset.ts's CLAUDE.md template names specific --ui-* tokens in prose, and
  // for Spacing/Radius quotes their rem values by hand — nothing derives them
  // from tokens.css at generation time. That is exactly how the Radius line
  // went stale after tokens.css's radius bump. Rather than pin a second
  // hardcoded copy of the values here (the same bug with one more copy), this
  // reads the actual shipped tokens.css and re-derives what the template
  // SHOULD say, so the test fails if either file's numbers move without the
  // other, and fails if a named token doesn't exist in tokens.css at all.
  describe('CLAUDE.md Design Tokens section vs. tokens.css', () => {
    const TOKENS_CSS_PATH = join(__dirname, 'files/styles/tokens.css');

    function parseCanonicalTokens(css: string): Record<string, string> {
      const root = css.match(/:root\s*\{([\s\S]*?)\n\}/);
      if (!root) {
        throw new Error(
          'tokens.css has no top-level :root block to read canonical values from',
        );
      }
      const values: Record<string, string> = {};
      const declaration = /(--[\w-]+):\s*([^;]+);/g;
      let match: RegExpExecArray | null;
      while ((match = declaration.exec(root[1])) !== null) {
        values[match[1]] = match[2].trim();
      }
      return values;
    }

    function parseNamedTokens(
      md: string,
    ): Array<{ name: string; value?: string }> {
      const start = md.indexOf('Key tokens:');
      const end = md.indexOf('## Rules', start);
      if (start === -1 || end === -1) {
        throw new Error(
          'CLAUDE.md is missing the "Key tokens:" / "## Rules" Design Tokens section',
        );
      }
      const section = md.slice(start, end);
      const named: Array<{ name: string; value?: string }> = [];
      const entry = /(--[\w-]+)(?:\s*\(([^)]+)\))?/g;
      let match: RegExpExecArray | null;
      while ((match = entry.exec(section)) !== null) {
        named.push({ name: match[1], value: match[2]?.trim() });
      }
      return named;
    }

    it('names only tokens that exist in tokens.css, quoting exactly the values tokens.css declares', async () => {
      await presetGenerator(tree, {
        name: 'my-workspace',
        framework: 'react',
      });
      const md = tree.read('CLAUDE.md', 'utf-8') ?? '';

      const canonical = parseCanonicalTokens(
        readFileSync(TOKENS_CSS_PATH, 'utf-8'),
      );
      const named = parseNamedTokens(md);

      // Guards against either parser above silently matching nothing, which
      // would make every assertion below vacuously true.
      expect(named.length).toBeGreaterThanOrEqual(10);
      expect(Object.keys(canonical).length).toBeGreaterThan(50);

      for (const { name, value } of named) {
        expect(canonical).toHaveProperty(name);
        if (value !== undefined) {
          expect(canonical[name]).toBe(value);
        }
      }
    });
  });
});
