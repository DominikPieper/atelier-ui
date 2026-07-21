import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlTableSpec', 'AtlTbodySpec', 'AtlTrSpec', 'AtlThSpec', 'AtlTdSpec'],
  purpose:
    'Tabular data grid. Renders rows of records with column headers, optional sorting, sticky headers, and per-cell alignment.',
  whenToUse: [
    'Displaying a list of records where each record has the same set of comparable fields.',
    'Surfacing data users need to scan across rows or columns (totals, status, timestamps).',
    'Wrapping a sortable column set where header clicks reorder rows.',
    'Showing data dense enough to benefit from a sticky header while scrolling.',
  ],
  antiPatterns: [
    {
      pattern: 'Laying out two-dimensional UI that is not actually tabular data (cards in a grid).',
      useInstead: 'A CSS grid layout — `<table>` semantics confuse assistive tech when there is no row/column meaning.',
    },
    {
      pattern: 'Rendering a single record with field/value pairs.',
      useInstead: 'A description list or a labelled key/value layout — tables imply multiple comparable rows.',
    },
    {
      pattern: 'Picking one option from a list.',
      useInstead: 'AtlSelect, AtlCombobox, or AtlRadioGroup depending on cardinality.',
    },
  ],
  relatedComponents: ['AtlPaginationSpec', 'AtlCheckboxSpec', 'AtlBadgeSpec'],
  variantMatrix: [
    { variant: 'default', size: 'sm' },
    { variant: 'default', size: 'md' },
    { variant: 'default', size: 'lg' },
    { variant: 'striped', size: 'md' },
    { variant: 'bordered', size: 'md' },
  ],
  accessibility: {
    role: 'table',
    keyboardBehavior:
      'The scrollable wrapper is focusable (tabindex=0) so users can pan horizontally with arrow keys. Sortable headers are buttons reached via Tab; Enter or Space toggles the sort direction and updates `aria-sort` on the header.',
  },
};
