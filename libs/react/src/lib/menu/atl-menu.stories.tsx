import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  AtlMenu,
  AtlMenuItem,
  AtlMenuSeparator,
  AtlMenuTrigger,
} from './atl-menu';
import { expect } from 'storybook/test';
import { AtlButton } from '../button/atl-button';

import { metadata } from '@atelier-ui/spec/metadata/menu.metadata';
import { contract } from '@atelier-ui/spec/contracts/menu.contract';
const FIGMA_FILE =
  'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

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
    contract,
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
        <AtlButton
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={onClick}
        >
          Actions
        </AtlButton>
      )}
    </AtlMenuTrigger>
  ),
  parameters: { design: figmaNode('55-128') },
  play: async ({ canvas, userEvent }) => {
    // WAI-ARIA menu button: ArrowDown opens and focuses the first item, arrows
    // wrap and skip the disabled one, Escape closes and returns focus.
    const trigger = canvas.getByRole('button', { name: 'Actions' });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menuitem', { name: 'Paste' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByRole('menuitem', { name: 'Copy' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(trigger).toHaveFocus();
  },
};

export const VariantDefault: Story = {
  render: () => (
    <AtlMenuTrigger
      menu={
        <AtlMenu variant="default">
          <AtlMenuItem onTriggered={() => alert('Copy')}>Copy</AtlMenuItem>
          <AtlMenuItem onTriggered={() => alert('Paste')}>Paste</AtlMenuItem>
          <AtlMenuSeparator />
          <AtlMenuItem disabled>Delete</AtlMenuItem>
        </AtlMenu>
      }
    >
      {({ onClick, ref }) => (
        <AtlButton
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={onClick}
        >
          Actions
        </AtlButton>
      )}
    </AtlMenuTrigger>
  ),
};

export const Compact: Story = {
  render: () => (
    <AtlMenuTrigger
      menu={
        <AtlMenu variant="compact">
          <AtlMenuItem onTriggered={() => alert('Edit')}>Edit</AtlMenuItem>
          <AtlMenuItem onTriggered={() => alert('Duplicate')}>
            Duplicate
          </AtlMenuItem>
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
        <AtlButton
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={onClick}
          variant="secondary"
        >
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
        <AtlButton
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={onClick}
          variant="secondary"
        >
          Account
        </AtlButton>
      )}
    </AtlMenuTrigger>
  ),
};
