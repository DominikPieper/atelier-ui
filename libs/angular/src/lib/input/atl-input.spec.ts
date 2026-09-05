import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlInput } from './atl-input';

describe('AtlInput', () => {
  covers('input', 'renders-input')('renders a native input element', async () => {
    const { container } = await render('<atl-input />', {
      imports: [AtlInput],
    });
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('defaults to type text', async () => {
    const { container } = await render('<atl-input />', {
      imports: [AtlInput],
    });
    expect(container.querySelector('input')).toHaveAttribute('type', 'text');
  });

  it('does not show errors by default', async () => {
    const { container } = await render('<atl-input />', {
      imports: [AtlInput],
    });
    expect(container.querySelector('.errors')).not.toBeInTheDocument();
  });

  describe('type input', () => {
    it.each(['text', 'email', 'password', 'number', 'tel', 'url'] as const)(
      'sets type="%s" on the native input',
      async (type) => {
        const { container } = await render(
          `<atl-input type="${type}" />`,
          { imports: [AtlInput] }
        );
        expect(container.querySelector('input')).toHaveAttribute('type', type);
      }
    );
  });

  describe('placeholder', () => {
    it('sets placeholder on the native input', async () => {
      const { container } = await render(
        '<atl-input placeholder="Enter email" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute(
        'placeholder',
        'Enter email'
      );
    });
  });

  describe('value binding', () => {
    covers('input', 'updates-value')('updates value when user types', async () => {
      const user = userEvent.setup();
      await render('<atl-input />', {
        imports: [AtlInput],
      });
      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');
      expect(input).toHaveValue('hello');
    });
  });

  describe('disabled state', () => {
    it('applies is-disabled class to host', async () => {
      const { container } = await render(
        '<atl-input [disabled]="true" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('atl-input')).toHaveClass('is-disabled');
    });

    covers('input', 'disabled')('sets disabled attribute on native input', async () => {
      const { container } = await render(
        '<atl-input [disabled]="true" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('input')).toBeDisabled();
    });
  });

  describe('readonly state', () => {
    it('applies is-readonly class to host', async () => {
      const { container } = await render(
        '<atl-input [readonly]="true" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('atl-input')).toHaveClass('is-readonly');
    });

    it('sets readOnly property on native input', async () => {
      const { container } = await render(
        '<atl-input [readonly]="true" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute('readonly');
    });
  });

  describe('invalid and error display', () => {
    covers('input', 'invalid')('applies is-invalid class when invalid', async () => {
      const { container } = await render(
        '<atl-input [invalid]="true" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('atl-input')).toHaveClass('is-invalid');
    });

    it('sets aria-invalid on native input when invalid', async () => {
      const { container } = await render(
        '<atl-input [invalid]="true" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    // Was 'does not show errors when not touched'. Gating on touched was an
    // Angular-only rule the spec never declared, so the same four fields showed
    // their errors at three different moments across the frameworks (ADR-0055).
    it('shows errors as soon as they are passed, without waiting to be touched', async () => {
      const { container } = await render(
        `<atl-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [AtlInput],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Field is required' }],
          },
        }
      );
      expect(container.querySelector('.errors')).toBeInTheDocument();
    });

    covers('input', 'errors')('shows error messages when touched and invalid', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<atl-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [AtlInput],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Field is required' }],
          },
        }
      );
      // Trigger touch by blurring the input
      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);
      await user.tab();

      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });

    it('renders each error as a paragraph with error-message class', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<atl-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [AtlInput],
          componentProperties: {
            errors: [
              { kind: 'required', message: 'Field is required' },
              { kind: 'email', message: 'Invalid email' },
            ],
          },
        }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);
      await user.tab();

      const messages = container.querySelectorAll('.error-message');
      expect(messages).toHaveLength(2);
    });

    it('sets aria-live on error container', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<atl-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [AtlInput],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Field is required' }],
          },
        }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);
      await user.tab();

      expect(container.querySelector('.errors')).toHaveAttribute(
        'aria-live',
        'polite'
      );
    });
  });

  describe('touched state', () => {
    it('applies is-touched class after blur', async () => {
      const user = userEvent.setup();
      const { container } = await render('<atl-input />', {
        imports: [AtlInput],
      });
      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);
      await user.tab();

      expect(container.querySelector('atl-input')).toHaveClass('is-touched');
    });

    it('does not have is-touched class before interaction', async () => {
      const { container } = await render('<atl-input />', {
        imports: [AtlInput],
      });
      expect(container.querySelector('atl-input')).not.toHaveClass(
        'is-touched'
      );
    });
  });

  describe('aria attributes', () => {
    it('sets aria-required when required', async () => {
      const { container } = await render(
        '<atl-input [required]="true" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute(
        'aria-required',
        'true'
      );
    });

    it('does not set aria-required when not required', async () => {
      const { container } = await render('<atl-input />', {
        imports: [AtlInput],
      });
      expect(container.querySelector('input')).not.toHaveAttribute(
        'aria-required'
      );
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render('<atl-input />', {
        imports: [AtlInput],
      });
      expect(container.querySelector('input')).not.toHaveAttribute(
        'aria-invalid'
      );
    });

    it('links aria-describedby to error container when errors visible', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<atl-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [AtlInput],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Required' }],
          },
        }
      );
      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);
      await user.tab();

      const describedBy = input.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(container.querySelector(`#${describedBy}`)).toBeInTheDocument();
    });
  });

  describe('label', () => {
    it('renders a label associated with the input', async () => {
      await render('<atl-input label="Email" />', { imports: [AtlInput] });
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('does not render a label when omitted', async () => {
      const { container } = await render('<atl-input />', {
        imports: [AtlInput],
      });
      expect(container.querySelector('label')).not.toBeInTheDocument();
    });

    it('lets a caller-supplied id win over the auto-generated one', async () => {
      await render(
        '<atl-input label="Email" id="custom-email-id" />',
        { imports: [AtlInput] }
      );
      // getByLabelText resolves the for/id association itself — it throws if
      // the label does not actually name this control, which a bare string
      // comparison of two `id` attributes would not catch (see the next
      // test: both attributes can read "custom-email-id" while pointing at
      // two different elements).
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'custom-email-id');
    });

    // Regression test for a real bug: Angular keeps a static `id="…"`
    // attribute on the HOST element even though `id` is also a declared
    // component input (unlike a `[id]="…"` property binding, which does not
    // reflect to the DOM). `<atl-input label="Email" id="email">` — the
    // static-attribute form a copy-pasted tutorial sample uses — therefore
    // put `id="email"` on both `<atl-input>` and the native `<input>`. The
    // host is not a labelable element and comes first in document order, so
    // `<label for="email">` resolved to nothing: `input.labels.length` was
    // 0 even though `container.querySelector('input')` had the "right"
    // `id` attribute string. Fixed by forcing the host's own `id` attribute
    // to always be absent (`host: { '[attr.id]': 'null' }`).
    it('does not duplicate a static id attribute onto the host, which would break label association', async () => {
      const { container } = await render(
        '<atl-input label="Email" id="custom-email-id" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('atl-input')).not.toHaveAttribute('id');
      // The real assertion: the label actually names the control. This is
      // exactly what broke before the fix, while a same-string comparison
      // of two `id` attributes kept passing.
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });
  });

  describe('aria-label', () => {
    // Regression test: `aria-label="…"` on `<atl-input>` matches the aliased
    // `ariaLabel` input AND used to stay as a literal attribute on the host
    // (same class of bug as the static `id` one above) — meaning the actual
    // native `<input>` stayed unnamed while the roleless host carried a
    // decoy aria-label nothing reads.
    it('forwards aria-label to the native input, not the host', async () => {
      const { container } = await render(
        '<atl-input aria-label="Search" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute(
        'aria-label',
        'Search'
      );
      expect(container.querySelector('atl-input')).not.toHaveAttribute(
        'aria-label'
      );
    });
  });

  describe('name attribute', () => {
    it('sets name attribute on native input', async () => {
      const { container } = await render(
        '<atl-input name="email" />',
        { imports: [AtlInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute('name', 'email');
    });

    it('does not set name attribute when not provided', async () => {
      const { container } = await render('<atl-input />', {
        imports: [AtlInput],
      });
      expect(container.querySelector('input')).not.toHaveAttribute('name');
    });
  });
});
