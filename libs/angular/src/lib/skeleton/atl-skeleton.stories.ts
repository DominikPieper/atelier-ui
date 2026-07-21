import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlSkeleton } from './atl-skeleton';

import { metadata } from '@atelier-ui/spec/metadata/skeleton.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlSkeleton> = {
  title: 'Components/Display/AtlSkeleton',
  component: AtlSkeleton,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<atl-skeleton ${argsToTemplate(args)} />`,
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
    design: figmaNode('55-102'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlSkeleton>;

export const Default: Story = {
  parameters: { design: figmaNode('55-99') },
};

export const TextLines: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-width: 400px;">
        <atl-skeleton width="100%" />
        <atl-skeleton width="90%" />
        <atl-skeleton width="75%" />
        <atl-skeleton width="60%" />
      </div>
    `,
  }),
};

export const Circular: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-skeleton ${argsToTemplate(args)} />`,
  }),
  args: {
    variant: 'circular',
    width: '40px',
  },
  parameters: { design: figmaNode('55-100') },
};

export const Rectangular: Story = {
  render: (args) => ({
    props: args,
    template: `<atl-skeleton ${argsToTemplate(args)} />`,
  }),
  args: {
    variant: 'rectangular',
    width: '100%',
    height: '200px',
  },
  parameters: { design: figmaNode('55-101') },
};

export const CardSkeleton: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem; max-width: 320px; padding: 1rem; border: 1px solid var(--ui-color-border, #e5e7eb); border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <atl-skeleton variant="circular" width="48px" />
          <div style="flex: 1; display: flex; flex-direction: column; gap: 0.375rem;">
            <atl-skeleton width="60%" />
            <atl-skeleton width="40%" />
          </div>
        </div>
        <atl-skeleton variant="rectangular" height="160px" />
        <div style="display: flex; flex-direction: column; gap: 0.375rem;">
          <atl-skeleton width="100%" />
          <atl-skeleton width="85%" />
          <atl-skeleton width="70%" />
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
        <atl-skeleton ${argsToTemplate(args)} width="100%" />
        <atl-skeleton ${argsToTemplate(args)} width="80%" />
        <atl-skeleton ${argsToTemplate(args)} width="60%" />
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
    template: `<atl-skeleton ${argsToTemplate(args)} />`,
  }),
};
