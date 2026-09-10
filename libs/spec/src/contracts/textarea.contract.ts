import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlTextarea',
  figmaNodeId: '55:87',
  figmaOnly: [
    {
      name: 'state=filled',
      reason: 'UNEXPLAINED — grep-verified 2026-09-10: no CSS rule or component logic implements an .is-filled/:placeholder-shown visual state; decide in tasks/todo.md',
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
