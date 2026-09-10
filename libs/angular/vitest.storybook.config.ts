import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
// Same plugin libs/angular/vite.config.mts already uses for `nx test angular`.
// Without it, `@angular/common`'s partially-Ivy-compiled `PlatformLocation`
// factory has no linker/JIT compiler wired up in this Vite pipeline, and
// merely importing `@storybook/angular` in vitest.setup.ts throws
// "The injectable 'PlatformLocation' needs to be compiled using the JIT
// compiler, but '@angular/compiler' is not available" before a single story
// loads (all 32 files fail to import). React/Vue don't need an equivalent
// because their frameworks ship no such partially-compiled npm packages.
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  plugins: [
    angular(),
    nxViteTsPaths(),
    storybookTest({
      configDir: new URL('./.storybook', import.meta.url).pathname,
    }),
  ],
  test: {
    name: 'storybook:angular',
    globals: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
});
