import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlRadio',
  figmaNodeId: '420:185',
  figmaOnly: [
    {
      name: 'invalid',
      reason:
        "Inherited from the parent AtlRadioGroup's invalid state: atl-radio.tsx computes its class list via ctx.invalid, so the border overlay is real, but AtlRadioSpec itself extends nothing and declares no invalid field (ADR-0058).",
    },
    {
      name: 'selection',
      reason:
        "The parent AtlRadioGroup owns the value: an individual AtlRadio has no checked/selected prop of its own — selection is derived by the group comparing its own value against this radio's radioValue (code-only, per the master's own description). Same ownership split as the invalid Boolean above.",
    },
  ],
} satisfies ComponentContract;
