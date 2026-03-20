import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../node_modules/.vite/docs-ssr',
  plugins: [
    TanStackRouterVite({
      routesDirectory: './app/routes',
      generatedRouteTree: './app/routeTree.gen.ts',
    }),
    react(),
    nxViteTsPaths(),
  ],
  build: {
    outDir: '../dist/docs-ssr',
    emptyOutDir: true,
    ssr: 'app/ssr.tsx',
    rollupOptions: {
      output: {
        format: 'esm',
      },
    },
  },
});
