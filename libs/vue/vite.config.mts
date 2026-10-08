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
      // vite-plugin-dts prints type errors but lets the build exit 0 unless this
      // hook throws. It is the only place the library's .vue sources are
      // typechecked (plain tsc cannot read SFCs), so a diagnostic must fail the build.
      afterDiagnostic: (diagnostics) => {
        if (diagnostics.length > 0) {
          throw new Error(
            `vite-plugin-dts: ${diagnostics.length} type error(s) in libs/vue library sources (printed above).`,
          );
        }
      },
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
    setupFiles: ['src/test-setup.ts', 'src/test-setup-stories.ts'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/vue',
      provider: 'v8' as const,
    },
  },
}));
