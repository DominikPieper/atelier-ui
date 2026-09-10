import type { Preview } from '@storybook/angular';

// Side-effect import: Vite injects tokens.css globally into the page
import '../src/styles/tokens.css';
// CDK overlay container styles (required for AtlMenu, AtlTooltip)
import '@angular/cdk/overlay-prebuilt.css';

import { contractDocsPage } from '@atelier-ui/spec/contracts/docs-block';

const preview: Preview = {
  parameters: {
    docs: {
      page: contractDocsPage,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        light: { name: 'light', value: '#ffffff' },
        subtle: { name: 'subtle', value: '#f5f5f5' },
        dark: { name: 'dark', value: '#1a1a2e' }
      }
    },
    options: {
      storySort: {
        order: [
          'Showcase', '*',
          'Components', ['Inputs', 'Display', 'Navigation', 'Overlay', 'Feedback'],
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
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      return {
        ...story(),
        styles: [`:host { font-family: var(--ui-font-family); color: var(--ui-color-text); }`],
      };
    },
  ],

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
};

export default preview;
