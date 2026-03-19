import { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-mcp',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  features: {
    experimentalComponentManifest: true,
  } as StorybookConfig['features'],
};

export default config;
