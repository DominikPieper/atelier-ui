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
      {
        key: 'Arrow Up (on the trigger)',
        action: 'Open the menu and focus the last item.',
      },
      {
        key: 'Type a character',
        action:
          'Type-ahead: focus the next item whose label starts with the typed text.',
      },
      { key: 'Home / End', action: 'Jump to the first / last item.' },
      {
        key: 'Enter / Space',
        action:
          'Activate the focused item and close the menu (a disabled item does nothing).',
      },
      { key: 'Escape', action: 'Close and return focus to the trigger.' },
      { key: 'Tab', action: 'Close the menu and move focus on.' },
      { key: 'Arrow Right', action: 'Open a submenu (Angular only).' },
      {
        key: 'Arrow Left',
        action:
          'Close the current submenu and return to parent (Angular only).',
      },
    ],
    notes: [
      'Submenus are Angular only: React and Vue have no nesting API, so Arrow Right and Arrow Left do nothing there.',
      'Disabled items carry aria-disabled="true" (not the native disabled attribute) in all three frameworks. They stay in the arrow-key, Home, End and type-ahead rotation and are announced as disabled, but Enter, Space and click do not activate them and the menu stays open.',
      'Focus is roving: the focused item is the only tab stop (tabindex 0, others -1). Opening, by key or by click, moves focus to an item.',
      'The trigger carries aria-haspopup="menu" and aria-expanded.',
      'Separators render as role="separator" and are skipped by keyboard navigation.',
    ],
  },
};
