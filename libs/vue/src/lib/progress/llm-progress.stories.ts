import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmProgress from './llm-progress.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmProgress> = {
  title: 'Components/Display/LlmProgress',
  component: LlmProgress,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmProgress },
    setup() { return { args }; },
    template: '<LlmProgress v-bind="args" />',
  }),
  argTypes: {
    variant: { control: 'select', options: ['default', 'success', 'warning', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    value: { control: { type: 'range', min: 0, max: 100 } },
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
  parameters: { design: figmaNode('420-153') },
};

export default meta;
type Story = StoryObj<typeof LlmProgress>;

export const Default: Story = {
  parameters: { design: figmaNode('420-87') },
};

export const SizeVariants: Story = {
  render: () => ({
    components: { LlmProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;max-width:32rem">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Small (4px)</p>
          <LlmProgress size="sm" :value="60" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Medium (8px)</p>
          <LlmProgress size="md" :value="60" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Large (12px)</p>
          <LlmProgress size="lg" :value="60" />
        </div>
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};

export const ColorVariants: Story = {
  render: () => ({
    components: { LlmProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;max-width:32rem">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Default</p>
          <LlmProgress variant="default" :value="70" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Success</p>
          <LlmProgress variant="success" :value="85" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Warning</p>
          <LlmProgress variant="warning" :value="45" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Danger</p>
          <LlmProgress variant="danger" :value="20" />
        </div>
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};

export const Indeterminate: Story = {
  render: () => ({
    components: { LlmProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:32rem">
        <LlmProgress :indeterminate="true" />
        <LlmProgress :indeterminate="true" variant="success" />
        <LlmProgress :indeterminate="true" size="lg" />
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-87') },
};

export const ZeroValue: Story = {
  render: () => ({
    components: { LlmProgress },
    template: '<LlmProgress :value="0" style="max-width:32rem;display:block" />',
  }),
  parameters: { design: figmaNode('420-87') },
};

export const FullValue: Story = {
  render: () => ({
    components: { LlmProgress },
    template: '<LlmProgress :value="100" variant="success" style="max-width:32rem;display:block" />',
  }),
  parameters: { design: figmaNode('420-105') },
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <LlmProgress :value="60" variant="default" />
        <LlmProgress :value="80" variant="success" />
        <LlmProgress :value="40" variant="warning" />
        <LlmProgress :value="20" variant="danger" />
        <LlmProgress :indeterminate="true" />
        <LlmProgress :value="50" size="sm" />
        <LlmProgress :value="50" size="lg" />
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};
