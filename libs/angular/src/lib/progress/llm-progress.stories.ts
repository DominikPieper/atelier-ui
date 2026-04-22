import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmProgress } from './llm-progress';

const meta: Meta<LlmProgress> = {
  title: 'Components/LlmProgress',
  component: LlmProgress,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    value: { control: 'number' },
    max: { control: 'number' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    value: 60,
    max: 100,
    variant: 'default',
    size: 'md',
    indeterminate: false,
  },
};

export default meta;
type Story = StoryObj<LlmProgress>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    imports: [LlmProgress],
    template: `<llm-progress ${argsToTemplate(args)} />`,
  })
};

export const SizeVariants: Story = {
  render: () => ({
    imports: [LlmProgress],
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 32rem;">
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Small (4px)</p>
          <llm-progress size="sm" [value]="60" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Medium (8px)</p>
          <llm-progress size="md" [value]="60" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Large (12px)</p>
          <llm-progress size="lg" [value]="60" />
        </div>
      </div>
    `,
  }),
};

export const ColorVariants: Story = {
  render: () => ({
    imports: [LlmProgress],
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 32rem;">
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Default</p>
          <llm-progress variant="default" [value]="70" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Success</p>
          <llm-progress variant="success" [value]="85" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Warning</p>
          <llm-progress variant="warning" [value]="45" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Danger</p>
          <llm-progress variant="danger" [value]="20" />
        </div>
      </div>
    `,
  }),
};

export const Indeterminate: Story = {
  render: () => ({
    imports: [LlmProgress],
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 32rem;">
        <llm-progress [indeterminate]="true" />
        <llm-progress [indeterminate]="true" variant="success" />
        <llm-progress [indeterminate]="true" size="lg" />
      </div>
    `,
  }),
};

export const ZeroValue: Story = {
  render: () => ({
    imports: [LlmProgress],
    template: `<llm-progress [value]="0" style="max-width: 32rem; display: block;" />`,
  }),
};

export const FullValue: Story = {
  render: () => ({
    imports: [LlmProgress],
    template: `<llm-progress [value]="100" variant="success" style="max-width: 32rem; display: block;" />`,
  })
};
