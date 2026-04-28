import type { Meta, StoryObj } from '@storybook/angular';
import { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd, type LlmSortDirection } from './llm-table';
import { LlmBadge } from '../badge/llm-badge';
import { LlmButton } from '../button/llm-button';
import { LlmCheckbox } from '../checkbox/llm-checkbox';

const TABLE_IMPORTS = [LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<LlmTable> = {
  title: 'Components/Display/LlmTable',
  component: LlmTable,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'striped', 'bordered'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    stickyHeader: { control: 'boolean' },
  },
  args: {
    variant: 'default',
    size: 'md',
    stickyHeader: false,
  },
  parameters: { design: figmaNode('421-1183') },
};

export default meta;
type Story = StoryObj<LlmTable>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------
export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <llm-table [variant]="variant" [size]="size" [stickyHeader]="stickyHeader">
        <llm-thead>
          <llm-tr>
            <llm-th>Name</llm-th>
            <llm-th>Role</llm-th>
            <llm-th>Email</llm-th>
          </llm-tr>
        </llm-thead>
        <llm-tbody>
          <llm-tr>
            <llm-td>Alice Müller</llm-td>
            <llm-td>Engineer</llm-td>
            <llm-td>alice@example.com</llm-td>
          </llm-tr>
          <llm-tr>
            <llm-td>Bob Schmidt</llm-td>
            <llm-td>Designer</llm-td>
            <llm-td>bob@example.com</llm-td>
          </llm-tr>
          <llm-tr>
            <llm-td>Carol Wagner</llm-td>
            <llm-td>Manager</llm-td>
            <llm-td>carol@example.com</llm-td>
          </llm-tr>
        </llm-tbody>
      </llm-table>
    `,
  }),
  parameters: { design: figmaNode('421-884') },
};

// ---------------------------------------------------------------------------
// Striped
// ---------------------------------------------------------------------------
export const Striped: Story = {
  render: () => ({
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <llm-table variant="striped">
        <llm-thead>
          <llm-tr>
            <llm-th>Name</llm-th>
            <llm-th>Department</llm-th>
            <llm-th align="end">Salary</llm-th>
          </llm-tr>
        </llm-thead>
        <llm-tbody>
          <llm-tr><llm-td>Alice</llm-td><llm-td>Engineering</llm-td><llm-td align="end">€85,000</llm-td></llm-tr>
          <llm-tr><llm-td>Bob</llm-td><llm-td>Design</llm-td><llm-td align="end">€78,000</llm-td></llm-tr>
          <llm-tr><llm-td>Carol</llm-td><llm-td>Management</llm-td><llm-td align="end">€95,000</llm-td></llm-tr>
          <llm-tr><llm-td>David</llm-td><llm-td>Engineering</llm-td><llm-td align="end">€82,000</llm-td></llm-tr>
          <llm-tr><llm-td>Eva</llm-td><llm-td>Marketing</llm-td><llm-td align="end">€71,000</llm-td></llm-tr>
        </llm-tbody>
      </llm-table>
    `,
  }),
  parameters: { design: figmaNode('421-923') },
};

