import type { Meta, StoryObj } from '@storybook/react';
import { LlmCodeBlock } from './llm-code-block';

const SAMPLE_TS = `import { LlmButton } from '@atelier-ui/react';

export function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <LlmButton variant="primary" onClick={onSave}>
      Save changes
    </LlmButton>
  );
}`;

const SAMPLE_JSON = `{
  "name": "my-app",
  "dependencies": {
    "@atelier-ui/react": "^0.0.11"
  }
}`;

const SAMPLE_SHELL = `npm install @atelier-ui/react
npx nx generate @atelier-ui/generators:llm-component-react --name=my-widget`;

const meta: Meta<typeof LlmCodeBlock> = {
  title: 'Components/LlmCodeBlock',
  component: LlmCodeBlock,
  tags: ['autodocs'],
  argTypes: {
    copyable: { control: 'boolean' },
    showLineNumbers: { control: 'boolean' },
    language: { control: 'text' },
    filename: { control: 'text' },
    code: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof LlmCodeBlock>;

export const Default: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 600 }}>
      <LlmCodeBlock {...args} />
    </div>
  ),
};

export const WithFilename: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: 'save-button.tsx',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 600 }}>
      <LlmCodeBlock {...args} />
    </div>
  ),
};

export const WithLineNumbers: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: 'save-button.tsx',
    copyable: true,
    showLineNumbers: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 600 }}>
      <LlmCodeBlock {...args} />
    </div>
  ),
};

export const Json: Story = {
  args: {
    code: SAMPLE_JSON,
    language: 'json',
    filename: 'package.json',
    copyable: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 600 }}>
      <LlmCodeBlock {...args} />
    </div>
  ),
};

export const Shell: Story = {
  args: {
    code: SAMPLE_SHELL,
    language: 'shell',
    copyable: true,
  },
  render: (args) => (
    <div style={{ maxWidth: 600 }}>
      <LlmCodeBlock {...args} />
    </div>
  ),
};

export const NoCopyButton: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    copyable: false,
  },
  render: (args) => (
    <div style={{ maxWidth: 600 }}>
      <LlmCodeBlock {...args} />
    </div>
  ),
};
