import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';
import type { Manifests, PresetValue } from 'storybook/internal/types';
import type { InlineConfig } from 'vite';
import {
  loadPurposes,
  withPurpose,
} from '../../../tools/scripts/lib/purpose-description.js';

// `experimental_manifests` is a real preset property, but the framework's
// `StorybookConfig` does not list it.
const config: StorybookConfig & {
  experimental_manifests?: PresetValue<Manifests>;
} = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // Emits manifests/{docs,components}.json at build time for the hosted
    // @storybook/mcp worker; also registers dev-only tools (stories-preview,
    // test-run, get-storybook-story-instructions) when Storybook runs
    // as a local dev server.
    '@storybook/addon-mcp',
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-designs'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-themes'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  staticDirs: ['../../../images'],
  docs: {},
  features: {
    // Read by Storybook's core-server at build time (`writeManifests`) and by
    // addon-mcp's docs-toolset gate on a dev server. `@storybook/addon-mcp`
    // forces it on through its own `features` preset anyway — measured: with
    // this block deleted the manifest is still emitted — but declaring it keeps
    // the manifest off an addon side effect. The `components` entry comes from
    // `@storybook/react`'s `experimental_manifests` preset — React defaults its
    // docgen server, unlike Angular and Vue, which both need
    // `experimentalDocgenServer: true` in their own `features` block (added in
    // Storybook 10.6). Before that release, React was the only adapter that
    // emitted a `components` entry, which is why the hosted worker fell back to
    // serving React's manifest on the Angular and Vue endpoints too (ADR-0083).
    componentsManifest: true,
    // `review-create` (wire name for the addon-mcp `review.create` method)
    // registers for the deprecated `storybook ai` CLI proxy channel by default
    // (unset ≠ false), but a direct MCP client — exactly what
    // `claude mcp add --transport http storybook-local http://localhost:<port>/mcp`
    // configures — only gets the tool when `experimentalReview` is explicitly
    // `true` (verified against the installed 10.6.0 `storybook` dist,
    // `common-preset.js`'s `isReviewExplicitlyEnabled`, 2026-09-13). See
    // plan/adr/0143.
    experimentalReview: true,
  },
  // R-221: an agent reading `docs-list` / `docs-show` sees the owned `purpose`
  // (libs/spec/src/metadata) first, then the component's own JSDoc. React's
  // `components` manifest is built inline by `@storybook/react`, so it can be
  // rewritten here; Angular and Vue go through a docgen-provider worker
  // instead (see their main.ts). Not keyed on CI (ADR-0122): the hosted build
  // gets it too.
  experimental_manifests: async (existing) => {
    const purposes = loadPurposes();
    for (const component of Object.values(
      existing?.components?.components ?? {},
    )) {
      const description = withPurpose(
        purposes,
        component.name,
        component.description,
      );
      if (description !== undefined) component.description = description;
    }
    return existing;
  },
  viteFinal: async (config: InlineConfig) => {
    // The hosted path (atelier.pieper.io/storybook-react/) is opted into by the
    // deploy's own build command (wrangler.jsonc sets BUILD_STORYBOOK=1), never
    // inferred from CI. `viteFinal` also shapes the Vite server that
    // @storybook/addon-vitest starts for browser-mode tests; with the base set
    // there, the Vitest orchestrator's root-relative /__vitest_browser__/ scripts
    // 404 and every session times out — which is exactly what happened under
    // CI=1 for weeks. See plan/adr/0122 (S0 of ADR-0121).
    if (process.env['BUILD_STORYBOOK']) {
      config.base = '/storybook-react/';
    }
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
