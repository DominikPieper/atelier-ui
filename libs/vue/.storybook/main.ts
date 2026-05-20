import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from '@storybook/vue3-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts)'],
  addons: [
    // Emits manifests/components.json at build time for the hosted @storybook/mcp worker;
    // also registers dev-only tools (preview-stories, run-story-tests, get-storybook-story-instructions)
    // when Storybook runs as a local dev server.
    '@storybook/addon-mcp',
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/vue3-vite"),
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

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
