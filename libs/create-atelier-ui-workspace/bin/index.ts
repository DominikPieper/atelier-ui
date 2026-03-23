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

  const { frameworks } = await enquirer.prompt({
    type: 'multiselect',
    name: 'frameworks',
    message: 'Which framework(s) do you want to use?',
    choices: [
      { name: 'angular', message: 'Angular' },
      { name: 'react',   message: 'React' },
      { name: 'vue',     message: 'Vue' },
    ],
    validate: (value: string[]) => value.length > 0 || 'Select at least one framework',
  });

  console.log(`\nScaffolding Atelier UI workshop: ${name} (${(frameworks as string[]).join(', ')})\n`);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const presetVersion = require('../package.json').version;

  const { directory } = await createWorkspace(
    `@atelier-ui/create-workspace@${presetVersion}`,
    {
      name,
      nxCloud: 'skip',
      packageManager: 'npm',
      frameworks: (frameworks as string[]).join(','),
    },
  );

  const appNames = (frameworks as string[]).map((f) => `workshop-${f}`).join(', ');
  console.log(`\n✓ Workspace created at: ${directory}`);
  console.log(`\nGet started:\n`);
  console.log(`  cd ${directory}`);
  console.log(`  npx nx serve ${(frameworks as string[])[0] === 'angular' ? 'workshop-angular' : `workshop-${(frameworks as string[])[0]}`}`);
  console.log(`\nApps scaffolded: ${appNames}\n`);
}

main();
