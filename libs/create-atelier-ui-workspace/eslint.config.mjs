import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
          // `enquirer` is required in bin/index.ts via a plain `const enquirer =
          // require('enquirer')` for the interactive prompts (name/framework/Figma).
          // The rule's static analyzer only recognizes ES `import` syntax (and
          // `import x = require(...)`) when building the used-package graph, not a
          // bare CommonJS `require()` call — verified by installing the package and
          // re-running the rule, which still reported it "not used by" the project.
          // Flagging it obsolete and dropping it would ship a CLI that throws
          // `Cannot find module 'enquirer'` for anyone who omits those CLI flags.
          ignoredDependencies: ['enquirer'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];
