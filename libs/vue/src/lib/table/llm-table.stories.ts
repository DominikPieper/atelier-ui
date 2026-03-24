import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import LlmTable from './llm-table.vue';
import LlmThead from './llm-thead.vue';
import LlmTbody from './llm-tbody.vue';
import LlmTr from './llm-tr.vue';
import LlmTh from './llm-th.vue';
import LlmTd from './llm-td.vue';

const meta: Meta<typeof LlmTable> = {
  title: 'Components/LlmTable',
  component: LlmTable,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'striped', 'bordered'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    stickyHeader: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof LlmTable>;

const sampleData = [
  { name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
  { name: 'Bob Smith', role: 'Designer', status: 'Inactive' },
  { name: 'Carol White', role: 'Manager', status: 'Active' },
];

export const Default: Story = {
  render: (args) => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    setup() {
      return { args, data: sampleData };
    },
    template: `
      <LlmTable v-bind="args">
        <LlmThead>
          <LlmTr>
            <LlmTh>Name</LlmTh>
            <LlmTh>Role</LlmTh>
            <LlmTh>Status</LlmTh>
          </LlmTr>
        </LlmThead>
        <LlmTbody>
          <LlmTr v-for="row in data" :key="row.name">
            <LlmTd>{{ row.name }}</LlmTd>
            <LlmTd>{{ row.role }}</LlmTd>
            <LlmTd>{{ row.status }}</LlmTd>
          </LlmTr>
        </LlmTbody>
      </LlmTable>
    `,
  }),
};

export const Striped: Story = {
  render: () => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    setup() { return { data: sampleData }; },
    template: `
      <LlmTable variant="striped">
        <LlmThead>
          <LlmTr><LlmTh>Name</LlmTh><LlmTh>Role</LlmTh><LlmTh>Status</LlmTh></LlmTr>
        </LlmThead>
        <LlmTbody>
          <LlmTr v-for="row in data" :key="row.name">
            <LlmTd>{{ row.name }}</LlmTd>
            <LlmTd>{{ row.role }}</LlmTd>
            <LlmTd>{{ row.status }}</LlmTd>
          </LlmTr>
        </LlmTbody>
      </LlmTable>
    `,
  }),
};

export const Bordered: Story = {
  render: () => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    setup() { return { data: sampleData }; },
    template: `
      <LlmTable variant="bordered">
        <LlmThead>
          <LlmTr><LlmTh>Name</LlmTh><LlmTh>Role</LlmTh><LlmTh>Status</LlmTh></LlmTr>
        </LlmThead>
        <LlmTbody>
          <LlmTr v-for="row in data" :key="row.name">
            <LlmTd>{{ row.name }}</LlmTd>
            <LlmTd>{{ row.role }}</LlmTd>
            <LlmTd>{{ row.status }}</LlmTd>
          </LlmTr>
        </LlmTbody>
      </LlmTable>
    `,
  }),
};

export const Sortable: Story = {
  render: () => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    setup() {
      const sortCol = ref<string | null>(null);
      const sortDir = ref<'asc' | 'desc' | null>(null);
      function onSort(col: string, dir: 'asc' | 'desc' | null) {
        sortCol.value = dir ? col : null;
        sortDir.value = dir;
      }
      return { data: sampleData, sortCol, sortDir, onSort };
    },
    template: `
      <LlmTable>
        <LlmThead>
          <LlmTr>
            <LlmTh :sortable="true" :sortDirection="sortCol === 'name' ? sortDir : null" @sort="onSort('name', $event)">Name</LlmTh>
            <LlmTh :sortable="true" :sortDirection="sortCol === 'role' ? sortDir : null" @sort="onSort('role', $event)">Role</LlmTh>
            <LlmTh>Status</LlmTh>
          </LlmTr>
        </LlmThead>
        <LlmTbody>
          <LlmTr v-for="row in data" :key="row.name">
            <LlmTd>{{ row.name }}</LlmTd>
            <LlmTd>{{ row.role }}</LlmTd>
            <LlmTd>{{ row.status }}</LlmTd>
          </LlmTr>
        </LlmTbody>
      </LlmTable>
    `,
  }),
};

export const Selectable: Story = {
  render: () => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    setup() {
      const selected = ref<Set<string>>(new Set());
      function toggle(name: string, val: boolean) {
        const s = new Set(selected.value);
        if (val) s.add(name); else s.delete(name);
        selected.value = s;
      }
      return { data: sampleData, selected, toggle };
    },
    template: `
      <LlmTable>
        <LlmThead>
          <LlmTr><LlmTh></LlmTh><LlmTh>Name</LlmTh><LlmTh>Role</LlmTh><LlmTh>Status</LlmTh></LlmTr>
        </LlmThead>
        <LlmTbody>
          <LlmTr
            v-for="row in data"
            :key="row.name"
            :selectable="true"
            :selected="selected.has(row.name)"
            @update:selected="toggle(row.name, $event)"
          >
            <LlmTd>{{ row.name }}</LlmTd>
            <LlmTd>{{ row.role }}</LlmTd>
            <LlmTd>{{ row.status }}</LlmTd>
          </LlmTr>
        </LlmTbody>
      </LlmTable>
    `,
  }),
};

export const EmptyState: Story = {
  render: () => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    template: `
      <LlmTable>
        <LlmThead>
          <LlmTr><LlmTh>Name</LlmTh><LlmTh>Role</LlmTh><LlmTh>Status</LlmTh></LlmTr>
        </LlmThead>
        <LlmTbody :empty="true" :colSpan="3">
          <template #empty>No records found.</template>
        </LlmTbody>
      </LlmTable>
    `,
  }),
};

export const StickyHeader: Story = {
  render: () => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    setup() {
      const rows = Array.from({ length: 20 }, (_, i) => ({
        name: `User ${i + 1}`,
        role: i % 2 === 0 ? 'Engineer' : 'Designer',
        status: i % 3 === 0 ? 'Inactive' : 'Active',
      }));
      return { rows };
    },
    template: `
      <div style="height: 200px; overflow: auto;">
        <LlmTable :stickyHeader="true">
          <LlmThead>
            <LlmTr><LlmTh>Name</LlmTh><LlmTh>Role</LlmTh><LlmTh>Status</LlmTh></LlmTr>
          </LlmThead>
          <LlmTbody>
            <LlmTr v-for="row in rows" :key="row.name">
              <LlmTd>{{ row.name }}</LlmTd>
              <LlmTd>{{ row.role }}</LlmTd>
              <LlmTd>{{ row.status }}</LlmTd>
            </LlmTr>
          </LlmTbody>
        </LlmTable>
      </div>
    `,
  }),
};
