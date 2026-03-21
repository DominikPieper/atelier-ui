import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmDrawer from './llm-drawer.vue';
import LlmDrawerHeader from './llm-drawer-header.vue';
import LlmDrawerContent from './llm-drawer-content.vue';
import LlmDrawerFooter from './llm-drawer-footer.vue';

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
  components: { LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter },
  props: ['open', 'position'],
  emits: ['update:open'],
  template: `
    <LlmDrawer :open="open" :position="position" @update:open="$emit('update:open', $event)">
      <LlmDrawerHeader>Drawer Title</LlmDrawerHeader>
      <LlmDrawerContent>Drawer body.</LlmDrawerContent>
      <LlmDrawerFooter>Drawer footer.</LlmDrawerFooter>
    </LlmDrawer>
  `,
};

describe('LlmDrawer', () => {
  it('renders a dialog element', () => {
    const { container } = render(DrawerFixture, { props: { open: false } });
    expect(container.querySelector('dialog')).toBeInTheDocument();
  });

  it('calls showModal when open becomes true', async () => {
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

  it('close button emits update:open with false', async () => {
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
    const { container } = render(LlmDrawer, { props: { open: false, size: 'lg' } });
    expect(container.querySelector('dialog')).toHaveClass('size-lg');
  });

  it('applies is-open class when open', () => {
    const { container } = render(LlmDrawer, { props: { open: true } });
    expect(container.querySelector('dialog')).toHaveClass('is-open');
  });

  it('sets aria-modal', () => {
    const { container } = render(LlmDrawer, { props: { open: false } });
    expect(container.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });
});

describe('LlmDrawerContent', () => {
  it('renders slot content', () => {
    render(LlmDrawerContent, { slots: { default: 'Content here' } });
    expect(screen.getByText('Content here')).toBeInTheDocument();
  });
});

describe('LlmDrawerFooter', () => {
  it('renders slot content', () => {
    render(LlmDrawerFooter, { slots: { default: 'Footer here' } });
    expect(screen.getByText('Footer here')).toBeInTheDocument();
  });
});
