import { screen } from '@testing-library/react';
import { composeStories } from '@storybook/react';
import * as stories from './atl-button.stories';

// Demonstrates portable stories in this monorepo (ADR-0141) — NOT a
// replacement for atl-button.spec.tsx's covers()-tagged behavior suite
// above, which stays the source of this component's behavior-coverage
// claims. This proves the CATALOG renders correctly: the exact args/variant
// matrix Storybook itself renders, via composeStories + the real
// .storybook/preview decorators (wired in through src/test-setup-stories.ts's
// setProjectAnnotations call) — not a second, hand-maintained copy of it
// that can silently drift from what Storybook actually shows.
const { Primary, Disabled, Loading } = composeStories(stories);

describe('AtlButton (composed stories)', () => {
  it('Primary renders with its accessible name', async () => {
    await Primary.run();
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
  });

  it("Disabled composes the story's own disabled arg", async () => {
    await Disabled.run();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it("Loading composes the story's own loading arg", async () => {
    await Loading.run();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
