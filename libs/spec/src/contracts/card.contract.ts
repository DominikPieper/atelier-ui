import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlCard',
  figmaNodeId: '55:65',
  codeOnly: [
    {
      name: 'role',
      reason:
        'Code-only landmark role (article | region | section) — deliberately not a Figma variant axis: adding a landmark to every card would pollute the page outline. The master\'s own description marks it "code-only: role" (allowlists.js FIGMA_CONFORMANCE_EXCEPTIONS, AtlCard:name:role).',
    },
  ],
} satisfies ComponentContract;