// ---------------------------------------------------------------------------
// Bordered
// ---------------------------------------------------------------------------
export const Bordered: Story = {
  render: () => ({
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <llm-table variant="bordered">
        <llm-thead>
          <llm-tr>
            <llm-th>Product</llm-th>
            <llm-th>Category</llm-th>
            <llm-th align="end">Price</llm-th>
            <llm-th align="center">In Stock</llm-th>
          </llm-tr>
        </llm-thead>
        <llm-tbody>
          <llm-tr>
            <llm-td>Widget A</llm-td><llm-td>Hardware</llm-td>
            <llm-td align="end">€12.99</llm-td><llm-td align="center">Yes</llm-td>
          </llm-tr>
          <llm-tr>
            <llm-td>Widget B</llm-td><llm-td>Software</llm-td>
            <llm-td align="end">€29.99</llm-td><llm-td align="center">Yes</llm-td>
          </llm-tr>
          <llm-tr>
            <llm-td>Widget C</llm-td><llm-td>Hardware</llm-td>
            <llm-td align="end">€5.49</llm-td><llm-td align="center">No</llm-td>
          </llm-tr>
        </llm-tbody>
      </llm-table>
    `,
  }),
  parameters: { design: figmaNode('421-962') },
};

// ---------------------------------------------------------------------------
// Sortable
// ---------------------------------------------------------------------------
export const Sortable: Story = {
  render: () => ({
    props: {
      nameSort: null as LlmSortDirection,
      roleSort: null as LlmSortDirection,
      setNameSort(dir: LlmSortDirection) { this['nameSort'] = dir; this['roleSort'] = null; },
      setRoleSort(dir: LlmSortDirection) { this['roleSort'] = dir; this['nameSort'] = null; },
    },
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <llm-table>
        <llm-thead>
          <llm-tr>
            <llm-th [sortable]="true" [sortDirection]="nameSort" (sort)="setNameSort($event)">Name</llm-th>
            <llm-th [sortable]="true" [sortDirection]="roleSort" (sort)="setRoleSort($event)">Role</llm-th>
            <llm-th>Email</llm-th>
          </llm-tr>
        </llm-thead>
        <llm-tbody>
          <llm-tr>
            <llm-td>Alice Müller</llm-td><llm-td>Engineer</llm-td><llm-td>alice@example.com</llm-td>
          </llm-tr>
          <llm-tr>
            <llm-td>Bob Schmidt</llm-td><llm-td>Designer</llm-td><llm-td>bob@example.com</llm-td>
          </llm-tr>
          <llm-tr>
            <llm-td>Carol Wagner</llm-td><llm-td>Manager</llm-td><llm-td>carol@example.com</llm-td>
          </llm-tr>
        </llm-tbody>
      </llm-table>
      <p style="margin-top:1rem;font-size:0.875rem;color:#64748b">
        Sort: name={{ nameSort ?? 'none' }}, role={{ roleSort ?? 'none' }}
      </p>
    `,
  }),
  parameters: { design: figmaNode('421-884') },
};

// ---------------------------------------------------------------------------
// Selectable
// ---------------------------------------------------------------------------
export const Selectable: Story = {
  render: () => {
    const rows = [
      { id: '1', name: 'Alice Müller', role: 'Engineer' },
      { id: '2', name: 'Bob Schmidt', role: 'Designer' },
      { id: '3', name: 'Carol Wagner', role: 'Manager' },
    ];
    const selection = new Set<string>();
    return {
      props: {
        rows,
        selection,
        allSelected() { return rows.every((r) => selection.has(r.id)); },
        isSelected(id: string) { return selection.has(id); },
        toggleAll(checked: boolean) {
          if (checked) { rows.forEach((r) => selection.add(r.id)); }
          else { selection.clear(); }
        },
        toggle(id: string, checked: boolean) {
          if (checked) { selection.add(id); } else { selection.delete(id); }
        },
      },
      moduleMetadata: { imports: [...TABLE_IMPORTS, LlmCheckbox] },
      template: `
        <llm-table>
          <llm-thead>
            <llm-tr>
              <llm-th>
                <llm-checkbox [checked]="allSelected()" (checkedChange)="toggleAll($event)" />
              </llm-th>
              <llm-th>Name</llm-th>
              <llm-th>Role</llm-th>
            </llm-tr>
          </llm-thead>
          <llm-tbody>
            @for (row of rows; track row.id) {
              <llm-tr [selectable]="true" [selected]="isSelected(row.id)" (selectedChange)="toggle(row.id, $event)">
                <llm-td>{{ row.name }}</llm-td>
                <llm-td>{{ row.role }}</llm-td>
              </llm-tr>
            }
          </llm-tbody>
        </llm-table>
      `,
    };
  },
  parameters: { design: figmaNode('421-884') },
};

