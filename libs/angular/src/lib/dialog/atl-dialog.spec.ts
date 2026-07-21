import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { AtlDialog, AtlDialogContent, AtlDialogFooter, AtlDialogHeader } from './atl-dialog';
import { covers } from '../../testing/behavior';

const ALL_IMPORTS = [AtlDialog, AtlDialogHeader, AtlDialogContent, AtlDialogFooter];

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

describe('AtlDialog', () => {
  covers('dialog', 'aria-modal')('sets aria-modal="true" on the dialog element', async () => {
    const { container } = await render('<atl-dialog>Content</atl-dialog>', {
      imports: [AtlDialog],
    });
    expect(container.querySelector('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  covers('dialog', 'render-dialog-element')('renders a <dialog> element with aria-modal="true"', async () => {
    const { container } = await render('<atl-dialog>Content</atl-dialog>', {
      imports: [AtlDialog],
    });
    const dialog = container.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('does not have open attribute when open=false', async () => {
    const { container } = await render('<atl-dialog [open]="false">Content</atl-dialog>', {
      imports: [AtlDialog],
    });
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  covers('dialog', 'open-shows-modal')('opens the dialog when open=true', async () => {
    const { container, fixture } = await render('<atl-dialog [open]="true">Content</atl-dialog>', {
      imports: [AtlDialog],
    });
    fixture.detectChanges();
    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });

  it('applies is-open class to host when open=true', async () => {
    const { container } = await render('<atl-dialog [open]="true">Content</atl-dialog>', {
      imports: [AtlDialog],
    });
    expect(container.querySelector('atl-dialog')).toHaveClass('is-open');
  });

  it('does not have is-open class when open=false', async () => {
    const { container } = await render('<atl-dialog [open]="false">Content</atl-dialog>', {
      imports: [AtlDialog],
    });
    expect(container.querySelector('atl-dialog')).not.toHaveClass('is-open');
  });

  describe('size variants', () => {
    for (const size of ['sm', 'md', 'lg', 'xl', 'full'] as const) {
      covers('dialog', 'size-class')(`applies size-${size} class to .panel`, async () => {
        const { container } = await render(
          `<atl-dialog size="${size}">Content</atl-dialog>`,
          { imports: [AtlDialog] }
        );
        expect(container.querySelector('.panel')).toHaveClass(`size-${size}`);
      });
    }
  });

  describe('close on backdrop click', () => {
    it('closes when clicking the <dialog> element (backdrop) with closeOnBackdrop=true', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<atl-dialog [(open)]="open" [closeOnBackdrop]="true"><span>Content</span></atl-dialog>',
        { imports: [AtlDialog], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('atl-dialog')).not.toHaveClass('is-open');
    });

    it('does not close when closeOnBackdrop=false', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<atl-dialog [(open)]="open" [closeOnBackdrop]="false"><span>Content</span></atl-dialog>',
        { imports: [AtlDialog], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('atl-dialog')).toHaveClass('is-open');
    });
  });

  describe('cancel event', () => {
    it('sets open to false when a cancel event fires', async () => {
      const { container } = await render(
        '<atl-dialog [(open)]="open">Content</atl-dialog>',
        { imports: [AtlDialog], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      dialogEl.dispatchEvent(new Event('cancel', { bubbles: true, cancelable: true }));
      expect(container.querySelector('atl-dialog')).not.toHaveClass('is-open');
    });
  });

  describe('ARIA labelling', () => {
    it('sets aria-labelledby to the header id by default', async () => {
      const { container } = await render(
        `<atl-dialog>
          <atl-dialog-header>My Title</atl-dialog-header>
          <atl-dialog-content>Body</atl-dialog-content>
        </atl-dialog>`,
        { imports: ALL_IMPORTS }
      );
      const dialog = container.querySelector('dialog') as HTMLDialogElement;
      const header = container.querySelector('atl-dialog-header') as HTMLElement;
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
      expect(dialog.getAttribute('aria-labelledby')).toBe(header.getAttribute('id'));
    });

    it('sets aria-label when aria-label input is provided', async () => {
      const { container } = await render(
        `<atl-dialog aria-label="Custom Label">Content</atl-dialog>`,
        { imports: [AtlDialog] }
      );
      expect(container.querySelector('dialog')).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('does not set aria-labelledby when aria-label is provided', async () => {
      const { container } = await render(
        `<atl-dialog aria-label="Custom Label">Content</atl-dialog>`,
        { imports: [AtlDialog] }
      );
      expect(container.querySelector('dialog')).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('close button', () => {
    it('renders a close button inside atl-dialog-header', async () => {
      const { container } = await render(
        `<atl-dialog [open]="true">
          <atl-dialog-header>Title</atl-dialog-header>
        </atl-dialog>`,
        { imports: ALL_IMPORTS }
      );
      const closeBtn = container.querySelector('.close-btn');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog');
    });

    covers('dialog', 'close-button')('closes the dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<atl-dialog [(open)]="open">
          <atl-dialog-header>Title</atl-dialog-header>
        </atl-dialog>`,
        { imports: ALL_IMPORTS, componentProperties: { open: true } }
      );
      const closeBtn = container.querySelector('.close-btn') as HTMLButtonElement;
      await user.click(closeBtn);
      expect(container.querySelector('atl-dialog')).not.toHaveClass('is-open');
    });
  });

  describe('content projection', () => {
    it('projects content into atl-dialog-header', async () => {
      await render(
        `<atl-dialog>
          <atl-dialog-header>Dialog Header Text</atl-dialog-header>
        </atl-dialog>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Dialog Header Text')).toBeInTheDocument();
    });

    it('projects content into atl-dialog-content', async () => {
      await render(
        `<atl-dialog>
          <atl-dialog-content>Dialog Body Text</atl-dialog-content>
        </atl-dialog>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Dialog Body Text')).toBeInTheDocument();
    });

    it('projects content into atl-dialog-footer', async () => {
      await render(
        `<atl-dialog>
          <atl-dialog-footer>Footer Text</atl-dialog-footer>
        </atl-dialog>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Footer Text')).toBeInTheDocument();
    });
  });
});
