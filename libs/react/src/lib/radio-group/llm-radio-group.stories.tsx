import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmRadioGroup } from './llm-radio-group';
import { LlmRadio } from '../radio/llm-radio';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmRadioGroup> = {
  title: 'Components/LlmRadioGroup',
  component: LlmRadioGroup,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('3-822'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmRadioGroup>;

export const Default: Story = {
  render: function Render() {
    const [value, setValue] = useState('free');
    return (
      <LlmRadioGroup value={value} onValueChange={setValue} name="plan">
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    );
  },
  parameters: { design: figmaNode('55-131') },
};

export const Disabled: Story = {
  render: () => (
    <LlmRadioGroup value="free" name="plan-disabled" disabled>
      <LlmRadio radioValue="free">Free</LlmRadio>
      <LlmRadio radioValue="pro">Pro</LlmRadio>
    </LlmRadioGroup>
  ),
  parameters: { design: figmaNode('55-136') },
};

export const IndividualDisabled: Story = {
  render: function Render() {
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

export const WithErrors: Story = {
  render: () => (
    <LlmRadioGroup value="" name="plan-errors" invalid errors={['Selection required', 'Please choose a plan to continue']}>
      <LlmRadio radioValue="free">Free</LlmRadio>
      <LlmRadio radioValue="pro">Pro</LlmRadio>
      <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
    </LlmRadioGroup>
  ),
};

export const Required: Story = {
  render: function Render() {
    const [value, setValue] = useState('');
    return (
      <LlmRadioGroup value={value} onValueChange={setValue} name="plan-required" required>
        <LlmRadio radioValue="free">Free</LlmRadio>
        <LlmRadio radioValue="pro">Pro</LlmRadio>
        <LlmRadio radioValue="enterprise">Enterprise</LlmRadio>
      </LlmRadioGroup>
    );
  },
};
