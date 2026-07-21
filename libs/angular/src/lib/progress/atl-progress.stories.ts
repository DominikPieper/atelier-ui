import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlProgress } from './atl-progress';

import { metadata } from '@atelier-ui/spec/metadata/progress.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlProgress> = {
  title: 'Components/Display/AtlProgress',
  component: AtlProgress,
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
  parameters: {
    design: figmaNode('420-153'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlProgress>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    imports: [AtlProgress],
    template: `<atl-progress ${argsToTemplate(args)} />`,
  }),
  parameters: { design: figmaNode('420-87') },
};

export const SizeVariants: Story = {
  render: () => ({
    imports: [AtlProgress],
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 32rem;">
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Small (4px)</p>
          <atl-progress size="sm" [value]="60" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Medium (8px)</p>
          <atl-progress size="md" [value]="60" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Large (12px)</p>
          <atl-progress size="lg" [value]="60" />
        </div>
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};

export const ColorVariants: Story = {
  render: () => ({
    imports: [AtlProgress],
    template: `
      <div style="display: flex; flex-direction: column; gap: 1.5rem; max-width: 32rem;">
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Default</p>
          <atl-progress variant="default" [value]="70" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Success</p>
          <atl-progress variant="success" [value]="85" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Warning</p>
          <atl-progress variant="warning" [value]="45" />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--ui-color-text-muted);">Danger</p>
          <atl-progress variant="danger" [value]="20" />
        </div>
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-153') },
};

export const Indeterminate: Story = {
  render: () => ({
    imports: [AtlProgress],
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 32rem;">
        <atl-progress [indeterminate]="true" />
        <atl-progress [indeterminate]="true" variant="success" />
        <atl-progress [indeterminate]="true" size="lg" />
      </div>
    `,
  }),
  parameters: { design: figmaNode('420-87') },
};

export const ZeroValue: Story = {
  render: () => ({
    imports: [AtlProgress],
    template: `<atl-progress [value]="0" style="max-width: 32rem; display: block;" />`,
  }),
  parameters: { design: figmaNode('420-87') },
};

export const FullValue: Story = {
  render: () => ({
    imports: [AtlProgress],
    template: `<atl-progress [value]="100" variant="success" style="max-width: 32rem; display: block;" />`,
  }),
  parameters: { design: figmaNode('420-105') },
};
