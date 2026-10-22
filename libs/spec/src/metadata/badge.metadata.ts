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
      useInstead:
        'AtlAlert — alerts carry a role and live region, badges do not.',
    },
    {
      pattern: 'Holding a removable user-entered chip (filter, recipient).',
      useInstead:
        'There is no chip component; build one from AtlButton: one small outline button (variant outline, size sm) holding the label and an aria-hidden × glyph, with an aria-label that names what it removes (e.g. "Remove filter: <label>") and a click handler that removes the item. Wrap a group of them in a container with an accessible label (role="group" plus aria-label).',
    },
  ],
  relatedComponents: ['AtlAlertSpec', 'AtlAvatarSpec', 'AtlButtonSpec'],
  variantMatrix: [
    { variant: 'default', size: 'sm' },
    { variant: 'default', size: 'md' },
    { variant: 'success', size: 'md' },
    { variant: 'warning', size: 'md' },
    { variant: 'danger', size: 'md' },
    { variant: 'info', size: 'md' },
  ],
  accessibility: {
    role: 'none',
    notes: [
      'Decorative by default: no role is rendered. When the badge announces a change, pass role="status" on the element yourself.',
    ],
    keyboardBehavior:
      'Non-interactive. Not focusable and ignores all keyboard input — the surrounding context (row, button, nav item) handles focus.',
  },
};
