import { Fragment } from 'react';
import { render, screen } from '@testing-library/react';
import { AtlBreadcrumbs, AtlBreadcrumbItem } from './atl-breadcrumbs';
import { covers } from '../../testing/behavior';

describe('AtlBreadcrumbs', () => {
  covers('breadcrumbs', 'nav-aria-label')(
    'renders a nav with aria-label="Breadcrumb"',
    () => {
      render(
        <AtlBreadcrumbs>
          <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
          <AtlBreadcrumbItem>Current</AtlBreadcrumbItem>
        </AtlBreadcrumbs>,
      );
      expect(
        screen.getByRole('navigation', { name: 'Breadcrumb' }),
      ).toBeInTheDocument();
    },
  );

  it('renders all breadcrumb items', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/products">Products</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Widget X</AtlBreadcrumbItem>
      </AtlBreadcrumbs>,
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
      </AtlBreadcrumbs>,
    );
    const currentItem = screen
      .getByText('Current Page')
      .closest('.atl-breadcrumb-item');
    expect(currentItem).toHaveClass('is-current');
  });

  covers('breadcrumbs', 'link-when-href')(
    'renders non-current items as links when href is provided',
    () => {
      render(
        <AtlBreadcrumbs>
          <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
          <AtlBreadcrumbItem>Current</AtlBreadcrumbItem>
        </AtlBreadcrumbs>,
      );
      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).toHaveAttribute('href', '/home');
    },
  );

  it('renders current item without link', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Current Page</AtlBreadcrumbItem>
      </AtlBreadcrumbs>,
    );
    expect(
      screen.queryByRole('link', { name: 'Current Page' }),
    ).not.toBeInTheDocument();
  });

  it('sets aria-current="page" on the current item', () => {
    render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/home">Home</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>Current Page</AtlBreadcrumbItem>
      </AtlBreadcrumbs>,
    );
    const currentSpan = screen.getByText('Current Page');
    expect(currentSpan).toHaveAttribute('aria-current', 'page');
    expect(currentSpan).toHaveClass('breadcrumb-current');
  });

  it('renders a non-current item without href as plain text', () => {
    render(<AtlBreadcrumbItem>Plain</AtlBreadcrumbItem>);
    const span = screen.getByText('Plain');
    expect(span).toHaveClass('breadcrumb-text');
    expect(span).not.toHaveClass('breadcrumb-current');
    expect(span).not.toHaveAttribute('aria-current');
  });
});

describe('AtlBreadcrumbs current', () => {
  it('defaults to the last item', () => {
    const { container } = render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
        <AtlBreadcrumbItem>B</AtlBreadcrumbItem>
      </AtlBreadcrumbs>,
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items[0]).not.toHaveClass('is-current');
    expect(items[1]).toHaveClass('is-current');
  });

  it('an explicit current on another item overrides the last-item default', () => {
    const { container } = render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
        <AtlBreadcrumbItem current>B</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/c">C</AtlBreadcrumbItem>
      </AtlBreadcrumbs>,
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items[0]).not.toHaveClass('is-current');
    expect(items[1]).toHaveClass('is-current');
    expect(items[2]).not.toHaveClass('is-current');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'C' })).toHaveAttribute(
      'href',
      '/c',
    );
  });

  it('current={false} on the last item leaves no current item', () => {
    const { container } = render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
        <AtlBreadcrumbItem href="/b" current={false}>
          B
        </AtlBreadcrumbItem>
      </AtlBreadcrumbs>,
    );
    expect(container.querySelector('.is-current')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-current]')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'B' })).toBeInTheDocument();
  });

  it('finds the last item through a Fragment', () => {
    const { container } = render(
      <AtlBreadcrumbs>
        <>
          <AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
          <AtlBreadcrumbItem>B</AtlBreadcrumbItem>
        </>
      </AtlBreadcrumbs>,
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items[0]).not.toHaveClass('is-current');
    expect(items[1]).toHaveClass('is-current');
  });

  it('finds the last item in a mapped list inside a Fragment', () => {
    const { container } = render(
      <AtlBreadcrumbs>
        <AtlBreadcrumbItem href="/a">A</AtlBreadcrumbItem>
        <Fragment>
          {['B', 'C'].map((label) => (
            <AtlBreadcrumbItem key={label}>{label}</AtlBreadcrumbItem>
          ))}
        </Fragment>
      </AtlBreadcrumbs>,
    );
    const items = container.querySelectorAll('.atl-breadcrumb-item');
    expect(items).toHaveLength(3);
    expect(items[1]).not.toHaveClass('is-current');
    expect(items[2]).toHaveClass('is-current');
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
      </AtlBreadcrumbItem>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
  });

  covers('breadcrumbs', 'current-class')(
    'applies is-current class when current is true',
    () => {
      const { container } = render(
        <AtlBreadcrumbItem current>Current</AtlBreadcrumbItem>,
      );
      expect(container.firstChild).toHaveClass('is-current');
    },
  );
});
