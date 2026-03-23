import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson } from '@nx/devkit';
import { presetGenerator } from './preset';

jest.mock('@nx/angular/generators', () => ({
  applicationGenerator: jest.fn().mockResolvedValue(() => undefined),
}));

jest.mock('@nx/devkit', () => ({
  ...jest.requireActual('@nx/devkit'),
  ensurePackage: jest.fn().mockResolvedValue({
    applicationGenerator: jest.fn().mockResolvedValue(() => undefined),
  }),
}));

describe('preset generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  // ─── MCP settings ──────────────────────────────────────────────────────────

  it('writes .claude/settings.json with angular MCP only', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const settings = readJson(tree, '.claude/settings.json');
    expect(settings.mcpServers['nx-mcp']).toBeDefined();
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-react']).toBeUndefined();
    expect(settings.mcpServers['storybook-vue']).toBeUndefined();
  });

  it('writes .claude/settings.json with all three MCPs for multi-framework', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react,vue' });

    const settings = readJson(tree, '.claude/settings.json');
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-react']).toBeDefined();
    expect(settings.mcpServers['storybook-vue']).toBeDefined();
  });

  it('each MCP entry has type http and correct url', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const settings = readJson(tree, '.claude/settings.json');
    expect(settings.mcpServers['storybook-react'].type).toBe('http');
    expect(settings.mcpServers['storybook-react'].url).toContain('storybook-react/mcp');
  });

  it('nx-mcp uses stdio command', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const settings = readJson(tree, '.claude/settings.json');
    expect(settings.mcpServers['nx-mcp'].type).toBe('stdio');
    expect(settings.mcpServers['nx-mcp'].command).toBe('npx');
  });

  // ─── README ────────────────────────────────────────────────────────────────

  it('writes README.md', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    expect(tree.exists('README.md')).toBe(true);
  });

  // ─── CSS tokens ────────────────────────────────────────────────────────────

  it('injects angular CSS tokens import into styles.css', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8');
    expect(css).toContain("@import '@atelier-ui/angular/styles/tokens.css'");
  });

  it('injects react CSS tokens import into styles.css', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'react' });

    const css = tree.read('workshop-react/src/styles.css', 'utf-8');
    expect(css).toContain("@import '@atelier-ui/react/styles/tokens.css'");
  });

  it('injects vue CSS tokens import into styles.css', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'vue' });

    const css = tree.read('workshop-vue/src/styles.css', 'utf-8');
    expect(css).toContain("@import '@atelier-ui/vue/styles/tokens.css'");
  });

  it('injects tokens import for each framework when all three selected', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular,react,vue' });

    expect(tree.read('workshop-angular/src/styles.css', 'utf-8')).toContain('@atelier-ui/angular');
    expect(tree.read('workshop-react/src/styles.css', 'utf-8')).toContain('@atelier-ui/react');
    expect(tree.read('workshop-vue/src/styles.css', 'utf-8')).toContain('@atelier-ui/vue');
  });

  it('tokens import is the first line of styles.css', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8') ?? '';
    expect(css.trimStart()).toMatch(/^@import '@atelier-ui\/angular\/styles\/tokens\.css'/);
  });

  it('preserves existing styles.css content after the import', async () => {
    tree.write('workshop-angular/src/styles.css', '/* existing styles */');

    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const css = tree.read('workshop-angular/src/styles.css', 'utf-8') ?? '';
    expect(css).toContain("@import '@atelier-ui/angular/styles/tokens.css'");
    expect(css).toContain('/* existing styles */');
    expect(css.indexOf('@import')).toBeLessThan(css.indexOf('/* existing styles */'));
  });

  // ─── CLAUDE.md ─────────────────────────────────────────────────────────────

  it('writes CLAUDE.md', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    expect(tree.exists('CLAUDE.md')).toBe(true);
  });

  it('CLAUDE.md includes all five MCP tools', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const md = tree.read('CLAUDE.md', 'utf-8') ?? '';
    expect(md).toContain('get_component_docs');
    expect(md).toContain('list_components');
    expect(md).toContain('search_components');
    expect(md).toContain('get_stories');
    expect(md).toContain('get_theming_guide');
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
    expect(md).toContain('atelier-ui.netlify.app');
  });
});
