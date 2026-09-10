import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import type { StorybookConfig } from '@storybook/vue3-vite';
import type { InlineConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts)'],
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
    name: getAbsolutePath("@storybook/vue3-vite"),
    options: {},
  },
  staticDirs: ['../../../images'],
  docs: {},
  features: {
    // Read by Storybook's core-server at build time (`writeManifests`) and by
    // addon-mcp's docs-toolset gate on a dev server; `@storybook/addon-mcp`
    // forces it on through its own `features` preset anyway. Together with
    // `experimentalDocgenServer` below, this build now emits
    // manifests/components.json with `meta.docgen: 'vue-component-meta'` —
    // before Storybook 10.6, only `@storybook/react` contributed a `components`
    // entry to the `experimental_manifests` preset, which is why the hosted
    // worker fell back to serving React's manifest on this endpoint too
    // (ADR-0083).
    componentsManifest: true,
    // Vue's docgen server is opt-in under `@storybook/vue3-vite` until
    // Storybook 11, where it becomes the default; without this flag the build
    // still exits 0 but writes a components.json with only `id`/`name`, no props.
    experimentalDocgenServer: true,
  },
  viteFinal: async (config: InlineConfig) => {
    // The hosted path (atelier.pieper.io/storybook-vue/) is opted into by the
    // deploy's own build command (wrangler.jsonc sets BUILD_STORYBOOK=1), never
    // inferred from CI. `viteFinal` also shapes the Vite server that
    // @storybook/addon-vitest starts for browser-mode tests; with the base set
    // there, the Vitest orchestrator's root-relative /__vitest_browser__/ scripts
    // 404 and every session times out — which is exactly what happened under
    // CI=1 for weeks. See plan/adr/0122 (S0 of ADR-0121).
    if (process.env['BUILD_STORYBOOK']) {
      config.base = '/storybook-vue/';
    }
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
