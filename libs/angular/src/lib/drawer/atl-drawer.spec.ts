import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import {
  AtlDrawer,
  AtlDrawerContent,
  AtlDrawerFooter,
  AtlDrawerHeader,
} from './atl-drawer';
import { covers } from '../../testing/behavior';

const ALL_IMPORTS = [AtlDrawer, AtlDrawerHeader, AtlDrawerContent, AtlDrawerFooter];

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

describe('AtlDrawer', () => {
  covers('drawer', 'aria-modal')('sets aria-modal="true" on the dialog element', async () => {
    const { container } = await render('<atl-drawer>Content</atl-drawer>', {
      imports: [AtlDrawer],
    });
    expect(container.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  covers('drawer', 'render-dialog-element')('renders a <dialog> element with aria-modal="true"', async () => {
    const { container } = await render('<atl-drawer>Content</atl-drawer>', {
      imports: [AtlDrawer],
    });
    const dialog = container.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('does not have open attribute when open=false', async () => {
    const { container } = await render('<atl-drawer [open]="false">Content</atl-drawer>', {
      imports: [AtlDrawer],
    });
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  covers('drawer', 'open-shows-modal')('opens the drawer when open=true', async () => {
    const { container, fixture } = await render(
      '<atl-drawer [open]="true">Content</atl-drawer>',
      { imports: [AtlDrawer] }
    );
    fixture.detectChanges();
    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });

  covers('drawer', 'is-open-class')('applies is-open class to host when open=true', async () => {
    const { container } = await render('<atl-drawer [open]="true">Content</atl-drawer>', {
      imports: [AtlDrawer],
    });
    expect(container.querySelector('atl-drawer')).toHaveClass('is-open');
  });

  it('does not have is-open class when open=false', async () => {
    const { container } = await render('<atl-drawer [open]="false">Content</atl-drawer>', {
      imports: [AtlDrawer],
    });
    expect(container.querySelector('atl-drawer')).not.toHaveClass('is-open');
  });

  describe('position variants', () => {
    for (const position of ['left', 'right', 'top', 'bottom'] as const) {
      it(`applies position-${position} class to host`, async () => {
        const { container } = await render(
          `<atl-drawer position="${position}">Content</atl-drawer>`,
          { imports: [AtlDrawer] }
        );
        expect(container.querySelector('atl-drawer')).toHaveClass(`position-${position}`);
      });
    }
  });

  describe('size variants', () => {
    for (const size of ['sm', 'md', 'lg', 'full'] as const) {
      it(`applies size-${size} class to host`, async () => {
        const { container } = await render(
          `<atl-drawer size="${size}">Content</atl-drawer>`,
          { imports: [AtlDrawer] }
        );
        expect(container.querySelector('atl-drawer')).toHaveClass(`size-${size}`);
      });
    }
  });

  describe('close on backdrop click', () => {
    it('closes when clicking the <dialog> element with closeOnBackdrop=true', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<atl-drawer [(open)]="open" [closeOnBackdrop]="true"><span>Content</span></atl-drawer>',
        { imports: [AtlDrawer], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('atl-drawer')).not.toHaveClass('is-open');
    });

    it('does not close when closeOnBackdrop=false', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<atl-drawer [(open)]="open" [closeOnBackdrop]="false"><span>Content</span></atl-drawer>',
        { imports: [AtlDrawer], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('atl-drawer')).toHaveClass('is-open');
    });
  });

  describe('cancel event', () => {
    it('sets open to false when a cancel event fires', async () => {
      const { container } = await render(
        '<atl-drawer [(open)]="open">Content</atl-drawer>',
        { imports: [AtlDrawer], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      dialogEl.dispatchEvent(new Event('cancel', { bubbles: true, cancelable: true }));
      expect(container.querySelector('atl-drawer')).not.toHaveClass('is-open');
    });
  });

  describe('ARIA labelling', () => {
    it('sets aria-labelledby to the header id', async () => {
      const { container } = await render(
        `<atl-drawer>
          <atl-drawer-header>My Title</atl-drawer-header>
          <atl-drawer-content>Body</atl-drawer-content>
        </atl-drawer>`,
        { imports: ALL_IMPORTS }
      );
      const dialog = container.querySelector('dialog') as HTMLDialogElement;
      const header = container.querySelector('atl-drawer-header') as HTMLElement;
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
      expect(dialog.getAttribute('aria-labelledby')).toBe(header.getAttribute('id'));
    });
  });

  describe('close button', () => {
    it('renders a close button inside atl-drawer-header', async () => {
      const { container } = await render(
        `<atl-drawer [open]="true">
          <atl-drawer-header>Title</atl-drawer-header>
        </atl-drawer>`,
        { imports: ALL_IMPORTS }
      );
      const closeBtn = container.querySelector('.close-btn');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAttribute('aria-label', 'Close drawer');
    });

    covers('drawer', 'close-button')('closes the drawer when close button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<atl-drawer [(open)]="open">
          <atl-drawer-header>Title</atl-drawer-header>
        </atl-drawer>`,
        { imports: ALL_IMPORTS, componentProperties: { open: true } }
      );
      const closeBtn = container.querySelector('.close-btn') as HTMLButtonElement;
      await user.click(closeBtn);
      expect(container.querySelector('atl-drawer')).not.toHaveClass('is-open');
    });
  });

  describe('content projection', () => {
    it('projects content into atl-drawer-header', async () => {
      await render(
        `<atl-drawer>
          <atl-drawer-header>Drawer Header Text</atl-drawer-header>
        </atl-drawer>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Drawer Header Text')).toBeInTheDocument();
    });

    it('projects content into atl-drawer-content', async () => {
      await render(
        `<atl-drawer>
          <atl-drawer-content>Drawer Body Text</atl-drawer-content>
        </atl-drawer>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Drawer Body Text')).toBeInTheDocument();
    });

    it('projects content into atl-drawer-footer', async () => {
      await render(
        `<atl-drawer>
          <atl-drawer-footer>Footer Text</atl-drawer-footer>
        </atl-drawer>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Footer Text')).toBeInTheDocument();
    });
  });
});
