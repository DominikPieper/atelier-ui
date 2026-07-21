import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlRadioGroup } from '../radio-group/atl-radio-group';
import { AtlRadio } from './atl-radio';

// AtlRadio is tested primarily via AtlRadioGroup since it requires the context.
// Standalone tests ensure it renders correctly in isolation (with default context).

describe('AtlRadio (standalone / default context)', () => {
  covers('radio', 'renders-input')('renders a radio input', () => {
    render(<AtlRadio radioValue="a">Option A</AtlRadio>);
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });

  it('renders label text', () => {
    render(<AtlRadio radioValue="a">Option A</AtlRadio>);
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('is not checked by default (no group context)', () => {
    render(<AtlRadio radioValue="a">A</AtlRadio>);
    expect(screen.getByRole('radio')).not.toBeChecked();
  });

  covers('radio', 'disabled')('is disabled when disabled prop is true', () => {
    render(<AtlRadio radioValue="a" disabled>A</AtlRadio>);
    expect(screen.getByRole('radio')).toBeDisabled();
  });

  it('applies is-disabled class when disabled', () => {
    const { container } = render(
      <AtlRadio radioValue="a" disabled>
        A
      </AtlRadio>
    );
    expect(container.firstChild).toHaveClass('is-disabled');
  });
});

describe('AtlRadio (within AtlRadioGroup)', () => {
  covers('radio', 'checked-from-group')('reflects checked state from group value', () => {
    render(
      <AtlRadioGroup value="b" name="g">
        <AtlRadio radioValue="a">A</AtlRadio>
        <AtlRadio radioValue="b">B</AtlRadio>
      </AtlRadioGroup>
    );
    expect(screen.getByDisplayValue('a')).not.toBeChecked();
    expect(screen.getByDisplayValue('b')).toBeChecked();
  });

  covers('radio', 'select-on-click')('calls group onValueChange on change', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AtlRadioGroup value="a" onValueChange={onChange} name="g">
        <AtlRadio radioValue="a">A</AtlRadio>
        <AtlRadio radioValue="b">B</AtlRadio>
      </AtlRadioGroup>
    );
    await user.click(screen.getByDisplayValue('b'));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});
