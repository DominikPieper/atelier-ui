import type { Preview } from '@storybook/vue3';
import '../src/styles/tokens.css';

const preview: Preview = {
  parameters: {
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
      const isDark = context.globals['backgrounds']?.value === '#1a1a2e';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      return story();
    },
  ],

  initialGlobals: {
    backgrounds: {
      value: 'light'
    }
  }
};

export default preview;
