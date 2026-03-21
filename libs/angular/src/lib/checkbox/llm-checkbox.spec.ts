import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmCheckbox } from './llm-checkbox';

describe('LlmCheckbox', () => {
  it('renders a native checkbox input', async () => {
    const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
      imports: [LlmCheckbox],
    });
    expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
  });

  it('is unchecked by default', async () => {
    const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
      imports: [LlmCheckbox],
    });
    expect(container.querySelector('input[type="checkbox"]')).not.toBeChecked();
  });

  it('does not show errors by default', async () => {
    const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
      imports: [LlmCheckbox],
    });
    expect(container.querySelector('.errors')).not.toBeInTheDocument();
  });

  describe('checked state', () => {
    it('reflects checked=true via attribute', async () => {
      const { container } = await render(
        '<llm-checkbox [checked]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('input[type="checkbox"]')).toBeChecked();
    });

    it('applies is-checked class when checked', async () => {
      const { container } = await render(
        '<llm-checkbox [checked]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('llm-checkbox')).toHaveClass('is-checked');
    });

    it('toggles checked when clicked', async () => {
      const user = userEvent.setup();
      const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
        imports: [LlmCheckbox],
      });
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      await user.click(input);
      expect(input).toBeChecked();
      await user.click(input);
      expect(input).not.toBeChecked();
    });
  });

  describe('disabled state', () => {
    it('disables the native input', async () => {
      const { container } = await render(
        '<llm-checkbox [disabled]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('input[type="checkbox"]')).toBeDisabled();
    });

    it('applies is-disabled class to host', async () => {
      const { container } = await render(
        '<llm-checkbox [disabled]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('llm-checkbox')).toHaveClass('is-disabled');
    });
  });

  describe('invalid state', () => {
    it('sets aria-invalid on native input', async () => {
      const { container } = await render(
        '<llm-checkbox [invalid]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('input[type="checkbox"]')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('applies is-invalid class to host', async () => {
      const { container } = await render(
        '<llm-checkbox [invalid]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('llm-checkbox')).toHaveClass('is-invalid');
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
        imports: [LlmCheckbox],
      });
      expect(container.querySelector('input[type="checkbox"]')).not.toHaveAttribute(
        'aria-invalid'
      );
    });
  });

  describe('required state', () => {
    it('sets aria-required when required', async () => {
      const { container } = await render(
        '<llm-checkbox [required]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('input[type="checkbox"]')).toHaveAttribute(
        'aria-required',
        'true'
      );
    });

    it('does not set aria-required when not required', async () => {
      const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
        imports: [LlmCheckbox],
      });
      expect(container.querySelector('input[type="checkbox"]')).not.toHaveAttribute(
        'aria-required'
      );
    });
  });

  describe('touched state', () => {
    it('applies is-touched class after blur', async () => {
      const user = userEvent.setup();
      const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
        imports: [LlmCheckbox],
      });
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      await user.click(input);
      await user.tab();
      expect(container.querySelector('llm-checkbox')).toHaveClass('is-touched');
    });

    it('does not have is-touched class before interaction', async () => {
      const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
        imports: [LlmCheckbox],
      });
      expect(container.querySelector('llm-checkbox')).not.toHaveClass('is-touched');
    });
  });

  describe('error display', () => {
    it('does not show errors when not touched', async () => {
      const { container } = await render(
        '<llm-checkbox [invalid]="true" [errors]="errors">Label</llm-checkbox>',
        {
          imports: [LlmCheckbox],
          componentProperties: {
            errors: [{ kind: 'required', message: 'This field is required' }],
          },
        }
      );
      expect(container.querySelector('.errors')).not.toBeInTheDocument();
    });

    it('shows errors when touched and invalid', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-checkbox [invalid]="true" [errors]="errors">Label</llm-checkbox>',
        {
          imports: [LlmCheckbox],
          componentProperties: {
            errors: [{ kind: 'required', message: 'This field is required' }],
          },
        }
      );
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      await user.click(input);
      await user.tab();
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('links aria-describedby to error container when errors visible', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-checkbox [invalid]="true" [errors]="errors">Label</llm-checkbox>',
        {
          imports: [LlmCheckbox],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Required' }],
          },
        }
      );
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      await user.click(input);
      await user.tab();

      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(container.querySelector(`#${describedBy}`)).toBeInTheDocument();
    });

    it('does not set aria-describedby before errors are visible', async () => {
      const { container } = await render(
        '<llm-checkbox [invalid]="true" [errors]="errors">Label</llm-checkbox>',
        {
          imports: [LlmCheckbox],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Required' }],
          },
        }
      );
      expect(
        container.querySelector('input[type="checkbox"]')
      ).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('name attribute', () => {
    it('sets name on native input', async () => {
      const { container } = await render(
        '<llm-checkbox name="terms">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      expect(container.querySelector('input[type="checkbox"]')).toHaveAttribute(
        'name',
        'terms'
      );
    });

    it('does not set name when not provided', async () => {
      const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
        imports: [LlmCheckbox],
      });
      expect(
        container.querySelector('input[type="checkbox"]')
      ).not.toHaveAttribute('name');
    });
  });

  describe('indeterminate state', () => {
    it('sets the indeterminate DOM property when true', async () => {
      const { container } = await render(
        '<llm-checkbox [indeterminate]="true">Label</llm-checkbox>',
        { imports: [LlmCheckbox] }
      );
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input.indeterminate).toBe(true);
    });

    it('does not set indeterminate by default', async () => {
      const { container } = await render('<llm-checkbox>Label</llm-checkbox>', {
        imports: [LlmCheckbox],
      });
      const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(input.indeterminate).toBe(false);
    });
  });
});
