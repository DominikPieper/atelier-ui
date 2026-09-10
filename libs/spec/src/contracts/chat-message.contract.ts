import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlChatMessage',
  figmaNodeId: '911:1112',
  codeOnly: [
    {
      name: 'id',
      reason: 'Is data, not state — a stable key for the message list, not a Figma-settable property.',
    },
  ],
} satisfies ComponentContract;
