import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import AtlButton from './atl-button.vue';

import { metadata } from '@atelier-ui/spec/metadata/button.metadata';
import { contract } from '@atelier-ui/spec/contracts/button.contract';
const FIGMA_FILE =
  'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlButton> = {
  title: 'Components/Inputs/AtlButton',
  component: AtlButton,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlButton },
    setup() {
      return { args };
    },
    template: '<AtlButton v-bind="args">Button</AtlButton>',
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  parameters: {
    design: figmaNode('129-20'),
    docs: { description: { component: metadata.purpose } },
    contract,
  },
};

export default meta;
type Story = StoryObj<typeof AtlButton>;

export const Default: Story = {};

export const Primary: Story = {
  args: { variant: 'primary' },
  parameters: { design: figmaNode('129-4') },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
  parameters: { design: figmaNode('129-10') },
};

export const Outline: Story = {
  args: { variant: 'outline' },
  parameters: { design: figmaNode('129-16') },
};

export const Danger: Story = {
  args: { variant: 'danger' },
  parameters: { design: figmaNode('468-2590') },
};

export const Small: Story = {
  args: { size: 'sm' },
  parameters: { design: figmaNode('129-2') },
};

export const Medium: Story = {
  args: { size: 'md' },
  parameters: { design: figmaNode('129-4') },
};

export const Large: Story = {
  args: { size: 'lg' },
  parameters: { design: figmaNode('129-6') },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas, canvasElement }) => {
    // Loading is announced and blocked, never natively disabled: the button
    // stays in the tab order and keeps focus (ADR-0171, R-135/R-178).
    await userEvent.tab();
    const button = canvas.getByRole('button');
    await expect(button).toHaveFocus();
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    // ...and shows it: .is-disabled must not clear the focus ring. Portable
    // stories in jsdom (composeStories) load no stylesheet, so nothing to measure.
    if (getComputedStyle(button).display !== 'inline-flex') return;
    const probe = document.createElement('div');
    probe.style.boxShadow = 'var(--ui-focus-ring)';
    canvasElement.append(probe);
    const ring = getComputedStyle(probe).boxShadow;
    probe.remove();
    await waitFor(() =>
      expect(getComputedStyle(button).boxShadow).toContain(ring),
    );
  },
};

export const AllVariants: Story = {
  play: async ({ canvas, canvasElement }) => {
    // Every variant draws the shared focus ring on keyboard focus (WCAG 2.4.7).
    // The danger variant once overrode it with its own inset shadow (R-134).
    const probe = document.createElement('div');
    probe.style.boxShadow = 'var(--ui-focus-ring)';
    canvasElement.append(probe);
    const ring = getComputedStyle(probe).boxShadow;
    probe.remove();
    for (const name of ['Primary', 'Secondary', 'Outline', 'Danger']) {
      await userEvent.tab();
      const button = canvas.getByRole('button', { name });
      await expect(button).toHaveFocus();
      await waitFor(() =>
        expect(getComputedStyle(button).boxShadow).toContain(ring),
      );
    }
  },
  render: () => ({
    components: { AtlButton },
    template: `
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
        <AtlButton variant="primary">Primary</AtlButton>
        <AtlButton variant="secondary">Secondary</AtlButton>
        <AtlButton variant="outline">Outline</AtlButton>
        <AtlButton variant="danger">Danger</AtlButton>
      </div>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    components: { AtlButton },
    template: `
      <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
        <AtlButton size="sm">Small</AtlButton>
        <AtlButton size="md">Medium</AtlButton>
        <AtlButton size="lg">Large</AtlButton>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlButton },
    setup() {
      return { args };
    },
    template: '<AtlButton v-bind="args">Playground</AtlButton>',
  }),
};
