// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import nx from '@nx/eslint-plugin';

export default [{
  files: ['**/*.json'],
  // Override or add rules here
  rules: {},
  languageOptions: {
    parser: await import('jsonc-eslint-parser'),
  },
}, ...nx.configs['flat/base'], ...nx.configs['flat/typescript'], ...nx.configs['flat/javascript'], {
  ignores: ['**/dist', '**/out-tsc', '**/vitest.config.*.timestamp*'],
}, {
  files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
        depConstraints: [
          {
            sourceTag: 'framework:angular',
            onlyDependOnLibsWithTags: ['framework:angular', 'type:spec'],
          },
          {
            sourceTag: 'framework:react',
            onlyDependOnLibsWithTags: ['framework:react', 'type:spec'],
          },
          {
            sourceTag: 'framework:vue',
            onlyDependOnLibsWithTags: ['framework:vue', 'type:spec'],
          },
        ],
      },
    ],
  },
}, {
  files: [
    '**/*.ts',
    '**/*.tsx',
    '**/*.cts',
    '**/*.mts',
    '**/*.js',
    '**/*.jsx',
    '**/*.cjs',
    '**/*.mjs',
  ],
  // Override or add rules here
  rules: {},
}, ...storybook.configs["flat/recommended"]];
