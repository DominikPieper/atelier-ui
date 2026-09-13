#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { createWorkspace } from 'create-nx-workspace';

const enquirer = require('enquirer');

// create-nx-workspace spawns several child processes (npm install + per-plugin
// generators); each registers its own exit handler on `process`, exceeding the
// default cap of 10 and triggering MaxListenersExceededWarning.
process.setMaxListeners(20);

type Framework = 'angular' | 'react' | 'vue';
const VALID_FRAMEWORKS: readonly Framework[] = ['angular', 'react', 'vue'];

const FIGMA_SETUP_URL = 'https://atelier.pieper.io/figma-token';

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const wrap = (open: string, close: string) => (s: string) =>
  useColor ? `\x1b[${open}m${s}\x1b[${close}m` : s;
const c = {
  bold: wrap('1', '22'),
  dim: wrap('2', '22'),
  cyan: wrap('36', '39'),
  green: wrap('32', '39'),
  red: wrap('31', '39'),
};

function banner(): void {
  console.log(
    `\n${c.bold(c.cyan('▲ Atelier UI'))}  ${c.dim('workshop scaffolder')}\n`,
  );
}

function parseFlag(args: string[], name: string): string | undefined {
  const eqPrefix = `--${name}=`;
  const withEq = args.find((a) => a.startsWith(eqPrefix));
  if (withEq) return withEq.slice(eqPrefix.length);
  const idx = args.indexOf(`--${name}`);
  if (idx >= 0) {
    const next = args[idx + 1];
    if (next && !next.startsWith('-')) return next;
  }
  return undefined;
}

function parseBooleanFlag(args: string[], name: string): boolean | undefined {
  // --name / --name=true / --name true → true
  // --no-name / --name=false / --name false → false
  if (args.includes(`--no-${name}`)) return false;
  const raw = parseFlag(args, name);
  if (raw === undefined) {
    return args.includes(`--${name}`) ? true : undefined;
  }
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  throw new Error(
    `Invalid --${name} value: "${raw}". Must be "true" or "false".`,
  );
}

// Figma file/design keys are opaque, Figma-generated identifiers — this
// repo's own key (QMnDD8uZQPldPrlCwZZ58T, see AGENTS.md) is 22 mixed-case
// alphanumeric characters. Nothing documents an exact length or charset, so
// this only requires letters/digits (a key never contains a hyphen, unlike a
// URL slug) and a length generous enough to admit a real key while still
// rejecting short garbage ("abc") that is obviously not one.
const FIGMA_FILE_KEY_PATTERN = /^[A-Za-z0-9]{10,40}$/;

