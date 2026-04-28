#!/usr/bin/env node

import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

import { createWorkspace } from 'create-nx-workspace';

const enquirer = require('enquirer');

type Framework = 'angular' | 'react' | 'vue';
const VALID_FRAMEWORKS: readonly Framework[] = ['angular', 'react', 'vue'];

const FIGMA_SETUP_URL = 'https://atelier.pieper.io/figma-token';

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
  throw new Error(`Invalid --${name} value: "${raw}". Must be "true" or "false".`);
}

export async function main() {
  const argv = process.argv.slice(2);

  let name = argv.find((arg) => !arg.startsWith('-'));
  let framework = parseFlag(argv, 'framework') as Framework | undefined;
  let figmaMcp = parseBooleanFlag(argv, 'figma');

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
      console.error(`\n✖ Cannot create workspace: "${name}" already exists at ${targetDir}.`);
      console.error(`  Pick a different name or remove the existing directory.\n`);
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

  console.log(`\nScaffolding Atelier workshop: ${name} (${framework})\n`);

  const presetVersion = require('../package.json').version;
  // ATELIER_PRESET_SPEC overrides the published preset — used by the e2e test
  // to install the locally-packed tarball instead of fetching from npm.
  const presetSpec =
    process.env.ATELIER_PRESET_SPEC ?? `@atelier-ui/create-workspace@${presetVersion}`;

  const { directory } = await createWorkspace(presetSpec, {
    name,
    nxCloud: 'skip',
    packageManager: 'npm',
    frameworks: framework,
    figmaMcp,
  });

  const appName = `workshop-${framework}`;
  console.log(`\n✓ Workspace created at: ${directory}`);
  console.log(`\nGet started:\n`);
  console.log(`  cd ${directory}`);
  console.log(`  npx nx serve ${appName}`);
  console.log(`\nApp scaffolded: ${appName}`);
  if (figmaMcp) {
    console.log(`\nFigma MCP enabled — install the Desktop Bridge plugin:`);
    console.log(`  ${FIGMA_SETUP_URL}\n`);
  } else {
    console.log('');
  }
}

if (require.main === module) {
  main().catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`\n✖ ${msg}\n`);
    process.exit(1);
  });
}
