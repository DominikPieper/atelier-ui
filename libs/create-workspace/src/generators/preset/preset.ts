import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  NX_VERSION,
  removeDependenciesFromPackageJson,
  runTasksInSerial,
  Tree,
  updateJson,
  writeJson,
} from '@nx/devkit';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PresetGeneratorSchema } from './schema';

function readTemplate(relativePath: string): string {
  return readFileSync(join(__dirname, 'files', relativePath), 'utf-8');
}

const SITE_URL = 'https://atelier.pieper.io';

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
      await ensurePackage('@nx/angular', NX_VERSION);
      const { applicationGenerator: angularAppGenerator } = require('@nx/angular/generators');
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { applicationGenerator: reactAppGenerator } = await ensurePackage<any>(
        '@nx/react',
        NX_VERSION,
      );
      await reactAppGenerator(tree, {
        name: appName,
        directory: appName,
        style: 'css',
        routing: true,
        bundler: 'vite',
        linter: 'eslint',
        unitTestRunner: 'none',
        skipFormat: true,
      } as Parameters<typeof reactAppGenerator>[1]);
      deps['@atelier-ui/react'] = 'latest';
    }

    if (framework === 'vue') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { applicationGenerator: vueAppGenerator } = await ensurePackage<any>(
        '@nx/vue',
        NX_VERSION,
      );
      await vueAppGenerator(tree, {
        name: appName,
        directory: appName,
        style: 'css',
        routing: true,
        linter: 'eslint',
        unitTestRunner: 'none',
        skipFormat: true,
      } as Parameters<typeof vueAppGenerator>[1]);
      deps['@atelier-ui/vue'] = 'latest';
    }

    // Inject CSS tokens import into the app's global stylesheet
    const stylesPath = `${appName}/src/styles.css`;
    const existing = tree.exists(stylesPath) ? (tree.read(stylesPath, 'utf-8') ?? '') : '';
    tree.write(
      stylesPath,
      `@import '@atelier-ui/${framework}/styles/tokens.css';\n\n${existing}`,
    );
  }

  // Write CLAUDE.md with framework-specific guidance
  const frameworkSections = frameworks
    .map((f) => {
      if (f === 'angular') {
        return `### Angular (\`@atelier-ui/angular\`)
- Selectors: \`llm-button\`, \`llm-input\`, \`llm-dialog\`, …
- Import: \`import { LlmButtonComponent } from '@atelier-ui/angular';\`
- Add to \`@Component({ imports: [LlmButtonComponent] })\`
- Form controls implement Signal Forms (\`FormValueControl\` / \`FormCheckboxControl\`)`;
      }
      if (f === 'react') {
        return `### React (\`@atelier-ui/react\`)
- Elements: \`<LlmButton>\`, \`<LlmInput>\`, \`<LlmDialog>\`, …
- Import: \`import { LlmButton } from '@atelier-ui/react';\`
- Event handlers follow \`onXxx\` / \`onXxxChange\` convention
- Toast: use \`useLlmToast()\` hook inside \`<LlmToastProvider>\``;
      }
      if (f === 'vue') {
        return `### Vue (\`@atelier-ui/vue\`)
- Elements: \`<LlmButton>\`, \`<LlmInput>\`, \`<LlmDialog>\`, …
- Import: \`import { LlmButton } from '@atelier-ui/vue';\`
- Two-way binding: \`v-model\` and \`v-model:value\` where applicable
- Toast: use \`useLlmToast()\` composable`;
      }
      return '';
    })
    .join('\n\n');

  const mcpSection = frameworks
    .map(
      (f) =>
        `### \`storybook-${f}\` MCP
Before using any component:
1. Call \`list-all-documentation\` to get valid component IDs
2. Call \`get-documentation\` with the ID — never invent props
3. Call \`get-documentation-for-story\` for a specific variant
4. Do not use a component that is not in the docs`,
    )
    .join('\n\n');

  tree.write(
    'CLAUDE.md',
    `# Atelier UI Workshop

This workspace uses Atelier UI for all UI components.
Full API reference: ${SITE_URL}/llms-full.txt

## MCP Servers

The servers are pre-configured in \`.mcp.json\` and connect automatically.

${mcpSection}

## Component Libraries

${frameworkSections}

## Design Tokens

All colors, spacing, and radii use CSS custom properties. Never use
hardcoded hex values or pixel sizes — always reference a token.

Key tokens:
- Colors:   --ui-color-primary, --ui-color-text, --ui-color-surface-raised, --ui-color-border
- Spacing:  --ui-spacing-4 (1rem), --ui-spacing-6 (1.5rem), --ui-spacing-8 (2rem)
- Radius:   --ui-radius-sm (0.375rem), --ui-radius-md (0.5rem), --ui-radius-lg (0.75rem)

## Rules
- Prefer component props over custom CSS
- When custom styling is needed, use --ui-color-* and --ui-spacing-* tokens
- Do not install other UI component libraries alongside Atelier UI
- Do not add inline hex colors or hardcoded spacing values

## Apps

${frameworks.map((f) => `- \`workshop-${f}\` — run with \`npx nx serve workshop-${f}\``).join('\n')}

## Troubleshooting

Run the preflight self-check to verify your environment:

\`\`\`bash
npm run preflight
\`\`\`

It checks Node, Claude CLI, \`FIGMA_ACCESS_TOKEN\`, MCP endpoint reachability, and port availability.
Full troubleshooting guide: ${SITE_URL}/troubleshooting

## Reference

- Component browser + docs: ${SITE_URL}
- MCP Playground (inspect tool responses): ${SITE_URL}/mcp
- CLAUDE.md template: ${SITE_URL}/claude-md
`,
  );

  // Install selected @atelier-ui/* packages
  const installTask = addDependenciesToPackageJson(tree, deps, {});

  // Remove the preset package itself — create-nx-workspace adds it automatically
  // but it's a build-time tool and should not be in the workspace's dependencies
  const removePresetTask = removeDependenciesFromPackageJson(
    tree,
    ['@atelier-ui/create-workspace'],
    [],
  );

  // Write preflight script into the scaffolded workspace
  tree.write('tools/scripts/preflight.mjs', readTemplate('tools/scripts/preflight.mjs'));

  // Add `preflight` npm script to the generated workspace's package.json
  if (tree.exists('package.json')) {
    updateJson(tree, 'package.json', (pkg) => {
      pkg.scripts = pkg.scripts ?? {};
      pkg.scripts.preflight = 'node tools/scripts/preflight.mjs';
      return pkg;
    });
  }

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
  writeJson(tree, '.mcp.json', { mcpServers });

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

Claude Code MCP servers are pre-configured in \`.mcp.json\`.
Browse components at ${SITE_URL}
`,
  );

  await formatFiles(tree);

  return runTasksInSerial(installTask, removePresetTask);
}

export default presetGenerator;
