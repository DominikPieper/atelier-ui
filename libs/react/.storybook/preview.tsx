import type { Preview } from '@storybook/react';
import '../src/styles/tokens.css';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'subtle', value: '#f5f5f5' },
        { name: 'dark', value: '#1a1a2e' },
      ],
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
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
    (Story, context) => {
      const isDark = context.globals['backgrounds']?.value === '#1a1a2e';
      document.documentElement.setAttribute(
        'data-theme',
        isDark ? 'dark' : 'light',
      );
      return <Story />;
    },
  ],
};

export default preview;
