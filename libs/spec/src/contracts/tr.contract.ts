import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlTr',
  figmaNodeId: '911:1533',
  codeOnly: [
    {
      name: 'rowId',
      reason: 'Is data, not state — a per-row identifier, not a Figma-settable property.',
    },
  ],
} satisfies ComponentContract;
