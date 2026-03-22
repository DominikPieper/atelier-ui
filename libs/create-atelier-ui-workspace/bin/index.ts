#!/usr/bin/env node

import { createWorkspace } from 'create-nx-workspace';

async function main() {
  let name = process.argv[2];

  if (!name) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const enquirer = require('enquirer');
    const response = await enquirer.prompt({
      type: 'input',
      name: 'name',
      message: 'What is the name of your workshop workspace?',
      initial: 'my-workshop',
    });
    name = (response as { name: string }).name;
  }

  if (!name) {
    throw new Error('Please provide a name for the workspace');
  }

  console.log(`\nScaffolding Atelier UI workshop workspace: ${name}\n`);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  const { directory } = await createWorkspace(
    `@atelier-ui/create-workspace@${presetVersion}`,
    {
      name,
      nxCloud: 'skip',
      packageManager: 'npm',
    },
  );

  console.log(`\n✓ Workspace created at: ${directory}`);
  console.log(`\nGet started:\n`);
  console.log(`  cd ${directory}`);
  console.log(`  npx nx serve workshop\n`);
}

main();
