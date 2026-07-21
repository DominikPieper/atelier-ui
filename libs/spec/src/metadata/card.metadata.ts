import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlCardSpec'],
  purpose:
    'Container that groups related content into a single visual block. Renders a padded surface with optional elevation or border; does not add a landmark role unless explicitly opted in.',
  whenToUse: [
    'Wrapping a self-contained piece of content (a post, a stat, a settings panel) so it reads as one unit.',
    'Building a grid or list of comparable items — products, plans, dashboard tiles.',
    'Separating a form section or summary panel from surrounding page chrome.',
    'Highlighting a feature, callout, or empty-state block within a larger view.',
  ],
  antiPatterns: [
    {
      pattern: 'Showing a dismissable system message inside a card.',
      useInstead: 'AtlAlert — alerts carry the right role and live-region semantics for transient messages.',
    },
    {
      pattern: 'Using a card as a modal container layered over the page.',
      useInstead: 'AtlDialog — dialogs handle focus trapping, scrim, and dismiss behaviour.',
    },
    {
      pattern: 'Adding `role="article"` to every card by default to look more semantic.',
      useInstead: 'Leave `role` unset for visual grouping; only set it when the card is a real landmark in the page outline.',
    },
  ],
  relatedComponents: ['AtlDialogSpec', 'AtlAlertSpec'],
  variantMatrix: [
    { variant: 'elevated', padding: 'none' },
    { variant: 'elevated', padding: 'sm' },
    { variant: 'elevated', padding: 'md' },
    { variant: 'elevated', padding: 'lg' },
    { variant: 'outlined', padding: 'md' },
    { variant: 'flat', padding: 'md' },
    { variant: 'outlined', padding: 'md', role: 'article' },
    { variant: 'outlined', padding: 'md', role: 'region' },
    { variant: 'outlined', padding: 'md', role: 'section' },
  ],
  accessibility: {
    role: 'none',
    keyboardBehavior:
      'Non-interactive by default. Not focusable; any interactive children (buttons, links) handle their own focus and activation. When `role` is set to `region` pair with `aria-label` or `aria-labelledby` so screen readers announce the landmark.',
  },
};
