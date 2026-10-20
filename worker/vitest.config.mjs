import { defineConfig } from 'vitest/config';

// Deliberately NOT listed in the root vitest.config.mjs `projects:` — that file
// is the Storybook test-run discovery anchor (ADR-0112) and its gate expects
// only the libs. The worker has no framework to bootstrap, so it runs on its
// own via `npm run test:worker`. The Storybook purpose join (tools/storybook,
// R-221) is plain Node and rides the same runner.
export default defineConfig({
  test: {
    include: ['worker/**/*.spec.ts', 'tools/storybook/**/*.spec.ts'],
    environment: 'node',
  },
});
