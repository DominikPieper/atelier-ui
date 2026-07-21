import type { Meta, StoryObj } from '@storybook/angular';
import { AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger } from './atl-menu';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/menu.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlMenu> = {
  title: 'Components/Navigation/AtlMenu',
  component: AtlMenu,
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
    design: figmaNode('55-130'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlMenu>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger, AtlButton] },
    template: `
      <atl-button [atlMenuTriggerFor]="menu">Actions</atl-button>
      <ng-template #menu>
        <atl-menu variant="${args['variant']}">
          <atl-menu-item>Copy</atl-menu-item>
          <atl-menu-item>Paste</atl-menu-item>
          <atl-menu-separator />
          <atl-menu-item>Delete</atl-menu-item>
        </atl-menu>
      </ng-template>
    `,
  }),
  parameters: { design: figmaNode('55-128') },
};

export const WithDisabledItems: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger, AtlButton] },
    template: `
      <atl-button [atlMenuTriggerFor]="menu">Edit</atl-button>
      <ng-template #menu>
        <atl-menu>
          <atl-menu-item>Cut</atl-menu-item>
          <atl-menu-item>Copy</atl-menu-item>
          <atl-menu-item [disabled]="true">Paste</atl-menu-item>
          <atl-menu-separator />
          <atl-menu-item [disabled]="true">Undo</atl-menu-item>
          <atl-menu-item>Redo</atl-menu-item>
        </atl-menu>
      </ng-template>
    `,
  }),
};

export const Compact: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger, AtlButton] },
    template: `
      <atl-button variant="outline" size="sm" [atlMenuTriggerFor]="menu">Options</atl-button>
      <ng-template #menu>
        <atl-menu variant="compact">
          <atl-menu-item>View</atl-menu-item>
          <atl-menu-item>Edit</atl-menu-item>
          <atl-menu-item>Share</atl-menu-item>
          <atl-menu-separator />
          <atl-menu-item>Archive</atl-menu-item>
        </atl-menu>
      </ng-template>
    `,
  }),
  parameters: { design: figmaNode('55-129') },
};

export const NestedSubmenus: Story = {
  render: () => ({
    moduleMetadata: { imports: [AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger, AtlButton] },
    template: `
      <atl-button [atlMenuTriggerFor]="mainMenu">File</atl-button>
      <ng-template #mainMenu>
        <atl-menu>
          <atl-menu-item>New</atl-menu-item>
          <atl-menu-item>Open</atl-menu-item>
          <atl-menu-item [atlMenuTriggerFor]="exportMenu">Export</atl-menu-item>
          <atl-menu-separator />
          <atl-menu-item>Close</atl-menu-item>
        </atl-menu>
      </ng-template>
      <ng-template #exportMenu>
        <atl-menu>
          <atl-menu-item>PDF</atl-menu-item>
          <atl-menu-item>CSV</atl-menu-item>
          <atl-menu-item>JSON</atl-menu-item>
        </atl-menu>
      </ng-template>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: [AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger, AtlButton] },
    template: `
      <atl-button [atlMenuTriggerFor]="menu">Open Menu</atl-button>
      <ng-template #menu>
        <atl-menu [variant]="variant">
          <atl-menu-item>First item</atl-menu-item>
          <atl-menu-item>Second item</atl-menu-item>
          <atl-menu-separator />
          <atl-menu-item [disabled]="true">Disabled item</atl-menu-item>
          <atl-menu-item>Last item</atl-menu-item>
        </atl-menu>
      </ng-template>
    `,
  }),
};
