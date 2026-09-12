import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent } from 'storybook/test';
import { AtlButton } from '@atelier-ui/react';

// A working pattern to copy: duplicate this file for another component from
// @atelier-ui/react, or add more `args`/`argTypes` below.
//
// ADR-0121: the stories are the claims — one story per `variant` value and
// per Boolean state (`disabled`, `loading`), args-based, plus exactly one
// `play` function with a real assertion (not a decorative one).
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

// One story per `variant` value.
//
// The one `play` function in this file lives here, on an enabled button: it
// proves the button actually fires its click handler when clicked, not just
// that it looks clickable.
export const Primary: Story = {
  args: { variant: 'primary' },
  render: function PrimaryRender(args) {
    const [clicked, setClicked] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          alignItems: 'flex-start',
        }}
      >
        <AtlButton {...args} onClick={() => setClicked(true)} />
        <span>{clicked ? 'clicked' : 'not clicked'}</span>
      </div>
    );
  },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(canvas.getByText('clicked')).toBeInTheDocument();
  },
};

export const Secondary: Story = {
  args: { variant: 'secondary' },
};

export const Outline: Story = {
  args: { variant: 'outline' },
};

export const Danger: Story = {
  args: { variant: 'danger' },
};

// One story per Boolean state.
export const Loading: Story = {
  args: { loading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
