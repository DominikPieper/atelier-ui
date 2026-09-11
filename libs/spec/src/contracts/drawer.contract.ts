import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlDrawer',
  figmaNodeId: '421:398',
  codeOnly: [
    {
      name: 'open',
      reason:
        'Not modelled as a Boolean (ADR-0056): false renders nothing — the same native <dialog> mechanism as AtlDialog.',
    },
    {
      name: 'closeOnBackdrop',
      reason:
        'Not modelled as a Boolean (ADR-0056): behaviour only, as on AtlDialog.',
    },
  ],
} satisfies ComponentContract;
