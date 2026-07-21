import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import AtlTable from './atl-table.vue';
import AtlThead from './atl-thead.vue';
import AtlTbody from './atl-tbody.vue';
import AtlTr from './atl-tr.vue';
import AtlTh from './atl-th.vue';
import AtlTd from './atl-td.vue';

import { metadata } from '@atelier-ui/spec/metadata/table.metadata';
const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof AtlTable> = {
  title: 'Components/Display/AtlTable',
  component: AtlTable,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'striped', 'bordered'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    stickyHeader: { control: 'boolean' },
  },
  parameters: { design: figmaNode('421-1183'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlTable>;

const sampleData = [
  { name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
  { name: 'Bob Smith', role: 'Designer', status: 'Inactive' },
  { name: 'Carol White', role: 'Manager', status: 'Active' },
];

export const Default: Story = {
  parameters: { design: figmaNode('421-884') },
  render: (args) => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
    setup() {
      return { args, data: sampleData };
    },
    template: `
      <AtlTable v-bind="args">
        <AtlThead>
          <AtlTr>
            <AtlTh>Name</AtlTh>
            <AtlTh>Role</AtlTh>
            <AtlTh>Status</AtlTh>
          </AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr v-for="row in data" :key="row.name">
            <AtlTd>{{ row.name }}</AtlTd>
            <AtlTd>{{ row.role }}</AtlTd>
            <AtlTd>{{ row.status }}</AtlTd>
          </AtlTr>
        </AtlTbody>
      </AtlTable>
    `,
  }),
};

export const Striped: Story = {
  parameters: { design: figmaNode('421-923') },
  render: () => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
    setup() { return { data: sampleData }; },
    template: `
      <AtlTable variant="striped">
        <AtlThead>
          <AtlTr><AtlTh>Name</AtlTh><AtlTh>Role</AtlTh><AtlTh>Status</AtlTh></AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr v-for="row in data" :key="row.name">
            <AtlTd>{{ row.name }}</AtlTd>
            <AtlTd>{{ row.role }}</AtlTd>
            <AtlTd>{{ row.status }}</AtlTd>
          </AtlTr>
        </AtlTbody>
      </AtlTable>
    `,
  }),
};

export const Bordered: Story = {
  parameters: { design: figmaNode('421-962') },
  render: () => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
    setup() { return { data: sampleData }; },
    template: `
      <AtlTable variant="bordered">
        <AtlThead>
          <AtlTr><AtlTh>Name</AtlTh><AtlTh>Role</AtlTh><AtlTh>Status</AtlTh></AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr v-for="row in data" :key="row.name">
            <AtlTd>{{ row.name }}</AtlTd>
            <AtlTd>{{ row.role }}</AtlTd>
            <AtlTd>{{ row.status }}</AtlTd>
          </AtlTr>
        </AtlTbody>
      </AtlTable>
    `,
  }),
};

export const Sortable: Story = {
  parameters: { design: figmaNode('421-884') },
  render: () => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
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
      <AtlTable>
        <AtlThead>
          <AtlTr>
            <AtlTh :sortable="true" :sortDirection="sortCol === 'name' ? sortDir : null" @sort="onSort('name', $event)">Name</AtlTh>
            <AtlTh :sortable="true" :sortDirection="sortCol === 'role' ? sortDir : null" @sort="onSort('role', $event)">Role</AtlTh>
            <AtlTh>Status</AtlTh>
          </AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr v-for="row in data" :key="row.name">
            <AtlTd>{{ row.name }}</AtlTd>
            <AtlTd>{{ row.role }}</AtlTd>
            <AtlTd>{{ row.status }}</AtlTd>
          </AtlTr>
        </AtlTbody>
      </AtlTable>
    `,
  }),
};

export const Selectable: Story = {
  parameters: { design: figmaNode('421-884') },
  render: () => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
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
      <AtlTable>
        <AtlThead>
          <AtlTr><AtlTh></AtlTh><AtlTh>Name</AtlTh><AtlTh>Role</AtlTh><AtlTh>Status</AtlTh></AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr
            v-for="row in data"
            :key="row.name"
            :selectable="true"
            :selected="selected.has(row.name)"
            @update:selected="toggle(row.name, $event)"
          >
            <AtlTd>{{ row.name }}</AtlTd>
            <AtlTd>{{ row.role }}</AtlTd>
            <AtlTd>{{ row.status }}</AtlTd>
          </AtlTr>
        </AtlTbody>
      </AtlTable>
    `,
  }),
};

