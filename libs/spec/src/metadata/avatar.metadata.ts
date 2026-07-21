import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlAvatarSpec', 'AtlAvatarGroupSpec'],
  purpose:
    'Identity marker for a person or entity. Renders a circular or square image, falling back to initials or a placeholder when no image is available; AvatarGroup stacks several with an overflow counter.',
  whenToUse: [
    'Showing the author of a message, comment, or activity entry in a list.',
    'Identifying the signed-in user in a header or account menu.',
    'Stacking participants of a thread, room, or shared document via AvatarGroup with a +N overflow.',
    'Surfacing a presence indicator next to a name in a roster or sidebar.',
  ],
  antiPatterns: [
    {
      pattern: 'Displaying a decorative product image or thumbnail.',
      useInstead: 'A plain `<img>` or a media component — avatars carry identity semantics and initial fallbacks.',
    },
    {
      pattern: 'Communicating standalone status without an identity (system online, build healthy).',
      useInstead: 'AtlBadge — badges are the right primitive for status pills that do not belong to a person.',
    },
  ],
  relatedComponents: ['AtlBadgeSpec', 'AtlMenuSpec'],
  variantMatrix: [
    { size: 'xs', shape: 'circle' },
    { size: 'sm', shape: 'circle' },
    { size: 'md', shape: 'circle', status: 'online' },
    { size: 'md', shape: 'square', status: 'offline' },
    { size: 'lg', shape: 'circle', status: 'away' },
    { size: 'xl', shape: 'circle', status: 'busy' },
    { size: 'md', shape: 'circle', status: '' },
  ],
  accessibility: {
    role: 'img',
    keyboardBehavior:
      'Non-interactive on its own. Not focusable; the surrounding context (link, button, menu trigger) owns focus and keyboard activation when the avatar is part of an interactive element.',
  },
};
