import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      'libs/react/vitest.storybook.config.ts',
      'libs/angular/vitest.storybook.config.ts',
      'libs/react/vite.config.mts',
      'libs/angular/vite.config.mts',
      'apps/demo/vite.config.mts',
    ],
  },
});
