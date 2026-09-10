import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlButton',
  figmaNodeId: '129:20',
  codeOnly: [
    {
      name: 'type',
      reason:
        "Native HTML button 'type' passthrough ('button'|'submit'|'reset') — a form-semantics attribute the button element always carries, not a Figma-drawn visual axis.",
    },
  ],
  figmaOnly: [
    {
      name: 'hasIcon',
      reason:
        "Master description (2026-08-27, ADR-0058): a Figma-side slot toggle for placing an Icon instance (Instance Swap → Icon library), a legitimate authoring affordance but not part of the component contract — AtlButtonSpec has no hasIcon.",
    },
  ],
} satisfies ComponentContract;
