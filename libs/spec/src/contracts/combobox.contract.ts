import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlCombobox',
  figmaNodeId: '421:339',
  figmaOnly: [
    {
      name: 'state=open',
      reason:
        "atl-combobox.tsx tracks `isOpen` as internal component state (useState), not a settable/observable prop — the .atl-combobox.is-open CSS class is real (atl-combobox.css:96,132), but it is driven by user interaction, not the public API this stage checks.",
    },
    {
      name: 'state=filtered',
      reason: 'UNEXPLAINED — grep-verified 2026-09-10: no root-level .is-filtered class or distinguishable state exists in atl-combobox.css; decide in tasks/todo.md',
    },
    {
      name: 'state=selected',
      reason:
        'UNEXPLAINED — grep-verified 2026-09-10: atl-combobox.css only has a PER-OPTION .atl-combobox-option.is-selected rule, not a root-level combobox state; decide in tasks/todo.md',
    },
  ],
  axisMap: [
    {
      figmaAxis: 'state',
      codeProp: 'invalid',
      values: { invalid: true },
      reason: "AtlFormFieldSpec.invalid is a real boolean prop (libs/spec/src/index.ts) — the master's 'invalid' state value maps to it directly.",
    },
  ],
} satisfies ComponentContract;
