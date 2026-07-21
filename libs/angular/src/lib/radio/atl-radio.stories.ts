import type { Meta, StoryObj } from '@storybook/angular';
import { AtlRadioGroup } from '../radio-group/atl-radio-group';
import { AtlRadio } from './atl-radio';

import { metadata } from '@atelier-ui/spec/metadata/radio.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: "figma"; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlRadio> = {
  title: 'Components/Inputs/AtlRadio',
  component: AtlRadio,
  tags: ['autodocs'],
  render: (args) => ({
    props: { ...args, value: '' },
    imports: [AtlRadioGroup],
    template: `
      <atl-radio-group [(value)]="value" name="demo">
        <atl-radio radioValue="a">Option A</atl-radio>
        <atl-radio radioValue="b">Option B</atl-radio>
      </atl-radio-group>
    `,
  }),
  argTypes: {
    disabled: { control: 'boolean' },
  },
  args: {
    disabled: false,
  },
  parameters: {
    design: figmaNode('420-185'),
    docs: { description: { component: metadata.purpose } },
  },
};

export default meta;
type Story = StoryObj<AtlRadio>;

export const Default: Story = {
  parameters: { design: figmaNode('420-165') },
};

export const Disabled: Story = {
  render: () => ({
    props: { value: 'a' },
    imports: [AtlRadioGroup],
    template: `
      <atl-radio-group [(value)]="value" name="demo">
        <atl-radio radioValue="a">Enabled</atl-radio>
        <atl-radio radioValue="b" [disabled]="true">Disabled</atl-radio>
      </atl-radio-group>
    `,
  }),
};

export const Checked: Story = {
  render: () => ({
    props: { value: 'a' },
    imports: [AtlRadioGroup],
    template: `
      <atl-radio-group [(value)]="value" name="demo">
        <atl-radio radioValue="a">Selected by default</atl-radio>
        <atl-radio radioValue="b">Other</atl-radio>
      </atl-radio-group>
    `,
  }),
  parameters: { design: figmaNode('420-169') },
};

export const Playground: Story = {
  render: (args) => ({
    props: { ...args, value: '' },
    imports: [AtlRadioGroup],
    template: `
      <atl-radio-group [(value)]="value" name="playground">
        <atl-radio radioValue="a" [disabled]="disabled">Option A</atl-radio>
        <atl-radio radioValue="b" [disabled]="disabled">Option B</atl-radio>
        <atl-radio radioValue="c" [disabled]="disabled">Option C</atl-radio>
      </atl-radio-group>
    `,
  }),
};
