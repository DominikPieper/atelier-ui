import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['LlmAccordionGroupSpec', 'LlmAccordionItemSpec'],
  purpose:
    'Vertical stack of collapsible sections with labelled triggers. Each item expands and collapses independently or as part of a single-open group, hiding supplementary detail until the user asks for it.',
  whenToUse: [
    'Compressing a long FAQ or help page so the user scans titles first and expands only what is relevant.',
    'Grouping optional or advanced settings beneath labelled sections in a settings or preferences view.',
    'Splitting a long-form document into reviewable sections (terms, policy, changelog) without forcing a scroll.',
    'Collapsing supplementary detail inside a card, drawer, or sidebar where vertical space is tight.',
  ],
  antiPatterns: [
    {
      pattern: 'Switching between sibling views of the same parent context.',
      useInstead: 'LlmTabs — tabs swap one panel at a time and are the right primitive for peer views.',
    },
    {
      pattern: 'Presenting a linear ordered workflow as collapsible sections.',
      useInstead: 'LlmStepper — steppers communicate progress and ordering, accordions do not.',
    },
    {
      pattern: 'Building a tree of nested categories the user can drill into.',
      useInstead: 'A dedicated tree component with `role="tree"` and proper expanded-state semantics.',
    },
  ],
  relatedComponents: ['LlmTabGroupSpec', 'LlmStepperSpec'],
  variantMatrix: [
    { variant: 'default', multi: false },
    { variant: 'default', multi: true },
    { variant: 'bordered', multi: false },
    { variant: 'separated', multi: true },
  ],
  accessibility: {
    role: 'group',
    keyboardBehavior:
      'Each trigger is a real button. Enter and Space toggle the associated panel. Tab moves between triggers in source order; arrow-key navigation is not required by the WAI-ARIA accordion pattern and is intentionally omitted so the group composes with the page tab order.',
  },
};
