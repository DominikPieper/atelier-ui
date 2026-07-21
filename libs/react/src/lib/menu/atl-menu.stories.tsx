import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlMenu, AtlMenuItem, AtlMenuSeparator, AtlMenuTrigger } from './atl-menu';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/menu.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlMenu> = {
  title: 'Components/Navigation/AtlMenu',
  component: AtlMenu,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('55-130'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<typeof AtlMenu>;

export const Default: Story = {
  render: () => (
    <AtlMenuTrigger
      menu={
        <AtlMenu>
          <AtlMenuItem onTriggered={() => alert('Copy')}>Copy</AtlMenuItem>
          <AtlMenuItem onTriggered={() => alert('Paste')}>Paste</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem disabled>Delete</AtlMenuItem>
        </AtlMenu>
      }
    >
      {({ onClick, ref }) => (
        <AtlButton ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
          Actions
        </AtlButton>
      )}
    </AtlMenuTrigger>
  ),
  parameters: { design: figmaNode('55-128') },
};

export const Compact: Story = {
  render: () => (
    <AtlMenuTrigger
      menu={
        <AtlMenu variant="compact">
          <AtlMenuItem onTriggered={() => alert('Edit')}>Edit</AtlMenuItem>
          <AtlMenuItem onTriggered={() => alert('Duplicate')}>Duplicate</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem onTriggered={() => alert('Delete')}>Delete</AtlMenuItem>
        </AtlMenu>
      }
    >
      {({ onClick, ref }) => (
        <AtlButton
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={onClick}
          variant="outline"
          size="sm"
        >
          ···
        </AtlButton>
      )}
    </AtlMenuTrigger>
  ),
  parameters: { design: figmaNode('55-129') },
};

export const WithDisabledItems: Story = {
  render: () => (
    <AtlMenuTrigger
      menu={
        <AtlMenu>
          <AtlMenuItem onTriggered={() => alert('Edit')}>Edit</AtlMenuItem>
          <AtlMenuItem disabled>Move to archive</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem onTriggered={() => alert('Delete')}>Delete</AtlMenuItem>
        </AtlMenu>
      }
    >
      {({ onClick, ref }) => (
        <AtlButton ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick} variant="secondary">
          Options
        </AtlButton>
      )}
    </AtlMenuTrigger>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <AtlMenuTrigger
      menu={
        <AtlMenu>
          <AtlMenuItem>View profile</AtlMenuItem>
          <AtlMenuItem>Settings</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem>Sign out</AtlMenuItem>
        </AtlMenu>
      }
    >
      {({ onClick, ref }) => (
        <AtlButton ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick} variant="secondary">
          Account
        </AtlButton>
      )}
    </AtlMenuTrigger>
  ),
};