export const EmptyState: Story = {
  render: () => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
    template: `
      <AtlTable>
        <AtlThead>
          <AtlTr><AtlTh>Name</AtlTh><AtlTh>Role</AtlTh><AtlTh>Status</AtlTh></AtlTr>
        </AtlThead>
        <AtlTbody :empty="true" :colSpan="3">
          <template #empty>No records found.</template>
        </AtlTbody>
      </AtlTable>
    `,
  }),
};

export const StickyHeader: Story = {
  parameters: { design: figmaNode('421-884') },
  render: () => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
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
        <AtlTable :stickyHeader="true">
          <AtlThead>
            <AtlTr><AtlTh>Name</AtlTh><AtlTh>Role</AtlTh><AtlTh>Status</AtlTh></AtlTr>
          </AtlThead>
          <AtlTbody>
            <AtlTr v-for="row in rows" :key="row.name">
              <AtlTd>{{ row.name }}</AtlTd>
              <AtlTd>{{ row.role }}</AtlTd>
              <AtlTd>{{ row.status }}</AtlTd>
            </AtlTr>
          </AtlTbody>
        </AtlTable>
      </div>
    `,
  }),
};

export const KitchenSink: Story = {
  parameters: { design: figmaNode('421-1183') },
  render: () => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
    setup() {
      const rows = ref([
        { id: '1', name: 'Alice Müller', role: 'Engineer', status: 'active' },
        { id: '2', name: 'Bob Schmidt', role: 'Designer', status: 'active' },
        { id: '3', name: 'Carol Wagner', role: 'Manager', status: 'inactive' },
        { id: '4', name: 'David Bauer', role: 'Engineer', status: 'active' },
      ]);
      const selected = ref<Set<string>>(new Set());
      const sortCol = ref<string | null>(null);
      const sortDir = ref<'asc' | 'desc' | null>(null);
      function toggle(id: string, val: boolean) {
        const s = new Set(selected.value);
        if (val) s.add(id); else s.delete(id);
        selected.value = s;
      }
      function toggleAll(val: boolean) {
        selected.value = val ? new Set(rows.value.map((r) => r.id)) : new Set();
      }
      function onSort(col: string, dir: 'asc' | 'desc' | null) {
        sortCol.value = dir ? col : null;
        sortDir.value = dir;
      }
      const allSelected = () => rows.value.every((r) => selected.value.has(r.id));
      return { rows, selected, sortCol, sortDir, toggle, toggleAll, onSort, allSelected };
    },
    template: `
      <div style="max-height:300px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:0.75rem">
        <AtlTable variant="striped" :stickyHeader="true">
          <AtlThead>
            <AtlTr>
              <AtlTh>
                <input type="checkbox" :checked="allSelected()" @change="toggleAll($event.target.checked)" />
              </AtlTh>
              <AtlTh :sortable="true" :sortDirection="sortCol === 'name' ? sortDir : null" @sort="onSort('name', $event)">Name</AtlTh>
              <AtlTh>Role</AtlTh>
              <AtlTh align="center">Status</AtlTh>
              <AtlTh align="end">Actions</AtlTh>
            </AtlTr>
          </AtlThead>
          <AtlTbody>
            <AtlTr
              v-for="row in rows"
              :key="row.id"
              :selectable="true"
              :selected="selected.has(row.id)"
              @update:selected="toggle(row.id, $event)"
            >
              <AtlTd>{{ row.name }}</AtlTd>
              <AtlTd>{{ row.role }}</AtlTd>
              <AtlTd align="center">{{ row.status }}</AtlTd>
              <AtlTd align="end"><button type="button">Edit</button></AtlTd>
            </AtlTr>
          </AtlTbody>
        </AtlTable>
      </div>
    `,
  }),
};

export const Playground: Story = {
  parameters: { design: figmaNode('421-1183') },
  render: (args) => ({
    components: { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd },
    setup() { return { args }; },
    template: `
      <AtlTable v-bind="args">
        <AtlThead>
          <AtlTr>
            <AtlTh>Column A</AtlTh>
            <AtlTh>Column B</AtlTh>
            <AtlTh>Column C</AtlTh>
          </AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr><AtlTd>Cell A1</AtlTd><AtlTd>Cell B1</AtlTd><AtlTd>Cell C1</AtlTd></AtlTr>
          <AtlTr><AtlTd>Cell A2</AtlTd><AtlTd>Cell B2</AtlTd><AtlTd>Cell C2</AtlTd></AtlTr>
          <AtlTr><AtlTd>Cell A3</AtlTd><AtlTd>Cell B3</AtlTd><AtlTd>Cell C3</AtlTd></AtlTr>
        </AtlTbody>
      </AtlTable>
    `,
  }),
};
