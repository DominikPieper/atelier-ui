import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import AtlDrawer from './atl-drawer.vue';
import AtlDrawerHeader from './atl-drawer-header.vue';
import AtlDrawerContent from './atl-drawer-content.vue';
import AtlDrawerFooter from './atl-drawer-footer.vue';
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

const DrawerFixture = {
  components: { AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter },
  props: ['open', 'position'],
  emits: ['update:open'],
  template: `
    <AtlDrawer :open="open" :position="position" @update:open="$emit('update:open', $event)">
      <AtlDrawerHeader>Drawer Title</AtlDrawerHeader>
      <AtlDrawerContent>Drawer body.</AtlDrawerContent>
      <AtlDrawerFooter>Drawer footer.</AtlDrawerFooter>
    </AtlDrawer>
  `,
};

describe('AtlDrawer', () => {
  covers('drawer', 'render-dialog-element')('renders a dialog element', () => {
    const { container } = render(DrawerFixture, { props: { open: false } });
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  covers('drawer', 'open-shows-modal')('calls showModal when open becomes true', async () => {
    const { rerender } = render(DrawerFixture, { props: { open: false } });
    await rerender({ open: true });
    expect(document.querySelector('dialog')).toHaveAttribute('open');
  });

  it('renders header, content, and footer slots', () => {
    render(DrawerFixture, { props: { open: true } });
    expect(screen.getByText('Drawer Title')).toBeInTheDocument();
    expect(screen.getByText('Drawer body.')).toBeInTheDocument();
    expect(screen.getByText('Drawer footer.')).toBeInTheDocument();
  });

  covers('drawer', 'close-button')('close button emits update:open with false', async () => {
    const user = userEvent.setup();
    const { emitted } = render(DrawerFixture, { props: { open: true } });
    const closeBtn = screen.getByRole('button', { name: 'Close drawer' });
    await user.click(closeBtn);
    expect(emitted()['update:open']).toEqual([[false]]);
  });

  it('applies position class', () => {
    const { container } = render(DrawerFixture, {
      props: { open: false, position: 'left' },
    });
    expect(container.querySelector('dialog')).toHaveClass('position-left');
  });

  it('applies size class', () => {
    const { container } = render(AtlDrawer, { props: { open: false, size: 'lg' } });
    expect(container.querySelector('dialog')).toHaveClass('size-lg');
  });

  covers('drawer', 'is-open-class')('applies is-open class when open', () => {
    const { container } = render(AtlDrawer, { props: { open: true } });
    expect(container.querySelector('dialog')).toHaveClass('is-open');
  });

  covers('drawer', 'aria-modal')('sets aria-modal', () => {
    const { container } = render(AtlDrawer, { props: { open: false } });
    expect(container.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('AtlDrawerContent', () => {
  it('renders slot content', () => {
    render(AtlDrawerContent, { slots: { default: 'Content here' } });
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});

describe('AtlDrawerFooter', () => {
  it('renders slot content', () => {
    render(AtlDrawerFooter, { slots: { default: 'Footer here' } });
    expect(screen.getByText('Footer here')).toBeInTheDocument();
  });
});
