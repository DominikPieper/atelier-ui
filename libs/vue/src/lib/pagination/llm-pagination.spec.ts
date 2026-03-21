import { render, screen } from '@testing-library/vue';
import { userEvent } from '@testing-library/user-event';
import LlmPagination from './llm-pagination.vue';

describe('LlmPagination', () => {
  it('renders navigation buttons', () => {
    render(LlmPagination, { props: { page: 1, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument();
  });

  it('disables prev/first when on first page', () => {
    render(LlmPagination, { props: { page: 1, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
  });

  it('disables next/last when on last page', () => {
    render(LlmPagination, { props: { page: 5, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  it('emits pageChange with correct value when a page button is clicked', async () => {
    const user = userEvent.setup();
    const { emitted } = render(LlmPagination, { props: { page: 1, pageCount: 5 } });
    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(emitted()['pageChange']).toEqual([[2]]);
  });

  it('marks the current page button with aria-current', () => {
    render(LlmPagination, { props: { page: 3, pageCount: 5 } });
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page');
  });

  it('hides first/last buttons when showFirstLast is false', () => {
    render(LlmPagination, { props: { page: 2, pageCount: 5, showFirstLast: false } });
    expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();
  });
});
