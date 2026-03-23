import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd, type LlmSortDirection } from './llm-table';
import { LlmBadge } from '../badge/llm-badge';
import { LlmButton } from '../button/llm-button';
import { LlmCheckbox } from '../checkbox/llm-checkbox';

const meta: Meta<typeof LlmTable> = {
  title: 'Components/LlmTable',
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
};

export default meta;
type Story = StoryObj<typeof LlmTable>;

// ---------------------------------------------------------------------------
// Default
// ---------------------------------------------------------------------------
export const Default: Story = {
  render: (args) => (
    <LlmTable {...args}>
      <LlmThead>
        <LlmTr>
          <LlmTh>Name</LlmTh>
          <LlmTh>Role</LlmTh>
          <LlmTh>Email</LlmTh>
        </LlmTr>
      </LlmThead>
      <LlmTbody>
        <LlmTr>
          <LlmTd>Alice Müller</LlmTd>
          <LlmTd>Engineer</LlmTd>
          <LlmTd>alice@example.com</LlmTd>
        </LlmTr>
        <LlmTr>
          <LlmTd>Bob Schmidt</LlmTd>
          <LlmTd>Designer</LlmTd>
          <LlmTd>bob@example.com</LlmTd>
        </LlmTr>
        <LlmTr>
          <LlmTd>Carol Wagner</LlmTd>
          <LlmTd>Manager</LlmTd>
          <LlmTd>carol@example.com</LlmTd>
        </LlmTr>
      </LlmTbody>
    </LlmTable>
  ),
};

// ---------------------------------------------------------------------------
// Striped
// ---------------------------------------------------------------------------
export const Striped: Story = {
  render: () => (
    <LlmTable variant="striped">
      <LlmThead>
        <LlmTr>
          <LlmTh>Name</LlmTh>
          <LlmTh>Department</LlmTh>
          <LlmTh align="end">Salary</LlmTh>
        </LlmTr>
      </LlmThead>
      <LlmTbody>
        <LlmTr><LlmTd>Alice</LlmTd><LlmTd>Engineering</LlmTd><LlmTd align="end">€85,000</LlmTd></LlmTr>
        <LlmTr><LlmTd>Bob</LlmTd><LlmTd>Design</LlmTd><LlmTd align="end">€78,000</LlmTd></LlmTr>
        <LlmTr><LlmTd>Carol</LlmTd><LlmTd>Management</LlmTd><LlmTd align="end">€95,000</LlmTd></LlmTr>
        <LlmTr><LlmTd>David</LlmTd><LlmTd>Engineering</LlmTd><LlmTd align="end">€82,000</LlmTd></LlmTr>
        <LlmTr><LlmTd>Eva</LlmTd><LlmTd>Marketing</LlmTd><LlmTd align="end">€71,000</LlmTd></LlmTr>
      </LlmTbody>
    </LlmTable>
  ),
};

// ---------------------------------------------------------------------------
// Bordered
// ---------------------------------------------------------------------------
export const Bordered: Story = {
  render: () => (
    <LlmTable variant="bordered">
      <LlmThead>
        <LlmTr>
          <LlmTh>Product</LlmTh>
          <LlmTh>Category</LlmTh>
          <LlmTh align="end">Price</LlmTh>
          <LlmTh align="center">In Stock</LlmTh>
        </LlmTr>
      </LlmThead>
      <LlmTbody>
        <LlmTr>
          <LlmTd>Widget A</LlmTd><LlmTd>Hardware</LlmTd>
          <LlmTd align="end">€12.99</LlmTd><LlmTd align="center">Yes</LlmTd>
        </LlmTr>
        <LlmTr>
          <LlmTd>Widget B</LlmTd><LlmTd>Software</LlmTd>
          <LlmTd align="end">€29.99</LlmTd><LlmTd align="center">Yes</LlmTd>
        </LlmTr>
        <LlmTr>
          <LlmTd>Widget C</LlmTd><LlmTd>Hardware</LlmTd>
          <LlmTd align="end">€5.49</LlmTd><LlmTd align="center">No</LlmTd>
        </LlmTr>
      </LlmTbody>
    </LlmTable>
  ),
};

