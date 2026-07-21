import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlTextarea from './atl-textarea.vue';

describe('AtlTextarea', () => {
  covers('textarea', 'renders-textarea')('renders a textarea element', () => {
    render(AtlTextarea, { props: { placeholder: 'Write here...' } });
    expect(screen.getByPlaceholderText('Write here...')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(AtlTextarea, { props: { label: 'Description' } });
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  covers('textarea', 'updates-value')('emits update:value on input', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlTextarea, { props: { value: '' } });
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello world');
    const updates = emitted()['update:value'] as string[][];
    expect(updates[updates.length - 1][0]).toContain('Hello world');
  });

  covers('textarea', 'disabled')('is disabled when disabled prop is true', () => {
    render(AtlTextarea, { props: { disabled: true, placeholder: 'Disabled' } });
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  covers('textarea', 'errors')('displays error messages', () => {
    render(AtlTextarea, { props: { errors: ['Message is too short'] } });
    expect(screen.getByText('Message is too short')).toBeInTheDocument();
  });

  covers('textarea', 'rows')('applies rows attribute', () => {
    render(AtlTextarea, { props: { rows: 6 } });
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '6');
  });
});
