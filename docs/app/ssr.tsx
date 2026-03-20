// SSR prerender script — built via `vite build --config docs/vite.ssr.config.ts`
// and run as `node dist/docs-ssr/ssr.js`
import React from 'react';
import { renderToString } from 'react-dom/server';
import {
  RouterProvider,
  createMemoryHistory,
  createRouter,
} from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROUTES = [
  '/',
  '/components',
  '/components/button',
  '/components/card',
  '/components/badge',
  '/components/input',
  '/components/textarea',
  '/components/checkbox',
  '/components/toggle',
  '/components/radio-group',
  '/components/select',
  '/components/alert',
  '/components/dialog',
  '/components/tabs',
  '/components/accordion',
  '/components/menu',
  '/components/tooltip',
  '/components/toast',
  '/components/skeleton',
  '/components/avatar',
  '/components/breadcrumbs',
  '/components/drawer',
  '/components/pagination',
  '/components/progress',
];

// After SSR build: this script is at dist/docs-ssr/ssr.js
// dist/docs/ is at ../docs/ relative to dist/docs-ssr/
const distDocsDir = resolve(__dirname, '../docs');
const template = readFileSync(resolve(distDocsDir, 'index.html'), 'utf-8');

for (const route of ROUTES) {
  const memoryHistory = createMemoryHistory({ initialEntries: [route] });
  const router = createRouter({ routeTree, history: memoryHistory });

  await router.load();

  const appHtml = renderToString(
    React.createElement(RouterProvider, { router }),
  );

  const fullHtml = template.replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );

  const outPath =
    route === '/'
      ? resolve(distDocsDir, 'index.html')
      : resolve(distDocsDir, route.slice(1) + '/index.html');

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, fullHtml, 'utf-8');
  console.log(`✓ Prerendered: ${route}`);
}

console.log(`\nPrerendered ${ROUTES.length} routes to ${distDocsDir}`);
