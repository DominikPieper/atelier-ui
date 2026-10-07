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
      useInstead:
        'AtlSelect or AtlCombobox — those carry the right form-control semantics and value state.',
    },
    {
      pattern: 'Hosting site-level navigation links.',
      useInstead:
        'A real nav with `<a>` links — menus are for actions, navigation is for changing location.',
    },
    {
      pattern: 'Anchoring a persistent side panel of filters or controls.',
      useInstead:
        'AtlDrawer — drawers stay open and anchor to a screen edge; menus are transient.',
    },
  ],
  relatedComponents: ['AtlButtonSpec', 'AtlSelectSpec', 'AtlDrawerSpec'],
  variantMatrix: [{ variant: 'default' }, { variant: 'compact' }],
  accessibility: {
    role: 'menu',
    relatedRoles: ['menuitem'],
    keyboard: [
      {
        key: 'Enter / Space / Arrow Down',
        action: 'Open the menu from the trigger and focus the first item.',
      },
      {
        key: 'Arrow Up / Down',
        action: 'Move between items, wrapping at the ends.',
      },
      { key: 'Home / End', action: 'Jump to the first / last item.' },
      {
        key: 'Enter / Space',
        action: 'Activate the focused item and close the menu.',
      },
      { key: 'Escape', action: 'Close and return focus to the trigger.' },
      { key: 'Tab', action: 'Close the menu and move focus on.' },
      { key: 'Arrow Right', action: 'Open a submenu (if present).' },
      {
        key: 'Arrow Left',
        action: 'Close the current submenu and return to parent.',
      },
    ],
    notes: [
      'The trigger carries aria-haspopup="menu" and aria-expanded.',
      'Separators render as role="separator" and are skipped by keyboard navigation.',
    ],
  },
};
