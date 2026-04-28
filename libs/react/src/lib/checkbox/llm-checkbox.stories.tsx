import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { LlmCheckbox } from './llm-checkbox';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string) {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmCheckbox> = {
  title: 'Components/Inputs/LlmCheckbox',
  component: LlmCheckbox,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  args: { checked: false, disabled: false, invalid: false, indeterminate: false },
  parameters: {
    design: figmaNode('55-36'),
  },
};

export default meta;
type Story = StoryObj<typeof LlmCheckbox>;

export const Default: Story = {
  args: { children: 'I agree to the terms and conditions' },
  parameters: { design: figmaNode('55-32') },
};

export const Checked: Story = {
  args: { checked: true, children: 'Checked checkbox' },
  parameters: { design: figmaNode('55-33') },
};

export const Unchecked: Story = {
  args: { checked: false, children: 'Unchecked checkbox' },
  parameters: { design: figmaNode('55-32') },
};

export const Indeterminate: Story = {
  args: { indeterminate: true, children: 'Select all (indeterminate)' },
  parameters: { design: figmaNode('55-34') },
};

export const Disabled: Story = {
  args: { disabled: true, children: 'Disabled checkbox' },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true, children: 'Disabled checked checkbox' },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    errors: ['You must accept the terms'],
    children: 'Accept terms',
  },
};

const InteractiveComponent = () => {
  const [checked, setChecked] = useState(false);
  return (
    <LlmCheckbox checked={checked} onCheckedChange={setChecked}>
      {checked ? 'Checked!' : 'Click to check'}
    </LlmCheckbox>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveComponent />,
};

const SelectAllComponent = () => {
  const [items, setItems] = useState([
    { id: 1, label: 'Item A', checked: false },
    { id: 2, label: 'Item B', checked: true },
    { id: 3, label: 'Item C', checked: false },
  ]);

  const allChecked = items.every((i) => i.checked);
  const someChecked = items.some((i) => i.checked) && !allChecked;

  const toggleAll = (checked: boolean) =>
    setItems(items.map((i) => ({ ...i, checked })));
  const toggleItem = (id: number, checked: boolean) =>
    setItems(items.map((i) => (i.id === id ? { ...i, checked } : i)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <LlmCheckbox
        checked={allChecked}
        indeterminate={someChecked}
        onCheckedChange={toggleAll}
      >
        Select all
      </LlmCheckbox>
      <div style={{ marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item) => (
          <LlmCheckbox
            key={item.id}
            checked={item.checked}
            onCheckedChange={(c) => toggleItem(item.id, c)}
          >
            {item.label}
          </LlmCheckbox>
        ))}
      </div>
    </div>
  );
};

export const SelectAll: Story = {
  render: () => <SelectAllComponent />,
};
