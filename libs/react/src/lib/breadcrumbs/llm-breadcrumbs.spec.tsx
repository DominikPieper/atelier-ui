import { render, screen } from '@testing-library/react';
import { LlmBreadcrumbs, LlmBreadcrumbItem } from './llm-breadcrumbs';

describe('LlmBreadcrumbs', () => {
  it('renders a nav with aria-label="Breadcrumb"', () => {
    render(
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem>Current</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders all breadcrumb items', () => {
    render(
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem href="/products">Products</LlmBreadcrumbItem>
        <LlmBreadcrumbItem>Widget X</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Widget X')).toBeInTheDocument();
  });

  it('automatically marks the last item as current', () => {
    render(
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem>Current Page</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    );
    const currentItem = screen.getByText('Current Page').closest('.llm-breadcrumb-item');
    expect(currentItem).toHaveClass('is-current');
  });

  it('renders non-current items as links when href is provided', () => {
    render(
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem>Current</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    );
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/home');
  });

  it('renders current item without link', () => {
    render(
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem>Current Page</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    );
    expect(screen.queryByRole('link', { name: 'Current Page' })).not.toBeInTheDocument();
  });

  it('sets aria-current="page" on the current item', () => {
    render(
      <LlmBreadcrumbs>
        <LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>
        <LlmBreadcrumbItem>Current Page</LlmBreadcrumbItem>
      </LlmBreadcrumbs>
    );
    const currentSpan = screen.getByText('Current Page');
    expect(currentSpan).toHaveAttribute('aria-current', 'page');
  });
});

describe('LlmBreadcrumbItem', () => {
  it('renders as link when href provided and not current', () => {
    render(<LlmBreadcrumbItem href="/home">Home</LlmBreadcrumbItem>);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('renders as span when current is true even with href', () => {
    render(
      <LlmBreadcrumbItem href="/home" current>
        Current
      </LlmBreadcrumbItem>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  it('applies is-current class when current is true', () => {
    const { container } = render(<LlmBreadcrumbItem current>Current</LlmBreadcrumbItem>);
    expect(container.firstChild).toHaveClass('is-current');
  });
});
