import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlCard, AtlCardContent, AtlCardFooter, AtlCardHeader } from './atl-card';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/card.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlCard> = {
  title: 'Components/Display/AtlCard',
  component: AtlCard,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <atl-card ${argsToTemplate(args)}>
        <atl-card-header>Card Header</atl-card-header>
        <atl-card-content>This is the card body content.</atl-card-content>
        <atl-card-footer>
          <atl-button variant="primary" size="sm">Save</atl-button>
          <atl-button variant="outline" size="sm">Cancel</atl-button>
        </atl-card-footer>
      </atl-card>
    `,
  }),
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outlined', 'flat'],
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
  args: {
    variant: 'elevated',
    padding: 'md',
  },
  decorators: [
    (storyFn) => {
      const story = storyFn();
      return {
        ...story,
        moduleMetadata: {
          ...story.moduleMetadata,
          imports: [
            ...(story.moduleMetadata?.imports ?? []),
            AtlCardHeader,
            AtlCardContent,
            AtlCardFooter,
            AtlButton,
          ],
        },
      };
    },
  ],
  parameters: {
    design: figmaNode('55-65'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlCard>;

export const Default: Story = {
  parameters: { design: figmaNode('55-59') },
};

export const Elevated: Story = {
  args: { variant: 'elevated' },
  parameters: { design: figmaNode('55-59') },
};

export const Outlined: Story = {
  args: { variant: 'outlined' },
  parameters: { design: figmaNode('55-60') },
};

export const Flat: Story = {
  args: { variant: 'flat' },
  parameters: { design: figmaNode('55-61') },
};

export const PaddingSmall: Story = {
  args: { padding: 'sm' },
  parameters: { design: figmaNode('55-56') },
};

export const PaddingNone: Story = {
  args: { padding: 'none' },
  parameters: { design: figmaNode('55-53') },
};

export const AllVariants: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter, AtlButton] },
    template: `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;">
        <atl-card variant="elevated" style="width: 240px;">
          <atl-card-header>Elevated</atl-card-header>
          <atl-card-content>Box shadow for depth.</atl-card-content>
        </atl-card>
        <atl-card variant="outlined" style="width: 240px;">
          <atl-card-header>Outlined</atl-card-header>
          <atl-card-content>Border for definition.</atl-card-content>
        </atl-card>
        <atl-card variant="flat" style="width: 240px;">
          <atl-card-header>Flat</atl-card-header>
          <atl-card-content>No shadow or border.</atl-card-content>
        </atl-card>
      </div>
    `,
  }),
};

export const AllPadding: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlCard, AtlCardHeader, AtlCardContent] },
    template: `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;">
        <atl-card variant="outlined" padding="none" style="width: 200px;">
          <atl-card-header>None</atl-card-header>
          <atl-card-content>padding="none"</atl-card-content>
        </atl-card>
        <atl-card variant="outlined" padding="sm" style="width: 200px;">
          <atl-card-header>Small</atl-card-header>
          <atl-card-content>padding="sm"</atl-card-content>
        </atl-card>
        <atl-card variant="outlined" padding="md" style="width: 200px;">
          <atl-card-header>Medium</atl-card-header>
          <atl-card-content>padding="md"</atl-card-content>
        </atl-card>
        <atl-card variant="outlined" padding="lg" style="width: 200px;">
          <atl-card-header>Large</atl-card-header>
          <atl-card-content>padding="lg"</atl-card-content>
        </atl-card>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <atl-card ${argsToTemplate(args)} style="max-width: 360px;">
        <atl-card-header>Playground Card</atl-card-header>
        <atl-card-content>Adjust the controls to explore all options.</atl-card-content>
        <atl-card-footer>
          <atl-button variant="primary" size="sm">Action</atl-button>
        </atl-card-footer>
      </atl-card>
    `,
  }),
};
