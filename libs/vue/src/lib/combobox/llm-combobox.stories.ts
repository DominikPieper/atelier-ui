import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import LlmCombobox from './llm-combobox.vue';

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

const meta: Meta<typeof LlmCombobox> = {
  title: 'Components/LlmCombobox',
  component: LlmCombobox,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    invalid: { control: 'boolean' },
    required: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof LlmCombobox>;

export const Default: Story = {
  render: (args) => ({
    components: { LlmCombobox },
    setup() {
      const value = ref('');
      return { args, value };
    },
    template: `<LlmCombobox v-bind="args" v-model:value="value" :options="args.options" />`,
  }),
  args: {
    options: FRUITS,
    placeholder: 'Search fruit…',
  },
};

export const WithPreselection: Story = {
  render: () => ({
    components: { LlmCombobox },
    setup() {
      const value = ref('cherry');
      return { value, options: FRUITS };
    },
    template: `<LlmCombobox v-model:value="value" :options="options" placeholder="Search fruit…" />`,
  }),
};

export const Countries: Story = {
  render: () => ({
    components: { LlmCombobox },
    setup() {
      const value = ref('');
      return { value, options: COUNTRIES };
    },
    template: `<LlmCombobox v-model:value="value" :options="options" placeholder="Search country…" />`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    components: { LlmCombobox },
    setup() { return { options: FRUITS }; },
    template: `<LlmCombobox value="banana" :options="options" :disabled="true" placeholder="Search fruit…" />`,
  }),
};

export const Invalid: Story = {
  render: () => ({
    components: { LlmCombobox },
    setup() {
      const value = ref('');
      return { value, options: FRUITS };
    },
    template: `
      <LlmCombobox
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
    components: { LlmCombobox },
    setup() {
      const value = ref('');
      return { value, options: FRUITS };
    },
    template: `<LlmCombobox v-model:value="value" :options="options" placeholder="Search fruit… (Honeydew disabled)" />`,
  }),
};
