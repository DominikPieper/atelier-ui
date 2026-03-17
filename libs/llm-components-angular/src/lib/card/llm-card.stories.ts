import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmCard, LlmCardContent, LlmCardFooter, LlmCardHeader } from './llm-card';
import { LlmButton } from '../button/llm-button';

const meta: Meta<LlmCard> = {
  title: 'Components/LlmCard',
  component: LlmCard,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <llm-card ${argsToTemplate(args)}>
        <llm-card-header>Card Header</llm-card-header>
        <llm-card-content>This is the card body content.</llm-card-content>
        <llm-card-footer>
          <llm-button variant="primary" size="sm">Save</llm-button>
          <llm-button variant="outline" size="sm">Cancel</llm-button>
        </llm-card-footer>
      </llm-card>
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
            LlmCardHeader,
            LlmCardContent,
            LlmCardFooter,
            LlmButton,
          ],
        },
      };
    },
  ],
};

export default meta;
type Story = StoryObj<LlmCard>;

export const Default: Story = {};

export const Elevated: Story = {
  args: { variant: 'elevated' },
};

export const Outlined: Story = {
  args: { variant: 'outlined' },
};

export const Flat: Story = {
  args: { variant: 'flat' },
};

export const PaddingSmall: Story = {
  args: { padding: 'sm' },
};

export const PaddingNone: Story = {
  args: { padding: 'none' },
};

export const AllVariants: Story = {
  render: () => ({
    moduleMetadata: { imports: [LlmCard, LlmCardHeader, LlmCardContent, LlmCardFooter, LlmButton] },
    template: `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;">
        <llm-card variant="elevated" style="width: 240px;">
          <llm-card-header>Elevated</llm-card-header>
          <llm-card-content>Box shadow for depth.</llm-card-content>
        </llm-card>
        <llm-card variant="outlined" style="width: 240px;">
          <llm-card-header>Outlined</llm-card-header>
          <llm-card-content>Border for definition.</llm-card-content>
        </llm-card>
        <llm-card variant="flat" style="width: 240px;">
          <llm-card-header>Flat</llm-card-header>
          <llm-card-content>No shadow or border.</llm-card-content>
        </llm-card>
      </div>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    template: `
      <llm-card ${argsToTemplate(args)} style="max-width: 360px;">
        <llm-card-header>Playground Card</llm-card-header>
        <llm-card-content>Adjust the controls to explore all options.</llm-card-content>
        <llm-card-footer>
          <llm-button variant="primary" size="sm">Action</llm-button>
        </llm-card-footer>
      </llm-card>
    `,
  }),
};
