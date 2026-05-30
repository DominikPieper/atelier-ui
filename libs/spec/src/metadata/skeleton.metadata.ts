import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['LlmSkeletonSpec'],
  purpose:
    'Loading placeholder. Renders a sized block in the shape of the content that will replace it once data resolves.',
  whenToUse: [
    'Filling the slot where a chunk of fetched data — card body, table row, avatar — will land, so the layout does not jump on arrival.',
    'Standing in for a single line of text while a label or value loads.',
    'Reserving the footprint of an image or media thumbnail during async load.',
  ],
  antiPatterns: [
    {
      pattern: 'Communicating an indeterminate background operation with no associated content slot.',
      useInstead: 'LlmProgress with `indeterminate` — has the right role and announces progress.',
    },
    {
      pattern: 'Holding empty space when there is genuinely nothing to render.',
      useInstead: 'An empty state with explanation; skeletons promise content that is coming.',
    },
  ],
  relatedComponents: ['LlmProgressSpec', 'LlmAvatarSpec'],
  variantMatrix: [
    { variant: 'text', animated: true },
    { variant: 'circular', animated: true },
    { variant: 'rectangular', animated: true },
    { variant: 'rectangular', animated: false },
  ],
  accessibility: {
    role: 'status',
    keyboardBehavior: 'Not focusable; no key handling.',
  },
};
