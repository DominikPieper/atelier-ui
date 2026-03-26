import type { Meta, StoryObj } from '@storybook/vue3';
import LlmCodeBlock from './llm-code-block.vue';

const SAMPLE_TS = `import { LlmButton } from '@atelier-ui/vue';

export default {
  components: { LlmButton },
  data() { return { saving: false }; },
  template: \`<LlmButton variant="primary" :loading="saving">Save</LlmButton>\`,
};`;

const SAMPLE_JSON = `{
  "name": "my-app",
  "dependencies": {
    "@atelier-ui/vue": "^0.0.11"
  }
}`;

const SAMPLE_SHELL = `npm install @atelier-ui/vue
npx nx generate @atelier-ui/generators:llm-component-vue --name=my-widget`;

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
  render: (args) => ({
    components: { LlmCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><LlmCodeBlock v-bind="args" /></div>`,
  }),
};

export const WithFilename: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: 'my-component.vue',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => ({
    components: { LlmCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><LlmCodeBlock v-bind="args" /></div>`,
  }),
};

export const WithLineNumbers: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    filename: 'my-component.vue',
    copyable: true,
    showLineNumbers: true,
  },
  render: (args) => ({
    components: { LlmCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><LlmCodeBlock v-bind="args" /></div>`,
  }),
};

export const Json: Story = {
  args: {
    code: SAMPLE_JSON,
    language: 'json',
    filename: 'package.json',
    copyable: true,
  },
  render: (args) => ({
    components: { LlmCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><LlmCodeBlock v-bind="args" /></div>`,
  }),
};

export const Shell: Story = {
  args: {
    code: SAMPLE_SHELL,
    language: 'shell',
    copyable: true,
  },
  render: (args) => ({
    components: { LlmCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><LlmCodeBlock v-bind="args" /></div>`,
  }),
};

export const NoCopyButton: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    copyable: false,
  },
  render: (args) => ({
    components: { LlmCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><LlmCodeBlock v-bind="args" /></div>`,
  }),
};
