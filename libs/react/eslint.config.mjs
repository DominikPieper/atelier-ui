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
    // AtlChatMessage's domain prop is literally named `role` ('user' |
    // 'assistant' | 'system') and never reaches the DOM as an ARIA role —
    // ignoreNonDOM keeps the check for real DOM elements while skipping
    // custom-component props. Renaming the spec prop is tracked as a
    // breaking-batch item in tasks/todo.md.
    'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
  },
}, ...storybook.configs["flat/recommended"], {
  // Storybook addons are installed in the workspace root, not per-lib —
  // point the addon-installed check at the root package.json. (The inferred
  // lint target lints `.storybook/` too, which the old executor's
  // src-only file patterns never reached.)
  files: ['.storybook/main.ts'],
  rules: {
    'storybook/no-uninstalled-addons': [
      'error',
      { packageJsonLocation: '../../package.json' },
    ],
  },
}];
