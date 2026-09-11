import type { Meta, StoryObj } from '@storybook/react';
import { AtlButton } from '@atelier-ui/react';

// A working pattern to copy: duplicate this file for another component from
// @atelier-ui/react, or add more `args`/`argTypes` below.
const meta: Meta<typeof AtlButton> = {
  title: 'AtlButton',
  component: AtlButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    children: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof AtlButton>;

export const Default: Story = {};
