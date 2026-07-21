import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import AtlPagination from './atl-pagination.vue';

describe('AtlPagination', () => {
  it('renders navigation buttons', () => {
    render(AtlPagination, { props: { page: 1, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument();
  });

  covers('pagination', 'disables-prev-first')('disables prev/first when on first page', () => {
    render(AtlPagination, { props: { page: 1, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  covers('pagination', 'disables-next-last')('disables next/last when on last page', () => {
    render(AtlPagination, { props: { page: 5, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  covers('pagination', 'page-change-on-click')('emits pageChange with correct value when a page button is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(AtlPagination, { props: { page: 1, pageCount: 5 } });
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(emitted()['pageChange']).toEqual([[2]]);
  });

  covers('pagination', 'aria-current')('marks the current page button with aria-current', () => {
    render(AtlPagination, { props: { page: 3, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  covers('pagination', 'hide-first-last')('hides first/last buttons when showFirstLast is false', () => {
    render(AtlPagination, { props: { page: 2, pageCount: 5, showFirstLast: false } });
    expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();
  });
});
