import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from '@storybook/vue3-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts)'],
  addons: [
    // Emits manifests/docs.json at build time for the hosted @storybook/mcp worker
    // (components.json is React-only — see the `features` note below); also
    // registers dev-only tools (preview-stories, run-story-tests,
    // get-storybook-story-instructions) when Storybook runs as a local dev server.
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
    // Read by Storybook's core-server at build time (`writeManifests`) and by
    // addon-mcp's docs-toolset gate on a dev server; `@storybook/addon-mcp`
    // forces it on through its own `features` preset anyway. Only
    // `@storybook/react` contributes a `components` entry to the
    // `experimental_manifests` preset, so this build emits manifests/docs.json
    // and no components.json — measured, and the reason the worker falls back
    // to React's manifest (ADR-0083).
    componentsManifest: true,
  },
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
