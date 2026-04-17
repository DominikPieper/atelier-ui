import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  site: 'https://atelier.pieper.io',
  integrations: [react(), sitemap()],
  output: 'static',
  outDir: '../dist/docs',
  vite: {
    plugins: [nxViteTsPaths()],
    server: {
      port: 4300,
    },
  },
});
