import { StorybookConfig } from '@analogjs/storybook-angular';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-mcp',
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@analogjs/storybook-angular',
    options: {},
  },
};

export default config;
