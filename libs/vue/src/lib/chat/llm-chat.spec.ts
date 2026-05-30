import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmChat from './llm-chat.vue';
import LlmChatHeader from './llm-chat-header.vue';
import LlmChatMessages from './llm-chat-messages.vue';
import LlmChatMessage from './llm-chat-message.vue';
import LlmChatTyping from './llm-chat-typing.vue';
import LlmChatSuggestion from './llm-chat-suggestion.vue';
import LlmChatInput from './llm-chat-input.vue';
import { covers } from '../../testing/behavior';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal ??= function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

const ChatFixture = {
  components: { LlmChat, LlmChatHeader, LlmChatMessages, LlmChatMessage, LlmChatInput },
  props: ['variant', 'status', 'open'],
  template: `
    <LlmChat :variant="variant" :status="status" :open="open">
      <LlmChatHeader>Title</LlmChatHeader>
      <LlmChatMessages>
        <LlmChatMessage role="assistant">Hi</LlmChatMessage>
      </LlmChatMessages>
      <LlmChatInput />
    </LlmChat>
  `,
};

describe('LlmChat', () => {
  describe.each(['drawer', 'popup', 'inline'] as const)('variant=%s', (variant) => {
    covers('chat', 'variant-class')('applies the variant class on the host', () => {
      const { container } = render(ChatFixture, { props: { variant, status: 'idle', open: true } });
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    });
  });

  describe.each(['idle', 'streaming', 'error'] as const)('status=%s', (status) => {
    it('applies the status class on the host', () => {
      const { container } = render(ChatFixture, { props: { variant: 'inline', status, open: true } });
      expect(container.firstChild).toHaveClass(`status-${status}`);
    });
  });

  covers('chat', 'inline-variant')('inline variant renders a section, no dialog or fab', () => {
    const { container } = render(ChatFixture, { props: { variant: 'inline', status: 'idle', open: true } });
    expect(container.querySelector('section.inline-surface')).toBeInTheDocument();
    expect(container.querySelector('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('.fab-bubble')).not.toBeInTheDocument();
  });

  covers('chat', 'popup-variant')('popup variant renders the floating bubble + popup window', () => {
    const { container } = render(ChatFixture, { props: { variant: 'popup', status: 'idle', open: true } });
    expect(container.querySelector('button.fab-bubble')).toBeInTheDocument();
    expect(container.querySelector('.popup-surface')).toBeInTheDocument();
  });

  it('drawer variant renders a dialog and opens it via showModal', async () => {
    const { container, rerender } = render(ChatFixture, { props: { variant: 'drawer', status: 'idle', open: false } });
    expect(container.querySelector('dialog')).toBeInTheDocument();
    await rerender({ variant: 'drawer', status: 'idle', open: true });
    expect(document.querySelector('dialog')).toHaveAttribute('open');
  });

  describe('LlmChatMessage', () => {
    it.each(['user', 'assistant', 'system'] as const)(
      'applies role-%s class',
      (role) => {
        const { container } = render(LlmChatMessage, { props: { role }, slots: { default: 'Hi' } });
        expect(container.querySelector('.llm-chat-message')).toHaveClass(`role-${role}`);
      },
    );

    covers('chat', 'is-failed')('applies is-failed when failed=true', () => {
      const { container } = render(LlmChatMessage, { props: { failed: true }, slots: { default: 'err' } });
      expect(container.querySelector('.llm-chat-message')).toHaveClass('is-failed');
    });
  });

  describe('LlmChatTyping', () => {
    it('renders three dots with role=status', () => {
      const { container } = render(LlmChatTyping);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
      expect(container.querySelectorAll('.dot')).toHaveLength(3);
    });
  });

  describe('LlmChatSuggestion', () => {
    it('emits selected with the label when clicked', async () => {
      const user = userEvent.setup();
      const { emitted } = render(LlmChatSuggestion, { props: { label: 'Explain' } });
      await user.click(screen.getByRole('button', { name: /Explain/ }));
      expect(emitted('selected')).toEqual([['Explain']]);
    });
  });

  describe('LlmChatInput', () => {
    const InputFixture = {
      components: { LlmChat, LlmChatInput },
      props: ['status'],
      emits: ['send', 'stop'],
      template: `
        <LlmChat variant="inline" :status="status" :open="true">
          <LlmChatInput @send="$emit('send', $event)" @stop="$emit('stop')" />
        </LlmChat>
      `,
    };

    covers('chat', 'send-button-idle')('renders a Send button when status is idle', () => {
      const { container } = render(InputFixture, { props: { status: 'idle' } });
      expect(container.querySelector('button.variant-primary')).toHaveTextContent('Send');
    });

    covers('chat', 'stop-button-streaming')('renders a Stop button when status is streaming', () => {
      const { container } = render(InputFixture, { props: { status: 'streaming' } });
      expect(container.querySelector('button.variant-danger')).toHaveTextContent('Stop');
      expect(container.querySelector('textarea')).toBeDisabled();
    });

    covers('chat', 'emits-send')('emits send with the typed text on Enter', async () => {
      const user = userEvent.setup();
      const { emitted } = render(InputFixture, { props: { status: 'idle' } });
      await user.type(screen.getByRole('textbox'), 'hello{Enter}');
      expect(emitted('send')).toEqual([['hello']]);
    });

    covers('chat', 'emits-stop')('emits stop when Stop is clicked while streaming', async () => {
      const user = userEvent.setup();
      const { emitted } = render(InputFixture, { props: { status: 'streaming' } });
      await user.click(screen.getByRole('button', { name: /Stop/ }));
      expect(emitted('stop')).toBeTruthy();
    });
  });
});
