import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd, type AtlSortDirection } from './atl-table';
import { AtlBadge } from '../badge/atl-badge';
import { AtlButton } from '../button/atl-button';
import { AtlCheckbox } from '../checkbox/atl-checkbox';

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
  args: {
    variant: 'default',
    size: 'md',
    stickyHeader: false,
  },
  parameters: { design: figmaNode('421-1183'), docs: { description: { component: metadata.purpose } } },
};

export default meta;
type Story = StoryObj<typeof AtlTable>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------
export const Default: Story = {
  render: (args) => (
    <AtlTable {...args}>
      <AtlThead>
        <AtlTr>
          <AtlTh>Name</AtlTh>
          <AtlTh>Role</AtlTh>
          <AtlTh>Email</AtlTh>
        </AtlTr>
      </AtlThead>
      <AtlTbody>
        <AtlTr>
          <AtlTd>Alice Müller</AtlTd>
          <AtlTd>Engineer</AtlTd>
          <AtlTd>alice@example.com</AtlTd>
        </AtlTr>
        <AtlTr>
          <AtlTd>Bob Schmidt</AtlTd>
          <AtlTd>Designer</AtlTd>
          <AtlTd>bob@example.com</AtlTd>
        </AtlTr>
        <AtlTr>
          <AtlTd>Carol Wagner</AtlTd>
          <AtlTd>Manager</AtlTd>
          <AtlTd>carol@example.com</AtlTd>
        </AtlTr>
      </AtlTbody>
    </AtlTable>
  ),
  parameters: { design: figmaNode('421-884') },
};

// ---------------------------------------------------------------------------
// Striped
// ---------------------------------------------------------------------------
export const Striped: Story = {
  render: () => (
    <AtlTable variant="striped">
      <AtlThead>
        <AtlTr>
          <AtlTh>Name</AtlTh>
          <AtlTh>Department</AtlTh>
          <AtlTh align="end">Salary</AtlTh>
        </AtlTr>
      </AtlThead>
      <AtlTbody>
        <AtlTr><AtlTd>Alice</AtlTd><AtlTd>Engineering</AtlTd><AtlTd align="end">€85,000</AtlTd></AtlTr>
        <AtlTr><AtlTd>Bob</AtlTd><AtlTd>Design</AtlTd><AtlTd align="end">€78,000</AtlTd></AtlTr>
        <AtlTr><AtlTd>Carol</AtlTd><AtlTd>Management</AtlTd><AtlTd align="end">€95,000</AtlTd></AtlTr>
        <AtlTr><AtlTd>David</AtlTd><AtlTd>Engineering</AtlTd><AtlTd align="end">€82,000</AtlTd></AtlTr>
        <AtlTr><AtlTd>Eva</AtlTd><AtlTd>Marketing</AtlTd><AtlTd align="end">€71,000</AtlTd></AtlTr>
      </AtlTbody>
    </AtlTable>
  ),
  parameters: { design: figmaNode('421-923') },
};

// ---------------------------------------------------------------------------
// Bordered
// ---------------------------------------------------------------------------
export const Bordered: Story = {
  parameters: { design: figmaNode('421-962') },
  render: () => (
    <AtlTable variant="bordered">
      <AtlThead>
        <AtlTr>
          <AtlTh>Product</AtlTh>
          <AtlTh>Category</AtlTh>
          <AtlTh align="end">Price</AtlTh>
          <AtlTh align="center">In Stock</AtlTh>
        </AtlTr>
      </AtlThead>
      <AtlTbody>
        <AtlTr>
          <AtlTd>Widget A</AtlTd><AtlTd>Hardware</AtlTd>
          <AtlTd align="end">€12.99</AtlTd><AtlTd align="center">Yes</AtlTd>
        </AtlTr>
        <AtlTr>
          <AtlTd>Widget B</AtlTd><AtlTd>Software</AtlTd>
          <AtlTd align="end">€29.99</AtlTd><AtlTd align="center">Yes</AtlTd>
        </AtlTr>
        <AtlTr>
          <AtlTd>Widget C</AtlTd><AtlTd>Hardware</AtlTd>
          <AtlTd align="end">€5.49</AtlTd><AtlTd align="center">No</AtlTd>
        </AtlTr>
      </AtlTbody>
    </AtlTable>
  ),
};

// ---------------------------------------------------------------------------
// Sortable
// ---------------------------------------------------------------------------
function SortableStory() {
  const [nameSort, setNameSort] = useState<AtlSortDirection>(null);
  const [roleSort, setRoleSort] = useState<AtlSortDirection>(null);

  return (
    <>
      <AtlTable>
        <AtlThead>
          <AtlTr>
            <AtlTh sortable sortDirection={nameSort} onSort={(d) => { setNameSort(d); setRoleSort(null); }}>Name</AtlTh>
            <AtlTh sortable sortDirection={roleSort} onSort={(d) => { setRoleSort(d); setNameSort(null); }}>Role</AtlTh>
            <AtlTh>Email</AtlTh>
          </AtlTr>
        </AtlThead>
        <AtlTbody>
          <AtlTr><AtlTd>Alice Müller</AtlTd><AtlTd>Engineer</AtlTd><AtlTd>alice@example.com</AtlTd></AtlTr>
          <AtlTr><AtlTd>Bob Schmidt</AtlTd><AtlTd>Designer</AtlTd><AtlTd>bob@example.com</AtlTd></AtlTr>
          <AtlTr><AtlTd>Carol Wagner</AtlTd><AtlTd>Manager</AtlTd><AtlTd>carol@example.com</AtlTd></AtlTr>
        </AtlTbody>
      </AtlTable>
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
        Sort: name={nameSort ?? 'none'}, role={roleSort ?? 'none'}
      </p>
    </>
  );
}

