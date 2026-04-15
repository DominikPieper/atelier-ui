import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { StorybookConfig } from '@analogjs/storybook-angular';
import type { InlineConfig } from 'vite';

const isProduction = process.env['CI'] || process.env['BUILD_STORYBOOK'];

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // MCP addon requires a running Node.js server — dev only
    ...(!isProduction ? ['@storybook/addon-mcp'] : []),
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@analogjs/storybook-angular"),
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

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
