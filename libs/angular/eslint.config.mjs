// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';
import baseConfig from '../../eslint.config.mjs';
import atelier from '../../tools/eslint-rules/index.js';

export default tseslint.config(
  ...baseConfig,
  ...nx.configs['flat/angular'],
  // `flat/angular-template` (@nx/eslint-plugin/dist/src/flat-configs/angular-template.js)
  // extends angular-eslint's own `templateAccessibility` preset
  // (angular-eslint/dist/configs/template-accessibility.js) on top of
  // `templateRecommended` — all 11 rules its README tags `:accessibility:`
  // (alt-text, click-events-have-key-events, elements-content,
  // interactive-supports-focus, label-has-associated-control,
  // mouse-events-have-key-events, no-autofocus, no-distracting-elements,
  // role-has-required-aria, table-scope, valid-aria) are already `error`
  // here, on `**/*.html` and on inline templates alike (the
  // `extract-inline-html` processor runs them through the same `**/*.html`
  // rule blocks). `eslint --print-config` on a `.ts` path won't show this:
  // it only evaluates blocks whose `files` glob matches `*.ts` literally and
  // never simulates the processor's virtual `*.html` sub-file, so checking
  // accessibility coverage that way looks like zero when it isn't.
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // Angular selectors
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'atl', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'atl', style: 'kebab-case' },
      ],

      // Angular strict rules
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/no-output-on-prefix': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@angular-eslint/use-pipe-transform-interface': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/contextual-decorator': 'error',
      '@angular-eslint/contextual-lifecycle': 'error',
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/relative-url-prefix': 'error',
      '@angular-eslint/sort-lifecycle-methods': 'error',
      '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
      '@angular-eslint/no-lifecycle-call': 'error',
      '@angular-eslint/no-pipe-impure': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/use-component-view-encapsulation': 'error',
      '@angular-eslint/use-component-selector': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',

      // TypeScript strict rules
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/strict-boolean-expressions': [
        'error',
        { allowNullableBoolean: true, allowNullableString: true },
      ],

      // General strict rules
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-return-await': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-throw-literal': 'error',
    },
  },
  {
    // Component source only — same scope as the gate this replaces
    // (check-host-attr-guards.js, ADR-0091): `atl-*.ts` files, not their
    // `.spec.ts`/`.stories.ts` siblings. A no-op on any class without an
    // `@Component` decorator, so it costs nothing to leave enabled beyond
    // that.
    files: ['**/atl-*.ts'],
    ignores: ['**/*.spec.ts', '**/*.stories.ts'],
    plugins: { atelier },
    rules: {
      'atelier/host-attr-guard': 'error',
    },
  },
  {
    // Every `atl-*.stories.ts` default export must declare
    // parameters.docs.description.component, derived from
    // `<name>.purpose` (formerly check-story-descriptions.js). Scoped to
    // one-level-deep component dirs (`src/lib/<component>/*.stories.ts`) —
    // same scope the old script's directory-only scan had — so top-level
    // `src/lib/*.stories.ts` siblings (`cookbook.stories.ts`,
    // `kitchen-sink.stories.ts`: docs-site sandboxes, not a single
    // component's story) are out of scope, same as before. `toast`,
    // `code-block`, and `showcase` are excluded — same three dirs
    // `STORY_DESCRIPTION_SKIP_DIRS` carried: components with no metadata
    // file (toast: service + container, documented manually; code-block:
    // docs-site widget; showcase: composite docs sandbox), so no
    // `metadata.purpose` exists for them to derive from.
    files: ['src/lib/*/*.stories.ts'],
    ignores: ['**/toast/**', '**/code-block/**', '**/showcase/**'],
    plugins: { atelier },
    rules: {
      'atelier/story-description-source': 'error',
    },
  },
  {
    files: ['**/*.html'],
    rules: {
      '@angular-eslint/template/no-negated-async': 'error',
      '@angular-eslint/template/no-duplicate-attributes': 'error',
      '@angular-eslint/template/eqeqeq': [
        'error',
        { allowNullOrUndefined: true },
      ],
      '@angular-eslint/template/no-interpolation-in-attributes': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/use-track-by-function': 'error',
      '@angular-eslint/template/no-any': 'error',
      // Disabled: this library uses Angular Signals throughout; signal reads (value(), disabled()
      // etc.) are intentional calls in templates and not a performance concern with OnPush.
      '@angular-eslint/template/no-call-expression': 'off',
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-non-null-assertion': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',

      // Not part of angular-eslint's `templateAccessibility` preset (not
      // `:accessibility:`-tagged in its README), so the pointer comment above
      // doesn't cover it — genuinely new coverage: WCAG 2.4.3 (positive
      // tabindex fights natural DOM tab order). 0 violations here.
      '@angular-eslint/template/no-positive-tabindex': 'error',
    },
  },
  {
    // Inline templates in .ts files are processed by the angular-template parser;
    // disable the same rule there too.
    rules: {
      '@angular-eslint/template/no-call-expression': 'off',
    },
  },
  storybook.configs['flat/recommended'],
  {
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
  },
  {
    // This is a publishable library: its package.json's own dependency
    // sections are what a consumer installs from, not the workspace root's.
    // `@nx/dependency-checks` catches an import with nothing declared for
    // it (the `@angular/cdk` defect this block closes) and a declared
    // dependency nothing in source imports any more.
    files: ['package.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: [
            // These two live at the project root (not under src/), so the
            // shared `production` named input in nx.json — which the
            // `build` target's inputs resolve to and which this rule reads
            // to pick the file set — does not already exclude them the way
            // it does `*.spec.ts`, `*.stories.ts` and `.storybook/**`.
            // Both are dev-loop tooling for `nx test`/`storybook-test`,
            // never present in the published `dist/libs/angular` output,
            // so their imports (vite, vitest, @nx/vite,
            // @analogjs/vite-plugin-angular, @storybook/addon-vitest,
            // @vitest/browser-playwright) are not a runtime dependency of
            // the package.
            '{projectRoot}/vite.config.mts',
            '{projectRoot}/vitest.storybook.config.ts',
            // `covers()` in here binds a behaviors.json id to a spec — it is
            // imported only by `*.spec.ts` files and is explicitly "NOT
            // exported from the package barrel" (see its own doc comment),
            // but it lives directly under src/ so the filename-suffix-based
            // exclusions above (spec/stories/storybook/test-setup) don't
            // reach it. ng-packagr's entry point is src/index.ts, which
            // never imports this directory, so it is absent from
            // dist/libs/angular — confirmed by grepping the built fesm2022
            // bundle and the emitted .d.ts files.
            '{projectRoot}/src/testing/**',
          ],
          // @atelier-ui/spec is workspace-private (see its package.json:
          // "private": true) and is inlined into this library's bundle at
          // build time — ng-packagr resolves the `@atelier-ui/spec/*`
          // path-mapped imports and emits their compiled output directly
          // into fesm2022/atelier-ui-angular.mjs, so it is never an
          // external import a consumer's npm install needs to satisfy.
          // The rule otherwise expects every buildable workspace
          // dependency to be a declared package.json dependency, which is
          // the right default for a dependency left external — just not
          // the shape this monorepo's inlining build produces for it.
          ignoredDependencies: ['@atelier-ui/spec'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
);
