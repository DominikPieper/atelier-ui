import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlTabGroup',
  figmaNodeId: '55:123',
  figmaOnly: [
    {
      name: 'selectedIndex',
      reason:
        "AtlTabGroupSpec.selectedIndex is a number (which tab is active), not an enum — the master's two values (0, 1) demonstrate the first and second tab looking selected, not a closed set of legal indices.",
    },
  ],
} satisfies ComponentContract;
