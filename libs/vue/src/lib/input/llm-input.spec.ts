import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmInput from './llm-input.vue';

describe('LlmInput', () => {
  // @behavior renders-input
  it('renders an input element', () => {
    render(LlmInput, { props: { placeholder: 'Enter text' } });
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(LlmInput, { props: { label: 'Email', type: 'email' } });
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  // @behavior updates-value
  it('emits update:value on input', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmInput, { props: { value: '' } });
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    const updates = emitted()['update:value'] as string[][];
    expect(updates[updates.length - 1][0]).toBe('hello');
  });

  // @behavior disabled
  it('is disabled when disabled prop is true', () => {
    render(LlmInput, { props: { disabled: true, placeholder: 'Disabled' } });
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  // @behavior errors
  it('displays error messages', () => {
    render(LlmInput, { props: { errors: ['Email is invalid'] } });
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });

  // @behavior invalid
  it('marks input as invalid', () => {
    render(LlmInput, { props: { invalid: true, placeholder: 'Invalid field' } });
    expect(screen.getByPlaceholderText('Invalid field')).toHaveAttribute('aria-invalid', 'true');
  });
});
