import type { Meta, StoryObj } from '@storybook/vue3-vite';
import AtlCodeBlock from './atl-code-block.vue';

const SAMPLE_TS = `import { AtlButton } from '@atelier-ui/vue';

export default {
  components: { AtlButton },
  data() { return { saving: false }; },
  template: \`<AtlButton variant="primary" :loading="saving">Save</AtlButton>\`,
};`;

const SAMPLE_JSON = `{
  "name": "my-app",
  "dependencies": {
    "@atelier-ui/vue": "^0.0.11"
  }
}`;

const SAMPLE_SHELL = `npm install @atelier-ui/vue
npx nx generate @atelier-ui/generators:atl-component-vue --name=my-widget`;

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlCodeBlock> = {
  title: 'Components/Display/AtlCodeBlock',
  component: AtlCodeBlock,
  tags: ['autodocs'],
  argTypes: {
    copyable: { control: 'boolean' },
    showLineNumbers: { control: 'boolean' },
    language: { control: 'text' },
    filename: { control: 'text' },
    code: { control: 'text' },
  },
  parameters: { design: figmaNode('420-286') },
};

export default meta;
type Story = StoryObj<typeof AtlCodeBlock>;

export const Default: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    copyable: true,
    showLineNumbers: false,
  },
  render: (args) => ({
    components: { AtlCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><AtlCodeBlock v-bind="args" /></div>`,
  }),
  parameters: { design: figmaNode('420-186') },
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
    components: { AtlCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><AtlCodeBlock v-bind="args" /></div>`,
  }),
  parameters: { design: figmaNode('420-209') },
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
    components: { AtlCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><AtlCodeBlock v-bind="args" /></div>`,
  }),
  parameters: { design: figmaNode('420-232') },
};

export const Json: Story = {
  args: {
    code: SAMPLE_JSON,
    language: 'json',
    filename: 'package.json',
    copyable: true,
  },
  render: (args) => ({
    components: { AtlCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><AtlCodeBlock v-bind="args" /></div>`,
  }),
  parameters: { design: figmaNode('420-209') },
};

export const Shell: Story = {
  args: {
    code: SAMPLE_SHELL,
    language: 'shell',
    copyable: true,
  },
  render: (args) => ({
    components: { AtlCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><AtlCodeBlock v-bind="args" /></div>`,
  }),
  parameters: { design: figmaNode('420-186') },
};

export const NoCopyButton: Story = {
  args: {
    code: SAMPLE_TS,
    language: 'typescript',
    copyable: false,
  },
  render: (args) => ({
    components: { AtlCodeBlock },
    setup() { return { args }; },
    template: `<div style="max-width:600px"><AtlCodeBlock v-bind="args" /></div>`,
  }),
  parameters: { design: figmaNode('420-263') },
};
