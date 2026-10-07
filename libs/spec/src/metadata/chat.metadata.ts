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
      useInstead:
        'AtlDialog — short-lived, focused, with explicit confirm/cancel actions.',
    },
    {
      pattern: 'Showing transient system notifications.',
      useInstead:
        'AtlToast — notifications are unidirectional and ephemeral, chat is a two-way log.',
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
    keyboard: [
      {
        key: 'Escape',
        action: 'Close drawer or popup variant. Inline variant ignores Escape.',
      },
      {
        key: 'Tab / Shift+Tab',
        action:
          'Cycle focus inside the drawer (focus is trapped via CDK A11y / focus-trap equivalents).',
      },
      { key: 'Enter (in input)', action: 'Send the message.' },
      {
        key: 'Shift+Enter (in input)',
        action: 'Insert a newline without sending.',
      },
    ],
    notes: [
      'The chat surface is a dialog in the drawer and popup variants and a region when inline; the message list inside it is the role="log" live region.',
      'Drawer uses native <dialog> with aria-modal — same accessibility model as AtlDialog and AtlDrawer.',
      'AtlChatMessages renders role="log" (named, aria-label="Conversation") with aria-live="polite" — the live region that announces new messages as they arrive without interrupting whatever the user is doing (polite, not assertive — an ordinary chat message is not an interruption-worthy event). log and list are two different roles, so the projected AtlChatMessage listitems get their required list parent from a second, nested role="list" wrapper rather than from the log itself — a display:contents element that keeps the message layout unchanged.',
      'Streaming state announces via aria-live="polite" on the typing indicator so screen readers know the assistant is responding.',
      'Stop button uses AtlButton variant="danger" so the destructive intent is communicated by both color and label.',
      'Inline variant has no overlay chrome — the close button is hidden because there is nothing to close.',
    ],
  },
};
