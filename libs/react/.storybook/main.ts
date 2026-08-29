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
    // Read by Storybook's core-server at build time (`writeManifests`) and by
    // addon-mcp's docs-toolset gate on a dev server. `@storybook/addon-mcp`
    // forces it on through its own `features` preset anyway — measured: with
    // this block deleted the manifest is still emitted — but declaring it keeps
    // the manifest off an addon side effect. The `components` entry comes from
    // `@storybook/react`'s `experimental_manifests` preset, which is why React
    // is the only adapter that emits one (ADR-0083).
    componentsManifest: true,
  },
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
