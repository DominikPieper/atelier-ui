import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter } from './llm-dialog';

// jsdom doesn't implement showModal/close on <dialog>, so we mock them
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('LlmDialog', () => {
  it('renders dialog element', () => {
    render(<LlmDialog open={false} />);
    expect(document.querySelector('dialog')).toBeInTheDocument();
  });

  it('calls showModal when open becomes true', () => {
    render(<LlmDialog open={true} />);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('renders header content', () => {
    render(
      <LlmDialog open={true}>
        <LlmDialogHeader>Dialog Title</LlmDialogHeader>
      </LlmDialog>
    );
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });

  it('renders content', () => {
    render(
      <LlmDialog open={true}>
        <LlmDialogContent>Body text</LlmDialogContent>
      </LlmDialog>
    );
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(
      <LlmDialog open={true}>
        <LlmDialogFooter>Footer content</LlmDialogFooter>
      </LlmDialog>
    );
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('close button calls onOpenChange with false', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <LlmDialog open={true} onOpenChange={onOpenChange}>
        <LlmDialogHeader>Title</LlmDialogHeader>
      </LlmDialog>
    );
    // jsdom doesn't make <dialog> content accessible via role queries,
    // so we query by aria-label directly
    const closeBtn = container.querySelector<HTMLButtonElement>('button[aria-label="Close dialog"]');
    expect(closeBtn).toBeInTheDocument();
    await user.click(closeBtn!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies size class to panel', () => {
    const { container } = render(<LlmDialog open={true} size="lg" />);
    expect(container.querySelector('.panel')).toHaveClass('size-lg');
  });

  it('applies correct size classes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    for (const size of sizes) {
      const { container } = render(<LlmDialog open={true} size={size} />);
      expect(container.querySelector('.panel')).toHaveClass(`size-${size}`);
    }
  });

  it('renders with aria-modal on dialog element', () => {
    render(<LlmDialog open={true} />);
    expect(document.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});
