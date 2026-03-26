import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger } from './llm-menu';

describe('LlmMenu', () => {
  it('renders with role="menu"', () => {
    render(
      <LlmMenu>
        <LlmMenuItem>Action</LlmMenuItem>
      </LlmMenu>
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('applies variant class', () => {
    const { container } = render(<LlmMenu variant="compact" />);
    expect(container.firstChild).toHaveClass('variant-compact');
  });

  it('defaults to variant-default', () => {
    const { container } = render(<LlmMenu />);
    expect(container.firstChild).toHaveClass('variant-default');
  });
});

describe('LlmMenuItem', () => {
  it('renders with role="menuitem"', () => {
    render(
      <LlmMenu>
        <LlmMenuItem>Copy</LlmMenuItem>
      </LlmMenu>
    );
    expect(screen.getByRole('menuitem')).toBeInTheDocument();
  });

  it('calls onTriggered when clicked', async () => {
    const user = userEvent.setup();
    const onTriggered = vi.fn();
    render(
      <LlmMenu>
        <LlmMenuItem onTriggered={onTriggered}>Copy</LlmMenuItem>
      </LlmMenu>
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onTriggered).toHaveBeenCalled();
  });

  it('does not call onTriggered when disabled', async () => {
    const user = userEvent.setup();
    const onTriggered = vi.fn();
    render(
      <LlmMenu>
        <LlmMenuItem onTriggered={onTriggered} disabled>
          Copy
        </LlmMenuItem>
      </LlmMenu>
    );
    await user.click(screen.getByRole('menuitem'));
    expect(onTriggered).not.toHaveBeenCalled();
  });

  it('applies is-disabled class when disabled', () => {
    render(
      <LlmMenu>
        <LlmMenuItem disabled>Delete</LlmMenuItem>
      </LlmMenu>
    );
    expect(screen.getByRole('menuitem')).toHaveClass('is-disabled');
  });
});

describe('LlmMenuSeparator', () => {
  it('renders with role="separator"', () => {
    render(<LlmMenuSeparator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });
});

describe('LlmMenuTrigger', () => {
  it('does not show menu initially', () => {
    render(
      <LlmMenuTrigger
        menu={
          <LlmMenu>
            <LlmMenuItem>Action</LlmMenuItem>
          </LlmMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </LlmMenuTrigger>
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('shows menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LlmMenuTrigger
        menu={
          <LlmMenu>
            <LlmMenuItem>Action</LlmMenuItem>
          </LlmMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </LlmMenuTrigger>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('closes menu when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(
      <LlmMenuTrigger
        menu={
          <LlmMenu>
            <LlmMenuItem>Action</LlmMenuItem>
          </LlmMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </LlmMenuTrigger>
    );
    await user.click(screen.getByText('Open'));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu when a menu item is clicked', async () => {
    const user = userEvent.setup();
    render(
      <LlmMenuTrigger
        menu={
          <LlmMenu>
            <LlmMenuItem>Copy</LlmMenuItem>
          </LlmMenu>
        }
      >
        {({ onClick, ref }) => (
          <button ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
            Open
          </button>
        )}
      </LlmMenuTrigger>
    );
    await user.click(screen.getByText('Open'));
    await user.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
