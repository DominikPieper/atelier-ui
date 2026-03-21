import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { LlmPagination } from './llm-pagination';

describe('LlmPagination', () => {
  it('renders a nav with aria-label="Pagination"', async () => {
    const { container } = await render('<llm-pagination />', { imports: [LlmPagination] });
    expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'Pagination');
  });

  it('renders an ol with role="list"', async () => {
    const { container } = await render('<llm-pagination />', { imports: [LlmPagination] });
    expect(container.querySelector('ul')).toHaveAttribute('role', 'list');
  });

  it('renders prev and next buttons', async () => {
    await render('<llm-pagination [pageCount]="5" />', { imports: [LlmPagination] });
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
  });

  it('renders first and last buttons when showFirstLast=true', async () => {
    await render('<llm-pagination [pageCount]="5" [showFirstLast]="true" />', {
      imports: [LlmPagination],
    });
    expect(screen.getByRole('button', { name: 'First page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeInTheDocument();
  });

  it('does not render first/last buttons when showFirstLast=false', async () => {
    await render('<llm-pagination [pageCount]="5" [showFirstLast]="false" />', {
      imports: [LlmPagination],
    });
    expect(screen.queryByRole('button', { name: 'First page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Last page' })).not.toBeInTheDocument();
  });

  it('disables prev/first buttons on page 1', async () => {
    await render('<llm-pagination [page]="1" [pageCount]="5" />', { imports: [LlmPagination] });
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'First page' })).toBeDisabled();
  });

  it('disables next/last buttons on last page', async () => {
    await render('<llm-pagination [page]="5" [pageCount]="5" />', { imports: [LlmPagination] });
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Last page' })).toBeDisabled();
  });

  it('sets aria-current="page" on the active page button', async () => {
    await render('<llm-pagination [page]="3" [pageCount]="5" />', { imports: [LlmPagination] });
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });

  it('does not set aria-current on non-active pages', async () => {
    await render('<llm-pagination [page]="3" [pageCount]="5" />', { imports: [LlmPagination] });
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute('aria-current');
  });

  describe('pageItems algorithm', () => {
    it('shows all pages when no ellipsis needed (small count)', async () => {
      const { container } = await render(
        '<llm-pagination [page]="2" [pageCount]="3" [showFirstLast]="false" />',
        { imports: [LlmPagination] }
      );
      const pageBtns = container.querySelectorAll('.page-btn:not([aria-label="Previous page"]):not([aria-label="Next page"])');
      expect(pageBtns).toHaveLength(3);
    });

    it('shows left ellipsis when current is far right', async () => {
      const { container } = await render(
        '<llm-pagination [page]="9" [pageCount]="10" [siblingCount]="1" [showFirstLast]="false" />',
        { imports: [LlmPagination] }
      );
      const ellipsis = container.querySelectorAll('.ellipsis');
      expect(ellipsis).toHaveLength(1);
    });

    it('shows right ellipsis when current is far left', async () => {
      const { container } = await render(
        '<llm-pagination [page]="1" [pageCount]="10" [siblingCount]="1" [showFirstLast]="false" />',
        { imports: [LlmPagination] }
      );
      const ellipsis = container.querySelectorAll('.ellipsis');
      expect(ellipsis).toHaveLength(1);
    });

    it('shows both ellipses when current is in the middle', async () => {
      const { container } = await render(
        '<llm-pagination [page]="5" [pageCount]="10" [siblingCount]="1" [showFirstLast]="false" />',
        { imports: [LlmPagination] }
      );
      const ellipsis = container.querySelectorAll('.ellipsis');
      expect(ellipsis).toHaveLength(2);
    });

    it('ellipsis elements are aria-hidden', async () => {
      const { container } = await render(
        '<llm-pagination [page]="5" [pageCount]="10" [siblingCount]="1" />',
        { imports: [LlmPagination] }
      );
      const ellipses = container.querySelectorAll('.ellipsis');
      ellipses.forEach((el) => expect(el).toHaveAttribute('aria-hidden', 'true'));
    });
  });

  describe('navigation', () => {
    it('increments page on next click', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-pagination [(page)]="page" [pageCount]="5" />',
        { imports: [LlmPagination], componentProperties: { page: 2 } }
      );
      await user.click(screen.getByRole('button', { name: 'Next page' }));
      expect(container.querySelector('.page-btn.is-active')).toHaveTextContent('3');
    });

    it('decrements page on prev click', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-pagination [(page)]="page" [pageCount]="5" />',
        { imports: [LlmPagination], componentProperties: { page: 3 } }
      );
      await user.click(screen.getByRole('button', { name: 'Previous page' }));
      expect(container.querySelector('.page-btn.is-active')).toHaveTextContent('2');
    });

    it('jumps to first page on first button click', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-pagination [(page)]="page" [pageCount]="5" />',
        { imports: [LlmPagination], componentProperties: { page: 4 } }
      );
      await user.click(screen.getByRole('button', { name: 'First page' }));
      expect(container.querySelector('.page-btn.is-active')).toHaveTextContent('1');
    });

    it('jumps to last page on last button click', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-pagination [(page)]="page" [pageCount]="5" />',
        { imports: [LlmPagination], componentProperties: { page: 2 } }
      );
      await user.click(screen.getByRole('button', { name: 'Last page' }));
      expect(container.querySelector('.page-btn.is-active')).toHaveTextContent('5');
    });

    it('navigates to a specific page on click', async () => {
      const user = userEvent.setup();
      const { container } = await render(
        '<llm-pagination [(page)]="page" [pageCount]="10" [siblingCount]="2" />',
        { imports: [LlmPagination], componentProperties: { page: 1 } }
      );
      await user.click(screen.getByRole('button', { name: 'Page 3' }));
      expect(container.querySelector('.page-btn.is-active')).toHaveTextContent('3');
    });
  });
});
