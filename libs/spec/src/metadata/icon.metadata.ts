import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlIconSpec'],
  purpose:
    'Inline SVG glyph. Renders one icon from the library catalog at a fixed size, with an optional accessible label.',
  whenToUse: [
    'Reinforcing the meaning of a button or menu item with a recognisable glyph.',
    'Carrying status meaning inside a badge, alert, or toast (success, warning, danger, info).',
    'Indicating direction or affordance (chevrons for disclosure, arrows for navigation, sort markers in headers).',
    'Standing alone as a meaningful symbol — in which case `label` is required so assistive tech can announce it.',
  ],
  antiPatterns: [
    {
      pattern: 'Rendering a user avatar or product image.',
      useInstead: 'AtlAvatar or a plain `<img>` — icons are abstract glyphs, not raster content.',
    },
    {
      pattern: 'Conveying status without an adjacent label and without setting `label`.',
      useInstead: 'Pair the icon with visible text or pass `label` — decorative icons are hidden from screen readers.',
    },
  ],
  relatedComponents: ['AtlButtonSpec', 'AtlBadgeSpec', 'AtlAlertSpec'],
  // The `name` prop is a content choice (which glyph to show), not a
  // design-system axis — every icon ships in every size. Cover only `size`
  // here so the variant-coverage gate does not demand a row per icon name.
  variantMatrix: [
    { size: 'sm' },
    { size: 'md' },
    { size: 'lg' },
  ],
  accessibility: {
    role: 'img',
    keyboardBehavior: 'Not focusable; no key handling.',
  },
};
