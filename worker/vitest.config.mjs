import { defineConfig } from 'vitest/config';

// Deliberately NOT listed in the root vitest.config.mjs `projects:` — that file
// is the Storybook test-run discovery anchor (ADR-0112) and its gate expects
// only the libs. The worker has no framework to bootstrap, so it runs on its
// own via `npm run test:worker`.
export default defineConfig({
  test: { include: ['worker/**/*.spec.ts'], environment: 'node' },
});
