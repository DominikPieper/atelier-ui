import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import mdx from '@astrojs/mdx';
import pagefind from 'astro-pagefind';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  site: 'https://atelier.pieper.io',
  fonts: [
    {
      name: 'Inter',
      cssVariable: '--font-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600, 700, 800],
      styles: ['normal'],
      display: 'swap',
    },
    {
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal'],
      display: 'swap',
    },
  ],
  integrations: [
    expressiveCode(),
    mdx(),
    react(),
    pagefind(),
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        if (item.url === 'https://atelier.pieper.io/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (/\/(workshop|storybook|figma|mcp|components)\/?$/.test(item.url)) {
          item.priority = 0.9;
        } else if (/\/components\/[^/]+\/?$/.test(item.url)) {
          item.priority = 0.8;
        }
        return item;
      },
    }),
  ],
  output: 'static',
  outDir: '../dist/docs',
  vite: {
    plugins: [nxViteTsPaths()],
    server: {
      port: 4300,
    },
  },
});
