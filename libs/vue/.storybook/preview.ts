import type { Preview } from '@storybook/vue3';
import '../src/styles/tokens.css';

import { withThemeByDataAttribute } from '@storybook/addon-themes';

import { contractDocsPage } from '@atelier-ui/spec/contracts/docs-block';

const preview: Preview = {
  parameters: {
    docs: {
      page: contractDocsPage,
    },
    backgrounds: {
      options: {
        light: { name: 'light', value: '#ffffff' },
        subtle: { name: 'subtle', value: '#f5f5f5' },
        dark: { name: 'dark', value: '#1a1a2e' },
      },
    },

    options: {
      storySort: {
        order: [
          'Showcase',
          '*',
          'Components',
          ['Inputs', 'Display', 'Navigation', 'Overlay', 'Feedback'],
          'Cookbook',
        ],
      },
    },

    a11y: {
      // 'error' - fail CI on a11y violations (chosen — ADR-0121 S0)
      // 'todo' - show a11y violations in the test UI only
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },

  decorators: [
    // Drives the actual dark-mode switch: tokens.css keys dark mode off
    // `[data-theme='dark']` / `[data-theme='light']` on the root element (with
    // a `prefers-color-scheme` media-query fallback for "no explicit choice"),
    // so the data-attribute strategy is the one that matches — a class-name
    // strategy would not touch the selector tokens.css actually uses. This
    // replaces the hand-rolled decorator that used to piggyback on the
    // `backgrounds` toolbar's swatch value (`backgrounds.value === 'dark'`) to
    // flip `data-theme`, which conflated "canvas colour" with "component
    // theme" — `backgrounds` keeps its own swatches below, now decoupled from
    // theming. Defaults match every existing story's rendering
    // (`defaultTheme: 'light'`), so this is additive: it does not change what
    // any story renders by default (plan/adr/0142).
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],

  initialGlobals: {
    backgrounds: {
      value: 'light',
    },
    theme: 'light',
  },
};

export default preview;
