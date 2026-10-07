import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlCheckbox } from './atl-checkbox';

describe('AtlCheckbox', () => {
  it('keeps the static atl-checkbox class alongside the bound classes', async () => {
    // The shared stylesheet (libs/styles) is scoped by `.atl-checkbox`, and the host
    // also binds `[class]`; the two must merge, across input changes too.
    const { container, rerender } = await render(
      '<atl-checkbox [disabled]="disabled">Label</atl-checkbox>',
      { imports: [AtlCheckbox], componentProperties: { disabled: false } },
    );
    const host = container.querySelector('atl-checkbox') as HTMLElement;
    expect(host).toHaveClass('atl-checkbox');

    await rerender({ componentProperties: { disabled: true } });
    expect(host).toHaveClass('atl-checkbox', 'is-disabled');
  });

  it('renders a native checkbox input', async () => {
    const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
      imports: [AtlCheckbox],
    });
    expect(
      container.querySelector('input[type="checkbox"]'),
    ).toBeInTheDocument();
  });

  it('is unchecked by default', async () => {
    const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
      imports: [AtlCheckbox],
    });
    expect(container.querySelector('input[type="checkbox"]')).not.toBeChecked();
  });

  it('does not show errors by default', async () => {
    const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
      imports: [AtlCheckbox],
    });
    expect(container.querySelector('.errors')).not.toBeInTheDocument();
  });

  describe('checked state', () => {
    covers('checkbox', 'reflects-checked')(
      'reflects checked=true via attribute',
      async () => {
        const { container } = await render(
          '<atl-checkbox [checked]="true">Label</atl-checkbox>',
          { imports: [AtlCheckbox] },
        );
        expect(container.querySelector('input[type="checkbox"]')).toBeChecked();
      },
    );

    it('applies is-checked class when checked', async () => {
      const { container } = await render(
        '<atl-checkbox [checked]="true">Label</atl-checkbox>',
        { imports: [AtlCheckbox] },
      );
      expect(container.querySelector('atl-checkbox')).toHaveClass('is-checked');
    });

    covers('checkbox', 'toggle-emits')(
      'toggles checked when clicked',
      async () => {
        const user = userEvent.setup();
        const { container } = await render(
          '<atl-checkbox>Label</atl-checkbox>',
          {
            imports: [AtlCheckbox],
          },
        );
        const input = container.querySelector(
          'input[type="checkbox"]',
        ) as HTMLInputElement;
        await user.click(input);
        expect(input).toBeChecked();
        await user.click(input);
        expect(input).not.toBeChecked();
      },
    );
  });

  describe('disabled state', () => {
    covers('checkbox', 'disabled')('disables the native input', async () => {
      const { container } = await render(
        '<atl-checkbox [disabled]="true">Label</atl-checkbox>',
        { imports: [AtlCheckbox] },
      );
      expect(container.querySelector('input[type="checkbox"]')).toBeDisabled();
    });

    it('applies is-disabled class to host', async () => {
      const { container } = await render(
        '<atl-checkbox [disabled]="true">Label</atl-checkbox>',
        { imports: [AtlCheckbox] },
      );
      expect(container.querySelector('atl-checkbox')).toHaveClass(
        'is-disabled',
      );
    });
  });

  describe('invalid state', () => {
    covers('checkbox', 'invalid')(
      'sets aria-invalid on native input',
      async () => {
        const { container } = await render(
          '<atl-checkbox [invalid]="true">Label</atl-checkbox>',
          { imports: [AtlCheckbox] },
        );
        expect(
          container.querySelector('input[type="checkbox"]'),
        ).toHaveAttribute('aria-invalid', 'true');
      },
    );

    it('applies is-invalid class to host', async () => {
      const { container } = await render(
        '<atl-checkbox [invalid]="true">Label</atl-checkbox>',
        { imports: [AtlCheckbox] },
      );
      expect(container.querySelector('atl-checkbox')).toHaveClass('is-invalid');
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
        imports: [AtlCheckbox],
      });
      expect(
        container.querySelector('input[type="checkbox"]'),
      ).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('required state', () => {
    it('sets aria-required when required', async () => {
      const { container } = await render(
        '<atl-checkbox [required]="true">Label</atl-checkbox>',
        { imports: [AtlCheckbox] },
      );
      expect(container.querySelector('input[type="checkbox"]')).toHaveAttribute(
        'aria-required',
        'true',
      );
    });

    it('does not set aria-required when not required', async () => {
      const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
        imports: [AtlCheckbox],
      });
      expect(
        container.querySelector('input[type="checkbox"]'),
      ).not.toHaveAttribute('aria-required');
    });
  });

  describe('touched state', () => {
    it('applies is-touched class after blur', async () => {
      const user = userEvent.setup();
      const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
        imports: [AtlCheckbox],
      });
      const input = container.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      await user.click(input);
      await user.tab();
      expect(container.querySelector('atl-checkbox')).toHaveClass('is-touched');
    });

    it('does not have is-touched class before interaction', async () => {
      const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
        imports: [AtlCheckbox],
      });
      expect(container.querySelector('atl-checkbox')).not.toHaveClass(
        'is-touched',
      );
    });
  });

  describe('error display', () => {
    // Was 'does not show errors when not touched'. Gating on touched was an
    // Angular-only rule the spec never declared, so the same four fields showed
    // their errors at three different moments across the frameworks (ADR-0055).
    it('shows errors as soon as they are passed, without waiting to be touched', async () => {
      const { container } = await render(
        '<atl-checkbox [invalid]="true" [errors]="errors">Label</atl-checkbox>',
        {
          imports: [AtlCheckbox],
          componentProperties: {
            errors: [{ kind: 'required', message: 'This field is required' }],
          },
        },
      );
      expect(container.querySelector('.errors')).toBeInTheDocument();
    });

    covers('checkbox', 'errors')(
      'shows errors when touched and invalid',
      async () => {
        const user = userEvent.setup();
        const { container } = await render(
          '<atl-checkbox [invalid]="true" [errors]="errors">Label</atl-checkbox>',
          {
            imports: [AtlCheckbox],
            componentProperties: {
              errors: [{ kind: 'required', message: 'This field is required' }],
            },
          },
        );
        const input = container.querySelector(
          'input[type="checkbox"]',
        ) as HTMLInputElement;
        await user.click(input);
        await user.tab();
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      },
    );

    it('links aria-describedby to error container when errors visible', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<atl-checkbox [invalid]="true" [errors]="errors">Label</atl-checkbox>',
        {
          imports: [AtlCheckbox],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Required' }],
          },
        },
      );
      const input = container.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      await user.click(input);
      await user.tab();

      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(container.querySelector(`#${describedBy}`)).toBeInTheDocument();
    });

    it('sets aria-describedby as soon as errors are passed', async () => {
      const { container } = await render(
        '<atl-checkbox [invalid]="true" [errors]="errors">Label</atl-checkbox>',
        {
          imports: [AtlCheckbox],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Required' }],
          },
        },
      );
      expect(container.querySelector('input[type="checkbox"]')).toHaveAttribute(
        'aria-describedby',
      );
    });
  });

  describe('name attribute', () => {
    it('sets name on native input', async () => {
      const { container } = await render(
        '<atl-checkbox name="terms">Label</atl-checkbox>',
        { imports: [AtlCheckbox] },
      );
      expect(container.querySelector('input[type="checkbox"]')).toHaveAttribute(
        'name',
        'terms',
      );
    });

    it('does not set name when not provided', async () => {
      const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
        imports: [AtlCheckbox],
      });
      expect(
        container.querySelector('input[type="checkbox"]'),
      ).not.toHaveAttribute('name');
    });
  });

  describe('indeterminate state', () => {
    covers('checkbox', 'indeterminate')(
      'sets the indeterminate DOM property when true',
      async () => {
        const { container } = await render(
          '<atl-checkbox [indeterminate]="true">Label</atl-checkbox>',
          { imports: [AtlCheckbox] },
        );
        const input = container.querySelector(
          'input[type="checkbox"]',
        ) as HTMLInputElement;
        expect(input.indeterminate).toBe(true);
      },
    );

    it('does not set indeterminate by default', async () => {
      const { container } = await render('<atl-checkbox>Label</atl-checkbox>', {
        imports: [AtlCheckbox],
      });
      const input = container.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      expect(input.indeterminate).toBe(false);
    });
  });

  describe('id', () => {
    // A static `id="…"` stays on the host even though `id` is also an input
    // (host-attr-guard, ADR-0091): without `'[attr.id]': 'null'` the host and the
    // native input would both carry it and `<label for>` would resolve to the host.
    it('lets an external <label for> reach the native input, with the id on it exactly once', async () => {
      await render(
        '<label for="ext-id">External</label><atl-checkbox id="ext-id">Inner</atl-checkbox>',
        { imports: [AtlCheckbox] },
      );
      const input = screen.getByLabelText('External');
      expect(input.tagName).toBe('INPUT');
      expect(document.querySelectorAll('#ext-id')).toHaveLength(1);
      expect(document.querySelector('atl-checkbox')).not.toHaveAttribute('id');
    });

    it('keeps a generated id, linked to its own label, when no id is given', async () => {
      await render('<atl-checkbox>Inner</atl-checkbox>', {
        imports: [AtlCheckbox],
      });
      const input = screen.getByLabelText('Inner');
      expect(input.id).not.toBe('');
    });
  });
});
