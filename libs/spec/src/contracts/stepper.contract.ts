import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlStepper',
  figmaNodeId: '421:505',
  axisMap: [
    {
      figmaAxis: 'state',
      codeProp: 'AtlStep.completed',
      values: { completed: true },
      reason:
        'Master description: "Variant `state`: default | completed | error | optional → maps to AtlStepSpec flags (completed/error/optional)" — the flag lives on the child AtlStep, not on AtlStepper itself. \'default\' is the interaction/rest value (ADR-0114) and needs no mapping.',
    },
    {
      figmaAxis: 'state',
      codeProp: 'AtlStep.error',
      values: { error: true },
      reason:
        'Same master description as the completed mapping above — the error flag also lives on the child AtlStep.',
    },
    {
      figmaAxis: 'state',
      codeProp: 'AtlStep.optional',
      values: { optional: true },
      reason:
        'Same master description as the completed mapping above — the optional flag also lives on the child AtlStep.',
    },
  ],
} satisfies ComponentContract;
