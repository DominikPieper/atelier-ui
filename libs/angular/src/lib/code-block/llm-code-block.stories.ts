import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { LlmCodeBlock } from './llm-code-block';

const SAMPLE_TS = `import { LlmButton } from '@atelier-ui/angular';

@Component({
  template: \`<llm-button variant="primary" [loading]="saving">Save</llm-button>\`,
})
export class MyComponent {
  saving = false;
}`;

const SAMPLE_JSON = `{
  "name": "my-app",
  "dependencies": {
    "@atelier-ui/angular": "^0.0.11"
  }
}`;

const SAMPLE_SHELL = `npm install @atelier-ui/angular
npx nx generate @atelier-ui/generators:llm-component-angular --name=my-widget`;

const meta: Meta<LlmCodeBlock> = {
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
type Story = StoryObj<LlmCodeBlock>;

export const Default: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: '',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => ({
    props: args,
    template: `<llm-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
};

export const WithFilename: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: 'my-component.ts',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => ({
    props: args,
    template: `<llm-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
};

export const WithLineNumbers: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: 'my-component.ts',
    copyable: true,
    showLineNumbers: true,
  },
  render: (args) => ({
    props: args,
    template: `<llm-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
};

export const Json: Story = {
  args: {
    code: SAMPLE_JSON,
    language: 'json',
    filename: 'package.json',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => ({
    props: args,
    template: `<llm-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
};

export const Shell: Story = {
  args: {
    code: SAMPLE_SHELL,
    language: 'shell',
    filename: '',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => ({
    props: args,
    template: `<llm-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
};

export const NoCopyButton: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: '',
    copyable: false,
    showLineNumbers: false,
  },
  render: (args) => ({
    props: args,
    template: `<llm-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
};
