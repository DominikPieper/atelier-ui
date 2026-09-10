import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    // src/generators/preset/files/** is the Storybook/skills scaffold payload
    // (S1 of tasks/todo.md "Storybook + the storybookjs/mcp skills…"):
    // literal text `readTemplate()` copies verbatim into a scaffolded
    // attendee workspace via `tree.write()`. It happens to parse as valid
    // TypeScript/TSX, but it is not this project's own source — it imports
    // `@storybook/react`/`@atelier-ui/*` for a workspace that has no
    // `framework:*` tag and no dependency-boundary relationship with this
    // repo. Without this, `storybook/no-renderer-packages` and
    // `@nx/enforce-module-boundaries` fire against a file this project
    // never actually imports.
    ignores: ['src/generators/preset/files/**'],
  },
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          // Same reasoning as the `ignores` entry above, expressed the way
          // `@nx/dependency-checks` needs it: this rule scans the project's
          // *file map* independently of ESLint's own file matching, so the
          // scaffold templates need to be excluded here too, or
          // `@storybook/react` (imported only inside a template destined for
          // someone else's workspace) gets flagged as a missing dependency
          // of this one.
          ignoredFiles: [
            '{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}',
            '{projectRoot}/src/generators/preset/files/**',
          ],
          // `prettier` isn't referenced by preset source — it's a transitive
          // that create-nx-workspace installs into the scaffolded workspace so
          // @nx/js:init's ensurePackage('prettier') short-circuits instead of
          // spawning a fragile `npm install` mid-preset.
          ignoredDependencies: ['@nx/angular', '@nx/react', 'prettier'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
  {
    files: ['**/package.json', '**/package.json', '**/generators.json'],
    rules: {
      '@nx/nx-plugin-checks': 'error',
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
