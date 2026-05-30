import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter } from './llm-drawer';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('LlmDrawer', () => {
  covers('drawer', 'render-dialog-element')('renders dialog element', () => {
    render(<LlmDrawer open={false} />);
    expect(document.querySelector('dialog')).toBeInTheDocument();
  });

  covers('drawer', 'open-shows-modal')('calls showModal when open becomes true', () => {
    render(<LlmDrawer open={true} />);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('renders header content', () => {
    render(
      <LlmDrawer open={true}>
        <LlmDrawerHeader>Settings</LlmDrawerHeader>
      </LlmDrawer>
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders drawer content', () => {
    render(
      <LlmDrawer open={true}>
        <LlmDrawerContent>Drawer body</LlmDrawerContent>
      </LlmDrawer>
    );
    expect(screen.getByText('Drawer body')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <LlmDrawer open={true}>
        <LlmDrawerFooter>Footer</LlmDrawerFooter>
      </LlmDrawer>
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  covers('drawer', 'close-button')('close button calls onOpenChange with false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <LlmDrawer open={true} onOpenChange={onOpenChange}>
        <LlmDrawerHeader>Title</LlmDrawerHeader>
      </LlmDrawer>
    );
    // jsdom doesn't make <dialog> content accessible via role queries,
    // so we query by aria-label directly
    const closeBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Close drawer"]');
    if (!closeBtn) {
      throw new Error('Close button not found');
    }
    await user.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)(
    'applies position-%s class to host wrapper',
    (position) => {
      const { container } = render(<LlmDrawer open={false} position={position} />);
      expect(container.firstChild).toHaveClass(`position-${position}`);
    }
  );

  it.each(['sm', 'md', 'lg', 'full'] as const)(
    'applies size-%s class to host wrapper',
    (size) => {
      const { container } = render(<LlmDrawer open={false} size={size} />);
      expect(container.firstChild).toHaveClass(`size-${size}`);
    }
  );

  covers('drawer', 'is-open-class')('applies is-open class when open', () => {
    const { container } = render(<LlmDrawer open={true} />);
    expect(container.firstChild).toHaveClass('is-open');
  });

  it('does not apply is-open class when closed', () => {
    const { container } = render(<LlmDrawer open={false} />);
    expect(container.firstChild).not.toHaveClass('is-open');
  });

  covers('drawer', 'aria-modal')('renders with aria-modal on dialog element', () => {
    render(<LlmDrawer open={true} />);
    expect(document.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
