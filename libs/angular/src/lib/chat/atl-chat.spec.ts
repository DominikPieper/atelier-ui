/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import {
  AtlChat,
  AtlChatHeader,
  AtlChatInput,
  AtlChatMessage,
  AtlChatMessages,
  AtlChatSuggestion,
  AtlChatTyping,
} from './atl-chat';

const ALL_CHAT = [
  AtlChat,
  AtlChatHeader,
  AtlChatMessages,
  AtlChatMessage,
  AtlChatTyping,
  AtlChatSuggestion,
  AtlChatInput,
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

describe('AtlChat', () => {
  describe('variant classes', () => {
    covers('chat', 'variant-class').each(['drawer', 'popup', 'inline'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<atl-chat variant="${variant}" [open]="true">Body</atl-chat>`,
          { imports: ALL_CHAT },
        );
        expect(container.querySelector('atl-chat')).toHaveClass(`variant-${variant}`);
      },
    );
  });

  describe('status classes', () => {
    it.each(['idle', 'streaming', 'error'] as const)(
      'applies status-%s class to host',
      async (status) => {
        const { container } = await render(
          `<atl-chat variant="inline" status="${status}" [open]="true">Body</atl-chat>`,
          { imports: ALL_CHAT },
        );
        expect(container.querySelector('atl-chat')).toHaveClass(`status-${status}`);
      },
    );
  });

  covers('chat', 'inline-variant')('inline variant renders content without overlay chrome', async () => {
    const { container } = await render(
      `<atl-chat variant="inline" [open]="true">Hello</atl-chat>`,
      { imports: ALL_CHAT },
    );
    expect(container.querySelector('section.inline-surface')).toBeInTheDocument();
    expect(container.querySelector('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('.fab-bubble')).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  covers('chat', 'popup-variant')('popup variant renders the floating bubble', async () => {
    const { container } = await render(
      `<atl-chat variant="popup" [open]="true">Body</atl-chat>`,
      { imports: ALL_CHAT },
    );
    expect(container.querySelector('button.fab-bubble')).toBeInTheDocument();
    expect(container.querySelector('.popup-surface')).toBeInTheDocument();
  });

  it('drawer variant renders a native dialog', async () => {
    const { container } = await render(
      `<atl-chat variant="drawer" [open]="true">Body</atl-chat>`,
      { imports: ALL_CHAT },
    );
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  describe('AtlChatMessage', () => {
    it.each(['user', 'assistant', 'system'] as const)(
      'applies role-%s class to host',
      async (role) => {
        const { container } = await render(
          `<atl-chat-message role="${role}">Hi</atl-chat-message>`,
          { imports: ALL_CHAT },
        );
        expect(container.querySelector('atl-chat-message')).toHaveClass(`role-${role}`);
      },
    );

    covers('chat', 'is-failed')('applies is-failed class when failed=true', async () => {
      const { container } = await render(
        `<atl-chat-message role="assistant" [failed]="true">err</atl-chat-message>`,
        { imports: ALL_CHAT },
      );
      expect(container.querySelector('atl-chat-message')).toHaveClass('is-failed');
    });
  });

  describe('AtlChatSuggestion', () => {
    it('emits selected with the label when clicked', async () => {
      const user = userEvent.setup();
      const onSelected = vi.fn();
      const { container } = await render(
        `<atl-chat-suggestion label="Explain" hint="tap" (selected)="onSelected($event)" />`,
        { imports: ALL_CHAT, componentProperties: { onSelected } },
      );
      await user.click(container.querySelector('button.chip')!);
      expect(onSelected).toHaveBeenCalledWith('Explain');
    });
  });

  describe('AtlChatInput', () => {
    covers('chat', 'send-button-idle')('renders a Send button when status is idle', async () => {
      const { container } = await render(
        `<atl-chat variant="inline" status="idle" [open]="true">
          <atl-chat-input />
        </atl-chat>`,
        { imports: ALL_CHAT },
      );
      expect(container.querySelector('button.variant-primary')).toHaveTextContent('Send');
    });

    covers('chat', 'stop-button-streaming')('renders a Stop button when status is streaming', async () => {
      const { container } = await render(
        `<atl-chat variant="inline" status="streaming" [open]="true">
          <atl-chat-input />
        </atl-chat>`,
        { imports: ALL_CHAT },
      );
      expect(container.querySelector('button.variant-danger')).toHaveTextContent('Stop');
      expect(container.querySelector('textarea')).toBeDisabled();
    });

    covers('chat', 'emits-send')('emits send with the typed text on Enter', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      const { container } = await render(
        `<atl-chat variant="inline" [open]="true">
          <atl-chat-input (send)="onSend($event)" />
        </atl-chat>`,
        { imports: ALL_CHAT, componentProperties: { onSend } },
      );
      const ta = container.querySelector('textarea')!;
      await user.type(ta, 'hello{Enter}');
      expect(onSend).toHaveBeenCalledWith('hello');
    });

    covers('chat', 'emits-stop')('emits stop when Stop button is clicked while streaming', async () => {
      const user = userEvent.setup();
      const onStop = vi.fn();
      const { container } = await render(
        `<atl-chat variant="inline" status="streaming" [open]="true">
          <atl-chat-input (stop)="onStop()" />
        </atl-chat>`,
        { imports: ALL_CHAT, componentProperties: { onStop } },
      );
      await user.click(container.querySelector('button.variant-danger')!);
      expect(onStop).toHaveBeenCalledOnce();
    });
  });
});
