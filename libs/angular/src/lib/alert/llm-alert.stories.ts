import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmAlert } from './llm-alert';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmAlert> = {
  title: 'Components/LlmAlert',
  component: LlmAlert,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-alert ${argsToTemplate(args)}>This is an alert message.</llm-alert>`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['info', 'success', 'warning', 'danger'],
    },
    dismissible: {
      control: 'boolean',
    },
    dismissed: { action: 'dismissed' },
  },
  args: {
    variant: 'info',
    dismissible: false,
  },
  parameters: {
    design: figmaNode('55-31'),
  },
};

export default meta;
type Story = StoryObj<LlmAlert>;

export const Default: Story = {
  parameters: { design: figmaNode('55-23') },
};

export const Success: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-alert ${argsToTemplate(args)}>Your changes were saved successfully.</llm-alert>`,
  }),
  args: { variant: 'success' },
  parameters: { design: figmaNode('55-25') },
};

export const Warning: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-alert ${argsToTemplate(args)}>Your session expires in 5 minutes.</llm-alert>`,
  }),
  args: { variant: 'warning' },
  parameters: { design: figmaNode('55-27') },
};

export const Danger: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-alert ${argsToTemplate(args)}>An error occurred. Please try again.</llm-alert>`,
  }),
  args: { variant: 'danger' },
  parameters: { design: figmaNode('55-29') },
};

export const Dismissible: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-alert ${argsToTemplate(args)}>This alert can be dismissed.</llm-alert>`,
  }),
  args: { variant: 'warning', dismissible: true },
  parameters: { design: figmaNode('55-28') },
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <llm-alert variant="info">Info: Here is some useful information.</llm-alert>
        <llm-alert variant="success">Success: Your changes were saved.</llm-alert>
        <llm-alert variant="warning">Warning: Your session expires soon.</llm-alert>
        <llm-alert variant="danger">Error: Something went wrong.</llm-alert>
      </div>
    `,
  }),
};

export const AllDismissible: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <llm-alert variant="info" [dismissible]="true">Info: Here is some useful information.</llm-alert>
        <llm-alert variant="success" [dismissible]="true">Success: Your changes were saved.</llm-alert>
        <llm-alert variant="warning" [dismissible]="true">Warning: Your session expires soon.</llm-alert>
        <llm-alert variant="danger" [dismissible]="true">Error: Something went wrong.</llm-alert>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-alert ${argsToTemplate(args)}>Playground alert message.</llm-alert>`,
  }),
};
