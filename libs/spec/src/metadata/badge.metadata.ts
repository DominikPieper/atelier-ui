import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlBadgeSpec'],
  purpose:
    'Compact inline label. Renders a small pill carrying a status word, count, or category alongside other content.',
  whenToUse: [
    'Marking the status of a row or card (active, pending, error) next to its title.',
    'Showing a numeric count attached to a navigation item (unread, queued, total).',
    'Tagging a list entry with a short category or version label.',
    'Annotating a heading or button with a "new" / "beta" marker.',
  ],
  antiPatterns: [
    {
      pattern: 'Surfacing a dismissable system-level message.',
      useInstead: 'AtlAlert — alerts carry a role and live region, badges do not.',
    },
    {
      pattern: 'Holding a removable user-entered chip (filter, recipient).',
      useInstead: 'A dedicated chip/tag component with its own remove affordance; badges are display-only.',
    },
  ],
  relatedComponents: ['AtlAlertSpec', 'AtlAvatarSpec'],
  variantMatrix: [
    { variant: 'default', size: 'sm' },
    { variant: 'default', size: 'md' },
    { variant: 'success', size: 'md' },
    { variant: 'warning', size: 'md' },
    { variant: 'danger', size: 'md' },
    { variant: 'info', size: 'md' },
  ],
  accessibility: {
    role: 'status',
    keyboardBehavior:
      'Non-interactive. Not focusable and ignores all keyboard input — the surrounding context (row, button, nav item) handles focus.',
  },
};
