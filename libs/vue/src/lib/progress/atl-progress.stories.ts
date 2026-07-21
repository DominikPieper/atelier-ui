import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlProgress from './atl-progress.vue';

import { metadata } from '@atelier-ui/spec/metadata/progress.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlProgress> = {
  title: 'Components/Display/AtlProgress',
  component: AtlProgress,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlProgress },
    setup() { return { args }; },
    template: '<AtlProgress v-bind="args" />',
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
  parameters: { design: figmaNode('420-153'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlProgress>;

export const Default: Story = {
  parameters: { design: figmaNode('420-87') },
};

export const SizeVariants: Story = {
  render: () => ({
    components: { AtlProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;max-width:32rem">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Small (4px)</p>
          <AtlProgress size="sm" :value="60" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Medium (8px)</p>
          <AtlProgress size="md" :value="60" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Large (12px)</p>
          <AtlProgress size="lg" :value="60" />
        </div>
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};

export const ColorVariants: Story = {
  render: () => ({
    components: { AtlProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1.5rem;max-width:32rem">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Default</p>
          <AtlProgress variant="default" :value="70" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Success</p>
          <AtlProgress variant="success" :value="85" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Warning</p>
          <AtlProgress variant="warning" :value="45" />
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.875rem;color:var(--ui-color-text-muted)">Danger</p>
          <AtlProgress variant="danger" :value="20" />
        </div>
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};

export const Indeterminate: Story = {
  render: () => ({
    components: { AtlProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:32rem">
        <AtlProgress :indeterminate="true" />
        <AtlProgress :indeterminate="true" variant="success" />
        <AtlProgress :indeterminate="true" size="lg" />
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-87') },
};

export const ZeroValue: Story = {
  render: () => ({
    components: { AtlProgress },
    template: '<AtlProgress :value="0" style="max-width:32rem;display:block" />',
  }),
  parameters: { design: figmaNode('420-87') },
};

export const FullValue: Story = {
  render: () => ({
    components: { AtlProgress },
    template: '<AtlProgress :value="100" variant="success" style="max-width:32rem;display:block" />',
  }),
  parameters: { design: figmaNode('420-105') },
};

export const AllVariants: Story = {
  render: () => ({
    components: { AtlProgress },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <AtlProgress :value="60" variant="default" />
        <AtlProgress :value="80" variant="success" />
        <AtlProgress :value="40" variant="warning" />
        <AtlProgress :value="20" variant="danger" />
        <AtlProgress :indeterminate="true" />
        <AtlProgress :value="50" size="sm" />
        <AtlProgress :value="50" size="lg" />
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};
