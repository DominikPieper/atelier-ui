import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson } from '@nx/devkit';
import { presetGenerator } from './preset';

jest.mock('@nx/angular/generators', () => ({
  applicationGenerator: jest.fn().mockResolvedValue(() => undefined),
}));

describe('preset generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it('writes .claude/settings.json with MCP config', async () => {
    await presetGenerator(tree, { name: 'my-workspace' });

    const settings = readJson(tree, '.claude/settings.json');
    expect(settings.mcpServers['storybook-angular']).toBeDefined();
    expect(settings.mcpServers['storybook-angular'].type).toBe('http');
    expect(settings.mcpServers['storybook-angular'].url).toContain('storybook-angular/mcp');
  });

  it('writes README.md', async () => {
    await presetGenerator(tree, { name: 'my-workspace' });

    expect(tree.exists('README.md')).toBe(true);
  });
});