// A pasted Figma URL names the file key right after `/design/`
// (figma.com/design/<key>/Some-File-Name, optionally with a query string,
// hash, or nothing at all following it).
const FIGMA_FILE_URL_PATTERN =
  /figma\.com\/design\/([A-Za-z0-9]{10,40})(?:[/?#]|$)/;

// Shared by both the --figma-file flag and the interactive prompt below, so
// a bad value is rejected the same way regardless of how it arrived. Accepts
// a bare key as-is, extracts the key out of a full Figma URL rather than
// writing the whole URL into the generated `figma:snapshot` script, and
// otherwise fails loudly — same posture as the --framework validation above.
function extractFigmaFileKey(raw: string): string {
  const trimmed = raw.trim();
  if (FIGMA_FILE_KEY_PATTERN.test(trimmed)) return trimmed;

  const urlMatch = trimmed.match(FIGMA_FILE_URL_PATTERN);
  if (urlMatch) return urlMatch[1];

  throw new Error(
    `Invalid --figma-file value: "${raw}". Expected a Figma file key (the ` +
      `segment in a Figma URL after /design/, e.g. ` +
      `figma.com/design/<key>/Some-File) or a full Figma URL containing one.`,
  );
}

export async function main() {
  banner();
  const argv = process.argv.slice(2);

  let name = argv.find((arg) => !arg.startsWith('-'));
  let framework = parseFlag(argv, 'framework') as Framework | undefined;
  let figmaMcp = parseBooleanFlag(argv, 'figma');
  // S5a — the attendee's own Figma file key (never this repo's
  // QMnDD8uZQPldPrlCwZZ58T, which the preset never defaults to either — see
  // its schema.json). Validated up front, like --framework, so a bad value
  // fails fast regardless of whether Figma was even accepted.
  const figmaFileFlag = parseFlag(argv, 'figma-file');
  let figmaFile =
    figmaFileFlag === undefined
      ? undefined
      : extractFigmaFileKey(figmaFileFlag);
  // Unlike figma (a personal preference worth asking about), skills installs
  // a network-dependent, non-interactive default — no prompt, just a flag to
  // opt out for CI/offline runs, matching the preset schema's own default.
  const skillsEnabled = parseBooleanFlag(argv, 'skills') ?? true;

  if (framework && !VALID_FRAMEWORKS.includes(framework)) {
    throw new Error(
      `Invalid --framework value: "${framework}". Must be one of: ${VALID_FRAMEWORKS.join(', ')}.`,
    );
  }

  if (!name) {
    const res = await enquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'Workspace name:',
      initial: 'my-workshop',
    });
    name = (res as { name: string }).name;
  }

  if (!name) {
    throw new Error('Please provide a name for the workspace');
  }

  const targetDir = resolve(process.cwd(), name);
  if (existsSync(targetDir)) {
    const stat = statSync(targetDir);
    const nonEmpty = stat.isDirectory() && readdirSync(targetDir).length > 0;
    if (!stat.isDirectory() || nonEmpty) {
      console.error(
        `\n${c.red('✖')} Cannot create workspace: "${c.bold(name)}" already exists.`,
      );
      console.error(`  ${c.dim(targetDir)}`);
      console.error(
        `  ${c.dim('Pick a different name or remove the existing directory.')}\n`,
      );
      process.exit(1);
    }
  }

  if (!framework) {
    const res = await enquirer.prompt({
      type: 'select',
      name: 'framework',
      message: 'Which framework do you want to use?',
      choices: [
        { name: 'angular', message: 'Angular' },
        { name: 'react', message: 'React' },
        { name: 'vue', message: 'Vue' },
      ],
    });
    framework = (res as { framework: Framework }).framework;
  }

  if (figmaMcp === undefined) {
    const res = await enquirer.prompt({
      type: 'confirm',
      name: 'figma',
      message: `Add the Figma Desktop Bridge MCP (figma-console-mcp)?\n  Setup guide: ${FIGMA_SETUP_URL}`,
      initial: true,
    });
    figmaMcp = (res as { figma: boolean }).figma;
  }

  // Only asked when Figma was accepted (flag or prompt) — declining Figma
  // must not produce a question about a Figma file key at all. Skippable:
  // an attendee who hasn't duplicated the file yet presses enter and gets
  // today's <YOUR_FIGMA_FILE_KEY> placeholder behaviour, same as if this
  // prompt didn't exist.
  if (figmaMcp && figmaFile === undefined) {
    const res = await enquirer.prompt({
      type: 'input',
      name: 'figmaFile',
      message:
        `Figma file key (optional) — the segment in a Figma URL after /design/,\n` +
        `  e.g. figma.com/design/<key>/Some-File. Paste a full URL and the key\n` +
        `  is extracted. Press enter to skip:`,
      initial: '',
    });
    const rawFigmaFile = (res as { figmaFile: string }).figmaFile.trim();
    if (rawFigmaFile) {
      figmaFile = extractFigmaFileKey(rawFigmaFile);
    }
  }

  console.log(
    `\n${c.cyan('◇')} Setting up "${c.bold(name)}" with ${c.bold(framework)}…\n`,
  );

  const presetVersion = require('../package.json').version;
  // ATELIER_PRESET_SPEC overrides the published preset — used by the e2e test
  // to install the locally-packed tarball instead of fetching from npm.
  const presetSpec =
    process.env.ATELIER_PRESET_SPEC ??
    `@atelier-ui/create-workspace@${presetVersion}`;

  const { directory } = await createWorkspace(presetSpec, {
    name,
    nxCloud: 'skip',
    packageManager: 'npm',
    framework,
    figmaMcp,
    figmaFile,
    skills: skillsEnabled,
  });

  // No `workshop-<fw>` app name to splice in here any more — `npm start`
  // is the same literal command regardless of which framework was picked.
  console.log(
    `\n${c.green('✓')} ${c.bold('Workshop ready')} ${c.dim(`— ${directory}`)}`,
  );
  console.log(`\n  ${c.dim('Next steps:')}`);
  console.log(`    ${c.cyan(`cd ${directory}`)}`);
  console.log(`    ${c.cyan('npm start')}`);
  if (figmaMcp) {
    console.log(
      `\n  ${c.dim('figma-console-mcp — install the Desktop Bridge plugin:')}`,
    );
    console.log(`    ${c.cyan(FIGMA_SETUP_URL)}\n`);
  } else {
    console.log('');
  }
}

if (require.main === module) {
  main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n${c.red('✖')} ${msg}\n`);
    process.exit(1);
  });
}
