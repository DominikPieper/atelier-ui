import type { Meta, StoryObj } from '@storybook/angular';
import { LlmRadioGroup } from '../radio-group/llm-radio-group';
import { LlmRadio } from './llm-radio';

const meta: Meta<LlmRadio> = {
  title: 'Components/LlmRadio',
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
};

export default meta;
type Story = StoryObj<LlmRadio>;

export const Default: Story = {};

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
