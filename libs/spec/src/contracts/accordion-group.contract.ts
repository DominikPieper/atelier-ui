import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlAccordionGroup',
  figmaNodeId: '55:127',
  codeOnly: [
    {
      name: 'multi',
      reason:
        'Not modelled as a Boolean (ADR-0056): behaviour only. It guards how many items MAY be open; a group showing two open items looks the same whether multi allowed it or the user opened them one at a time. No CSS rule and no render condition reference it.',
    },
  ],
} satisfies ComponentContract;
