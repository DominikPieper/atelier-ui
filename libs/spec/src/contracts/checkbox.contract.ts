import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlCheckbox',
  figmaNodeId: '55:36',
  axisMap: [
    {
      figmaAxis: 'selection',
      codeProp: 'checked',
      values: { unchecked: false, checked: true, indeterminate: false },
      reason:
        'Figma draws three mutually exclusive selection states on one axis (2026-04-27 restructure); code represents them as two orthogonal booleans, checked and indeterminate.',
    },
    {
      figmaAxis: 'selection',
      codeProp: 'indeterminate',
      values: { unchecked: false, checked: false, indeterminate: true },
      reason:
        'Same axis as the checked mapping above — the other half of the checked/indeterminate pair.',
    },
  ],
  probes: [
    {
      part: 'box',
      selector: "input[type='checkbox']",
      reason:
        'the .atl-checkbox root only sets typography and line-height for the row it wraps — the ' +
        "box's border/background/radius are painted on the native input[type='checkbox'] " +
        "(a bare-element rule in all three frameworks' CSS, unprefixed even in React/Vue, so one " +
        "relative selector resolves under every framework's component root).",
    },
  ],
} satisfies ComponentContract;