// ---------------------------------------------------------------------------
// Sticky Header
// ---------------------------------------------------------------------------
export const StickyHeader: Story = {
  render: () => ({
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <div style="max-height: 220px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 0.5rem;">
        <llm-table [stickyHeader]="true">
          <llm-thead>
            <llm-tr>
              <llm-th>#</llm-th>
              <llm-th>Name</llm-th>
              <llm-th>Department</llm-th>
            </llm-tr>
          </llm-thead>
          <llm-tbody>
            @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
              <llm-tr>
                <llm-td>{{ i }}</llm-td>
                <llm-td>Person {{ i }}</llm-td>
                <llm-td>Dept {{ i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C' }}</llm-td>
              </llm-tr>
            }
          </llm-tbody>
        </llm-table>
      </div>
    `,
  }),
  parameters: { design: figmaNode('421-884') },
};

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
export const EmptyState: Story = {
  render: () => ({
    props: { isEmpty: true },
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <llm-table>
        <llm-thead>
          <llm-tr>
            <llm-th>Name</llm-th>
            <llm-th>Role</llm-th>
            <llm-th>Email</llm-th>
          </llm-tr>
        </llm-thead>
        <llm-tbody [empty]="isEmpty" [colSpan]="3">
          <div llmTableEmpty style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="18" stroke="#e5e7eb" stroke-width="2"/>
              <path d="M13 20h14M20 13v14" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>No team members found.</span>
          </div>
        </llm-tbody>
      </llm-table>
    `,
  }),
};

// ---------------------------------------------------------------------------
// Kitchen Sink — sort + select + sticky + badges + actions
// ---------------------------------------------------------------------------
export const KitchenSink: Story = {
  render: () => {
    const rows = [
      { id: '1', name: 'Alice Müller', role: 'Engineer', status: 'active' },
      { id: '2', name: 'Bob Schmidt', role: 'Designer', status: 'active' },
      { id: '3', name: 'Carol Wagner', role: 'Manager', status: 'inactive' },
      { id: '4', name: 'David Bauer', role: 'Engineer', status: 'active' },
    ];
    const selection = new Set<string>();
    return {
      props: {
        rows,
        selection,
        nameSort: null as LlmSortDirection,
        allSelected() { return rows.every((r) => selection.has(r.id)); },
        isSelected(id: string) { return selection.has(id); },
        toggleAll(checked: boolean) {
          if (checked) { rows.forEach((r) => selection.add(r.id)); }
          else { selection.clear(); }
        },
        toggle(id: string, checked: boolean) {
          if (checked) { selection.add(id); } else { selection.delete(id); }
        },
        setNameSort(dir: LlmSortDirection) { this['nameSort'] = dir; },
      },
      moduleMetadata: { imports: [...TABLE_IMPORTS, LlmBadge, LlmButton, LlmCheckbox] },
      template: `
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 0.75rem;">
          <llm-table variant="striped" [stickyHeader]="true">
            <llm-thead>
              <llm-tr>
                <llm-th>
                  <llm-checkbox [checked]="allSelected()" (checkedChange)="toggleAll($event)" />
                </llm-th>
                <llm-th [sortable]="true" [sortDirection]="nameSort" (sort)="setNameSort($event)">Name</llm-th>
                <llm-th>Role</llm-th>
                <llm-th align="center">Status</llm-th>
                <llm-th align="end">Actions</llm-th>
              </llm-tr>
            </llm-thead>
            <llm-tbody [empty]="rows.length === 0" [colSpan]="5">
              @for (row of rows; track row.id) {
                <llm-tr [selectable]="true" [selected]="isSelected(row.id)" (selectedChange)="toggle(row.id, $event)">
                  <llm-td>{{ row.name }}</llm-td>
                  <llm-td>{{ row.role }}</llm-td>
                  <llm-td align="center">
                    <llm-badge [variant]="row.status === 'active' ? 'success' : 'default'">
                      {{ row.status }}
                    </llm-badge>
                  </llm-td>
                  <llm-td align="end">
                    <llm-button size="sm" variant="secondary">Edit</llm-button>
                  </llm-td>
                </llm-tr>
              }
              <div llmTableEmpty>No results found.</div>
            </llm-tbody>
          </llm-table>
        </div>
      `,
    };
  },
  parameters: { design: figmaNode('421-1183') },
};

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------
export const Playground: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <llm-table [variant]="variant" [size]="size" [stickyHeader]="stickyHeader">
        <llm-thead>
          <llm-tr>
            <llm-th>Column A</llm-th>
            <llm-th>Column B</llm-th>
            <llm-th>Column C</llm-th>
          </llm-tr>
        </llm-thead>
        <llm-tbody>
          <llm-tr><llm-td>Cell A1</llm-td><llm-td>Cell B1</llm-td><llm-td>Cell C1</llm-td></llm-tr>
          <llm-tr><llm-td>Cell A2</llm-td><llm-td>Cell B2</llm-td><llm-td>Cell C2</llm-td></llm-tr>
          <llm-tr><llm-td>Cell A3</llm-td><llm-td>Cell B3</llm-td><llm-td>Cell C3</llm-td></llm-tr>
        </llm-tbody>
      </llm-table>
    `,
  }),
  parameters: { design: figmaNode('421-1183') },
};
