import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmDialog from './llm-dialog.vue';
import LlmDialogHeader from './llm-dialog-header.vue';
import LlmDialogContent from './llm-dialog-content.vue';
import LlmDialogFooter from './llm-dialog-footer.vue';

// jsdom does not implement showModal/close natively; polyfill for tests
beforeEach(() => {
  HTMLDialogElement.prototype.showModal ??= function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ??= function () {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
});

const DialogFixture = {
  components: { LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter },
  props: ['open'],
  emits: ['update:open'],
  template: `
    <LlmDialog :open="open" @update:open="$emit('update:open', $event)">
      <LlmDialogHeader>Dialog Title</LlmDialogHeader>
      <LlmDialogContent>Dialog body content.</LlmDialogContent>
      <LlmDialogFooter>Footer actions</LlmDialogFooter>
    </LlmDialog>
  `,
};

describe('LlmDialog', () => {
  it('renders dialog element', () => {
    const { container } = render(DialogFixture, { props: { open: false } });
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  it('calls showModal when open becomes true', async () => {
    const { rerender } = render(DialogFixture, { props: { open: false } });
    await rerender({ open: true });
    const dialog = document.querySelector('dialog') as HTMLDialogElement;
    expect(dialog).toHaveAttribute('open');
  });

  it('renders header, content, and footer slots', () => {
    render(DialogFixture, { props: { open: true } });
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Dialog body content.')).toBeInTheDocument();
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });

  it('close button emits update:open with false', async () => {
    const user = userEvent.setup();
    const { emitted } = render(DialogFixture, { props: { open: true } });
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' });
    await user.click(closeBtn);
    expect(emitted()['update:open']).toEqual([[false]]);
  });

  it('applies size class to panel', () => {
    const { container } = render(LlmDialog, { props: { open: true, size: 'lg' } });
    expect(container.querySelector('.panel')).toHaveClass('size-lg');
  });

  it('sets aria-modal', () => {
    const { container } = render(LlmDialog, { props: { open: false } });
    expect(container.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('LlmDialogContent', () => {
  it('renders slot content', () => {
    render(LlmDialogContent, { slots: { default: 'Content here' } });
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});

describe('LlmDialogFooter', () => {
  it('renders slot content', () => {
    render(LlmDialogFooter, { slots: { default: 'Footer here' } });
    expect(screen.getByText('Footer here')).toBeInTheDocument();
  });
});
