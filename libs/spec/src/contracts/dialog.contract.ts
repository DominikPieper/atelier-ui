import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlDialog',
  figmaNodeId: '55:94',
  codeOnly: [
    {
      name: 'open',
      reason:
        'Not modelled as a Boolean (ADR-0056): false renders nothing. The dialog is a native <dialog> driven by showModal()/close(), so a closed one is not on the screen at all — unlike AtlChat, whose popup variant keeps a visible bubble when closed.',
    },
    {
      name: 'closeOnBackdrop',
      reason:
        'Not modelled as a Boolean (ADR-0056): behaviour only. It decides whether a click outside dismisses the dialog; no CSS rule and no rendered element reference it.',
    },
  ],
} satisfies ComponentContract;
