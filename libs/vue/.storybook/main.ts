import type { StorybookConfig } from '@storybook/vue3-vite';
import type { InlineConfig } from 'vite';

const isProduction = process.env['CI'] || process.env['BUILD_STORYBOOK'];

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts)'],
  addons: [
    // MCP addon requires a running Node.js server — dev only
    ...(!isProduction ? ['@storybook/addon-mcp'] : []),
    '@storybook/addon-vitest',
    '@storybook/addon-a11y',
    '@storybook/addon-designs',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  staticDirs: ['../../../images'],
  docs: {},
  features: {
    experimentalComponentManifest: true,
  } as StorybookConfig['features'],
  viteFinal: async (config: InlineConfig) => {
    if (process.env['CI'] || process.env['BUILD_STORYBOOK']) {
      config.base = '/storybook-vue/';
    }
    return config;
  },
};

export default config;
