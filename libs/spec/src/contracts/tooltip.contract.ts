import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlTooltip',
  figmaNodeId: '55:52',
  codeOnly: [
    {
      name: 'atlTooltipDisabled',
      reason:
        'Not modelled as a Boolean (ADR-0056): renders nothing. atl-tooltip.tsx early-returns on it, so there is no disabled tooltip to draw — only the absence of one.',
    },
  ],
  axisMap: [
    {
      figmaAxis: 'position',
      codeProp: 'atlTooltipPosition',
      values: { above: 'above', below: 'below', left: 'left', right: 'right' },
      reason:
        "The axis is named after the spec union AtlTooltipPosition, the way every other master derives its axis name from its union — not after the Angular directive-input field name. A prior rename to 'atlTooltipPosition' was corrected back to 'position' (ADR-0056); the code prop itself stays atlTooltipPosition.",
    },
  ],
} satisfies ComponentContract;
