import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlCard from './atl-card.vue';
import AtlCardHeader from './atl-card-header.vue';
import AtlCardContent from './atl-card-content.vue';
import AtlCardFooter from './atl-card-footer.vue';
import AtlButton from '../button/atl-button.vue';

import { metadata } from '@atelier-ui/spec/metadata/card.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlCard> = {
  title: 'Components/Display/AtlCard',
  component: AtlCard,
  tags: ['autodocs'],
  render: (args) => ({
    components: { AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter, AtlButton },
    setup() { return { args }; },
    template: `
      <AtlCard v-bind="args">
        <AtlCardHeader>Card Header</AtlCardHeader>
        <AtlCardContent>This is the card body content.</AtlCardContent>
        <AtlCardFooter>
          <AtlButton variant="primary" size="sm">Save</AtlButton>
          <AtlButton variant="outline" size="sm">Cancel</AtlButton>
        </AtlCardFooter>
      </AtlCard>
    `,
  }),
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
  args: {
    variant: 'elevated',
    padding: 'md',
  },
  parameters: {
    design: figmaNode('55-65'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlCard>;

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
    components: { AtlCard, AtlCardHeader, AtlCardContent },
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start">
        <AtlCard variant="elevated" style="width:240px">
          <AtlCardHeader>Elevated</AtlCardHeader>
          <AtlCardContent>Box shadow for depth.</AtlCardContent>
        </AtlCard>
        <AtlCard variant="outlined" style="width:240px">
          <AtlCardHeader>Outlined</AtlCardHeader>
          <AtlCardContent>Border for definition.</AtlCardContent>
        </AtlCard>
        <AtlCard variant="flat" style="width:240px">
          <AtlCardHeader>Flat</AtlCardHeader>
          <AtlCardContent>No shadow or border.</AtlCardContent>
        </AtlCard>
      </div>
    `,
  }),
};

export const AllPadding: Story = {
  render: () => ({
    components: { AtlCard, AtlCardHeader, AtlCardContent },
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start">
        <AtlCard variant="outlined" padding="none" style="width:200px">
          <AtlCardHeader>None</AtlCardHeader>
          <AtlCardContent>padding="none"</AtlCardContent>
        </AtlCard>
        <AtlCard variant="outlined" padding="sm" style="width:200px">
          <AtlCardHeader>Small</AtlCardHeader>
          <AtlCardContent>padding="sm"</AtlCardContent>
        </AtlCard>
        <AtlCard variant="outlined" padding="md" style="width:200px">
          <AtlCardHeader>Medium</AtlCardHeader>
          <AtlCardContent>padding="md"</AtlCardContent>
        </AtlCard>
        <AtlCard variant="outlined" padding="lg" style="width:200px">
          <AtlCardHeader>Large</AtlCardHeader>
          <AtlCardContent>padding="lg"</AtlCardContent>
        </AtlCard>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter, AtlButton },
    setup() { return { args }; },
    template: `
      <AtlCard v-bind="args" style="max-width:360px">
        <AtlCardHeader>Playground Card</AtlCardHeader>
        <AtlCardContent>Adjust the controls to explore all options.</AtlCardContent>
        <AtlCardFooter>
          <AtlButton variant="primary" size="sm">Action</AtlButton>
        </AtlCardFooter>
      </AtlCard>
    `,
  }),
};