// ---------------------------------------------------------------------------
// Sortable
// ---------------------------------------------------------------------------
export const Sortable: Story = {
  render: () => {
    const [nameSort, setNameSort] = useState<LlmSortDirection>(null);
    const [roleSort, setRoleSort] = useState<LlmSortDirection>(null);

    return (
      <>
        <LlmTable>
          <LlmThead>
            <LlmTr>
              <LlmTh sortable sortDirection={nameSort} onSort={(d) => { setNameSort(d); setRoleSort(null); }}>Name</LlmTh>
              <LlmTh sortable sortDirection={roleSort} onSort={(d) => { setRoleSort(d); setNameSort(null); }}>Role</LlmTh>
              <LlmTh>Email</LlmTh>
            </LlmTr>
          </LlmThead>
          <LlmTbody>
            <LlmTr><LlmTd>Alice Müller</LlmTd><LlmTd>Engineer</LlmTd><LlmTd>alice@example.com</LlmTd></LlmTr>
            <LlmTr><LlmTd>Bob Schmidt</LlmTd><LlmTd>Designer</LlmTd><LlmTd>bob@example.com</LlmTd></LlmTr>
            <LlmTr><LlmTd>Carol Wagner</LlmTd><LlmTd>Manager</LlmTd><LlmTd>carol@example.com</LlmTd></LlmTr>
          </LlmTbody>
        </LlmTable>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#64748b' }}>
          Sort: name={nameSort ?? 'none'}, role={roleSort ?? 'none'}
        </p>
      </>
    );
  },
};

// ---------------------------------------------------------------------------
// Selectable
// ---------------------------------------------------------------------------
const SELECTABLE_ROWS = [
  { id: '1', name: 'Alice Müller', role: 'Engineer' },
  { id: '2', name: 'Bob Schmidt', role: 'Designer' },
  { id: '3', name: 'Carol Wagner', role: 'Manager' },
];

export const Selectable: Story = {
  render: () => {
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
      <LlmTable>
        <LlmThead>
          <LlmTr>
            <LlmTh>
              <LlmCheckbox checked={allSelected} onCheckedChange={toggleAll} />
            </LlmTh>
            <LlmTh>Name</LlmTh>
            <LlmTh>Role</LlmTh>
          </LlmTr>
        </LlmThead>
        <LlmTbody>
          {SELECTABLE_ROWS.map((row) => (
            <LlmTr
              key={row.id}
              selectable
              selected={selection.has(row.id)}
              onSelectedChange={(checked) => toggle(row.id, checked)}
            >
              <LlmTd>{row.name}</LlmTd>
              <LlmTd>{row.role}</LlmTd>
            </LlmTr>
          ))}
        </LlmTbody>
      </LlmTable>
    );
  },
};

// ---------------------------------------------------------------------------
// Sticky Header
// ---------------------------------------------------------------------------
export const StickyHeader: Story = {
  render: () => (
    <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
      <LlmTable stickyHeader>
        <LlmThead>
          <LlmTr>
            <LlmTh>#</LlmTh>
            <LlmTh>Name</LlmTh>
            <LlmTh>Department</LlmTh>
          </LlmTr>
        </LlmThead>
        <LlmTbody>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <LlmTr key={i}>
              <LlmTd>{i}</LlmTd>
              <LlmTd>Person {i}</LlmTd>
              <LlmTd>Dept {i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'}</LlmTd>
            </LlmTr>
          ))}
        </LlmTbody>
      </LlmTable>
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Empty State
// ---------------------------------------------------------------------------
export const EmptyState: Story = {
  render: () => (
    <LlmTable>
      <LlmThead>
        <LlmTr>
          <LlmTh>Name</LlmTh>
          <LlmTh>Role</LlmTh>
          <LlmTh>Email</LlmTh>
        </LlmTr>
      </LlmThead>
      <LlmTbody
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
    </LlmTable>
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

export const KitchenSink: Story = {
  render: () => {
    const [selection, setSelection] = useState<Set<string>>(new Set());
    const [nameSort, setNameSort] = useState<LlmSortDirection>(null);

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
        <LlmTable variant="striped" stickyHeader>
          <LlmThead>
            <LlmTr>
              <LlmTh>
                <LlmCheckbox checked={allSelected} onCheckedChange={toggleAll} />
              </LlmTh>
              <LlmTh sortable sortDirection={nameSort} onSort={setNameSort}>Name</LlmTh>
              <LlmTh>Role</LlmTh>
              <LlmTh align="center">Status</LlmTh>
              <LlmTh align="end">Actions</LlmTh>
            </LlmTr>
          </LlmThead>
          <LlmTbody
            empty={KITCHEN_SINK_ROWS.length === 0}
            colSpan={5}
            emptyContent="No results found."
          >
            {KITCHEN_SINK_ROWS.map((row) => (
              <LlmTr
                key={row.id}
                selectable
                selected={selection.has(row.id)}
                onSelectedChange={(checked) => toggle(row.id, checked)}
              >
                <LlmTd>{row.name}</LlmTd>
                <LlmTd>{row.role}</LlmTd>
                <LlmTd align="center">
                  <LlmBadge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</LlmBadge>
                </LlmTd>
                <LlmTd align="end">
                  <LlmButton size="sm" variant="secondary">Edit</LlmButton>
                </LlmTd>
              </LlmTr>
            ))}
          </LlmTbody>
        </LlmTable>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Playground
// ---------------------------------------------------------------------------
export const Playground: Story = {
  render: (args) => (
    <LlmTable {...args}>
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
  ),
};
