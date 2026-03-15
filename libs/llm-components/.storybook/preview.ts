import type { Preview } from '@storybook/angular';

// Side-effect import: Vite injects tokens.css globally into the page
import '../src/styles/tokens.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
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
    (story, context) => {
      const isDark = context.globals['backgrounds']?.value === '#1a1a2e';
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      return {
        ...story(),
        styles: [`:host { font-family: var(--ui-font-family); color: var(--ui-color-text); }`],
      };
    },
  ],
};

export default preview;
