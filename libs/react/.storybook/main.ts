import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { StorybookConfig } from '@storybook/react-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
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
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },
  staticDirs: ['../../../images'],
  docs: {},
  /*typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },*/
  features: {
    experimentalComponentManifest: true,
  } as StorybookConfig['features'],
  viteFinal: async (config: InlineConfig) => {
    if (process.env['CI'] || process.env['BUILD_STORYBOOK']) {
      config.base = '/storybook-react/';
    }
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
