import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmButton } from './llm-button';

describe('LlmButton', () => {
  it('renders without error with default props', () => {
    render(<LlmButton>Click me</LlmButton>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it.each(['primary', 'secondary', 'outline'] as const)(
    'applies variant-%s class',
    (variant) => {
      render(<LlmButton variant={variant}>Btn</LlmButton>);
      expect(screen.getByRole('button')).toHaveClass(`variant-${variant}`);
    }
  );

  it.each(['sm', 'md', 'lg'] as const)('applies size-%s class', (size) => {
    render(<LlmButton size={size}>Btn</LlmButton>);
    expect(screen.getByRole('button')).toHaveClass(`size-${size}`);
  });

  it('is disabled when disabled prop is true', () => {
    render(<LlmButton disabled>Btn</LlmButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    render(<LlmButton disabled>Btn</LlmButton>);
    expect(screen.getByRole('button')).toHaveClass('is-disabled');
  });

  it('renders spinner when loading', () => {
    const { container } = render(<LlmButton loading>Btn</LlmButton>);
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(<LlmButton loading>Btn</LlmButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires click event when not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<LlmButton onClick={onClick}>Click me</LlmButton>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
