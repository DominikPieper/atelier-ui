import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmIcon } from './llm-icon';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const ICON_NAMES = [
  'success', 'warning', 'danger', 'info', 'error',
  'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right',
  'sort-asc', 'sort-desc', 'arrow-right', 'arrow-left',
  'copy', 'paste', 'add', 'edit', 'delete', 'close', 'more', 'default-toast',
] as const;

const meta: Meta<LlmIcon> = {
  title: 'Components/Display/LlmIcon',
  component: LlmIcon,
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `<llm-icon ${argsToTemplate(args)} />`,
  }),
  argTypes: {
    name: { control: 'select', options: [...ICON_NAMES] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    label: { control: 'text' },
  },
  args: { name: 'success', size: 'md' },
  parameters: { design: figmaNode('471-2730') },
};

export default meta;
type Story = StoryObj<LlmIcon>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <llm-icon name="success" size="sm" />
        <llm-icon name="success" size="md" />
        <llm-icon name="success" size="lg" />
      </div>
    `,
  }),
};

export const StatusIcons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <llm-icon name="success" label="Success" />
        <llm-icon name="warning" label="Warning" />
        <llm-icon name="danger" label="Danger" />
        <llm-icon name="info" label="Info" />
        <llm-icon name="error" label="Error" />
      </div>
    `,
  }),
};

export const NavigationChevrons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <llm-icon name="chevron-up" />
        <llm-icon name="chevron-down" />
        <llm-icon name="chevron-left" />
        <llm-icon name="chevron-right" />
        <llm-icon name="sort-asc" />
        <llm-icon name="sort-desc" />
        <llm-icon name="arrow-left" />
        <llm-icon name="arrow-right" />
      </div>
    `,
  }),
};

export const ActionIcons: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: 1rem; align-items: center;">
        <llm-icon name="copy" />
        <llm-icon name="paste" />
        <llm-icon name="add" />
        <llm-icon name="edit" />
        <llm-icon name="delete" />
        <llm-icon name="close" />
        <llm-icon name="more" />
      </div>
    `,
  }),
};

export const AllIcons: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 1.25rem; max-width: 540px;">
        ${ICON_NAMES.map(
          (n) => `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.375rem;">
              <llm-icon name="${n}" size="lg" />
              <span style="font-size: 0.6875rem; color: var(--ui-color-text-muted); text-align: center;">${n}</span>
            </div>
          `,
        ).join('')}
      </div>
    `,
  }),
};

export const WithAccessibleLabel: Story = {
  args: { name: 'warning', label: 'Warning' },
};

export const Playground: Story = {};
