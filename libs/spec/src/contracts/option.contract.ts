import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlOption',
  figmaNodeId: '911:1086',
  codeOnly: [
    {
      name: 'optionValue',
      reason:
        "Is data, not state — the option's value carried at render time, not a Figma-settable property.",
    },
  ],
} satisfies ComponentContract;
