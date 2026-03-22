import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson } from '@nx/devkit';
import { presetGenerator } from './preset';

jest.mock('@nx/angular/generators', () => ({
  applicationGenerator: jest.fn().mockResolvedValue(() => undefined),
}));

jest.mock('@nx/react', () => ({
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

  it('writes .claude/settings.json with angular MCP only', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });

    const settings = readJson(tree, '.claude/settings.json');
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

  it('writes README.md', async () => {
    await presetGenerator(tree, { name: 'my-workspace', frameworks: 'angular' });
    expect(tree.exists('README.md')).toBe(true);
  });
});
