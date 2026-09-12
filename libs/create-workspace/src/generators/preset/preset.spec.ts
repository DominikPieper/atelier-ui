import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson } from '@nx/devkit';
import { EventEmitter } from 'node:events';
import { spawn } from 'node:child_process';
import { installSkills, presetGenerator } from './preset';

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
      frameworks: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp']).toBeDefined();
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-react']).toBeUndefined();
    expect(settings.mcpServers['storybook-vue']).toBeUndefined();
  });

  it('writes .mcp.json with all three MCPs for multi-framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-react']).toBeDefined();
    expect(settings.mcpServers['storybook-vue']).toBeDefined();
  });

  it('each MCP entry has type http and correct url', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-react'].type).toBe('http');
    expect(settings.mcpServers['storybook-react'].url).toContain(
      'storybook-react/mcp',
    );
  });

  it('nx-mcp uses stdio command', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp'].type).toBe('stdio');
    expect(settings.mcpServers['nx-mcp'].command).toBe('npx');
  });

  it('nx-mcp args invoke nx mcp', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp'].args).toEqual(['nx', 'mcp']);
  });

  it('writes .mcp.json with react MCP only for react framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-react']).toBeDefined();
    expect(settings.mcpServers['storybook-angular']).toBeUndefined();
    expect(settings.mcpServers['storybook-vue']).toBeUndefined();
  });

  it('writes .mcp.json with vue MCP only for vue framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-vue']).toBeDefined();
    expect(settings.mcpServers['storybook-angular']).toBeUndefined();
    expect(settings.mcpServers['storybook-react']).toBeUndefined();
  });

  it('storybook MCP URLs reference the correct framework path', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-angular'].url).toContain(
      'storybook-angular/mcp',
    );
    expect(settings.mcpServers['storybook-react'].url).toContain(
      'storybook-react/mcp',
    );
    expect(settings.mcpServers['storybook-vue'].url).toContain(
      'storybook-vue/mcp',
    );
  });

  it('multi-framework .mcp.json always includes nx-mcp', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'react,vue',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp']).toBeDefined();
  });

  // ─── figma-console MCP (opt-in) ────────────────────────────────────────────

  it('omits figma-console by default', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeUndefined();
  });

  it('omits figma-console when figmaMcp=false', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
      figmaMcp: false,
    });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeUndefined();
  });

  it('includes figma-console when figmaMcp=true', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
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
      frameworks: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).not.toContain('Figma Setup');
    expect(md).not.toContain('atelier.pieper.io/figma-token');
  });

  it('CLAUDE.md points at the composition cookbook', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
    });
    expect(tree.exists('README.md')).toBe(true);
  });

  // ─── CSS tokens ────────────────────────────────────────────────────────────

  const EXPECTED_IMPORT = "@import './styles/tokens.css';";

  it('writes tokens.css into the scaffolded angular app', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const tokens =
      tree.read('workshop-angular/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('writes tokens.css into the scaffolded react app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const tokens =
      tree.read('workshop-react/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('writes tokens.css into the scaffolded vue app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const tokens =
      tree.read('workshop-vue/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('injects a relative tokens import into styles.css for each framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    for (const fw of ['angular', 'react', 'vue']) {
      const css = tree.read(`workshop-${fw}/src/styles.css`, 'utf-8') ?? '';
      expect(css).toContain(EXPECTED_IMPORT);
    }
  });

  it('does not reference @atelier-ui/<fw>/styles (tokens are local)', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    for (const fw of ['angular', 'react', 'vue']) {
      const css = tree.read(`workshop-${fw}/src/styles.css`, 'utf-8') ?? '';
      expect(css).not.toContain(`@atelier-ui/${fw}/styles`);
    }
  });

  it('tokens import is the first line of styles.css', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8') ?? '';
    expect(css.trimStart()).toMatch(/^@import '\.\/styles\/tokens\.css'/);
  });

  it('preserves existing styles.css content after the import', async () => {
    tree.write('workshop-angular/src/styles.css', '/* existing styles */');

    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
    });
    expect(tree.exists('CLAUDE.md')).toBe(true);
  });

  it('CLAUDE.md includes the three Storybook MCP tools', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('docs-list');
    expect(md).toContain('docs-show');
    expect(md).toContain('docs-show-story');
  });

  it('CLAUDE.md references the correct MCP server name for the framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('storybook-angular');
  });

  it('CLAUDE.md includes Angular-specific import pattern', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/angular');
    expect(md).toContain("import { AtlButton } from '@atelier-ui/angular';");
    expect(md).toContain('atl-button');
  });

  it('CLAUDE.md includes React-specific import pattern', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/react');
    expect(md).toContain('useAtlToast');
    expect(md).toContain('onXxx');
  });

  it('CLAUDE.md includes Vue-specific import pattern', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/vue');
    expect(md).toContain('v-model');
    expect(md).toContain('useAtlToast');
  });

  it('CLAUDE.md includes all three frameworks when all selected', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/angular');
    expect(md).toContain('@atelier-ui/react');
    expect(md).toContain('@atelier-ui/vue');
  });

  it('CLAUDE.md includes app run commands for selected frameworks only', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npx nx serve workshop-angular');
    expect(md).toContain('npx nx serve workshop-react');
    expect(md).not.toContain('npx nx serve workshop-vue');
  });

  it('CLAUDE.md links to the docs site', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('atelier.pieper.io');
  });

  // ─── Preflight ─────────────────────────────────────────────────────────────

  it('writes tools/scripts/preflight.mjs', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
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
      frameworks: 'angular',
    });
    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts.preflight).toBe('node tools/scripts/preflight.mjs');
    expect(pkg.scripts.build).toBe('nx build');
    expect(pkg.scripts.test).toBe('nx test');
  });

  it('CLAUDE.md references preflight in troubleshooting', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
  it('passes e2eTestRunner: none to every framework application generator', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    expect(angularAppMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ e2eTestRunner: 'none' }),
    );
    expect(reactAppMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ e2eTestRunner: 'none' }),
    );
    expect(vueAppMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ e2eTestRunner: 'none' }),
    );
  });

  // Regression: the Angular application generator call omitted `linter:
  // 'eslint'` entirely. Without it, `normalizeLinterOption`'s non-interactive
  // fallback follows whatever the tree already has, or 'none' if nothing does
  // — which is exactly the state of a fresh, single-framework Angular
  // scaffold, so the Angular app got ZERO eslint.config.mjs and no eslint
  // devDependency at all (verified by running the real generator against an
  // empty workspace). React and Vue already passed this; this guards against
  // Angular's call losing it again.
  it("passes linter: 'eslint' to every framework application generator", async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    expect(angularAppMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ linter: 'eslint' }),
    );
    expect(reactAppMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ linter: 'eslint' }),
    );
    expect(vueAppMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ linter: 'eslint' }),
    );
  });

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
      frameworks: 'angular',
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
      frameworks: 'angular',
    });

    const config =
      tree.read('workshop-angular/eslint.config.mjs', 'utf-8') ?? '';
    const baselineIndex = config.indexOf('flat/angular-template');
    const additionIndex = config.indexOf('no-positive-tabindex');
    expect(baselineIndex).toBeGreaterThan(-1);
    expect(additionIndex).toBeGreaterThan(baselineIndex);
  });

  it('React: does not modify workshop-react/eslint.config.mjs beyond the baseline', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const config = tree.read('workshop-react/eslint.config.mjs', 'utf-8') ?? '';
    expect(config).toBe(ESLINT_CONFIG_BASELINE.react);
  });

  it('Vue: appends eslint-config-prettier applied to *.vue, with its import', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const config = tree.read('workshop-vue/eslint.config.mjs', 'utf-8') ?? '';
    expect(config).toContain(
      "import eslintConfigPrettier from 'eslint-config-prettier';",
    );
    expect(config).toContain('eslintConfigPrettier.rules');
    expect(config).toContain("files: ['**/*.vue']");
  });

  it('Vue: appends vue/no-unused-properties opted in for props', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const config = tree.read('workshop-vue/eslint.config.mjs', 'utf-8') ?? '';
    expect(config).toContain(
      "'vue/no-unused-properties': ['error', { groups: ['props'] }]",
    );
  });

  it('Vue: the appended blocks keep the file a valid single flat-config array', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const config = tree.read('workshop-vue/eslint.config.mjs', 'utf-8') ?? '';
    expect((config.match(/export default \[/g) ?? []).length).toBe(1);
    expect(config.trim().endsWith('];')).toBe(true);
  });

  it('adds eslint-config-prettier as a devDependency when vue is selected and it is not already present', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

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

    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

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
      presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' }),
    ).rejects.toThrow('workshop-angular/eslint.config.mjs');
  });

  // ─── Storybook (S1) ────────────────────────────────────────────────────────

  it('writes .storybook/main.ts per selected framework, naming the right framework package', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    const angularMain =
      tree.read('workshop-angular/.storybook/main.ts', 'utf-8') ?? '';
    const reactMain =
      tree.read('workshop-react/.storybook/main.ts', 'utf-8') ?? '';
    const vueMain = tree.read('workshop-vue/.storybook/main.ts', 'utf-8') ?? '';

    expect(angularMain).toContain('@storybook/angular-vite');
    expect(reactMain).toContain('@storybook/react-vite');
    expect(vueMain).toContain('@storybook/vue3-vite');
  });

  it('main.ts keeps addon-mcp/vitest/a11y/docs but drops addon-designs', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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

  it('writes a preview file per framework, .tsx for react and .ts otherwise', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    expect(tree.exists('workshop-angular/.storybook/preview.ts')).toBe(true);
    expect(tree.exists('workshop-react/.storybook/preview.tsx')).toBe(true);
    expect(tree.exists('workshop-vue/.storybook/preview.ts')).toBe(true);

    const reactPreview =
      tree.read('workshop-react/.storybook/preview.tsx', 'utf-8') ?? '';
    expect(reactPreview).toContain('../src/styles/tokens.css');
  });

  it('does not import @angular/cdk/overlay-prebuilt.css in the angular preview', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const preview =
      tree.read('workshop-angular/.storybook/preview.ts', 'utf-8') ?? '';
    expect(preview).not.toContain('overlay-prebuilt.css');
  });

  it('writes a Storybook-scoped tsconfig.json only for the angular app', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    expect(tree.exists('workshop-angular/.storybook/tsconfig.json')).toBe(true);
    expect(tree.exists('workshop-react/.storybook/tsconfig.json')).toBe(false);
    expect(tree.exists('workshop-vue/.storybook/tsconfig.json')).toBe(false);
  });

  it('writes one example AtlButton story per app, importing from @atelier-ui/<fw>', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    const angularStory =
      tree.read('workshop-angular/src/atl-button.stories.ts', 'utf-8') ?? '';
    const reactStory =
      tree.read('workshop-react/src/atl-button.stories.tsx', 'utf-8') ?? '';
    const vueStory =
      tree.read('workshop-vue/src/atl-button.stories.ts', 'utf-8') ?? '';

    expect(angularStory).toContain("from '@atelier-ui/angular'");
    expect(reactStory).toContain("from '@atelier-ui/react'");
    expect(vueStory).toContain("from '@atelier-ui/vue'");
  });

  it('adds the pinned Storybook devDependencies, common and per-framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['storybook']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/addon-mcp']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/addon-a11y']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/addon-docs']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/angular-vite']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/react-vite']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/vue3-vite']).toBe('10.6.0');
    // @storybook/react-vite and @storybook/vue3-vite carry their non-vite
    // renderer as a plain `dependency`, not a peer — but the React/Vue story
    // and preview templates import types straight from '@storybook/react' /
    // '@storybook/vue3'. That only resolves via npm's hoisting today; a
    // pnpm-managed scaffold needs it declared directly.
    expect(pkg.devDependencies['@storybook/react']).toBe('10.6.0');
    expect(pkg.devDependencies['@storybook/vue3']).toBe('10.6.0');
    // '@storybook/angular' is deliberately NOT installed: its peer on
    // @angular-devkit/build-angular is not optional, and a freshly scaffolded
    // Angular 22 app's own build-angular peer (^21) collides with it — the
    // angular templates use '@storybook/angular-vite' for their types instead
    // (it has no such peer).
    expect(pkg.devDependencies['@storybook/angular']).toBeUndefined();
    // Owner correction 2026-09-10 to ADR-0123's original "no test runner"
    // call: the browser-mode test runner ships after all.
    expect(pkg.devDependencies['@storybook/addon-vitest']).toBe('10.6.0');
    expect(pkg.devDependencies['vitest']).toBe('^4.0.8');
    expect(pkg.devDependencies['@vitest/browser-playwright']).toBe('^4.1.0');
    expect(pkg.devDependencies['playwright']).toBe('^1.36.0');
    expect(pkg.devDependencies['@storybook/addon-designs']).toBeUndefined();
  });

  it('adds each selected framework its own Vite plugin for vitest browser mode', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBe('6.1.1');
    expect(pkg.devDependencies['@vitejs/plugin-vue']).toBe('^6.0.5');
    expect(pkg.devDependencies['@analogjs/vite-plugin-angular']).toBe('2.7.1');
    // Only Vue's vitest.setup.ts.template imports jest-dom's custom matchers.
    expect(pkg.devDependencies['@testing-library/jest-dom']).toBe('^6.9.1');
  });

  it('does not add a framework Vite plugin already present in package.json', async () => {
    tree.write(
      'package.json',
      JSON.stringify({
        name: 'my-workspace',
        devDependencies: { '@vitejs/plugin-react': '5.0.0' },
      }),
    );

    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@vitejs/plugin-react']).toBe('5.0.0');
  });

  it('writes vitest.config.ts and .storybook/vitest.setup.ts per app', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    for (const fw of ['angular', 'react', 'vue']) {
      const config =
        tree.read(`workshop-${fw}/vitest.config.ts`, 'utf-8') ?? '';
      expect(config).toContain('storybookTest');
      expect(config).toContain(`'storybook:${fw}'`);
      const setup =
        tree.read(`workshop-${fw}/.storybook/vitest.setup.ts`, 'utf-8') ?? '';
      expect(setup).toContain('setProjectAnnotations');
    }
    // Angular's setup imports from '@storybook/angular-vite', never the
    // peer-incompatible '@storybook/angular' the monorepo itself uses.
    const angularSetup =
      tree.read('workshop-angular/.storybook/vitest.setup.ts', 'utf-8') ?? '';
    expect(angularSetup).toContain("from '@storybook/angular-vite'");
    expect(angularSetup).not.toContain("from '@storybook/angular'");
  });

  it('adds a storybook-test target per app and a root check:stories script', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

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

  it('preview templates set parameters.a11y.test to error', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    expect(
      tree.read('workshop-angular/.storybook/preview.ts', 'utf-8'),
    ).toContain("test: 'error'");
    expect(
      tree.read('workshop-react/.storybook/preview.tsx', 'utf-8'),
    ).toContain("test: 'error'");
    expect(tree.read('workshop-vue/.storybook/preview.ts', 'utf-8')).toContain(
      "test: 'error'",
    );
  });

  it('adds storybook/build-storybook targets on port 6006 for a single framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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

  it('assigns sequential ports (6006, 6007) to two frameworks in selection order', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'react,vue',
    });

    const reactProject = readJson(tree, 'workshop-react/project.json');
    const vueProject = readJson(tree, 'workshop-vue/project.json');
    expect(reactProject.targets.storybook.options.command).toContain(
      '--port 6006',
    );
    expect(vueProject.targets.storybook.options.command).toContain(
      '--port 6007',
    );
  });

  it("preserves the application generator's own targets (e.g. build) alongside storybook", async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' }),
    ).rejects.toThrow('workshop-angular/project.json');
  });

  // ─── Stylelint (ported CSS-discipline rules, ADR-0130) ─────────────────────

  it('writes the ported stylelint rule files, byte-identical clones', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
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

  it('stylelint.config.mjs names the exact tokens.css path the generator writes for each selected framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react',
    });

    const config = tree.read('stylelint.config.mjs', 'utf-8') ?? '';
    // Same path this suite's own "writes tokens.css into the scaffolded ***
    // app" tests assert tree.write puts the file at — not re-derived, the
    // literal string both sides must agree on.
    expect(config).toContain('workshop-angular/src/styles/tokens.css');
    expect(config).toContain('workshop-react/src/styles/tokens.css');
    expect(config).not.toContain('workshop-vue/src/styles/tokens.css');
  });

  it("adds a stylelint target per app, ignoring that app's own tokens.css", async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'react',
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

    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const project = readJson(tree, 'workshop-react/project.json');
    expect(project.targets.lint).toEqual({
      executor: '@nx/eslint:lint',
      options: {},
    });
    expect(project.targets.stylelint.executor).toBe('nx:run-commands');
  });

  it('adds nx.json targetDefaults.stylelint with cache + the declared inputs, minus allowlists.js', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,vue',
    });

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
        '{workspaceRoot}/workshop-vue/src/styles/tokens.css',
        { externalDependencies: ['stylelint'] },
      ]),
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
      frameworks: 'angular',
    });

    const nxJson = readJson(tree, 'nx.json');
    expect(nxJson.targetDefaults.build).toBeDefined();
    expect(nxJson.targetDefaults.lint).toBeDefined();
    expect(nxJson.targetDefaults.stylelint).toBeDefined();
  });

  it('adds stylelint as a devDependency at the exact version this monorepo runs', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['stylelint']).toBe('17.15.0');
    // Only needed to lint .astro files — the scaffold has none.
    expect(pkg.devDependencies['postcss-html']).toBeUndefined();
  });

  it('adds check:stylelint to package.json scripts', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['check:stylelint']).toBe('nx run-many -t stylelint');
  });

  // ─── The contract loop (ADR-0121 S4) ───────────────────────────────────────

  it('writes the example contract files under the first selected framework app', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular,react,vue',
    });

    expect(tree.exists('workshop-angular/src/contracts/types.ts')).toBe(true);
    expect(tree.exists('workshop-angular/src/contracts/README.md')).toBe(true);
    expect(
      tree.exists('workshop-angular/src/contracts/button.contract.ts'),
    ).toBe(true);
    // Not duplicated into the other selected frameworks' apps — the contract
    // loop is scoped to the first ("primary") framework only.
    expect(tree.exists('workshop-react/src/contracts/types.ts')).toBe(false);
    expect(tree.exists('workshop-vue/src/contracts/types.ts')).toBe(false);
  });

  it('example contract file references AtlButton and its Figma node id', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const contract =
      tree.read('workshop-react/src/contracts/button.contract.ts', 'utf-8') ??
      '';
    expect(contract).toContain("component: 'AtlButton'");
    expect(contract).toContain("figmaNodeId: '129:20'");
  });

  it('writes the shared contract-loop scripts under tools/scripts', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
    });

    const snapshot = readJson(tree, 'tools/figma/snapshot.json');
    expect(snapshot.components).toHaveLength(1);
    expect(snapshot.components[0].selector).toBe('AtlButton');
    expect(snapshot.components[0].nodeId).toBe('129:20');
  });

  it('writes contracts.config.json naming the first selected framework', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'vue,react',
    });

    const config = readJson(tree, 'contracts.config.json');
    expect(config.framework).toBe('vue');
    expect(config.contracts).toBe('workshop-vue/src/contracts');
    expect(config.stories).toEqual(['workshop-vue/src']);
    expect(config.snapshot).toBe('tools/figma/snapshot.json');
  });

  it('adds check:contracts and a placeholder figma:snapshot script to package.json', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts['check:contracts']).toBe(
      'node tools/scripts/check-contracts.mjs',
    );
    expect(pkg.scripts['figma:snapshot']).toBe(
      'node tools/scripts/figma-snapshot-contracts.mjs --file <YOUR_FIGMA_FILE_KEY>',
    );
  });

  it('adds @modelcontextprotocol/sdk as a devDependency', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['@modelcontextprotocol/sdk']).toBe('^1.29.0');
  });

  it('adds typescript as a devDependency when the workspace does not already have it', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
    });

    const pkg = readJson(tree, 'package.json');
    expect(pkg.devDependencies['typescript']).toBe('5.4.0');
  });

  it('CLAUDE.md contains "The Contract Loop" section', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npx nx storybook workshop-angular');
    expect(md).toContain('6006');
  });

  it('CLAUDE.md mentions all four storybookjs/mcp skills by name', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
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
      frameworks: 'angular',
    });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npx -y skills@1.5.25 add storybookjs/mcp');
  });

  it('README mentions the skills and the storybook command', async () => {
    await presetGenerator(tree, {
      name: 'my-workspace',
      frameworks: 'angular',
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
      frameworks: 'angular',
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
});
