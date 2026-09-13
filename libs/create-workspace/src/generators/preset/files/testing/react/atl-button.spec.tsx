import { screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as stories from './atl-button.stories';

// A working pattern to copy: this composes atl-button.stories.tsx's own
// exports instead of restating their claims by hand (ADR-0121: the stories
// are the claims; ADR-0141: composing them here, in Vitest/jsdom, not just
// in Chromium via check:stories). Primary's own `play` (see that file) does
// the click + assertion; composeStories(...).Primary.run() renders the
// story exactly like Storybook does — decorators, parameters and globals
// included, via src/test-setup-stories.ts's setProjectAnnotations call —
// then executes that play. A story composed WITHOUT that setup would
// silently test a different component than the one Storybook renders.
const { Primary } = composeStories(stories);

describe('AtlButton', () => {
  it('renders with its accessible name and fires its click handler when clicked', async () => {
    await Primary.run();
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
  });
});
