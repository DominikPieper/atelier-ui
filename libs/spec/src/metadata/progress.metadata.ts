import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['LlmProgressSpec'],
  purpose:
    'Determinate or indeterminate progress bar. Renders the share of work completed for a task whose duration is measurable, or an indeterminate animation when it is not.',
  whenToUse: [
    'Reporting upload, download, or file-processing progress where bytes or items completed are known.',
    'Showing form completion across multiple steps as a percentage.',
    'Indicating an in-flight background operation with `indeterminate` when the total is unknown.',
    'Visualising quota or capacity usage against a maximum.',
  ],
  antiPatterns: [
    {
      pattern: 'Reserving the layout slot for content that has not loaded yet.',
      useInstead: 'LlmSkeleton — sized to the missing content, not a generic bar.',
    },
    {
      pattern: 'Acknowledging a momentary action (saved, copied).',
      useInstead: 'LlmToast — transient confirmation belongs in a live region, not a progress bar.',
    },
  ],
  relatedComponents: ['LlmSkeletonSpec', 'LlmToastSpec'],
  variantMatrix: [
    { variant: 'default', size: 'sm' },
    { variant: 'default', size: 'md' },
    { variant: 'default', size: 'lg' },
    { variant: 'success', size: 'md' },
    { variant: 'warning', size: 'md' },
    { variant: 'danger', size: 'md' },
    { variant: 'default', size: 'md', indeterminate: true },
  ],
  accessibility: {
    role: 'progressbar',
    keyboardBehavior: 'Not focusable; no key handling.',
  },
};
