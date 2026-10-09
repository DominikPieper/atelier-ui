import type { ComponentContract } from './types';

export const contract = {
  component: 'NButton',
  figmaNodeId: '10:1',
  figmaOnly: [
    { name: 'Symbol', reason: 'Icon slot is not modelled in code yet.' },
    { name: 'state=laden', reason: 'Loading is drawn but not built yet.' },
  ],
  codeOnly: [
    { name: 'tone', reason: 'Colour family is a code concern, not drawn.' },
  ],
  axisMap: [
    {
      figmaAxis: 'Variante',
      codeProp: 'variant',
      values: { primär: 'primary', sekundär: 'secondary' },
      reason: 'German Figma names, English code names.',
    },
    {
      figmaAxis: 'Größe',
      codeProp: 'size',
      values: { klein: 'sm', mittel: 'md' },
      reason: 'German Figma names, English code names.',
    },
    {
      figmaAxis: 'Ausgewählt',
      codeProp: 'selected',
      reason:
        'German Figma axis for a boolean code prop; values are true/false.',
    },
    {
      figmaAxis: 'Deaktiviert',
      codeProp: 'disabled',
      reason: 'German Figma name for the disabled Boolean.',
    },
  ],
} satisfies ComponentContract;
