import { render, screen } from '@testing-library/react';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from './atl-breadcrumbs';
import { covers } from '../../testing/behavior';

describe('AtlBreadcrumbs', () => {
  covers('breadcrumbs', 'nav-aria-label')('renders a nav with aria-label="Breadcrumb"', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Current</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders all breadcrumb items', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/products">Products</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Widget X</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Widget X')).toBeInTheDocument();
  });

  it('automatically marks the last item as current', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Current Page</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    );
    const currentItem = screen.getByText('Current Page').closest('.atl-breadcrumb-item');
    expect(currentItem).toHaveClass('is-current');
  });

  covers('breadcrumbs', 'link-when-href')('renders non-current items as links when href is provided', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Current</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    );
    const homeLink = screen.getByRole('link', { name: 'Home' });
    expect(homeLink).toHaveAttribute('href', '/home');
  });

  it('renders current item without link', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Current Page</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    );
    expect(screen.queryByRole('link', { name: 'Current Page' })).not.toBeInTheDocument();
  });

  it('sets aria-current="page" on the current item', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Current Page</AtlBreadcrumbItem>
      </AtlBreadcrumbs>
    );
    const currentSpan = screen.getByText('Current Page');
    expect(currentSpan).toHaveAttribute('aria-current', 'page');
  });
});

describe('AtlBreadcrumbItem', () => {
  it('renders as link when href provided and not current', () => {
    render(<AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>);
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });

  it('renders as span when current is true even with href', () => {
    render(
      <AtlBreadcrumbItem href="/home" current>
        Current
      </AtlBreadcrumbItem>
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  covers('breadcrumbs', 'current-class')('applies is-current class when current is true', () => {
    const { container } = render(<AtlBreadcrumbItem current>Current</AtlBreadcrumbItem>);
    expect(container.firstChild).toHaveClass('is-current');
  });
});
