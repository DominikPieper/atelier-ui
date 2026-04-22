import { createWorkspace } from 'create-nx-workspace';
import { main } from './index';

jest.mock('create-nx-workspace', () => ({
  createWorkspace: jest.fn().mockResolvedValue({ directory: '/tmp/my-workspace' }),
}));

jest.mock('enquirer', () => ({ prompt: jest.fn() }), { virtual: true });

const mockCreateWorkspace = createWorkspace as jest.MockedFunction<typeof createWorkspace>;
const enquirer = require('enquirer') as { prompt: jest.Mock };

describe('create-atelier-ui-workspace CLI', () => {
  let originalArgv: string[];
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    originalArgv = process.argv;
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    mockCreateWorkspace.mockResolvedValue({ directory: '/tmp/my-workspace' } as Awaited<ReturnType<typeof createWorkspace>>);
    enquirer.prompt.mockReset();
  });

  afterEach(() => {
    process.argv = originalArgv;
    jest.clearAllMocks();
  });

  it('uses name from argv and skips name prompt', async () => {
    process.argv = ['node', 'index.js', 'my-app'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'angular' });

    await main();

    const promptCalls: Array<{ name: string }> = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0],
    );
    expect(promptCalls.every((p) => p.name !== 'name')).toBe(true);
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ name: 'my-app' }),
    );
  });

  it('prompts for name when not in argv', async () => {
    process.argv = ['node', 'index.js'];
    enquirer.prompt
      .mockResolvedValueOnce({ name: 'prompted-name' })
      .mockResolvedValueOnce({ framework: 'react' });

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ name: 'prompted-name' }),
    );
  });

  it('throws when name is empty after prompt', async () => {
    process.argv = ['node', 'index.js'];
    enquirer.prompt.mockResolvedValueOnce({ name: '' });

    await expect(main()).rejects.toThrow('Please provide a name for the workspace');
  });

  it('calls createWorkspace with nxCloud skip and npm package manager', async () => {
    process.argv = ['node', 'index.js', 'test-ws'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'vue' });

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ nxCloud: 'skip', packageManager: 'npm' }),
    );
  });

  it('passes selected framework as frameworks option', async () => {
    process.argv = ['node', 'index.js', 'test-ws'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'react' });

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ frameworks: 'react' }),
    );
  });

  it('logs success messages with directory and serve command', async () => {
    process.argv = ['node', 'index.js', 'test-ws'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'angular' });

    await main();

    const logged = consoleLogSpy.mock.calls.flat().join('\n');
    expect(logged).toContain('✓ Workspace created at: /tmp/my-workspace');
    expect(logged).toContain('cd /tmp/my-workspace');
    expect(logged).toContain('npx nx serve workshop-angular');
  });

  it('accepts --framework=<value> flag and skips the framework prompt', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=react'];

    await main();

    const promptCalls: Array<{ name: string }> = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0],
    );
    expect(promptCalls.every((p) => p.name !== 'framework')).toBe(true);
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ frameworks: 'react' }),
    );
  });

  it('accepts --framework <value> with a space separator', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework', 'vue'];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ frameworks: 'vue' }),
    );
  });

  it('throws on invalid --framework value', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=svelte'];

    await expect(main()).rejects.toThrow(/Invalid --framework value/);
  });

  it('uses ATELIER_PRESET_SPEC env var as the preset spec when set', async () => {
    const original = process.env.ATELIER_PRESET_SPEC;
    process.env.ATELIER_PRESET_SPEC = 'file:/tmp/my-preset.tgz';
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular'];

    try {
      await main();
      expect(mockCreateWorkspace).toHaveBeenCalledWith(
        'file:/tmp/my-preset.tgz',
        expect.any(Object),
      );
    } finally {
      if (original === undefined) delete process.env.ATELIER_PRESET_SPEC;
      else process.env.ATELIER_PRESET_SPEC = original;
    }
  });

  it('defaults preset spec to the published package name when env var unset', async () => {
    delete process.env.ATELIER_PRESET_SPEC;
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular'];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.stringMatching(/^@atelier-ui\/create-workspace@\d/),
      expect.any(Object),
    );
  });
});
