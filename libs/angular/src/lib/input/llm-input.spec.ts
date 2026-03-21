import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmInput } from './llm-input';

describe('LlmInput', () => {
  it('renders a native input element', async () => {
    const { container } = await render('<llm-input />', {
      imports: [LlmInput],
    });
    expect(container.querySelector('input')).toBeInTheDocument();
  });

  it('defaults to type text', async () => {
    const { container } = await render('<llm-input />', {
      imports: [LlmInput],
    });
    expect(container.querySelector('input')).toHaveAttribute('type', 'text');
  });

  it('does not show errors by default', async () => {
    const { container } = await render('<llm-input />', {
      imports: [LlmInput],
    });
    expect(container.querySelector('.errors')).not.toBeInTheDocument();
  });

  describe('type input', () => {
    it.each(['text', 'email', 'password', 'number', 'tel', 'url'] as const)(
      'sets type="%s" on the native input',
      async (type) => {
        const { container } = await render(
          `<llm-input type="${type}" />`,
          { imports: [LlmInput] }
        );
        expect(container.querySelector('input')).toHaveAttribute('type', type);
      }
    );
  });

  describe('placeholder', () => {
    it('sets placeholder on the native input', async () => {
      const { container } = await render(
        '<llm-input placeholder="Enter email" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute(
        'placeholder',
        'Enter email'
      );
    });
  });

  describe('value binding', () => {
    it('updates value when user types', async () => {
      const user = userEvent.setup();
      await render('<llm-input />', {
        imports: [LlmInput],
      });
      const input = screen.getByRole('textbox');
      await user.type(input, 'hello');
      expect(input).toHaveValue('hello');
    });
  });

  describe('disabled state', () => {
    it('applies is-disabled class to host', async () => {
      const { container } = await render(
        '<llm-input [disabled]="true" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('llm-input')).toHaveClass('is-disabled');
    });

    it('sets disabled attribute on native input', async () => {
      const { container } = await render(
        '<llm-input [disabled]="true" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('input')).toBeDisabled();
    });
  });

  describe('readonly state', () => {
    it('applies is-readonly class to host', async () => {
      const { container } = await render(
        '<llm-input [readonly]="true" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('llm-input')).toHaveClass('is-readonly');
    });

    it('sets readOnly property on native input', async () => {
      const { container } = await render(
        '<llm-input [readonly]="true" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute('readonly');
    });
  });

  describe('invalid and error display', () => {
    it('applies is-invalid class when invalid', async () => {
      const { container } = await render(
        '<llm-input [invalid]="true" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('llm-input')).toHaveClass('is-invalid');
    });

    it('sets aria-invalid on native input when invalid', async () => {
      const { container } = await render(
        '<llm-input [invalid]="true" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not show errors when not touched', async () => {
      const { container } = await render(
        `<llm-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmInput],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Field is required' }],
          },
        }
      );
      expect(container.querySelector('.errors')).not.toBeInTheDocument();
    });

    it('shows error messages when touched and invalid', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmInput],
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
        `<llm-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmInput],
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
        `<llm-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmInput],
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
      const { container } = await render('<llm-input />', {
        imports: [LlmInput],
      });
      const input = container.querySelector('input') as HTMLInputElement;
      await user.click(input);
      await user.tab();

      expect(container.querySelector('llm-input')).toHaveClass('is-touched');
    });

    it('does not have is-touched class before interaction', async () => {
      const { container } = await render('<llm-input />', {
        imports: [LlmInput],
      });
      expect(container.querySelector('llm-input')).not.toHaveClass(
        'is-touched'
      );
    });
  });

  describe('aria attributes', () => {
    it('sets aria-required when required', async () => {
      const { container } = await render(
        '<llm-input [required]="true" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute(
        'aria-required',
        'true'
      );
    });

    it('does not set aria-required when not required', async () => {
      const { container } = await render('<llm-input />', {
        imports: [LlmInput],
      });
      expect(container.querySelector('input')).not.toHaveAttribute(
        'aria-required'
      );
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render('<llm-input />', {
        imports: [LlmInput],
      });
      expect(container.querySelector('input')).not.toHaveAttribute(
        'aria-invalid'
      );
    });

    it('links aria-describedby to error container when errors visible', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-input [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmInput],
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

  describe('name attribute', () => {
    it('sets name attribute on native input', async () => {
      const { container } = await render(
        '<llm-input name="email" />',
        { imports: [LlmInput] }
      );
      expect(container.querySelector('input')).toHaveAttribute('name', 'email');
    });

    it('does not set name attribute when not provided', async () => {
      const { container } = await render('<llm-input />', {
        imports: [LlmInput],
      });
      expect(container.querySelector('input')).not.toHaveAttribute('name');
    });
  });
});
