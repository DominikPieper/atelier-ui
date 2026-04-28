import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

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
    process.argv = ['node', 'index.js', 'my-app', '--no-figma'];
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
    process.argv = ['node', 'index.js', '--no-figma'];
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
    process.argv = ['node', 'index.js', 'test-ws', '--no-figma'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'vue' });

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ nxCloud: 'skip', packageManager: 'npm' }),
    );
  });

  it('passes selected framework as frameworks option', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--no-figma'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'react' });

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ frameworks: 'react' }),
    );
  });

  it('logs success messages with directory and serve command', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--no-figma'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'angular' });

    await main();

    const logged = consoleLogSpy.mock.calls.flat().join('\n');
    expect(logged).toContain('Workshop ready');
    expect(logged).toContain('/tmp/my-workspace');
    expect(logged).toContain('cd /tmp/my-workspace');
    expect(logged).toContain('npx nx serve workshop-angular');
  });

  it('accepts --framework=<value> flag and skips the framework prompt', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=react', '--no-figma'];

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
    process.argv = ['node', 'index.js', 'test-ws', '--framework', 'vue', '--no-figma'];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ frameworks: 'vue' }),
    );
  });

  it('throws on invalid --framework value', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=svelte', '--no-figma'];

    await expect(main()).rejects.toThrow(/Invalid --framework value/);
  });

  it('uses ATELIER_PRESET_SPEC env var as the preset spec when set', async () => {
    const original = process.env.ATELIER_PRESET_SPEC;
    process.env.ATELIER_PRESET_SPEC = 'file:/tmp/my-preset.tgz';
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular', '--no-figma'];

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
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular', '--no-figma'];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.stringMatching(/^@atelier-ui\/create-workspace@\d/),
      expect.any(Object),
    );
  });

  // ─── figma-console MCP prompt / flags ──────────────────────────────────────

  it('accepts --figma flag and skips the figma prompt', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular', '--figma'];

    await main();

    const promptNames = enquirer.prompt.mock.calls.map((c: [{ name: string }]) => c[0].name);
    expect(promptNames).not.toContain('figma');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaMcp: true }),
    );
  });

  it('accepts --no-figma flag and passes figmaMcp=false', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular', '--no-figma'];

    await main();

    const promptNames = enquirer.prompt.mock.calls.map((c: [{ name: string }]) => c[0].name);
    expect(promptNames).not.toContain('figma');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaMcp: false }),
    );
  });

  it('prompts for figma inclusion when neither flag is set and links to setup docs', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular'];
    enquirer.prompt.mockResolvedValueOnce({ figma: true });

    await main();

    type FigmaPromptConfig = { name: string; message: string; type: string; initial: unknown };
    const figmaPrompt = enquirer.prompt.mock.calls
      .map((c: [FigmaPromptConfig]) => c[0])
      .find((p: FigmaPromptConfig) => p.name === 'figma');
    if (!figmaPrompt) throw new Error('figma prompt not invoked');
    expect(figmaPrompt.type).toBe('confirm');
    expect(figmaPrompt.initial).toBe(true);
    expect(figmaPrompt.message).toContain('atelier.pieper.io/figma-token');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaMcp: true }),
    );
  });

  it('logs the Figma setup URL in the success output when figma is enabled', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular', '--figma'];

    await main();

    const logged = consoleLogSpy.mock.calls.flat().join('\n');
    expect(logged).toContain('atelier.pieper.io/figma-token');
    expect(logged).toMatch(/figma-console-mcp/);
  });

  it('does not log the Figma setup URL when figma is disabled', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular', '--no-figma'];

    await main();

    const logged = consoleLogSpy.mock.calls.flat().join('\n');
    expect(logged).not.toContain('atelier.pieper.io/figma-token');
  });

  it('aborts with controlled message when target directory already exists', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atelier-cli-'));
    fs.mkdirSync(path.join(tmp, 'taken'));
    fs.writeFileSync(path.join(tmp, 'taken', 'placeholder'), 'x');
    const origCwd = process.cwd();
    process.chdir(tmp);

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`__exit_${code}__`);
    }) as never);
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    try {
      process.argv = ['node', 'index.js', 'taken', '--framework=angular', '--no-figma'];
      await expect(main()).rejects.toThrow('__exit_1__');

      const logged = errSpy.mock.calls.flat().join('\n');
      expect(logged).toContain('Cannot create workspace');
      expect(logged).toContain('"taken"');
      expect(logged).toContain('already exists');
      expect(mockCreateWorkspace).not.toHaveBeenCalled();
    } finally {
      process.chdir(origCwd);
      exitSpy.mockRestore();
      errSpy.mockRestore();
      fs.rmSync(tmp, { recursive: true, force: true });
    }
  });
});
