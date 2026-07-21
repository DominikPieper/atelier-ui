import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('AtlChat', () => {
  describe.each(['drawer', 'popup', 'inline'] as const)('variant=%s', (variant) => {
    covers('chat', 'variant-class')('applies the variant class on the host', () => {
      const { container } = render(
        <AtlChat variant={variant} open>
          Body
        </AtlChat>,
      );
      expect(container.firstChild).toHaveClass(`variant-${variant}`);
    });
  });

  describe.each(['idle', 'streaming', 'error'] as const)('status=%s', (status) => {
    it('applies the status class on the host', () => {
      const { container } = render(
        <AtlChat variant="inline" status={status} open>
          Body
        </AtlChat>,
      );
      expect(container.firstChild).toHaveClass(`status-${status}`);
    });
  });

  covers('chat', 'inline-variant')('inline variant renders a section, no dialog or fab', () => {
    const { container } = render(
      <AtlChat variant="inline" open>
        Hello
      </AtlChat>,
    );
    expect(container.querySelector('section.inline-surface')).toBeInTheDocument();
    expect(container.querySelector('dialog')).not.toBeInTheDocument();
    expect(container.querySelector('.fab-bubble')).not.toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  covers('chat', 'popup-variant')('popup variant renders the floating bubble + popup window', () => {
    const { container } = render(
      <AtlChat variant="popup" open>
        Body
      </AtlChat>,
    );
    expect(container.querySelector('button.fab-bubble')).toBeInTheDocument();
    expect(container.querySelector('.popup-surface')).toBeInTheDocument();
  });

  it('drawer variant calls showModal when open becomes true', () => {
    render(
      <AtlChat variant="drawer" open>
        Body
      </AtlChat>,
    );
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  describe('AtlChatMessage', () => {
    it.each(['user', 'assistant', 'system'] as const)(
      'applies role-%s class',
      (role) => {
        render(<AtlChatMessage role={role}>Hi</AtlChatMessage>);
        expect(screen.getByText('Hi')).toHaveClass(`role-${role}`);
      },
    );

    covers('chat', 'is-failed')('applies is-failed when failed=true', () => {
      render(<AtlChatMessage failed>err</AtlChatMessage>);
      expect(screen.getByText('err')).toHaveClass('is-failed');
    });
  });

  describe('AtlChatTyping', () => {
    it('renders three dots with role=status', () => {
      const { container } = render(<AtlChatTyping />);
      expect(container.querySelector('[role="status"]')).toBeInTheDocument();
      expect(container.querySelectorAll('.dot')).toHaveLength(3);
    });
  });

  describe('AtlChatSuggestion', () => {
    it('emits onSelected with the label when clicked', async () => {
      const user = userEvent.setup();
      const onSelected = vi.fn();
      render(<AtlChatSuggestion label="Explain" onSelected={onSelected} />);
      await user.click(screen.getByRole('button', { name: /Explain/ }));
      expect(onSelected).toHaveBeenCalledWith('Explain');
    });
  });

  describe('AtlChatInput', () => {
    covers('chat', 'send-button-idle')('renders a Send button when status is idle', () => {
      const { container } = render(
        <AtlChat variant="inline" status="idle" open>
          <AtlChatInput />
        </AtlChat>,
      );
      const btn = container.querySelector('button.variant-primary');
      expect(btn).toHaveTextContent('Send');
    });

    covers('chat', 'stop-button-streaming')('renders a Stop button when status is streaming', () => {
      const { container } = render(
        <AtlChat variant="inline" status="streaming" open>
          <AtlChatInput />
        </AtlChat>,
      );
      const btn = container.querySelector('button.variant-danger');
      expect(btn).toHaveTextContent('Stop');
      expect(container.querySelector('textarea')).toBeDisabled();
    });

    covers('chat', 'emits-send')('emits onSend with the typed text on Enter', async () => {
      const user = userEvent.setup();
      const onSend = vi.fn();
      render(
        <AtlChat variant="inline" open>
          <AtlChatInput onSend={onSend} />
        </AtlChat>,
      );
      const ta = screen.getByRole('textbox');
      await user.type(ta, 'hello{Enter}');
      expect(onSend).toHaveBeenCalledWith('hello');
    });

    covers('chat', 'emits-stop')('emits onStop when Stop is clicked while streaming', async () => {
      const user = userEvent.setup();
      const onStop = vi.fn();
      render(
        <AtlChat variant="inline" status="streaming" open>
          <AtlChatInput onStop={onStop} />
        </AtlChat>,
      );
      await user.click(screen.getByRole('button', { name: /Stop/ }));
      expect(onStop).toHaveBeenCalledOnce();
    });
  });

  it('renders header with content', () => {
    render(
      <AtlChat variant="inline" open>
        <AtlChatHeader>AI Assistant</AtlChatHeader>
      </AtlChat>,
    );
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
  });

  it('renders messages container', () => {
    render(
      <AtlChat variant="inline" open>
        <AtlChatMessages>
          <AtlChatMessage>Hi</AtlChatMessage>
        </AtlChatMessages>
      </AtlChat>,
    );
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });
});
