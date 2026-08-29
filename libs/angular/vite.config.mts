/// <reference types='vitest' />
import { defineConfig } from 'vite';
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/angular',
  plugins: [angular(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md'])],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  test: {
    name: 'angular',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    // Vitest defaults to 5000ms. An Angular Testing Library `render()` compiles
    // the component under test at runtime, and the measured cost of one is
    // 220–1270ms when the suite has the machine to itself. Under contention it
    // exceeds 5s: `nx run-many -t test,lint` reproduced a timeout in
    // atl-accordion.spec.ts on two of three runs, while `-t test` alone passed
    // 584/584 three times in a row. Nothing was failing — the render had not
    // finished. CI now also runs `build-storybook` alongside (three Storybook
    // builds), so the contention only goes up. 20s is generous enough that a
    // timeout here means a hang worth investigating, not a busy laptop.
    testTimeout: 20_000,
    coverage: {
      reportsDirectory: '../../coverage/angular',
      provider: 'v8' as const,
    },
  },
}));
