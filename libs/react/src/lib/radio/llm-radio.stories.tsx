import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmRadio } from './llm-radio';
import { LlmRadioGroup } from '../radio-group/llm-radio-group';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmRadio> = {
  title: 'Components/Inputs/LlmRadio',
  component: LlmRadio,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('420-185'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmRadio>;

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
  parameters: { design: figmaNode('420-165') },
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
