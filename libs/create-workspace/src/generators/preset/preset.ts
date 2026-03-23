import {
  addDependenciesToPackageJson,
  ensurePackage,
  formatFiles,
  NX_VERSION,
  removeDependenciesFromPackageJson,
  runTasksInSerial,
  Tree,
  writeJson,
} from '@nx/devkit';
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
      await ensurePackage('@nx/angular', NX_VERSION);
      // eslint-disable-next-line @typescript-eslint/no-var-requires
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

  tree.write(
    'CLAUDE.md',
    `# Atelier UI Workshop

This workspace contains Atelier UI component library apps for hands-on AI development training.

## MCP Tools — always use these before writing component code

The MCP servers are pre-configured in \`.claude/settings.json\` and connect automatically.

| Tool | When to call it |
|---|---|
| \`get_component_docs(component)\` | Before using any component — returns exact props, types, defaults |
| \`list_components()\` | To see all 22 available components grouped by category |
| \`search_components(query)\` | When you know the intent ("form input") but not the component name |
| \`get_stories(component)\` | To see real usage examples and variants |
| \`get_theming_guide()\` | Before customising colors, spacing, or dark mode |

**Rule:** call the MCP server first, then write code. Never guess prop names.

## Component Libraries

${frameworkSections}

## Global styles

CSS design tokens are imported in each app's \`src/styles.css\`.
All \`--ui-*\` custom properties are available globally (colors, spacing, radius, typography, shadows).

## Apps

${frameworks.map((f) => `- \`workshop-${f}\` — run with \`npx nx serve workshop-${f}\``).join('\n')}

## Reference

- Component browser + exercises: ${SITE_URL}
- MCP Playground (inspect tool responses): ${SITE_URL}/mcp
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

  return runTasksInSerial(installTask, removePresetTask);
}

export default presetGenerator;
