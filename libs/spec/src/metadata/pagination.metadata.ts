import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlPaginationSpec'],
  purpose:
    'Page navigator. Renders numbered page buttons plus previous/next (and optional first/last) controls for a paged list or table.',
  whenToUse: [
    'Splitting a long list or table into fixed-size pages where the total count is known.',
    'Letting users jump directly to a specific page rather than scrolling.',
    'Surfacing position within a result set (current page out of total).',
  ],
  antiPatterns: [
    {
      pattern: 'Loading more rows continuously as the user scrolls.',
      useInstead: 'An infinite-scroll pattern with a sentinel — pagination implies discrete, addressable pages.',
    },
    {
      pattern: 'Stepping through a fixed multi-step flow.',
      useInstead: 'A stepper — steps represent ordered stages, not interchangeable pages of data.',
    },
  ],
  relatedComponents: ['AtlTableSpec', 'AtlButtonSpec'],
  variantMatrix: [
    { page: 1, pageCount: 10, showFirstLast: false },
    { page: 5, pageCount: 10, showFirstLast: false },
    { page: 5, pageCount: 10, showFirstLast: true },
    { page: 10, pageCount: 10, showFirstLast: true, siblingCount: 2 },
  ],
  accessibility: {
    role: 'navigation',
    keyboardBehavior:
      'Page controls are buttons reached via Tab in source order. Enter or Space activates the focused control. The current page is marked with `aria-current="page"` and the disabled prev/next buttons drop out of the tab order at the boundaries.',
  },
};
