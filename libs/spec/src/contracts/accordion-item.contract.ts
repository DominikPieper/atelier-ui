import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlAccordionItem',
  figmaNodeId: '911:1103',
  codeOnly: [
    {
      name: 'headingLevel',
      reason: "Not visual: it chooses h2..h6 for the trigger's wrapper and changes nothing drawn.",
    },
  ],
} satisfies ComponentContract;
