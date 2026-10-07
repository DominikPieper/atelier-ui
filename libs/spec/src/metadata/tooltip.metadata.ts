import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlTooltipSpec'],
  purpose:
    'Hover- and focus-triggered label that names or briefly explains the element it is attached to. Appears on a delay, disappears when the pointer or focus moves away, and never takes focus itself.',
  whenToUse: [
    'Naming an icon-only button or control so it reads correctly to assistive tech and on hover.',
    'Annotating an abbreviation, truncated label, or terse column header with its full form.',
    'Adding a short keyboard-shortcut hint to a button or menu item.',
    'Explaining why a disabled control is disabled, without committing to a popover.',
  ],
  antiPatterns: [
    {
      pattern:
        'Holding rich content, links, or interactive controls inside the tip.',
      useInstead:
        'A popover or dialog — tooltips are non-interactive label text only.',
    },
    {
      pattern:
        'Communicating critical information that the user must read to complete a task.',
      useInstead:
        'AtlAlert, inline help text, or visible labels — tooltips disappear on blur and are skipped on touch.',
    },
    {
      pattern: 'Acting as the only accessible name for an interactive element.',
      useInstead:
        'A proper `aria-label` or visible label — pair the tooltip with that label rather than relying on it alone.',
    },
  ],
  relatedComponents: ['AtlButtonSpec', 'AtlMenuSpec'],
  variantMatrix: [
    { atlTooltipPosition: 'above' },
    { atlTooltipPosition: 'below' },
    { atlTooltipPosition: 'left' },
    { atlTooltipPosition: 'right' },
  ],
  accessibility: {
    role: 'tooltip',
    keyboard: [
      {
        key: 'Hover',
        action: 'Show the tooltip on mouseenter and hide it on mouseleave.',
      },
      {
        key: 'Tab (focus trigger)',
        action: 'Show the tooltip. It hides when focus leaves.',
      },
      {
        key: 'Escape',
        action: 'Dismiss the tooltip while focus stays on the trigger.',
      },
    ],
    notes: [
      "Uses aria-describedby — the tooltip supplements, never replaces, the trigger's accessible name.",
      'The tooltip is not focusable itself — the host element owns the tab stop.',
      'Tooltips are shown on focus, not only on hover, so keyboard users get the same affordance.',
      'Never put interactive content (links, buttons) inside a tooltip — it cannot be reached by keyboard.',
    ],
  },
};
