import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import AtlRadio from './atl-radio.vue';
import AtlRadioGroup from '../radio-group/atl-radio-group.vue';
import { covers } from '../../testing/behavior';

const RadioWithGroup = {
  components: { AtlRadioGroup, AtlRadio },
  props: ['modelValue', 'groupDisabled', 'radioDisabled'],
  emits: ['update:modelValue'],
  template: `
    <AtlRadioGroup
      :value="modelValue"
      :disabled="groupDisabled"
      name="test"
      @update:value="$emit('update:modelValue', $event)"
    >
      <AtlRadio radioValue="a" :disabled="radioDisabled">Option A</AtlRadio>
      <AtlRadio radioValue="b">Option B</AtlRadio>
    </AtlRadioGroup>
  `,
};

describe('AtlRadio', () => {
  covers('radio', 'renders-input')('renders a native radio input', () => {
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

  covers('radio', 'checked-from-group')('is checked when group value matches radioValue', () => {
    render(RadioWithGroup, { props: { modelValue: 'a' } });
    expect(screen.getByRole('radio', { name: 'Option A' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Option B' })).not.toBeChecked();
  });

  covers('radio', 'select-on-click')('becomes checked when clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(RadioWithGroup, { props: { modelValue: '' } });
    await user.click(screen.getByRole('radio', { name: 'Option A' }));
    expect(emitted()['update:modelValue']).toEqual([['a']]);
  });

  covers('radio', 'disabled')('is disabled when individually disabled', () => {
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
