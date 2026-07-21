import type { Meta, StoryObj } from '@storybook/angular';
import { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd, type AtlSortDirection } from './atl-table';
import { AtlBadge } from '../badge/atl-badge';
import { AtlButton } from '../button/atl-button';
import { AtlCheckbox } from '../checkbox/atl-checkbox';

import { metadata } from '@atelier-ui/spec/metadata/table.metadata';
const TABLE_IMPORTS = [AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd];

const FIGMA_FILE = 'https://www.figma.com/design/QMnDD8uZQPldPrlCwZZ58T/Atelier-UI';

function figmaNode(nodeId: string): { type: 'figma'; url: string } {
  return { type: 'figma' as const, url: `${FIGMA_FILE}?node-id=${nodeId}` };
}

const meta: Meta<AtlTable> = {
  title: 'Components/Display/AtlTable',
  component: AtlTable,
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
  parameters: { design: figmaNode('421-1183'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<AtlTable>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------
export const Default: Story = {
  render: (args) => ({
    props: args,
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <atl-table [variant]="variant" [size]="size" [stickyHeader]="stickyHeader">
        <atl-thead>
          <atl-tr>
            <atl-th>Name</atl-th>
            <atl-th>Role</atl-th>
            <atl-th>Email</atl-th>
          </atl-tr>
        </atl-thead>
        <atl-tbody>
          <atl-tr>
            <atl-td>Alice Müller</atl-td>
            <atl-td>Engineer</atl-td>
            <atl-td>alice@example.com</atl-td>
          </atl-tr>
          <atl-tr>
            <atl-td>Bob Schmidt</atl-td>
            <atl-td>Designer</atl-td>
            <atl-td>bob@example.com</atl-td>
          </atl-tr>
          <atl-tr>
            <atl-td>Carol Wagner</atl-td>
            <atl-td>Manager</atl-td>
            <atl-td>carol@example.com</atl-td>
          </atl-tr>
        </atl-tbody>
      </atl-table>
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
      <atl-table variant="striped">
        <atl-thead>
          <atl-tr>
            <atl-th>Name</atl-th>
            <atl-th>Department</atl-th>
            <atl-th align="end">Salary</atl-th>
          </atl-tr>
        </atl-thead>
        <atl-tbody>
          <atl-tr><atl-td>Alice</atl-td><atl-td>Engineering</atl-td><atl-td align="end">€85,000</atl-td></atl-tr>
          <atl-tr><atl-td>Bob</atl-td><atl-td>Design</atl-td><atl-td align="end">€78,000</atl-td></atl-tr>
          <atl-tr><atl-td>Carol</atl-td><atl-td>Management</atl-td><atl-td align="end">€95,000</atl-td></atl-tr>
          <atl-tr><atl-td>David</atl-td><atl-td>Engineering</atl-td><atl-td align="end">€82,000</atl-td></atl-tr>
          <atl-tr><atl-td>Eva</atl-td><atl-td>Marketing</atl-td><atl-td align="end">€71,000</atl-td></atl-tr>
        </atl-tbody>
      </atl-table>
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
      <atl-table variant="bordered">
        <atl-thead>
          <atl-tr>
            <atl-th>Product</atl-th>
            <atl-th>Category</atl-th>
            <atl-th align="end">Price</atl-th>
            <atl-th align="center">In Stock</atl-th>
          </atl-tr>
        </atl-thead>
        <atl-tbody>
          <atl-tr>
            <atl-td>Widget A</atl-td><atl-td>Hardware</atl-td>
            <atl-td align="end">€12.99</atl-td><atl-td align="center">Yes</atl-td>
          </atl-tr>
          <atl-tr>
            <atl-td>Widget B</atl-td><atl-td>Software</atl-td>
            <atl-td align="end">€29.99</atl-td><atl-td align="center">Yes</atl-td>
          </atl-tr>
          <atl-tr>
            <atl-td>Widget C</atl-td><atl-td>Hardware</atl-td>
            <atl-td align="end">€5.49</atl-td><atl-td align="center">No</atl-td>
          </atl-tr>
        </atl-tbody>
      </atl-table>
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
      nameSort: null as AtlSortDirection,
      roleSort: null as AtlSortDirection,
      setNameSort(dir: AtlSortDirection) { this['nameSort'] = dir; this['roleSort'] = null; },
      setRoleSort(dir: AtlSortDirection) { this['roleSort'] = dir; this['nameSort'] = null; },
    },
    moduleMetadata: { imports: TABLE_IMPORTS },
    template: `
      <atl-table>
        <atl-thead>
          <atl-tr>
            <atl-th [sortable]="true" [sortDirection]="nameSort" (sort)="setNameSort($event)">Name</atl-th>
            <atl-th [sortable]="true" [sortDirection]="roleSort" (sort)="setRoleSort($event)">Role</atl-th>
            <atl-th>Email</atl-th>
          </atl-tr>
        </atl-thead>
        <atl-tbody>
          <atl-tr>
            <atl-td>Alice Müller</atl-td><atl-td>Engineer</atl-td><atl-td>alice@example.com</atl-td>
          </atl-tr>
          <atl-tr>
            <atl-td>Bob Schmidt</atl-td><atl-td>Designer</atl-td><atl-td>bob@example.com</atl-td>
          </atl-tr>
          <atl-tr>
            <atl-td>Carol Wagner</atl-td><atl-td>Manager</atl-td><atl-td>carol@example.com</atl-td>
          </atl-tr>
        </atl-tbody>
      </atl-table>
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
      moduleMetadata: { imports: [...TABLE_IMPORTS, AtlCheckbox] },
      template: `
        <atl-table>
          <atl-thead>
            <atl-tr>
              <atl-th>
                <atl-checkbox [checked]="allSelected()" (checkedChange)="toggleAll($event)" />
              </atl-th>
              <atl-th>Name</atl-th>
              <atl-th>Role</atl-th>
            </atl-tr>
          </atl-thead>
          <atl-tbody>
            @for (row of rows; track row.id) {
              <atl-tr [selectable]="true" [selected]="isSelected(row.id)" (selectedChange)="toggle(row.id, $event)">
                <atl-td>{{ row.name }}</atl-td>
                <atl-td>{{ row.role }}</atl-td>
              </atl-tr>
            }
          </atl-tbody>
        </atl-table>
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
        <atl-table [stickyHeader]="true">
          <atl-thead>
            <atl-tr>
              <atl-th>#</atl-th>
              <atl-th>Name</atl-th>
              <atl-th>Department</atl-th>
            </atl-tr>
          </atl-thead>
          <atl-tbody>
            @for (i of [1,2,3,4,5,6,7,8,9,10]; track i) {
              <atl-tr>
                <atl-td>{{ i }}</atl-td>
                <atl-td>Person {{ i }}</atl-td>
                <atl-td>Dept {{ i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C' }}</atl-td>
              </atl-tr>
            }
          </atl-tbody>
        </atl-table>
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
      <atl-table>
        <atl-thead>
          <atl-tr>
            <atl-th>Name</atl-th>
            <atl-th>Role</atl-th>
            <atl-th>Email</atl-th>
          </atl-tr>
        </atl-thead>
        <atl-tbody [empty]="isEmpty" [colSpan]="3">
          <div atlTableEmpty style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="18" stroke="#e5e7eb" stroke-width="2"/>
              <path d="M13 20h14M20 13v14" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>No team members found.</span>
          </div>
        </atl-tbody>
      </atl-table>
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
        nameSort: null as AtlSortDirection,
        allSelected() { return rows.every((r) => selection.has(r.id)); },
        isSelected(id: string) { return selection.has(id); },
        toggleAll(checked: boolean) {
          if (checked) { rows.forEach((r) => selection.add(r.id)); }
          else { selection.clear(); }
        },
        toggle(id: string, checked: boolean) {
          if (checked) { selection.add(id); } else { selection.delete(id); }
        },
        setNameSort(dir: AtlSortDirection) { this['nameSort'] = dir; },
      },
      moduleMetadata: { imports: [...TABLE_IMPORTS, AtlBadge, AtlButton, AtlCheckbox] },
      template: `
        <div style="max-height: 300px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 0.75rem;">
          <atl-table variant="striped" [stickyHeader]="true">
            <atl-thead>
              <atl-tr>
                <atl-th>
                  <atl-checkbox [checked]="allSelected()" (checkedChange)="toggleAll($event)" />
                </atl-th>
                <atl-th [sortable]="true" [sortDirection]="nameSort" (sort)="setNameSort($event)">Name</atl-th>
                <atl-th>Role</atl-th>
                <atl-th align="center">Status</atl-th>
                <atl-th align="end">Actions</atl-th>
              </atl-tr>
            </atl-thead>
            <atl-tbody [empty]="rows.length === 0" [colSpan]="5">
              @for (row of rows; track row.id) {
                <atl-tr [selectable]="true" [selected]="isSelected(row.id)" (selectedChange)="toggle(row.id, $event)">
                  <atl-td>{{ row.name }}</atl-td>
                  <atl-td>{{ row.role }}</atl-td>
                  <atl-td align="center">
                    <atl-badge [variant]="row.status === 'active' ? 'success' : 'default'">
                      {{ row.status }}
                    </atl-badge>
                  </atl-td>
                  <atl-td align="end">
                    <atl-button size="sm" variant="secondary">Edit</atl-button>
                  </atl-td>
                </atl-tr>
              }
              <div atlTableEmpty>No results found.</div>
            </atl-tbody>
          </atl-table>
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
      <atl-table [variant]="variant" [size]="size" [stickyHeader]="stickyHeader">
        <atl-thead>
          <atl-tr>
            <atl-th>Column A</atl-th>
            <atl-th>Column B</atl-th>
            <atl-th>Column C</atl-th>
          </atl-tr>
        </atl-thead>
        <atl-tbody>
          <atl-tr><atl-td>Cell A1</atl-td><atl-td>Cell B1</atl-td><atl-td>Cell C1</atl-td></atl-tr>
          <atl-tr><atl-td>Cell A2</atl-td><atl-td>Cell B2</atl-td><atl-td>Cell C2</atl-td></atl-tr>
          <atl-tr><atl-td>Cell A3</atl-td><atl-td>Cell B3</atl-td><atl-td>Cell C3</atl-td></atl-tr>
        </atl-tbody>
      </atl-table>
    `,
  }),
  parameters: { design: figmaNode('421-1183') },
};
