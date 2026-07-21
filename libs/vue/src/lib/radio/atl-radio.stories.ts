import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlRadio from './atl-radio.vue';
import AtlRadioGroup from '../radio-group/atl-radio-group.vue';

import { metadata } from '@atelier-ui/spec/metadata/radio.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlRadio> = {
  title: 'Components/Inputs/AtlRadio',
  component: AtlRadio,
  tags: ['autodocs'],
  argTypes: {
    radioValue: { control: 'text' },
    disabled: { control: 'boolean' },
  },
  args: {
    radioValue: 'option',
    disabled: false,
  },
  parameters: { design: figmaNode('420-185'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlRadio>;

export const Default: Story = {
  render: () => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref('');
      return { value };
    },
    template: `
      <AtlRadioGroup v-model:value="value" name="example">
        <AtlRadio radioValue="a">Option A</AtlRadio>
        <AtlRadio radioValue="b">Option B</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
  parameters: { design: figmaNode('420-165') },
};

export const Checked: Story = {
  render: () => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref('a');
      return { value };
    },
    template: `
      <AtlRadioGroup v-model:value="value" name="example">
        <AtlRadio radioValue="a">Selected by default</AtlRadio>
        <AtlRadio radioValue="b">Other</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
  parameters: { design: figmaNode('420-169') },
};

export const Disabled: Story = {
  render: () => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref('a');
      return { value };
    },
    template: `
      <AtlRadioGroup v-model:value="value" name="example">
        <AtlRadio radioValue="a">Enabled</AtlRadio>
        <AtlRadio radioValue="b" :disabled="true">Disabled</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
};

export const Playground: Story = {
  render: (args) => ({
    components: { AtlRadioGroup, AtlRadio },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `
      <AtlRadioGroup v-model:value="value" name="playground">
        <AtlRadio radioValue="a" :disabled="args.disabled">Option A</AtlRadio>
        <AtlRadio radioValue="b" :disabled="args.disabled">Option B</AtlRadio>
        <AtlRadio radioValue="c" :disabled="args.disabled">Option C</AtlRadio>
      </AtlRadioGroup>
    `,
  }),
};
