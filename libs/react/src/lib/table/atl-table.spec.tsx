import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtlTable, AtlThead, AtlTbody, AtlTr, AtlTh, AtlTd } from './atl-table';
import { covers } from '../../testing/behavior';

function BasicTable() {
  return (
    <AtlTable>
      <AtlThead>
        <AtlTr>
          <AtlTh>Name</AtlTh>
          <AtlTh>Status</AtlTh>
        </AtlTr>
      </AtlThead>
      <AtlTbody>
        <AtlTr>
          <AtlTd>Alice</AtlTd>
          <AtlTd>Active</AtlTd>
        </AtlTr>
        <AtlTr>
          <AtlTd>Bob</AtlTd>
          <AtlTd>Inactive</AtlTd>
        </AtlTr>
      </AtlTbody>
    </AtlTable>
  );
}

describe('AtlTable', () => {
  describe('rendering', () => {
    covers('table', 'renders-table')('renders a table element', () => {
      const { container } = render(<BasicTable />);
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    covers('table', 'thead-tbody')('renders thead and tbody', () => {
      const { container } = render(<BasicTable />);
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('renders cell content', () => {
      render(<BasicTable />);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    covers('table', 'variant-default')('applies variant-default class by default', () => {
      const { container } = render(<BasicTable />);
      expect(container.querySelector('.atl-table')).toHaveClass('variant-default');
    });

    it('applies size-md class by default', () => {
      const { container } = render(<BasicTable />);
      expect(container.querySelector('.atl-table')).toHaveClass('size-md');
    });

    covers('table', 'sticky-header')('applies is-sticky-header class when stickyHeader=true', () => {
      const { container } = render(
        <AtlTable stickyHeader>
          <AtlThead><AtlTr><AtlTh>Col</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      expect(container.querySelector('.atl-table')).toHaveClass('is-sticky-header');
    });
  });

  describe('AtlTh — sorting', () => {
    covers('table', 'sort-button')('renders a sort button when sortable=true', () => {
      const { container } = render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh sortable>Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      expect(container.querySelector('.atl-th-sort-btn')).toBeInTheDocument();
    });

    covers('table', 'no-sort-button')('does not render a sort button when sortable=false', () => {
      const { container } = render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh>Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      expect(container.querySelector('.atl-th-sort-btn')).not.toBeInTheDocument();
    });

    it('sets aria-sort="none" when sortable and sortDirection=null', () => {
      const { container } = render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh sortable sortDirection={null}>Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'none');
    });

    it('sets aria-sort="ascending" when sortDirection="asc"', () => {
      const { container } = render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh sortable sortDirection="asc">Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'ascending');
    });

    it('sets aria-sort="descending" when sortDirection="desc"', () => {
      const { container } = render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh sortable sortDirection="desc">Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'descending');
    });

    it('has no aria-sort attribute on non-sortable headers', () => {
      const { container } = render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh>Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      expect(container.querySelector('th')).not.toHaveAttribute('aria-sort');
    });

    it('emits "asc" on first click (cycling from null)', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh sortable sortDirection={null} onSort={onSort}>Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      await user.click(screen.getByRole('button'));
      expect(onSort).toHaveBeenCalledWith('asc');
    });

    it('emits "desc" on second click (cycling from asc)', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh sortable sortDirection="asc" onSort={onSort}>Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      await user.click(screen.getByRole('button'));
      expect(onSort).toHaveBeenCalledWith('desc');
    });

    it('emits null on third click (cycling from desc)', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render(
        <AtlTable>
          <AtlThead><AtlTr><AtlTh sortable sortDirection="desc" onSort={onSort}>Name</AtlTh></AtlTr></AtlThead>
          <AtlTbody />
        </AtlTable>
      );
      await user.click(screen.getByRole('button'));
      expect(onSort).toHaveBeenCalledWith(null);
    });
  });

  describe('AtlTr — row selection', () => {
    it('does not render a checkbox when selectable=false', () => {
      const { container } = render(
        <AtlTable>
          <AtlTbody><AtlTr><AtlTd>Row</AtlTd></AtlTr></AtlTbody>
        </AtlTable>
      );
      expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    covers('table', 'checkbox-selectable')('renders a checkbox when selectable=true', () => {
      const { container } = render(
        <AtlTable>
          <AtlTbody><AtlTr selectable><AtlTd>Row</AtlTd></AtlTr></AtlTbody>
        </AtlTable>
      );
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });

    it('emits onSelectedChange=true when checkbox is checked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <AtlTable>
          <AtlTbody>
            <AtlTr selectable selected={false} onSelectedChange={onChange}>
              <AtlTd>Row</AtlTd>
            </AtlTr>
          </AtlTbody>
        </AtlTable>
      );
      await user.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('sets aria-selected on the tr when selectable=true', () => {
      const { container } = render(
        <AtlTable>
          <AtlTbody>
            <AtlTr selectable selected={true}><AtlTd>Row</AtlTd></AtlTr>
          </AtlTbody>
        </AtlTable>
      );
      expect(container.querySelector('tr')).toHaveAttribute('aria-selected', 'true');
    });

    it('does not set aria-selected when selectable=false', () => {
      const { container } = render(
        <AtlTable>
          <AtlTbody><AtlTr><AtlTd>Row</AtlTd></AtlTr></AtlTbody>
        </AtlTable>
      );
      expect(container.querySelector('tr')).not.toHaveAttribute('aria-selected');
    });

    it('applies is-selected class to tr when selected=true', () => {
      const { container } = render(
        <AtlTable>
          <AtlTbody>
            <AtlTr selectable selected={true}><AtlTd>Row</AtlTd></AtlTr>
          </AtlTbody>
        </AtlTable>
      );
      expect(container.querySelector('tr')).toHaveClass('is-selected');
    });
  });

  describe('AtlTbody — empty state', () => {
    it('shows row content when empty=false', () => {
      render(
        <AtlTable>
          <AtlTbody empty={false}>
            <AtlTr><AtlTd>Alice</AtlTd></AtlTr>
          </AtlTbody>
        </AtlTable>
      );
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    covers('table', 'empty-state')('hides rows and shows empty state when empty=true', () => {
      render(
        <AtlTable>
          <AtlTbody empty colSpan={2} emptyContent="No results found.">
            <AtlTr><AtlTd>Alice</AtlTd></AtlTr>
          </AtlTbody>
        </AtlTable>
      );
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });

    it('applies the colSpan value to the empty-state td', () => {
      const { container } = render(
        <AtlTable>
          <AtlTbody empty colSpan={3} emptyContent="Empty" />
        </AtlTable>
      );
      expect(container.querySelector('.atl-tbody-empty-cell')).toHaveAttribute('colspan', '3');
    });
  });
});
