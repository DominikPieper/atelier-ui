import { render, screen } from '@testing-library/vue';
import userEvent from '@testing-library/user-event';
import LlmTable from './llm-table.vue';
import LlmThead from './llm-thead.vue';
import LlmTbody from './llm-tbody.vue';
import LlmTr from './llm-tr.vue';
import LlmTh from './llm-th.vue';
import LlmTd from './llm-td.vue';

const components = { LlmTable, LlmThead, LlmTbody, LlmTr, LlmTh, LlmTd };

const BasicTable = {
  components,
  template: `
    <LlmTable>
      <LlmThead>
        <LlmTr>
          <LlmTh>Name</LlmTh>
          <LlmTh>Status</LlmTh>
        </LlmTr>
      </LlmThead>
      <LlmTbody>
        <LlmTr><LlmTd>Alice</LlmTd><LlmTd>Active</LlmTd></LlmTr>
        <LlmTr><LlmTd>Bob</LlmTd><LlmTd>Inactive</LlmTd></LlmTr>
      </LlmTbody>
    </LlmTable>
  `,
};

describe('LlmTable', () => {
  describe('rendering', () => {
    it('renders a table element', () => {
      const { container } = render(BasicTable);
      expect(container.querySelector('table')).toBeInTheDocument();
    });

    it('renders thead and tbody', () => {
      const { container } = render(BasicTable);
      expect(container.querySelector('thead')).toBeInTheDocument();
      expect(container.querySelector('tbody')).toBeInTheDocument();
    });

    it('renders cell content', () => {
      render(BasicTable);
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('applies variant-default class by default', () => {
      const { container } = render(BasicTable);
      expect(container.querySelector('.llm-table')).toHaveClass('variant-default');
    });

    it('applies size-md class by default', () => {
      const { container } = render(BasicTable);
      expect(container.querySelector('.llm-table')).toHaveClass('size-md');
    });

    it('applies is-sticky-header class when stickyHeader=true', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable :stickyHeader="true">
            <LlmThead><LlmTr><LlmTh>Col</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      expect(container.querySelector('.llm-table')).toHaveClass('is-sticky-header');
    });
  });

  describe('LlmTh — sorting', () => {
    it('renders a sort button when sortable=true', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh :sortable="true">Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      expect(container.querySelector('.llm-th-sort-btn')).toBeInTheDocument();
    });

    it('does not render a sort button when sortable=false', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh>Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      expect(container.querySelector('.llm-th-sort-btn')).not.toBeInTheDocument();
    });

    it('sets aria-sort="none" when sortable and sortDirection=null', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh :sortable="true" :sortDirection="null">Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'none');
    });

    it('sets aria-sort="ascending" when sortDirection="asc"', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh :sortable="true" sortDirection="asc">Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'ascending');
    });

    it('sets aria-sort="descending" when sortDirection="desc"', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh :sortable="true" sortDirection="desc">Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      expect(container.querySelector('th')).toHaveAttribute('aria-sort', 'descending');
    });

    it('has no aria-sort attribute on non-sortable headers', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh>Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      expect(container.querySelector('th')).not.toHaveAttribute('aria-sort');
    });

    it('emits "asc" on first click (cycling from null)', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render({
        components,
        setup() { return { onSort }; },
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh :sortable="true" :sortDirection="null" @sort="onSort">Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      await user.click(screen.getByRole('button'));
      expect(onSort).toHaveBeenCalledWith('asc');
    });

    it('emits "desc" on second click (cycling from asc)', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render({
        components,
        setup() { return { onSort }; },
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh :sortable="true" sortDirection="asc" @sort="onSort">Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      await user.click(screen.getByRole('button'));
      expect(onSort).toHaveBeenCalledWith('desc');
    });

    it('emits null on third click (cycling from desc)', async () => {
      const user = userEvent.setup();
      const onSort = vi.fn();
      render({
        components,
        setup() { return { onSort }; },
        template: `
          <LlmTable>
            <LlmThead><LlmTr><LlmTh :sortable="true" sortDirection="desc" @sort="onSort">Name</LlmTh></LlmTr></LlmThead>
            <LlmTbody />
          </LlmTable>
        `,
      });
      await user.click(screen.getByRole('button'));
      expect(onSort).toHaveBeenCalledWith(null);
    });
  });

  describe('LlmTr — row selection', () => {
    it('does not render a checkbox when selectable=false', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmTbody><LlmTr><LlmTd>Row</LlmTd></LlmTr></LlmTbody>
          </LlmTable>
        `,
      });
      expect(container.querySelector('input[type="checkbox"]')).not.toBeInTheDocument();
    });

    it('renders a checkbox when selectable=true', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmTbody><LlmTr :selectable="true"><LlmTd>Row</LlmTd></LlmTr></LlmTbody>
          </LlmTable>
        `,
      });
      expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument();
    });

    it('emits update:selected=true when checkbox is checked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render({
        components,
        setup() { return { onChange }; },
        template: `
          <LlmTable>
            <LlmTbody>
              <LlmTr :selectable="true" :selected="false" @update:selected="onChange">
                <LlmTd>Row</LlmTd>
              </LlmTr>
            </LlmTbody>
          </LlmTable>
        `,
      });
      await user.click(screen.getByRole('checkbox'));
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('sets aria-selected on the tr when selectable=true', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmTbody>
              <LlmTr :selectable="true" :selected="true"><LlmTd>Row</LlmTd></LlmTr>
            </LlmTbody>
          </LlmTable>
        `,
      });
      expect(container.querySelector('tr')).toHaveAttribute('aria-selected', 'true');
    });

    it('does not set aria-selected when selectable=false', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmTbody><LlmTr><LlmTd>Row</LlmTd></LlmTr></LlmTbody>
          </LlmTable>
        `,
      });
      expect(container.querySelector('tr')).not.toHaveAttribute('aria-selected');
    });

    it('applies is-selected class to tr when selected=true', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmTbody>
              <LlmTr :selectable="true" :selected="true"><LlmTd>Row</LlmTd></LlmTr>
            </LlmTbody>
          </LlmTable>
        `,
      });
      expect(container.querySelector('tr')).toHaveClass('is-selected');
    });
  });

  describe('LlmTbody — empty state', () => {
    it('shows row content when empty=false', () => {
      render({
        components,
        template: `
          <LlmTable>
            <LlmTbody :empty="false">
              <LlmTr><LlmTd>Alice</LlmTd></LlmTr>
            </LlmTbody>
          </LlmTable>
        `,
      });
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('hides rows and shows empty state when empty=true', () => {
      render({
        components,
        template: `
          <LlmTable>
            <LlmTbody :empty="true" :colSpan="2">
              <template #empty>No results found.</template>
              <LlmTr><LlmTd>Alice</LlmTd></LlmTr>
            </LlmTbody>
          </LlmTable>
        `,
      });
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
      expect(screen.getByText('No results found.')).toBeInTheDocument();
    });

    it('applies the colSpan value to the empty-state td', () => {
      const { container } = render({
        components,
        template: `
          <LlmTable>
            <LlmTbody :empty="true" :colSpan="3">
              <template #empty>Empty</template>
            </LlmTbody>
          </LlmTable>
        `,
      });
      expect(container.querySelector('.llm-tbody-empty-cell')).toHaveAttribute('colspan', '3');
    });
  });
});
