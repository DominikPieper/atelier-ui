import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlInput',
  figmaNodeId: '129:33',
  figmaOnly: [
    {
      name: 'state=filled',
      reason:
        'UNEXPLAINED — grep-verified 2026-09-10: no CSS rule or component logic implements an .is-filled/:placeholder-shown visual state; decide in tasks/todo.md',
    },
  ],
  codeOnly: [
    {
      name: 'type',
      reason:
        'Master\'s own description: "(code-only props on AtlInputSpec: type, placeholder, value, onValueChange, name)".',
    },
  ],
  axisMap: [
    {
      figmaAxis: 'state',
      codeProp: 'invalid',
      values: { invalid: true },
      reason:
        "AtlFormFieldSpec.invalid is a real boolean prop (libs/spec/src/index.ts) — the master's 'invalid' state value maps to it directly.",
    },
  ],
  probes: [
    {
      part: 'control',
      selector: 'input',
      reason:
        'the .atl-input root only sets display/font/line-height — background-color, border and ' +
        "border-radius are painted on the nested <input> ('.atl-input input' in React/Vue's " +
        "atl-input.css; Angular's :host-scoped stylesheet needs no '.atl-input' prefix, so its " +
        "own rule is the bare 'input' selector — the same relative selector resolves in all three " +
        "once queried under each framework's own component root).",
    },
  ],
} satisfies ComponentContract;
