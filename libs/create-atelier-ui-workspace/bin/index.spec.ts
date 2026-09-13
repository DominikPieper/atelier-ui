import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { createWorkspace } from 'create-nx-workspace';
import { main } from './index';

jest.mock('create-nx-workspace', () => ({
  createWorkspace: jest
    .fn()
    .mockResolvedValue({ directory: '/tmp/my-workspace' }),
}));

jest.mock('enquirer', () => ({ prompt: jest.fn() }), { virtual: true });

const mockCreateWorkspace = createWorkspace as jest.MockedFunction<
  typeof createWorkspace
>;
const enquirer = require('enquirer') as { prompt: jest.Mock };

describe('create-atelier-ui-workspace CLI', () => {
  let originalArgv: string[];
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    originalArgv = process.argv;
    consoleLogSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    mockCreateWorkspace.mockResolvedValue({
      directory: '/tmp/my-workspace',
    } as Awaited<ReturnType<typeof createWorkspace>>);
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

    await expect(main()).rejects.toThrow(
      'Please provide a name for the workspace',
    );
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

  it('passes selected framework as framework option', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--no-figma'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'react' });

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ framework: 'react' }),
    );
  });

  it('logs success messages with directory and the npm start command', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--no-figma'];
    enquirer.prompt.mockResolvedValueOnce({ framework: 'angular' });

    await main();

    const logged = consoleLogSpy.mock.calls.flat().join('\n');
    expect(logged).toContain('Workshop ready');
    expect(logged).toContain('/tmp/my-workspace');
    expect(logged).toContain('cd /tmp/my-workspace');
    // `npm start` regardless of framework — no `workshop-<fw>` app name to
    // splice in any more (the generated package.json's own `start` script
    // names the app; this CLI output no longer needs to).
    expect(logged).toContain('npm start');
    expect(logged).not.toContain('nx serve');
  });

  it('accepts --framework=<value> flag and skips the framework prompt', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=react',
      '--no-figma',
    ];

    await main();

    const promptCalls: Array<{ name: string }> = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0],
    );
    expect(promptCalls.every((p) => p.name !== 'framework')).toBe(true);
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ framework: 'react' }),
    );
  });

  it('accepts --framework <value> with a space separator', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework',
      'vue',
      '--no-figma',
    ];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ framework: 'vue' }),
    );
  });

  it('throws on invalid --framework value', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=svelte',
      '--no-figma',
    ];

    await expect(main()).rejects.toThrow(/Invalid --framework value/);
  });

  it('uses ATELIER_PRESET_SPEC env var as the preset spec when set', async () => {
    const original = process.env.ATELIER_PRESET_SPEC;
    process.env.ATELIER_PRESET_SPEC = 'file:/tmp/my-preset.tgz';
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
    ];

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
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
    ];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.stringMatching(/^@atelier-ui\/create-workspace@\d/),
      expect.any(Object),
    );
  });

  // ─── figma-console MCP prompt / flags ──────────────────────────────────────

  it('accepts --figma flag and skips the figma prompt', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--figma',
    ];
    // No --figma-file flag, so accepting Figma still triggers the figma-file
    // prompt (see the dedicated section below) — answer blank, it's not what
    // this test is about.
    enquirer.prompt.mockResolvedValueOnce({ figmaFile: '' });

    await main();

    const promptNames = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0].name,
    );
    expect(promptNames).not.toContain('figma');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaMcp: true }),
    );
  });

  it('accepts --no-figma flag and passes figmaMcp=false', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
    ];

    await main();

    const promptNames = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0].name,
    );
    expect(promptNames).not.toContain('figma');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaMcp: false }),
    );
  });

  it('prompts for figma inclusion when neither flag is set and links to setup docs', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular'];
    // Accepting Figma here also triggers the figma-file prompt (see the
    // dedicated section below) — answer blank, it's not what this test is
    // about.
    enquirer.prompt
      .mockResolvedValueOnce({ figma: true })
      .mockResolvedValueOnce({ figmaFile: '' });

    await main();

    type FigmaPromptConfig = {
      name: string;
      message: string;
      type: string;
      initial: unknown;
    };
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
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--figma',
    ];
    // No --figma-file flag, so accepting Figma still triggers the figma-file
    // prompt — answer blank, it's not what this test is about.
    enquirer.prompt.mockResolvedValueOnce({ figmaFile: '' });

    await main();

    const logged = consoleLogSpy.mock.calls.flat().join('\n');
    expect(logged).toContain('atelier.pieper.io/figma-token');
    expect(logged).toMatch(/figma-console-mcp/);
  });

  it('does not log the Figma setup URL when figma is disabled', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
    ];

    await main();

    const logged = consoleLogSpy.mock.calls.flat().join('\n');
    expect(logged).not.toContain('atelier.pieper.io/figma-token');
  });

  // ─── --figma-file flag / prompt (S5a) ──────────────────────────────────────

  it('accepts --figma-file <key> and skips the figma-file prompt', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--figma',
      '--figma-file',
      'QMnDD8uZQPldPrlCwZZ58T',
    ];

    await main();

    const promptNames = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0].name,
    );
    expect(promptNames).not.toContain('figmaFile');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaFile: 'QMnDD8uZQPldPrlCwZZ58T' }),
    );
  });

  it('extracts the file key from a full Figma URL passed to --figma-file', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--figma',
      '--figma-file=https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI?node-id=1-2',
    ];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaFile: 'QMnDD8uZQPldPrlCwZZ58T' }),
    );
  });

  it('rejects a --figma-file value that is neither a plausible key nor a URL', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--figma',
      '--figma-file=nope',
    ];

    await expect(main()).rejects.toThrow(/Invalid --figma-file value/);
  });

  it('does not prompt for a figma file key when --no-figma was given', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
    ];

    await main();

    const promptNames = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0].name,
    );
    expect(promptNames).not.toContain('figmaFile');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaFile: undefined }),
    );
  });

  it('prompts for the figma file key when figma is accepted via flag and no key flag was given, mentioning /design/', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--figma',
    ];
    enquirer.prompt.mockResolvedValueOnce({ figmaFile: '' });

    await main();

    type FigmaFilePromptConfig = {
      name: string;
      message: string;
      type: string;
      initial: unknown;
    };
    const prompt = enquirer.prompt.mock.calls
      .map((c: [FigmaFilePromptConfig]) => c[0])
      .find((p: FigmaFilePromptConfig) => p.name === 'figmaFile');
    if (!prompt) throw new Error('figmaFile prompt not invoked');
    expect(prompt.type).toBe('input');
    expect(prompt.message).toContain('/design/');
  });

  it('skipping the figma-file prompt (blank answer) keeps the placeholder behaviour', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--figma',
    ];
    enquirer.prompt.mockResolvedValueOnce({ figmaFile: '' });

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaFile: undefined }),
    );
  });

  it('prompts for the figma file key only after an interactive "yes" to the figma prompt, and extracts a pasted URL', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular'];
    enquirer.prompt
      .mockResolvedValueOnce({ figma: true })
      .mockResolvedValueOnce({
        figmaFile: 'https://figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Foo',
      });

    await main();

    const promptNames = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0].name,
    );
    expect(promptNames).toEqual(['figma', 'figmaFile']);
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaFile: 'QMnDD8uZQPldPrlCwZZ58T' }),
    );
  });

  it('does not prompt for a figma file key after an interactive "no" to the figma prompt', async () => {
    process.argv = ['node', 'index.js', 'test-ws', '--framework=angular'];
    enquirer.prompt.mockResolvedValueOnce({ figma: false });

    await main();

    const promptNames = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0].name,
    );
    expect(promptNames).not.toContain('figmaFile');
    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ figmaFile: undefined }),
    );
  });

  // ─── storybookjs/mcp skills install flag ───────────────────────────────────

  it('defaults skills to true when no flag is passed', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
    ];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ skills: true }),
    );
  });

  it('accepts --skills flag and passes skills=true explicitly', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
      '--skills',
    ];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ skills: true }),
    );
  });

  it('accepts --no-skills flag and passes skills=false', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
      '--no-skills',
    ];

    await main();

    expect(mockCreateWorkspace).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ skills: false }),
    );
  });

  it('does not prompt for skills — it is a flag-only, non-interactive option', async () => {
    process.argv = [
      'node',
      'index.js',
      'test-ws',
      '--framework=angular',
      '--no-figma',
    ];

    await main();

    const promptNames = enquirer.prompt.mock.calls.map(
      (c: [{ name: string }]) => c[0].name,
    );
    expect(promptNames).not.toContain('skills');
  });

  it('aborts with controlled message when target directory already exists', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'atelier-cli-'));
    fs.mkdirSync(path.join(tmp, 'taken'));
    fs.writeFileSync(path.join(tmp, 'taken', 'placeholder'), 'x');
    const origCwd = process.cwd();
    process.chdir(tmp);

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(((
      code?: number,
    ) => {
      throw new Error(`__exit_${code}__`);
    }) as never);
    const errSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    try {
      process.argv = [
        'node',
        'index.js',
        'taken',
        '--framework=angular',
        '--no-figma',
      ];
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
