import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlInput from './atl-input.vue';

describe('AtlInput', () => {
  covers('input', 'renders-input')('renders an input element', () => {
    render(AtlInput, { props: { placeholder: 'Enter text' } });
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(AtlInput, { props: { label: 'Email', type: 'email' } });
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  covers('input', 'updates-value')('emits update:value on input', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlInput, { props: { value: '' } });
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello');
    const updates = emitted()['update:value'] as string[][];
    expect(updates[updates.length - 1][0]).toBe('hello');
  });

  covers('input', 'disabled')('is disabled when disabled prop is true', () => {
    render(AtlInput, { props: { disabled: true, placeholder: 'Disabled' } });
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  covers('input', 'errors')('displays error messages', () => {
    render(AtlInput, { props: { errors: ['Email is invalid'] } });
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });

  covers('input', 'invalid')('marks input as invalid', () => {
    render(AtlInput, { props: { invalid: true, placeholder: 'Invalid field' } });
    expect(screen.getByPlaceholderText('Invalid field')).toHaveAttribute('aria-invalid', 'true');
  });
});
