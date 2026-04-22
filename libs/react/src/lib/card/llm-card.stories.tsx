import type { Meta, StoryObj } from '@storybook/react-vite';
import { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter } from './llm-card';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmCard> = {
  title: 'Components/LlmCard',
  component: LlmCard,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
  args: { variant: 'elevated', padding: 'md' },
  parameters: {
    design: figmaNode('55-65'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmCard>;

export const Default: Story = {
  render: (args) => (
    <LlmCard {...args}>
      <LlmCardHeader>Card Title</LlmCardHeader>
      <LlmCardContent>Card body text goes here.</LlmCardContent>
      <LlmCardFooter>Footer content</LlmCardFooter>
    </LlmCard>
  ),
  parameters: { design: figmaNode('55-59') },
};

export const Elevated: Story = {
  render: (args) => (
    <LlmCard {...args} variant="elevated">
      <LlmCardHeader>Elevated Card</LlmCardHeader>
      <LlmCardContent>This card has a shadow.</LlmCardContent>
    </LlmCard>
  ),
  parameters: { design: figmaNode('55-59') },
};

export const Outlined: Story = {
  render: (args) => (
    <LlmCard {...args} variant="outlined">
      <LlmCardHeader>Outlined Card</LlmCardHeader>
      <LlmCardContent>This card has a border only.</LlmCardContent>
    </LlmCard>
  ),
  parameters: { design: figmaNode('55-60') },
};

export const Flat: Story = {
  render: (args) => (
    <LlmCard {...args} variant="flat">
      <LlmCardHeader>Flat Card</LlmCardHeader>
      <LlmCardContent>This card has a sunken background.</LlmCardContent>
    </LlmCard>
  ),
  parameters: { design: figmaNode('55-61') },
};

export const NoPadding: Story = {
  render: (args) => (
    <LlmCard {...args} padding="none">
      <LlmCardHeader>No Padding Card</LlmCardHeader>
      <LlmCardContent>Content without padding.</LlmCardContent>
    </LlmCard>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {(['elevated', 'outlined', 'flat'] as const).map((v) => (
        <LlmCard key={v} variant={v} style={{ minWidth: '200px' }}>
          <LlmCardHeader>{v}</LlmCardHeader>
          <LlmCardContent>Content for {v} variant.</LlmCardContent>
          <LlmCardFooter>Footer</LlmCardFooter>
        </LlmCard>
      ))}
    </div>
  ),
};

export const ContentOnly: Story = {
  render: () => (
    <LlmCard>
      <LlmCardContent>A card with only content, no header or footer.</LlmCardContent>
    </LlmCard>
  ),
};
