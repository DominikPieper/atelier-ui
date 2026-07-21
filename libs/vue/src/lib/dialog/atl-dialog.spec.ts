import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import AtlDialog from './atl-dialog.vue';
import AtlDialogHeader from './atl-dialog-header.vue';
import AtlDialogContent from './atl-dialog-content.vue';
import AtlDialogFooter from './atl-dialog-footer.vue';
import { covers } from '../../testing/behavior';

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
  components: { AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter },
  props: ['open'],
  emits: ['update:open'],
  template: `
    <AtlDialog :open="open" @update:open="$emit('update:open', $event)">
      <AtlDialogHeader>Dialog Title</AtlDialogHeader>
      <AtlDialogContent>Dialog body content.</AtlDialogContent>
      <AtlDialogFooter>Footer actions</AtlDialogFooter>
    </AtlDialog>
  `,
};

describe('AtlDialog', () => {
  covers('dialog', 'render-dialog-element')('renders dialog element', () => {
    const { container } = render(DialogFixture, { props: { open: false } });
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  covers('dialog', 'open-shows-modal')('calls showModal when open becomes true', async () => {
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

  covers('dialog', 'close-button')('close button emits update:open with false', async () => {
    const user = userEvent.setup();
    const { emitted } = render(DialogFixture, { props: { open: true } });
    const closeBtn = screen.getByRole('button', { name: 'Close dialog' });
    await user.click(closeBtn);
    expect(emitted()['update:open']).toEqual([[false]]);
  });

  covers('dialog', 'size-class')('applies size class to panel', () => {
    const { container } = render(AtlDialog, { props: { open: true, size: 'lg' } });
    expect(container.querySelector('.panel')).toHaveClass('size-lg');
  });

  covers('dialog', 'aria-modal')('sets aria-modal', () => {
    const { container } = render(AtlDialog, { props: { open: false } });
    expect(container.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('AtlDialogContent', () => {
  it('renders slot content', () => {
    render(AtlDialogContent, { slots: { default: 'Content here' } });
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});

describe('AtlDialogFooter', () => {
  it('renders slot content', () => {
    render(AtlDialogFooter, { slots: { default: 'Footer here' } });
    expect(screen.getByText('Footer here')).toBeInTheDocument();
  });
});
