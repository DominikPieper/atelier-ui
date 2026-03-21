import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmTextarea from './llm-textarea.vue';

describe('LlmTextarea', () => {
  it('renders a textarea element', () => {
    render(LlmTextarea, { props: { placeholder: 'Write here...' } });
    expect(screen.getByPlaceholderText('Write here...')).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(LlmTextarea, { props: { label: 'Description' } });
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('emits update:value on input', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmTextarea, { props: { value: '' } });
    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Hello world');
    const updates = emitted()['update:value'] as string[][];
    expect(updates[updates.length - 1][0]).toContain('Hello world');
  });

  it('is disabled when disabled prop is true', () => {
    render(LlmTextarea, { props: { disabled: true, placeholder: 'Disabled' } });
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });

  it('displays error messages', () => {
    render(LlmTextarea, { props: { errors: ['Message is too short'] } });
    expect(screen.getByText('Message is too short')).toBeInTheDocument();
  });

  it('applies rows attribute', () => {
    render(LlmTextarea, { props: { rows: 6 } });
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '6');
  });
});
