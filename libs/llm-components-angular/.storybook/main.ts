import { StorybookConfig } from '@analogjs/storybook-angular';
import type { InlineConfig } from 'vite';

const isProduction = process.env['CI'] || process.env['BUILD_STORYBOOK'];

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // MCP addon requires a running Node.js server — dev only
    ...(!isProduction ? ['@storybook/addon-mcp'] : []),
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@analogjs/storybook-angular',
    options: {},
  },
  staticDirs: ['../../../images'],
  docs: {},
  features: {
    experimentalComponentManifest: true,
  } as StorybookConfig['features'],
  viteFinal: async (config: InlineConfig) => {
    if (process.env['CI'] || process.env['BUILD_STORYBOOK']) {
      config.base = '/storybook-angular/';
    }
    return config;
  },
};

export default config;
