import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlSelect',
  figmaNodeId: '55:92',
  figmaOnly: [
    {
      name: 'state=filled',
      reason: 'UNEXPLAINED — grep-verified 2026-09-10: no CSS rule or component logic implements an .is-filled/:placeholder-shown visual state; decide in tasks/todo.md',
    },
    {
      name: 'state=open',
      reason:
        'UNEXPLAINED — grep-verified 2026-09-10: AtlSelect renders a native <select>, whose open popover is browser-drawn; no .is-open class or open-state logic exists in atl-select.tsx/.css. Decide in tasks/todo.md whether the CDK-overlay Angular adapter needs its own axis note (see ADR-0007/A11Y_PARITY_EXEMPT for the same native-vs-CDK split).',
    },
  ],
} satisfies ComponentContract;
