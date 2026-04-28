import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmCard from './llm-card.vue';
import LlmCardHeader from './llm-card-header.vue';
import LlmCardContent from './llm-card-content.vue';
import LlmCardFooter from './llm-card-footer.vue';
import LlmButton from '../button/llm-button.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmCard> = {
  title: 'Components/Display/LlmCard',
  component: LlmCard,
  tags: ['autodocs'],
  render: (args) => ({
    components: { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter, LlmButton },
    setup() { return { args }; },
    template: `
      <LlmCard v-bind="args">
        <LlmCardHeader>Card Header</LlmCardHeader>
        <LlmCardContent>This is the card body content.</LlmCardContent>
        <LlmCardFooter>
          <LlmButton variant="primary" size="sm">Save</LlmButton>
          <LlmButton variant="outline" size="sm">Cancel</LlmButton>
        </LlmCardFooter>
      </LlmCard>
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
  },
};

export default meta;
type Story = StoryObj<typeof LlmCard>;

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
    components: { LlmCard, LlmCardHeader, LlmCardContent },
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start">
        <LlmCard variant="elevated" style="width:240px">
          <LlmCardHeader>Elevated</LlmCardHeader>
          <LlmCardContent>Box shadow for depth.</LlmCardContent>
        </LlmCard>
        <LlmCard variant="outlined" style="width:240px">
          <LlmCardHeader>Outlined</LlmCardHeader>
          <LlmCardContent>Border for definition.</LlmCardContent>
        </LlmCard>
        <LlmCard variant="flat" style="width:240px">
          <LlmCardHeader>Flat</LlmCardHeader>
          <LlmCardContent>No shadow or border.</LlmCardContent>
        </LlmCard>
      </div>
    `,
  }),
};

export const AllPadding: Story = {
  render: () => ({
    components: { LlmCard, LlmCardHeader, LlmCardContent },
    template: `
      <div style="display:flex;gap:1.5rem;flex-wrap:wrap;align-items:flex-start">
        <LlmCard variant="outlined" padding="none" style="width:200px">
          <LlmCardHeader>None</LlmCardHeader>
          <LlmCardContent>padding="none"</LlmCardContent>
        </LlmCard>
        <LlmCard variant="outlined" padding="sm" style="width:200px">
          <LlmCardHeader>Small</LlmCardHeader>
          <LlmCardContent>padding="sm"</LlmCardContent>
        </LlmCard>
        <LlmCard variant="outlined" padding="md" style="width:200px">
          <LlmCardHeader>Medium</LlmCardHeader>
          <LlmCardContent>padding="md"</LlmCardContent>
        </LlmCard>
        <LlmCard variant="outlined" padding="lg" style="width:200px">
          <LlmCardHeader>Large</LlmCardHeader>
          <LlmCardContent>padding="lg"</LlmCardContent>
        </LlmCard>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter, LlmButton },
    setup() { return { args }; },
    template: `
      <LlmCard v-bind="args" style="max-width:360px">
        <LlmCardHeader>Playground Card</LlmCardHeader>
        <LlmCardContent>Adjust the controls to explore all options.</LlmCardContent>
        <LlmCardFooter>
          <LlmButton variant="primary" size="sm">Action</LlmButton>
        </LlmCardFooter>
      </LlmCard>
    `,
  }),
};
