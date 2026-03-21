/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmButton } from './llm-button';

describe('LlmButton', () => {
  it('renders without error with default inputs', async () => {
    await render('<llm-button>Click me</llm-button>', { imports: [LlmButton] });
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  describe('variant classes', () => {
    it.each(['primary', 'secondary', 'outline'] as const)(
      'applies variant-%s class to host',
      async (variant) => {
        const { container } = await render(
          `<llm-button variant="${variant}">Btn</llm-button>`,
          { imports: [LlmButton] }
        );
        expect(container.querySelector('llm-button')).toHaveClass(`variant-${variant}`);
      }
    );
  });

  describe('size classes', () => {
    it.each(['sm', 'md', 'lg'] as const)(
      'applies size-%s class to host',
      async (size) => {
        const { container } = await render(
          `<llm-button size="${size}">Btn</llm-button>`,
          { imports: [LlmButton] }
        );
        expect(container.querySelector('llm-button')).toHaveClass(`size-${size}`);
      }
    );
  });

  describe('disabled state', () => {
    it('sets aria-disabled when disabled input is true', async () => {
      const { container } = await render(
        '<llm-button [disabled]="true">Btn</llm-button>',
        { imports: [LlmButton] }
      );
      expect(container.querySelector('llm-button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies is-disabled class when disabled', async () => {
      const { container } = await render(
        '<llm-button [disabled]="true">Btn</llm-button>',
        { imports: [LlmButton] }
      );
      expect(container.querySelector('llm-button')).toHaveClass('is-disabled');
    });
  });

  describe('loading state', () => {
    it('renders spinner when loading', async () => {
      const { container } = await render(
        '<llm-button [loading]="true">Btn</llm-button>',
        { imports: [LlmButton] }
      );
      expect(container.querySelector('.spinner')).toBeInTheDocument();
    });

    it('sets aria-disabled when loading', async () => {
      const { container } = await render(
        '<llm-button [loading]="true">Btn</llm-button>',
        { imports: [LlmButton] }
      );
      expect(container.querySelector('llm-button')).toHaveAttribute('aria-disabled', 'true');
    });

    it('applies is-loading class when loading', async () => {
      const { container } = await render(
        '<llm-button [loading]="true">Btn</llm-button>',
        { imports: [LlmButton] }
      );
      expect(container.querySelector('llm-button')).toHaveClass('is-loading');
    });
  });

  it('projects slotted content into the button', async () => {
    await render('<llm-button>Save Changes</llm-button>', { imports: [LlmButton] });
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });

  it('emits native click events when not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = await render(
      '<llm-button (click)="onClick()">Click me</llm-button>',
      { imports: [LlmButton], componentProperties: { onClick } }
    );
    await user.click(container.querySelector('llm-button')!);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
