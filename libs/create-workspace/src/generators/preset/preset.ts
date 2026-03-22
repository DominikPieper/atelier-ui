import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  installPackagesTask,
  runTasksInSerial,
  Tree,
  writeJson,
} from '@nx/devkit';
import { applicationGenerator as angularAppGenerator } from '@nx/angular/generators';
import { applicationGenerator as reactAppGenerator } from '@nx/react';
import { PresetGeneratorSchema } from './schema';

const SITE_URL = 'https://atelier-ui.netlify.app';

type Framework = 'angular' | 'react' | 'vue';

export async function presetGenerator(tree: Tree, options: PresetGeneratorSchema) {
  const frameworks = (options.frameworks ?? 'angular')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean) as Framework[];

  const deps: Record<string, string> = {
    '@atelier-ui/spec': 'latest',
  };

  for (const framework of frameworks) {
    const appName = `workshop-${framework}`;

    if (framework === 'angular') {
      await angularAppGenerator(tree, {
        name: appName,
        directory: appName,
        style: 'css',
        routing: true,
        standalone: true,
        ssr: false,
        skipTests: true,
        skipFormat: true,
      });
      deps['@atelier-ui/angular'] = 'latest';
    }

    if (framework === 'react') {
      await reactAppGenerator(tree, {
        name: appName,
        directory: appName,
        style: 'css',
        routing: true,
        bundler: 'vite',
        unitTestRunner: 'none',
        skipFormat: true,
      } as Parameters<typeof reactAppGenerator>[1]);
      deps['@atelier-ui/react'] = 'latest';
    }

    if (framework === 'vue') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { applicationGenerator: vueAppGenerator } = await ensurePackage<any>(
        '@nx/vue',
        'latest',
      );
      await vueAppGenerator(tree, {
        name: appName,
        directory: appName,
        style: 'css',
        routing: true,
        unitTestRunner: 'none',
        skipFormat: true,
      } as Parameters<typeof vueAppGenerator>[1]);
      deps['@atelier-ui/vue'] = 'latest';
    }
  }

  // Install selected @atelier-ui/* packages
  const installTask = addDependenciesToPackageJson(tree, deps, {});

  // Write .claude/settings.json with MCP servers for selected frameworks
  const mcpServers: Record<string, unknown> = {
    'nx-mcp': {
      type: 'stdio',
      command: 'npx',
      args: ['nx', 'mcp'],
    },
  };
  for (const framework of frameworks) {
    mcpServers[`storybook-${framework}`] = {
      type: 'http',
      url: `${SITE_URL}/storybook-${framework}/mcp`,
    };
  }
  writeJson(tree, '.claude/settings.json', { mcpServers });

  // Write README
  tree.write(
    'README.md',
    `# Atelier UI Workshop

## Apps

${frameworks.map((f) => `- \`workshop-${f}\` — \`@atelier-ui/${f}\``).join('\n')}

## Getting started

\`\`\`bash
npm install
npx nx serve workshop-${frameworks[0]}
\`\`\`

## MCP

Claude Code MCP servers are pre-configured in \`.claude/settings.json\`.
Browse components at ${SITE_URL}
`,
  );

  await formatFiles(tree);

  return runTasksInSerial(installTask, () => installPackagesTask(tree));
}

export default presetGenerator;
