import type { Meta, StoryObj } from '@storybook/angular';
import { LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger } from './llm-menu';
import { LlmButton } from '../button/llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmMenu> = {
  title: 'Components/LlmMenu',
  component: LlmMenu,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact'],
    },
  },
  args: {
    variant: 'default',
  },
  parameters: {
    design: figmaNode('3-633'),
  },
};

export default meta;
type Story = StoryObj<LlmMenu>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    imports: [LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger, LlmButton],
    template: `
      <llm-button [llmMenuTriggerFor]="menu">Actions</llm-button>
      <ng-template #menu>
        <llm-menu variant="${args['variant']}">
          <llm-menu-item>Copy</llm-menu-item>
          <llm-menu-item>Paste</llm-menu-item>
          <llm-menu-separator />
          <llm-menu-item>Delete</llm-menu-item>
        </llm-menu>
      </ng-template>
    `,
  }),
  parameters: { design: figmaNode('55-128') },
};

export const WithDisabledItems: Story = {
  render: () => ({
    imports: [LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger, LlmButton],
    template: `
      <llm-button [llmMenuTriggerFor]="menu">Edit</llm-button>
      <ng-template #menu>
        <llm-menu>
          <llm-menu-item>Cut</llm-menu-item>
          <llm-menu-item>Copy</llm-menu-item>
          <llm-menu-item [disabled]="true">Paste</llm-menu-item>
          <llm-menu-separator />
          <llm-menu-item [disabled]="true">Undo</llm-menu-item>
          <llm-menu-item>Redo</llm-menu-item>
        </llm-menu>
      </ng-template>
    `,
  }),
};

export const Compact: Story = {
  render: () => ({
    imports: [LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger, LlmButton],
    template: `
      <llm-button variant="outline" size="sm" [llmMenuTriggerFor]="menu">Options</llm-button>
      <ng-template #menu>
        <llm-menu variant="compact">
          <llm-menu-item>View</llm-menu-item>
          <llm-menu-item>Edit</llm-menu-item>
          <llm-menu-item>Share</llm-menu-item>
          <llm-menu-separator />
          <llm-menu-item>Archive</llm-menu-item>
        </llm-menu>
      </ng-template>
    `,
  }),
  parameters: { design: figmaNode('55-129') },
};

export const NestedSubmenus: Story = {
  render: () => ({
    imports: [LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger, LlmButton],
    template: `
      <llm-button [llmMenuTriggerFor]="mainMenu">File</llm-button>
      <ng-template #mainMenu>
        <llm-menu>
          <llm-menu-item>New</llm-menu-item>
          <llm-menu-item>Open</llm-menu-item>
          <llm-menu-item [llmMenuTriggerFor]="exportMenu">Export</llm-menu-item>
          <llm-menu-separator />
          <llm-menu-item>Close</llm-menu-item>
        </llm-menu>
      </ng-template>
      <ng-template #exportMenu>
        <llm-menu>
          <llm-menu-item>PDF</llm-menu-item>
          <llm-menu-item>CSV</llm-menu-item>
          <llm-menu-item>JSON</llm-menu-item>
        </llm-menu>
      </ng-template>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    imports: [LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger, LlmButton],
    template: `
      <llm-button [llmMenuTriggerFor]="menu">Open Menu</llm-button>
      <ng-template #menu>
        <llm-menu [variant]="variant">
          <llm-menu-item>First item</llm-menu-item>
          <llm-menu-item>Second item</llm-menu-item>
          <llm-menu-separator />
          <llm-menu-item [disabled]="true">Disabled item</llm-menu-item>
          <llm-menu-item>Last item</llm-menu-item>
        </llm-menu>
      </ng-template>
    `,
  }),
};
