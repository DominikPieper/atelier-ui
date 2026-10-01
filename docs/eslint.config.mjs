import astro from 'eslint-plugin-astro';
import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  // `recommended` = `base` (astro-eslint-parser for `*.astro`, with
  // `@typescript-eslint/parser` for the frontmatter and `<script>` blocks)
  // plus the astro rules; `jsx-a11y-recommended` ports eslint-plugin-jsx-a11y
  // to the Astro template.
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
  {
    ignores: ['.astro/**', 'dist/**'],
  },
];
