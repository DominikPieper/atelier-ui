import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlAlert from './atl-alert.vue';

describe('AtlAlert', () => {
  it('renders with default props', () => {
    render(AtlAlert, { slots: { default: 'Info message' } });
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('atl-alert', 'variant-info');
  });

  it('applies variant class', () => {
    render(AtlAlert, { props: { variant: 'danger' }, slots: { default: 'Error!' } });
    expect(screen.getByRole('alert')).toHaveClass('variant-danger');
  });

  covers('alert', 'dismiss-hidden')('does not show dismiss button by default', () => {
    render(AtlAlert, { slots: { default: 'Message' } });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  covers('alert', 'dismiss-shown')('shows dismiss button when dismissible is true', () => {
    render(AtlAlert, { props: { dismissible: true }, slots: { default: 'Dismissible' } });
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  covers('alert', 'emits-dismiss')('emits dismissed event when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlAlert, { props: { dismissible: true }, slots: { default: 'Msg' } });
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(emitted()['dismissed']).toHaveLength(1);
  });

  covers('alert', 'aria-live')('sets aria-live to assertive for danger and warning variants', () => {
    render(AtlAlert, { props: { variant: 'danger' }, slots: { default: 'Error' } });
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});
