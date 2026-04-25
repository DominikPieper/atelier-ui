import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import type {
  LlmChatMessageRole,
  LlmChatStatus,
  LlmChatVariant,
} from '../spec';
import { LLM_CHAT } from './llm-chat.token';

let nextId = 0;

/**
 * AI assistant surface. Three layout variants share the same content slots
 * and can be swapped without changing the children.
 *
 * Variants:
 * - `drawer`: Right-anchored slide-in panel, full viewport height.
 * - `popup`: Floating bubble (bottom-right) + compact chat window.
 * - `inline`: Embedded card, sits inline with page content.
 *
 * Compose with `llm-chat-header`, `llm-chat-messages`, `llm-chat-input`.
 *
 * Usage:
 * ```html
 * <llm-chat variant="drawer" [(open)]="isOpen" status="idle">
 *   <llm-chat-header>AI Assistant</llm-chat-header>
 *   <llm-chat-messages>
 *     <llm-chat-message role="assistant">Hi! How can I help?</llm-chat-message>
 *     <llm-chat-message role="user">Show me a sorting function.</llm-chat-message>
 *   </llm-chat-messages>
 *   <llm-chat-input placeholder="Ask anything…" (send)="onSend($event)" />
 * </llm-chat>
 * ```
 */
@Component({
  selector: 'llm-chat',
  standalone: true,
  imports: [A11yModule, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: LLM_CHAT,
      useFactory: (chat: LlmChat) => ({
        headerId: chat.headerId,
        variant: chat.variant,
        status: chat.status,
        close: () => chat.open.set(false),
        toggle: () => chat.open.set(!chat.open()),
      }),
      deps: [LlmChat],
    },
  ],
  template: `
    <ng-template #content><ng-content /></ng-template>
    @switch (variant()) {
      @case ('drawer') {
        <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
        <dialog
          #dialogEl
          [attr.aria-labelledby]="headerId"
          aria-modal="true"
          [cdkTrapFocus]="open()"
          (cancel)="onCancel($event)"
          (close)="open.set(false)"
          (click)="onBackdropClick($event)"
        >
          <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
          <div class="surface drawer-surface" (click)="$event.stopPropagation()">
            <ng-container [ngTemplateOutlet]="content" />
          </div>
        </dialog>
      }
      @case ('popup') {
        @if (open()) {
          <div class="surface popup-surface" [attr.aria-labelledby]="headerId" role="dialog">
            <ng-container [ngTemplateOutlet]="content" />
          </div>
        }
        <button
          type="button"
          class="fab-bubble"
          [attr.aria-label]="open() ? 'Close AI assistant' : 'Open AI assistant'"
          [attr.aria-expanded]="open()"
          (click)="open.set(!open())"
        >
          <span aria-hidden="true">AI</span>
        </button>
      }
      @default {
        <section class="surface inline-surface" [attr.aria-labelledby]="headerId">
          <ng-container [ngTemplateOutlet]="content" />
        </section>
      }
    }
  `,
  styleUrl: './llm-chat.css',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class LlmChat {
  /** Layout variant. */
  readonly variant = input<LlmChatVariant>('drawer');

  /** Whether the chat is open. Used by drawer/popup; ignored by inline. Two-way bindable via [(open)]. */
  readonly open = model(false);

  /** Connection / response status. Drives badge color in header and disables input while streaming. */
  readonly status = input<LlmChatStatus>('idle');

  /** @internal — referenced by LlmChatHeader via LLM_CHAT token for aria-labelledby. */
  readonly headerId = `llm-chat-header-${nextId++}`;

  protected readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly triggerEl = signal<HTMLElement | null>(null);

  protected readonly hostClasses = computed(
    () =>
      `variant-${this.variant()} status-${this.status()}${this.open() ? ' is-open' : ''}`
  );

  constructor() {
    // Drawer variant uses native <dialog> open/close lifecycle.
    effect(() => {
      if (this.variant() !== 'drawer') return;
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;
      if (this.open()) {
        this.triggerEl.set(document.activeElement as HTMLElement);
        dialog.showModal();
      } else {
        if (dialog.open) dialog.close();
        this.triggerEl()?.focus();
        this.triggerEl.set(null);
      }
    });

    // Auto-focus the input on open for drawer / popup. Inline variant keeps
    // user focus where it was.
    effect(() => {
      if (!this.open()) return;
      if (this.variant() === 'inline') return;
      // Wait for the surface to be in the DOM (showModal / @if (open) render).
      requestAnimationFrame(() => {
        this.host.nativeElement.querySelector<HTMLTextAreaElement>('textarea')?.focus();
      });
    });
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.open.set(false);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialogRef()?.nativeElement) {
      this.open.set(false);
    }
  }
}

/**
 * Header slot for `llm-chat`. Holds the title, status indicator, and close button.
 * Children are projected into the title area; the close button is rendered automatically.
 */