export const Sortable: Story = {
  render: () => <SortableStory />,
  parameters: { design: figmaNode('421-884') },
};

// ---------------------------------------------------------------------------
// Selectable
// ---------------------------------------------------------------------------
const SELECTABLE_ROWS = [
  { id: '1', name: 'Alice Müller', role: 'Engineer' },
  { id: '2', name: 'Bob Schmidt', role: 'Designer' },
  { id: '3', name: 'Carol Wagner', role: 'Manager' },
];

function SelectableStory() {
  const [selection, setSelection] = useState<Set<string>>(new Set());

  const allSelected = SELECTABLE_ROWS.every((r) => selection.has(r.id));

  function toggleAll(checked: boolean) {
    setSelection(checked ? new Set(SELECTABLE_ROWS.map((r) => r.id)) : new Set());
  }

  function toggle(id: string, checked: boolean) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <AtlTable>
      <AtlThead>
        <AtlTr>
          <AtlTh>
            <AtlCheckbox checked={allSelected} onCheckedChange={toggleAll} />
          </AtlTh>
          <AtlTh>Name</AtlTh>
          <AtlTh>Role</AtlTh>
        </AtlTr>
      </AtlThead>
      <AtlTbody>
        {SELECTABLE_ROWS.map((row) => (
          <AtlTr
            key={row.id}
            selectable
            selected={selection.has(row.id)}
            onSelectedChange={(checked) => toggle(row.id, checked)}
          >
            <AtlTd>{row.name}</AtlTd>
            <AtlTd>{row.role}</AtlTd>
          </AtlTr>
        ))}
      </AtlTbody>
    </AtlTable>
  );
}

export const Selectable: Story = {
  render: () => <SelectableStory />,
  parameters: { design: figmaNode('421-884') },
};

// ---------------------------------------------------------------------------
// Sticky Header
// ---------------------------------------------------------------------------
export const StickyHeader: Story = {
  parameters: { design: figmaNode('421-884') },
  render: () => (
    <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
      <AtlTable stickyHeader>
        <AtlThead>
          <AtlTr>
            <AtlTh>#</AtlTh>
            <AtlTh>Name</AtlTh>
            <AtlTh>Department</AtlTh>
          </AtlTr>
        </AtlThead>
        <AtlTbody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <AtlTr key={i}>
              <AtlTd>{i}</AtlTd>
              <AtlTd>Person {i}</AtlTd>
              <AtlTd>Dept {i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'}</AtlTd>
            </AtlTr>
          ))}
        </AtlTbody>
      </AtlTable>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
export const EmptyState: Story = {
  render: () => (
    <AtlTable>
      <AtlThead>
        <AtlTr>
          <AtlTh>Name</AtlTh>
          <AtlTh>Role</AtlTh>
          <AtlTh>Email</AtlTh>
        </AtlTr>
      </AtlThead>
      <AtlTbody
        empty
        colSpan={3}
        emptyContent={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <circle cx="20" cy="20" r="18" stroke="#e5e7eb" strokeWidth="2" />
              <path d="M13 20h14M20 13v14" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>No team members found.</span>
          </div>
        }
      />
    </AtlTable>
  ),
};

// ---------------------------------------------------------------------------
// Kitchen Sink — sort + select + sticky + badges + actions
// ---------------------------------------------------------------------------
const KITCHEN_SINK_ROWS = [
  { id: '1', name: 'Alice Müller', role: 'Engineer', status: 'active' },
  { id: '2', name: 'Bob Schmidt', role: 'Designer', status: 'active' },
  { id: '3', name: 'Carol Wagner', role: 'Manager', status: 'inactive' },
  { id: '4', name: 'David Bauer', role: 'Engineer', status: 'active' },
];

function KitchenSinkStory() {
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [nameSort, setNameSort] = useState<AtlSortDirection>(null);

  const allSelected = KITCHEN_SINK_ROWS.every((r) => selection.has(r.id));

  function toggleAll(checked: boolean) {
    setSelection(checked ? new Set(KITCHEN_SINK_ROWS.map((r) => r.id)) : new Set());
  }

  function toggle(id: string, checked: boolean) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }}>
      <AtlTable variant="striped" stickyHeader>
        <AtlThead>
          <AtlTr>
            <AtlTh>
              <AtlCheckbox checked={allSelected} onCheckedChange={toggleAll} />
            </AtlTh>
            <AtlTh sortable sortDirection={nameSort} onSort={setNameSort}>Name</AtlTh>
            <AtlTh>Role</AtlTh>
            <AtlTh align="center">Status</AtlTh>
            <AtlTh align="end">Actions</AtlTh>
          </AtlTr>
        </AtlThead>
        <AtlTbody
          empty={KITCHEN_SINK_ROWS.length === 0}
          colSpan={5}
          emptyContent="No results found."
        >
          {KITCHEN_SINK_ROWS.map((row) => (
            <AtlTr
              key={row.id}
              selectable
              selected={selection.has(row.id)}
              onSelectedChange={(checked) => toggle(row.id, checked)}
            >
              <AtlTd>{row.name}</AtlTd>
              <AtlTd>{row.role}</AtlTd>
              <AtlTd align="center">
                <AtlBadge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</AtlBadge>
              </AtlTd>
              <AtlTd align="end">
                <AtlButton size="sm" variant="secondary">Edit</AtlButton>
              </AtlTd>
            </AtlTr>
          ))}
        </AtlTbody>
      </AtlTable>
    </div>
  );
}

export const KitchenSink: Story = {
  render: () => <KitchenSinkStory />,
  parameters: { design: figmaNode('421-1183') },
};

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------
export const Playground: Story = {
  parameters: { design: figmaNode('421-1183') },
  render: (args) => (
    <AtlTable {...args}>
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
  ),
};
