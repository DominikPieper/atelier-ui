import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlBreadcrumbItem',
  figmaNodeId: '911:1069',
  codeOnly: [
    {
      name: 'href',
      reason:
        'Not visual: it swaps the element from <span> to <a> and changes nothing drawn.',
    },
  ],
} satisfies ComponentContract;
