import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd } from './atl-table';
import { covers } from '../../testing/behavior';

const IMPORTS = [AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd];

const BASIC_TABLE = `
  <atl-table>
    <atl-thead>
      <atl-tr>
        <atl-th>Name</atl-th>
        <atl-th>Status</atl-th>
      </atl-tr>
    </atl-thead>
    <atl-tbody>
      <atl-tr>
        <atl-td>Alice</atl-td>
        <atl-td>Active</atl-td>
      </atl-tr>
      <atl-tr>
        <atl-td>Bob</atl-td>
        <atl-td>Inactive</atl-td>
      </atl-tr>
    </atl-tbody>
  </atl-table>
`;

describe('AtlTable', () => {
  describe('rendering', () => {
    covers('table', 'renders-table')('renders a table element', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    covers('table', 'thead-tbody')('renders thead and tbody', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('renders cell content', async () => {
      await render(BASIC_TABLE, { imports: IMPORTS });
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    covers('table', 'variant-default')('applies variant-default class by default', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('atl-table')).toHaveClass('variant-default');
    });

    it('applies size-md class by default', async () => {
      const { container } = await render(BASIC_TABLE, { imports: IMPORTS });
      expect(container.querySelector('atl-table')).toHaveClass('size-md');
    });

    covers('table', 'sticky-header')('applies is-sticky-header class when stickyHeader=true', async () => {
      const { container } = await render(
        `<atl-table [stickyHeader]="true">
          <atl-thead><atl-tr><atl-th>Col</atl-th></atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('atl-table')).toHaveClass('is-sticky-header');
    });
  });

  describe('AtlTh — sorting', () => {
    covers('table', 'sort-button')('renders a sort button when sortable=true', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-thead><atl-tr><atl-th [sortable]="true">Name</atl-th></atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('.atl-th-sort-btn')).toBeInTheDocument();
    });

    covers('table', 'no-sort-button')('does not render a sort button when sortable=false', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-thead><atl-tr><atl-th>Name</atl-th></atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('.atl-th-sort-btn')).not.toBeInTheDocument();
    });

    it('sets aria-sort="none" when sortable and sortDirection=null', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-thead><atl-tr>
            <atl-th [sortable]="true" [sortDirection]="null">Name</atl-th>
          </atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'none');
    });

    it('sets aria-sort="ascending" when sortDirection="asc"', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-thead><atl-tr>
            <atl-th [sortable]="true" [sortDirection]="'asc'">Name</atl-th>
          </atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'ascending');
    });

    it('sets aria-sort="descending" when sortDirection="desc"', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-thead><atl-tr>
            <atl-th [sortable]="true" [sortDirection]="'desc'">Name</atl-th>
          </atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'descending');
    });

    it('has no aria-sort attribute on non-sortable headers', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-thead><atl-tr><atl-th>Name</atl-th></atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('th')).not.toHaveAttribute('aria-sort');
    });

    it('emits "asc" on first click (cycling from null)', async () => {
      const user = userEvent.setup();
      const sortSpy = vi.fn();
      await render(
        `<atl-table>
          <atl-thead><atl-tr>
            <atl-th [sortable]="true" [sortDirection]="null" (sort)="onSort($event)">Name</atl-th>
          </atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS, componentProperties: { onSort: sortSpy } },
      );
      await user.click(screen.getByRole('button'));
      expect(sortSpy).toHaveBeenCalledWith('asc');
    });

    it('emits "desc" on second click (cycling from asc)', async () => {
      const user = userEvent.setup();
      const sortSpy = vi.fn();
      await render(
        `<atl-table>
          <atl-thead><atl-tr>
            <atl-th [sortable]="true" [sortDirection]="'asc'" (sort)="onSort($event)">Name</atl-th>
          </atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS, componentProperties: { onSort: sortSpy } },
      );
      await user.click(screen.getByRole('button'));
      expect(sortSpy).toHaveBeenCalledWith('desc');
    });

    it('emits null on third click (cycling from desc)', async () => {
      const user = userEvent.setup();
      const sortSpy = vi.fn();
      await render(
        `<atl-table>
          <atl-thead><atl-tr>
            <atl-th [sortable]="true" [sortDirection]="'desc'" (sort)="onSort($event)">Name</atl-th>
          </atl-tr></atl-thead>
          <atl-tbody></atl-tbody>
        </atl-table>`,
        { imports: IMPORTS, componentProperties: { onSort: sortSpy } },
      );
      await user.click(screen.getByRole('button'));
      expect(sortSpy).toHaveBeenCalledWith(null);
    });
  });

  describe('AtlTr — row selection', () => {
    it('does not render a checkbox when selectable=false', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-tbody>
            <atl-tr><atl-td>Row</atl-td></atl-tr>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    covers('table', 'checkbox-selectable')('renders a checkbox when selectable=true', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-tbody>
            <atl-tr [selectable]="true"><atl-td>Row</atl-td></atl-tr>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });

    it('emits selectedChange=true when checkbox is checked', async () => {
      const user = userEvent.setup();
      const changeSpy = vi.fn();
      await render(
        `<atl-table>
          <atl-tbody>
            <atl-tr [selectable]="true" [selected]="false" (selectedChange)="onChange($event)">
              <atl-td>Row</atl-td>
            </atl-tr>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS, componentProperties: { onChange: changeSpy } },
      );
      await user.click(screen.getByRole('checkbox'));
      expect(changeSpy).toHaveBeenCalledWith(true);
    });

    it('sets aria-selected on the inner tr when selectable=true', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-tbody>
            <atl-tr [selectable]="true" [selected]="true"><atl-td>Row</atl-td></atl-tr>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('tr')).toHaveAttribute('aria-selected', 'true');
    });

    it('does not set aria-selected when selectable=false', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-tbody>
            <atl-tr><atl-td>Row</atl-td></atl-tr>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('tr')).not.toHaveAttribute('aria-selected');
    });

    it('applies is-selected class to inner tr when selected=true', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-tbody>
            <atl-tr [selectable]="true" [selected]="true"><atl-td>Row</atl-td></atl-tr>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('tr')).toHaveClass('is-selected');
    });
  });

  describe('AtlTbody — empty state', () => {
    it('shows row content when empty=false', async () => {
      await render(
        `<atl-table>
          <atl-tbody [empty]="false">
            <atl-tr><atl-td>Alice</atl-td></atl-tr>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    covers('table', 'empty-state')('hides rows and shows empty state when empty=true', async () => {
      await render(
        `<atl-table>
          <atl-tbody [empty]="true" [colSpan]="2">
            <atl-tr><atl-td>Alice</atl-td></atl-tr>
            <div atlTableEmpty>No results found.</div>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });

    it('applies the colSpan value to the empty-state td', async () => {
      const { container } = await render(
        `<atl-table>
          <atl-tbody [empty]="true" [colSpan]="3">
            <div atlTableEmpty>Empty</div>
          </atl-tbody>
        </atl-table>`,
        { imports: IMPORTS },
      );
      expect(container.querySelector('.atl-tbody-empty-cell')).toHaveAttribute('colspan', '3');
    });
  });
});
