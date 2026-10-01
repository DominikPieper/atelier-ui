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
    rules: {
      // `<pre tabindex="0">` is how a horizontally scrollable code block gets
      // keyboard access (WCAG 2.1.1, axe scrollable-region-focusable); the
      // rule's default treats every non-interactive element as a violation.
      'astro/jsx-a11y/no-noninteractive-tabindex': ['error', { tags: ['pre'] }],
    },
  },
  {
    ignores: ['.astro/**', 'dist/**'],
  },
];
