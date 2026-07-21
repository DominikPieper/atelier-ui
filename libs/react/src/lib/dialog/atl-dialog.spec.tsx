import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter } from './atl-dialog';
import { covers } from '../../testing/behavior';

// jsdom doesn't implement showModal/close on <dialog>, so we mock them
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('AtlDialog', () => {
  covers('dialog', 'render-dialog-element')('renders dialog element', () => {
    render(<AtlDialog open={false} />);
    expect(document.querySelector('dialog')).toBeInTheDocument();
  });

  covers('dialog', 'open-shows-modal')('calls showModal when open becomes true', () => {
    render(<AtlDialog open={true} />);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('renders header content', () => {
    render(
      <AtlDialog open={true}>
        <AtlDialogHeader>Dialog Title</AtlDialogHeader>
      </AtlDialog>
    );
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });

  it('renders content', () => {
    render(
      <AtlDialog open={true}>
        <AtlDialogContent>Body text</AtlDialogContent>
      </AtlDialog>
    );
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <AtlDialog open={true}>
        <AtlDialogFooter>Footer content</AtlDialogFooter>
      </AtlDialog>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  covers('dialog', 'close-button')('close button calls onOpenChange with false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <AtlDialog open={true} onOpenChange={onOpenChange}>
        <AtlDialogHeader>Title</AtlDialogHeader>
      </AtlDialog>
    );
    // jsdom doesn't make <dialog> content accessible via role queries,
    // so we query by aria-label directly
    const closeBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Close dialog"]');
    if (!closeBtn) {
      throw new Error('Close button not found');
    }
    await user.click(closeBtn);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  covers('dialog', 'size-class')('applies size class to dialog element', () => {
    render(<AtlDialog open={true} size="lg" />);
    expect(document.querySelector('dialog')).toHaveClass('size-lg');
  });

  it('applies correct size classes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    for (const size of sizes) {
      const { unmount } = render(<AtlDialog open={true} size={size} />);
      expect(document.querySelector('dialog')).toHaveClass(`size-${size}`);
      unmount();
    }
  });

  covers('dialog', 'aria-modal')('renders with aria-modal on dialog element', () => {
    render(<AtlDialog open={true} />);
    expect(document.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
