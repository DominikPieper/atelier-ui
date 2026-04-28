import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import LlmTable from './llm-table.vue';
import LlmThead from './llm-thead.vue';
import LlmTbody from './llm-tbody.vue';
import LlmTr from './llm-tr.vue';
import LlmTh from './llm-th.vue';
import LlmTd from './llm-td.vue';

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/LLM-Components';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<typeof LlmTable> = {
  title: 'Components/Display/LlmTable',
  component: LlmTable,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'striped', 'bordered'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    stickyHeader: { control: 'boolean' },
  },
  parameters: { design: figmaNode('421-1183') },
};

export default meta;
type Story = StoryObj<typeof LlmTable>;

const sampleData = [
  { name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
  { name: 'Bob Smith', role: 'Designer', status: 'Inactive' },
  { name: 'Carol White', role: 'Manager', status: 'Active' },
];

export const Default: Story = {
  parameters: { design: figmaNode('421-884') },
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
  parameters: { design: figmaNode('421-923') },
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
  parameters: { design: figmaNode('421-962') },
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
  parameters: { design: figmaNode('421-884') },
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
  parameters: { design: figmaNode('421-884') },
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
  parameters: { design: figmaNode('421-884') },
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

export const KitchenSink: Story = {
  parameters: { design: figmaNode('421-1183') },
  render: () => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
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
        <LlmTable variant="striped" :stickyHeader="true">
          <LlmThead>
            <LlmTr>
              <LlmTh>
                <input type="checkbox" :checked="allSelected()" @change="toggleAll($event.target.checked)" />
              </LlmTh>
              <LlmTh :sortable="true" :sortDirection="sortCol === 'name' ? sortDir : null" @sort="onSort('name', $event)">Name</LlmTh>
              <LlmTh>Role</LlmTh>
              <LlmTh align="center">Status</LlmTh>
              <LlmTh align="end">Actions</LlmTh>
            </LlmTr>
          </LlmThead>
          <LlmTbody>
            <LlmTr
              v-for="row in rows"
              :key="row.id"
              :selectable="true"
              :selected="selected.has(row.id)"
              @update:selected="toggle(row.id, $event)"
            >
              <LlmTd>{{ row.name }}</LlmTd>
              <LlmTd>{{ row.role }}</LlmTd>
              <LlmTd align="center">{{ row.status }}</LlmTd>
              <LlmTd align="end"><button type="button">Edit</button></LlmTd>
            </LlmTr>
          </LlmTbody>
        </LlmTable>
      </div>
    `,
  }),
};

export const Playground: Story = {
  parameters: { design: figmaNode('421-1183') },
  render: (args) => ({
    components: { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd },
    setup() { return { args }; },
    template: `
      <LlmTable v-bind="args">
        <LlmThead>
          <LlmTr>
            <LlmTh>Column A</LlmTh>
            <LlmTh>Column B</LlmTh>
            <LlmTh>Column C</LlmTh>
          </LlmTr>
        </LlmThead>
        <LlmTbody>
          <LlmTr><LlmTd>Cell A1</LlmTd><LlmTd>Cell B1</LlmTd><LlmTd>Cell C1</LlmTd></LlmTr>
          <LlmTr><LlmTd>Cell A2</LlmTd><LlmTd>Cell B2</LlmTd><LlmTd>Cell C2</LlmTd></LlmTr>
          <LlmTr><LlmTd>Cell A3</LlmTd><LlmTd>Cell B3</LlmTd><LlmTd>Cell C3</LlmTd></LlmTr>
        </LlmTbody>
      </LlmTable>
    `,
  }),
};
