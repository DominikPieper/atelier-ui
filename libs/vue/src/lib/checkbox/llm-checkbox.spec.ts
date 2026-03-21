import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmCheckbox from './llm-checkbox.vue';

describe('LlmCheckbox', () => {
  it('renders with a label', () => {
    render(LlmCheckbox, { slots: { default: 'Accept terms' } });
    expect(screen.getByLabelText('Accept terms')).toBeInTheDocument();
  });

  it('reflects checked prop', () => {
    render(LlmCheckbox, { props: { checked: true }, slots: { default: 'Checked' } });
    expect(screen.getByRole('checkbox', { name: 'Checked' })).toBeChecked();
  });

  it('emits update:checked on change', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmCheckbox, { props: { checked: false }, slots: { default: 'Toggle' } });
    await user.click(screen.getByRole('checkbox', { name: 'Toggle' }));
    expect(emitted()['update:checked']).toEqual([[true]]);
  });

  it('is disabled when disabled prop is true', () => {
    render(LlmCheckbox, { props: { disabled: true }, slots: { default: 'Disabled' } });
    expect(screen.getByRole('checkbox', { name: 'Disabled' })).toBeDisabled();
  });

  it('displays error messages', () => {
    render(LlmCheckbox, { props: { errors: ['Field is required'] }, slots: { default: 'Required' } });
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('marks input as invalid when invalid prop is true', () => {
    render(LlmCheckbox, { props: { invalid: true }, slots: { default: 'Invalid' } });
    expect(screen.getByRole('checkbox', { name: 'Invalid' })).toHaveAttribute('aria-invalid', 'true');
  });
});
