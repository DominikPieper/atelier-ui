import type { Meta, StoryObj } from '@storybook/angular';
import { argsToTemplate } from '@storybook/angular';
import { AtlCodeBlock } from './atl-code-block';

const SAMPLE_TS = `import { AtlButton } from '@atelier-ui/angular';

@Component({
  template: \`<atl-button variant="primary" [loading]="saving">Save</atl-button>\`,
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
npx nx generate @atelier-ui/generators:atl-component-angular --name=my-widget`;

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlCodeBlock> = {
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
  parameters: {
    design: figmaNode('420-286'),
  },
};

export default meta;
type Story = StoryObj<AtlCodeBlock>;

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
    template: `<atl-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
  parameters: { design: figmaNode('420-186') },
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
    template: `<atl-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
  parameters: { design: figmaNode('420-209') },
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
    template: `<atl-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
  parameters: { design: figmaNode('420-232') },
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
    template: `<atl-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
  parameters: { design: figmaNode('420-209') },
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
    template: `<atl-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
  parameters: { design: figmaNode('420-186') },
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
    template: `<atl-code-block ${argsToTemplate(args)} style="max-width:600px" />`,
  }),
  parameters: { design: figmaNode('420-263') },
};
