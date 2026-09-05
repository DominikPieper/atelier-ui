import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from '@storybook/angular-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // Emits manifests/{docs,components}.json at build time for the hosted
    // @storybook/mcp worker (see the `features` note below); also registers
    // dev-only tools (stories-preview, test-run,
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
    // Verified in Wave 1 (removed the flag, rebuilt): `experimentalDocgenServer`
    // is already the default under `@storybook/angular-vite` — the build wrote
    // a full manifest (`angular-component-meta`, 32 entries, docgen present)
    // without it, matching the 10.6 release notes. Kept explicit as insurance
    // against a future default flip, not because it is load-bearing today.
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
