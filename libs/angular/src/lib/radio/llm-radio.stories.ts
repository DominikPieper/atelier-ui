import type { Meta, StoryObj } from '@storybook/angular';
import { LlmRadioGroup } from '../radio-group/llm-radio-group';
import { LlmRadio } from './llm-radio';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmRadio> = {
  title: 'Components/Inputs/LlmRadio',
  component: LlmRadio,
  tags: ['autodocs'],
  render: (args) => ({
    props: { ...args, value: '' },
    imports: [LlmRadioGroup],
    template: `
      <llm-radio-group [(value)]="value" name="demo">
        <llm-radio radioValue="a">Option A</llm-radio>
        <llm-radio radioValue="b">Option B</llm-radio>
      </llm-radio-group>
    `,
  }),
  argTypes: {
    disabled: { control: 'boolean' },
  },
  args: {
    disabled: false,
  },
  parameters: {
    design: figmaNode('420-185'),
  },
};

export default meta;
type Story = StoryObj<LlmRadio>;

export const Default: Story = {
  parameters: { design: figmaNode('420-165') },
};

export const Disabled: Story = {
  render: () => ({
    props: { value: 'a' },
    imports: [LlmRadioGroup],
    template: `
      <llm-radio-group [(value)]="value" name="demo">
        <llm-radio radioValue="a">Enabled</llm-radio>
        <llm-radio radioValue="b" [disabled]="true">Disabled</llm-radio>
      </llm-radio-group>
    `,
  }),
};

export const Checked: Story = {
  render: () => ({
    props: { value: 'a' },
    imports: [LlmRadioGroup],
    template: `
      <llm-radio-group [(value)]="value" name="demo">
        <llm-radio radioValue="a">Selected by default</llm-radio>
        <llm-radio radioValue="b">Other</llm-radio>
      </llm-radio-group>
    `,
  }),
  parameters: { design: figmaNode('420-169') },
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    imports: [LlmRadioGroup],
    template: `
      <llm-radio-group [(value)]="value" name="playground">
        <llm-radio radioValue="a" [disabled]="disabled">Option A</llm-radio>
        <llm-radio radioValue="b" [disabled]="disabled">Option B</llm-radio>
        <llm-radio radioValue="c" [disabled]="disabled">Option C</llm-radio>
      </llm-radio-group>
    `,
  }),
};
