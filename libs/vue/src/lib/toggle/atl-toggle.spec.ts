import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import AtlToggle from './atl-toggle.vue';
import { covers } from '../../testing/behavior';

describe('AtlToggle', () => {
  covers('toggle', 'role-switch')('renders a switch', () => {
    render(AtlToggle, { slots: { default: 'Enable notifications' } });
    expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument();
  });

  covers('toggle', 'reflects-checked')('reflects checked state', () => {
    render(AtlToggle, { props: { checked: true }, slots: { default: 'Enabled' } });
    expect(screen.getByRole('switch', { name: 'Enabled' })).toBeChecked();
  });

  covers('toggle', 'toggle-emits')('emits update:checked on toggle', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlToggle, { props: { checked: false }, slots: { default: 'Toggle' } });
    await user.click(screen.getByRole('switch', { name: 'Toggle' }));
    expect(emitted()['update:checked']).toEqual([[true]]);
  });

  covers('toggle', 'disabled')('is disabled when disabled prop is true', () => {
    render(AtlToggle, { props: { disabled: true }, slots: { default: 'Disabled' } });
    expect(screen.getByRole('switch', { name: 'Disabled' })).toBeDisabled();
  });

  covers('toggle', 'errors')('displays error messages', () => {
    render(AtlToggle, { props: { errors: ['This is required'] }, slots: { default: 'Toggle' } });
    expect(screen.getByText('This is required')).toBeInTheDocument();
  });

  covers('toggle', 'aria-checked')('sets aria-checked attribute', () => {
    render(AtlToggle, { props: { checked: true }, slots: { default: 'Notify' } });
    expect(screen.getByRole('switch', { name: 'Notify' })).toHaveAttribute('aria-checked', 'true');
  });
});
