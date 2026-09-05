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

  it('does not render a label when omitted', () => {
    const { container } = render(AtlTextarea, {});
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('lets a caller-supplied id win over the auto-generated one', () => {
    render(AtlTextarea, {
      props: { label: 'Description', id: 'custom-description-id' },
    });
    expect(screen.getByLabelText('Description')).toHaveAttribute(
      'id',
      'custom-description-id'
    );
  });

  it('sets aria-label on the native textarea, not the wrapper', () => {
    const { container } = render(AtlTextarea, { props: { 'aria-label': 'Notes' } });
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Notes');
    expect(container.firstElementChild).not.toHaveAttribute('aria-label');
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

  // `.atl-textarea.is-readonly textarea` drops the interactive border and the text
  // cursor (ADR-0045); `.atl-textarea.is-auto-resize textarea` hides the resize grip
  // and the scrollbar the script-driven growth makes redundant.
  it('applies is-readonly class to the root when readonly', () => {
    const { container } = render(AtlTextarea, { props: { readonly: true } });
    expect(container.firstElementChild).toHaveClass('is-readonly');
  });

  it('does not apply is-readonly class by default', () => {
    const { container } = render(AtlTextarea, {});
    expect(container.firstElementChild).not.toHaveClass('is-readonly');
  });

  it('applies is-auto-resize class to the root when autoResize', () => {
    const { container } = render(AtlTextarea, { props: { autoResize: true } });
    expect(container.firstElementChild).toHaveClass('is-auto-resize');
  });

  it('does not apply is-auto-resize class by default', () => {
    const { container } = render(AtlTextarea, {});
    expect(container.firstElementChild).not.toHaveClass('is-auto-resize');
  });

  it('renders error messages as .error-message paragraphs', () => {
    const { container } = render(AtlTextarea, {
      props: { errors: ['Message is too short', 'Required'] },
    });
    expect(container.querySelectorAll('.errors .error-message')).toHaveLength(2);
  });
});
