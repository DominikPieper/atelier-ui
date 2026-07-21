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
      pattern: 'Wiring tabs as top-level site navigation across distinct pages.',
      useInstead: 'A real nav with `<a>` links and URLs — tabs swap panels in place, navigation changes location.',
    },
    {
      pattern: 'Hiding optional, rarely-read content behind a tab to reduce page length.',
      useInstead: 'AtlAccordion — accordions are the right primitive for collapsing supplementary sections.',
    },
    {
      pattern: 'Presenting a linear, ordered workflow as tabs.',
      useInstead: 'AtlStepper — steppers communicate progress and ordering, tabs do not.',
    },
  ],
  relatedComponents: ['AtlAccordionGroupSpec', 'AtlStepperSpec'],
  variantMatrix: [
    { variant: 'default' },
    { variant: 'pills' },
  ],
  accessibility: {
    role: 'tablist',
    keyboardBehavior:
      'Left/Right arrows move between tabs (Up/Down in vertical orientation), Home and End jump to the first and last tab. Tab moves focus into the active panel. Enter and Space activate the focused tab when activation is not automatic.',
  },
};
