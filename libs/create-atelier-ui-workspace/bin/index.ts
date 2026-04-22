#!/usr/bin/env node

import { createWorkspace } from 'create-nx-workspace';

const enquirer = require('enquirer');

type Framework = 'angular' | 'react' | 'vue';
const VALID_FRAMEWORKS: readonly Framework[] = ['angular', 'react', 'vue'];

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

export async function main() {
  const argv = process.argv.slice(2);

  let name = argv.find((arg) => !arg.startsWith('-'));
  let framework = parseFlag(argv, 'framework') as Framework | undefined;

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

  console.log(`\nScaffolding Atelier UI workshop: ${name} (${framework})\n`);

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
  });

  const appName = `workshop-${framework}`;
  console.log(`\n✓ Workspace created at: ${directory}`);
  console.log(`\nGet started:\n`);
  console.log(`  cd ${directory}`);
  console.log(`  npx nx serve ${appName}`);
  console.log(`\nApp scaffolded: ${appName}\n`);
}

if (require.main === module) {
  main();
}
