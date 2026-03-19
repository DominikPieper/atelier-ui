import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [
    nxViteTsPaths(),
    storybookTest({
      configDir: new URL('./.storybook', import.meta.url).pathname,
    }),
  ],
  test: {
    name: 'storybook-angular',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    browser: {
      enabled: true,
      headless: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }],
    } as any,
    setupFiles: ['.storybook/vitest.setup.ts'],
    include: ['src/**/*.stories.@(ts|tsx)'],
  },
});
