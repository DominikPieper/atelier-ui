/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  LlmChat,
  LlmChatHeader,
  LlmChatInput,
  LlmChatMessage,
  LlmChatMessages,
  LlmChatSuggestion,
  LlmChatTyping,
} from './llm-chat';

const ALL_CHAT = [
  LlmChat,
  LlmChatHeader,
  LlmChatMessages,
  LlmChatMessage,
  LlmChatTyping,
  LlmChatSuggestion,
  LlmChatInput,
];

// Polyfill HTMLDialogElement for jsdom
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  }
});

describe('LlmChat', () => {
  describe('variant classes', () => {
    it.each(['drawer', 'popup', 'inline'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<llm-chat variant="${variant}" [open]="true">Body</llm-chat>`,
          { imports: ALL_CHAT },
        );
        expect(container.querySelector('llm-chat')).toHaveClass(`variant-${variant}`);
      },
    );
  });

  describe('status classes', () => {
    it.each(['idle', 'streaming', 'error'] as const)(
      'applies status-%s class to host',
      async (status) => {
        const { container } = await render(
          `<llm-chat variant="inline" status="${status}" [open]="true">Body</llm-chat>`,
          { imports: ALL_CHAT },
        );
        expect(container.querySelector('llm-chat')).toHaveClass(`status-${status}`);
      },
    );
  });

  it('inline variant renders content without overlay chrome', async () => {
    const { container } = await render(
      `<llm-chat variant="inline" [open]="true">Hello</llm-chat>`,
      { imports: ALL_CHAT },
    );
    expect(container.querySelector('section.inline-surface')).toBeInTheDocument();
    expect(container.querySelector('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('.fab-bubble')).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('popup variant renders the floating bubble', async () => {
    const { container } = await render(
      `<llm-chat variant="popup" [open]="true">Body</llm-chat>`,
      { imports: ALL_CHAT },
    );
    expect(container.querySelector('button.fab-bubble')).toBeInTheDocument();
    expect(container.querySelector('.popup-surface')).toBeInTheDocument();
  });

  it('drawer variant renders a native dialog', async () => {
    const { container } = await render(
      `<llm-chat variant="drawer" [open]="true">Body</llm-chat>`,
      { imports: ALL_CHAT },
    );
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  describe('LlmChatMessage', () => {
    it.each(['user', 'assistant', 'system'] as const)(
      'applies role-%s class to host',
      async (role) => {
        const { container } = await render(
          `<llm-chat-message role="${role}">Hi</llm-chat-message>`,
          { imports: ALL_CHAT },
        );
        expect(container.querySelector('llm-chat-message')).toHaveClass(`role-${role}`);
      },
    );

    it('applies is-failed class when failed=true', async () => {
      const { container } = await render(
        `<llm-chat-message role="assistant" [failed]="true">err</llm-chat-message>`,
        { imports: ALL_CHAT },
      );
      expect(container.querySelector('llm-chat-message')).toHaveClass('is-failed');
    });
  });

  describe('LlmChatSuggestion', () => {
    it('emits selected with the label when clicked', async () => {
      const user = userEvent.setup();
      const onSelected = vi.fn();
      const { container } = await render(
        `<llm-chat-suggestion label="Explain" hint="tap" (selected)="onSelected($event)" />`,
        { imports: ALL_CHAT, componentProperties: { onSelected } },
      );
      await user.click(container.querySelector('button.chip')!);
      expect(onSelected).toHaveBeenCalledWith('Explain');
    });
  });

  describe('LlmChatInput', () => {
    it('renders a Send button when status is idle', async () => {
      const { container } = await render(
        `<llm-chat variant="inline" status="idle" [open]="true">
          <llm-chat-input />
        </llm-chat>`,
        { imports: ALL_CHAT },
      );
      expect(container.querySelector('button.variant-primary')).toHaveTextContent('Send');
    });

    it('renders a Stop button when status is streaming', async () => {
      const { container } = await render(
        `<llm-chat variant="inline" status="streaming" [open]="true">
          <llm-chat-input />
        </llm-chat>`,
        { imports: ALL_CHAT },
      );
      expect(container.querySelector('button.variant-danger')).toHaveTextContent('Stop');
      expect(container.querySelector('textarea')).toBeDisabled();
    });

    it('emits send with the typed text on Enter', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const { container } = await render(
        `<llm-chat variant="inline" [open]="true">
          <llm-chat-input (send)="onSend($event)" />
        </llm-chat>`,
        { imports: ALL_CHAT, componentProperties: { onSend } },
      );
      const ta = container.querySelector('textarea')!;
      await user.type(ta, 'hello{Enter}');
      expect(onSend).toHaveBeenCalledWith('hello');
    });

    it('emits stop when Stop button is clicked while streaming', async () => {
      const user = userEvent.setup();
      const onStop = vi.fn();
      const { container } = await render(
        `<llm-chat variant="inline" status="streaming" [open]="true">
          <llm-chat-input (stop)="onStop()" />
        </llm-chat>`,
        { imports: ALL_CHAT, componentProperties: { onStop } },
      );
      await user.click(container.querySelector('button.variant-danger')!);
      expect(onStop).toHaveBeenCalledOnce();
    });
  });
});
