/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/vue',
  plugins: [
    vue(),
    nxViteTsPaths(),
    nxCopyAssetsPlugin(['*.md']),
    dts({
      tsconfigPath: './tsconfig.lib.json',
      entryRoot: 'src',
      rollupTypes: false,
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es' as const],
      fileName: 'index',
    },
    rolldownOptions: {
      external: ['vue'],
      output: {
        // Vite lib mode extracts all component CSS into index.css but emits no
        // import for it; without this consumers get unstyled components.
        banner: "import './index.css';",
      },
    },
    outDir: '../../dist/libs/vue',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
  test: {
    name: 'vue',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts}'],
    setupFiles: ['src/test-setup.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/vue',
      provider: 'v8' as const,
    },
  },
}));
