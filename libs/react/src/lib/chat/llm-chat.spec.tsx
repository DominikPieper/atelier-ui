import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  LlmChat,
  LlmChatHeader,
  LlmChatInput,
  LlmChatMessage,
  LlmChatMessages,
  LlmChatSuggestion,
  LlmChatTyping,
} from './llm-chat';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('LlmChat', () => {
  describe.each(['drawer', 'popup', 'inline'] as const)('variant=%s', (variant) => {
    it('applies the variant class on the host', () => {
      const { container } = render(
        <LlmChat variant={variant} open>
          Body
        </LlmChat>,
      );
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    });
  });

  describe.each(['idle', 'streaming', 'error'] as const)('status=%s', (status) => {
    it('applies the status class on the host', () => {
      const { container } = render(
        <LlmChat variant="inline" status={status} open>
          Body
        </LlmChat>,
      );
      expect(container.firstChild).toHaveClass(`status-${status}`);
    });
  });

  it('inline variant renders a section, no dialog or fab', () => {
    const { container } = render(
      <LlmChat variant="inline" open>
        Hello
      </LlmChat>,
    );
    expect(container.querySelector('section.inline-surface')).toBeInTheDocument();
    expect(container.querySelector('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('.fab-bubble')).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('popup variant renders the floating bubble + popup window', () => {
    const { container } = render(
      <LlmChat variant="popup" open>
        Body
      </LlmChat>,
    );
    expect(container.querySelector('button.fab-bubble')).toBeInTheDocument();
    expect(container.querySelector('.popup-surface')).toBeInTheDocument();
  });

  it('drawer variant calls showModal when open becomes true', () => {
    render(
      <LlmChat variant="drawer" open>
        Body
      </LlmChat>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  describe('LlmChatMessage', () => {
    it.each(['user', 'assistant', 'system'] as const)(
      'applies role-%s class',
      (role) => {
        render(<LlmChatMessage role={role}>Hi</LlmChatMessage>);
        expect(screen.getByText('Hi')).toHaveClass(`role-${role}`);
      },
    );

    it('applies is-failed when failed=true', () => {
      render(<LlmChatMessage failed>err</LlmChatMessage>);
      expect(screen.getByText('err')).toHaveClass('is-failed');
    });
  });

  describe('LlmChatTyping', () => {
    it('renders three dots with role=status', () => {
      const { container } = render(<LlmChatTyping />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
      expect(container.querySelectorAll('.dot')).toHaveLength(3);
    });
  });

  describe('LlmChatSuggestion', () => {
    it('emits onSelected with the label when clicked', async () => {
      const user = userEvent.setup();
      const onSelected = vi.fn();
      render(<LlmChatSuggestion label="Explain" onSelected={onSelected} />);
      await user.click(screen.getByRole('button', { name: /Explain/ }));
      expect(onSelected).toHaveBeenCalledWith('Explain');
    });
  });

  describe('LlmChatInput', () => {
    it('renders a Send button when status is idle', () => {
      const { container } = render(
        <LlmChat variant="inline" status="idle" open>
          <LlmChatInput />
        </LlmChat>,
      );
      const btn = container.querySelector('button.variant-primary');
      expect(btn).toHaveTextContent('Send');
    });

    it('renders a Stop button when status is streaming', () => {
      const { container } = render(
        <LlmChat variant="inline" status="streaming" open>
          <LlmChatInput />
        </LlmChat>,
      );
      const btn = container.querySelector('button.variant-danger');
      expect(btn).toHaveTextContent('Stop');
      expect(container.querySelector('textarea')).toBeDisabled();
    });

    it('emits onSend with the typed text on Enter', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(
        <LlmChat variant="inline" open>
          <LlmChatInput onSend={onSend} />
        </LlmChat>,
      );
      const ta = screen.getByRole('textbox');
      await user.type(ta, 'hello{Enter}');
      expect(onSend).toHaveBeenCalledWith('hello');
    });

    it('emits onStop when Stop is clicked while streaming', async () => {
      const user = userEvent.setup();
      const onStop = vi.fn();
      render(
        <LlmChat variant="inline" status="streaming" open>
          <LlmChatInput onStop={onStop} />
        </LlmChat>,
      );
      await user.click(screen.getByRole('button', { name: /Stop/ }));
      expect(onStop).toHaveBeenCalledOnce();
    });
  });

  it('renders header with content', () => {
    render(
      <LlmChat variant="inline" open>
        <LlmChatHeader>AI Assistant</LlmChatHeader>
      </LlmChat>,
    );
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('renders messages container', () => {
    render(
      <LlmChat variant="inline" open>
        <LlmChatMessages>
          <LlmChatMessage>Hi</LlmChatMessage>
        </LlmChatMessages>
      </LlmChat>,
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});
