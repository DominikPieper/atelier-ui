import type { ComponentContract } from './types';

export const contract = {
  component: 'AtlAvatar',
  figmaNodeId: '55:151',
  codeOnly: [
    {
      name: 'status',
      reason:
        "AtlAvatarStatus ('online'|'offline'|'away'|'busy'|'') is a real CSS-backed paint axis — check:variants enforces its class across all three adapters (tools/scripts/lib/allowlists.js's VARIANT_AXIS_EXCEPTIONS comment: 'a genuine, CSS-backed paint axis, now enforced') — but the AtlAvatar master (tools/figma/snapshot.json) has no matching status Variant axis yet. Figma-side axis owed, tracked in tasks/todo.md.",
    },
  ],
} satisfies ComponentContract;
