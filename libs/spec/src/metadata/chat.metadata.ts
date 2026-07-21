import type { ComponentMetadata } from './types';

export const metadata: ComponentMetadata = {
  specNames: ['AtlChatSpec'],
  purpose:
    'AI chat surface. Renders a conversation log with a composer for sending messages and a live status for streaming or errored replies.',
  whenToUse: [
    'Embedding an assistant alongside the current page as a side drawer that does not displace the workspace.',
    'Offering a focused, modal-like popup chat anchored to a launcher button.',
    'Composing a chat inline inside a larger layout (a docs page, a settings panel).',
    'Reflecting in-flight assistant work via `status="streaming"` and surfacing failures via `status="error"`.',
  ],
  antiPatterns: [
    {
      pattern: 'Confirming or asking the user for a single decision.',
      useInstead: 'AtlDialog — short-lived, focused, with explicit confirm/cancel actions.',
    },
    {
      pattern: 'Showing transient system notifications.',
      useInstead: 'AtlToast — notifications are unidirectional and ephemeral, chat is a two-way log.',
    },
  ],
  relatedComponents: ['AtlDrawerSpec', 'AtlDialogSpec', 'AtlTextareaSpec'],
  variantMatrix: [
    { variant: 'drawer', status: 'idle', open: true },
    { variant: 'drawer', status: 'streaming', open: true },
    { variant: 'drawer', status: 'error', open: true },
    { variant: 'popup', status: 'idle', open: true },
    { variant: 'inline', status: 'idle', open: true },
  ],
  accessibility: {
    role: 'log',
    keyboardBehavior:
      'The message log is a live region — new messages are announced as they stream in. Tab moves focus into the composer; Enter submits and Shift+Enter inserts a newline. In drawer and popup variants, Escape closes the surface and focus returns to the launcher.',
  },
};
