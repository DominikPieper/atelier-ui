import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmSkeleton } from './llm-skeleton';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmSkeleton> = {
  title: 'Components/LlmSkeleton',
  component: LlmSkeleton,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-skeleton ${argsToTemplate(args)} />`,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
    },
    width: { control: 'text' },
    height: { control: 'text' },
    animated: { control: 'boolean' },
  },
  args: {
    variant: 'text',
    width: '100%',
    height: '',
    animated: true,
  },
  parameters: {
    design: figmaNode('3-857'),
  },
};

export default meta;
type Story = StoryObj<LlmSkeleton>;

export const Default: Story = {};

export const TextLines: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
        <llm-skeleton width="100%" />
        <llm-skeleton width="90%" />
        <llm-skeleton width="75%" />
        <llm-skeleton width="60%" />
      </div>
    `,
  }),
};

export const Circular: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-skeleton ${argsToTemplate(args)} />`,
  }),
  args: {
    variant: 'circular',
    width: '40px',
  },
};

export const Rectangular: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-skeleton ${argsToTemplate(args)} />`,
  }),
  args: {
    variant: 'rectangular',
    width: '100%',
    height: '200px',
  },
};

export const CardSkeleton: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px; padding: 1rem; border: 1px solid var(--ui-color-border, #e5e7eb); border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <llm-skeleton variant="circular" width="48px" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.375rem;">
            <llm-skeleton width="60%" />
            <llm-skeleton width="40%" />
          </div>
        </div>
        <llm-skeleton variant="rectangular" height="160px" />
        <div style="display: flex; flex-direction: column; gap: 0.375rem;">
          <llm-skeleton width="100%" />
          <llm-skeleton width="85%" />
          <llm-skeleton width="70%" />
        </div>
      </div>
    `,
  }),
};

export const NoAnimation: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
        <llm-skeleton ${argsToTemplate(args)} width="100%" />
        <llm-skeleton ${argsToTemplate(args)} width="80%" />
        <llm-skeleton ${argsToTemplate(args)} width="60%" />
      </div>
    `,
  }),
  args: {
    animated: false,
  },
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `<llm-skeleton ${argsToTemplate(args)} />`,
  }),
};
