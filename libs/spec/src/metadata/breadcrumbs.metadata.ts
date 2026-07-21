import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlBreadcrumbsSpec', 'AtlBreadcrumbItemSpec'],
  purpose:
    'Hierarchical location trail. Renders the path from a root section down to the current page so users can see and jump back through the hierarchy.',
  whenToUse: [
    'Surfacing the position of a deep page inside a multi-level information architecture (settings, docs, file trees).',
    'Letting users navigate one or several levels back without relying on the browser back button.',
    'Reinforcing where a detail view sits relative to its parent list.',
  ],
  antiPatterns: [
    {
      pattern: 'Switching between sibling sections of a flat app.',
      useInstead: 'AtlTabs — tabs communicate peer relationships, breadcrumbs communicate depth.',
    },
    {
      pattern: 'Stepping through an ordered flow (wizard, checkout).',
      useInstead: 'A dedicated stepper component — steps imply forward/backward progress, not nested location.',
    },
  ],
  relatedComponents: ['AtlTabsSpec', 'AtlMenuSpec'],
  variantMatrix: [
    { separator: '/', current: false },
    { separator: '/', current: true },
    { separator: '>', current: false },
  ],
  accessibility: {
    role: 'navigation',
    keyboardBehavior:
      'Items are links and reach focus via Tab in source order. Enter activates the focused link. The item with `current` carries `aria-current="page"` and is announced as the active location.',
  },
};
