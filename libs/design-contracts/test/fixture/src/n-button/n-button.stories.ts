import type { Meta, StoryObj } from '@storybook/angular';
import { NButton } from './n-button';
import { contract } from '../../contracts/n-button.contract';

const meta: Meta<NButton> = {
  title: 'Aktionen/NButton',
  component: NButton,
  args: {
    variant: 'primary',
    size: 'md',
    tone: 'neutral',
    selected: false,
    disabled: false,
  },
  parameters: { contract },
};

export default meta;
type Story = StoryObj<NButton>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Small: Story = { args: { size: 'sm' } };
export const Medium: Story = { args: { size: 'md' } };
export const Brand: Story = { args: { tone: 'brand' } };
export const Neutral: Story = { args: { tone: 'neutral' } };
export const Selected: Story = { args: { selected: true } };
export const Disabled: Story = { args: { disabled: true } };
