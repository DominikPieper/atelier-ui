import type { Meta, StoryObj } from '@storybook/vue3-vite';
import LlmCard from './llm-card.vue';
import LlmCardHeader from './llm-card-header.vue';
import LlmCardContent from './llm-card-content.vue';
import LlmCardFooter from './llm-card-footer.vue';

const meta: Meta<typeof LlmCard> = {
  title: 'Components/LlmCard',
  component: LlmCard,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['elevated', 'outlined', 'flat'] },
    padding: { control: 'select', options: ['none', 'sm', 'md', 'lg'] },
  },
  args: {
    variant: 'elevated',
    padding: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof LlmCard>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter },
    setup() { return { args }; },
    template: `
      <LlmCard v-bind="args">
        <LlmCardHeader>Card Title</LlmCardHeader>
        <LlmCardContent>This is the card body content.</LlmCardContent>
        <LlmCardFooter>Footer action</LlmCardFooter>
      </LlmCard>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    components: { LlmCard, LlmCardHeader, LlmCardContent },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <LlmCard variant="elevated">
          <LlmCardHeader>Elevated</LlmCardHeader>
          <LlmCardContent>Card with elevation shadow.</LlmCardContent>
        </LlmCard>
        <LlmCard variant="outlined">
          <LlmCardHeader>Outlined</LlmCardHeader>
          <LlmCardContent>Card with border outline.</LlmCardContent>
        </LlmCard>
        <LlmCard variant="flat">
          <LlmCardHeader>Flat</LlmCardHeader>
          <LlmCardContent>Card with no elevation or border.</LlmCardContent>
        </LlmCard>
      </div>
    `,
  }),
};

export const AllPaddings: Story = {
  render: () => ({
    components: { LlmCard, LlmCardContent },
    template: `
      <div style="display:flex;flex-direction:column;gap:1rem;max-width:400px">
        <LlmCard padding="none"><LlmCardContent>Padding: none</LlmCardContent></LlmCard>
        <LlmCard padding="sm"><LlmCardContent>Padding: sm</LlmCardContent></LlmCard>
        <LlmCard padding="md"><LlmCardContent>Padding: md</LlmCardContent></LlmCard>
        <LlmCard padding="lg"><LlmCardContent>Padding: lg</LlmCardContent></LlmCard>
      </div>
    `,
  }),
};
