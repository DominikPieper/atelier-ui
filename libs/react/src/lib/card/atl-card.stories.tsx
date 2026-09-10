import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlCard, AtlCardHeader, AtlCardContent, AtlCardFooter } from './atl-card';

import { metadata } from '@atelier-ui/spec/metadata/card.metadata';
import { contract } from '@atelier-ui/spec/contracts/card.contract';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlCard> = {
  title: 'Components/Display/AtlCard',
  component: AtlCard,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
  args: { variant: 'elevated', padding: 'md' },
  parameters: {
    design: figmaNode('55-65'),
    docs: { description: { component: metadata.purpose } },
    contract,
  },
};

export default meta;
type Story = StoryObj<typeof AtlCard>;

export const Default: Story = {
  render: (args) => (
    <AtlCard {...args}>
      <AtlCardHeader>Card Title</AtlCardHeader>
      <AtlCardContent>Card body text goes here.</AtlCardContent>
      <AtlCardFooter>Footer content</AtlCardFooter>
    </AtlCard>
  ),
  parameters: { design: figmaNode('55-59') },
};

export const Elevated: Story = {
  render: (args) => (
    <AtlCard {...args} variant="elevated">
      <AtlCardHeader>Elevated Card</AtlCardHeader>
      <AtlCardContent>This card has a shadow.</AtlCardContent>
    </AtlCard>
  ),
  parameters: { design: figmaNode('55-59') },
};

export const Outlined: Story = {
  render: (args) => (
    <AtlCard {...args} variant="outlined">
      <AtlCardHeader>Outlined Card</AtlCardHeader>
      <AtlCardContent>This card has a border only.</AtlCardContent>
    </AtlCard>
  ),
  parameters: { design: figmaNode('55-60') },
};

export const Flat: Story = {
  render: (args) => (
    <AtlCard {...args} variant="flat">
      <AtlCardHeader>Flat Card</AtlCardHeader>
      <AtlCardContent>This card has a sunken background.</AtlCardContent>
    </AtlCard>
  ),
  parameters: { design: figmaNode('55-61') },
};

export const NoPadding: Story = {
  render: (args) => (
    <AtlCard {...args} padding="none">
      <AtlCardHeader>No Padding Card</AtlCardHeader>
      <AtlCardContent>Content without padding.</AtlCardContent>
    </AtlCard>
  ),
  parameters: { design: figmaNode('55-53') },
};

export const PaddingSm: Story = {
  render: (args) => (
    <AtlCard {...args} padding="sm">
      <AtlCardHeader>Small Padding Card</AtlCardHeader>
      <AtlCardContent>Content with small padding.</AtlCardContent>
    </AtlCard>
  ),
};

export const PaddingLg: Story = {
  render: (args) => (
    <AtlCard {...args} padding="lg">
      <AtlCardHeader>Large Padding Card</AtlCardHeader>
      <AtlCardContent>Content with large padding.</AtlCardContent>
    </AtlCard>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {(['elevated', 'outlined', 'flat'] as const).map((v) => (
        <AtlCard key={v} variant={v} style={{ minWidth: '200px' }}>
          <AtlCardHeader>{v}</AtlCardHeader>
          <AtlCardContent>Content for {v} variant.</AtlCardContent>
          <AtlCardFooter>Footer</AtlCardFooter>
        </AtlCard>
      ))}
    </div>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <AtlCard>
      <AtlCardContent>A card with only content, no header or footer.</AtlCardContent>
    </AtlCard>
  ),
};
