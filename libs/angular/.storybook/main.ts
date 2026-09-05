import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from '@storybook/angular-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // Emits manifests/{docs,components}.json at build time for the hosted
    // @storybook/mcp worker (see the `features` note below); also registers
    // dev-only tools (preview-stories, run-story-tests,
    // get-storybook-story-instructions) when Storybook runs as a local dev server.
    '@storybook/addon-mcp',
    getAbsolutePath("@storybook/addon-vitest"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/angular-vite"),
    options: {},
  },
  staticDirs: ['../../../images'],
  docs: {},
  features: {
    // Read by Storybook's core-server at build time (`writeManifests`) and by
    // addon-mcp's docs-toolset gate on a dev server; `@storybook/addon-mcp`
    // forces it on through its own `features` preset anyway. Together with
    // `experimentalDocgenServer` below, this build now emits
    // manifests/components.json with `meta.docgen: 'angular-component-meta'` —
    // before Storybook 10.6, only `@storybook/react` contributed a `components`
    // entry to the `experimental_manifests` preset, which is why the hosted
    // worker fell back to serving React's manifest on this endpoint too
    // (ADR-0083).
    componentsManifest: true,
    // Angular's docgen server is opt-in under `@storybook/angular-vite`
    // (unlike React, which defaults it); without this flag the build still
    // exits 0 but writes a components.json with only `id`/`name`, no props.
    experimentalDocgenServer: true,
  },
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
