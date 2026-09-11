import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlChatSuggestion',
  figmaNodeId: '911:1116',
  codeOnly: [
    {
      name: 'id',
      reason:
        'Is data, not state — a stable key for the suggestion chip, not a Figma-settable property.',
    },
  ],
} satisfies ComponentContract;
