import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd } from './llm-table';

const IMPORTS = [LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd];

const BASIC_TABLE = `
  <llm-table>
    <llm-thead>
      <llm-tr>
        <llm-th>Name</llm-th>
        <llm-th>Status</llm-th>
      </llm-tr>
    </llm-thead>
    <llm-tbody>
      <llm-tr>
        <llm-td>Alice</llm-td>
        <llm-td>Active</llm-td>
      </llm-tr>
      <llm-tr>
        <llm-td>Bob</llm-td>
        <llm-td>Inactive</llm-td>
      </llm-tr>
    </llm-tbody>
  </llm-table>
`;

describe('LlmTable', () => {
  describe('rendering', () => {
    it('renders a table element', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders thead and tbody', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('renders cell content', async () => {
      await render(BASIC_TABLE, { imports: IMPORTS });
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('applies variant-default class by default', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('llm-table')).toHaveClass('variant-default');
    });

    it('applies size-md class by default', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('llm-table')).toHaveClass('size-md');
    });

    it('applies is-sticky-header class when stickyHeader=true', async () => {
      const { container } = await render(
        `<llm-table [stickyHeader]="true">
          <llm-thead><llm-tr><llm-th>Col</llm-th></llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('llm-table')).toHaveClass('is-sticky-header');
    });
  });

  describe('LlmTh — sorting', () => {
    it('renders a sort button when sortable=true', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-thead><llm-tr><llm-th [sortable]="true">Name</llm-th></llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('.llm-th-sort-btn')).toBeInTheDocument();
    });

    it('does not render a sort button when sortable=false', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-thead><llm-tr><llm-th>Name</llm-th></llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('.llm-th-sort-btn')).not.toBeInTheDocument();
    });

    it('sets aria-sort="none" when sortable and sortDirection=null', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-thead><llm-tr>
            <llm-th [sortable]="true" [sortDirection]="null">Name</llm-th>
          </llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'none');
    });

    it('sets aria-sort="ascending" when sortDirection="asc"', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-thead><llm-tr>
            <llm-th [sortable]="true" [sortDirection]="'asc'">Name</llm-th>
          </llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'ascending');
    });

    it('sets aria-sort="descending" when sortDirection="desc"', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-thead><llm-tr>
            <llm-th [sortable]="true" [sortDirection]="'desc'">Name</llm-th>
          </llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'descending');
    });

    it('has no aria-sort attribute on non-sortable headers', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-thead><llm-tr><llm-th>Name</llm-th></llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).not.toHaveAttribute('aria-sort');
    });

    it('emits "asc" on first click (cycling from null)', async () => {
      const user = userEvent.setup();
      const sortSpy = vi.fn();
      await render(
        `<llm-table>
          <llm-thead><llm-tr>
            <llm-th [sortable]="true" [sortDirection]="null" (sort)="onSort($event)">Name</llm-th>
          </llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS, componentProperties: { onSort: sortSpy } },
      );
      await user.click(screen.getByRole('button'));
      expect(sortSpy).toHaveBeenCalledWith('asc');
    });

    it('emits "desc" on second click (cycling from asc)', async () => {
      const user = userEvent.setup();
      const sortSpy = vi.fn();
      await render(
        `<llm-table>
          <llm-thead><llm-tr>
            <llm-th [sortable]="true" [sortDirection]="'asc'" (sort)="onSort($event)">Name</llm-th>
          </llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS, componentProperties: { onSort: sortSpy } },
      );
      await user.click(screen.getByRole('button'));
      expect(sortSpy).toHaveBeenCalledWith('desc');
    });

    it('emits null on third click (cycling from desc)', async () => {
      const user = userEvent.setup();
      const sortSpy = vi.fn();
      await render(
        `<llm-table>
          <llm-thead><llm-tr>
            <llm-th [sortable]="true" [sortDirection]="'desc'" (sort)="onSort($event)">Name</llm-th>
          </llm-tr></llm-thead>
          <llm-tbody></llm-tbody>
        </llm-table>`,
        { imports: IMPORTS, componentProperties: { onSort: sortSpy } },
      );
      await user.click(screen.getByRole('button'));
      expect(sortSpy).toHaveBeenCalledWith(null);
    });
  });

  describe('LlmTr — row selection', () => {
    it('does not render a checkbox when selectable=false', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-tbody>
            <llm-tr><llm-td>Row</llm-td></llm-tr>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    it('renders a checkbox when selectable=true', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-tbody>
            <llm-tr [selectable]="true"><llm-td>Row</llm-td></llm-tr>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });

    it('emits selectedChange=true when checkbox is checked', async () => {
      const user = userEvent.setup();
      const changeSpy = vi.fn();
      await render(
        `<llm-table>
          <llm-tbody>
            <llm-tr [selectable]="true" [selected]="false" (selectedChange)="onChange($event)">
              <llm-td>Row</llm-td>
            </llm-tr>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS, componentProperties: { onChange: changeSpy } },
      );
      await user.click(screen.getByRole('checkbox'));
      expect(changeSpy).toHaveBeenCalledWith(true);
    });

    it('sets aria-selected on the inner tr when selectable=true', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-tbody>
            <llm-tr [selectable]="true" [selected]="true"><llm-td>Row</llm-td></llm-tr>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('tr')).toHaveAttribute('aria-selected', 'true');
    });

    it('does not set aria-selected when selectable=false', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-tbody>
            <llm-tr><llm-td>Row</llm-td></llm-tr>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('tr')).not.toHaveAttribute('aria-selected');
    });

    it('applies is-selected class to inner tr when selected=true', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-tbody>
            <llm-tr [selectable]="true" [selected]="true"><llm-td>Row</llm-td></llm-tr>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('tr')).toHaveClass('is-selected');
    });
  });

  describe('LlmTbody — empty state', () => {
    it('shows row content when empty=false', async () => {
      await render(
        `<llm-table>
          <llm-tbody [empty]="false">
            <llm-tr><llm-td>Alice</llm-td></llm-tr>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('hides rows and shows empty state when empty=true', async () => {
      await render(
        `<llm-table>
          <llm-tbody [empty]="true" [colSpan]="2">
            <llm-tr><llm-td>Alice</llm-td></llm-tr>
            <div llmTableEmpty>No results found.</div>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });

    it('applies the colSpan value to the empty-state td', async () => {
      const { container } = await render(
        `<llm-table>
          <llm-tbody [empty]="true" [colSpan]="3">
            <div llmTableEmpty>Empty</div>
          </llm-tbody>
        </llm-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('.llm-tbody-empty-cell')).toHaveAttribute('colspan', '3');
    });
  });
});
