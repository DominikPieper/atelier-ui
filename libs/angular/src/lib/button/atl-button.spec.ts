/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlButton } from './atl-button';

describe('AtlButton', () => {
  covers('button', 'default-render')(
    'renders without error with default inputs',
    async () => {
      await render('<button atl-button>Click me</button>', {
        imports: [AtlButton],
      });
      expect(screen.getByText('Click me')).toBeInTheDocument();
    },
  );

  describe('root class', () => {
    // The shared stylesheet (libs/styles) is scoped by `.atl-button`, and the button
    // also binds `[class]`. A static class and a class binding on one host must
    // merge, not replace each other — across input changes too.
    it('keeps the static atl-button class alongside the bound classes', async () => {
      const { container, rerender } = await render(
        '<button atl-button [variant]="variant" [disabled]="disabled">Btn</button>',
        {
          imports: [AtlButton],
          componentProperties: { variant: 'primary', disabled: false },
        },
      );
      const host = container.querySelector('button')!;
      expect(host).toHaveClass('atl-button', 'variant-primary', 'size-md');
      expect(host).not.toHaveClass('is-disabled');

      await rerender({
        componentProperties: { variant: 'danger', disabled: true },
      });
      expect(host).toHaveClass(
        'atl-button',
        'variant-danger',
        'size-md',
        'is-disabled',
      );
      expect(host).not.toHaveClass('variant-primary');
    });
  });

  describe('variant classes', () => {
    it.each(['primary', 'secondary', 'outline', 'danger'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<button atl-button variant="${variant}">Btn</button>`,
          { imports: [AtlButton] },
        );
        expect(container.querySelector('button')).toHaveClass(
          `variant-${variant}`,
        );
      },
    );
  });

  describe('size classes', () => {
    it.each(['sm', 'md', 'lg'] as const)(
      'applies size-%s class to host',
      async (size) => {
        const { container } = await render(
          `<button atl-button size="${size}">Btn</button>`,
          { imports: [AtlButton] },
        );
        expect(container.querySelector('button')).toHaveClass(`size-${size}`);
      },
    );
  });

  describe('disabled state', () => {
    covers('button', 'disabled-state')(
      'sets aria-disabled when disabled input is true',
      async () => {
        const { container } = await render(
          '<button atl-button [disabled]="true">Btn</button>',
          { imports: [AtlButton] },
        );
        expect(container.querySelector('button')).toHaveAttribute(
          'aria-disabled',
          'true',
        );
      },
    );

    it('sets the native disabled attribute and aria-disabled when disabled', async () => {
      const { container } = await render(
        '<button atl-button [disabled]="true">Btn</button>',
        { imports: [AtlButton] },
      );
      expect(container.querySelector('button')).toBeDisabled();
      expect(container.querySelector('button')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('is enabled and carries no aria-disabled by default', async () => {
      const { container } = await render('<button atl-button>Btn</button>', {
        imports: [AtlButton],
      });
      expect(container.querySelector('button')).toBeEnabled();
      expect(container.querySelector('button')).not.toHaveAttribute(
        'aria-disabled',
      );
    });

    it('applies is-disabled class when disabled', async () => {
      const { container } = await render(
        '<button atl-button [disabled]="true">Btn</button>',
        { imports: [AtlButton] },
      );
      expect(container.querySelector('button')).toHaveClass('is-disabled');
    });
  });

  describe('loading state', () => {
    covers('button', 'loading-spinner')(
      'renders spinner when loading',
      async () => {
        const { container } = await render(
          '<button atl-button [loading]="true">Btn</button>',
          { imports: [AtlButton] },
        );
        expect(container.querySelector('.spinner')).toBeInTheDocument();
      },
    );

    it('sets the native disabled attribute when loading', async () => {
      const { container } = await render(
        '<button atl-button [loading]="true">Btn</button>',
        { imports: [AtlButton] },
      );
      expect(container.querySelector('button')).toBeDisabled();
    });

    it('sets aria-disabled when loading', async () => {
      const { container } = await render(
        '<button atl-button [loading]="true">Btn</button>',
        { imports: [AtlButton] },
      );
      expect(container.querySelector('button')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('applies is-loading class when loading', async () => {
      const { container } = await render(
        '<button atl-button [loading]="true">Btn</button>',
        { imports: [AtlButton] },
      );
      expect(container.querySelector('button')).toHaveClass('is-loading');
    });
  });

  it('projects slotted content into the button', async () => {
    await render('<button atl-button>Save Changes</button>', {
      imports: [AtlButton],
    });
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  covers('button', 'click-emits')(
    'emits native click events when not disabled',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = await render(
        '<button atl-button (click)="onClick()">Click me</button>',
        { imports: [AtlButton], componentProperties: { onClick } },
      );
      await user.click(container.querySelector('button')!);
      expect(onClick).toHaveBeenCalledOnce();
    },
  );

  covers('button', 'disabled-no-click')(
    'does not emit click when disabled',
    async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const { container } = await render(
        '<button atl-button [disabled]="true" (click)="onClick()">Click me</button>',
        { imports: [AtlButton], componentProperties: { onClick } },
      );
      await user.click(container.querySelector('button')!);
      expect(onClick).not.toHaveBeenCalled();
    },
  );

  describe('native button behaviour', () => {
    it('is a native button without role="button"', async () => {
      await render('<button atl-button>Save</button>', {
        imports: [AtlButton],
      });
      const btn = screen.getByRole('button', { name: 'Save' });
      expect(btn.tagName).toBe('BUTTON');
      expect(btn).not.toHaveAttribute('role');
    });

    it('defaults to type="button" so it never submits a form by accident', async () => {
      await render('<button atl-button>Save</button>', {
        imports: [AtlButton],
      });
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
    });

    it('reflects the type input', async () => {
      await render('<button atl-button type="submit">Save</button>', {
        imports: [AtlButton],
      });
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });

    it('is reachable with Tab', async () => {
      const user = userEvent.setup();
      await render('<button atl-button>Save</button>', {
        imports: [AtlButton],
      });
      await user.tab();
      expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
    });

    it('is skipped by Tab when disabled', async () => {
      const user = userEvent.setup();
      await render('<button atl-button [disabled]="true">Save</button>', {
        imports: [AtlButton],
      });
      await user.tab();
      expect(screen.getByRole('button')).not.toHaveFocus();
    });

    it('submits the enclosing form when type="submit"', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((e: Event) => e.preventDefault());
      await render(
        '<form (submit)="onSubmit($event)"><button atl-button type="submit">Send</button></form>',
        { imports: [AtlButton], componentProperties: { onSubmit } },
      );
      await user.click(screen.getByRole('button', { name: 'Send' }));
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    it('submits the enclosing form from the keyboard (Enter)', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((e: Event) => e.preventDefault());
      await render(
        '<form (submit)="onSubmit($event)"><button atl-button type="submit">Send</button></form>',
        { imports: [AtlButton], componentProperties: { onSubmit } },
      );
      await user.tab();
      await user.keyboard('{Enter}');
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    it('does not submit the form by default (type="button")', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((e: Event) => e.preventDefault());
      await render(
        '<form (submit)="onSubmit($event)"><button atl-button>Send</button></form>',
        { imports: [AtlButton], componentProperties: { onSubmit } },
      );
      await user.click(screen.getByRole('button', { name: 'Send' }));
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it.each([
      ['disabled', '[disabled]="true"'],
      ['loading', '[loading]="true"'],
    ])('does not submit the form or click when %s', async (_name, bind) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((e: Event) => e.preventDefault());
      const onClick = vi.fn();
      await render(
        `<form (submit)="onSubmit($event)"><button atl-button type="submit" ${bind} (click)="onClick()">Send</button></form>`,
        { imports: [AtlButton], componentProperties: { onSubmit, onClick } },
      );
      await user.click(screen.getByRole('button'));
      expect(onClick).not.toHaveBeenCalled();
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
