import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmRadioGroup from './llm-radio-group.vue';
import LlmRadio from '../radio/llm-radio.vue';

const RadioGroupWithOptions = {
  components: { LlmRadioGroup, LlmRadio },
  props: ['modelValue', 'disabled', 'invalid', 'errors'],
  emits: ['update:modelValue'],
  template: `
    <LlmRadioGroup
      :value="modelValue"
      :disabled="disabled"
      :invalid="invalid"
      :errors="errors"
      name="plan"
      @update:value="$emit('update:modelValue', $event)"
    >
      <LlmRadio radioValue="free">Free</LlmRadio>
      <LlmRadio radioValue="pro">Pro</LlmRadio>
      <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
    </LlmRadioGroup>
  `,
};

describe('LlmRadioGroup', () => {
  it('renders with role radiogroup', () => {
    render(LlmRadioGroup);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders radio options via slot', () => {
    render(RadioGroupWithOptions, { props: { modelValue: '' } });
    expect(screen.getByRole('radio', { name: 'Free' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toBeInTheDocument();
  });

  it('checks the radio matching the value', () => {
    render(RadioGroupWithOptions, { props: { modelValue: 'pro' } });
    expect(screen.getByRole('radio', { name: 'Pro' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked();
  });

  it('emits update:value when a radio is selected', async () => {
    const user = userEvent.setup();
    const { emitted } = render(RadioGroupWithOptions, { props: { modelValue: '' } });
    await user.click(screen.getByRole('radio', { name: 'Pro' }));
    expect(emitted()['update:modelValue']).toEqual([['pro']]);
  });

  it('disables all radios when disabled', () => {
    render(RadioGroupWithOptions, { props: { modelValue: '', disabled: true } });
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });

  it('sets aria-invalid when invalid', () => {
    render(RadioGroupWithOptions, { props: { modelValue: '', invalid: true } });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders error messages', () => {
    render(RadioGroupWithOptions, {
      props: { modelValue: '', errors: ['Please select a plan'], invalid: true },
    });
    expect(screen.getByText('Please select a plan')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
