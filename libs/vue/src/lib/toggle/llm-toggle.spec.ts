import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmToggle from './llm-toggle.vue';

describe('LlmToggle', () => {
  it('renders a switch', () => {
    render(LlmToggle, { slots: { default: 'Enable notifications' } });
    expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    render(LlmToggle, { props: { checked: true }, slots: { default: 'Enabled' } });
    expect(screen.getByRole('switch', { name: 'Enabled' })).toBeChecked();
  });

  it('emits update:checked on toggle', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmToggle, { props: { checked: false }, slots: { default: 'Toggle' } });
    await user.click(screen.getByRole('switch', { name: 'Toggle' }));
    expect(emitted()['update:checked']).toEqual([[true]]);
  });

  it('is disabled when disabled prop is true', () => {
    render(LlmToggle, { props: { disabled: true }, slots: { default: 'Disabled' } });
    expect(screen.getByRole('switch', { name: 'Disabled' })).toBeDisabled();
  });

  it('displays error messages', () => {
    render(LlmToggle, { props: { errors: ['This is required'] }, slots: { default: 'Toggle' } });
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });
});
