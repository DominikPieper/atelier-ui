import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  LlmDrawer,
  LlmDrawerContent,
  LlmDrawerFooter,
  LlmDrawerHeader,
} from './llm-drawer';

const ALL_IMPORTS = [LlmDrawer, LlmDrawerHeader, LlmDrawerContent, LlmDrawerFooter];

// Polyfill HTMLDialogElement for jsdom
beforeAll(() => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  }
});

describe('LlmDrawer', () => {
  it('renders a <dialog> element with aria-modal="true"', async () => {
    const { container } = await render('<llm-drawer>Content</llm-drawer>', {
      imports: [LlmDrawer],
    });
    const dialog = container.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('does not have open attribute when open=false', async () => {
    const { container } = await render('<llm-drawer [open]="false">Content</llm-drawer>', {
      imports: [LlmDrawer],
    });
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('opens the drawer when open=true', async () => {
    const { container, fixture } = await render(
      '<llm-drawer [open]="true">Content</llm-drawer>',
      { imports: [LlmDrawer] }
    );
    fixture.detectChanges();
    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });

  it('applies is-open class to host when open=true', async () => {
    const { container } = await render('<llm-drawer [open]="true">Content</llm-drawer>', {
      imports: [LlmDrawer],
    });
    expect(container.querySelector('llm-drawer')).toHaveClass('is-open');
  });

  it('does not have is-open class when open=false', async () => {
    const { container } = await render('<llm-drawer [open]="false">Content</llm-drawer>', {
      imports: [LlmDrawer],
    });
    expect(container.querySelector('llm-drawer')).not.toHaveClass('is-open');
  });

  describe('position variants', () => {
    for (const position of ['left', 'right', 'top', 'bottom'] as const) {
      it(`applies position-${position} class to host`, async () => {
        const { container } = await render(
          `<llm-drawer position="${position}">Content</llm-drawer>`,
          { imports: [LlmDrawer] }
        );
        expect(container.querySelector('llm-drawer')).toHaveClass(`position-${position}`);
      });
    }
  });

  describe('size variants', () => {
    for (const size of ['sm', 'md', 'lg', 'full'] as const) {
      it(`applies size-${size} class to host`, async () => {
        const { container } = await render(
          `<llm-drawer size="${size}">Content</llm-drawer>`,
          { imports: [LlmDrawer] }
        );
        expect(container.querySelector('llm-drawer')).toHaveClass(`size-${size}`);
      });
    }
  });

  describe('close on backdrop click', () => {
    it('closes when clicking the <dialog> element with closeOnBackdrop=true', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-drawer [(open)]="open" [closeOnBackdrop]="true"><span>Content</span></llm-drawer>',
        { imports: [LlmDrawer], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('llm-drawer')).not.toHaveClass('is-open');
    });

    it('does not close when closeOnBackdrop=false', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-drawer [(open)]="open" [closeOnBackdrop]="false"><span>Content</span></llm-drawer>',
        { imports: [LlmDrawer], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('llm-drawer')).toHaveClass('is-open');
    });
  });

  describe('cancel event', () => {
    it('sets open to false when a cancel event fires', async () => {
      const { container } = await render(
        '<llm-drawer [(open)]="open">Content</llm-drawer>',
        { imports: [LlmDrawer], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      dialogEl.dispatchEvent(new Event('cancel', { bubbles: true, cancelable: true }));
      expect(container.querySelector('llm-drawer')).not.toHaveClass('is-open');
    });
  });

  describe('ARIA labelling', () => {
    it('sets aria-labelledby to the header id', async () => {
      const { container } = await render(
        `<llm-drawer>
          <llm-drawer-header>My Title</llm-drawer-header>
          <llm-drawer-content>Body</llm-drawer-content>
        </llm-drawer>`,
        { imports: ALL_IMPORTS }
      );
      const dialog = container.querySelector('dialog') as HTMLDialogElement;
      const header = container.querySelector('llm-drawer-header') as HTMLElement;
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
      expect(dialog.getAttribute('aria-labelledby')).toBe(header.getAttribute('id'));
    });
  });

  describe('close button', () => {
    it('renders a close button inside llm-drawer-header', async () => {
      const { container } = await render(
        `<llm-drawer [open]="true">
          <llm-drawer-header>Title</llm-drawer-header>
        </llm-drawer>`,
        { imports: ALL_IMPORTS }
      );
      const closeBtn = container.querySelector('.close-btn');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAttribute('aria-label', 'Close drawer');
    });

    it('closes the drawer when close button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-drawer [(open)]="open">
          <llm-drawer-header>Title</llm-drawer-header>
        </llm-drawer>`,
        { imports: ALL_IMPORTS, componentProperties: { open: true } }
      );
      const closeBtn = container.querySelector('.close-btn') as HTMLButtonElement;
      await user.click(closeBtn);
      expect(container.querySelector('llm-drawer')).not.toHaveClass('is-open');
    });
  });

  describe('content projection', () => {
    it('projects content into llm-drawer-header', async () => {
      await render(
        `<llm-drawer>
          <llm-drawer-header>Drawer Header Text</llm-drawer-header>
        </llm-drawer>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Drawer Header Text')).toBeInTheDocument();
    });

    it('projects content into llm-drawer-content', async () => {
      await render(
        `<llm-drawer>
          <llm-drawer-content>Drawer Body Text</llm-drawer-content>
        </llm-drawer>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Drawer Body Text')).toBeInTheDocument();
    });

    it('projects content into llm-drawer-footer', async () => {
      await render(
        `<llm-drawer>
          <llm-drawer-footer>Footer Text</llm-drawer-footer>
        </llm-drawer>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Footer Text')).toBeInTheDocument();
    });
  });
});
