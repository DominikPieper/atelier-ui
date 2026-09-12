// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
import pluginVue from 'eslint-plugin-vue';
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility';
import eslintConfigPrettier from 'eslint-config-prettier';

import tseslint from 'typescript-eslint';
import baseConfig from '../../eslint.config.mjs';
import atelier from '../../tools/eslint-rules/index.js';

// eslint-plugin-vue's `essential`/`strongly-recommended`/`recommended` rule
// blocks (unlike its `base` parser-setup block) ship with no `files`
// restriction, so applied as-is they lint every .ts file in the project, not
// just .vue SFCs. That is real over-reach here: this lib's .stories.ts and
// .spec.ts files legitimately call `defineComponent` several times per file
// for lightweight test doubles (`vue/one-component-per-file` is an SFC
// convention, meaningless for a spec file) and name them tersely (e.g.
// `Probe` in atl-toast.a11y.spec.ts — `vue/multi-word-component-names` exists
// to avoid colliding with real/future HTML tags in templates, not a concern
// for a component that's never a public custom element). No production
// component logic lives outside .vue files in this lib (verified: `grep -rl
// defineComponent src --include='*.ts'` matches only *.spec.ts/*.stories.ts),
// so scoping these rule blocks to `**/*.vue` loses no real coverage.
const vueRecommended = pluginVue.configs['flat/recommended'].map((cfg) =>
  cfg.files ? cfg : { ...cfg, files: ['**/*.vue'] },
);

// eslint-plugin-vuejs-accessibility's flat/recommended has the same
// over-reach: its first block (`vuejs-accessibility:setup:base`) registers
// the plugin and sets languageOptions.sourceType/globals with no `files`
// restriction at all, so left as-is it would apply those languageOptions to
// every file in the project, not just .vue SFCs. Its second block already
// carries `files: ['*.vue', '**/*.vue']` (redundant with itself, but already
// scoped), so only the first needs the same treatment as vueRecommended
// above.
const vueA11yRecommended = pluginVueA11y.configs['flat/recommended'].map(
  (cfg) => (cfg.files ? cfg : { ...cfg, files: ['**/*.vue'] }),
);

export default [
  ...baseConfig,
  ...vueRecommended,
  ...vueA11yRecommended,
  {
    // vue-eslint-parser (wired by flat/recommended above) parses the
    // <template>/<script>/<style> structure of a .vue file; parserOptions.parser
    // tells it which parser to hand the <script> block's contents to. Without
    // this, `<script setup lang="ts">` content is parsed as plain JS and every
    // TS-only construct (interfaces, type-only imports, generics) is a syntax
    // error.
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
  },
  {
    // Formatting of .vue files is Prettier's job in this repo (.prettierrc at
    // the root, eslint-config-prettier already a devDependency) — turn off
    // the eslint-plugin-vue layout/whitespace rules (max-attributes-per-line,
    // html-self-closing, etc.) that duplicate and fight it, same as baseConfig
    // already does for .ts/.js via nx's own flat/typescript config. Rules
    // that aren't about formatting (require-default-prop, no-unused-vars-style
    // correctness rules, attribute *order* which Prettier never touches) are
    // untouched by this map and stay active below.
    files: ['**/*.vue'],
    rules: eslintConfigPrettier.rules,
  },
  {
    // Not part of any preset (`essential`/`strongly-recommended`/`recommended`
    // all omit it) — must be opted into explicitly. It re-implements, at lint
    // time and per-component, exactly what `check:props`'s `[DEAD]` half
    // checks for this framework from outside via a whole-repo script: a
    // declared prop nothing in the component reads. Verified before enabling
    // it: a deliberately-added unused prop on a scratch `<script setup>`
    // component IS caught (confirms the rule understands this codebase's
    // typed-`defineProps<T>()` composition-API style, not a silent no-op),
    // and the real component set reports zero — consistent with
    // `check:props`'s own run, which has no [DEAD] entry for any Vue prop
    // (its one Vue/rowId finding is MISSING, a different category, not
    // unused-but-declared).
    files: ['**/*.vue'],
    rules: {
      'vue/no-unused-properties': ['error', { groups: ['props'] }],
    },
  },
  {
    // vuejs-accessibility/label-has-for defaults to
    // `required: { every: ['nesting', 'id'] }` — it demands a label satisfy
    // *both* HTML's label-association strategies at once. Only one is ever
    // required (WHATWG HTML: an implicit/nested control OR an explicit
    // for/id pair, either alone is a valid accessible label), so the
    // default over-fires on every label in this lib that legitimately uses
    // just one strategy: atl-radio nests its <input> with no `for` (nesting
    // only), atl-input/atl-select/atl-textarea bind `:for` to an `<input>`
    // that lives in a sibling wrapper div, not a child of <label> (id only).
    // atl-checkbox/atl-toggle already satisfy both and are unaffected either
    // way. `some` matches the real HTML requirement without weakening it: a
    // label satisfying neither strategy still fails.
    files: ['**/*.vue'],
    rules: {
      'vuejs-accessibility/label-has-for': [
        'error',
        { required: { some: ['nesting', 'id'] } },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
          depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }],
        },
      ],
    },
  },
  {
    // Every `atl-*.stories.ts` default export must declare
    // parameters.docs.description.component, derived from `<name>.purpose`
    // (formerly check-story-descriptions.js). Scoped to one-level-deep
    // component dirs (`src/lib/<component>/*.stories.ts`) — same scope the
    // old script's directory-only scan had — so top-level
    // `src/lib/*.stories.ts` siblings (`cookbook.stories.ts`) are out of
    // scope, same as before. `toast`, `code-block`, and `showcase` are
    // excluded — same three dirs `STORY_DESCRIPTION_SKIP_DIRS` carried:
    // components with no metadata file (toast: service + container,
    // documented manually; code-block: docs-site widget; showcase:
    // composite docs sandbox), so no `metadata.purpose` exists for them to
    // derive from.
    files: ['src/lib/*/*.stories.ts'],
    ignores: ['**/toast/**', '**/code-block/**', '**/showcase/**'],
    plugins: { atelier },
    rules: {
      'atelier/story-description-source': 'error',
    },
  },
  ...storybook.configs['flat/recommended'],
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
];
