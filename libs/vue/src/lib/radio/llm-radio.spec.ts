import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmRadio from './llm-radio.vue';
import LlmRadioGroup from '../radio-group/llm-radio-group.vue';

const RadioWithGroup = {
  components: { LlmRadioGroup, LlmRadio },
  props: ['modelValue', 'groupDisabled', 'radioDisabled'],
  emits: ['update:modelValue'],
  template: `
    <LlmRadioGroup
      :value="modelValue"
      :disabled="groupDisabled"
      name="test"
      @update:value="$emit('update:modelValue', $event)"
    >
      <LlmRadio radioValue="a" :disabled="radioDisabled">Option A</LlmRadio>
      <LlmRadio radioValue="b">Option B</LlmRadio>
    </LlmRadioGroup>
  `,
};

describe('LlmRadio', () => {
  it('renders a native radio input', () => {
    const { container } = render(RadioWithGroup, { props: { modelValue: '' } });
    expect(container.querySelector('input[type="radio"]')).toBeInTheDocument();
  });

  it('renders projected label content', () => {
    render(RadioWithGroup, { props: { modelValue: '' } });
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeInTheDocument();
  });

  it('is unchecked by default', () => {
    render(RadioWithGroup, { props: { modelValue: '' } });
    expect(screen.getByRole('radio', { name: 'Option A' })).not.toBeChecked();
  });

  it('is checked when group value matches radioValue', () => {
    render(RadioWithGroup, { props: { modelValue: 'a' } });
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Option B' })).not.toBeChecked();
  });

  it('becomes checked when clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(RadioWithGroup, { props: { modelValue: '' } });
    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    expect(emitted()['update:modelValue']).toEqual([['a']]);
  });

  it('is disabled when individually disabled', () => {
    render(RadioWithGroup, { props: { modelValue: '', radioDisabled: true } });
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeDisabled();
  });

  it('is disabled when group is disabled', () => {
    render(RadioWithGroup, { props: { modelValue: '', groupDisabled: true } });
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });
});
