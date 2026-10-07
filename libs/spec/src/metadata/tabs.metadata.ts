import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlTabGroupSpec', 'AtlTabSpec'],
  purpose:
    'Switches between sibling views that share the same parent context. Renders a labelled tab strip wired to a single visible panel at a time.',
  whenToUse: [
    'Splitting a settings or profile page into named sections that do not need their own URL.',
    'Toggling between alternate representations of the same data (chart vs table, raw vs formatted).',
    'Organising the contents of a dialog or drawer into a small number of named pages.',
    'Grouping closely related forms or lists where the user typically only looks at one at a time.',
  ],
  antiPatterns: [
    {
      pattern:
        'Wiring tabs as top-level site navigation across distinct pages.',
      useInstead:
        'A real nav with `<a>` links and URLs — tabs swap panels in place, navigation changes location.',
    },
    {
      pattern:
        'Hiding optional, rarely-read content behind a tab to reduce page length.',
      useInstead:
        'AtlAccordion — accordions are the right primitive for collapsing supplementary sections.',
    },
    {
      pattern: 'Presenting a linear, ordered workflow as tabs.',
      useInstead:
        'AtlStepper — steppers communicate progress and ordering, tabs do not.',
    },
  ],
  relatedComponents: ['AtlAccordionGroupSpec', 'AtlStepperSpec'],
  variantMatrix: [{ variant: 'default' }, { variant: 'pills' }],
  accessibility: {
    role: 'tablist',
    relatedRoles: ['tab', 'tabpanel'],
    keyboard: [
      {
        key: 'Tab',
        action:
          'Move focus to the active tab, then into its panel (the panel is focusable).',
      },
      {
        key: 'Arrow Left / Right',
        action:
          'Move to and select the previous / next enabled tab. Focus wraps at the ends.',
      },
      {
        key: 'Home / End',
        action: 'Jump to and select the first / last enabled tab.',
      },
    ],
    notes: [
      'Selection follows focus (automatic activation); there is no manual-activation mode and no vertical orientation.',
      'Tabs use roving tabindex — only the active tab is in the document tab sequence.',
      'Each AtlTab has aria-controls pointing at its panel, and the panel has aria-labelledby pointing back at the tab. Disabled tabs are skipped by arrow navigation.',
    ],
  },
};
