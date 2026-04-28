import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmCard, LlmCardContent, LlmCardFooter, LlmCardHeader } from './llm-card';
import { LlmButton } from '../button/llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmCard> = {
  title: 'Components/Display/LlmCard',
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
  parameters: {
    design: figmaNode('55-65'),
  },
};

export default meta;
type Story = StoryObj<LlmCard>;

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

export const AllPadding: Story = {
  render: () => ({
    moduleMetadata: { imports: [LlmCard, LlmCardHeader, LlmCardContent] },
    template: `
      <div style="display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: flex-start;">
        <llm-card variant="outlined" padding="none" style="width: 200px;">
          <llm-card-header>None</llm-card-header>
          <llm-card-content>padding="none"</llm-card-content>
        </llm-card>
        <llm-card variant="outlined" padding="sm" style="width: 200px;">
          <llm-card-header>Small</llm-card-header>
          <llm-card-content>padding="sm"</llm-card-content>
        </llm-card>
        <llm-card variant="outlined" padding="md" style="width: 200px;">
          <llm-card-header>Medium</llm-card-header>
          <llm-card-content>padding="md"</llm-card-content>
        </llm-card>
        <llm-card variant="outlined" padding="lg" style="width: 200px;">
          <llm-card-header>Large</llm-card-header>
          <llm-card-content>padding="lg"</llm-card-content>
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
