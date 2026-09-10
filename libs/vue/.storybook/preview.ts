import type { Preview } from '@storybook/vue3';
import '../src/styles/tokens.css';

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
    (story, context) => {
      const isDark = context.globals['backgrounds']?.value === 'dark';
      document.documentElement.setAttribute(
        'data-theme',
        isDark ? 'dark' : 'light',
      );
      return story();
    },
  ],

  initialGlobals: {
    backgrounds: {
      value: 'light',
    },
  },
};

export default preview;
