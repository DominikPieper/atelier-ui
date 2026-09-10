import { defineConfig } from 'vitest/config';

// This file is how @storybook/addon-vitest's `test-run` MCP tool (and the
// Storybook "Testing" panel) finds the right Vitest project for each
// framework: VitestManager.startVitest() walks up from a story's
// `.storybook` directory looking for the nearest vitest/vite config whose
// *source text* mentions "storybookTest" or "@storybook/addon-vitest", and
// uses that file's directory as the Vitest workspace root. Without a literal
// mention here, the walk-up finds `libs/<fw>/vite.config.mts` first (it
// matches the filename pattern but not the content check) and roots there
// instead — a single, unnamed project with no `projects:` list, so the
// `storybook:<configDir>` project filter never matches anything and the tool
// fails with "No projects matched the filter". See
// `libs/*/vitest.storybook.config.ts` for the actual storybookTest() usage.
export default defineConfig({
  test: {
    projects: [
      'libs/react/vitest.storybook.config.ts',
      'libs/angular/vitest.storybook.config.ts',
      'libs/vue/vitest.storybook.config.ts',
      'libs/react/vite.config.mts',
      'libs/angular/vite.config.mts',
      'libs/vue/vite.config.mts',
    ],
  },
});
