import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmDialog, LlmDialogContent, LlmDialogFooter, LlmDialogHeader } from './llm-dialog';

const ALL_IMPORTS = [LlmDialog, LlmDialogHeader, LlmDialogContent, LlmDialogFooter];

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

describe('LlmDialog', () => {
  it('renders a <dialog> element with aria-modal="true"', async () => {
    const { container } = await render('<llm-dialog>Content</llm-dialog>', {
      imports: [LlmDialog],
    });
    const dialog = container.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('does not have open attribute when open=false', async () => {
    const { container } = await render('<llm-dialog [open]="false">Content</llm-dialog>', {
      imports: [LlmDialog],
    });
    expect(container.querySelector('dialog')).not.toHaveAttribute('open');
  });

  it('opens the dialog when open=true', async () => {
    const { container, fixture } = await render('<llm-dialog [open]="true">Content</llm-dialog>', {
      imports: [LlmDialog],
    });
    fixture.detectChanges();
    expect(container.querySelector('dialog')).toHaveAttribute('open');
  });

  it('applies is-open class to host when open=true', async () => {
    const { container } = await render('<llm-dialog [open]="true">Content</llm-dialog>', {
      imports: [LlmDialog],
    });
    expect(container.querySelector('llm-dialog')).toHaveClass('is-open');
  });

  it('does not have is-open class when open=false', async () => {
    const { container } = await render('<llm-dialog [open]="false">Content</llm-dialog>', {
      imports: [LlmDialog],
    });
    expect(container.querySelector('llm-dialog')).not.toHaveClass('is-open');
  });

  describe('size variants', () => {
    for (const size of ['sm', 'md', 'lg', 'xl', 'full'] as const) {
      it(`applies size-${size} class to .panel`, async () => {
        const { container } = await render(
          `<llm-dialog size="${size}">Content</llm-dialog>`,
          { imports: [LlmDialog] }
        );
        expect(container.querySelector('.panel')).toHaveClass(`size-${size}`);
      });
    }
  });

  describe('close on backdrop click', () => {
    it('closes when clicking the <dialog> element (backdrop) with closeOnBackdrop=true', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-dialog [(open)]="open" [closeOnBackdrop]="true"><span>Content</span></llm-dialog>',
        { imports: [LlmDialog], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('llm-dialog')).not.toHaveClass('is-open');
    });

    it('does not close when closeOnBackdrop=false', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-dialog [(open)]="open" [closeOnBackdrop]="false"><span>Content</span></llm-dialog>',
        { imports: [LlmDialog], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      await user.click(dialogEl);
      expect(container.querySelector('llm-dialog')).toHaveClass('is-open');
    });
  });

  describe('cancel event', () => {
    it('sets open to false when a cancel event fires', async () => {
      const { container } = await render(
        '<llm-dialog [(open)]="open">Content</llm-dialog>',
        { imports: [LlmDialog], componentProperties: { open: true } }
      );
      const dialogEl = container.querySelector('dialog') as HTMLDialogElement;
      dialogEl.dispatchEvent(new Event('cancel', { bubbles: true, cancelable: true }));
      expect(container.querySelector('llm-dialog')).not.toHaveClass('is-open');
    });
  });

  describe('ARIA labelling', () => {
    it('sets aria-labelledby to the header id by default', async () => {
      const { container } = await render(
        `<llm-dialog>
          <llm-dialog-header>My Title</llm-dialog-header>
          <llm-dialog-content>Body</llm-dialog-content>
        </llm-dialog>`,
        { imports: ALL_IMPORTS }
      );
      const dialog = container.querySelector('dialog') as HTMLDialogElement;
      const header = container.querySelector('llm-dialog-header') as HTMLElement;
      expect(dialog.getAttribute('aria-labelledby')).toBeTruthy();
      expect(dialog.getAttribute('aria-labelledby')).toBe(header.getAttribute('id'));
    });

    it('sets aria-label when aria-label input is provided', async () => {
      const { container } = await render(
        `<llm-dialog aria-label="Custom Label">Content</llm-dialog>`,
        { imports: [LlmDialog] }
      );
      expect(container.querySelector('dialog')).toHaveAttribute('aria-label', 'Custom Label');
    });

    it('does not set aria-labelledby when aria-label is provided', async () => {
      const { container } = await render(
        `<llm-dialog aria-label="Custom Label">Content</llm-dialog>`,
        { imports: [LlmDialog] }
      );
      expect(container.querySelector('dialog')).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('close button', () => {
    it('renders a close button inside llm-dialog-header', async () => {
      const { container } = await render(
        `<llm-dialog [open]="true">
          <llm-dialog-header>Title</llm-dialog-header>
        </llm-dialog>`,
        { imports: ALL_IMPORTS }
      );
      const closeBtn = container.querySelector('.close-btn');
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog');
    });

    it('closes the dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-dialog [(open)]="open">
          <llm-dialog-header>Title</llm-dialog-header>
        </llm-dialog>`,
        { imports: ALL_IMPORTS, componentProperties: { open: true } }
      );
      const closeBtn = container.querySelector('.close-btn') as HTMLButtonElement;
      await user.click(closeBtn);
      expect(container.querySelector('llm-dialog')).not.toHaveClass('is-open');
    });
  });

  describe('content projection', () => {
    it('projects content into llm-dialog-header', async () => {
      await render(
        `<llm-dialog>
          <llm-dialog-header>Dialog Header Text</llm-dialog-header>
        </llm-dialog>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Dialog Header Text')).toBeInTheDocument();
    });

    it('projects content into llm-dialog-content', async () => {
      await render(
        `<llm-dialog>
          <llm-dialog-content>Dialog Body Text</llm-dialog-content>
        </llm-dialog>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Dialog Body Text')).toBeInTheDocument();
    });

    it('projects content into llm-dialog-footer', async () => {
      await render(
        `<llm-dialog>
          <llm-dialog-footer>Footer Text</llm-dialog-footer>
        </llm-dialog>`,
        { imports: ALL_IMPORTS }
      );
      expect(screen.getByText('Footer Text')).toBeInTheDocument();
    });
  });
});
