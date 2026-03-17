import type { Meta, StoryObj } from '@storybook/react';
import { LlmMenu, LlmMenuItem, LlmMenuSeparator, LlmMenuTrigger } from './llm-menu';
import { LlmButton } from '../button/llm-button';

const meta: Meta<typeof LlmMenu> = {
  title: 'Components/LlmMenu',
  component: LlmMenu,
  tags: ['autodocs'],
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
