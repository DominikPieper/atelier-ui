import {
  ChangeEvent,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  ReactNode,
  TextareaHTMLAttributes,
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type {
  AtlChatMessageRole,
  AtlChatStatus,
  AtlChatVariant,
} from '../spec';
import './atl-chat.css';

interface ChatContextValue {
  headerId: string;
  status: AtlChatStatus;
  close: () => void;
  toggle: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  headerId: '',
  status: 'idle',
  close: () => undefined,
  toggle: () => undefined,
});

/**
 * Properties for the AtlChat component.
 */
export interface AtlChatProps {
  /** Layout variant. */
  variant?: AtlChatVariant;
  /** Connection / response status. */
  status?: AtlChatStatus;
  /** Whether the chat is open (drawer / popup variants). */
  open?: boolean;
  /** Callback when open state should change. */
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * AI assistant surface. Three layout variants share the same content slots:
 * `drawer` (slide-in panel), `popup` (floating bubble + window), `inline`
 * (embedded card). Compose with `AtlChatHeader`, `AtlChatMessages`,
 * `AtlChatMessage`, `AtlChatTyping`, `AtlChatSuggestion`, `AtlChatInput`.
 */
export function AtlChat({
  variant = 'drawer',
  status = 'idle',
  open = false,
  onOpenChange,
  children,
}: AtlChatProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerId = useId();
  const triggerElRef = useRef<Element | null>(null);

  useEffect(() => {
    if (variant !== 'drawer') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      triggerElRef.current = document.activeElement;
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
      (triggerElRef.current as HTMLElement | null)?.focus();
      triggerElRef.current = null;
    }
  }, [open, variant]);

  // Auto-focus the input on open for drawer / popup. Inline keeps user focus.
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    if (variant === 'inline') return;
    const host = hostRef.current;
    if (!host) return;
    requestAnimationFrame(() => {
      host.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    });
  }, [open, variant]);

  useEffect(() => {
    if (variant !== 'drawer') return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => onOpenChange?.(false);
    const onCancel = (e: Event) => {
      e.preventDefault();
      onOpenChange?.(false);
    };
    dialog.addEventListener('close', onClose);
    dialog.addEventListener('cancel', onCancel);
    return () => {
      dialog.removeEventListener('close', onClose);
      dialog.removeEventListener('cancel', onCancel);
    };
  }, [onOpenChange, variant]);

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onOpenChange?.(false);
  };

  const hostClass = [
    'atl-chat',
    `variant-${variant}`,
    `status-${status}`,
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ');

  const ctx: ChatContextValue = {
    headerId,
    status,
    close: () => onOpenChange?.(false),
    toggle: () => onOpenChange?.(!open),
  };

  return (
    <ChatContext.Provider value={ctx}>
      <div ref={hostRef} className={hostClass}>
        {variant === 'drawer' && (
          <dialog
            ref={dialogRef}
            aria-labelledby={headerId}
            aria-modal="true"
            onClick={handleBackdropClick}
          >
            <div
              className="surface drawer-surface"
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </dialog>
        )}
        {variant === 'popup' && (
          <>
            {open && (
              <div
                className="surface popup-surface"
                role="dialog"
                aria-labelledby={headerId}
              >
                {children}
              </div>
            )}
            <button
              type="button"
              className="fab-bubble"
              aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
              aria-expanded={open}
              onClick={() => onOpenChange?.(!open)}
            >
              <span aria-hidden="true">AI</span>
            </button>
          </>
        )}
        {variant === 'inline' && (
          <section
            className="surface inline-surface"
            aria-labelledby={headerId}
          >
            {children}
          </section>
        )}
      </div>
    </ChatContext.Provider>
  );
}

/**
 * Header slot for `AtlChat`. Holds the title block; the close button
 * is rendered automatically (hidden on the inline variant via CSS).
 */
