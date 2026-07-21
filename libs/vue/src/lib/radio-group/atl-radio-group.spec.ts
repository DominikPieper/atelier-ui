import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlRadioGroup from './atl-radio-group.vue';
import AtlRadio from '../radio/atl-radio.vue';

const RadioGroupWithOptions = {
  components: { AtlRadioGroup, AtlRadio },
  props: ['modelValue', 'disabled', 'invalid', 'errors'],
  emits: ['update:modelValue'],
  template: `
    <AtlRadioGroup
      :value="modelValue"
      :disabled="disabled"
      :invalid="invalid"
      :errors="errors"
      name="plan"
      @update:value="$emit('update:modelValue', $event)"
    >
      <AtlRadio radioValue="free">Free</AtlRadio>
      <AtlRadio radioValue="pro">Pro</AtlRadio>
      <AtlRadio radioValue="enterprise">Enterprise</AtlRadio>
    </AtlRadioGroup>
  `,
};

describe('AtlRadioGroup', () => {
  covers('radio-group', 'role')('renders with role radiogroup', () => {
    render(AtlRadioGroup);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders radio options via slot', () => {
    render(RadioGroupWithOptions, { props: { modelValue: '' } });
    expect(screen.getByRole('radio', { name: 'Free' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toBeInTheDocument();
  });

  covers('radio-group', 'checks-matching-value')('checks the radio matching the value', () => {
    render(RadioGroupWithOptions, { props: { modelValue: 'pro' } });
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked();
  });

  covers('radio-group', 'value-change')('emits update:value when a radio is selected', async () => {
    const user = userEvent.setup();
    const { emitted } = render(RadioGroupWithOptions, { props: { modelValue: '' } });
    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(emitted()['update:modelValue']).toEqual([['pro']]);
  });

  covers('radio-group', 'keyboard-nav')('ArrowDown selects the next radio', async () => {
    const user = userEvent.setup();
    const { emitted } = render(RadioGroupWithOptions, { props: { modelValue: 'free' } });
    (screen.getByRole('radio', { name: 'Free' }) as HTMLElement).focus();
    await user.keyboard('{ArrowDown}');
    expect(emitted()['update:modelValue']).toEqual([['pro']]);
  });

  it('ArrowUp wraps from the first radio to the last', async () => {
    const user = userEvent.setup();
    const { emitted } = render(RadioGroupWithOptions, { props: { modelValue: 'free' } });
    (screen.getByRole('radio', { name: 'Free' }) as HTMLElement).focus();
    await user.keyboard('{ArrowUp}');
    expect(emitted()['update:modelValue']).toEqual([['enterprise']]);
  });

  it('disables all radios when disabled', () => {
    render(RadioGroupWithOptions, { props: { modelValue: '', disabled: true } });
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  covers('radio-group', 'invalid')('sets aria-invalid when invalid', () => {
    render(RadioGroupWithOptions, { props: { modelValue: '', invalid: true } });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  covers('radio-group', 'errors')('renders error messages', () => {
    render(RadioGroupWithOptions, {
      props: { modelValue: '', errors: ['Please select a plan'], invalid: true },
    });
    expect(screen.getByText('Please select a plan')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
