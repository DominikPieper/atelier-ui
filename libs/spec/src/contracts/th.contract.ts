import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlTh',
  figmaNodeId: '911:1503',
  codeOnly: [
    {
      name: 'align',
      reason:
        "AtlTableAlign changes only text-align, and an axis for it would multiply this master's matrix by three for one property. It is modelled on AtlTd instead, where it is the cell's only state.",
    },
    {
      name: 'width',
      reason:
        'Is content, not state — a per-column width hint, not a Figma-settable property.',
    },
  ],
  axisMap: [
    {
      figmaAxis: 'sortDirection',
      codeProp: 'sortDirection',
      values: { none: null, asc: 'asc', desc: 'desc' },
      reason:
        "Same prop name, but the axis value 'none' stands for the code union's null (AtlSortDirection = 'asc' | 'desc' | null) — a Figma variant value cannot literally be null, and \"unsorted\" is what null means; 'asc'/'desc' map through unchanged.",
    },
  ],
} satisfies ComponentContract;