export function AtlChatHeader({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const ctx = useContext(ChatContext);
  return (
    <div
      id={ctx.headerId}
      className={['atl-chat-header', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div className="title-block">{children}</div>
      <button
        type="button"
        className="close-btn"
        aria-label="Close chat"
        onClick={ctx.close}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/**
 * Scrollable message list. Project `AtlChatMessage`, `AtlChatTyping`, or
 * `AtlChatSuggestion` children inside. Auto-scrolls to the bottom whenever
 * children are added or content changes — important for streaming responses
 * where new tokens are appended live.
 */
export function AtlChatMessages({
  children,
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const stickToBottom = () => { el.scrollTop = el.scrollHeight; };
    stickToBottom();
    const observer = new MutationObserver(stickToBottom);
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={['atl-chat-messages', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * A single chat message. Role drives bubble alignment and color.
 */
export interface AtlChatMessageProps extends HTMLAttributes<HTMLDivElement> {
  /** Sender of the message. */
  role?: AtlChatMessageRole;
  /** Marks the message as failed (red dashed border). */
  failed?: boolean;
}

export function AtlChatMessage({
  role = 'assistant',
  failed = false,
  children,
  className,
  ...rest
}: AtlChatMessageProps) {
  const classes = [
    'atl-chat-message',
    `role-${role}`,
    failed && 'is-failed',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div role="listitem" className={classes} {...rest}>
      {children}
    </div>
  );
}

/**
 * Typing indicator (three animated dots).
 *
 * Two display modes:
 * - **Standalone bubble** (default) — render at the end of the message
 *   list to show "the assistant is starting to respond".
 * - **Inline cursor** (`inline`) — render as the LAST child INSIDE the
 *   currently-streaming `AtlChatMessage` so the dots read as a typing
 *   caret at the end of the partial text.
 */
export interface AtlChatTypingProps extends HTMLAttributes<HTMLDivElement> {
  /** When true, renders as an inline cursor without bubble chrome. */
  inline?: boolean;
}

export function AtlChatTyping({
  inline = false,
  className,
  ...rest
}: AtlChatTypingProps) {
  const classes = [
    'atl-chat-typing',
    inline && 'is-inline',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div role="status" aria-live="polite" className={classes} {...rest}>
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
      <span className="sr-only">Assistant is typing</span>
    </div>
  );
}

/**
 * Tappable suggestion chip used in the empty state to seed a conversation.
 */
export interface AtlChatSuggestionProps {
  /** Primary label of the suggestion. */
  label: string;
  /** Optional secondary hint text. */
  hint?: string;
  /** Fires the label string when activated. */
  onSelected?: (label: string) => void;
  className?: string;
}

export function AtlChatSuggestion({
  label,
  hint,
  onSelected,
  className,
}: AtlChatSuggestionProps) {
  return (
    <div
      className={['atl-chat-suggestion', className].filter(Boolean).join(' ')}
    >
      <button
        type="button"
        className="chip"
        onClick={() => onSelected?.(label)}
      >
        <span className="chip-label">{label}</span>
        {hint && <span className="chip-hint">{hint}</span>}
      </button>
    </div>
  );
}

/**
 * Composable input footer for `AtlChat`. Wraps a textarea and emits
 * `onSend` (or `onStop` when the chat status is `'streaming'`).
 *
 * The action button automatically switches between primary "Send" and
 * danger "Stop" based on the parent chat's status.
 */
export interface AtlChatInputProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string;
  onValueChange?: (value: string) => void;
  onSend?: (text: string) => void;
  onStop?: () => void;
  /** Accessible label for the input field. */
  ariaLabel?: string;
}

export function AtlChatInput({
  value,
  onValueChange,
  onSend,
  onStop,
  placeholder,
  ariaLabel = 'Message your AI assistant',
  ...rest
}: AtlChatInputProps) {
  const ctx = useContext(ChatContext);
  const isStreaming = ctx.status === 'streaming';
  const [internal, setInternal] = useState('');
  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  const setCurrent = (next: string) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const effectivePlaceholder =
    placeholder ??
    (isStreaming
      ? 'Waiting for response…'
      : ctx.status === 'error'
        ? 'Try again…'
        : 'Message your AI assistant…');

  const emitSend = () => {
    const text = current.trim();
    if (!text || isStreaming) return;
    onSend?.(text);
    setCurrent('');
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCurrent(e.target.value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      emitSend();
    }
  };

  return (
    <div className="atl-chat-input">
      <textarea
        className="field"
        rows={1}
        value={current}
        placeholder={effectivePlaceholder}
        disabled={isStreaming}
        aria-label={ariaLabel}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      {isStreaming ? (
        <button
          type="button"
          className="action-btn variant-danger size-md"
          onClick={onStop}
        >
          Stop
        </button>
      ) : (
        <button
          type="button"
          className="action-btn variant-primary size-md"
          disabled={!current.trim()}
          onClick={emitSend}
        >
          Send
        </button>
      )}
    </div>
  );
}
