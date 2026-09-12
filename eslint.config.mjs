// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import nx from '@nx/eslint-plugin';
import atelier from './tools/eslint-rules/index.js';

export default [
  {
    files: ['**/*.json'],
    // Override or add rules here
    rules: {},
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    // The Storybook family (`storybook`, every `@storybook/*`,
    // `eslint-plugin-storybook`) must move in lockstep at one exact pinned
    // version — see storybook-version-lockstep.js's header for why. Only the
    // root package.json carries these dependencies (verified: no
    // libs/*/package.json does), so this block targets it alone.
    //
    // `basePath` pins this config object's own `files` glob to THIS
    // directory (the workspace root) regardless of where the overall config
    // array is resolved from. Without it, the moment this array is spread
    // into a library's own eslint.config.mjs (as every libs/*/eslint.config.mjs
    // does via `...baseConfig`), `files: ['package.json']` would instead
    // resolve relative to that library's own implicit basePath and match
    // *its* package.json — silently activating this rule somewhere it was
    // never meant to run, rather than the workspace root's.
    basePath: import.meta.dirname,
    files: ['package.json'],
    plugins: { atelier },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
    rules: {
      'atelier/storybook-version-lockstep': 'error',
    },
  },
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/vitest.config.*.timestamp*',
      'docs/.astro/**',
      'libs/spec/src/behaviors.generated.ts',
    ],
  },
  {
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
            {
              sourceTag: 'type:docs',
              onlyDependOnLibsWithTags: [
                'framework:angular',
                'framework:react',
                'framework:vue',
                'type:spec',
              ],
            },
          ],
        },
      ],
    },
  },
  {
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
  },
  ...storybook.configs['flat/recommended'],
];
