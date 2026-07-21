import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlCombobox from './atl-combobox.vue';

import { metadata } from '@atelier-ui/spec/metadata/combobox.metadata';
const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
  { value: 'honeydew', label: 'Honeydew', disabled: true },
];

const COUNTRIES = [
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'jp', label: 'Japan' },
];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlCombobox> = {
  title: 'Components/Inputs/AtlCombobox',
  component: AtlCombobox,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  parameters: { design: figmaNode('421-339'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlCombobox>;

export const Default: Story = {
  render: (args) => ({
    components: { AtlCombobox },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `<AtlCombobox v-bind="args" v-model:value="value" :options="args.options" />`,
  }),
  args: {
    options: FRUITS,
    placeholder: 'Search fruit…',
  },
  parameters: { design: figmaNode('421-291') },
};

export const WithPreselection: Story = {
  render: () => ({
    components: { AtlCombobox },
    setup() {
      const value = ref('cherry');
      return { value, options: FRUITS };
    },
    template: `<AtlCombobox v-model:value="value" :options="options" placeholder="Search fruit…" />`,
  }),
  parameters: { design: figmaNode('421-324') },
};

export const Countries: Story = {
  render: () => ({
    components: { AtlCombobox },
    setup() {
      const value = ref('');
      return { value, options: COUNTRIES };
    },
    template: `<AtlCombobox v-model:value="value" :options="options" placeholder="Search country…" />`,
  }),
  parameters: { design: figmaNode('421-291') },
};

export const Disabled: Story = {
  render: () => ({
    components: { AtlCombobox },
    setup() { return { options: FRUITS }; },
    template: `<AtlCombobox value="banana" :options="options" :disabled="true" placeholder="Search fruit…" />`,
  }),
};

export const Invalid: Story = {
  render: () => ({
    components: { AtlCombobox },
    setup() {
      const value = ref('');
      return { value, options: FRUITS };
    },
    template: `
      <AtlCombobox
        v-model:value="value"
        :options="options"
        :invalid="true"
        :errors="['Please select a fruit']"
        placeholder="Search fruit…"
      />
    `,
  }),
};

export const WithDisabledOption: Story = {
  render: () => ({
    components: { AtlCombobox },
    setup() {
      const value = ref('');
      return { value, options: FRUITS };
    },
    template: `<AtlCombobox v-model:value="value" :options="options" placeholder="Search fruit… (Honeydew disabled)" />`,
  }),
  parameters: { design: figmaNode('421-295') },
};
