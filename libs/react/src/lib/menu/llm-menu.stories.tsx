import type { Meta, StoryObj } from '@storybook/react';
import { LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger } from './llm-menu';
import { LlmButton } from '../button/llm-button';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmMenu> = {
  title: 'Components/LlmMenu',
  component: LlmMenu,
  tags: ['autodocs'],
  parameters: {
    design: figmaNode('3-633'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmMenu>;

export const Default: Story = {
  render: () => (
    <LlmMenuTrigger
      menu={
        <LlmMenu>
          <LlmMenuItem onTriggered={() => alert('Copy')}>Copy</LlmMenuItem>
          <LlmMenuItem onTriggered={() => alert('Paste')}>Paste</LlmMenuItem>
          <LlmMenuSeparator />
          <LlmMenuItem disabled>Delete</LlmMenuItem>
        </LlmMenu>
      }
    >
      {({ onClick, ref }) => (
        <LlmButton ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick}>
          Actions
        </LlmButton>
      )}
    </LlmMenuTrigger>
  ),
  parameters: { design: figmaNode('55-128') },
};

export const Compact: Story = {
  render: () => (
    <LlmMenuTrigger
      menu={
        <LlmMenu variant="compact">
          <LlmMenuItem onTriggered={() => alert('Edit')}>Edit</LlmMenuItem>
          <LlmMenuItem onTriggered={() => alert('Duplicate')}>Duplicate</LlmMenuItem>
          <LlmMenuSeparator />
          <LlmMenuItem onTriggered={() => alert('Delete')}>Delete</LlmMenuItem>
        </LlmMenu>
      }
    >
      {({ onClick, ref }) => (
        <LlmButton
          ref={ref as React.RefObject<HTMLButtonElement>}
          onClick={onClick}
          variant="outline"
          size="sm"
        >
          ···
        </LlmButton>
      )}
    </LlmMenuTrigger>
  ),
  parameters: { design: figmaNode('55-129') },
};

export const WithDisabledItems: Story = {
  render: () => (
    <LlmMenuTrigger
      menu={
        <LlmMenu>
          <LlmMenuItem onTriggered={() => alert('Edit')}>Edit</LlmMenuItem>
          <LlmMenuItem disabled>Move to archive</LlmMenuItem>
          <LlmMenuSeparator />
          <LlmMenuItem onTriggered={() => alert('Delete')}>Delete</LlmMenuItem>
        </LlmMenu>
      }
    >
      {({ onClick, ref }) => (
        <LlmButton ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick} variant="secondary">
          Options
        </LlmButton>
      )}
    </LlmMenuTrigger>
  ),
};

export const WithSeparator: Story = {
  render: () => (
    <LlmMenuTrigger
      menu={
        <LlmMenu>
          <LlmMenuItem>View profile</LlmMenuItem>
          <LlmMenuItem>Settings</LlmMenuItem>
          <LlmMenuSeparator />
          <LlmMenuItem>Sign out</LlmMenuItem>
        </LlmMenu>
      }
    >
      {({ onClick, ref }) => (
        <LlmButton ref={ref as React.RefObject<HTMLButtonElement>} onClick={onClick} variant="secondary">
          Account
        </LlmButton>
      )}
    </LlmMenuTrigger>
  ),
};
