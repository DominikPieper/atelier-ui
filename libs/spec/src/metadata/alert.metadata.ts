import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlAlertSpec'],
  purpose:
    'Inline contextual message. Renders a block carrying status content (info, success, warning, danger) with an optional dismiss control.',
  whenToUse: [
    'Surfacing a result after a form submit (saved, failed, partial success) above or below the form.',
    'Warning the user about a consequence of a destructive action before they confirm.',
    'Communicating a system-level notice that should stay visible until acknowledged (`dismissible: true`).',
    'Highlighting a tip or note inside documentation or a settings panel.',
  ],
  antiPatterns: [
    {
      pattern: 'Tagging an item with a short status word next to other content.',
      useInstead: 'AtlBadge — badges are inline labels, alerts are block-level messages with a role.',
    },
    {
      pattern: 'Showing a transient confirmation that disappears on its own.',
      useInstead: 'A toast/snackbar component — alerts stay in the layout until dismissed or unmounted.',
    },
    {
      pattern: 'Blocking the page to demand a decision.',
      useInstead: 'AtlDialog — modal dialogs interrupt; alerts coexist with the surrounding content.',
    },
  ],
  relatedComponents: ['AtlBadgeSpec', 'AtlDialogSpec'],
  variantMatrix: [
    { variant: 'info', dismissible: false },
    { variant: 'success', dismissible: false },
    { variant: 'warning', dismissible: false },
    { variant: 'danger', dismissible: false },
    { variant: 'info', dismissible: true },
    { variant: 'danger', dismissible: true },
  ],
  accessibility: {
    role: 'alert',
    keyboardBehavior:
      'The alert body is non-interactive and not focusable. When `dismissible: true`, the close button is reachable via Tab and activates on Enter or Space, moving focus back to the document after dismissal.',
  },
};
