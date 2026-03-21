import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmAlert from './llm-alert.vue';

describe('LlmAlert', () => {
  it('renders with default props', () => {
    render(LlmAlert, { slots: { default: 'Info message' } });
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('llm-alert', 'variant-info');
  });

  it('applies variant class', () => {
    render(LlmAlert, { props: { variant: 'danger' }, slots: { default: 'Error!' } });
    expect(screen.getByRole('alert')).toHaveClass('variant-danger');
  });

  it('does not show dismiss button by default', () => {
    render(LlmAlert, { slots: { default: 'Message' } });
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('shows dismiss button when dismissible is true', () => {
    render(LlmAlert, { props: { dismissible: true }, slots: { default: 'Dismissible' } });
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
  });

  it('emits dismissed event when dismiss button is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmAlert, { props: { dismissible: true }, slots: { default: 'Msg' } });
    await user.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(emitted()['dismissed']).toHaveLength(1);
  });

  it('sets aria-live to assertive for danger and warning variants', () => {
    render(LlmAlert, { props: { variant: 'danger' }, slots: { default: 'Error' } });
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive');
  });
});
