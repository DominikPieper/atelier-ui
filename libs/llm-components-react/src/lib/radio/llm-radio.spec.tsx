import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LlmRadioGroup } from '../radio-group/llm-radio-group';
import { LlmRadio } from './llm-radio';

// LlmRadio is tested primarily via LlmRadioGroup since it requires the context.
// Standalone tests ensure it renders correctly in isolation (with default context).

describe('LlmRadio (standalone / default context)', () => {
  it('renders a radio input', () => {
    render(<LlmRadio radioValue="a">Option A</LlmRadio>);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<LlmRadio radioValue="a">Option A</LlmRadio>);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('is not checked by default (no group context)', () => {
    render(<LlmRadio radioValue="a">A</LlmRadio>);
    expect(screen.getByRole('radio')).not.toBeChecked();
  });

  it('is disabled when disabled prop is true', () => {
    render(<LlmRadio radioValue="a" disabled>A</LlmRadio>);
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(
      <LlmRadio radioValue="a" disabled>
        A
      </LlmRadio>
    );
    expect(container.firstChild).toHaveClass('is-disabled');
  });
});

describe('LlmRadio (within LlmRadioGroup)', () => {
  it('reflects checked state from group value', () => {
    render(
      <LlmRadioGroup value="b" name="g">
        <LlmRadio radioValue="a">A</LlmRadio>
        <LlmRadio radioValue="b">B</LlmRadio>
      </LlmRadioGroup>
    );
    expect(screen.getByDisplayValue('a')).not.toBeChecked();
    expect(screen.getByDisplayValue('b')).toBeChecked();
  });

  it('calls group onValueChange on change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <LlmRadioGroup value="a" onValueChange={onChange} name="g">
        <LlmRadio radioValue="a">A</LlmRadio>
        <LlmRadio radioValue="b">B</LlmRadio>
      </LlmRadioGroup>
    );
    await user.click(screen.getByDisplayValue('b'));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
