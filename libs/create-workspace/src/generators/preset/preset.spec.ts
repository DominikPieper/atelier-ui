import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson } from '@nx/devkit';
import { presetGenerator } from './preset';

jest.mock('@nx/angular/generators', () => {
  const real = jest.requireActual('@nx/angular/generators');
  if (typeof real.applicationGenerator !== 'function') {
    throw new Error('@nx/angular/generators does not export applicationGenerator as a function');
  }
  return { applicationGenerator: jest.fn().mockResolvedValue(undefined) };
});

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  ensurePackage: jest.fn().mockImplementation((packageName: string) => {
    try {
      const real = jest.requireActual(packageName);
      const mocked: Record<string, unknown> = { ...real };
      if (typeof real.applicationGenerator === 'function') {
        mocked['applicationGenerator'] = jest.fn().mockResolvedValue(undefined);
      }
      return Promise.resolve(mocked);
    } catch {
      // Package not installed in dev workspace — fall back to plain mock
      return Promise.resolve({ applicationGenerator: jest.fn().mockResolvedValue(undefined) });
    }
  }),
}));

describe('preset generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  // ─── MCP settings ──────────────────────────────────────────────────────────

  it('writes .mcp.json with angular MCP only', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp']).toBeDefined();
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-react']).toBeUndefined();
    expect(settings.mcpServers['storybook-vue']).toBeUndefined();
  });

  it('writes .mcp.json with all three MCPs for multi-framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react,vue' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-react']).toBeDefined();
    expect(settings.mcpServers['storybook-vue']).toBeDefined();
  });

  it('each MCP entry has type http and correct url', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-react'].type).toBe('http');
    expect(settings.mcpServers['storybook-react'].url).toContain('storybook-react/mcp');
  });

  it('nx-mcp uses stdio command', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp'].type).toBe('stdio');
    expect(settings.mcpServers['nx-mcp'].command).toBe('npx');
  });

  it('nx-mcp args invoke nx mcp', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

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
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react,vue' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['storybook-angular'].url).toContain('storybook-angular/mcp');
    expect(settings.mcpServers['storybook-react'].url).toContain('storybook-react/mcp');
    expect(settings.mcpServers['storybook-vue'].url).toContain('storybook-vue/mcp');
  });

  it('multi-framework .mcp.json always includes nx-mcp', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react,vue' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['nx-mcp']).toBeDefined();
  });

  // ─── figma-console MCP (opt-in) ────────────────────────────────────────────

  it('omits figma-console by default', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeUndefined();
  });

  it('omits figma-console when figmaMcp=false', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular', figmaMcp: false });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeUndefined();
  });

  it('includes figma-console when figmaMcp=true', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular', figmaMcp: true });

    const settings = readJson(tree, '.mcp.json');
    expect(settings.mcpServers['figma-console']).toBeDefined();
    expect(settings.mcpServers['figma-console'].command).toBe('npx');
    expect(settings.mcpServers['figma-console'].args).toEqual([
      '-y',
      'figma-console-mcp@latest',
    ]);
    expect(settings.mcpServers['figma-console'].env.FIGMA_ACCESS_TOKEN).toBe(
      '${FIGMA_ACCESS_TOKEN:-}',
    );
  });

  it('CLAUDE.md includes Figma setup link when figmaMcp=true', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular', figmaMcp: true });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('Figma Setup');
    expect(md).toContain('atelier.pieper.io/figma-token');
    expect(md).toContain('Desktop Bridge');
  });

  it('CLAUDE.md omits the Figma setup section when figmaMcp is not set', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).not.toContain('Figma Setup');
    expect(md).not.toContain('atelier.pieper.io/figma-token');
  });

  // ─── README ────────────────────────────────────────────────────────────────

  it('writes README.md', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    expect(tree.exists('README.md')).toBe(true);
  });

  // ─── CSS tokens ────────────────────────────────────────────────────────────

  const EXPECTED_IMPORT = "@import './styles/tokens.css';";

  it('writes tokens.css into the scaffolded angular app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const tokens = tree.read('workshop-angular/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('writes tokens.css into the scaffolded react app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const tokens = tree.read('workshop-react/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('writes tokens.css into the scaffolded vue app', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const tokens = tree.read('workshop-vue/src/styles/tokens.css', 'utf-8') ?? '';
    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens).toContain('--ui-color-');
  });

  it('injects a relative tokens import into styles.css for each framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react,vue' });

    for (const fw of ['angular', 'react', 'vue']) {
      const css = tree.read(`workshop-${fw}/src/styles.css`, 'utf-8') ?? '';
      expect(css).toContain(EXPECTED_IMPORT);
    }
  });

  it('does not reference @atelier-ui/<fw>/styles (tokens are local)', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react,vue' });

    for (const fw of ['angular', 'react', 'vue']) {
      const css = tree.read(`workshop-${fw}/src/styles.css`, 'utf-8') ?? '';
      expect(css).not.toContain(`@atelier-ui/${fw}/styles`);
    }
  });

  it('tokens import is the first line of styles.css', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8') ?? '';
    expect(css.trimStart()).toMatch(/^@import '\.\/styles\/tokens\.css'/);
  });

  it('preserves existing styles.css content after the import', async () => {
    tree.write('workshop-angular/src/styles.css', '/* existing styles */');

    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8') ?? '';
    expect(css).toContain(EXPECTED_IMPORT);
    expect(css).toContain('/* existing styles */');
    expect(css.indexOf('@import')).toBeLessThan(css.indexOf('/* existing styles */'));
  });

  // ─── CLAUDE.md ─────────────────────────────────────────────────────────────

  it('writes CLAUDE.md', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    expect(tree.exists('CLAUDE.md')).toBe(true);
  });

  it('CLAUDE.md includes the three Storybook MCP tools', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('list-all-documentation');
    expect(md).toContain('get-documentation');
    expect(md).toContain('get-documentation-for-story');
  });

  it('CLAUDE.md references the correct MCP server name for the framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('storybook-angular');
  });

  it('CLAUDE.md includes Angular-specific import pattern', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/angular');
    expect(md).toContain('LlmButtonComponent');
    expect(md).toContain('llm-button');
  });

  it('CLAUDE.md includes React-specific import pattern', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/react');
    expect(md).toContain('useLlmToast');
    expect(md).toContain('onXxx');
  });

  it('CLAUDE.md includes Vue-specific import pattern', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/vue');
    expect(md).toContain('v-model');
    expect(md).toContain('useLlmToast');
  });

  it('CLAUDE.md includes all three frameworks when all selected', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react,vue' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('@atelier-ui/angular');
    expect(md).toContain('@atelier-ui/react');
    expect(md).toContain('@atelier-ui/vue');
  });

  it('CLAUDE.md includes app run commands for selected frameworks only', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npx nx serve workshop-angular');
    expect(md).toContain('npx nx serve workshop-react');
    expect(md).not.toContain('npx nx serve workshop-vue');
  });

  it('CLAUDE.md links to the docs site', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('atelier.pieper.io');
  });

  // ─── Preflight ─────────────────────────────────────────────────────────────

  it('writes tools/scripts/preflight.mjs', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    expect(tree.exists('tools/scripts/preflight.mjs')).toBe(true);
    const content = tree.read('tools/scripts/preflight.mjs', 'utf-8') ?? '';
    expect(content).toContain('Atelier UI Preflight');
  });

  it('adds preflight npm script to package.json', async () => {
    tree.write('package.json', JSON.stringify({ name: 'my-workspace', scripts: {} }));
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    const pkg = readJson(tree, 'package.json');
    expect(pkg.scripts.preflight).toBe('node tools/scripts/preflight.mjs');
  });

  it('CLAUDE.md references preflight in troubleshooting', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('npm run preflight');
    expect(md).toContain('/troubleshooting');
  });
});
