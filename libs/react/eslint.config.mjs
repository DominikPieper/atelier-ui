// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [...baseConfig, ...nx.configs['flat/react'], {
  files: ['**/*.ts', '**/*.tsx'],
  rules: {
    '@nx/enforce-module-boundaries': [
      'error',
      {
        enforceBuildableLibDependency: true,
        allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
        depConstraints: [
          { sourceTag: '*', onlyDependOnLibsWithTags: ['*'] },
        ],
      },
    ],
  },
}, ...storybook.configs["flat/recommended"]];
