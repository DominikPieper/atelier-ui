import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { covers } from '../../testing/behavior';
import { AtlPagination } from './atl-pagination';

describe('AtlPagination', () => {
  it('renders navigation with aria-label="Pagination"', () => {
    render(<AtlPagination page={1} pageCount={5} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('renders page buttons', () => {
    render(<AtlPagination page={1} pageCount={3} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });

  covers('pagination', 'aria-current')('marks the current page button with aria-current="page"', () => {
    render(<AtlPagination page={2} pageCount={3} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('applies is-active class to the current page button', () => {
    render(<AtlPagination page={2} pageCount={3} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveClass('is-active');
  });

  it('renders Previous and Next buttons', () => {
    render(<AtlPagination page={2} pageCount={5} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });

  it('renders First and Last buttons when showFirstLast is true (default)', () => {
    render(<AtlPagination page={2} pageCount={5} />);
    expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument();
  });

  covers('pagination', 'hide-first-last')('does not render First and Last buttons when showFirstLast is false', () => {
    render(<AtlPagination page={2} pageCount={5} showFirstLast={false} />);
    expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();
  });

  covers('pagination', 'disables-prev-first')('disables Previous and First buttons on page 1', () => {
    render(<AtlPagination page={1} pageCount={5} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
  });

  covers('pagination', 'disables-next-last')('disables Next and Last buttons on last page', () => {
    render(<AtlPagination page={5} pageCount={5} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  it('calls onPageChange with next page when Next is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<AtlPagination page={2} pageCount={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange with previous page when Previous is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<AtlPagination page={3} pageCount={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Previous page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  covers('pagination', 'page-change-on-click')('calls onPageChange with specific page when page button is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<AtlPagination page={1} pageCount={3} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('renders ellipsis for large page counts', () => {
    render(<AtlPagination page={5} pageCount={10} siblingCount={1} />);
    // Should have ellipses when current page is in the middle
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('calls onPageChange with 1 when First is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<AtlPagination page={4} pageCount={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'First page' }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with last page when Last is clicked', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    render(<AtlPagination page={2} pageCount={5} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Last page' }));
    expect(onPageChange).toHaveBeenCalledWith(5);
  });
});
