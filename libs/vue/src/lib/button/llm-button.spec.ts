import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmButton from './llm-button.vue';

describe('LlmButton', () => {
  it('renders with default props', () => {
    render(LlmButton, { slots: { default: 'Click me' } });
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('llm-button', 'variant-primary', 'size-md');
  });

  it('applies variant and size classes', () => {
    render(LlmButton, { props: { variant: 'outline', size: 'lg' }, slots: { default: 'Outline' } });
    const button = screen.getByRole('button', { name: 'Outline' });
    expect(button).toHaveClass('variant-outline', 'size-lg');
  });

  it('is disabled when disabled prop is true', () => {
    render(LlmButton, { props: { disabled: true }, slots: { default: 'Disabled' } });
    const button = screen.getByRole('button', { name: 'Disabled' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('is-disabled');
  });

  it('is disabled and shows spinner when loading', () => {
    render(LlmButton, { props: { loading: true }, slots: { default: 'Loading' } });
    const button = screen.getByRole('button', { name: 'Loading' });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('is-loading');
    expect(button.querySelector('.spinner')).toBeInTheDocument();
  });

  it('emits click events when not disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(LlmButton, { slots: { default: 'Click' }, attrs: { onClick } });
    await user.click(screen.getByRole('button', { name: 'Click' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit click when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(LlmButton, { props: { disabled: true }, slots: { default: 'No Click' }, attrs: { onClick } });
    await user.click(screen.getByRole('button', { name: 'No Click' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
