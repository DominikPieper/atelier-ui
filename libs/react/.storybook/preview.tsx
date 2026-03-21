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
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals['backgrounds']?.value === '#1a1a2e';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      return <Story />;
    },
  ],
};

export default preview;
