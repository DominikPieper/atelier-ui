import type { Preview } from '@storybook/angular';

// Side-effect import: Vite injects tokens.css globally into the page
import '../src/styles/tokens.css';
// CDK overlay container styles (required for LlmMenu, LlmTooltip)
import '@angular/cdk/overlay-prebuilt.css';

const preview: Preview = {
  parameters: {
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
