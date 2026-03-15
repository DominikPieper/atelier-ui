import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmTextarea } from './llm-textarea';

describe('LlmTextarea', () => {
  it('renders a native textarea element', async () => {
    const { container } = await render('<llm-textarea />', {
      imports: [LlmTextarea],
    });
    expect(container.querySelector('textarea')).toBeInTheDocument();
  });

  it('defaults to 3 rows', async () => {
    const { container } = await render('<llm-textarea />', {
      imports: [LlmTextarea],
    });
    expect(container.querySelector('textarea')).toHaveAttribute('rows', '3');
  });

  it('does not show errors by default', async () => {
    const { container } = await render('<llm-textarea />', {
      imports: [LlmTextarea],
    });
    expect(container.querySelector('.errors')).not.toBeInTheDocument();
  });

  describe('rows input', () => {
    it('sets rows attribute on the native textarea', async () => {
      const { container } = await render('<llm-textarea [rows]="6" />', {
        imports: [LlmTextarea],
      });
      expect(container.querySelector('textarea')).toHaveAttribute('rows', '6');
    });
  });

  describe('placeholder', () => {
    it('sets placeholder on the native textarea', async () => {
      const { container } = await render(
        '<llm-textarea placeholder="Enter description" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('textarea')).toHaveAttribute(
        'placeholder',
        'Enter description'
      );
    });
  });

  describe('value binding', () => {
    it('updates value when user types', async () => {
      const user = userEvent.setup();
      await render('<llm-textarea />', {
        imports: [LlmTextarea],
      });
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'hello world');
      expect(textarea).toHaveValue('hello world');
    });
  });

  describe('disabled state', () => {
    it('applies is-disabled class to host', async () => {
      const { container } = await render(
        '<llm-textarea [disabled]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('llm-textarea')).toHaveClass('is-disabled');
    });

    it('sets disabled attribute on native textarea', async () => {
      const { container } = await render(
        '<llm-textarea [disabled]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('textarea')).toBeDisabled();
    });
  });

  describe('readonly state', () => {
    it('applies is-readonly class to host', async () => {
      const { container } = await render(
        '<llm-textarea [readonly]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('llm-textarea')).toHaveClass('is-readonly');
    });

    it('sets readOnly property on native textarea', async () => {
      const { container } = await render(
        '<llm-textarea [readonly]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('textarea')).toHaveAttribute('readonly');
    });
  });

  describe('invalid and error display', () => {
    it('applies is-invalid class when invalid', async () => {
      const { container } = await render(
        '<llm-textarea [invalid]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('llm-textarea')).toHaveClass('is-invalid');
    });

    it('sets aria-invalid on native textarea when invalid', async () => {
      const { container } = await render(
        '<llm-textarea [invalid]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('textarea')).toHaveAttribute(
        'aria-invalid',
        'true'
      );
    });

    it('does not show errors when not touched', async () => {
      const { container } = await render(
        `<llm-textarea [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmTextarea],
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
        `<llm-textarea [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmTextarea],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Field is required' }],
          },
        }
      );
      const textarea = container.querySelector('textarea')!;
      await user.click(textarea);
      await user.tab();

      expect(screen.getByText('Field is required')).toBeInTheDocument();
    });

    it('renders each error as a paragraph with error-message class', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-textarea [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmTextarea],
          componentProperties: {
            errors: [
              { kind: 'required', message: 'Field is required' },
              { kind: 'minLength', message: 'Too short' },
            ],
          },
        }
      );
      const textarea = container.querySelector('textarea')!;
      await user.click(textarea);
      await user.tab();

      const messages = container.querySelectorAll('.error-message');
      expect(messages).toHaveLength(2);
    });

    it('sets aria-live on error container', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-textarea [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmTextarea],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Field is required' }],
          },
        }
      );
      const textarea = container.querySelector('textarea')!;
      await user.click(textarea);
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
      const { container } = await render('<llm-textarea />', {
        imports: [LlmTextarea],
      });
      const textarea = container.querySelector('textarea')!;
      await user.click(textarea);
      await user.tab();

      expect(container.querySelector('llm-textarea')).toHaveClass('is-touched');
    });

    it('does not have is-touched class before interaction', async () => {
      const { container } = await render('<llm-textarea />', {
        imports: [LlmTextarea],
      });
      expect(container.querySelector('llm-textarea')).not.toHaveClass('is-touched');
    });
  });

  describe('aria attributes', () => {
    it('sets aria-required when required', async () => {
      const { container } = await render(
        '<llm-textarea [required]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('textarea')).toHaveAttribute(
        'aria-required',
        'true'
      );
    });

    it('does not set aria-required when not required', async () => {
      const { container } = await render('<llm-textarea />', {
        imports: [LlmTextarea],
      });
      expect(container.querySelector('textarea')).not.toHaveAttribute(
        'aria-required'
      );
    });

    it('does not set aria-invalid when valid', async () => {
      const { container } = await render('<llm-textarea />', {
        imports: [LlmTextarea],
      });
      expect(container.querySelector('textarea')).not.toHaveAttribute(
        'aria-invalid'
      );
    });

    it('links aria-describedby to error container when errors visible', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        `<llm-textarea [invalid]="true" [errors]="errors" />`,
        {
          imports: [LlmTextarea],
          componentProperties: {
            errors: [{ kind: 'required', message: 'Required' }],
          },
        }
      );
      const textarea = container.querySelector('textarea')!;
      await user.click(textarea);
      await user.tab();

      const describedBy = textarea.getAttribute('aria-describedby');
      expect(describedBy).toBeTruthy();
      expect(container.querySelector(`#${describedBy}`)).toBeInTheDocument();
    });
  });

  describe('name attribute', () => {
    it('sets name attribute on native textarea', async () => {
      const { container } = await render(
        '<llm-textarea name="bio" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('textarea')).toHaveAttribute('name', 'bio');
    });

    it('does not set name attribute when not provided', async () => {
      const { container } = await render('<llm-textarea />', {
        imports: [LlmTextarea],
      });
      expect(container.querySelector('textarea')).not.toHaveAttribute('name');
    });
  });

  describe('autoResize input', () => {
    it('applies is-auto-resize class when autoResize is true', async () => {
      const { container } = await render(
        '<llm-textarea [autoResize]="true" />',
        { imports: [LlmTextarea] }
      );
      expect(container.querySelector('llm-textarea')).toHaveClass('is-auto-resize');
    });

    it('does not apply is-auto-resize class by default', async () => {
      const { container } = await render('<llm-textarea />', {
        imports: [LlmTextarea],
      });
      expect(container.querySelector('llm-textarea')).not.toHaveClass('is-auto-resize');
    });
  });
});