@Component({
  selector: 'llm-chat-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="title-block">
      <ng-content />
    </div>
    @if (context.variant() !== 'inline') {
      <button
        type="button"
        class="close-btn"
        aria-label="Close chat"
        (click)="context.close()"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    }
  `,
  styleUrl: './llm-chat.css',
  host: {
    '[attr.id]': 'context.headerId',
  },
})
export class LlmChatHeader {
  protected readonly context = inject(LLM_CHAT);
}

/**
 * Scrollable message list for `llm-chat`. Project `llm-chat-message`,
 * `llm-chat-typing`, or `llm-chat-suggestion` children inside. Auto-scrolls
 * to the bottom whenever children are added or content changes — important
 * for streaming responses where new tokens are appended live.
 */
@Component({
  selector: 'llm-chat-messages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-chat.css',
})
export class LlmChatMessages {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const el = this.host.nativeElement;
      const stickToBottom = (): void => { el.scrollTop = el.scrollHeight; };
      stickToBottom();
      const observer = new MutationObserver(stickToBottom);
      observer.observe(el, { childList: true, subtree: true, characterData: true });
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

/**
 * A single chat message. Role drives bubble alignment and color.
 *
 * Usage:
 * ```html
 * <llm-chat-message role="assistant">Sure, here you go.</llm-chat-message>
 * <llm-chat-message role="user">Thanks!</llm-chat-message>
 * <llm-chat-message role="assistant" [failed]="true">Couldn't reach the assistant.</llm-chat-message>
 * ```
 */
@Component({
  selector: 'llm-chat-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: './llm-chat.css',
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': '"listitem"',
  },
})
export class LlmChatMessage {
  /** Sender of the message. Drives bubble alignment and color. */
  readonly role = input<LlmChatMessageRole>('assistant');

  /** Marks the message as failed (red dashed border, used in error state). */
  readonly failed = input(false);

  protected readonly hostClasses = computed(
    () => `role-${this.role()}${this.failed() ? ' is-failed' : ''}`
  );
}

/**
 * Typing indicator (three animated dots).
 *
 * Two display modes:
 * - **Standalone bubble** (default) — render as the last child of
 *   `LlmChatMessages` to show "the assistant is starting to respond"
 *   before any tokens arrive.
 * - **Inline cursor** (`inline`) — render as the LAST child INSIDE
 *   `LlmChatMessage role="assistant"` to show the dots after the
 *   currently-streaming text. The bubble background is dropped so the
 *   dots read as a typing caret at the end of the partial response.
 */
@Component({
  selector: 'llm-chat-typing',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="sr-only">Assistant is typing</span>
  `,
  styleUrl: './llm-chat.css',
  host: {
    '[class]': 'hostClasses()',
    '[attr.role]': '"status"',
    '[attr.aria-live]': '"polite"',
  },
})
export class LlmChatTyping {
  /** When true, renders as an inline cursor without bubble chrome. */
  readonly inline = input(false);

  protected readonly hostClasses = computed(() =>
    this.inline() ? 'is-inline' : ''
  );
}

/**
 * Tappable suggestion chip used in the empty state to seed a conversation.
 *
 * Usage:
 * ```html
 * <llm-chat-suggestion label="Explain a code snippet" hint="Tap to start →" (selected)="prompt.set($event)" />
 * ```
 */
@Component({
  selector: 'llm-chat-suggestion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="chip" (click)="selected.emit(label())">
      <span class="chip-label">{{ label() }}</span>
      @if (hint()) {
        <span class="chip-hint">{{ hint() }}</span>
      }
    </button>
  `,
  styleUrl: './llm-chat.css',
})
export class LlmChatSuggestion {
  /** Primary label of the suggestion. */
  readonly label = input.required<string>();

  /** Optional secondary hint text shown below the label. */
  readonly hint = input<string>('');

  /** Fires the label string when the chip is activated. */
  readonly selected = output<string>();
}

/**
 * Composable input footer for `llm-chat`. Wraps a text field and emits
 * `send` (or `stop` while the assistant is streaming).
 *
 * The button automatically switches to a `danger` "Stop" button when the
 * parent chat's `status` is `'streaming'`.
 *
 * Usage:
 * ```html
 * <llm-chat-input placeholder="Ask anything…" (send)="onSend($event)" (stop)="onStop()" />
 * ```
 */
@Component({
  selector: 'llm-chat-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <textarea
      class="field"
      [value]="value()"
      [placeholder]="effectivePlaceholder()"
      [disabled]="isStreaming()"
      [attr.aria-label]="ariaLabel()"
      (input)="onInput($event)"
      (keydown.enter)="onEnter($event)"
      rows="1"
    ></textarea>
    @if (isStreaming()) {
      <button
        type="button"
        class="action-btn variant-danger size-md"
        (click)="stop.emit()"
      >
        Stop
      </button>
    } @else {
      <button
        type="button"
        class="action-btn variant-primary size-md"
        [disabled]="!value().trim()"
        (click)="emitSend()"
      >
        Send
      </button>
    }
  `,
  styleUrl: './llm-chat.css',
})
export class LlmChatInput {
  /** Placeholder shown in the empty input. Defaults change per parent status. */
  readonly placeholder = input<string>('');

  /** Accessible label for the input field. */
  readonly ariaLabel = input<string>('Message your AI assistant');

  /** Two-way bindable text content. */
  readonly value = model<string>('');

  /** Fires when Enter is pressed (without Shift) or the Send button is clicked. */
  readonly send = output<string>();

  /** Fires when the Stop button is clicked while the parent chat is streaming. */
  readonly stop = output<void>();

  protected readonly context = inject(LLM_CHAT);

  protected readonly isStreaming = computed(() => this.context.status() === 'streaming');

  protected readonly effectivePlaceholder = computed(() => {
    const explicit = this.placeholder();
    if (explicit) return explicit;
    switch (this.context.status()) {
      case 'streaming':
        return 'Waiting for response…';
      case 'error':
        return 'Try again…';
      default:
        return 'Message your AI assistant…';
    }
  });

  protected onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
  }

  protected onEnter(event: Event): void {
    const ke = event as KeyboardEvent;
    if (ke.shiftKey) return;
    ke.preventDefault();
    this.emitSend();
  }

  protected emitSend(): void {
    const text = this.value().trim();
    if (!text || this.isStreaming()) return;
    this.send.emit(text);
    this.value.set('');
  }
}
