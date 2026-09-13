import { setProjectAnnotations } from '@storybook/vue3';
import * as previewAnnotations from '../.storybook/preview';

// Portable stories (composeStories, used by atl-button.stories.spec.ts and
// any other jsdom test that imports a *.stories.ts file) need the SAME
// decorators, parameters and globals the real Storybook applies via
// .storybook/preview — otherwise a composed story silently tests a
// different component than the one Storybook renders. setProjectAnnotations
// registers that config once; its returned `beforeAll` (addon-level setup,
// not just decorators) has to run through Vitest's own beforeAll — this is
// Storybook's documented Vitest portable-stories setup, not a local
// invention:
// https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest
const annotations = setProjectAnnotations([previewAnnotations]);

beforeAll(annotations.beforeAll);
