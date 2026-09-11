import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlToggle',
  figmaNodeId: '55:41',
  codeOnly: [
    {
      name: 'required',
      reason:
        'Not modelled (ADR-0058): required renders nothing in any Atelier form field. It is passed to the DOM as the HTML attribute and stops there.',
    },
  ],
  axisMap: [
    {
      figmaAxis: 'selection',
      codeProp: 'checked',
      values: { checked: true, unchecked: false },
      reason:
        "The master's own axis values are 'checked'/'unchecked' (tools/figma/snapshot.json), which is checked: boolean in code — this schema's own worked example.",
    },
  ],
  probes: [
    {
      part: 'track',
      selector: '.track',
      reason:
        'the .atl-toggle root only sets typography and line-height for the row it wraps — the ' +
        "pill's border/background is painted on the child .track element (unprefixed in all " +
        "three frameworks' CSS, so one relative selector resolves under every framework's " +
        "component root); the native input[type='checkbox'] itself is visually hidden " +
        '(clip-rect), so it is not a usable probe here the way it is for AtlCheckbox.',
    },
  ],
} satisfies ComponentContract;
