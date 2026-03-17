import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { LlmRadioGroup } from './llm-radio-group';
import { LlmRadio } from '../radio/llm-radio';

const meta: Meta<typeof LlmRadioGroup> = {
  title: 'Components/LlmRadioGroup',
  component: LlmRadioGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LlmRadioGroup>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState('free');
    return (
      <LlmRadioGroup value={value} onValueChange={setValue} name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <LlmRadioGroup value="free" name="plan-disabled" disabled>
      <LlmRadio radioValue="free">Free</LlmRadio>
      <LlmRadio radioValue="pro">Pro</LlmRadio>
    </LlmRadioGroup>
  ),
};

export const IndividualDisabled: Story = {
  render: () => {
    const [value, setValue] = useState('free');
    return (
      <LlmRadioGroup value={value} onValueChange={setValue} name="plan-individual">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise" disabled>
          Enterprise (unavailable)
        </LlmRadio>
      </LlmRadioGroup>
    );
  },
};

export const Invalid: Story = {
  render: () => (
    <LlmRadioGroup value="" name="plan-invalid" invalid errors={['Please select a plan']}>
      <LlmRadio radioValue="free">Free</LlmRadio>
      <LlmRadio radioValue="pro">Pro</LlmRadio>
    </LlmRadioGroup>
  ),
};
