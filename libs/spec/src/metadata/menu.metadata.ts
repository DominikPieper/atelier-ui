import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlMenuSpec', 'AtlMenuItemSpec'],
  purpose:
    'Floating list of actions attached to a trigger. Renders a temporary surface of menu items the user opens, navigates with the keyboard, and dismisses after picking one.',
  whenToUse: [
    'Grouping secondary or contextual row actions (edit, duplicate, archive, delete) behind a single trigger.',
    'Offering an account or user menu attached to an avatar in the header.',
    'Surfacing an overflow set of toolbar actions that do not fit inline.',
    'Showing a right-click or long-press context menu scoped to a specific element.',
  ],
  antiPatterns: [
    {
      pattern: 'Letting the user pick a value to fill a form field.',
      useInstead: 'AtlSelect or AtlCombobox — those carry the right form-control semantics and value state.',
    },
    {
      pattern: 'Hosting site-level navigation links.',
      useInstead: 'A real nav with `<a>` links — menus are for actions, navigation is for changing location.',
    },
    {
      pattern: 'Anchoring a persistent side panel of filters or controls.',
      useInstead: 'AtlDrawer — drawers stay open and anchor to a screen edge; menus are transient.',
    },
  ],
  relatedComponents: ['AtlButtonSpec', 'AtlSelectSpec', 'AtlDrawerSpec'],
  variantMatrix: [
    { variant: 'default' },
    { variant: 'compact' },
  ],
  accessibility: {
    role: 'menu',
    keyboardBehavior:
      'Up/Down arrows move between items, Home and End jump to the first and last item. Enter and Space activate the focused item. Escape closes the menu and returns focus to the trigger; Tab also closes and moves on. Disabled items are skipped by arrow navigation.',
  },
};
