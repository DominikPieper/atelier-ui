import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlTbody',
  figmaNodeId: '911:1546',
  codeOnly: [
    {
      name: 'colSpan',
      reason: "Is data, not state — sets the empty-state placeholder cell's colspan, not a Figma-settable property.",
    },
  ],
} satisfies ComponentContract;
