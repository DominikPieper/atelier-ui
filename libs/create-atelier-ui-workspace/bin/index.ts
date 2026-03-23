#!/usr/bin/env node

import { createWorkspace } from 'create-nx-workspace';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const enquirer = require('enquirer');

async function main() {
  let name = process.argv.slice(2).find((arg) => !arg.startsWith('-'));

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

  const { framework } = await enquirer.prompt({
    type: 'select',
    name: 'framework',
    message: 'Which framework do you want to use?',
    choices: [
      { name: 'angular', message: 'Angular' },
      { name: 'react',   message: 'React' },
      { name: 'vue',     message: 'Vue' },
    ],
  });

  console.log(`\nScaffolding Atelier UI workshop: ${name} (${framework})\n`);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  const { directory } = await createWorkspace(
    `@atelier-ui/create-workspace@${presetVersion}`,
    {
      name,
      nxCloud: 'skip',
      packageManager: 'npm',
      frameworks: framework,
    },
  );

  const appName = `workshop-${framework}`;
  console.log(`\n✓ Workspace created at: ${directory}`);
  console.log(`\nGet started:\n`);
  console.log(`  cd ${directory}`);
  console.log(`  npx nx serve ${appName}`);
  console.log(`\nApp scaffolded: ${appName}\n`);
}

main();
