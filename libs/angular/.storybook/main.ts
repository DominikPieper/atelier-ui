import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { StorybookConfig } from '@analogjs/storybook-angular';
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
    // `@angular/platform-browser/animations` re-exports from
    // `@angular/animations/browser` — the package Angular deprecated and this
    // workspace deliberately does not install. Nothing here imports it, but
    // `@storybook/angular`'s client does, inside a try/catch, purely to warn
    // when a story passes `BrowserAnimationsModule`
    // (dist/_browser-chunks/chunk-FPQDYJYM.js:346). The guard makes it safe at
    // RUNTIME; it does not help at BUILD time, because Rollup still walks the
    // dynamic import, resolves the absent optional peer to a stub, and fails
    // with seven MISSING_EXPORT errors on symbols nothing uses
    // (NoopAnimationDriver, AnimationDriver, ɵAnimationEngine, …).
    // `@analogjs/storybook-angular` also names the entry in
    // optimizeDeps.include (src/lib/preset.js:69), which is why filtering that
    // list alone changes nothing — measured.
    //
    // So resolve the specifier to an empty module. The only consumer compares
    // `ngModule === animations.BrowserAnimationsModule`; against `undefined`
    // that is simply false, which is the correct answer in a workspace with no
    // animations package. Delete this when @storybook/angular stops reaching
    // for a deprecated entry point.
    const ANIMATIONS = '@angular/platform-browser/animations';
    const VIRTUAL = '\0atelier:animations-stub';
    config.plugins = [
      ...(config.plugins ?? []),
      {
        name: 'atelier:stub-deprecated-angular-animations',
        enforce: 'pre' as const,
        resolveId(id: string) {
          return id === ANIMATIONS ? VIRTUAL : null;
        },
        load(id: string) {
          return id === VIRTUAL ? 'export const BrowserAnimationsModule = undefined;' : null;
        },
      },
    ];
    return config;
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
